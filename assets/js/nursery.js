/* Versioned numeric recipes, never executable imports. No storage without opt-in. */
(function (root) {
  "use strict";
  const WK =
    typeof module !== "undefined"
      ? require("./designs/world-kernels.js")
      : root.WorldKernels;
  const KEYS = [
    "growth",
    "mutation",
    "coupling",
    "lifecycle",
    "atmosphere",
    "symmetry",
    "drift",
    "afterglow",
  ];
  const SHAPES = ["bloom", "shell", "ribbon", "branch"];
  const FORMS = [
    ...SHAPES,
    "vault",
    "sponge",
    "membrane",
    "lattice",
    "orbit",
    "terrain",
    "coral",
    "vortex",
  ];
  const MODULES = {
    topology: ["colony", "orbit", "lattice", "flow"],
    material: ["silk", "glass", "ink", "mineral"],
    rhythm: ["tide", "pulse", "growth", "orbit"],
  };
  const traits = (v) => [
    "shape",
    "hue",
    "lobes",
    "force",
    ...KEYS,
    ...(v >= 2 ? ["topology", "material", "rhythm", "depth", "relief"] : []),
    ...(v === 3 ? [...Object.keys(WK.MODULES), "scale"] : []),
  ];
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  function hash(s) {
    let n = 2166136261;
    for (const c of s) {
      n ^= c.charCodeAt(0);
      n = Math.imul(n, 16777619);
    }
    return n >>> 0;
  }
  function random(seed) {
    let n = seed || 1;
    return () => {
      n ^= n << 13;
      n ^= n >>> 17;
      n ^= n << 5;
      return (n >>> 0) / 4294967296;
    };
  }
  function finite(n, a, b) {
    if (typeof n !== "number" || !Number.isFinite(n) || n < a || n > b)
      throw Error("Invalid numeric gene");
    return n;
  }
  const parentID = (s) =>
    typeof s === "string" &&
    /^(?:child-[a-f0-9]{16}|(?:source|founder|world):[a-z0-9-]{1,70})$/.test(s);
  function identity(r) {
    const s = JSON.stringify([
      r.version,
      r.seed,
      r.parents,
      r.generation,
      r.genome,
    ]);
    return (
      "child-" +
      hash(s).toString(16).padStart(8, "0") +
      hash("recipe:" + s)
        .toString(16)
        .padStart(8, "0")
    );
  }
  function validate(r) {
    if (
      !r ||
      ![1, 2, 3].includes(r.version) ||
      r.solver !==
        (r.version === 3
          ? "world-v3"
          : r.version === 2
            ? "habitat-v2"
            : "eco-v1") ||
      !Array.isArray(r.parents) ||
      r.parents.length > (r.version >= 2 ? 32 : 4) ||
      !r.parents.every(parentID)
    )
      throw Error("Unsupported recipe or parent");
    if (
      !r.parents.length &&
      (!(r.version === 3
        ? r.id?.startsWith("world:")
        : r.version === 2
          ? r.id?.startsWith("source:")
          : r.id?.startsWith("founder:")) ||
        r.generation !== 0)
    )
      throw Error("Invalid founding recipe");
    if (
      r.parents.length === 1 ||
      new Set(r.parents).size !== r.parents.length ||
      (r.parents.length && r.generation < 1)
    )
      throw Error("Invalid parent set");
    if (
      r.parents.length &&
      (!Array.isArray(r.provenance) ||
        r.provenance.length !== traits(r.version).length ||
        new Set(r.provenance.map((p) => p?.trait)).size !==
          traits(r.version).length)
    )
      throw Error("Missing trait provenance");
    const g = r.genome;
    if (!g || !(r.version >= 2 ? FORMS : SHAPES).includes(g.shape))
      throw Error("Unsupported geometry grammar");
    const genome = {
      shape: g.shape,
      hue: finite(g.hue, 0, 360),
      lobes: finite(g.lobes, 3, 12),
      force: finite(g.force, 0, 7),
    };
    if (!Number.isInteger(g.lobes) || !Number.isInteger(g.force))
      throw Error("Discrete genes must be integers");
    KEYS.forEach((k) => (genome[k] = finite(g[k], 0, 1)));
    if (r.version >= 2) {
      for (const [k, allowed] of Object.entries(MODULES)) {
        if (!allowed.includes(g[k])) throw Error("Unsupported habitat module");
        genome[k] = g[k];
      }
      for (const k of ["depth", "relief"]) genome[k] = finite(g[k], 0, 1);
    }
    if (r.version === 3) {
      for (const [k, allowed] of Object.entries(WK.MODULES)) {
        if (!allowed.includes(g[k])) throw Error("Unsupported world module");
        genome[k] = g[k];
      }
      genome.scale = finite(g.scale, 0, 1);
    }
    const out = {
      version: r.version,
      solver: r.solver,
      seed: finite(r.seed, 1, 4294967295),
      parents: r.parents.slice(),
      generation: finite(r.generation, 0, 10000),
      genome,
    };
    if (!Number.isInteger(out.seed) || !Number.isInteger(out.generation))
      throw Error("Invalid seed or generation");
    out.id = r.parents.length ? identity(out) : r.id;
    if (!parentID(out.id) || r.id !== out.id)
      throw Error("Recipe identity does not match its genes");
    out.name =
      typeof r.name === "string" ? r.name.slice(0, 70) : "Unnamed organism";
    out.provenance = [];
    if (Array.isArray(r.provenance))
      for (const p of r.provenance.slice(0, traits(r.version).length)) {
        if (
          !p ||
          !traits(r.version).includes(p.trait) ||
          !Array.isArray(p.weights) ||
          p.weights.length !== out.parents.length
        )
          throw Error("Invalid provenance");
        const weights = p.weights.map((x) => finite(x, 0, 1));
        if (Math.abs(weights.reduce((a, b) => a + b, 0) - 1) > 0.001)
          throw Error("Invalid inheritance weights");
        out.provenance.push({
          trait: p.trait,
          weights,
          mutation: finite(p.mutation, -1, 1),
          clamped: p.clamped === true,
        });
      }
    return out;
  }
  function founder(d) {
    if (
      d.edition !== 8 ||
      d.kind !== "2d" ||
      !d.lifeMechanism.startsWith("Nutrient")
    )
      throw Error("Choose compatible Collection VIII agent worlds");
    // The adapter keeps the source ecology's seed/force family and an explicit
    // silhouette approximation; it does not pretend to reproduce its painter.
    const K =
      Number.isInteger(d.collectionRank) && d.collectionRank % 2 === 0
        ? d.collectionRank / 2
        : 1 + (hash(d.id) % 32);
    const seed = 800 + K,
      r = random(hash(d.id) || 1);
    const shapes = [
      "bloom",
      "shell",
      "ribbon",
      "shell",
      "ribbon",
      "branch",
      "branch",
      "shell",
      "branch",
      "bloom",
      "shell",
      "ribbon",
      "ribbon",
      "ribbon",
      "branch",
      "ribbon",
      "shell",
      "shell",
      "ribbon",
      "shell",
      "shell",
      "bloom",
      "branch",
      "shell",
      "ribbon",
      "ribbon",
      "bloom",
      "shell",
      "shell",
      "bloom",
      "branch",
      "ribbon",
    ];
    const palettes = [
        [178, 42],
        [280, 170],
        [28, 200],
        [210, 330],
        [155, 275],
        [42, 225],
        [325, 170],
        [190, 28],
      ],
      palette = palettes[K % 8];
    const g = {
      shape: shapes[(K - 1) % 32],
      hue: (palette[0] + palette[1]) / 2,
      lobes: 3 + Math.floor(r() * 10),
      force: (K - 1) % 8,
    };
    const base = {
      growth: 0.65,
      mutation: 0.5,
      coupling: 0.6,
      lifecycle: 0.55,
      atmosphere: 0.65,
      symmetry: 0.5,
      drift: 0.45,
      afterglow: 0.55,
    };
    KEYS.forEach((k) => (g[k] = clamp(base[k] + (r() - 0.5) * 0.25)));
    return validate({
      version: 1,
      solver: "eco-v1",
      id: "founder:" + d.id,
      seed,
      parents: [],
      generation: 0,
      genome: g,
      name: d.name,
    });
  }
  function upgrade(g) {
    return {
      ...g,
      topology: g.topology || "colony",
      material: g.material || "silk",
      rhythm: g.rhythm || "growth",
      depth: g.depth ?? 0.45,
      relief: g.relief ?? 0.5,
    };
  }
  function founderAny(d) {
    if (
      !d ||
      !["gl", "glx", "2d"].includes(d.kind) ||
      !/^[a-z0-9-]{1,70}$/.test(d.id)
    )
      throw Error("Invalid catalogue source");
    const r = random(hash(d.id) || 1),
      text = (d.name + " " + d.tag + " " + (d.family || "")).toLowerCase();
    let shape = /fractal|menger|recursive|mandel|sponge/.test(text)
      ? "sponge"
      : /cathedral|arch|vault|temple|palace/.test(text)
        ? "vault"
        : /lattice|crystal|tessera|tesseract|grid/.test(text)
          ? "lattice"
          : /ocean|sea|wave|fluid|membrane|silk|drape/.test(text)
            ? "membrane"
            : /orbit|planet|celestial|star|galax|solar/.test(text)
              ? "orbit"
              : /mountain|terrain|dune|landscape/.test(text)
                ? "terrain"
                : /vortex|spiral|swirl|aurora/.test(text)
                  ? "vortex"
                  : /coral|branch|root|tree|mycel|rhizo/.test(text)
                    ? "coral"
                    : /flower|orchid|petal|bloom|pollen/.test(text)
                      ? "bloom"
                      : FORMS[Math.floor(r() * FORMS.length)];
    const g = {
      shape,
      hue: r() * 360,
      lobes: 3 + Math.floor(r() * 10),
      force: Math.floor(r() * 8),
    };
    for (const k of KEYS) g[k] = 0.25 + r() * 0.5;
    g.topology = /orbit|solar|planet/.test(text)
      ? "orbit"
      : /lattice|grid|crystal/.test(text)
        ? "lattice"
        : /fluid|flow|sea|river/.test(text)
          ? "flow"
          : "colony";
    g.material = /glass|ice|crystal|lens/.test(text)
      ? "glass"
      : /ink|paper|negative/.test(text)
        ? "ink"
        : /stone|mineral|rock|geode/.test(text)
          ? "mineral"
          : "silk";
    g.rhythm = /pulse|heart|beat/.test(text)
      ? "pulse"
      : /sea|ocean|tide/.test(text)
        ? "tide"
        : /orbit|solar/.test(text)
          ? "orbit"
          : "growth";
    g.depth = d.kind === "2d" ? 0.3 + r() * 0.3 : 0.6 + r() * 0.3;
    g.relief = 0.25 + r() * 0.5;
    return validate({
      id: "source:" + d.id,
      version: 2,
      solver: "habitat-v2",
      seed: hash("habitat:" + d.id) || 1,
      parents: [],
      generation: 0,
      genome: g,
      name: d.name,
    });
  }
  // Old catalogue worlds remain labelled adapters. IX reuses its exact fields.
  function upgradeWorld(input, text = "") {
    const g = upgrade(input);
    const named = [
      /ocean|sea|tidal|wave|coral/i,
      /aurora|mountain|snow|glacier/i,
      /dune|desert|sand/i,
      /forest|garden|orchid|branch|tree|mycel/i,
      /temple|arch|cathedral|vault/i,
      /orbit|star|galaxy|cosmic/i,
      /canyon|river|valley|lava/i,
      /crystal|hex|salt|lattice/i,
    ].findIndex((re) => re.test(text));
    const index =
      named >= 0
        ? named
        : ({
            vault: 0,
            terrain: 1,
            ribbon: 2,
            branch: 3,
            coral: 3,
            lattice: 4,
            orbit: 5,
            vortex: 6,
            sponge: 7,
          }[g.shape] ?? 3);
    return { ...WK.defaults(index), ...g };
  }
  function worldFounder(d) {
    const prior = founderAny(d);
    return validate({
      id: "world:" + d.id,
      version: 3,
      solver: "world-v3",
      seed: hash("world:" + d.id) || 1,
      parents: [],
      generation: 0,
      name: d.name,
      genome: Number.isInteger(d.worldKernel)
        ? WK.defaults(d.worldKernel)
        : upgradeWorld(prior.genome, d.name + " " + d.tag + " " + d.family),
    });
  }
  function breed(
    parents,
    { seed = 1, mood = "balanced", weights, scope } = {},
  ) {
    if (scope !== undefined && !["world", "habitat"].includes(scope))
      throw Error("Unsupported breeding scope");
    if (!["balanced", "calm", "wild"].includes(mood))
      throw Error("Unsupported temperament");
    parents = parents.map(validate);
    if (
      parents.length < 2 ||
      parents.length > 32 ||
      new Set(parents.map((p) => p.id)).size !== parents.length
    )
      throw Error("Choose 2–32 different module-compatible parents");
    seed = finite(seed, 1, 4294967295);
    if (!Number.isInteger(seed)) throw Error("Invalid seed");
    const version =
      scope === "world" || parents.some((p) => p.version === 3)
        ? 3
        : parents.length > 4 || parents.some((p) => p.version === 2)
          ? 2
          : 1;
    const genomes = parents.map((p) =>
      version === 3 ? upgradeWorld(p.genome, p.name) : upgrade(p.genome),
    );
    const r = random(seed),
      W = weights || parents.map(() => 1 / parents.length);
    if (W.length !== parents.length) throw Error("Invalid weights");
    let sum = 0;
    W.forEach((x) => (sum += finite(x, 0, 1)));
    if (sum <= 0) throw Error("At least one parent needs weight");
    const w = W.map((x) => x / sum);
    const choose = () => {
      let q = r();
      for (let i = 0; i < w.length; i++) {
        q -= w[i];
        if (q <= 0) return i;
      }
      return w.length - 1;
    };
    const g = {},
      provenance = [],
      variation = mood === "wild" ? 0.22 : mood === "calm" ? 0.035 : 0.09;
    for (const k of traits(version)) {
      if (
        [
          "shape",
          "lobes",
          "force",
          "hue",
          ...Object.keys(MODULES),
          ...Object.keys(WK.MODULES),
        ].includes(k)
      ) {
        const i = choose();
        g[k] = genomes[i][k];
        provenance.push({
          trait: k,
          weights: w.map((_, j) => (j === i ? 1 : 0)),
          mutation: 0,
          clamped: false,
        });
      } else {
        const mutation = (r() - 0.5) * variation,
          base = parents.reduce((s, p, i) => s + genomes[i][k] * w[i], 0),
          value = base + mutation;
        g[k] = clamp(value);
        provenance.push({
          trait: k,
          weights: w.slice(),
          mutation,
          clamped: g[k] !== value,
        });
      }
    }
    // Temper developmental speed and drift without erasing inherited geometry.
    if (mood === "calm")
      for (const k of ["lifecycle", "drift"]) {
        const before = g[k];
        g[k] = Math.min(0.4, g[k]);
        const p = provenance.find((x) => x.trait === k);
        p.mutation += g[k] - before;
        p.clamped = p.clamped || g[k] !== before;
      }
    const child = {
      version,
      solver:
        version === 3 ? "world-v3" : version === 2 ? "habitat-v2" : "eco-v1",
      seed,
      parents: parents.map((p) => p.id),
      generation: 1 + Math.max(...parents.map((p) => p.generation)),
      genome: g,
      provenance,
      name: "Unnamed " + mood + " offspring",
    };
    child.id = identity(child);
    return validate(child);
  }
  function twin(recipe, seed) {
    const c = validate(recipe);
    c.seed = finite(seed, 1, 4294967295);
    c.id = identity(c);
    c.name = "Twin of " + c.name;
    return validate(c);
  }
  function importRecipes(text) {
    if (
      typeof text !== "string" ||
      new TextEncoder().encode(text).byteLength > 2097152
    )
      throw Error("Import limit: 2 MiB");
    const obj = JSON.parse(text);
    if (
      !obj ||
      typeof obj !== "object" ||
      obj.version !== 1 ||
      !Array.isArray(obj.recipes) ||
      obj.recipes.length > 512
    )
      throw Error(
        "Import limit: 512 versioned records including source ancestry",
      );
    const items = obj.recipes.map(validate);
    validateAncestry(items);
    return items;
  }
  function validateAncestry(input) {
    if (!Array.isArray(input) || input.length > 512)
      throw Error("Ancestry budget exceeded");
    const items = input.map(validate),
      map = new Map();
    for (const p of items) {
      if (map.has(p.id)) throw Error("Duplicate recipe ID");
      map.set(p.id, p);
    }
    const seen = new Set(),
      active = new Set();
    function visit(p) {
      if (active.has(p.id)) throw Error("Ancestry cycle");
      if (seen.has(p.id)) return;
      active.add(p.id);
      for (const id of p.parents)
        if (map.has(id)) {
          const parent = map.get(id);
          if (parent.generation >= p.generation)
            throw Error("Invalid ancestry generation");
          visit(parent);
        }
      active.delete(p.id);
      seen.add(p.id);
    }
    items.forEach(visit);
    return items;
  }

  function renderer(input) {
    const recipe = validate(input);
    if (recipe.version === 3) {
      if (!root.WorldRenderer) throw Error("World renderer unavailable");
      return root.WorldRenderer.create(recipe);
    }
    if (recipe.version === 2) {
      if (!root.HabitatRenderer)
        throw Error("GPU habitat renderer unavailable");
      return root.HabitatRenderer.create(recipe);
    }
    const g = recipe.genome;
    return {
      id: recipe.id,
      name: recipe.name,
      kind: "2d",
      nursery: true,
      edition: 8,
      rank: 0,
      collectionRank: 0,
      captivation: 0,
      tag:
        "nursery offspring · " + g.shape + " · generation " + recipe.generation,
      blurb:
        "A reproducible eco-v1 phenotype. Recipe genes govern geometry, forces, development and material; this is not a pixel blend. Save this offspring through the nursery panel. Returning restarts from its seed, not a runtime checkpoint.",
      theme: "dark",
      family: "organic",
      lifeMechanism: "Nutrient ecology · offspring " + recipe.id,
      init() {
        this.L = root.CabinetVIII.ecology.create(recipe.seed, 65, g.force);
        this.clock = 0;
      },
      advance(S) {
        const e = root.CabinetVIII.ecology.tune(S);
        for (const k of KEYS) e[k] = clamp(g[k] * 0.65 + (e[k] ?? 0.5) * 0.35);
        if (S.dt > 0) {
          this.clock += S.dt;
          root.CabinetVIII.ecology.advance(this.L, S.dt, e);
        }
        return e;
      },
      frame(S) {
        const e = this.advance(S);
        const c = S.ctx,
          W = S.w,
          H = S.h,
          t = this.clock;
        c.fillStyle = "#030a14";
        c.fillRect(0, 0, W, H);
        c.save();
        c.globalCompositeOperation = "screen";
        const fog = c.createRadialGradient(
          W * 0.5,
          H * 0.52,
          0,
          W * 0.5,
          H * 0.52,
          Math.max(W, H) * 0.65,
        );
        fog.addColorStop(
          0,
          `hsla(${g.hue},65%,24%,${0.12 + e.atmosphere * 0.2})`,
        );
        fog.addColorStop(1, "transparent");
        c.fillStyle = fog;
        c.fillRect(0, 0, W, H);
        const A = this.L.agents;
        for (let i = 0; i < A.length; i++) {
          const p = A[i],
            x = (i === 0 ? 0.5 + (p.x - 0.5) * 0.12 : p.x) * W,
            y = (i === 0 ? 0.5 + (p.y - 0.5) * 0.12 : p.y) * H,
            age = Math.min(1, ((p.displayAge ?? p.age) + 1) / 8),
            rawSize =
              Math.min(W, H) *
              (0.012 + p.g[1] * 0.018) *
              (0.5 + age * 0.5) *
              (0.7 + Math.min(1.4, p.displayEnergy ?? p.energy) * 0.3) *
              (i === 0 ? 16 : 0.6 + p.z * 0.7),
            size = i === 0 ? Math.min(rawSize, Math.min(W, H) * 0.24) : rawSize,
            h = e.colorSafe
              ? i % 2
                ? 43
                : 207
              : (g.hue + (p.g[0] - 0.5) * 65 + t * 0.15 + 360) % 360;
          c.save();
          c.translate(x, y);
          c.scale(1, 0.55 + e.symmetry * 0.45);
          c.rotate(p.a + Math.sin(t * 0.15 + p.z) * e.drift * 0.6);
          c.strokeStyle = `hsla(${h},75%,74%,.72)`;
          c.fillStyle = `hsla(${h},68%,52%,.2)`;
          c.lineWidth = i === 0 ? 2 : 1.2;
          if (i === 0) {
            c.shadowBlur = 10;
            c.shadowColor = `hsla(${h},80%,65%,.5)`;
          }
          if (i === 0) {
            const aura = c.createRadialGradient(0, 0, 0, 0, 0, size * 2.5);
            aura.addColorStop(0, `hsla(${h},80%,65%,.2)`);
            aura.addColorStop(1, "transparent");
            c.fillStyle = aura;
            c.fillRect(-size * 2.5, -size * 2.5, size * 5, size * 5);
            c.fillStyle = `hsla(${h},68%,52%,.2)`;
          }
          c.beginPath();
          if (g.shape === "bloom") {
            for (let j = 0; j <= g.lobes * 12; j++) {
              const a = (j / (g.lobes * 12)) * Math.PI * 2,
                r =
                  size *
                  (0.7 + 0.3 * Math.cos(a * g.lobes)) *
                  (1 + 0.06 * Math.sin(t * 0.8 + p.z));
              c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            c.closePath();
            c.fill();
            c.stroke();
          } else if (g.shape === "shell") {
            for (let j = 0; j < 90; j++) {
              const a = j * 0.15,
                r = (size * j) / 90;
              c.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.7);
            }
            c.stroke();
          } else if (g.shape === "ribbon") {
            if (i === 0)
              for (let k = 0; k < 9; k++) {
                c.beginPath();
                for (let j = 0; j <= 90; j++) {
                  const x = (j / 45 - 1) * size * 1.7,
                    y =
                      Math.sin((x / size) * 2 + t * 0.25 + k * 0.1) *
                        size *
                        0.4 +
                      (k - 4) * size * 0.07;
                  c.lineTo(x, y);
                }
                c.strokeStyle = `hsla(${e.colorSafe ? h : h + k * 5},75%,70%,.5)`;
                c.stroke();
              }

            c.moveTo(-size * 1.8, 0);
            c.bezierCurveTo(
              -size,
              -size * Math.sin(t * 0.4 + p.z),
              size,
              size,
              size * 1.8,
              0,
            );
            c.stroke();
          } else {
            if (i === 0) {
              const branch = (x, y, len, a, depth) => {
                const X = x + Math.cos(a) * len,
                  Y = y + Math.sin(a) * len;
                c.beginPath();
                c.moveTo(x, y);
                c.quadraticCurveTo(
                  x + Math.cos(a + 0.2) * len * 0.5,
                  y + Math.sin(a + 0.2) * len * 0.5,
                  X,
                  Y,
                );
                c.stroke();
                if (depth > 0) {
                  const spread = 0.28 + e.symmetry * 0.28;
                  branch(X, Y, len * 0.64, a - spread, depth - 1);
                  branch(X, Y, len * 0.64, a + spread, depth - 1);
                }
              };
              for (let k = 0; k < Math.min(7, g.lobes); k++)
                branch(
                  0,
                  size * 0.5,
                  size * 0.55,
                  -Math.PI / 2 +
                    (k - (Math.min(7, g.lobes) - 1) / 2) * 0.3 +
                    Math.sin(t * 0.2) * 0.06,
                  2,
                );
            }
            c.beginPath();
            c.moveTo(0, size);
            c.lineTo(0, -size);
            for (let j = 0; j < 5; j++) {
              const Y = size - j * size * 0.4;
              c.moveTo(0, Y);
              c.lineTo((j % 2 ? 1 : -1) * size * 0.65, Y - size * 0.65);
            }
            c.stroke();
          }
          c.beginPath();
          c.arc(0, 0, Math.max(1, size * 0.13), 0, Math.PI * 2);
          c.fillStyle = `hsla(${h},75%,80%,.7)`;
          c.fill();
          c.restore();
        }
        // Actual nutrient memory connects the population to its habitat.
        c.globalAlpha = 0.015 + e.afterglow * 0.045;
        for (let j = 0; j < this.L.field.length; j++)
          if (this.L.field[j] > 0.1) {
            c.fillStyle = e.colorSafe ? "#e9b348" : `hsl(${g.hue},65%,55%)`;
            c.beginPath();
            c.arc(
              (((j % 48) + 0.5) * W) / 48,
              ((Math.floor(j / 48) + 0.5) * H) / 30,
              Math.min(W / 48, H / 30) *
                (0.25 + 0.4 * Math.min(1, this.L.field[j])),
              0,
              Math.PI * 2,
            );
            c.fill();
          }
        c.restore();
      },
    };
  }
  const api = {
    KEYS,
    SHAPES,
    FORMS,
    MODULES,
    traits,
    founderAny,
    worldFounder,
    upgradeWorld,
    upgrade,
    hash,
    random,
    validate,
    founder,
    breed,
    twin,
    importRecipes,
    validateAncestry,
    renderer,
  };
  if (typeof module !== "undefined") module.exports = api;
  else root.Nursery = api;
})(typeof window !== "undefined" ? window : globalThis);
