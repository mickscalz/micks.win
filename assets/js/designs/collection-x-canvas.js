/* X's four living worlds: independent growth grammars, not recoloured walkers.
   No per-frame randomness while held. Runtime populations and memories are finite. */
(function (w) {
  "use strict";
  const X = w.EvolutionX,
    { clamp, palette: ink } = X;
  function room(i, id, name, family, tag, init, step, paint) {
    w.CabinetX.register(i, id, name, family, tag, "2d", {
      previewFrames: 120,
      populationStats() {
        return {
          population: (this.nodes || this.agents || this.branches || []).length,
          births: this.births,
          renewals: this.renewals,
          generation: this.generation,
        };
      },
      init() {
        this.clock = 0;
        this.r = X.random(10900 + i * 917);
        this.births = 0;
        this.renewals = 0;
        this.generation = 0;
        init.call(this);
        const e = X.tune({}),
          warm = i === 12 ? 24 : i === 13 ? 32 : i === 14 ? 12 : 28;
        for (let k = 0; k < warm * 30; k++) {
          this.clock += 1 / 30;
          step.call(this, 1 / 30, e);
        }
      },
      advance(S) {
        const e = X.tune(S);
        X.steps(S.dt, (dt) => {
          this.clock += dt;
          step.call(this, dt, e);
        });
        return e;
      },
      frame(S) {
        const e = this.advance(S),
          c = S.ctx;
        c.save();
        X.background(c, S.w, S.h, this.clock, e, i === 15);
        c.globalAlpha = 0.35 + e.intensity * 0.65;
        paint.call(this, c, S.w, S.h, e);
        c.restore();
      },
    });
  }
  function hills(c, W, H, t, e) {
    for (let layer = 0; layer < 4; layer++) {
      c.beginPath();
      c.moveTo(0, H);
      for (let j = 0; j <= 80; j++) {
        const x = j / 80;
        const y =
          0.55 +
          layer * 0.095 +
          Math.sin(x * 5.5 + layer * 2) * 0.035 +
          Math.sin(x * 15 + layer) * 0.012;
        c.lineTo(x * W, y * H);
      }
      c.lineTo(W, H);
      c.closePath();
      c.fillStyle = ink(225 + layer * 16, e, 10 + layer * 2, 0.7);
      c.fill();
    }
  }
  // 1. A forest of branching developmental trees. Branch tips continuously extend,
  // mature, bifurcate and fade; replacement trees appear before old ones disappear.
  function branch(x, y, a, len, g, hue, parent = 0) {
    return {
      x,
      y,
      a,
      len,
      g,
      hue,
      parent,
      age: 0,
      progress: 0,
      split: false,
      id: 0,
    };
  }
  room(
    12,
    "sapphire-spore-forest",
    "The Sapphire Spore Forest",
    "organic",
    "Vast branching canopy · luminous spores · successive forest generations",
    function () {
      this.nodes = [];
      this.serial = 0;
      for (let i = 0; i < 13; i++) {
        const p = branch(
          (i + 0.5) / 13,
          0.94,
          -Math.PI / 2,
          0.2 + this.r() * 0.12,
          0,
          155 + this.r() * 110,
        );
        p.id = ++this.serial;
        this.nodes.push(p);
      }
    },
    function (dt, e) {
      const add = [],
        cap = Math.round(90 + e.density * 110);
      for (const p of this.nodes) {
        p.age += dt * (0.5 + e.lifecycle * 0.6);
        p.progress = clamp(p.progress + dt * (0.075 + e.growth * 0.13));
        if (
          p.progress > 0.85 &&
          !p.split &&
          p.g < 4 &&
          this.nodes.length + add.length < cap
        ) {
          p.split = true;
          for (const sign of [-1, 1]) {
            const q = branch(
              p.x + Math.cos(p.a) * p.len,
              p.y + Math.sin(p.a) * p.len,
              p.a + sign * (0.27 + this.r() * 0.3),
              p.len * 0.69,
              p.g + 1,
              p.hue + (this.r() - 0.5) * e.mutation * 65,
              p.id,
            );
            q.id = ++this.serial;
            add.push(q);
            this.births++;
            this.generation = Math.max(this.generation, q.g);
          }
        }
      }
      this.nodes.push(...add);
      this.nodes = this.nodes.filter((p) => p.age < 65);
      if (this.nodes.length < cap && this.r() < dt * 0.6 * e.growth) {
        const p = branch(
          this.r(),
          0.96,
          -Math.PI / 2,
          0.18 + this.r() * 0.15,
          0,
          150 + this.r() * 130,
        );
        p.id = ++this.serial;
        this.nodes.push(p);
        this.renewals++;
      }
    },
    function (c, W, H, e) {
      hills(c, W, H, this.clock, e);
      for (const p of this.nodes) {
        const alpha = clamp(p.age / 2) * clamp((65 - p.age) / 9),
          sway = Math.sin(this.clock * 0.22 + p.x * 5) * 0.035 * e.drift,
          a = p.a + sway,
          len = p.len * p.progress,
          ex = (p.x + Math.cos(a) * len) * W,
          ey = (p.y + Math.sin(a) * len) * H;
        c.globalAlpha = alpha * (0.35 + e.intensity * 0.65);
        c.strokeStyle = ink(p.hue, e, 38 + p.g * 8);
        c.lineWidth = Math.max(0.6, (5 - p.g) * 1.2);
        c.beginPath();
        c.moveTo(p.x * W, p.y * H);
        c.quadraticCurveTo(
          p.x * W +
            (ex - p.x * W) * 0.25 +
            Math.sin(this.clock * 0.08 + p.id) * 5,
          p.y * H + (ey - p.y * H) * 0.55,
          ex,
          ey,
        );
        c.stroke();
        const phase = (this.clock * 0.075 + p.id * 0.618) % 1,
          glow = Math.pow(Math.sin(phase * Math.PI), 2);
        c.fillStyle = ink(p.hue + 35, e, 78, glow * 0.7);
        c.beginPath();
        c.arc(
          p.x * W + (ex - p.x * W) * phase,
          p.y * H + (ey - p.y * H) * phase,
          2.5 + p.g * 0.45,
          0,
          Math.PI * 2,
        );
        c.fill();
        if (p.g > 1) {
          const r = (4 + p.g * 2) * (0.2 + 0.8 * p.progress);
          const glow = c.createRadialGradient(ex, ey, 0, ex, ey, r * 3);
          glow.addColorStop(0, ink(p.hue + 35, e, 75, 0.5));
          glow.addColorStop(1, "transparent");
          c.fillStyle = glow;
          c.fillRect(ex - r * 3, ey - r * 3, r * 6, r * 6);
          c.strokeStyle = ink(p.hue + 25, e, 75, 0.7);
          c.beginPath();
          c.ellipse(ex, ey, r, r * 0.4, a, 0, Math.PI * 2);
          c.stroke();
        }
      }
      c.globalAlpha = 0.4;
      for (let i = 0; i < 65; i++) {
        const x = (i * 0.618 + Math.sin(this.clock * 0.023 + i) * 0.025) % 1,
          y = (i * 0.397 - this.clock * 0.006 + 1000) % 1;
        c.fillStyle = ink(160 + i * 3, e, 75, 0.5);
        c.beginPath();
        c.arc(x * W, y * H, 1 + (i % 3) * 0.5, 0, Math.PI * 2);
        c.fill();
      }
    },
  );
  // 2. A living distributary network. Flow tips fork, leave decaying nutrient memory
  // and reuse channels; the raster is a field, not a frame-rate-dependent bitmap trail.
  room(
    13,
    "living-delta-atlas",
    "The Living Delta Atlas",
    "landscape",
    "Branching luminous rivers · nutrient memory · divergent watersheds",
    function () {
      this.field = new Float32Array(128 * 80);
      this.agents = [];
      for (let i = 0; i < 15; i++)
        this.agents.push({
          x: this.r(),
          y: this.r(),
          a: this.r() * Math.PI * 2,
          age: 0,
          g: 0,
        });
    },
    function (dt, e) {
      const decay = Math.exp(-dt * (0.025 + 0.08 * (1 - e.afterglow)));
      for (let i = 0; i < this.field.length; i++) this.field[i] *= decay;
      const cap = Math.round(40 + e.density * 45),
        born = [];
      for (const p of this.agents) {
        p.age += dt;
        const target =
          Math.sin(p.y * 5 + this.clock * 0.025) * 1.6 +
          Math.cos(p.x * 6 - this.clock * 0.019);
        p.a +=
          Math.atan2(Math.sin(target - p.a), Math.cos(target - p.a)) *
          dt *
          (0.2 + e.coupling * 0.2);
        p.x += Math.cos(p.a) * dt * 0.025;
        p.y += Math.sin(p.a) * dt * 0.025;
        const xx = clamp(p.x) * 127,
          yy = clamp(p.y) * 79,
          ix = Math.floor(xx),
          iy = Math.floor(yy),
          fx = xx - ix,
          fy = yy - iy;
        for (let dy = 0; dy < 2; dy++)
          for (let dx = 0; dx < 2; dx++) {
            const at = Math.min(79, iy + dy) * 128 + Math.min(127, ix + dx);
            this.field[at] = Math.min(
              3,
              this.field[at] +
                dt * 0.8 * (dx ? fx : 1 - fx) * (dy ? fy : 1 - fy),
            );
          }
        if (
          p.age > 7 &&
          this.agents.length + born.length < cap &&
          this.r() < dt * 0.12 * e.growth
        ) {
          born.push({
            x: p.x,
            y: p.y,
            a: p.a + (this.r() - 0.5) * 1.8,
            age: 0,
            g: p.g + 1,
          });
          this.births++;
          this.generation = Math.max(this.generation, p.g + 1);
        }
        if (
          p.x < 0.01 ||
          p.x > 0.99 ||
          p.y < 0.01 ||
          p.y > 0.99 ||
          p.age > 90
        ) {
          p.x = this.r();
          p.y = this.r();
          p.age = 0;
          p.a = this.r() * Math.PI * 2;
          this.renewals++;
        }
      }
      this.agents.push(...born);
    },
    function (c, W, H, e) {
      if (!this.fieldCanvas) {
        this.fieldCanvas = w.document.createElement("canvas");
        this.fieldCanvas.width = 128;
        this.fieldCanvas.height = 80;
      }
      const field = this.fieldCanvas.getContext("2d");
      field.clearRect(0, 0, 128, 80);
      for (let y = 0; y < 80; y++)
        for (let x = 0; x < 128; x++) {
          const v = this.field[y * 128 + x];
          if (v < 0.015) continue;
          const light = 20 + Math.min(1, v) * 40;
          field.fillStyle = ink(
            160 + v * 45 + X.channel(this.clock, 31) * 80,
            e,
            light,
            Math.min(0.85, v * 0.55),
          );
          field.fillRect(x, y, 1, 1);
        }
      c.imageSmoothingEnabled = true;
      c.drawImage(this.fieldCanvas, 0, 0, W, H);
      for (const p of this.agents) {
        const alpha = clamp(p.age / 3) * clamp((90 - p.age) / 8);
        c.strokeStyle = ink(190 + p.g * 22, e, 72, alpha * 0.6);
        c.lineWidth = 1.1;
        c.beginPath();
        c.ellipse(
          p.x * W,
          p.y * H,
          4 + 2 * Math.sin(this.clock * 0.1),
          2,
          p.a,
          0,
          Math.PI * 2,
        );
        c.stroke();
      }
      c.globalAlpha = 0.16;
      c.strokeStyle = ink(40, e, 75);
      for (let i = 0; i < 14; i++) {
        c.beginPath();
        for (let j = 0; j <= 100; j++) {
          const x = j / 100,
            y = i / 13 + 0.014 * Math.sin(x * 18 + i + this.clock * 0.005);
          c.lineTo(x * W, y * H);
        }
        c.stroke();
      }
    },
  );
  // 3. A migrating ribbon flock with local cohesion, alignment, continuous banking,
  // age envelopes and bounded asexual replacement with inherited hue/wing traits.
  room(
    14,
    "aurora-migration-council",
    "Aurora Migration Council",
    "surreal",
    "Ribbon-wing migration · coherent flocking · inherited luminous anatomy",
    function () {
      this.agents = [];
      for (let i = 0; i < 90; i++)
        this.agents.push({
          x: this.r(),
          y: this.r(),
          vx: 0,
          vy: 0,
          a: this.r() * 6.28,
          age: this.r() * 55,
          life: 65 + this.r() * 30,
          hue: 140 + this.r() * 180,
          wing: 0.7 + this.r() * 0.5,
          g: 0,
        });
    },
    function (dt, e) {
      const A = this.agents;
      for (const p of A) {
        let ax = 0,
          ay = 0,
          n = 0;
        for (const q of A) {
          if (p === q) continue;
          const dx = q.x - p.x,
            dy = q.y - p.y,
            d = dx * dx + dy * dy;
          if (d < 0.025) {
            ax += dx * 0.3 + q.vx * 0.5;
            ay += dy * 0.3 + q.vy * 0.5;
            n++;
            if (d < 0.001) {
              ax -= dx * 0.9;
              ay -= dy * 0.9;
            }
          }
        }
        const curl = Math.sin(p.y * 5 + this.clock * 0.06);
        ax =
          (n ? ax / n : 0) * e.coupling +
          Math.cos(curl) * 0.012 +
          (0.5 - p.x) * 0.02;
        ay =
          (n ? ay / n : 0) * e.coupling +
          Math.sin(p.x * 6 - this.clock * 0.05) * 0.014 +
          (0.5 - p.y) * 0.02;
        p.vx = p.vx * Math.exp(-dt * 0.8) + ax * dt;
        p.vy = p.vy * Math.exp(-dt * 0.8) + ay * dt;
        p.x = clamp(p.x + p.vx * dt, 0.015, 0.985);
        p.y = clamp(p.y + p.vy * dt, 0.015, 0.985);
        const target = Math.atan2(p.vy, p.vx);
        p.a +=
          Math.atan2(Math.sin(target - p.a), Math.cos(target - p.a)) *
          (1 - Math.exp(-dt * 3));
        p.age += dt * (0.45 + e.lifecycle);
        if (p.age > p.life) {
          p.age = 0;
          p.hue += (this.r() - 0.5) * e.mutation * 55;
          p.wing = clamp(
            p.wing + (this.r() - 0.5) * e.mutation * 0.2,
            0.5,
            1.5,
          );
          p.life = 65 + (this.r() * 30) / (0.6 + e.growth);
          p.g++;
          this.births++;
          this.renewals++;
          this.generation = Math.max(this.generation, p.g);
        }
      }
    },
    function (c, W, H, e) {
      const t = this.clock;
      for (let j = 0; j < 7; j++) {
        c.strokeStyle = ink(160 + j * 25, e, 55, 0.12);
        c.lineWidth = H * 0.015;
        c.beginPath();
        for (let i = 0; i <= 100; i++) {
          const x = i / 100,
            y = 0.3 + j * 0.04 + 0.08 * Math.sin(x * 4 + j * 0.4 + t * 0.025);
          c.lineTo(x * W, y * H);
        }
        c.stroke();
      }
      for (const p of this.agents) {
        const fade = clamp(p.age / 5) * clamp((p.life - p.age) / 7),
          r = Math.min(W, H) * 0.012 * p.wing;
        c.save();
        c.globalAlpha = fade * (0.4 + e.intensity * 0.6);
        c.translate(p.x * W, p.y * H);
        c.rotate(p.a);
        c.strokeStyle = ink(p.hue, e, 72, 0.8);
        c.fillStyle = ink(p.hue + 35, e, 55, 0.2);
        c.lineWidth = 1;
        for (const side of [-1, 1]) {
          c.beginPath();
          c.moveTo(r, 0);
          c.bezierCurveTo(
            0,
            side * r * (1.5 + 0.5 * Math.sin(t * 0.7 + p.wing)),
            -r * 3,
            side * r * 1.8,
            -r * 4,
            side * r * 0.15,
          );
          c.quadraticCurveTo(-r * 0.7, side * r * 0.3, r, 0);
          c.fill();
          c.stroke();
        }
        c.restore();
      }
    },
  );
  // 4. A reef city grows from many separate colonies. Branches retain their ancestry
  // while the whole reef slowly renews; no full-screen simulation resets.
  room(
    15,
    "coral-tectonic-gardens",
    "Coral Tectonic Gardens",
    "organic",
    "Branching reef cities · reproductive polyps · continuous colony succession",
    function () {
      this.branches = [];
      for (let i = 0; i < 24; i++)
        this.branches.push({
          x: (i + 0.5) / 24,
          y: 0.9 + this.r() * 0.08,
          a: -Math.PI / 2 + (this.r() - 0.5) * 0.4,
          len: 0.07 + this.r() * 0.07,
          age: this.r() * 3,
          g: 0,
          hue: 270 + this.r() * 110,
          budded: false,
        });
    },
    function (dt, e) {
      const add = [],
        cap = Math.round(100 + e.density * 100);
      for (const p of this.branches) {
        p.age += dt * (0.4 + e.lifecycle);
        if (
          p.age > 5 &&
          !p.budded &&
          p.g < 5 &&
          this.branches.length + add.length < cap
        ) {
          p.budded = true;
          for (let j = 0; j < 2; j++) {
            add.push({
              x: p.x + Math.cos(p.a) * p.len,
              y: p.y + Math.sin(p.a) * p.len,
              a: p.a + (j ? 1 : -1) * (0.25 + this.r() * 0.4),
              len: p.len * 0.8,
              age: 0,
              g: p.g + 1,
              hue: p.hue + (this.r() - 0.5) * e.mutation * 45,
              budded: false,
            });
            this.births++;
            this.generation = Math.max(this.generation, p.g + 1);
          }
        }
      }
      this.branches.push(...add);
      const old = this.branches.length;
      this.branches = this.branches.filter((p) => p.age < 75);
      this.renewals += old - this.branches.length;
      if (this.branches.length < cap && this.r() < dt * e.growth * 1.3)
        this.branches.push({
          x: this.r(),
          y: 0.92,
          a: -Math.PI / 2,
          len: 0.07 + this.r() * 0.07,
          age: 0,
          g: 0,
          hue: 270 + this.r() * 150,
          budded: false,
        });
    },
    function (c, W, H, e) {
      const t = this.clock;
      for (let j = 0; j < 9; j++) {
        const x =
          ((j + 0.5) / 9) * W + Math.sin(t * 0.12 + j * 0.61) * W * 0.025;
        c.fillStyle = ink(170 + j * 4, e, 70, 0.06);
        c.beginPath();
        c.moveTo(x - 5, 0);
        c.lineTo(x + H * 0.13, H);
        c.lineTo(x - H * 0.16, H);
        c.closePath();
        c.fill();
      }
      for (const p of this.branches) {
        const progress = clamp(p.age / 5),
          fade = clamp(p.age) * clamp((75 - p.age) / 12);
        c.globalAlpha = fade * (0.35 + e.intensity * 0.65);
        const a = p.a + Math.sin(t * 0.16 + p.x * 5) * 0.025 * e.drift,
          x = p.x * W,
          y = p.y * H,
          ex = x + Math.cos(a) * p.len * W * progress,
          ey = y + Math.sin(a) * p.len * H * progress;
        c.strokeStyle = ink(p.hue, e, 44 + p.g * 5);
        c.lineWidth = Math.max(1.2, 6 - p.g * 0.9);
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(x, y);
        c.quadraticCurveTo(
          x + (ex - x) * 0.3 + Math.sin(t * 0.04 + p.y) * 2,
          y + (ey - y) * 0.6,
          ex,
          ey,
        );
        c.stroke();
        c.fillStyle = ink(p.hue + 45, e, 75, 0.8);
        c.beginPath();
        c.arc(ex, ey, 1.5 + p.g * 0.35, 0, Math.PI * 2);
        c.fill();
      }
      c.globalAlpha = 0.25;
      for (let i = 0; i < 80; i++) {
        const x = (i * 0.618 + Math.sin(t * 0.018 + i) * 0.014) % 1,
          y = (i * 0.347 - t * 0.003 + 1000) % 1;
        c.fillStyle = ink(165, e, 75, 0.4);
        c.beginPath();
        c.arc(x * W, y * H, 1.3, 0, Math.PI * 2);
        c.fill();
      }
    },
  );
})(window);
