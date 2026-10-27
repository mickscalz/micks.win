/* A small, locally trained pairwise ranker. It learns YOUR comparisons,
   not universal beauty. No network, image storage or implicit ratings. */
(function (root) {
  "use strict";
  const N =
    typeof module !== "undefined" ? require("./nursery.js") : root.Nursery;
  const categories = {
    shape: N.FORMS,
    topology: N.MODULES.topology,
    material: N.MODULES.material,
    rhythm: N.MODULES.rhythm,
    force: Array.from({ length: 8 }, (_, i) => i),
  };
  const labels = [
    ...Object.entries(categories).flatMap(([k, values]) =>
      values.map((v) => k + ":" + v),
    ),
    ...N.KEYS,
    "depth",
    "relief",
    "lobes",
    "hue:sin",
    "hue:cos",
    "image:light",
    "image:contrast",
    "image:saturation",
    "image:edges",
    "image:occupancy",
    "image:red",
    "image:green",
    "image:blue",
  ];
  const LIMIT = 128,
    sigmoid = (x) => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, x)))),
    dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  function pixels(data, width, height) {
    if (data.length !== width * height * 4 || width < 2 || height < 2)
      throw Error("Invalid rendered observation");
    let sum = 0,
      sq = 0,
      sat = 0,
      edges = 0,
      occupied = 0,
      r = 0,
      g = 0,
      b = 0;
    const grey = new Float64Array(width * height);
    for (let i = 0; i < grey.length; i++) {
      const R = data[i * 4] / 255,
        G = data[i * 4 + 1] / 255,
        B = data[i * 4 + 2] / 255,
        y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
      grey[i] = y;
      sum += y;
      sq += y * y;
      sat += Math.max(R, G, B) - Math.min(R, G, B);
      occupied += y > 0.06 ? 1 : 0;
      r += R;
      g += G;
      b += B;
    }
    for (let y = 1; y < height; y++)
      for (let x = 1; x < width; x++) {
        const i = y * width + x;
        edges +=
          Math.abs(grey[i] - grey[i - 1]) + Math.abs(grey[i] - grey[i - width]);
      }
    const count = grey.length;
    return [
      sum / count,
      Math.sqrt(Math.max(0, sq / count - (sum / count) ** 2)),
      sat / count,
      edges / (count * 2),
      occupied / count,
      r / count,
      g / count,
      b / count,
    ];
  }
  function features(recipe, image) {
    const g = N.upgrade(N.validate(recipe).genome);
    if (
      !Array.isArray(image) ||
      image.length !== 8 ||
      image.some((x) => !Number.isFinite(x) || x < 0 || x > 1)
    )
      throw Error("Missing rendered features");
    return [
      ...Object.entries(categories).flatMap(([k, values]) =>
        values.map((v) => (g[k] === v ? 1 : 0)),
      ),
      ...N.KEYS.map((k) => g[k]),
      g.depth,
      g.relief,
      (g.lobes - 3) / 9,
      (Math.sin((g.hue * Math.PI) / 180) + 1) / 2,
      (Math.cos((g.hue * Math.PI) / 180) + 1) / 2,
      ...image,
    ];
  }
  function vector(x) {
    if (
      !Array.isArray(x) ||
      x.length !== labels.length ||
      x.some((v) => !Number.isFinite(v) || v < 0 || v > 1)
    )
      throw Error("Invalid preference features");
    return x.slice();
  }
  function pair(p) {
    if (
      !p ||
      typeof p.winner !== "string" ||
      typeof p.loser !== "string" ||
      p.winner === p.loser ||
      ![p.winner, p.loser].every((s) =>
        /^(child-[a-f0-9]{16}|(?:source|founder):[a-z0-9-]{1,70})$/.test(s),
      )
    )
      throw Error("Invalid comparison");
    return { winner: p.winner, loser: p.loser, a: vector(p.a), b: vector(p.b) };
  }
  function create(input = []) {
    if (!Array.isArray(input) || input.length > LIMIT)
      throw Error("Comparison budget exceeded");
    let pairs = [
        ...new Map(
          input.map(pair).map((p) => [[p.winner, p.loser].sort().join("|"), p]),
        ).values(),
      ],
      weights = new Array(labels.length).fill(0);
    function fit() {
      weights.fill(0);
      if (!pairs.length) return;
      for (let epoch = 0; epoch < 160; epoch++) {
        const grad = weights.map((w) => 0.04 * w);
        for (const p of pairs) {
          const delta = p.a.map((v, i) => v - p.b[i]),
            err = sigmoid(dot(weights, delta)) - 1;
          delta.forEach((v, i) => (grad[i] += (err * v) / pairs.length));
        }
        weights = weights.map((v, i) => v - 0.6 * grad[i]);
      }
    }
    fit();
    return {
      add(winner, loser, a, b) {
        const p = pair({ winner, loser, a, b });
        pairs = pairs.filter(
          (q) =>
            ![q.winner, q.loser].every((id) => id === winner || id === loser),
        );
        pairs.push(p);
        pairs = pairs.slice(-LIMIT);
        fit();
      },
      predict(x) {
        return sigmoid(dot(weights, vector(x)));
      },
      get ready() {
        return pairs.length >= 3;
      },
      get count() {
        return pairs.length;
      },
      get strength() {
        return this.ready ? Math.min(1, pairs.length / 20) : 0;
      },
      snapshot() {
        return pairs.map(pair);
      },
      explain() {
        return weights
          .map((weight, i) => ({ feature: labels[i], weight }))
          .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
          .slice(0, 8);
      },
      clear() {
        pairs = [];
        fit();
      },
    };
  }
  const api = { create, features, pixels, labels, LIMIT };
  if (typeof module !== "undefined") module.exports = api;
  else root.PreferenceModel = api;
})(typeof window !== "undefined" ? window : globalThis);
