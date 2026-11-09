/* Opt-in, world-scored atmospheric music. One bounded reusable graph; no samples,
   microphone, downloads, storage, timers or per-note node allocation. */
(function (w, d) {
  "use strict";
  const Score = w.SoundscapeScore;
  let ctx = null,
    master = null,
    analyser = null,
    enabled = false,
    pending = false,
    generation = 0,
    volume = 0.35,
    ducked = false,
    calmer = false,
    world = null,
    mode = "auto",
    p = null,
    held = false,
    origin = null,
    lastBeat = -1,
    lastControl = -Infinity,
    notesPlayed = 0,
    pads = [],
    notes = [],
    noises = [],
    space = null,
    createdNodes = 0;
  const frequency = (m) =>
    440 * Math.pow(2, (Math.max(24, Math.min(96, m)) - 69) / 12);
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
    const fp = d.getElementById("ambientFingerprint");
    if (fp)
      fp.textContent = p
        ? Score.describe(p) +
          " · colour → harmonic register/tone; movement → phrasing/pan; material → texture."
        : "";
  }
  function ramp(param, value, seconds = 0.8) {
    if (!ctx || !param) return;
    param.cancelScheduledValues(ctx.currentTime);
    param.setTargetAtTime(value, ctx.currentTime, seconds);
  }
  function gain() {
    ramp(
      master?.gain,
      enabled ? volume * (ducked ? 0.18 : 1) * (calmer ? 0.5 : 1) * 0.7 : 0,
      0.08,
    );
  }
  function profile(input, override = mode) {
    return Score.profile(input, override);
  }
  function chord(index = 0) {
    if (!ctx || !p) return;
    const degree = p.chords[Math.floor(index / 16) % 4];
    pads.forEach((v, i) => {
      const n = degree + i * 2;
      const midi =
        p.root +
        p.scale[n % p.scale.length] +
        12 * Math.floor(n / p.scale.length);
      ramp(v.osc.frequency, frequency(midi), 2);
      ramp(v.partial.frequency, frequency(midi + 12), 2);
      ramp(v.gain.gain, p.pad * (i === 0 ? 1 : 0.65), 1);
      ramp(
        v.partialGain.gain,
        p.pad * (0.05 + p.sparkle * 0.2) * (1 - p.warmth * 0.35),
        1,
      );
      ramp(v.pan.pan, Math.sin(p.phase * 6 + i * 1.7) * p.width, 2);
      ramp(v.filter.frequency, p.cutoff, 2);
      ramp(
        v.rate.frequency,
        held ? 0 : 0.018 + i * 0.007 + p.motion * 0.014,
        1,
      );
    });
  }
  function play(index) {
    if (!ctx || !enabled || held || !p) return;
    const n = Score.note(p, index);
    if (index % 16 === 0) chord(index);
    if (n.rest) return;
    const v = notes[index % notes.length],
      now = ctx.currentTime + 0.015,
      f = frequency(n.midi),
      duration = Math.min(3, n.duration);
    ramp(v.osc.frequency, f, 0.012);
    ramp(v.partial.frequency, Math.min(4000, f * 2), 0.012);
    ramp(v.partialGain.gain, 0.12 + p.sparkle * 0.2, 0.3);
    ramp(v.pan.pan, Math.sin(index * 0.67 + p.phase * 6) * p.width, 0.3);
    v.gain.gain.cancelScheduledValues(now);
    v.gain.gain.setValueAtTime(Math.max(0.0001, v.gain.gain.value), now);
    v.gain.gain.linearRampToValueAtTime(p.melody * n.accent, now + 0.065);
    v.gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 1.2);
    notesPlayed++;
  }
  function setHeld(value) {
    value = !!value;
    if (value === held) return;
    held = value;
    if (!ctx) return;
    if (held) for (const v of notes) ramp(v.gain.gain, 0, 0.06);
    if (p) chord(Math.max(0, lastBeat));
  }
  function enter(input) {
    world = input;
    p = profile(input);
    origin = null;
    lastBeat = -1;
    lastControl = -Infinity;
    if (!ctx || !enabled) {
      ui();
      return;
    }
    for (const v of notes) ramp(v.gain.gain, 0, 0.15);
    held = !!w.Cabinet?.paused || w.Experience?.frame().motion === 0;
    chord();
    noises.forEach((v, i) => {
      ramp(v.filter.frequency, i ? p.air : 150 + p.motion * 300, 2);
      ramp(v.filter.Q, p.wet ? 0.75 : 0.4, 2);
      ramp(v.gain.gain, p.noise * (i ? 0.55 : 1), 2);
    });
    ramp(space.gain, p.space, 2);
    play(0);
    lastBeat = 0;
    ui();
  }
  function update(S, design) {
    if (!enabled || !ctx || !p) return;
    const ex = S.experience || {};
    setHeld(!!w.Cabinet?.paused || S.dt === 0);
    if (held) return;
    let t = S.t || 0;
    if (origin === null) origin = t;
    t = Math.max(0, t - origin);
    const beat = Math.max(0, Math.floor((t * p.bpm) / 60));
    if (beat !== lastBeat) {
      lastBeat = beat;
      play(beat);
    }
    if (t - lastControl > 0.15 || t < lastControl) {
      lastControl = t;
      const brightness = Math.max(0, Math.min(1, ex.intensity ?? 0.65));
      pads.forEach((v, i) => {
        ramp(
          v.pan.pan,
          Math.sin(t * (0.025 + p.motion * 0.035) + i * 1.7 + p.phase * 6) *
            p.width,
          0.7,
        );
        ramp(
          v.filter.frequency,
          p.cutoff * (0.8 + brightness * 0.3 + 0.08 * Math.sin(t * 0.07 + i)),
          1,
        );
      });
    }
  }
  async function stop() {
    generation++;
    pending = false;
    enabled = false;
    const old = ctx;
    ctx = master = analyser = space = null;
    pads = [];
    notes = [];
    noises = [];
    createdNodes = 0;
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
      const unlocked = next.resume();
      const make = (type) => {
        createdNodes++;
        return next["create" + type]();
      };
      const compressor = make("DynamicsCompressor");
      compressor.threshold.value = -18;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.025;
      compressor.release.value = 0.6;
      master = make("Gain");
      master.gain.value = 0;
      analyser = make("Analyser");
      analyser.fftSize = 2048;
      master.connect(compressor);
      compressor.connect(analyser);
      analyser.connect(next.destination);
      const bus = make("Gain");
      bus.gain.value = 1;
      bus.connect(master);
      space = make("Gain");
      space.gain.value = 0.18;
      const left = make("Delay"),
        right = make("Delay"),
        feedback = make("Gain"),
        dark = make("BiquadFilter"),
        lp = make("StereoPanner"),
        rp = make("StereoPanner");
      left.delayTime.value = 0.31;
      right.delayTime.value = 0.47;
      feedback.gain.value = 0.18;
      dark.type = "lowpass";
      dark.frequency.value = 1700;
      lp.pan.value = -0.65;
      rp.pan.value = 0.65;
      bus.connect(left);
      left.connect(lp);
      lp.connect(space);
      left.connect(right);
      right.connect(rp);
      rp.connect(space);
      right.connect(dark);
      dark.connect(feedback);
      feedback.connect(left);
      space.connect(master);
      for (let i = 0; i < 4; i++) {
        const osc = make("Oscillator"),
          partial = make("Oscillator"),
          g = make("Gain"),
          pg = make("Gain"),
          pan = make("StereoPanner"),
          filter = make("BiquadFilter"),
          rate = make("Oscillator"),
          depth = make("Gain");
        osc.type = "sine";
        partial.type = "triangle";
        osc.frequency.value = 110;
        partial.frequency.value = 220;
        g.gain.value = 0.04;
        pg.gain.value = 0.005;
        filter.type = "lowpass";
        filter.frequency.value = 1200;
        filter.Q.value = 0.3;
        rate.frequency.value = 0.02 + i * 0.006;
        depth.gain.value = 0.004;
        rate.connect(depth);
        depth.connect(g.gain);
        osc.connect(g);
        partial.connect(pg);
        g.connect(filter);
        pg.connect(filter);
        filter.connect(pan);
        pan.connect(bus);
        osc.start();
        partial.start();
        rate.start();
        pads.push({
          osc,
          partial,
          gain: g,
          partialGain: pg,
          pan,
          filter,
          rate,
        });
      }
      for (let i = 0; i < 3; i++) {
        const osc = make("Oscillator"),
          partial = make("Oscillator"),
          pg = make("Gain"),
          g = make("Gain"),
          pan = make("StereoPanner"),
          filter = make("BiquadFilter");
        osc.type = "sine";
        partial.type = "sine";
        osc.frequency.value = 440;
        partial.frequency.value = 880;
        pg.gain.value = 0.2;
        g.gain.value = 0;
        filter.type = "lowpass";
        filter.frequency.value = 2600;
        osc.connect(g);
        partial.connect(pg);
        pg.connect(g);
        g.connect(filter);
        filter.connect(pan);
        pan.connect(bus);
        osc.start();
        partial.start();
        notes.push({ osc, partial, partialGain: pg, gain: g, pan });
      }
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
      const seam = 2048;
      for (let i = 0; i < seam; i++)
        data[length - seam + i] =
          data[length - seam + i] * (1 - i / seam) + data[i] * (i / seam);
      const noise = make("BufferSource");
      noise.buffer = buffer;
      noise.loop = true;
      noise.loopStart = seam / next.sampleRate;
      noise.loopEnd = length / next.sampleRate;
      for (let i = 0; i < 2; i++) {
        const filter = make("BiquadFilter"),
          g = make("Gain"),
          pan = make("StereoPanner");
        filter.type = i ? "bandpass" : "lowpass";
        filter.frequency.value = i ? 1100 : 300;
        filter.Q.value = 0.6;
        g.gain.value = 0.1;
        pan.pan.value = i ? 0.4 : -0.4;
        noise.connect(filter);
        filter.connect(g);
        g.connect(pan);
        pan.connect(bus);
        noises.push({ filter, gain: g, pan });
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
  function safety(value) {
    calmer = !!value;
    if (master) gain();
  }
  function setMode(value) {
    mode = ["auto", "melodic", "cinematic", "hybrid"].includes(value)
      ? value
      : "auto";
    enter(world);
  }
  function mount() {
    d.getElementById("ambientToggle").onclick = () =>
      enabled || pending ? stop() : start();
    d.getElementById("ambientVolume").oninput = (e) => {
      volume = Math.max(0, Math.min(1, Number(e.target.value)));
      if (master) gain();
    };
    const select = d.getElementById("ambientStyle");
    if (select) select.onchange = (e) => setMode(e.target.value);
    const replay = d.getElementById("ambientReplay");
    if (replay)
      replay.onclick = () => {
        if (enabled) enter(world);
        ui();
      };
    d.addEventListener("visibilitychange", () => {
      if (!ctx || !enabled) return;
      const next = ctx;
      (d.hidden ? next.suspend() : next.resume()).catch(() =>
        ui("Atmosphere suspended · toggle sound to resume."),
      );
    });
    w.addEventListener("pagehide", stop);
    ui();
  }
  w.Soundscape = {
    start,
    stop,
    enter,
    update,
    setHeld,
    setMode,
    duck,
    profile,
    safety,
    sample,
    get enabled() {
      return enabled;
    },
    debug: () => ({
      nodes: createdNodes,
      notesPlayed,
      beat: lastBeat,
      held,
      profile: p ? JSON.parse(JSON.stringify(p)) : null,
      mode,
    }),
  };
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", mount);
  else mount();
})(window, document);
