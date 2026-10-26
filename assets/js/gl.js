/* ============================================================================
   Minimal WebGL2 helper: one shared context, cached programs, render targets.
   Deliberately small — the spectacle lives in the shaders.
   ========================================================================== */
(function (w) {
  'use strict';

  function create(canvas) {
    var gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
      desynchronized: true
    });
    if (!gl) return null;

    var R = {
      gl: gl,
      canvas: canvas,
      vao: null,
      progs: {},
      targets: [],
      floatOK: !!gl.getExtension('EXT_color_buffer_float'),
      floatLinear: !!gl.getExtension('OES_texture_float_linear'),
      maxTex: gl.getParameter(gl.MAX_TEXTURE_SIZE)
    };

    gl.getExtension('OES_texture_half_float_linear');
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.disable(gl.CULL_FACE);

    /* full-screen triangle-pair ------------------------------------------- */
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    R.vao = gl.createVertexArray();
    gl.bindVertexArray(R.vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    /* ---------------------------------------------------------------- programs */
    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        var log = gl.getShaderInfoLog(s) || '';
        console.error('[gl] shader compile failed\n' + log + '\n' +
          src.split('\n').map(function (l, i) { return (i + 1) + ': ' + l; }).join('\n'));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    R.program = function (fragSrc, key) {
      key = key || fragSrc;
      if (R.progs[key]) return R.progs[key];

      var vs = compile(gl.VERTEX_SHADER, w.GLSL.VERT);
      var fs = compile(gl.FRAGMENT_SHADER, fragSrc);
      if (!vs || !fs) return null;

      var p = gl.createProgram();
      gl.attachShader(p, vs); gl.attachShader(p, fs);
      gl.bindAttribLocation(p, 0, 'aPos');
      gl.linkProgram(p);
      gl.deleteShader(vs); gl.deleteShader(fs);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error('[gl] link failed: ' + gl.getProgramInfoLog(p));
        return null;
      }

      // introspect uniforms
      var loc = {}, nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < nu; i++) {
        var info = gl.getActiveUniform(p, i);
        var nm = info.name.replace(/\[0\]$/, '');
        loc[nm] = gl.getUniformLocation(p, nm);
      }
      var prog = { p: p, loc: loc, key: key };
      R.progs[key] = prog;
      return prog;
    };

    R.use = function (prog) { gl.useProgram(prog.p); R.cur = prog; return prog; };

    R.set = function (prog, name, val) {
      var l = prog.loc[name];
      if (l === undefined || l === null) return;
      if (typeof val === 'number') gl.uniform1f(l, val);
      else if (val === true) gl.uniform1i(l, 1);
      else if (val === false) gl.uniform1i(l, 0);
      else if (val.length === 16) gl.uniformMatrix4fv(l, false, val);
      else if (val.length === 9) gl.uniformMatrix3fv(l, false, val);
      else if (val.length === 2) gl.uniform2f(l, val[0], val[1]);
      else if (val.length === 3) gl.uniform3f(l, val[0], val[1], val[2]);
      else if (val.length === 4) gl.uniform4f(l, val[0], val[1], val[2], val[3]);
    };

    /* a program with its own vertex stage (particle systems) */
    R.custom = function (vsSrc, fsSrc, key) {
      var vs = compile(gl.VERTEX_SHADER, vsSrc);
      var fs = compile(gl.FRAGMENT_SHADER, fsSrc);
      if (!vs || !fs) return null;
      var p = gl.createProgram();
      gl.attachShader(p, vs); gl.attachShader(p, fs);
      gl.linkProgram(p);
      gl.deleteShader(vs); gl.deleteShader(fs);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error('[gl] link failed: ' + gl.getProgramInfoLog(p));
        return null;
      }
      var loc = {}, nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < nu; i++) {
        var info = gl.getActiveUniform(p, i);
        var nm = info.name.replace(/\[0\]$/, '');
        loc[nm] = gl.getUniformLocation(p, nm);
      }
      var prog = { p: p, loc: loc, key: key || fsSrc };
      R.progs[prog.key] = prog;
      return prog;
    };

    R.setInt = function (prog, name, v) {
      var l = prog.loc[name];
      if (l !== undefined && l !== null) gl.uniform1i(l, v | 0);
    };

    R.tex = function (prog, name, texture, unit) {
      var l = prog.loc[name];
      if (l === undefined || l === null) return;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(l, unit);
    };

    /* ------------------------------------------------------------- targets */
    function makeTexture(wd, ht, opts) {
      opts = opts || {};
      var t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      var filt = opts.nearest ? gl.NEAREST : gl.LINEAR;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filt);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filt);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, opts.wrap || gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, opts.wrap || gl.CLAMP_TO_EDGE);

      var internal, format, type;
      if (opts.float && R.floatOK) { internal = gl.RGBA16F; format = gl.RGBA; type = gl.HALF_FLOAT; }
      else if (opts.rg && R.floatOK) { internal = gl.RG16F; format = gl.RG; type = gl.HALF_FLOAT; }
      else if (opts.r && R.floatOK) { internal = gl.R16F; format = gl.RED; type = gl.HALF_FLOAT; }
      else { internal = gl.RGBA8; format = gl.RGBA; type = gl.UNSIGNED_BYTE; }

      gl.texImage2D(gl.TEXTURE_2D, 0, internal, wd, ht, 0, format, type, null);

      var fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      if (!ok) { console.warn('[gl] incomplete framebuffer @' + wd + 'x' + ht); }
      return { tex: t, fbo: fbo, w: wd, h: ht, ok: ok };
    }

    R.target = function (wd, ht, opts) {
      var t = makeTexture(Math.max(1, wd | 0), Math.max(1, ht | 0), opts);
      R.targets.push(t);
      return t;
    };

    R.pingpong = function (wd, ht, opts) {
      var a = R.target(wd, ht, opts), b = R.target(wd, ht, opts);
      return {
        read: a, write: b, w: wd, h: ht,
        swap: function () { var t = this.read; this.read = this.write; this.write = t; },
        dispose: function () { R.disposeTarget(a); R.disposeTarget(b); }
      };
    };

    R.disposeTarget = function (t) {
      if (!t) return;
      gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fbo);
      var i = R.targets.indexOf(t);
      if (i >= 0) R.targets.splice(i, 1);
    };

    R.bind = function (t) {
      if (t) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
        gl.viewport(0, 0, t.w, t.h);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    R.clear = function (r, g, b, a) {
      gl.clearColor(r || 0, g || 0, b || 0, a === undefined ? 1 : a);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    R.quad = function () { gl.bindVertexArray(R.vao); gl.drawArrays(gl.TRIANGLES, 0, 3); };

    /* draw a fragment shader straight to `target` (or the screen) */
    R.blit = function (prog, target, uniforms, texs) {
      R.use(prog);
      if (uniforms) for (var k in uniforms) R.set(prog, k, uniforms[k]);
      if (texs) for (var i = 0; i < texs.length; i++) R.tex(prog, texs[i].name, texs[i].tex, texs[i].unit === undefined ? i : texs[i].unit);
      R.bind(target);
      R.quad();
    };

    /* compile a body written against the shared prelude */
    R.shader = function (body, key) {
      return R.program(w.GLSL.PRELUDE + '\n' + body, key || body);
    };

    /* ---------------------------------------------------------- point cloud */
    R.points = function (count, data) {   // data: Float32Array
      var vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      var b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      return { vao: vao, buf: b, count: count, dispose: function () { gl.deleteBuffer(b); gl.deleteVertexArray(vao); } };
    };

    R.drawPoints = function (cloud, size) {
      gl.bindVertexArray(cloud.vao);
      gl.drawArrays(gl.POINTS, 0, cloud.count);
      gl.bindVertexArray(null);
    };

    R.pointVertex = [
      '#version 300 es',
      'in vec3 aPos;',
      'uniform mat4 uMVP;',
      'uniform float uSize;',
      'uniform vec3 uCam;',
      'out float vDepth;',
      'void main(){',
      '  vec4 p = uMVP * vec4(aPos, 1.0);',
      '  gl_Position = p;',
      '  vDepth = length(aPos - uCam);',
      '  gl_PointSize = clamp(uSize / max(p.w, 0.001), 1.0, 24.0);',
      '}'
    ].join('\n');

    R.pointFragment = [
      '#version 300 es',
      'precision highp float;',
      'in float vDepth;',
      'uniform vec3 uColor;',
      'uniform float uAlpha;',
      'uniform float uNear;',
      'uniform float uFar;',
      'out vec4 fragColor;',
      'void main(){',
      '  vec2 d = gl_PointCoord - 0.5;',
      '  float r = length(d) * 2.0;',
      '  if (r > 1.0) discard;',
      '  float a = pow(1.0 - r, 2.4);',
      '  float fog = 1.0 - clamp((vDepth - uNear) / (uFar - uNear), 0.0, 1.0);',
      '  fragColor = vec4(uColor * (0.35 + 0.65 * fog), a * uAlpha * (0.25 + 0.75 * fog));',
      '}'
    ].join('\n');

    return R;
  }

  w.GLR = { create: create };
})(window);
