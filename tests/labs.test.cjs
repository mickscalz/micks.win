const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"),
  vm = require("node:vm");
const N = require("../assets/js/nursery.js"),
  A = require("../assets/js/music-analysis.js");
const founder = (id) =>
  N.founder({
    id,
    edition: 8,
    kind: "2d",
    name: id,
    lifeMechanism: "Nutrient ecology",
  });
const parents = [
  founder("eden-of-divergence"),
  founder("glass-moth-migration"),
  founder("symphony-of-diatoms"),
  founder("vernal-negative"),
];
test("typed genomes breed reproducibly, inherit whole modules, record weights and generate distinct twins", () => {
  const a = N.breed(parents, { seed: 12, weights: [0.1, 0.2, 0.3, 0.4] }),
    b = N.breed(parents, { seed: 12, weights: [0.1, 0.2, 0.3, 0.4] });
  assert.deepEqual(a, b);
  assert.equal(a.provenance.length, 12);
  for (const k of ["shape", "force", "hue", "lobes"])
    assert.ok(parents.some((p) => p.genome[k] === a.genome[k]));
  for (const k of N.KEYS) {
    const p = a.provenance.find((p) => p.trait === k);
    assert.deepEqual(p.weights, [0.1, 0.2, 0.3, 0.4]);
    assert.ok(
      Math.abs(
        a.genome[k] -
          (parents.reduce((s, r, i) => s + r.genome[k] * p.weights[i], 0) +
            p.mutation),
      ) < 1e-9,
    );
  }
  const twin = N.twin(a, 13);
  assert.deepEqual(twin.genome, a.genome);
  assert.notEqual(twin.id, a.id);
  assert.notEqual(twin.seed, a.seed);
  assert.deepEqual(twin.parents, a.parents);
  const child = N.breed([a, parents[0]], { seed: 14, mood: "calm" });
  assert.equal(child.generation, 2);
  assert.ok(child.genome.lifecycle <= 0.4 && child.genome.drift <= 0.4);
  assert.equal(N.validate({ ...a, name: "renamed" }).id, a.id);
});
// Keep validation fixtures separate from JavaScript assignment, which itself is not validation.
test("recipe import reconstructs only allowed fields and validates all resource/identity bounds", () => {
  const child = N.breed(parents.slice(0, 2), { seed: 33 });
  for (const patch of [
    { version: 2 },
    { solver: "shader-code" },
    { seed: NaN },
    { seed: 0 },
    { generation: -1 },
    { parents: [] },
    { id: "child-0000000000000000" },
    { genome: { ...child.genome, growth: 3 } },
    { provenance: [] },
  ])
    assert.throws(() => N.validate({ ...child, ...patch }));
  assert.throws(() => N.founder({ edition: 7, kind: "gl", lifeMechanism: "" }));
  assert.throws(() => N.breed([parents[0], parents[0]]));
  assert.throws(() => N.breed(parents, { weights: [0, 0, 0, 0] }));
  assert.throws(() => N.breed(parents, { weights: [NaN, 0, 0, 1] }));
  assert.throws(() => N.importRecipes("x".repeat(524289)));
  assert.throws(() =>
    N.importRecipes(
      JSON.stringify({ version: 1, recipes: Array(133).fill(child) }),
    ),
  );
  assert.throws(() =>
    N.importRecipes(JSON.stringify({ version: 1, recipes: [child, child] })),
  );
  const imp = N.importRecipes(
    JSON.stringify({
      version: 1,
      recipes: [
        ...parents.slice(0, 2),
        { ...child, execute: "alert(1)", name: "<img onerror=alert(1)>" },
      ],
    }),
  );
  assert.equal(imp.length, 3);
  assert.equal(imp[2].execute, undefined);
  assert.equal(imp[2].name, "<img onerror=alert(1)>");
});
test("many bounded generations retain finite genes and complete provenance", () => {
  let p = parents[0];
  for (let i = 1; i < 150; i++) {
    p = N.breed([p, parents[1]], {
      seed: i,
      mood: i % 2 ? "wild" : "balanced",
    });
    for (const k of N.KEYS)
      assert.ok(
        Number.isFinite(p.genome[k]) && p.genome[k] >= 0 && p.genome[k] <= 1,
      );
    assert.equal(p.provenance.length, 12);
  }
  assert.equal(p.generation, 149);
});
function wave(seconds = 4, tone = 440, amplitude = 0.3, pulses = false) {
  const rate = 8000,
    count = rate * seconds,
    b = new ArrayBuffer(44 + count * 2),
    v = new DataView(b);
  const tag = (at, s) =>
    [...s].forEach((c, i) => v.setUint8(at + i, c.charCodeAt(0)));
  tag(0, "RIFF");
  v.setUint32(4, b.byteLength - 8, true);
  tag(8, "WAVEfmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  tag(36, "data");
  v.setUint32(40, count * 2, true);
  for (let i = 0; i < count; i++) {
    const t = i / rate,
      a = pulses ? (t % 0.5 < 0.1 ? amplitude : 0) : amplitude;
    v.setInt16(
      44 + i * 2,
      Math.round(Math.sin(t * Math.PI * 2 * tone) * a * 32767),
      true,
    );
  }
  return b;
}
test("worker spectral fixtures identify tone energy/pitch-class without inventing tempo or sections", () => {
  const r = A.analyze(wave());
  assert.equal(r.rows.length, 8);
  assert.ok(Math.abs(r.rows[2].centroid - 440) < 8);
  assert.equal(r.rows[2].chroma.indexOf(Math.max(...r.rows[2].chroma)), 9);
  assert.equal(r.bpm, null);
  assert.ok(r.rows.every((row) => row.flatness < 0.1));
  const silent = A.analyze(wave(4, 440, 0));
  assert.equal(silent.bpm, null);
  assert.equal(silent.changes.length, 0);
  assert.ok(
    silent.rows.every((r) => r.rms === 0 && r.centroid === 0 && r.energy === 0),
  );
});
test("tempo requires periodic evidence; short, truncated, nonfinite, compressed and oversized PCM are rejected", () => {
  const r = A.analyze(wave(12, 440, 0.4, true));
  assert.ok(Math.abs(r.bpm - 120) < 1);
  assert.ok(r.confidence > 0.65);
  assert.equal(A.analyze(wave(2, 440, 0.4, true)).bpm, null);
  assert.throws(() => A.analyze(new ArrayBuffer(10)));
  assert.throws(() => A.parse(new ArrayBuffer(33554433)));
  const b = wave();
  new DataView(b).setUint32(40, 9999999, true);
  assert.throws(() => A.analyze(b));
  const bad = wave();
  new DataView(bad).setUint16(20, 99, true);
  assert.throws(() => A.analyze(bad));
});
function lab() {
  const window = {};
  const document = {
    currentScript: {
      src: "https://example.test/project/assets/js/music-lab.js",
    },
    getElementById: () => null,
  };
  vm.runInNewContext(
    fs.readFileSync(require.resolve("../assets/js/music-lab.js"), "utf8"),
    { window, document, URL, performance, console },
  );
  return { window, M: window.MusicLab };
}
test("editable routes bound aggregate influence, bypass unavailable analysis and respect calm", () => {
  const { M } = lab(),
    base = {
      growth: 0.5,
      mutation: 0.5,
      coupling: 0.5,
      atmosphere: 0.5,
      afterglow: 0.5,
    },
    signal = { bass: 1, mid: 0.5, treble: 0.8, energy: 0.6, onset: 1 },
    settings = { calm: false, reducedMotion: false, reducedFlashes: true };
  const a = M.apply({ ...base }, signal, 1, settings);
  assert.ok(a.growth > 0.5);
  assert.deepEqual(M.apply({ ...base }, signal, 0, settings), base);
  M.restore({
    global: Array(4).fill({
      source: "bass",
      target: "growth",
      amount: 0.6,
      enabled: true,
    }),
  });
  assert.equal(M.apply({ ...base }, signal, 1, settings).growth, 0.675);
  const quiet = M.apply({ ...base }, signal, 1, { ...settings, calm: true });
  assert.ok(quiet.growth < 0.675);
  M.restore({
    global: Array(4).fill({
      source: "arc",
      target: "growth",
      amount: 0.6,
      enabled: true,
    }),
  });
  assert.equal(M.apply({ ...base }, signal, 1, settings).growth, 0.5);
  assert.throws(() =>
    M.validRoutes([
      { source: "execute", target: "growth", amount: 1, enabled: true },
    ]),
  );
});
test("per-world routes are copied, sanitized, version-independent numeric data only", () => {
  const { M, window } = lab();
  window.Cabinet = { index: 0, designs: [{ id: "test-world" }] };
  M.restore({
    "test-world": Array(4).fill({
      source: "bass",
      target: "growth",
      amount: -0.6,
      enabled: true,
    }),
  });
  assert.equal(M.apply({ growth: 0.5 }, { bass: 1 }, 1, {}).growth, 0.325);
  const copy = M.serialize();
  copy["test-world"][0].amount = 99;
  assert.equal(M.serialize()["test-world"][0].amount, -0.6);
  M.restore({
    global: Array(4).fill({
      source: "bass",
      target: "growth",
      amount: Infinity,
      enabled: true,
    }),
  });
  assert.equal(M.serialize().global[0].amount, 0.35);
});

test("offspring solver is reproducible, bounded, actually inherits force/traits and holds exactly", () => {
  const window = { D: (d) => d };
  const ctx = vm.createContext({ window });
  for (const f of [
    "glsl-prelude.js",
    "designs/collection-viii.js",
    "designs/collection-viii-canvas.js",
  ])
    vm.runInContext(
      fs.readFileSync(require.resolve("../assets/js/" + f), "utf8"),
      ctx,
    );
  global.CabinetVIII = window.CabinetVIII;
  try {
    const recipe = N.breed(parents.slice(0, 2), { seed: 888 }),
      a = N.renderer(recipe),
      b = N.renderer(recipe);
    a.init();
    b.init();
    assert.equal(a.L.mode, recipe.genome.force);
    for (let i = 0; i < 800; i++) {
      a.advance({ dt: 0.05, experience: { density: 1, detail: 1 } });
      b.advance({ dt: 0.05, experience: { density: 1, detail: 1 } });
    }
    assert.equal(JSON.stringify(a), JSON.stringify(b));
    assert.ok(a.L.agents.length <= 210 && a.L.agents.length > 0);
    assert.ok(a.L.births > 0);
    const state = JSON.stringify(a);
    a.advance({ dt: 0, experience: {} });
    assert.equal(JSON.stringify(a), state);
    for (const p of a.L.agents)
      for (const k of ["x", "y", "energy", "age"])
        assert.ok(Number.isFinite(p[k]));
  } finally {
    delete global.CabinetVIII;
  }
});
test("floating PCM rejects non-finite samples, keeps silent features finite, and route profile budgets stay bounded", () => {
  const raw = wave(1),
    float = new ArrayBuffer(44 + 8000 * 4),
    v = new DataView(float);
  new Uint8Array(float).set(new Uint8Array(raw).slice(0, 44));
  v.setUint32(4, float.byteLength - 8, true);
  v.setUint16(20, 3, true);
  v.setUint32(28, 32000, true);
  v.setUint16(32, 4, true);
  v.setUint16(34, 32, true);
  v.setUint32(40, 32000, true);
  assert.equal(A.analyze(float).rows[0].rms, 0);
  v.setFloat32(44, NaN, true);
  assert.throws(() => A.analyze(float), /Non-finite/);
  const { M } = lab(),
    profiles = {};
  for (let i = 0; i < 100; i++) profiles["world-" + i] = M.defaults();
  M.restore(profiles);
  assert.ok(Object.keys(M.serialize()).length <= 64);
});

test("stereo anti-phase does not disappear from local spectral/energy analysis", () => {
  const mono = wave(1),
    b = new ArrayBuffer(44 + 16000 * 2),
    v = new DataView(b),
    m = new DataView(mono);
  new Uint8Array(b).set(new Uint8Array(mono).slice(0, 44));
  v.setUint32(4, b.byteLength - 8, true);
  v.setUint16(22, 2, true);
  v.setUint32(28, 32000, true);
  v.setUint16(32, 4, true);
  v.setUint32(40, 32000, true);
  for (let i = 0; i < 8000; i++) {
    const x = m.getInt16(44 + i * 2, true);
    v.setInt16(44 + i * 4, x, true);
    v.setInt16(46 + i * 4, -x, true);
  }
  const a = A.analyze(b);
  assert.ok(a.rows[0].rms > 0.2);
  assert.ok(Math.abs(a.rows[0].centroid - 440) < 10);
  assert.equal(a.bpm, null);
});

test("known-parent generation order is revalidated when separate families are merged", () => {
  const parent = N.breed(parents.slice(0, 2), { seed: 901 });
  const r = N.breed(parents.slice(0, 2), { seed: 902 });
  r.parents = [parent.id, parents[0].id];
  r.generation = 1;
  const core = JSON.stringify([1, r.seed, r.parents, r.generation, r.genome]);
  r.id =
    "child-" +
    N.hash(core).toString(16).padStart(8, "0") +
    N.hash("recipe:" + core)
      .toString(16)
      .padStart(8, "0");
  const valid = N.validate(r);
  assert.equal(valid.generation, 1);
  assert.throws(() => N.validateAncestry([parent, valid]), /generation/);
});
