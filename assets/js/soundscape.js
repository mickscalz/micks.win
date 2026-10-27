/* Local, opt-in procedural ambience. No microphone, samples, downloads or saved
   settings. One bounded graph, continuous parameter ramps across world changes. */
(function (w, d) {
  "use strict";
  let ctx = null,
    master = null,
    analyser = null,
    voices = [],
    filters = [],
    panners = [],
    generation = 0,
    enabled = false,
    pending = false,
    volume = 0.35,
    ducked = false,
    world = null;
  const hash = (s) => {
    let n = 2166136261;
    for (const c of s || "horizon") {
      n ^= c.charCodeAt(0);
      n = Math.imul(n, 16777619);
    }
    return n >>> 0;
  };
  function ui(message) {
    const b = d.getElementById("ambientToggle");
    if (b) {
      b.textContent = enabled ? "sound · off" : "sound · on";
      b.setAttribute("aria-pressed", String(enabled));
      b.setAttribute(
        "aria-label",
        "Turn atmospheric sound " + (enabled ? "off" : "on"),
      );
    }
    const t = d.getElementById("ambientStatus");
    if (t)
      t.textContent =
        message ||
        (enabled
          ? "Atmosphere on · " +
            (world?.name || "this world") +
            (ducked ? " · lowered beneath your audio" : "")
          : "Atmosphere off · tap sound on to hear this world.");
  }
  function ramp(param, value, seconds = 4) {
    if (!ctx) return;
    param.cancelScheduledValues(ctx.currentTime);
    param.setTargetAtTime(value, ctx.currentTime, seconds);
  }
  function gain() {
    ramp(master?.gain, enabled ? volume * (ducked ? 0.18 : 1) * 0.7 : 0, 0.12);
  }
  function profile(input) {
    const h = hash(input?.id),
      g = input?.genome || {},
      words = (input?.tag || "") + " " + (input?.family || "");
    return {
      root: [48, 50, 53, 55, 57, 60, 62, 65][h % 8],
      wet: g.water
        ? g.water !== "dry"
        : /sea|ocean|water|tide|rain|river/i.test(words),
      wind: 0.3 + (h % 71) / 100,
      bright: g.sky === "aurora" || /cosmic|aurora|light/i.test(words),
      phase: (h % 31) / 31,
    };
  }
  function enter(input) {
    world = input;
    if (!ctx || !enabled) {
      ui();
      return;
    }
    const p = profile(input);
    // A chord drone, wind and low water/shore band. All ramps remain continuous;
    // no per-world allocation or bank accumulation during rapid gallery travel.
    [0, 7, 12, 19].forEach((n, i) => {
      ramp(voices[i].frequency, 440 * Math.pow(2, (p.root + n - 69) / 12), 2.5);
      ramp(panners[i].pan, Math.sin(p.phase * 6 + i * 1.7) * 0.55, 3);
    });
    ramp(filters[0].frequency, 180 + p.wind * 520, 3);
    ramp(filters[1].frequency, p.wet ? 1050 : 420, 3);
    ramp(filters[1].Q, p.wet ? 0.8 : 0.4, 3);
    ramp(voices[4].gain, p.wet ? 0.19 : 0.055, 3);
    ramp(filters[2].frequency, p.bright ? 1800 : 950, 3);
    ui();
  }
  async function stop() {
    generation++;
    pending = false;
    enabled = false;
    const old = ctx;
    ctx = null;
    master = null;
    analyser = null;
    voices = [];
    filters = [];
    panners = [];
    ui();
    if (old && old.state !== "closed")
      try {
        await old.close();
      } catch (_) {}
  }
  async function start() {
    if (pending) return;
    if (enabled) {
      if (ctx?.state === "suspended") await ctx.resume();
      return;
    }
    pending = true;
    const epoch = ++generation;
    try {
      const Audio = w.AudioContext || w.webkitAudioContext;
      if (!Audio) throw Error("Web Audio is unavailable in this browser");
      const next = new Audio();
      ctx = next;
      // resume() is invoked directly in the click's task, before any await.
      const unlocked = next.resume();
      const compressor = next.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.02;
      compressor.release.value = 0.6;
      master = next.createGain();
      master.gain.value = 0;
      analyser = next.createAnalyser();
      analyser.fftSize = 1024;
      master.connect(compressor);
      compressor.connect(analyser);
      analyser.connect(next.destination);
      const tone = next.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.value = 1100;
      tone.Q.value = 0.4;
      tone.connect(master);
      filters[2] = tone;
      for (let i = 0; i < 4; i++) {
        const o = next.createOscillator(),
          v = next.createGain(),
          pan = next.createStereoPanner(),
          lfo = next.createOscillator(),
          depth = next.createGain();
        o.type = "sine";
        o.frequency.value = 130 + i * 55;
        v.gain.value = 0.07;
        pan.pan.value = (i - 1.5) * 0.3;
        lfo.frequency.value = 0.017 + i * 0.009;
        depth.gain.value = 0.018;
        lfo.connect(depth);
        depth.connect(v.gain);
        o.connect(v);
        v.connect(pan);
        pan.connect(tone);
        o.start();
        lfo.start();
        voices.push(o);
        panners.push(pan);
      }
      // Deterministic seamless filtered noise. Cross-fade the buffer seam rather than
      // restarting a short sample on every swell (which causes clicks).
      const length = Math.ceil(next.sampleRate * 12),
        buffer = next.createBuffer(1, length, next.sampleRate),
        data = buffer.getChannelData(0);
      let seed = 87321,
        brown = 0;
      for (let i = 0; i < length; i++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        brown = (brown + ((seed / 4294967296) * 2 - 1) * 0.035) / 1.02;
        data[i] = brown * 3;
      }
      const seam = Math.min(2048, length / 4);
      for (let i = 0; i < seam; i++) {
        const a = i / seam;
        data[length - seam + i] =
          data[length - seam + i] * (1 - a) + data[i] * a;
      }
      const noise = next.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      noise.loopStart = seam / next.sampleRate;
      noise.loopEnd = length / next.sampleRate;
      for (let i = 0; i < 2; i++) {
        const f = next.createBiquadFilter(),
          v = next.createGain(),
          lfo = next.createOscillator(),
          depth = next.createGain();
        f.type = i ? "bandpass" : "lowpass";
        f.frequency.value = i ? 1000 : 350;
        f.Q.value = 0.6;
        v.gain.value = i ? 0.15 : 0.32;
        lfo.frequency.value = i ? 0.071 : 0.029;
        depth.gain.value = i ? 0.06 : 0.1;
        lfo.connect(depth);
        depth.connect(v.gain);
        noise.connect(f);
        f.connect(v);
        v.connect(master);
        lfo.start();
        filters[i] = f;
        if (i) voices[4] = v;
      }
      noise.start();
      await unlocked;
      if (epoch !== generation || ctx !== next) {
        if (next.state !== "closed") await next.close();
        return;
      }
      if (next.state !== "running")
        throw Error("Audio is suspended; tap sound on again");
      pending = false;
      enabled = true;
      enter(world);
      gain();
    } catch (e) {
      if (epoch !== generation) return;
      await stop();
      ui(
        "Could not start atmosphere: " + e.message + ". Tap sound on to retry.",
      );
    }
  }
  function sample() {
    if (!analyser) return { rms: 0, state: ctx?.state || "off" };
    const b = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(b);
    return {
      rms: Math.sqrt(b.reduce((s, x) => s + x * x, 0) / b.length),
      state: ctx.state,
    };
  }
  function duck(value) {
    ducked = !!value;
    if (master) gain();
    ui();
  }
  function mount() {
    d.getElementById("ambientToggle").onclick = () =>
      enabled || pending ? stop() : start();
    d.getElementById("ambientVolume").oninput = (e) => {
      volume = Math.max(0, Math.min(1, Number(e.target.value)));
      if (master) gain();
    };
    d.addEventListener("visibilitychange", () => {
      if (!ctx || !enabled) return;
      const next = ctx;
      const task = d.hidden ? next.suspend() : next.resume();
      task.catch(() => ui("Atmosphere suspended · toggle sound to resume."));
    });
    w.addEventListener("pagehide", stop);
    ui();
  }
  w.Soundscape = {
    start,
    stop,
    enter,
    duck,
    profile,
    sample,
    get enabled() {
      return enabled;
    },
  };
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", mount);
  else mount();
})(window, document);
