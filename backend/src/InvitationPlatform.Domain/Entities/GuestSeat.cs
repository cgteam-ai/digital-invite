namespace InvitationPlatform.Domain.Entities;

/// <summary>
/// One seat belonging to one guest-list entry: the person at <see cref="SeatIndex"/> of that
/// guest's party, and the table they sit at.
///
/// Why this exists instead of a table number on RsvpGuest: an RSVP's attendee rows are not
/// one-per-person. The public form derives them by splitting the single name field on "&", ","
/// and "and" (frontend/shared/invitation-core.js), so a guest called "John Doe" who brings three
/// others produces exactly ONE RsvpGuest row and a PartySize of 4 — the other three have no row
/// and no name. Worse, PublicController.SubmitRsvp calls rsvp.Guests.Clear() and recreates those
/// rows with fresh ids on every re-submit, so anything keyed to RsvpGuest.Id is destroyed the
/// moment a guest edits their reply.
///
/// Guest.Id is stable across re-submits, so seats hang off that and survive RSVP edits.
/// </summary>
public class GuestSeat
{
    public Guid Id { get; set; }

    /// <summary>The guest-list entry this seat belongs to. Deleting the guest deletes the seat.</summary>
    public Guid GuestId { get; set; }

    /// <summary>
    /// 1-based position within the guest's party. Seat 1 is the invitee themselves; 2..N are
    /// their companions. Unique per guest, so a seat is addressable as (GuestId, SeatIndex).
    /// </summary>
    public int SeatIndex { get; set; }

    /// <summary>
    /// Optional name the couple typed for a companion. Always null for seat 1 — the invitee's
    /// name lives on Guest.Name and duplicating it here would create two sources of truth. Null
    /// for an unnamed companion, which the UI shows as "Guest 2", "Guest 3" and so on.
    /// </summary>
    public string? Label { get; set; }

    /// <summary>
    /// Table this seat is assigned to, or null when unseated. Deliberately an int rather than a
    /// foreign key to a tables table: tables are just the numbers 1..Invitation.TableCount with
    /// no attributes of their own, and a nullable int lets a guest be unseated without needing a
    /// placeholder row. The range is enforced by the API, not a check constraint, so lowering
    /// TableCount can unseat people in one transaction instead of failing the whole save.
    /// </summary>
    public int? TableNumber { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Guest Guest { get; set; } = null!;
}
