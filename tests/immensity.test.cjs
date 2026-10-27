const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm");
const X = require("../assets/js/designs/evolution-x.js"),
  H = require("../assets/js/designs/horizons-x.js"),
  K = require("../assets/js/designs/world-kernels.js"),
  N = require("../assets/js/nursery.js");
const html = fs.readFileSync("index.html", "utf8"),
  w = {};
const scope = vm.createContext({ window: w });
for (const [, url] of html.matchAll(/<script src="([^"]+)"/g)) {
  const f = url.split("?")[0];
  if (f.includes("/designs/") || f.endsWith("/catalogue.js"))
    vm.runInContext(fs.readFileSync(f, "utf8"), scope);
}
const latest = Array.from(w.DESIGNS).filter((d) => d.edition === 10),
  living = latest.filter((d) => d.kind === "2d");
test("X adds sixteen distinct worlds with twelve GPU kernels and four independent living grammars", () => {
  assert.equal(latest.length, 16);
  assert.equal(living.length, 4);
  assert.equal(latest.filter((d) => d.kind === "gl").length, 12);
  assert.equal(new Set(latest.map((d) => d.tag)).size, 16);
  assert.ok(new Set(latest.map((d) => d.family)).size >= 9);
  assert.equal(
    new Set(latest.filter((d) => d.frag).map((d) => d.frag)).size,
    12,
  );
  assert.equal(K.exactSourceIDs.length, 20);
  for (const d of latest) {
    assert.ok(d.lifeMechanism && d.motionClass && d.paletteGroup);
    if (d.kind === "gl") assert.ok(d.pixelBudget <= 600000);
  }
});
test("all twelve X environment bodies and defaults are reused by v3, with strict replayable module inheritance", () => {
  const parents = latest.filter((d) => d.kind === "gl").map(N.worldFounder);
  for (const p of parents) {
    const index = H.specs.findIndex((s) => "world:" + s[0] === p.id);
    assert.deepEqual(p.genome, H.defaults(index));
    assert.equal(K.shader(index + 8), H.shader(index));
    assert.doesNotMatch(
      K.authored(index + 8),
      /uniform (?:vec4|float) u(?:World|Climate|Ecology|Depth|Lobes|Force);/,
    );
  }
  for (let seed = 1; seed < 15; seed++) {
    const p = N.breed(parents, { seed });
    assert.equal(p.version, 3);
    const gene = p.provenance.find((x) => x.trait === "landform"),
      donor = gene.weights.indexOf(1);
    assert.equal(p.genome.landform, parents[donor].genome.landform);
    assert.deepEqual(p, N.breed(parents, { seed }));
    assert.deepEqual(p, N.validate(JSON.parse(JSON.stringify(p))));
  }
});
test("developmental channels are bounded, C2-smooth at epoch boundaries and diverge over long runs", () => {
  for (const seed of [1, 9, 105]) {
    for (let t = 0; t < 2000; t += 0.37)
      assert.ok(X.channel(t, seed) >= 0 && X.channel(t, seed) <= 1);
    for (const t of [13, 26, 130])
      assert.ok(
        Math.abs(X.channel(t - 1e-4, seed) - X.channel(t + 1e-4, seed)) < 1e-8,
      );
    assert.notEqual(X.channel(12, seed), X.channel(1200, seed));
  }
  let sum = 0,
    max = 0;
  X.steps(0.2, (dt) => {
    sum += dt;
    max = Math.max(max, dt);
  });
  assert.ok(Math.abs(sum - 0.1) < 1e-9 && max <= 1 / 60);
  X.steps(0, () => assert.fail("held step"));
});
test("four ecologies stay deterministic, finite and bounded across several developmental generations", () => {
  for (const d of living) {
    d.init();
    const initial = JSON.stringify({
      clock: d.clock,
      nodes: d.nodes,
      agents: d.agents,
      branches: d.branches,
      field: d.field,
    });
    d.init();
    assert.equal(
      JSON.stringify({
        clock: d.clock,
        nodes: d.nodes,
        agents: d.agents,
        branches: d.branches,
        field: d.field,
      }),
      initial,
    );
    const time = d.clock;
    for (let i = 0; i < 2200; i++) d.advance({ dt: 0.05 });
    const population = (d.nodes || d.agents || d.branches).length;
    assert.ok(population > 0 && population <= 210, d.id + ": " + population);
    assert.ok(d.clock > time + 100);
    assert.ok(d.births > 0 && d.generation > 0, d.id);
    assert.ok(Number.isFinite(d.renewals));
    const held = JSON.stringify(d);
    d.advance({ dt: 0 });
    assert.equal(JSON.stringify(d), held, "held " + d.id);
    for (const p of d.nodes || d.agents || d.branches)
      assert.ok(
        Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.age),
      );
  }
});
