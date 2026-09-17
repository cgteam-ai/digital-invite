namespace InvitationPlatform.Api.Dtos;

// ── AUTH ────────────────────────────────────────────────────
public record LoginRequest(string Email, string Password);
public record LoginResponse(string Token, string Role, string FullName, bool MustChangePassword);
public record ChangePasswordRequest(string? CurrentPassword, string NewPassword);
public record ChangeEmailRequest(string CurrentPassword, string NewEmail);
public record UpdateClientCredentialsRequest(string? NewEmail, string? NewPassword, string? NewPhone = null);

// ── INVITATION DATA SHAPE (matches the existing JS data model) ──
public class InvitationData
{
    public string? Title { get; set; }
    public CoverData? Cover { get; set; }
    public CountdownData? Countdown { get; set; }
    public LocationsData? Locations { get; set; }
    public GiftsData? Gifts { get; set; }
    public RsvpData? Rsvp { get; set; }
    public List<CustomSection>? CustomSections { get; set; }
    public GalleryData? Gallery { get; set; }
    public TimelineData? Timeline { get; set; }
    public FamiliesData? Families { get; set; }
    public MemoriesData? Memories { get; set; }
    public MusicData? Music { get; set; }
}

public class CoverData
{
    public bool Enabled { get; set; } = true;
    public string? EventLabel { get; set; }
    public string? Names { get; set; }
    public string? Tagline { get; set; }
    public string? HostText { get; set; }
    public string? HostIntro { get; set; }
    public string? HostOutro { get; set; }
    public string? Image { get; set; }
    /// <summary>Optional decorative background video (muted, looping). Overrides the image when set.</summary>
    public string? Video { get; set; }
    public string? ButtonText { get; set; }
    // Elegant Noir envelope screen: "Dear {guest}" prefix + wax-seal image
    public string? Greeting { get; set; }
    public string? SealImage { get; set; }

    // Wedding Daily (newspaper) front page. All optional -- the template falls back to sensible
    // defaults when they are blank, so invitations created before these fields existed still render.
    /// <summary>Newspaper masthead, e.g. "The Wedding Daily".</summary>
    public string? MastheadTitle { get; set; }
    /// <summary>Small text either side of the month in the masthead bar, e.g. "Special Edition".</summary>
    public string? EditionLabel { get; set; }
    /// <summary>Front-page headline, e.g. "Top Story of the Year".</summary>
    public string? Headline { get; set; }

    /// <summary>Polaroid Heart: the photos arranged into the heart on the cover, in display order.</summary>
    public List<GalleryImage>? Collage { get; set; }
}

public class CountdownData
{
    public bool Enabled { get; set; } = true;
    public string? Label { get; set; }
    /// <summary>Wedding day, ISO yyyy-MM-dd. Mirrors <see cref="Invitation.EventDate"/>.</summary>
    public string? Date { get; set; }
    /// <summary>Ceremony start, 24-hour HH:mm. Empty means midnight at the start of the day.</summary>
    public string? Time { get; set; }
    /// <summary>
    /// Minutes to add to the wedding's local time to reach UTC, captured from the admin's browser
    /// for that specific date (so it already accounts for daylight saving). It is what lets a guest
    /// abroad count down to the ceremony's real instant rather than to the same wall-clock time in
    /// their own zone. Null on invitations saved before this existed — those fall back to being
    /// read in the viewer's local time, which is the old behaviour.
    /// </summary>
    public int? TzOffset { get; set; }
    public string? Description { get; set; }
    public string? Image { get; set; }
}

public class LocationsData
{
    public bool Enabled { get; set; } = true;
    public string? Label { get; set; }
    public string? Title { get; set; }
    public string? Image { get; set; }
    public List<LocationItem> Items { get; set; } = [];
}

public class LocationItem
{
    public string? Time { get; set; }
    public string? Label { get; set; }
    public string? Name { get; set; }
    public string? Addr { get; set; }
    public string? Url { get; set; }
    public string? Img { get; set; }
}

public class GiftsData
{
    public bool Enabled { get; set; } = true;
    public string? Label { get; set; }
    public string? Title { get; set; }
    public string? Image { get; set; }
    /// <summary>Second photo, for templates that set two beside the gift details (Polaroid Heart).</summary>
    public string? Image2 { get; set; }
    public string? Description { get; set; }
    public List<GiftItem> Items { get; set; } = [];
}

public class GiftItem
{
    public string? Bank { get; set; }
    public string? Account { get; set; }
}

public class RsvpData
{
    public bool Enabled { get; set; } = true;
    public string? Label { get; set; }
    public string? Title { get; set; }
    public string? Image { get; set; }
    /// <summary>Reservation deadline (ISO yyyy-MM-dd from the admin date picker). Empty = none.</summary>
    public string? Deadline { get; set; }
    public int MaxPeople { get; set; } = 10;
    public string? ButtonText { get; set; }
    public bool AllowWishes { get; set; } = true;
    /// <summary>Shown after a guest accepts.</summary>
    public string? AcceptMessage { get; set; }
    /// <summary>Shown after a guest declines.</summary>
    public string? DeclineMessage { get; set; }

    // Wedding Daily (newspaper) RSVP page -- optional, blank falls back to the template default.
    /// <summary>Short message shown above the accept/decline choice.</summary>
    public string? Description { get; set; }
    /// <summary>Script question above the accept/decline buttons, e.g. "Coming?".</summary>
    public string? Question { get; set; }

    // Host contact shown with the reply (birthday, engagement, baby shower and graduation
    // templates). All optional; the RSVP config is stored whole, so no mapper change is needed.
    /// <summary>Who guests can ask about the event, e.g. "Rana (Emma's mum)".</summary>
    public string? ContactName { get; set; }
    /// <summary>Phone number; templates offer Call and WhatsApp links from it.</summary>
    public string? ContactPhone { get; set; }
    /// <summary>Optional social or messaging link — a URL, or an @handle read as Instagram.</summary>
    public string? ContactLink { get; set; }
}

public class CustomSection
{
    public bool Enabled { get; set; } = true;
    public string? Label { get; set; }
    public string? Title { get; set; }
    public string? Body { get; set; }
    public string? Image { get; set; }
}

public class GalleryData
{
    public bool Enabled { get; set; } = true;
    public string? Label { get; set; }
    public string? Title { get; set; }
    /// <summary>Optional feature video shown with the photos (the large centre plate in Marble Waltz).</summary>
    public string? Video { get; set; }
    public List<GalleryImage> Items { get; set; } = [];
}

public class GalleryImage
{
    public string? Url { get; set; }
    public string? Caption { get; set; }
}

public class TimelineData
{
    public bool Enabled { get; set; } = true;
    public string? Label { get; set; }
    public string? Title { get; set; }
    public List<TimelineItem> Items { get; set; } = [];
}

public class TimelineItem
{
    public string? Time { get; set; }
    public string? Title { get; set; }
    public string? Subtitle { get; set; }
    public string? Icon { get; set; }
    /// <summary>Optional map/location link shown as a button on the timeline step.</summary>
    public string? Url { get; set; }
}

public class FamiliesData
{
    public bool Enabled { get; set; } = true;
    public string? Label { get; set; }
    public string? Title { get; set; }
    /// <summary>Background photograph of the invitation page (Editorial Love Story).</summary>
    public string? Image { get; set; }
    public List<FamilyItem> Items { get; set; } = [];
}

public class FamilyItem
{
    public string? Label { get; set; }
    public string? Names { get; set; }
}

public class MemoriesData
{
    public bool Enabled { get; set; } = true;
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Url { get; set; }
    public string? ButtonText { get; set; }
}

public class MusicData
{
    public bool Enabled { get; set; } = true;
    public string? Url { get; set; }
    public bool Autoplay { get; set; } = true;
}

// ── INVITATION CRUD ────────────────────────────────────────
public record InvitationListItem(
    Guid Id, string Slug, string Title, string Status,
    DateTime? EventDate, int RsvpCount, DateTime UpdatedAt,
    string? TemplateName = null, string? TemplateEventType = null);

public record InvitationFull(
    Guid Id, string Slug, string Title, string Status,
    string? EventType, DateTime? EventDate, int MaxAttendees,
    Guid? TemplateId, DateTime UpdatedAt, InvitationData Data,
    string? PublicToken = null);

public record CreateInvitationRequest(
    string Title, string Slug, Guid? TemplateId,
    string? EventType, DateTime? EventDate, InvitationData Data);

public record UpdateInvitationRequest(
    string Title, string Slug, string? EventType,
    DateTime? EventDate, int MaxAttendees, InvitationData Data);

// ── TEMPLATE ───────────────────────────────────────────────
public record TemplateDto(
    Guid Id, string Name, string? Description,
    bool IsBuiltin, bool IsActive, InvitationData Data,
    string EventType = "Wedding");

public record CreateTemplateRequest(string Name, string? Description, InvitationData Data, string? EventType = null);
public record UpdateTemplateRequest(string Name, string? Description, bool IsActive, InvitationData Data, string? EventType = null);

// ── CLIENT ACCOUNT ─────────────────────────────────────────
// Email is optional as long as a phone is supplied (validated server-side).
public record CreateClientRequest(
    Guid InvitationId, string? Email, string Password,
    string FullName, string? Phone);

public record ClientAccountDto(
    Guid Id, Guid InvitationId, string? Email, string FullName,
    string? Phone, bool IsActive, bool MustChangePassword,
    DateTime? LastLoginAt, DateTime CreatedAt);

// ── RSVP ───────────────────────────────────────────────────
public record SubmitRsvpRequest(
    string Response, int PartySize,
    string? ContactName, string? ContactEmail, string? ContactPhone,
    string? Message, List<RsvpGuestRequest> Guests,
    string? GuestToken = null);

public record RsvpGuestRequest(
    string FullName, string? AgeGroup,
    string? MealPreference, string? DietaryRestrictions);

public record RsvpDto(
    Guid Id, string Response, int PartySize,
    string? ContactName, string? ContactEmail, string? ContactPhone,
    string? Message, DateTime CreatedAt,
    List<RsvpGuestDto> Guests);

public record RsvpGuestDto(
    string FullName, string? AgeGroup,
    string? MealPreference, string? DietaryRestrictions);

// ── GUEST LIST (Bride & Groom dashboard) ───────────────────
public record GuestDto(
    Guid Id, string Name, int MaxAttendees, int SelectedAttendees,
    string Status, string Token, string Slug, DateTime? RespondedAt, DateTime UpdatedAt);

public record ImportGuestRow(int Row, string? Name, int? MaxAttendees);
public record ImportGuestsRequest(List<ImportGuestRow> Rows);
public record ImportRowError(int Row, string Reason);
public record ImportGuestsResult(int Created, int Updated, List<ImportRowError> Failed);

public record CreateGuestRequest(string Name, int MaxAttendees);
public record UpdateGuestRequest(string Name, int MaxAttendees);

// ── CLIENT SELF-EDIT ───────────────────────────────────────
public record ClientUpdateInvitationRequest(string Title, InvitationData Data);

// ── LANDING PAGE SETTINGS ──────────────────────────────────
// Public contact details shown on the landing page; every field is optional and blank ones
// are simply not rendered.
public record LandingSettingsDto(
    string? CompanyEmail, string? PhoneNumber, string? WhatsAppNumber, string? CompanyAddress,
    string? InstagramUrl, string? FacebookUrl, string? TikTokUrl, string? PinterestUrl,
    string? MapEmbedUrl);

// ── DEMO REQUESTS (landing page enquiry form) ──────────────
public record DemoRequestSubmission(
    string? Name, string? EventType, string? Email,
    string? Phone, string? Company, string? Message);

public record DemoRequestDto(
    Guid Id, string Name, string? EventType, string? Email, string? Phone,
    string? Company, string? Message, DateTime? ReadAt,
    DateTime? EmailSentAt, string? EmailError, DateTime CreatedAt);

// ── DASHBOARD ──────────────────────────────────────────────
public record DashboardSummary(
    Guid InvitationId, string Slug, string Title,
    DateTime? EventDate, int MaxAttendees,
    int TotalRsvps, int Attending, int Declined,
    int TotalSeats, double AcceptRate);
