/* IX — HORIZONS. Eight landscape-scale constructions, newest first. */
(function (w) {
  "use strict";
  w.WorldKernels.specs.forEach((s, i) =>
    w.D({
      id: s[0],
      name: s[1],
      edition: 9,
      captivation: 99 - i * 0.4,
      kind: "gl",
      family: [
        "ocean",
        "landscape",
        "desert",
        "organic",
        "architecture",
        "cosmic",
        "geology",
        "geometry",
      ][i],
      tag: s[8],
      blurb:
        s[8] +
        ". An entire environment: travel through its landforms, sky, water and weather. The nursery inherits these exact allowlisted landform kernels.",
      vigor: 0.4,
      theme: "dark",
      preview: "assets/previews/" + s[0] + ".webp",
      art: "linear-gradient(145deg,#071226,#28798c,#c0ac79)",
      paletteGroup: "horizon-" + i,
      motionClass: "Continuous environmental flow",
      pixelBudget: 440000,
      worldKernel: i,
      frag: w.WorldKernels.authored(i),
    }),
  );
})(window);
