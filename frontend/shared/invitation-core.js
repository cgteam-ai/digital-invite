/*
 * Invitation core — the behaviour every invitation template shares, in one place.
 *
 * The first six (wedding) templates each carry their own copy of this logic. Templates built on
 * this module contain only their design: markup, styles and the renderers that arrange the data.
 * Everything below — loading the invitation, personal guest links, the countdown, the RSVP form
 * and its submission, contact links, scroll reveals, background videos and music — is shared.
 *
 * A template uses it like this:
 *
 *   <script src="../../../shared/config.js"></script>
 *   <script src="../../../shared/demo-data.js"></script>
 *   <script src="../../../shared/invitation-core.js"></script>
 *   <script src="../../../shared/invitation-music.js" defer></script>
 *   <script src="../../../shared/rsvp-guest-picker.js" defer></script>
 *   <script>
 *     const DEFAULT_DATA = { ... };
 *     function build(data) { ...render into the page... }
 *     Invite.boot(build, DEFAULT_DATA);
 *   </script>
 *
 * Nothing here knows what any template looks like: markup produced here (the RSVP form, contact
 * links) uses neutral class names (.rsvp-*, .contact-*) that each template styles its own way.
 */
(function () {
  'use strict';

  const API_BASE = (window.API_BASE || '').replace(/\/$/, '');
  const Invite = window.Invite = { API_BASE, slug: null, guest: null, data: null };

  // ── TEXT & MEDIA ───────────────────────────────────────
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const nl2br = s => esc(s).replace(/\n/g, '<br>');
  /** Uploaded media is served by the API (/api/public/media/<id>); resolve it against API_BASE. */
  const mediaSrc = u => u && /^\/api\//.test(u) ? API_BASE + u : (u || '');
  const pad2 = n => String(n).padStart(2, '0');
  /** "Layla & Elias" → ["Layla", "Elias"]; a single name stays a single entry. */
  const splitNames = s => String(s || '').split(/\s*(?:&|\band\b|\+)\s*/i).map(x => x.trim()).filter(Boolean);
  /** First letters of the names, for monograms: "Sarah & Daniel" → "S&D", "Emma" → "E". */
  const initials = s => splitNames(s).map(n => n.charAt(0).toUpperCase()).join('&');
  /** "30" → "30th", "2" → "2nd"; anything that is not a plain number is returned as it is. */
  function ordinal(v) {
    const s = String(v == null ? '' : v).trim();
    if (!/^\d+$/.test(s)) return s;
    const n = Number(s), t = n % 100;
    return s + (t >= 11 && t <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'));
  }
  /** The digits in a label ("Turning 30" → "30"), or ''. */
  const numberIn = s => ((/\d+/.exec(String(s || '')) || [])[0]) || '';

  // ── DATES ──────────────────────────────────────────────
  /** The event day exactly as typed (never shifted into the viewer's timezone), or null. */
  function dateParts(cd) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec((cd && cd.date) || '');
    if (!m) return null;
    const y = +m[1], mo = +m[2], d = +m[3];
    if (y < 2000) return null;                       // an unset DateTime placeholder
    const dt = new Date(y, mo - 1, d);
    const f = o => dt.toLocaleDateString('en-US', o);
    return {
      y, mo, d, date: dt,
      weekday: f({ weekday: 'long' }), weekdayShort: f({ weekday: 'short' }),
      month: f({ month: 'long' }), monthShort: f({ month: 'short' }),
      long: f({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    };
  }
  /**
   * The instant the countdown runs to (epoch ms), or null. With a saved time and the admin's
   * timezone offset, every guest counts down to the same real moment, wherever they are.
   */
  function eventInstant(cd) {
    const p = dateParts(cd);
    if (!p) return null;
    const [hh, mi] = /^\d{1,2}:\d{2}/.test(cd.time || '') ? cd.time.split(':').map(Number) : [0, 0];
    const t = typeof cd.tzOffset === 'number'
      ? Date.UTC(p.y, p.mo - 1, p.d, hh, mi) + cd.tzOffset * 60000
      : new Date(p.y, p.mo - 1, p.d, hh, mi).getTime();
    return isNaN(t) ? null : t;
  }
  /** "17:30" → "5:30 PM"; '' when no time is set. */
  function fmtClock(t) {
    const m = /^(\d{1,2}):(\d{2})/.exec(t || '');
    if (!m) return '';
    const h = Number(m[1]);
    return `${h % 12 || 12}:${m[2]} ${h >= 12 ? 'PM' : 'AM'}`;
  }
  /** A yyyy-MM-dd value as a readable date ("15 May 2027" style for the viewer's locale). */
  function fmtDate(s) {
    if (!s) return '';
    const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? s + 'T00:00:00' : s);
    return isNaN(d) ? s : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // ── PLACES & PROGRAMME ─────────────────────────────────
  /** A map link: a real URL as-is; anything else typed in is searched on Google Maps. */
  function mapHref(u) {
    u = String(u || '').trim();
    if (!u) return '';
    return /^https?:\/\//i.test(u) ? u : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(u);
  }
  /** The emoji for a programme step: the admin's own, otherwise one read from what the step is. */
  function stepIcon(x) {
    const own = String((x && x.icon) || '').trim();
    if (own && own !== '✦') return own;
    const t = `${x.title || x.label || ''} ${x.subtitle || x.name || ''}`.toLowerCase();
    const rules = [
      [/cake|candle/, '🎂'], [/gift|present/, '🎁'], [/game|play|activit/, '🎈'], [/magic|show/, '🎩'],
      [/music|dj|danc/, '💃'], [/dinner|lunch|brunch|food|buffet|meal/, '🍽️'], [/toast|drink|cocktail|champagne/, '🥂'],
      [/photo/, '📸'], [/ceremony|commencement|diploma|degree|graduat/, '🎓'], [/ring|proposal/, '💍'],
      [/tea|sweet|dessert/, '🧁'], [/welcome|arriv|door/, '✨'], [/church|chapel|cathedral|mass/, '⛪'],
      [/party|celebrat|reception|venue/, '🎉']
    ];
    for (const [re, icon] of rules) if (re.test(t)) return icon;
    return '';
  }

  // ── DATA LOADING ───────────────────────────────────────
  function decodeData(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return JSON.parse(decodeURIComponent(escape(atob(s))));
  }
  const clone = o => JSON.parse(JSON.stringify(o));
  /** Section-by-section merge over the template's defaults (a section's own fields win). */
  function mergeDefaults(defaults, data) {
    const out = clone(defaults);
    for (const k of Object.keys(data || {})) {
      if (data[k] && typeof data[k] === 'object' && !Array.isArray(data[k]) && out[k]) out[k] = Object.assign({}, out[k], data[k]);
      else out[k] = data[k];
    }
    return out;
  }
  function parseQuery() {
    return new URLSearchParams(window.location.search.replace(/^\?/, '').replace(/\?/g, '&'));
  }
  /** Older invitations carry the event date only at the top level — use it as the fallback. */
  function withEventDate(data, eventDate) {
    data.countdown = data.countdown || {};
    if (!data.countdown.date && eventDate) data.countdown.date = String(eventDate).slice(0, 10);
    return data;
  }

  /** ?demo=<key> → ?d=<base64> → personal guest link ?g= → ?id=<slug> → the template's defaults. */
  async function loadData(defaults) {
    const params = parseQuery();
    if (window.getDemoData) {
      const demo = window.getDemoData(window.location.search);
      if (demo) return mergeDefaults(defaults, demo);
    }
    const enc = params.get('d');
    if (enc) {
      try { return mergeDefaults(defaults, decodeData(enc)); }
      catch (e) { console.warn('Bad ?d payload:', e); }
    }
    const token = params.get('g');
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/api/public/guest/${encodeURIComponent(token)}`, { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const body = await res.json();
          Invite.slug  = body.slug;
          Invite.guest = Object.assign({ token }, body.guest || {});
          return withEventDate(mergeDefaults(defaults, body.data || {}), body.eventDate);
        }
        console.warn('Guest API returned', res.status);
      } catch (e) { console.warn('Guest API fetch failed:', e); }
    }
    const id = params.get('id');
    if (id) {
      Invite.slug = id;
      try {
        const res = await fetch(`${API_BASE}/api/public/invitations/${encodeURIComponent(id)}`, { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const body = await res.json();
          return withEventDate(mergeDefaults(defaults, body.data || {}), body.eventDate);
        }
        console.warn('API returned', res.status);
      } catch (e) { console.warn('API fetch failed:', e); }
    }
    return clone(defaults);
  }

  // ── PERSONALISATION ────────────────────────────────────
  /** The guest's name from a guest-list link (?g=), or from ?gn= / ?name=&spouse=. */
  function guestName() {
    if (Invite.guest && Invite.guest.name) return Invite.guest.name;
    const p = parseQuery();
    const gn = (p.get('gn') || '').trim();
    if (gn) return gn;
    const name = (p.get('name') || '').trim(), spouse = (p.get('spouse') || '').trim();
    if (!name) return null;
    return spouse && spouse !== 'null' ? `${name} & ${spouse}` : name;
  }
  /** How many guests this reply may cover: guest link, then ?np= / ?max=, then the RSVP setting. */
  function maxPeople(data) {
    if (Invite.guest && Invite.guest.maxAttendees) return Invite.guest.maxAttendees;
    const p = parseQuery();
    const v = parseInt(p.get('np') || p.get('max'));
    if (v > 0) return v;
    return (data && data.rsvp && data.rsvp.maxPeople) || 10;
  }

  // ── COUNTDOWN ──────────────────────────────────────────
  // Any element with data-countdown="<epoch ms>" counts down in its [data-cd="d|h|m|s"] children.
  // Once the moment has passed the cells are replaced by a short line (data-past-today /
  // data-past-after override the wording). Times are recomputed against the clock on every tick,
  // so a reload, a sleeping phone or a background tab never drifts.
  let cdTimer = null;
  function startCountdown(root) {
    clearInterval(cdTimer);
    cdTimer = null;
    const nodes = [...(root || document).querySelectorAll('[data-countdown]')]
      .map(node => ({ node, target: Number(node.dataset.countdown), cells: node.querySelectorAll('[data-cd]') }))
      .filter(x => Number.isFinite(x.target));
    if (!nodes.length) return;
    const tick = () => {
      let live = 0;
      nodes.forEach(x => {
        if (x.done) return;
        const diff = x.target - Date.now();
        if (diff <= 0) {
          x.done = true;
          const msg = diff > -86400000
            ? (x.node.dataset.pastToday || 'Today is the day!')
            : (x.node.dataset.pastAfter || 'Thank you for celebrating with us');
          x.node.innerHTML = `<p class="cd-note">${esc(msg)}</p>`;
          x.node.classList.add('is-past');
          return;
        }
        live++;
        const v = {
          d: String(Math.floor(diff / 86400000)),
          h: pad2(Math.floor(diff / 3600000) % 24),
          m: pad2(Math.floor(diff / 60000) % 60),
          s: pad2(Math.floor(diff / 1000) % 60)
        };
        x.cells.forEach(el => { const n = v[el.dataset.cd]; if (n != null && el.textContent !== n) el.textContent = n; });
      });
      if (!live) { clearInterval(cdTimer); cdTimer = null; }
    };
    tick();
    cdTimer = setInterval(tick, 1000);
  }
  /** Countdown cells markup; `labels` can rename the units (e.g. { d: 'Sleeps' }). */
  function countdownCells(labels, cls) {
    const L = Object.assign({ d: 'Days', h: 'Hours', m: 'Minutes', s: 'Seconds' }, labels || {});
    const c = cls || 'cd';
    return ['d', 'h', 'm', 's'].map(k =>
      `<div class="${c}-cell"><span class="${c}-num" data-cd="${k}">–</span><span class="${c}-unit">${esc(L[k])}</span></div>`).join('');
  }

  // ── SCROLL REVEAL ──────────────────────────────────────
  // Elements with the class (default .rv) get .in when they come into view. A sweep after scrolling
  // stops catches anything the observer missed, e.g. a page that loaded in a background tab.
  function reveal(opts) {
    const o = Object.assign({ selector: '.rv', cls: 'in', margin: '0px 0px -8% 0px' }, opts || {});
    const els = document.querySelectorAll(o.selector);
    const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add(o.cls)); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add(o.cls); io.unobserve(e.target); }
    }), { threshold: 0, rootMargin: o.margin });
    els.forEach(el => io.observe(el));
    const sweep = () => {
      const h = window.innerHeight;
      document.querySelectorAll(`${o.selector}:not(.${o.cls})`).forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < h && r.bottom > 0) el.classList.add(o.cls);
      });
    };
    let t = 0;
    window.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(sweep, 160); }, { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) sweep(); });
    setTimeout(sweep, 60);
  }

  // ── DISPLAY TYPE FIT ───────────────────────────────────
  // Large names and headings are marked [data-fit] and sized with calc(<size> * var(--fit, 1)).
  // Words still wrap normally; only a single word too long for the column (a long name on a
  // 320px phone) scales the whole element down, so nothing is ever cut off or overflows.
  function fitText(root) {
    (root || document).querySelectorAll('[data-fit]').forEach(el => {
      el.style.setProperty('--fit', '1');
      const w = el.clientWidth, s = el.scrollWidth;
      const min = parseFloat(el.dataset.fit) || .4;
      if (w && s > w + 1) el.style.setProperty('--fit', Math.max(min, (w / s) * .98).toFixed(3));
    });
  }

  // ── MEDIA ──────────────────────────────────────────────
  /** An <img> for a photo field (lazy unless `eager`), or ''. */
  function img(src, alt, eager, cls) {
    const u = mediaSrc(src);
    if (!u) return '';
    return `<img${cls ? ` class="${cls}"` : ''} src="${esc(u)}" alt="${esc(alt || '')}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
  }
  /** A muted looping video when one is set (the photo becomes its poster), otherwise the photo. */
  function media(image, video, alt, eager, cls) {
    const v = mediaSrc(video || ''), i = mediaSrc(image || '');
    if (v) return `<video${cls ? ` class="${cls}"` : ''} data-bg-video autoplay loop muted playsinline preload="metadata" ${i ? `poster="${esc(i)}"` : ''} src="${esc(v)}"></video>`;
    return img(i, alt, eager, cls);
  }
  // A <video> injected via innerHTML doesn't always pick up the muted property; autoplay needs it.
  function startBackgroundVideos() {
    document.querySelectorAll('[data-bg-video]').forEach(v => {
      v.muted = true; v.defaultMuted = true;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    });
  }

  // ── CONTACT ────────────────────────────────────────────
  /** The host contact configured on the RSVP section, as ready-to-use links, or null. */
  function contact(r) {
    r = r || {};
    const name = String(r.contactName || '').trim();
    const phone = String(r.contactPhone || '').trim();
    const raw = String(r.contactLink || '').trim();
    if (!name && !phone && !raw) return null;
    const digits = phone.replace(/[^\d+]/g, '');
    let link = '', linkLabel = '';
    if (raw) {
      if (/^@[\w.]+$/.test(raw)) { link = 'https://instagram.com/' + raw.slice(1); linkLabel = raw; }
      else if (/^https?:\/\//i.test(raw)) {
        link = raw;
        linkLabel = /instagram/i.test(raw) ? 'Instagram' : /facebook/i.test(raw) ? 'Facebook'
          : /tiktok/i.test(raw) ? 'TikTok' : /wa\.me|whatsapp/i.test(raw) ? 'WhatsApp' : 'Link';
      } else { link = 'https://' + raw; linkLabel = raw; }
    }
    return {
      name, phone,
      tel: digits ? 'tel:' + digits : '',
      whatsapp: digits.replace(/\D/g, '').length >= 7 ? 'https://wa.me/' + digits.replace(/\D/g, '') : '',
      link, linkLabel
    };
  }
  /** Contact markup with neutral classes (.contact, .contact-name, .contact-link). */
  function contactHtml(r, opts) {
    const c = contact(r);
    if (!c) return '';
    const o = Object.assign({ intro: 'Questions? Reach out to', cls: 'contact' }, opts || {});
    const links = [
      c.tel ? `<a class="contact-link" href="${esc(c.tel)}">Call</a>` : '',
      c.whatsapp ? `<a class="contact-link" href="${esc(c.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a>` : '',
      c.link ? `<a class="contact-link" href="${esc(c.link)}" target="_blank" rel="noopener">${esc(c.linkLabel)}</a>` : ''
    ].filter(Boolean).join('');
    return `<div class="${o.cls}">
      ${o.intro ? `<p class="contact-intro">${esc(o.intro)}</p>` : ''}
      ${c.name ? `<p class="contact-name">${esc(c.name)}</p>` : ''}
      ${c.phone ? `<p class="contact-phone">${esc(c.phone)}</p>` : ''}
      ${links ? `<div class="contact-links">${links}</div>` : ''}
    </div>`;
  }

  // ── RSVP ───────────────────────────────────────────────
  /**
   * The RSVP form and its thank-you panel. Markup only — the template styles the .rsvp-* classes.
   * The guest-count <select> is upgraded by rsvp-guest-picker.js into the shared picker.
   * Options: yes / no (choice wording), nameLabel, namePlaceholder, countLabel, countPlaceholder,
   * wishesLabel, wishesPlaceholder, button, doneTitle.
   */
  function rsvpForm(r, opts) {
    r = r || {};
    const o = Object.assign({
      yes: 'Joyfully accepts', no: 'Regretfully declines',
      nameLabel: 'Your name(s)', namePlaceholder: 'First and last name',
      countLabel: 'Number of guests', countPlaceholder: 'How many of you?',
      wishesLabel: 'A note (optional)', wishesPlaceholder: 'Write your wishes…',
      button: r.buttonText || 'Send reply', doneTitle: 'Reply received'
    }, opts || {});
    const guest = guestName();
    const max = maxPeople(Invite.data);
    const options = ['<option value="" disabled selected>' + esc(o.countPlaceholder) + '</option>'];
    for (let n = 1; n <= max; n++) options.push(`<option value="${n}">${n}</option>`);
    return `
    <form class="rsvp" data-rsvp novalidate>
      <div class="rsvp-choices" role="radiogroup" aria-label="Will you attend?">
        <label class="rsvp-choice" data-choice><input type="radio" name="attending" value="yes"><span>${esc(o.yes)}</span></label>
        <label class="rsvp-choice" data-choice><input type="radio" name="attending" value="no"><span>${esc(o.no)}</span></label>
      </div>
      <label class="rsvp-field">
        <span class="rsvp-label">${guest ? 'Invitation issued to' : esc(o.nameLabel)}</span>
        ${guest
          // Personal link: shown for confirmation but locked (the server ignores a submitted name).
          ? `<input class="rsvp-input" type="text" data-guest-name value="${esc(guest)}" readonly aria-readonly="true" tabindex="-1">`
          : `<input class="rsvp-input" type="text" data-guest-name placeholder="${esc(o.namePlaceholder)}" autocomplete="name">`}
      </label>
      <label class="rsvp-field" data-count-field hidden>
        <span class="rsvp-label">${esc(o.countLabel)}</span>
        <select class="rsvp-input" data-guest-count>${options.join('')}</select>
      </label>
      ${r.allowWishes !== false ? `
      <label class="rsvp-field">
        <span class="rsvp-label">${esc(o.wishesLabel)}</span>
        <textarea class="rsvp-input" data-wishes rows="2" maxlength="200" placeholder="${esc(o.wishesPlaceholder)}"></textarea>
      </label>` : ''}
      <p class="rsvp-error" data-rsvp-error role="alert" hidden></p>
      <button type="submit" class="rsvp-submit">${esc(o.button)}</button>
    </form>
    <div class="rsvp-done" data-rsvp-success hidden
         data-accept="${esc(r.acceptMessage || "Thank you! We can't wait to celebrate with you.")}"
         data-decline="${esc(r.declineMessage || 'Thank you for letting us know. You will be missed.')}">
      <p class="rsvp-done-title">${esc(o.doneTitle)}</p>
      <p class="rsvp-done-body" data-rsvp-message></p>
    </div>`;
  }
  /** "Kindly reply before 15 May 2027" and "Reserved for up to 4 guests", when they apply. */
  function rsvpNotes(r) {
    r = r || {};
    const out = [];
    if (r.deadline) out.push(`Kindly reply before ${fmtDate(r.deadline)}`);
    if (guestName()) { const m = maxPeople(Invite.data); out.push(`Reserved for up to ${m} ${m === 1 ? 'guest' : 'guests'}`); }
    return out;
  }

  function bindRsvp() {
    document.addEventListener('change', e => {
      if (!e.target.matches || !e.target.matches('[data-rsvp] input[name="attending"]')) return;
      const form = e.target.closest('[data-rsvp]');
      form.querySelectorAll('[data-choice]').forEach(c => c.classList.toggle('on', c.contains(e.target)));
      const field = form.querySelector('[data-count-field]');
      if (field) field.hidden = e.target.value !== 'yes';
      showError(form, '');
    });
    document.addEventListener('submit', async e => {
      const form = e.target.closest && e.target.closest('[data-rsvp]');
      if (!form) return;
      e.preventDefault();
      const att = form.querySelector('input[name="attending"]:checked');
      const countEl = form.querySelector('[data-guest-count]');
      const nameEl = form.querySelector('[data-guest-name]');
      const wishes = form.querySelector('[data-wishes]');
      const name = guestName() || (nameEl ? nameEl.value.trim() : '');
      if (!att) return showError(form, 'Please let us know whether you can attend.');
      const attending = att.value === 'yes';
      const count = countEl ? countEl.value : '';
      if (!name) { if (nameEl) nameEl.focus(); return showError(form, 'Please enter your name.'); }
      if (attending && !count) return showError(form, 'Please choose how many of you are coming.');
      showError(form, '');

      const btn = form.querySelector('[type="submit"]');
      const original = btn ? btn.textContent : '';
      if (Invite.slug) {
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        try {
          const res = await fetch(`${API_BASE}/api/public/invitations/${encodeURIComponent(Invite.slug)}/rsvp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              response: attending ? 'yes' : 'no',
              partySize: attending ? parseInt(count) : 0,
              contactName: name,
              message: wishes ? (wishes.value.trim() || null) : null,
              guests: (attending ? name.split(/\s*(?:&|,| and )\s*/i).map(s => s.trim()).filter(Boolean) : []).map(n => ({ fullName: n })),
              guestToken: Invite.guest ? Invite.guest.token : null
            })
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            if (btn) { btn.disabled = false; btn.textContent = original; }
            return showError(form, err.error || `Submission failed (${res.status}). Please try again.`);
          }
        } catch {
          if (btn) { btn.disabled = false; btn.textContent = original; }
          return showError(form, 'Network error. Please check your connection and try again.');
        }
      }
      form.hidden = true;
      const box = form.parentElement.querySelector('[data-rsvp-success]');
      if (box) {
        const msg = box.querySelector('[data-rsvp-message]');
        if (msg) msg.innerHTML = nl2br(attending ? box.dataset.accept : box.dataset.decline);
        box.hidden = false;
        box.classList.add(attending ? 'is-yes' : 'is-no');
      }
      document.dispatchEvent(new CustomEvent('rsvp:sent', { detail: { attending, form } }));
    });
  }
  function showError(form, msg) {
    const el = form.querySelector('[data-rsvp-error]');
    if (!el) { if (msg) alert(msg); return; }
    el.textContent = msg;
    el.hidden = !msg;
  }

  // ── SMALL INTERACTIONS ─────────────────────────────────
  function bindCopy() {
    document.addEventListener('click', e => {
      const b = e.target.closest && e.target.closest('[data-copy]');
      if (!b || !navigator.clipboard) return;
      navigator.clipboard.writeText(b.dataset.copy).then(() => {
        const orig = b.textContent;
        b.textContent = 'Copied';
        setTimeout(() => { b.textContent = orig; }, 2000);
      }).catch(() => {});
    });
  }

  // ── BOOT ───────────────────────────────────────────────
  /**
   * Loads the invitation and hands it to the template's build(data), then starts the shared
   * behaviour. `opts.reveal` (default true) can pass options to reveal(), or false to skip it.
   */
  function boot(build, defaults, opts) {
    const o = Object.assign({ reveal: true }, opts || {});
    bindRsvp();
    bindCopy();
    const run = async () => {
      let data;
      try { data = await loadData(defaults); }
      catch (e) { console.error('Failed to load invitation data:', e); data = clone(defaults); }
      Invite.data = data;
      try { build(data); }
      catch (e) {
        console.error('Template failed to render the invitation:', e);
        Invite.data = data = clone(defaults);
        build(data);
      }
      fitText();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => fitText()).catch(() => {});
      let ft = 0;
      window.addEventListener('resize', () => { clearTimeout(ft); ft = setTimeout(fitText, 120); }, { passive: true });
      startCountdown();
      if (o.reveal) reveal(o.reveal === true ? null : o.reveal);
      startBackgroundVideos();
      if (window.InvitationMusic) window.InvitationMusic.init(data.music, API_BASE);
      // Next task, not next frame: hero entrances must start even in a background tab.
      setTimeout(() => document.documentElement.classList.add('is-ready'), 40);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) startCountdown(); });
  }

  Object.assign(Invite, {
    esc, nl2br, mediaSrc, pad2, splitNames, initials, ordinal, numberIn,
    dateParts, eventInstant, fmtClock, fmtDate, mapHref, stepIcon,
    mergeDefaults, loadData, guestName, maxPeople,
    startCountdown, countdownCells, reveal, fitText, img, media, startBackgroundVideos,
    contact, contactHtml, rsvpForm, rsvpNotes, boot
  });
})();
