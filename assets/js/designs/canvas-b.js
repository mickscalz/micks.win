/* ============================================================================
   THE FIFTH WING — worlds 39–46.
   Eight canvas-2D rooms. Deliberately no two share a drawing primitive:
   accumulated pen strokes, a discrete Fourier transform, a projected
   non-orientable surface, recursion, tiled arcs, a falling-sand automaton,
   a precomputed interference LUT, and a hypotrochoid.

   Contract: init(S) / optional resize(S,w,h) / frame(S).
   S = { ctx, t, dt, w, h, mouse, pointer, fade, energy, seed }.
   ========================================================================== */
(function (w) {
  'use strict';
  w.DESIGNS = w.DESIGNS || [];
  var D = w.D = w.D || function (o) { w.DESIGNS.push(o); return o; };
  var TAU = Math.PI * 2;
  var doc = w.document;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  function buffer(wd, ht) {
    var c = doc.createElement('canvas');
    c.width = Math.max(1, wd | 0); c.height = Math.max(1, ht | 0);
    return c;
  }
  function fadeIn(g, W, H, amount) {
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    g.fillStyle = 'rgba(4,4,10,' + amount + ')';
    g.fillRect(0, 0, W, H);
  }

  /* ──────────────────────────  39 · HARMONOGRAPH  ──────────────────────── */
  D({
    id: 'harmonograph',
    preview: 'assets/previews/harmonograph.webp',
    rank: 37,
    name: 'Harmonograph',
    tag: 'three pendulums · long exposure',
    blurb: 'Three pendulums swinging at frequencies that almost, but never quite, agree. The pen never lifts and the paper never forgets.',
    captivation: 57,
    art: 'radial-gradient(90% 90% at 50% 50%, #ffd7e8 0%, #d67fc8 18%, #7b58c8 46%, #21144a 76%, #05040e 100%)',
    kind: '2d',
    init: function (S) {
      this.buf = buffer(1100, 700);
      this.g = this.buf.getContext('2d');
      this.g.fillStyle = '#04040a';
      this.g.fillRect(0, 0, this.buf.width, this.buf.height);
      this.phase = 0;
      this.prev = null;
      // A luminous opening plate; the live pendulums keep drawing over it.
      var g = this.g, W = this.buf.width, H = this.buf.height;
      g.globalCompositeOperation = 'lighter';
      for (var band = 0; band < 32; band++) {
        g.strokeStyle = 'hsla(' + (195 + band * 3) + ',90%,70%,0.16)';
        g.lineWidth = 0.9; g.beginPath();
        for (var j = 0; j <= 200; j++) {
          var ph = band * 2.2 + j * 0.011;
          var xx = Math.sin(ph * 2 + 0.3) * 0.44 + Math.sin(ph * 3.0027 + 1.1) * 0.21;
          var yy = Math.sin(ph * 2.9983) * 0.44 + Math.sin(ph * 4.0071 + 0.22) * 0.21;
          var X = W * 0.5 + xx * W * 0.48, Y = H * 0.5 + yy * H * 0.48;
          if (j === 0) g.moveTo(X,Y); else g.lineTo(X,Y);
        }
        g.stroke();
      }
      g.globalCompositeOperation = 'source-over';
    },
    frame: function (S) {
      var g = this.g, W = this.buf.width, H = this.buf.height, ctx = S.ctx;
      fadeIn(g, W, H, 0.004);
      g.globalCompositeOperation = 'lighter';
      var t0 = this.phase, N = 74, step = 0.016;
      var hue = (195 + S.t * 11) % 360;
      g.strokeStyle = 'hsla(' + hue.toFixed(0) + ',88%,68%,0.48)';
      g.lineWidth = 1.15;
      g.beginPath();
      for (var i = 0; i <= N; i++) {
        var t = t0 + i * step;
        var e = Math.exp(-t * 0.00028);
        var x = (Math.sin(t * 2.0000 + 0.30) * 0.44 + Math.sin(t * 3.0027 + 1.10) * 0.21 + Math.sin(t * 5.0011 + 2.2) * 0.055) * e;
        var y = (Math.sin(t * 2.9983) * 0.44 + Math.sin(t * 4.0071 + 0.22) * 0.21 + Math.sin(t * 4.9973 + 1.7) * 0.055) * e;
        var px = W * 0.5 + x * W * 0.48 + S.mouse.x * 6;
        var py = H * 0.5 + y * H * 0.48 + S.mouse.y * 6;
        if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.stroke();
      this.phase += N * step;
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = S.fade;
      ctx.fillStyle = '#04040a';
      ctx.fillRect(0, 0, S.w, S.h);
      ctx.drawImage(this.buf, 0, 0, S.w, S.h);
      ctx.globalAlpha = 1;
    }
  });

  /* ────────────────────────  40 · FOURIER EPICYCLES  ───────────────────── */
  D({
    id: 'fourier-epicycles',
    preview: 'assets/previews/fourier-epicycles.webp',
    rank: 40,
    name: 'Fourier Epicycles',
    tag: 'discrete transform · drawing with circles',
    blurb: 'Any closed curve can be written as a sum of rotating circles. This one took 41 of them to say butterfly.',
    captivation: 54,
    art: 'radial-gradient(100% 100% at 50% 50%, #b9f5ff 0%, #4fb8e8 20%, #4b5cc8 48%, #1b1348 76%, #05040e 100%)',
    kind: '2d',
    init: function (S) {
      // sample the butterfly curve and take a small DFT
      var N = 256, k, i, pts = [], maxr = 0;
      for (k = 0; k < N; k++) {
        var a = k / N * TAU;
        var r = Math.exp(Math.sin(a)) - 2 * Math.cos(4 * a) + Math.pow(Math.sin((2 * a - Math.PI) / 24), 5);
        var x = r * Math.sin(a), y = -r * Math.cos(a);
        pts.push([x, y]);
        maxr = Math.max(maxr, Math.abs(x), Math.abs(y));
      }
      var scale = 1 / maxr;
      this.terms = [];
      var M = 96;
      for (i = -M; i <= M; i++) {
        var re = 0, im = 0;
        for (k = 0; k < N; k++) {
          var ph = -TAU * i * k / N;
          re += pts[k][0] * Math.cos(ph) - pts[k][1] * Math.sin(ph);
          im += pts[k][0] * Math.sin(ph) + pts[k][1] * Math.cos(ph);
        }
        re /= N; im /= N;
        this.terms.push({ f: i, re: re * scale, im: im * scale, a: Math.sqrt(re * re + im * im) * scale });
      }
      this.terms.sort(function (p, q) { return q.a - p.a; });
      this.terms = this.terms.slice(0, 41);
      this.buf = buffer(1100, 700);
      this.g = this.buf.getContext('2d');
      this.g.fillStyle = '#04040a';
      this.g.fillRect(0, 0, this.buf.width, this.buf.height);
      this.prev = null;
      // The completed curve is a faint blueprint behind the moving pen.
      var g = this.g, W = this.buf.width, H = this.buf.height, R = Math.min(W,H)*0.43;
      g.strokeStyle = 'rgba(90,160,240,0.32)'; g.lineWidth = 1.5; g.beginPath();
      for (var j = 0; j <= pts.length; j++) {
        var P = pts[j % pts.length];
        var X = W*0.5 + P[0]*scale*R, Y = H*0.52 + P[1]*scale*R;
        if (j === 0) g.moveTo(X,Y); else g.lineTo(X,Y);
      }
      g.stroke();
    },
    frame: function (S) {
      var g = this.g, W = this.buf.width, H = this.buf.height, ctx = S.ctx;
      var cx = W * 0.5, cy = H * 0.52, R = Math.min(W, H) * 0.43;
      var theta = S.t * TAU * 0.11;
      var terms = this.terms, n = terms.length, i;

      fadeIn(g, W, H, 0.0008);
      g.globalCompositeOperation = 'lighter';

      // epicycle chain
      var x = cx, y = cy;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#04040a';
      ctx.fillRect(0, 0, S.w, S.h);
      ctx.drawImage(this.buf, 0, 0, S.w, S.h);

      ctx.save();
      ctx.scale(S.w / W, S.h / H);
      for (i = 0; i < n; i++) {
        var tm = terms[i];
        var ang = tm.f * theta;
        var ca = Math.cos(ang), sa = Math.sin(ang);
        var vx = tm.re * ca - tm.im * sa;
        var vy = tm.re * sa + tm.im * ca;
        var nx = x + vx * R, ny = y + vy * R;
        if (i < 24) {
          ctx.strokeStyle = 'rgba(140,180,255,' + (0.11 * (1 - i / 26)).toFixed(3) + ')';
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.arc(x, y, tm.a * R, 0, TAU); ctx.stroke();
          ctx.strokeStyle = 'rgba(190,220,255,0.16)';
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
        }
        x = nx; y = ny;
      }
      ctx.restore();

      // trace on the persistent buffer
      if (this.prev) {
        g.strokeStyle = 'hsla(' + ((S.t * 22) % 360).toFixed(0) + ',95%,72%,0.55)';
        g.lineWidth = 2.0;
        g.beginPath(); g.moveTo(this.prev[0], this.prev[1]); g.lineTo(x, y); g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.16)';
        g.lineWidth = 6.0;
        g.beginPath(); g.moveTo(this.prev[0], this.prev[1]); g.lineTo(x, y); g.stroke();
      }
      this.prev = [x, y];
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(x / W * S.w, y / H * S.h, 3.2, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.75 * S.fade).toFixed(2) + ')';
      ctx.fill();
    }
  });

  /* ──────────────────────────  41 · MÖBIUS BLOOM  ──────────────────────── */
  D({
    id: 'mobius-bloom',
    preview: 'assets/previews/mobius-bloom.webp',
    rank: 41,
    name: 'Möbius Bloom',
    tag: 'non-orientable surface · projection',
    blurb: 'A surface with only one side and only one edge. Follow it all the way round and you arrive where you started, upside down.',
    captivation: 53,
    art: 'conic-gradient(from 0deg at 50% 50%, #ff7ad9, #ffcf7a, #7affc4, #7ac8ff, #b07aff, #ff7ad9)',
    kind: '2d',
    init: function (S) { this.quads = []; },
    frame: function (S) {
      var ctx = S.ctx, W = S.w, H = S.h;
      var t = S.t;
      var ry = t * 0.22 + S.mouse.x * 0.6, rx = 0.52 + 0.22 * Math.sin(t * 0.17) - S.mouse.y * 0.35;
      var cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
      var R = 1.0, halfW = 0.40, N = 168;
      var sc = Math.min(W, H) * 0.33;

      function project(u, v) {
        var c = Math.cos(u * 0.5), s = Math.sin(u * 0.5);
        var rr = R + v * halfW * c;
        var x = rr * Math.cos(u), y = v * halfW * s, z = rr * Math.sin(u);
        var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
        var y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
        var persp = 3.6 / (3.6 + z2 * 0.9);
        return [W * 0.5 + x1 * sc * persp, H * 0.5 + y1 * sc * persp, z2, persp];
      }

      ctx.fillStyle = '#04040a';
      ctx.fillRect(0, 0, W, H);
      var glow = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.5);
      glow.addColorStop(0, 'rgba(48,32,92,0.55)');
      glow.addColorStop(1, 'rgba(4,4,10,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

      var quads = this.quads; quads.length = 0;
      for (var i = 0; i < N; i++) {
        var u0 = i / N * TAU, u1 = (i + 1) / N * TAU;
        var a = project(u0, -1), b = project(u0, 1), c = project(u1, 1), d = project(u1, -1);
        quads.push({ a: a, b: b, c: c, d: d, z: (a[2] + b[2] + c[2] + d[2]) * 0.25, u: (u0 + u1) * 0.5 });
      }
      quads.sort(function (p, q) { return q.z - p.z; });

      for (var k = 0; k < quads.length; k++) {
        var Q = quads[k];
        var hue = (Q.u / TAU * 360 + t * 18) % 360;
        var lit = clamp(0.42 + 0.58 * (Q.z * 0.7 + 0.5), 0.12, 1.0);
        ctx.beginPath();
        ctx.moveTo(Q.a[0], Q.a[1]); ctx.lineTo(Q.b[0], Q.b[1]);
        ctx.lineTo(Q.c[0], Q.c[1]); ctx.lineTo(Q.d[0], Q.d[1]);
        ctx.closePath();
        ctx.fillStyle = 'hsla(' + hue.toFixed(0) + ',85%,' + (18 + 40 * lit).toFixed(0) + '%,' + (0.34 + 0.48 * lit).toFixed(2) + ')';
        ctx.fill();
        ctx.strokeStyle = 'hsla(' + hue.toFixed(0) + ',95%,78%,0.10)';
        ctx.lineWidth = 0.7; ctx.stroke();
      }

      // the single continuous edge
      ctx.globalCompositeOperation = 'lighter';
      for (var side = -1; side <= 1; side += 2) {
        ctx.beginPath();
        for (var j = 0; j <= N; j++) {
          var p = project(j / N * TAU, side);
          if (j === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
        }
        ctx.strokeStyle = 'rgba(190,225,255,0.30)';
        ctx.lineWidth = 1.1; ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /* ─────────────────────────  42 · FRACTAL CANOPY  ─────────────────────── */
  D({
    id: 'fractal-canopy',
    preview: 'assets/previews/fractal-canopy.webp',
    rank: 42,
    name: 'Fractal Canopy',
    tag: 'recursive growth · wind',
    blurb: 'A rule that says: grow, split in two, repeat. Nine generations later it has become a tree that has never existed anywhere.',
    captivation: 52,
    art: 'radial-gradient(100% 100% at 50% 85%, #ffd88a 0%, #c97a2c 20%, #6b4a3a 48%, #1a2430 76%, #05080e 100%)',
    kind: '2d',
    init: function (S) {
      var r = rng(4242);
      this.leaves = [];
      for (var i = 0; i < 150; i++) {
        this.leaves.push({ x: r(), y: r(), s: 0.5 + r(), ph: r() * TAU, sp: 0.4 + r() * 0.8 });
      }
    },
    branch: function (ctx, x, y, len, ang, depth, t, S) {
      if (depth > 9 || len < 2) return;
      var wind = Math.sin(t * 0.7 + depth * 0.55 + x * 0.004) * (0.030 + depth * 0.006);
      var a = ang + wind;
      var x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      var k = depth / 9;
      ctx.strokeStyle = 'hsla(' + (28 + 18 * k).toFixed(0) + ',' + (55 + 25 * k).toFixed(0) + '%,' +
        (16 + 40 * k).toFixed(0) + '%,' + (0.90 - 0.45 * k).toFixed(2) + ')';
      ctx.lineWidth = Math.max(0.7, (9 - depth) * 1.05);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();

      if (depth >= 7) {
        ctx.fillStyle = 'hsla(' + ((38 + 22 * Math.sin(t * 0.35 + x * 0.01)) % 360).toFixed(0) + ',88%,64%,0.55)';
        ctx.beginPath(); ctx.arc(x2, y2, 1.6 + 1.5 * Math.sin(t + x2 * 0.02), 0, TAU); ctx.fill();
      }
      var spread = 0.44 + 0.09 * Math.sin(t * 0.31 + depth);
      this.branch(ctx, x2, y2, len * 0.755, a - spread, depth + 1, t, S);
      this.branch(ctx, x2, y2, len * 0.755, a + spread * 0.94, depth + 1, t, S);
      if (depth > 3 && depth < 7) {
        this.branch(ctx, x2, y2, len * 0.60, a + 0.11 * Math.sin(t * 0.4 + depth), depth + 2, t, S);
      }
    },
    frame: function (S) {
      var ctx = S.ctx, W = S.w, H = S.h, i;
      ctx.fillStyle = '#04040a';
      ctx.fillRect(0, 0, W, H);
      var bg = ctx.createRadialGradient(W * 0.5, H * 0.82, 0, W * 0.5, H * 0.82, H * 0.9);
      bg.addColorStop(0, 'rgba(96,52,24,0.42)');
      bg.addColorStop(1, 'rgba(4,4,10,0)');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      var base = Math.min(H * 0.21, W * 0.14);
      this.branch(ctx, W * 0.5, H * 0.94, base, -Math.PI / 2, 0, S.t, S);

      ctx.globalCompositeOperation = 'lighter';
      for (i = 0; i < this.leaves.length; i++) {
        var L = this.leaves[i];
        var ly = ((L.y + S.t * 0.018 * L.sp) % 1) * H;
        var lx = (L.x + 0.045 * Math.sin(S.t * 0.5 * L.sp + L.ph)) * W;
        ctx.fillStyle = 'rgba(255,194,110,' + (0.16 * L.s).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(lx, ly, 1.0 + L.s * 1.4, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /* ──────────────────────────  43 · TRUCHET LOOPS  ─────────────────────── */
  D({
    id: 'truchet-loops',
    preview: 'assets/previews/truchet-loops.webp',
    rank: 43,
    name: 'Truchet Loops',
    tag: 'stochastic tiling · travelling light',
    blurb: 'One tile, two orientations, and a rule that says nothing about the whole. Yet the light always finds a way to make a loop.',
    captivation: 50,
    art: 'linear-gradient(135deg, #0a1630 0%, #17406b 40%, #2bb3c0 70%, #040a16 100%)',
    kind: '2d',
    init: function (S) {
      this.r = rng(8811);
      this.cols = 15; this.rows = 10;
      this.orient = [];
      for (var i = 0; i < this.cols * this.rows; i++) this.orient.push(this.r() < 0.5 ? 0 : 1);
      this.flip = new Float32Array(this.cols * this.rows);
      for (var j = 0; j < this.flip.length; j++) this.flip[j] = this.r() * 26;
    },
    frame: function (S) {
      var ctx = S.ctx, W = S.w, H = S.h, t = S.t;
      ctx.fillStyle = '#04070e';
      ctx.fillRect(0, 0, W, H);
      var size = Math.min(W / this.cols, H / this.rows);
      var ox = (W - size * this.cols) * 0.5, oy = (H - size * this.rows) * 0.5;
      var R = size * 0.5;

      for (var gy = 0; gy < this.rows; gy++) {
        for (var gx = 0; gx < this.cols; gx++) {
          var idx = gy * this.cols + gx;
          // each tile slowly flips its orientation, at its own moment
          var cycle = (t + this.flip[idx]) % 26;
          var o = this.orient[idx];
          if (cycle > 24.4) o = 1 - o;
          var x = ox + gx * size, y = oy + gy * size;
          var cx = x + R, cy = y + R;

          ctx.strokeStyle = 'rgba(90,140,190,0.20)';
          ctx.lineWidth = Math.max(1, size * 0.055);
          ctx.beginPath();
          if (o === 0) {
            ctx.arc(x, y, R, 0, Math.PI / 2);
            ctx.moveTo(x + size, y + size);
            ctx.arc(x + size, y + size, R, Math.PI, Math.PI * 1.5);
          } else {
            ctx.arc(x + size, y, R, Math.PI / 2, Math.PI);
            ctx.moveTo(x, y + size);
            ctx.arc(x, y + size, R, Math.PI * 1.5, TAU);
          }
          ctx.stroke();

          // a bead of light running along each arc
          ctx.globalCompositeOperation = 'lighter';
          var ph = (t * 0.62 + idx * 0.137) % 1;
          var ang = ph * Math.PI * 0.5;
          var bx, by;
          if (o === 0) {
            bx = x + R * Math.cos(ang); by = y + R * Math.sin(ang);
          } else {
            bx = x + size - R * Math.cos(ang); by = y + R * Math.sin(ang);
          }
          var hue = (190 + 55 * Math.sin(idx * 0.4 + t * 0.25)) % 360;
          ctx.fillStyle = 'hsla(' + hue.toFixed(0) + ',100%,72%,0.55)';
          ctx.beginPath(); ctx.arc(bx, by, Math.max(1.4, size * 0.055), 0, TAU); ctx.fill();
          var g2 = ctx.createRadialGradient(bx, by, 0, bx, by, size * 0.45);
          g2.addColorStop(0, 'hsla(' + hue.toFixed(0) + ',100%,70%,0.22)');
          g2.addColorStop(1, 'hsla(' + hue.toFixed(0) + ',100%,70%,0)');
          ctx.fillStyle = g2;
          ctx.beginPath(); ctx.arc(bx, by, size * 0.45, 0, TAU); ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
      }
    }
  });

  /* ────────────────────────────  44 · SANDFALL  ────────────────────────── */
  D({
    id: 'sandfall',
    preview: 'assets/previews/sandfall.webp',
    rank: 44,
    name: 'Sandfall',
    tag: 'cellular automaton · granular physics',
    blurb: 'One rule — a grain falls if it can, otherwise it slips sideways — and a million tiny decisions become dunes.',
    captivation: 49,
    art: 'linear-gradient(180deg, #2a1640 0%, #7a3a6a 35%, #d98a4a 65%, #f0c98a 85%, #100a18 100%)',
    kind: '2d',
    init: function (S) {
      this.GW = 168; this.GH = 104;
      this.grid = new Uint8Array(this.GW * this.GH);
      this.buf = buffer(this.GW, this.GH);
      this.g = this.buf.getContext('2d');
      this.img = this.g.createImageData(this.GW, this.GH);
      this.pal = [];
      var cols = [[10, 18, 38], [255, 106, 168], [255, 190, 96], [120, 232, 255], [255, 246, 214], [176, 116, 255]];
      for (var i = 0; i < cols.length; i++) this.pal.push(cols[i]);
      this.em = 0;
      for (var y = 68; y < this.GH; y++) {
        for (var x = 0; x < this.GW; x++) {
          var ridge = 79 + 7 * Math.sin(x * 0.055) + 5 * Math.sin(x * 0.12);
          if (y > ridge) this.grid[y * this.GW + x] = 2 + Math.floor((y + Math.sin(x*0.04)*9) / 7) % 4;
        }
      }
    },
    frame: function (S) {
      var GW = this.GW, GH = this.GH, G = this.grid, i, x, y, idx;
      // four emitters drifting across the ceiling
      this.em += S.dt;
      for (var e = 0; e < 4; e++) {
        var ex = Math.floor((0.2 + 0.15 * e + 0.16 * Math.sin(S.t * (0.21 + e * 0.07) + e * 2.1)) * GW);
        ex = clamp(ex, 0, GW - 1);
        for (var q = 0; q < 3; q++) {
          idx = q * GW + ex;
          if (G[idx] === 0) G[idx] = 2 + ((this.em * 0.4 + q + e) | 0) % 4;
        }
      }
      // bottom-up update with an alternating scan direction
      var leftFirst = (Math.floor(S.t * 60) % 2) === 0;
      for (y = GH - 2; y >= 0; y--) {
        for (var xo = 0; xo < GW; xo++) {
          x = leftFirst ? xo : (GW - 1 - xo);
          idx = y * GW + x;
          var v = G[idx];
          if (v === 0) continue;
          var below = idx + GW;
          if (G[below] === 0) { G[below] = v; G[idx] = 0; continue; }
          var dir = ((x * 7 + y * 13 + (Math.floor(S.t * 90) % 2)) & 1) ? 1 : -1;
          var nx = x + dir;
          if (nx >= 0 && nx < GW && G[below + dir] === 0) { G[below + dir] = v; G[idx] = 0; continue; }
          nx = x - dir;
          if (nx >= 0 && nx < GW && G[below - dir] === 0) { G[below - dir] = v; G[idx] = 0; }
        }
      }
      // remove the bottom row so the pile never fills the frame
      for (x = 0; x < GW; x++) {
        if (Math.random() < 0.0009) G[(GH - 1) * GW + x] = 0;
      }

      var data = this.img.data, pal = this.pal;
      for (i = 0; i < G.length; i++) {
        var c = pal[G[i]] || pal[0];
        var o = i * 4;
        data[o] = c[0]; data[o + 1] = c[1]; data[o + 2] = c[2]; data[o + 3] = 255;
      }
      this.g.putImageData(this.img, 0, 0);
      var ctx = S.ctx;
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = S.fade;
      ctx.drawImage(this.buf, 0, 0, S.w, S.h);
      ctx.globalAlpha = 1;
      ctx.imageSmoothingEnabled = true;
    }
  });

  /* ───────────────────────────  45 · RIPPLE TANK  ──────────────────────── */
  D({
    id: 'ripple-tank',
    preview: 'assets/previews/ripple-tank.webp',
    rank: 45,
    name: 'Ripple Tank',
    tag: 'wave superposition · interference',
    blurb: 'Five stones dropped into a still, dark pool. Where crest meets crest the water sings; where crest meets trough, it is silent.',
    captivation: 48,
    art: 'radial-gradient(100% 100% at 50% 50%, #d8faff 0%, #64d8e8 18%, #2b6ab8 44%, #122a66 72%, #040818 100%)',
    kind: '2d',
    init: function (S) {
      this.GW = 220; this.GH = 140;
      this.buf = buffer(this.GW, this.GH);
      this.g = this.buf.getContext('2d');
      this.img = this.g.createImageData(this.GW, this.GH);
      var GW = this.GW, GH = this.GH, N = 5, j, i, x, y;
      this.dist = new Float32Array(N * GW * GH);
      this.sources = [];
      for (j = 0; j < N; j++) {
        this.sources.push({
          x: 0.16 + 0.68 * ((j * 0.61803398875) % 1),
          y: 0.18 + 0.64 * ((j * 0.38196601125 + 0.31) % 1),
          ph: j * 1.7, amp: 0.72 + 0.28 * Math.sin(j * 2.3)
        });
      }
      for (j = 0; j < N; j++) {
        var s = this.sources[j], off = j * GW * GH;
        for (y = 0; y < GH; y++) {
          for (x = 0; x < GW; x++) {
            var dx = x / GW - s.x, dy = (y / GH - s.y) * (GH / GW);
            this.dist[off + y * GW + x] = Math.sqrt(dx * dx + dy * dy);
          }
        }
      }
      this.sinTab = new Float32Array(1024);
      for (i = 0; i < 1024; i++) this.sinTab[i] = Math.sin(i / 1024 * TAU);
      this.lut = new Uint8Array(256 * 3);
      for (i = 0; i < 256; i++) {
        var v = i / 255;
        this.lut[i * 3] = 8 + 235 * Math.pow(v, 2.4);
        this.lut[i * 3 + 1] = 14 + 225 * Math.pow(v, 1.55);
        this.lut[i * 3 + 2] = 34 + 221 * Math.pow(v, 1.05);
      }
    },
    frame: function (S) {
      var GW = this.GW, GH = this.GH, D = this.dist, tab = this.sinTab, lut = this.lut;
      var data = this.img.data, N = this.sources.length;
      var t = S.t * 1.55;
      var k = 48.0;
      var phases = [];
      for (var j = 0; j < N; j++) {
        var s = this.sources[j];
        phases.push((-t * 2.2 + s.ph) * 162.97466);
      }
      var p = 0;
      for (var y = 0; y < GH; y++) {
        for (var x = 0; x < GW; x++, p++) {
          var sum = 0;
          for (var j2 = 0; j2 < N; j2++) {
            var d = D[j2 * GW * GH + p];
            var idx = ((d * k * 162.97466 + phases[j2]) | 0) & 1023;
            sum += tab[idx] * this.sources[j2].amp / (1.0 + d * 5.5);
          }
          var v = clamp(0.5 + sum * 0.85, 0, 1);
          // sharp bright crests, deep black nodes
          v = Math.pow(v, 2.1);
          var c = (v * 255) | 0, o = p * 4;
          data[o] = lut[c * 3]; data[o + 1] = lut[c * 3 + 1]; data[o + 2] = lut[c * 3 + 2];
          data[o + 3] = 255;
        }
      }
      this.g.putImageData(this.img, 0, 0);
      var ctx = S.ctx;
      ctx.imageSmoothingEnabled = true;
      ctx.globalAlpha = S.fade;
      ctx.drawImage(this.buf, 0, 0, S.w, S.h);
      ctx.globalAlpha = 1;

      // the five sources as bright points of light
      ctx.globalCompositeOperation = 'lighter';
      for (var m = 0; m < N; m++) {
        var sx = this.sources[m].x * S.w, sy = this.sources[m].y * S.h;
        var gr = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.min(S.w, S.h) * 0.055);
        gr.addColorStop(0, 'rgba(180,220,255,0.28)');
        gr.addColorStop(1, 'rgba(120,200,255,0)');
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(sx, sy, Math.min(S.w, S.h) * 0.055, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  /* ───────────────────────────  46 · SPIROGRAPH  ───────────────────────── */
  D({
    id: 'spirograph',
    preview: 'assets/previews/spirograph.webp',
    rank: 46,
    name: 'Spirograph',
    tag: 'hypotrochoid · rolling circles',
    blurb: 'A circle rolling inside another circle, holding a pen. Change one tooth and the whole universe of the drawing changes with it.',
    captivation: 47,
    art: 'conic-gradient(from 200deg at 50% 50%, #ffb36b, #ff6b9d, #a56bff, #6bb7ff, #6bffcf, #ffb36b)',
    kind: '2d',
    init: function (S) {
      this.buf = buffer(1100, 700);
      this.g = this.buf.getContext('2d');
      this.g.fillStyle = '#04040a';
      this.g.fillRect(0, 0, this.buf.width, this.buf.height);
      this.phase = 0;
      this.prev = null;
      this.gear = 0;
    },
    frame: function (S) {
      var g = this.g, W = this.buf.width, H = this.buf.height, ctx = S.ctx;
      fadeIn(g, W, H, 0.0025);
      g.globalCompositeOperation = 'lighter';

      // change gearing slowly and continuously
      var R = 5.0, ratio = 2.63 + 0.035 * Math.sin(S.t * 0.031) + 0.018 * Math.sin(S.t * 0.013);
      var r = R / ratio, d = r * (1.55 + 0.35 * Math.sin(S.t * 0.047));
      var scale = Math.min(W, H) * 0.078;
      var steps = 52, step = 0.012;
      var hue = (175 + S.t * 17) % 360;
      g.strokeStyle = 'hsla(' + hue.toFixed(0) + ',96%,70%,0.58)';
      g.lineWidth = 1.4;
      g.beginPath();
      for (var i = 0; i <= steps; i++) {
        var t = this.phase + i * step;
        var x = (R - r) * Math.cos(t) + d * Math.cos((R - r) / r * t);
        var y = (R - r) * Math.sin(t) - d * Math.sin((R - r) / r * t);
        var px = W * 0.5 + x * scale, py = H * 0.5 + y * scale;
        if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.stroke();
      this.phase += steps * step;
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;

      ctx.fillStyle = '#04040a';
      ctx.fillRect(0, 0, S.w, S.h);
      ctx.globalAlpha = S.fade;
      ctx.drawImage(this.buf, 0, 0, S.w, S.h);
      ctx.globalAlpha = 1;

      // the rolling circle itself, drawn faintly over the finished trace
      var tt = this.phase;
      var cx = (R - r) * Math.cos(tt) * scale + W * 0.5;
      var cy = (R - r) * Math.sin(tt) * scale + H * 0.5;
      ctx.save();
      ctx.scale(S.w / W, S.h / H);
      ctx.strokeStyle = 'rgba(190,215,255,0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(W * 0.5, H * 0.5, R * scale, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r * scale, 0, TAU); ctx.stroke();
      ctx.restore();
    }
  });

})(window);
