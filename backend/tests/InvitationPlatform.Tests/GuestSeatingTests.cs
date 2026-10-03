using InvitationPlatform.Api.Controllers;
using InvitationPlatform.Api.Dtos;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Domain.Enums;
using InvitationPlatform.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InvitationPlatform.Tests;

/// <summary>
/// Table assignment. The behaviour worth pinning down is that seats are DERIVED — the data has no
/// per-person rows, so they are materialised from Guest.SelectedAttendees and must stay correct as
/// a guest changes their party size or their answer.
/// </summary>
public class GuestSeatingTests
{
    private static (AppDbContext db, Invitation inv) Seed(bool seatingEnabled = true, int tables = 10)
    {
        var db = TestSupport.NewDb();
        var inv = TestSupport.SeedInvitation(db);
        inv.SeatingEnabled = seatingEnabled;
        inv.TableCount = tables;
        db.SaveChanges();
        return (db, inv);
    }

    private static Guest Accepted(AppDbContext db, Invitation inv, string name, int party, string slug)
    {
        var g = TestSupport.SeedGuest(db, inv.Id, name, slug, maxAttendees: 10, token: "tok-" + slug);
        g.Status = GuestRsvpStatus.Accepted;
        g.SelectedAttendees = party;
        db.SaveChanges();
        return g;
    }

    // ── Seat materialisation ────────────────────────────────

    [Fact]
    public async Task Plan_creates_one_seat_per_person_in_the_party()
    {
        var (db, inv) = Seed();
        Accepted(db, inv, "John Doe", party: 4, slug: "john-doe");

        var plan = TestSupport.Body<SeatingPlanDto>(
            await TestSupport.NewClientSeatingController(db, inv.Id).GetPlan(default));

        // The whole point of the feature: the RSVP stored ONE attendee row for a party of four,
        // so four seats have to be invented here or the couple has nothing to assign.
        var guest = Assert.Single(plan.Guests);
        Assert.Equal(4, guest.Seats.Count);
        Assert.Equal(new[] { 1, 2, 3, 4 }, guest.Seats.Select(s => s.SeatIndex).ToArray());
        Assert.All(guest.Seats, s => Assert.Null(s.TableNumber));
        Assert.Equal(4, plan.TotalSeats);
        Assert.Equal(0, plan.SeatedCount);
    }

    [Fact]
    public async Task A_guest_who_has_not_replied_gets_no_seats()
    {
        var (db, inv) = Seed();
        TestSupport.SeedGuest(db, inv.Id, "Pending Person", "pending", token: "tok-pending");

        var plan = TestSupport.Body<SeatingPlanDto>(
            await TestSupport.NewClientSeatingController(db, inv.Id).GetPlan(default));

        Assert.Empty(Assert.Single(plan.Guests).Seats);
        Assert.Equal(0, plan.TotalSeats);
    }

    [Fact]
    public async Task An_accepted_guest_with_no_recorded_party_size_still_gets_one_seat()
    {
        var (db, inv) = Seed();
        // SelectedAttendees is only written on the personal-link path, so an accepted guest can
        // legitimately sit at 0. They still occupy a chair.
        var g = TestSupport.SeedGuest(db, inv.Id, "Anon Accepter", "anon", token: "tok-anon");
        g.Status = GuestRsvpStatus.Accepted;
        g.SelectedAttendees = 0;
        db.SaveChanges();

        var plan = TestSupport.Body<SeatingPlanDto>(
            await TestSupport.NewClientSeatingController(db, inv.Id).GetPlan(default));

        Assert.Single(Assert.Single(plan.Guests).Seats);
    }

    [Fact]
    public async Task Shrinking_a_party_drops_the_highest_seats_and_keeps_the_rest_seated()
    {
        var (db, inv) = Seed();
        var g = Accepted(db, inv, "John Doe", party: 4, slug: "john-doe");
        var ctrl = TestSupport.NewClientSeatingController(db, inv.Id);
        await ctrl.GetPlan(default);

        await ctrl.UpdateGuestSeats(g.Id, new UpdateGuestSeatsRequest(
        [
            new SeatAssignment(1, null, 3),
            new SeatAssignment(2, "Jane Doe", 3),
            new SeatAssignment(3, "Kid One", 7),
            new SeatAssignment(4, "Kid Two", 7)
        ]), default);

        // The guest edits their RSVP down to two people.
        g.SelectedAttendees = 2;
        db.SaveChanges();

        var plan = TestSupport.Body<SeatingPlanDto>(await ctrl.GetPlan(default));
        var seats = Assert.Single(plan.Guests).Seats;

        Assert.Equal(2, seats.Count);
        // Seats 1 and 2 keep table 3 — re-seating everyone because the party shrank would throw
        // away deliberate work.
        Assert.All(seats, s => Assert.Equal(3, s.TableNumber));
        Assert.Equal("Jane Doe", seats.Single(s => s.SeatIndex == 2).Label);
        Assert.Equal(0, await db.GuestSeats.CountAsync(s => s.SeatIndex > 2));
    }

    [Fact]
    public async Task Switching_to_declined_removes_every_seat()
    {
        var (db, inv) = Seed();
        var g = Accepted(db, inv, "John Doe", party: 3, slug: "john-doe");
        var ctrl = TestSupport.NewClientSeatingController(db, inv.Id);
        await ctrl.GetPlan(default);
        Assert.Equal(3, await db.GuestSeats.CountAsync());

        g.Status = GuestRsvpStatus.NotAccepted;
        g.SelectedAttendees = 0;
        db.SaveChanges();

        await ctrl.GetPlan(default);
        // Otherwise a guest who pulled out still occupies a chair in the by-table view.
        Assert.Equal(0, await db.GuestSeats.CountAsync());
    }

    // ── Assignment ──────────────────────────────────────────

    [Fact]
    public async Task Seats_in_one_party_can_go_to_different_tables()
    {
        var (db, inv) = Seed();
        var g = Accepted(db, inv, "John Doe", party: 3, slug: "john-doe");
        var ctrl = TestSupport.NewClientSeatingController(db, inv.Id);
        await ctrl.GetPlan(default);

        var updated = TestSupport.Body<SeatingGuestDto>(await ctrl.UpdateGuestSeats(
            g.Id, new UpdateGuestSeatsRequest(
            [
                new SeatAssignment(1, null, 1),
                new SeatAssignment(2, "Jane Doe", 5),
                new SeatAssignment(3, null, null)
            ]), default));

        Assert.Equal(1, updated.Seats.Single(s => s.SeatIndex == 1).TableNumber);
        Assert.Equal(5, updated.Seats.Single(s => s.SeatIndex == 2).TableNumber);
        Assert.Null(updated.Seats.Single(s => s.SeatIndex == 3).TableNumber);
    }

    [Fact]
    public async Task A_table_beyond_the_count_is_rejected_not_clamped()
    {
        var (db, inv) = Seed(tables: 10);
        var g = Accepted(db, inv, "John Doe", party: 1, slug: "john-doe");
        var ctrl = TestSupport.NewClientSeatingController(db, inv.Id);
        await ctrl.GetPlan(default);

        var result = await ctrl.UpdateGuestSeats(
            g.Id, new UpdateGuestSeatsRequest([new SeatAssignment(1, null, 11)]), default);

        // Clamping 11 to 10 would report success and seat the guest at the wrong table.
        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Null(db.GuestSeats.Single().TableNumber);
    }

    [Fact]
    public async Task A_label_on_seat_one_is_discarded()
    {
        var (db, inv) = Seed();
        var g = Accepted(db, inv, "John Doe", party: 2, slug: "john-doe");
        var ctrl = TestSupport.NewClientSeatingController(db, inv.Id);
        await ctrl.GetPlan(default);

        var updated = TestSupport.Body<SeatingGuestDto>(await ctrl.UpdateGuestSeats(
            g.Id, new UpdateGuestSeatsRequest(
            [
                new SeatAssignment(1, "Someone Else Entirely", 2),
                new SeatAssignment(2, "Jane Doe", 2)
            ]), default));

        // Seat 1 is the invitee; their name lives on Guest.Name, and a second copy here would be
        // a second source of truth that could disagree.
        Assert.Null(updated.Seats.Single(s => s.SeatIndex == 1).Label);
        Assert.Equal("Jane Doe", updated.Seats.Single(s => s.SeatIndex == 2).Label);
    }

    [Fact]
    public async Task Assign_party_puts_the_whole_party_on_one_table()
    {
        var (db, inv) = Seed();
        var g = Accepted(db, inv, "John Doe", party: 4, slug: "john-doe");
        var ctrl = TestSupport.NewClientSeatingController(db, inv.Id);
        await ctrl.GetPlan(default);

        await ctrl.AssignParty(new AssignPartyRequest(g.Id, 6), default);

        Assert.Equal(4, await db.GuestSeats.CountAsync(s => s.TableNumber == 6));
    }

    [Fact]
    public async Task Another_couples_guest_cannot_be_addressed()
    {
        var (db, inv) = Seed();
        var other = TestSupport.SeedInvitation(db, "someone-else");
        other.SeatingEnabled = true;
        other.TableCount = 5;
        db.SaveChanges();
        var theirGuest = Accepted(db, other, "Their Guest", party: 1, slug: "their-guest");

        var result = await TestSupport.NewClientSeatingController(db, inv.Id)
            .UpdateGuestSeats(theirGuest.Id, new UpdateGuestSeatsRequest(
                [new SeatAssignment(1, null, 1)]), default);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    // ── Table count ─────────────────────────────────────────

    [Fact]
    public async Task Lowering_the_table_count_unseats_the_guests_above_it_and_reports_how_many()
    {
        var (db, inv) = Seed(tables: 10);
        var g = Accepted(db, inv, "John Doe", party: 2, slug: "john-doe");
        var ctrl = TestSupport.NewClientSeatingController(db, inv.Id);
        await ctrl.GetPlan(default);
        await ctrl.UpdateGuestSeats(g.Id, new UpdateGuestSeatsRequest(
            [new SeatAssignment(1, null, 9), new SeatAssignment(2, null, 2)]), default);

        var ok = Assert.IsType<OkObjectResult>(
            await ctrl.UpdateSettings(new UpdateSeatingSettingsRequest(5), default));

        // Silently leaving seat 1 pointing at table 9 would hide that guest from the by-table
        // filter with no way to find them.
        Assert.Equal(1, ok.Value!.GetType().GetProperty("unseated")!.GetValue(ok.Value));
        Assert.Null(db.GuestSeats.Single(s => s.SeatIndex == 1).TableNumber);
        Assert.Equal(2, db.GuestSeats.Single(s => s.SeatIndex == 2).TableNumber);
    }

    // ── Feature flag ────────────────────────────────────────

    [Fact]
    public async Task The_plan_reports_disabled_rather_than_failing_when_seating_is_off()
    {
        var (db, inv) = Seed(seatingEnabled: false);
        Accepted(db, inv, "John Doe", party: 2, slug: "john-doe");

        var plan = TestSupport.Body<SeatingPlanDto>(
            await TestSupport.NewClientSeatingController(db, inv.Id).GetPlan(default));

        // Data, not a 403 — the dashboard hides the tab instead of showing an error the couple
        // cannot act on.
        Assert.False(plan.Enabled);
        Assert.Empty(plan.Guests);
        Assert.Equal("", plan.SeatingToken);
        Assert.Equal(0, await db.GuestSeats.CountAsync());
    }

    [Fact]
    public async Task Assigning_is_refused_while_seating_is_off()
    {
        var (db, inv) = Seed(seatingEnabled: false);
        var g = Accepted(db, inv, "John Doe", party: 1, slug: "john-doe");

        var result = await TestSupport.NewClientSeatingController(db, inv.Id)
            .UpdateGuestSeats(g.Id, new UpdateGuestSeatsRequest(
                [new SeatAssignment(1, null, 1)]), default);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task A_seating_token_is_minted_on_first_read_and_reused_after()
    {
        var (db, inv) = Seed();
        var ctrl = TestSupport.NewClientSeatingController(db, inv.Id);

        var first = TestSupport.Body<SeatingPlanDto>(await ctrl.GetPlan(default));
        Assert.NotEqual("", first.SeatingToken);

        var second = TestSupport.Body<SeatingPlanDto>(await ctrl.GetPlan(default));
        Assert.Equal(first.SeatingToken, second.SeatingToken);
    }

    [Fact]
    public async Task Regenerating_the_link_invalidates_the_old_token()
    {
        var (db, inv) = Seed();
        var ctrl = TestSupport.NewClientSeatingController(db, inv.Id);
        var before = TestSupport.Body<SeatingPlanDto>(await ctrl.GetPlan(default)).SeatingToken;

        await ctrl.RegenerateLink(default);
        var after = (await db.Invitations.FirstAsync(i => i.Id == inv.Id)).SeatingToken;

        Assert.NotEqual(before, after);
        Assert.NotEqual("", after);

        // The point of regenerating is that the printed code stops working.
        var pub = TestSupport.NewPublicSeatingController(db);
        Assert.IsType<NotFoundObjectResult>(await pub.GetInfo(before, default));
    }

    // ── Unlisted RSVPs ──────────────────────────────────────

    [Fact]
    public async Task Accepted_rsvps_with_no_guest_row_are_counted_not_seated()
    {
        var (db, inv) = Seed();
        Accepted(db, inv, "John Doe", party: 1, slug: "john-doe");
        db.Rsvps.Add(new Rsvp
        {
            Id = Guid.NewGuid(), InvitationId = inv.Id, GuestId = null,
            Response = RsvpResponse.Yes, PartySize = 2, ContactName = "Walk In",
            CreatedAt = DateTime.UtcNow
        });
        db.SaveChanges();

        var plan = TestSupport.Body<SeatingPlanDto>(
            await TestSupport.NewClientSeatingController(db, inv.Id).GetPlan(default));

        // There is no Guest row to hang a seat on, so the couple is told rather than the reply
        // being silently dropped from the plan.
        Assert.Equal(1, plan.UnlistedRsvpCount);
        Assert.Equal(1, plan.TotalSeats);
    }
}
