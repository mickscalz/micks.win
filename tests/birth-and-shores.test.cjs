const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm");
const M = require("../assets/js/offspring-motion.js"),
  N = require("../assets/js/nursery.js"),
  K = require("../assets/js/designs/world-kernels.js"),
  XI = require("../assets/js/designs/worldscapes-xi.js");
const w = {},
  ctx = vm.createContext({ window: w });
for (const [, src] of fs
  .readFileSync("index.html", "utf8")
  .matchAll(/<script src="([^"]+)"/g)) {
  const p = src.split("?")[0];
  if (p.includes("/designs/") || p.endsWith("/catalogue.js"))
    vm.runInContext(fs.readFileSync(p, "utf8"), ctx);
}
const sources = Array.from(w.DESIGNS).filter((d) => d.edition === 11);
test("XI adds sixteen independent worldscapes and expands exact environment kernels to 36", () => {
  assert.equal(sources.length, 16);
  assert.equal(new Set(sources.map((d) => d.frag)).size, 16);
  assert.equal(new Set(XI.fields).size, 8);
  assert.equal(new Set(XI.optics).size, 8);
  assert.equal(K.exactSourceIDs.length, 36);
  assert.ok(new Set(sources.map((d) => d.family)).size >= 9);
  for (const d of sources) {
    assert.equal(d.kind, "gl");
    assert.ok(d.pixelBudget <= 500000);
    const i = d.worldKernel - 20,
      p = N.worldFounder(d);
    assert.deepEqual(p.genome, XI.defaults(i));
    assert.equal(K.shader(d.worldKernel), XI.shader(i));
    assert.doesNotMatch(
      K.authored(d.worldKernel),
      /uniform (?:float|vec4) u(?:World|Climate|Ecology|Lobes|Force|Depth);/,
    );
  }
});
test("newborn presentation has deterministic nonresting phases and bounded pacing, without altering founder clocks", () => {
  const a = N.worldFounder(sources[0]),
    b = N.worldFounder(sources[1]);
  assert.deepEqual(M.profile(a), { phase: 0, rate: 1 });
  const c = N.breed([a, b], { seed: 91 }),
    p = M.profile(c);
  assert.ok(p.phase >= 6 && p.phase < 35);
  assert.ok(p.rate >= 2.5 && p.rate <= 7);
  assert.deepEqual(p, M.profile(N.validate(JSON.parse(JSON.stringify(c)))));
  assert.notDeepEqual(p, M.profile(N.twin(c, 92)));
  assert.ok(Math.abs(p.phase - M.profile(N.twin(c, 92)).phase) > 0.5);
  assert.equal(M.time(0, p), p.phase);
  assert.equal(M.time(1, p), p.phase + p.rate);
  assert.deepEqual(c, N.breed([a, b], { seed: 91 }));
});
test("legacy newborn agents begin with finite, seeded velocity; source agents and IDs remain unchanged", () => {
  const parent = N.worldFounder(sources[0]),
    child = N.breed([parent, N.worldFounder(sources[1])], { seed: 19 }),
    agents = [
      { a: 0.4, vx: 0, vy: 0 },
      { a: 2, vx: 0, vy: 0 },
    ];
  M.awaken(agents, parent);
  assert.equal(agents[0].vx, 0);
  M.awaken(agents, child);
  for (const p of agents)
    assert.ok(Math.abs(Math.hypot(p.vx, p.vy) - 0.025) < 1e-10);
  const copy = [{ a: 0.4 }, { a: 2 }];
  M.awaken(copy, child);
  assert.deepEqual(agents, copy);
  assert.equal(N.validate(child).id, child.id);
});
