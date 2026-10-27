/* VIII: bounded ecologies, inherited variation and distinct drawing grammars.
   Local seeds only. State advances exclusively with positive dt; no uploads.
   This is procedural evolution, not biological realism or a trained AI. */
(function (w) {
  "use strict";
  var TAU = Math.PI * 2;
  function rng(seed) {
    return function () {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 4294967296;
    };
  }
  function clamp(x, a, b) {
    return Math.max(a, Math.min(b, x));
  }
  function tune(S) {
    return Object.assign(
      {
        growth: 0.65,
        mutation: 0.5,
        coupling: 0.6,
        lifecycle: 0.55,
        atmosphere: 0.65,
        symmetry: 0.5,
        drift: 0.45,
        afterglow: 0.55,
        density: 0.75,
        detail: 0.85,
        intensity: 0.65,
        pulse: 0.5,
        colorSafe: false,
      },
      S.experience || {},
    );
  }
  function fresh(L, x, y, parent, mate, e) {
    var r = L.random,
      g = parent
        ? parent.g.map(function (v, i) {
            return clamp(
              v * 0.62 +
                (mate ? mate.g[i] : v) * 0.38 +
                (r() - 0.5) * e.mutation * 0.22,
              0.03,
              0.97,
            );
          })
        : [r(), r(), r(), r()];
    return {
      id: ++L.serial,
      x: x,
      y: y,
      z: r(),
      vx: 0,
      vy: 0,
      g: g,
      age: parent ? 0 : r() * 20,
      energy: parent ? 0.6 : 0.6 + r(),
      parent: parent ? parent.id : 0,
      otherParent: mate ? mate.id : 0,
      generation: parent
        ? Math.max(parent.generation, mate ? mate.generation : 0) + 1
        : 0,
      a: r() * TAU,
      trail: [],
    };
  }
  function create(seed, count, mode) {
    var L = {
      random: rng(seed),
      serial: 0,
      mode: mode,
      time: 0,
      steps: 0,
      births: 0,
      deaths: 0,
      agents: [],
      field: new Float32Array(48 * 30),
      maxGeneration: 0,
    };
    for (var i = 0; i < count; i++)
      L.agents.push(fresh(L, L.random(), L.random(), null, null, {}));
    return L;
  }
  function evolve(L, dt, e) {
    if (dt <= 0) return;
    dt = Math.min(dt, 0.05);
    L.time += dt;
    L.steps++;
    var r = L.random,
      A = L.agents,
      N = A.length,
      cap = Math.round(35 + 175 * e.density * (0.4 + 0.6 * e.detail)),
      offspring = [],
      rate = 0.35 + e.lifecycle * 1.3;
    for (var k = 0; k < L.field.length; k++)
      L.field[k] *= Math.exp(-dt * (0.16 + 0.25 * (1 - e.afterglow)));
    for (var i = 0; i < N; i++) {
      var p = A[i],
        mate = A[(i + 7) % N],
        gx = Math.min(47, Math.max(0, Math.floor(p.x * 48))),
        gy = Math.min(29, Math.max(0, Math.floor(p.y * 30))),
        ix = gy * 48 + gx;
      p.age += dt * rate;
      var t = L.time,
        a = p.a,
        fx = 0,
        fy = 0,
        m = L.mode;
      if (m % 8 === 0) {
        fx = Math.sin(p.y * 7 + t * 0.12 + p.g[0] * 3);
        fy = Math.cos(p.x * 6 - t * 0.1);
      }
      if (m % 8 === 1) {
        fx = -(p.y - 0.5) * 2 + Math.sin(t * 0.13 + a) * 0.3;
        fy = (p.x - 0.5) * 2 + Math.cos(t * 0.1 + a) * 0.3;
      }
      if (m % 8 === 2) {
        fx = (mate.x - p.x) * e.coupling * 2 + Math.cos(a + t * 0.08);
        fy = (mate.y - p.y) * e.coupling * 2 + Math.sin(a + t * 0.11);
      }
      if (m % 8 === 3) {
        fx = Math.sin(p.y * 13 + Math.cos(p.x * 7 + t * 0.1)) * 1.2;
        fy = Math.cos(p.x * 11 - Math.sin(p.y * 8 - t * 0.11));
      }
      if (m % 8 === 4) {
        var left = L.field[gy * 48 + Math.max(0, gx - 1)],
          right = L.field[gy * 48 + Math.min(47, gx + 1)];
        fx = (right - left) * 3 + Math.cos(a + t * 0.04);
        fy = Math.sin(a + t * 0.07) + (0.5 - p.y) * 0.7;
      }
      if (m % 8 === 5) {
        var dx = p.x - 0.5,
          dy = p.y - 0.5,
          rad = Math.hypot(dx, dy) + 0.001;
        fx = -dy / rad + (0.3 - rad) * dx * 3;
        fy = dx / rad + (0.3 - rad) * dy * 3;
      }
      if (m % 8 === 6) {
        fx = Math.cos(a) * 0.6 + Math.sin(t * 0.2 + p.y * 5);
        fy = -0.4 + Math.cos(p.x * 8 + t * 0.13) * 0.65;
      }
      if (m % 8 === 7) {
        fx = -(p.x - 0.5) * 1.3 + Math.sin(p.y * 9 + t * 0.13) * 0.5;
        fy = -(p.y - 0.5) * 1.3 + Math.cos(p.x * 8 - t * 0.15) * 0.5;
      }
      var drag = Math.exp(-dt * 1.8);
      p.vx = p.vx * drag + fx * dt * 0.035;
      p.vy = p.vy * drag + fy * dt * 0.035;
      p.x = clamp(p.x + p.vx * dt, 0.025, 0.975);
      p.y = clamp(p.y + p.vy * dt, 0.025, 0.975);
      if (p.x <= 0.025 || p.x >= 0.975) p.vx *= -0.8;
      if (p.y <= 0.025 || p.y >= 0.975) p.vy *= -0.8;
      var food =
        0.5 + 0.5 * Math.sin(p.x * 9 + Math.cos(p.y * 7 - t * 0.07) + t * 0.03);
      p.energy +=
        dt * (0.06 + e.growth * 0.2) * (food - 0.16 - L.field[ix] * 0.045);
      L.field[ix] = Math.min(2, L.field[ix] + dt * 0.1);
      if (p.energy > 1.8 && N + offspring.length < cap && p.age > 5) {
        p.energy = 0.7;
        var child = fresh(
          L,
          clamp(p.x + (r() - 0.5) * 0.045, 0.04, 0.96),
          clamp(p.y + (r() - 0.5) * 0.045, 0.04, 0.96),
          p,
          mate,
          e,
        );
        offspring.push(child);
        L.births++;
        L.maxGeneration = Math.max(L.maxGeneration, child.generation);
      }
      if (p.age > 28 + p.g[3] * 38) {
        p.age = 0;
        p.energy = 0.5;
        p.g[(L.steps + i) % 4] = clamp(
          p.g[(L.steps + i) % 4] + (r() - 0.5) * e.mutation * 0.15,
          0.03,
          0.97,
        );
        L.deaths++;
      }
      // Display-only envelopes: birth/renewal and nearly-stationary heading
      // changes must not snap a silhouette. Solver genes/forces are untouched.
      var smooth = 1 - Math.exp(-dt * 4);
      p.displayEnergy = (p.displayEnergy ?? p.energy) + (p.energy - (p.displayEnergy ?? p.energy)) * smooth;
      p.displayAge = (p.displayAge ?? p.age) + (p.age - (p.displayAge ?? p.age)) * smooth;
      var desired = Math.hypot(p.vx, p.vy) > .0005 ? Math.atan2(p.vy,p.vx) : (p.heading ?? p.a);
      var heading = p.heading ?? p.a;
      p.heading = heading + Math.atan2(Math.sin(desired-heading),Math.cos(desired-heading)) * smooth;
      p.trail.push([p.x, p.y]);
      if (p.trail.length > 28) p.trail.shift();
    }
    L.agents = A.concat(offspring);
    if (L.agents.length > cap) L.agents = L.agents.slice(0, cap);
  }
  var palettes = [
    [178, 42],
    [280, 170],
    [28, 200],
    [210, 330],
    [155, 275],
    [42, 225],
    [325, 170],
    [190, 28],
  ];
  function ink(h, l, a, e) {
    var hue = e.colorSafe ? (Math.sin(h * 0.017) > 0 ? 207 : 43) : h;
    return (
      "hsla(" +
      hue +
      "," +
      (e.colorSafe ? 65 : 74) +
      "%," +
      l +
      "%," +
      clamp(a * (0.55 + e.intensity * 0.7), 0, 1) +
      ")"
    );
  }
  function hue(p, K, t) {
    var P = palettes[K % 8];
    return (
      P[0] + (P[1] - P[0]) * p.g[0] + Math.sin(t * 0.018 + p.g[1] * 5) * 18
    );
  }
  function background(c, W, H, K, paper) {
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(
      0,
      paper ? "#e5e8e0" : ["#020b15", "#0d0619", "#07151b", "#150e0b"][K % 4],
    );
    g.addColorStop(
      1,
      paper ? "#f4ead9" : ["#083034", "#180c29", "#07263c", "#292011"][K % 4],
    );
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
  function line(c, P) {
    c.beginPath();
    for (var j = 0; j < P.length; j++) {
      if (j) c.lineTo(P[j][0], P[j][1]);
      else c.moveTo(P[j][0], P[j][1]);
    }
  }
  function glow(c, x, y, r, h, a, e) {
    if (r <= 0) return;
    var g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, ink(h, 75, a, e));
    g.addColorStop(1, ink(h, 45, 0, e));
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function disc(c, x, y, r, h, e, a) {
    c.beginPath();
    c.arc(x, y, Math.max(0.1, r), 0, TAU);
    c.fillStyle = ink(h, 67, a === undefined ? 0.7 : a, e);
    c.fill();
  }
  function project(x, y, z, W, H) {
    var d = 3.5 + z,
      scale = (Math.min(W, H) * 1.1) / d;
    return [W * 0.5 + x * scale, H * 0.5 + y * scale, scale];
  }
  function polygon(c, P, h, e, alpha) {
    line(c, P);
    c.closePath();
    c.fillStyle = ink(h, 52, alpha === undefined ? 0.65 : alpha, e);
    c.fill();
    c.strokeStyle = ink(h + 15, 76, 0.3, e);
    c.lineWidth = 0.7;
    c.stroke();
  }
  function room(K, id, name, family, tag, paint, options) {
    options = options || {};
    return w.CabinetVIII.register(K * 2, id, name, family, tag, "2d", {
      theme: options.paper ? "paper" : "dark",
      lifeMechanism:
        options.mechanism ||
        "Nutrient competition, bounded reproduction, two-parent variation, aging and local field memory.",
      previewFrames: options.frames || 80,
      init: function () {
        this.L = create(800 + K, options.count || 70, K - 1);
        this.clock = 0;
        if (options.init) options.init.call(this);
        for (var k = 0; k < 35; k++) evolve(this.L, 1 / 30, tune({}));
      },
      advance: function (S, e) {
        e = e || tune(S);
        if (S.dt > 0) {
          this.clock += S.dt;
          evolve(this.L, S.dt, e);
          if (options.step) options.step.call(this, S, e);
        }
      },
      frame: function (S) {
        var e = tune(S);
        this.advance(S, e);
        var c = S.ctx,
          W = S.w,
          H = S.h,
          t = this.clock,
          A = this.L.agents;
        background(c, W, H, K, options.paper);
        c.save();
        paint.call(this, c, W, H, t, A, e, S, K);
        c.restore();
      },
    });
  }
  room(
    1,
    "eden-of-divergence",
    "Eden of Divergence",
    "organic",
    "genetic canopy · fertile blooms · nutrient weather",
    function (c, W, H, t, A, e, S, K) {
      A.slice()
        .sort(function (a, b) {
          return a.z - b.z;
        })
        .forEach(function (p, i) {
          var x = p.x * W,
            y = H * (0.85 - p.z * 0.18),
            len = H * (0.16 + p.g[1] * 0.42),
            bend = Math.sin(t * 0.18 + p.a) * len * 0.18,
            h = hue(p, K, t),
            tip = [x + bend, y - len],
            r = len * (0.055 + 0.07 * p.g[2]);
          c.beginPath();
          c.moveTo(x, y);
          c.bezierCurveTo(
            x - bend,
            y - len * 0.4,
            x + bend * 1.4,
            y - len * 0.75,
            tip[0],
            tip[1],
          );
          c.strokeStyle = ink(h, 46, 0.45, e);
          c.lineWidth = 0.7 + p.z * 2;
          c.stroke();
          for (var j = 0; j < 6; j++) {
            var a = (j * TAU) / 6 + t * 0.03 + p.a;
            c.beginPath();
            c.ellipse(
              tip[0] + Math.cos(a) * r * 0.65,
              tip[1] + Math.sin(a) * r * 0.65,
              r,
              r * 0.35,
              a,
              0,
              TAU,
            );
            c.fillStyle = ink(h + j * 6, 65, 0.35, e);
            c.fill();
          }
          glow(c, tip[0], tip[1], r * 2, h, 0.35, e);
          disc(c, tip[0], tip[1], r * 0.22, h + 30, e);
        });
    },
    { count: 35 },
  );
  room(
    2,
    "abyssal-communion",
    "Abyssal Communion",
    "organic",
    "colonial bells · sympathetic filaments · deep currents",
    function (c, W, H, t, A, e, S, K) {
      A.slice(0, 24).forEach(function (p, i) {
        var x = (0.1 + p.x * 0.8) * W,
          y = (0.1 + p.y * 0.6) * H,
          r = Math.min(W, H) * (0.035 + p.g[1] * 0.07),
          h = hue(p, K, t);
        glow(c, x, y, r * 2.2, h, 0.18, e);
        c.beginPath();
        c.ellipse(
          x,
          y,
          r,
          r * (0.5 + 0.07 * Math.sin(t * 0.4 + p.a)),
          0,
          Math.PI,
          TAU,
        );
        c.quadraticCurveTo(x, y + r * 0.4, x - r, y);
        c.fillStyle = ink(h, 67, 0.28, e);
        c.fill();
        c.strokeStyle = ink(h, 82, 0.5, e);
        c.stroke();
        for (var j = 0; j < 11; j++) {
          var P = [];
          for (var k = 0; k < 24; k++) {
            var q = k / 23;
            P.push([
              x +
                (j - 5) * r * 0.13 +
                Math.sin(q * 8 - t * 0.4 + j * 0.4 + p.a) * r * q * 0.4,
              y + q * r * 3.5,
            ]);
          }
          line(c, P);
          c.strokeStyle = ink(h + j * 3, 62, 0.3, e);
          c.lineWidth = 0.8;
          c.stroke();
        }
      });
    },
    { count: 28 },
  );
  room(
    3,
    "glass-moth-migration",
    "Glass Moth Migration",
    "surreal",
    "folded wing flock · inherited anatomy · parallax migration",
    function (c, W, H, t, A, e, S, K) {
      A.slice()
        .sort(function (a, b) {
          return a.z - b.z;
        })
        .forEach(function (p, i) {
          var x = p.x * W,
            y = p.y * H,
            r = Math.min(W, H) * (0.012 + p.z * 0.035),
            h = hue(p, K, t),
            flap = 0.3 + 0.7 * Math.sin(t * (0.7 + p.g[1]) + p.a);
          c.save();
          c.translate(x, y);
          c.rotate((p.heading ?? p.a) + Math.PI / 2);
          [-1, 1].forEach(function (s) {
            polygon(
              c,
              [
                [0, -r * 0.5],
                [s * r * 1.5, r * 0.1],
                [s * r * flap, r],
                [0, r * 0.4],
              ],
              h,
              e,
              0.38,
            );
          });
          disc(c, 0, 0, r * 0.15, h + 30, e);
          c.restore();
        });
    },
  );
  room(
    4,
    "cytokinesis-ballet",
    "Cytokinesis Ballet",
    "microscopic",
    "dividing cellular membranes · organelles · local inheritance",
    function (c, W, H, t, A, e, S, K) {
      A.forEach(function (p) {
        var x = p.x * W,
          y = p.y * H,
          r = Math.min(W, H) * (0.012 + p.g[1] * 0.026),
          h = hue(p, K, t),
          split = Math.max(0, (p.displayEnergy ?? p.energy) - 1.1) * 0.6;
        glow(c, x, y, r * 2, h, 0.12, e);
        var P = [];
        for (var j = 0; j < 64; j++) {
          var a = (j / 64) * TAU,
            R =
              r *
              (1 + split * Math.cos(a * 2) + 0.04 * Math.sin(a * 7 + t * 0.3));
          P.push([x + Math.cos(a) * R, y + Math.sin(a) * R]);
        }
        polygon(c, P, h, e, 0.17);
        disc(c, x - r * split * 0.5, y, r * 0.18, h + 30, e, 0.8);
        if (split > 0.12)
          disc(c, x + r * split * 0.5, y, r * 0.16, h - 20, e, 0.6);
      });
    },
    { count: 55 },
  );
  room(
    5,
    "chromatic-myxomycete",
    "Chromatic Myxomycete",
    "microscopic",
    "chemotactic light trails · nutrient competition · colony memory",
    function (c, W, H, t, A, e, S, K) {
      c.drawImage(this.cv, 0, 0, W, H);
    },
    {
      count: 160,
      init: function () {
        this.cv = document.createElement("canvas");
        this.cv.width = 640;
        this.cv.height = 400;
        this.cx = this.cv.getContext("2d");
      },
      step: function (S, e) {
        var c = this.cx;
        c.fillStyle = "rgba(2,9,17," + (0.015 + 0.04 * (1 - e.afterglow)) + ")";
        c.fillRect(0, 0, 640, 400);
        this.L.agents.forEach(function (p) {
          line(
            c,
            p.trail.map(function (q) {
              return [q[0] * 640, q[1] * 400];
            }),
          );
          c.strokeStyle = ink(150 + p.g[0] * 90, 65, 0.35, e);
          c.lineWidth = 1.1;
          c.stroke();
        });
      },
    },
  );
  room(
    6,
    "superorganism-canals",
    "Superorganism Canals",
    "architectural",
    "soft spring bridges · colony nodes · light transport",
    function (c, W, H, t, A, e, S, K) {
      for (var i = 0; i < A.length; i++) {
        var p = A[i],
          q = A[(i + 7) % A.length],
          h = hue(p, K, t),
          d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 0.25) {
          c.beginPath();
          c.moveTo(p.x * W, p.y * H);
          c.quadraticCurveTo(
            (p.x + q.x) * W * 0.5 + Math.sin(t * 0.15 + i) * 20,
            (p.y + q.y) * H * 0.5,
            p.x * W + (q.x - p.x) * W,
            p.y * H + (q.y - p.y) * H,
          );
          c.strokeStyle = ink(h, 65, 0.25 * e.coupling, e);
          c.lineWidth = 1.2;
          c.stroke();
        }
        glow(c, p.x * W, p.y * H, 8 + p.g[1] * 15, h, 0.3, e);
        disc(c, p.x * W, p.y * H, 2 + p.g[2] * 3, h, e);
      }
    },
  );
  room(
    7,
    "octopod-kindergarten",
    "Octopod Kindergarten",
    "organic",
    "tentacled young · soft muscular pulses · coordinated drift",
    function (c, W, H, t, A, e, S, K) {
      A.slice(0, 24).forEach(function (p) {
        var x = p.x * W,
          y = p.y * H,
          r = Math.min(W, H) * (0.018 + p.g[1] * 0.03),
          h = hue(p, K, t);
        for (var j = 0; j < 8; j++) {
          var P = [],
            a = (j / 8) * TAU;
          for (var k = 0; k < 22; k++) {
            var q = k / 21,
              ang = a + Math.sin(q * 4 - t * 0.5 + p.a) * q * 0.7;
            P.push([
              x + Math.cos(ang) * r * (0.6 + q * 2.8),
              y + Math.sin(ang) * r * (0.6 + q * 2.8),
            ]);
          }
          line(c, P);
          c.lineWidth = r * (0.1 + 0.025 * Math.sin(t * 0.4 + p.a));
          c.strokeStyle = ink(h + j * 4, 60, 0.6, e);
          c.stroke();
        }
        glow(c, x, y, r * 1.3, h, 0.4, e);
        disc(c, x, y, r * 0.55, h + 15, e, 0.6);
      });
    },
    { count: 26 },
  );
  room(
    8,
    "germinating-continents",
    "Germinating Continents",
    "landscape",
    "living height field · resource bloom · emergent coastlines",
    function (c, W, H, t, A, e, S, K) {
      var F = this.L.field,
        N = 48,
        M = 30;
      for (var y = 0; y < M; y++)
        for (var x = 0; x < N; x++) {
          var z =
              Math.sin(x * 0.19 + t * 0.08) * Math.cos(y * 0.24 - t * 0.06) +
              F[y * N + x] * 1.5,
            h = 145 + z * 65;
          c.fillStyle = ink(h, 25 + z * 14 + 20, 0.9, e);
          var xx = (x / N) * W,
            yy = (y / M) * H;
          c.fillRect(xx, yy, W / N + 1, H / M + 1);
          if (z > 0.4) {
            c.strokeStyle = ink(40, 70, 0.35, e);
            c.beginPath();
            c.moveTo(xx, yy);
            c.lineTo(xx + W / N, yy - z * 4);
            c.stroke();
          }
        }
    },
    { count: 140 },
  );
  room(
    9,
    "glass-polyp-city",
    "Glass Polyp City",
    "crystalline",
    "spatial coral terraces · crystalline colony · inherited facets",
    function (c, W, H, t, A, e, S, K) {
      var P = A.map(function (p) {
        var a = t * 0.035,
          x = (p.x - 0.5) * 4,
          z = (p.y - 0.5) * 3;
        return {
          p: p,
          q: project(
            x * Math.cos(a) - z * Math.sin(a),
            0.5 - p.g[1] * 0.7,
            x * Math.sin(a) + z * Math.cos(a),
            W,
            H,
          ),
        };
      }).sort(function (a, b) {
        return a.q[2] - b.q[2];
      });
      P.forEach(function (o) {
        var p = o.p,
          q = o.q,
          r = q[2] * (0.035 + p.g[2] * 0.055),
          h = hue(p, K, t),
          Hh = r * (2 + (p.displayEnergy ?? p.energy) * 0.8);
        polygon(
          c,
          [
            [q[0], q[1] - Hh],
            [q[0] + r, q[1] - r * 0.5],
            [q[0], q[1]],
            [q[0] - r, q[1] - r * 0.5],
          ],
          h,
          e,
          0.6,
        );
        c.strokeStyle = ink(h, 75, 0.4, e);
        line(c, [
          [q[0], q[1]],
          [q[0], q[1] + r * 2],
        ]);
        c.stroke();
      });
    },
  );
  room(
    10,
    "symbiotic-lanterns",
    "Symbiotic Lanterns",
    "surreal",
    "floating light vessels · slender roots · sympathetic respiration",
    function (c, W, H, t, A, e, S, K) {
      A.slice(0, 42).forEach(function (p, i) {
        var x = p.x * W,
          y = p.y * H,
          r = Math.min(W, H) * (0.014 + p.g[1] * 0.025),
          h = hue(p, K, t);
        glow(c, x, y, r * 3, h, 0.22, e);
        c.beginPath();
        c.ellipse(x, y, r, r * 1.4, Math.sin(t * 0.17 + p.a) * 0.3, 0, TAU);
        c.fillStyle = ink(h, 65, 0.45, e);
        c.fill();
        for (var j = -2; j <= 2; j++) {
          line(c, [
            [x + j * r * 0.22, y - r],
            [x + j * r * 0.3 + Math.sin(t * 0.2 + i) * r * 0.15, y + r],
            [x + Math.sin(t * 0.3 + i + j) * r * 0.5, y + r * 3.5],
          ]);
          c.strokeStyle = ink(h + j * 4, 76, 0.35, e);
          c.lineWidth = 0.8;
          c.stroke();
        }
      });
    },
  );
  room(
    11,
    "reproductive-interferometer",
    "Reproductive Interferometer",
    "geometric",
    "communicating wave colonies · nested phase fronts · reproduction signals",
    function (c, W, H, t, A, e, S, K) {
      A.slice(0, 22).forEach(function (p) {
        var x = p.x * W,
          y = p.y * H,
          h = hue(p, K, t);
        for (var j = 0; j < 9; j++) {
          var q = (j / 9 + t * 0.028 + p.g[1]) % 1,
            r = q * Math.min(W, H) * 0.22;
          c.beginPath();
          c.ellipse(
            x,
            y,
            Math.max(0.2, r),
            Math.max(0.2, r * (0.55 + p.g[2] * 0.4)),
            p.a,
            0,
            TAU,
          );
          c.strokeStyle = ink(h + q * 40, 70, (1 - q) * 0.6, e);
          c.lineWidth = 1.5;
          c.stroke();
        }
        disc(c, x, y, 2.5, h, e);
      });
    },
    { count: 26 },
  );
  room(
    12,
    "warm-machine-moss",
    "Warm Machine Moss",
    "architectural",
    "jointed soft machines · slow constraints · inherited chain lengths",
    function (c, W, H, t, A, e, S, K) {
      A.slice(0, 25).forEach(function (p, i) {
        var x = p.x * W,
          y = p.y * H,
          h = hue(p, K, t),
          P = [];
        for (var j = 0; j < 10; j++) {
          var a = p.a + j * 0.25 + Math.sin(t * 0.23 + j * 0.6 + i) * 0.45,
            x = x + Math.cos(a) * Math.min(W, H) * 0.013,
            y = y + Math.sin(a) * Math.min(W, H) * 0.013;
          P.push([x, y]);
        }
        line(c, P);
        c.strokeStyle = ink(h, 57, 0.65, e);
        c.lineWidth = 3;
        c.stroke();
        P.forEach(function (q, j) {
          disc(c, q[0], q[1], 1.8, h + j * 5, e);
        });
      });
    },
  );
  room(
    13,
    "chimeric-river",
    "Chimeric River",
    "fluid",
    "ribbon animals · articulated gills · meandering nursery",
    function (c, W, H, t, A, e, S, K) {
      A.slice(0, 25).forEach(function (p, k) {
        var x = p.x * W,
          y = p.y * H,
          len = W * (0.06 + p.g[1] * 0.07),
          h = hue(p, K, t),
          P = [];
        for (var j = 0; j < 40; j++) {
          var q = j / 39;
          P.push([
            x + (q - 0.5) * len,
            y +
              Math.sin(q * 8 - t * 0.6 + p.a) * len * 0.13 -
              Math.sin(q * Math.PI) * len * 0.1,
          ]);
        }
        for (var j = 39; j >= 0; j--) {
          var q = j / 39;
          P.push([
            x + (q - 0.5) * len,
            y +
              Math.sin(q * 8 - t * 0.6 + p.a) * len * 0.13 +
              Math.sin(q * Math.PI) * len * 0.1,
          ]);
        }
        polygon(c, P, h, e, 0.45);
        disc(
          c,
          x + len * 0.35,
          y + Math.sin(7 - t * 0.6 + p.a) * len * 0.1,
          1.8,
          h + 40,
          e,
        );
      });
    },
  );
  room(
    14,
    "fertile-nebular-dust",
    "Fertile Nebular Dust",
    "celestial",
    "stellar attractor nurseries · curved particle streams · shared gravity",
    function (c, W, H, t, A, e, S, K) {
      var scale = Math.min(W, H) * 0.4,
        particles = this.dust;
      particles.forEach(function (p, i) {
        if (i > particles.length * (0.25 + 0.75 * e.density)) return;
        line(
          c,
          p.path.map(function (q) {
            return [W * 0.5 + q[0] * scale, H * 0.5 + q[1] * scale];
          }),
        );
        c.strokeStyle = ink(185 + p.h * 110, 70, 0.5, e);
        c.lineWidth = 1.2;
        c.stroke();
      });
    },
    {
      count: 25,
      mechanism:
        "Bounded particle attractor flow with slowly moving gravitational anchors.",
      init: function () {
        var r = this.L.random;
        this.dust = Array.from({ length: 800 }, function () {
          return {
            x: r() * 2 - 1,
            y: r() * 2 - 1,
            vx: 0,
            vy: 0,
            h: r(),
            path: [],
          };
        });
      },
      step: function (S, e) {
        var t = this.clock,
          dt = S.dt;
        this.dust.forEach(function (p) {
          var ax = -p.x * 0.2,
            ay = -p.y * 0.2;
          for (var j = 0; j < 3; j++) {
            var a = (j * TAU) / 3 + t * 0.035,
              x = p.x - Math.cos(a) * 0.5,
              y = p.y - Math.sin(a) * 0.5,
              d = x * x + y * y + 0.1;
            ax -= (y / d) * 0.05;
            ay += (x / d) * 0.05;
          }
          p.vx = (p.vx + ax * dt) * 0.993;
          p.vy = (p.vy + ay * dt) * 0.993;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (Math.abs(p.x) > 1.6 || Math.abs(p.y) > 1.6) {
            p.x *= 0.5;
            p.y *= 0.5;
          }
          p.path.push([p.x, p.y]);
          if (p.path.length > 26) p.path.shift();
        });
      },
    },
  );
  room(
    15,
    "dendritic-negotiations",
    "Dendritic Negotiations",
    "organic",
    "negotiated branch space · inherited angles · flexible coral graph",
    function (c, W, H, t, A, e, S, K) {
      A.slice(0, 24).forEach(function (p, k) {
        var h = hue(p, K, t),
          size = Math.min(W, H) * (0.05 + p.g[1] * 0.1);
        function branch(x, y, a, len, depth) {
          if (!depth) return;
          var X = x + Math.cos(a) * len,
            Y = y + Math.sin(a) * len;
          line(c, [
            [x, y],
            [X, Y],
          ]);
          c.strokeStyle = ink(h + depth * 7, 62, 0.25 + depth * 0.1, e);
          c.lineWidth = 0.4 + depth * 0.5;
          c.stroke();
          var spread = 0.28 + p.g[2] * 0.45;
          branch(
            X,
            Y,
            a - spread + 0.09 * Math.sin(t * 0.2 + k),
            len * 0.65,
            depth - 1,
          );
          branch(X, Y, a + spread, len * 0.7, depth - 1);
        }
        branch(p.x * W, p.y * H, -Math.PI / 2 + p.g[3] - 0.5, size, 4);
      });
    },
  );
  room(
    16,
    "garden-of-inverted-rain",
    "Garden of Inverted Rain",
    "landscape",
    "buoyant rain spores · inverted seed fountains · opposing gravity",
    function (c, W, H, t, A, e, S, K) {
      A.forEach(function (p, i) {
        var q = (p.y + t * (0.025 + p.g[1] * 0.04)) % 1,
          x = (p.x + Math.sin(q * 6 + p.a) * 0.025) * W,
          y = (1 - q) * H,
          h = hue(p, K, t);
        line(c, [
          [x, y],
          [x + Math.cos(q * 6 + p.a) * W * 0.002, y + H * 0.028],
        ]);
        c.strokeStyle = ink(h, 73, 0.7, e);
        c.lineWidth = 2.2;
        c.stroke();
        disc(c, x, y, 2 + p.g[2] * 2, h, e, 0.6);
        if (i % 4 === 0) glow(c, x, y, 10, h, 0.3, e);
      });
    },
    { count: 130 },
  );
  room(
    17,
    "symphony-of-diatoms",
    "Symphony of Diatoms",
    "microscopic",
    "silicate micro-shells · radial cellular anatomy · intergenerational variation",
    function (c, W, H, t, A, e, S, K) {
      A.slice(0, 40).forEach(function (p) {
        var x = p.x * W,
          y = p.y * H,
          r = Math.min(W, H) * (0.03 + p.g[1] * 0.045),
          h = hue(p, K, t);
        c.save();
        c.translate(x, y);
        c.rotate(p.a + t * 0.025);
        c.scale(1, 0.5 + p.g[2] * 0.5);
        for (var j = 0; j < 3; j++) {
          c.beginPath();
          c.arc(0, 0, r * (0.45 + j * 0.25), 0, TAU);
          c.strokeStyle = ink(h + j * 15, 76, 0.65, e);
          c.lineWidth = 1;
          c.stroke();
        }
        for (var j = 0; j < 16; j++) {
          var a = (j / 16) * TAU;
          line(c, [
            [Math.cos(a) * r * 0.35, Math.sin(a) * r * 0.35],
            [Math.cos(a) * r, Math.sin(a) * r],
          ]);
          c.strokeStyle = ink(h, 65, 0.35, e);
          c.stroke();
        }
        c.restore();
      });
    },
  );
  function chemistry(d, steps) {
    var N = 96,
      M = 60;
    for (var k = 0; k < steps; k++) {
      for (var y = 1; y < M - 1; y++)
        for (var x = 1; x < N - 1; x++) {
          var i = y * N + x,
            u = d.U[i],
            v = d.V[i],
            lu = d.U[i - 1] + d.U[i + 1] + d.U[i - N] + d.U[i + N] - 4 * u,
            lv = d.V[i - 1] + d.V[i + 1] + d.V[i - N] + d.V[i + N] - 4 * v,
            react = u * v * v;
          d.UU[i] = clamp(u + 0.17 * lu - react + 0.035 * (1 - u), 0, 1);
          d.VV[i] = clamp(v + 0.085 * lv + react - (0.062 + 0.035) * v, 0, 1);
        }
      var t = d.U;
      d.U = d.UU;
      d.UU = t;
      t = d.V;
      d.V = d.VV;
      d.VV = t;
    }
  }
  room(
    18,
    "binary-tidepool",
    "Binary Tidepool",
    "microscopic",
    "reaction–diffusion ecology · dividing spots · chemical coastlines",
    function (c, W, H, t, A, e, S, K) {
      var image = this.image;
      for (var i = 0; i < 96 * 60; i++) {
        var v = this.V[i],
          u = this.U[i],
          h = 180 + (v - u) * 100,
          light = 18 + v * 100;
        var a = (h % 360) / 60,
          X = 1 - Math.abs((a % 2) - 1),
          rgb =
            a < 1
              ? [1, X, 0]
              : a < 2
                ? [X, 1, 0]
                : a < 3
                  ? [0, 1, X]
                  : a < 4
                    ? [0, X, 1]
                    : a < 5
                      ? [X, 0, 1]
                      : [1, 0, X];
        image.data[i * 4] = Math.min(255, light + rgb[0] * v * 500);
        image.data[i * 4 + 1] = Math.min(255, light + rgb[1] * v * 500);
        image.data[i * 4 + 2] = Math.min(255, light + rgb[2] * v * 500);
        if (e.colorSafe) {
          var k = clamp(v * 2, 0, 1);
          image.data[i * 4] = 20 + 210 * k;
          image.data[i * 4 + 1] = 55 + 110 * k;
          image.data[i * 4 + 2] = 140 - 110 * k;
        }
        image.data[i * 4 + 3] = 255;
      }
      this.cx.putImageData(image, 0, 0);
      c.drawImage(this.cv, 0, 0, W, H);
    },
    {
      count: 16,
      init: function () {
        this.U = new Float32Array(5760).fill(1);
        this.V = new Float32Array(5760);
        this.UU = new Float32Array(5760).fill(1);
        this.VV = new Float32Array(5760);
        for (var k = 0; k < 15; k++) {
          var x = 5 + Math.floor(this.L.random() * 85),
            y = 5 + Math.floor(this.L.random() * 49);
          for (var j = -3; j <= 3; j++)
            for (var i = -3; i <= 3; i++) {
              this.U[(y + j) * 96 + x + i] = 0.5;
              this.V[(y + j) * 96 + x + i] = 0.3;
            }
        }
        this.cv = document.createElement("canvas");
        this.cv.width = 96;
        this.cv.height = 60;
        this.cx = this.cv.getContext("2d");
        this.image = this.cx.createImageData(96, 60);
        chemistry(this, 120);
      },
      step: function (S, e) {
        this.chemAcc = (this.chemAcc || 0) + S.dt * (15 + e.growth * 45);
        var steps = Math.min(8, Math.floor(this.chemAcc));
        this.chemAcc -= steps;
        chemistry(this, steps);
      },
      mechanism:
        "Bounded Gray–Scott reaction–diffusion with seeded chemical colonies.",
    },
  );
  room(
    19,
    "feathers-of-impossible-birds",
    "Feathers of Impossible Birds",
    "surreal",
    "articulated feather fans · structural colour · slow quill rotation",
    function (c, W, H, t, A, e, S, K) {
      A.slice(0, 17).forEach(function (p) {
        var x = p.x * W,
          y = p.y * H,
          L = Math.min(W, H) * (0.09 + p.g[1] * 0.15),
          a = p.a + Math.sin(t * 0.13 + p.a) * 0.35,
          h = hue(p, K, t);
        c.save();
        c.translate(x, y);
        c.rotate(a);
        for (var j = 0; j < 25; j++) {
          var q = j / 24,
            r = Math.sin(q * Math.PI) * L * 0.28;
          line(c, [
            [-r, q * L],
            [0, q * L - r * 0.4],
            [r, q * L],
          ]);
          c.strokeStyle = ink(205 + p.g[0] * 30, 30, 0.6, e);
          c.lineWidth = 1.2;
          c.stroke();
        }
        c.restore();
      });
    },
    { paper: true, count: 20 },
  );
  room(
    20,
    "colonial-clocksea",
    "Colonial Clocksea",
    "geometric",
    "coupled oscillatory colonies · orbit exchange · polyrhythmic motion",
    function (c, W, H, t, A, e, S, K) {
      A.forEach(function (p, i) {
        var a = p.a + t * (0.025 + p.g[1] * 0.04),
          r = Math.min(W, H) * (0.1 + p.g[2] * 0.3),
          x = W * 0.5 + Math.cos(a) * r,
          y = H * 0.5 + Math.sin(a * (1.01 + e.coupling * 0.03)) * r,
          h = hue(p, K, t);
        disc(c, x, y, 2 + p.g[3] * 4, h, e, 0.8);
        if (i % 3 === 0) {
          line(c, [
            [W * 0.5, H * 0.5],
            [x, y],
          ]);
          c.strokeStyle = ink(h, 56, 0.15, e);
          c.lineWidth = 0.8;
          c.stroke();
        }
      });
    },
  );
  room(
    21,
    "tessera-organisms",
    "Tessera Organisms",
    "geometric",
    "living tessellated membrane · spatial morphogenesis · inherited topology",
    function (c, W, H, t, A, e, S, K) {
      var F = [],
        N = 26,
        M = 17;
      function pt(i, j) {
        var x = (i / N - 0.5) * 3.3,
          y = (j / M - 0.5) * 2.1,
          z =
            0.3 * Math.sin(x * 2 + t * 0.16) * Math.cos(y * 3 - t * 0.13) +
            0.1 * Math.sin(x * 5 + y * 4 + t * 0.2);
        return project(x, y, z, W, H);
      }
      for (var j = 0; j < M; j++)
        for (var i = 0; i < N; i++) {
          var a = pt(i, j),
            b = pt(i + 1, j),
            d = pt(i, j + 1),
            f = pt(i + 1, j + 1),
            p = A[(i + j * N) % A.length],
            h = hue(p, K, t);
          polygon(c, [a, b, f], h, e, 0.7);
          polygon(c, [a, f, d], h + 18, e, 0.55);
        }
    },
  );
  room(
    22,
    "darklight-pollinators",
    "Darklight Pollinators",
    "organic",
    "pollinator exchanges · nectar nodes · two-parent inheritance",
    function (c, W, H, t, A, e, S, K) {
      var F = A.slice(0, 14);
      F.forEach(function (p, i) {
        var x = p.x * W,
          y = p.y * H,
          r = Math.min(W, H) * (0.015 + p.g[1] * 0.025),
          h = hue(p, K, t);
        for (var j = 0; j < 5; j++) {
          var a = (j * TAU) / 5 + t * 0.03;
          c.beginPath();
          c.ellipse(
            x + Math.cos(a) * r * 0.5,
            y + Math.sin(a) * r * 0.5,
            r,
            r * 0.3,
            a,
            0,
            TAU,
          );
          c.fillStyle = ink(h, 63, 0.5, e);
          c.fill();
        }
        glow(c, x, y, r, h, 0.35, e);
      });
      for (var i = 0; i < 140; i++) {
        var p = F[i % F.length],
          q = F[(i + 3) % F.length],
          a = 0.5 + 0.5 * Math.sin(t * (0.13 + p.g[2] * 0.05) + i),
          x = (p.x * (1 - a) + q.x * a + Math.sin(a * TAU + i) * 0.025) * W,
          y = (p.y * (1 - a) + q.y * a + Math.cos(a * TAU + i) * 0.025) * H;
        disc(c, x, y, 1.2, hue(p, K, t), e, 0.8);
      }
    },
  );
  room(
    23,
    "luminous-termite-city",
    "Luminous Termite City",
    "architectural",
    "stigmergic towers · luminous voxel strata · cooperative build fields",
    function (c, W, H, t, A, e, S, K) {
      var N = 18,
        M = 12,
        scale = Math.min(W, H) * 0.03;
      for (var j = 0; j < M; j++)
        for (var i = 0; i < N; i++) {
          var p = A[(j * N + i) % A.length],
            z =
              12 +
              45 *
                (0.5 + 0.5 * Math.sin(i * 0.5 + j * 0.7 + t * 0.15)) *
                p.energy,
            x = W * 0.5 + (i - j - 3) * scale,
            y = H * 0.3 + (i + j) * scale * 0.35,
            h = hue(p, K, t),
            r = scale * 0.75;
          polygon(
            c,
            [
              [x, y - z],
              [x + r, y - z + r * 0.4],
              [x, y - z + r * 0.8],
              [x - r, y - z + r * 0.4],
            ],
            h,
            e,
            0.7,
          );
          polygon(
            c,
            [
              [x - r, y - z + r * 0.4],
              [x, y - z + r * 0.8],
              [x, y + r * 0.8],
              [x - r, y + r * 0.4],
            ],
            h + 15,
            e,
            0.4,
          );
          polygon(
            c,
            [
              [x, y - z + r * 0.8],
              [x + r, y - z + r * 0.4],
              [x + r, y + r * 0.4],
              [x, y + r * 0.8],
            ],
            h - 15,
            e,
            0.55,
          );
        }
    },
  );
  room(
    24,
    "chromosome-archipelago",
    "Chromosome Archipelago",
    "surreal",
    "folded hereditary ribbons · island loops · luminous double helices",
    function (c, W, H, t, A, e, S, K) {
      for (var k = 0; k < 6; k++) {
        var p = A[k],
          h = hue(p, K, t);
        for (var j = 0; j < 100; j++) {
          var a = (j / 100) * TAU,
            b = ((j + 1) / 100) * TAU,
            rad = 0.55 + k * 0.1;
          function pt(a, v) {
            var x = (rad + v * Math.cos(a * 0.5 + t * 0.15)) * Math.cos(a),
              z = (rad + v * Math.cos(a * 0.5 + t * 0.15)) * Math.sin(a),
              y = v * Math.sin(a * 0.5 + t * 0.15) + (k - 2.5) * 0.16;
            return project(x, y, z, W, H);
          }
          polygon(
            c,
            [pt(a, -0.07), pt(b, -0.07), pt(b, 0.07), pt(a, 0.07)],
            h + j * 0.8,
            e,
            0.55,
          );
        }
      }
    },
  );
  room(
    25,
    "noctilucent-kelp",
    "Noctilucent Kelp",
    "organic",
    "flexible light blades · rising nutrient current · bioluminal tissue",
    function (c, W, H, t, A, e, S, K) {
      A.slice(0, 42).forEach(function (p, i) {
        var x = p.x * W,
          y = H * (0.9 + p.z * 0.1),
          len = H * (0.2 + p.g[1] * 0.65),
          h = hue(p, K, t),
          P = [];
        for (var j = 0; j < 40; j++) {
          var q = j / 39;
          P.push([
            x +
              Math.sin(q * 4 - t * 0.25 + p.a) * q * len * 0.12 +
              Math.sin(q * Math.PI) * len * 0.04,
            y - q * len,
          ]);
        }
        for (var j = 39; j >= 0; j--) {
          var q = j / 39;
          P.push([
            x +
              Math.sin(q * 4 - t * 0.25 + p.a) * q * len * 0.12 -
              Math.sin(q * Math.PI) * len * 0.04,
            y - q * len,
          ]);
        }
        polygon(c, P, h, e, 0.33);
      });
    },
  );
  room(
    26,
    "microbial-calligraphy",
    "Microbial Calligraphy",
    "painterly",
    "living ink paths · inherited curvature · paper memory",
    function (c, W, H, t, A, e, S, K) {
      c.drawImage(this.cv, 0, 0, W, H);
    },
    {
      paper: true,
      count: 60,
      init: function () {
        this.cv = document.createElement("canvas");
        this.cv.width = 640;
        this.cv.height = 400;
        this.cx = this.cv.getContext("2d");
        this.cx.fillStyle = "#edeade";
        this.cx.fillRect(0, 0, 640, 400);
      },
      step: function (S, e) {
        var c = this.cx;
        c.fillStyle = "rgba(237,234,222,.02)";
        c.fillRect(0, 0, 640, 400);
        this.L.agents.forEach(function (p) {
          line(
            c,
            p.trail.map(function (v) {
              return [v[0] * 640, v[1] * 400];
            }),
          );
          c.strokeStyle = ink(190 + p.g[0] * 45, 22, 0.42, e);
          c.lineWidth = 1 + p.g[2] * 3;
          c.stroke();
        });
      },
    },
  );
  room(
    27,
    "sporangia-of-memory",
    "Sporangia of Memory",
    "organic",
    "hanging spore heads · seed ancestry · auratic microscopy",
    function (c, W, H, t, A, e, S, K) {
      A.slice(0, 30).forEach(function (p) {
        var x = p.x * W,
          y = p.y * H,
          r = Math.min(W, H) * (0.015 + p.g[1] * 0.03),
          h = hue(p, K, t);
        for (var j = 0; j < 25; j++) {
          var a = j * 2.4,
            rr = r * Math.sqrt(j / 25),
            X = x + Math.cos(a) * rr,
            Y = y + Math.sin(a) * rr;
          line(c, [
            [x, y + r * 2],
            [X, Y],
          ]);
          c.strokeStyle = ink(h, 54, 0.25, e);
          c.lineWidth = 0.6;
          c.stroke();
          disc(c, X, Y, r * 0.1, h + j * 2, e, 0.6);
        }
        glow(c, x, y, r * 1.8, h, 0.12, e);
      });
    },
  );
  room(
    28,
    "prismatic-mantle",
    "Prismatic Mantle",
    "crystalline",
    "pliant honeycomb skin · phase-coupled crest · depth-ordered plates",
    function (c, W, H, t, A, e, S, K) {
      for (var j = 0; j < 18; j++)
        for (var i = 0; i < 26; i++) {
          var x = (i - 13) * 0.12 + (j % 2) * 0.06,
            y = (j - 9) * 0.105,
            z =
              0.3 * Math.sin(x * 2 + t * 0.15) +
              0.2 * Math.cos(y * 3 - t * 0.13),
            P = [];
          for (var k = 0; k < 6; k++) {
            var a = (k / 6) * TAU;
            P.push(
              project(
                x + Math.cos(a) * 0.065,
                y + Math.sin(a) * 0.065,
                z,
                W,
                H,
              ),
            );
          }
          var p = A[(i + j * 26) % A.length];
          polygon(c, P, hue(p, K, t) + z * 50, e, 0.65);
        }
    },
  );
  room(
    29,
    "cosmic-cell-gardens",
    "Cosmic Cell Gardens",
    "celestial",
    "nested orbital cell systems · slow precession · mutual illumination",
    function (c, W, H, t, A, e, S, K) {
      A.slice(0, 16).forEach(function (p, i) {
        var x = p.x * W,
          y = p.y * H,
          r = Math.min(W, H) * (0.03 + p.g[1] * 0.06),
          h = hue(p, K, t);
        glow(c, x, y, r * 1.7, h, 0.2, e);
        disc(c, x, y, r * 0.18, h, e);
        for (var j = 0; j < 4; j++) {
          var a = t * (0.08 + j * 0.015) + p.a + j * 1.6,
            R = r * (0.5 + j * 0.25);
          c.beginPath();
          c.ellipse(x, y, R, R * 0.55, p.a, 0, TAU);
          c.strokeStyle = ink(h + j * 7, 62, 0.3, e);
          c.lineWidth = 0.8;
          c.stroke();
          disc(
            c,
            x + Math.cos(a) * R,
            y + Math.sin(a) * R * 0.55,
            1.5 + j * 0.3,
            h + 25,
            e,
          );
        }
      });
    },
  );
  room(
    30,
    "cloud-reef",
    "Cloud Reef",
    "fluid",
    "luminous mist organisms · collective convection · soft radiance",
    function (c, W, H, t, A, e, S, K) {
      c.globalCompositeOperation = "screen";
      A.forEach(function (p) {
        var x = p.x * W,
          y = p.y * H,
          r = Math.min(W, H) * (0.035 + p.g[1] * 0.08),
          h = hue(p, K, t);
        glow(c, x, y, r, h, 0.12 + e.atmosphere * 0.12, e);
      });
      c.globalCompositeOperation = "source-over";
    },
  );
  room(
    31,
    "vernal-negative",
    "Vernal Negative",
    "minimal",
    "ink botanical memory · branching negative space · quiet seasonal growth",
    function (c, W, H, t, A, e, S, K) {
      A.slice(0, 20).forEach(function (p, i) {
        var x = p.x * W,
          y = H * 0.85,
          len = H * (0.2 + p.g[1] * 0.45),
          bend = Math.sin(t * 0.15 + p.a) * len * 0.15;
        c.beginPath();
        c.moveTo(x, y);
        c.quadraticCurveTo(x + bend, y - len * 0.6, x + bend * 0.7, y - len);
        c.strokeStyle = "rgba(25,46,48,.65)";
        c.lineWidth = 1.4;
        c.stroke();
        for (var j = 0; j < 7; j++) {
          var q = (j + 1) / 8,
            Y = y - len * q,
            X = x + bend * q,
            side = j % 2 ? 1 : -1;
          c.beginPath();
          c.ellipse(
            X + side * len * 0.025,
            Y,
            len * 0.045 * (1 - q * 0.5),
            len * 0.015,
            side * 0.5,
            0,
            TAU,
          );
          c.fillStyle = "rgba(35,59,54,.24)";
          c.fill();
        }
      });
    },
    { paper: true, count: 24 },
  );
  room(
    32,
    "ancestral-embers",
    "Ancestral Embers",
    "surreal",
    "nonlinear ancestral trajectories · persistent firelight · phase-space ecology",
    function (c, W, H, t, A, e, S, K) {
      c.drawImage(this.cv, 0, 0, W, H);
    },
    {
      count: 20,
      mechanism:
        "Bounded Lorenz trajectory integration and persistent pigment trails.",
      init: function () {
        var r = this.L.random;
        this.cv = document.createElement("canvas");
        this.cv.width = 640;
        this.cv.height = 400;
        this.cx = this.cv.getContext("2d");
        this.P = Array.from({ length: 420 }, function () {
          return { x: r() * 8 - 4, y: r() * 8 - 4, z: 20 + r() * 10, h: r() };
        });
      },
      step: function (S, e) {
        var c = this.cx,
          dt = Math.min(0.01, S.dt * 0.24 * (0.4 + e.growth)),
          t = this.clock;
        c.fillStyle = "rgba(5,8,14," + (0.018 + 0.04 * (1 - e.afterglow)) + ")";
        c.fillRect(0, 0, 640, 400);
        this.P.forEach(function (p) {
          var x = p.x,
            y = p.y,
            z = p.z;
          for (var j = 0; j < 3; j++) {
            var dx = 10 * (p.y - p.x),
              dy = p.x * (28 + Math.sin(t * 0.03) - p.z) - p.y,
              dz = p.x * p.y - (8 / 3) * p.z;
            p.x += dx * dt;
            p.y += dy * dt;
            p.z += dz * dt;
          }
          if (!Number.isFinite(p.x) || Math.abs(p.x) > 50) {
            p.x = 1;
            p.y = 1;
            p.z = 25;
          }
          line(c, [
            [320 + x * 8, 390 - z * 8],
            [320 + p.x * 8, 390 - p.z * 8],
          ]);
          c.strokeStyle = ink(20 + p.h * 55, 65, 0.24, e);
          c.lineWidth = 0.8;
          c.stroke();
        });
      },
    },
  );
  w.CabinetVIII.ecology = { create: create, advance: evolve, tune: tune };
})(window);
