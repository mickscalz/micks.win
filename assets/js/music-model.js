/* Explicit opt-in, pinned Basic Pitch inference. No model or weights load here. */
(function (root) {
  "use strict";
  const workerURL =
    typeof document !== "undefined"
      ? new URL("music-model-worker.js?v=11", document.currentScript.src)
      : "music-model-worker.js";
  function excerpt(buffer, analysis) {
    const wav = analysis.parse(buffer),
      seconds = Math.min(4, wav.duration),
      n = Math.floor(seconds * 22050);
    if (n < 2205) throw Error("Note model needs at least 0.1 seconds");
    let channel = 0,
      energy = -1;
    for (let c = 0; c < wav.channels; c++) {
      let power = 0;
      for (let i = 0; i < Math.floor(seconds * wav.rate); i++)
        power += analysis.sample(wav, i, c) ** 2;
      if (power > energy) {
        channel = c;
        energy = power;
      }
    }
    const samples = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const position = (i * wav.rate) / 22050,
        a = Math.floor(position),
        fraction = position - a;
      samples[i] =
        analysis.sample(wav, a, channel) * (1 - fraction) +
        analysis.sample(wav, Math.min(wav.frames - 1, a + 1), channel) *
          fraction;
    }
    return samples;
  }
  function start(
    samples,
    { WorkerClass = root.Worker, progress = () => {}, timeout = 60000 } = {},
  ) {
    let worker,
      timer,
      done = false,
      resolve,
      reject;
    const promise = new Promise((a, b) => {
      resolve = a;
      reject = b;
    });
    function finish(error, result) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      worker?.terminate();
      worker = null;
      if (error) reject(error);
      else resolve(result);
    }
    const job = {
      promise,
      cancel: () => finish(Error("Note model cancelled and terminated")),
    };
    try {
      if (
        !(samples instanceof Float32Array) ||
        samples.length < 2205 ||
        samples.length > 88200 ||
        samples.some((x) => !Number.isFinite(x) || Math.abs(x) > 1)
      )
        throw Error(
          "Note model accepts at most 4 seconds of finite 22.05 kHz mono",
        );
      worker = new WorkerClass(workerURL);
      timer = setTimeout(
        () =>
          finish(
            Error("Note model exceeded 60-second budget; worker terminated"),
          ),
        timeout,
      );
      worker.onerror = () =>
        finish(
          Error(
            "Note model unavailable; ordinary DSP analysis remains available",
          ),
        );
      worker.onmessage = ({ data }) => {
        if (done) return;
        if (data.error) finish(Error(data.error));
        else if (data.result) finish(null, data.result);
        else if (data.progress) progress(data.progress);
      };
      worker.postMessage({ samples }, [samples.buffer]);
    } catch (error) {
      finish(error);
    }
    return job;
  }
  const api = { excerpt, start };
  if (typeof module !== "undefined") module.exports = api;
  else root.MusicModel = api;
})(typeof window !== "undefined" ? window : globalThis);
