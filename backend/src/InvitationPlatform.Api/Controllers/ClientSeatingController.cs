using InvitationPlatform.Api.Dtos;
using InvitationPlatform.Api.Services;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

/// <summary>
/// Table assignment for the couple's own guest list. Split out of <see cref="ClientController"/>
/// only to keep that file from growing further; the auth model and invitation scoping are identical.
/// </summary>
[ApiController]
[Route("api/client/seating")]
[Authorize(Roles = "Client")]
public class ClientSeatingController(AppDbContext db) : ControllerBase
{
    /// <summary>Upper bound on tables. Generous — the only cost is the length of a dropdown.</summary>
    public const int MaxTableCount = 500;

    private Guid CurrentInvitationId =>
        Guid.Parse(User.FindFirst("invitation_id")!.Value);

    // ── Read the whole plan ──────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetPlan(CancellationToken ct)
    {
        var inv = await db.Invitations.FirstOrDefaultAsync(i => i.Id == CurrentInvitationId, ct);
        if (inv is null) return NotFound(new { error = "Invitation not found" });

        // The feature is a Super Admin decision. Report it as data rather than 403 so the
        // dashboard can hide the tab gracefully instead of showing the couple an error they
        // cannot act on.
        if (!inv.SeatingEnabled)
            return Ok(new SeatingPlanDto(false, 0, "", [], 0, 0, 0));

        // Mint the public token on first read. Lazily rather than at invitation-create time, so
        // the feature can be switched on for invitations that already exist.
        if (string.IsNullOrEmpty(inv.SeatingToken))
        {
            inv.SeatingToken = SlugHelper.UrlSafeToken();
            inv.UpdatedAt = DateTime.UtcNow;
        }

        var guests = await db.Guests
            .Include(g => g.Seats)
            .Where(g => g.InvitationId == CurrentInvitationId)
            .OrderBy(g => g.Name)
            .ToListAsync(ct);

        // Reconcile on every read, so a guest who revises their party size from 4 to 2 loses the
        // orphaned seats and one who raises it gains them. A read that writes is not free, but
        // the alternative is a plan that silently disagrees with the RSVP list — worse at a venue
        // on the day.
        var changed = SeatReconciler.Reconcile(guests);
        if (changed || db.ChangeTracker.HasChanges()) await db.SaveChangesAsync(ct);

        var rows = guests.Select(g => new SeatingGuestDto(
            g.Id, g.Name, g.Status.ToString(), g.SelectedAttendees, g.MaxAttendees,
            g.Seats.OrderBy(s => s.SeatIndex)
                   .Select(s => new SeatDto(s.SeatIndex, s.Label, s.TableNumber)).ToList()
        )).ToList();

        var totalSeats = rows.Sum(g => g.Seats.Count);
        var seated = rows.Sum(g => g.Seats.Count(s => s.TableNumber is not null));

        // Accepted RSVPs with nothing to hang a seat on: either no guest row at all, or one that
        // has since been deleted. Surfaced as a count so the couple can add them to the list.
        var guestIds = guests.Select(g => g.Id).ToList();
        var unlisted = await db.Rsvps.CountAsync(
            r => r.InvitationId == CurrentInvitationId
                 && r.Response == RsvpResponse.Yes
                 && (r.GuestId == null || !guestIds.Contains(r.GuestId.Value)), ct);

        return Ok(new SeatingPlanDto(
            true, inv.TableCount, inv.SeatingToken, rows, totalSeats, seated, unlisted));
    }

    // ── Table count ──────────────────────────────────────────

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings(
        [FromBody] UpdateSeatingSettingsRequest req, CancellationToken ct)
    {
        var inv = await db.Invitations.FirstOrDefaultAsync(i => i.Id == CurrentInvitationId, ct);
        if (inv is null) return NotFound(new { error = "Invitation not found" });
        if (!inv.SeatingEnabled) return Forbid();

        if (req.TableCount < 0 || req.TableCount > MaxTableCount)
            return BadRequest(new { error = $"Number of tables must be between 0 and {MaxTableCount}" });

        // Lowering the count must not leave guests pointing at a table that no longer exists —
        // they would disappear from the by-table filter with no way to find them. Unseat them and
        // report how many, so the couple re-seats deliberately rather than discovering it later.
        var orphaned = await db.GuestSeats
            .Include(s => s.Guest)
            .Where(s => s.Guest.InvitationId == CurrentInvitationId
                        && s.TableNumber != null && s.TableNumber > req.TableCount)
            .ToListAsync(ct);

        foreach (var seat in orphaned)
        {
            seat.TableNumber = null;
            seat.UpdatedAt = DateTime.UtcNow;
        }

        inv.TableCount = req.TableCount;
        inv.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return Ok(new { ok = true, unseated = orphaned.Count });
    }

    // ── Assign seats for one guest ───────────────────────────

    [HttpPut("guests/{guestId:guid}")]
    public async Task<IActionResult> UpdateGuestSeats(
        Guid guestId, [FromBody] UpdateGuestSeatsRequest req, CancellationToken ct)
    {
        var inv = await db.Invitations.FirstOrDefaultAsync(i => i.Id == CurrentInvitationId, ct);
        if (inv is null) return NotFound(new { error = "Invitation not found" });
        if (!inv.SeatingEnabled) return Forbid();

        // Scoped by invitation, so a client cannot address another couple's guest by id.
        var guest = await db.Guests
            .Include(g => g.Seats)
            .FirstOrDefaultAsync(g => g.Id == guestId && g.InvitationId == CurrentInvitationId, ct);
        if (guest is null) return NotFound(new { error = "Guest not found" });

        SeatReconciler.Reconcile([guest]);

        foreach (var a in req.Seats ?? [])
        {
            // Reject rather than clamp: silently rewriting table 12 to 10 would look like the
            // save worked and put someone at the wrong table.
            if (a.TableNumber is not null &&
                (a.TableNumber < 1 || a.TableNumber > inv.TableCount))
                return BadRequest(new
                {
                    error = inv.TableCount == 0
                        ? "Set the number of tables before assigning seats."
                        : $"Table must be between 1 and {inv.TableCount}"
                });

            var label = string.IsNullOrWhiteSpace(a.Label) ? null : a.Label.Trim();
            if (label is { Length: > 256 })
                return BadRequest(new { error = "Name is longer than 256 characters" });

            var seat = guest.Seats.FirstOrDefault(s => s.SeatIndex == a.SeatIndex);
            // Silently ignore an index the guest's party does not have. A 400 would fail the
            // whole save because one stale row was left open in another tab.
            if (seat is null) continue;

            seat.TableNumber = a.TableNumber;
            // Seat 1 is the invitee; their name lives on Guest.Name and is not editable here, so
            // a label sent for it is discarded rather than creating two sources of truth.
            seat.Label = a.SeatIndex == 1 ? null : label;
            seat.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);

        return Ok(new SeatingGuestDto(
            guest.Id, guest.Name, guest.Status.ToString(), guest.SelectedAttendees, guest.MaxAttendees,
            guest.Seats.OrderBy(s => s.SeatIndex)
                 .Select(s => new SeatDto(s.SeatIndex, s.Label, s.TableNumber)).ToList()));
    }

    /// <summary>Puts a guest's whole party on one table — the common case, in one click.</summary>
    [HttpPost("assign-party")]
    public async Task<IActionResult> AssignParty([FromBody] AssignPartyRequest req, CancellationToken ct)
    {
        var inv = await db.Invitations.FirstOrDefaultAsync(i => i.Id == CurrentInvitationId, ct);
        if (inv is null) return NotFound(new { error = "Invitation not found" });
        if (!inv.SeatingEnabled) return Forbid();

        if (req.TableNumber is not null && (req.TableNumber < 1 || req.TableNumber > inv.TableCount))
            return BadRequest(new { error = $"Table must be between 1 and {inv.TableCount}" });

        var guest = await db.Guests
            .Include(g => g.Seats)
            .FirstOrDefaultAsync(g => g.Id == req.GuestId && g.InvitationId == CurrentInvitationId, ct);
        if (guest is null) return NotFound(new { error = "Guest not found" });

        SeatReconciler.Reconcile([guest]);
        foreach (var seat in guest.Seats)
        {
            seat.TableNumber = req.TableNumber;
            seat.UpdatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync(ct);

        return Ok(new { ok = true, seats = guest.Seats.Count });
    }

    // ── Public link ──────────────────────────────────────────

    /// <summary>
    /// Issues a fresh seating token, invalidating the old QR code. The printed code gets
    /// photographed and forwarded, so revocation has to be self-service.
    /// </summary>
    [HttpPost("regenerate-link")]
    public async Task<IActionResult> RegenerateLink(CancellationToken ct)
    {
        var inv = await db.Invitations.FirstOrDefaultAsync(i => i.Id == CurrentInvitationId, ct);
        if (inv is null) return NotFound(new { error = "Invitation not found" });
        if (!inv.SeatingEnabled) return Forbid();

        inv.SeatingToken = SlugHelper.UrlSafeToken();
        inv.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return Ok(new { seatingToken = inv.SeatingToken });
    }
}

/// <summary>
/// Keeps each guest's seat rows in step with the party size they actually chose. Pure and
/// synchronous, so the controller and the tests can both call it without a database.
/// </summary>
public static class SeatReconciler
{
    /// <summary>
    /// Adds missing seats, removes seats beyond the current party size, and drops every seat for
    /// a guest who is no longer attending. Returns true when anything changed.
    /// </summary>
    public static bool Reconcile(IEnumerable<Guest> guests)
    {
        var changed = false;

        foreach (var g in guests)
        {
            // Only guests who accepted get seats. One who accepted but whose SelectedAttendees
            // never got written (the anonymous-RSVP path leaves it at 0) still needs a seat for
            // themselves, so treat that as a party of one — better one seat to assign than a
            // guest missing from the plan.
            var wanted = g.Status == GuestRsvpStatus.Accepted
                ? Math.Max(1, g.SelectedAttendees)
                : 0;

            // Shrinking drops the highest indexes, so a party of 4 that becomes 3 keeps the
            // tables already chosen for seats 1-3. A guest who switches to declining loses all
            // of them: leaving the rows would show a declined guest occupying a chair in the
            // by-table view.
            var stale = g.Seats.Where(s => s.SeatIndex > wanted).ToList();
            foreach (var s in stale) { g.Seats.Remove(s); changed = true; }

            for (var i = 1; i <= wanted; i++)
            {
                if (g.Seats.Any(s => s.SeatIndex == i)) continue;
                g.Seats.Add(new GuestSeat { GuestId = g.Id, SeatIndex = i });
                changed = true;
            }
        }

        return changed;
    }
}
