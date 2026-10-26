/* A bounded, live-incoming compositor. Outgoing worlds are snapshots, not
   simultaneously running simulations. No flashes, feedback loops or audio access. */
(function (w) {
  "use strict";
  var styles = [
    ["dissolve", "Velvet dissolve"],
    ["mycelium", "Mycelial passage"],
    ["tide", "Liquid tide"],
    ["iris", "Breathing iris"],
    ["nebula", "Nebular diffusion"],
    ["silk", "Silken crossing"],
    ["petals", "Petal unfurling"],
    ["glass", "Prismatic refraction"],
    ["contours", "Contour inundation"],
    ["cells", "Cellular succession"],
    ["vortex", "Spiral migration"],
    ["aurora", "Auroral veil"],
    ["roots", "Root-light invasion"],
    ["sand", "Dune transference"],
    ["orbit", "Orbital eclipse"],
    ["origami", "Origami continuum"],
    ["rain", "Reverse rain"],
    ["lenses", "Lenticular overlap"],
    ["ribbons", "Ribbon interweave"],
    ["ripples", "Capillary ripples"],
    ["constellations", "Constellation ignition"],
    ["membrane", "Membrane exchange"],
    ["horizon", "Horizon folding"],
    ["ink", "Ink capillarity"],
  ].map(function (v, i) {
    return { id: v[0], name: v[1], index: i };
  });
  var body = `
 uniform sampler2D tOld,tNew;
 uniform float trP,trStyle,trAmount,trSeed;
 float rnd(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))+trSeed)*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(rnd(i),rnd(i+vec2(1,0)),f.x),mix(rnd(i+vec2(0,1)),rnd(i+1.),f.x),f.y);}
 float organic(vec2 p){return .57*noise(p)+.28*noise(p*2.03)+.15*noise(p*4.07);}
 void main(){
 vec2 uv=vUv,q=uv-.5;float p=trP,s=sin(PI*p),a=atan(q.y,q.x),r=length(q),f=uv.x,soft=.10;vec2 wa=vec2(0),wb=vec2(0);int k=int(trStyle+.5);
 if(p<=.00001){fragColor=texture(tOld,uv);return;}if(p>=.99999){fragColor=texture(tNew,uv);return;}
 if(k==0){fragColor=mix(texture(tOld,uv),texture(tNew,uv),p);return;}
 if(k==1){f=organic(uv*5.)*.7+.3*uv.y;wa=vec2(sin(uv.y*15.+p*2.),cos(uv.x*12.))*s*.016;}
 else if(k==2){f=uv.y+.12*sin(uv.x*8.+p*3.)+.05*sin(uv.x*21.-p*4.);wa=vec2(0,sin(uv.x*13.-p*5.)*.03*s);}
 else if(k==3){f=r*1.4;wa=q*(.12*s);wb=-q*.06*s;soft=.13;}
 else if(k==4){f=organic(uv*3.2+vec2(p*.5,0));wa=vec2(noise(uv*4.),noise(uv*4.+7.))*.05*s;soft=.2;}
 else if(k==5){f=uv.x+.13*sin(uv.y*9.+uv.x*3.);wa=vec2(.06*s*sin(uv.y*9.),0);wb=-wa;}
 else if(k==6){f=r*(1.3+.3*cos(a*7.+p));wa=q*.08*s*cos(a*7.);soft=.08;}
 else if(k==7){vec2 g=floor(uv*vec2(9,6));f=rnd(g)*.6+uv.x*.4;wa=(fract(uv*vec2(9,6))-.5)*.07*s;wb=-wa;soft=.12;}
 else if(k==8){f=.5+.23*sin(uv.x*9.+uv.y*5.)+.2*sin(uv.y*12.-uv.x*4.);wa=normalize(q+vec2(.001))*sin(r*30.-p*7.)*.015*s;}
 else if(k==9){vec2 g=floor(uv*vec2(13,9));f=rnd(g)*.8+uv.y*.2;wa=(fract(uv*vec2(13,9))-.5)*.08*s;soft=.13;}
 else if(k==10){f=fract((a+PI)/TAU+r*.7);wa=rot2(s*.22)*q-q;wb=rot2(-s*.16)*q-q;soft=.12;}
 else if(k==11){f=uv.x+.15*sin(uv.y*7.+sin(uv.x*9.)+p*2.);wa=vec2(s*.02*sin(uv.y*18.),s*.02*cos(uv.x*7.));soft=.18;}
 else if(k==12){f=uv.y*.6+.4*(.5+.5*sin(uv.x*18.+sin(uv.y*7.)*3.));wa=vec2(sin(uv.y*14.),0)*.025*s;soft=.15;}
 else if(k==13){f=uv.y+.13*sin(uv.x*6.)+.06*sin(uv.x*17.+uv.y*9.);wa=vec2(.05*s*(.5-uv.y),0);soft=.09;}
 else if(k==14){f=length(q-vec2(-.65+p*.8,.1))*.8;wa=q*.07*s;wb=-q*.04*s;soft=.1;}
 else if(k==15){vec2 g=fract(uv*vec2(7,5));f=.2*uv.x+.8*abs(g.x-g.y);wa=vec2(abs(g.y-.5)-.25,abs(g.x-.5)-.25)*.12*s;soft=.12;}
 else if(k==16){float x=floor(uv.x*36.);f=uv.y*.65+.35*rnd(vec2(x,2));wa=vec2(0,.055*s*sin(x));soft=.1;}
 else if(k==17){float lens=sin(uv.x*48.);f=uv.x+.08*lens;wa=vec2(.018*lens*s,0);wb=-wa;soft=.2;}
 else if(k==18){float strip=floor(uv.y*14.);f=mod(strip,2.)<1.?uv.x:1.-uv.x;f=.7*f+.3*rnd(vec2(strip,1));wa=vec2(s*.04*sin(strip),0);soft=.15;}
 else if(k==19){f=r*1.1+.12*sin(r*32.-p*4.);wa=normalize(q+vec2(.001))*sin(r*36.-p*5.)*.018*s;soft=.18;}
 else if(k==20){vec2 g=floor(uv*vec2(20,13));f=.7*rnd(g)+.3*r*1.4;wa=(.5-fract(uv*vec2(20,13)))*s*.025;soft=.22;}
 else if(k==21){f=organic(uv*4.)*.6+.4*r*1.3;wa=vec2(sin(uv.y*9.+p*3.),cos(uv.x*7.-p*3.))*.035*s;wb=-wa;soft=.24;}
 else if(k==22){f=abs(uv.y-.5)*1.8;wa=vec2(0,sign(q.y)*.065*s*(1.-abs(q.y)));wb=-wa;soft=.15;}
 else {f=organic(uv*7.)*.7+uv.x*.3;wa=vec2(noise(uv*12.)-.5,noise(uv*12.+8.)-.5)*.035*s;soft=.13;}
 // Every mask is normalized through an overscanned threshold: exact endpoints,
 // continuous edges, no additive white burst, bounded texture coordinates.
 float cut=mix(-.55,1.55,p),m=1.-smoothstep(cut-soft,cut+soft,f);
 vec3 A=texture(tOld,clamp(uv+wa*trAmount,vec2(.001),vec2(.999))).rgb;
 vec3 B=texture(tNew,clamp(uv+wb*trAmount,vec2(.001),vec2(.999))).rgb;
 fragColor=vec4(mix(A,B,m),1.);
 }`;
  function create(canvas, fallback) {
    var R = null,
      program = null,
      oldTex = null,
      newTex = null,
      active = false,
      elapsed = 0,
      duration = 0,
      style = 0,
      last = -1,
      serial = 0,
      seed = 0,
      settings = {},
      failed = false,
      attempted = false;
    function initialize() {
      if (attempted) return;
      attempted = true;
      try {
        R = w.GLR.create(canvas);
        if (R) {
          program = R.shader(body, "cabinet-transitions-v1");
          if (program) {
            oldTex = R.target(2, 2);
            newTex = R.target(2, 2);
          } else R = null;
        }
      } catch (e) {
        R = null;
      }
    }
    function upload(target, source) {
      var g = R.gl;
      g.activeTexture(g.TEXTURE0);
      g.bindTexture(g.TEXTURE_2D, target.tex);
      g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, source);
      g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, false);
    }
    function end() {
      active = false;
      canvas.style.opacity = "0";
      fallback.style.opacity = "0";
    }
    function begin(source, config) {
      settings = config;
      elapsed = 0;
      duration = Math.max(
        0,
        Math.min(config.transitionDuration, config.worldDuration * 0.8),
      );
      if (!duration) {
        end();
        return;
      }
      initialize();
      var safe = config.reducedMotion || config.calm;
      style = safe
        ? 0
        : styles.findIndex(function (s) {
            return s.id === config.transitionStyle;
          });
      if (style < 0) {
        style = (serial * 7 + Math.floor(Math.random() * 5)) % styles.length;
        if (style === last) style = (style + 1) % styles.length;
      }
      last = style;
      serial++;
      seed = serial * 17.31;
      active = true;
      failed = !!(R && R.gl.isContextLost());
      canvas.style.transition = "none";
      fallback.style.transition = "none";
      if (R && !failed) {
        try {
          var ratio = source.width / Math.max(1, source.height);
          canvas.width = Math.min(960, source.width);
          canvas.height = Math.max(1, Math.round(canvas.width / ratio));
          upload(oldTex, source);
          upload(newTex, source);
          canvas.style.opacity = "1";
          fallback.style.opacity = "0";
          render(source, 0, config);
        } catch (e) {
          failed = true;
          canvas.style.opacity = "0";
          fallback.style.opacity = "1";
        }
      } else fallback.style.opacity = "1";
    }
    function render(source, dt, config) {
      if (!active) return;
      if (!config.transitionDuration) {
        end();
        return;
      }
      elapsed += Math.max(0, dt);
      if (elapsed >= duration) {
        end();
        return;
      }
      var p = elapsed / duration;
      if (config.transitionEase === "smooth") p = p * p * (3 - 2 * p);
      else if (config.transitionEase === "sine")
        p = 0.5 - 0.5 * Math.cos(Math.PI * p);
      if (R && !failed) {
        try {
          upload(newTex, source);
          R.blit(
            program,
            null,
            {
              uRes: [canvas.width, canvas.height],
              trP: p,
              trStyle: config.reducedMotion || config.calm ? 0 : style,
              trAmount: config.transitionWarp,
              trSeed: seed,
            },
            [
              { name: "tOld", tex: oldTex.tex, unit: 0 },
              { name: "tNew", tex: newTex.tex, unit: 1 },
            ],
          );
        } catch (e) {
          failed = true;
          canvas.style.opacity = "0";
        }
      }
      if (!R || failed) fallback.style.opacity = String(1 - p);
    }
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault();
      failed = true;
      canvas.style.opacity = "0";
    });
    return {
      begin: begin,
      render: render,
      end: end,
      getState: function () {
        return {
          active: active,
          elapsed: elapsed,
          duration: duration,
          progress: duration ? Math.min(1, elapsed / duration) : 1,
          style: styles[style].id,
          renderer: R && !failed ? "webgl2" : "dissolve-fallback",
        };
      },
      capture: function (ctx) {
        if (active && R && !failed)
          ctx.drawImage(canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
      },
      styles: styles,
    };
  }
  w.CabinetTransitions = { styles: styles, create: create };
})(window);
