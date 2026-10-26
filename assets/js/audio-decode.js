/* Browser-native codecs, with explicit compressed/decode/output budgets.
   decodeAudioData itself is not abortable: stale results are discarded. */
(function (root) {
  "use strict";
  const LIMITS = { encoded: 33554432, duration: 180, rate: 16000, channels: 2 };
  function directPCM(buffer) {
    if (buffer.byteLength < 44) return false;
    const d = new DataView(buffer),
      tag = (i) => String.fromCharCode(...new Uint8Array(buffer, i, 4));
    if (tag(0) !== "RIFF" || tag(8) !== "WAVE") return false;
    for (let i = 12; i + 8 <= buffer.byteLength; ) {
      const n = d.getUint32(i + 4, true),
        s = i + 8;
      if (s + n > buffer.byteLength) return false;
      if (tag(i) === "fmt " && n >= 16) {
        const code = d.getUint16(s, true),
          bits = d.getUint16(s + 14, true);
        return (code === 1 && bits === 16) || (code === 3 && bits === 32);
      }
      i = s + n + (n % 2);
    }
    return false;
  }
  async function decode(
    buffer,
    {
      duration,
      Context,
      cancelled = () => false,
      progress = () => {},
      yieldTask = () => new Promise((r) => setTimeout(r, 0)),
    } = {},
  ) {
    if (buffer.byteLength > LIMITS.encoded)
      throw Error("Encoded file limit: 32 MiB");
    if (
      !Number.isFinite(duration) ||
      duration <= 0 ||
      duration > LIMITS.duration
    )
      throw Error(
        "Native-codec look-ahead needs finite metadata and a track no longer than 3 minutes. PCM WAV supports up to 10 minutes.",
      );
    if (cancelled()) throw Error("Decode cancelled");
    if (!Context)
      throw Error(
        "Native offline decoder unavailable; real-time playback still works",
      );
    progress(
      "Decoding locally (native decode cannot be interrupted; stop discards its result)…",
    );
    const ctx = new Context(2, 1, LIMITS.rate);
    let audio;
    try {
      audio = await ctx.decodeAudioData(buffer);
    } catch (_) {
      throw Error(
        "This browser cannot decode that codec for look-ahead. Real-time playback may still work.",
      );
    }
    if (cancelled()) throw Error("Decode cancelled");
    if (
      audio.numberOfChannels < 1 ||
      audio.numberOfChannels > 2 ||
      audio.sampleRate !== LIMITS.rate ||
      audio.length > LIMITS.duration * LIMITS.rate + LIMITS.rate ||
      audio.duration > LIMITS.duration + 0.1
    )
      throw Error("Decoded audio exceeds mono/stereo, 16 kHz, 3-minute budget");
    const count = audio.length,
      channels = audio.numberOfChannels,
      bytes = count * channels * 4;
    if (bytes > LIMITS.duration * LIMITS.rate * 2 * 4 + 128000)
      throw Error("Decoded output budget exceeded");
    const out = new ArrayBuffer(44 + bytes),
      d = new DataView(out),
      tag = (i, s) =>
        [...s].forEach((c, j) => d.setUint8(i + j, c.charCodeAt(0)));
    tag(0, "RIFF");
    d.setUint32(4, out.byteLength - 8, true);
    tag(8, "WAVEfmt ");
    d.setUint32(16, 16, true);
    d.setUint16(20, 3, true);
    d.setUint16(22, channels, true);
    d.setUint32(24, LIMITS.rate, true);
    d.setUint32(28, LIMITS.rate * channels * 4, true);
    d.setUint16(32, channels * 4, true);
    d.setUint16(34, 32, true);
    tag(36, "data");
    d.setUint32(40, bytes, true);
    const arrays = Array.from({ length: channels }, (_, i) =>
      audio.getChannelData(i),
    );
    for (let start = 0; start < count; start += 32768) {
      if (cancelled()) throw Error("Decode cancelled");
      const end = Math.min(count, start + 32768);
      for (let i = start; i < end; i++)
        for (let c = 0; c < channels; c++) {
          const x = arrays[c][i];
          if (!Number.isFinite(x)) throw Error("Non-finite decoded samples");
          d.setFloat32(
            44 + (i * channels + c) * 4,
            Math.max(-1, Math.min(1, x)),
            true,
          );
        }
      progress(
        "Preparing bounded decoded audio " +
          Math.round((end / count) * 100) +
          "%",
      );
      await yieldTask();
    }
    return out;
  }
  const api = { LIMITS, directPCM, decode };
  if (typeof module !== "undefined") module.exports = api;
  else root.AudioDecode = api;
})(typeof window !== "undefined" ? window : globalThis);
