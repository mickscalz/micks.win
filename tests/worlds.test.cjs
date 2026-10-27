const { test } = require("node:test");
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm");
const N = require("../assets/js/nursery.js"),
  K = require("../assets/js/designs/world-kernels.js"),
  E = require("../assets/js/nursery-evolution.js");
const sources = K.specs.map((s, i) => ({
  id: s[0],
  name: s[1],
  tag: s[8],
  kind: "gl",
  edition: 9,
  worldKernel: i,
}));
const parents = sources.map(N.worldFounder);
test("IX world founders use exactly the authored field parameters, in independent world namespaces", () => {
  assert.equal(new Set(K.fields).size, 8);
  parents.forEach((p, i) => {
    assert.deepEqual(p.genome, K.defaults(i));
    assert.equal(p.id, "world:" + sources[i].id);
    assert.deepEqual(N.validate(p), p);
    assert.ok(K.authored(i).includes(K.fields[i]));
    assert.ok(K.shader(i).includes(K.fields[i]));
    assert.doesNotMatch(
      K.authored(i),
      /uniform (?:float|vec4) u(?:World|Climate|Ecology|Lobes|Force|Depth);/,
    );
  });
});
test("whole-world categorical modules inherit separately, with strict provenance and stable replay", () => {
  const seen = new Set();
  let mixed = false;
  for (let seed = 1; seed <= 40; seed++) {
    const c = N.breed(parents, { seed });
    assert.equal(c.version, 3);
    assert.equal(c.solver, "world-v3");
    assert.equal(c.provenance.length, 23);
    assert.deepEqual(c, N.breed(parents, { seed }));
    const donors = [];
    for (const k of Object.keys(K.MODULES)) {
      const p = c.provenance.find((x) => x.trait === k),
        i = p.weights.indexOf(1);
      assert.equal(c.genome[k], parents[i].genome[k]);
      assert.equal(p.mutation, 0);
      donors.push(i);
    }
    mixed ||= new Set(donors).size > 1;
    seen.add(c.genome.landform);
    assert.deepEqual(N.validate(JSON.parse(JSON.stringify(c))), c);
    const bad = JSON.parse(JSON.stringify(c));
    bad.genome.landform = "void main(){evil}";
    assert.throws(() => N.validate(bad), /Unsupported world module/);
  }
  assert.equal(seen.size, 8);
  assert.ok(mixed);
  const child = N.breed(parents, { seed: 91 });
  assert.deepEqual(
    N.importRecipes(
      JSON.stringify({ version: 1, recipes: [...parents, child] }),
    ),
    [...parents, child],
  );
});
test("legacy identities and default APIs stay compatible; world scope upgrades only explicitly", () => {
  const a = N.founderAny({ id: "old-ocean", name: "Old Ocean", kind: "gl" }),
    b = N.founderAny({ id: "old-dune", name: "Old Dune", kind: "2d" });
  assert.equal(N.breed([a, b], { seed: 13 }).version, 2);
  const c = N.breed([a, b], { seed: 13, scope: "world" });
  assert.equal(c.version, 3);
  assert.deepEqual(c.parents, [a.id, b.id]);
  assert.ok(["tide", "mirror", "river", "dry"].includes(c.genome.water));
  assert.throws(() => N.breed([a, b], { scope: "execute" }));
  assert.ok(Number.isFinite(E.distance(c, a)));
  assert.ok(E.distance(parents[0], parents[5]) > 0);
});
test("automatic multi-generation world search retains v3 modules and complete bounded ancestry", async () => {
  const out = await E.run({
    parents,
    seed: 12,
    generations: 3,
    candidates: 20,
    archive: 4,
    yieldTask: async () => {},
    now: () => 0,
  });
  assert.equal(out.count, 20);
  assert.ok(out.recipes.every((p) => p.version === 3));
  N.validateAncestry(out.ancestry);
  assert.ok(out.recipes.some((p) => p.generation > 1));
});
test("habitat density deposition is continuous at cell boundaries and held redraws do not change it", () => {
  const w = { Nursery: N };
  vm.runInNewContext(fs.readFileSync("assets/js/habitat.js", "utf8"), {
    window: w,
  });
  const raster = w.HabitatRenderer.rasterize;
  const L = {
    field: new Float32Array(1440),
    agents: [{ x: 20 / 47 - 1e-6, y: 0.5 }],
  };
  const a = raster(L, null, 0);
  L.agents[0].x += 2e-6;
  const b = raster(L, null, 0);
  assert.ok(Math.max(...a.map((v, i) => Math.abs(v - b[i]))) < 0.01);
  assert.ok(Math.abs(a.reduce((s, v) => s + v, 0) - 95) < 0.001);
  const held = Float32Array.from(a);
  raster(L, held, 0);
  assert.deepEqual(Array.from(held), Array.from(a));
  raster(L, held, 1 / 60);
  assert.notDeepEqual(Array.from(held), Array.from(a));
});

test("soundscape is opt-in and reports unsupported browsers without requests or unhandled errors", async () => {
  const elements = new Map(),
    get = (id) => {
      if (!elements.has(id))
        elements.set(id, { textContent: "", setAttribute() {} });
      return elements.get(id);
    };
  const w = { addEventListener() {} },
    d = { readyState: "loading", getElementById: get, addEventListener() {} };
  vm.runInNewContext(fs.readFileSync("assets/js/soundscape.js", "utf8"), {
    window: w,
    document: d,
  });
  assert.equal(w.Soundscape.enabled, false);
  assert.equal(w.Soundscape.sample().state, "off");
  await w.Soundscape.start();
  assert.equal(w.Soundscape.enabled, false);
  assert.match(get("ambientStatus").textContent, /unavailable/);
  await w.Soundscape.stop();
  assert.equal(w.Soundscape.sample().rms, 0);
  assert.notDeepEqual(
    w.Soundscape.profile({ id: "tidal-cathedral" }),
    w.Soundscape.profile({ id: "monsoon-arcade" }),
  );
});

test("ecology headings ease through angle wrapping, and dt=0 preserves display envelopes", () => {
  const w = { D() {} };
  vm.runInNewContext(
    fs.readFileSync("assets/js/designs/collection-viii.js", "utf8"),
    { window: w },
  );
  vm.runInNewContext(
    fs.readFileSync("assets/js/designs/collection-viii-canvas.js", "utf8"),
    { window: w },
  );
  const e = w.CabinetVIII.ecology,
    L = e.create(91, 2, 1),
    p = L.agents[0];
  p.x = p.y = 0.5;
  p.heading = Math.PI - 0.01;
  p.vx = -0.02;
  p.vy = -0.001;
  const before = p.heading;
  e.advance(L, 1 / 60, e.tune({}));
  assert.ok(
    Math.abs(p.heading - before) < 0.1,
    "heading must take the short path through PI",
  );
  assert.ok(Number.isFinite(p.displayAge) && Number.isFinite(p.displayEnergy));
  const held = JSON.stringify(L);
  e.advance(L, 0, e.tune({}));
  assert.equal(JSON.stringify(L), held);
});
