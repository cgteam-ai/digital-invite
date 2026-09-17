using System.Text.Json.Nodes;
using InvitationPlatform.Api.Auth;
using InvitationPlatform.Api.Services.Seeding;
using InvitationPlatform.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace InvitationPlatform.Tests;

/// <summary>
/// Built-in templates that already exist in a database must pick up default photos added to the
/// catalogue later — without an admin's own photos or any other field being overwritten.
/// </summary>
public class BuiltinTemplatePhotoBackfillTests
{
    private static DatabaseSeeder Seeder(InvitationPlatform.Infrastructure.Data.AppDbContext db)
        => new(db, Options.Create(new SuperAdminSettings
        {
            Email = "boss@example.com", Password = "Str0ngPass!", FirstName = "Super", LastName = "Admin"
        }), NullLogger<DatabaseSeeder>.Instance);

    private static JsonNode StoredData(InvitationPlatform.Infrastructure.Data.AppDbContext db, string name)
        => JsonNode.Parse(db.Templates.Single(t => t.Name == name).Data)!;

    [Fact]
    public async Task Fills_only_empty_photo_fields_on_an_existing_builtin_template()
    {
        using var db = TestSupport.NewDb();
        var admin = TestSupport.SeedAdmin(db, "boss@example.com", "Str0ngPass!", isSuperAdmin: true);
        db.Templates.Add(new Template
        {
            CreatedBy = admin.Id, Name = "Serene Beige", Description = "seeded before photos existed",
            IsBuiltin = true, IsActive = true,
            Data = """
            { "title": "Mine",
              "cover": { "names": "A & B", "image": "" },
              "countdown": { "label": "Save the date" },
              "rsvp": { "title": "RSVP", "image": "/api/public/media/own-photo" },
              "gallery": { "title": "Captured Moments", "items": [] } }
            """
        });
        db.SaveChanges();

        await Seeder(db).SeedAsync();

        var data = StoredData(db, "Serene Beige");
        Assert.Equal("/assets/serene-beige/hero.jpg", (string?)data["cover"]!["image"]);         // empty → default
        Assert.Equal("/assets/serene-beige/calendar.jpg", (string?)data["countdown"]!["image"]);  // absent → default
        Assert.Equal("/api/public/media/own-photo", (string?)data["rsvp"]!["image"]);           // admin's own kept
        Assert.Equal(4, data["gallery"]!["items"]!.AsArray().Count);                               // empty list → defaults
        Assert.Equal("Mine", (string?)data["title"]);                                              // nothing else touched
        Assert.Equal("A & B", (string?)data["cover"]!["names"]);
        Assert.Null(data["locations"]);                                                            // no section invented
    }

    [Fact]
    public async Task Leaves_a_template_that_already_has_its_photos_alone()
    {
        using var db = TestSupport.NewDb();
        await Seeder(db).SeedAsync();                       // fresh install: seeded with the photos
        var before = db.Templates.Single(t => t.Name == "Wedding Daily").Data;

        await Seeder(db).SeedAsync();                       // next start

        Assert.Equal(before, db.Templates.Single(t => t.Name == "Wedding Daily").Data);
        Assert.Equal("/assets/wedding-daily/lead.jpg", (string?)StoredData(db, "Wedding Daily")["cover"]!["image"]);
    }
}
