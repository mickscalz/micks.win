/* ============================================================================
   WORLDS 01–06
   01 Singular Bloom   · volumetric nebula around a lensing singularity
   02 Chroma Flux      · full GPU Navier–Stokes fluid, iridescent dye
   03 Hyperspace       · warp tunnel, chromatic streaks
   04 Event Horizon    · Schwarzschild ray-traced black hole + accretion disk
   05 Aurora Cathedral · volumetric curtains over ice water
   06 Silk Currents    · 65k GPU particles, curl-noise, feedback trails
   ========================================================================== */
(function (w) {
  'use strict';
  w.DESIGNS = w.DESIGNS || [];
  var D = w.D = w.D || function (o) { w.DESIGNS.push(o); return o; };

  /* ─────────────────────────────  01 · SINGULAR BLOOM  ─────────────────── */
  D({
    id: 'singular-bloom',
    preview: 'assets/previews/singular-bloom.webp',
    rank: 1,
    name: 'Singular Bloom',
    tag: 'volumetric nebula · gravitational lens',
    blurb: 'A galaxy of light caught mid-collapse. Every photon is bent before it reaches you — the dark at the centre is not empty, it is full.',
    captivation: 99,
    art: 'radial-gradient(120% 90% at 30% 78%, #ff8a3d 0%, #ff3d7f 18%, #7a2bff 44%, #12043a 70%, #04040a 100%)',
    kind: 'gl',
    frag: [
      'float nebula(vec3 p){',
      '  float r = length(p.xz);',
      '  float disk = exp(-abs(p.y) * (1.05 + 2.4 / (0.65 + r))) * exp(-r * 0.245);',
      '  float arms = 0.42 + 0.58 * sin(atan(p.z, p.x) * 2.0 + r * 1.65 - uTime * 0.42);',
      '  float shell = disk * arms;',
      '  if (shell < 0.012) return 0.0;          // skip the expensive noise outside the galaxy',
      '  float t = uTime * 0.055;',
      '  vec3 q = p;',
      '  q.xz = rot2(t * 0.7 + length(p) * 0.20) * q.xz;',
      '  q.y -= t * 0.85;',
      '  float n = smoothstep(0.34, 0.90, fbm3(q * 1.02));',
      '  return n * shell;',
      '}',
      '',
      'void main(){',
      '  vec2 uv = screenUV();',
      '  float T = uTime;',
      '  float ca = T * 0.062 + uMouse.x * 0.85;',
      '  float hh = 1.62 + 0.78 * sin(T * 0.043) + uMouse.y * 1.10;',
      '  vec3 ro = vec3(sin(ca) * 5.6, hh, cos(ca) * 5.6);',
      '  mat3 cam = lookAt(ro, vec3(0.0), vec3(0.0, 1.0, 0.0));',
      '  vec3 rd = normalize(cam * vec3(uv, 1.32));',
      '',
      '  // gravitational lens: bend the ray toward the singularity',
      '  vec3 bh = vec3(0.0);',
      '  float b = length(cross(bh - ro, rd));',
      '  float bend = 0.44 / (b * b + 0.20);',
      '  rd = normalize(mix(rd, normalize(bh - ro), clamp(bend, 0.0, 0.60)));',
      '',
      '  float t = 0.45;',
      '  vec3 col = vec3(0.0);',
      '  float trans = 1.0;',
      '  for (int i = 0; i < 58; i++){',
      '    vec3 p = ro + rd * t;',
      '    float r = length(p);',
      '    float d = nebula(p) * 2.30;',
      '    if (d > 0.0025){',
      '      float heat = exp(-r * 1.05);',
      '      vec3 emit = pal(0.68 - r * 0.052 + d * 0.16,',
      '                      vec3(0.32, 0.24, 0.44), vec3(0.54, 0.40, 0.54),',
      '                      vec3(1.00, 0.94, 0.86), vec3(0.00, 0.15, 0.40));',
      '      emit *= 0.26 + 1.45 * d;',
      '      emit += vec3(1.00, 0.44, 0.16) * heat * heat * 1.85;',
      '      emit += vec3(0.35, 0.55, 1.00) * smoothstep(4.5, 1.0, r) * 0.06;',
      '      float a = clamp(d * 0.60, 0.0, 1.0);',
      '      col += emit * a * trans * 1.30;',
      '      trans *= 1.0 - a * 0.94;',
      '    }',
      '    t += 0.105 + t * 0.030;',
      '    if (trans < 0.012) break;',
      '  }',
      '',
      '  // lensed background stars',
      '  vec2 su = vec2(atan(rd.z, rd.x) * 1.15, asin(clamp(rd.y, -1.0, 1.0)) * 1.9);',
      '  float st = starLayer(su * 5.5, 1.0, 30.0, 2.0);',
      '  st += starLayer(su * 11.0 + 4.0, 1.0, 40.0, 9.0) * 0.55;',
      '  col += vec3(0.72, 0.84, 1.00) * st * trans * 0.85;',
      '',
      '  // photon ring + core',
      '  float rr = length(uv);',
      '  col += vec3(1.00, 0.72, 0.36) * exp(-pow((rr - 0.082) * 24.0, 2.0)) * 0.38;',
      '  col += vec3(1.00, 0.92, 0.80) * pow(max(0.0, 1.0 - rr * 9.0), 3.0) * 0.55;',
      '',
      '  col *= 0.55 + 0.45 * uFade;',
      '  fragColor = vec4(finish(col, uv, 0.52), 1.0);',
      '}'
    ].join('\n')
  });

  /* ──────────────────────────────  02 · CHROMA FLUX  ───────────────────── */
  var FLUID = {
    advect: [
      'uniform sampler2D uVel;',
      'uniform sampler2D uSrc;',
      'uniform vec2  uTexel;',
      'uniform float uDissipation;',
      'void main(){',
      '  vec2 v = texture(uVel, vUv).xy;',
      '  vec2 coord = vUv - uDt * v * uTexel;',
      '  vec4 r = texture(uSrc, coord);',
      '  fragColor = r * uDissipation;',
      '}'
    ].join('\n'),
    force: [
      'uniform sampler2D uVel;',
      'uniform vec2  uPoint;',
      'uniform vec2  uForce;',
      'uniform float uRadius;',
      'uniform float uAspect;',
      'void main(){',
      '  vec2 p = vUv - uPoint;',
      '  p.x *= uAspect;',
      '  float f = exp(-dot(p, p) / max(uRadius, 1e-5));',
      '  fragColor = vec4(texture(uVel, vUv).xy + uForce * f, 0.0, 1.0);',
      '}'
    ].join('\n'),
    divergence: [
      'uniform sampler2D uVel;',
      'uniform vec2 uTexel;',
      'void main(){',
      '  float l = texture(uVel, vUv - vec2(uTexel.x, 0.0)).x;',
      '  float r = texture(uVel, vUv + vec2(uTexel.x, 0.0)).x;',
      '  float b = texture(uVel, vUv - vec2(0.0, uTexel.y)).y;',
      '  float t = texture(uVel, vUv + vec2(0.0, uTexel.y)).y;',
      '  vec2  c = texture(uVel, vUv).xy;',
      '  if (vUv.x - uTexel.x < 0.0) l = -c.x;',
      '  if (vUv.x + uTexel.x > 1.0) r = -c.x;',
      '  if (vUv.y - uTexel.y < 0.0) b = -c.y;',
      '  if (vUv.y + uTexel.y > 1.0) t = -c.y;',
      '  fragColor = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0);',
      '}'
    ].join('\n'),
    pressure: [
      'uniform sampler2D uPressure;',
      'uniform sampler2D uDivergence;',
      'uniform vec2 uTexel;',
      'void main(){',
      '  float l = texture(uPressure, vUv - vec2(uTexel.x, 0.0)).x;',
      '  float r = texture(uPressure, vUv + vec2(uTexel.x, 0.0)).x;',
      '  float b = texture(uPressure, vUv - vec2(0.0, uTexel.y)).x;',
      '  float t = texture(uPressure, vUv + vec2(0.0, uTexel.y)).x;',
      '  float d = texture(uDivergence, vUv).x;',
      '  fragColor = vec4((l + r + b + t - d) * 0.25, 0.0, 0.0, 1.0);',
      '}'
    ].join('\n'),
    gradient: [
      'uniform sampler2D uPressure;',
      'uniform sampler2D uVel;',
      'uniform vec2 uTexel;',
      'void main(){',
      '  float l = texture(uPressure, vUv - vec2(uTexel.x, 0.0)).x;',
      '  float r = texture(uPressure, vUv + vec2(uTexel.x, 0.0)).x;',
      '  float b = texture(uPressure, vUv - vec2(0.0, uTexel.y)).x;',
      '  float t = texture(uPressure, vUv + vec2(0.0, uTexel.y)).x;',
      '  vec2 v = texture(uVel, vUv).xy - vec2(r - l, t - b) * 0.5;',
      '  fragColor = vec4(v, 0.0, 1.0);',
      '}'
    ].join('\n'),
    splatDye: [
      'uniform sampler2D uSrc;',
      'uniform vec2  uPoint;',
      'uniform vec3  uColor;',
      'uniform float uRadius;',
      'uniform float uAspect;',
      'void main(){',
      '  vec2 p = vUv - uPoint;',
      '  p.x *= uAspect;',
      '  float f = exp(-dot(p, p) / max(uRadius, 1e-5));',
      '  vec3 base = texture(uSrc, vUv).rgb;',
      '  fragColor = vec4(base + uColor * f, 1.0);',
      '}'
    ].join('\n'),
    display: [
      'uniform sampler2D uDye;',
      'uniform sampler2D uVel;',
      'void main(){',
      '  vec3 c = texture(uDye, vUv).rgb;',
      '  // shade by the flow: fake refraction highlights off the velocity field',
      '  vec2 v = texture(uVel, vUv).xy;',
      '  float sp = length(v);',
      '  vec2 g = vec2(',
      '    length(texture(uVel, vUv + vec2(0.002, 0.0)).xy) - length(texture(uVel, vUv - vec2(0.002, 0.0)).xy),',
      '    length(texture(uVel, vUv + vec2(0.0, 0.002)).xy) - length(texture(uVel, vUv - vec2(0.0, 0.002)).xy));',
      '  float spec = pow(max(0.0, dot(normalize(g + 1e-5), normalize(vec2(0.7, 0.7)))), 6.0);',
      '  c += vec3(0.55, 0.72, 1.0) * spec * 0.16 * smoothstep(0.05, 0.9, sp);',
      '  c += vec3(0.10, 0.05, 0.20) * 0.35;',
      '  c *= 1.0 - 0.35 * smoothstep(0.30, 1.05, length(vUv - 0.5));',
      '  c *= uFade;',
      '  fragColor = vec4(finish(c * 1.15, vUv - 0.5, 0.30), 1.0);',
      '}'
    ].join('\n')
  };

  D({
    id: 'chroma-flux',
    preview: 'assets/previews/chroma-flux.webp',
    rank: 3,
    name: 'Chroma Flux',
    tag: 'navier–stokes · live gpu fluid',
    blurb: 'Not a recording — a real fluid solved on your GPU, sixty times a second. Push the cursor through it and it remembers you.',
    captivation: 97,
    art: 'radial-gradient(90% 70% at 20% 25%, #12f7c8 0%, #2b7bff 30%, #7a2bff 55%, #ff2b8f 78%, #0b0418 100%)',
    kind: 'glx',
    simRes: 168,
    dyeRes: 480,
    init: function (R) {
      var gl = R.gl;
      this.pVel = R.pingpong(this.simRes, this.simRes, { rg: true, float: true });
      this.pDye = R.pingpong(this.dyeRes, this.dyeRes, { float: true });
      this.pPrs = R.pingpong(this.simRes, this.simRes, { r: true, float: true });
      this.div = R.target(this.simRes, this.simRes, { r: true, float: true });
      var S = {};
      S.advect = R.shader(FLUID.advect, 'f_advect');
      S.force = R.shader(FLUID.force, 'f_force');
      S.diverge = R.shader(FLUID.divergence, 'f_div');
      S.press = R.shader(FLUID.pressure, 'f_press');
      S.grad = R.shader(FLUID.gradient, 'f_grad');
      S.splat = R.shader(FLUID.splatDye, 'f_splat');
      S.show = R.shader(FLUID.display, 'f_show');
      this.S = S;
      this.simTexel = [1 / this.simRes, 1 / this.simRes];
      this.dyeTexel = [1 / this.dyeRes, 1 / this.dyeRes];
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.pDye.read.fbo);
      gl.clearColor(0.03, 0.02, 0.07, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.inited = false;
    },
    resize: function () { },
    frame: function (R, s) {
      var gl = R.gl, S = this.S, i;
      var dt = Math.min(s.dt, 1 / 45);
      this.aspect = s.w / Math.max(s.h, 1);

      if (!this.inited) {                    // opening bloom
        for (i = 0; i < 7; i++) {
          this.splat(R, 0.5 + 0.32 * Math.cos(i * 2.4), 0.5 + 0.30 * Math.sin(i * 2.4),
            Math.cos(i * 2.4) * 190, Math.sin(i * 2.4) * 190,
            [0.30 + 0.7 * Math.abs(Math.cos(i * 1.7)), 0.25 + 0.6 * Math.abs(Math.sin(i * 2.1)), 0.55 + 0.45 * Math.abs(Math.cos(i * 0.9))],
            0.055);
        }
        this.inited = true;
      }

      // autonomous jets — the fluid keeps moving when nobody touches it
      var t = s.t;
      if (t % 1 < dt) { }
      this.autoAcc = (this.autoAcc || 0) + dt;
      if (this.autoAcc > 0.42) {
        this.autoAcc = 0;
        var a = t * 0.7 + Math.sin(t * 0.31) * 3.0;
        var px = 0.5 + 0.34 * Math.cos(a), py = 0.5 + 0.30 * Math.sin(a * 1.31);
        var c = [0.5 + 0.5 * Math.sin(t * 0.7), 0.5 + 0.5 * Math.sin(t * 0.7 + 2.1), 0.5 + 0.5 * Math.sin(t * 0.7 + 4.2)];
        this.splat(R, px, py, Math.cos(a + 1.57) * 260, Math.sin(a + 1.57) * 260, c, 0.020);
      }

      // pointer force
      if (s.pointer.active) {
        var dx = (s.pointer.x - (s.pointer.px || s.pointer.x));
        var dy = (s.pointer.y - (s.pointer.py || s.pointer.y));
        this.splat(R, s.pointer.x, s.pointer.y, dx * 9000, dy * 9000,
          [0.85 + 0.15 * Math.sin(t * 3.1), 0.45 + 0.35 * Math.sin(t * 2.2 + 2.0), 1.0], 0.012);
      }
      s.pointer.px = s.pointer.x; s.pointer.py = s.pointer.y;

      // 1. advect velocity
      R.blit(S.advect, this.pVel.write, { uTexel: this.simTexel, uDissipation: 0.9985 },
        [{ name: 'uVel', tex: this.pVel.read.tex, unit: 0 }, { name: 'uSrc', tex: this.pVel.read.tex, unit: 0 }]);
      this.pVel.swap();

      // 2. divergence
      R.blit(S.diverge, this.div, { uTexel: this.simTexel }, [{ name: 'uVel', tex: this.pVel.read.tex, unit: 0 }]);

      // 3. pressure solve
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.pPrs.read.fbo);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      for (i = 0; i < 12; i++) {
        R.blit(S.press, this.pPrs.write, { uTexel: this.simTexel },
          [{ name: 'uPressure', tex: this.pPrs.read.tex, unit: 0 }, { name: 'uDivergence', tex: this.div.tex, unit: 1 }]);
        this.pPrs.swap();
      }

      // 4. project
      R.blit(S.grad, this.pVel.write, { uTexel: this.simTexel },
        [{ name: 'uPressure', tex: this.pPrs.read.tex, unit: 0 }, { name: 'uVel', tex: this.pVel.read.tex, unit: 1 }]);
      this.pVel.swap();

      // 5. advect dye (slightly slower dissipation for long silky memory)
      R.blit(S.advect, this.pDye.write, { uTexel: this.simTexel, uDissipation: 0.9932 },
        [{ name: 'uVel', tex: this.pVel.read.tex, unit: 0 }, { name: 'uSrc', tex: this.pDye.read.tex, unit: 1 }]);
      this.pDye.swap();

      // 6. show
      R.blit(S.show, null, { uTime: s.t, uDt: dt, uFade: s.fade, uRes: [s.w, s.h], uMouse: [s.mouse.x, s.mouse.y], uEnergy: s.energy, uRand: s.seed },
        [{ name: 'uDye', tex: this.pDye.read.tex, unit: 0 }, { name: 'uVel', tex: this.pVel.read.tex, unit: 1 }]);
    },
    splat: function (R, x, y, fx, fy, color, radius) {
      var S = this.S;
      R.blit(S.force, this.pVel.write, { uPoint: [x, y], uForce: [fx, fy], uRadius: radius, uAspect: this.aspect || 1.777, uRes: [1, 1] },
        [{ name: 'uVel', tex: this.pVel.read.tex, unit: 0 }]);
      this.pVel.swap();
      R.blit(S.splat, this.pDye.write, { uPoint: [x, y], uColor: color, uRadius: radius * 1.6, uAspect: this.aspect || 1.777, uRes: [1, 1] },
        [{ name: 'uSrc', tex: this.pDye.read.tex, unit: 0 }]);
      this.pDye.swap();
    },
    dispose: function (R) {
      this.pVel.dispose(); this.pDye.dispose(); this.pPrs.dispose(); R.disposeTarget(this.div);
    }
  });

  /* ───────────────────────────────  03 · HYPERSPACE  ───────────────────── */
  D({
    id: 'hyperspace',
    preview: 'assets/previews/hyperspace.webp',
    rank: 7,
    name: 'Hyperspace',
    tag: 'warp tunnel · chromatic aberration',
    blurb: 'Somewhere past the speed of light the stars stop being points and start being memory. Hold on — the tunnel breathes.',
    captivation: 92,
    art: 'radial-gradient(70% 70% at 50% 50%, #eaffff 0%, #6fd6ff 12%, #3a4bff 34%, #150a3a 66%, #03030a 100%)',
    kind: 'gl',
    frag: [
      'float warp(vec2 uv, float t, float N, float speed, float seed, float w, float len){',
      '  float r = max(length(uv), 0.022);',
      '  float a = atan(uv.y, uv.x) / TAU + 0.5;',
      '  float ang = a * N;',
      '  float ai = mod(floor(ang), N);',
      '  float zi = floor(0.62 / r - t * speed);',
      '  vec2 rnd = hash22(vec2(ai, zi) + seed);',
      '  if (rnd.y < 0.70) return 0.0;                 // most of the sky is empty',
      '  vec2 off = (hash22(vec2(ai, zi) + seed + 7.3) - 0.5) * vec2(0.70, 0.80);',
      '  vec2 d = vec2(fract(ang) - 0.5 - off.x, fract(0.62 / r - t * speed) - 0.5 - off.y);',
      '  float s = exp(-pow(d.x * w, 2.0)) * exp(-pow(d.y / len, 2.0));',
      '  s *= smoothstep(0.02, 0.26, r);',
      '  s *= 0.35 + 0.75 * rnd.x;',
      '  return s;',
      '}',
      '',
      'void main(){',
      '  vec2 uv = screenUV();',
      '  vec2 uvr = rot2(uTime * 0.045) * uv;',
      '  float pulse = 0.62 + 0.38 * pow(0.5 + 0.5 * sin(uTime * 0.35), 2.2);',
      '  float t = uTime * (0.55 + 0.85 * pulse);',
      '',
      '  // per-channel radial scale = chromatic aberration along every streak,',
      '  // and each depth of stars carries its own part of the spectrum.',
      '  vec3 col = vec3(0.0);',
      '  vec3 c1 = vec3(0.62, 0.86, 1.25);',
      '  vec3 c2 = vec3(0.95, 0.72, 1.30);',
      '  vec3 c3 = vec3(1.35, 1.02, 0.72);',
      '  vec3 c4 = vec3(0.55, 1.15, 1.10);',
      '  for (int c = 0; c < 3; c++){',
      '    float k = 1.0 + float(c) * 0.055 * (0.45 + pulse);',
      '    float s = 0.0;',
      '    s += warp(uvr * k,        t,        22.0, 1.30, 1.0,  9.0, 0.24) * 0.92;',
      '    s += warp(uvr * k * 0.72, t * 0.72, 34.0, 0.95, 7.0,  11.0, 0.20) * 0.62;',
      '    s += warp(uvr * k * 1.55, t * 1.35, 46.0, 1.75, 19.0, 13.0, 0.16) * 0.44;',
      '    s += warp(uvr * k * 0.42, t * 0.55, 15.0, 0.70, 31.0,  8.0, 0.28) * 0.50;',
      '    if (c == 0) col.r = s; else if (c == 1) col.g = s; else col.b = s;',
      '  }',
      '  vec3 tint = c1 * 0.92 + c2 * 0.62 + c3 * 0.44 + c4 * 0.50;',
      '  col *= tint / 2.48;',
      '',
      '  // tunnel haze, rim light, core bloom',
      '  float r = length(uv);',
      '  col += pal(0.55 + 0.22 * sin(uTime * 0.2 + r * 2.0),',
      '             vec3(0.30, 0.34, 0.52), vec3(0.42, 0.38, 0.48),',
      '             vec3(1.00, 0.90, 0.80), vec3(0.10, 0.35, 0.68)) * exp(-r * 4.4) * 0.075;',
      '  col += vec3(0.40, 0.70, 1.00) * pow(max(0.0, 1.0 - r * 1.45), 8.0) * 0.13;',
      '  col += vec3(0.85, 0.95, 1.00) * exp(-pow(r * 30.0, 2.0)) * (0.18 + 0.12 * pulse);',
      '  col += vec3(0.003, 0.005, 0.015) * (1.2 - r);',
      '',
      '  col *= uFade;',
      '  fragColor = vec4(finish(col, uv, 0.66), 1.0);',
      '}'
    ].join('\n')
  });

  /* ──────────────────────────────  04 · EVENT HORIZON  ─────────────────── */
  D({
    id: 'event-horizon',
    preview: 'assets/previews/event-horizon.webp',
    rank: 5,
    name: 'Event Horizon',
    tag: 'schwarzschild geodesics · accretion disk',
    blurb: 'A real integration of light around a black hole. The disk you see behind the star is the same disk you see in front — bent around the dark.',
    captivation: 94,
    art: 'radial-gradient(60% 60% at 50% 46%, #000 0%, #000 26%, #ffb04a 30%, #ff5b2e 36%, #7a2bff 60%, #08040f 100%)',
    kind: 'gl',
    frag: [
      '#define STEPS 150',
      '',
      'vec3 starfield(vec3 rd){',
      '  vec2 su = vec2(atan(rd.z, rd.x) * 1.4, asin(clamp(rd.y, -1.0, 1.0)) * 2.2);',
      '  float s = starLayer(su * 6.0, 1.0, 34.0, 1.0) + starLayer(su * 14.0 + 3.0, 1.0, 44.0, 5.0) * 0.5;',
      '  vec3 c = vec3(0.65, 0.78, 1.0) * s;',
      '  // faint galactic band',
      '  float band = exp(-pow(rd.y * 3.4 + 0.35 * sin(rd.x * 2.0), 2.0));',
      '  c += pal(0.6 + 0.2 * sin(rd.x * 3.0), vec3(0.16,0.12,0.22), vec3(0.20,0.14,0.26),',
      '           vec3(1.0,0.9,0.8), vec3(0.0,0.2,0.45)) * band * 0.085;',
      '  return c;',
      '}',
      '',
      'vec3 diskColor(float r, float ang, float t){',
      '  float turb = fbm3(vec3(cos(ang) * r * 0.55, sin(ang) * r * 0.55, t * 0.55 + r * 0.4));',
      '  float temp = 1.0 / (0.35 + r * 0.16);',
      '  vec3 c = pal(0.60 - temp * 0.14 + turb * 0.10,',
      '               vec3(0.58, 0.34, 0.14), vec3(0.58, 0.42, 0.38),',
      '               vec3(1.00, 0.95, 0.85), vec3(0.00, 0.12, 0.30));',
      '  c = mix(vec3(luma(c)), c, 1.35);              // keep the heat saturated',
      '  c *= temp * 0.85;',
      '  c *= 0.45 + 0.85 * turb;',
      '  c += vec3(0.85, 0.92, 1.00) * smoothstep(4.6, 3.05, r) * 0.55;   // white-hot inner edge',
      '  float fade = smoothstep(12.0, 5.0, r) * smoothstep(2.85, 3.35, r);',
      '  return c * fade * 1.55;',
      '}',
      '',
      'void main(){',
      '  vec2 uv = screenUV();',
      '  float T = uTime * 0.30;',
      '  float ca = uTime * 0.075 + uMouse.x * 0.9;',
      '  float el = 0.46 + 0.20 * sin(uTime * 0.05) + uMouse.y * 0.75;',
      '  vec3 ro = vec3(cos(ca) * 15.0, sin(el) * 15.0, sin(ca) * 15.0);',
      '  mat3 cam = lookAt(ro, vec3(0.0), vec3(0.0, 1.0, 0.0));',
      '  vec3 rd = normalize(cam * vec3(uv, 1.55));',
      '',
      '  vec3 p = ro, v = rd;',
      '  vec3 h = cross(p, v);',
      '  float h2 = dot(h, h);',
      '  vec3 col = vec3(0.0);',
      '  float trans = 1.0;',
      '  float diskAlpha = 0.0;',
      '',
      '  for (int i = 0; i < STEPS; i++){',
      '    float r = length(p);',
      '    if (r < 1.001) { trans = 0.0; break; }',
      '    if (r > 40.0) break;',
      '    float dt = clamp(0.055 * r, 0.035, 0.85);',
      '    vec3 pn = p + v * dt;',
      '    // disk plane crossing (y = 0)',
      '    if (p.y * pn.y < 0.0){',
      '      float f = p.y / (p.y - pn.y);',
      '      vec3 hit = mix(p, pn, f);',
      '      float rd_ = length(hit.xz);',
      '      if (rd_ > 3.0 && rd_ < 12.0 && diskAlpha < 0.97){',
      '        float ang = atan(hit.z, hit.x);',
      '        // relativistic beaming: side rotating toward us is brighter',
      '        float beam = 0.45 + 0.55 * pow(clamp(0.5 + 0.5 * sin(ang - T * 0.9), 0.0, 1.0), 1.7);',
      '        vec3 em = diskColor(rd_, ang - T * 1.35, uTime) * beam * 3.1;',
      '        float a = clamp(0.34 + 0.55 * (1.0 - rd_ / 12.0), 0.0, 0.88);',
      '        col += em * a * trans;',
      '        trans *= 1.0 - a * 0.55;',
      '        diskAlpha += a;',
      '      }',
      '    }',
      '    // geodesic step (units: rs = 1)',
      '    vec3 acc = -1.5 * h2 * p / pow(dot(p, p), 2.5);',
      '    v += acc * dt;',
      '    p = pn;',
      '    if (trans < 0.008) break;',
      '  }',
      '',
      '  col += starfield(normalize(v)) * trans;',
      '',
      '  // photon ring: light that nearly closed an orbit around the hole',
      '  float b = length(cross(ro, rd));',
      '  col += vec3(1.0, 0.80, 0.52) * exp(-pow((b - 2.60) * 12.0, 2.0)) * 0.55 * trans;',
      '  col += vec3(1.0, 0.95, 0.85) * exp(-pow((b - 2.60) * 44.0, 2.0)) * 0.42 * trans;',
      '',
      '  col *= uFade;',
      '  fragColor = vec4(finish(col, uv, 0.46), 1.0);',
      '}'
    ].join('\n')
  });

  /* ────────────────────────────  05 · AURORA CATHEDRAL  ────────────────── */
  D({
    id: 'aurora-cathedral',
    preview: 'assets/previews/aurora-cathedral.webp',
    rank: 9,
    name: 'Aurora Cathedral',
    tag: 'volumetric curtains · ice water',
    blurb: 'Stand on frozen water under a sky that is quietly on fire. The light falls in columns, and the ice answers back.',
    captivation: 90,
    art: 'linear-gradient(180deg, #03050c 0%, #062a33 26%, #0fa07a 52%, #7cf2c8 68%, #123b4a 84%, #04070d 100%)',
    kind: 'gl',
    frag: [
      'float curtainAt(float x, float z, float t, float seed){',
      '  return (fbm2(vec2(x * 0.22 + seed * 3.1, z * 0.16 - t * 0.30)) - 0.5) * 5.2;',
      '}',
      '',
      'float aurora(vec3 p, float t){',
      '  float vert = smoothstep(0.55, 1.9, p.y) * exp(-max(p.y - 1.6, 0.0) * 0.62);',
      '  if (vert < 0.004) return 0.0;',
      '  float tot = 0.0;',
      '  for (int k = 0; k < 3; k++){',
      '    float fk = float(k);',
      '    float cx = curtainAt(p.x, p.z, t, fk * 2.7 + 1.0);',
      '    float s = abs(p.x - cx + fk * 1.1 - 1.1);',
      '    float sheet = exp(-s * s * 1.55);',
      '    if (sheet < 0.02) continue;              // skip the noise outside a curtain',
      '    float n = fbm3(vec3(p.x * 0.55, p.y * 0.30 - t * 0.55, p.z * 0.55 + fk * 4.0));',
      '    tot += sheet * (0.30 + 1.25 * n) * (1.0 - fk * 0.22);',
      '  }',
      '  return tot * vert;',
      '}',
      '',
      'float ridge(float x){',
      '  return fbm2(vec2(x * 0.35, 11.0)) * 1.15 + fbm2(vec2(x * 1.4, 3.0)) * 0.30;',
      '}',
      '',
      'void main(){',
      '  vec2 uv = screenUV();',
      '  float t = uTime * 0.5;',
      '  float yaw = uMouse.x * 0.55 + uTime * 0.012;',
      '',
      '  // horizon sits slightly below centre',
      '  float horizon = -0.10;',
      '  vec3 ro = vec3(0.0, 1.05, 0.0);',
      '  float pitch = (uv.y - horizon) * 1.15 + uMouse.y * 0.30;',
      '  float yawA = uv.x * 1.15 + yaw;',
      '  vec3 rd = normalize(vec3(cos(pitch) * sin(yawA), sin(pitch), cos(pitch) * cos(yawA)));',
      '',
      '  vec3 col = vec3(0.0);',
      '',
      '  // ── sky ────────────────────────────────────────────────────────────',
      '  if (rd.y > -0.02){',
      '    float sky = smoothstep(-0.05, 0.95, rd.y);',
      '    col += mix(vec3(0.0016, 0.0028, 0.0062), vec3(0.0030, 0.0068, 0.0165), sky);',
      '    vec2 su = vec2(atan(rd.z, rd.x) * 1.6, asin(clamp(rd.y, -1.0, 1.0)) * 2.4);',
      '    float st = starLayer(su * 7.0, 1.0, 32.0, 3.0) + starLayer(su * 16.0 + 2.0, 1.0, 44.0, 8.0) * 0.5;',
      '    col += vec3(0.75, 0.85, 1.0) * st * smoothstep(0.0, 0.35, rd.y) * 0.55;',
      '',
      '    // volumetric curtains',
      '    float tt = 0.0;',
      '    vec3 acc = vec3(0.0);',
      '    float trans = 1.0;',
      '    for (int i = 0; i < 34; i++){',
      '      tt += 0.55;',
      '      vec3 p = ro + rd * tt;',
      '      if (p.y > 7.0) break;',
      '      float d = aurora(p, uTime * 0.35) * 0.24;',
      '      if (d > 0.002){',
      '        float h = clamp((p.y - 0.6) / 4.2, 0.0, 1.0);',
      '        d *= 0.50 + 0.85 * vnoise2(vec2(p.z * 1.7 + p.x * 0.35, p.y * 0.20 - uTime * 0.30));',
      '        vec3 c = pal(0.34 + h * 0.30 + d * 0.10,',
      '                     vec3(0.13, 0.40, 0.33), vec3(0.42, 0.62, 0.50),',
      '                     vec3(0.85, 1.00, 0.95), vec3(0.10, 0.40, 0.62));',
      '        c *= 0.28 + 1.85 * d;',
      '        c = mix(c, vec3(1.0, 0.35, 0.62) * (0.4 + d), clamp(h * 0.75 + d * 0.35, 0.0, 0.70));',
      '        float a = clamp(d * 0.30, 0.0, 1.0);',
      '        acc += c * a * trans;',
      '        trans *= 1.0 - a * 0.7;',
      '      }',
      '      if (trans < 0.02) break;',
      '    }',
      '    col += acc * 1.15 * smoothstep(-0.02, 0.18, rd.y);',
      '',
      '    // mountains',
      '    float m = ridge(atan(rd.z, rd.x) * 1.6 + 20.0) * 0.34;',
      '    float mEdge = smoothstep(m + 0.004, m - 0.004, rd.y);',
      '    col = mix(col, vec3(0.0018, 0.0030, 0.0055) * (1.0 - 0.3 * rd.y), mEdge * step(-0.02, rd.y) * 0.96);',
      '  }',
      '',
      '  // ── ice water ──────────────────────────────────────────────────────',
      '  if (rd.y < 0.0){',
      '    vec3 rp = ro + rd * (ro.y / max(-rd.y, 1e-3));',
      '    float dist = length(rp.xz - ro.xz);',
      '    float ripple = fbm2(rp.xz * 0.55 + vec2(uTime * 0.05, -uTime * 0.03));',
      '    float fres = pow(1.0 - clamp(-rd.y, 0.0, 1.0), 3.0);',
      '',
      '    vec3 refl = vec3(0.0);',
      '    float tt2 = 0.0;',
      '    vec3 rrd = vec3(rd.x, -rd.y, rd.z);',
      '    for (int i = 0; i < 16; i++){',
      '      tt2 += 1.15;',
      '      vec3 p = ro + rrd * tt2;',
      '      if (p.y > 7.5) break;',
      '      float d = aurora(p, uTime * 0.35) * 0.17;',
      '      if (d > 0.002){',
      '        float h = clamp((p.y - 0.6) / 4.2, 0.0, 1.0);',
      '        vec3 c = pal(0.34 + h * 0.30, vec3(0.13, 0.40, 0.33), vec3(0.42, 0.62, 0.50),',
      '                     vec3(0.85, 1.00, 0.95), vec3(0.10, 0.40, 0.62));',
      '        refl += c * clamp(d * 0.34, 0.0, 1.0) * (0.35 + 1.1 * d) * 0.13;',
      '      }',
      '    }',
      '    refl *= smoothstep(90.0, 6.0, dist);',
      '',
      '    vec3 water = vec3(0.0035, 0.0090, 0.0165);',
      '    water += refl * (1.05 - fres * 0.7);',
      '    water += vec3(0.35, 0.75, 0.85) * pow(max(0.0, ripple - 0.42), 2.0) * 0.14;',
      '    water += vec3(0.10, 0.30, 0.42) * fres * 0.16;',
      '    col = mix(col, water, smoothstep(0.0, -0.012, rd.y));',
      '  }',
      '',
      '  col *= uFade;',
      '  fragColor = vec4(finish(col, uv, 0.44), 1.0);',
      '}'
    ].join('\n')
  });

  /* ──────────────────────────────  06 · SILK CURRENTS  ─────────────────── */
  var PARTICLE_VS = [
    '#version 300 es',
    'in float aIndex;',
    'uniform sampler2D uPos;',
    'uniform vec2  uGrid;',
    'uniform mat4  uMVP;',
    'uniform float uSize;',
    'out float vLife;',
    'out float vSpeed;',
    'void main(){',
    '  float x = mod(aIndex, uGrid.x);',
    '  float y = floor(aIndex / uGrid.x);',
    '  vec2 tuv = (vec2(x, y) + 0.5) / uGrid;',
    '  vec4 P = texture(uPos, tuv);',
    '  vLife = P.w;',
    '  vSpeed = length(P.xyz);',
    '  vec4 clip = uMVP * vec4(P.xyz, 1.0);',
    '  gl_Position = clip;',
    '  gl_PointSize = clamp(uSize / max(clip.w, 0.35), 0.8, 8.0);',
    '}'
  ].join('\n');

  var PARTICLE_FS = [
    '#version 300 es',
    'precision highp float;',
    'in float vLife;',
    'in float vSpeed;',
    'uniform vec3 uHue;',
    'out vec4 fragColor;',
    'void main(){',
    '  vec2 d = gl_PointCoord - 0.5;',
    '  float r = length(d) * 2.0;',
    '  if (r > 1.0) discard;',
    '  float a = pow(1.0 - r, 2.6);',
    '  vec3 c = uHue * (0.55 + 0.85 * vSpeed);',
    '  fragColor = vec4(c * a * vLife * 0.42, a * 0.30 * vLife);',
    '}'
  ].join('\n');

  var UPDATE_FS = [
    'uniform sampler2D uPos;',
    'uniform vec2  uGrid;',
    'uniform float uSeed;',
    'void main(){',
    '  vec4 P = texture(uPos, vUv);',
    '  vec3 p = P.xyz;',
    '  float life = P.w - uDt * 0.085;',
    '  vec3 v = flow3(p * 0.42 + vec3(0.0, uTime * 0.08, uSeed), uTime * 0.35);',
    '  // pull toward a slow torus attractor so the flock never thins out',
    '  vec2 q = vec2(length(p.xz) - 3.4, p.y * 1.6);',
    '  vec3 toRing = vec3(-normalize(p.xz + 1e-4).x * q.x * 0.22, -q.y * 0.18, -normalize(p.xz + 1e-4).y * q.x * 0.22);',
    '  v += toRing * 0.9;',
    '  p += v * uDt * 1.35;',
    '  if (life <= 0.0 || length(p) > 9.0){',
    '    vec3 rnd = hash33(vec3(vUv * 431.0, uTime * 13.0));',
    '    float a = rnd.x * TAU, b = rnd.y * TAU;',
    '    p = vec3(cos(a) * (3.4 + (rnd.z - 0.5) * 1.6), (rnd.z - 0.5) * 1.5, sin(a) * (3.4 + (rnd.y - 0.5) * 1.6));',
    '    life = 0.55 + 0.45 * hash11(rnd.x * 97.0 + uTime);',
    '  }',
    '  fragColor = vec4(p, life);',
    '}'
  ].join('\n');

  var TRAIL_FS = [
    'uniform sampler2D uPrev;',
    'uniform float uDecay;',
    'void main(){',
    '  vec2 uv = vUv;',
    '  vec3 c = texture(uPrev, uv).rgb * uDecay;',
    '  // tiny inward drift makes the trails feel like fluid',
    '  c += texture(uPrev, uv + vec2(0.0012, 0.0009)).rgb * 0.06;',
    '  fragColor = vec4(c, 1.0);',
    '}'
  ].join('\n');

  D({
    id: 'silk-currents',
    preview: 'assets/previews/silk-currents.webp',
    rank: 11,
    name: 'Silk Currents',
    tag: '65k gpu particles · curl noise · feedback',
    blurb: 'Sixty-five thousand threads of light let go inside an invisible river. Each one dies and is born again before you can follow it.',
    captivation: 87,
    art: 'radial-gradient(80% 80% at 45% 40%, #b7f7ff 0%, #4d9dff 26%, #7b3cff 52%, #1a0a3c 76%, #05040c 100%)',
    kind: 'glx',
    init: function (R) {
      var gl = R.gl;
      this.N = 256;
      this.positions = R.pingpong(this.N, this.N, { float: true });
      this.trail = R.pingpong(Math.max(2, Math.floor(R.canvas.width / 2)), Math.max(2, Math.floor(R.canvas.height / 2)), { float: true });
      this.update = R.shader(UPDATE_FS, 'p_update');
      this.trailP = R.shader(TRAIL_FS, 'p_trail');
      this.points = R.custom(PARTICLE_VS, PARTICLE_FS, 'p_points');

      // index attribute: one vertex per particle
      var idx = new Float32Array(this.N * this.N);
      for (var i = 0; i < idx.length; i++) idx[i] = i;
      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      this.vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
      gl.bufferData(gl.ARRAY_BUFFER, idx, gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(this.points.p, 'aIndex');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 1, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);

      // seed
      var data = new Float32Array(this.N * this.N * 4);
      for (var j = 0; j < this.N * this.N; j++) {
        var a = Math.random() * Math.PI * 2, rr = 3.4 + (Math.random() - 0.5) * 1.8;
        data[j * 4] = Math.cos(a) * rr;
        data[j * 4 + 1] = (Math.random() - 0.5) * 1.6;
        data[j * 4 + 2] = Math.sin(a) * rr;
        data[j * 4 + 3] = Math.random();
      }
      gl.bindTexture(gl.TEXTURE_2D, this.positions.read.tex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.N, this.N, gl.RGBA, gl.FLOAT, data);
      gl.bindTexture(gl.TEXTURE_2D, this.positions.write.tex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.N, this.N, gl.RGBA, gl.FLOAT, data);
      gl.bindTexture(gl.TEXTURE_2D, null);
    },
    resize: function (R, w, h) {
      if (this.trail) this.trail.dispose();
      this.trail = R.pingpong(Math.max(2, Math.floor(w / 2)), Math.max(2, Math.floor(h / 2)), { float: true });
    },
    frame: function (R, s) {
      var gl = R.gl;

      // 1. integrate positions
      R.blit(this.update, this.positions.write, {
        uTime: s.t, uDt: Math.min(s.dt, 1 / 30), uGrid: [this.N, this.N], uSeed: s.seed,
        uRes: [this.N, this.N], uMouse: [s.mouse.x, s.mouse.y], uEnergy: s.energy, uRand: s.seed, uFade: s.fade
      }, [{ name: 'uPos', tex: this.positions.read.tex, unit: 0 }]);
      this.positions.swap();

      // 2. decay the trail buffer
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ZERO);
      R.blit(this.trailP, this.trail.write, { uDecay: 0.955, uRes: [this.trail.w, this.trail.h] },
        [{ name: 'uPrev', tex: this.trail.read.tex, unit: 0 }]);
      this.trail.swap();

      // 3. additive splat of the particles into the trail
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.trail.read.fbo);
      gl.viewport(0, 0, this.trail.w, this.trail.h);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      var ang = s.t * 0.16 + s.mouse.x * 0.7;
      var m = this.mat(ang, 0.55 + s.mouse.y * 0.35);
      R.use(this.points);
      R.set(this.points, 'uGrid', [this.N, this.N]);
      R.set(this.points, 'uMVP', m);
      R.set(this.points, 'uSize', 26.0 * (s.h / 900));
      R.set(this.points, 'uHue', [0.55 + 0.45 * Math.sin(s.t * 0.13), 0.62 + 0.38 * Math.sin(s.t * 0.11 + 2.0), 1.0]);
      R.tex(this.points, 'uPos', this.positions.read.tex, 0);
      gl.bindVertexArray(this.vao);
      gl.drawArrays(gl.POINTS, 0, this.N * this.N);
      gl.bindVertexArray(null);
      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      // 4. present the trail with a colour grade
      if (!this.show) this.show = R.shader([
        'uniform sampler2D uTex;',
        'void main(){',
        '  vec3 c = texture(uTex, vUv).rgb;',
        '  c = c * 1.35 + vec3(0.010, 0.014, 0.038);',
        '  c += vec3(0.06, 0.10, 0.26) * (1.0 - smoothstep(0.0, 0.9, length(vUv - 0.5)));',
        '  c *= uFade;',
        '  fragColor = vec4(finish(c, vUv - 0.5, 0.34), 1.0);',
        '}'
      ].join('\n'), 'p_show');
      R.blit(this.show, null, {
        uTime: s.t, uRes: [s.w, s.h], uFade: s.fade, uMouse: [s.mouse.x, s.mouse.y],
        uEnergy: s.energy, uRand: s.seed, uDt: s.dt
      }, [{ name: 'uTex', tex: this.trail.read.tex, unit: 0 }]);
    },
    mat: function (a, elev) {
      var d = 9.2, cx = Math.cos(a) * d, cz = Math.sin(a) * d, cy = Math.sin(elev) * d * 0.55;
      var f = [ -cx, -cy, -cz ], l = Math.hypot(f[0], f[1], f[2]);
      f = [f[0] / l, f[1] / l, f[2] / l];
      var up = [0, 1, 0];
      var r = [f[1] * up[2] - f[2] * up[1], f[2] * up[0] - f[0] * up[2], f[0] * up[1] - f[1] * up[0]];
      var rl = Math.hypot(r[0], r[1], r[2]); r = [r[0] / rl, r[1] / rl, r[2] / rl];
      var u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
      var near = 0.1, far = 60, fov = 1.15;
      var P = [1 / Math.tan(fov / 2), 0, 0, 0, 0, 1 / Math.tan(fov / 2), 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0];
      var V = [r[0], u[0], -f[0], 0, r[1], u[1], -f[1], 0, r[2], u[2], -f[2], 0,
        -(r[0] * cx + r[1] * cy + r[2] * cz), -(u[0] * cx + u[1] * cy + u[2] * cz), (f[0] * cx + f[1] * cy + f[2] * cz), 1];
      // column-major MVP = P * V
      var out = new Array(16);
      for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
        var s = 0;
        for (var k = 0; k < 4; k++) s += P[k * 4 + j] * V[i * 4 + k];
        out[i * 4 + j] = s;
      }
      return out;
    },
    dispose: function (R) {
      var gl = R.gl;
      this.positions.dispose(); this.trail.dispose();
      gl.deleteBuffer(this.vbo); gl.deleteVertexArray(this.vao);
    }
  });

})(window);
