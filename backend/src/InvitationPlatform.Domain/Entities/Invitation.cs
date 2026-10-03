using InvitationPlatform.Domain.Enums;

namespace InvitationPlatform.Domain.Entities;

public class Invitation
{
    public Guid Id { get; set; }
    public Guid CreatedBy { get; set; }
    public Guid? TemplateId { get; set; }

    /// <summary>URL-friendly key used in ?id= parameter.</summary>
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public InvitationStatus Status { get; set; } = InvitationStatus.Draft;

    /// <summary>Random hex token used in portable share links.</summary>
    public string PublicToken { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }

    public string? EventType { get; set; }
    public DateTime? EventDate { get; set; }
    public int MaxAttendees { get; set; } = 10;

    // ── Guest seating ────────────────────────────────────────────────────────
    // Real columns rather than keys in the section JSON blob, for two reasons: the blob is
    // returned wholesale by the anonymous public invitation endpoints, and ClientController's
    // invitation PUT rewrites every section — so a blob-resident admin-only flag would either
    // leak publicly or be flippable by the couple's own save.

    /// <summary>
    /// Whether the couple may assign guests to tables. A Super Admin decision; the client
    /// dashboard reads it but cannot change it.
    /// </summary>
    public bool SeatingEnabled { get; set; }

    /// <summary>
    /// How many tables the venue has, bounding the assignable range to 1..TableCount. Owned by
    /// the couple — they know the layout and it changes late — and 0 until they set it.
    /// </summary>
    public int TableCount { get; set; }

    /// <summary>
    /// Unguessable token in the public "find my table" URL that the QR code encodes. Separate
    /// from <see cref="PublicToken"/> so revoking a leaked seating link — the QR ends up printed
    /// and photographed — does not invalidate the invitation's own share links. Empty until the
    /// couple first opens the seating tab.
    /// </summary>
    public string SeatingToken { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }

    // Navigation
    public AdminAccount CreatedByAdmin { get; set; } = null!;
    public Template? Template { get; set; }
    public ClientAccount? Client { get; set; }
    public ICollection<InvitationSection> Sections { get; set; } = [];
    public ICollection<Rsvp> Rsvps { get; set; } = [];
    public ICollection<AuditLog> AuditLogs { get; set; } = [];
}
