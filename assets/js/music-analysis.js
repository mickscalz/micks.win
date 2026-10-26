/* Bounded PCM-WAV features. Worker-only in browser; pure exports for fixtures. */
(function (root) {
  "use strict";
  function parse(buffer) {
    if (
      !(buffer instanceof ArrayBuffer) ||
      buffer.byteLength > 33554432 ||
      buffer.byteLength < 44
    )
      throw Error("Choose an uncompressed PCM WAV up to 32 MiB");
    const d = new DataView(buffer),
      tag = (i) => String.fromCharCode(...new Uint8Array(buffer, i, 4));
    if (tag(0) !== "RIFF" || tag(8) !== "WAVE")
      throw Error(
        "Look-ahead supports PCM WAV only; other formats still play with real-time analysis",
      );
    let fmt = null,
      data = null;
    for (let i = 12; i + 8 <= d.byteLength;) {
      const n = d.getUint32(i + 4, true),
        start = i + 8;
      if (start + n > d.byteLength) throw Error("Truncated WAV chunk");
      if (tag(i) === "fmt ") {
        if (n < 16) throw Error("Invalid WAV format");
        fmt = {
          code: d.getUint16(start, true),
          channels: d.getUint16(start + 2, true),
          rate: d.getUint32(start + 4, true),
          align: d.getUint16(start + 12, true),
          bits: d.getUint16(start + 14, true),
        };
      }
      if (tag(i) === "data" && !data) data = { start, size: n };
      i = start + n + (n % 2);
    }
    if (
      !fmt ||
      !data ||
      ![1, 2].includes(fmt.channels) ||
      fmt.rate < 8000 ||
      fmt.rate > 192000 ||
      !(
        (fmt.code === 1 && fmt.bits === 16) ||
        (fmt.code === 3 && fmt.bits === 32)
      ) ||
      fmt.align !== (fmt.channels * fmt.bits) / 8 ||
      data.size % fmt.align
    )
      throw Error("Supported WAV: mono/stereo PCM16 or float32, 8–192 kHz");
    const frames = data.size / fmt.align,
      duration = frames / fmt.rate;
    if (!frames || duration > 600)
      throw Error("Look-ahead limit: 10 minutes and 32 MiB");
    return { ...fmt, ...data, frames, duration, view: d };
  }
  function sample(w, index, channel = null) {
    if (index < 0 || index >= w.frames) return 0;
    let v = 0;
    for (
      let c = channel === null ? 0 : channel;
      c < (channel === null ? w.channels : channel + 1);
      c++
    ) {
      const p = w.start + index * w.align + (c * w.bits) / 8,
        x =
          w.code === 1
            ? w.view.getInt16(p, true) / 32768
            : w.view.getFloat32(p, true);
      if (!Number.isFinite(x)) throw Error("Non-finite PCM sample");
      v += Math.max(-1, Math.min(1, x)) / (channel === null ? w.channels : 1);
    }
    return v;
  }
  function power(w, index) {
    let p = 0;
    for (let c = 0; c < w.channels; c++) {
      const x = sample(w, index, c);
      p += (x * x) / w.channels;
    }
    return p;
  }
  function spectrum(w, start, N) {
    const result = new Float64Array(N / 2);
    for (let c = 0; c < w.channels; c++) {
      const m = channelSpectrum(w, start, N, c);
      for (let i = 0; i < m.length; i++) result[i] += m[i] / w.channels;
    }
    return result;
  }
  function channelSpectrum(w, start, N, channel) {
    const re = new Float64Array(N),
      im = new Float64Array(N);
    for (let i = 0; i < N; i++)
      re[i] =
        sample(w, start + i, channel) *
        (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)));
    for (let i = 1, j = 0; i < N; i++) {
      let bit = N >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) {
        const t = re[i];
        re[i] = re[j];
        re[j] = t;
      }
    }
    for (let n = 2; n <= N; n <<= 1) {
      const a = (-2 * Math.PI) / n;
      for (let i = 0; i < N; i += n)
        for (let j = 0; j < n / 2; j++) {
          const c = Math.cos(a * j),
            s = Math.sin(a * j),
            k = i + j + n / 2,
            tr = re[k] * c - im[k] * s,
            ti = re[k] * s + im[k] * c;
          re[k] = re[i + j] - tr;
          im[k] = im[i + j] - ti;
          re[i + j] += tr;
          im[i + j] += ti;
        }
    }
    const mag = new Float64Array(N / 2);
    for (let i = 1; i < mag.length; i++) mag[i] = Math.hypot(re[i], im[i]);
    return mag;
  }
  function tempo(envelope) {
    if (envelope.length < 120 || Math.max(...envelope) < 0.0001)
      return { bpm: null, confidence: 0 };
    let best = 0,
      lag = 0;
    for (let k = 5; k <= 30; k++) {
      let dot = 0,
        a = 0,
        b = 0;
      for (let i = k; i < envelope.length; i++) {
        dot += envelope[i] * envelope[i - k];
        a += envelope[i] ** 2;
        b += envelope[i - k] ** 2;
      }
      const c = dot / Math.sqrt(a * b || 1);
      if (c > best + 1e-6) {
        best = c;
        lag = k;
      }
    }
    let peaks = 0;
    for (let i = 1; i < envelope.length - 1; i++)
      if (
        envelope[i] > 0.002 &&
        envelope[i] > envelope[i - 1] &&
        envelope[i] >= envelope[i + 1]
      )
        peaks++;
    return {
      bpm: best > 0.65 && peaks >= 6 ? 1200 / lag : null,
      confidence: Math.min(1, best) * (peaks >= 6 ? 1 : 0),
    };
  }
  function analyze(buffer, progress = () => {}) {
    const w = parse(buffer),
      rows = [],
      envelope = [];
    let previousRMS = 0,
      previousChroma = null,
      previousEnergy = 0;
    for (let i = 0; i < w.frames; i += Math.max(1, Math.round(w.rate * 0.05))) {
      let sum = 0,
        count = 0;
      const end = Math.min(w.frames, i + Math.round(w.rate * 0.05));
      for (let j = i; j < end; j++) {
        sum += power(w, j);
        count++;
      }
      const rms = Math.sqrt(sum / Math.max(1, count));
      envelope.push(Math.max(0, rms - previousRMS));
      previousRMS = rms;
    }
    for (let time = 0; time < w.duration; time += 0.5) {
      const start = Math.floor(time * w.rate),
        lo = spectrum(w, start, 4096),
        hi = spectrum(w, start, 1024),
        chroma = Array(12).fill(0);
      let sum = 0,
        weighted = 0,
        logs = 0,
        rolloff = 0,
        squares = 0;
      for (
        let i = 0;
        i < Math.min(w.frames - start, Math.round(w.rate * 0.5));
        i++
      ) {
        squares += power(w, start + i);
      }
      for (let i = 1; i < lo.length; i++) {
        const hz = (i * w.rate) / 4096,
          m = lo[i];
        sum += m;
        weighted += m * hz;
        logs += Math.log(m + 1e-12);
        if (hz >= 55 && hz < 5000) {
          const pitch = Math.round(69 + 12 * Math.log2(hz / 440));
          chroma[((pitch % 12) + 12) % 12] += m;
        }
      }
      let accumulated = 0;
      for (let i = 1; i < lo.length; i++) {
        accumulated += lo[i];
        if (accumulated >= sum * 0.85) {
          rolloff = (i * w.rate) / 4096;
          break;
        }
      }
      const max = Math.max(...chroma) || 1;
      for (let i = 0; i < 12; i++) chroma[i] /= max;
      const rms = Math.sqrt(
        squares /
          Math.max(1, Math.min(w.frames - start, Math.round(w.rate * 0.5))),
      );
      let distance = 0;
      if (previousChroma) {
        let dot = 0,
          a = 0,
          b = 0;
        for (let i = 0; i < 12; i++) {
          dot += chroma[i] * previousChroma[i];
          a += chroma[i] ** 2;
          b += previousChroma[i] ** 2;
        }
        distance = a * b > 1e-10 ? 1 - dot / Math.sqrt(a * b) : 0;
      }
      let bright = 0,
        total = 0;
      for (let i = 1; i < hi.length; i++) {
        total += hi[i];
        if ((i * w.rate) / 1024 > 2500) bright += hi[i];
      }
      rows.push({
        time,
        rms,
        centroid: sum ? weighted / sum : 0,
        rolloff,
        flatness: sum
          ? Math.min(
              1,
              Math.exp(logs / (lo.length - 1)) / (sum / (lo.length - 1)),
            )
          : 0,
        chroma,
        brightness: total ? bright / total : 0,
        novelty: previousChroma
          ? Math.min(
              1,
              Math.max(0, distance) * 0.7 + Math.abs(rms - previousEnergy) * 2,
            )
          : 0,
      });
      previousChroma = chroma;
      previousEnergy = rms;
      if (rows.length % 40 === 0)
        progress(Math.round((time / w.duration) * 100));
    }
    const sorted = rows.map((r) => r.rms).sort((a, b) => a - b),
      scale = sorted[Math.floor(sorted.length * 0.95)] || 1,
      changes = [];
    let last = -10;
    for (let i = 1; i < rows.length - 1; i++) {
      const r = rows[i];
      r.energy = Math.min(1, r.rms / scale);
      if (
        r.novelty > 0.18 &&
        r.novelty > rows[i - 1].novelty &&
        r.novelty >= rows[i + 1].novelty &&
        r.time - last >= 6
      ) {
        changes.push({ time: r.time, strength: r.novelty });
        last = r.time;
      }
    }
    if (rows.length) {
      rows[0].energy = Math.min(1, rows[0].rms / scale);
      rows.at(-1).energy = Math.min(1, rows.at(-1).rms / scale);
    }
    return {
      version: 1,
      duration: w.duration,
      step: 0.5,
      rows,
      changes: changes.slice(0, 64),
      ...tempo(envelope),
    };
  }
  if (typeof module !== "undefined")
    module.exports = { parse, sample, spectrum, tempo, analyze };
  else
    root.onmessage = (e) => {
      try {
        const result = analyze(e.data.buffer, (p) =>
          root.postMessage({ progress: p }),
        );
        root.postMessage({ result });
      } catch (error) {
        root.postMessage({ error: error.message });
      }
    };
})(typeof self !== "undefined" ? self : globalThis);
