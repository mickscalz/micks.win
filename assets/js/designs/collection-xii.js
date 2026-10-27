/* XII — Resonant Infinities. Architecture, terrain, light and matching scores. */
(function (w) {
  "use strict";
  const order = [0, 9, 1, 12, 2, 8, 3, 13, 4, 10, 5, 14, 6, 11, 7, 15],
    biomes = [
      "water",
      "orbit",
      "fire",
      "architecture",
      "orbit",
      "cosmic",
      "crystal",
      "earth",
      "wind",
      "organic",
      "flow",
      "crystal",
      "organic",
      "cosmic",
      "crystal",
      "water",
    ];
  w.ResonantXII.specs.forEach((s, i) =>
    w.D({
      id: s[0],
      name: s[1],
      edition: 12,
      captivation: 99 - order.indexOf(i) * 0.22,
      kind: "gl",
      family: s[5],
      tag: s[4],
      blurb:
        s[4] +
        ". A full procedural environment with its own harmonically structured musical fingerprint. Sound is opt-in; its exact environment kernel is available to whole-world breeding.",
      vigor: 0.62,
      theme: "dark",
      preview: "assets/previews/" + s[0] + ".webp",
      art: "linear-gradient(135deg,#071626,#336e84,#9e72af,#dbbf83)",
      sonic: w.ResonantXII.blueprints[i],
      paletteGroup: "resonant-infinity-" + i,
      motionClass:
        i < 8
          ? "Developing world-space geometry"
          : "Continuous layered optical flow",
      lifeMechanism:
        "Bounded seeded environment development, not sentience or a biological simulation.",
      pixelBudget:
        i === 5 || i === 7 || i === 13 ? 320000 : i < 8 ? 400000 : 500000,
      worldKernel: 36 + i,
      frag: w.WorldKernels.authored(36 + i),
    }),
  );
})(window);
