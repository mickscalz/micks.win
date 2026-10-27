/* Display-safe numerical tools shared by X's distinct bounded living systems.
   Seeded randomness, positive-dt-only state and bounded semi-fixed integration. */
(function (root) {
  "use strict";
  function random(seed) {
    let n = seed >>> 0 || 1;
    return () => {
      n ^= n << 13;
      n ^= n >>> 17;
      n ^= n << 5;
      return (n >>> 0) / 4294967296;
    };
  }
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  function channel(t, seed) {
    const k = Math.floor(t / 13),
      f0 = t / 13 - k,
      f = f0 * f0 * f0 * (f0 * (f0 * 6 - 15) + 10);
    const sample = (i) =>
      random(
        (Math.imul(i + 1, 374761393) ^ Math.imul(seed + 1, 668265263)) >>> 0,
      )();
    return sample(k) * (1 - f) + sample(k + 1) * f;
  }
  function tune(S) {
    return Object.assign(
      {
        growth: 0.65,
        mutation: 0.5,
        coupling: 0.6,
        lifecycle: 0.55,
        atmosphere: 0.65,
        symmetry: 0.5,
        drift: 0.45,
        afterglow: 0.55,
        density: 0.75,
        detail: 0.85,
        intensity: 0.65,
        color: 1,
        colorSafe: false,
      },
      S.experience || {},
    );
  }
  function steps(dt, fn) {
    if (!(dt > 0)) return;
    const bounded = Math.min(0.1, dt),
      n = Math.ceil(bounded / (1 / 60));
    for (let i = 0; i < n; i++) fn(bounded / n);
  }
  function palette(h, e, l = 60, a = 1) {
    return `hsla(${e.colorSafe ? (Math.sin(h * 0.017) > 0 ? 43 : 207) : h},${e.colorSafe ? 70 : Math.round(75 * e.color)}%,${l}%,${a})`;
  }
  function background(c, W, H, t, e, underwater = false) {
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, palette(230 + channel(t, 71) * 50, e, 7));
    g.addColorStop(0.5, palette(270 + channel(t, 19) * 70, e, 14));
    g.addColorStop(1, palette(underwater ? 195 : 185, e, underwater ? 4 : 8));
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    const halo = c.createRadialGradient(
      W * 0.28,
      H * 0.21,
      0,
      W * 0.28,
      H * 0.21,
      H * 0.6,
    );
    halo.addColorStop(
      0,
      palette(underwater ? 165 : 35, e, 65, 0.14 * e.intensity),
    );
    halo.addColorStop(1, "transparent");
    c.fillStyle = halo;
    c.fillRect(0, 0, W, H);
  }
  const api = { random, clamp, channel, tune, steps, palette, background };
  if (typeof module !== "undefined") module.exports = api;
  else root.EvolutionX = api;
})(typeof window !== "undefined" ? window : globalThis);
