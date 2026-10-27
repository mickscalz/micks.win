/* Editable, bounded causal routes and cancellable local-only look-ahead. */
(function (w, d) {
  "use strict";
  const sources = [
      "bass",
      "mid",
      "treble",
      "energy",
      "onset",
      "arc",
      "novelty",
      "beat",
      "spectral",
      "texture",
    ],
    targets = [
      "growth",
      "mutation",
      "coupling",
      "lifecycle",
      "atmosphere",
      "symmetry",
      "drift",
      "afterglow",
    ];
  const defaults = () => [
    { source: "bass", target: "growth", amount: 0.35, enabled: true },
    { source: "mid", target: "coupling", amount: 0.3, enabled: true },
    { source: "energy", target: "atmosphere", amount: 0.3, enabled: true },
    { source: "treble", target: "afterglow", amount: 0.45, enabled: true },
  ];
  let profiles = { global: defaults() },
    scope = "global",
    file = null,
    media = null,
    worker = null,
    epoch = 0,
    decoding = false,
    analysis = null,
    markers = [],
    lookahead = false,
    offset = 0,
    manualTempo = null,
    taps = [],
    lastDraw = 0;
  const workerURL = new URL("music-analysis.js?v=10", d.currentScript.src);
  const $ = (id) => d.getElementById(id),
    clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function validRoutes(rows) {
    if (!Array.isArray(rows) || rows.length !== 4)
      throw Error("Four bounded routes required");
    return rows.map((r) => {
      if (
        !r ||
        !sources.includes(r.source) ||
        !targets.includes(r.target) ||
        typeof r.amount !== "number" ||
        !Number.isFinite(r.amount) ||
        Math.abs(r.amount) > 0.6 ||
        typeof r.enabled !== "boolean"
      )
        throw Error("Invalid audio route");
      return {
        source: r.source,
        target: r.target,
        amount: r.amount,
        enabled: r.enabled,
      };
    });
  }
  function restore(input) {
    profiles = { global: defaults() };
    if (!input || typeof input !== "object") return;
    for (const k of Object.keys(input).slice(0, 64))
      if (k === "global" || /^[a-z0-9-]{1,80}$/.test(k))
        try {
          if (Object.keys(profiles).length < 64 || Object.hasOwn(profiles, k))
            profiles[k] = validRoutes(input[k]);
        } catch (_) {}
    scope = "global";
  }
  function serialize() {
    return JSON.parse(JSON.stringify(profiles));
  }
  function changed() {
    if (w.Experience) w.Experience.savePreferences();
  }
  function currentID() {
    return w.Cabinet?.designs[w.Cabinet.index]?.id || "global";
  }
  function arc() {
    if (!lookahead || !analysis || !media || media.paused) return null;
    const at = clamp(
        media.currentTime + Number($("lookaheadSeconds")?.value || 0) + offset,
        0,
        analysis.duration,
      ),
      row =
        analysis.rows[
          Math.min(analysis.rows.length - 1, Math.floor(at / analysis.step))
        ];
    return row
      ? {
          ...row,
          novelty: Math.max(
            row.novelty,
            ...markers.map((m) => Math.max(0, 1 - Math.abs(at - m.time)) * 0.4),
          ),
        }
      : null;
  }
  function apply(e, signal, weight, settings) {
    if (!weight) return e;
    const id = currentID(),
      routes = profiles[id] || profiles.global,
      look = arc(),
      mod = {};
    for (const r of routes) {
      if (!r.enabled) continue;
      let v =
        r.source === "spectral"
          ? look?.brightness
          : r.source === "texture"
            ? look?.flatness
            : r.source === "arc"
              ? look?.energy
              : r.source === "novelty"
                ? look?.novelty
                : r.source === "beat"
                  ? lookahead &&
                    media &&
                    !media.paused &&
                    (manualTempo || analysis?.bpm)
                    ? 0.5 -
                      0.5 *
                        Math.cos(
                          (2 *
                            Math.PI *
                            (media.currentTime + offset) *
                            (manualTempo || analysis.bpm)) /
                            60,
                        )
                    : null
                  : signal[r.source];
      if (typeof v !== "number" || !Number.isFinite(v)) continue;
      if (r.source === "onset" && settings.reducedFlashes) v = Math.min(0.3, v);
      const base = {
        bass: 0.3,
        mid: 0.25,
        treble: 0.2,
        energy: 0.4,
        arc: 0.5,
        onset: 0,
        novelty: 0,
        beat: 0.5,
        spectral: 0.3,
        texture: 0.3,
      }[r.source];
      mod[r.target] =
        (mod[r.target] || 0) + (clamp(v, 0, 1) - base) * r.amount * weight;
    }
    for (const k of Object.keys(mod))
      e[k] = clamp(
        e[k] *
          (1 +
            clamp(mod[k], -0.35, 0.35) *
              (settings.calm || settings.reducedMotion ? 0.3 : 1)),
        0,
        1,
      );
    return e;
  }
  function renderRoutes() {
    const box = $("musicRoutes");
    if (!box) return;
    box.replaceChildren();
    const id = currentID();
    $("musicScope").value = scope === "global" ? "global" : "world";
    const rows =
      scope === "global" ? profiles.global : profiles[id] || profiles.global;
    rows.forEach((r, i) => {
      const line = d.createElement("div");
      line.className = "music-route";
      const enabled = d.createElement("input");
      enabled.type = "checkbox";
      enabled.checked = r.enabled;
      enabled.setAttribute("aria-label", "Enable route " + (i + 1));
      const src = d.createElement("select"),
        target = d.createElement("select"),
        amount = d.createElement("input"),
        out = d.createElement("output");
      src.setAttribute("aria-label", "Route " + (i + 1) + " signal");
      target.setAttribute("aria-label", "Route " + (i + 1) + " trait");
      for (const name of sources) {
        const o = d.createElement("option");
        o.value = name;
        o.textContent = name;
        src.append(o);
      }
      for (const name of targets) {
        const o = d.createElement("option");
        o.value = name;
        o.textContent = name;
        target.append(o);
      }
      src.value = r.source;
      target.value = r.target;
      amount.type = "range";
      amount.min = -0.6;
      amount.max = 0.6;
      amount.step = 0.01;
      amount.value = r.amount;
      amount.setAttribute("aria-label", "Route " + (i + 1) + " strength");
      out.textContent = Math.round(r.amount * 100) + "%";
      line.append(enabled, src, target, amount, out);
      box.append(line);
      const change = () => {
        const key = scope === "global" ? "global" : currentID();
        if (!profiles[key] && Object.keys(profiles).length >= 64) {
          $("musicStatus").textContent =
            "Profile limit: 64. Use global routes or reset profiles.";
          renderRoutes();
          return;
        }
        const next = JSON.parse(
          JSON.stringify(profiles[key] || profiles.global),
        );
        next[i] = {
          source: src.value,
          target: target.value,
          amount: Number(amount.value),
          enabled: enabled.checked,
        };
        profiles[key] = validRoutes(next);
        out.textContent = Math.round(Number(amount.value) * 100) + "%";
        changed();
      };
      [enabled, src, target, amount].forEach((el) =>
        el.addEventListener("input", change),
      );
    });
    $("musicProfileLabel").textContent =
      scope === "global"
        ? "Global fallback" +
          (profiles[id]
            ? " · current world has an override"
            : " · current world inherits these routes")
        : w.Cabinet.designs[w.Cabinet.index].name +
          " · " +
          (profiles[id] ? "custom profile" : "inherits global until edited");
  }
  function cancel(message = "Analysis cancelled") {
    epoch++;
    if (worker) worker.terminate();
    worker = null;
    if ($("analysisStatus")) $("analysisStatus").textContent = message;
  }
  function release() {
    cancel("No local analysis retained");
    file = null;
    media = null;
    analysis = null;
    markers = [];
    manualTempo = null;
    taps = [];
    offset = 0;
    if ($("analysisOffset")) $("analysisOffset").value = "0";
    lookahead = false;
    if ($("lookaheadEnabled")) $("lookaheadEnabled").checked = false;
    draw();
  }
  function setFile(f, m) {
    file = f;
    media = m;
    if ($("analysisStatus"))
      $("analysisStatus").textContent =
        "Local look-ahead ready: PCM WAV, or browser-supported MP3/AAC/FLAC/Ogg/WebM within decode limits.";
  }
  async function analyze() {
    if (decoding) {
      $("analysisStatus").textContent =
        "A native decode is still finishing. Stop discards its result; wait before another analysis.";
      return;
    }
    if (!file) {
      $("analysisStatus").textContent = "Choose a playback file first.";
      return;
    }
    if (file.size > 33554432) {
      $("analysisStatus").textContent =
        "Look-ahead limit: 32 MiB. Real-time playback is unaffected.";
      return;
    }
    cancel("Reading selected file locally…");
    analysis = null;
    markers = [];
    const token = epoch;
    try {
      let buffer = await file.arrayBuffer();
      if (token !== epoch) return;
      const native = !w.AudioDecode.directPCM(buffer);
      if (native) {
        decoding = true;
        try {
          buffer = await w.AudioDecode.decode(buffer, {
            duration: media?.duration,
            Context: w.OfflineAudioContext || w.webkitOfflineAudioContext,
            cancelled: () => token !== epoch,
            progress: (text) => {
              if (token === epoch) $("analysisStatus").textContent = text;
            },
          });
        } finally {
          decoding = false;
        }
      }
      if (token !== epoch) return;
      worker = new Worker(workerURL);
      worker.onerror = () => {
        if (token === epoch)
          cancel("Worker unavailable. Real-time playback still works.");
      };
      worker.onmessage = (e) => {
        if (token !== epoch) return;
        if (e.data.error) {
          cancel(e.data.error);
          return;
        }
        if (e.data.progress !== undefined)
          $("analysisStatus").textContent =
            "Local spectral analysis " + e.data.progress + "%";
        if (e.data.result) {
          analysis = e.data.result;
          worker.terminate();
          worker = null;
          $("analysisStatus").textContent =
            "Local analysis complete · " +
            analysis.duration.toFixed(1) +
            "s · " +
            analysis.changes.length +
            " change candidates (not named song sections). Tempo " +
            (analysis.bpm
              ? analysis.bpm.toFixed(1) +
                " BPM candidate, confidence " +
                analysis.confidence.toFixed(2)
              : "unknown") +
            ". No key, mood or chord inference.";
          draw();
        }
      };
      worker.postMessage({ buffer }, [buffer]);
    } catch (e) {
      if (token === epoch) cancel(e.message);
    }
  }
  function draw() {
    const cv = $("analysisTimeline");
    if (!cv) return;
    const c = cv.getContext("2d"),
      W = cv.width,
      H = cv.height;
    c.fillStyle = "#071322";
    c.fillRect(0, 0, W, H);
    if (!analysis) {
      $("analysisDetails").textContent =
        "No analyzed track. File data and features stay in memory until stop, replacement or reload." +
        (manualTempo
          ? " Tap override " + manualTempo.toFixed(1) + " BPM."
          : "");
      return;
    }
    const rows = analysis.rows;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i],
        x = (i / rows.length) * W;
      c.fillStyle = "#67c4cb";
      c.fillRect(
        x,
        H - r.energy * (H - 24),
        Math.max(1, W / rows.length),
        r.energy * (H - 24),
      );
      const pitch = r.chroma.indexOf(Math.max(...r.chroma));
      c.fillStyle = `hsl(${pitch * 30},50%,55%)`;
      c.fillRect(x, 0, Math.max(1, W / rows.length), 9);
    }
    for (const mark of [...analysis.changes, ...markers]) {
      const x = (mark.time / analysis.duration) * W;
      c.strokeStyle = mark.manual ? "#fff" : "#d8af58";
      c.beginPath();
      c.moveTo(x, 10);
      c.lineTo(x, H);
      c.stroke();
    }
    if (media) {
      const x = (media.currentTime / analysis.duration) * W;
      c.strokeStyle = "white";
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, H);
      c.stroke();
    }
    const row =
      rows[
        Math.min(rows.length - 1, Math.floor((media?.currentTime || 0) / 0.5))
      ];
    $("analysisDetails").textContent =
      "At " +
      row.time.toFixed(1) +
      "s · RMS " +
      row.rms.toFixed(3) +
      " · spectral centroid " +
      Math.round(row.centroid) +
      " Hz · 85% rolloff " +
      Math.round(row.rolloff) +
      " Hz · flatness " +
      row.flatness.toFixed(3) +
      ". Chroma strip = pitch-class energy, not key/chords. " +
      markers.length +
      " manual markers. " +
      (manualTempo
        ? "Corrected tempo " + manualTempo.toFixed(1) + " BPM. "
        : "") +
      "These are observations, not musical truth.";
  }
  function tick() {
    if (media && analysis && performance.now() - lastDraw > 500) {
      lastDraw = performance.now();
      draw();
    }
  }
  function reset() {
    restore(null);
    release();
    renderRoutes();
    changed();
  }
  function mount() {
    renderRoutes();
    $("musicScope").onchange = (e) => {
      scope = e.target.value;
      renderRoutes();
    };
    $("musicResetRoutes").onclick = () => {
      if (scope === "global") profiles.global = defaults();
      else delete profiles[currentID()];
      renderRoutes();
      changed();
    };
    $("musicClearProfiles").onclick = () => {
      restore(null);
      renderRoutes();
      changed();
    };
    $("analyzeTrack").onclick = analyze;
    $("cancelAnalysis").onclick = () => {
      cancel();
      analysis = null;
      markers = [];
      lookahead = false;
      $("lookaheadEnabled").checked = false;
      draw();
    };
    $("lookaheadEnabled").onchange = (e) => (lookahead = e.target.checked);
    $("analysisOffset").oninput = (e) => (offset = Number(e.target.value));
    $("addMusicMarker").onclick = () => {
      if (!analysis || !media) return;
      if (markers.length >= 64) {
        $("analysisStatus").textContent = "Manual marker limit: 64";
        return;
      }
      markers.push({ time: media.currentTime, manual: true });
      draw();
    };
    $("clearMusicMarkers").onclick = () => {
      markers = [];
      draw();
    };
    $("tapMusicTempo").onclick = () => {
      const now = performance.now() / 1000;
      if (taps.length && now - taps.at(-1) > 3) taps = [];
      taps.push(now);
      if (taps.length > 9) taps.shift();
      if (taps.length > 2) {
        const gaps = taps
          .slice(1)
          .map((x, i) => x - taps[i])
          .sort((a, b) => a - b);
        manualTempo = clamp(60 / gaps[Math.floor(gaps.length / 2)], 30, 240);
        draw();
      }
    };
    for (const [id, factor] of [
      ["halfMusicTempo", 0.5],
      ["doubleMusicTempo", 2],
    ])
      $(id).onclick = () => {
        const bpm = manualTempo || analysis?.bpm;
        if (bpm) manualTempo = clamp(bpm * factor, 30, 240);
        draw();
      };
    w.addEventListener("pagehide", release);
  }
  w.MusicLab = {
    apply,
    restore,
    serialize,
    validRoutes,
    defaults,
    release,
    setFile,
    reset,
    mount,
    renderRoutes,
    tick,
    analyze,
    getAnalysis: () => analysis,
  };
})(window, document);
