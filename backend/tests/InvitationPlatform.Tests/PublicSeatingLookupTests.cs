using InvitationPlatform.Api.Dtos;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;

namespace InvitationPlatform.Tests;

/// <summary>
/// The anonymous "find my table" lookup. These tests are mostly about what must NOT come back:
/// the seating token is printed on a card at the venue and will leak, so the endpoint's disclosure
/// boundaries are the thing worth pinning down.
/// </summary>
public class PublicSeatingLookupTests
{
    private const string Token = "seating-token-abcdefgh";

    private static (AppDbContext db, Invitation inv) Seed(
        bool enabled = true,
        InvitationStatus status = InvitationStatus.Published,
        int tables = 10)
    {
        var db = TestSupport.NewDb();
        var inv = TestSupport.SeedInvitation(db);
        inv.SeatingEnabled = enabled;
        inv.SeatingToken = Token;
        inv.TableCount = tables;
        inv.Status = status;
        db.SaveChanges();
        return (db, inv);
    }

    private static Guest Seat(AppDbContext db, Invitation inv, string name, string slug,
        GuestRsvpStatus status, params (int Index, string? Label, int? Table)[] seats)
    {
        var g = TestSupport.SeedGuest(db, inv.Id, name, slug, token: "tok-" + slug);
        g.Status = status;
        g.SelectedAttendees = seats.Length;
        foreach (var (idx, label, table) in seats)
            db.GuestSeats.Add(new GuestSeat { Id = Guid.NewGuid(), GuestId = g.Id, SeatIndex = idx, Label = label, TableNumber = table });
        db.SaveChanges();
        return g;
    }

    // ── Token resolution ────────────────────────────────────

    [Fact]
    public async Task An_unknown_token_is_rejected()
    {
        var (db, _) = Seed();
        Assert.IsType<NotFoundObjectResult>(
            await TestSupport.NewPublicSeatingController(db).GetInfo("no-such-token-here", default));
    }

    [Fact]
    public async Task A_revoked_feature_kills_the_link()
    {
        var (db, _) = Seed(enabled: false);
        // Switching seating off in the admin panel has to invalidate every printed QR code.
        Assert.IsType<NotFoundObjectResult>(
            await TestSupport.NewPublicSeatingController(db).GetInfo(Token, default));
    }

    [Fact]
    public async Task An_unpublished_invitation_does_not_answer()
    {
        var (db, _) = Seed(status: InvitationStatus.Draft);
        Assert.IsType<NotFoundObjectResult>(
            await TestSupport.NewPublicSeatingController(db).GetInfo(Token, default));
    }

    [Fact]
    public async Task Every_failure_gives_the_same_message_so_tokens_cannot_be_probed()
    {
        var (dbA, _) = Seed(enabled: false);
        var (dbB, _) = Seed();

        var offResult = Assert.IsType<NotFoundObjectResult>(
            await TestSupport.NewPublicSeatingController(dbA).GetInfo(Token, default));
        var unknownResult = Assert.IsType<NotFoundObjectResult>(
            await TestSupport.NewPublicSeatingController(dbB).GetInfo("different-token-xyz", default));

        // Distinguishing "wrong token" from "seating off" would let someone enumerate which
        // tokens exist.
        Assert.Equal(
            offResult.Value!.GetType().GetProperty("error")!.GetValue(offResult.Value),
            unknownResult.Value!.GetType().GetProperty("error")!.GetValue(unknownResult.Value));
    }

    // ── Search disclosure ───────────────────────────────────

    [Fact]
    public async Task A_one_character_query_returns_nothing()
    {
        var (db, inv) = Seed();
        Seat(db, inv, "Anna", "anna", GuestRsvpStatus.Accepted, (1, null, 3));

        var ok = Assert.IsType<OkObjectResult>(
            await TestSupport.NewPublicSeatingController(db).Search(Token, "a", default));

        // One letter would return most of the guest list, which is the difference between
        // "look up your own name" and "download the list".
        var results = (IEnumerable<SeatingLookupResult>)ok.Value!.GetType()
            .GetProperty("results")!.GetValue(ok.Value)!;
        Assert.Empty(results);
    }

    [Fact]
    public async Task Only_accepted_guests_are_searchable()
    {
        var (db, inv) = Seed();
        Seat(db, inv, "Yes Person", "yes-person", GuestRsvpStatus.Accepted, (1, null, 2));
        Seat(db, inv, "No Person", "no-person", GuestRsvpStatus.NotAccepted, (1, null, 2));
        Seat(db, inv, "Maybe Person", "maybe-person", GuestRsvpStatus.Pending, (1, null, 2));

        var ok = Assert.IsType<OkObjectResult>(
            await TestSupport.NewPublicSeatingController(db).Search(Token, "person", default));
        var results = ((IEnumerable<SeatingLookupResult>)ok.Value!.GetType()
            .GetProperty("results")!.GetValue(ok.Value)!).ToList();

        // Revealing that someone declined is exactly the disclosure this endpoint must not make.
        Assert.Equal(["Yes Person"], results.Select(r => r.Name));
    }

    [Fact]
    public async Task A_named_companion_can_find_their_own_seat()
    {
        var (db, inv) = Seed();
        Seat(db, inv, "John Doe", "john-doe", GuestRsvpStatus.Accepted,
            (1, null, 4), (2, "Jane Smith", 4));

        var ok = Assert.IsType<OkObjectResult>(
            await TestSupport.NewPublicSeatingController(db).Search(Token, "jane", default));
        var results = ((IEnumerable<SeatingLookupResult>)ok.Value!.GetType()
            .GetProperty("results")!.GetValue(ok.Value)!).ToList();

        var hit = Assert.Single(results);
        Assert.Equal("Jane Smith", hit.Name);
        Assert.Equal(4, hit.TableNumber);
    }

    [Fact]
    public async Task An_unnamed_companion_is_not_searchable()
    {
        var (db, inv) = Seed();
        Seat(db, inv, "John Doe", "john-doe", GuestRsvpStatus.Accepted, (1, null, 4), (2, null, 4));

        var ok = Assert.IsType<OkObjectResult>(
            await TestSupport.NewPublicSeatingController(db).Search(Token, "guest", default));
        var results = ((IEnumerable<SeatingLookupResult>)ok.Value!.GetType()
            .GetProperty("results")!.GetValue(ok.Value)!).ToList();

        // "Guest 2" is a placeholder, not a person's name — there is nothing to match.
        Assert.Empty(results);
    }

    [Fact]
    public async Task An_unseated_guest_is_found_but_has_no_table()
    {
        var (db, inv) = Seed();
        Seat(db, inv, "Unseated Ursula", "ursula", GuestRsvpStatus.Accepted, (1, null, null));

        var ok = Assert.IsType<OkObjectResult>(
            await TestSupport.NewPublicSeatingController(db).Search(Token, "ursula", default));
        var results = ((IEnumerable<SeatingLookupResult>)ok.Value!.GetType()
            .GetProperty("results")!.GetValue(ok.Value)!).ToList();

        // Better to say "not assigned yet" than to pretend the guest does not exist.
        Assert.Null(Assert.Single(results).TableNumber);
    }

    // ── Table view ──────────────────────────────────────────

    [Fact]
    public async Task A_table_lists_everyone_seated_at_it()
    {
        var (db, inv) = Seed();
        Seat(db, inv, "John Doe", "john-doe", GuestRsvpStatus.Accepted, (1, null, 7), (2, "Jane Doe", 7));
        Seat(db, inv, "Maria Khoury", "maria", GuestRsvpStatus.Accepted, (1, null, 7));
        Seat(db, inv, "Elsewhere Eli", "eli", GuestRsvpStatus.Accepted, (1, null, 2));

        var table = TestSupport.Body<SeatingTableDto>(
            await TestSupport.NewPublicSeatingController(db).GetTable(Token, 7, default));

        Assert.Equal(7, table.TableNumber);
        Assert.Equal(["John Doe", "Jane Doe", "Maria Khoury"], table.Names);
        Assert.DoesNotContain("Elsewhere Eli", table.Names);
    }

    [Fact]
    public async Task An_unnamed_companion_still_appears_at_the_table_by_relation()
    {
        var (db, inv) = Seed();
        Seat(db, inv, "John Doe", "john-doe", GuestRsvpStatus.Accepted, (1, null, 5), (2, null, 5));

        var table = TestSupport.Body<SeatingTableDto>(
            await TestSupport.NewPublicSeatingController(db).GetTable(Token, 5, default));

        // They are a body in a chair, so the table has to account for them — and "Guest of John
        // Doe" tells a guest something, where a bare "Guest 2" would not.
        Assert.Equal(["John Doe", "Guest of John Doe"], table.Names);
    }

    [Fact]
    public async Task A_table_beyond_the_count_is_not_found()
    {
        var (db, _) = Seed(tables: 10);
        Assert.IsType<NotFoundObjectResult>(
            await TestSupport.NewPublicSeatingController(db).GetTable(Token, 11, default));
    }

    [Fact]
    public async Task Lookups_are_marked_uncacheable_and_unindexable()
    {
        var (db, _) = Seed();
        var ctrl = TestSupport.NewPublicSeatingController(db);

        await ctrl.GetInfo(Token, default);

        // A search engine's or shared proxy's copy of a seating plan outlives any revocation.
        Assert.Equal("noindex, nofollow", ctrl.Response.Headers["X-Robots-Tag"]);
        Assert.Equal("no-store", ctrl.Response.Headers.CacheControl);
    }
}
