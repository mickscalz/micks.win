/* ============================================================================
   THE FOURTH WING — worlds 37–38.
   Two genuinely stateful simulations. Neither is a shader "effect": both keep
   a texture alive between frames and evolve it. One grows, one remembers.
   ========================================================================== */
(function (w) {
  'use strict';
  w.DESIGNS = w.DESIGNS || [];
  var D = w.D = w.D || function (o) { w.DESIGNS.push(o); return o; };

  /* =========================================================================
     37 · LIVING CORAL — Gray–Scott reaction diffusion
     Two chemicals, one lattice, and a feed/kill rate that varies across the
     plate so spots, stripes, worms and mitosis all appear in the same frame.
     ========================================================================= */
  var RD = {
    seed: [
      'uniform sampler2D uPrev;',
      'void main(){',
      '  vec2 uv = vUv;',
      '  float u = 1.0;',
      '  float v = 0.0;',
      '  // a constellation of seeds, deterministic per visit',
      '  for (int i = 0; i < 22; i++){',
      '    float fi = float(i);',
      '    vec2 c = vec2(hash11(fi * 3.71 + uRand), hash11(fi * 7.13 + uRand * 1.7));',
      '    c = 0.14 + 0.72 * c;',
      '    float d = length((uv - c) * vec2(1.0, 1.0));',
      '    v += (1.0 - smoothstep(0.006, 0.030, d));',
      '  }',
      '  v = clamp(v, 0.0, 1.0);',
      '  u -= v;',
      '  fragColor = vec4(u, v, 0.0, 1.0);',
      '}'
    ].join('\n'),

    step: [
      'uniform sampler2D uPrev;',
      'uniform vec2 uTexel;',
      'uniform vec2 uPointer;',
      'uniform float uInject;',
      'void main(){',
      '  vec2 uv = vUv;',
      '  vec2 c = texture(uPrev, uv).rg;',
      '  vec2 lap = -c;',
      '  lap += 0.20 * (texture(uPrev, uv + vec2( uTexel.x, 0.0)).rg',
      '              +  texture(uPrev, uv + vec2(-uTexel.x, 0.0)).rg',
      '              +  texture(uPrev, uv + vec2(0.0,  uTexel.y)).rg',
      '              +  texture(uPrev, uv + vec2(0.0, -uTexel.y)).rg);',
      '  lap += 0.05 * (texture(uPrev, uv + uTexel).rg',
      '              +  texture(uPrev, uv - uTexel).rg',
      '              +  texture(uPrev, uv + vec2( uTexel.x, -uTexel.y)).rg',
      '              +  texture(uPrev, uv + vec2(-uTexel.x,  uTexel.y)).rg);',
      '',
      '  // spatially varying kinetics: different regions grow different organs',
      '  float region = 0.5 + 0.22 * sin(uv.x * 6.1 + uTime * 0.006) * cos(uv.y * 5.3);',
      '  float f = mix(0.0290, 0.0425, smoothstep(0.34, 0.66, region));',
      '  float k = mix(0.0565, 0.0645, smoothstep(0.34, 0.66, region));',
      '',
      '  float reaction = c.r * c.g * c.g;',
      '  float du = 1.0 * lap.r - reaction + f * (1.0 - c.r);',
      '  float dv = 0.50 * lap.g + reaction - (f + k) * c.g;',
      '  vec2 next = clamp(c + vec2(du, dv) * 0.92, 0.0, 1.0);',
      '',
      '  // paint new chemistry with the cursor',
      '  float pd = length((uv - uPointer) * vec2(1.0, 1.0));',
      '  float brush = (1.0 - smoothstep(0.005, 0.045, pd)) * uInject;',
      '  next.g = max(next.g, brush);',
      '  next.r = min(next.r, 1.0 - brush * 0.7);',
      '  fragColor = vec4(next, 0.0, 1.0);',
      '}'
    ].join('\n'),

    show: [
      'uniform sampler2D uState;',
      'uniform vec2 uTexel;',
      'void main(){',
      '  vec2 uv = vUv;',
      '  vec2 sd = screenUV();',
      '  float v = texture(uState, uv).g;',
      '  float vl = texture(uState, uv - vec2(uTexel.x, 0.0)).g;',
      '  float vr = texture(uState, uv + vec2(uTexel.x, 0.0)).g;',
      '  float vd = texture(uState, uv - vec2(0.0, uTexel.y)).g;',
      '  float vu = texture(uState, uv + vec2(0.0, uTexel.y)).g;',
      '  float edge = length(vec2(vr - vl, vu - vd));',
      '',
      '  vec3 col = vec3(0.0015, 0.002, 0.006);',
      '  col += vec3(0.006, 0.003, 0.018) * (0.5 + 0.5 * fbm2(uv * 4.0));',
      '  vec3 bio = mix(vec3(0.10, 0.28, 0.46), vec3(0.18, 0.90, 0.78), smoothstep(0.05, 0.42, v));',
      '  bio = mix(bio, vec3(1.00, 0.72, 0.34), smoothstep(0.34, 0.72, v));',
      '  col += bio * pow(v, 1.45) * 0.75;',
      '  col += vec3(0.72, 0.96, 1.00) * edge * 3.4 * 0.35;',
      '  col += vec3(1.00, 0.82, 0.52) * pow(max(0.0, v - 0.45), 2.0) * 0.55;',
      '',
      '  // a slow drifting caustic over the colony',
      '  col += vec3(0.16, 0.32, 0.52) * pow(0.5 + 0.5 * sin(uv.x * 16.0 + uv.y * 11.0 + uTime * 0.35), 8.0) * v * 0.30;',
      '  col *= 1.0 - 0.32 * smoothstep(0.35, 1.10, length(sd));',
      '  col *= uFade;',
      '  fragColor = vec4(finish(col, sd, 0.44), 1.0);',
      '}'
    ].join('\n')
  };

  D({
    id: 'living-coral',
    preview: 'assets/previews/living-coral.webp',
    rank: 2,
    name: 'Living Coral',
    tag: 'gray–scott · reaction diffusion',
    blurb: 'Two chemicals on a plate with nothing to do but chase each other. Left alone, they invent spots, stripes, worms and cells. It is not animated — it is alive.',
    captivation: 98,
    art: 'radial-gradient(110% 100% at 40% 40%, #ffe08a 0%, #d07b32 20%, #2ec8a8 45%, #16506e 70%, #06101e 100%)',
    kind: 'glx',
    simRes: 256,
    init: function (R) {
      var gl = R.gl;
      this.pp = R.pingpong(this.simRes, this.simRes, { float: true, wrap: gl.REPEAT });
      this.S = {
        seed: R.shader(RD.seed, 'rd_seed'),
        step: R.shader(RD.step, 'rd_step'),
        show: R.shader(RD.show, 'rd_show')
      };
      if (!this.S.seed || !this.S.step || !this.S.show) throw new Error('Reaction diffusion shader failed');
      this.texel = [1 / this.simRes, 1 / this.simRes];
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.pp.read.fbo);
      gl.clearColor(1, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      // one seed pass; from here on the chemistry is self-sustaining
      R.blit(this.S.seed, this.pp.write, { uRand: 3.17 }, []);
      this.pp.swap();
      this.age = 0;
    },
    resize: function () { },
    frame: function (R, s) {
      var i, gl = R.gl, S = this.S;
      this.age += s.dt;
      // warm up quickly on entry, then eight substeps a frame
      var steps = this.age < 1.2 ? 16 : 8;
      var inject = (s.pointer && s.pointer.active) ? 0.85 : 0.0;
      var px = s.pointer ? s.pointer.x : 0.5;
      var py = s.pointer ? s.pointer.y : 0.5;
      for (i = 0; i < steps; i++) {
        R.blit(S.step, this.pp.write, {
          uTexel: this.texel, uTime: s.t, uPointer: [px, py],
          uInject: (i === 0 ? inject : 0.0)
        }, [{ name: 'uPrev', tex: this.pp.read.tex, unit: 0 }]);
        this.pp.swap();
      }
      R.blit(S.show, null, {
        uTexel: this.texel, uRes: [R.canvas.width, R.canvas.height], uTime: s.t, uFade: s.fade,
        uMouse: [s.mouse.x, s.mouse.y], uEnergy: s.energy, uRand: s.seed
      }, [{ name: 'uState', tex: this.pp.read.tex, unit: 0 }]);
    },
    dispose: function (R) { this.pp.dispose(); }
  });

  /* =========================================================================
     38 · INFINITE REGRESS — optical video feedback
     A camera looking at its own monitor, but the monitor swallows the image
     slightly and rotates it. Everything on screen is a copy of a copy.
     ========================================================================= */
  var FB = {
    feed: [
      'uniform sampler2D uPrev;',
      '',
      'vec2 warp(vec2 p, float T){',
      '  float r = length(p);',
      '  float a = atan(p.y, p.x);',
      '  float swirl = 0.085 * sin(T * 0.17) / (0.28 + r);',
      '  a += swirl + T * 0.014;',
      '  r *= 0.9912 - 0.0025 * sin(T * 0.21);',
      '  return r * vec2(cos(a), sin(a));',
      '}',
      '',
      'void main(){',
      '  vec2 p = (vUv - 0.5) * vec2(1.0, 1.0);',
      '  p += vec2(uMouse.x, uMouse.y) * 0.006;',
      '  vec2 q = warp(p, uTime);',
      '  vec2 src = q + 0.5;',
      '  vec3 prev = texture(uPrev, clamp(src, 0.001, 0.999)).rgb;',
      '  prev *= 0.9885;',
      '',
      '  // a rotating emitter: three thin arcs and a six-fold star',
      '  float T = uTime;',
      '  float r = length(p);',
      '  float a = atan(p.y, p.x);',
      '  float em = 0.0;',
      '  for (int i = 0; i < 3; i++){',
      '    float fi = float(i);',
      '    float rr = 0.19 + fi * 0.085 + 0.012 * sin(T * 0.5 + fi);',
      '    float arc = exp(-pow((r - rr) / 0.0035, 2.0));',
      '    float gate = smoothstep(-0.3, 0.6, sin(a * (3.0 + fi) + T * (0.35 + fi * 0.17)));',
      '    em += arc * gate * (0.55 + 0.45 * sin(T * 0.9 + fi * 2.1));',
      '  }',
      '  float star = pow(abs(cos(a * 3.0 + T * 0.1)), 80.0) * exp(-r * 12.0);',
      '  em += star * 0.6;',
      '  float core = exp(-r * r * 900.0);',
      '',
      '  vec3 ink = spectrum(0.12 + r * 1.4 + T * 0.035 + uEnergy * 0.08);',
      '  ink *= 0.65 + 0.5 * sin(a * 2.0 - T * 0.4);',
      '  vec3 col = prev + ink * em * 0.055;',
      '  col += vec3(1.0, 0.94, 0.86) * core * 0.10;',
      '  col += vec3(0.14, 0.09, 0.26) * exp(-r * 3.0) * 0.004;',
      '  col = clamp(col, 0.0, 1.4);',
      '  fragColor = vec4(col, 1.0);',
      '}'
    ].join('\n'),

    show: [
      'uniform sampler2D uState;',
      'void main(){',
      '  vec2 sd = screenUV();',
      '  vec3 c = texture(uState, vUv).rgb;',
      '  // chromatic shear on the way out, like a slightly misaligned lens',
      '  vec2 off = vec2(0.0016, 0.0) * (0.4 + length(sd));',
      '  c.r = texture(uState, clamp(vUv + off, 0.001, 0.999)).r;',
      '  c.b = texture(uState, clamp(vUv - off, 0.001, 0.999)).b;',
      '  c *= 0.94 + 0.10 * pow(max(0.0, 1.0 - length(sd)), 2.0);',
      '  c *= uFade;',
      '  fragColor = vec4(finish(c, sd, 0.48), 1.0);',
      '}'
    ].join('\n')
  };

  D({
    id: 'infinite-regress',
    preview: 'assets/previews/infinite-regress.webp',
    rank: 12,
    name: 'Infinite Regress',
    tag: 'video feedback · self-similar optics',
    blurb: 'A camera pointed at the screen it is displayed on. Each frame is a slightly smaller, slightly older copy of the last — an infinite corridor made of one image.',
    captivation: 86,
    art: 'conic-gradient(from 45deg at 50% 50%, #ff9de0, #9d7bff, #4de0ff, #4dffb0, #ffe24d, #ff9de0)',
    kind: 'glx',
    simRes: 512,
    init: function (R) {
      var gl = R.gl;
      this.pp = R.pingpong(this.simRes, this.simRes, { float: true });
      this.S = {
        feed: R.shader(FB.feed, 'fb_feed'),
        show: R.shader(FB.show, 'fb_show')
      };
      if (!this.S.feed || !this.S.show) throw new Error('Feedback shader failed');
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.pp.read.fbo);
      gl.clearColor(0.01, 0.01, 0.03, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.pp.write.fbo);
      gl.clearColor(0.01, 0.01, 0.03, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    resize: function () { },
    frame: function (R, s) {
      var S = this.S;
      R.blit(S.feed, this.pp.write, {
        uTime: s.t, uDt: s.dt, uMouse: [s.mouse.x, s.mouse.y], uEnergy: s.energy
      }, [{ name: 'uPrev', tex: this.pp.read.tex, unit: 0 }]);
      this.pp.swap();
      R.blit(S.show, null, {
        uRes: [R.canvas.width, R.canvas.height], uTime: s.t, uFade: s.fade, uMouse: [s.mouse.x, s.mouse.y]
      }, [{ name: 'uState', tex: this.pp.read.tex, unit: 0 }]);
    },
    dispose: function (R) { this.pp.dispose(); }
  });

})(window);
