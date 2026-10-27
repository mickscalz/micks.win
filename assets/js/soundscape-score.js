/* Synesthetic composition rules, not emotion recognition or a learned model.
   Pure seeded score construction; no audio context, storage or wall clock. */
(function (root) {
  "use strict";
  const clamp = (v, a = 0, b = 1) =>
    Math.max(a, Math.min(b, Number.isFinite(v) ? v : a));
  function hash(text) {
    let h = 2166136261;
    for (const c of String(text)) {
      h ^= c.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  const biomes = {
    water: {
      match: /ocean|sea\b|water|tid(?:e|al)|river|estuar|grotto|caustic|pearl/,
      scale: "dorian",
      style: "hybrid",
      bpm: 56,
      noise: 0.18,
      air: 700,
    },
    crystal: {
      match: /crystal|glass|diamond|prism|lightning|ice|glaci/,
      scale: "lydian",
      style: "melodic",
      bpm: 64,
      noise: 0.04,
      air: 1800,
    },
    rain: {
      match: /\brain\b|rainfall|monsoon|storm/,
      scale: "minor pentatonic",
      style: "hybrid",
      bpm: 66,
      noise: 0.21,
      air: 1450,
    },
    organic: {
      match:
        /organic|garden|forest|coral|mycel|root|spore|moth|bloom|wing|colony|living/,
      scale: "major pentatonic",
      style: "melodic",
      bpm: 62,
      noise: 0.09,
      air: 1050,
    },
    fire: {
      match: /fire|ember|molten|lava|volcan|dying star|solar|saffron/,
      scale: "phrygian",
      style: "cinematic",
      bpm: 48,
      noise: 0.14,
      air: 620,
    },
    orbit: {
      match: /orbit|ring|tesseract|engine|geometr|stair|frame/,
      scale: "whole tone",
      style: "hybrid",
      bpm: 60,
      noise: 0.035,
      air: 1300,
    },
    architecture: {
      match:
        /cathedral|palace|basilica|vault|labyrinth|architect|arcade|column/,
      scale: "lydian",
      style: "cinematic",
      bpm: 50,
      noise: 0.065,
      air: 1100,
    },
    cosmic: {
      match: /cosmi|nebula|star|eclipse|space|celestial|galax|infinity/,
      scale: "whole tone",
      style: "cinematic",
      bpm: 44,
      noise: 0.12,
      air: 950,
    },
    wind: {
      match: /cloud|wind|aurora|atmospher|silk|sail|veil/,
      scale: "lydian",
      style: "hybrid",
      bpm: 54,
      noise: 0.16,
      air: 1250,
    },
    earth: {
      match: /terrain|dune|mountain|ridge|badland|geolog|landscape|basin/,
      scale: "minor pentatonic",
      style: "cinematic",
      bpm: 50,
      noise: 0.13,
      air: 600,
    },
    flow: {
      match: /flow|ribbon|wave|fluid|current/,
      scale: "dorian",
      style: "melodic",
      bpm: 66,
      noise: 0.07,
      air: 1200,
    },
    abstract: {
      match: /.*/,
      scale: "major pentatonic",
      style: "hybrid",
      bpm: 58,
      noise: 0.065,
      air: 1200,
    },
  };
  const scales = {
    dorian: [0, 2, 3, 5, 7, 9, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    "minor pentatonic": [0, 3, 5, 7, 10],
    "major pentatonic": [0, 2, 4, 7, 9],
    "whole tone": [0, 2, 4, 6, 8, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
  };
  function paletteHue(art) {
    let x = 0,
      y = 0,
      total = 0;
    for (const m of String(art || "").matchAll(/#([0-9a-f]{6})\b/gi)) {
      const rgb = [0, 2, 4].map(
          (k) => parseInt(m[1].slice(k, k + 2), 16) / 255,
        ),
        hi = Math.max(...rgb),
        lo = Math.min(...rgb),
        delta = hi - lo;
      if (delta < 0.1 || hi < 0.2) continue;
      let h =
        hi === rgb[0]
          ? (rgb[1] - rgb[2]) / delta
          : hi === rgb[1]
            ? 2 + (rgb[2] - rgb[0]) / delta
            : 4 + (rgb[0] - rgb[1]) / delta;
      h *= Math.PI / 3;
      const weight = delta * hi;
      x += Math.cos(h) * weight;
      y += Math.sin(h) * weight;
      total += weight;
    }
    return total && Math.hypot(x, y) > 0.05
      ? ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
      : 210;
  }
  function profile(input = {}, override = "auto") {
    let g = input.genome || {};
    if (
      !input.genome &&
      Number.isInteger(input.worldKernel) &&
      root.WorldKernels
    )
      g = root.WorldKernels.defaults(input.worldKernel);
    const kernel = root.WorldKernels?.MODULES.landform.indexOf(g.landform);
    const intent =
      input.sonic ||
      (kernel >= 36 ? root.ResonantXII?.blueprints[kernel - 36] : null) ||
      {};
    const words = [
      g.landform,
      input.id,
      input.name,
      input.tag,
      input.family,
      input.motionClass,
    ]
      .join(" ")
      .toLowerCase();
    // Prefer explicit scene intent, then specific subject, not an unrelated ID hash.
    const chosen =
      intent.biome && biomes[intent.biome]
        ? intent.biome
        : Object.keys(biomes).find((k) => biomes[k].match.test(words));
    const b = biomes[chosen];
    const seed = hash(input.id || words),
      variant = hash((input.id || words) + ":motif");
    const hue = Number.isFinite(g.hue)
      ? ((g.hue % 360) + 360) % 360
      : (intent.hue ?? paletteHue(input.art));
    const warmth = (1 + Math.cos(((hue - 35) * Math.PI) / 180)) / 2;
    const motion = clamp(g.drift ?? input.vigor ?? 0.5),
      life = clamp(g.lifecycle ?? 0.55),
      depth = clamp(g.depth ?? 0.65),
      density = clamp(g.coupling ?? 0.6),
      sparkle = clamp(
        g.afterglow ?? (/light|lum|shimmer|neon/.test(words) ? 0.8 : 0.45),
      );
    const style = ["melodic", "cinematic", "hybrid"].includes(override)
      ? override
      : intent.style || b.style;
    const scaleName = scales[intent.scale] ? intent.scale : b.scale,
      scale = scales[scaleName] || scales[b.scale];
    const rootNote =
      45 + [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5][Math.floor(hue / 30) % 12];
    const bpm = Math.round(
      clamp(
        b.bpm +
          (motion - 0.5) * 18 +
          (life - 0.5) * 10 +
          (style === "melodic" ? 6 : style === "cinematic" ? -4 : 0),
        40,
        84,
      ),
    );
    const motif = Array.from({ length: 16 }, (_, i) => {
      const n = hash(variant + ":" + i);
      return {
        degree: (n % 3) * 2,
        octave: (n >>> 8) % 2,
        rest: i !== 0 && (n >>> 12) % 5 < (style === "cinematic" ? 3 : 1),
        length: style === "cinematic" ? 2 : (n >>> 16) % 3 === 0 ? 1.5 : 0.8,
      };
    });
    return {
      fingerprint: hash(
        seed + ":" + style + ":" + hue.toFixed(2) + ":" + scaleName + ":" + bpm,
      )
        .toString(16)
        .padStart(8, "0"),
      seed,
      biome: chosen,
      style,
      hue,
      warmth,
      motion,
      life,
      depth,
      density,
      sparkle,
      root: rootNote,
      scaleName,
      scale,
      bpm,
      motif,
      chords: [
        0,
        Math.min(3, scale.length - 1),
        Math.min(4, scale.length - 1),
        1,
      ],
      wet: g.water
        ? g.water !== "dry"
        : chosen === "water" || chosen === "rain",
      bright: sparkle > 0.65,
      wind: 0.25 + motion * 0.5,
      phase: seed / 4294967296,
      texture:
        g.material === "glass"
          ? "glassy overtones"
          : g.material === "silk"
            ? "soft harmonic veil"
            : g.material === "mineral"
              ? "rounded mineral chimes"
              : "rounded ambient harmonics",
      cutoff: Math.round(
        550 +
          (1 - warmth) * 650 +
          sparkle * 700 +
          (g.material === "glass" ? 250 : g.material === "silk" ? -150 : 0),
      ),
      air: b.air,
      noise: b.noise,
      width: 0.25 + depth * 0.5,
      space: 0.08 + depth * 0.17,
      melody: style === "cinematic" ? 0.035 : style === "hybrid" ? 0.075 : 0.1,
      pad: style === "melodic" ? 0.045 : style === "hybrid" ? 0.065 : 0.085,
    };
  }
  function note(p, index) {
    const bar = Math.floor(index / 16) % 4,
      chord = p.chords[bar],
      m = p.motif[index % 16],
      degree =
        chord +
        m.degree +
        (index % 4 === 0
          ? 0
          : hash(p.seed + ":phrase:" + Math.floor(index / 64)) % 2);
    return {
      midi:
        p.root +
        12 +
        p.scale[degree % p.scale.length] +
        12 * Math.floor(degree / p.scale.length) +
        m.octave * 12,
      rest: m.rest,
      duration: (60 / p.bpm) * m.length,
      chord,
      accent: index % 4 === 0 ? 1 : 0.72,
    };
  }
  function describe(p) {
    return (
      p.style +
      " · " +
      p.biome +
      " · " +
      p.scaleName +
      " · " +
      p.bpm +
      " BPM · " +
      ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"][
        p.root % 12
      ] +
      " · " +
      p.texture +
      " · fingerprint " +
      p.fingerprint
    );
  }
  const api = { profile, note, describe, hash, scales };
  if (typeof module !== "undefined") module.exports = api;
  else root.SoundscapeScore = api;
})(typeof window !== "undefined" ? window : globalThis);
