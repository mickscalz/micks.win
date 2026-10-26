/* ============================================================================
   WORLDS DRAWN WITH THE 2D CONTEXT
   09 Strange Attractor · 14 Electric Storm · 16 Cosmic Web · 19 Ink Bloom
   21 Firefly Deep      · 22 Digital Rain  · 23 Particle Morph · 24 Silk Drape

   Contract:  init(S) / resize(S) / frame(S)   where S carries ctx, t, dt, w,
   h (CSS pixels), mouse (-1..1), pointer (0..1), fade, energy and seed.
   ========================================================================== */
(function (w) {
  'use strict';
  w.DESIGNS = w.DESIGNS || [];
  var D = w.D = w.D || function (o) { w.DESIGNS.push(o); return o; };

  /* tiny deterministic rng so a world always looks like itself */
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* ────────────────────────────  09 · STRANGE ATTRACTOR  ───────────────── */
  D({
    id: 'strange-attractor',
    edition: 1,
    preview: 'assets/previews/strange-attractor.webp',
    rank: 17,
    name: 'Strange Attractor',
    tag: 'aizawa system · 60k points',
    blurb: 'One equation, iterated sixty thousand times, that never repeats and never leaves. A shape that is only a path.',
    captivation: 81,
    art: 'radial-gradient(80% 80% at 50% 45%, #c9f7ff 0%, #4fd6ff 22%, #7a5bff 48%, #1b0a3a 76%, #04040c 100%)',
    kind: '2d',
    init: function (S) {
      // Aizawa — integrate once, keep the whole trajectory
      var a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1, dt = 0.0085;
      var x = 0.1, y = 0.0, z = 0.0, N = 60000;
      var px = new Float32Array(N), py = new Float32Array(N), pz = new Float32Array(N);
      var minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9, minz = 1e9, maxz = -1e9;
      for (var i = 0; i < N; i++) {
        var dx = (z - b) * x - d * y;
        var dy = d * x + (z - b) * y;
        var dz = c + a * z - z * z * z / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x;
        x += dx * dt; y += dy * dt; z += dz * dt;
        if (i < 200) { x = 0.1; y = 0; z = 0; }
        px[i] = x; py[i] = y; pz[i] = z;
        if (x < minx) minx = x; if (x > maxx) maxx = x;
        if (y < miny) miny = y; if (y > maxy) maxy = y;
        if (z < minz) minz = z; if (z > maxz) maxz = z;
      }
      // normalise into a unit-ish box
      var cx = (minx + maxx) / 2, cy = (miny + maxy) / 2, cz = (minz + maxz) / 2;
      var sc = 2 / Math.max(maxx - minx, maxy - miny, maxz - minz);
      for (i = 0; i < N; i++) { px[i] = (px[i] - cx) * sc; py[i] = (py[i] - cy) * sc; pz[i] = (pz[i] - cz) * sc; }
      this.px = px; this.py = py; this.pz = pz; this.N = N;
      this.buckets = 7;
    },
    frame: function (S) {
      var ctx = S.ctx, W = S.w, H = S.h, N = this.N;
      var t = S.t;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#04040c';
      ctx.fillRect(0, 0, W, H);

      var ang = t * 0.20 + S.mouse.x * 0.9;
      var til = 0.42 + 0.30 * Math.sin(t * 0.11) + S.mouse.y * 0.5;
      var ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(til), st = Math.sin(til);
      var scale = Math.min(W, H) * 0.40;
      var ox = W / 2, oy = H / 2;
      var camZ = 3.4, focal = 2.2;

      // the travelling pulse: a length of the trajectory lights up and moves
      var head = (t * 0.055) % 1;

      ctx.globalCompositeOperation = 'lighter';
      var B = this.buckets;
      // bucket by depth so we can batch one fill per depth slice
      var paths = [], i, b;
      for (b = 0; b < B; b++) paths.push([]);
      for (i = 0; i < N; i++) {
        var x = this.px[i], y = this.py[i], z = this.pz[i];
        // rotate about Y then tilt about X
        var x1 = x * ca + z * sa;
        var z1 = -x * sa + z * ca;
        var y1 = y * ct - z1 * st;
        var z2 = y * st + z1 * ct;
        var zc = z2 + camZ;
        if (zc < 0.35) continue;
        var k = focal / zc;
        var sx = ox + x1 * k * scale;
        var sy = oy - y1 * k * scale;
        if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
        var dep = clamp((zc - 1.2) / 4.2, 0, 0.999);
        paths[(dep * B) | 0].push(sx, sy, k);
      }

      for (b = 0; b < B; b++) {
        var arr = paths[b];
        if (!arr.length) continue;
        var depth = (b + 0.5) / B;
        var size = lerp(0.7, 2.5, depth) * (H / 900) * 1.4;
        var alpha = lerp(0.055, 0.42, depth);
        var hue = 190 + 80 * Math.sin(t * 0.09 + depth * 2.2);
        ctx.fillStyle = 'hsla(' + hue.toFixed(0) + ', 100%, ' + lerp(58, 80, depth).toFixed(0) + '%, ' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        for (i = 0; i < arr.length; i += 3) ctx.rect(arr[i], arr[i + 1], size, size);
        ctx.fill();
      }

      // the pulse: re-walk a short window of the trajectory as a bright ribbon
      var idx0 = (head * N) | 0, len = 2400;
      ctx.lineWidth = Math.max(1, 1.4 * (H / 900));
      for (var seg = 0; seg < 3; seg++) {
        ctx.strokeStyle = 'rgba(' + (140 + seg * 40) + ',' + (220 + seg * 10) + ',255,' + (0.16 - seg * 0.045) + ')';
        ctx.beginPath();
        var started = false;
        for (i = 0; i < len; i++) {
          var j = (idx0 - i * (1 + seg)) % N; if (j < 0) j += N;
          var X = this.px[j], Y = this.py[j], Z = this.pz[j];
          var X1 = X * ca + Z * sa, Z1 = -X * sa + Z * ca;
          var Y1 = Y * ct - Z1 * st, Z2 = Y * st + Z1 * ct;
          var ZC = Z2 + camZ; if (ZC < 0.35) { started = false; continue; }
          var K = focal / ZC;
          var SX = ox + X1 * K * scale, SY = oy - Y1 * K * scale;
          if (!started) { ctx.moveTo(SX, SY); started = true; } else ctx.lineTo(SX, SY);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /* ──────────────────────────────  14 · ELECTRIC STORM  ────────────────── */
  D({
    id: 'electric-storm',
    edition: 1,
    preview: 'assets/previews/electric-storm.webp',
    rank: 24,
    name: 'Electric Storm',
    tag: 'fractal lightning · wet city light',
    blurb: 'Every bolt is generated, not played back — a line broken against itself until it looks like the sky deciding where to fall.',
    captivation: 72,
    art: 'linear-gradient(180deg, #05070f 0%, #16203a 34%, #33406b 56%, #6f7fb5 68%, #dfe9ff 76%, #0a0d18 100%)',
    kind: '2d',
    init: function (S) {
      this.bolts = [];
      this.next = 0;
      this.flash = 0;
      this.drops = [];
      var i;
      for (i = 0; i < 260; i++) {
        this.drops.push({ x: Math.random(), y: Math.random(), v: 0.55 + Math.random() * 0.9, l: 0.02 + Math.random() * 0.05, a: 0.10 + Math.random() * 0.30 });
      }
      this.skyline = [];
      var r = rng(99);
      var x = 0;
      while (x < 1.25) {
        var wd = 0.02 + r() * 0.07;
        this.skyline.push({ x: x, w: wd, h: 0.10 + r() * 0.34, lit: r() });
        x += wd + r() * 0.02;
      }
      this.buildSkyline(S);
    },
    buildSkyline: function (S) {
      // one off-screen render: the city never changes, only the light on it
      var W = S.w, H = S.h, skyH = Math.max(40, Math.round(H * 0.46));
      var c = document.createElement('canvas');
      c.width = Math.max(2, Math.round(W));
      c.height = skyH;
      var g = c.getContext('2d');
      if (!g) { this.sky = null; return; }
      var i, b2, baseY = skyH;
      for (i = 0; i < this.skyline.length; i++) {
        b2 = this.skyline[i];
        var bx = b2.x * W, bw = Math.max(2, b2.w * W), bh = b2.h * H;
        g.fillStyle = '#04060d';
        g.fillRect(bx, baseY - bh, bw, bh);
        var cols = Math.max(1, (bw / 9) | 0), rows = Math.max(1, (bh / 13) | 0);
        g.fillStyle = 'rgba(255,206,140,' + (0.10 + 0.5 * b2.lit).toFixed(2) + ')';
        for (var cc = 0; cc < cols; cc++) {
          for (var rw = 0; rw < rows; rw++) {
            var hv = ((cc * 7 + rw * 13 + i * 31) % 23) / 23;
            if (hv > 0.62) continue;
            g.fillRect(bx + 3 + cc * 9, baseY - bh + 5 + rw * 13, 3, 5);
          }
        }
      }
      this.sky = c; this.skyH = skyH;
    },
    resize: function (S) { this.buildSkyline(S); },
    makeBolt: function (S, x0, y0, x1, y1, depth) {
      var pts = [{ x: x0, y: y0 }, { x: x1, y: y1 }];
      var iter = depth || 6, disp = 0.16;
      for (var it = 0; it < iter; it++) {
        var out = [pts[0]];
        for (var i = 0; i < pts.length - 1; i++) {
          var a = pts[i], b = pts[i + 1];
          var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          var dx = b.x - a.x, dy = b.y - a.y;
          var len = Math.hypot(dx, dy) || 1e-4;
          var nx = -dy / len, ny = dx / len;
          var off = (Math.random() - 0.5) * disp * len * 2.2;
          out.push({ x: mx + nx * off, y: my + ny * off });
          out.push(b);
        }
        pts = out; disp *= 0.62;
      }
      return pts;
    },
    frame: function (S) {
      var ctx = S.ctx, W = S.w, H = S.h, t = S.t, i;

      // sky
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#04050c');
      g.addColorStop(0.45, '#0a1020');
      g.addColorStop(0.72, '#141d33');
      g.addColorStop(0.80, '#2b3552');
      g.addColorStop(1, '#05070e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // cloud churn
      ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < 5; i++) {
        var cx = (0.5 + 0.55 * Math.sin(t * 0.05 + i * 1.7)) * W;
        var cy = H * (0.18 + 0.10 * Math.sin(t * 0.07 + i));
        var rr = H * (0.35 + 0.15 * Math.cos(t * 0.06 + i * 2.1));
        var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        var lit = 0.020 + 0.10 * this.flash;
        cg.addColorStop(0, 'rgba(' + (60 + 90 * this.flash) + ',' + (70 + 100 * this.flash) + ',120,' + lit.toFixed(3) + ')');
        cg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = cg;
        ctx.fillRect(0, 0, W, H * 0.9);
      }
      ctx.globalCompositeOperation = 'source-over';

      // spawn
      if (t > this.next) {
        this.next = t + 0.55 + Math.random() * 2.1;
        var bx = 0.08 + Math.random() * 0.84;
        var by = 0.72 + Math.random() * 0.22;
        var main = this.makeBolt(S, bx * W, -10, bx * W + (Math.random() - 0.5) * W * 0.35, by * H, 6);
        this.bolts.push({ pts: main, life: 1, w: 2.4 });
        var branches = 1 + (Math.random() * 3) | 0;
        for (i = 0; i < branches; i++) {
          var k = (0.25 + Math.random() * 0.6) | 0;
          var st = main[Math.min(main.length - 1, (main.length * (0.2 + Math.random() * 0.6)) | 0)];
          var ex = st.x + (Math.random() - 0.5) * W * 0.4;
          var ey = st.y + (0.1 + Math.random() * 0.4) * H;
          this.bolts.push({ pts: this.makeBolt(S, st.x, st.y, ex, ey, 4), life: 1, w: 1.1 });
        }
        this.flash = Math.min(1.4, this.flash + 0.85 + Math.random() * 0.5);
      }

      // bolts
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (i = this.bolts.length - 1; i >= 0; i--) {
        var B = this.bolts[i];
        B.life -= S.dt * (2.6 + Math.random() * 2.0);
        if (B.life <= 0) { this.bolts.splice(i, 1); continue; }
        var a = clamp(B.life, 0, 1);
        var pts = B.pts;
        // outer glow
        ctx.strokeStyle = 'rgba(90,150,255,' + (0.10 * a).toFixed(3) + ')';
        ctx.lineWidth = B.w * 7;
        ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
        for (var p = 1; p < pts.length; p++) ctx.lineTo(pts[p].x, pts[p].y);
        ctx.stroke();
        // core
        ctx.strokeStyle = 'rgba(200,230,255,' + (0.55 * a).toFixed(3) + ')';
        ctx.lineWidth = B.w * 1.6;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.9 * a).toFixed(3) + ')';
        ctx.lineWidth = B.w * 0.6;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';

      // rain
      ctx.strokeStyle = 'rgba(150,180,230,0.20)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (i = 0; i < this.drops.length; i++) {
        var d = this.drops[i];
        d.y += d.v * S.dt * 1.35; d.x += 0.02 * S.dt;
        if (d.y > 1) { d.y = -0.05 - Math.random() * 0.2; d.x = Math.random(); }
        var X = d.x * W, Y = d.y * H;
        ctx.moveTo(X, Y); ctx.lineTo(X - 3, Y + d.l * H);
      }
      ctx.stroke();

      // skyline (pre-rendered; the flash re-lights it)
      var baseY = H * 0.86;
      if (this.sky) {
        ctx.drawImage(this.sky, 0, baseY - this.skyH);
        if (this.flash > 0.02) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = Math.min(0.5, 0.30 * this.flash);
          ctx.drawImage(this.sky, 0, baseY - this.skyH);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';
        }
      }
      // wet street reflection
      var rg = ctx.createLinearGradient(0, baseY, 0, H);
      rg.addColorStop(0, 'rgba(120,150,220,0.16)');
      rg.addColorStop(1, 'rgba(4,6,13,1)');
      ctx.fillStyle = rg;
      ctx.fillRect(0, baseY, W, H - baseY);

      // global flash
      if (this.flash > 0.001) {
        ctx.fillStyle = 'rgba(150,190,255,' + (0.10 * this.flash).toFixed(3) + ')';
        ctx.fillRect(0, 0, W, H);
        this.flash *= Math.pow(0.02, S.dt);
      }
    }
  });

  /* ───────────────────────────────  16 · COSMIC WEB  ───────────────────── */
  D({
    id: 'cosmic-web',
    edition: 1,
    preview: 'assets/previews/cosmic-web.webp',
    rank: 27,
    name: 'Cosmic Web',
    tag: 'filamentary structure · depth parallax',
    blurb: 'The largest structure there is: galaxies threaded on filaments, and the filaments are only the seen part of the dark.',
    captivation: 69,
    art: 'radial-gradient(90% 90% at 60% 40%, #1b2f6b 0%, #2b1a5c 30%, #6a2b8f 52%, #120a2e 78%, #04040c 100%)',
    kind: '2d',
    init: function (S) {
      var r = rng(7), i;
      this.nodes = [];
      var N = 150;
      for (i = 0; i < N; i++) {
        // clustered: half in a few blob centres, half uniform
        var x, y, z;
        if (i % 3 === 0) {
          var cl = this.clusters = this.clusters || [];
          var ci = (Math.random() * 5) | 0;
          x = (r() - 0.5) * 2.4; y = (r() - 0.5) * 2.4; z = (r() - 0.5) * 2.4;
        } else {
          x = (r() - 0.5) * 6.0; y = (r() - 0.5) * 4.2; z = (r() - 0.5) * 6.0;
        }
        this.nodes.push({ x: x, y: y, z: z, m: 0.4 + r() * 1.6, ph: r() * 6.28 });
      }
      this.edges = [];
      for (i = 0; i < N; i++) {
        for (var j = i + 1; j < N; j++) {
          var a = this.nodes[i], b = this.nodes[j];
          var dd = (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) + (a.z - b.z) * (a.z - b.z);
          if (dd < 0.92) this.edges.push({ a: i, b: j, d: Math.sqrt(dd), ph: r() * 6.28 });
        }
      }
      this.pulses = [];
      for (i = 0; i < 26; i++) this.pulses.push({ e: (r() * this.edges.length) | 0, s: r(), v: 0.06 + r() * 0.16 });
    },
    frame: function (S) {
      var ctx = S.ctx, W = S.w, H = S.h, t = S.t, i;
      var g = ctx.createRadialGradient(W * 0.5, H * 0.48, 0, W * 0.5, H * 0.48, Math.max(W, H) * 0.78);
      g.addColorStop(0, '#0b0d22');
      g.addColorStop(0.55, '#070818');
      g.addColorStop(1, '#030309');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      var yaw = t * 0.075 + S.mouse.x * 0.5;
      var pitch = 0.22 + S.mouse.y * 0.35 + 0.10 * Math.sin(t * 0.07);
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      var camZ = 9.2, focal = 3.1, scale = Math.min(W, H) * 0.52;
      var ox = W / 2, oy = H / 2;

      function proj(n) {
        var x = n.x, y = n.y, z = n.z;
        var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
        var y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
        var zc = z2 + camZ;
        var k = focal / zc;
        return { x: ox + x1 * k * scale, y: oy - y1 * k * scale, k: k, z: zc };
      }

      var P = new Array(this.nodes.length);
      for (i = 0; i < this.nodes.length; i++) P[i] = proj(this.nodes[i]);

      ctx.globalCompositeOperation = 'lighter';

      // filaments
      for (i = 0; i < this.edges.length; i++) {
        var e = this.edges[i];
        var p1 = P[e.a], p2 = P[e.b];
        if (p1.z < 1 || p2.z < 1) continue;
        var dep = clamp(1 - (p1.z + p2.z) * 0.5 / 14, 0, 1);
        var a = 0.030 + 0.16 * Math.pow(dep, 2.2) * (0.55 + 0.45 * Math.sin(t * 0.5 + e.ph));
        if (a < 0.045) {
          ctx.strokeStyle = 'rgba(170,150,255,' + a.toFixed(3) + ')';   // cheap flat stroke
        } else {
          var lg = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          lg.addColorStop(0, 'rgba(120,150,255,' + (a * 1.4).toFixed(3) + ')');
          lg.addColorStop(0.5, 'rgba(180,140,255,' + a.toFixed(3) + ')');
          lg.addColorStop(1, 'rgba(255,150,200,' + (a * 1.2).toFixed(3) + ')');
          ctx.strokeStyle = lg;
        }
        ctx.lineWidth = Math.max(0.4, dep * 1.9);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      }

      // travelling pulses of light along the filaments
      for (i = 0; i < this.pulses.length; i++) {
        var pu = this.pulses[i];
        pu.s += pu.v * S.dt;
        if (pu.s > 1) { pu.s -= 1; pu.e = (Math.random() * this.edges.length) | 0; }
        var ed = this.edges[pu.e]; if (!ed) continue;
        var q1 = P[ed.a], q2 = P[ed.b];
        if (q1.z < 1 || q2.z < 1) continue;
        var sxx = lerp(q1.x, q2.x, pu.s), syy = lerp(q1.y, q2.y, pu.s);
        var dep2 = clamp(1 - ((q1.z + q2.z) * 0.5) / 14, 0, 1);
        var rr = (2.0 + 4.5 * dep2) * (H / 900) * 2;
        var pg = ctx.createRadialGradient(sxx, syy, 0, sxx, syy, rr);
        pg.addColorStop(0, 'rgba(255,255,255,' + (0.55 * dep2).toFixed(3) + ')');
        pg.addColorStop(0.4, 'rgba(150,200,255,' + (0.22 * dep2).toFixed(3) + ')');
        pg.addColorStop(1, 'rgba(90,120,255,0)');
        ctx.fillStyle = pg;
        ctx.beginPath(); ctx.arc(sxx, syy, rr, 0, 6.2832); ctx.fill();
      }

      // nodes
      for (i = 0; i < this.nodes.length; i++) {
        var n = this.nodes[i], p = P[i];
        if (p.z < 1) continue;
        var dep3 = clamp(1 - p.z / 14, 0, 1);
        var tw = 0.6 + 0.4 * Math.sin(t * 1.6 + n.ph);
        var rad = (1.4 + n.m * 3.4 * dep3) * (H / 900) * 2.0 * tw;
        if (rad < 0.4) continue;
        var ng = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
        ng.addColorStop(0, 'rgba(255,255,255,' + (0.75 * dep3).toFixed(3) + ')');
        ng.addColorStop(0.28, 'rgba(190,215,255,' + (0.30 * dep3).toFixed(3) + ')');
        ng.addColorStop(1, 'rgba(80,110,255,0)');
        ctx.fillStyle = ng;
        ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, 6.2832); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /* ────────────────────────────────  19 · INK BLOOM  ───────────────────── */
  D({
    id: 'ink-bloom',
    edition: 1,
    preview: 'assets/previews/ink-bloom.webp',
    rank: 32,
    name: 'Ink Bloom',
    tag: 'metaball diffusion · gold on black',
    blurb: 'Drop ink into still water and it does not mix — it unfolds. This is that first second, held open indefinitely.',
    captivation: 63,
    art: 'radial-gradient(70% 70% at 40% 45%, #ffe6a8 0%, #e8a13c 18%, #b83a6b 42%, #3a1240 70%, #06030c 100%)',
    kind: '2d',
    init: function (S) {
      var r = rng(1234), i;
      this.blobs = [];
      for (i = 0; i < 26; i++) {
        this.blobs.push({
          a: r() * 6.283, r: 0.10 + r() * 0.34, sp: (0.02 + r() * 0.06) * (r() < 0.5 ? 1 : -1),
          size: 0.06 + r() * 0.16, hue: 20 + r() * 40, wob: r() * 6.283,
          rad: 0.0, ph: r() * 6.283
        });
      }
      this.dust = [];
      for (i = 0; i < 160; i++) this.dust.push({ a: r() * 6.283, r: 0.1 + r() * 0.9, s: 0.004 + r() * 0.012, sp: 0.05 + r() * 0.2 });
    },
    frame: function (S) {
      var ctx = S.ctx, W = S.w, H = S.h, t = S.t, i, j;
      var R = Math.max(W, H);
      ctx.fillStyle = '#05030a';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'lighter';
      var cx = W * 0.5, cy = H * 0.5;

      // ink bodies
      for (i = 0; i < this.blobs.length; i++) {
        var b = this.blobs[i];
        b.a += b.sp * S.dt;
        var rr = b.r * R * (0.55 + 0.45 * Math.sin(t * 0.21 + b.ph));
        var bx = cx + Math.cos(b.a + 0.4 * Math.sin(t * 0.13 + b.wob)) * rr;
        var by = cy + Math.sin(b.a * 1.13 + 0.4 * Math.cos(t * 0.17 + b.wob)) * rr * 0.72;
        b.rad = b.size * R * (0.75 + 0.35 * Math.sin(t * 0.4 + b.ph));
        b.sx = bx; b.sy = by;
        var g = ctx.createRadialGradient(bx, by, 0, bx, by, b.rad);
        var hue = (b.hue + 12 * Math.sin(t * 0.2 + b.ph)) % 360;
        g.addColorStop(0, 'hsla(' + hue + ', 92%, 62%, 0.42)');
        g.addColorStop(0.35, 'hsla(' + (hue - 12) + ', 88%, 46%, 0.20)');
        g.addColorStop(0.75, 'hsla(' + (hue - 30) + ', 80%, 30%, 0.07)');
        g.addColorStop(1, 'hsla(' + (hue - 40) + ', 70%, 20%, 0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(bx, by, b.rad, 0, 6.2832); ctx.fill();
      }

      // filaments between near neighbours
      ctx.lineCap = 'round';
      for (i = 0; i < this.blobs.length; i++) {
        for (j = i + 1; j < this.blobs.length; j++) {
          var A = this.blobs[i], B = this.blobs[j];
          var dx = A.sx - B.sx, dy = A.sy - B.sy;
          var d = Math.hypot(dx, dy);
          var lim = (A.rad + B.rad) * 0.95;
          if (d > lim || d < 1) continue;
          var al = (1 - d / lim) * 0.16;
          ctx.strokeStyle = 'hsla(' + ((A.hue + B.hue) / 2) + ', 90%, 60%, ' + al.toFixed(3) + ')';
          ctx.lineWidth = Math.max(0.5, (1 - d / lim) * 8);
          ctx.beginPath();
          ctx.moveTo(A.sx, A.sy);
          ctx.quadraticCurveTo((A.sx + B.sx) / 2 + (A.sy - B.sy) * 0.12, (A.sy + B.sy) / 2 + (B.sx - A.sx) * 0.12, B.sx, B.sy);
          ctx.stroke();
        }
      }

      // suspended dust
      for (i = 0; i < this.dust.length; i++) {
        var d2 = this.dust[i];
        d2.a += d2.sp * S.dt * 0.35;
        var X = cx + Math.cos(d2.a) * d2.r * R * 0.62;
        var Y = cy + Math.sin(d2.a * 1.2) * d2.r * R * 0.42;
        ctx.fillStyle = 'rgba(255,225,180,0.20)';
        var s = d2.s * R * 0.35;
        ctx.beginPath(); ctx.arc(X, Y, s, 0, 6.2832); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /* ──────────────────────────────  21 · FIREFLY DEEP  ──────────────────── */
  D({
    id: 'firefly-deep',
    edition: 1,
    preview: 'assets/previews/firefly-deep.webp',
    rank: 35,
    name: 'Firefly Deep',
    tag: 'bokeh depth of field · warm dusk',
    blurb: 'Ninety points of light, none of them in focus. The eye keeps trying anyway, which is the whole trick.',
    captivation: 60,
    art: 'radial-gradient(80% 80% at 50% 60%, #ffd88a 0%, #ff9e4d 16%, #6a3b8f 46%, #16123a 74%, #05040c 100%)',
    kind: '2d',
    init: function (S) {
      var r = rng(555), i;
      this.flies = [];
      for (i = 0; i < 92; i++) {
        this.flies.push({
          x: r(), y: r(), z: 0.15 + r() * 1.7,
          a: r() * 6.283, sp: 0.08 + r() * 0.30,
          hue: 34 + r() * 40, ph: r() * 6.283,
          drift: 0.3 + r() * 0.9, bob: 0.4 + r() * 1.4
        });
      }
      this.motes = [];
      for (i = 0; i < 120; i++) this.motes.push({ x: r(), y: r(), z: 0.2 + r() * 2.0, s: 0.5 + r() * 1.6, a: r() * 6.283 });
    },
    frame: function (S) {
      var ctx = S.ctx, W = S.w, H = S.h, t = S.t, i;
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#070516');
      g.addColorStop(0.35, '#160f2e');
      g.addColorStop(0.72, '#3a1f42');
      g.addColorStop(1, '#0a0512');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // mist bands
      ctx.globalCompositeOperation = 'lighter';
      var focus = 1.0 + 0.35 * Math.sin(t * 0.12);
      for (i = 0; i < 4; i++) {
        var yy = H * (0.35 + 0.18 * i + 0.03 * Math.sin(t * 0.05 + i));
        var mg = ctx.createLinearGradient(0, yy - H * 0.1, 0, yy + H * 0.1);
        mg.addColorStop(0, 'rgba(90,70,140,0)');
        mg.addColorStop(0.5, 'rgba(120,95,170,0.045)');
        mg.addColorStop(1, 'rgba(90,70,140,0)');
        ctx.fillStyle = mg;
        ctx.fillRect(0, yy - H * 0.1, W, H * 0.2);
      }

      var par = { x: S.mouse.x * 26, y: S.mouse.y * 18 };

      // motes (tiny dust catching light)
      for (i = 0; i < this.motes.length; i++) {
        var m = this.motes[i];
        var mz = m.z;
        var X = m.x * W + Math.sin(t * 0.08 + m.a) * 22 - par.x * (mz * 0.4);
        var Y = m.y * H + Math.cos(t * 0.06 + m.a) * 16 - par.y * (mz * 0.4);
        var blur = Math.abs(mz - focus);
        var rr = m.s * (1.0 + blur * 3.4) * (H / 900) * 2.2;
        ctx.fillStyle = 'rgba(255,220,170,' + (0.10 / (1 + blur * 2.2)).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(X, Y, rr, 0, 6.2832); ctx.fill();
      }

      // fireflies: bokeh discs — bright rim, hollow middle
      for (i = 0; i < this.flies.length; i++) {
        var f = this.flies[i];
        f.a += f.sp * S.dt * 0.35;
        var px = (f.x + Math.sin(f.a * 1.3 + f.ph) * 0.045 * f.drift);
        var py = (f.y + Math.cos(f.a * 0.9 + f.ph) * 0.035 * f.drift + Math.sin(t * 0.3 + f.ph) * 0.012 * f.bob);
        var X2 = ((px % 1) + 1) % 1;
        var Y2 = ((py % 1) + 1) % 1;
        var dep = f.z;
        var X3 = X2 * W - par.x * dep * 0.6 + (W * 0.5 - W * 0.5);
        var Y3 = Y2 * H - par.y * dep * 0.6;
        var blur2 = Math.abs(dep - focus);
        var rad = (2.2 + blur2 * 26) * (H / 900) * 2.4;
        var pulse = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * 1.1 + f.ph * 3.0), 2.0);
        var alpha = (0.16 + 0.5 * pulse) / (1 + blur2 * 1.5);
        var hue = f.hue + 10 * Math.sin(t * 0.2 + f.ph);

        var bg = ctx.createRadialGradient(X3, Y3, rad * 0.15, X3, Y3, rad);
        bg.addColorStop(0, 'hsla(' + hue + ', 100%, 72%, ' + (alpha * 0.35).toFixed(3) + ')');
        bg.addColorStop(0.62, 'hsla(' + hue + ', 100%, 66%, ' + (alpha * 0.55).toFixed(3) + ')');
        bg.addColorStop(0.88, 'hsla(' + (hue + 8) + ', 100%, 78%, ' + (alpha * 0.9).toFixed(3) + ')');
        bg.addColorStop(0.97, 'hsla(' + (hue + 14) + ', 100%, 86%, ' + (alpha * 0.6).toFixed(3) + ')');
        bg.addColorStop(1, 'hsla(' + hue + ', 100%, 70%, 0)');
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.arc(X3, Y3, rad, 0, 6.2832); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /* ───────────────────────────────  22 · DIGITAL RAIN  ─────────────────── */
  D({
    id: 'digital-rain',
    edition: 1,
    preview: 'assets/previews/digital-rain.webp',
    rank: 36,
    name: 'Digital Rain',
    tag: 'glyph cascade · depth & bleed',
    blurb: 'It is not code and it never was. It is the feeling of reading something that is reading you back.',
    captivation: 59,
    art: 'linear-gradient(180deg, #00110a 0%, #00331f 30%, #00d46a 62%, #b8ffe0 78%, #01120a 100%)',
    kind: '2d',
    GLYPHS: 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789<>=+*#$%&@',
    init: function (S) {
      this.cols = [];
      this.resize(S);
      this.sweep = 0;
    },
    resize: function (S) {
      var size = Math.max(12, Math.round(Math.min(S.w, S.h) / 42));
      this.size = size;
      var n = Math.ceil(S.w / size) + 2;
      this.cols = [];
      for (var i = 0; i < n; i++) {
        this.cols.push({
          y: Math.random() * -40,
          v: (6 + Math.random() * 26),
          len: (8 + Math.random() * 34) | 0,
          depth: Math.random(),
          chars: [],
          last: 0
        });
      }
      for (i = 0; i < n; i++) {
        var c = this.cols[i];
        for (var k = 0; k < 60; k++) c.chars.push(this.GLYPHS[(Math.random() * this.GLYPHS.length) | 0]);
      }
    },
    frame: function (S) {
      var ctx = S.ctx, W = S.w, H = S.h, t = S.t, i, k;
      ctx.fillStyle = 'rgba(1, 8, 5, 0.30)';
      ctx.fillRect(0, 0, W, H);

      var size = this.size;
      ctx.textBaseline = 'top';
      ctx.font = '300 ' + size + 'px "JetBrains Mono", ui-monospace, monospace';

      this.sweep += S.dt * 0.22;

      for (i = 0; i < this.cols.length; i++) {
        var c = this.cols[i];
        var depth = c.depth;
        var fs = size * (0.55 + depth * 0.85);
        var alpha = 0.20 + depth * 0.7;
        var x = i * size;
        c.y += c.v * S.dt * (0.45 + depth);
        if (c.y * size > H + c.len * size) { c.y = -Math.random() * 30; c.v = 6 + Math.random() * 26; }

        // scramble a glyph now and then
        if (t - c.last > 0.05 + depth * 0.1) {
          c.last = t;
          c.chars[(Math.random() * c.chars.length) | 0] = this.GLYPHS[(Math.random() * this.GLYPHS.length) | 0];
        }

        for (k = 0; k < c.len; k++) {
          var gi = ((c.y | 0) - k + 4000) % c.chars.length;
          var ch = c.chars[gi];
          var yy = (c.y - k) * size;
          if (yy < -size || yy > H) continue;
          var fade = 1 - k / c.len;
          var a = alpha * fade * fade;
          if (k === 0) {
            ctx.fillStyle = 'rgba(230, 255, 240, ' + Math.min(1, a * 2.4) + ')';
            ctx.shadowColor = 'rgba(120,255,180,0.9)';
            ctx.shadowBlur = 14;
          } else if (k < 4) {
            ctx.fillStyle = 'rgba(170, 255, 205, ' + a + ')';
            ctx.shadowBlur = 6;
          } else {
            var sweepBoost = 1 + 1.6 * Math.max(0, Math.sin((yy / H) * 3.0 - this.sweep * 6.0));
            ctx.fillStyle = 'rgba(' + (30 + 60 * (1 - fade)) + ', ' + (220 - 40 * (1 - fade)) + ', ' + (140 + 60 * fade) + ', ' + Math.min(1, a * sweepBoost) + ')';
            ctx.shadowBlur = 0;
          }
          ctx.fillText(ch, x, yy);
        }
        ctx.shadowBlur = 0;
      }

      // horizontal interference bar
      var by = ((this.sweep * 0.35) % 1) * H;
      var bg = ctx.createLinearGradient(0, by - H * 0.06, 0, by + H * 0.06);
      bg.addColorStop(0, 'rgba(120,255,190,0)');
      bg.addColorStop(0.5, 'rgba(120,255,190,0.05)');
      bg.addColorStop(1, 'rgba(120,255,190,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, by - H * 0.06, W, H * 0.12);
    }
  });

  /* ──────────────────────────────  23 · PARTICLE MORPH  ────────────────── */
  D({
    id: 'particle-morph',
    edition: 1,
    preview: 'assets/previews/particle-morph.webp',
    rank: 38,
    name: 'Particle Morph',
    tag: 'shape interpolation · your name in points',
    blurb: 'Three thousand points that cannot decide what they are. Every few seconds they agree on something new.',
    captivation: 56,
    art: 'radial-gradient(75% 75% at 50% 45%, #ffffff 0%, #8fd8ff 18%, #4d7bff 40%, #7a2bff 66%, #10052e 100%)',
    kind: '2d',
    init: function (S) {
      var N = 3200;
      this.N = N;
      this.shapes = [];
      var i;
      // sphere
      var sp = new Float32Array(N * 3);
      for (i = 0; i < N; i++) {
        var u = Math.random() * 2 - 1, th = Math.random() * 6.2832;
        var s = Math.sqrt(1 - u * u);
        sp[i * 3] = Math.cos(th) * s * 1.5; sp[i * 3 + 1] = u * 1.5; sp[i * 3 + 2] = Math.sin(th) * s * 1.5;
      }
      this.shapes.push(sp);
      // torus
      var to = new Float32Array(N * 3);
      for (i = 0; i < N; i++) {
        var a2 = Math.random() * 6.2832, b2 = Math.random() * 6.2832;
        var R = 1.45, r2 = 0.55;
        to[i * 3] = (R + r2 * Math.cos(b2)) * Math.cos(a2);
        to[i * 3 + 1] = r2 * Math.sin(b2);
        to[i * 3 + 2] = (R + r2 * Math.cos(b2)) * Math.sin(a2);
      }
      this.shapes.push(to);
      // helix / dna
      var he = new Float32Array(N * 3);
      for (i = 0; i < N; i++) {
        var f = i / N, ang = f * 26.0, strand = i % 2;
        he[i * 3] = Math.cos(ang + strand * 3.14159) * 1.05;
        he[i * 3 + 1] = (f - 0.5) * 3.4;
        he[i * 3 + 2] = Math.sin(ang + strand * 3.14159) * 1.05;
      }
      this.shapes.push(he);
      // grid wave
      var gr = new Float32Array(N * 3);
      var side = Math.ceil(Math.sqrt(N));
      for (i = 0; i < N; i++) {
        var gx = (i % side) / side - 0.5, gz = ((i / side) | 0) / side - 0.5;
        gr[i * 3] = gx * 3.4; gr[i * 3 + 1] = 0; gr[i * 3 + 2] = gz * 3.4;
      }
      this.shapes.push(gr);
      // text
      this.shapes.push(null);   // built lazily from a canvas
      this.textShape = null;
      this.cur = new Float32Array(N * 3);
      this.from = 0; this.to = 1; this.mix = 0;
      this.hold = 0;
      for (i = 0; i < N * 3; i++) this.cur[i] = sp[i];
    },
    buildText: function (S) {
      var N = this.N;
      var c = document.createElement('canvas');
      var wPx = 512, hPx = 160;
      c.width = wPx; c.height = hPx;
      var g = c.getContext('2d');
      g.fillStyle = '#fff';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '700 92px "Inter", system-ui, sans-serif';
      g.fillText('MICKS.WIN', wPx / 2, hPx / 2);
      var d = g.getImageData(0, 0, wPx, hPx).data;
      var pts = [];
      for (var y = 0; y < hPx; y += 2) {
        for (var x = 0; x < wPx; x += 2) {
          if (d[(y * wPx + x) * 4 + 3] > 128) pts.push([(x / wPx - 0.5) * 4.6, -(y / hPx - 0.5) * 1.44]);
        }
      }
      var out = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) {
        var p = pts[(Math.random() * pts.length) | 0] || [0, 0];
        out[i * 3] = p[0]; out[i * 3 + 1] = p[1]; out[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
      }
      return out;
    },
    frame: function (S) {
      var ctx = S.ctx, W = S.w, H = S.h, t = S.t, i;
      if (!this.textShape) { this.textShape = this.buildText(S); this.shapes[4] = this.textShape; }

      ctx.fillStyle = '#04040c';
      ctx.fillRect(0, 0, W, H);

      // morph state
      this.hold += S.dt;
      if (this.hold > 3.4) {
        this.hold = 0;
        this.from = this.to;
        this.to = (this.to + 1) % this.shapes.length;
        this.mix = 0;
        // re-randomise the target assignment so points travel
        this.perm = null;
      }
      this.mix = Math.min(1, this.mix + S.dt * 0.55);
      var e = this.mix < 0.5 ? 4 * this.mix * this.mix * this.mix : 1 - Math.pow(-2 * this.mix + 2, 3) / 2;

      var A = this.shapes[this.from], B = this.shapes[this.to];
      var N = this.N, cur = this.cur;
      var ang = t * 0.28 + S.mouse.x * 0.8;
      var tilt = 0.35 + S.mouse.y * 0.6;
      var ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(tilt), st = Math.sin(tilt);
      var camZ = 5.6, focal = 2.6, scale = Math.min(W, H) * 0.62;
      var ox = W / 2, oy = H / 2;

      ctx.globalCompositeOperation = 'lighter';
      for (var b = 0; b < 5; b++) ctx.beginPath();

      var bucketsX = [], bucketsY = [], bucketsA = [];
      for (b = 0; b < 5; b++) { bucketsX.push([]); bucketsY.push([]); bucketsA.push([]); }

      for (i = 0; i < N; i++) {
        var i3 = i * 3;
        var ax = A[i3], ay = A[i3 + 1], az = A[i3 + 2];
        var bx = B[i3], by = B[i3 + 1], bz = B[i3 + 2];
        // a little swirl during travel
        var swirl = Math.sin(e * 3.14159) * 0.45;
        var x = lerp(ax, bx, e) + Math.sin(i * 12.9898) * swirl * 0.20;
        var y = lerp(ay, by, e) + Math.cos(i * 78.233) * swirl * 0.20;
        var z = lerp(az, bz, e) + Math.sin(i * 39.425) * swirl * 0.20;
        cur[i3] = x; cur[i3 + 1] = y; cur[i3 + 2] = z;

        var x1 = x * ca + z * sa, z1 = -x * sa + z * ca;
        var y1 = y * ct - z1 * st, z2 = y * st + z1 * ct;
        var zc = z2 + camZ;
        if (zc < 0.5) continue;
        var k = focal / zc;
        var sx = ox + x1 * k * scale, sy = oy - y1 * k * scale;
        if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) continue;
        var dep = clamp(1 - (zc - 3.0) / 5.0, 0, 0.999);
        var bi = (dep * 5) | 0;
        bucketsX[bi].push(sx); bucketsY[bi].push(sy); bucketsA[bi].push(k);
      }

      for (b = 0; b < 5; b++) {
        var arr = bucketsX[b]; if (!arr.length) continue;
        var depth = (b + 0.5) / 5;
        var size = lerp(0.8, 2.6, depth) * (H / 900) * 1.6;
        var alpha = lerp(0.10, 0.55, depth);
        var hue = 205 + 60 * Math.sin(t * 0.13 + depth * 1.7);
        ctx.fillStyle = 'hsla(' + hue.toFixed(0) + ', 100%, ' + lerp(62, 85, depth).toFixed(0) + '%, ' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        for (i = 0; i < arr.length; i++) ctx.rect(bucketsX[b][i], bucketsY[b][i], size, size);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /* ────────────────────────────────  24 · SILK DRAPE  ──────────────────── */
  D({
    id: 'silk-drape',
    edition: 1,
    preview: 'assets/previews/silk-drape.webp',
    rank: 39,
    name: 'Silk Drape',
    tag: 'layered gradient cloth · specular sheen',
    blurb: 'Seven sheets of colour falling through each other. The light does not reflect off them so much as get caught.',
    captivation: 55,
    art: 'linear-gradient(115deg, #1a0b3a 0%, #4b1c8f 22%, #b6369e 44%, #ff6b6b 62%, #ffd08a 80%, #2a0f3a 100%)',
    kind: '2d',
    init: function (S) {
      this.layers = [];
      var hues = [268, 292, 322, 348, 22, 44, 190];
      for (var i = 0; i < 7; i++) {
        this.layers.push({
          h: hues[i],
          ph: i * 0.9,
          amp: 0.055 + i * 0.012,
          fq: 1.0 + i * 0.42,
          sp: 0.10 + i * 0.045,
          yOff: -0.06 + i * 0.052,
          a: 0.30 - i * 0.022
        });
      }
    },
    frame: function (S) {
      var ctx = S.ctx, W = S.w, H = S.h, t = S.t, i, x;
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0a0418');
      g.addColorStop(0.5, '#160a2c');
      g.addColorStop(1, '#05030e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'lighter';
      var steps = 64;
      for (i = 0; i < this.layers.length; i++) {
        var L = this.layers[i];
        var pts = [];
        for (var s = 0; s <= steps; s++) {
          var u = s / steps;
          x = u * W;
          var y = H * (0.52 + L.yOff)
            + Math.sin(u * L.fq * 4.2 + t * L.sp * 3.0 + L.ph) * H * L.amp
            + Math.sin(u * L.fq * 9.1 - t * L.sp * 1.7 + L.ph * 2.1) * H * L.amp * 0.42
            + Math.sin(u * L.fq * 2.1 + t * L.sp * 0.9) * H * L.amp * 0.8;
          pts.push(x, y);
        }
        ctx.beginPath();
        ctx.moveTo(0, H + 10);
        for (s = 0; s <= steps; s++) ctx.lineTo(pts[s * 2], pts[s * 2 + 1]);
        ctx.lineTo(W, H + 10);
        ctx.closePath();

        var lg = ctx.createLinearGradient(0, H * 0.25, W, H * 0.9);
        var hh = (L.h + 14 * Math.sin(t * 0.10 + i)) % 360;
        lg.addColorStop(0, 'hsla(' + hh + ', 88%, 32%, ' + (L.a * 0.55).toFixed(3) + ')');
        lg.addColorStop(0.35, 'hsla(' + ((hh + 18) % 360) + ', 92%, 52%, ' + (L.a * 0.85).toFixed(3) + ')');
        lg.addColorStop(0.62, 'hsla(' + ((hh + 40) % 360) + ', 96%, 66%, ' + (L.a * 0.75).toFixed(3) + ')');
        lg.addColorStop(1, 'hsla(' + ((hh + 60) % 360) + ', 90%, 42%, ' + (L.a * 0.35).toFixed(3) + ')');
        ctx.fillStyle = lg;
        ctx.fill();

        // specular edge along the crest
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (s = 1; s <= steps; s++) ctx.lineTo(pts[s * 2], pts[s * 2 + 1]);
        ctx.strokeStyle = 'hsla(' + ((hh + 50) % 360) + ', 100%, 88%, ' + (0.10 + 0.10 * Math.sin(t * 0.6 + i)).toFixed(3) + ')';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // drifting specular dust
      for (i = 0; i < 70; i++) {
        var a = i * 0.9 + t * 0.05;
        var X = (0.5 + 0.48 * Math.sin(a * 1.3 + i)) * W;
        var Y = (0.5 + 0.42 * Math.cos(a * 0.9 + i * 2.1)) * H;
        var rr = (0.6 + 2.2 * (0.5 + 0.5 * Math.sin(t * 1.4 + i))) * (H / 900) * 1.6;
        var dg = ctx.createRadialGradient(X, Y, 0, X, Y, rr * 4);
        dg.addColorStop(0, 'rgba(255,244,220,0.55)');
        dg.addColorStop(1, 'rgba(255,220,180,0)');
        ctx.fillStyle = dg;
        ctx.beginPath(); ctx.arc(X, Y, rr * 4, 0, 6.2832); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });

})(window);
