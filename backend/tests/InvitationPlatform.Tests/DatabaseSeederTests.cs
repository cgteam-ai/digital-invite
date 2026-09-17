using InvitationPlatform.Api.Auth;
using InvitationPlatform.Api.Dtos;
using InvitationPlatform.Api.Services.Seeding;
using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace InvitationPlatform.Tests;

public class DatabaseSeederTests
{
    private static DatabaseSeeder Seeder(InvitationPlatform.Infrastructure.Data.AppDbContext db, SuperAdminSettings? s = null)
        => new(db, Options.Create(s ?? new SuperAdminSettings
        {
            Email = "boss@example.com", Password = "Str0ngPass!", FirstName = "Super", LastName = "Admin"
        }), NullLogger<DatabaseSeeder>.Instance);

    [Fact]
    public async Task Seeds_super_admin_from_configuration_when_absent()
    {
        using var db = TestSupport.NewDb();
        await Seeder(db).SeedAsync();

        var admin = await db.AdminAccounts.SingleAsync(a => a.Email == "boss@example.com");
        Assert.True(admin.IsSuperAdmin);
        Assert.Equal("Super Admin", admin.FullName);
        Assert.True(BCrypt.Net.BCrypt.Verify("Str0ngPass!", admin.PasswordHash));
    }

    [Fact]
    public async Task Does_not_duplicate_super_admin_on_repeat_runs()
    {
        using var db = TestSupport.NewDb();
        var seeder = Seeder(db);
        await seeder.SeedAsync();
        await seeder.SeedAsync();   // second boot

        Assert.Equal(1, await db.AdminAccounts.CountAsync(a => a.Email == "boss@example.com"));
    }

    [Fact]
    public async Task Seeds_builtin_templates_once_and_only_missing_ones()
    {
        using var db = TestSupport.NewDb();
        await Seeder(db).SeedAsync();

        var names = await db.Templates.Where(t => t.IsBuiltin).Select(t => t.Name).ToListAsync();
        // Every template declared in BuiltinTemplates must be seeded, and nothing else.
        foreach (var t in BuiltinTemplates.All) Assert.Contains(t.Name, names);
        Assert.DoesNotContain("Classic Wedding", names);   // retired
        var count = names.Count;

        await Seeder(db).SeedAsync();   // re-run must not duplicate
        Assert.Equal(count, await db.Templates.CountAsync(t => t.IsBuiltin));
    }

    /// <summary>
    /// Every built-in template's default data is served to the admin editor by deserializing it
    /// into <see cref="InvitationData"/>. A typo there would not fail seeding — the template would
    /// simply come back empty — so the catalogue is parsed here instead.
    /// </summary>
    [Fact]
    public void Builtin_template_data_deserializes_into_the_invitation_shape()
    {
        var json = new System.Text.Json.JsonSerializerOptions
        {
            PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
        };

        foreach (var t in BuiltinTemplates.All)
        {
            var data = System.Text.Json.JsonSerializer.Deserialize<InvitationData>(t.Data, json);
            Assert.NotNull(data);
            Assert.False(string.IsNullOrWhiteSpace(data!.Title), $"{t.Name}: title missing");
            Assert.NotNull(data.Cover);
            Assert.NotNull(data.Rsvp);
            Assert.False(string.IsNullOrWhiteSpace(data.Cover!.Names), $"{t.Name}: cover names missing");
            Assert.True(data.Rsvp!.MaxPeople > 0, $"{t.Name}: rsvp maxPeople must be positive");
        }
    }

    [Fact]
    public async Task Retires_existing_classic_wedding_template()
    {
        using var db = TestSupport.NewDb();
        var admin = TestSupport.SeedAdmin(db, "boss@example.com", "Str0ngPass!", isSuperAdmin: true);
        db.Templates.Add(new Template
        {
            CreatedBy = admin.Id, Name = "Classic Wedding", Description = "old",
            IsBuiltin = true, IsActive = true, Data = "{}"
        });
        db.SaveChanges();

        await Seeder(db).SeedAsync();

        var classic = await db.Templates.SingleAsync(t => t.Name == "Classic Wedding");
        Assert.False(classic.IsActive);   // no longer offered in the selector
    }

    [Fact]
    public async Task Backfills_missing_guest_slugs()
    {
        using var db = TestSupport.NewDb();
        var inv = TestSupport.SeedInvitation(db);
        db.Guests.Add(new Guest { InvitationId = inv.Id, Name = "Charbel Nahhas", Slug = "", Token = "t1" });
        db.SaveChanges();

        await Seeder(db).SeedAsync();

        var guest = await db.Guests.SingleAsync(g => g.Name == "Charbel Nahhas");
        Assert.Equal("charbel-nahhas", guest.Slug);
    }
}
