/* Explicitly requested, locally hosted codecs. Terminating this worker stops
   scanning, decoding, resampling and its WASM instance—not just result delivery. */
"use strict";
importScripts("audio-worker-core.js?v=11");
let used = false;
self.onmessage = async ({ data }) => {
  if (used) return;
  used = true;
  let decoder;
  try {
    const { buffer } = data,
      Core = self.AudioWorkerCore;
    if (!(buffer instanceof ArrayBuffer) || buffer.byteLength > Core.ENCODED)
      throw Error("Worker encoded limit: 32 MiB");
    const codec = Core.sniff(buffer),
      out = Core.sink(),
      bytes = new Uint8Array(buffer);
    if (!codec)
      throw Error("No interruptible decoder for this container/codec");
    let lastProgress = -1;
    const report = (p) => {
      if (p === lastProgress) return;
      lastProgress = p;
      postMessage({
        progress:
          "Interruptible " +
          codec.toUpperCase() +
          " decode " +
          p +
          "% (Stop terminates this worker)",
      });
    };
    if (codec === "flac") Core.flacInfo(buffer);
    report(0);
    if (codec === "mp3") {
      const module = await import("../vendor/minimp3-wasm/minimp3-wasm.js");
      decoder = await module.createDecoder(
        bytes,
        new URL("../vendor/minimp3-wasm/decoder.opt.wasm", self.location.href),
      );
      if (
        !Number.isFinite(decoder.duration) ||
        decoder.duration <= 0 ||
        decoder.duration > Core.SECONDS
      )
        throw Error("Decoded MP3 must be within 3 minutes");
      for (let chunk = 0; chunk < Core.SECONDS + 2; chunk++) {
        const result = decoder.decode(1);
        if (!result.numSamples) break;
        const ch = result.numChannels;
        if (ch < 1 || ch > 2)
          throw Error("Only mono/stereo decoding supported");
        const frames = result.numSamples / ch,
          channels = Array.from({ length: ch }, (_, c) =>
            Float32Array.from(
              { length: frames },
              (_, i) => result.pcm[i * ch + c] / 32768,
            ),
          );
        out.push(channels, result.samplingRate);
        report(
          Math.min(99, Math.round((out.duration / decoder.duration) * 100)),
        );
      }
    } else {
      importScripts(
        "../vendor/audio-codecs/" +
          (codec === "flac" ? "flac" : "ogg-vorbis") +
          "-decoder.min.js",
      );
      decoder =
        codec === "flac"
          ? new self["flac-decoder"].FLACDecoder()
          : new self["ogg-vorbis-decoder"].OggVorbisDecoder();
      await decoder.ready;
      const push = (result) => {
        if (result.errors?.length)
          throw Error("Codec reported corrupt/unsupported frames");
        if (result.samplesDecoded)
          out.push(result.channelData, result.sampleRate);
      };
      for (let i = 0; i < bytes.length; i += 512) {
        push(await decoder.decode(bytes.subarray(i, i + 512)));
        report(Math.min(99, Math.round(((i + 512) / bytes.length) * 100)));
      }
      push(await decoder.flush());
    }
    const result = out.finish();
    decoder?.free?.();
    decoder = null;
    postMessage({ buffer: result, codec }, [result]);
  } catch (error) {
    try {
      decoder?.free?.();
    } catch (_) {}
    postMessage({ error: error.message || "Worker decoder failed" });
  }
};
