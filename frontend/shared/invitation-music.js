/*
 * Background music for invitations — shared across every template.
 *
 * Behaviour:
 *   • A small elegant icon is fixed in the bottom-left corner and stays visible while scrolling.
 *   • Music tries to start, with sound, as soon as the invitation has loaded.
 *   • Most browsers block sound until the guest interacts with the page. Then the music starts on
 *     the guest's first tap, click or key press anywhere, "tap to open" included — once, with no
 *     restart. Scrolling and swiping a natively scrolling area never count: browsers do not allow
 *     sound from a scroll.
 *   • The icon is a mute switch. Pressed first, before the music has started, it keeps the music
 *     muted; after that it only toggles mute / unmute. It never pauses or restarts.
 *   • The icon always shows the real state: off until music is actually requested, on (with a
 *     pulse) while it plays. If the system pauses the music (a phone call, another app's audio),
 *     the icon turns off and the next tap resumes it.
 *   • Pauses while the page is in the background and resumes on return only if it was playing.
 *   • Loops continuously. One player per page, whatever calls init(). No music, no listeners.
 *
 * Why this shape (the bugs it replaces): the earlier version listened for scroll, touchstart and
 * pointerdown, which browsers never accept as permission to play sound on a phone, and removed its
 * listener after that first refused attempt; a tap on the icon was also seen first by that page
 * listener, so the icon's own click then toggled the freshly started music to muted; and a YouTube
 * source was reported as playing even when the browser had blocked it. Guests had to press the
 * icon several times.
 *
 * Sources: an uploaded audio file (URL, streamed by the API) OR a YouTube link (audio only —
 * the video surface is hidden and controls are stripped so it behaves like background music).
 *
 * Usage:  InvitationMusic.init(data.music, window.API_BASE)
 *   data.music = { enabled, url, autoplay }
 */
(function () {
  'use strict';

  function parseYouTubeId(url) {
    if (!url) return null;
    var s = String(url).trim();
    var m = s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(s) ? s : null;   // bare id
  }

  function resolveUrl(url, apiBase) {
    if (/^https?:\/\//i.test(url)) return url;
    var base = (apiBase || '').replace(/\/$/, '');
    return base + url;   // API-relative (e.g. /api/public/media/<id>)
  }

  // Inline SVGs so there are no extra network requests.
  var ICON_ON =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  var ICON_OFF =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M11 5 6 9H3v6h3l5 4V5z"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>';

  function injectStyles() {
    if (document.getElementById('inv-music-style')) return;
    var css =
      '.inv-music-btn{position:fixed;left:16px;bottom:16px;z-index:9999;width:46px;height:46px;' +
      'border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;' +
      'border:1px solid rgba(255,255,255,.35);background:rgba(20,18,16,.55);color:#fff;' +
      'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 4px 16px rgba(0,0,0,.35);' +
      'transition:transform .2s ease,opacity .2s ease,background .2s ease;padding:0;' +
      'padding-bottom:env(safe-area-inset-bottom,0)}' +
      '.inv-music-btn:hover{transform:scale(1.06)}' +
      '.inv-music-btn:active{transform:scale(.94)}' +
      '.inv-music-btn.is-muted{opacity:.72}' +
      '.inv-music-btn .inv-music-pulse{position:absolute;inset:-1px;border-radius:50%;border:1px solid rgba(255,255,255,.35);' +
      'animation:invMusicPulse 2.4s ease-out infinite;opacity:0}' +
      // the existing pulse doubles as the "starting" cue, so a guest sees at once that the tap took
      '.inv-music-btn.is-playing .inv-music-pulse,.inv-music-btn.is-loading .inv-music-pulse{opacity:1}' +
      '@keyframes invMusicPulse{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.5);opacity:0}}' +
      '@media (prefers-reduced-motion: reduce){.inv-music-btn .inv-music-pulse{animation:none}}';
    var st = document.createElement('style');
    st.id = 'inv-music-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  // Events a browser accepts as permission to start sound. pointerdown/touchstart (on a touch
  // screen) and scroll are NOT among them, so they are deliberately absent.
  //   click     – mouse, trackpad and taps on links/buttons (every browser)
  //   pointerup – the end of a touch or pen tap (Chromium counts it; it arrives before touchend)
  //   touchend  – a tap anywhere on a phone, including on plain text or pictures, where iOS Safari
  //               sends no click event to the page
  //   keydown   – keyboard users
  // One tap fires several of these. The first that the browser accepts starts the music; the
  // others find it starting and only repeat the play command (see nudge), so a browser that does
  // not count pointerup still gets its touchend.
  var GESTURES = ['click', 'pointerup', 'touchend', 'keydown'];

  var active = null;   // the one player on this page

  function init(music, apiBase) {
    if (!music || music.enabled === false || !music.url) return;
    if (active || document.querySelector('.inv-music-btn')) return;   // one player per page, however often init() is called

    injectStyles();

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'inv-music-btn is-muted';
    btn.setAttribute('aria-label', 'Play background music');
    btn.setAttribute('aria-pressed', 'false');
    var pulse = document.createElement('span');
    pulse.className = 'inv-music-pulse';
    btn.appendChild(pulse);
    var iconWrap = document.createElement('span');
    iconWrap.style.display = 'flex';
    iconWrap.innerHTML = ICON_OFF;
    btn.appendChild(iconWrap);
    document.body.appendChild(btn);

    var ytId = parseYouTubeId(music.url);
    var engine = ytId ? youTubeEngine(ytId) : audioEngine(resolveUrl(music.url, apiBase));

    // idle      not tried yet
    // trying    the no-tap autoplay attempt is under way; a tap meanwhile is a full start of its own
    // blocked   the browser refused sound until the guest interacts; gesture listeners are armed
    // starting  play() requested from a tap, waiting for the browser to confirm
    // playing   sound is (or would be, if unmuted) playing
    // away      paused by us because the page went to the background; resumes when it returns
    var phase = 'idle';
    var lastIcon = null;

    function render() {
      var started = phase === 'starting' || phase === 'playing';
      // While starting, show what the guest asked for (with the loading pulse); once settled, what
      // the player really does: a video YouTube silenced is never shown as playing.
      var audible = phase === 'playing' ? !engine.isMuted() : phase === 'starting' && !engine.userMuted();
      var icon = audible ? 'on' : 'off';
      if (icon !== lastIcon) { iconWrap.innerHTML = audible ? ICON_ON : ICON_OFF; lastIcon = icon; }
      btn.classList.toggle('is-muted', !audible);
      btn.classList.toggle('is-loading', phase === 'starting' && audible);
      btn.classList.toggle('is-playing', phase === 'playing' && audible);
      btn.setAttribute('aria-pressed', String(audible));
      btn.setAttribute('aria-label', !started ? 'Play background music'
        : audible ? 'Mute background music' : 'Unmute background music');
    }

    // The single way playback begins. Must run synchronously inside a gesture handler when the
    // browser requires one: engine.play() calls the underlying play() before returning.
    function start() {
      if (phase === 'starting' || phase === 'playing') return;
      phase = 'starting';
      render();
      engine.play(false).then(function (ok) {
        if (phase !== 'starting') return;          // the system paused/ended it meanwhile: events already handled it
        phase = ok ? 'playing' : 'blocked';
        // Refused for want of a tap: keep listening. Unplayable file: stop asking on every tap;
        // the icon can still retry.
        if (ok || engine.broken()) disarm(); else arm();
        render();
      });
    }

    // The attempt made without a tap, as soon as the player is ready. It must not hold the player in
    // 'starting': a YouTube attempt can take seconds to fail, and a "tap to open" made meanwhile
    // used to be spent on a mere repeat of the command instead of a real start, so it never played.
    function tryAutoplay() {
      if (phase !== 'idle' && phase !== 'blocked') return;
      phase = 'trying';
      render();
      engine.play(true).then(function (ok) {
        if (phase !== 'trying') return;            // a tap or the player's own events took over
        phase = ok ? 'playing' : 'blocked';
        if (ok || engine.broken()) disarm();
        render();
      });
    }

    // ── first-interaction listeners: kept until the music has actually started ──
    var armed = false;
    function onGesture(e) {
      if (btn.contains(e.target)) return;          // the icon handles its own presses (see below)
      if (e.type === 'keydown' && (e.key === 'Escape' || e.key === 'Tab' || e.ctrlKey || e.metaKey || e.altKey)) return;
      if (phase === 'blocked' || phase === 'idle' || phase === 'trying') start();
      // A tap while a start is still pending is not wasted: the engine repeats its play-with-sound
      // command inside this tap, where the browser allows it.
      else if (phase === 'starting' && !engine.userMuted()) engine.nudge();
    }
    function arm() {
      if (armed) return;
      armed = true;
      GESTURES.forEach(function (t) { window.addEventListener(t, onGesture, { capture: true, passive: true }); });
    }
    function disarm() {
      if (!armed) return;
      armed = false;
      GESTURES.forEach(function (t) { window.removeEventListener(t, onGesture, { capture: true }); });
    }

    // The icon is a mute switch. A first press before the music has started means "keep it quiet":
    // the music starts muted (inside this tap, so a later unmute needs nothing more) and the icon
    // stays off. After that each press toggles mute. One press, one effect.
    btn.addEventListener('click', function () {
      if (phase === 'idle' || phase === 'blocked' || phase === 'trying') { engine.setMuted(true); start(); render(); return; }
      engine.setMuted(!(phase === 'starting' ? engine.userMuted() : engine.isMuted()));
      render();
    });

    // Keep the icon true to the player when something outside our control changes it.
    engine.onSystemChange(function (playing) {
      if (playing) {
        if (phase !== 'playing') { phase = 'playing'; disarm(); }
        // A start that only came through after the page was hidden: hold it until the guest is back.
        if (document.hidden) { phase = 'away'; engine.pause(); }
      } else if (phase === 'away') {
        // our own background pause
      } else if (phase === 'playing' && document.hidden) {
        // The phone paused it on its way to the background, before visibilitychange reached us.
        phase = 'away';
      } else if (phase === 'playing' && !engine.userMuted()) {
        // Paused by the system, or silenced by YouTube: the next tap brings the sound back.
        // (Silence the guest chose with the icon is not this: it stays playing, muted.)
        phase = 'blocked';
        if (engine.broken()) disarm(); else arm();
      }
      render();
    });
    // Muted or unmuted from outside the icon (the element's volumechange): redraw from the player.
    engine.onMuteChange(render);

    // Background: pause while the page is hidden (another app, a locked phone, a switched tab) and
    // resume on return only if it was playing. The element was already started by a tap, so the
    // browser lets it resume without another; if it does not, the next tap does, as on first load.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (phase !== 'playing') return;
        phase = 'away';
        engine.pause();
      } else if (phase === 'away') {
        phase = 'idle';
        start();
      }
      render();
    });

    // Arm before trying, so a tap during the attempt is never lost; then try with sound. A tap made
    // before a YouTube player was ready could not reach it, but it still counts: on Android and
    // desktop the page now has permission, so this attempt plays with sound.
    arm();
    engine.onReady(function () { if (!engine.userMuted()) tryAutoplay(); });
    render();

    active = { btn: btn, engine: engine, phase: function () { return phase; } };
  }

  // ── Uploaded-audio engine ───────────────────────────────────────────────
  function audioEngine(src) {
    var audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.muted = false;
    audio.src = src;
    var readyCbs = [], changeCbs = [], muteCbs = [];
    var playPending = false;
    // Whether sound is really playing, from the element's own events. audio.paused alone cannot
    // say: after a failed load Chromium leaves it false although nothing plays.
    var sounding = false;
    function emit(playing) { changeCbs.forEach(function (cb) { cb(playing); }); }
    // 'playing' confirms sound has begun; 'pause' or 'error' after that means it stopped.
    audio.addEventListener('playing', function () { sounding = true; emit(true); });
    audio.addEventListener('pause', function () { sounding = false; if (!playPending) emit(false); });
    audio.addEventListener('error', function () {
      sounding = false;
      if (window.console) console.warn('Invitation music could not be loaded:', src);
      if (!playPending) emit(false);
    });
    audio.addEventListener('volumechange', function () { muteCbs.forEach(function (cb) { cb(); }); });
    // The element can be asked to play at once; fire "ready" on the next tick.
    setTimeout(function () { readyCbs.forEach(function (cb) { cb(); }); readyCbs = null; }, 0);
    return {
      onReady: function (cb) { readyCbs ? readyCbs.push(cb) : cb(); },
      onSystemChange: function (cb) { changeCbs.push(cb); },
      // Resolves true once the browser accepts playback, false if it refuses (autoplay policy,
      // unplayable file). Calls audio.play() synchronously, inside the caller's gesture.
      play: function () {
        if (sounding) return Promise.resolve(true);
        if (audio.error) audio.load();            // a failed load is retried from the start, not trusted
        playPending = true;
        var p;
        try { p = audio.play(); } catch (e) { playPending = false; return Promise.resolve(false); }
        if (!p || !p.then) { playPending = false; return Promise.resolve(!audio.paused); }
        return p.then(function () { playPending = false; return true; },
                      function () { playPending = false; return false; });
      },
      // Repeat the play command inside a later event of the same tap. The earlier attempt may have
      // come from an event this browser does not count (pointerup on iOS); this one may be counted.
      nudge: function () {
        if (sounding) return;
        try { var p = audio.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
      },
      pause: function () { audio.pause(); },
      onMuteChange: function (cb) { muteCbs.push(cb); },
      isMuted: function () { return audio.muted; },
      userMuted: function () { return audio.muted; },
      setMuted: function (m) { audio.muted = m; },
      // The file itself cannot be played (missing, wrong format): waiting for a tap will not help.
      broken: function () { return !!audio.error; }
    };
  }

  // ── YouTube-as-audio engine (hidden surface, no controls, looped) ────────
  //
  // The trap this engine is built around: when a browser will not let a video play WITH sound
  // (iPhone Safari before a tap, Chrome on a first visit), YouTube's player does not stay stopped. It
  // mutes itself and plays silently, still reporting PLAYING. Trusting that report showed the
  // speaker as on while the guest heard nothing, and only a mute-then-unmute brought the sound.
  //
  // So "sounding" here means PLAYING and not muted by YouTube, confirmed by asking the player. A
  // video YouTube has silenced is left running muted ("primed"): it is then fully loaded, and the
  // guest's first tap only has to unmute it (from the beginning of the song), which every browser
  // allows inside a tap, instead of starting a cold video that may take too long to stay within it.
  function youTubeEngine(videoId) {
    var yt = null, ready = false, readyCbs = [], changeCbs = [];
    var muted = false;        // the guest's choice
    var playing = false;      // YouTube reports PLAYING (sound or not)
    var audible = false;      // last state reported to the controller: playing with sound
    var waiters = [];
    var failed = 0;   // a YouTube error code: the video cannot be played here at all
    var attempts = 0; // play() calls so far; only the newest may fall back to a muted warm-up

    function ytMuted() { try { return !!yt.isMuted(); } catch (e) { return false; } }
    // Tell the controller only about real changes in whether sound is playing.
    function report() {
      var now = playing && !muted && !ytMuted();
      if (now === audible) return;
      audible = now;
      changeCbs.forEach(function (cb) { cb(now); });
    }
    // YouTube answers isMuted() from state it posts back a moment after a command, so confirm over
    // a short window: true as soon as the sound is on, false if it is still muted at the end.
    function confirmSound(resolve) {
      var tries = 0;
      (function check() {
        if (failed) return resolve(false);
        if (playing && !ytMuted()) return resolve(true);
        if (++tries > 6) return resolve(false);
        setTimeout(check, 150);
      })();
    }

    var holder = document.createElement('div');
    // YouTube's embedding rules ask for a player of at least 200x200px, so it gets that size; it
    // stays invisible: off-screen, transparent and out of the way of clicks and assistive tech.
    holder.style.cssText = 'position:fixed;width:200px;height:200px;left:-10000px;top:0;opacity:0;pointer-events:none;';
    holder.setAttribute('aria-hidden', 'true');
    var target = document.createElement('div');
    holder.appendChild(target);
    document.body.appendChild(holder);

    function settle(ok) { var w = waiters; waiters = []; w.forEach(function (fn) { fn(ok); }); }

    function boot() {
      yt = new YT.Player(target, {
        width: 200, height: 200,
        videoId: videoId,
        playerVars: {
          autoplay: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1,
          rel: 0, playsinline: 1, loop: 1, playlist: videoId
        },
        events: {
          onReady: function () { ready = true; readyCbs.forEach(function (cb) { cb(); }); readyCbs = []; },
          onStateChange: function (e) {
            var S = YT.PlayerState;
            if (e.data === S.PLAYING) {
              playing = true;
              settle(true);
              // isMuted() catches up a moment after PLAYING; reporting at once could call a
              // silenced start "sound on". The watcher below confirms it.
              setTimeout(report, 600);
            } else if (e.data === S.ENDED) {
              yt.playVideo();                       // belt-and-braces loop
            } else if (e.data === S.PAUSED && playing) {
              playing = false;
              report();
            }
          },
          // 2 bad id · 5 HTML5 error · 100 removed or private · 101/150 the owner does not allow
          // embedding (common for official music videos). None of these can be fixed by a tap.
          onError: function (e) {
            failed = e.data || -1;
            if (window.console) console.warn('Invitation music: this YouTube video cannot be played here (YouTube error ' + failed +
              (failed === 101 || failed === 150 ? ': its owner does not allow it in other websites' : '') + '):', videoId);
            settle(false);
            playing = false;
            report();
          }
        }
      });
    }

    // YouTube can mute or unmute itself without an event; check once a second while it plays so
    // the icon never claims sound that is not there.
    setInterval(function () { if (playing) report(); }, 1000);

    // Load the IFrame API once.
    if (window.YT && window.YT.Player) {
      boot();
    } else {
      var prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { if (prev) prev(); boot(); };
      if (!document.getElementById('inv-yt-api')) {
        var s = document.createElement('script');
        s.id = 'inv-yt-api';
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      }
    }

    return {
      onReady: function (cb) { ready ? cb() : readyCbs.push(cb); },
      onSystemChange: function (cb) { changeCbs.push(cb); },
      // Resolves true only once the music is really heard (or would be, if the guest muted it):
      // PLAYING and not silenced by YouTube. The YouTube commands are sent synchronously, inside
      // the caller's tap.
      // auto: the attempt made without a tap. It gives up (and warms up muted) after 1.5s rather
      // than 6s, so the player is primed by the time a guest taps "tap to open".
      play: function (auto) {
        if (!yt || !ready || failed) return Promise.resolve(false);
        var attempt = ++attempts;
        var done = function (ok) { report(); return ok; };
        // The guest chose silence: playing at all is success.
        if (muted) {
          try { yt.mute(); if (!playing) yt.playVideo(); } catch (e) { return Promise.resolve(false); }
          if (playing) return Promise.resolve(true);
        } else if (playing) {
          if (!ytMuted()) return Promise.resolve(true);
          // Primed: running silently. Unmute it, from the start of the song.
          try { yt.seekTo(0, true); yt.unMute(); yt.setVolume(100); } catch (e) { return Promise.resolve(false); }
          return new Promise(confirmSound).then(done);
        } else {
          try { yt.unMute(); yt.setVolume(100); yt.playVideo(); } catch (e) { return Promise.resolve(false); }
        }
        return new Promise(function (resolve) {
          var finished = false;
          function finish(ok) { if (!finished) { finished = true; resolve(ok); } }
          waiters.push(function (started) {
            if (!started) return finish(false);
            if (muted) return finish(true);
            // It started. With sound, or did YouTube mute it? If muted, it keeps running silently
            // (primed) so the next tap can simply unmute it.
            confirmSound(finish);
          });
          setTimeout(function () {
            if (finished) return;
            // Nothing began. Warm it up muted instead, which browsers allow without a tap, so the
            // next tap only has to unmute it. If it begins later it is silent, so it can never be
            // heard out of step with the icon. Not if a newer start (a tap) has been made since:
            // muting now would silence it.
            if (attempt === attempts) { try { yt.mute(); yt.playVideo(); } catch (e) {} }
            finish(false);
          }, auto ? 1500 : 6000);
        }).then(done);
      },
      isMuted: function () { return muted || (playing && ytMuted()); },
      userMuted: function () { return muted; },
      // For support and tests: what YouTube itself reports.
      debug: function () {
        var st = null; try { st = yt.getPlayerState(); } catch (e) {}
        return { ready: ready, state: st, ytMuted: ready ? ytMuted() : null, failed: failed };
      },
      nudge: function () {
        if (!yt || !ready || failed || muted) return;
        try { yt.unMute(); yt.setVolume(100); if (!playing) yt.playVideo(); } catch (e) {}
      },
      pause: function () { try { yt.pauseVideo(); } catch (e) {} },
      // YouTube posts no mute event; the once-a-second check (report) already redraws the icon.
      onMuteChange: function () {},
      setMuted: function (m) {
        muted = m;
        try { m ? yt.mute() : (yt.unMute(), yt.setVolume(100)); } catch (e) {}
        // Unmuting is only real once YouTube confirms it; until then the icon stays as it was.
        if (!m) setTimeout(report, 450); else report();
      },
      broken: function () { return !!failed; }
    };
  }

  window.InvitationMusic = {
    init: init,
    _parseYouTubeId: parseYouTubeId,
    // Read-only view for testing and support: the current phase of this page's player.
    _state: function () {
      if (!active) return null;
      var s = { phase: active.phase(), muted: active.engine.isMuted() };
      if (active.engine.debug) s.player = active.engine.debug();
      return s;
    }
  };
})();
