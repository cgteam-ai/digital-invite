using InvitationPlatform.Api.Dtos;
using InvitationPlatform.Api.Services;
using InvitationPlatform.Domain.Entities;

namespace InvitationPlatform.Tests;

/// <summary>
/// Several template-specific fields live inside a section's JSON config. The Locations and Gifts
/// configs are written through explicit records that list their fields, so a field added to the
/// DTO but not to the record is silently dropped on save. Each such field is round-tripped here
/// through the same save/load path the API uses.
/// </summary>
public class InvitationDataMapperTests
{
    private static InvitationData RoundTrip(InvitationData data)
    {
        var inv = new Invitation { Title = data.Title ?? "" };
        InvitationDataMapper.ApplyData(inv, data);
        return InvitationDataMapper.ToData(inv);
    }

    [Fact]
    public void Template_specific_fields_survive_a_save_and_reload()
    {
        var back = RoundTrip(new InvitationData
        {
            Title = "A & B",
            Cover = new CoverData
            {
                Names = "A & B",
                Headline = "Join Us",
                Collage = [new GalleryImage { Url = "/a.jpg" }, new GalleryImage { Url = "/b.jpg" }]
            },
            Countdown = new CountdownData { Date = "2027-06-12", Time = "17:30", TzOffset = -180 },
            Families = new FamiliesData { Image = "/invite.jpg", Items = [new FamilyItem { Names = "Mr. & Mrs. A" }] },
            Gallery =new GalleryData { Video = "/v.mp4", Items = [new GalleryImage { Url = "/g.jpg" }] },
            Gifts = new GiftsData
            {
                Title = "Whish",
                Image = "/1.jpg",
                Image2 = "/2.jpg",
                Items = [new GiftItem { Bank = "Whish", Account = "123" }]
            },
            Rsvp = new RsvpData
            {
                Description = "Join us", Question = "Coming?", MaxPeople = 4,
                ContactName = "Rana", ContactPhone = "+961 71 000 000", ContactLink = "@party"
            }
        });

        Assert.Equal("Join Us", back.Cover!.Headline);
        Assert.Equal(new[] { "/a.jpg", "/b.jpg" }, back.Cover.Collage!.Select(c => c.Url));
        Assert.Equal("17:30", back.Countdown!.Time);
        Assert.Equal(-180, back.Countdown.TzOffset);
        Assert.Equal("/invite.jpg", back.Families!.Image);
        Assert.Equal("/v.mp4", back.Gallery!.Video);
        Assert.Equal("/1.jpg", back.Gifts!.Image);
        Assert.Equal("/2.jpg", back.Gifts.Image2);
        Assert.Equal("123", back.Gifts.Items.Single().Account);
        Assert.Equal("Coming?", back.Rsvp!.Question);
        Assert.Equal("Rana", back.Rsvp.ContactName);
        Assert.Equal("+961 71 000 000", back.Rsvp.ContactPhone);
        Assert.Equal("@party", back.Rsvp.ContactLink);
    }
}
