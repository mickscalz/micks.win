/* Optional, local-first experience conductor. No telemetry, uploads or track
   identification. Audio exists only in a user-initiated Web Audio graph. */
(function (w) {
  "use strict";
  var clamp = function (v, a, b) {
    return Math.max(a, Math.min(b, v));
  };
  var defaults = {
    mode: "guided",
    worldDuration: 36,
    transitionDuration: 5,
    transitionStyle: "auto",
    transitionEase: "smooth",
    transitionWarp: 0.6,
    growth: 0.65,
    mutation: 0.5,
    coupling: 0.6,
    lifecycle: 0.55,
    atmosphere: 0.65,
    symmetry: 0.5,
    drift: 0.45,
    afterglow: 0.55,
    audioAttack: 0.12,
    audioRelease: 1.4,
    audioSensitivity: 0.6,
    novelty: 0.7,
    intensity: 0.65,
    motion: 1,
    detail: 0.85,
    brightness: 1,
    color: 1,
    density: 0.75,
    reactivity: 0.65,
    quality: "auto",
    reducedMotion: false,
    reducedFlashes: true,
    colorSafe: false,
    calm: false,
  };
  var settings = Object.assign({}, defaults),
    consent = false,
    likes = {},
    saved = {},
    recent = [],
    history = [],
    clock = 0,
    arc = 0,
    quality = 1,
    perf = { fps: 0, frameMs: 0, memory: null, battery: null },
    signal = {
      source: "internal",
      energy: 0,
      bass: 0,
      mid: 0,
      treble: 0,
      onset: 0,
      balance: 0,
      stereoReliable: false,
      tempo: null,
      confidence: 0,
      onsetDensity: 0,
      dynamics: 0,
    };
  var storageKey = "cabinet-experience-v1",
    audio = null,
    audioEpoch = 0,
    engine = null,
    lastPaint = 0,
    lastAuto = 0,
    notice = "Internal rhythm · no audio access",
    lastAction = "Guided: newest-first travel",
    panelOpen = false,
    panelReturnFocus = null;
  try {
    if (
      w.matchMedia &&
      w.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      settings.reducedMotion = true;
  } catch (e) {}
  function sanitize(input) {
    var out = Object.assign({}, settings);
    Object.keys(defaults).forEach(function (k) {
      var v = input[k];
      if (typeof defaults[k] === "boolean") {
        if (typeof v === "boolean") out[k] = v;
      } else if (typeof defaults[k] === "number") {
        if (typeof v === "number" && Number.isFinite(v))
          out[k] = clamp(
            v,
            k === "brightness"
              ? 0.15
              : k === "worldDuration"
                ? 5
                : k === "audioAttack"
                  ? 0.02
                  : k === "audioRelease"
                    ? 0.1
                    : 0,
            k === "motion"
              ? 1.5
              : k === "brightness"
                ? 1.35
                : k === "worldDuration"
                  ? 600
                  : k === "transitionDuration"
                    ? 30
                    : k === "audioAttack"
                      ? 1
                      : k === "audioRelease"
                        ? 6
                        : 1,
          );
      }
    });
    if (["manual", "guided", "adaptive", "autonomous"].includes(input.mode))
      out.mode = input.mode;
    if (["auto", "high", "balanced", "economy"].includes(input.quality))
      out.quality = input.quality;
    if (
      input.transitionStyle === "auto" ||
      (w.CabinetTransitions &&
        w.CabinetTransitions.styles.some(function (s) {
          return s.id === input.transitionStyle;
        }))
    )
      out.transitionStyle = input.transitionStyle;
    if (["smooth", "sine", "linear"].includes(input.transitionEase))
      out.transitionEase = input.transitionEase;
    return out;
  }
  try {
    if (
      w.localStorage &&
      w.localStorage.getItem(storageKey + "-consent") === "yes"
    ) {
      var raw = JSON.parse(w.localStorage.getItem(storageKey) || "{}");
      consent = true;
      settings = sanitize(raw.settings || {});
      likes = cleanMap(raw.likes);
      saved = cleanMap(raw.saved);
      if (w.MusicLab) w.MusicLab.restore(raw.routes);
    }
  } catch (e) {}
  function cleanMap(v) {
    var out = {};
    if (v && typeof v === "object")
      Object.keys(v)
        .slice(0, 2048)
        .forEach(function (k) {
          if (
            /^[a-z0-9-]+$/.test(k) &&
            typeof v[k] === "number" &&
            Number.isFinite(v[k])
          )
            out[k] = clamp(v[k], -3, 3);
        });
    return out;
  }
  function persist() {
    if (!consent) return;
    try {
      w.localStorage.setItem(storageKey + "-consent", "yes");
      w.localStorage.setItem(
        storageKey,
        JSON.stringify({
          settings: settings,
          likes: likes,
          saved: saved,
          routes: w.MusicLab ? w.MusicLab.serialize() : undefined,
        }),
      );
    } catch (e) {
      notice = "Storage unavailable · session controls still work";
    }
  }
  function set(key, value, automatic) {
    var change = {};
    change[key] = value;
    settings = sanitize(change);
    if (!automatic) {
      lastAction = "You changed " + key;
      lastAuto = clock;
      persist();
    }
    if (key === "quality" && settings.quality !== "auto")
      quality = { high: 1, balanced: 0.72, economy: 0.45 }[settings.quality];
    if (engine) {
      engine.dwell = settings.worldDuration;
      engine.needsDraw = true;
      if ((key === "quality" || key === "detail") && engine.resize) {
        if (key === "quality" && settings.quality !== "auto")
          engine.scale = { high: 1, balanced: 0.8, economy: 0.6 }[
            settings.quality
          ];
        engine.resize();
      }
    }
    apply();
    paint(true);
  }
  function effective() {
    return {
      intensity: settings.calm
        ? Math.min(settings.intensity, 0.3)
        : settings.intensity,
      motion:
        settings.motion *
        (settings.reducedMotion ? 0.18 : 1) *
        (settings.calm ? 0.45 : 1),
      brightness: Math.min(
        settings.brightness,
        settings.calm ? 0.65 : settings.reducedFlashes ? 1.12 : 1.35,
      ),
      density: settings.density * (settings.calm ? 0.45 : 1),
      detail: Math.min(settings.detail, quality),
      color: settings.color,
      growth: settings.growth,
      mutation: settings.mutation,
      coupling: settings.coupling,
      lifecycle: settings.lifecycle,
      atmosphere: settings.atmosphere,
      symmetry: settings.symmetry,
      drift: settings.drift,
      afterglow: settings.afterglow,
      pulse: 0,
    };
  }
  function apply() {
    if (!w.document) return;
    var stage = w.document.getElementById("stage");
    if (stage) {
      var e = effective();
      stage.style.filter =
        "brightness(" +
        e.brightness +
        ") saturate(" +
        (settings.colorSafe ? 0.55 : settings.color * 1.15) +
        ")";
      stage.classList.toggle(
        "safe-motion",
        settings.reducedMotion || settings.calm,
      );
      stage.classList.toggle("safe-flashes", settings.reducedFlashes);
    }
  }
  function rhythm(t) {
    return clamp(
      0.48 +
        0.21 * Math.sin(t * 0.61 + 0.45 * Math.sin(t * 0.113)) +
        0.13 * Math.sin(t * 0.97 + 0.3 * Math.cos(t * 0.047)) +
        0.08 * Math.sin(t * 0.237 + 2.1),
      0,
      1,
    );
  }
  function enter(d) {
    if (!d) return;
    var e = effective();
    recent.push({
      id: d.id,
      family: d.family || d.kind,
      motif: d.tag || d.id,
      palette: d.paletteGroup || d.theme || "original",
      motionClass: d.motionClass || d.kind,
      motion: e.motion,
      intensity: e.intensity,
      at: clock,
    });
    if (recent.length > 16) recent.shift();
    history.push(d.id);
    if (history.length > 32) history.shift();
    if (w.MusicLab) w.MusicLab.renderRoutes();
    paint(true);
  }
  function feedback(action) {
    if (!engine) return;
    var d = engine.designs[engine.index];
    if (d.nursery && ["like", "save"].includes(action)) {
      notice = "Save offspring separately in the nursery panel";
      paint(true);
      return;
    }
    if (action === "like") likes[d.id] = (likes[d.id] || 0) > 0 ? 0 : 1;
    else if (action === "save") saved[d.id] = saved[d.id] ? 0 : 1;
    else if (action === "skip") {
      if (!d.nursery) likes[d.id] = clamp((likes[d.id] || 0) - 1, -3, 3);
      engine.show((engine.index + 1) % engine.designs.length);
    } else if (action === "calmer") {
      settings.intensity = clamp(settings.intensity - 0.15, 0, 1);
      settings.motion = clamp(settings.motion - 0.15, 0, 1.5);
    } else if (action === "brighter")
      settings.brightness = clamp(settings.brightness + 0.1, 0.15, 1.35);
    else if (action === "abstract")
      settings.novelty = clamp(settings.novelty + 0.15, 0, 1);
    else if (action === "energetic") {
      settings.intensity = clamp(settings.intensity + 0.12, 0, 1);
      settings.motion = clamp(settings.motion + 0.12, 0, 1.5);
    }
    lastAction = "You: " + action;
    lastAuto = clock;
    persist();
    if (engine) engine.needsDraw = true;
    apply();
    paint(true);
  }
  function choose(designs, index) {
    if (settings.mode === "guided" || settings.mode === "manual")
      return (index + 1) % designs.length;
    var family = designs[index].family || designs[index].kind;
    var best = -Infinity,
      next = (index + 1) % designs.length;
    designs.forEach(function (d, i) {
      if (i === index) return;
      var seen = recent.findIndex(function (r) {
          return r.id === d.id;
        }),
        distance =
          seen < 0
            ? 1
            : (recent.length - 1 - seen) / Math.max(1, recent.length);
      var fresh = (d.family || d.kind) !== family ? 1 : 0;
      var last = recent[recent.length - 1];
      var paletteFresh =
        last && last.palette !== (d.paletteGroup || d.theme || "original")
          ? 1
          : 0;
      var movementFresh =
        last && last.motionClass !== (d.motionClass || d.kind) ? 1 : 0;
      var preference = (likes[d.id] || 0) * 0.3;
      var target =
        signal.source === "internal"
          ? 0.35 + 0.5 * arc
          : clamp(
              0.2 +
                0.65 * signal.energy +
                0.15 * Math.min(1, signal.onsetDensity),
              0,
              1,
            );
      if (signal.source !== "internal")
        target =
          (0.35 + 0.5 * arc) * (1 - settings.reactivity) +
          target * settings.reactivity;
      var score =
        distance * settings.novelty * 2 +
        fresh * 0.65 +
        (paletteFresh * 0.25 + movementFresh * 0.15) * settings.novelty +
        preference -
        Math.abs((d.vigor === undefined ? 0.6 : d.vigor) - target) * 0.6 +
        (0.5 + 0.5 * Math.sin(i * 12.989 + clock * 0.013)) * 0.22;
      if (seen >= 0) score -= 2;
      if (d.edition >= 7) score += 0.3;
      if (score > best) {
        best = score;
        next = i;
      }
    });
    lastAction =
      settings.mode +
      ": fresh " +
      (designs[next].family || designs[next].kind) +
      " family · " +
      (arc > 0.7 ? "peak" : arc < 0.3 ? "breathing room" : "development");
    return next;
  }
  function advance(dt) {
    if (dt <= 0) return frame();
    clock += dt;
    arc = 0.5 + 0.5 * Math.sin(clock * 0.029 - 0.9) * Math.cos(clock * 0.011);
    if (audio) analyse(dt);
    else {
      signal.energy = rhythm(clock);
      signal.bass = signal.energy * 0.7;
      signal.mid = 0.45 + 0.2 * Math.sin(clock * 0.13);
      signal.treble = 0.3 + 0.15 * Math.sin(clock * 0.19);
      signal.onset *= Math.exp(-dt * 4);
    }
    if (settings.mode === "autonomous" && clock - lastAuto > 12) {
      lastAuto = clock;
      lastAction =
        "Autonomous: " +
        (arc > 0.7
          ? "radiant development"
          : arc < 0.3
            ? "low-density breathing room"
            : "gradual spatial recomposition");
    }
    if (w.MusicLab) w.MusicLab.tick();
    paint(false);
    return frame();
  }
  function frame() {
    var e = effective(),
      p = rhythm(clock),
      measured = signal.source !== "internal",
      audioWeight = measured ? settings.reactivity : 1;
    e.pulse =
      p * (1 - settings.reactivity * (measured ? 1 : 0)) +
      signal.energy * settings.reactivity * (measured ? 1 : 0);
    e.energy = e.pulse;
    e.density *= 0.8 + 0.2 * signal.bass * audioWeight;
    e.arc = arc;
    e.novelty = settings.novelty;
    e.bass = signal.bass * audioWeight;
    e.mid = signal.mid * audioWeight;
    e.treble = signal.treble * audioWeight;
    e.onset =
      audioWeight *
      (settings.reducedFlashes ? Math.min(0.3, signal.onset) : signal.onset);
    e.stereo =
      signal.stereoReliable && audioWeight > 0
        ? signal.balance * audioWeight
        : 0;
    e.colorSafe = settings.colorSafe;
    e.quality = quality;
    e.mode = settings.mode;
    // Fixed legacy routes remain the fallback for embedders without the editor.
    if (measured && settings.reactivity > 0) {
      if (w.MusicLab) w.MusicLab.apply(e, signal, audioWeight, settings);
      else {
        e.growth = clamp(
          e.growth * (1 + (signal.bass - 0.3) * 0.35 * audioWeight),
          0,
          1,
        );
        e.coupling = clamp(
          e.coupling * (1 + (signal.mid - 0.25) * 0.3 * audioWeight),
          0,
          1,
        );
        e.atmosphere = clamp(
          e.atmosphere * (1 + (signal.energy - 0.4) * 0.3 * audioWeight),
          0,
          1,
        );
        e.afterglow = clamp(
          e.afterglow * (1 + (signal.treble - 0.2) * 0.45 * audioWeight),
          0,
          1,
        );
      }
    }
    if (settings.mode === "autonomous") {
      e.density *= 0.65 + 0.35 * arc;
      e.intensity *= 0.7 + 0.3 * arc;
    }
    return e;
  }
  function performanceSample(fps, ms) {
    perf.fps = fps;
    perf.frameMs = ms;
    if (settings.quality === "auto") {
      if (fps < 38) quality = Math.max(0.4, quality - 0.1);
      else if (fps > 55) quality = Math.min(1, quality + 0.035);
    } else
      quality = { high: 1, balanced: 0.72, economy: 0.45 }[settings.quality];
    try {
      perf.memory = w.performance.memory
        ? Math.round(w.performance.memory.usedJSHeapSize / 1048576)
        : null;
    } catch (e) {}
    paint(false);
  }
  function stopAudio() {
    if (w.MusicLab) w.MusicLab.release();
    var picker = w.document && w.document.getElementById("audioFile");
    if (picker && "value" in picker) picker.value = "";
    audioEpoch++;
    if (audio) {
      if (audio.stream)
        audio.stream.getTracks().forEach(function (t) {
          t.stop();
        });
      if (audio.media) {
        audio.media.pause();
        audio.media.remove();
        audio.media.removeAttribute("src");
        audio.media.load();
      }
      if (audio.url) w.URL.revokeObjectURL(audio.url);
      try {
        audio.source.disconnect();
        audio.ctx.close().catch(function () {});
      } catch (e) {}
      audio = null;
    }
    Object.assign(signal, {
      source: "internal",
      tempo: null,
      confidence: 0,
      onsetDensity: 0,
      dynamics: 0,
      onset: 0,
      stereoReliable: false,
      balance: 0,
    });
    notice = "Internal rhythm · audio stopped";
    paint(true);
  }
  async function startAudio(kind, file) {
    stopAudio();
    var token = audioEpoch,
      ctx,
      stream,
      media,
      url;
    try {
      var AC = w.AudioContext || w.webkitAudioContext;
      if (!AC) throw Error("Web Audio is not available");
      ctx = new AC();
      await ctx.resume();
      if (token !== audioEpoch) {
        await ctx.close();
        return;
      }
      if (kind === "microphone") {
        if (!w.isSecureContext || !w.navigator.mediaDevices)
          throw Error("Microphone needs HTTPS and browser permission");
        stream = await w.navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
          video: false,
        });
      }
      if (token !== audioEpoch) {
        if (stream)
          stream.getTracks().forEach(function (t) {
            t.stop();
          });
        await ctx.close();
        return;
      }
      var source;
      if (kind === "file") {
        if (!file) throw Error("Choose a local audio file");
        url = w.URL.createObjectURL(file);
        media = w.document.createElement("audio");
        media.controls = true;
        media.src = url;
        media.setAttribute("aria-label", "Local audio playback");
        w.document.getElementById("audioPlayer").replaceChildren(media);
        source = ctx.createMediaElementSource(media);
      } else source = ctx.createMediaStreamSource(stream);
      var split = ctx.createChannelSplitter(2),
        a = ctx.createAnalyser(),
        l = ctx.createAnalyser(),
        r = ctx.createAnalyser();
      a.fftSize = 1024;
      l.fftSize = r.fftSize = 512;
      a.smoothingTimeConstant = 0.75;
      source.connect(a);
      source.connect(split);
      split.connect(l, 0);
      split.connect(r, 1);
      if (media) source.connect(ctx.destination);
      audio = {
        ctx: ctx,
        source: source,
        stream: stream,
        media: media,
        url: url,
        a: a,
        l: l,
        r: r,
        freq: new Uint8Array(a.frequencyBinCount),
        wave: new Float32Array(a.fftSize),
        left: new Float32Array(l.fftSize),
        right: new Float32Array(r.fftSize),
        previous: new Float32Array(a.frequencyBinCount),
        onsets: [],
        fluxMean: 0.01,
        lastOnset: -10,
        levels: [],
        elapsed: 0,
        lastAudioTime: ctx.currentTime,
      };
      // New measured envelopes must not inherit the free-running internal rhythm.
      Object.assign(signal, {
        source: kind,
        energy: 0,
        bass: 0,
        mid: 0,
        treble: 0,
      });
      notice =
        kind === "file"
          ? "Local audio · not uploaded or retained"
          : "Microphone active · analysis only, not recorded";
      if (media) {
        await media.play();
        if (w.MusicLab) w.MusicLab.setFile(file, media);
      }
      paint(true);
    } catch (error) {
      if (stream)
        stream.getTracks().forEach(function (t) {
          t.stop();
        });
      if (media) media.remove();
      if (url) w.URL.revokeObjectURL(url);
      if (ctx) ctx.close().catch(function () {});
      if (token === audioEpoch) {
        audio = null;
        signal.source = "internal";
        notice =
          (error.name === "NotAllowedError"
            ? "Audio permission denied"
            : error.message) + " · using internal rhythm";
        paint(true);
      }
    }
  }
  function rms(a) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * a[i];
    return Math.sqrt(s / a.length);
  }
  function analyse(dt) {
    var a = audio,
      now = a.ctx.currentTime,
      audioDt =
        typeof now === "number" ? Math.max(0, now - a.lastAudioTime) : dt;
    a.lastAudioTime = now;
    if (audioDt <= 0) return;
    if (audioDt > 0.5) {
      a.onsets = [];
      a.lastOnset = -10;
    }
    a.elapsed += audioDt;
    dt = Math.min(audioDt, 0.5);
    a.a.getByteFrequencyData(a.freq);
    a.a.getFloatTimeDomainData(a.wave);
    a.l.getFloatTimeDomainData(a.left);
    a.r.getFloatTimeDomainData(a.right);
    var energy = rms(a.wave),
      flux = 0,
      bands = [0, 0, 0],
      counts = [0, 0, 0],
      hz = a.ctx.sampleRate / a.a.fftSize;
    for (var i = 1; i < a.freq.length; i++) {
      var v = a.freq[i] / 255,
        f = i * hz,
        k = f < 250 ? 0 : f < 2400 ? 1 : 2;
      bands[k] += v;
      counts[k]++;
      flux += Math.max(0, v - a.previous[i]);
      a.previous[i] = v;
    }
    flux /= a.freq.length;
    a.fluxMean += (flux - a.fluxMean) * Math.min(1, dt * 0.8);
    if (
      energy > 0.008 &&
      flux > Math.max(0.009, a.fluxMean * 1.7) &&
      a.elapsed - a.lastOnset > 0.35
    ) {
      a.onsets.push(a.elapsed);
      a.lastOnset = a.elapsed;
      signal.onset = 1;
    } else signal.onset *= Math.exp(-dt * 3);
    a.onsets = a.onsets.filter(function (t) {
      return a.elapsed - t < 16;
    });
    var intervals = [];
    for (var j = 1; j < a.onsets.length; j++) {
      var gap = a.onsets[j] - a.onsets[j - 1];
      if (gap > 0.35 && gap < 1.5) intervals.push(gap);
    }
    signal.tempo = null;
    signal.confidence = 0;
    if (intervals.length >= 5) {
      var mean =
          intervals.reduce(function (x, y) {
            return x + y;
          }, 0) / intervals.length,
        dev =
          Math.sqrt(
            intervals.reduce(function (x, y) {
              return x + (y - mean) * (y - mean);
            }, 0) / intervals.length,
          ) / mean;
      signal.confidence = clamp(1 - dev * 3, 0, 1);
      if (signal.confidence > 0.7) signal.tempo = Math.round(60 / mean);
    }
    signal.onsetDensity =
      a.onsets.filter(function (t) {
        return a.elapsed - t < 8;
      }).length / 8;
    a.levels.push(energy);
    if (a.levels.length > 240) a.levels.shift();
    signal.dynamics =
      Math.max.apply(null, a.levels) - Math.min.apply(null, a.levels);
    var targetEnergy = clamp(
      energy * (2 + settings.audioSensitivity * 6),
      0,
      1,
    );
    var rate =
      1 -
      Math.exp(
        -dt /
          (targetEnergy > signal.energy
            ? settings.audioAttack
            : settings.audioRelease),
      );
    signal.energy += (targetEnergy - signal.energy) * rate;
    ["bass", "mid", "treble"].forEach(function (k, i) {
      var target = bands[i] / Math.max(1, counts[i]);
      var bandRate =
        1 -
        Math.exp(
          -dt /
            (target > signal[k] ? settings.audioAttack : settings.audioRelease),
        );
      signal[k] += (target - signal[k]) * bandRate;
    });
    var L = rms(a.left),
      R = rms(a.right);
    var difference = 0;
    for (var q = 0; q < a.left.length; q++)
      difference += (a.left[q] - a.right[q]) * (a.left[q] - a.right[q]);
    signal.stereoReliable =
      L > 0.002 &&
      R > 0.002 &&
      Math.sqrt(difference / a.left.length) / (L + R + 0.0001) > 0.02;
    signal.balance = signal.stereoReliable ? (R - L) / (R + L + 0.0001) : 0;
  }
  function reset() {
    if(w.NurseryUI)w.NurseryUI.resetTaste();
    if (w.MusicLab) w.MusicLab.reset();
    stopAudio();
    consent = false;
    likes = {};
    saved = {};
    settings = Object.assign({}, defaults);
    try {
      settings.reducedMotion = !!w.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      w.localStorage.removeItem(storageKey);
      w.localStorage.removeItem(storageKey + "-consent");
    } catch (e) {}
    recent = [];
    history = [];
    quality = 1;
    lastAction = "Preferences reset · nothing retained";
    if (engine) {
      engine.needsDraw = true;
      engine.scale = 1;
      engine.dwell = settings.worldDuration;
      if (engine.resize) engine.resize();
    }
    apply();
    paint(true);
  }
  function setConsent(on) {
    consent = !!on;
    if (consent) persist();
    else {
      try {
        w.localStorage.removeItem(storageKey);
        w.localStorage.removeItem(storageKey + "-consent");
      } catch (e) {}
    }
    paint(true);
  }
  function paint(force) {
    if (!engine || !w.document || (!force && clock - lastPaint < 0.4)) return;
    lastPaint = clock;
    var d = w.document,
      put = function (id, text) {
        var el = d.getElementById(id);
        if (el) el.textContent = text;
      };
    put("experienceStatus", lastAction);
    var tr = engine.transitions && engine.transitions.getState();
    put(
      "transitionReadout",
      "World interval " +
        settings.worldDuration +
        "s (includes arrival) · transition " +
        Math.min(
          settings.transitionDuration,
          settings.worldDuration * 0.8,
        ).toFixed(1) +
        "s" +
        (tr && tr.active
          ? " · " + tr.style
          : " · " + settings.transitionStyle) +
        " · reduced motion / calm uses a plain dissolve",
    );
    put("audioStatus", notice);
    put(
      "signalReadout",
      signal.source === "internal"
        ? "Internal pulse · no track analysis"
        : "Energy " +
            signal.energy.toFixed(2) +
            " · low/mid/high " +
            [signal.bass, signal.mid, signal.treble]
              .map(function (v) {
                return v.toFixed(2);
              })
              .join("/") +
            " · " +
            (signal.tempo
              ? signal.tempo +
                " BPM estimate (" +
                Math.round(signal.confidence * 100) +
                "% confidence)"
              : "tempo uncertain") +
            " · " +
            signal.onsetDensity.toFixed(1) +
            " onsets/s · dynamics " +
            signal.dynamics.toFixed(2) +
            " · " +
            (signal.stereoReliable
              ? "L/R " + signal.balance.toFixed(2)
              : "stereo unknown/mono") +
            " · sections and mood not inferred",
    );
    put("conductorLive", settings.mode + " · " + signal.source);
    var calm = d.getElementById("calmNow");
    if (calm) calm.setAttribute("aria-pressed", String(settings.calm));
    put(
      "qualityStatus",
      (perf.fps
        ? perf.fps.toFixed(0) + " fps · " + perf.frameMs.toFixed(1) + " ms"
        : "Measuring frame time") +
        " · detail " +
        Math.round(quality * 100) +
        "%" +
        (perf.memory !== null ? " · JS heap " + perf.memory + " MB" : "") +
        (perf.battery !== null ? " · battery " + perf.battery + "%" : "") +
        " · thermal data unavailable",
    );
    Object.keys(defaults).forEach(function (k) {
      var el = d.querySelector('[data-setting="' + k + '"]');
      if (el && el !== d.activeElement) {
        if (el.type === "checkbox") el.checked = settings[k];
        else el.value = settings[k];
      }
      var output = d.querySelector('[data-value="' + k + '"]');
      if (output)
        output.textContent =
          typeof settings[k] === "number"
            ? [
                "worldDuration",
                "transitionDuration",
                "audioAttack",
                "audioRelease",
              ].includes(k)
              ? settings[k].toFixed(k === "worldDuration" ? 0 : 2) + "s"
              : Math.round(settings[k] * 100) + "%"
            : settings[k];
    });
    var remember = d.getElementById("rememberExperience");
    if (remember) remember.checked = consent;
    var room = engine.designs[engine.index];
    if (room) {
      var tuning = effective();
      put(
        "organismReadout",
        room.edition === 8
          ? room.lifeMechanism +
              (room.L && room.lifeMechanism.indexOf("Nutrient") === 0
                ? " Population " +
                  room.L.agents.length +
                  " · births " +
                  room.L.births +
                  " · renewals " +
                  room.L.deaths +
                  " · generation " +
                  room.L.maxGeneration
                : "")
          : "",
      );
      put(
        "compositionReadout",
        room.name +
          " · " +
          (room.family || room.kind) +
          " · " +
          room.tag +
          " · palette: " +
          (settings.colorSafe
            ? "blue/gold contrast"
            : room.paletteGroup || "original") +
          " · motion " +
          Math.round(tuning.motion * 100) +
          "% · intensity " +
          Math.round(tuning.intensity * 100) +
          "%" +
          (room.edition === 7
            ? " · smooth morph epoch " +
              (1 + Math.floor((engine.artT || 0) / 12))
            : ""),
      );
      var like = d.querySelector('[data-feedback="like"]'),
        save = d.querySelector('[data-feedback="save"]');
      if (like) {
        like.disabled = !!room.nursery;
        like.setAttribute("aria-pressed", String((likes[room.id] || 0) > 0));
      }
      if (save) {
        save.disabled = !!room.nursery;
        save.setAttribute("aria-pressed", String(!!saved[room.id]));
      }
      drawWorldList("savedWorlds", saved, "No saved worlds");
      drawWorldList("likedWorlds", likes, "No liked worlds");
    }
  }
  function drawWorldList(id, map, empty) {
    var box = w.document.getElementById(id);
    if (!box) return;
    var keys = Object.keys(map).filter(function (k) {
        return map[k] > 0;
      }),
      signature = keys.join(",");
    if (box.dataset.ids === signature) return;
    box.dataset.ids = signature;
    box.replaceChildren();
    if (!keys.length) {
      box.textContent = empty;
      return;
    }
    keys.forEach(function (id) {
      var index = engine.designs.findIndex(function (d) {
        return d.id === id;
      });
      if (index < 0) return;
      var button = w.document.createElement("button");
      button.type = "button";
      button.textContent = engine.designs[index].name;
      button.addEventListener("click", function () {
        engine.show(index);
        lastAuto = clock;
        lastAction = "You recalled " + engine.designs[index].name;
        paint(true);
      });
      box.append(button);
    });
  }
  function open(on) {
    if (!engine) return;
    var d = w.document,
      p = d.getElementById("experiencePanel");
    if (on) {
      if (!panelOpen) panelReturnFocus = d.activeElement;
      if (engine.immersive) engine.setImmersive(false);
      engine.closeGallery();
    }
    panelOpen = !!on;
    p.hidden = !on;
    p.inert = !on;
    d.getElementById("experienceBackdrop").hidden = !on;
    d.getElementById("experienceToggle").setAttribute(
      "aria-expanded",
      String(on),
    );
    ["brand", "card", "rail", "ctl", "hint", "experienceDock"].forEach(
      function (id) {
        d.getElementById(id).inert = !!on;
      },
    );
    if (on) {
      engine.wakeUI();
      p.querySelector("button").focus();
    } else
      (panelReturnFocus && panelReturnFocus.isConnected
        ? panelReturnFocus
        : d.getElementById("experienceToggle")
      ).focus();
  }
  function mount(E) {
    engine = E;
    engine.dwell = settings.worldDuration;
    var d = w.document;
    var styleSelect = d.querySelector('[data-setting="transitionStyle"]');
    if (styleSelect && w.CabinetTransitions)
      w.CabinetTransitions.styles.forEach(function (s) {
        var o = d.createElement("option");
        o.value = s.id;
        o.textContent = s.name;
        styleSelect.append(o);
      });
    d.getElementById("previewTransition").addEventListener(
      "click",
      function () {
        engine.show((engine.index + 1) % engine.designs.length);
      },
    );
    d.getElementById("experienceToggle").addEventListener("click", function () {
      open(!panelOpen);
    });
    d.getElementById("experienceBackdrop").addEventListener(
      "click",
      function () {
        open(false);
      },
    );
    d.getElementById("experienceClose").addEventListener("click", function () {
      open(false);
    });
    d.getElementById("experiencePanel").addEventListener("input", function (e) {
      var k = e.target.dataset.setting;
      if (k)
        set(
          k,
          e.target.type === "checkbox"
            ? e.target.checked
            : e.target.type === "range"
              ? Number(e.target.value)
              : e.target.value,
        );
    });
    d.querySelectorAll("[data-feedback]").forEach(function (b) {
      b.addEventListener("click", function () {
        feedback(b.dataset.feedback);
      });
    });
    d.getElementById("rememberExperience").addEventListener(
      "change",
      function (e) {
        setConsent(e.target.checked);
      },
    );
    d.getElementById("resetExperience").addEventListener("click", reset);
    d.getElementById("microphoneStart").addEventListener("click", function () {
      startAudio("microphone");
    });
    d.getElementById("audioStop").addEventListener("click", stopAudio);
    d.getElementById("audioFile").addEventListener("change", function (e) {
      if (e.target.files[0]) startAudio("file", e.target.files[0]);
    });
    d.getElementById("calmNow").addEventListener("click", function () {
      set("calm", !settings.calm);
    });
    d.getElementById("experiencePanel").addEventListener(
      "keydown",
      function (e) {
        if (e.key === "Escape") {
          e.stopPropagation();
          open(false);
        } else if (e.key === "Tab") {
          var nodes = Array.from(
              this.querySelectorAll("button,input,select,audio"),
            ).filter(function (n) {
              return !n.disabled && n.offsetParent !== null;
            }),
            first = nodes[0],
            last = nodes[nodes.length - 1];
          if (e.shiftKey && d.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && d.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      },
    );
    w.addEventListener("pagehide", stopAudio);
    try {
      if (w.navigator.getBattery)
        w.navigator
          .getBattery()
          .then(function (b) {
            perf.battery = Math.round(b.level * 100);
            b.addEventListener("levelchange", function () {
              perf.battery = Math.round(b.level * 100);
            });
          })
          .catch(function () {});
    } catch (e) {}
    apply();
    paint(true);
  }
  w.Experience = {
    settings: settings,
    getSettings: function () {
      return Object.assign({}, settings);
    },
    defaults: defaults,
    savePreferences: persist,
    set: set,
    effective: effective,
    frame: frame,
    advance: advance,
    enter: enter,
    choose: choose,
    feedback: feedback,
    performanceSample: performanceSample,
    stopAudio: stopAudio,
    startAudio: startAudio,
    reset: reset,
    setConsent: setConsent,
    mount: mount,
    open: open,
    isOpen: function () {
      return panelOpen;
    },
    signal: signal,
    performance: perf,
    rhythm: rhythm,
    getConsent: function () {
      return consent;
    },
    getRecent: function () {
      return recent.map(function (r) {
        return Object.assign({}, r);
      });
    },
    getHistory: function () {
      return history.slice();
    },
  };
  Object.defineProperty(w.Experience, "settings", {
    get: function () {
      return Object.assign({}, settings);
    },
  });
})(window);
