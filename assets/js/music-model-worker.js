/* Spotify Basic Pitch 1.0.1, Apache-2.0; single-thread WASM backend.
   Worker lifetime bounds tensor/cache retention; no microphone or network audio. */
"use strict";
let used = false;
self.onmessage = async ({ data: { samples } }) => {
  if (used) return;
  used = true;
  try {
    if (
      !(samples instanceof Float32Array) ||
      samples.length < 2205 ||
      samples.length > 88200 ||
      samples.some((x) => !Number.isFinite(x) || Math.abs(x) > 1)
    )
      throw Error("Invalid note-model excerpt");
    postMessage({
      progress:
        "Loading local Basic Pitch model/runtime (~2.7 MiB; no upload)…",
    });
    importScripts("../vendor/basic-pitch/runtime.min.js");
    const { tf, BasicPitch, setWasmPaths, setThreadsCount } =
      self.BasicPitchRuntime;
    const base = new URL("../vendor/basic-pitch/", self.location.href).href;
    setThreadsCount(1);
    setWasmPaths(base);
    await tf.setBackend("wasm");
    await tf.ready();
    const bp = new BasicPitch(base + "model.json");
    await bp.model;
    const duration = samples.length / 22050,
      bins = Array.from({ length: Math.ceil(duration / 0.5) }, (_, i) => ({
        time: i * 0.5,
        count: 0,
        values: new Float64Array(88),
      }));
    let index = 0;
    await bp.evaluateModel(
      samples,
      (frames) => {
        for (const frame of frames) {
          const bin =
            bins[Math.min(bins.length - 1, Math.floor(index / 86 / 0.5))];
          index++;
          bin.count++;
          for (let k = 0; k < 88; k++) {
            const value = frame[k];
            if (!Number.isFinite(value) || value < 0 || value > 1.0001)
              throw Error("Invalid neural activation");
            bin.values[k] += value;
          }
        }
      },
      (p) =>
        postMessage({
          progress:
            "Basic Pitch local inference " +
            Math.round(p * 100) +
            "% · estimates, not verified notes",
        }),
    );
    const rows = bins.map((b) => {
      const notes = Array.from(b.values, (value, k) => ({
        midi: k + 21,
        activation: value / Math.max(1, b.count),
      }))
        .sort((a, b) => b.activation - a.activation)
        .slice(0, 4);
      return { time: b.time, activity: notes[0].activation, notes };
    });
    (await bp.model).dispose();
    postMessage({
      result: {
        model: "Spotify Basic Pitch 1.0.1",
        duration,
        step: 0.5,
        channel: "strongest-energy channel",
        rows,
      },
    });
  } catch (error) {
    postMessage({
      error: "Note model: " + (error.message || "inference failed"),
    });
  }
};
