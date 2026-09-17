/*
 * Demo / preview invitations.
 *
 * Used for showing the product to event planners and prospective customers without touching the
 * database: open any template with "?demo=<template-key>" and it renders this sample data instead
 * of fetching an invitation. Because no slug is resolved, the RSVP form runs in preview mode and
 * never posts anything.
 *
 * IMAGES: every wedding template's demo uses its own photo set under frontend/assets/<template>/,
 * chosen to suit that design, so each landing-page Preview shows real photography. The photos are
 * bundled, not fetched, so there is no external request. Elegant Noir and Serene Beige use
 * high-resolution Unsplash photos (free for commercial use), pre-cropped to each slot's shape. The
 * other three were taken from the Canva reference designs — confirm that licence before selling.
 * To use your own photos, drop them into those folders under the same names. The vector art in frontend/assets/demo/ (`COUPLE` below) is now
 * only the fallback behind the shared constants.
 */
(function () {
  'use strict';

  // Artwork lives in the repo (frontend/assets/demo/*.svg) rather than coming from a third-party
  // photo service. Keyword-based services returned off-theme results (landscapes, random colours),
  // so every demo image is now bundled, wedding-specific, and identical on every load. Being SVG,
  // it is a few KB, needs no external request and stays sharp on any screen.
  //
  // To use your own photography instead, drop the files in assets/demo/ and change the paths below.
  const art = name => `/assets/demo/${name}.svg`;

  const COUPLE = {
    // Portrait/landscape mix so galleries demonstrate real-world proportions.
    hero:      art('couple-silhouette'),
    couple1:   art('bouquet'),           // portrait
    couple2:   art('couple-silhouette'),
    couple3:   art('rings'),
    couple4:   art('cake'),
    venue:     art('table-setting'),
    church:    art('chapel'),
    reception: art('table-setting'),
    gifts:     art('petals'),
    rsvpBg:    art('floral-arch')
  };

  const EVENT_DATE = '2027-06-12';

  const LOCATIONS = [
    {
      label: 'The Ceremony', time: '4:30 PM',
      name: 'Saint Elias Cathedral',
      addr: 'Rue Sursock, Achrafieh, Beirut',
      url: 'https://www.google.com/maps/search/?api=1&query=Beirut',
      img: COUPLE.church
    },
    {
      label: 'The Reception', time: '7:30 PM',
      name: 'Villa Rosa Gardens',
      addr: 'Broummana, Mount Lebanon',
      url: 'https://www.google.com/maps/search/?api=1&query=Broummana',
      img: COUPLE.reception
    }
  ];

  const TIMELINE = [
    { time: '4:30 PM', icon: '⛪', title: 'Ceremony',        subtitle: 'Saint Elias Cathedral', url: 'https://www.google.com/maps/search/?api=1&query=Beirut' },
    { time: '6:00 PM', icon: '📸', title: 'Photographs',     subtitle: 'Cathedral gardens' },
    { time: '7:30 PM', icon: '🥂', title: 'Cocktail Hour',   subtitle: 'Villa Rosa terrace', url: 'https://www.google.com/maps/search/?api=1&query=Broummana' },
    { time: '9:00 PM', icon: '🍽️', title: 'Dinner & Toasts', subtitle: 'The Orangery' },
    { time: '10:30 PM', icon: '💃', title: 'Dancing',        subtitle: 'Until late' }
  ];

  const FAMILIES = [
    { label: 'Parents of the Bride', names: 'Mr. & Mrs. Antoine Khoury' },
    { label: 'Parents of the Groom', names: 'Mr. & Mrs. Georges Haddad' }
  ];

  const GALLERY = [
    { url: COUPLE.couple1, caption: 'The proposal' },
    { url: COUPLE.couple2, caption: 'Summer in Batroun' },
    { url: COUPLE.couple3, caption: 'Engagement day' },
    { url: COUPLE.couple4, caption: 'Our happy place' }
  ];

  const RSVP = {
    enabled: true, label: 'Kindly reply by', title: 'Will You Join Us?',
    deadline: '2027-05-15', maxPeople: 4, buttonText: 'Send RSVP', allowWishes: true,
    image: COUPLE.rsvpBg,
    acceptMessage: 'Thank you! We are so happy you will be celebrating with us.\nSee you on the 12th of June.',
    declineMessage: 'Thank you for letting us know.\nYou will be dearly missed on our special day.'
  };

  const GIFTS = {
    enabled: true, label: 'With love', title: 'Gift Registry',
    image: COUPLE.gifts,
    description: 'Your presence is the greatest gift of all. For those who wish to contribute, a registry is available below.',
    items: [
      { bank: 'Bank of Beirut', account: 'LB00 1234 5678 9012 3456' },
      { bank: 'Whish Money',    account: '+961 71 234 567' }
    ]
  };

  const MUSIC = { enabled: false, url: '', autoplay: true };

  // Per-template photos: a gallery list, and location cards given one photo each in order.
  const photos   = (dir, items) => items.map(([file, caption]) => ({ url: `/assets/${dir}/${file}`, caption }));
  const withImgs = (items, imgs) => items.map((x, i) => Object.assign({}, x, { img: imgs[i] || '' }));

  window.DEMO_INVITATIONS = {
    'elegant-noir': {
      title: 'Nadia & Karim',
      cover: {
        enabled: true, eventLabel: 'We Are Getting Married',
        names: 'Nadia & Karim', tagline: 'Together with our families, we invite you to share our joy',
        greeting: 'Dear', hostIntro: 'With hearts full of love,',
        hostText: 'invite you to celebrate the marriage of their children',
        hostOutro: '', image: '/assets/elegant-noir/hero.jpg', video: '/assets/elegant-noir/hero.mp4',
        sealImage: '/assets/elegant-noir/seal.jpg', buttonText: 'Tap to open'
      },
      countdown: { enabled: true, label: 'Save the date', date: EVENT_DATE, description: 'Beirut, Lebanon', image: '/assets/elegant-noir/venue.jpg' },
      families:  { enabled: true, label: 'Together with their families', title: '', items: FAMILIES },
      gallery:   { enabled: true, label: 'Before forever', title: 'A Glimpse of Us', items: photos('elegant-noir', [
        ['gallery-1.jpg', 'The rings'], ['gallery-2.jpg', 'Her bouquet'], ['gallery-3.jpg', 'Just us'], ['gallery-4.jpg', 'Forever begins']
      ]) },
      locations: { enabled: true, label: 'Join us', title: 'The Celebration', image: '/assets/elegant-noir/venue.jpg',
                   items: withImgs(LOCATIONS, ['/assets/elegant-noir/church.jpg', '/assets/elegant-noir/reception.jpg']) },
      timeline:  { enabled: true, label: 'The day', title: 'Wedding Timeline', items: TIMELINE },
      gifts:     Object.assign({}, GIFTS, { image: '/assets/elegant-noir/gifts.jpg' }),
      rsvp:      Object.assign({}, RSVP, { image: '/assets/elegant-noir/rsvp.jpg' }),
      // Photo sharing is not built yet, so the demo must not advertise it. Set enabled back to
      // true (here and in the Serene Beige demo below) once the feature ships — the templates
      // already know how to render this section.
      memories:  { enabled: false, title: 'Share Your Memories', description: 'During or after the celebration, upload your photos so we can relive the day through your eyes.', url: 'https://example.com/album', buttonText: 'Share Memories' },
      music:     MUSIC,
      customSections: [
        { enabled: true, label: '1 Corinthians 13:4', title: '', body: 'Love is patient, love is kind.\nIt always protects, always trusts,\nalways hopes, always perseveres.' }
      ]
    },

    'serene-beige': {
      title: 'Layla & Elias',
      cover: {
        enabled: true, eventLabel: '',
        names: 'Layla & Elias', tagline: 'Request the honour of your presence at their wedding',
        hostIntro: 'And the two shall become one', hostOutro: 'Mark 10: 8-9',
        image: '/assets/serene-beige/hero.jpg', buttonText: ''
      },
      countdown: { enabled: true, label: 'Save the date', date: EVENT_DATE, description: 'Beirut, Lebanon', image: '/assets/serene-beige/calendar.jpg' },
      families:  { enabled: true, label: '', title: '', items: FAMILIES },
      locations: { enabled: true, label: 'Where & When', title: '', image: '/assets/serene-beige/split.jpg', items: LOCATIONS },
      timeline:  { enabled: true, label: 'The day', title: 'Timeline', items: TIMELINE },
      gallery:   { enabled: true, label: '', title: 'Captured Moments', items: photos('serene-beige', [
        ['gallery-1.jpg', 'By the lake'], ['gallery-2.jpg', 'Under the old tree'], ['gallery-3.jpg', 'Her bouquet'], ['gallery-4.jpg', 'The arch']
      ]) },
      gifts:     GIFTS,
      rsvp:      Object.assign({}, RSVP, { label: 'Be our guest', title: 'RSVP', buttonText: 'Send Response', image: '/assets/serene-beige/rsvp.jpg' }),
      // Disabled until photo sharing is implemented — see the note on the Elegant Noir demo above.
      memories:  { enabled: false, title: 'Share Your Memories', description: 'Upload your photos from the day so we can relive it through your eyes.', url: 'https://example.com/album', buttonText: 'Share Memories' },
      music:     MUSIC,
      customSections: []
    },

    'wedding-daily': {
      title: 'Daniel & Anna',
      cover: {
        enabled: true,
        mastheadTitle: 'The Wedding Daily',
        editionLabel: 'Special Edition',
        headline: 'Top Story of the Year',
        eventLabel: '',
        names: 'Daniel & Anna',
        tagline: 'Two hearts are becoming one and one important question remains...',
        greeting: 'Dear',
        image: '/assets/wedding-daily/lead.jpg', video: '', buttonText: ''
      },
      countdown: { enabled: true, label: 'The Big Day', date: EVENT_DATE, time: '17:30', tzOffset: new Date(2027, 5, 12, 17, 30).getTimezoneOffset(), description: 'Beirut, Lebanon', image: '/assets/wedding-daily/couple.jpg' },
      families:  { enabled: true, label: 'Together with their families', title: '', items: FAMILIES },
      locations: { enabled: true, label: '', title: '', image: '',
                   items: withImgs(LOCATIONS, ['/assets/wedding-daily/venue.jpg', '/assets/wedding-daily/aisle.jpg']) },
      timeline:  { enabled: true, label: 'Running order', title: 'Order of the Day', items: TIMELINE },
      gallery:   { enabled: true, label: '', title: '', items: photos('wedding-daily', [
        ['laughing.jpg', ''], ['couple.jpg', ''], ['venue.jpg', ''], ['lead.jpg', '']
      ]) },
      gifts:     Object.assign({}, GIFTS, {
        label: 'Classifieds', title: 'Send the Newlyweds a Whish',
        description: 'Your presence is the headline. For those who wish to send a gift, our accounts are listed below.'
      }),
      rsvp: Object.assign({}, RSVP, {
        label: 'Will You Attend', title: 'Our Wedding?', image: '/assets/wedding-daily/laughing.jpg',
        description: 'Having you beside us on our wedding day would make this chapter even more meaningful.',
        question: 'Coming?', buttonText: 'Send Reply'
      }),
      // Disabled until photo sharing is implemented — see the note on the Elegant Noir demo above.
      memories:  { enabled: false, title: 'Share Your Memories', description: 'Upload your photos from the day so we can relive it through your eyes.', url: 'https://example.com/album', buttonText: 'Share Memories' },
      music:     MUSIC,
      customSections: []
    },

    'marble-waltz': {
      title: 'Jane & Andrew',
      cover: {
        enabled: true, headline: 'Join Us', tagline: 'For the wedding of', eventLabel: '',
        names: 'Jane & Andrew', greeting: 'Dear',
        image: '/assets/marble-waltz/illustration.png', video: '', buttonText: ''
      },
      countdown: { enabled: true, label: 'Until we say I do', date: EVENT_DATE, time: '19:00', tzOffset: new Date(2027, 5, 12, 19, 0).getTimezoneOffset(), description: '', image: '' },
      families:  { enabled: false, label: '', title: '', items: FAMILIES },
      locations: { enabled: false, label: '', title: '', image: '', items: [] },
      timeline:  { enabled: true, label: '', title: '', items: [
        { time: '3 PM',    title: "Groom's House", subtitle: 'Beirut',                url: 'https://www.google.com/maps/search/?api=1&query=Beirut' },
        { time: '3:30 PM', title: "Bride's House", subtitle: 'Achrafieh, Beirut',     url: 'https://www.google.com/maps/search/?api=1&query=Achrafieh' },
        { time: '5:30 PM', title: 'Ceremony',      subtitle: 'Saint Elias Cathedral', url: 'https://www.google.com/maps/search/?api=1&query=Beirut' },
        { time: '7:30 PM', title: 'Venue',         subtitle: 'Villa Rosa Gardens',    url: 'https://www.google.com/maps/search/?api=1&query=Broummana' }
      ] },
      gallery:   { enabled: true, label: '', title: '', video: '/assets/marble-waltz/silhouette.mp4', items: [
        { url: '/assets/marble-waltz/couple.jpg', caption: '' },
        { url: '/assets/marble-waltz/couple.jpg', caption: '' },
        { url: '/assets/marble-waltz/couple.jpg', caption: '' }
      ] },
      gifts: {
        enabled: true, label: '', title: 'Send the Newlyweds a Whish', description: '',
        image: '/assets/marble-waltz/couple.jpg', image2: '',
        items: [{ bank: 'Whish Account Number', account: '12345' }]
      },
      rsvp: Object.assign({}, RSVP, {
        label: '', title: '', question: 'Coming?', buttonText: 'Send Reply',
        description: 'Having you beside us on our wedding day would make this chapter even more meaningful.'
      }),
      // Disabled until photo sharing is implemented — see the note on the Elegant Noir demo above.
      memories:  { enabled: false, title: 'Share Your Memories', description: 'Upload your photos from the day so we can relive it through your eyes.', url: 'https://example.com/album', buttonText: 'Share Memories' },
      music:     MUSIC,
      customSections: []
    },

    'polaroid-heart': {
      title: 'Aaron & Juliana',
      cover: {
        enabled: true, headline: 'Celebrate with us our forever', tagline: 'Finally, forever.', eventLabel: '',
        names: 'Aaron & Juliana', greeting: 'Dear',
        image: '/assets/polaroid-heart/celebrate-couple.jpg', video: '', buttonText: '',
        collage: Array.from({ length: 18 }, (_, i) =>
          ({ url: `/assets/polaroid-heart/heart-${String(i + 1).padStart(2, '0')}.jpg`, caption: '' }))
      },
      countdown: { enabled: true, label: 'Counting down', date: EVENT_DATE, time: '11:00', tzOffset: new Date(2027, 5, 12, 11, 0).getTimezoneOffset(), description: '', image: '/assets/polaroid-heart/celebrate-hands.jpg' },
      families:  { enabled: false, label: '', title: '', items: FAMILIES },
      locations: { enabled: true, label: '', title: 'When and Where', image: '', items: [
        { label: 'Ceremony', time: '5:30 PM', name: 'Saint Elias Cathedral', addr: 'Beirut, Lebanon',    url: 'https://www.google.com/maps/search/?api=1&query=Beirut',    img: '/assets/polaroid-heart/place-ceremony.jpg' },
        { label: 'Venue',    time: '7:30 PM', name: 'Villa Rosa Gardens',    addr: 'Broummana, Lebanon', url: 'https://www.google.com/maps/search/?api=1&query=Broummana', img: '/assets/polaroid-heart/place-venue.jpg' }
      ] },
      timeline:  { enabled: false, label: '', title: '', items: [] },
      gallery:   { enabled: true, label: '', title: '', video: '',
        items: Array.from({ length: 9 }, (_, i) => ({ url: `/assets/polaroid-heart/mosaic-${i + 1}.jpg`, caption: '' })) },
      gifts: {
        enabled: true, label: '', title: 'Send the Newlyweds a Whish', description: '',
        image: '/assets/polaroid-heart/gift-1.jpg', image2: '/assets/polaroid-heart/gift-2.jpg',
        items: [{ bank: 'Whish Account Number', account: '123456' }]
      },
      rsvp: Object.assign({}, RSVP, { label: '', title: 'Will you be there for the “I do”?', question: '', description: '', buttonText: 'RSVP' }),
      // Disabled until photo sharing is implemented — see the note on the Elegant Noir demo above.
      memories:  { enabled: false, title: 'Share Your Memories', description: 'Upload your photos from the day so we can relive it through your eyes.', url: 'https://example.com/album', buttonText: 'Share Memories' },
      music:     MUSIC,
      customSections: []
    },

    'editorial-love-story': {
      title: 'Sofia & Adrian',
      cover: {
        enabled: true, headline: 'The Wedding Issue', eventLabel: '',
        names: 'Sofia & Adrian', tagline: 'A love story, in the making',
        greeting: 'Dear', hostIntro: 'With joy in our hearts,',
        hostText: 'request the pleasure of your company at the marriage of their children',
        hostOutro: 'Black tie optional',
        image: '/assets/editorial-love-story/cover.jpg', video: '', buttonText: ''
      },
      countdown: { enabled: true, label: 'Save the Date', date: EVENT_DATE, time: '18:00', tzOffset: new Date(2027, 5, 12, 18, 0).getTimezoneOffset(), description: 'Beirut, Lebanon', image: '/assets/editorial-love-story/countdown.jpg' },
      families:  { enabled: true, label: 'Together with their families', title: '', image: '/assets/editorial-love-story/invitation.jpg', items: FAMILIES },
      locations: { enabled: true, label: 'Where', title: 'The Celebration', image: '',
                   items: withImgs(LOCATIONS, ['/assets/editorial-love-story/ceremony.jpg', '/assets/editorial-love-story/reception.jpg']) },
      timeline:  { enabled: true, label: 'The Day', title: 'Order of the Day', items: TIMELINE },
      gallery:   { enabled: true, label: 'Portfolio', title: 'Moments', items: photos('editorial-love-story', [
        ['gallery-1.jpg', 'By the sea'], ['gallery-2.jpg', 'Where it began'], ['gallery-3.jpg', 'Confetti'], ['gallery-4.jpg', 'Forever']
      ]) },
      gifts:     Object.assign({}, GIFTS, { label: 'With Gratitude', image: '/assets/editorial-love-story/gifts.jpg' }),
      rsvp:      Object.assign({}, RSVP, {
        label: 'Répondez s’il vous plaît', title: 'Will you join us?', buttonText: 'Send Reply',
        description: 'Your answer means the world to us. Kindly let us know whether you can celebrate with us.',
        image: '/assets/editorial-love-story/rsvp.jpg'
      }),
      // Disabled until photo sharing is implemented — see the note on the Elegant Noir demo above.
      memories:  { enabled: false, title: 'Share Your Memories', description: 'Upload your photos from the day so we can relive it through your eyes.', url: 'https://example.com/album', buttonText: 'Share Memories' },
      music:     MUSIC,
      customSections: []
    },

    // ── BIRTHDAY ────────────────────────────────────────────────────────────────
    'rocket-party': {
      title: "Leo's 7th Birthday",
      cover: {
        enabled: true, headline: "Leo's 7th Birthday", eventLabel: '7', names: 'Leo',
        tagline: 'Three, two, one… blast off to a party that is out of this world!',
        greeting: 'Hey', hostText: 'Rana & Karim Haddad', hostOutro: 'Space costumes very welcome!',
        image: '', video: '', buttonText: 'Blast off'
      },
      countdown: { enabled: true, label: 'T-minus', date: '2027-03-20', time: '16:00', tzOffset: new Date(2027, 2, 20, 16, 0).getTimezoneOffset(), description: '', image: '' },
      families:  { enabled: true, label: 'Mission control', title: '', items: [] },
      locations: { enabled: true, label: 'Launch pad', title: 'Where we land', image: '', items: [
        { label: 'The party', time: '4:00 – 7:00 PM', name: 'Galaxy Play Hall', addr: 'Rue Gouraud, Gemmayzeh, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Gemmayzeh', img: '' }
      ] },
      timeline:  { enabled: true, label: 'Mission log', title: 'The plan', items: [
        { time: '4:00 PM', title: 'Astronauts arrive', subtitle: 'Helmets and snacks at the door' },
        { time: '4:30 PM', title: 'Space games', subtitle: 'Moon-bounce and treasure hunt' },
        { time: '5:30 PM', title: 'Magic show', subtitle: 'The Great Cosmo' },
        { time: '6:15 PM', title: 'Cake & candles', subtitle: 'Make a wish!' }
      ] },
      gallery:   { enabled: false, label: 'Crew photos', title: '', items: [] },
      gifts:     { enabled: false, label: 'Cargo hold', title: 'Gift ideas', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'Boarding pass', title: 'Are you coming aboard?', buttonText: 'Confirm my seat',
        description: 'Let us know by 10 March so we save a seat on the rocket.', deadline: '2027-03-10',
        acceptMessage: 'Your seat is saved. See you on launch day!', declineMessage: "We'll miss you on board. Thanks for letting us know!",
        contactName: 'Rana (Leo\'s mum)', contactPhone: '+961 71 234 567', contactLink: ''
      }),
      memories: { enabled: false }, music: MUSIC, customSections: []
    },

    'fairy-garden': {
      title: "Mila's 5th Birthday",
      cover: {
        enabled: true, headline: "Mila's 5th Birthday Tea Party", eventLabel: '5', names: 'Mila',
        tagline: 'Join us for tea, cake and a sprinkle of fairy magic in the garden.',
        greeting: 'Dear', hostText: 'Maya & Elie Nassar', hostOutro: 'Fairy wings and party dresses welcome!',
        image: '', video: '', buttonText: 'RSVP'
      },
      countdown: { enabled: true, label: 'Counting the sleeps', date: '2027-04-17', time: '15:00', tzOffset: new Date(2027, 3, 17, 15, 0).getTimezoneOffset(), description: '', image: '' },
      families:  { enabled: true, label: 'Hosted with love by', title: '', items: [] },
      locations: { enabled: true, label: 'Where', title: 'Come find us', image: '', items: [
        { label: 'The garden party', time: '3:00 – 6:00 PM', name: 'The Secret Garden Café', addr: 'Main Road, Broummana', url: 'https://www.google.com/maps/search/?api=1&query=Broummana', img: '' }
      ] },
      timeline:  { enabled: true, label: 'Party plan', title: 'A magical afternoon', items: [
        { time: '3:00 PM', title: 'Welcome & fairy crafts', subtitle: 'Make your own flower crown' },
        { time: '3:45 PM', title: 'Garden games', subtitle: 'Treasure hunt among the roses' },
        { time: '4:30 PM', title: 'Tea & sweets', subtitle: 'Cupcakes, lemonade and little sandwiches' },
        { time: '5:15 PM', title: 'Cake & candles', subtitle: 'Make a wish, Mila!' }
      ] },
      gallery:   { enabled: false, label: 'Our little flower', title: '', items: [] },
      gifts:     { enabled: false, label: 'Wish list', title: 'Birthday wishes', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'Admit one', title: 'Will you join the tea party?', buttonText: 'Send my reply',
        description: 'Please let us know by 5 April so we can set a place for you at the table.', deadline: '2027-04-05',
        acceptMessage: 'Yay! A cup of tea is waiting for you.', declineMessage: 'We will miss you at the tea party. Thank you for letting us know.',
        contactName: 'Maya (Mila\'s mum)', contactPhone: '+961 70 111 222', contactLink: ''
      }),
      memories: { enabled: false }, music: MUSIC, customSections: []
    },

    'hype-night': {
      title: 'Karim Turns 16',
      cover: {
        enabled: true, headline: 'Karim Turns 16', eventLabel: '16', names: 'Karim',
        tagline: 'One night. Loud music. Zero excuses.', greeting: 'Yo',
        hostText: '', hostOutro: '', image: '', video: '', buttonText: 'Get on the list'
      },
      countdown: { enabled: true, label: 'Kick-off in', date: '2027-05-22', time: '20:00', tzOffset: new Date(2027, 4, 22, 20, 0).getTimezoneOffset(), description: '', image: '' },
      families:  { enabled: false, label: 'Hosted by', title: '', items: [] },
      locations: { enabled: true, label: 'The spot', title: 'Where it goes down', image: '', items: [
        { label: 'Party', time: '8 PM – late', name: 'The Warehouse', addr: 'Armenia Street, Mar Mikhael, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Mar+Mikhael', img: '' }
      ] },
      timeline:  { enabled: true, label: 'The lineup', title: 'How the night runs', items: [
        { time: '8:00', title: 'Doors open', subtitle: 'Welcome drinks at the bar' },
        { time: '8:30', title: 'Gaming zone', subtitle: 'FIFA tournament, winner takes the trophy' },
        { time: '9:30', title: 'Food drop', subtitle: 'Burgers, pizza and fries' },
        { time: '10:30', title: 'Cake', subtitle: 'Then the DJ takes over' }
      ] },
      gallery:   { enabled: false, label: 'Throwbacks', title: '', items: [] },
      gifts:     { enabled: false, label: 'Gifts', title: 'If you want to', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'Guest list', title: 'Get on the list', buttonText: 'Lock it in', maxPeople: 2,
        description: 'Spots are limited. Tell us by 15 May if you are coming.', deadline: '2027-05-15',
        acceptMessage: 'See you on the 22nd. Bring the energy.', declineMessage: 'All good, next time. Thanks for letting us know.',
        contactName: 'Karim', contactPhone: '+961 76 555 010', contactLink: '@karim.turns16'
      }),
      memories: { enabled: false }, music: MUSIC,
      customSections: [
        { enabled: true, label: 'Dress code', title: 'All black', body: 'Plus one neon piece. Sneakers, obviously.' }
      ]
    },

    'lilac-glow': {
      title: "Lana's Sweet Sixteen",
      cover: {
        enabled: true, headline: "Lana's Sweet Sixteen", eventLabel: '16', names: 'Lana',
        tagline: 'Good music, great people and a little bit of glitter.', greeting: 'Hey',
        hostText: '', hostOutro: '', image: '', video: '', buttonText: 'RSVP'
      },
      countdown: { enabled: true, label: 'The countdown is on', date: '2027-06-26', time: '19:00', tzOffset: new Date(2027, 5, 26, 19, 0).getTimezoneOffset(), description: '', image: '' },
      families:  { enabled: false, label: 'Hosted by', title: '', items: [] },
      locations: { enabled: true, label: 'Location', title: 'Where to find us', image: '', items: [
        { label: 'Rooftop party', time: '7 PM – midnight', name: 'Cloud Nine Rooftop', addr: 'Sursock Street, Achrafieh, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Achrafieh', img: '' }
      ] },
      timeline:  { enabled: true, label: 'The plan', title: 'How the night goes', items: [
        { time: '7:00 PM', title: 'Welcome mocktails', subtitle: 'Sunset on the rooftop' },
        { time: '7:45 PM', title: 'Photo booth', subtitle: 'Props, polaroids and a glitter wall' },
        { time: '8:30 PM', title: 'Dinner', subtitle: 'Mezze and sliders' },
        { time: '9:30 PM', title: 'Cake & dancing', subtitle: 'Until midnight' }
      ] },
      gallery:   { enabled: false, label: 'Moments', title: '', items: [] },
      gifts:     { enabled: false, label: 'Gifts', title: 'Wish list', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'RSVP', title: 'Will you be there?', buttonText: 'Send my RSVP', maxPeople: 2,
        description: 'Let me know by June 15 so I can save your spot.', deadline: '2027-06-15',
        acceptMessage: "Can't wait to see you on the 26th!", declineMessage: "You'll be missed. Thank you for letting me know.",
        contactName: 'Lana', contactPhone: '+961 71 808 116', contactLink: '@lana.sixteen'
      }),
      memories: { enabled: false }, music: MUSIC,
      customSections: [
        { enabled: true, label: 'Dress code', title: 'Lilac, silver or all white', body: 'Something sparkly is always a yes.' }
      ]
    },

    'gilded-soiree': {
      title: "Emma's 30th Birthday",
      cover: {
        enabled: true, headline: "Emma's 30th Birthday", eventLabel: '30', names: 'Emma Khoury',
        tagline: 'Join us for an unforgettable celebration', greeting: 'Dear',
        hostIntro: 'You are cordially invited to celebrate', hostText: '', hostOutro: '',
        image: '/assets/gilded-soiree/toast.jpg', video: '', buttonText: 'Kindly respond'
      },
      countdown: { enabled: true, label: 'Until the evening', date: '2027-09-18', time: '19:30', tzOffset: new Date(2027, 8, 18, 19, 30).getTimezoneOffset(), description: 'Beirut', image: '' },
      families:  { enabled: false, label: 'Hosted by', title: '', items: [] },
      locations: { enabled: true, label: 'The evening', title: 'An evening to remember', image: '/assets/gilded-soiree/evening.jpg', items: [
        { label: 'Reception & dinner', time: '7:30 PM until late', name: 'The Grand Salon', addr: 'Phoenicia Hotel, Minet El Hosn, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Phoenicia+Hotel+Beirut', img: '' }
      ] },
      timeline:  { enabled: true, label: 'Programme', title: 'Order of the evening', items: [
        { time: '7:30 PM', title: 'Champagne reception', subtitle: 'On the terrace' },
        { time: '8:30 PM', title: 'Dinner is served', subtitle: 'A four-course menu' },
        { time: '10:00 PM', title: 'Toasts & cake', subtitle: '' },
        { time: '10:30 PM', title: 'Dancing', subtitle: 'Live band until late' }
      ] },
      gallery:   { enabled: false, label: 'Through the years', title: '', items: [] },
      gifts:     { enabled: false, label: 'With gratitude', title: 'Gifts', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'Kindly respond', title: 'The favour of a reply', buttonText: 'Send reply', maxPeople: 2,
        description: 'Kindly let us know whether you will be joining us.', deadline: '2027-09-01',
        acceptMessage: 'Thank you. We look forward to raising a glass with you.', declineMessage: 'Thank you for letting us know. You will be missed.',
        contactName: 'Karim Khoury', contactPhone: '+961 3 456 789', contactLink: ''
      }),
      memories: { enabled: false }, music: MUSIC,
      customSections: [
        { enabled: true, label: 'Attire', title: 'Black tie', body: 'Evening dress, dinner jackets and your finest sparkle.' }
      ]
    },

    // ── ENGAGEMENT ──────────────────────────────────────────────────────────────
    'rose-promise': {
      title: 'Sarah & Daniel',
      cover: {
        enabled: true, headline: 'invite you to celebrate their engagement', eventLabel: 'Together with their families',
        names: 'Sarah & Daniel', tagline: '', greeting: 'Dear', hostText: '', hostOutro: '',
        image: '/assets/rose-promise/cover.jpg', video: '', buttonText: 'Kindly reply'
      },
      countdown: { enabled: true, label: 'Counting down to forever', date: '2027-05-08', time: '19:00', tzOffset: new Date(2027, 4, 8, 19, 0).getTimezoneOffset(), description: 'Achrafieh, Beirut', image: '' },
      families:  { enabled: true, label: 'With the blessing of', title: '', items: [
        { label: 'Parents of the bride-to-be', names: 'Mr. & Mrs. Nabil Aoun' },
        { label: 'Parents of the groom-to-be', names: 'Mr. & Mrs. Fadi Saad' }
      ] },
      locations: { enabled: true, label: 'Where', title: 'The celebration', image: '', items: [
        { label: 'Engagement party', time: '7:00 PM', name: 'Villa Linda Sursock', addr: 'Sursock Street, Achrafieh, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Sursock+Street+Beirut', img: '/assets/rose-promise/venue.jpg' }
      ] },
      timeline:  { enabled: true, label: 'The evening', title: 'Our evening together', items: [
        { time: '7:00 PM', title: 'Welcome drinks', subtitle: 'In the rose garden' },
        { time: '7:45 PM', title: 'Ring blessing & toast', subtitle: '' },
        { time: '8:30 PM', title: 'Dinner', subtitle: 'Under the lanterns' },
        { time: '10:00 PM', title: 'Cake & dancing', subtitle: '' }
      ] },
      gallery:   { enabled: true, label: 'Moments', title: 'Us', items: [
        { url: '/assets/rose-promise/gallery-1.jpg', caption: '' }, { url: '/assets/rose-promise/rings.jpg', caption: '' }, { url: '/assets/rose-promise/gallery-2.jpg', caption: '' }
      ] },
      gifts:     { enabled: false, label: 'With love', title: 'Gifts', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'Kindly reply', title: 'Will you celebrate with us?', buttonText: 'Send reply',
        description: 'Your presence would make our evening complete.', deadline: '2027-04-20',
        acceptMessage: 'We are so happy you will be there. See you on the 8th of May.',
        declineMessage: 'Thank you for letting us know. You will be in our hearts.',
        contactName: 'Sarah Aoun', contactPhone: '+961 70 321 654', contactLink: ''
      }),
      memories: { enabled: false }, music: MUSIC,
      customSections: [
        { enabled: true, label: 'Our story', title: 'It began with a borrowed umbrella', body: 'A rainy evening in Gemmayzeh, one umbrella and two strangers who never stopped talking. Five years later, he asked the question — and she said yes.', image: '/assets/rose-promise/bouquet.jpg' }
      ]
    },

    'venn-union': {
      title: 'Nour & Karl',
      cover: {
        enabled: true, headline: 'are getting engaged', eventLabel: 'Engagement', names: 'Nour & Karl',
        tagline: 'Two stories. One shared chapter. Come and celebrate the beginning with us.', greeting: 'Dear',
        hostText: '', hostOutro: '', image: '/assets/venn-union/cover.jpg', video: '', buttonText: 'Reply to the invitation'
      },
      countdown: { enabled: true, label: 'The date', date: '2027-10-02', time: '20:00', tzOffset: new Date(2027, 9, 2, 20, 0).getTimezoneOffset(), description: 'Jisr El Wati, Beirut', image: '' },
      families:  { enabled: true, label: 'Families', title: 'With our families', items: [
        { label: 'Her family', names: 'The Khalil family' }, { label: 'His family', names: 'The Maalouf family' }
      ] },
      locations: { enabled: true, label: 'The place', title: 'The place', image: '', items: [
        { label: 'Engagement celebration', time: '8:00 PM until late', name: 'Station Beirut', addr: 'Jisr El Wati, Sin El Fil, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Station+Beirut', img: '/assets/venn-union/venue.jpg' }
      ] },
      timeline:  { enabled: true, label: 'The evening', title: 'The evening', items: [
        { time: '8:00', title: 'Arrival & drinks', subtitle: 'In the courtyard' },
        { time: '8:45', title: 'A few words', subtitle: 'From the people who know us best' },
        { time: '9:15', title: 'Dinner at the long table', subtitle: '' },
        { time: '10:30', title: 'Music', subtitle: 'Vinyl sets until late' }
      ] },
      gallery:   { enabled: true, label: 'Us', title: 'Us', items: [
        { url: '/assets/venn-union/hands.jpg', caption: '' }, { url: '/assets/venn-union/cover.jpg', caption: '' }
      ] },
      gifts:     { enabled: false, label: 'Gifts', title: 'Gifts', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'RSVP', title: 'Will you join us?', buttonText: 'Send reply', maxPeople: 2,
        description: 'We would love to have you there. Please let us know by the 15th of September.', deadline: '2027-09-15',
        acceptMessage: 'Wonderful. We will see you on the 2nd of October.', declineMessage: 'Thank you for letting us know. We will celebrate with you soon.',
        contactName: 'Nour Khalil', contactPhone: '+961 71 900 222', contactLink: '@nourandkarl'
      }),
      memories: { enabled: false }, music: MUSIC,
      customSections: [
        { enabled: true, label: 'A note', title: '', body: 'We met in a bookshop, arguing over the last copy of the same novel. We have been sharing everything since.' }
      ]
    },

    // ── BABY SHOWER ─────────────────────────────────────────────────────────────
    'little-cloud': {
      title: 'Baby Smith is Coming',
      cover: {
        enabled: true, headline: 'Baby Smith is coming', eventLabel: 'Baby Shower', names: 'Emily & James Smith',
        tagline: 'A little miracle is on the way', greeting: 'Dear',
        hostText: 'Grandma Rose & Aunt Clara', hostOutro: 'Soft colours and comfy shoes encouraged.',
        image: '', video: '', buttonText: 'RSVP'
      },
      countdown: { enabled: true, label: 'Counting down', date: '2027-04-10', time: '11:00', tzOffset: new Date(2027, 3, 10, 11, 0).getTimezoneOffset(), description: '', image: '' },
      families:  { enabled: true, label: 'Hosted with love by', title: '', items: [] },
      locations: { enabled: true, label: 'Where', title: 'Where to find us', image: '', items: [
        { label: 'Baby shower brunch', time: '11:00 AM – 2:00 PM', name: 'The Glasshouse', addr: 'Old Souk, Batroun', url: 'https://www.google.com/maps/search/?api=1&query=Batroun', img: '' }
      ] },
      timeline:  { enabled: true, label: 'The plan', title: 'A sweet afternoon', items: [
        { time: '11:00 AM', title: 'Welcome & mocktails', subtitle: 'Lemonade and fresh juices' },
        { time: '11:30 AM', title: 'Brunch', subtitle: 'Pastries, fruit and savoury bites' },
        { time: '12:30 PM', title: 'Games', subtitle: 'Guess the date, guess the weight' },
        { time: '1:30 PM', title: 'Opening gifts', subtitle: '' }
      ] },
      gallery:   { enabled: false, label: 'Waiting for you', title: '', items: [] },
      gifts:     { enabled: false, label: 'Registry', title: 'Gift registry', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'RSVP', title: 'Will you join us?', buttonText: 'Send RSVP', maxPeople: 3,
        description: 'Please let us know by the 1st of April.', deadline: '2027-04-01',
        acceptMessage: 'Thank you! We can’t wait to celebrate with you.', declineMessage: 'Thank you for letting us know. We will miss you!',
        contactName: 'Clara Smith', contactPhone: '+961 71 222 333', contactLink: ''
      }),
      memories: { enabled: false }, music: MUSIC,
      customSections: [
        { enabled: true, label: 'A little request', title: 'Bring a book, not a card', body: 'Write a note inside your favourite children’s book to start the baby’s library.' }
      ]
    },

    'paper-shapes': {
      title: 'Oh, baby!',
      cover: {
        enabled: true, headline: 'Oh, baby!', eventLabel: 'Baby', names: 'Maya & Rami',
        tagline: 'Something small is about to change everything.', greeting: 'Dear',
        hostText: 'The Nader sisters', hostOutro: '', image: '', video: '', buttonText: 'Reply'
      },
      countdown: { enabled: true, label: 'Almost here', date: '2027-06-05', time: '16:00', tzOffset: new Date(2027, 5, 5, 16, 0).getTimezoneOffset(), description: 'Mar Mikhael, Beirut', image: '' },
      families:  { enabled: true, label: 'Hosted by', title: '', items: [] },
      locations: { enabled: true, label: 'When & where', title: 'When & where', image: '', items: [
        { label: 'Garden baby shower', time: '4:00 – 7:00 PM', name: 'Dar Mimosa Garden', addr: 'Pharaon Street, Mar Mikhael, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Mar+Mikhael', img: '' }
      ] },
      timeline:  { enabled: true, label: 'The afternoon', title: 'What’s happening', items: [
        { time: '4:00 PM', title: 'Lemonade & hellos', subtitle: 'Under the big tree' },
        { time: '4:30 PM', title: 'Decorate a onesie', subtitle: 'Paint, stamps and glitter' },
        { time: '5:15 PM', title: 'Cake & sweets', subtitle: '' },
        { time: '6:00 PM', title: 'Wishes for baby', subtitle: 'Leave a note in the wish jar' }
      ] },
      gallery:   { enabled: false, label: 'Snapshots', title: '', items: [] },
      gifts:     { enabled: false, label: 'Registry', title: 'Little wishes', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'RSVP', title: 'Will you be there?', buttonText: 'Send my reply', maxPeople: 3,
        description: 'Tell us by the 25th of May so we have enough cake.', deadline: '2027-05-25',
        acceptMessage: 'Hooray! See you on the 5th of June.', declineMessage: 'We will miss you. Thank you for letting us know.',
        contactName: 'Lara Nader', contactPhone: '+961 76 444 120', contactLink: '@oh.baby.nader'
      }),
      memories: { enabled: false }, music: MUSIC,
      customSections: [
        { enabled: true, label: 'Dress code', title: 'Wear a colour', body: 'Any colour. The brighter, the better.' }
      ]
    },

    // ── GRADUATION ──────────────────────────────────────────────────────────────
    'laurel-honors': {
      title: 'Congratulations, Alex!',
      cover: {
        enabled: true, headline: 'Congratulations', eventLabel: 'Class of 2026', names: 'Alex Morgan',
        tagline: 'Please join us in celebrating this milestone', greeting: 'Dear',
        hostIntro: 'is graduating with a', hostText: 'Bachelor of Architecture\nAmerican University of Beirut', hostOutro: '',
        image: '', video: '', buttonText: 'Kindly reply'
      },
      countdown: { enabled: true, label: 'Commencement', date: '2026-11-21', time: '17:00', tzOffset: new Date(2026, 10, 21, 17, 0).getTimezoneOffset(), description: 'Beirut', image: '' },
      families:  { enabled: true, label: 'With pride', title: '', items: [ { label: '', names: 'Mr. & Mrs. David Morgan' } ] },
      locations: { enabled: true, label: 'Venues', title: 'Ceremony & celebration', image: '', items: [
        { label: 'Graduation ceremony', time: '5:00 PM', name: 'Assembly Hall', addr: 'American University of Beirut, Hamra', url: 'https://www.google.com/maps/search/?api=1&query=Assembly+Hall+AUB', img: '' },
        { label: 'Reception', time: '7:30 PM', name: 'The Cedar Terrace', addr: 'Hamra Street, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Hamra+Street+Beirut', img: '' }
      ] },
      timeline:  { enabled: true, label: 'Programme', title: 'Order of proceedings', items: [
        { time: '5:00 PM', title: 'Academic procession', subtitle: '' },
        { time: '5:30 PM', title: 'Conferring of degrees', subtitle: 'Faculty of Engineering & Architecture' },
        { time: '7:30 PM', title: 'Reception', subtitle: 'The Cedar Terrace' },
        { time: '8:30 PM', title: 'Dinner & toasts', subtitle: '' }
      ] },
      gallery:   { enabled: false, label: 'Portraits', title: '', items: [] },
      gifts:     { enabled: false, label: 'Gifts', title: 'With gratitude', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'Reply', title: 'The favour of your reply', buttonText: 'Send reply', maxPeople: 3,
        description: 'Kindly let us know whether you will join us for the ceremony and reception.', deadline: '2026-11-07',
        acceptMessage: 'Thank you. We look forward to celebrating Alex with you.', declineMessage: 'Thank you for letting us know.',
        contactName: 'Helen Morgan', contactPhone: '+961 3 118 225', contactLink: ''
      }),
      memories: { enabled: false }, music: MUSIC, customSections: []
    },

    'cap-toss': {
      title: 'Congrats, Maya!',
      cover: {
        enabled: true, headline: 'Congrats, Maya!', eventLabel: 'Class of 2026', names: 'Maya Haddad',
        tagline: 'Come celebrate the big finish — and the next big start.', greeting: 'Hey',
        hostIntro: 'Just graduated:', hostText: 'BA Graphic Design · Lebanese American University', hostOutro: '',
        image: '', video: '', buttonText: "I'm coming"
      },
      countdown: { enabled: true, label: 'Party starts in', date: '2026-12-12', time: '18:00', tzOffset: new Date(2026, 11, 12, 18, 0).getTimezoneOffset(), description: 'Badaro, Beirut', image: '' },
      families:  { enabled: false, label: 'Big thanks to', title: '', items: [] },
      locations: { enabled: true, label: 'Where', title: 'Where to celebrate', image: '', items: [
        { label: 'Grad party', time: '6 PM – late', name: 'Rooftop 33', addr: 'Badaro Street, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Badaro+Beirut', img: '' }
      ] },
      timeline:  { enabled: true, label: 'The plan', title: 'How it goes', items: [
        { time: '6:00', title: 'Doors & drinks', subtitle: 'Grab a cap at the door' },
        { time: '6:30', title: 'Speeches', subtitle: 'Short ones, we promise' },
        { time: '7:00', title: 'Food trucks', subtitle: 'Burgers, tacos and crêpes' },
        { time: '8:00', title: 'DJ & the big cap toss', subtitle: '' }
      ] },
      gallery:   { enabled: false, label: 'Yearbook', title: '', items: [] },
      gifts:     { enabled: false, label: 'Gifts', title: 'Grad fund', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'RSVP', title: 'You coming?', buttonText: 'Send it', maxPeople: 3,
        description: 'Let me know by December 1st so there is enough food for everyone.', deadline: '2026-12-01',
        acceptMessage: 'Yesss! See you on the 12th.', declineMessage: 'No worries — thanks for letting me know!',
        contactName: 'Maya', contactPhone: '+961 70 626 026', contactLink: '@maya.grad'
      }),
      memories: { enabled: false }, music: MUSIC,
      customSections: [
        { enabled: true, label: 'Dress code', title: 'Wear your school colours', body: 'Bonus points for your old uniform.' }
      ]
    },

    // ── WEDDING (second set) ─────────────────────────────────────────────────
    'emerald-vows': {
      title: 'Isabella & Nicolas',
      cover: {
        enabled: true, headline: 'are getting married', eventLabel: 'Together with their families', names: 'Isabella & Nicolas',
        tagline: '', greeting: 'Dear', hostIntro: 'Together with their families',
        hostText: 'request the honour of your presence at the celebration of their marriage', hostOutro: 'Dinner and dancing to follow',
        image: '/assets/emerald-vows/hero.jpg', video: '', buttonText: 'Kindly reply'
      },
      countdown: { enabled: true, label: 'Until we say I do', date: '2027-09-25', time: '17:00', tzOffset: new Date(2027, 8, 25, 17, 0).getTimezoneOffset(), description: 'Beirut', image: '' },
      families:  { enabled: true, label: 'With the blessing of', title: '', items: [
        { label: 'Parents of the bride', names: 'Mr. & Mrs. Fouad Nassar' },
        { label: 'Parents of the groom', names: 'Mr. & Mrs. Elie Chalhoub' }
      ] },
      locations: { enabled: true, label: 'The day', title: 'Ceremony & celebration', image: '', items: [
        { label: 'The ceremony', time: '5:00 PM', name: 'Saint Nicolas Cathedral', addr: 'Achrafieh, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Saint+Nicolas+Cathedral+Beirut', img: '/assets/emerald-vows/church.jpg' },
        { label: 'The reception', time: '7:30 PM', name: 'Domaine des Cèdres', addr: 'Bhamdoun, Mount Lebanon', url: 'https://www.google.com/maps/search/?api=1&query=Bhamdoun', img: '/assets/emerald-vows/reception.jpg' }
      ] },
      timeline:  { enabled: true, label: 'Order of the day', title: 'How the day unfolds', items: [
        { time: '5:00 PM', title: 'The ceremony', subtitle: 'Saint Nicolas Cathedral' },
        { time: '6:30 PM', title: 'Garden reception', subtitle: 'Champagne on the terrace' },
        { time: '8:00 PM', title: 'Dinner', subtitle: 'Under the cedars' },
        { time: '10:00 PM', title: 'First dance & cake', subtitle: '' },
        { time: '11:00 PM', title: 'Dancing until late', subtitle: '' }
      ] },
      gallery:   { enabled: true, label: 'Our story', title: 'Moments', items: [
        { url: '/assets/emerald-vows/gallery-1.jpg', caption: '' }, { url: '/assets/emerald-vows/gallery-2.jpg', caption: '' }, { url: '/assets/emerald-vows/gallery-3.jpg', caption: '' }
      ] },
      gifts:     Object.assign({}, GIFTS, { image: '' }),
      rsvp: Object.assign({}, RSVP, {
        label: 'Kindly reply', title: 'Will you join us?', buttonText: 'Send reply', image: '/assets/emerald-vows/rsvp.jpg',
        description: 'We would be honoured to have you with us.', deadline: '2027-08-25',
        acceptMessage: 'Thank you. We look forward to celebrating with you on the 25th of September.',
        declineMessage: 'Thank you for letting us know. You will be dearly missed.',
        contactName: 'Isabella Nassar', contactPhone: '+961 3 555 010', contactLink: ''
      }),
      memories: { enabled: true, title: 'Share your memories', description: 'Upload your photos of the day so we can relive it with you.', url: 'https://example.com/album', buttonText: 'Share photos' },
      music: MUSIC, customSections: []
    },

    'atelier': {
      title: 'Léa & Marc',
      cover: {
        enabled: true, headline: 'The wedding of', eventLabel: '', names: 'Léa & Marc',
        tagline: 'Join us as we begin our life together — one evening, one long table, everyone we love.', greeting: 'Dear',
        hostIntro: 'With their families', hostText: '', hostOutro: 'Dinner and dancing to follow. Dress: black, white or both.',
        image: '/assets/atelier/cover.jpg', video: '', buttonText: 'Reply'
      },
      countdown: { enabled: true, label: 'The date', date: '2027-10-16', time: '16:00', tzOffset: new Date(2027, 9, 16, 16, 0).getTimezoneOffset(), description: 'Beirut, Lebanon', image: '/assets/atelier/beach.jpg' },
      families:  { enabled: true, label: 'With their families', title: '', items: [
        { label: 'Her parents', names: 'Nadine & Samir Abou Jaoude' }, { label: 'His parents', names: 'Carla & Roger Sfeir' }
      ] },
      locations: { enabled: true, label: 'The places', title: 'Where', image: '/assets/atelier/aisle.jpg', items: [
        { label: 'Ceremony', time: '4:00 PM', name: 'Saint George Cathedral', addr: 'Downtown, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Saint+George+Cathedral+Beirut', img: '' },
        { label: 'Reception', time: '7:00 PM', name: 'The Hangar', addr: 'Karantina, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Karantina+Beirut', img: '/assets/atelier/table.jpg' }
      ] },
      timeline:  { enabled: true, label: 'The day', title: 'The day', items: [
        { time: '16:00', title: 'Ceremony', subtitle: 'Saint George Cathedral' },
        { time: '17:30', title: 'Portraits & drinks', subtitle: 'Cathedral steps' },
        { time: '19:00', title: 'The long table', subtitle: 'Dinner at The Hangar' },
        { time: '22:00', title: 'Dancing', subtitle: 'Until the lights come on' }
      ] },
      gallery:   { enabled: true, label: 'Us', title: 'Us', items: [
        { url: '/assets/atelier/hands.jpg', caption: '' }, { url: '/assets/atelier/portrait.jpg', caption: '' }, { url: '/assets/atelier/sunset.jpg', caption: '' }
      ] },
      gifts:     Object.assign({}, GIFTS, { label: 'Gifts', title: 'Gifts', image: '', description: 'Having you there is the gift. If you would like to give something, a contribution to our first home is below.' }),
      rsvp: Object.assign({}, RSVP, {
        label: 'RSVP', title: 'Will you be there?', buttonText: 'Send reply', maxPeople: 2, image: '/assets/atelier/veil.jpg',
        description: 'Please reply by the 20th of September so we can set the table.', deadline: '2027-09-20',
        acceptMessage: 'Wonderful. See you on the 16th of October.', declineMessage: 'Thank you for letting us know. We will miss you.',
        contactName: 'Léa Abou Jaoude', contactPhone: '+961 3 777 118', contactLink: '@lea.and.marc'
      }),
      memories: { enabled: true, title: 'Share your photos', description: 'Everything you shoot on the night, in one shared album.', url: 'https://example.com/album', buttonText: 'Open the album' },
      music: MUSIC, customSections: []
    },

    // ── BIRTHDAY (second set) ────────────────────────────────────────────────
    'arcade': {
      title: "Adam's 9th Birthday",
      cover: {
        enabled: true, headline: "Adam's 9th birthday", eventLabel: '9', names: 'Adam',
        tagline: 'Insert coin for an afternoon of arcade games, pizza and cake!', greeting: 'Hey',
        hostText: '', hostOutro: '', image: '', video: '', buttonText: 'Press start'
      },
      countdown: { enabled: true, label: 'High score', date: '2027-07-10', time: '15:00', tzOffset: new Date(2027, 6, 10, 15, 0).getTimezoneOffset(), description: '', image: '' },
      families:  { enabled: false, label: 'Player 2', title: '', items: [] },
      locations: { enabled: true, label: 'Stage select', title: 'Where we play', image: '', items: [
        { label: 'The party', time: '3 PM – 6 PM', name: 'Pixel Play Arena', addr: 'Le Mall, Dbayeh', url: 'https://www.google.com/maps/search/?api=1&query=Dbayeh', img: '' }
      ] },
      timeline:  { enabled: true, label: 'Levels', title: 'How the game goes', items: [
        { time: '3:00 PM', title: 'Players arrive', subtitle: 'Grab your tokens at the door' },
        { time: '3:15 PM', title: 'Free play', subtitle: 'Racing, air hockey and the claw machine' },
        { time: '4:30 PM', title: 'Pizza break', subtitle: '' },
        { time: '5:15 PM', title: 'Cake & the final boss', subtitle: 'Piñata time' }
      ] },
      gallery:   { enabled: false, label: 'Gallery', title: '', items: [] },
      gifts:     { enabled: false, label: 'Power-ups', title: 'Gift ideas', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'Insert coin', title: 'Are you playing?', buttonText: 'Start', maxPeople: 3,
        description: 'Tell us by July 1st so we can save enough tokens.', deadline: '2027-07-01',
        acceptMessage: "You're on the leaderboard! See you on the 10th.", declineMessage: 'Game over for this round. Thanks for letting us know!',
        contactName: "Nadia (Adam's mum)", contactPhone: '+961 3 202 909', contactLink: ''
      }),
      memories: { enabled: false }, music: MUSIC,
      customSections: [
        { enabled: true, label: 'Dress code', title: 'Come as your favourite game character', body: 'Costumes optional, high scores mandatory.' }
      ]
    },

    'velvet-hour': {
      title: "Rami's 50th",
      cover: {
        enabled: true, headline: 'An evening to celebrate', eventLabel: '50', names: 'Rami Haddad',
        tagline: 'Good food, low light and the people who matter most. Come and celebrate half a century with us.', greeting: 'Dear',
        hostIntro: 'You are invited to', hostText: '', hostOutro: 'Cocktail attire · a touch of velvet welcome',
        image: '/assets/velvet-hour/candles.jpg', video: '', buttonText: 'Reserve your seat'
      },
      countdown: { enabled: true, label: 'Until we raise a glass', date: '2027-11-06', time: '20:00', tzOffset: new Date(2027, 10, 6, 20, 0).getTimezoneOffset(), description: 'Beirut', image: '' },
      families:  { enabled: true, label: 'Hosted by', title: '', items: [ { label: '', names: 'Dana, Karim & Lynn Haddad' } ] },
      locations: { enabled: true, label: 'The table', title: 'Where we gather', image: '', items: [
        { label: 'Dinner', time: '8:00 PM until late', name: 'Liza Beirut', addr: 'Metropolitan Club, Achrafieh, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Liza+Beirut', img: '/assets/velvet-hour/table.jpg' }
      ] },
      timeline:  { enabled: true, label: 'The evening', title: 'How the night unfolds', items: [
        { time: '8:00 PM', title: 'Aperitivo', subtitle: 'Negronis on the terrace' },
        { time: '9:00 PM', title: 'Dinner is served', subtitle: 'A long table, family style' },
        { time: '10:30 PM', title: 'A few words & the cake', subtitle: '' },
        { time: '11:00 PM', title: 'Records and dancing', subtitle: 'Until the candles burn down' }
      ] },
      gallery:   { enabled: false, label: 'Through the years', title: '', items: [] },
      gifts:     { enabled: true, label: 'Gifts', title: 'No gifts, please', description: 'Your company is more than enough. If you insist, a bottle of something old is always welcome.', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'Reservation', title: 'Will you join the table?', buttonText: 'Confirm reservation', maxPeople: 2,
        description: 'Seats are limited to close friends and family. Kindly reply by the 20th of October.', deadline: '2027-10-20',
        acceptMessage: 'Your seat is reserved. See you on the 6th of November.', declineMessage: 'Thank you for letting us know. You will be missed at the table.',
        contactName: 'Dana Haddad', contactPhone: '+961 3 640 118', contactLink: ''
      }),
      memories: { enabled: false }, music: MUSIC, customSections: []
    },

    // ── ENGAGEMENT (second set) ──────────────────────────────────────────────
    'amalfi': {
      title: 'Yasmine & Omar',
      cover: {
        enabled: true, headline: 'are engaged', eventLabel: 'Save the date', names: 'Yasmine & Omar',
        tagline: 'Join us for an evening by the sea to celebrate our engagement — lemons, long tables and a sunset.', greeting: 'Dear',
        hostText: '', hostOutro: '', image: '/assets/amalfi/sea.jpg', video: '', buttonText: 'Reply'
      },
      countdown: { enabled: true, label: 'Counting down', date: '2027-06-19', time: '18:30', tzOffset: new Date(2027, 5, 19, 18, 30).getTimezoneOffset(), description: 'Jounieh Bay', image: '' },
      families:  { enabled: true, label: 'With the blessing of', title: '', items: [
        { label: 'Her parents', names: 'Rima & Walid Saab' }, { label: 'His parents', names: 'Hala & Nabil Rizk' }
      ] },
      locations: { enabled: true, label: 'Where', title: 'By the water', image: '', items: [
        { label: 'Engagement party', time: '6:30 PM – midnight', name: 'Bay Lodge Terrace', addr: 'Coastal Road, Jounieh', url: 'https://www.google.com/maps/search/?api=1&query=Jounieh', img: '/assets/amalfi/venue.jpg' }
      ] },
      timeline:  { enabled: true, label: 'The evening', title: 'How the evening goes', items: [
        { time: '6:30 PM', title: 'Limoncello & spritz', subtitle: 'On the terrace at golden hour' },
        { time: '7:30 PM', title: 'The ring', subtitle: 'A blessing and a toast' },
        { time: '8:30 PM', title: 'Dinner al fresco', subtitle: 'Long tables by the water' },
        { time: '10:30 PM', title: 'Dancing under the lanterns', subtitle: '' }
      ] },
      gallery:   { enabled: true, label: 'Us', title: 'A few snapshots', items: [
        { url: '/assets/amalfi/gallery-1.jpg', caption: '' }, { url: '/assets/amalfi/gallery-2.jpg', caption: '' }, { url: '/assets/amalfi/gallery-3.jpg', caption: '' }
      ] },
      gifts:     { enabled: false, label: 'Gifts', title: 'Gifts', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'Write back', title: 'Will you join us?', buttonText: 'Send the postcard', maxPeople: 4,
        description: 'Send your postcard back by the 1st of June.', deadline: '2027-06-01',
        acceptMessage: 'Evviva! We will see you by the sea on the 19th of June.', declineMessage: 'Thank you for letting us know. We will raise a glass to you.',
        contactName: 'Yasmine Saab', contactPhone: '+961 70 118 442', contactLink: '@yasmine.and.omar'
      }),
      memories: { enabled: false }, music: MUSIC,
      customSections: [
        { enabled: true, label: 'Our story', title: 'It started with a lemonade', body: 'A summer afternoon in Batroun, one lemonade stand and two people who kept coming back for more. Three summers later, he asked. She said yes before he finished the question.' }
      ]
    },

    'ink-bloom': {
      title: 'Aya & Tarek',
      cover: {
        enabled: true, headline: 'are getting engaged', eventLabel: 'Engagement', names: 'Aya & Tarek',
        tagline: 'Two names, one story. Come and watch it begin — quietly, with the people we love most.', greeting: 'Dear',
        hostText: '', hostOutro: '', image: '/assets/ink-bloom/veil.jpg', video: '', buttonText: 'Reply'
      },
      countdown: { enabled: true, label: 'Until then', date: '2027-03-13', time: '19:00', tzOffset: new Date(2027, 2, 13, 19, 0).getTimezoneOffset(), description: 'Beirut', image: '' },
      families:  { enabled: true, label: 'With our families', title: '', items: [
        { label: 'Her family', names: 'The Khoury family' }, { label: 'His family', names: 'The Mansour family' }
      ] },
      locations: { enabled: true, label: 'The place', title: 'Where', image: '', items: [
        { label: 'Engagement evening', time: '7:00 PM', name: 'Beit Beirut', addr: 'Sodeco, Damascus Road, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Beit+Beirut', img: '/assets/ink-bloom/venue.jpg' }
      ] },
      timeline:  { enabled: true, label: 'The order', title: 'The evening', items: [
        { time: '19:00', title: 'Arrival', subtitle: 'Tea, arak and the first hellos' },
        { time: '19:45', title: 'The rings', subtitle: 'A short blessing' },
        { time: '20:30', title: 'Dinner', subtitle: 'One long table in the courtyard' },
        { time: '22:00', title: 'Oud and dancing', subtitle: '' }
      ] },
      gallery:   { enabled: true, label: 'Fragments', title: 'Us, so far', items: [
        { url: '/assets/ink-bloom/hands.jpg', caption: '' }, { url: '/assets/ink-bloom/rings.jpg', caption: '' }, { url: '/assets/ink-bloom/veil.jpg', caption: '' }
      ] },
      gifts:     { enabled: false, label: 'Gifts', title: 'Gifts', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'Your reply', title: 'Will you be with us?', buttonText: 'Send reply', maxPeople: 2,
        description: 'It will be a small evening. Please let us know by the 1st of March.', deadline: '2027-03-01',
        acceptMessage: 'Thank you. We will see you on the 13th of March.', declineMessage: 'Thank you for telling us. You will be missed.',
        contactName: 'Aya Khoury', contactPhone: '+961 71 356 210', contactLink: ''
      }),
      memories: { enabled: false }, music: MUSIC,
      customSections: [
        { enabled: true, label: 'A note', title: 'No gifts, please', body: 'Your presence is the only thing we are asking for. If you would like to bring something, bring a story about one of us.' }
      ]
    },

    // ── BABY SHOWER (second set) ─────────────────────────────────────────────
    'little-honey': {
      title: 'A little honey is on the way',
      cover: {
        enabled: true, headline: 'A little honey is on the way', eventLabel: 'Baby Shower', names: 'Lina & Joe Karam',
        tagline: 'Join us for a sweet afternoon to celebrate baby Karam', greeting: 'Dear',
        hostText: 'Maya & Rana', hostOutro: 'Comfy shoes and a big appetite, please.', image: '', video: '', buttonText: 'RSVP'
      },
      countdown: { enabled: true, label: 'Counting down', date: '2027-05-15', time: '11:30', tzOffset: new Date(2027, 4, 15, 11, 30).getTimezoneOffset(), description: '', image: '' },
      families:  { enabled: true, label: 'Hosted with love by', title: '', items: [] },
      locations: { enabled: true, label: 'Where', title: 'Where to find the hive', image: '', items: [
        { label: 'Garden brunch', time: '11:30 AM – 3:00 PM', name: 'The Orchard House', addr: 'Broummana, Mount Lebanon', url: 'https://www.google.com/maps/search/?api=1&query=Broummana', img: '' }
      ] },
      timeline:  { enabled: true, label: 'The plan', title: 'A sweet afternoon', items: [
        { time: '11:30 AM', title: 'Honey lemonade & hellos', subtitle: 'Under the apple trees' },
        { time: '12:15 PM', title: 'Brunch', subtitle: 'Pancakes, fruit and honeycomb' },
        { time: '1:15 PM', title: 'Games', subtitle: 'Guess the due date, decorate a onesie' },
        { time: '2:15 PM', title: 'Cake & wishes', subtitle: 'Write a note for the wish jar' }
      ] },
      gallery:   { enabled: false, label: 'Sweet moments', title: '', items: [] },
      gifts:     { enabled: false, label: 'Registry', title: 'Gift registry', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'RSVP', title: 'Will you bee there?', buttonText: 'Send RSVP', maxPeople: 3,
        description: 'Please let us know by the 5th of May.', deadline: '2027-05-05',
        acceptMessage: 'Sweet! We will see you on the 15th of May.', declineMessage: 'Thank you for letting us know. We will miss you!',
        contactName: "Maya (Lina's sister)", contactPhone: '+961 70 505 118', contactLink: ''
      }),
      memories: { enabled: false }, music: MUSIC,
      customSections: [
        { enabled: true, label: 'A little request', title: 'Bring a book instead of a card', body: 'Write a note inside your favourite children’s book to start the baby’s library.' }
      ]
    },

    'bubble-pop': {
      title: 'Pop! Baby Sleiman is coming',
      cover: {
        enabled: true, headline: 'Pop! Baby Sleiman is coming', eventLabel: 'Baby shower', names: 'Rita & Charbel',
        tagline: 'Bubbles, cake and one tiny reason to celebrate.', greeting: 'Hey',
        hostText: 'The Sleiman & Aoun families', hostOutro: '', image: '', video: '', buttonText: "I'm coming"
      },
      countdown: { enabled: true, label: 'Almost here', date: '2027-08-21', time: '16:00', tzOffset: new Date(2027, 7, 21, 16, 0).getTimezoneOffset(), description: 'Beirut', image: '' },
      families:  { enabled: true, label: 'Hosted by', title: '', items: [] },
      locations: { enabled: true, label: 'Where', title: 'Where the fun is', image: '', items: [
        { label: 'Garden party', time: '4:00 – 7:00 PM', name: 'Casa Verde', addr: 'Yarzeh, Baabda', url: 'https://www.google.com/maps/search/?api=1&query=Yarzeh+Baabda', img: '' }
      ] },
      timeline:  { enabled: true, label: 'The plan', title: "What's popping", items: [
        { time: '4:00 PM', title: 'Bubbles & bites', subtitle: 'A bubble machine, obviously' },
        { time: '4:45 PM', title: 'Games', subtitle: 'Baby bingo and the bottle race' },
        { time: '5:30 PM', title: 'Cake', subtitle: 'The big reveal of the flavour, not the gender' },
        { time: '6:15 PM', title: 'Gifts & wishes', subtitle: '' }
      ] },
      gallery:   { enabled: false, label: 'Snapshots', title: '', items: [] },
      gifts:     { enabled: false, label: 'Registry', title: 'Little wishes', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'RSVP', title: 'Are you in?', buttonText: 'Count me in', maxPeople: 3,
        description: 'Let us know by the 10th of August so we blow enough bubbles.', deadline: '2027-08-10',
        acceptMessage: 'Pop! See you on the 21st of August.', declineMessage: 'We will miss you. Thanks for letting us know!',
        contactName: 'Rita Sleiman', contactPhone: '+961 3 909 707', contactLink: '@babysleiman'
      }),
      memories: { enabled: false }, music: MUSIC,
      customSections: [
        { enabled: true, label: 'Dress code', title: 'Wear something bright', body: 'The louder the colour, the better the photos.' }
      ]
    },

    // ── GRADUATION (second set) ──────────────────────────────────────────────
    'ivy-hall': {
      title: 'Nour Salameh — Class of 2026',
      cover: {
        enabled: true, headline: 'Class of 2026', eventLabel: 'Commencement', names: 'Nour Salameh',
        tagline: 'Please join us to celebrate this achievement, and the years of work behind it.', greeting: 'Dear',
        hostIntro: 'proudly announces the graduation of', hostText: 'Master of Public Health\nUniversité Saint-Joseph de Beyrouth', hostOutro: '',
        image: '', video: '', buttonText: 'Reply'
      },
      countdown: { enabled: true, label: 'The commencement', date: '2026-11-28', time: '16:00', tzOffset: new Date(2026, 10, 28, 16, 0).getTimezoneOffset(), description: 'Beirut', image: '' },
      families:  { enabled: true, label: 'With pride', title: '', items: [ { label: '', names: 'The Salameh family' } ] },
      locations: { enabled: true, label: 'Venues', title: 'Ceremony & reception', image: '', items: [
        { label: 'Commencement ceremony', time: '4:00 PM', name: 'Campus des Sciences Médicales', addr: 'Damascus Road, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Universite+Saint-Joseph+Beirut', img: '' },
        { label: 'Reception', time: '7:00 PM', name: 'Salon Ivy', addr: 'Badaro, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Badaro+Beirut', img: '' }
      ] },
      timeline:  { enabled: true, label: 'Programme', title: 'Order of exercises', items: [
        { time: '4:00 PM', title: 'Academic procession', subtitle: '' },
        { time: '4:20 PM', title: 'Address to the graduates', subtitle: 'Dean of the Faculty' },
        { time: '5:00 PM', title: 'Conferring of degrees', subtitle: '' },
        { time: '7:00 PM', title: 'Reception & dinner', subtitle: 'Salon Ivy, Badaro' }
      ] },
      gallery:   { enabled: false, label: 'Yearbook', title: '', items: [] },
      gifts:     { enabled: false, label: 'Gifts', title: 'With gratitude', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'Reply', title: 'Kindly reply', buttonText: 'Send reply', maxPeople: 3,
        description: 'Please let us know whether you will join us for the ceremony and the reception.', deadline: '2026-11-14',
        acceptMessage: 'Thank you. We look forward to celebrating Nour with you.', declineMessage: 'Thank you for letting us know.',
        contactName: 'Joumana Salameh', contactPhone: '+961 3 771 402', contactLink: ''
      }),
      memories: { enabled: false }, music: MUSIC, customSections: []
    },

    'next-chapter': {
      title: 'Sami — The next chapter',
      cover: {
        enabled: true, headline: 'The next chapter starts now', eventLabel: 'Class of 2026', names: 'Sami Abou Khalil',
        tagline: '', greeting: 'Hey', hostIntro: 'Just graduated', hostText: 'BSc Computer Science · Lebanese University', hostOutro: '',
        image: '', video: '', buttonText: "I'll be there"
      },
      countdown: { enabled: true, label: 'Party in', date: '2026-12-19', time: '19:00', tzOffset: new Date(2026, 11, 19, 19, 0).getTimezoneOffset(), description: 'Mar Mikhael, Beirut', image: '' },
      families:  { enabled: false, label: 'Big thanks to', title: '', items: [] },
      locations: { enabled: true, label: 'Where', title: 'The venue', image: '', items: [
        { label: 'Grad party', time: '7 PM – late', name: 'The Loft', addr: 'Armenia Street, Mar Mikhael, Beirut', url: 'https://www.google.com/maps/search/?api=1&query=Mar+Mikhael+Beirut', img: '' }
      ] },
      timeline:  { enabled: true, label: 'The plan', title: 'How the night goes', items: [
        { time: '7:00 PM', title: 'Doors & drinks', subtitle: 'Come hungry' },
        { time: '8:00 PM', title: 'Speeches', subtitle: 'Three minutes max, we timed it' },
        { time: '8:30 PM', title: 'Dinner', subtitle: 'Tacos and sliders' },
        { time: '10:00 PM', title: 'DJ set', subtitle: 'Until the neighbours complain' }
      ] },
      gallery:   { enabled: false, label: 'Highlights', title: '', items: [] },
      gifts:     { enabled: false, label: 'Gifts', title: 'Grad fund', description: '', items: [] },
      rsvp: Object.assign({}, RSVP, {
        label: 'RSVP', title: 'Are you coming?', buttonText: 'Send it', maxPeople: 3,
        description: 'Reply by the 5th of December so I can order enough tacos.', deadline: '2026-12-05',
        acceptMessage: "Let's go! See you on the 19th.", declineMessage: 'No stress. Thanks for letting me know!',
        contactName: 'Sami', contactPhone: '+961 71 660 442', contactLink: '@sami.grad'
      }),
      memories: { enabled: false }, music: MUSIC,
      customSections: [
        { enabled: true, label: 'Dress code', title: 'Smart casual', body: 'Something purple gets you a free drink.' }
      ]
    }
  };

  /** Returns the demo payload for a "?demo=<key>" query, or null when not in demo mode. */
  window.getDemoData = function (search) {
    const raw = (search || window.location.search || '').replace(/^\?/, '').replace(/\?/g, '&');
    const key = new URLSearchParams(raw).get('demo');
    if (!key) return null;
    const data = window.DEMO_INVITATIONS[key.toLowerCase()];
    return data ? JSON.parse(JSON.stringify(data)) : null;
  };
})();
