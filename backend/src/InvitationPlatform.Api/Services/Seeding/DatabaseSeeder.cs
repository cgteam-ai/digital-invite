using System.Text.Json;
using System.Text.Json.Nodes;
using InvitationPlatform.Api.Auth;
using InvitationPlatform.Domain.Entities;
using InvitationPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace InvitationPlatform.Api.Services.Seeding;

/// <summary>
/// Idempotent startup seeding, extracted from Program.cs. Runs once per boot and only writes what
/// is actually missing — the Super Admin (from configuration), the built-in templates (a single
/// existence query, not one per template), and legacy guest-slug backfill.
/// </summary>
public class DatabaseSeeder(
    AppDbContext db,
    IOptions<SuperAdminSettings> superAdminOptions,
    ILogger<DatabaseSeeder> log)
{
    private readonly SuperAdminSettings _superAdmin = superAdminOptions.Value;

    public async Task SeedAsync(CancellationToken ct = default)
    {
        await EnsureSuperAdminAsync(ct);
        await RetireRemovedTemplatesAsync(ct);
        await SeedTemplatesAsync(ct);
        await BackfillBuiltinTemplatePhotosAsync(ct);
        await BackfillGuestSlugsAsync(ct);
    }

    /// <summary>Creates the Super Admin only if it does not already exist (credentials from config).</summary>
    private async Task EnsureSuperAdminAsync(CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_superAdmin.Email))
        {
            log.LogWarning("SuperAdmin:Email is not configured — skipping Super Admin seeding.");
            return;
        }

        var existing = await db.AdminAccounts.FirstOrDefaultAsync(a => a.Email == _superAdmin.Email, ct);
        if (existing is null)
        {
            if (string.IsNullOrWhiteSpace(_superAdmin.Password))
            {
                log.LogError("SuperAdmin:Password is not configured — cannot create the Super Admin.");
                return;
            }
            db.AdminAccounts.Add(new AdminAccount
            {
                Email = _superAdmin.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(_superAdmin.Password),
                FullName = _superAdmin.FullName,
                IsActive = true,
                IsSuperAdmin = true
            });
            await db.SaveChangesAsync(ct);
            log.LogWarning("Seeded Super Admin account: {Email}", _superAdmin.Email);
        }
        else if (!existing.IsSuperAdmin)
        {
            // Promote a pre-existing account with this email (created before the feature shipped).
            existing.IsSuperAdmin = true;
            existing.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
        }
    }

    /// <summary>Item 8: the retired "Classic Wedding" template is deactivated so it leaves the
    /// selector, without deleting rows that historical invitations may reference.</summary>
    private async Task RetireRemovedTemplatesAsync(CancellationToken ct)
    {
        var retired = await db.Templates
            .Where(t => t.Name == "Classic Wedding" && t.IsActive)
            .ToListAsync(ct);
        if (retired.Count == 0) return;
        foreach (var t in retired) t.IsActive = false;
        await db.SaveChangesAsync(ct);
        log.LogInformation("Retired {Count} 'Classic Wedding' template(s).", retired.Count);
    }

    /// <summary>Inserts only the built-in templates that are missing (single query, scalable).</summary>
    private async Task SeedTemplatesAsync(CancellationToken ct)
    {
        var existing = (await db.Templates.Where(t => t.IsBuiltin).Select(t => t.Name).ToListAsync(ct))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var toAdd = BuiltinTemplates.All.Where(t => !existing.Contains(t.Name)).ToList();
        if (toAdd.Count == 0) return;

        var adminId = await db.AdminAccounts.OrderBy(a => a.CreatedAt).Select(a => a.Id).FirstAsync(ct);
        foreach (var t in toAdd)
        {
            db.Templates.Add(new Template
            {
                CreatedBy = adminId,
                Name = t.Name,
                Description = t.Description,
                EventType = t.EventType,
                IsBuiltin = true,
                IsActive = true,
                Data = t.Data
            });
        }
        await db.SaveChangesAsync(ct);
        log.LogInformation("Seeded {Count} built-in template(s): {Names}",
            toAdd.Count, string.Join(", ", toAdd.Select(t => t.Name)));
    }

    // The photo fields a built-in template's default data can carry, and its photo lists. These are
    // the only things BackfillBuiltinTemplatePhotosAsync ever writes.
    private static readonly string[] PhotoKeys = ["image", "image2", "video", "sealImage"];
    private static readonly (string Section, string List)[] PhotoLists = [("gallery", "items"), ("cover", "collage")];

    /// <summary>
    /// Built-in templates are inserted once, so default photos added to the catalogue afterwards —
    /// as they were for Elegant Noir, Serene Beige and Wedding Daily — would never reach a database
    /// that already has those templates, and new invitations would keep starting without photos.
    /// This copies the catalogue's photos in, but only into photo fields that are still empty (or a
    /// photo list that is empty): an admin's own photos and every other field are left as they are.
    /// A photo an admin deliberately clears will come back on the next start; replace it instead.
    /// </summary>
    private async Task BackfillBuiltinTemplatePhotosAsync(CancellationToken ct)
    {
        var catalogue = BuiltinTemplates.All.ToDictionary(t => t.Name, StringComparer.OrdinalIgnoreCase);
        var stored = await db.Templates.Where(t => t.IsBuiltin).ToListAsync(ct);
        var updated = new List<string>();

        foreach (var template in stored)
        {
            if (!catalogue.TryGetValue(template.Name, out var seed)) continue;
            JsonObject? data, defaults;
            try
            {
                data = JsonNode.Parse(template.Data) as JsonObject;
                defaults = JsonNode.Parse(seed.Data) as JsonObject;
            }
            catch (JsonException) { continue; }
            if (data is null || defaults is null) continue;

            var changed = false;
            foreach (var (section, node) in defaults)
            {
                if (node is not JsonObject want || data[section] is not JsonObject have) continue;
                foreach (var key in PhotoKeys)
                {
                    if (want[key] is not JsonValue w || !w.TryGetValue<string>(out var photo) || string.IsNullOrEmpty(photo)) continue;
                    var current = have[key] is JsonValue h && h.TryGetValue<string>(out var s) ? s : null;
                    if (!string.IsNullOrEmpty(current)) continue;   // the admin's own choice stays
                    have[key] = photo;
                    changed = true;
                }
            }
            foreach (var (section, list) in PhotoLists)
            {
                if (defaults[section]?[list] is not JsonArray wantList || wantList.Count == 0) continue;
                if (data[section] is not JsonObject have) continue;
                if (have[list] is JsonArray haveList && haveList.Count > 0) continue;
                have[list] = wantList.DeepClone();
                changed = true;
            }

            if (!changed) continue;
            template.Data = data.ToJsonString();
            template.UpdatedAt = DateTime.UtcNow;
            updated.Add(template.Name);
        }

        if (updated.Count == 0) return;
        await db.SaveChangesAsync(ct);
        log.LogInformation("Added default photos to built-in template(s): {Names}", string.Join(", ", updated));
    }

    /// <summary>Gives pre-slug guests a name-based slug so their personal links keep working.</summary>
    private async Task BackfillGuestSlugsAsync(CancellationToken ct)
    {
        var slugless = await db.Guests.Where(g => g.Slug == "" || g.Slug == null).ToListAsync(ct);
        if (slugless.Count == 0) return;

        var taken = (await db.Guests.Select(g => g.Slug).ToListAsync(ct))
            .Where(s => !string.IsNullOrEmpty(s)).ToHashSet();
        foreach (var g in slugless)
        {
            var baseSlug = SlugHelper.Slugify(g.Name);
            var candidate = baseSlug;
            var n = 2;
            while (!taken.Add(candidate)) candidate = $"{baseSlug}-{n++}";
            g.Slug = candidate;
        }
        await db.SaveChangesAsync(ct);
        log.LogInformation("Backfilled name-based slugs for {Count} guest(s).", slugless.Count);
    }
}
