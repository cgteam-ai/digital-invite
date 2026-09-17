/*
 * RSVP guest-count picker — shared by every invitation template.
 *
 * A native <select> opens the browser's own list, which on a phone is a large, dated popup that
 * can run past the edge of the screen. This module upgrades every guest-count <select> into a
 * picker that belongs to the invitation it sits in:
 *
 *   • The field becomes a button that copies the look of the template's own <select> — font,
 *     colours, border, radius, padding — so it matches the rest of that template's form.
 *   • Tapping it opens a bottom sheet on phones and a compact popover on larger screens. Both
 *     always stay inside the viewport (and its safe areas); when the numbers don't all fit, the
 *     list scrolls inside the panel.
 *   • The panel takes its font from the field and its colours from the field and the section
 *     behind it, so it feels native to each template without any template-specific code. A
 *     template can still steer it with CSS custom properties on (or above) the <select>:
 *       --rsvp-picker-bg, --rsvp-picker-fg, --rsvp-picker-accent,
 *       --rsvp-picker-radius, --rsvp-picker-font
 *
 * The original <select> stays in the page as the single source of truth: picking a number sets
 * select.value and fires `input` and `change`, so every template's RSVP code — validation and
 * submission — keeps working exactly as before. Selects are found automatically, including those
 * rendered later, by their data attribute: select[data-guest-count], select[data-party-size].
 *
 * Accessibility: the field is a real button (aria-haspopup="listbox", aria-expanded); the panel
 * is a labelled dialog holding a listbox of options with aria-selected. Arrow keys, Home/End,
 * Enter/Space, digits and Escape work, and focus returns to the field when the panel closes.
 */
(function () {
  'use strict';
  if (window.RsvpGuestPicker) return;

  const SELECTOR = 'select[data-guest-count], select[data-party-size]';
  // A bottom sheet on phones (and small touch tablets); a popover anchored to the field elsewhere.
  const SHEET_MQ = '(max-width: 640px), (pointer: coarse) and (max-width: 1024px)';
  const MAX_COLS = 5;
  const reducedMotion = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  let uid = 0;
  let current = null;           // the picker that is open, if any

  // ── STYLES ─────────────────────────────────────────────
  // Structure only. Colours, font and radius arrive as custom properties from theme().
  const CSS = `
.igc-native{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;
  pointer-events:none!important;overflow:hidden!important;clip-path:inset(50%)!important;white-space:nowrap!important}
.igc-trigger{-webkit-appearance:none;appearance:none;box-sizing:border-box;display:flex;align-items:center;
  justify-content:space-between;gap:.75em;width:100%;min-height:44px;margin:0;cursor:pointer;text-align:left;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation}
.igc-trigger[hidden]{display:none!important}
.igc-trigger .igc-value{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.igc-trigger.is-placeholder .igc-value{opacity:.72}
.igc-trigger.igc-center .igc-value{text-align:center}
.igc-trigger.igc-center::before{content:"";flex:none;width:.6em}
.igc-trigger .igc-chev{flex:none;width:.5em;height:.5em;border-right:1.5px solid currentColor;
  border-bottom:1.5px solid currentColor;transform:translateY(-25%) rotate(45deg);opacity:.75;transition:transform .25s ease}
.igc-trigger[aria-expanded="true"] .igc-chev{transform:translateY(25%) rotate(-135deg)}
.igc-trigger.igc-has-arrow .igc-chev{visibility:hidden}
.igc-trigger:focus-visible{outline:2px solid currentColor;outline-offset:3px}

.igc-layer{position:fixed;inset:0;z-index:2147483000;font-size:16px;font-family:var(--igc-font);color:var(--igc-fg);
  -webkit-text-size-adjust:100%}
.igc-layer.is-popover{pointer-events:none}
.igc-scrim{position:absolute;inset:0;background:rgba(10,9,8,.42);opacity:0;transition:opacity .28s ease;touch-action:none}
.igc-layer.is-popover .igc-scrim{display:none}
.igc-panel{position:absolute;box-sizing:border-box;display:flex;flex-direction:column;min-height:0;
  background:var(--igc-bg);color:var(--igc-fg);border:1px solid var(--igc-line);pointer-events:auto;outline:none;
  box-shadow:0 24px 60px rgba(0,0,0,.28),0 2px 10px rgba(0,0,0,.12)}
.igc-layer.is-sheet .igc-panel{left:0;right:0;bottom:0;margin:0 auto;width:100%;max-width:560px;
  max-height:calc(100% - env(safe-area-inset-top) - 24px);border-bottom:0;
  border-radius:var(--igc-sheet-r) var(--igc-sheet-r) 0 0;
  padding:10px max(18px,env(safe-area-inset-right)) calc(18px + env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));
  transform:translateY(100%);transition:transform .34s cubic-bezier(.2,.8,.2,1)}
.igc-layer.is-popover .igc-panel{border-radius:var(--igc-pop-r);padding:14px;opacity:0;
  transform:translateY(-6px) scale(.98);transform-origin:top center;
  transition:opacity .2s ease,transform .22s cubic-bezier(.2,.8,.2,1)}
.igc-layer.is-popover.is-above .igc-panel{transform-origin:bottom center;transform:translateY(6px) scale(.98)}
.igc-layer.is-open .igc-scrim{opacity:1}
.igc-layer.is-open .igc-panel{transform:none;opacity:1}
.igc-grip{flex:none;width:38px;height:4px;border-radius:2px;background:var(--igc-line);margin:0 auto 12px}
.igc-layer.is-popover .igc-grip{display:none}
.igc-head{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px}
.igc-title{margin:0;font-size:1.08rem;line-height:1.3;font-weight:inherit;letter-spacing:.01em}
.igc-close{-webkit-appearance:none;appearance:none;flex:none;border:0;background:transparent;color:inherit;
  width:40px;height:40px;margin:-8px -10px -8px 0;border-radius:50%;cursor:pointer;font:inherit;font-size:1.5rem;
  line-height:1;opacity:.7;display:grid;place-items:center}
.igc-close:hover,.igc-close:focus-visible{opacity:1;background:var(--igc-hover);outline:none}
.igc-list{display:grid;grid-template-columns:repeat(var(--igc-cols),minmax(0,1fr));gap:8px;min-height:0;
  overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:3px}
.igc-opt{display:flex;align-items:center;justify-content:center;min-height:50px;box-sizing:border-box;
  border:1px solid var(--igc-line);border-radius:var(--igc-chip-r);cursor:pointer;user-select:none;-webkit-user-select:none;
  font-size:1.2rem;line-height:1;font-variant-numeric:lining-nums tabular-nums;outline:none;
  transition:background .18s ease,color .18s ease,border-color .18s ease,transform .15s ease}
.igc-opt:hover{background:var(--igc-hover)}
.igc-opt:focus-visible{box-shadow:0 0 0 2px var(--igc-bg),0 0 0 4px var(--igc-accent)}
.igc-opt[aria-selected="true"]{background:var(--igc-accent);border-color:var(--igc-accent);color:var(--igc-on-accent)}
.igc-opt:active{transform:scale(.95)}
@media (prefers-reduced-motion: reduce){.igc-scrim,.igc-panel,.igc-opt,.igc-trigger .igc-chev{transition:none!important}}
`;
  function injectStyles() {
    if (document.getElementById('rsvp-guest-picker-css')) return;
    const s = document.createElement('style');
    s.id = 'rsvp-guest-picker-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  // ── COLOUR HELPERS ─────────────────────────────────────
  function parseColor(str) {
    const m = /rgba?\(([^)]+)\)/.exec(str || '');
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  /** Any CSS colour (hex, name, var-resolved value) → {r,g,b,a}, via the browser's own parser. */
  function toColor(str) {
    if (!str) return null;
    const probe = document.createElement('span');
    probe.style.color = str;
    if (!probe.style.color) return null;
    probe.style.display = 'none';
    document.body.appendChild(probe);
    const c = parseColor(getComputedStyle(probe).color);
    probe.remove();
    return c;
  }
  const css = (c, a) => `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${a == null ? 1 : a})`;
  function luminance(c) {
    const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
    return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b);
  }
  function contrast(a, b) {
    const x = luminance(a), y = luminance(b);
    return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
  }
  const INK   = { r: 23,  g: 20,  b: 17,  a: 1 };
  const PAPER = { r: 251, g: 248, b: 242, a: 1 };
  /** The first opaque background behind an element — the surface the picker should echo. */
  function surfaceBehind(el) {
    for (let n = el.parentElement; n; n = n.parentElement) {
      const c = parseColor(getComputedStyle(n).backgroundColor);
      if (c && c.a >= .9) return c;
    }
    return parseColor(getComputedStyle(document.documentElement).backgroundColor) || PAPER;
  }

  /** Colours, font and radii for a picker, taken from its template. */
  function theme(st) {
    const cs = getComputedStyle(st.select);
    const tcs = getComputedStyle(st.trig);
    const prop = n => cs.getPropertyValue(n).trim();

    let fg = toColor(prop('--rsvp-picker-fg')) || parseColor(tcs.color) || INK;
    let bg = toColor(prop('--rsvp-picker-bg')) || surfaceBehind(st.trig);
    fg = Object.assign({}, fg, { a: 1 });
    bg = Object.assign({}, bg, { a: 1 });
    if (contrast(fg, bg) < 3.2) bg = luminance(fg) > .4 ? INK : PAPER;   // never an unreadable pair
    const accent = toColor(prop('--rsvp-picker-accent')) || fg;
    const onAccent = contrast(bg, accent) >= 3 ? bg : (luminance(accent) > .4 ? INK : PAPER);

    const r = parseFloat(prop('--rsvp-picker-radius') || cs.borderTopLeftRadius) || 0;
    return {
      '--igc-fg': css(fg), '--igc-bg': css(bg),
      '--igc-line': css(fg, .22), '--igc-hover': css(fg, .08),
      '--igc-accent': css(accent), '--igc-on-accent': css(onAccent),
      '--igc-font': prop('--rsvp-picker-font') || cs.fontFamily,
      // Square fields keep square chips (editorial templates); rounded ones get rounded chips.
      '--igc-chip-r': r >= 20 ? '999px' : r + 'px',
      '--igc-pop-r': r ? Math.min(Math.max(r, 8), 16) + 'px' : '0px',
      '--igc-sheet-r': r ? Math.min(Math.max(r * 2, 14), 24) + 'px' : '0px'
    };
  }

  // ── THE FIELD ──────────────────────────────────────────
  const LOOK = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'textTransform', 'lineHeight',
    'color', 'backgroundColor', 'backgroundImage', 'backgroundRepeat', 'backgroundPosition', 'backgroundSize',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle',
    'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
    'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'boxShadow', 'minHeight'];

  /** Dress the button in the template's own field styling (read from the hidden <select>). */
  function copyLook(st) {
    const cs = getComputedStyle(st.select);
    LOOK.forEach(p => { st.trig.style[p] = cs[p]; });
    if (parseFloat(cs.minHeight) < 44 || cs.minHeight === 'auto') st.trig.style.minHeight = '44px';
    const hasArrow = cs.backgroundImage && cs.backgroundImage !== 'none';
    st.trig.classList.toggle('igc-has-arrow', !!hasArrow);
    st.trig.classList.toggle('igc-center', cs.textAlign === 'center' || cs.textAlignLast === 'center');
  }

  function placeholderOf(select) {
    const o = [...select.options].find(x => x.value === '');
    return o ? o.textContent.trim() : '';
  }
  function labelOf(o) {
    const t = (o && o.textContent || '').trim();
    return /^\d+$/.test(t) ? `${t} ${t === '1' ? 'guest' : 'guests'}` : t;
  }
  /** A chip shows just the number ("4 persons" → "4"); its full wording stays in aria-label. */
  function chipText(o) {
    const t = (o.textContent || '').trim();
    const m = /^\d+/.exec(t);
    return m ? m[0] : t;
  }
  function syncLabel(st) {
    const sel = st.select;
    const o = sel.options[sel.selectedIndex];
    const empty = !sel.value;
    st.valueEl.textContent = empty ? (st.question || 'Select') : labelOf(o);
    st.trig.classList.toggle('is-placeholder', empty);
    st.trig.setAttribute('aria-label', empty ? st.question : `${st.question}: ${labelOf(o)}`);
  }
  function syncVisibility(st) {
    st.trig.hidden = st.select.hidden || st.select.style.display === 'none';
  }

  function enhance(select) {
    if (!select || select.__rsvpPicker || select.multiple) return;
    injectStyles();
    const id = 'igc-' + (++uid);
    const trig = document.createElement('button');
    trig.type = 'button';
    trig.className = 'igc-trigger';
    trig.id = id + '-field';
    trig.setAttribute('aria-haspopup', 'listbox');
    trig.setAttribute('aria-expanded', 'false');
    trig.innerHTML = '<span class="igc-value"></span><span class="igc-chev" aria-hidden="true"></span>';

    const st = {
      id, select, trig,
      valueEl: trig.firstChild,
      question: placeholderOf(select) || 'How many of you?',
      layer: null, cleanup: null
    };
    select.__rsvpPicker = st;

    copyLook(st);                              // before the <select> is hidden, while it still has its looks
    // Put the button first, so a wrapping <label> activates the button rather than the hidden select.
    select.parentNode.insertBefore(trig, select);
    select.classList.add('igc-native');
    select.tabIndex = -1;
    select.setAttribute('aria-hidden', 'true');

    syncLabel(st);
    syncVisibility(st);

    trig.addEventListener('click', e => {
      e.preventDefault();
      // detail is 0 when Enter/Space "clicked" the button — then the focus ring should show.
      if (current === st) close(st, true); else openPicker(st, e.detail === 0);
    });
    trig.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); e.stopPropagation();
        openPicker(st, true);
      }
    });
    // A focus that lands on the hidden select (a script, an old label) is handed to the button.
    select.addEventListener('focus', () => trig.focus());
    select.addEventListener('change', () => syncLabel(st));
    if (select.form) select.form.addEventListener('reset', () => setTimeout(() => syncLabel(st)));
    // Templates show and hide the field themselves (e.g. only after "yes") — mirror that.
    new MutationObserver(() => { syncVisibility(st); copyLook(st); })
      .observe(select, { attributes: true, attributeFilter: ['style', 'hidden'] });
  }

  // ── THE PANEL ──────────────────────────────────────────
  const escHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function openPicker(st, byKeyboard) {
    if (current) close(current, false);
    if (!document.contains(st.select)) return;
    const box = st.trig.getBoundingClientRect();
    if (st.trig.hidden || (!box.width && !box.height)) return;   // the field isn't on the page right now
    copyLook(st);
    syncLabel(st);
    const options = [...st.select.options].filter(o => o.value !== '' && !o.disabled);
    if (!options.length) return;

    const sheet = !!(window.matchMedia && matchMedia(SHEET_MQ).matches);
    const layer = document.createElement('div');
    layer.className = 'igc-layer ' + (sheet ? 'is-sheet' : 'is-popover');
    const vars = theme(st);
    Object.keys(vars).forEach(k => layer.style.setProperty(k, vars[k]));
    layer.style.setProperty('--igc-cols', String(Math.min(MAX_COLS, options.length)));

    const titleId = st.id + '-title';
    layer.innerHTML = `
      <div class="igc-scrim"></div>
      <div class="igc-panel" role="dialog" aria-modal="${sheet}" aria-labelledby="${titleId}">
        <div class="igc-grip" aria-hidden="true"></div>
        <div class="igc-head">
          <p class="igc-title" id="${titleId}">${escHtml(st.question)}</p>
          <button type="button" class="igc-close" aria-label="Close">&times;</button>
        </div>
        <div class="igc-list" role="listbox" id="${st.id}-list" aria-labelledby="${titleId}">
          ${options.map((o, i) => `
            <div class="igc-opt" role="option" id="${st.id}-opt-${i}" tabindex="-1"
                 aria-selected="${o.value === st.select.value}" aria-label="${escHtml(labelOf(o))}"
                 data-value="${escHtml(o.value)}">${escHtml(chipText(o))}</div>`).join('')}
        </div>
      </div>`;
    document.body.appendChild(layer);
    st.layer = layer;
    current = st;
    st.trig.setAttribute('aria-expanded', 'true');
    st.trig.setAttribute('aria-controls', st.id + '-list');

    const panel = layer.querySelector('.igc-panel');
    const list  = layer.querySelector('.igc-list');
    if (!sheet) {
      // A popover hangs off the field, so the field has to be on screen first (it may not be
      // when it was reached with the keyboard). Jump, don't glide: the panel is placed right away.
      const r = st.trig.getBoundingClientRect();
      const vh = window.visualViewport ? visualViewport.height : window.innerHeight;
      if (r.top < 0 || r.bottom > vh) st.trig.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
    place(st, true);

    // ── interactions ──
    const onPick = e => {
      const opt = e.target.closest('.igc-opt');
      if (opt) choose(st, opt.dataset.value);
    };
    const onKey = e => {
      const opts = [...list.children];
      const i = opts.indexOf(document.activeElement);
      const cols = Math.min(MAX_COLS, opts.length);
      let next = null;
      switch (e.key) {
        case 'ArrowRight': next = i < 0 ? 0 : i + 1; break;
        case 'ArrowLeft':  next = i < 0 ? 0 : i - 1; break;
        case 'ArrowDown':  next = i < 0 ? 0 : i + cols; break;
        case 'ArrowUp':    next = i < 0 ? 0 : i - cols; break;
        case 'Home':       next = 0; break;
        case 'End':        next = opts.length - 1; break;
        case 'Enter': case ' ':
          if (i >= 0) choose(st, opts[i].dataset.value);
          else if (document.activeElement && document.activeElement.classList.contains('igc-close')) close(st, true);
          break;
        case 'Escape': case 'Tab': close(st, true); break;
        default:
          if (/^\d$/.test(e.key)) {                       // type a number to jump to it
            const hit = opts.find(o => o.dataset.value === e.key) || opts.find(o => o.dataset.value.startsWith(e.key));
            if (hit) next = opts.indexOf(hit);
            break;
          }
          return;
      }
      e.preventDefault();
      e.stopPropagation();                                // keep keys away from the page (e.g. swipe decks)
      if (next !== null && opts.length) opts[Math.max(0, Math.min(opts.length - 1, next))].focus({ preventScroll: false });
    };
    const onOutside = e => {
      if (!panel.contains(e.target) && !st.trig.contains(e.target)) close(st, false);
    };
    let raf = 0;
    const onMove = e => {
      if (e && e.target && e.target.nodeType === 1 && panel.contains(e.target)) return;   // the list's own scroll
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (current === st) place(st); });
    };

    list.addEventListener('click', onPick);
    panel.addEventListener('keydown', onKey);
    layer.querySelector('.igc-close').addEventListener('click', () => close(st, true));
    layer.querySelector('.igc-scrim').addEventListener('click', () => close(st, true));
    document.addEventListener('pointerdown', onOutside, true);
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    if (window.visualViewport) visualViewport.addEventListener('resize', onMove);
    st.cleanup = () => {
      document.removeEventListener('pointerdown', onOutside, true);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
      if (window.visualViewport) visualViewport.removeEventListener('resize', onMove);
      cancelAnimationFrame(raf);
    };

    // Open straight away — not on the next animation frame, which a background or throttled tab
    // may never deliver. Reading a layout value commits the closed state first, so the slide-in
    // still animates.
    void panel.offsetWidth;
    layer.classList.add('is-open');
    const first = list.querySelector('[aria-selected="true"]') || list.firstElementChild;
    if (first) {
      // A tap shouldn't leave a focus ring on the first number (it would read as "selected");
      // opened from the keyboard, the ring shows where the arrow keys start.
      first.focus({ preventScroll: true, focusVisible: !!byKeyboard });
      const lr = list.getBoundingClientRect(), fr = first.getBoundingClientRect();
      if (fr.top < lr.top || fr.bottom > lr.bottom) list.scrollTop += fr.top - lr.top;   // selected chip in view
    }
  }

  /** Keep the panel inside the viewport: a sheet is capped at the screen's height; a popover
   *  opens below the field, or above it when there is more room there, and never past an edge. */
  function place(st, first) {
    const layer = st.layer;
    if (!layer) return;
    const panel = layer.querySelector('.igc-panel');
    const vv = window.visualViewport;
    const vw = vv ? vv.width : window.innerWidth;
    const vh = vv ? vv.height : window.innerHeight;
    const M = 8;

    if (layer.classList.contains('is-sheet')) {
      panel.style.maxHeight = `calc(${Math.round(vh)}px - env(safe-area-inset-top) - 24px)`;
      return;
    }
    const r = st.trig.getBoundingClientRect();
    if (!first && (r.bottom < 0 || r.top > vh)) { close(st, false); return; }   // the field scrolled away
    const width = Math.min(Math.max(r.width, 280), 420, vw - 2 * M);
    const left = Math.min(Math.max(r.left, M), vw - width - M);
    panel.style.width = width + 'px';
    panel.style.left = left + 'px';
    panel.style.maxHeight = 'none';
    panel.style.top = '0px'; panel.style.bottom = '';
    const natural = panel.scrollHeight;
    const below = vh - r.bottom - M - 6;
    const above = r.top - M - 6;
    const up = natural > below && above > below;
    const maxH = Math.min(Math.max(up ? above : below, Math.min(natural, 180)), vh - 2 * M);
    panel.style.maxHeight = maxH + 'px';
    const h = Math.min(natural, maxH);
    let top = up ? r.top - 6 - h : r.bottom + 6;
    top = Math.min(Math.max(top, M), vh - M - h);                         // never past the top or bottom
    panel.style.top = top + 'px';
    layer.classList.toggle('is-above', up);
  }

  function choose(st, value) {
    const sel = st.select;
    if (sel.value !== value) {
      sel.value = value;
      sel.dispatchEvent(new Event('input', { bubbles: true }));
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (st.layer) st.layer.querySelectorAll('.igc-opt').forEach(o => o.setAttribute('aria-selected', String(o.dataset.value === value)));
    syncLabel(st);
    close(st, true);
  }

  function close(st, refocus) {
    if (current !== st || !st.layer) return;
    const layer = st.layer;
    current = null;
    st.layer = null;
    if (st.cleanup) st.cleanup();
    st.cleanup = null;
    st.trig.setAttribute('aria-expanded', 'false');
    st.trig.removeAttribute('aria-controls');
    layer.style.pointerEvents = 'none';
    layer.classList.remove('is-open');
    let gone = false;
    const done = () => { if (!gone) { gone = true; layer.remove(); } };
    if (reducedMotion()) done();
    else { layer.addEventListener('transitionend', done); setTimeout(done, 420); }
    if (refocus) st.trig.focus({ preventScroll: true });
  }

  // ── DISCOVERY ──────────────────────────────────────────
  // Templates render their RSVP form after the invitation data loads, so watch for it.
  function scan(root) {
    if (root.matches && root.matches(SELECTOR)) enhance(root);
    if (root.querySelectorAll) root.querySelectorAll(SELECTOR).forEach(enhance);
  }
  function start() {
    scan(document);
    new MutationObserver(muts => {
      for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) scan(n);
    }).observe(document.documentElement, { childList: true, subtree: true });
    // Media queries can change a field's look (e.g. 16px text on phones): keep the button in step.
    let t = 0;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => document.querySelectorAll(SELECTOR).forEach(s => { if (s.__rsvpPicker) copyLook(s.__rsvpPicker); }), 150);
    }, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.RsvpGuestPicker = { enhance, refresh: () => scan(document) };
})();
