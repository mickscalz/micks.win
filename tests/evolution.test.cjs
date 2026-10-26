const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"),
  vm = require("node:vm");
const N = require("../assets/js/nursery.js"),
  E = require("../assets/js/nursery-evolution.js"),
  D = require("../assets/js/audio-decode.js");
const html = fs.readFileSync("index.html", "utf8"),
  w = {};
const scope = vm.createContext({ window: w });
for (const [, src] of html.matchAll(/<script src="([^"]+)"/g)) {
  const f = src.split("?")[0];
  if (f.includes("/designs/") || f.endsWith("catalogue.js"))
    vm.runInContext(fs.readFileSync(f, "utf8"), scope);
}
const all = Array.from(w.DESIGNS, N.founderAny),
  parents = all.slice(0, 32);
test("all 320 source worlds have deterministic typed, non-executable adapters", () => {
  assert.equal(all.length, 320);
  assert.equal(new Set(all.map((p) => p.id)).size, 320);
  assert.equal(new Set(all.map((p) => p.genome.shape)).size, 12);
  assert.deepEqual(all, Array.from(w.DESIGNS, N.founderAny));
  all.forEach((p) => {
    assert.equal(p.version, 2);
    assert.deepEqual(p, N.validate(p));
  });
});
test("32-parent whole-module inheritance, signed mutation provenance, twins and strict bounds", () => {
  const a = N.breed(parents, { seed: 190 });
  assert.equal(a.parents.length, 32);
  assert.equal(a.provenance.length, 17);
  for (const k of [
    "shape",
    "topology",
    "material",
    "rhythm",
    "hue",
    "force",
    "lobes",
  ]) {
    const p = a.provenance.find((p) => p.trait === k),
      i = p.weights.indexOf(1);
    assert.equal(a.genome[k], parents[i].genome[k]);
  }
  for (const k of [...N.KEYS, "depth", "relief"]) {
    const p = a.provenance.find((p) => p.trait === k);
    assert.equal(p.weights.length, 32);
    assert.ok(
      Math.abs(
        a.genome[k] -
          (parents.reduce((s, g, i) => s + g.genome[k] * p.weights[i], 0) +
            p.mutation),
      ) < 1e-9,
    );
  }
  assert.deepEqual(N.breed(parents, { seed: 190 }), a);
  assert.deepEqual(N.twin(a, 191).genome, a.genome);
  assert.throws(() => N.breed([...parents, all[32]]));
  assert.throws(() => N.validate({ ...a, solver: "eco-v1" }));
  assert.throws(() => N.validate({ ...a, provenance: a.provenance.slice(1) }));
  const one = N.breed(parents, {
    seed: 200,
    weights: parents.map((_, i) => (i === 31 ? 1 : 0)),
  });
  for (const k of ["shape", "topology", "material", "rhythm"])
    assert.equal(one.genome[k], parents[31].genome[k]);
});
test("v1 breeding remains reproducible, mixed v1/v2 upgrades without rewriting parents", () => {
  const fixed = ["eden-of-divergence", "glass-moth-migration"].map((id) =>
    N.founder({
      id,
      edition: 8,
      kind: "2d",
      name: id,
      lifeMechanism: "Nutrient ecology",
    }),
  );
  assert.equal(N.breed(fixed, { seed: 91 }).id, "child-2a22745522d6eaf7");
  const legacy = w.DESIGNS.filter((d) => d.kind === "2d" && d.edition === 8)
      .slice(0, 2)
      .map(N.founder),
    before = JSON.stringify(legacy),
    old = N.breed(legacy, { seed: 91 });
  assert.equal(old.version, 1);
  assert.equal(old.provenance.length, 12);
  assert.equal(N.validate(old).id, old.id);
  assert.equal(N.breed([old, parents[0]], { seed: 92 }).version, 2);
  assert.equal(JSON.stringify(legacy), before);
});
test("bounded multi-generation search is reproducible, ancestry-valid and diverse", async () => {
  const opts = {
    parents: parents.slice(0, 4),
    seed: 53,
    generations: 4,
    candidates: 28,
    archive: 7,
    seconds: 60,
    yieldTask: async () => {},
    now: () => 0,
  };
  const a = await E.run(opts),
    b = await E.run(opts);
  assert.deepEqual(a, b);
  assert.equal(a.count, 28);
  assert.equal(a.recipes.length, 7);
  assert.ok(Math.max(...a.recipes.map((p) => p.generation)) >= 2);
  assert.equal(a.reason, "candidate budget");
  N.validateAncestry([...parents.slice(0, 4), ...a.ancestry]);
  assert.ok(E.distance(a.recipes[0], a.recipes[1]) > 0);
  assert.equal(E.distance(a.recipes[0], a.recipes[0]), 0);
  assert.equal(E.curate(a.recipes, 3, a.recipes[0]).length, 3);
  assert.equal(
    N.importRecipes(
      JSON.stringify({ version: 1, recipes: [...parents, ...a.ancestry] }),
    ).length,
    60,
  );
});
test("stop/time/candidate/generation budgets hold, including partial generation", async () => {
  let calls = 0;
  const opts = {
    parents: parents.slice(0, 2),
    generations: 20,
    candidates: 96,
    archive: 24,
    seconds: 60,
    now: () => 0,
  };
  const a = await E.run({
    ...opts,
    cancelled: () => calls >= 3,
    yieldTask: async () => {
      calls++;
    },
  });
  assert.equal(a.count, 3);
  assert.equal(a.reason, "stopped");
  let time = 0;
  const b = await E.run({
    ...opts,
    seconds: 1,
    now: () => time,
    yieldTask: async () => {
      time += 500;
    },
  });
  assert.equal(b.count, 2);
  assert.equal(b.reason, "time budget");
  const c = await E.run({ ...opts, generations: 1, yieldTask: async () => {} });
  assert.equal(c.count, 8);
  assert.equal(c.reason, "generation budget");
  await assert.rejects(E.run({ ...opts, candidates: 97 }));
  await assert.rejects(E.run({ ...opts, archive: 25 }));
  await assert.rejects(E.run({ ...opts, seconds: 61 }));
});
test("native decode preflight rejects before allocating and returns bounded float PCM", async () => {
  let constructed = 0;
  class Context {
    constructor(...args) {
      constructed++;
      assert.deepEqual(args, [2, 1, 16000]);
    }
    async decodeAudioData() {
      return {
        numberOfChannels: 2,
        sampleRate: 16000,
        length: 1600,
        duration: 0.1,
        getChannelData: (c) => new Float32Array(1600).fill(c ? -0.2 : 0.2),
      };
    }
  }
  const buffer = new ArrayBuffer(64);
  for (const duration of [Infinity, NaN, 0, 181])
    await assert.rejects(D.decode(buffer, { duration, Context }));
  assert.equal(constructed, 0);
  const wav = await D.decode(buffer, {
    duration: 0.1,
    Context,
    yieldTask: async () => {},
  });
  assert.equal(D.directPCM(wav), true);
  assert.equal(new DataView(wav).getUint16(22, true), 2);
  assert.ok(new DataView(wav).getFloat32(44, true) > 0);
  assert.ok(new DataView(wav).getFloat32(48, true) < 0);
  let cancelled = false;
  class Slow extends Context {
    async decodeAudioData() {
      const result = await super.decodeAudioData();
      cancelled = true;
      return result;
    }
  }
  await assert.rejects(
    D.decode(buffer, {
      duration: 0.1,
      Context: Slow,
      cancelled: () => cancelled,
    }),
    /cancelled/,
  );
  class Big extends Context {
    async decodeAudioData() {
      return {
        numberOfChannels: 6,
        sampleRate: 48000,
        length: 1e9,
        duration: 10000,
      };
    }
  }
  await assert.rejects(
    D.decode(buffer, { duration: 1, Context: Big }),
    /budget/,
  );
});
test("imports enforce UTF-8 bytes, record and module limits", () => {
  assert.throws(() => N.importRecipes("😀".repeat(530000)), /2 MiB/);
  assert.throws(
    () =>
      N.importRecipes(
        JSON.stringify({ version: 1, recipes: Array(513).fill(parents[0]) }),
      ),
    /512/,
  );
  assert.throws(
    () =>
      N.validate({
        ...parents[0],
        genome: { ...parents[0].genome, topology: "execute" },
      }),
    /module/,
  );
});

test("all three source renderer families contribute to one typed hybrid", () => {
  const sources = ["gl", "glx", "2d"].map((kind) =>
      N.founderAny(w.DESIGNS.find((d) => d.kind === kind)),
    ),
    child = N.breed(sources, { seed: 82 });
  assert.equal(child.version, 2);
  assert.equal(child.parents.length, 3);
});
