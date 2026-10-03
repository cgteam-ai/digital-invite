using InvitationPlatform.Api.Auth;
using InvitationPlatform.Api.Dtos;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Api.Controllers;

/// <summary>
/// The "find my table" lookup a guest reaches by scanning the QR code at the venue.
///
/// Anonymous by necessity — guests have no account — so the seating token in the URL is the only
/// credential. Everything here is written on the assumption that the token WILL leak: it is
/// printed on a card, photographed and forwarded. Hence nothing but names and table numbers is
/// ever returned, only guests who accepted are visible, results are capped, queries shorter than
/// two characters are refused, the endpoints are rate limited, and the couple can revoke the
/// token from their dashboard at any time.
/// </summary>
[ApiController]
[Route("api/public/seating")]
[AllowAnonymous]
[EnableRateLimiting(RateLimitPolicies.SeatingLookup)]
public class PublicSeatingController(AppDbContext db) : ControllerBase
{
    /// <summary>
    /// Shortest query accepted. One character would return most of the guest list in a single
    /// request, which is the difference between "look up your own name" and "download the list".
    /// </summary>
    private const int MinQueryLength = 2;

    /// <summary>Cap on returned matches, so a broad query cannot page through everyone.</summary>
    private const int MaxResults = 25;

    /// <summary>
    /// Resolves the token and marks the response uncacheable and unindexable. Returns null when
    /// the token is unknown, seating is off, or the invitation is not published.
    /// </summary>
    private async Task<Invitation?> ResolveAsync(string token, CancellationToken ct)
    {
        // Keep the seating plan out of search engines and shared caches. The token is a
        // capability, and an indexed copy of it outlives any revocation.
        Response.Headers["X-Robots-Tag"] = "noindex, nofollow";
        Response.Headers.CacheControl = "no-store";

        if (string.IsNullOrWhiteSpace(token) || token.Length is < 8 or > 128) return null;

        return await db.Invitations.FirstOrDefaultAsync(
            i => i.SeatingToken == token
                 && i.SeatingToken != ""
                 && i.SeatingEnabled
                 && i.Status == InvitationStatus.Published, ct);
    }

    /// <summary>Event name and table count, so the page can render before any search.</summary>
    [HttpGet("{token}")]
    public async Task<IActionResult> GetInfo(string token, CancellationToken ct)
    {
        var inv = await ResolveAsync(token, ct);
        // One message for every failure mode. Distinguishing "unknown token" from "seating off"
        // would let someone probe which tokens exist.
        if (inv is null) return NotFound(new { error = "This seating link is not valid." });

        return Ok(new { title = inv.Title, eventDate = inv.EventDate, tableCount = inv.TableCount });
    }

    /// <summary>Name search. Returns each matching person and the table they are seated at.</summary>
    [HttpGet("{token}/search")]
    public async Task<IActionResult> Search(string token, [FromQuery] string? q, CancellationToken ct)
    {
        var inv = await ResolveAsync(token, ct);
        if (inv is null) return NotFound(new { error = "This seating link is not valid." });

        var query = (q ?? string.Empty).Trim();
        if (query.Length < MinQueryLength)
            return Ok(new { results = Array.Empty<SeatingLookupResult>(), truncated = false });

        var needle = query.ToLowerInvariant();

        // Accepted guests only: a declined or still-pending guest has no table, and revealing
        // that they declined is exactly the disclosure this endpoint must not make.
        var guests = await db.Guests
            .Include(g => g.Seats)
            .Where(g => g.InvitationId == inv.Id && g.Status == GuestRsvpStatus.Accepted)
            .ToListAsync(ct);

        // Matches over the invitee's own name and any companion name the couple typed, so a
        // spouse can find their own seat. Unnamed companions ("Guest 2") are not searchable —
        // there is no name to match, and the placeholder is not a person's name.
        var matches = new List<SeatingLookupResult>();
        foreach (var g in guests.OrderBy(g => g.Name, StringComparer.OrdinalIgnoreCase))
        {
            foreach (var seat in g.Seats.OrderBy(s => s.SeatIndex))
            {
                var name = seat.SeatIndex == 1 ? g.Name : seat.Label;
                if (string.IsNullOrWhiteSpace(name)) continue;
                if (!name.ToLowerInvariant().Contains(needle)) continue;
                matches.Add(new SeatingLookupResult(name, seat.TableNumber));
            }
        }

        var truncated = matches.Count > MaxResults;
        return Ok(new { results = matches.Take(MaxResults).ToList(), truncated });
    }

    /// <summary>Everyone seated at one table, so a guest can see who they are sitting with.</summary>
    [HttpGet("{token}/table/{tableNumber:int}")]
    public async Task<IActionResult> GetTable(string token, int tableNumber, CancellationToken ct)
    {
        var inv = await ResolveAsync(token, ct);
        if (inv is null) return NotFound(new { error = "This seating link is not valid." });

        if (tableNumber < 1 || tableNumber > inv.TableCount)
            return NotFound(new { error = "That table does not exist." });

        var guests = await db.Guests
            .Include(g => g.Seats)
            .Where(g => g.InvitationId == inv.Id && g.Status == GuestRsvpStatus.Accepted)
            .ToListAsync(ct);

        var names = new List<string>();
        foreach (var g in guests.OrderBy(g => g.Name, StringComparer.OrdinalIgnoreCase))
        {
            foreach (var seat in g.Seats.Where(s => s.TableNumber == tableNumber).OrderBy(s => s.SeatIndex))
            {
                // An unnamed companion is still a body in a chair, so the table has to account
                // for them — shown in relation to the invitee rather than as a bare "Guest 3",
                // which would tell a guest nothing about who is beside them.
                names.Add(seat.SeatIndex == 1
                    ? g.Name
                    : (string.IsNullOrWhiteSpace(seat.Label) ? $"Guest of {g.Name}" : seat.Label!));
            }
        }

        return Ok(new SeatingTableDto(tableNumber, names));
    }
}
