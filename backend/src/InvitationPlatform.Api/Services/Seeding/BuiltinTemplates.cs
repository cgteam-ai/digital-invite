using InvitationPlatform.Domain.Enums;

namespace InvitationPlatform.Api.Services.Seeding;

/// <summary>One built-in template definition (name, event category, description, default data JSON).</summary>
public record TemplateSeed(string Name, string Description, string Data, string EventType = EventTypes.Wedding);

/// <summary>
/// The catalogue of application-owned built-in templates. Adding a template here is all that is
/// needed for it to be seeded — the <see cref="DatabaseSeeder"/> inserts only the ones missing,
/// in a single existence query, so startup cost does not grow with the number of templates.
/// (The former "Classic Wedding" template was intentionally retired.)
/// </summary>
public static class BuiltinTemplates
{
    public static readonly IReadOnlyList<TemplateSeed> All = new[]
    {
        new TemplateSeed(
            "Elegant Noir",
            "Dark scrolling invitation with script typography, envelope opening, gallery, timeline and music",
            """
            {
              "title": "New Invitation",
              "cover": { "enabled": true, "eventLabel": "Wedding", "names": "Name & Name", "tagline": "Are getting married", "greeting": "Dear", "hostText": "", "image": "/assets/elegant-noir/hero.jpg", "video": "/assets/elegant-noir/hero.mp4", "sealImage": "/assets/elegant-noir/seal.jpg", "buttonText": "Tap to open" },
              "countdown": { "enabled": true, "label": "Save the date", "date": "", "description": "Venue name, City", "image": "" },
              "families": { "enabled": true, "label": "Together with their families", "title": "", "items": [] },
              "gallery": { "enabled": true, "label": "Before forever", "title": "A glimpse of us", "items": [ { "url": "/assets/elegant-noir/gallery-1.jpg", "caption": "" }, { "url": "/assets/elegant-noir/gallery-2.jpg", "caption": "" }, { "url": "/assets/elegant-noir/gallery-3.jpg", "caption": "" }, { "url": "/assets/elegant-noir/gallery-4.jpg", "caption": "" } ] },
              "locations": { "enabled": true, "label": "Join us", "title": "The Celebration", "image": "/assets/elegant-noir/venue.jpg", "items": [ { "label": "The Ceremony", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/elegant-noir/church.jpg" }, { "label": "The Reception", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/elegant-noir/reception.jpg" } ] },
              "timeline": { "enabled": true, "label": "The day", "title": "Wedding Timeline", "items": [] },
              "gifts": { "enabled": false, "label": "With love", "title": "Gift Registry", "description": "Your presence is the greatest gift. For those who wish, a wedding list is available:", "image": "/assets/elegant-noir/gifts.jpg", "items": [] },
              "rsvp": { "enabled": true, "label": "Kindly reply by", "title": "Will you join us?", "deadline": "", "maxPeople": 10, "buttonText": "Send RSVP", "allowWishes": true, "image": "/assets/elegant-noir/rsvp.jpg" },
              "memories": { "enabled": false, "title": "Share Your Memories", "description": "During or after the event, open the link below to share your photos with us", "url": "", "buttonText": "Share Memories" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """),

        new TemplateSeed(
            "Serene Beige",
            "Light beige scrolling invitation with monogram hero, calendar card, split venue details, timeline, gallery and music",
            """
            {
              "title": "New Invitation",
              "cover": { "enabled": true, "eventLabel": "", "names": "Name & Name", "tagline": "Request the honor of your presence at their wedding", "hostIntro": "And the two shall become one", "hostOutro": "Mark 10: 8-9", "image": "/assets/serene-beige/hero.jpg", "buttonText": "" },
              "countdown": { "enabled": true, "label": "Save the date", "date": "", "description": "", "image": "/assets/serene-beige/calendar.jpg" },
              "families": { "enabled": true, "label": "", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "Where & When", "title": "", "image": "/assets/serene-beige/split.jpg", "items": [ { "label": "The Ceremony", "time": "", "name": "", "addr": "", "url": "", "img": "" }, { "label": "The Reception", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "The day", "title": "Timeline", "items": [] },
              "gallery": { "enabled": true, "label": "", "title": "Captured Moments", "items": [ { "url": "/assets/serene-beige/gallery-1.jpg", "caption": "" }, { "url": "/assets/serene-beige/gallery-2.jpg", "caption": "" }, { "url": "/assets/serene-beige/gallery-3.jpg", "caption": "" }, { "url": "/assets/serene-beige/gallery-4.jpg", "caption": "" } ] },
              "gifts": { "enabled": false, "label": "", "title": "Wedding Gift", "description": "Your presence is the best gift. Should you feel inclined, a list is available via Whish Money.", "items": [] },
              "rsvp": { "enabled": true, "label": "Be our guest", "title": "RSVP", "deadline": "", "maxPeople": 10, "buttonText": "Send Response", "allowWishes": true, "image": "/assets/serene-beige/rsvp.jpg" },
              "memories": { "enabled": false, "title": "Share Your Memories", "description": "During or after the event, open the link below to share your photos with us", "url": "", "buttonText": "Share Memories" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """),

        new TemplateSeed(
            "Wedding Daily",
            "Newspaper front page: blackletter masthead, black-and-white photography, script couple names, map tiles and a pill-button RSVP",
            """
            {
              "title": "New Invitation",
              "cover": { "enabled": true, "mastheadTitle": "The Wedding Daily", "editionLabel": "Special Edition", "headline": "Top Story of the Year", "eventLabel": "", "names": "Name & Name", "tagline": "Two hearts are becoming one and one important question remains...", "greeting": "Dear", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "/assets/wedding-daily/lead.jpg", "video": "", "buttonText": "" },
              "countdown": { "enabled": true, "label": "The Big Day", "date": "", "time": "", "tzOffset": null, "description": "", "image": "/assets/wedding-daily/couple.jpg" },
              "families": { "enabled": true, "label": "Together with their families", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "", "title": "", "image": "", "items": [ { "label": "The Ceremony", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/wedding-daily/venue.jpg" }, { "label": "The Reception", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/wedding-daily/aisle.jpg" } ] },
              "timeline": { "enabled": true, "label": "Running order", "title": "Order of the Day", "items": [] },
              "gallery": { "enabled": true, "label": "", "title": "", "items": [ { "url": "/assets/wedding-daily/laughing.jpg", "caption": "" }, { "url": "/assets/wedding-daily/couple.jpg", "caption": "" }, { "url": "/assets/wedding-daily/venue.jpg", "caption": "" }, { "url": "/assets/wedding-daily/lead.jpg", "caption": "" } ] },
              "gifts": { "enabled": false, "label": "Classifieds", "title": "Send the Newlyweds a Whish", "description": "", "items": [] },
              "rsvp": { "enabled": true, "label": "Will You Attend", "title": "Our Wedding?", "image": "/assets/wedding-daily/laughing.jpg", "description": "Having you beside us on our wedding day would make this chapter even more meaningful.", "question": "Coming?", "deadline": "", "maxPeople": 10, "buttonText": "Send Reply", "allowWishes": true },
              "memories": { "enabled": false, "title": "Share Your Memories", "description": "During or after the event, open the link below to share your photos with us", "url": "", "buttonText": "Share Memories" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """),

        new TemplateSeed(
            "Marble Waltz",
            "White watercolour invitation with an illustrated first dance, a winding itinerary of the day, boxed RSVP buttons, a gift section and a photo grid with a feature video",
            """
            {
              "title": "New Invitation",
              "cover": { "enabled": true, "headline": "Join Us", "tagline": "For the wedding of", "eventLabel": "", "names": "Name & Name", "greeting": "Dear", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "/assets/marble-waltz/illustration.png", "video": "", "buttonText": "" },
              "countdown": { "enabled": true, "label": "Until we say I do", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "", "title": "", "items": [] },
              "locations": { "enabled": false, "label": "", "title": "", "image": "", "items": [] },
              "timeline": { "enabled": true, "label": "", "title": "", "items": [
                { "time": "", "title": "Groom's House", "subtitle": "", "icon": "🤵", "url": "" },
                { "time": "", "title": "Bride's House", "subtitle": "", "icon": "👰", "url": "" },
                { "time": "", "title": "Ceremony", "subtitle": "", "icon": "⛪", "url": "" },
                { "time": "", "title": "Venue", "subtitle": "", "icon": "🥂", "url": "" } ] },
              "gallery": { "enabled": true, "label": "", "title": "", "video": "/assets/marble-waltz/silhouette.mp4", "items": [
                { "url": "/assets/marble-waltz/couple.jpg", "caption": "" },
                { "url": "/assets/marble-waltz/couple.jpg", "caption": "" },
                { "url": "/assets/marble-waltz/couple.jpg", "caption": "" } ] },
              "gifts": { "enabled": true, "label": "", "title": "Send the Newlyweds a Whish", "description": "", "image": "/assets/marble-waltz/couple.jpg", "image2": "", "items": [] },
              "rsvp": { "enabled": true, "label": "", "title": "", "description": "Having you beside us on our wedding day would make this chapter even more meaningful.", "question": "Coming?", "deadline": "", "maxPeople": 10, "buttonText": "Send Reply", "allowWishes": true },
              "memories": { "enabled": false, "title": "Share Your Memories", "description": "During or after the event, open the link below to share your photos with us", "url": "", "buttonText": "Share Memories" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """),

        new TemplateSeed(
            "Polaroid Heart",
            "Off-white invitation with a heart-shaped photo collage, an ampersand photo spread, paper-clipped polaroids for when and where, a card RSVP and a closing photo mosaic",
            """
            {
              "title": "New Invitation",
              "cover": { "enabled": true, "headline": "Celebrate with us our forever", "tagline": "Finally, forever.", "eventLabel": "", "names": "Name & Name", "greeting": "Dear", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "/assets/polaroid-heart/celebrate-couple.jpg", "video": "", "buttonText": "",
                "collage": [
                  { "url": "/assets/polaroid-heart/heart-01.jpg", "caption": "" }, { "url": "/assets/polaroid-heart/heart-02.jpg", "caption": "" },
                  { "url": "/assets/polaroid-heart/heart-03.jpg", "caption": "" }, { "url": "/assets/polaroid-heart/heart-04.jpg", "caption": "" },
                  { "url": "/assets/polaroid-heart/heart-05.jpg", "caption": "" }, { "url": "/assets/polaroid-heart/heart-06.jpg", "caption": "" },
                  { "url": "/assets/polaroid-heart/heart-07.jpg", "caption": "" }, { "url": "/assets/polaroid-heart/heart-08.jpg", "caption": "" },
                  { "url": "/assets/polaroid-heart/heart-09.jpg", "caption": "" }, { "url": "/assets/polaroid-heart/heart-10.jpg", "caption": "" },
                  { "url": "/assets/polaroid-heart/heart-11.jpg", "caption": "" }, { "url": "/assets/polaroid-heart/heart-12.jpg", "caption": "" },
                  { "url": "/assets/polaroid-heart/heart-13.jpg", "caption": "" }, { "url": "/assets/polaroid-heart/heart-14.jpg", "caption": "" },
                  { "url": "/assets/polaroid-heart/heart-15.jpg", "caption": "" }, { "url": "/assets/polaroid-heart/heart-16.jpg", "caption": "" },
                  { "url": "/assets/polaroid-heart/heart-17.jpg", "caption": "" }, { "url": "/assets/polaroid-heart/heart-18.jpg", "caption": "" } ] },
              "countdown": { "enabled": true, "label": "Counting down", "date": "", "time": "", "tzOffset": null, "description": "", "image": "/assets/polaroid-heart/celebrate-hands.jpg" },
              "families": { "enabled": false, "label": "", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "", "title": "When and Where", "image": "", "items": [
                { "label": "Ceremony", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/polaroid-heart/place-ceremony.jpg" },
                { "label": "Venue", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/polaroid-heart/place-venue.jpg" } ] },
              "timeline": { "enabled": false, "label": "", "title": "", "items": [] },
              "gallery": { "enabled": true, "label": "", "title": "", "video": "", "items": [
                { "url": "/assets/polaroid-heart/mosaic-1.jpg", "caption": "" }, { "url": "/assets/polaroid-heart/mosaic-2.jpg", "caption": "" },
                { "url": "/assets/polaroid-heart/mosaic-3.jpg", "caption": "" }, { "url": "/assets/polaroid-heart/mosaic-4.jpg", "caption": "" },
                { "url": "/assets/polaroid-heart/mosaic-5.jpg", "caption": "" }, { "url": "/assets/polaroid-heart/mosaic-6.jpg", "caption": "" },
                { "url": "/assets/polaroid-heart/mosaic-7.jpg", "caption": "" }, { "url": "/assets/polaroid-heart/mosaic-8.jpg", "caption": "" },
                { "url": "/assets/polaroid-heart/mosaic-9.jpg", "caption": "" } ] },
              "gifts": { "enabled": true, "label": "", "title": "Send the Newlyweds a Whish", "description": "", "image": "/assets/polaroid-heart/gift-1.jpg", "image2": "/assets/polaroid-heart/gift-2.jpg", "items": [] },
              "rsvp": { "enabled": true, "label": "", "title": "Will you be there for the “I do”?", "description": "", "question": "", "deadline": "", "maxPeople": 10, "buttonText": "RSVP", "allowWishes": true },
              "memories": { "enabled": false, "title": "Share Your Memories", "description": "During or after the event, open the link below to share your photos with us", "url": "", "buttonText": "Share Memories" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """),

        new TemplateSeed(
            "Editorial Love Story",
            "A fashion-editorial story swiped page by page: full-screen photography, large Didone typography, a chapter for every part of the day and an RSVP card over a photograph",
            """
            {
              "title": "New Invitation",
              "cover": { "enabled": true, "headline": "The Wedding Issue", "eventLabel": "", "names": "Name & Name", "tagline": "A love story, in the making", "greeting": "Dear", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "/assets/editorial-love-story/cover.jpg", "video": "", "buttonText": "" },
              "countdown": { "enabled": true, "label": "Save the Date", "date": "", "time": "", "tzOffset": null, "description": "", "image": "/assets/editorial-love-story/countdown.jpg" },
              "families": { "enabled": true, "label": "Together with their families", "title": "", "image": "/assets/editorial-love-story/invitation.jpg", "items": [] },
              "locations": { "enabled": true, "label": "Where", "title": "The Celebration", "image": "", "items": [
                { "label": "The Ceremony", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/editorial-love-story/ceremony.jpg" },
                { "label": "The Reception", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/editorial-love-story/reception.jpg" } ] },
              "timeline": { "enabled": true, "label": "The Day", "title": "Order of the Day", "items": [] },
              "gallery": { "enabled": true, "label": "Portfolio", "title": "Moments", "items": [
                { "url": "/assets/editorial-love-story/gallery-1.jpg", "caption": "" }, { "url": "/assets/editorial-love-story/gallery-2.jpg", "caption": "" },
                { "url": "/assets/editorial-love-story/gallery-3.jpg", "caption": "" }, { "url": "/assets/editorial-love-story/gallery-4.jpg", "caption": "" } ] },
              "gifts": { "enabled": false, "label": "With Gratitude", "title": "Gift Registry", "description": "Your presence is the most beautiful gift. For those who wish, a registry is available below.", "image": "/assets/editorial-love-story/gifts.jpg", "items": [] },
              "rsvp": { "enabled": true, "label": "Répondez s’il vous plaît", "title": "Will you join us?", "description": "", "deadline": "", "maxPeople": 10, "buttonText": "Send Reply", "allowWishes": true, "image": "/assets/editorial-love-story/rsvp.jpg" },
              "memories": { "enabled": false, "title": "Share Your Memories", "description": "During or after the event, open the link below to share your photos with us", "url": "", "buttonText": "Share Memories" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """),

        // ── BIRTHDAY ────────────────────────────────────────────────────────────
        // Birthday, engagement, baby shower and graduation templates are built on
        // frontend/shared/invitation-core.js. For these, cover.names is the person (or couple /
        // parents), cover.headline the event title and cover.eventLabel the age or class line.
        new TemplateSeed(
            "Rocket Party",
            "Kids' birthday (boys): a space mission — the age inside a ringed planet, a rocket lift-off, a T-minus countdown, a mission-log programme and a boarding-pass RSVP",
            """
            {
              "title": "Name",
              "cover": { "enabled": true, "headline": "", "eventLabel": "7", "names": "Name", "tagline": "Three, two, one… blast off to a party that is out of this world!", "greeting": "Hey", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "", "video": "", "buttonText": "Blast off" },
              "countdown": { "enabled": true, "label": "T-minus", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "Mission control", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "Launch pad", "title": "Where we land", "image": "", "items": [ { "label": "The party", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "Mission log", "title": "The plan", "items": [] },
              "gallery": { "enabled": false, "label": "Crew photos", "title": "", "items": [] },
              "gifts": { "enabled": false, "label": "Cargo hold", "title": "Gift ideas", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "Boarding pass", "title": "Are you coming aboard?", "description": "", "deadline": "", "maxPeople": 10, "buttonText": "Confirm my seat", "allowWishes": true, "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Birthday),

        new TemplateSeed(
            "Fairy Garden",
            "Kids' birthday (girls): a storybook garden tea party — an arched window with bunting and a tiered cake, butterflies, flower countdown badges and a tea-party ticket RSVP",
            """
            {
              "title": "Name",
              "cover": { "enabled": true, "headline": "", "eventLabel": "5", "names": "Name", "tagline": "Join us for tea, cake and a sprinkle of fairy magic in the garden.", "greeting": "Dear", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "", "video": "", "buttonText": "RSVP" },
              "countdown": { "enabled": true, "label": "Counting the sleeps", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "Hosted with love by", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "Where", "title": "Come find us", "image": "", "items": [ { "label": "The garden party", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "Party plan", "title": "A magical afternoon", "items": [] },
              "gallery": { "enabled": false, "label": "Our little flower", "title": "", "items": [] },
              "gifts": { "enabled": false, "label": "Wish list", "title": "Birthday wishes", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "Admit one", "title": "Will you join the tea party?", "description": "", "deadline": "", "maxPeople": 10, "buttonText": "Send my reply", "allowWishes": true, "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Birthday),

        new TemplateSeed(
            "Hype Night",
            "Teen birthday (boys): a streetwear gig poster — huge condensed type, slanted ticker bands, a scoreboard countdown, the night's lineup and a guest-list RSVP",
            """
            {
              "title": "Name",
              "cover": { "enabled": true, "headline": "", "eventLabel": "16", "names": "Name", "tagline": "One night. Loud music. Zero excuses.", "greeting": "Yo", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "", "video": "", "buttonText": "Get on the list" },
              "countdown": { "enabled": true, "label": "Kick-off in", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "Hosted by", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "The spot", "title": "Where it goes down", "image": "", "items": [ { "label": "Party", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "The lineup", "title": "How the night runs", "items": [] },
              "gallery": { "enabled": false, "label": "Throwbacks", "title": "", "items": [] },
              "gifts": { "enabled": false, "label": "Gifts", "title": "If you want to", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "Guest list", "title": "Get on the list", "description": "", "deadline": "", "maxPeople": 4, "buttonText": "Lock it in", "allowWishes": true, "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Birthday),

        new TemplateSeed(
            "Lilac Glow",
            "Teen birthday (girls): soft and iridescent — a lilac-peach glow, frosted panels, a shimmering name, a swipeable plan and a glassy RSVP card",
            """
            {
              "title": "Name",
              "cover": { "enabled": true, "headline": "", "eventLabel": "16", "names": "Name", "tagline": "Good music, great people and a little bit of glitter.", "greeting": "Hey", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "", "video": "", "buttonText": "RSVP" },
              "countdown": { "enabled": true, "label": "The countdown is on", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "Hosted by", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "Location", "title": "Where to find us", "image": "", "items": [ { "label": "The party", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "The plan", "title": "How the night goes", "items": [] },
              "gallery": { "enabled": false, "label": "Moments", "title": "", "items": [] },
              "gifts": { "enabled": false, "label": "Gifts", "title": "Wish list", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "RSVP", "title": "Will you be there?", "description": "", "deadline": "", "maxPeople": 4, "buttonText": "Send my RSVP", "allowWishes": true, "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Birthday),

        new TemplateSeed(
            "Gilded Soiree",
            "Adult birthday (30th, 40th, 50th…): a black-tie evening in midnight and champagne gold — art-deco frames, an engraved age numeral, a menu-card programme and an ivory response card",
            """
            {
              "title": "Name",
              "cover": { "enabled": true, "headline": "", "eventLabel": "40", "names": "Name", "tagline": "Join us for an unforgettable celebration", "greeting": "Dear", "hostIntro": "You are cordially invited to celebrate", "hostOutro": "", "hostText": "", "image": "/assets/gilded-soiree/toast.jpg", "video": "", "buttonText": "Kindly respond" },
              "countdown": { "enabled": true, "label": "Until the evening", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "Hosted by", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "The evening", "title": "An evening to remember", "image": "/assets/gilded-soiree/evening.jpg", "items": [ { "label": "Celebration", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "Programme", "title": "Order of the evening", "items": [] },
              "gallery": { "enabled": false, "label": "Through the years", "title": "", "items": [] },
              "gifts": { "enabled": false, "label": "With gratitude", "title": "Gifts", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "Kindly respond", "title": "The favour of a reply", "description": "", "deadline": "", "maxPeople": 2, "buttonText": "Send reply", "allowWishes": true, "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Birthday),

        // ── ENGAGEMENT ──────────────────────────────────────────────────────────
        new TemplateSeed(
            "Rose Promise",
            "Romantic engagement: blush and ivory, cathedral-arch photographs with a gold hairline, drawn botanical sprigs, copperplate names and a reply card sealed with the couple's initials",
            """
            {
              "title": "Name & Name",
              "cover": { "enabled": true, "headline": "invite you to celebrate their engagement", "eventLabel": "Together with their families", "names": "Name & Name", "tagline": "", "greeting": "Dear", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "/assets/rose-promise/cover.jpg", "video": "", "buttonText": "Kindly reply" },
              "countdown": { "enabled": true, "label": "Counting down to forever", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": true, "label": "With the blessing of", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "Where", "title": "The celebration", "image": "", "items": [ { "label": "Engagement party", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/rose-promise/venue.jpg" } ] },
              "timeline": { "enabled": true, "label": "The evening", "title": "Our evening together", "items": [] },
              "gallery": { "enabled": true, "label": "Moments", "title": "Us", "items": [ { "url": "/assets/rose-promise/gallery-1.jpg", "caption": "" }, { "url": "/assets/rose-promise/rings.jpg", "caption": "" }, { "url": "/assets/rose-promise/gallery-2.jpg", "caption": "" } ] },
              "gifts": { "enabled": false, "label": "With love", "title": "Gifts", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "Kindly reply", "title": "Will you celebrate with us?", "description": "", "deadline": "", "maxPeople": 4, "buttonText": "Send reply", "allowWishes": true, "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Engagement),

        new TemplateSeed(
            "Venn Union",
            "Modern engagement: two overlapping circles — one terracotta, one holding the couple's photograph — a numbered editorial grid, black-and-white photography and overlapping yes/no reply circles",
            """
            {
              "title": "Name & Name",
              "cover": { "enabled": true, "headline": "are getting engaged", "eventLabel": "Engagement", "names": "Name & Name", "tagline": "Two stories. One shared chapter.", "greeting": "Dear", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "/assets/venn-union/cover.jpg", "video": "", "buttonText": "Reply to the invitation" },
              "countdown": { "enabled": true, "label": "The date", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": true, "label": "Families", "title": "With our families", "items": [] },
              "locations": { "enabled": true, "label": "The place", "title": "The place", "image": "", "items": [ { "label": "Engagement celebration", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/venn-union/venue.jpg" } ] },
              "timeline": { "enabled": true, "label": "The evening", "title": "The evening", "items": [] },
              "gallery": { "enabled": true, "label": "Us", "title": "Us", "items": [ { "url": "/assets/venn-union/hands.jpg", "caption": "" } ] },
              "gifts": { "enabled": false, "label": "Gifts", "title": "Gifts", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "RSVP", "title": "Will you join us?", "description": "", "deadline": "", "maxPeople": 2, "buttonText": "Send reply", "allowWishes": true, "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Engagement),

        // ── BABY SHOWER ─────────────────────────────────────────────────────────
        new TemplateSeed(
            "Little Cloud",
            "Soft baby shower for a boy or girl: a pastel sky with drifting clouds, a swaying nursery mobile, moon-shaped countdown badges and cloud-soft cards",
            """
            {
              "title": "Baby Shower",
              "cover": { "enabled": true, "headline": "A little one is on the way", "eventLabel": "Baby Shower", "names": "Name & Name", "tagline": "Please join us for a baby shower", "greeting": "Dear", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "", "video": "", "buttonText": "RSVP" },
              "countdown": { "enabled": true, "label": "Counting down", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "Hosted by", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "Where", "title": "Where to find us", "image": "", "items": [ { "label": "Baby shower", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "The plan", "title": "A sweet afternoon", "items": [] },
              "gallery": { "enabled": false, "label": "Waiting for you", "title": "", "items": [] },
              "gifts": { "enabled": false, "label": "Registry", "title": "Gift registry", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "RSVP", "title": "Will you join us?", "description": "", "deadline": "", "maxPeople": 4, "buttonText": "Send RSVP", "allowWishes": true, "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.BabyShower),

        new TemplateSeed(
            "Paper Shapes",
            "Modern baby shower for a boy or girl: mid-century cut-paper shapes, letter blocks that tumble in, tilted countdown blocks, checkerboard trims and a sticker-style reply",
            """
            {
              "title": "Baby Shower",
              "cover": { "enabled": true, "headline": "Oh, baby!", "eventLabel": "Baby", "names": "Name & Name", "tagline": "Something small is about to change everything.", "greeting": "Dear", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "", "video": "", "buttonText": "Reply" },
              "countdown": { "enabled": true, "label": "Almost here", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "Hosted by", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "When & where", "title": "When & where", "image": "", "items": [ { "label": "Baby shower", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "The afternoon", "title": "What’s happening", "items": [] },
              "gallery": { "enabled": false, "label": "Snapshots", "title": "", "items": [] },
              "gifts": { "enabled": false, "label": "Registry", "title": "Little wishes", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "RSVP", "title": "Will you be there?", "description": "", "deadline": "", "maxPeople": 4, "buttonText": "Send my reply", "allowWishes": true, "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.BabyShower),

        // ── GRADUATION ──────────────────────────────────────────────────────────
        new TemplateSeed(
            "Laurel Honors",
            "Elegant academic graduation: Oxford navy and gold, a laurel wreath and crest, a parchment certificate announcement, an Order of Proceedings and a formal reply card",
            """
            {
              "title": "Graduation",
              "cover": { "enabled": true, "headline": "Congratulations", "eventLabel": "Class of 2026", "names": "Name", "tagline": "Please join us in celebrating this milestone", "greeting": "Dear", "hostIntro": "is graduating from", "hostOutro": "", "hostText": "Degree · University", "image": "", "video": "", "buttonText": "Kindly reply" },
              "countdown": { "enabled": true, "label": "Commencement", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "With pride", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "Venues", "title": "Ceremony & celebration", "image": "", "items": [ { "label": "Graduation ceremony", "time": "", "name": "", "addr": "", "url": "", "img": "" }, { "label": "Reception", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "Programme", "title": "Order of proceedings", "items": [] },
              "gallery": { "enabled": false, "label": "Portraits", "title": "", "items": [] },
              "gifts": { "enabled": false, "label": "Gifts", "title": "With gratitude", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "Reply", "title": "The favour of your reply", "description": "", "deadline": "", "maxPeople": 4, "buttonText": "Send reply", "allowWishes": true, "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Graduation),

        new TemplateSeed(
            "Cap Toss",
            "High-energy graduation party: electric cobalt and sunshine yellow, a huge CLASS OF year, mortarboards flying with a confetti burst, a spinning congrats badge and bold striped programme rows",
            """
            {
              "title": "Graduation Party",
              "cover": { "enabled": true, "headline": "Congrats, grad!", "eventLabel": "Class of 2026", "names": "Name", "tagline": "Come celebrate the big finish — and the next big start.", "greeting": "Hey", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "", "video": "", "buttonText": "I'm coming" },
              "countdown": { "enabled": true, "label": "Party starts in", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "Big thanks to", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "Where", "title": "Where to celebrate", "image": "", "items": [ { "label": "Grad party", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "The plan", "title": "How it goes", "items": [] },
              "gallery": { "enabled": false, "label": "Yearbook", "title": "", "items": [] },
              "gifts": { "enabled": false, "label": "Gifts", "title": "Grad fund", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "RSVP", "title": "You coming?", "description": "", "deadline": "", "maxPeople": 4, "buttonText": "Send it", "allowWishes": true, "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Graduation),

        // ── SECOND COLLECTION: two more designs in every category ─────────────
        // These wedding templates are built on invitation-core.js like the celebration ones, so
        // cover.names holds the couple and the wedding wording sits in cover.hostIntro/hostText.
        new TemplateSeed(
            "Emerald Vows",
            "Classic wedding: emerald ink and gold on ivory, engraved oval cameos ringed with a vine of leaves, a letterpress invitation card, an emerald countdown band and a monogrammed reply card",
            """
            {
              "title": "Name & Name",
              "cover": { "enabled": true, "headline": "are getting married", "eventLabel": "Together with their families", "names": "Name & Name", "tagline": "", "greeting": "Dear", "hostIntro": "Together with their families", "hostText": "request the honour of your presence at the celebration of their marriage", "hostOutro": "", "image": "/assets/emerald-vows/hero.jpg", "video": "", "buttonText": "Kindly reply" },
              "countdown": { "enabled": true, "label": "Until we say I do", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": true, "label": "With the blessing of", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "The day", "title": "Ceremony & celebration", "image": "", "items": [ { "label": "The ceremony", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/emerald-vows/church.jpg" }, { "label": "The reception", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/emerald-vows/reception.jpg" } ] },
              "timeline": { "enabled": true, "label": "Order of the day", "title": "How the day unfolds", "items": [] },
              "gallery": { "enabled": true, "label": "Our story", "title": "Moments", "items": [ { "url": "/assets/emerald-vows/gallery-1.jpg", "caption": "" }, { "url": "/assets/emerald-vows/gallery-2.jpg", "caption": "" }, { "url": "/assets/emerald-vows/gallery-3.jpg", "caption": "" } ] },
              "gifts": { "enabled": false, "label": "With love", "title": "Gift registry", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "Kindly reply", "title": "Will you join us?", "description": "", "deadline": "", "maxPeople": 4, "buttonText": "Send reply", "allowWishes": true, "image": "/assets/emerald-vows/rsvp.jpg", "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "Share your memories", "description": "", "url": "", "buttonText": "Share photos" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """),

        new TemplateSeed(
            "Atelier",
            "Modern wedding: bone and ink, a sticky photograph stage that changes as each numbered chapter scrolls past (a full-bleed photo band per chapter on phones), oversized serif names, metallic numerals and a black reply chapter",
            """
            {
              "title": "Name & Name",
              "cover": { "enabled": true, "headline": "The wedding of", "eventLabel": "", "names": "Name & Name", "tagline": "Join us as we begin our life together.", "greeting": "Dear", "hostIntro": "With their families", "hostText": "", "hostOutro": "", "image": "/assets/atelier/cover.jpg", "video": "", "buttonText": "Reply" },
              "countdown": { "enabled": true, "label": "The date", "date": "", "time": "", "tzOffset": null, "description": "", "image": "/assets/atelier/beach.jpg" },
              "families": { "enabled": true, "label": "With their families", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "The places", "title": "Where", "image": "/assets/atelier/aisle.jpg", "items": [ { "label": "Ceremony", "time": "", "name": "", "addr": "", "url": "", "img": "" }, { "label": "Reception", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/atelier/table.jpg" } ] },
              "timeline": { "enabled": true, "label": "The day", "title": "The day", "items": [] },
              "gallery": { "enabled": true, "label": "Us", "title": "Us", "items": [ { "url": "/assets/atelier/hands.jpg", "caption": "" }, { "url": "/assets/atelier/portrait.jpg", "caption": "" }, { "url": "/assets/atelier/sunset.jpg", "caption": "" } ] },
              "gifts": { "enabled": false, "label": "Gifts", "title": "Gifts", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "RSVP", "title": "Will you be there?", "description": "", "deadline": "", "maxPeople": 2, "buttonText": "Send reply", "allowWishes": true, "image": "/assets/atelier/veil.jpg", "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "Share your photos", "description": "", "url": "", "buttonText": "Open the album" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """),

        new TemplateSeed(
            "Amalfi",
            "Romantic engagement by the sea: stucco white, lemon, azure and olive — a sea photograph with a postcard laid over it, hand-drawn lemon branches, majolica tile strips and a postcard-back reply with a lemon stamp",
            """
            {
              "title": "Name & Name",
              "cover": { "enabled": true, "headline": "are engaged", "eventLabel": "Save the date", "names": "Name & Name", "tagline": "Join us for an evening by the sea to celebrate our engagement.", "greeting": "Dear", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "/assets/amalfi/sea.jpg", "video": "", "buttonText": "Reply" },
              "countdown": { "enabled": true, "label": "Counting down", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": true, "label": "With the blessing of", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "Where", "title": "By the water", "image": "", "items": [ { "label": "Engagement party", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/amalfi/venue.jpg" } ] },
              "timeline": { "enabled": true, "label": "The evening", "title": "How the evening goes", "items": [] },
              "gallery": { "enabled": true, "label": "Us", "title": "A few snapshots", "items": [ { "url": "/assets/amalfi/gallery-1.jpg", "caption": "" }, { "url": "/assets/amalfi/gallery-2.jpg", "caption": "" }, { "url": "/assets/amalfi/gallery-3.jpg", "caption": "" } ] },
              "gifts": { "enabled": false, "label": "Gifts", "title": "Gifts", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "Write back", "title": "Will you join us?", "description": "", "deadline": "", "maxPeople": 4, "buttonText": "Send the postcard", "allowWishes": true, "image": "", "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Engagement),

        new TemplateSeed(
            "Ink Bloom",
            "Modern, artistic engagement: washi paper, sumi ink and one vermilion seal — an ink wash blooming behind a torn-edge black-and-white photograph, a brush stroke that draws itself, ink-line dividers and a sealed reply",
            """
            {
              "title": "Name & Name",
              "cover": { "enabled": true, "headline": "are getting engaged", "eventLabel": "Engagement", "names": "Name & Name", "tagline": "Two names. One story. Come and see it begin.", "greeting": "Dear", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "/assets/ink-bloom/veil.jpg", "video": "", "buttonText": "Reply" },
              "countdown": { "enabled": true, "label": "Until then", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": true, "label": "With our families", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "The place", "title": "Where", "image": "", "items": [ { "label": "Engagement evening", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/ink-bloom/venue.jpg" } ] },
              "timeline": { "enabled": true, "label": "The order", "title": "The evening", "items": [] },
              "gallery": { "enabled": true, "label": "Fragments", "title": "Us, so far", "items": [ { "url": "/assets/ink-bloom/hands.jpg", "caption": "" }, { "url": "/assets/ink-bloom/rings.jpg", "caption": "" } ] },
              "gifts": { "enabled": false, "label": "Gifts", "title": "Gifts", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "Your reply", "title": "Will you be with us?", "description": "", "deadline": "", "maxPeople": 2, "buttonText": "Send reply", "allowWishes": true, "image": "", "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Engagement),

        new TemplateSeed(
            "Arcade",
            "Fun, energetic birthday for kids and teens: a retro video-game cabinet — pixel stars and scanlines, the age as a LEVEL, a pixel cake, a high-score countdown, stage-select venue cards, levels with a progress bar and an INSERT COIN reply",
            """
            {
              "title": "Name",
              "cover": { "enabled": true, "headline": "", "eventLabel": "9", "names": "Name", "tagline": "Insert coin for the most fun birthday party ever!", "greeting": "Hey", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "", "video": "", "buttonText": "Press start" },
              "countdown": { "enabled": true, "label": "High score", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "Player 2", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "Stage select", "title": "Where we play", "image": "", "items": [ { "label": "The party", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "Levels", "title": "How the game goes", "items": [] },
              "gallery": { "enabled": false, "label": "Gallery", "title": "Best screenshots", "items": [] },
              "gifts": { "enabled": false, "label": "Power-ups", "title": "Gift ideas", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "Insert coin", "title": "Are you playing?", "description": "", "deadline": "", "maxPeople": 10, "buttonText": "Start", "allowWishes": true, "image": "", "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Birthday),

        new TemplateSeed(
            "Velvet Hour",
            "Elegant adult birthday for anyone: a candle-lit dinner in aubergine, oxblood and brass — a moody photograph with a huge serif age numeral, coaster-style countdown, a brass ribbon timeline and a reservation card to reply",
            """
            {
              "title": "Name",
              "cover": { "enabled": true, "headline": "An evening to celebrate", "eventLabel": "50", "names": "Name", "tagline": "Good food, low light and the people who matter.", "greeting": "Dear", "hostIntro": "You are invited to", "hostOutro": "", "hostText": "", "image": "/assets/velvet-hour/candles.jpg", "video": "", "buttonText": "Reserve your seat" },
              "countdown": { "enabled": true, "label": "Until we raise a glass", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "Hosted by", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "The table", "title": "Where we gather", "image": "", "items": [ { "label": "Dinner", "time": "", "name": "", "addr": "", "url": "", "img": "/assets/velvet-hour/table.jpg" } ] },
              "timeline": { "enabled": true, "label": "The evening", "title": "How the night unfolds", "items": [] },
              "gallery": { "enabled": false, "label": "Through the years", "title": "A few favourites", "items": [] },
              "gifts": { "enabled": false, "label": "Gifts", "title": "No gifts, please", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "Reservation", "title": "Will you join the table?", "description": "", "deadline": "", "maxPeople": 2, "buttonText": "Confirm reservation", "allowWishes": true, "image": "", "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Birthday),

        new TemplateSeed(
            "Little Honey",
            "Soft, sweet baby shower for a boy or a girl: cream, honey and sage — a faint honeycomb, a little bee drifting along a looping path, hexagon countdown cells, honey-drip cards and a jar-label reply",
            """
            {
              "title": "Baby Shower",
              "cover": { "enabled": true, "headline": "A little honey is on the way", "eventLabel": "Baby Shower", "names": "Name & Name", "tagline": "Please join us for a baby shower", "greeting": "Dear", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "", "video": "", "buttonText": "RSVP" },
              "countdown": { "enabled": true, "label": "Counting down", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "Hosted by", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "Where", "title": "Where to find the hive", "image": "", "items": [ { "label": "Baby shower", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "The plan", "title": "A sweet afternoon", "items": [] },
              "gallery": { "enabled": false, "label": "Sweet moments", "title": "", "items": [] },
              "gifts": { "enabled": false, "label": "Registry", "title": "Gift registry", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "RSVP", "title": "Will you bee there?", "description": "", "deadline": "", "maxPeople": 4, "buttonText": "Send RSVP", "allowWishes": true, "image": "", "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.BabyShower),

        new TemplateSeed(
            "Bubble Pop",
            "Modern, playful baby shower for a boy or a girl: white space and glossy gradient bubbles floating up, a rainbow-coloured title, blob-shaped cards, a pill countdown, a balloon-string plan and a big rounded reply",
            """
            {
              "title": "Baby Shower",
              "cover": { "enabled": true, "headline": "Pop! A baby is coming", "eventLabel": "Baby shower", "names": "Name & Name", "tagline": "Bubbles, cake and one tiny reason to celebrate.", "greeting": "Hey", "hostIntro": "", "hostOutro": "", "hostText": "", "image": "", "video": "", "buttonText": "I'm coming" },
              "countdown": { "enabled": true, "label": "Almost here", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "Hosted by", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "Where", "title": "Where the fun is", "image": "", "items": [ { "label": "Baby shower", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "The plan", "title": "What's popping", "items": [] },
              "gallery": { "enabled": false, "label": "Snapshots", "title": "Bump pics", "items": [] },
              "gifts": { "enabled": false, "label": "Registry", "title": "Little wishes", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "RSVP", "title": "Are you in?", "description": "", "deadline": "", "maxPeople": 4, "buttonText": "Count me in", "allowWishes": true, "image": "", "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.BabyShower),

        new TemplateSeed(
            "Ivy Hall",
            "Elegant, collegiate graduation: ivy green, cream and burgundy with a brass line — varsity-stripe ribbons, ivy that grows down the margin, a matted portrait, a burgundy commencement countdown band, an order of exercises and a cream reply card",
            """
            {
              "title": "Graduation",
              "cover": { "enabled": true, "headline": "Class of 2026", "eventLabel": "Commencement", "names": "Name", "tagline": "Please join us to celebrate this achievement", "greeting": "Dear", "hostIntro": "proudly announces the graduation of", "hostOutro": "", "hostText": "Degree · University", "image": "", "video": "", "buttonText": "Reply" },
              "countdown": { "enabled": true, "label": "The commencement", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": true, "label": "With pride", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "Venues", "title": "Ceremony & reception", "image": "", "items": [ { "label": "Commencement ceremony", "time": "", "name": "", "addr": "", "url": "", "img": "" }, { "label": "Reception", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "Programme", "title": "Order of exercises", "items": [] },
              "gallery": { "enabled": false, "label": "Yearbook", "title": "The years", "items": [] },
              "gifts": { "enabled": false, "label": "Gifts", "title": "With gratitude", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "Reply", "title": "Kindly reply", "description": "", "deadline": "", "maxPeople": 4, "buttonText": "Send reply", "allowWishes": true, "image": "", "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Graduation),

        new TemplateSeed(
            "Next Chapter",
            "Modern, youthful graduation party: near-black with a violet-to-orange gradient beam, chunky headlines, a degree progress bar that fills to 100%, gradient-framed photo and countdown tiles, bookmark-tabbed sections and a bright reply card",
            """
            {
              "title": "Graduation Party",
              "cover": { "enabled": true, "headline": "The next chapter starts now", "eventLabel": "Class of 2026", "names": "Name", "tagline": "", "greeting": "Hey", "hostIntro": "Just graduated", "hostOutro": "", "hostText": "Degree · University", "image": "", "video": "", "buttonText": "I'll be there" },
              "countdown": { "enabled": true, "label": "Party in", "date": "", "time": "", "tzOffset": null, "description": "", "image": "" },
              "families": { "enabled": false, "label": "Big thanks to", "title": "", "items": [] },
              "locations": { "enabled": true, "label": "Where", "title": "The venue", "image": "", "items": [ { "label": "Grad party", "time": "", "name": "", "addr": "", "url": "", "img": "" } ] },
              "timeline": { "enabled": true, "label": "The plan", "title": "How the night goes", "items": [] },
              "gallery": { "enabled": false, "label": "Highlights", "title": "The highlights", "items": [] },
              "gifts": { "enabled": false, "label": "Gifts", "title": "Grad fund", "description": "", "image": "", "items": [] },
              "rsvp": { "enabled": true, "label": "RSVP", "title": "Are you coming?", "description": "", "deadline": "", "maxPeople": 4, "buttonText": "Send it", "allowWishes": true, "image": "", "contactName": "", "contactPhone": "", "contactLink": "" },
              "memories": { "enabled": false, "title": "", "description": "", "url": "", "buttonText": "" },
              "music": { "enabled": false, "url": "", "autoplay": true },
              "customSections": []
            }
            """, EventTypes.Graduation)
    };
}
