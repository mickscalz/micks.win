const { test } = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  vm = require("node:vm");
const K = require("../assets/js/designs/world-kernels.js"),
  XII = require("../assets/js/designs/resonant-xii.js"),
  XI = require("../assets/js/designs/worldscapes-xi.js");
// The score module is a pure browser script; evaluate it in an isolated scope.
const w = { WorldKernels: K, ResonantXII: XII },
  scope = vm.createContext({ window: w, Math });
vm.runInNewContext(
  fs.readFileSync("assets/js/soundscape-score.js", "utf8"),
  scope,
);
const S = w.SoundscapeScore;
const design = (i) => ({
  id: K.exactSourceIDs[i],
  name: K.exactSourceIDs[i].replace(/-/g, " "),
  family: "landscape",
  tag: K.MODULES.landform[i],
  art: "linear-gradient(135deg,#071529,#287887,#935cb2,#e1bc81)",
  worldKernel: i,
});
test("musical fingerprints are deterministic, unique per world and derived from visuals", () => {
  const all = K.exactSourceIDs.map((_, i) => S.profile(design(i)));
  assert.equal(all.length, 52);
  assert.equal(new Set(all.map((p) => p.fingerprint)).size, 52);
  assert.deepEqual(S.profile(design(36)), S.profile(design(36)));
  // Sound follows the scene intent, not an unrelated hash of the title.
  assert.equal(all[36].biome, "water");
  assert.equal(all[43].biome, "earth");
  assert.equal(all[49].biome, "cosmic");
  assert.equal(all[39].biome, "architecture");
  assert.equal(all[48].biome, "organic");
  assert.equal(all[44].biome, "wind");
  assert.equal(
    new Set(all.map((p) => p.style)).size,
    3,
    "melodic, cinematic and combined directions all occur",
  );
  assert.ok(
    new Set(all.map((p) => p.bpm)).size > 12,
    "tempo tracks motion and mass, not a single global pulse",
  );
  const glass = S.profile({
      id: "a",
      genome: { material: "glass", hue: 200, drift: 0.7 },
    }),
    silk = S.profile({
      id: "a",
      genome: { material: "silk", hue: 200, drift: 0.7 },
    });
  assert.ok(glass.cutoff > silk.cutoff);
  assert.match(glass.texture, /glassy/);
  assert.match(silk.texture, /veil/);
  // Warm palettes are darker/rounder; cool palettes are brighter.
  const warm = S.profile({ id: "b", genome: { hue: 25, material: "mineral" } }),
    cool = S.profile({ id: "b", genome: { hue: 205, material: "mineral" } });
  assert.ok(warm.warmth > 0.9 && cool.warmth < 0.1);
  assert.ok(warm.cutoff < cool.cutoff);
  assert.notEqual(warm.root, cool.root);
  assert.match(S.describe(warm), /BPM · .* fingerprint [0-9a-f]{8}$/);
});
test("scores use real scales, rests and harmony; palette colours pick the register", () => {
  for (let i = 0; i < 52; i++) {
    const p = S.profile(design(i));
    const pitches = new Set(),
      chords = new Set();
    let rests = 0;
    for (let n = 0; n < 64; n++) {
      const note = S.note(p, n);
      chords.add(note.chord);
      if (note.rest) {
        rests++;
        continue;
      }
      assert.ok(Number.isFinite(note.midi) && note.duration > 0);
      assert.ok(note.midi >= 33 && note.midi <= 108, "audible register");
      pitches.add((((note.midi - p.root) % 12) + 12) % 12);
      assert.ok(
        p.scale.includes((((note.midi - p.root) % 12) + 12) % 12),
        "in scale",
      );
    }
    assert.ok(pitches.size >= 2, p.biome + " uses intervals");
    assert.ok(rests >= 3 && rests < 60, p.biome + " phrasing breathes");
    assert.deepEqual([...chords].sort(), [...new Set(p.chords)].sort());
  }
  const blue = S.profile({
      id: "x",
      art: "linear-gradient(135deg,#0b2a55,#1c6ea4,#5aa7c8)",
    }),
    amber = S.profile({
      id: "x",
      art: "linear-gradient(135deg,#5a2a08,#c26b12,#f2c268)",
    }),
    grey = S.profile({ id: "x", art: "linear-gradient(#222,#777)" });
  assert.ok(blue.hue > 180 && blue.hue < 250, "blue palette → cool register");
  assert.ok(amber.hue > 15 && amber.hue < 60, "amber palette → warm register");
  assert.equal(grey.hue, 210, "achromatic palettes use a neutral register");
  assert.notEqual(blue.root, amber.root);
});
