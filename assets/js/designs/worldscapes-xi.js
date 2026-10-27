/* XI — IMPOSSIBLE SHORES. Sixteen independently authored environment kernels.
   Complete allowlisted bodies are shared with world-v3, never recipe shader text. */
(function (root) {
  "use strict";
  const specs = [
    [
      "oceans-above-the-sky",
      "Oceans Above the Sky",
      "sky-oceans",
      190,
      "Suspended ocean shelves · falling light · double horizon",
      "ocean",
    ],
    [
      "crystal-moon-labyrinth",
      "The Crystal Moon Labyrinth",
      "moon-labyrinth",
      269,
      "Prismatic maze continents · twin moons · emissive crystal seams",
      "architecture",
    ],
    [
      "leviathan-cloud-gardens",
      "Leviathan Cloud Gardens",
      "cloud-gardens",
      142,
      "Hollow cloud arches · monumental suspended gardens · stellar haze",
      "organic",
    ],
    [
      "liquid-opal-grotto",
      "The Liquid Opal Grotto",
      "opal-grotto",
      309,
      "Iridescent cavern oceans · liquid vaults · flowing mineral light",
      "geology",
    ],
    [
      "amethyst-gravity-causeway",
      "Amethyst Gravity Causeway",
      "gravity-causeway",
      277,
      "Ascending gravity shelves · levitating causeways · amethyst mist",
      "surreal",
    ],
    [
      "sunken-starlight-palace",
      "The Sunken Starlight Palace",
      "starlight-palace",
      208,
      "Flooded celestial colonnades · luminous vaults · slow tidal glow",
      "architecture",
    ],
    [
      "molten-snowfields",
      "The Molten Snowfields",
      "molten-snow",
      17,
      "Glacial ridges · molten seams · immense eclipsed horizon",
      "landscape",
    ],
    [
      "orchard-of-ringed-moons",
      "Orchard of Ringed Moons",
      "moon-orchard",
      45,
      "Ringed celestial orchards · obsidian tidal plain · stellar parallax",
      "cosmic",
    ],
    [
      "pearlstorm-nebula",
      "The Pearlstorm Nebula",
      "pearlstorm",
      321,
      "Pearlescent nebula volumes · folded dust lanes · deep starlight",
      "cosmic",
    ],
    [
      "aureole-world-engine",
      "The Aureole World Engine",
      "aureole-engine",
      32,
      "Vast interlocking light orbits · mirrored horizon · golden depth",
      "geometry",
    ],
    [
      "sapphire-tidal-aurora",
      "Sapphire Tidal Aurora",
      "tidal-aurora",
      185,
      "A sea of auroral curtains · tidal reflections · drifting light",
      "atmosphere",
    ],
    [
      "hypersilk-worldsheets",
      "Hypersilk Worldsheets",
      "hypersilk",
      289,
      "Translucent folded worldsheets · spectral veils · coherent flow",
      "abstract",
    ],
    [
      "living-prism-horizon",
      "The Living Prism Horizon",
      "prism-horizon",
      219,
      "Layered prismatic ranges · evolving facets · distant gradient worlds",
      "landscape",
    ],
    [
      "dreamtide-coral-expanse",
      "Dreamtide Coral Expanse",
      "dreamtide",
      159,
      "Underwater luminous forests · coral light fields · passing plankton",
      "ocean",
    ],
    [
      "silver-rain-infinity",
      "Silver Rain Infinity",
      "silver-rain",
      233,
      "Vast silver rain volumes · refracted moon halos · violet depth",
      "atmosphere",
    ],
    [
      "bioluminescent-eventide",
      "Bioluminescent Eventide",
      "eventide",
      116,
      "Branching light roots · floating spore constellations · dream forest",
      "organic",
    ],
  ];
  function defaults(i) {
    const s = specs[i];
    return {
      shape: [
        "membrane",
        "lattice",
        "branch",
        "shell",
        "terrain",
        "vault",
        "terrain",
        "orbit",
        "vortex",
        "orbit",
        "ribbon",
        "membrane",
        "terrain",
        "coral",
        "ribbon",
        "branch",
      ][i],
      hue: s[3],
      lobes: 5 + (i % 8),
      force: i % 8,
      growth: 0.72,
      mutation: 0.62,
      coupling: 0.68,
      lifecycle: 0.6,
      atmosphere: 0.58,
      symmetry: 0.55,
      drift: 0.5,
      afterglow: 0.72,
      topology: [
        "flow",
        "lattice",
        "colony",
        "flow",
        "orbit",
        "lattice",
        "flow",
        "orbit",
        "colony",
        "orbit",
        "flow",
        "flow",
        "lattice",
        "colony",
        "flow",
        "colony",
      ][i],
      material: i % 3 === 0 ? "glass" : i % 3 === 1 ? "mineral" : "silk",
      rhythm: i % 2 ? "growth" : "tide",
      depth: 0.8,
      relief: 0.65,
      landform: s[2],
      sky: i % 3 === 0 ? "aurora" : i % 3 === 1 ? "night" : "dawn",
      water: [0, 3, 5, 7, 9, 10, 13].includes(i) ? "mirror" : "dry",
      weather: i === 14 ? "rain" : i % 4 === 0 ? "mist" : "clear",
      camera: i === 3 ? "glide" : i % 2 ? "shore" : "overlook",
      scale: 0.7,
    };
  }
  const common = `
uniform vec4 uWorld;
uniform vec4 uClimate;
uniform vec4 uEcology;
uniform float uLobes;
uniform float uForce;
uniform float uDepth;
float driftXI(float seed){float q=uTime/(9.+hash11(seed)*9.),k=floor(q),f=fract(q);f=f*f*f*(f*(f*6.-15.)+10.);return mix(hash11(k+seed*17.1),hash11(k+1.+seed*17.1),f);}
float developXI(float seed){return (driftXI(seed)-.5)*uMutation*uNovelty;}
vec3 jewel(float x){vec3 c=.5+.5*cos(TAU*(vec3(.03,.32,.64)+x+uWorld.z/360.+developXI(5.)*.16));c=mix(c,mix(vec3(.05,.35,.82),vec3(1.,.66,.18),.5+.5*sin(x*5.)),uColorSafe);return mix(vec3(luma(c)),c,uColorRange);}
float mistXI(vec3 p){return vnoise3(p)*.63+vnoise3(p*2.07+3.1)*.25+vnoise3(p*4.13-2.7)*.12;}
vec3 heaven(vec3 rd){float h=exp(-abs(rd.y)*3.5);vec3 col=mix(vec3(.006,.012,.04)+jewel(.35)*.025,jewel(.65)*.18+vec3(.04,.04,.07),h);float curtain=pow(.5+.5*sin(rd.x*11.+sin(rd.z*7.+uTime*.052)*2.+rd.y*9.),5.);if(uClimate.x<1.5)col+=jewel(rd.y*.45+.2)*curtain*smoothstep(-.03,.35,rd.y)*.48;
 float stars=starLayer(rd.xz/max(.2,abs(rd.y))* .2,95.,20.,12.);col+=vec3(.6,.75,1.)*stars*smoothstep(.02,.3,rd.y)*.7;
 vec3 moon=normalize(vec3(-.58,.22,-.8));float d=length(rd-moon);col+=vec3(.65,.75,1.)*(1.-smoothstep(.065,.069,d))*.45;col+=jewel(.1)*exp(-abs(d-.108)*180.)*.25;float second=length(rd-normalize(vec3(.55,.16,-.9)));col+=vec3(.85,.54,.29)*(1.-smoothstep(.032,.035,second))*.4;col+=vec3(.8,.52,.26)*pow(max(0.,dot(rd,normalize(vec3(.55,.16,-.9)))),160.)*.6;
 return col;}
vec3 finishXI(vec3 col,vec2 uv){return finish(max(vec3(0),col)*(.35+.85*uIntensity)*uFade,uv,.1);}
vec3 cameraRay(vec3 ro,vec3 at,vec2 uv){return lookAt(ro,at,vec3(0,1,0))*normalize(vec3(uv*(1.8-uDepth*.25)+uMouse*.016,1.35));}
float segmentXI(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.))-r;}
vec3 weatherXI(vec3 col,vec2 uv){if(uClimate.z>.5&&uClimate.z<1.5){float rain=pow(.5+.5*sin(uv.x*173.+sin(floor(uv.x*173.)*1.7)),34.)*pow(.5+.5*sin(uv.y*42.+uTime*1.8),10.);col+=vec3(.06,.1,.16)*rain;}return col;}
`;
  const fields = [
    `float landXI(vec3 p){vec3 q=p;q.xz=mod(q.xz+7.,14.)-7.;float shelf=max(length(q.xz)-4.8,max(q.y-5.5,-q.y+4.7+length(q.xz)*.09));float fall=sdBox(q-vec3(3.7,1.4,0),vec3(.09,3.5,.3));float reef=p.y+2.3+.2*sin(p.x*.4)*sin(p.z*.3);return min(reef,min(shelf,fall));}`,
    `float landXI(vec3 p){vec3 q=p;q.xz=mod(q.xz+3.,6.)-3.;float h=2.7+1.4*sin(floor(p.x/6.)*1.7+floor(p.z/6.)*2.1);float crystal=max((abs(q.x)+abs(q.z))*.707-1.65,abs(q.y-h*.5)-h*.5);float cut=sdBox(q-vec3(0,.8,0),vec3(.52,.95,2.2));return min(p.y+1.5,max(crystal,-cut));}`,
    `float landXI(vec3 p){vec3 q=p;q.xz=mod(q.xz+6.,12.)-6.;vec3 tor=q-vec3(0,2.,0);float crown=sdTorus(rotX(.75)*rotZ(.4)*tor,vec2(3.4,.4));float arch=sdTorus(rotX(1.4)*tor,vec2(2.8,.28));return min(p.y+3.,min(crown,arch));}`,
    `float landXI(vec3 p){vec3 q=p;q.x+=.65*sin(p.z*.17+uTime*.035);float radius=4.3+.5*sin(p.z*.25)+.2*sin(atan(q.y-1.,q.x)*5.+p.z*.3);float cave=radius-length(vec2(q.x,(q.y-1.)*.85));return min(cave,p.y+2.4);}`,
    `float landXI(vec3 p){vec3 q=p;float cell=floor((q.z+3.)/6.);q.z=mod(q.z+3.,6.)-3.;q.x-=sin(cell*.8)*4.;q.y-=sin(cell*.43)*2.;float shelf=sdBox(rotZ(.12*sin(cell))*q,vec3(2.4,.25,1.5));float gate=sdTorus((q-vec3(0,2,0)).xzy,vec2(1.9,.12));return min(p.y+4.,min(shelf,gate));}`,
    `float landXI(vec3 p){vec3 q=p;q.z=mod(q.z+2.5,5.)-2.5;float column=sdBox(vec3(abs(q.x)-3.,q.y-1.5,q.z),vec3(.24,3.,.25));float vault=max(sdTorus((q-vec3(0,3.4,0)).xzy,vec2(3.,.19)),-q.y+3.4);return min(p.y+1.4,min(column,vault));}`,
    `float landXI(vec3 p){float ridge=pow(abs(sin(p.x*.16+sin(p.z*.12))),1.7)*5.+mistXI(p*.12)*1.7;return (p.y-ridge+1.8)*.6;}`,
    `float landXI(vec3 p){vec3 q=p;q.xz=mod(q.xz+8.,16.)-8.;q.y-=3.;float sphere=length(q)-1.45;float ring=sdTorus(rotZ(.52)*q,vec2(2.65,.09));return min(p.y+2.,min(sphere,ring));}`,
  ];
  const landscape = `
float sceneXI(vec3 p){float scale=.8+uWorld.x*.6;vec3 q=p/scale;q.y/=.8+uWorld.y*.45;q.x+=.15*sin(q.z*.25+uTime*.08)*uCoupling;q.z+=developXI(3.)*.2;return landXI(q)*scale*.75;}
void main(){vec2 uv=screenUV();vec3 ro=vec3(9.,6.8,13.),at=vec3(0,1.5,-8.);if(uClimate.w>1.5)ro=vec3(10.,8.5,15.);if(SCENE==1){ro=vec3(12.,11.,17.);at=vec3(0,0,-14.);}if(SCENE==6){ro=vec3(12.,14.,22.);at=vec3(0,0,-20.);}if(SCENE==3){ro=vec3(0,1.5,8.);at=vec3(0,1.,-8.);}ro.x+=sin(uTime*.025)*.5*uDrift;vec3 rd=cameraRay(ro,at,uv);float travel=.03,glow=0.;bool hit=false;
 for(int j=0;j<(SCENE==6?144:76);j++){vec3 p=ro+rd*travel;float d=sceneXI(p);glow+=exp(-abs(d)*8.)*.003;if(abs(d)<.006){hit=true;break;}travel+=max(.004,abs(d)*.6);if(travel>85.)break;}
 vec3 col=heaven(rd);float water=-1.3+.07*sin(uTime*.19),wt=rd.y<-.001?(water-ro.y)/rd.y:1000.;
 if(uClimate.y<2.5&&wt>0.&&wt<travel){vec3 p=ro+rd*wt;vec3 n=normalize(vec3(.035*cos(p.x*.9+uTime*.24),1.,.035*sin(p.z*.9-uTime*.19)));col=mix(jewel(.32)*.045,heaven(reflect(rd,n)),.62);float caustic=pow(.5+.5*sin(p.x*.7+sin(p.z*.45)-uTime*.29),12.);col+=jewel(.12+p.z*.015)*caustic*(.12+.25*uAfterglow);travel=wt;}
 else if(hit){vec3 p=ro+rd*travel;vec2 e=vec2(max(.006,travel*.0002),0);vec3 n=normalize(vec3(sceneXI(p+e.xyy)-sceneXI(p-e.xyy),sceneXI(p+e.yxy)-sceneXI(p-e.yxy),sceneXI(p+e.yyx)-sceneXI(p-e.yyx))+vec3(.00001));float light=.22+.78*max(0.,dot(n,normalize(vec3(-.4,.9,.6))));float strata=.5+.5*sin(p.y*3.3+sin(p.z*.27)+uTime*.05);col=mix(jewel(.24+p.y*.018),jewel(.58+p.z*.008),strata*.6)*(.15+.35*light);float veins=pow(.5+.5*sin(p.y*5.+p.z*.3+sin(p.x*.5)-uTime*.15),22.);col+=jewel(.12)*veins*(.12+.4*uAfterglow);col+=jewel(.72)*pow(1.-abs(dot(n,rd)),3.)*.18;if(SCENE==6){col=mix(col,vec3(.5,.65,.83)*light,smoothstep(.4,.9,n.y)*.65);col+=vec3(1.,.12,.008)*veins*.5;}}
 float fog=1.-exp(-travel*(.007+.015*uAtmosphere));col=mix(col,heaven(rd),fog);col+=jewel(.1)*glow*.08;fragColor=vec4(finishXI(weatherXI(col,uv),uv),1.);}`;
  const optics = [
    // Folded pearlescent cloud volume with actual front-to-back extinction.
    `void main(){vec2 uv=screenUV();vec3 ro=vec3(sin(uTime*.018)*uDrift*.4,0,uTime*.014),rd=normalize(vec3(uv*(1.4-uWorld.x*.3),1.));vec3 col=vec3(0);float tr=1.;for(int i=0;i<36;i++){float t=.3+float(i)*.38;vec3 p=ro+rd*t;vec3 q=rotZ(.35+uTime*.007)*p;float band=q.y-.75*sin(q.x*.8+sin(q.z*.4));float density=exp(-band*band*2.8)*smoothstep(.35,.8,mistXI(q*.7+developXI(2.)));col+=tr*jewel(q.z*.05+q.x*.06)*density*.12;tr*=exp(-density*.1);}col+=heaven(normalize(vec3(uv,1.)))*tr*.3;float pearl=exp(-length(uv-vec2(.23,.12))*18.);col+=vec3(.5,.7,1.)*pearl*.5;fragColor=vec4(finishXI(col,uv),1.);}`,
    // Interlocking projected orbital arcs with reflected geometry, not a central blob.
    `void main(){vec2 uv=screenUV();vec3 col=heaven(normalize(vec3(uv,1.)))*.3;vec2 p=uv;if(p.y<-.12)p.y=-.24-p.y;for(int i=0;i<10;i++){float k=float(i);vec2 q=rot2(k*.39+uTime*.025*(mod(k,2.)*2.-1.))*p;q.x*=.7+.3*cos(k*.8);float d=abs(length(q-vec2(sin(k)*.16,.12))-(.22+k*.065));float width=max(fwidth(d),.001);col+=jewel(k*.075)*exp(-d*65.)*.22;col+=jewel(.1+k*.05)*(1.-smoothstep(.001,.001+width*1.5,d))*.7;}col*=uv.y<-.12?.55:1.;fragColor=vec4(finishXI(col,uv),1.);}`,
    // Layered sky curtains above their slowly undulating reflected ocean.
    `void main(){vec2 uv=screenUV();vec2 p=uv;bool mirror=p.y<-.12;if(mirror)p.y=-.24-p.y+.012*sin(p.x*30.+uTime*.4);vec3 col=heaven(normalize(vec3(p,1.)))*.35;for(int i=0;i<14;i++){float k=float(i),y=.12+.17*sin(p.x*3.+k*.24+uTime*.06)+k*.014;float d=abs(p.y-y);float band=exp(-d*(25.+k*2.))*smoothstep(.45,1.,.5+.5*sin(p.x*14.+k+uTime*.04));col+=jewel(k*.061+p.y*.3)*band*.11;}if(mirror)col*=.48+.12*sin(p.x*4.+uTime*.11);fragColor=vec4(finishXI(col,uv),1.);}`,
    // Soft continuous sheet intersections produce translucent world-sized folds.
    `void main(){vec2 uv=screenUV();vec3 col=vec3(.004,.008,.028);for(int i=0;i<18;i++){float k=float(i),z=1.+k*.16;vec2 p=uv*z;float wave=.25*sin(p.x*2.4+k*.43+uTime*.12)+.1*sin(p.x*4.-k*.23-uTime*.07);float d=abs(p.y-wave-(k-9.)*.034);float width=.012+.026*(.5+.5*sin(p.x*2.+k+uTime*.06));float aa=max(fwidth(d),.001);float inside=1.-smoothstep(width-aa,width+aa,d);vec3 light=jewel(p.x*.1+k*.067);col=mix(col,light*(.2+.24*cos(p.x+k)*cos(p.x+k)),inside*.55/z);col+=light*exp(-abs(d-width)*100.)*.09/z;}col+=heaven(normalize(vec3(uv,1.)))*.08;fragColor=vec4(finishXI(col,uv),1.);}`,
    // Disparate faceted horizon layers, parallax and luminous ridge lines.
    `void main(){vec2 uv=screenUV();vec3 col=heaven(normalize(vec3(uv,1.)));for(int i=0;i<14;i++){float k=float(i),depth=1.+k*.3;float x=uv.x*depth+sin(uTime*.018)*uDrift*.3;float ridges=abs(sin(x*3.+k*.7))*.13+abs(sin(x*7.+k))*.035;float y=-.06-k*.035+ridges;float aa=max(fwidth(uv.y),.001);float mask=1.-smoothstep(y-aa,y+aa,uv.y);vec3 land=jewel(k*.06+x*.025)*(.12+.025*k);col=mix(col,land,mask);col+=jewel(.25+k*.04)*exp(-abs(uv.y-y)*220.)*.18;}fragColor=vec4(finishXI(col,uv),1.);}`,
    // Deep underwater field of branching caustic light, viewed through plankton.
    `void main(){vec2 uv=screenUV();vec3 col=mix(vec3(.002,.012,.05),jewel(.4)*.16,smoothstep(-.5,.5,uv.y));for(int i=0;i<28;i++){float k=float(i),z=1.+k*.42;vec2 p=uv*z;float root=sin(p.x*2.+sin(z*.6+uTime*.09))+.6*sin(p.y*2.-z*.3);float branch=exp(-abs(root)*24.)*exp(-pow(p.y+z*.25,2.)*.08);col+=jewel(z*.03+p.y*.04)*branch*.065;float shaft=pow(.5+.5*cos(p.x*.8+sin(z*.4+uTime*.04)),28.);col+=vec3(.04,.11,.12)*shaft*.04;vec2 dust=p*2.+vec2(uTime*.006,uTime*.012),df=fract(dust)-.5;float plankton=exp(-dot(df,df)*170.)*smoothstep(.82,.99,hash12(floor(dust)+k));col+=jewel(.6+k*.02)*plankton*.06/z;}col+=jewel(.2)*pow(max(0.,1.-abs(uv.x+.2+uv.y*.3)),24.)*.14;fragColor=vec4(finishXI(col,uv),1.);}`,
    // Smooth 3D rain filaments: density vanishes at cell edges, no cell popping.
    `void main(){vec2 uv=screenUV();vec3 col=heaven(normalize(vec3(uv,1.)))*.6;for(int i=0;i<24;i++){float k=float(i),z=1.+k*.35;vec2 p=uv*z*vec2(14.,4.)+vec2(sin(uTime*.08)*.4,uTime*.55);vec2 cell=floor(p),f=fract(p)-.5;float h=hash12(cell+vec2(k*7.,0));float streak=exp(-f.x*f.x*230.)*pow(max(0.,1.-abs(f.y)*2.),3.)*smoothstep(.5,.9,h);col+=jewel(k*.05+.2)*streak*.09/(1.+k*.04);}float halo=abs(length(uv-vec2(-.2,.16))-.19);col+=vec3(.2,.35,.6)*exp(-halo*90.)*.4;fragColor=vec4(finishXI(col,uv),1.);}`,
    // Branching luminous root volumes and smoothly drifting spore constellations.
    `void main(){vec2 uv=screenUV();vec3 col=vec3(.003,.009,.023);for(int i=0;i<26;i++){float k=float(i),z=1.+k*.27;vec2 p=uv*z;float bend=sin(p.y*2.+k*.8+uTime*.08)*.2;float root=abs(sin((p.x+bend)*3.5+k*.3));float strand=exp(-root*38.)*exp(-abs(p.y+.2)*.8);col+=jewel(k*.04+p.y*.09)*strand*.09;vec2 sp=p*4.+vec2(sin(uTime*.03+k)*.12,uTime*.018),cell=floor(sp),point=fract(sp)-.5;float spore=exp(-dot(point,point)*120.)*smoothstep(.85,.99,hash12(cell+k));col+=jewel(.4+k*.03)*spore*.14;}col+=heaven(normalize(vec3(uv,1.)))*.08;fragColor=vec4(finishXI(col,uv),1.);}`,
  ];
  function shader(i) {
    return (
      common +
      "\nconst int SCENE=" +
      i +
      ";\n" +
      (i < 8 ? fields[i] + landscape : optics[i - 8])
    );
  }
  const api = { specs, defaults, fields, optics, shader };
  if (typeof module !== "undefined") module.exports = api;
  else root.WorldscapesXI = api;
})(typeof window !== "undefined" ? window : globalThis);
