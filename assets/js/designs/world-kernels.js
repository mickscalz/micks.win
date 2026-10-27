/* IX — shared, allowlisted world kernels. Authored worlds and world-v3 children
   execute these SAME fields: not creature proxies or blended screenshots. */
(function (root) {
  "use strict";
  const HX =
    typeof module !== "undefined" ? require("./horizons-x.js") : root.HorizonX;
  const XI =
    typeof module !== "undefined"
      ? require("./worldscapes-xi.js")
      : root.WorldscapesXI;
  const XII =
    typeof module !== "undefined"
      ? require("./resonant-xii.js")
      : root.ResonantXII;
  const MODULES = {
    landform: [
      "tidal-arches",
      "aurora-terraces",
      "glass-dunes",
      "hanging-islands",
      "rain-temple",
      "orbital-sea",
      "light-canyon",
      "salt-mirrors",
      ...HX.specs.map((s) => s[2]),
      ...XI.specs.map((s) => s[2]),
      ...XII.specs.map((s) => s[2]),
    ],
    sky: ["dawn", "aurora", "storm", "night"],
    water: ["tide", "mirror", "river", "dry"],
    weather: ["mist", "rain", "pollen", "clear"],
    camera: ["shore", "glide", "overlook"],
  };
  const specs = [
    [
      "tidal-cathedral",
      "Cathedral of the Tides",
      "tidal-arches",
      "dawn",
      "tide",
      "mist",
      "shore",
      203,
      "Submerged basalt arches · tidal causeways · sea haze",
    ],
    [
      "aurora-terraces",
      "The Aurora Terraces",
      "aurora-terraces",
      "aurora",
      "river",
      "clear",
      "overlook",
      162,
      "Terraced mountains · sky curtains · glacial rivers",
    ],
    [
      "glass-dune-sea",
      "Sea of Singing Glass",
      "glass-dunes",
      "dawn",
      "dry",
      "pollen",
      "glide",
      34,
      "Wind-sculpted dunes · glass sails · airborne sand",
    ],
    [
      "suspended-watersheds",
      "Suspended Watersheds",
      "hanging-islands",
      "storm",
      "river",
      "mist",
      "shore",
      135,
      "Floating stone gardens · suspended rainfalls · deep valleys",
    ],
    [
      "monsoon-arcade",
      "The Monsoon Arcade",
      "rain-temple",
      "storm",
      "mirror",
      "rain",
      "shore",
      224,
      "Flooded colonnades · concentric rain · layered roofs",
    ],
    [
      "obsidian-orrery",
      "Obsidian Orrery",
      "orbital-sea",
      "night",
      "mirror",
      "clear",
      "shore",
      275,
      "Monumental orbital rings · black sea · stellar drift",
    ],
    [
      "luminous-canyon",
      "River of the Inner Sun",
      "light-canyon",
      "dawn",
      "river",
      "mist",
      "glide",
      18,
      "Carved cliffs · luminous river · strata and mist",
    ],
    [
      "salt-mirror-horizon",
      "The Salt Mirror Horizon",
      "salt-mirrors",
      "aurora",
      "mirror",
      "clear",
      "overlook",
      190,
      "Hexagonal salt shelves · mirrored horizon · light gates",
    ],
  ];
  function defaults(i) {
    if (i >= 36) return XII.defaults(i - 36);
    if (i >= 20) return XI.defaults(i - 20);
    if (i >= 8) return HX.defaults(i - 8);
    const s = specs[i];
    return {
      shape: [
        "vault",
        "terrain",
        "ribbon",
        "branch",
        "lattice",
        "orbit",
        "terrain",
        "lattice",
      ][i],
      hue: s[7],
      lobes: 6 + (i % 4),
      force: i,
      growth: 0.65,
      mutation: 0.5,
      coupling: 0.6,
      lifecycle: 0.5,
      atmosphere: 0.62,
      symmetry: 0.65,
      drift: 0.35,
      afterglow: 0.55,
      topology: [
        "flow",
        "lattice",
        "flow",
        "colony",
        "lattice",
        "orbit",
        "flow",
        "lattice",
      ][i],
      material: [
        "mineral",
        "silk",
        "glass",
        "mineral",
        "mineral",
        "glass",
        "mineral",
        "glass",
      ][i],
      rhythm: [
        "tide",
        "growth",
        "tide",
        "growth",
        "tide",
        "orbit",
        "tide",
        "growth",
      ][i],
      depth: 0.7,
      relief: 0.6,
      landform: s[2],
      sky: s[3],
      water: s[4],
      weather: s[5],
      camera: s[6],
      scale: 0.55,
    };
  }
  // Bounded distance estimates in world-space units. Each function is independently
  // structural; shared rendering handles weather, water, light and camera separately.
  const fields = [
    `float worldField(vec3 p){float ground=p.y+1.25+.15*sin(p.x*.6)*sin(p.z*.5);vec3 q=p; q.z=mod(q.z+2.5,5.)-2.5;float arch=max(sdTorus(q.xzy,vec2(2.6,.32)),-q.y);vec3 leg=vec3(abs(q.x)-2.6,q.y+.6,q.z);float pillars=sdBox(leg,vec3(.29,.8,.32));return min(ground,min(arch,pillars));}`,
    `float worldField(vec3 p){float h=1.2*sin(p.x*.31)+.9*cos(p.z*.36)+.45*sin((p.x+p.z)*.7);h= floor(h*3.)/3.;return (p.y-h+1.2)*.55;}`,
    `float worldField(vec3 p){float h=.55*sin(p.x*.75+sin(p.z*.32))+.22*sin(p.z*1.8+p.x*.5);float d=(p.y-h+1.)*.7;vec3 q=p;q.xz=mod(q.xz+vec2(4.),8.)-4.;q.y-=.5;float sail=sdBox(rotZ(.35)*q,vec3(.055,1.5,1.));return min(d,sail);}`,
    `float worldField(vec3 p){vec3 q=p;q.xz=mod(q.xz+vec2(3.5),7.)-3.5;float radius=length(q.xz);float top=.5+.22*sin(q.x*1.3)*cos(q.z*1.1);float island=max(max(q.y-top,-q.y-1.4+radius*.3),radius-2.2);float fall=sdBox(q-vec3(1.6,-1.4,0),vec3(.035,1.7,.16));return min(fall,min(island,p.y+4.));}`,
    `float worldField(vec3 p){vec3 q=p;q.z=mod(q.z+2.,4.)-2.;float base=p.y+1.2;vec3 leg=vec3(abs(q.x)-2.2,q.y-.1,q.z);float pillars=sdBox(leg,vec3(.19,1.3,.2));float roof=sdBox(q-vec3(0,1.65,0),vec3(3.,.12,.75));float ribs=sdBox(q-vec3(0,1.9,0),vec3(2.5,.1,.55));return min(base,min(pillars,min(roof,ribs)));}`,
    `float worldField(vec3 p){float d=p.y+1.3;vec3 q=p-vec3(0,1.,0);d=min(d,sdTorus(rotX(.9)*q,vec2(3.,.13)));d=min(d,sdTorus(rotZ(.65)*q,vec2(2.5,.1)));return min(d,sdSphere(q,.62));}`,
    `float worldField(vec3 p){float channel=abs(p.x+.6*sin(p.z*.4));float banks=1.9-3.3*exp(-channel*channel*.3)+.22*sin(p.z*1.3+p.x*.6);return (p.y-banks)*.5;}`,
    `float worldField(vec3 p){vec2 q=p.xz; q.x+=mod(floor(q.y/2.),2.);q=mod(q+1.,2.)-1.;float hex=max(abs(q.x)*.866+abs(q.y)*.5,abs(q.y));float shelves=max(p.y+.72+floor(p.x*.23)*.05,hex-.88);vec3 gate=p-vec3(0,1.4,-3.);float portal=max(sdTorus(gate.xzy,vec2(2.1,.09)),-gate.y-.4);return min(p.y+1.2,min(shelves,portal));}`,
  ];
  const common = `
uniform vec4 uWorld; // scale, relief, hue, density
uniform vec4 uClimate; // sky, water, weather, camera
uniform vec4 uEcology; // topology, material, rhythm, shape
uniform float uLobes;
uniform float uForce;
uniform float uDepth;
float topographic(vec3 p,vec3 n){return smoothstep(.5,.9,n.y)*(.5+.5*sin(p.x*11.+sin(p.z*9.)+uTime*.14))*.025*uWorld.w;}
vec3 worldTint(float x){vec3 c=.5+.5*cos(TAU*(vec3(.03,.32,.62)+uWorld.z/360.+x));vec3 safe=mix(vec3(.08,.29,.62),vec3(.95,.69,.25),.5+.5*sin(x*4.));c=mix(c,safe,uColorSafe);return mix(vec3(dot(c,vec3(.2126,.7152,.0722))),c,uColorRange);}
vec3 skyLight(vec3 rd){float horizon=exp(-abs(rd.y)*3.);vec3 sky=mix(vec3(.015,.025,.065),vec3(.12,.25,.35),clamp(rd.y*.7+.3,0.,1.));
 if(uClimate.x<.5)sky=mix(vec3(.12,.17,.31),vec3(.63,.32,.19),pow(horizon,3.))*.7;
 else if(uClimate.x<1.5){float curtain=pow(.5+.5*sin(rd.x*13.+sin(rd.z*9.+uTime*.035)*2.+rd.y*7.),5.)*smoothstep(-.02,.5,rd.y);sky+=worldTint(rd.y*.25)*curtain*.48;}
 else if(uClimate.x<2.5){float cloud=fbm2(rd.xz*2.+uTime*.008);sky=mix(vec3(.025,.045,.085),vec3(.22,.27,.34),cloud)*(.5+.5*horizon);}
 else{sky*=.2;float stars=pow(hash12(floor(rd.xz/max(.1,abs(rd.y))*260.)),110.);sky+=vec3(stars)*smoothstep(0.,.4,rd.y)*.55;}
 vec3 sun=normalize(vec3(-.6,.24,-.8));sky+=vec3(.95,.65,.32)*pow(max(0.,dot(rd,sun)),190.)*.9;return sky;}
float scene(vec3 p){float size=.7+uWorld.x*.75;vec3 q=p/size;float relief=.75+uWorld.y*.5;q.y/=relief;float topology=uEcology.x;q.x+=.12*sin(q.z*(topology<.5?.3:topology<1.5?.5:topology<2.5?.9:.18)+uTime*.022+uRand*.01)*uCoupling*(1.2-uSymmetry*.4);
 float rhythm=uEcology.z;float breath=sin(uTime*(rhythm<.5?.09:rhythm<1.5?.17:rhythm<2.5?.045:.07));q.y-=.025*breath*uLife;
 return worldField(q)*size*min(1.,relief);}
vec3 stone(vec3 p,vec3 n){float strata=.5+.5*sin(p.y*(8.+uLobes)+sin(p.z*1.4)*(.15+uMutation*.3));vec3 c=mix(vec3(.11,.16,.19),worldTint(p.y*.035)*.6,.22+strata*.13);float top=smoothstep(.25,.8,n.y)*uGrowth;
 c=mix(c,worldTint(.3)*(.18+.22*strata),top*.6);if(uEcology.y<.5)c*=.9+.1*sin(p.z*35.);else if(uEcology.y<1.5)c=mix(c,skyLight(reflect(normalize(p-vec3(3,2,7)),n)),.35);else if(uEcology.y<2.5)c*=.6;
 if(WORLDINDEX==3&&p.y<.2&&abs(mod(p.x/(.7+uWorld.x*.75)+3.5,7.)-3.5-1.6)<.08)c=vec3(.11,.3,.35)*(.7+.3*sin(p.y*14.+uTime*.9));return c;}
void main(){vec2 uv=screenUV();float turn=sin(uTime*.018)*.12*uDrift;vec3 ro=vec3(5.5+sin(turn)*2.,2.3,7.5+cos(turn)*.5),at=vec3(0,.05,-1.5);
 if(uClimate.w>.5&&uClimate.w<1.5){ro=vec3(4.7+sin(uTime*.018)*.6*uDrift,1.8,8.);at=vec3(0,-.2,-2.);}
 if(uClimate.w>1.5){ro=vec3(6.,4.1,8.);at=vec3(0,2.1,-1.);}
 float safeScale=(.7+uWorld.x*.75)*(.75+uWorld.y*.5);if(WORLDINDEX==6)ro.y=max(ro.y,2.2*safeScale+.65);if(WORLDINDEX==1)ro.y=max(ro.y,3.1*safeScale+.4);
 vec3 rd=lookAt(ro,at,vec3(0,1,0))*normalize(vec3(uv*(1.8-uDepth*.5)+uMouse*.012,1.35));vec3 color=skyLight(rd);float distance=.03;bool hit=false;
 for(int i=0;i<80;i++){vec3 p=ro+rd*distance;float d=scene(p);if(abs(d)<.004){hit=true;break;}distance+=max(.004,abs(d)*.65);if(distance>45.)break;}
 float water=-.78+.045*sin(uTime*.14+uForce);bool wet=uClimate.y<2.5;float wt=rd.y<-.001?(water-ro.y)/rd.y:1000.;
 vec3 wp=ro+rd*wt;bool channel=uClimate.y<1.5||abs(wp.x+.6*sin(wp.z*.4))<1.2;
 if(wet&&channel&&wt>0.&&wt<distance){vec3 p=wp;float wave=sin(p.x*2.1+uTime*.17)*cos(p.z*1.8-uTime*.13);vec3 n=normalize(vec3(.025*cos(p.x*2.1+uTime*.17),1.,.025*sin(p.z*1.8-uTime*.13)));if(uClimate.y> .5&&uClimate.y<1.5)n=normalize(vec3(n.x*.25,1,n.z*.25));color=mix(worldTint(.25)*.09,skyLight(reflect(rd,n)),.38+.45*pow(1.-max(0.,dot(n,-rd)),3.));float ripples=.5+.5*sin(length(p.xz)*7.-uTime*.75);if(uClimate.z>.5&&uClimate.z<1.5)color+=vec3(.04)*pow(ripples,12.);color+=worldTint(.12)*pow(.5+.5*wave,12.)*.07*uAfterglow;if(uClimate.y>1.5)color+=worldTint(.02)*(.12+.15*pow(.5+.5*wave,3.))*uAfterglow;distance=wt;}
 else if(hit){vec3 p=ro+rd*distance;vec2 e=vec2(.008,0);vec3 n=normalize(vec3(scene(p+e.xyy)-scene(p-e.xyy),scene(p+e.yxy)-scene(p-e.yxy),scene(p+e.yyx)-scene(p-e.yyx))+vec3(.00001));float light=.2+.8*max(0.,dot(n,normalize(vec3(-.6,.7,.4))));color=stone(p,n)*light;float flowing=.5+.5*sin(p.z*.7+p.y*1.4-uTime*.11);float vein=pow(.5+.5*sin(p.y*7.+p.z*.5),18.);color+=worldTint(.6)*vein*.11*uAfterglow*flowing;
 if(uEcology.w<.5||uEcology.w>2.5&&uEcology.w<3.5||uEcology.w>9.5&&uEcology.w<10.5)color+=worldTint(.32)*topographic(p,n);
 }
 float fog=1.-exp(-distance*(.018+uAtmosphere*.033)*(uClimate.z<.5?1.5:1.));color=mix(color,skyLight(rd),fog);
 if(uClimate.z> .5&&uClimate.z<1.5){vec2 rain=uv*vec2(160.,40.);float streak=pow(.5+.5*sin(rain.x+sin(floor(rain.x)*1.7)),32.)*pow(.5+.5*sin(rain.y+uTime*1.8),10.);color+=vec3(.09,.12,.15)*streak;}
 if(uClimate.z>1.5&&uClimate.z<2.5){float dust=pow(.5+.5*sin(uv.x*80.+sin(uv.y*43.+uTime*.07)),35.)*pow(.5+.5*sin(uv.y*95.-uTime*.13),30.);color+=worldTint(.1)*dust*.16;}
 fragColor=vec4(finish(max(vec3(0),color)*(.45+.75*uIntensity)*uFade,uv,.12),1.);}`;
  function shader(index) {
    if (index >= 36) return XII.shader(index - 36);
    if (index >= 20) return XI.shader(index - 20);
    if (index >= 8) return HX.shader(index - 8);
    return "const int WORLDINDEX=" + index + ";\n" + fields[index] + common;
  }
  function uniforms(g) {
    return {
      uWorld: [g.scale, g.relief, g.hue, g.growth],
      uClimate: ["sky", "water", "weather", "camera"].map((k) =>
        MODULES[k].indexOf(g[k]),
      ),
      uEcology: [
        ["colony", "orbit", "lattice", "flow"].indexOf(g.topology),
        ["silk", "glass", "ink", "mineral"].indexOf(g.material),
        ["tide", "pulse", "growth", "orbit"].indexOf(g.rhythm),
        [
          "bloom",
          "shell",
          "ribbon",
          "branch",
          "vault",
          "sponge",
          "membrane",
          "lattice",
          "orbit",
          "terrain",
          "coral",
          "vortex",
        ].indexOf(g.shape),
      ],
      uLobes: g.lobes,
      uForce: g.force,
      uDepth: g.depth,
    };
  }
  // The authored single-pass contract has no custom-uniform hook: its defaults are
  // constants inside the same shader body. Offspring use the exact body + uniforms.
  function authored(index) {
    const g = defaults(index);
    let source = shader(index);
    for (const [key, val] of Object.entries(uniforms(g))) {
      const type = Array.isArray(val) ? "vec4" : "float",
        literal = Array.isArray(val)
          ? "vec4(" + val.map((x) => Number(x).toFixed(6)).join(",") + ")"
          : Number(val).toFixed(6);
      source = source.replace(
        new RegExp("uniform " + type + " " + key + ";"),
        "const " + type + " " + key + "=" + literal + ";",
      );
    }
    return source;
  }
  const exactSourceIDs = [...specs, ...HX.specs, ...XI.specs, ...XII.specs].map(
    (s) => s[0],
  );
  const api = {
    MODULES,
    specs,
    defaults,
    fields,
    shader,
    uniforms,
    authored,
    exactSourceIDs,
  };
  if (typeof module !== "undefined") module.exports = api;
  else root.WorldKernels = api;
})(typeof window !== "undefined" ? window : globalThis);
