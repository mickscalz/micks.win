/* Bounded streaming sink shared by the terminable worker and regression tests. */
(function (root) {
  "use strict";
  const RATE = 16000,
    SECONDS = 180,
    ENCODED = 33554432;
  function sniff(buffer) {
    const a = new Uint8Array(buffer),
      text = (i, n) => String.fromCharCode(...a.subarray(i, i + n));
    if (text(0, 4) === "fLaC") return "flac";
    if (text(0, 4) === "OggS" && text(0, 512).includes("vorbis"))
      return "vorbis";
    if (text(0, 3) === "ID3") return "mp3";
    for (let i = 0; i < Math.min(a.length - 1, 4096); i++)
      if (
        a[i] === 255 &&
        (a[i + 1] & 0xe0) === 0xe0 &&
        (a[i + 1] & 6) !== 0 &&
        (a[i + 1] & 24) !== 8
      )
        return "mp3";
    return null;
  }
  function flacInfo(buffer) {
    const a = new Uint8Array(buffer);
    if (
      a.length < 42 ||
      String.fromCharCode(...a.subarray(0, 4)) !== "fLaC" ||
      (a[4] & 127) !== 0 ||
      a[5] !== 0 ||
      a[6] !== 0 ||
      a[7] !== 34
    )
      throw Error("Invalid FLAC STREAMINFO");
    const rate = a[18] * 4096 + a[19] * 16 + (a[20] >>> 4),
      channels = ((a[20] >>> 1) & 7) + 1,
      total =
        (a[21] & 15) * 4294967296 + new DataView(buffer).getUint32(22, false);
    if (rate < 8000 || rate > 192000 || channels > 2 || total > rate * SECONDS)
      throw Error("FLAC STREAMINFO exceeds mono/stereo/rate/3-minute budget");
    return {
      rate,
      channels,
      frames: total,
      duration: total ? total / rate : null,
    };
  }
  function sink() {
    let rate = 0,
      channels = 0,
      total = 0,
      written = 0,
      history = [],
      output,
      coeffs;
    const half = 16,
      phases = 64;
    function initialize(r, c) {
      if (!Number.isInteger(r) || r < 8000 || r > 192000 || c < 1 || c > 2)
        throw Error("Worker decoder supports mono/stereo, 8–192 kHz");
      rate = r;
      channels = c;
      output = new Float32Array(RATE * SECONDS * c);
      history = Array.from({ length: c }, () => new Float32Array(0));
      const cutoff = Math.min(1, RATE / r) * 0.94;
      coeffs = Array.from({ length: phases }, (_, phase) => {
        const row = [];
        let sum = 0;
        for (let tap = 0; tap < half * 2; tap++) {
          const x = tap - half + 1 - phase / phases,
            v =
              (Math.abs(x) < 1e-8
                ? cutoff
                : Math.sin(Math.PI * cutoff * x) / (Math.PI * x)) *
              (0.5 + 0.5 * Math.cos((Math.PI * x) / half));
          row.push(v);
          sum += v;
        }
        return row.map((v) => v / sum);
      });
    }
    function process(data, flush = false) {
      if (!rate) return;
      const frames = data[0].length,
        tail = history[0].length,
        base = total - tail,
        arrays = data.map((a, c) => {
          const v = new Float32Array(tail + frames);
          v.set(history[c]);
          for (let i = 0; i < a.length; i++) {
            if (!Number.isFinite(a[i]))
              throw Error("Non-finite decoded samples");
            v[tail + i] = Math.max(-1, Math.min(1, a[i]));
          }
          return v;
        });
      total += frames;
      if (total / rate > SECONDS + 0.00001)
        throw Error("Worker decoded duration exceeds 3 minutes");
      for (;;) {
        const position = (written * rate) / RATE,
          center = Math.floor(position);
        if (flush ? position >= total : center + half >= total) break;
        if (written >= RATE * SECONDS)
          throw Error("Worker output budget exceeded");
        const row =
          coeffs[
            Math.min(phases - 1, Math.floor((position - center) * phases))
          ];
        for (let c = 0; c < channels; c++) {
          let value = 0;
          for (let tap = 0; tap < half * 2; tap++) {
            const index =
              Math.max(0, Math.min(total - 1, center + tap - half + 1)) - base;
            if (index < 0 || index >= arrays[c].length)
              throw Error("Resampler history budget");
            value += arrays[c][index] * row[tap];
          }
          output[written * channels + c] = Math.max(-1, Math.min(1, value));
        }
        written++;
      }
      history = arrays.map((a) =>
        a.slice(Math.max(0, a.length - half * 2 - 2)),
      );
    }
    return {
      push(data, sampleRate) {
        if (
          !Array.isArray(data) ||
          !data.length ||
          data.some(
            (a) => !(a instanceof Float32Array) || a.length !== data[0].length,
          )
        )
          throw Error("Invalid worker PCM");
        if (!data[0].length) return;
        if (!rate) initialize(sampleRate, data.length);
        if (rate !== sampleRate || channels !== data.length)
          throw Error("Changing channel count/sample rate unsupported");
        process(data);
      },
      finish() {
        if (!rate || !total) throw Error("No decodable audio frames");
        process(
          Array.from({ length: channels }, () => new Float32Array()),
          true,
        );
        const buffer = new ArrayBuffer(44 + written * channels * 4),
          d = new DataView(buffer),
          tag = (i, s) =>
            [...s].forEach((c, j) => d.setUint8(i + j, c.charCodeAt(0)));
        tag(0, "RIFF");
        d.setUint32(4, buffer.byteLength - 8, true);
        tag(8, "WAVEfmt ");
        d.setUint32(16, 16, true);
        d.setUint16(20, 3, true);
        d.setUint16(22, channels, true);
        d.setUint32(24, RATE, true);
        d.setUint32(28, RATE * channels * 4, true);
        d.setUint16(32, channels * 4, true);
        d.setUint16(34, 32, true);
        tag(36, "data");
        d.setUint32(40, buffer.byteLength - 44, true);
        for (let i = 0; i < written * channels; i++)
          d.setFloat32(44 + i * 4, output[i], true);
        output = null;
        history = [];
        return buffer;
      },
      get duration() {
        return rate ? total / rate : 0;
      },
    };
  }
  const api = { RATE, SECONDS, ENCODED, sniff, sink, flacInfo };
  if (typeof module !== "undefined") module.exports = api;
  else root.AudioWorkerCore = api;
})(typeof self !== "undefined" ? self : globalThis);
