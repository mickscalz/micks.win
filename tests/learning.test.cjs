const { test } = require("node:test"),
  assert = require("node:assert/strict");
const N = require("../assets/js/nursery.js"),
  P = require("../assets/js/preference-model.js"),
  Core = require("../assets/js/audio-worker-core.js"),
  D = require("../assets/js/audio-decode.js"),
  A = require("../assets/js/music-analysis.js"),
  E = require("../assets/js/nursery-evolution.js");
const p = (id) => N.founderAny({ id, name: id, kind: "gl" }),
  parents = [p("flower"), p("ocean")];
test("personal preference model learns explicit pairwise direction; duplicates do not inflate evidence", () => {
  const model = P.create(),
    a = new Array(P.labels.length).fill(0),
    b = a.slice();
  a[0] = 1;
  b[1] = 1;
  for (let i = 0; i < 3; i++)
    model.add("source:preferred-" + i, "source:other-" + i, a, b);
  assert.ok(model.predict(a) > model.predict(b) + 0.3);
  assert.equal(model.ready, true);
  assert.equal(model.count, 3);
  assert.ok(model.strength > 0 && model.strength < 1);
  const restored = P.create(model.snapshot());
  assert.equal(restored.predict(a), model.predict(a));
  assert.ok(
    model.explain().some((x) => x.feature === "shape:bloom" && x.weight > 0),
  );
  model.add("source:preferred-0", "source:other-0", a, b);
  assert.equal(model.count, 3);
  assert.equal(P.create([...model.snapshot(), ...model.snapshot()]).count, 3);
  model.add("source:other-0", "source:preferred-0", b, a);
  assert.equal(model.count, 3);
  model.clear();
  assert.equal(model.count, 0);
  assert.equal(model.predict(a), 0.5);
  assert.equal(model.ready, false);
});
test("render observations carry image properties; schema and feature budgets reject unsafe inputs", () => {
  const black = new Uint8ClampedArray(4 * 4 * 4),
    white = new Uint8ClampedArray(4 * 4 * 4).fill(255),
    a = P.pixels(black, 4, 4),
    b = P.pixels(white, 4, 4);
  assert.equal(a[0], 0);
  assert.equal(b[0], 1);
  assert.equal(a[4], 0);
  assert.equal(b[4], 1);
  assert.equal(P.features(parents[0], a).length, P.labels.length);
  assert.throws(() => P.features(parents[0], [NaN]));
  assert.throws(() => P.create(Array(129).fill({})));
  assert.throws(() =>
    P.create([{ winner: "<script>", loser: "source:x", a: [], b: [] }]),
  );
  assert.throws(() => P.create().predict(Array(500).fill(0)));
});
test("learned search evaluates actual candidates and changes survivor ranking without losing ancestry", async () => {
  let evaluated = 0,
    scored = 0;
  const result = await E.run({
    parents,
    seed: 10,
    generations: 2,
    candidates: 12,
    archive: 4,
    seconds: 60,
    now: () => 0,
    yieldTask: async () => {},
    evaluate: async () => {
      evaluated++;
    },
    learned: (p) => {
      scored++;
      return p.genome.shape === "bloom" ? 1 : 0;
    },
  });
  assert.equal(evaluated, 12);
  assert.ok(scored > 12);
  assert.equal(result.count, 12);
  N.validateAncestry([...parents, ...result.ancestry]);
  let stop = false;
  const cancelled = await E.run({
    parents,
    now: () => 0,
    evaluate: async () => {
      stop = true;
    },
    cancelled: () => stop,
  });
  assert.equal(cancelled.count, 0);
  assert.equal(cancelled.reason, "stopped");
});
test("streaming resampler preserves stereo polarity, duration and chunk boundaries; attenuates aliases", () => {
  const source = (rate) => {
    const a = Float32Array.from(
      { length: 44100 },
      (_, i) => Math.sin((i * 2 * Math.PI * rate) / 44100) * 0.7,
    );
    return [a, Float32Array.from(a, (x) => -x)];
  };
  function render(data, chunks) {
    const s = Core.sink();
    for (let i = 0; i < data[0].length; i += chunks)
      s.push(
        data.map((a) => a.subarray(i, i + chunks)),
        44100,
      );
    return s.finish();
  }
  const tone = source(440),
    whole = render(tone, 44100),
    split = render(tone, 1000);
  assert.deepEqual(new Uint8Array(whole), new Uint8Array(split));
  const w = A.parse(whole);
  assert.equal(w.rate, 16000);
  assert.equal(w.channels, 2);
  assert.equal(w.duration, 1);
  assert.ok(Math.abs(A.sample(w, 100, 0) + A.sample(w, 100, 1)) < 1e-6);
  const rms = (buf) => {
    const w = A.parse(buf);
    let v = 0;
    for (let i = 100; i < w.frames - 100; i++) v += A.sample(w, i, 0) ** 2;
    return Math.sqrt(v / (w.frames - 200));
  };
  assert.ok(rms(whole) > 0.45);
  assert.ok(rms(render(source(14000), 1500)) < 0.02, "anti-alias filter");
  const sink = Core.sink();
  assert.throws(() => sink.push([new Float32Array([NaN])], 16000));
  assert.throws(() =>
    Core.sink().push(Array(3).fill(new Float32Array(1)), 16000),
  );
  assert.throws(() => Core.sink().finish());
});
test("worker container sniffing and termination settle once, reject late output and enforce timeouts", async () => {
  const bytes = () => new Uint8Array([73, 68, 51, 0, 0, 0, 0, 0, 0, 0]).buffer;
  assert.equal(Core.sniff(bytes()), "mp3");
  assert.equal(Core.sniff(new TextEncoder().encode("fLaCxxxx").buffer), "flac");
  assert.equal(Core.sniff(new ArrayBuffer(64)), null);
  let instance,
    terminated = 0;
  class Worker {
    constructor() {
      instance = this;
    }
    postMessage() {}
    terminate() {
      terminated++;
    }
  }
  const a = D.startWorker(bytes(), { WorkerClass: Worker });
  a.cancel();
  instance.onmessage({ data: { buffer: new ArrayBuffer(50) } });
  await assert.rejects(a.promise, /terminated/);
  assert.equal(terminated, 1);
  const b = D.startWorker(bytes(), { WorkerClass: Worker, timeout: 5 });
  await assert.rejects(b.promise, /time budget/);
  assert.equal(terminated, 2);
  const c = D.startWorker(bytes(), { WorkerClass: Worker });
  instance.onmessage({ data: { error: "corrupt" } });
  await assert.rejects(c.promise, /corrupt/);
  assert.equal(terminated, 3);
});
const M = require("../assets/js/music-model.js");
test("note model input bounds, stronger-channel excerpt and cancellation are explicit", async () => {
  // Reuse an actual bounded worker-generated WAV; opposite channels must not cancel.
  const sink = Core.sink(),
    a = Float32Array.from(
      { length: 16000 },
      (_, i) => 0.4 * Math.sin((i * 2 * Math.PI * 440) / 16000),
    );
  sink.push([a, Float32Array.from(a, (x) => -x)], 16000);
  const excerpt = M.excerpt(sink.finish(), A);
  assert.equal(excerpt.length, 22050);
  assert.ok(Math.max(...excerpt) > 0.35);
  let terminated = 0,
    instance;
  class Worker {
    constructor() {
      instance = this;
    }
    postMessage() {}
    terminate() {
      terminated++;
    }
  }
  const bad = M.start(new Float32Array(88201), { WorkerClass: Worker });
  await assert.rejects(bad.promise, /4 seconds/);
  assert.equal(terminated, 0);
  const job = M.start(excerpt, { WorkerClass: Worker });
  job.cancel();
  instance.onmessage({ data: { result: {} } });
  await assert.rejects(job.promise, /terminated/);
  assert.equal(terminated, 1);
});

test("FLAC STREAMINFO preflight checks actual declared rate/channels/duration before decoding", () => {
  const fs = require("node:fs"),
    file = fs.readFileSync("tests/fixtures/local-tone.flac"),
    buffer = file.buffer.slice(
      file.byteOffset,
      file.byteOffset + file.byteLength,
    ),
    info = Core.flacInfo(buffer);
  assert.equal(info.rate, 16000);
  assert.equal(info.channels, 1);
  assert.equal(info.duration, 2.5);
  new DataView(buffer).setUint32(22, 16000 * 180 + 1, false);
  assert.throws(() => Core.flacInfo(buffer), /budget/);
});
