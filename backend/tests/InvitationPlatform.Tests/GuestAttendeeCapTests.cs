using InvitationPlatform.Api.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace InvitationPlatform.Tests;

/// <summary>
/// A guest's allowance must never exceed the invitation's own "max attendees per RSVP".
///
/// It used to: the guest list only checked an absolute ceiling of 100, so the couple could grant
/// a guest 14 seats on an invitation capped at 10. Nothing complained until the guest tried to
/// RSVP, at which point PublicController refused the party size — so the guest hit the error the
/// couple had caused, days later and with no way to fix it themselves.
/// </summary>
public class GuestAttendeeCapTests
{
    [Fact]
    public async Task Creating_a_guest_above_the_invitation_cap_is_rejected()
    {
        using var db = TestSupport.NewDb();
        var inv = TestSupport.SeedInvitation(db, maxAttendees: 10);
        var ctrl = TestSupport.NewClientController(db, inv.Id);

        var result = await ctrl.CreateGuest(new CreateGuestRequest("John Doe", 14));

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Contains("10", bad.Value!.GetType().GetProperty("error")!.GetValue(bad.Value)!.ToString());
        Assert.Empty(db.Guests);
    }

    [Fact]
    public async Task Creating_a_guest_at_exactly_the_cap_is_allowed()
    {
        using var db = TestSupport.NewDb();
        var inv = TestSupport.SeedInvitation(db, maxAttendees: 10);
        var ctrl = TestSupport.NewClientController(db, inv.Id);

        var dto = TestSupport.Body<GuestDto>(await ctrl.CreateGuest(new CreateGuestRequest("John Doe", 10)));

        Assert.Equal(10, dto.MaxAttendees);
    }

    [Fact]
    public async Task Raising_an_existing_guest_above_the_cap_is_rejected()
    {
        using var db = TestSupport.NewDb();
        var inv = TestSupport.SeedInvitation(db, maxAttendees: 10);
        var guest = TestSupport.SeedGuest(db, inv.Id, "John Doe", "john-doe", maxAttendees: 4);
        var ctrl = TestSupport.NewClientController(db, inv.Id);

        var result = await ctrl.UpdateGuest(guest.Id, new UpdateGuestRequest("John Doe", 14));

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(4, db.Guests.Single().MaxAttendees);
    }

    [Fact]
    public async Task An_import_row_above_the_cap_fails_that_row_only()
    {
        using var db = TestSupport.NewDb();
        var inv = TestSupport.SeedInvitation(db, maxAttendees: 10);
        var ctrl = TestSupport.NewClientController(db, inv.Id);

        var res = TestSupport.Body<ImportGuestsResult>(await ctrl.ImportGuests(new ImportGuestsRequest(
        [
            new ImportGuestRow(2, "Fine Guest", 8),
            new ImportGuestRow(3, "Greedy Guest", 14)
        ])));

        // One bad row must not throw away the rest of the file.
        Assert.Equal(1, res.Created);
        var failure = Assert.Single(res.Failed);
        Assert.Equal(3, failure.Row);
        Assert.Contains("10", failure.Reason);
    }

    [Fact]
    public async Task An_invitation_with_no_cap_falls_back_to_the_absolute_ceiling()
    {
        using var db = TestSupport.NewDb();
        // 0 means "unlimited", matching how PublicController reads it when checking an RSVP.
        var inv = TestSupport.SeedInvitation(db, maxAttendees: 0);
        var ctrl = TestSupport.NewClientController(db, inv.Id);

        var dto = TestSupport.Body<GuestDto>(await ctrl.CreateGuest(new CreateGuestRequest("Big Party", 60)));
        Assert.Equal(60, dto.MaxAttendees);

        var tooBig = await ctrl.CreateGuest(new CreateGuestRequest("Absurd Party", 101));
        Assert.IsType<BadRequestObjectResult>(tooBig);
    }
}
