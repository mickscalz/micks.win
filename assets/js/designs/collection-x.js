/* X — IMMENSITIES. Editorial ordering interleaves scale, optics and living systems. */
(function (w) {
  "use strict";
  const order = [0, 1, 12, 2, 8, 13, 3, 9, 4, 14, 5, 10, 6, 15, 7, 11];
  function register(i, id, name, family, tag, kind, extra) {
    const d = {
      id,
      name,
      edition: 10,
      captivation: 99 - order.indexOf(i) * 0.22,
      kind,
      family,
      tag,
      blurb:
        tag +
        ". Slowly diverging developmental epochs unfold without scene cuts. Procedural worlds, not recordings or sentient life.",
      vigor: 0.65,
      theme: "dark",
      preview: "assets/previews/" + id + ".webp",
      art: "linear-gradient(135deg,#09132e,#235b9d,#cd54ad,#f4c770)",
      paletteGroup: "immensity-" + i,
      motionClass: "Continuous developmental flow",
      lifeMechanism:
        kind === "2d"
          ? "Bounded growth, reproduction, mutation and renewal with eased motion."
          : "Seeded quintic developmental epochs; continuously evolving environment fields.",
    };
    Object.assign(d, extra);
    w.D(d);
    return d;
  }
  w.CabinetX = { register };
  w.HorizonX.specs.forEach((s, i) =>
    register(i, s[0], s[1], s[9], s[8], "gl", {
      worldKernel: 8 + i,
      pixelBudget: [
        400000, 320000, 390000, 380000, 440000, 420000, 390000, 420000, 330000,
        600000, 420000, 440000,
      ][i],
      frag: w.WorldKernels.authored(8 + i),
    }),
  );
})(window);
