/* Full-environment phenotype: separate inherited landform/sky/water/weather/
   camera kernels. No shader text in imports, no isolated organism proxy. */
(function (w) {
  "use strict";
  function create(input) {
    const recipe = w.Nursery.validate(input),
      g = recipe.genome,
      K = w.WorldKernels,
      index = K.MODULES.landform.indexOf(g.landform);
    return {
      id: recipe.id,
      name: recipe.name,
      nursery: true,
      genome: g,
      recipeSolver: "world-v3",
      kind: "glx",
      edition: 9,
      rank: 0,
      collectionRank: 0,
      captivation: 0,
      pixelBudget: 440000,
      family: "landscape",
      theme: "dark",
      tag:
        "World · " +
        g.landform +
        " / " +
        g.sky +
        " / " +
        g.water +
        " / " +
        g.weather,
      blurb:
        "Whole-world inheritance. IX uses its exact source landform field; older sources use explicit environment adapters.",
      init(R) {
        this.clock = 0;
        this.prog = R.shader(K.shader(index), "world-v3-" + index);
        if (!this.prog) throw Error("World shader unavailable");
      },
      advance(S) {
        if (S.dt > 0) this.clock += Math.min(S.dt, 0.1);
        return w.CabinetVIII.ecology.tune(S);
      },
      frame(R, S) {
        const e = this.advance(S),
          mix = (k) => g[k] * 0.65 + (e[k] ?? 0.5) * 0.35;
        R.blit(this.prog, null, {
          ...K.uniforms(g),
          uRes: [R.canvas.width, R.canvas.height],
          uTime: this.clock,
          uDt: S.dt,
          uIntensity: e.intensity,
          uFade: S.fade ?? 1,
          uMouse: [S.mouse?.x || 0, S.mouse?.y || 0],
          uRand: recipe.seed % 997,
          uGrowth: mix("growth"),
          uMutation: mix("mutation"),
          uCoupling: mix("coupling"),
          uLife: mix("lifecycle"),
          uAtmosphere: mix("atmosphere"),
          uSymmetry: mix("symmetry"),
          uDrift: mix("drift"),
          uAfterglow: mix("afterglow"),
          uColorSafe: e.colorSafe ? 1 : 0,
          uColorRange: S.experience?.color ?? 1,
        });
      },
      dispose() {
        this.prog = null;
      },
    };
  }
  w.WorldRenderer = { create };
})(window);
