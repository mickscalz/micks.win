/* XI — IMPOSSIBLE SHORES. Full worldscapes interleaving matter, light and optics. */
(function (w) {
  "use strict";
  const order = [0, 10, 1, 8, 2, 11, 3, 12, 4, 9, 5, 13, 6, 14, 7, 15];
  w.WorldscapesXI.specs.forEach((s, i) =>
    w.D({
      id: s[0],
      name: s[1],
      edition: 11,
      captivation: 99 - order.indexOf(i) * 0.23,
      kind: "gl",
      family: s[5],
      tag: s[4],
      blurb:
        s[4] +
        ". A complete impossible environment, with continuously developing fields rather than an isolated creature. Its allowlisted kernel is also available to world breeding.",
      vigor: 0.65,
      theme: "dark",
      preview: "assets/previews/" + s[0] + ".webp",
      art: "linear-gradient(135deg,#071529,#287887,#935cb2,#e1bc81)",
      paletteGroup: "impossible-shore-" + i,
      motionClass:
        i < 8 ? "World-space material flow" : "Layered optical development",
      lifeMechanism:
        "Continuous seeded environmental development; not biological simulation or sentience.",
      pixelBudget: i === 6 || i === 8 ? 320000 : i < 8 ? 400000 : 500000,
      worldKernel: 20 + i,
      frag: w.WorldKernels.authored(20 + i),
    }),
  );
})(window);
