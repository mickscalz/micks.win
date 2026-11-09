/* XIII — Luminous Meridians. 32 higher-fidelity environments: cast shadows,
   ambient occlusion, reflective water, aerial perspective and filmic grading. */
(function (w) {
  "use strict";
  const order = [0, 8, 16, 24, 1, 9, 17, 25, 2, 10, 18, 26, 3, 11, 19, 27, 4, 12, 20, 28, 5, 13, 21, 29, 6, 14, 22, 30, 7, 15, 23, 31],
    sonic = [
      "architecture", "cosmic", "terrain", "geometry",
      "architecture", "weather", "terrain", "geometry",
      "architecture", "fire", "terrain", "crystal",
      "architecture", "cosmic", "organic", "crystal",
      "architecture", "cosmic", "terrain", "abstract",
      "architecture", "terrain", "organic", "abstract",
      "architecture", "organic", "terrain", "abstract",
      "architecture", "terrain", "terrain", "geometry",
    ];
  w.LuminousXIII.specs.forEach((s, i) =>
    w.D({
      id: s.id,
      name: s.name,
      edition: 13,
      captivation: 99.5 - order.indexOf(i) * 0.12,
      kind: "gl",
      family: s.family,
      tag: s.note,
      blurb:
        s.note +
        ". A higher-fidelity procedural environment: cast shadows, ambient occlusion, reflective water, aerial perspective and filmic grading. Its exact kernel is available to whole-world breeding.",
      vigor: 0.68,
      theme: "dark",
      preview: "assets/previews/" + s.id + ".webp",
      art: "linear-gradient(135deg,#04101c,#2b6a86,#a9739f,#e8c78b)",
      sonic: { biome: sonic[i], hue: s.opt.hue },
      paletteGroup: "luminous-meridian-" + i,
      motionClass: i < 8 ? "Shadowed world-space architecture" : i < 16 ? "Volumetric atmospheric development" : i < 24 ? "Eroded terrain and water" : "Layered optical structure",
      lifeMechanism:
        "Bounded seeded environment development with explicit lighting; not a biological simulation or sentience.",
      pixelBudget: i < 8 ? 480000 : i < 16 ? 380000 : i < 24 ? 460000 : 520000,
      worldKernel: 52 + i,
      frag: w.WorldKernels.authored(52 + i),
    }),
  );
})(window);
