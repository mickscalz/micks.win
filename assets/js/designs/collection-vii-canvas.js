/* Collection VII: 32 living drawn constructions. Local seeded streams,
   bounded populations and positive-dt simulation gates; no external imagery. */
(function (w) {
  "use strict";
  var safeColor = false,
    activeIntensity = 0.65,
    activeHue = 0;
  var TAU = Math.PI * 2,
    reg = w.CabinetVII.register;
  function rng(s) {
    return function () {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return (s >>> 0) / 4294967296;
    };
  }
  function room(n, id, name, family, tag, init, frame, extra) {
    return reg(
      n,
      id,
      name,
      family,
      tag,
      "2d",
      Object.assign(
        {
          init: init,
          frame: function (S) {
            safeColor = !!(S.experience && S.experience.colorSafe);
            activeIntensity = ex(S).intensity;
            activeHue = (phase(S.t, n + 23) - 0.5) * 120 * ex(S).novelty;
            var local = Object.assign({}, S, {
              t: S.t + (phase(S.t, n) - 0.5) * 6 * ex(S).novelty,
            });
            return frame.call(this, local);
          },
          previewFrames: 1,
        },
        extra,
      ),
    );
  }
  function color(h, l, a) {
    h += activeHue;
    if (safeColor) h = Math.sin(h * 0.017) > 0 ? 205 : 43;
    a = (a === undefined ? 1 : a) * (0.7 + activeIntensity * 0.65);
    return (
      "hsla(" +
      (((h % 360) + 360) % 360) +
      ",75%," +
      (l || 60) +
      "%," +
      (a === undefined ? 1 : a) +
      ")"
    );
  }
  function phase(t, seed) {
    var x = t / 12,
      k = Math.floor(x),
      f = x - k;
    f = f * f * (3 - 2 * f);
    function h(n) {
      var v = Math.sin(n * 127.1 + seed * 7.3) * 43758.5453;
      return v - Math.floor(v);
    }
    return h(k) * (1 - f) + h(k + 1) * f;
  }
  function ex(S) {
    return (
      S.experience || {
        pulse: 0.5,
        intensity: 0.65,
        detail: 0.85,
        density: 0.75,
        color: 1,
        novelty: 0.7,
      }
    );
  }
  function bg(c, W, H, paper) {
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, paper ? "#e7e4e4" : "#030b25");
    g.addColorStop(0.6, paper ? "#f7ecdf" : "#120d32");
    g.addColorStop(1, paper ? "#d2dfe5" : "#053239");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
  function path(c, P, close) {
    c.beginPath();
    P.forEach(function (p, i) {
      if (i) c.lineTo(p[0], p[1]);
      else c.moveTo(p[0], p[1]);
    });
    if (close) c.closePath();
  }
  function glow(c, x, y, r, h, a) {
    var g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color(h, 70, a || 0.35));
    g.addColorStop(1, color(h, 40, 0));
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function spin(p, t) {
    var a = t * 0.11,
      co = Math.cos(a),
      si = Math.sin(a),
      x = p[0] * co + p[2] * si,
      z = -p[0] * si + p[2] * co;
    return [x, p[1] * 0.93 - z * 0.37, p[1] * 0.37 + z * 0.93];
  }
  function proj(p, W, H) {
    var k = (Math.min(W, H) * 1.5) / Math.max(0.5, 4 + p[2]);
    return [W * 0.5 + p[0] * k, H * 0.5 + p[1] * k, k];
  }
  function face(F, P, h, l, a) {
    F.push({
      P: P,
      z:
        P.reduce(function (s, p) {
          return s + p[2];
        }, 0) / P.length,
      h: h,
      l: l,
      a: a,
    });
  }
  function faces(c, F, W, H) {
    F.sort(function (a, b) {
      return b.z - a.z;
    });
    F.forEach(function (f) {
      path(
        c,
        f.P.map(function (p) {
          return proj(p, W, H);
        }),
        true,
      );
      c.fillStyle = color(f.h, f.l, f.a);
      c.fill();
      c.strokeStyle = color(f.h, 72, 0.18);
      c.lineWidth = 0.6;
      c.stroke();
    });
  }
  function seeds(count, seed) {
    var r = rng(seed);
    return Array.from({ length: count }, function (_, i) {
      return { x: r(), y: r(), z: r(), s: r(), h: i * 137.5, a: r() * TAU };
    });
  }
  function stars(c, W, H, t, count) {
    for (var i = 0; i < count; i++) {
      var x = ((i * 0.6180339 + t * 0.0007) % 1) * W,
        y = ((i * 0.41421356) % 1) * H;
      c.fillStyle = color(i * 71 + t * 2, 75, 0.18);
      c.fillRect(x, y, 1, 1);
    }
  }

  room(
    2,
    "lumen-garden",
    "Lumen Garden",
    "organic",
    "branching luminous flora · layered blooms · nocturnal parallax",
    function () {
      this.plants = seeds(24, 702);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t,
        e = ex(S);
      bg(c, W, H);
      stars(c, W, H, t, 90);
      this.plants.forEach(function (p, i, list) {
        if (
          list.length > 70 &&
          i >
            list.length *
              (0.25 + 0.75 * ex(S).density) *
              (0.4 + 0.6 * ex(S).detail)
        )
          return;
        var x = p.x * W,
          y = H * (0.75 + p.z * 0.2),
          len = H * (0.26 + p.s * 0.45),
          sway = Math.sin(t * 0.22 + i) * len * 0.12,
          h = p.h + t * 4;
        path(c, [
          [x, y],
          [x + sway * 0.3, y - len * 0.4],
          [x + sway, y - len],
        ]);
        c.strokeStyle = color(h, 44, 0.5);
        c.lineWidth = 1 + p.z * 2;
        c.stroke();
        var X = x + sway,
          Y = y - len,
          r = len * (0.1 + 0.045 * Math.sin(t * 0.17 + i));
        for (var j = 0; j < 7; j++) {
          var a = (j / 7) * TAU + t * 0.07;
          c.beginPath();
          c.ellipse(
            X + Math.cos(a) * r * 0.7,
            Y + Math.sin(a) * r * 0.7,
            r,
            r * 0.27,
            a,
            0,
            TAU,
          );
          c.fillStyle = color(h + j * 13, 55, 0.35);
          c.fill();
        }
        glow(c, X, Y, r * 1.4, h, 0.3 + e.pulse * 0.1);
      });
    },
  );

  room(
    4,
    "siphonophore-procession",
    "Siphonophore Procession",
    "organic",
    "colonial organisms · articulated bells · trailing light tendrils",
    function () {},
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      for (var k = 2; k >= 0; k--) {
        var scale = Math.min(W, H) * (0.6 - k * 0.1),
          P = [];
        for (var j = 0; j < 45; j++) {
          var q = j / 44,
            a = q * 4 + t * 0.13 + k,
            x = W * (0.3 + k * 0.2) + Math.sin(a) * scale * 0.3,
            y = H * 0.1 + q * H * 0.8,
            r = scale * (0.035 + 0.013 * Math.sin(t * 0.4 - j * 0.3));
          P.push([x, y]);
          c.beginPath();
          c.ellipse(x, y, r * 1.2, r * 0.65, Math.sin(a) * 0.3, Math.PI, TAU);
          c.bezierCurveTo(x + r, y + r, x - r, y + r, x - r * 1.2, y);
          c.fillStyle = color(j * 5 + k * 75 + t * 4, 55, 0.28);
          c.fill();
          c.strokeStyle = color(j * 5 + k * 75 + t * 4, 70, 0.65);
          c.lineWidth = 1;
          c.stroke();
          for (var f = 0; f < 3; f++) {
            path(c, [
              [x + (f - 1) * r * 0.3, y],
              [
                x + (f - 1) * r * 0.5 + Math.sin(t * 0.5 + j) * r * 0.6,
                y + r * 3,
              ],
            ]);
            c.strokeStyle = color(j * 5 + k * 75 + t * 4, 62, 0.25);
            c.stroke();
          }
        }
        path(c, P);
        c.strokeStyle = color(k * 75 + t * 4, 80, 0.5);
        c.stroke();
      }
    },
  );

  room(
    6,
    "chromatic-tecton",
    "Chromatic Tecton",
    "crystalline",
    "floating hexagonal plates · slow deformation · displaced continental cells",
    function () {},
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t,
        F = [];
      bg(c, W, H);
      var g = phase(t, 6);
      for (var j = -7; j <= 7; j++)
        for (var i = -8; i <= 8; i++) {
          var x = i * 0.19 + (j % 2) * 0.095,
            y = j * 0.165,
            z =
              0.2 * Math.sin(x * 2 + t * 0.18) * Math.cos(y * 2 - t * 0.13) +
              g * 0.1,
            P = [];
          for (var k = 0; k < 6; k++) {
            var a = (k / 6) * TAU;
            P.push(
              spin(
                [
                  x + Math.cos(a) * 0.093,
                  y + Math.sin(a) * 0.093,
                  z + 0.03 * Math.sin(k + t * 0.2),
                ],
                t * 0.25,
              ),
            );
          }
          face(
            F,
            P,
            i * 9 + j * 13 + t * 3,
            32 + 24 * (0.5 + 0.5 * Math.sin(i * 0.3 + j * 0.4 - t * 0.1)),
          );
        }
      faces(c, F, W, H);
    },
  );

  room(
    8,
    "night-of-nine-moons",
    "Night of Nine Moons",
    "celestial",
    "occluding planets · auratic atmospheres · orbital shadows",
    function () {
      this.moons = seeds(9, 708);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      stars(c, W, H, t, 160);
      this.moons.forEach(function (p, i, list) {
        if (
          list.length > 70 &&
          i >
            list.length *
              (0.25 + 0.75 * ex(S).density) *
              (0.4 + 0.6 * ex(S).detail)
        )
          return;
        var a = p.a + t * (0.018 + i * 0.002),
          x = W * (0.5 + 0.39 * Math.cos(a)),
          y = H * (0.5 + 0.34 * Math.sin(a * 0.91)),
          r = Math.min(W, H) * (0.035 + p.s * 0.085),
          h = p.h + t * 2;
        glow(c, x, y, r * 1.7, h, 0.18);
        var g = c.createRadialGradient(
          x - r * 0.35,
          y - r * 0.4,
          0,
          x + r * 0.3,
          y + r * 0.25,
          r * 1.5,
        );
        g.addColorStop(0, color(h, 72));
        g.addColorStop(0.55, color(h + 35, 30));
        g.addColorStop(1, "#030619");
        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, r, 0, TAU);
        c.fill();
        c.save();
        c.beginPath();
        c.arc(x, y, r, 0, TAU);
        c.clip();
        c.strokeStyle = color(h + 60, 70, 0.22);
        for (var j = -4; j <= 4; j++) {
          c.beginPath();
          c.ellipse(x, y + j * r * 0.17, r, r * 0.12, 0.3, 0, TAU);
          c.stroke();
        }
        c.restore();
      });
    },
  );

  room(
    10,
    "mandible-of-dawn",
    "Mandible of Dawn",
    "surreal",
    "articulated exoskeleton · luminous limbs · curling anatomy",
    function () {},
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      var scale = Math.min(W, H) * 0.46;
      for (var j = 74; j >= 0; j--) {
        var q = j / 74,
          a = q * TAU * 1.3 + t * 0.1,
          r = (0.15 + q * 0.8) * scale,
          x = W * 0.5 + Math.cos(a) * r,
          y = H * 0.5 + Math.sin(a) * r * 0.8,
          size = (1 - q * 0.7) * scale * 0.055;
        for (var side = -1; side <= 1; side += 2) {
          var b = a + side * (1 + 0.3 * Math.sin(t * 0.9 - j * 0.24));
          path(c, [
            [x, y],
            [x + Math.cos(b) * size * 2.5, y + Math.sin(b) * size * 2.5],
            [
              x + Math.cos(b + 0.8 * side) * size * 4,
              y + Math.sin(b + 0.8 * side) * size * 4,
            ],
          ]);
          c.strokeStyle = color(j * 4 + t * 4, 62, 0.65);
          c.lineWidth = 1;
          c.stroke();
        }
        c.save();
        c.translate(x, y);
        c.rotate(a);
        path(
          c,
          [
            [size, 0],
            [0, -size * 0.8],
            [-size, 0],
            [0, size * 0.8],
          ],
          true,
        );
        c.fillStyle = color(j * 4 + t * 4, 45);
        c.fill();
        c.restore();
      }
    },
  );

  room(
    12,
    "jelly-forest",
    "Jelly Forest",
    "organic",
    "giant translucent bells · living filaments · deep-water haze",
    function () {
      this.B = seeds(14, 712);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      this.B.slice()
        .sort(function (a, b) {
          return a.z - b.z;
        })
        .forEach(function (p, i, list) {
          if (
            list.length > 70 &&
            i >
              list.length *
                (0.25 + 0.75 * ex(S).density) *
                (0.4 + 0.6 * ex(S).detail)
          )
            return;
          var x = W * (0.1 + p.x * 0.8) + Math.sin(t * 0.1 + i) * W * 0.025,
            y = H * (0.15 + p.y * 0.5),
            r = Math.min(W, H) * (0.045 + p.z * 0.1),
            h = p.h + t * 3;
          glow(c, x, y, r * 1.5, h, 0.22);
          c.beginPath();
          c.ellipse(
            x,
            y,
            r,
            r * (0.43 + 0.06 * Math.sin(t * 0.5 + i)),
            0,
            Math.PI,
            TAU,
          );
          c.quadraticCurveTo(x, y + r * 0.5, x - r, y);
          c.fillStyle = color(h, 65, 0.28);
          c.fill();
          c.strokeStyle = color(h, 76, 0.55);
          c.stroke();
          for (var j = 0; j < 9; j++) {
            var P = [];
            for (var k = 0; k < 26; k++) {
              var q = k / 25;
              P.push([
                x +
                  (j - 4) * r * 0.16 +
                  Math.sin(q * 6 - t * 0.6 + j) * r * q * 0.28,
                y + q * r * (2.5 + p.s),
              ]);
            }
            path(c, P);
            c.strokeStyle = color(h + j * 5, 67, 0.48);
            c.lineWidth = 0.8;
            c.stroke();
          }
        });
    },
  );

  room(
    14,
    "aerial-root-city",
    "Aerial Root City",
    "architectural",
    "floating settlements · hanging roots · interconnecting light bridges",
    function () {
      this.B = seeds(28, 714);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      var P = this.B.map(function (p) {
        return proj(
          spin([(p.x - 0.5) * 4, (p.y - 0.5) * 2, (p.z - 0.5) * 2], t * 0.3),
          W,
          H,
        );
      });
      P.forEach(function (p, i, list) {
        if (
          list.length > 70 &&
          i >
            list.length *
              (0.25 + 0.75 * ex(S).density) *
              (0.4 + 0.6 * ex(S).detail)
        )
          return;
        var b = this.B[i],
          r = p[2] * (0.08 + b.s * 0.1);
        if (i < P.length - 1) {
          path(c, [p, P[i + 1]]);
          c.strokeStyle = color(i * 17 + t * 3, 65, 0.18);
          c.lineWidth = 0.7;
          c.stroke();
        }
        c.fillStyle = color(i * 17 + t * 3, 33);
        path(
          c,
          [
            [p[0] - r, p[1]],
            [p[0] + r, p[1]],
            [p[0] + r * 0.3, p[1] + r * 0.8],
            [p[0] - r * 0.3, p[1] + r * 0.6],
          ],
          true,
        );
        c.fill();
        for (var j = 0; j < 5; j++) {
          c.fillStyle = color(i * 17 + j * 7 + t * 3, 45 + j * 6);
          c.fillRect(
            p[0] + (j - 2) * r * 0.3,
            p[1] - r * (0.25 + 0.4 * Math.sin(i + j)),
            r * 0.19,
            r * 0.6,
          );
          path(c, [
            [p[0] + (j - 2) * r * 0.2, p[1] + r * 0.5],
            [
              p[0] + (j - 2) * r * 0.25 + Math.sin(t * 0.3 + i + j) * r * 0.2,
              p[1] + r * 2,
            ],
          ]);
          c.strokeStyle = color(i * 17 + t * 3, 57, 0.4);
          c.stroke();
        }
      }, this);
    },
  );

  function growCoral(d, dt, t) {
    d.clock += dt;
    var next = [],
      r = d.r;
    d.T.forEach(function (p) {
      var x = p.x,
        y = p.y;
      p.a += Math.sin(t * 0.3 + p.x * 8 + p.h * 0.017) * dt * 0.28;
      p.x += Math.cos(p.a) * dt * 0.055;
      p.y += Math.sin(p.a) * dt * 0.055;
      p.age += dt;
      if (Math.floor(d.clock * 15) !== Math.floor((d.clock - dt) * 15)) {
        d.lines.push({
          a: [
            p.lastX === undefined ? x : p.lastX,
            p.lastY === undefined ? y : p.lastY,
          ],
          b: [p.x, p.y],
          h: p.h,
          born: d.clock,
        });
        p.lastX = p.x;
        p.lastY = p.y;
      }
      if (p.age > 1.2 && r() < 0.025 && next.length < 90)
        next.push({
          x: p.x,
          y: p.y,
          a: p.a + (r() - 0.5),
          h: p.h + 15,
          age: 0,
        });
      if (p.y < 0.06 || p.y > 0.94 || p.x < 0.04 || p.x > 0.96 || p.age > 13) {
        p.a = r() * TAU;
        p.x = 0.5 + Math.cos(p.a) * 0.1;
        p.y = 0.5 + Math.sin(p.a) * 0.1;
        p.lastX = p.x;
        p.lastY = p.y;
        p.age = 0;
      }
      next.push(p);
    });
    d.T = next.slice(0, 96);
    d.lines = d.lines
      .filter(function (l) {
        return d.clock - l.born < 18;
      })
      .slice(-12000);
  }
  room(
    16,
    "coral-computation",
    "Coral Computation",
    "organic",
    "radial growing colony · branch renewal · luminous transport",
    function () {
      this.r = rng(716);
      this.T = [];
      for (var i = 0; i < 18; i++) {
        var a = (i / 18) * TAU;
        this.T.push({
          x: 0.5 + Math.cos(a) * 0.12,
          y: 0.5 + Math.sin(a) * 0.12,
          a: a,
          h: i * 20,
          age: 0,
        });
      }
      this.lines = [];
      this.clock = 0;
      for (var j = 0; j < 240; j++) growCoral(this, 1 / 60, j / 60);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      if (S.dt > 0) growCoral(this, S.dt, t);
      var scale = Math.min(W, H) * 1.25;
      glow(c, W * 0.5, H * 0.5, scale * 0.28, t * 4, 0.15);
      var groups = {};
      this.lines.forEach(function (l) {
        var age = Math.min(2, Math.floor((this.clock - l.born) / 6)),
          key = Math.floor((((l.h % 360) + 360) % 360) / 24) + age * 15;
        (groups[key] || (groups[key] = [])).push(l);
      }, this);
      Object.keys(groups).forEach(function (key) {
        c.beginPath();
        groups[key].forEach(function (l) {
          c.moveTo(
            W * 0.5 + (l.a[0] - 0.5) * scale,
            H * 0.5 + (l.a[1] - 0.5) * scale,
          );
          c.lineTo(
            W * 0.5 + (l.b[0] - 0.5) * scale,
            H * 0.5 + (l.b[1] - 0.5) * scale,
          );
        });
        c.strokeStyle = color(
          (key % 15) * 24 + t * 3,
          68,
          0.85 - Math.floor(key / 15) * 0.2,
        );
        c.lineWidth = 1.6;
        c.stroke();
      });
      this.T.forEach(function (p) {
        var x = W * 0.5 + (p.x - 0.5) * scale,
          y = H * 0.5 + (p.y - 0.5) * scale;
        c.fillStyle = color(p.h + t * 3, 85);
        c.beginPath();
        c.arc(x, y, 2.2, 0, TAU);
        c.fill();
        glow(c, x, y, 7, p.h + t * 3, 0.16);
      });
    },
    { previewFrames: 100 },
  );

  room(
    18,
    "stigmergy-river",
    "Stigmergy River",
    "microscopic",
    "chemotactic agents · pheromone diffusion · emergent living channels",
    function () {
      var N = 128,
        M = 80,
        r = rng(718);
      this.N = N;
      this.M = M;
      this.field = new Float32Array(N * M);
      this.next = new Float32Array(N * M);
      this.P = [];
      for (var i = 0; i < 720; i++) {
        var a = r() * TAU,
          rr = 0.12 + r() * 0.28;
        this.P.push({
          x: (0.5 + Math.cos(a) * rr) * N,
          y: (0.5 + Math.sin(a) * rr) * M,
          a: a + Math.PI * 0.5,
        });
      }
      this.cv = document.createElement("canvas");
      this.cv.width = N;
      this.cv.height = M;
      this.cx = this.cv.getContext("2d");
      this.im = this.cx.createImageData(N, M);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t,
        N = this.N,
        M = this.M,
        F = this.field,
        B = this.next;
      if (S.dt > 0) {
        function sense(p, a) {
          var x = (Math.floor(p.x + Math.cos(a) * 4) + N) % N,
            y = (Math.floor(p.y + Math.sin(a) * 4) + M) % M;
          return F[y * N + x];
        }
        this.P.forEach(function (p) {
          var front = sense(p, p.a),
            left = sense(p, p.a - 0.45),
            right = sense(p, p.a + 0.45);
          if (left > front && left > right) p.a -= 0.22;
          else if (right > front) p.a += 0.22;
          else p.a += 0.05 * Math.sin(t * 0.7 + p.x);
          p.x = (p.x + Math.cos(p.a) * 0.8 + N) % N;
          p.y = (p.y + Math.sin(p.a) * 0.8 + M) % M;
          F[Math.floor(p.y) * N + Math.floor(p.x)] = Math.min(
            5,
            F[Math.floor(p.y) * N + Math.floor(p.x)] + 0.6,
          );
        });
        for (var y = 0; y < M; y++)
          for (var x = 0; x < N; x++) {
            var k = y * N + x;
            B[k] =
              (F[k] * 4 +
                F[y * N + ((x + 1) % N)] +
                F[y * N + ((x + N - 1) % N)] +
                F[((y + 1) % M) * N + x] +
                F[((y + M - 1) % M) * N + x]) *
              0.121;
          }
        this.field = B;
        this.next = F;
        F = B;
      }
      var D = this.im.data;
      for (var k = 0; k < F.length; k++) {
        var v = Math.min(1, F[k] * 0.75),
          h = t * 0.025 + v * 0.8;
        D[k * 4] = (40 + 180 * (0.5 + 0.5 * Math.sin(h * TAU))) * v;
        D[k * 4 + 1] = (90 + 150 * (0.5 + 0.5 * Math.sin(h * TAU + 2))) * v;
        D[k * 4 + 2] = (110 + 140 * (0.5 + 0.5 * Math.sin(h * TAU + 4))) * v;
        D[k * 4 + 3] = 255;
      }
      this.cx.putImageData(this.im, 0, 0);
      c.drawImage(this.cv, 0, 0, W, H);
    },
    { previewFrames: 100 },
  );

  room(
    20,
    "zoetrope-of-petals",
    "Zoetrope of Petals",
    "painterly",
    "asymmetric orchid · translucent membranes · breathing folds",
    function () {},
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      var scale = Math.min(W, H) * 0.43;
      for (var j = 23; j >= 0; j--) {
        var a = j * 2.399 + t * 0.04,
          r = scale * (0.25 + (j / 24) * 0.6),
          x = W * 0.5 + Math.cos(a) * r * 0.25,
          y = H * 0.5 + Math.sin(a) * r * 0.16,
          len = r * (0.7 + 0.15 * Math.sin(t * 0.18 + j));
        c.save();
        c.translate(x, y);
        c.rotate(a + 0.15 * Math.sin(t * 0.19 + j));
        c.beginPath();
        c.moveTo(0, 0);
        c.bezierCurveTo(len * 0.3, -len * 0.7, len * 0.95, -len * 0.25, len, 0);
        c.bezierCurveTo(len * 0.7, len * 0.45, len * 0.2, len * 0.15, 0, 0);
        var g = c.createLinearGradient(0, 0, len, 0);
        g.addColorStop(0, color(j * 15 + t * 3, 30, 0.65));
        g.addColorStop(0.7, color(j * 15 + 30 + t * 3, 64, 0.5));
        g.addColorStop(1, color(j * 15 + 50 + t * 3, 85, 0.3));
        c.fillStyle = g;
        c.fill();
        c.strokeStyle = color(j * 15 + t * 3, 75, 0.4);
        c.lineWidth = 0.8;
        c.stroke();
        c.restore();
      }
    },
  );

  room(
    22,
    "pelagic-constellations",
    "Pelagic Constellations",
    "organic",
    "steering lantern creatures · articulated bodies · underwater procession",
    function () {
      this.P = seeds(90, 722);
      this.P.forEach(function (p) {
        p.vx = Math.cos(p.a) * 0.03;
        p.vy = Math.sin(p.a) * 0.03;
      });
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      this.P.forEach(function (p, i, list) {
        if (
          list.length > 70 &&
          i >
            list.length *
              (0.25 + 0.75 * ex(S).density) *
              (0.4 + 0.6 * ex(S).detail)
        )
          return;
        if (S.dt > 0) {
          var ax = Math.sin(p.y * 7 + t * 0.18) * 0.015,
            ay = Math.cos(p.x * 6 - t * 0.12) * 0.015;
          p.vx = (p.vx + ax * S.dt) * 0.999;
          p.vy = (p.vy + ay * S.dt) * 0.999;
          p.x = (p.x + p.vx * S.dt + 1) % 1;
          p.y = (p.y + p.vy * S.dt + 1) % 1;
        }
        var x = p.x * W,
          y = p.y * H,
          L = Math.min(W, H) * (0.012 + p.z * 0.025),
          a = Math.atan2(p.vy, p.vx);
        c.save();
        c.translate(x, y);
        c.rotate(a);
        c.beginPath();
        c.moveTo(L, 0);
        c.quadraticCurveTo(0, -L * 0.5, -L, Math.sin(t * 2 + i) * L * 0.2);
        c.quadraticCurveTo(0, L * 0.5, L, 0);
        c.fillStyle = color(p.h + t * 3, 60, 0.65);
        c.fill();
        c.fillStyle = color(p.h + t * 3, 90);
        c.beginPath();
        c.arc(L * 0.4, -L * 0.1, 1.2, 0, TAU);
        c.fill();
        c.restore();
      });
    },
  );

  room(
    24,
    "differential-reef",
    "Differential Reef",
    "microscopic",
    "cellular division · local repulsion · bounded colony growth",
    function () {
      this.r = rng(724);
      this.P = seeds(45, 724).map(function (p) {
        return {
          x: 0.5 + (p.x - 0.5) * 0.45,
          y: 0.5 + (p.y - 0.5) * 0.45,
          r: 0.009 + p.s * 0.015,
          h: p.h,
          age: 0,
        };
      });
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t,
        P = this.P;
      bg(c, W, H, true);
      if (S.dt > 0) {
        P.forEach(function (p, i, list) {
          if (
            list.length > 70 &&
            i >
              list.length *
                (0.25 + 0.75 * ex(S).density) *
                (0.4 + 0.6 * ex(S).detail)
          )
            return;
          p.age += S.dt;
          var ax = (0.5 - p.x) * 0.00002,
            ay = (0.5 - p.y) * 0.00002;
          P.forEach(function (q, j) {
            if (i === j) return;
            var x = p.x - q.x,
              y = p.y - q.y,
              d = Math.hypot(x, y),
              r = p.r + q.r;
            if (d < r && d > 0.0001) {
              ax += (x / d) * (r - d) * 0.09;
              ay += (y / d) * (r - d) * 0.09;
            }
          });
          p.x += ax;
          p.y += ay;
        });
        if (P.length < 220 && this.r() < 0.22) {
          var p = P[Math.floor(this.r() * P.length)];
          P.push({
            x: p.x + 0.01,
            y: p.y - 0.01,
            r: 0.008 + this.r() * 0.01,
            h: p.h + 20,
            age: 0,
          });
        }
      }
      var scale = Math.min(W, H);
      P.forEach(function (p) {
        var x = W * 0.5 + (p.x - 0.5) * scale * 1.4,
          y = H * 0.5 + (p.y - 0.5) * scale * 1.4,
          r = p.r * scale;
        c.beginPath();
        c.arc(x, y, r, 0, TAU);
        c.fillStyle = color(p.h + t * 3, 70, 0.28);
        c.fill();
        c.strokeStyle = color(p.h + t * 3, 34, 0.65);
        c.lineWidth = 0.7;
        c.stroke();
        c.fillStyle = color(p.h + t * 3, 38, 0.7);
        c.beginPath();
        c.arc(x, y, r * 0.2, 0, TAU);
        c.fill();
      });
    },
    { theme: "paper", previewFrames: 70 },
  );

  room(
    26,
    "ribbon-ecology",
    "Ribbon Ecology",
    "organic",
    "interwoven ribbon animals · moving dorsal fins · spectral anatomy",
    function () {},
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      var F = [];
      for (var k = 0; k < 5; k++)
        for (var j = 0; j < 90; j++) {
          var x = (j / 90 - 0.5) * 3.7,
            y = (k - 2) * 0.38 + 0.2 * Math.sin(x * 2 - t * 0.4 + k),
            z = 0.35 * Math.cos(x * 1.5 + t * 0.18 + k),
            w = 0.07 + 0.025 * Math.sin(x * 4 + t * 0.3);
          var P = [
            spin([x, y - w, z], t * 0.25),
            spin([x + 0.045, y - w, z], t * 0.25),
            spin(
              [x + 0.045, y + w, z + 0.03 * Math.sin(j * 0.5 - t)],
              t * 0.25,
            ),
            spin([x, y + w, z], t * 0.25),
          ];
          face(
            F,
            P,
            k * 65 + j * 2 + t * 4,
            40 + 15 * Math.sin(j * 0.2 - t * 0.3),
          );
        }
      faces(c, F, W, H);
    },
  );

  room(
    28,
    "floating-cartographies",
    "Floating Cartographies",
    "geometric",
    "shifting triangular continents · luminous boundaries · topographic parallax",
    function () {
      this.J = seeds(33 * 23, 728);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t,
        F = [],
        J = this.J,
        N = 32,
        M = 22;
      bg(c, W, H);
      function p(i, j) {
        var a = J[j * 33 + i],
          x = (i / N - 0.5) * 3.6 + (a.x - 0.5) * 0.04,
          y = (j / M - 0.5) * 2.5 + (a.y - 0.5) * 0.04,
          z = 0.35 * Math.sin(x * 2 + t * 0.19) * Math.cos(y * 2 - t * 0.13);
        return spin([x, y, z], t * 0.15);
      }
      for (var j = 0; j < M; j++)
        for (var i = 0; i < N; i++) {
          var A = p(i, j),
            B = p(i + 1, j),
            C = p(i + 1, j + 1),
            D = p(i, j + 1),
            h = i * 6 + j * 9 + t * 3;
          face(
            F,
            [A, B, C],
            h,
            30 + 25 * (0.5 + 0.5 * Math.sin(i * 0.3 + j * 0.4 - t * 0.2)),
          );
          face(
            F,
            [A, C, D],
            h + 20,
            40 + 20 * (0.5 + 0.5 * Math.cos(j * 0.3 - i * 0.2 + t * 0.17)),
          );
        }
      faces(c, F, W, H);
    },
  );

  room(
    30,
    "lantern-migration",
    "Lantern Migration",
    "organic",
    "windborne seed lanterns · suspended pollen · twilight layers",
    function () {
      this.P = seeds(100, 730);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      this.P.forEach(function (p, i, list) {
        if (
          list.length > 70 &&
          i >
            list.length *
              (0.25 + 0.75 * ex(S).density) *
              (0.4 + 0.6 * ex(S).detail)
        )
          return;
        var x = ((p.x + t * 0.008 * (0.4 + p.z)) % 1) * W,
          y = ((((p.y - t * 0.012 * (0.3 + p.z)) % 1) + 1) % 1) * H,
          r = Math.min(W, H) * (0.005 + p.z * 0.018),
          a = Math.sin(t * 0.23 + i) * 0.3;
        c.save();
        c.translate(x, y);
        c.rotate(a);
        var g = c.createLinearGradient(-r, 0, r, 0);
        g.addColorStop(0, color(p.h + t * 3, 25, 0.6));
        g.addColorStop(0.5, color(p.h + t * 3, 80, 0.8));
        g.addColorStop(1, color(p.h + t * 3, 30, 0.6));
        c.fillStyle = g;
        c.beginPath();
        c.ellipse(0, 0, r, r * 1.45, 0, 0, TAU);
        c.fill();
        path(c, [
          [0, r],
          [Math.sin(t * 0.4 + i) * r * 0.5, r * 3],
        ]);
        c.strokeStyle = color(p.h + t * 3, 65, 0.4);
        c.lineWidth = 0.7;
        c.stroke();
        c.restore();
      });
    },
  );

  room(
    32,
    "dust-of-other-physics",
    "Dust of Other Physics",
    "surreal",
    "counter-rotating attractors · velocity trails · curved stellar drift",
    function () {
      this.P = seeds(900, 732).map(function (p) {
        return {
          x: p.x * 2 - 1,
          y: p.y * 2 - 1,
          vx: 0,
          vy: 0,
          h: p.h,
          old: [],
        };
      });
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      var k = Math.min(W, H) * 0.4;
      this.P.forEach(function (p, i, list) {
        if (
          list.length > 70 &&
          i >
            list.length *
              (0.25 + 0.75 * ex(S).density) *
              (0.4 + 0.6 * ex(S).detail)
        )
          return;
        if (S.dt > 0) {
          var ax = -p.x * 0.1,
            ay = -p.y * 0.1;
          for (var j = 0; j < 3; j++) {
            var a = j * 2.4 + t * 0.045,
              x = p.x - Math.cos(a) * 0.45,
              y = p.y - Math.sin(a) * 0.45,
              d = x * x + y * y + 0.08,
              sign = j % 2 ? 1 : -1;
            ax += (-y / d) * 0.07 * sign;
            ay += (x / d) * 0.07 * sign;
          }
          p.vx = (p.vx + ax * S.dt) * 0.99;
          p.vy = (p.vy + ay * S.dt) * 0.99;
          p.x += p.vx * S.dt;
          p.y += p.vy * S.dt;
          if (Math.abs(p.x) > 1.5 || Math.abs(p.y) > 1.5) {
            p.x *= 0.6;
            p.y *= 0.6;
          }
          p.old.push([p.x, p.y]);
          if (p.old.length > 22) p.old.shift();
        }
        path(
          c,
          p.old.map(function (v) {
            return [W * 0.5 + v[0] * k, H * 0.5 + v[1] * k];
          }),
        );
        c.strokeStyle = color(p.h + t * 3, 72, 0.85);
        c.lineWidth = 1.5;
        c.stroke();
      });
    },
    { previewFrames: 55 },
  );

  room(
    34,
    "amphibious-architecture",
    "Amphibious Architecture",
    "architectural",
    "umbrella habitats · curved roofs · suspended foundations",
    function () {
      this.B = seeds(15, 734);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t,
        F = [];
      bg(c, W, H);
      this.B.forEach(function (b, k) {
        var x = (b.x - 0.5) * 3.4,
          y = (b.y - 0.5) * 2,
          z = (b.z - 0.5) * 2,
          r = 0.12 + b.s * 0.24;
        for (var j = 0; j < 20; j++) {
          var a = (j / 20) * TAU,
            d = TAU / 20,
            A = spin([x, y - 0.25, z], t * 0.3),
            B = spin(
              [
                x + Math.cos(a) * r,
                y + 0.05 * Math.sin(a * 6 + t * 0.4),
                z + Math.sin(a) * r,
              ],
              t * 0.3,
            ),
            C = spin(
              [
                x + Math.cos(a + d) * r,
                y + 0.05 * Math.sin((a + d) * 6 + t * 0.4),
                z + Math.sin(a + d) * r,
              ],
              t * 0.3,
            );
          face(F, [A, B, C], k * 27 + j * 5 + t * 3, 35 + (j % 4) * 8);
        }
        var a = proj(spin([x, y, z], t * 0.3), W, H),
          b = proj(spin([x, y + 0.7, z], t * 0.3), W, H);
        path(c, [a, b]);
        c.strokeStyle = color(k * 27 + t * 3, 60, 0.5);
        c.lineWidth = 1;
        c.stroke();
      });
      faces(c, F, W, H);
    },
  );

  room(
    36,
    "moonlit-ink",
    "Moonlit Ink",
    "painterly",
    "flowing brush organisms · mineral paper · articulated ink tendrils",
    function () {},
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H, true);
      for (var k = 0; k < 18; k++) {
        var P = [],
          h = 210 + k * 5 + t * 2;
        for (var j = 0; j < 120; j++) {
          var q = j / 119,
            x = W * (0.1 + q * 0.8),
            y =
              H * (0.15 + k * 0.038) +
              Math.sin(q * 7 + t * 0.18 + k * 0.37) * H * 0.07 +
              Math.cos(q * 13 - t * 0.13 + k) * H * 0.025;
          P.push([x, y]);
        }
        path(c, P);
        c.strokeStyle = color(h, 30, 0.48);
        c.lineWidth = 1.2 + 2 * Math.sin(k * 0.7) * Math.sin(k * 0.7);
        c.stroke();
        for (var j = 15; j < 110; j += 18) {
          var p = P[j];
          c.beginPath();
          c.ellipse(
            p[0],
            p[1],
            W * 0.012,
            H * 0.009,
            Math.sin(j + t * 0.1),
            0,
            TAU,
          );
          c.fillStyle = color(h + 40, 65, 0.5);
          c.fill();
        }
      }
    },
    { theme: "paper" },
  );

  room(
    38,
    "chromatic-polyp",
    "Chromatic Polyp",
    "microscopic",
    "swaying polyp colony · radial feelers · active cell centres",
    function () {
      this.B = seeds(35, 738);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      this.B.forEach(function (p, i, list) {
        if (
          list.length > 70 &&
          i >
            list.length *
              (0.25 + 0.75 * ex(S).density) *
              (0.4 + 0.6 * ex(S).detail)
        )
          return;
        var x = p.x * W,
          y = p.y * H,
          r = Math.min(W, H) * (0.018 + p.z * 0.032),
          h = p.h + t * 4;
        for (var j = 0; j < 12; j++) {
          var a = (j / 12) * TAU,
            tip = a + 0.25 * Math.sin(t * 0.6 + j + i);
          c.beginPath();
          c.moveTo(x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3);
          c.quadraticCurveTo(
            x + Math.cos(a) * r,
            y + Math.sin(a) * r,
            x + Math.cos(tip) * r * 1.5,
            y + Math.sin(tip) * r * 1.5,
          );
          c.strokeStyle = color(h + j * 4, 60, 0.5);
          c.lineWidth = 1 + p.z;
          c.stroke();
        }
        c.beginPath();
        c.arc(x, y, r * 0.35, 0, TAU);
        c.fillStyle = color(h, 80, 0.8);
        c.fill();
      });
    },
  );

  room(
    40,
    "xenolithic-mobile",
    "Xenolithic Mobile",
    "crystalline",
    "floating mineral nuclei · translucent connecting membranes · drifting facets",
    function () {
      this.B = seeds(24, 740);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t,
        F = [];
      bg(c, W, H);
      var B = this.B,
        P = B.map(function (p, i) {
          return spin(
            [
              (p.x - 0.5) * 3,
              (p.y - 0.5) * 2,
              (p.z - 0.5) * 2 + 0.15 * Math.sin(t * 0.15 + i),
            ],
            t * 0.4,
          );
        });
      for (var i = 0; i < P.length; i++) {
        var p = P[i],
          s = 0.06 + B[i].s * 0.1,
          V = [
            [s, 0, 0],
            [-s, 0, 0],
            [0, s, 0],
            [0, -s, 0],
            [0, 0, s],
            [0, 0, -s],
          ].map(function (v) {
            return [v[0] + p[0], v[1] + p[1], v[2] + p[2]];
          });
        [
          [0, 2, 4],
          [2, 1, 4],
          [1, 3, 4],
          [3, 0, 4],
          [0, 2, 5],
          [2, 1, 5],
          [1, 3, 5],
          [3, 0, 5],
        ].forEach(function (ids, k) {
          face(
            F,
            ids.map(function (j) {
              return V[j];
            }),
            i * 17 + k * 7 + t * 3,
            30 + k * 5,
          );
        });
        if (i > 1) face(F, [P[i], P[i - 1], P[i - 2]], i * 17 + t * 3, 60, 0.1);
      }
      faces(c, F, W, H);
    },
  );

  room(
    42,
    "silk-caravans",
    "Silk Caravans",
    "surreal",
    "windborne cloth colonies · semi-transparent sails · quiet migration",
    function () {
      this.B = seeds(18, 742);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      this.B.forEach(function (p, i, list) {
        if (
          list.length > 70 &&
          i >
            list.length *
              (0.25 + 0.75 * ex(S).density) *
              (0.4 + 0.6 * ex(S).detail)
        )
          return;
        var x = (((p.x + t * 0.005 * (0.5 + p.z)) % 1.2) - 0.1) * W,
          y = (0.15 + p.y * 0.65) * H,
          size = Math.min(W, H) * (0.025 + p.z * 0.06),
          P = [];
        for (var j = 0; j <= 30; j++) {
          var q = j / 30;
          P.push([
            x + (q - 0.5) * size * 2,
            y -
              Math.sin(q * Math.PI) *
                size *
                (0.7 + 0.2 * Math.sin(t * 0.3 + i)),
          ]);
        }
        for (var j = 30; j >= 0; j--) {
          var q = j / 30;
          P.push([
            x + (q - 0.5) * size * 2,
            y +
              Math.sin(q * Math.PI) * size * 0.5 +
              0.15 * size * Math.sin(q * 6 + t * 0.4 + i),
          ]);
        }
        path(c, P, true);
        c.fillStyle = color(p.h + t * 3, 65, 0.22);
        c.fill();
        c.strokeStyle = color(p.h + t * 3, 75, 0.55);
        c.lineWidth = 1;
        c.stroke();
      });
    },
  );

  room(
    44,
    "electric-pollination",
    "Electric Pollination",
    "organic",
    "flower signals · pollen agents · symbiotic motion",
    function () {
      this.flowers = seeds(12, 744);
      this.P = seeds(200, 745);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      var F = this.flowers;
      F.forEach(function (f, i) {
        var x = f.x * W,
          y = f.y * H,
          r = Math.min(W, H) * (0.02 + f.z * 0.025);
        for (var j = 0; j < 6; j++) {
          var a = (j / 6) * TAU + t * 0.04;
          c.beginPath();
          c.ellipse(
            x + Math.cos(a) * r * 0.55,
            y + Math.sin(a) * r * 0.55,
            r * 0.7,
            r * 0.25,
            a,
            0,
            TAU,
          );
          c.fillStyle = color(i * 30 + t * 3, 62, 0.4);
          c.fill();
        }
        glow(c, x, y, r, i * 30 + t * 3, 0.2);
      });
      this.P.forEach(function (p, i, list) {
        if (
          list.length > 70 &&
          i >
            list.length *
              (0.25 + 0.75 * ex(S).density) *
              (0.4 + 0.6 * ex(S).detail)
        )
          return;
        var f = F[i % F.length],
          g = F[(i + 1) % F.length],
          a = 0.5 + 0.5 * Math.sin(t * (0.08 + p.z * 0.04) + p.a),
          x = (f.x * (1 - a) + g.x * a + Math.sin(a * TAU + p.a) * 0.02) * W,
          y = (f.y * (1 - a) + g.y * a + Math.cos(a * TAU + p.a) * 0.02) * H;
        c.fillStyle = color(i * 17 + t * 4, 75, 0.7);
        c.fillRect(x, y, 1.7, 1.7);
      });
    },
  );

  room(
    46,
    "glass-larvae",
    "Glass Larvae",
    "organic",
    "segmented transparent anatomy · undulating motion · nested organelles",
    function () {
      this.B = seeds(14, 746);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      this.B.forEach(function (p, k) {
        for (var j = 25; j >= 0; j--) {
          var q = j / 25,
            x = ((p.x + t * 0.007) % 1) * W + (q - 0.5) * W * 0.13,
            y = p.y * H + Math.sin(q * 7 - t * 0.5 + k) * H * 0.035,
            r =
              Math.min(W, H) *
              (0.006 + p.z * 0.012) *
              Math.max(0.04, Math.sin(q * Math.PI)),
            h = p.h + j * 4 + t * 3;
          c.beginPath();
          c.ellipse(x, y, r * 1.1, r, 0, 0, TAU);
          c.fillStyle = color(h, 65, 0.16);
          c.fill();
          c.strokeStyle = color(h, 75, 0.5);
          c.lineWidth = 0.7;
          c.stroke();
          if (j % 4 === 0) {
            c.fillStyle = color(h, 80, 0.75);
            c.beginPath();
            c.arc(x, y, Math.max(0.7, r * 0.22), 0, TAU);
            c.fill();
          }
        }
      });
    },
  );

  room(
    48,
    "amoeboid-federation",
    "Amoeboid Federation",
    "microscopic",
    "merging soft cells · translucent boundaries · shared luminous interior",
    function () {
      this.B = seeds(12, 748);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      this.B.forEach(function (p, k) {
        var x = W * (0.5 + 0.33 * Math.sin(p.a + t * 0.065)),
          y = H * (0.5 + 0.32 * Math.cos(p.a * 1.13 + t * 0.073)),
          r = Math.min(W, H) * (0.055 + p.z * 0.08),
          P = [];
        for (var j = 0; j < 90; j++) {
          var a = (j / 90) * TAU,
            d =
              r *
              (1 +
                0.14 * Math.sin(a * 5 + t * 0.23 + k) +
                0.08 * Math.sin(a * 9 - t * 0.17));
          P.push([x + Math.cos(a) * d, y + Math.sin(a) * d]);
        }
        path(c, P, true);
        c.fillStyle = color(p.h + t * 3, 60, 0.24);
        c.fill();
        c.strokeStyle = color(p.h + t * 3, 75, 0.65);
        c.lineWidth = 1;
        c.stroke();
        glow(c, x, y, r * 0.35, p.h + t * 3, 0.3);
      });
    },
  );

  room(
    50,
    "reverse-waterfall",
    "Reverse Waterfall",
    "fluid",
    "rising light streams · suspended droplets · opposing currents",
    function () {
      this.P = seeds(700, 750);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      this.P.forEach(function (p, i, list) {
        if (
          list.length > 70 &&
          i >
            list.length *
              (0.25 + 0.75 * ex(S).density) *
              (0.4 + 0.6 * ex(S).detail)
        )
          return;
        var age = (((p.y - t * (0.035 + p.z * 0.02)) % 1) + 1) % 1,
          y = age * H,
          base = (p.x - 0.5) * 0.5 + 0.5,
          x = (base + 0.045 * Math.sin(age * 8 + t * 0.18 + p.a)) * W;
        path(c, [
          [x, y],
          [
            x + Math.cos(age * 8 + t * 0.18 + p.a) * W * 0.001,
            y + H * (0.006 + p.z * 0.012),
          ],
        ]);
        c.strokeStyle = color(p.h + t * 3, 68, 0.5 + p.z * 0.25);
        c.lineWidth = 1.2 + p.z;
        c.stroke();
      });
    },
  );

  room(
    52,
    "synaptic-orchard",
    "Synaptic Orchard",
    "organic",
    "branching neurons · travelling signals · layered dendrites",
    function () {
      var r = rng(752),
        B = [];
      function branch(x, y, a, len, depth, h) {
        if (!depth) return;
        var q = [x + Math.cos(a) * len, y + Math.sin(a) * len];
        B.push({ a: [x, y], b: q, h: h, depth: depth });
        branch(q[0], q[1], a + 0.28 + r() * 0.3, len * 0.7, depth - 1, h + 15);
        branch(q[0], q[1], a - 0.28 - r() * 0.3, len * 0.7, depth - 1, h - 12);
      }
      for (var k = 0; k < 6; k++)
        branch((k + 0.5) / 6, 0.9, -Math.PI / 2, 0.18, 7, k * 60);
      this.B = B;
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      this.B.forEach(function (b, i) {
        var sway = 0.006 * Math.sin(t * 0.18 + i * 0.01),
          a = [(b.a[0] + sway * (1 - b.a[1])) * W, b.a[1] * H],
          d = [(b.b[0] + sway * (1 - b.b[1])) * W, b.b[1] * H];
        path(c, [a, d]);
        c.strokeStyle = color(b.h + t * 2, 45, 0.35);
        c.lineWidth = 0.5 + b.depth * 0.24;
        c.stroke();
        var q = (t * 0.18 + i * 0.137) % 1,
          x = a[0] * (1 - q) + d[0] * q,
          y = a[1] * (1 - q) + d[1] * q;
        c.fillStyle = color(b.h + t * 2, 80, 0.65);
        c.fillRect(x, y, 1.4, 1.4);
      });
    },
  );

  room(
    54,
    "rainforest-of-silica",
    "Rainforest of Silica",
    "crystalline",
    "three-dimensional branching minerals · suspended canopy · depth ordering",
    function () {
      var r = rng(754),
        B = [];
      function grow(p, a, len, d, h) {
        if (!d) return;
        var q = [
          p[0] + Math.cos(a) * len,
          p[1] - len * 0.55,
          p[2] + Math.sin(a) * len,
        ];
        B.push({ a: p, b: q, d: d, h: h });
        grow(q, a + 0.65, len * 0.66, d - 1, h + 12);
        grow(q, a - 0.7, len * 0.67, d - 1, h - 10);
      }
      for (var k = 0; k < 7; k++)
        grow([(k - 3) * 0.5, 1, (r() - 0.5) * 2], k * 2.4, 0.45, 7, k * 47);
      this.B = B;
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      var B = this.B.map(function (b) {
        var a = spin(b.a, t * 0.35),
          d = spin(b.b, t * 0.35);
        return { a: a, b: d, d: b.d, h: b.h, z: (a[2] + d[2]) / 2 };
      });
      B.sort(function (a, b) {
        return b.z - a.z;
      });
      B.forEach(function (b) {
        var a = proj(b.a, W, H),
          d = proj(b.b, W, H);
        path(c, [a, d]);
        c.strokeStyle = color(b.h + t * 3, 45 + b.d * 4, 0.7);
        c.lineWidth = 0.5 + b.d * 0.4;
        c.stroke();
        if (b.d === 1) {
          c.fillStyle = color(b.h + t * 3, 75, 0.6);
          path(
            c,
            [
              [d[0], d[1] - 3],
              [d[0] + 2, d[1]],
              [d[0], d[1] + 3],
              [d[0] - 2, d[1]],
            ],
            true,
          );
          c.fill();
        }
      });
    },
  );

  room(
    56,
    "blooming-archipelago",
    "Blooming Archipelago",
    "landscape",
    "floating terraced islands · living crowns · atmospheric layers",
    function () {
      this.B = seeds(24, 756);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      this.B.slice()
        .sort(function (a, b) {
          return a.z - b.z;
        })
        .forEach(function (p, i, list) {
          if (
            list.length > 70 &&
            i >
              list.length *
                (0.25 + 0.75 * ex(S).density) *
                (0.4 + 0.6 * ex(S).detail)
          )
            return;
          var x = (((p.x + t * 0.002 * (0.4 + p.z)) % 1.2) - 0.1) * W,
            y = H * (0.18 + p.y * 0.6) + Math.sin(t * 0.14 + i) * H * 0.012,
            r = Math.min(W, H) * (0.035 + p.z * 0.06);
          path(
            c,
            [
              [x - r, y],
              [x + r, y],
              [x + r * 0.3, y + r * 0.55],
              [x - r * 0.2, y + r * 1.05],
            ],
            true,
          );
          c.fillStyle = color(p.h + t * 2, 22 + p.z * 15);
          c.fill();
          c.beginPath();
          c.ellipse(x, y, r, r * 0.23, 0, 0, TAU);
          c.fillStyle = color(p.h + 60 + t * 2, 45);
          c.fill();
          for (var j = 0; j < 7; j++) {
            var a = j * 2.4,
              X = x + Math.cos(a) * r * 0.55,
              Y = y + Math.sin(a) * r * 0.13;
            c.beginPath();
            c.ellipse(
              X,
              Y - r * 0.17,
              r * 0.09,
              r * 0.24,
              0.2 * Math.sin(t * 0.25 + j),
              0,
              TAU,
            );
            c.fillStyle = color(p.h + j * 17 + t * 3, 64, 0.6);
            c.fill();
          }
        });
    },
  );

  room(
    58,
    "planetary-cilia",
    "Planetary Cilia",
    "organic",
    "living planetoid · surface flow · polar ciliary waves",
    function () {},
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H);
      var B = [],
        N = 1100;
      for (var i = 0; i < N; i++) {
        var z = 1 - (2 * (i + 0.5)) / N,
          r = Math.sqrt(1 - z * z),
          a = i * 2.399,
          base = [Math.cos(a) * r, z, Math.sin(a) * r],
          length = 0.1 + 0.06 * Math.sin(z * 6 + a * 0.4 - t * 0.5),
          tip = [
            base[0] * (1 + length) + 0.04 * Math.sin(t * 0.4 + z * 8),
            base[1] * (1 + length),
            base[2] * (1 + length),
          ];
        var A = spin(base, t * 0.45),
          D = spin(tip, t * 0.45);
        B.push({ a: A, b: D, z: A[2], h: z * 160 + a * 10 + t * 3 });
      }
      B.sort(function (a, b) {
        return b.z - a.z;
      });
      B.forEach(function (b) {
        if (b.z > 0) return;
        var a = proj(b.a, W, H),
          d = proj(b.b, W, H);
        path(c, [a, d]);
        c.strokeStyle = color(b.h, 58, 0.7);
        c.lineWidth = 1.1;
        c.stroke();
      });
    },
  );

  room(
    60,
    "invertebrate-opera",
    "Invertebrate Opera",
    "surreal",
    "undulating manta membranes · articulated wings · translucent living sculpture",
    function () {},
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t,
        F = [];
      bg(c, W, H);
      function p(u, v) {
        var span = u * 1.6,
          z =
            0.25 * Math.sin(u * 3 - t * 0.4) * (1 - Math.abs(v)) +
            0.16 * Math.cos(v * 4 + t * 0.2);
        return spin([span, v * (0.4 + 0.3 * Math.cos(u * 2)), z], t * 0.4);
      }
      for (var j = 0; j < 24; j++)
        for (var i = 0; i < 50; i++) {
          var u = (i / 50) * 2 - 1,
            v = (j / 24) * 2 - 1,
            du = 0.04,
            dv = 2 / 24;
          face(
            F,
            [p(u, v), p(u + du, v), p(u + du, v + dv), p(u, v + dv)],
            i * 4 + j * 7 + t * 3,
            30 + 24 * (0.5 + 0.5 * Math.cos(u * 3 + v * 2 - t * 0.3)),
          );
        }
      faces(c, F, W, H);
    },
  );

  room(
    62,
    "quiet-terrarium",
    "Quiet Terrarium",
    "minimal",
    "glass habitat · suspended botanical forms · pale auratic space",
    function () {
      this.B = seeds(16, 762);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t;
      bg(c, W, H, true);
      var vertices = [
        [-1, -0.8, -0.6],
        [1, -0.8, -0.6],
        [1, 0.8, -0.6],
        [-1, 0.8, -0.6],
        [-1, -0.8, 0.6],
        [1, -0.8, 0.6],
        [1, 0.8, 0.6],
        [-1, 0.8, 0.6],
      ].map(function (p) {
        return proj(spin(p, t * 0.12), W, H);
      });
      [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ].forEach(function (e) {
        path(c, [vertices[e[0]], vertices[e[1]]]);
        c.strokeStyle = "rgba(45,91,111,.3)";
        c.lineWidth = 1;
        c.stroke();
      });
      this.B.forEach(function (p, i, list) {
        if (
          list.length > 70 &&
          i >
            list.length *
              (0.25 + 0.75 * ex(S).density) *
              (0.4 + 0.6 * ex(S).detail)
        )
          return;
        var q = proj(
            spin(
              [(p.x - 0.5) * 1.6, 0.45 - p.y * 0.8, (p.z - 0.5) * 0.85],
              t * 0.12,
            ),
            W,
            H,
          ),
          r = q[2] * (0.04 + p.s * 0.035);
        c.beginPath();
        c.ellipse(q[0], q[1], r, r * 1.5, 0.3 * Math.sin(t * 0.2 + i), 0, TAU);
        c.fillStyle = color(p.h + t * 2, 65, 0.4);
        c.fill();
        path(c, [
          [q[0], q[1] + r],
          [q[0] + Math.sin(t * 0.2 + i) * r * 0.3, q[1] + r * 4],
        ]);
        c.strokeStyle = color(p.h + t * 2, 35, 0.6);
        c.stroke();
      });
    },
    { theme: "paper" },
  );

  room(
    64,
    "ocean-of-memory",
    "Ocean of Memory",
    "painterly",
    "persistent light currents · gentle trail integration · evolving temporal field",
    function () {
      this.P = seeds(600, 764);
      this.cv = document.createElement("canvas");
      this.cv.width = 640;
      this.cv.height = 400;
      this.cx = this.cv.getContext("2d");
      this.cx.fillStyle = "#030b25";
      this.cx.fillRect(0, 0, 640, 400);
    },
    function (S) {
      var c = S.ctx,
        W = S.w,
        H = S.h,
        t = S.t,
        cc = this.cx;
      if (S.dt > 0) {
        cc.fillStyle = "rgba(3,11,37,.018)";
        cc.fillRect(0, 0, 640, 400);
        this.P.forEach(function (p, i, list) {
          if (
            list.length > 70 &&
            i >
              list.length *
                (0.25 + 0.75 * ex(S).density) *
                (0.4 + 0.6 * ex(S).detail)
          )
            return;
          var x = p.x,
            y = p.y,
            a = Math.sin(x * 5 + t * 0.08) + Math.cos(y * 6 - t * 0.09);
          p.x = (p.x + Math.cos(a) * S.dt * 0.04 + 1) % 1;
          p.y = (p.y + Math.sin(a) * S.dt * 0.04 + 1) % 1;
          if (Math.abs(x - p.x) < 0.5 && Math.abs(y - p.y) < 0.5) {
            path(cc, [
              [x * 640, y * 400],
              [p.x * 640, p.y * 400],
            ]);
            cc.strokeStyle = color(p.h + t * 3, 72, 0.75);
            cc.lineWidth = 1.4;
            cc.stroke();
          }
        });
      }
      c.drawImage(this.cv, 0, 0, W, H);
    },
    { previewFrames: 70 },
  );
})(window);
