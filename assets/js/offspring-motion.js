/* Presentation pacing only: recipes/identities are unchanged. Authored founders
   retain their original clock; newborn children start in a developed flow phase.
   No wall-clock reads, randomness, or movement when simulation dt is zero. */
(function (root) {
  "use strict";
  const clamp = (n) => Math.max(0, Math.min(1, n));
  function profile(recipe) {
    if (!recipe.parents?.length) return { phase: 0, rate: 1 };
    const g = recipe.genome;
    // Mix all 32 seed bits: neighbouring seeds must not start almost in sync.
    let seed = recipe.seed >>> 0;
    seed = Math.imul(seed ^ (seed >>> 16), 0x7feb352d);
    seed = Math.imul(seed ^ (seed >>> 15), 0x846ca68b);
    seed = (seed ^ (seed >>> 16)) >>> 0;
    return {
      phase: 6 + (seed / 4294967296) * 29,
      rate: 2.5 + clamp(g.lifecycle) * 3 + clamp(g.drift) * 1.5,
    };
  }
  function time(clock, p) {
    return p.phase + clock * p.rate;
  }
  function awaken(agents, recipe) {
    if (!recipe.parents?.length) return;
    for (const p of agents) {
      const a = p.a + (recipe.seed % 101) * 0.017;
      p.vx = Math.cos(a) * 0.025;
      p.vy = Math.sin(a) * 0.025;
    }
  }
  const api = { profile, time, awaken };
  if (typeof module !== "undefined") module.exports = api;
  else root.OffspringMotion = api;
})(typeof window !== "undefined" ? window : globalThis);
