const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const source = fs.readFileSync(
  require("node:path").join(__dirname, "../assets/js/experience.js"),
  "utf8",
);
function setup(initial = {}, reduced = false) {
  const store = new Map(Object.entries(initial)),
    writes = [];
  const w = {
    matchMedia: () => ({ matches: reduced }),
    addEventListener() {},
    navigator: {},
    performance: {},
    localStorage: {
      getItem: (k) => store.get(k) || null,
      setItem(k, v) {
        writes.push(k);
        store.set(k, v);
      },
      removeItem: (k) => store.delete(k),
    },
  };
  vm.runInNewContext(source, { window: w });
  return { w, e: w.Experience, store, writes };
}
test("preferences are session-only by default, sanitized, copied and consent-gated", () => {
  const { e, store, writes } = setup();
  e.set("intensity", 0.9);
  e.set("motion", 100);
  e.set("novelty", NaN);
  e.set("mode", "bogus");
  assert.equal(e.settings.motion, 1.5);
  assert.equal(e.settings.novelty, 0.7);
  assert.equal(e.settings.mode, "guided");
  assert.equal(writes.length, 0);
  const copy = e.settings;
  copy.intensity = 0;
  assert.equal(e.settings.intensity, 0.9);
  e.setConsent(true);
  assert.equal(store.size, 2);
  assert.equal(
    JSON.parse(store.get("cabinet-experience-v1")).settings.intensity,
    0.9,
  );
  const restored = setup(Object.fromEntries(store)).e;
  assert.equal(restored.settings.intensity, 0.9);
  assert.equal(restored.getConsent(), true);
  e.setConsent(false);
  assert.equal(store.size, 0);
  e.setConsent(true);
  e.reset();
  assert.equal(store.size, 0);
  assert.equal(e.settings.intensity, 0.65);
});
test("unconsented and malformed stored preferences cannot enable personalization", () => {
  const key = "cabinet-experience-v1";
  assert.equal(
    setup({ [key]: JSON.stringify({ settings: { brightness: 1.3 } }) }).e
      .settings.brightness,
    1,
  );
  assert.equal(
    setup({ [key + "-consent"]: "yes", [key]: "{broken" }).e.getConsent(),
    false,
  );
  const { e } = setup({
    [key + "-consent"]: "yes",
    [key]: JSON.stringify({
      settings: { brightness: -99, motion: Infinity, mode: "injected" },
      likes: { "<script>": 5, x: "bad" },
      saved: [],
    }),
  });
  assert.equal(e.settings.brightness, 0.15);
  assert.equal(e.settings.motion, 1);
  assert.equal(e.settings.mode, "guided");
});
test("accessibility clamps are immediate and zero delta does not advance the rhythm", () => {
  const { e } = setup({}, true);
  assert.equal(e.settings.reducedMotion, true);
  assert.ok(e.effective().motion <= 0.18);
  e.set("calm", true);
  e.set("brightness", 1.35);
  assert.ok(e.effective().brightness <= 0.65);
  assert.ok(e.effective().intensity <= 0.3);
  const before = JSON.stringify(e.frame());
  e.advance(0);
  assert.equal(JSON.stringify(e.frame()), before);
  e.reset();
  assert.equal(e.settings.reducedMotion, true);
  e.advance(1);
  assert.equal(e.signal.source, "internal");
  assert.equal(e.signal.tempo, null);
});
test("automatic quality degrades and recovers within bounds; explicit presets override it", () => {
  const { e } = setup();
  for (let i = 0; i < 20; i++) e.performanceSample(15, 67);
  assert.equal(e.frame().quality, 0.4);
  for (let i = 0; i < 30; i++) e.performanceSample(60, 16.7);
  assert.equal(e.frame().quality, 1);
  e.set("quality", "economy");
  e.performanceSample(60, 16.7);
  assert.equal(e.frame().quality, 0.45);
  e.reset();
  assert.equal(e.frame().quality, 1);
});
test("ranked and manual selection stay deterministic; adaptive avoids recently visited worlds", () => {
  const { e } = setup(),
    rooms = Array.from({ length: 20 }, (_, i) => ({
      id: "world-" + i,
      kind: "gl",
      family: ["organic", "fluid", "celestial", "crystalline"][i % 4],
      edition: 7,
      vigor: 0.5,
    }));
  assert.equal(e.choose(rooms, 0), 1);
  e.set("mode", "manual");
  assert.equal(e.choose(rooms, 0), 1);
  e.set("mode", "adaptive");
  for (let i = 0; i < 16; i++) e.enter(rooms[i]);
  const next = e.choose(rooms, 15);
  assert.ok(next >= 16);
  assert.notEqual(rooms[next].family, rooms[15].family);
  for (let i = 0; i < 50; i++) e.enter(rooms[i % 20]);
  assert.equal(e.getHistory().length, 32);
});
function audioSetup() {
  const s = setup(),
    stats = {
      contexts: [],
      requests: 0,
      stopped: 0,
      revoked: 0,
      loud: true,
      mode: "broad",
    };
  s.w.isSecureContext = true;
  s.w.URL = {
    createObjectURL: () => "blob:local-test",
    revokeObjectURL: () => stats.revoked++,
  };
  s.w.document = {
    getElementById: () => ({ replaceChildren() {} }),
    createElement: () => ({
      setAttribute() {},
      removeAttribute() {},
      remove() {},
      pause() {},
      load() {},
      play: () => Promise.resolve(),
    }),
  };
  class Context {
    constructor() {
      if (stats.realClock) this.currentTime = 0;
      this.sampleRate = 48000;
      this.analysers = 0;
      this.state = "running";
      stats.contexts.push(this);
    }
    resume() {
      return Promise.resolve();
    }
    close() {
      this.state = "closed";
      return Promise.resolve();
    }
    createChannelSplitter() {
      return { connect() {} };
    }
    createMediaElementSource() {
      return { connect() {}, disconnect() {} };
    }
    createMediaStreamSource() {
      return { connect() {}, disconnect() {} };
    }
    createAnalyser() {
      const id = this.analysers++;
      return {
        fftSize: 1024,
        get frequencyBinCount() {
          return this.fftSize / 2;
        },
        getByteFrequencyData(a) {
          a.fill(0);
          if (stats.loud) {
            if (stats.mode === "bass") a.fill(255, 1, 5);
            else a.fill(200);
          }
        },
        getFloatTimeDomainData(a) {
          a.fill(
            (stats.loud ? 0.12 : 0.001) * (id === 2 && !stats.mono ? 0.5 : 1),
          );
        },
      };
    }
  }
  s.w.AudioContext = Context;
  s.w.navigator.mediaDevices = {
    getUserMedia: async () => {
      stats.requests++;
      throw Object.assign(Error("denied"), { name: "NotAllowedError" });
    },
  };
  return { ...s, stats };
}
test("audio is never requested implicitly; denial closes the graph and retains internal fallback", async () => {
  const { e, stats } = audioSetup();
  e.advance(1);
  assert.equal(stats.contexts.length, 0);
  assert.equal(stats.requests, 0);
  await e.startAudio("microphone");
  assert.equal(stats.requests, 1);
  assert.equal(stats.contexts[0].state, "closed");
  assert.equal(e.signal.source, "internal");
});
test("synthetic analysis distinguishes energy, bands, stereo and a stable onset tempo; teardown releases resources", async () => {
  const { e, stats } = audioSetup();
  await e.startAudio("file", {});
  assert.equal(e.signal.source, "file");
  for (let i = 0; i < 1000; i++) {
    stats.loud = i % 50 < 12;
    e.advance(0.02);
  }
  stats.loud = true;
  e.advance(0.02);
  assert.ok(e.signal.confidence > 0.7);
  assert.equal(e.signal.tempo, 60);
  assert.ok(e.signal.onsetDensity > 0);
  assert.ok(e.signal.dynamics > 0);
  assert.equal(e.signal.stereoReliable, true);
  assert.ok(e.signal.balance < 0);
  stats.loud = true;
  stats.mode = "bass";
  for (let i = 0; i < 100; i++) e.advance(0.02);
  assert.ok(e.signal.bass > e.signal.mid);
  assert.ok(e.signal.bass > e.signal.treble);
  stats.mono = true;
  e.advance(0.02);
  assert.equal(e.signal.stereoReliable, false);
  e.stopAudio();
  assert.equal(stats.contexts[0].state, "closed");
  assert.equal(stats.revoked, 1);
  assert.equal(e.signal.source, "internal");
  assert.equal(e.signal.tempo, null);
  assert.equal(e.signal.stereoReliable, false);
});
test("stopping during a pending permission request cancels late streams", async () => {
  const { e, w, stats } = audioSetup();
  let resolve;
  w.navigator.mediaDevices.getUserMedia = () => {
    stats.requests++;
    return new Promise((r) => (resolve = r));
  };
  const pending = e.startAudio("microphone");
  await new Promise(setImmediate);
  assert.equal(stats.requests, 1);
  e.stopAudio();
  resolve({
    getTracks: () => [
      {
        stop() {
          stats.stopped++;
        },
      },
    ],
  });
  await pending;
  assert.equal(stats.stopped, 1);
  assert.equal(stats.contexts[0].state, "closed");
  assert.equal(e.signal.source, "internal");
});

test("tempo uses the audio clock, not the slowed animation clock", async () => {
  const { e, stats } = audioSetup();
  stats.realClock = true;
  await e.startAudio("file", {});
  const ctx = stats.contexts[0];
  for (let i = 0; i < 1000; i++) {
    ctx.currentTime += 0.02;
    stats.loud = i % 50 < 12;
    e.advance(0.005);
  }
  assert.equal(e.signal.tempo, 60);
  assert.ok(e.signal.confidence > 0.7);
  e.stopAudio();
});

test("recent compositions are bounded, inspectable copies, and never persisted", () => {
  const { e, store } = setup();
  for (let i = 0; i < 20; i++)
    e.enter({
      id: "world-" + i,
      kind: "gl",
      family: "organic",
      tag: "growing lattice",
      paletteGroup: "gold/cyan",
      motionClass: "growth",
    });
  const recent = e.getRecent();
  assert.equal(recent.length, 16);
  assert.equal(recent[0].palette, "gold/cyan");
  assert.equal(recent[0].intensity, 0.65);
  recent[0].palette = "modified";
  assert.equal(e.getRecent()[0].palette, "gold/cyan");
  e.setConsent(true);
  assert.deepEqual(
    Object.keys(JSON.parse(store.get("cabinet-experience-v1"))).sort(),
    ["likes", "saved", "settings"],
  );
  e.reset();
  assert.equal(e.getRecent().length, 0);
});
