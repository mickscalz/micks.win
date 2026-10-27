/* Bounded, inspectable genome search. Scores are proxies, not aesthetic judgement. */
(function (root) {
  "use strict";
  const N =
    typeof module !== "undefined" ? require("./nursery.js") : root.Nursery;
  function distance(a, b) {
    a = N.upgrade(a.genome);
    b = N.upgrade(b.genome);
    let sum = 0;
    for (const k of N.traits(2)) {
      if (k === "hue") {
        const d = Math.abs(a[k] - b[k]);
        sum += Math.min(d, 360 - d) / 180;
      } else if (
        ["shape", "topology", "material", "rhythm", "force"].includes(k)
      )
        sum += a[k] === b[k] ? 0 : 1;
      else sum += Math.abs(a[k] - b[k]) / (k === "lobes" ? 9 : 1);
    }
    return sum / 17;
  }
  function quality(p) {
    const g = p.genome;
    return (
      1 -
      (Math.abs(g.lifecycle - 0.45) +
        Math.abs(g.coupling - 0.6) +
        Math.abs(g.drift - 0.35) +
        Math.abs(g.growth - 0.6)) /
        4
    );
  }
  function curate(items, limit, taste) {
    const result = [],
      remaining = [...items];
    while (remaining.length && result.length < limit) {
      let best = 0,
        score = -Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const p = remaining[i],
          novelty = result.length
            ? Math.min(...result.map((q) => distance(p, q)))
            : 1,
          s =
            0.55 * novelty +
            0.3 * quality(p) +
            0.15 * (taste ? 1 - distance(p, taste) : 0.5);
        if (s > score) {
          score = s;
          best = i;
        }
      }
      result.push(remaining.splice(best, 1)[0]);
    }
    return result;
  }
  async function run({
    parents,
    weights,
    seed = 1,
    mood = "balanced",
    generations = 6,
    candidates = 48,
    seconds = 15,
    archive = 12,
    taste = null,
    cancelled = () => false,
    progress = () => {},
    now = () => performance.now(),
    yieldTask = () => new Promise((r) => setTimeout(r, 0)),
  }) {
    parents = parents.map(N.validate);
    if (parents.length < 2 || parents.length > 32)
      throw Error("Choose 2–32 parents");
    for (const [v, max] of [
      [generations, 20],
      [candidates, 96],
      [seconds, 60],
      [archive, 24],
    ])
      if (!Number.isInteger(v) || v < 1 || v > max)
        throw Error("Invalid automation budget");
    if (taste) taste = N.validate(taste);
    const rng = N.random(seed),
      start = now(),
      made = new Map(),
      initial = parents.slice();
    let pool = initial,
      retained = [],
      generation = 0,
      reason = "generation budget";
    outer: for (; generation < generations; generation++) {
      const batch = Math.min(8, candidates - made.size),
        children = [];
      for (let i = 0; i < batch; i++) {
        if (cancelled()) {
          reason = "stopped";
          break outer;
        }
        if (now() - start >= seconds * 1000) {
          reason = "time budget";
          break outer;
        }
        const chosen = generation === 0 ? initial : pool;
        const child = N.breed(chosen, {
          seed: Math.floor(rng() * 4294967295) || 1,
          mood,
          weights: generation === 0 ? weights : undefined,
        });
        child.name =
          "Generation " +
          child.generation +
          " · " +
          child.genome.shape +
          " " +
          (made.size + 1);
        made.set(child.id, child);
        children.push(child);
        retained = curate([...retained, child], archive, taste);
        progress({
          count: made.size,
          generation: child.generation,
          retained: retained.length,
        });
        await yieldTask();
      }
      if (made.size >= candidates) {
        reason = "candidate budget";
        generation++;
        break;
      }
      // Retain source diversity, while carrying actual descendants into the next generation.
      pool = [
        ...curate(children, Math.min(4, children.length), taste),
        ...initial,
      ];
      pool = [...new Map(pool.map((p) => [p.id, p])).values()].slice(0, 32);
    }
    return {
      recipes: retained,
      ancestry: [...made.values()],
      count: made.size,
      generations: generation,
      reason,
    };
  }
  const api = { run, distance, quality, curate };
  if (typeof module !== "undefined") module.exports = api;
  else root.NurseryEvolution = api;
})(typeof window !== "undefined" ? window : globalThis);
