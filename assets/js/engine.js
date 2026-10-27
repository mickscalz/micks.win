/* ============================================================================
   THE CABINET — cycling engine, transitions and interface.
   One shared WebGL2 context, one 2D context, one crossfade layer, 376
   worlds, and a clock that refuses to let any of them sit still for long.
   ========================================================================== */
(function (w, d) {
  'use strict';

  var DESIGNS = w.CabinetCatalogue.order(w.DESIGNS || []);
  var latestEdition = DESIGNS.length ? DESIGNS[0].edition : 1;

  var E = {
    designs: DESIGNS,
    index: 0,
    dwell: 36,          // seconds a world holds the stage before the next
    artT: 0,
    t: 0,               // time inside the current world
    gt: 0,              // global clock
    fade: 0,
    paused: false,
    lingering: false,   // keep the current world moving without automatic travel
    cycleOffset: 0,
    playing: false,
    seed: 0.37,
    scale: 0.78,         // adaptive render scale (climbs to 1 when there is headroom)
    dpr: 1,
    broken: {}
  };

  /* ------------------------------------------------------------------ dom */
  var $ = function (s) { return d.querySelector(s); };
  var stage = $('#stage'), cGL = $('#gl'), c2D = $('#c2d'), cFade = $('#fade');
  var card = $('#card'), elRank = $('#cardRank'), elTotal = $('#cardTotal'), elName = $('#cardName'),
    elTag = $('#cardTag'), elBlurb = $('#cardBlurb'), elMeter = $('#cardMeter'),
    elMeterVal = $('#cardMeterVal');
  var rail = $('#rail'), gal = $('#gal'), galGrid = $('#galGrid');
  var galFilters = $('#galFilters'), galJump = $('#galJump'), galCount = $('#galCount');
  var cycleBar = $('#cycleBar'), statFps = $('#statFps'), statRes = $('#statRes'), hint = $('#hint');
  var tip = d.createElement('div');
  tip.className = 'rail__tip';
  d.body.appendChild(tip);

  /* --------------------------------------------------------------- context */
  var R = w.GLR.create(cGL);
  if (!R) {
    var fatal = $('#fatal');
    fatal.hidden = false;
    fatal.innerHTML = 'This cabinet needs <b>WebGL2</b>.<br>Try a current Chrome, Edge, Firefox or Safari — with hardware acceleration on.';
    return;
  }
  var ctx2 = c2D.getContext('2d', { alpha: false, desynchronized: true });
  var ctxF = cFade.getContext('2d', { alpha: true });
  var transitions=w.CabinetTransitions.create($('#transition'),cFade);E.transitions=transitions;

  /* ----------------------------------------------------------------- state */
  var S = {
    t: 0, dt: 0, w: 0, h: 0, dpr: 1,
    mouse: { x: 0, y: 0 },
    pointer: { x: 0.5, y: 0.5, px: 0.5, py: 0.5, active: false },
    fade: 0, energy: 0, seed: 0.37, ctx: ctx2, R: R
  };
  var target = { x: 0, y: 0 };

  /* ---------------------------------------------------------------- sizing */
  function sizeCanvas(c, ctx, cssW, cssH, pixelW, pixelH) {
    if (c.width !== pixelW || c.height !== pixelH) { c.width = pixelW; c.height = pixelH; }
    c.style.width = cssW + 'px';
    c.style.height = cssH + 'px';
  }

  var cssW = 0, cssH = 0;
  function resize() {
    E.needsDraw = true;
    cssW = w.innerWidth; cssH = w.innerHeight;
    E.dpr = Math.min(w.devicePixelRatio || 1, 2);

    var budget = (E.designs[E.index] && E.designs[E.index].pixelBudget) || 1900000;                                  // pixel budget per frame
    var wantW = Math.round(cssW * E.dpr * E.scale);
    var wantH = Math.round(cssH * E.dpr * E.scale);
    var px = wantW * wantH;
    var tuning=w.Experience?w.Experience.frame():null;
    budget *= tuning ? Math.max(.45,tuning.quality)*(.4+.6*tuning.detail) : 1;
    if (px > budget) {
      var k = Math.sqrt(budget / px);
      wantW = Math.round(wantW * k); wantH = Math.round(wantH * k);
    }
    sizeCanvas(cGL, null, cssW, cssH, wantW, wantH);

    var q=w.Experience?w.Experience.frame().quality:1;
    var d2 = Math.min(E.dpr, 1.5)*Math.max(.5,q*Math.sqrt(tuning ? .4+.6*tuning.detail : 1));
    sizeCanvas(c2D, ctx2, cssW, cssH, Math.round(cssW * d2), Math.round(cssH * d2));
    ctx2.setTransform(d2, 0, 0, d2, 0, 0);

    sizeCanvas(cFade, ctxF, cssW, cssH, Math.min(720, Math.round(cssW * 0.75)), Math.min(405, Math.round(cssH * 0.75)));

    S.w = cssW; S.h = cssH; S.dpr = d2;
    var cur = E.designs[E.index];
    var surfaceKey = cur && cur.kind === "2d" ? cssW+"x"+cssH : cGL.width+"x"+cGL.height;
    if (cur && cur.resize && cur._surfaceKey !== surfaceKey) {
      try { cur.resize(cur.kind === '2d' ? S : R, cur.kind === '2d' ? S.w : cGL.width, cur.kind === '2d' ? S.h : cGL.height); cur._surfaceKey=surfaceKey; }
      catch (e) { /* non-fatal */ }
    }
    if (statRes) statRes.textContent = wantW + '×' + wantH;
  }
  w.addEventListener('resize', resize);

  /* ------------------------------------------------------------- lifecycle */
  function ensure(design) {
    if (!design || design.ready || E.broken[design.id]) return;
    try {
      if (design.kind === 'gl') { design.prog = R.shader(design.frag, design.id); if (!design.prog) throw new Error('shader'); }
      else if (design.kind === 'glx') { design.init(R); }
      else { design.init(S); }
      design.ready = true;
    } catch (e) {
      console.error('[cabinet] world failed to load: ' + design.id, e);
      E.broken[design.id] = true;
    }
  }

  function snapshot() {
    var src = (E.designs[E.index] && E.designs[E.index].kind === '2d') ? c2D : cGL;
    try {
      ctxF.clearRect(0, 0, cFade.width, cFade.height);
      ctxF.drawImage(src, 0, 0, cFade.width, cFade.height);
      transitions.capture(ctxF);
      transitions.begin(cFade,w.Experience.getSettings());
    } catch (e) { /* ignore */ }
  }

  // A temporary audition occupies one stage slot, never the authored catalogue UI.
  var childSlot = null, childBase = null, priorLinger = false;
  function restoreChild() {
    if (childSlot === null) return;
    var audition=E.designs[childSlot];
    if(audition.dispose)audition.dispose(R);
    E.designs[childSlot] = childBase;
    childSlot = null; childBase = null;
    E.lingering = priorLinger;
    syncLinger();
  }
  E.playChild = function (child) {
    // Audition is an explicit Play action, not navigation into an inherited Hold.
    if (E.paused) togglePause();
    E.playing = true;
    show(E.index, { child: child });
    E.lingering = true;
    syncLinger();
  };
  E.leaveChild = function () { if (childSlot !== null) show(E.index); };
  function show(i, opts) {
    opts = opts || {};
    var n = E.designs.length;
    i = ((i % n) + n) % n;
    var prev = E.designs[E.index];
    if (opts.snapshot !== false && prev && E.playing && !E.paused) snapshot();else transitions.end();

    restoreChild();
    E.index = i;
    if (opts.child) {
      childSlot = i; childBase = E.designs[i]; priorLinger = E.lingering;
      Object.assign(opts.child, { rank: childBase.rank, collectionRank: childBase.collectionRank });
      E.designs[i] = opts.child;
    }
    var design = E.designs[i];
    ensure(design);
    if (E.broken[design.id]) {                 // skip gracefully
      var guard = 0;
      while (E.broken[E.designs[E.index].id] && guard++ < n) {
        E.index = (E.index + 1) % n;
        ensure(E.designs[E.index]);
      }
      design = E.designs[E.index];
    }

    resize();

    E.t = 0;
    E.artT = 0;
    E.cycleOffset = 0;
    E.revealComplete = E.paused || (prev && E.playing && opts.snapshot !== false);
    E.fade = E.paused ? 1 : 0;
    sinceSwitch = 0;
    warmAt = -1;
    E.seed = Math.random() * 100;
    S.seed = E.seed;

    stage.setAttribute('data-kind', design.kind === '2d' ? '2d' : 'gl');
    // Crossfade only: no flash or per-world zoom reset.
    if(w.Experience) w.Experience.enter(design);
    if(w.Soundscape) w.Soundscape.enter(design);

    // card
    d.body.setAttribute('data-world-theme', design.theme || 'dark');
    var collection = $('#cardCollection');
    if (collection) collection.textContent = design.nursery ? 'nursery · ' + (design.recipeSolver || 'eco-v1') + ' · offspring audition' : 'collection ' + pad(design.edition || 1) + ' · ' + (design.edition === latestEdition ? 'latest · ' : '') + 'rank ' + pad(design.collectionRank);
    elRank.firstChild ? (elRank.firstChild.nodeValue = pad(design.rank)) : (elRank.textContent = pad(design.rank));
    if (elTotal) elTotal.textContent = '/ ' + pad(E.designs.length);
    elName.textContent = design.name;
    elTag.textContent = design.tag;
    elBlurb.textContent = design.blurb;
    card.classList.remove('swap');
    void card.offsetWidth;
    card.classList.add('swap');
    var cap = design.nursery?0:design.captivation || 70;
    setTimeout(function () {
      elMeter.style.width = cap + '%';
      elMeterVal.textContent = design.nursery?'unrated':cap + '/100';
    }, 60);

    // rail
    var kids = rail.children;
    for (var k = 0; k < kids.length; k++) {
      kids[k].classList.toggle('is-on', k === E.index);
      if (k === E.index) kids[k].classList.add('is-seen');
    }
    var tiles = galGrid.children;
    for (var q = 0; q < tiles.length; q++) tiles[q].classList.toggle('is-on', q === E.index);

    // keep the active tick visible when the rail is wider than the screen
    var active = kids[E.index];
    if (active) {
      active.setAttribute('aria-current', 'true');
      for (var ri = 0; ri < kids.length; ri++) { if (ri !== E.index) kids[ri].removeAttribute('aria-current'); }
      var want = active.offsetLeft - (rail.clientWidth || 0) * 0.5 + active.offsetWidth * 0.5;
      if (rail.scrollTo) { try { rail.scrollTo({ left: Math.max(0, want), behavior: w.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } catch (e) { } }
      else rail.scrollLeft = Math.max(0, want);
    }
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function next() { show(E.index + 1); }
  function prev() { show(E.index - 1); }

  /* ------------------------------------------------------------------- rail */
  function buildRail() {
    rail.innerHTML = '';
    E.designs.forEach(function (ds, i) {
      var b = d.createElement('button');
      b.className = 'rail__item';
      b.type = 'button';
      var img = d.createElement('img');
      img.src = new w.URL(ds.preview, d.baseURI).href;
      img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      img.width = 96; img.height = 60;
      img.addEventListener('error', function(){
        img.remove(); b.classList.add('rail__item--fallback');
        var label = d.createElement('span'); label.className = 'rail__fallback'; label.textContent = ds.name; b.appendChild(label);
      }, {once:true});
      b.appendChild(img);
      b.setAttribute('aria-label', ds.rank + '. ' + ds.name);
      var num = d.createElement('span');
      num.className = 'rail__num';
      num.textContent = pad(ds.rank);
      b.appendChild(num);
      b.addEventListener('click', function () { E.playing = true; show(i); });
      b.addEventListener('mouseenter', function () {
        tip.innerHTML = '<b>' + ds.name + '</b><s>' + pad(ds.rank) + ' · ' + ds.tag + '</s>';
        var r = b.getBoundingClientRect();
        tip.style.left = (r.left + r.width / 2) + 'px';
        tip.style.top = (r.top - 6) + 'px';
        tip.classList.add('on');
      });
      b.addEventListener('mouseleave', function () { tip.classList.remove('on'); });
      rail.appendChild(b);
    });
  }

  /* ---------------------------------------------------------------- gallery */
  function buildGallery() {
    galGrid.innerHTML = '';
    E.designs.forEach(function (ds, i) {
      var b = d.createElement('button');
      b.className = 'tile';
      b.type = 'button';
      b.setAttribute('data-family', ds.kind || 'gl');
      b.setAttribute('data-edition', ds.edition || 1);
      // URLs inside custom properties resolve against the CSS file, not the
      // document. Make the preview URL absolute so project Pages works too.
      b.style.setProperty('--art', ds.preview ? 'url("' + new w.URL(ds.preview, d.baseURI).href + '")' : (ds.art || 'linear-gradient(135deg,#222,#000)'));
      b.style.setProperty('--glow', 'rgba(143,227,255,.45)');
      b.innerHTML =
        '<span class="tile__art"></span>' +
        '<span class="tile__edition">collection ' + pad(ds.edition || 1) + (ds.edition === latestEdition ? ' · new' : '') + '</span>' +
        '<span class="tile__heat">' + (ds.captivation || 0) + '</span>' +
        '<span class="tile__body">' +
        '<span class="tile__no">' + pad(ds.rank) + ' / ' + pad(E.designs.length) + '</span>' +
        '<span class="tile__name">' + ds.name + '</span>' +
        '<span class="tile__tag">' + ds.tag + '</span>' +
        '</span>';
      b.addEventListener('click', function () {
        E.playing = true;
        show(i);
        closeGal();
      });
      galGrid.appendChild(b);
    });

    // counts on the filter chips, and a live count in the header
    if (galCount) galCount.textContent = E.designs.length;
    if (galJump) { galJump.max = E.designs.length; galJump.placeholder = '1–' + E.designs.length; }
    if (galFilters) {
      var chips = galFilters.querySelectorAll('.chip');
      for (var c = 0; c < chips.length; c++) {
        var f = chips[c].getAttribute('data-filter');
        chips[c].setAttribute('aria-pressed', f === 'all' ? 'true' : 'false');
        var n = f === 'all' ? E.designs.length : E.designs.filter(function (x) { return f === 'latest' ? x.edition === latestEdition : (x.kind || 'gl') === f; }).length;
        var badge = chips[c].querySelector('i');
        if (badge) badge.textContent = n;
      }
    }
  }

  function applyFilter(f) {
    if (!galFilters) return;
    var chips = galFilters.querySelectorAll('.chip');
    for (var c = 0; c < chips.length; c++) {
      var chosen = chips[c].getAttribute('data-filter') === f;
      chips[c].classList.toggle('is-on', chosen);
      chips[c].setAttribute('aria-pressed', chosen ? 'true' : 'false');
    }
    var tiles = galGrid.children;
    for (var i = 0; i < tiles.length; i++) {
      tiles[i].hidden = !(f === 'all' || (f === 'latest' ? Number(tiles[i].getAttribute('data-edition')) === latestEdition : tiles[i].getAttribute('data-family') === f));
    }
  }

  var galReturnFocus = null;
  function openGal() {
    if(w.Experience && w.Experience.isOpen()) w.Experience.open(false);
    if (E.immersive) setImmersive(false);
    galReturnFocus = d.activeElement;
    gal.inert = false;
    gal.classList.add('on'); gal.setAttribute('aria-hidden', 'false');
    gal.querySelector('.gal__close').focus();
  }
  function closeGal() {
    gal.classList.remove('on'); gal.setAttribute('aria-hidden', 'true');
    gal.inert = true;
    if (galReturnFocus && galReturnFocus.focus) galReturnFocus.focus();
  }

  /* --------------------------------------------------------------- controls */
  d.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!btn) return;
    var a = btn.getAttribute('data-act');
    if (a === 'next') { E.playing = true; next(); }
    else if (a === 'prev') { E.playing = true; prev(); }
    else if (a === 'play') { togglePause(); }
    else if (a === 'linger') { toggleLinger(); }
    else if (a === 'shuffle') { E.playing = true; show((Math.random() * E.designs.length) | 0); }
    else if (a === 'gallery') { openGal(); }
    else if (a === 'close-gal') { closeGal(); }
    else if (a === 'immerse') { setImmersive(!E.immersive); }
    else if (a === 'full') { toggleFull(); }
  });

  // number box in the gallery head
  if (galJump) {
    galJump.addEventListener('change', function () {
      var n = parseInt(galJump.value, 10);
      if (n >= 1 && n <= E.designs.length) { E.playing = true; show(n - 1); closeGal(); }
      galJump.value = '';
    });
    galJump.addEventListener('click', function (e) { e.stopPropagation(); });
  }

  function togglePause() {
    E.paused = !E.paused;
    if(w.Soundscape)w.Soundscape.setHeld(E.paused);
    d.body.classList.toggle('is-paused', E.paused);
    $('#ctl [data-act="play"]').setAttribute('aria-pressed', String(E.paused));
  }

  function syncLinger() {
    d.body.classList.toggle('is-lingering', E.lingering);
    $('#ctl [data-act="linger"]').setAttribute('aria-pressed', String(E.lingering));
  }
  function toggleLinger() {
    E.lingering = !E.lingering;
    E.cycleOffset = E.t; // resume a full dwell without rewinding the artwork
    sinceSwitch = 0;
    d.body.classList.toggle('is-lingering', E.lingering);
    $('#ctl [data-act="linger"]').setAttribute('aria-pressed', String(E.lingering));
  }

  var immersionFocus = null;
  function setImmersive(on) {
    var back = $('#immerseReturn');
    E.immersive = !!on;
    if (on) immersionFocus = d.activeElement;
    d.body.classList.toggle('is-immersive', !!on);
    back.hidden = !on;
    ['brand','card','rail','ctl','hint','experienceDock'].forEach(function(id){
      var el = d.getElementById(id);
      if(el){ el.inert = !!on; if(on)el.setAttribute('aria-hidden','true');else el.removeAttribute('aria-hidden'); }
    });
    $('#ctl [data-act="immerse"]').setAttribute('aria-pressed', String(!!on));
    if(on) back.focus();
    else if(immersionFocus && immersionFocus !== d.body) immersionFocus.focus();
    else $('#ctl [data-act="immerse"]').focus();
  }

  function toggleFull() {
    if (!d.fullscreenElement) {
      if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen();
    } else if (d.exitFullscreen) d.exitFullscreen();
  }

  var digitBuf = '', digitAt = 0;
  w.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if(e.target && e.target.closest && e.target.closest('#experiencePanel')) return;
    if (e.key !== 'Tab' && e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) {
      if (e.key === 'Escape') closeGal();
      return;
    }
    if (gal.classList.contains('on') && e.key !== 'g' && e.key !== 'G') {
      if (e.key === 'Escape') closeGal();
      if (e.key === 'Tab') {
        var focusable = gal.querySelectorAll('button:not([hidden]), input');
        var list = Array.prototype.filter.call(focusable, function (el) { return !el.hidden && el.offsetParent !== null; });
        var first = list[0], lastFocus = list[list.length - 1];
        if (e.shiftKey && d.activeElement === first) { e.preventDefault(); lastFocus.focus(); }
        else if (!e.shiftKey && d.activeElement === lastFocus) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    switch (e.key) {
      case 'ArrowRight': E.playing = true; next(); break;
      case 'ArrowLeft': E.playing = true; prev(); break;
      case ' ': e.preventDefault(); togglePause(); break;
      case 'g': case 'G': gal.classList.contains('on') ? closeGal() : openGal(); break;
      case 'f': case 'F': toggleFull(); break;
      case 'h': case 'H': setImmersive(!E.immersive); break;
      case 'l': case 'L': toggleLinger(); break;
      case 's': case 'S': E.playing = true; show((Math.random() * E.designs.length) | 0); break;
      case 'Escape': digitBuf = ''; E.immersive ? setImmersive(false) : closeGal(); break;
      default:
        if (e.key >= '0' && e.key <= '9') {
          // Rank entry grows with the catalogue; successive digits arrive within a second.
          var now = e.timeStamp || performance.now();
          digitBuf = (now - digitAt < 1000 && digitBuf.length < String(E.designs.length).length && digitBuf !== '0') ? digitBuf + e.key : e.key;
          digitAt = now;
          var n = digitBuf === '0' ? 10 : parseInt(digitBuf, 10);
          if (n < 1 || n > E.designs.length) { digitBuf = e.key; n = parseInt(digitBuf, 10); }
          if (n >= 1 && n <= E.designs.length) { E.playing = true; show(n - 1); }
        }
    }
  });

  /* --------------------------------------------------------------- pointer */
  function setPointer(x, y) {
    target.x = (x / cssW) * 2 - 1;
    target.y = 1 - (y / cssH) * 2;
    S.pointer.x = x / cssW;
    S.pointer.y = 1 - y / cssH;
    S.pointer.active = true;
  }
  w.addEventListener('pointermove', function (e) { setPointer(e.clientX, e.clientY); }, { passive: true });
  w.addEventListener('pointerdown', function (e) { setPointer(e.clientX, e.clientY); }, { passive: true });
  w.addEventListener('pointerleave', function () { S.pointer.active = false; });
  w.addEventListener('touchmove', function (e) {
    if (e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  /* ------------------------------------------------------------ the loop */
  var last = 0, realDt = 1/60, acc = 0, frames = 0, fpsT = 0, warmAt = -1, sinceSwitch = 0, fast = 0;

  d.addEventListener("visibilitychange",function(){last=0;frames=0;acc=0;fast=0;});

  function tick(now) {
    requestAnimationFrame(tick);
    if (!E.playing) { last = now; return; }
    realDt = last ? Math.max(.001,(now-last)/1000) : 1/60;
    var dt = Math.min(realDt,1/20);
    last = now;
    if (d.hidden) return;
    if(E.pendingResize){E.pendingResize=false;resize();}
    if (E.paused && !E.needsDraw) return;
    E.needsDraw = false;
    draw(E.paused ? 0 : dt, now);
  }

  function draw(dt, now) {
    E.gt += dt;
    var ex = w.Experience ? w.Experience.advance(dt) : null;
    S.experience = ex;
    S.detail = ex ? ex.detail : 1; S.density = ex ? ex.density : 1;
    S.dt = dt * (ex ? ex.motion : 1);
    S.energy = ex ? ex.energy : .5+.5*Math.sin(E.gt*.29);

    // smoothed pointer
    S.mouse.x += (target.x - S.mouse.x) * (1-Math.exp(-dt*3.2));
    S.mouse.y += (target.y - S.mouse.y) * (1-Math.exp(-dt*3.2));

    if (!E.paused) {
      E.t += Math.min(realDt,1);
      E.artT += S.dt*(.85+.3*S.energy);
      sinceSwitch += dt;
    }
    if (E.paused) E.revealComplete = true;
    E.fade = E.revealComplete ? 1 : Math.min(1, E.t / 1.25);
    S.t = E.artT;
    S.fade = E.fade;
    if(w.Soundscape) w.Soundscape.update(S,E.designs[E.index]);

    var design = E.designs[E.index];
    if (!design) return;

    // warm the next world before it is needed, so the cut never stutters
    if (!E.paused && !E.lingering && sinceSwitch > E.dwell * 0.55 && warmAt !== E.index) {
      warmAt = E.index;
      var nx = E.designs[(E.index + 1) % E.designs.length];
      if (nx) setTimeout(function () { ensure(nx); }, 30);
    }

    try {
      if (design.kind === 'gl' && design.prog) {
        R.blit(design.prog, null, {
          uRes: [cGL.width, cGL.height], uTime: S.t, uDt: dt,
          uFade: E.fade, uMouse: [S.mouse.x, S.mouse.y],
          uEnergy: S.energy, uRand: S.seed,
          uPulse:ex?ex.pulse:.5,uIntensity:ex?ex.intensity:.65,uDetail:S.detail,uDensity:S.density,
          uNovelty:ex?ex.novelty:.7,uColorRange:ex?ex.color:1,uColorSafe:ex&&ex.colorSafe?1:0,
          uGrowth:ex?ex.growth:.65,uMutation:ex?ex.mutation:.5,uCoupling:ex?ex.coupling:.6,uLife:ex?ex.lifecycle:.55,
          uAtmosphere:ex?ex.atmosphere:.65,uSymmetry:ex?ex.symmetry:.5,uDrift:ex?ex.drift:.45,uAfterglow:ex?ex.afterglow:.55,
          uBass:ex?ex.bass:0,uMid:ex?ex.mid:0,uTreble:ex?ex.treble:0,uOnset:ex?ex.onset:0,uStereo:ex?ex.stereo:0
        });
      } else if (design.kind === 'glx') {
        design.frame(R, S);
      } else if (design.kind === '2d') {
        design.frame(S);
      }
    } catch (err) {
      console.error('[cabinet] ' + design.id + ' crashed', err);
      E.broken[design.id] = true;
      show(E.index + 1);
    }

    transitions.render(design.kind==='2d'?c2D:cGL,E.paused?0:Math.min(realDt,1),w.Experience.getSettings());

    // cycle
    if (!E.paused && !E.lingering && (!ex || ex.mode !== 'manual') && E.t - E.cycleOffset > E.dwell) {
      show(w.Experience ? w.Experience.choose(E.designs,E.index) : E.index + 1);
      sinceSwitch = 0;
      warmAt = -1;
    }
    var prog = Math.max(0, Math.min(1, (E.t - E.cycleOffset) / E.dwell));
    cycleBar.style.width = (E.lingering ? 0 : prog) * 100 + '%';

    // adaptive resolution
    frames++; acc += realDt;
    if (acc > 1.2) {
      var fps = frames / acc;
      if(w.Experience) w.Experience.performanceSample(fps,1000/fps);
      if (statFps) statFps.textContent = fps.toFixed(0) + ' fps';
      var qualityMode=w.Experience?w.Experience.getSettings().quality:'auto';
      if(qualityMode!=='auto'){E.scale={high:1,balanced:.8,economy:.6}[qualityMode];E.pendingResize=true;}
      else if (fps < 40 && E.scale > 0.52) { E.scale = Math.max(0.5, E.scale - 0.12); E.pendingResize=true; fast = 0; }
      else if (fps > 57 && E.scale < 1) { fast++; E.scale = Math.min(1, E.scale + (fast > 1 ? 0.12 : 0.05)); E.pendingResize=true; }
      else fast = 0;
      if(w.Experience && qualityMode==='auto') E.pendingResize=true;
      frames = 0; acc = 0;
    }
  }

  /* --------------------------------------------------------- ambient interface */
  var idleTimer = 0, keyboardUI = false;
  E.idleDelay = 3500;
  function wakeUI() {
    d.body.classList.remove('is-idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function(){
      if (gal.classList.contains('on') || (w.Experience && w.Experience.isOpen()) || keyboardUI) { wakeUI(); return; }
      d.body.classList.add('is-idle');
      tip.classList.remove('on');
    }, E.idleDelay);
  }
  w.addEventListener('pointermove', function(){keyboardUI=false;wakeUI();}, {passive:true});
  w.addEventListener('pointerdown', function(){keyboardUI=false;wakeUI();}, {passive:true});
  w.addEventListener('wheel', wakeUI, {passive:true});
  w.addEventListener('keydown', function(e){if(!e.ctrlKey&&!e.metaKey&&!e.altKey){keyboardUI=e.key==='Tab';wakeUI();}});
  d.addEventListener('focusin', wakeUI);

  /* ----------------------------------------------------------------- boot */
  function start() {
    if (E.playing) return;
    E.playing = true;
    resize();
    show(0, { snapshot: false });
    draw(1 / 60, performance.now());      // paint immediately; no entry screen or user gesture
    wakeUI();
  }

  if (galFilters) {
    galFilters.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.chip') : null;
      if (b) applyFilter(b.getAttribute('data-filter'));
    });
  }

  buildRail();
  buildGallery();
  start();
  requestAnimationFrame(tick);

  // expose for tweaking from the console
  w.Cabinet = E;
  w.Cabinet.show = show;
  w.Cabinet.wakeUI = wakeUI;
  w.Cabinet.resize=resize;w.Cabinet.closeGallery=closeGal;w.Cabinet.setImmersive=setImmersive;
  if(w.Experience) w.Experience.mount(E);
})(window, document);
