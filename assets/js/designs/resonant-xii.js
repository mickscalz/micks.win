/* XII — RESONANT INFINITIES. Sixteen authored environments, shared verbatim
   with the allowlisted nursery. Sound metadata describes artistic intent. */
(function (root) {
  "use strict";
  const specs = [
    [
      "inverted-pearl-sea",
      "The Inverted Pearl Sea",
      "pearl-vault",
      193,
      "Vaulted ocean worlds · luminous nacre · suspended tides",
      "ocean",
      "hybrid",
    ],
    [
      "andromeda-stairwell",
      "Stairwell to Andromeda",
      "stellar-stair",
      268,
      "Helical celestial stairwells · suspended landings · stellar depth",
      "architecture",
      "cinematic",
    ],
    [
      "gardens-of-a-dying-star",
      "Gardens of a Dying Star",
      "stellar-garden",
      329,
      "Monumental stellar flower crowns · ember petals · distant plasma",
      "organic",
      "hybrid",
    ],
    [
      "mirror-rain-basilica",
      "The Mirror-Rain Basilica",
      "mirror-basilica",
      216,
      "Gothic flooded vaults · mirrored celestial rain · blue light",
      "architecture",
      "melodic",
    ],
    [
      "tesseract-estuary",
      "The Tesseract Estuary",
      "tesseract-frames",
      170,
      "Nested cubic worldframes · glass estuaries · dimensional parallax",
      "geometry",
      "hybrid",
    ],
    [
      "velvet-eclipse-badlands",
      "Velvet Eclipse Badlands",
      "eclipse-badlands",
      282,
      "Velvet crater terrain · luminous rims · vast eclipsed sky",
      "geology",
      "cinematic",
    ],
    [
      "frozen-lightning-cathedral",
      "Cathedral of Frozen Lightning",
      "lightning-grove",
      202,
      "Crystalline branching lightning · luminous mineral forest · polar dusk",
      "crystal",
      "melodic",
    ],
    [
      "saffron-leviathan-dunes",
      "The Saffron Leviathan Dunes",
      "leviathan-dunes",
      38,
      "Compound monumental dune waves · solar dust · bronze ridges",
      "landscape",
      "cinematic",
    ],
    [
      "organza-solar-sails",
      "Organza Solar Sails",
      "solar-organza",
      24,
      "Translucent sunlit sails · billowing planetary membranes · opal edges",
      "abstract",
      "melodic",
    ],
    [
      "luminous-mycelium-cosmos",
      "The Luminous Mycelium Cosmos",
      "mycelial-cosmos",
      148,
      "Deep branching light filaments · interconnected stellar gardens",
      "organic",
      "hybrid",
    ],
    [
      "rivers-through-time",
      "Rivers Through Time",
      "time-rivers",
      186,
      "Braided temporal rivers · luminous continental channels · slow parallax",
      "flow",
      "melodic",
    ],
    [
      "ocean-of-diamond-rain",
      "Ocean of Diamond Rain",
      "diamond-rain",
      224,
      "Depth-layered falling prisms · refracted ocean light · silver-blue drift",
      "ocean",
      "hybrid",
    ],
    [
      "halo-moth-constellations",
      "Halo-Moth Constellations",
      "halo-moths",
      310,
      "Vast luminous wing membranes · drifting orbital constellations",
      "organic",
      "melodic",
    ],
    [
      "obsidian-lace-nebula",
      "The Obsidian Lace Nebula",
      "obsidian-nebula",
      264,
      "Dark lace dust volumes · luminous interstices · stellar extinction",
      "cosmic",
      "cinematic",
    ],
    [
      "mercury-blossom-horizon",
      "The Mercury Blossom Horizon",
      "mercury-blooms",
      202,
      "Liquid-metal flower horizons · spectral reflections · developing petals",
      "surreal",
      "hybrid",
    ],
    [
      "infinite-lantern-tide",
      "The Infinite Lantern Tide",
      "lantern-tide",
      34,
      "Drifting lantern flotillas · luminous inner seeds · endless reflected tides",
      "atmosphere",
      "melodic",
    ],
  ];
  function defaults(i) {
    return {
      shape: [
        "shell",
        "orbit",
        "coral",
        "vault",
        "lattice",
        "terrain",
        "branch",
        "terrain",
        "membrane",
        "branch",
        "ribbon",
        "lattice",
        "membrane",
        "vortex",
        "bloom",
        "orbit",
      ][i],
      hue: specs[i][3],
      lobes: 6 + (i % 6),
      force: i % 8,
      growth: 0.7,
      mutation: 0.62,
      coupling: 0.65,
      lifecycle: 0.58,
      atmosphere: 0.62,
      symmetry: 0.58,
      drift: 0.55,
      afterglow: 0.7,
      topology: ["flow", "orbit", "colony", "lattice"][i % 4],
      material: i % 3 === 0 ? "glass" : i % 3 === 1 ? "silk" : "mineral",
      rhythm: i % 2 ? "tide" : "growth",
      depth: 0.8,
      relief: 0.7,
      landform: specs[i][2],
      sky: i % 3 === 0 ? "aurora" : i % 3 === 1 ? "night" : "dawn",
      water: [0, 3, 4, 10, 11, 14, 15].includes(i) ? "mirror" : "dry",
      weather: [3, 11].includes(i) ? "rain" : i % 4 === 0 ? "mist" : "clear",
      camera: i < 4 ? "shore" : "overlook",
      scale: 0.7,
    };
  }
  const common = `
uniform vec4 uWorld;uniform vec4 uClimate;uniform vec4 uEcology;uniform float uLobes;uniform float uForce;uniform float uDepth;
float evolvingR(float s){float q=uTime/(10.+hash11(s)*6.),k=floor(q),f=fract(q);f=f*f*f*(f*(f*6.-15.)+10.);return mix(hash11(k+s*19.),hash11(k+1.+s*19.),f)-.5;}
vec3 hueCol(float h){h=fract(h);vec3 p=abs(fract(h+vec3(1.,2./3.,1./3.))-.5)*6.;return clamp(p-.5,0.,1.);}
vec3 spectrumR(float x){float h0=uWorld.z/360.+fract(float(SCENE)*.618+.11);float t=.5+.5*sin(x*1.6+uRand*.7);vec3 deep=hueCol(h0)*.1+vec3(.008,.01,.018);vec3 mid=hueCol(h0+.06)*.5;vec3 high=hueCol(h0+.17)*.95+vec3(.05);vec3 c=mix(deep,mid,smoothstep(0.,.58,t));c=mix(c,high,smoothstep(.5,1.,t));c=mix(c,hueCol(h0+.5),pow(max(0.,sin(x*1.3+.6)),14.)*.16);c=mix(vec3(luma(c))*.92,c,.93);c=mix(c,c*c*(3.-2.*c),.35);return mix(c,vec3(.18,.5,.9)*(.65+.35*sin(x*5.)),uColorSafe);}
float cloudR(vec3 p){p+=vec3(evolvingR(2.),0,evolvingR(4.))*uMutation*.25;return .65*vnoise3(p)+.25*vnoise3(p*2.03+7.)+.1*vnoise3(p*4.07-3.);}
vec3 skyR(vec3 rd){float shift=float(SCENE)*.047;float horizon=exp(-abs(rd.y)*3.);vec3 col=mix(vec3(.004,.007,.02)+spectrumR(.27+shift)*.03,spectrumR(.6+shift)*.16+vec3(.02,.028,.045),horizon);float stars=starLayer(rd.xz/max(.25,abs(rd.y))*.22,92.,17.,10.);col+=stars*vec3(.6,.76,1.)*smoothstep(.02,.5,rd.y)*.55;
 vec3 sun=normalize(vec3(-.45,.24,-.86));float orb=length(rd-sun);float body=1.-smoothstep(.09,.094,orb);col+=spectrumR(.1+shift)*exp(-abs(orb-.115)*110.)*.5;col+=vec3(.7,.78,.9)*body*.22;if(SCENE==5||SCENE==7)col=mix(col,vec3(.003,.006,.018),1.-smoothstep(.068,.072,orb));
 if(uClimate.x<1.5)col+=spectrumR(rd.y*.5+shift)*pow(.5+.5*sin(rd.x*9.+sin(rd.z*8.+uTime*.047)*1.8+rd.y*12.),7.)*smoothstep(0.,.4,rd.y)*.24;return col;}
vec3 finishR(vec3 c,vec2 uv){c=max(c,vec3(0));float l=luma(c);c=mix(c,vec3(l),smoothstep(.55,.02,l)*.16);c*=mix(vec3(.86,.9,1.04),vec3(1.06,1.,.92),smoothstep(.02,.4,l));c=c*c*(3.-2.*c)*.35+c*.65;return finish(c*(.34+.74*uIntensity)*uFade,uv,.1);}
float segmentR(vec3 p,vec3 a,vec3 b,float r){vec3 q=p-a,v=b-a;return length(q-v*clamp(dot(q,v)/dot(v,v),0.,1.))-r;}
float frameR(vec3 p,vec3 b,float r){vec3 q=abs(p)-b;vec3 w=abs(q+r)-r;return min(min(length(max(vec3(q.x,w.y,w.z),0.))+min(max(q.x,max(w.y,w.z)),0.),length(max(vec3(w.x,q.y,w.z),0.))+min(max(w.x,max(q.y,w.z)),0.)),length(max(vec3(w.x,w.y,q.z),0.))+min(max(w.x,max(w.y,q.z)),0.));}
`;
  const fields = [
    `float terrainR(vec3 p){vec3 q=p;q.xz=mod(q.xz+8.,16.)-8.;float vault=abs(p.y-6.4-1.2*sin(p.x*.16+uTime*.06)*sin(p.z*.14))-.22;float arches=max(sdTorus(rotX(.35)*(p-vec3(0,2.6,0)),vec2(5.2,.3)),-abs(q.x)+4.6);float floor=p.y+2.4+.3*sin(p.x*.2)*sin(p.z*.2);float piers=max(length(q.xz)-.55,abs(p.y-2.)-4.6);float pearls=length(mod(p,vec3(9.,8.,9.))-vec3(4.5,3.8,4.5))-.5;return min(floor,min(vault,min(arches,min(piers,pearls))));}`,
    `float terrainR(vec3 p){vec3 q=p;q.xz=mod(q.xz+9.,18.)-9.;float a=atan(q.z,q.x),r=length(q.xz);float sector=floor((a+3.14159)*3./3.14159);float radius=2.4+sector*.42;float tread=max(abs(r-radius)-.52,abs(mod(p.y,2.6)-1.1)-.1);float rail=max(abs(r-radius-.5)-.05,abs(mod(p.y,2.6)-1.55)-.45);float column=abs(r-.35)-.16;return min(p.y+2.6,min(tread,min(rail,column)));}`,
    `float terrainR(vec3 p){vec3 q=p;q.xz=mod(q.xz+8.5,17.)-8.5;float a=atan(q.z,q.x),r=length(q.xz);float petals=length(vec2(r-(2.9+.72*cos(a*6.+uTime*.018)),(p.y-4.4)-.42*sin(a*6.)))-.5;float core=length(p-vec3(0,4.4,0))-.78;float stem=length(q.xz)-.17;return min(p.y+2.6,min(stem,min(petals,core)));}`,
    `float terrainR(vec3 p){vec3 q=p;q.z=mod(p.z+3.5,7.)-3.5;float column=sdBox(vec3(abs(q.x)-4.,q.y-1.7,q.z),vec3(.26,3.2,.26));float arch=max(sdTorus((q-vec3(0,3.7,0)).xzy,vec2(4.,.18)),-q.y+3.7);float ribs=sdBox(vec3(q.x,q.y-5.4,q.z),vec3(.15,.15,.15));return min(p.y+1.9,min(column,min(arch,ribs)));}`,
    `float terrainR(vec3 p){vec3 q=p;q.xz=mod(q.xz+6.,12.)-6.;q.y-=1.2;float outer=frameR(rotY(.25+uTime*.012)*q,vec3(2.7),.14);float inner=frameR(rotY(-.4-uTime*.016)*rotZ(.35)*q,vec3(1.7),.1);float inner2=frameR(rotZ(.6)*rotY(.5+uTime*.01)*q,vec3(.9),.07);return min(p.y+2.6,min(outer,min(inner,inner2)));}`,
    `float terrainR(vec3 p){vec2 q=mod(p.xz+9.,18.)-9.;float r=length(q);float mesa=2.4*exp(-pow((r-4.)*.4,2.))+1.15*exp(-pow((r-6.9)*.75,2.))+1.1*exp(-pow((length(q.yx*vec2(1.,.8))-1.2)*1.7,2.));float ground=.5*cloudR(p*.13)+mesa+.12*sin(p.x*3.1+sin(p.z*2.7));return (p.y-ground+1.1)*.6;}`,
    `float terrainR(vec3 p){vec3 q=p;q.xz=mod(q.xz+5.,10.)-5.;float trunk=segmentR(q,vec3(0,-2,0),vec3(.2,3.2,0),.19);float bolt=segmentR(q,vec3(.2,1,0),vec3(1.9,4.2,1.1),.14);float fork=segmentR(q,vec3(1.2,3,.7),vec3(.3,5.4,1.9),.11);float side=segmentR(q,vec3(0,2,0),vec3(-2.4,4.3,-.7),.12);float branch=segmentR(q,vec3(-2.4,4.3,-.7),vec3(-1.1,5.6,-1.6),.07);return min(p.y+1.6,min(min(trunk,bolt),min(min(fork,side),branch)));}`,
    `float terrainR(vec3 p){float dune=pow(.5+.5*sin(p.x*.18+1.6*sin(p.z*.12)+uTime*.024),2.4)*4.6;float crest=.55*sin(p.x*.62+sin(p.z*.33)*2.);float ripples=.12*sin(p.x*1.9+sin(p.z*.6));return (p.y-dune-crest-ripples+.9)*.52;}`,
  ];
  const landscape = `
float sceneR(vec3 p){float scale=.8+uWorld.x*.6;vec3 q=p/scale;q.y/=.8+uWorld.y*.5;q.x+=.1*sin(q.z*.22+uTime*.06)*uCoupling;q.z+=evolvingR(3.)*uMutation*.3;return terrainR(q)*scale*.72;}
void main(){vec2 uv=screenUV();vec3 ro=vec3(10,8,17),at=vec3(0,1,-10);if(SCENE==0){ro=vec3(1,2,12);at=vec3(0,2,-12);}if(SCENE==3){ro=vec3(0,1.6,12);at=vec3(0,2,-10);}if(SCENE==5||SCENE==7){ro=vec3(12,13,21);at=vec3(0,-1,-18);}if(SCENE==0){at=vec3(0,4,-6);}if(SCENE==1||SCENE==2){ro=vec3(0,1.2,12);at=vec3(0,4.2,-5);}ro.x+=sin(uTime*.024)*uDrift*.55;vec3 rd=lookAt(ro,at,vec3(0,1,0))*normalize(vec3(uv*(1.6-uDepth*.15)+uMouse*.012,1.35));float t=.02,glow=0.;bool hit=false;
 for(int j=0;j<(SCENE==5||SCENE==7?144:88);j++){float d=sceneR(ro+rd*t);glow+=exp(-abs(d)*14.)*.002;if(abs(d)<.006){hit=true;break;}t+=max(.004,abs(d)*.65);if(t>90.)break;}
 vec3 col=skyR(rd);float wt=rd.y<-.001?(-1.25-ro.y)/rd.y:1000.;if(uClimate.y<2.5&&wt>0.&&wt<t){vec3 p=ro+rd*wt;vec3 n=normalize(vec3(.028*sin(p.x+uTime*.2),1,.028*cos(p.z-uTime*.16)));col=skyR(reflect(rd,n))*.5+spectrumR(.3)*.02;float c=pow(.5+.5*sin(p.x*.8+sin(p.z*.6)+uTime*.23),16.);col+=spectrumR(p.z*.013)*c*.16;t=wt;}
 else if(hit){vec3 p=ro+rd*t;vec2 e=vec2(max(.006,t*.0002),0);vec3 n=normalize(vec3(sceneR(p+e.xyy)-sceneR(p-e.xyy),sceneR(p+e.yxy)-sceneR(p-e.yxy),sceneR(p+e.yyx)-sceneR(p-e.yyx))+vec3(.00001));float sunD=max(0.,dot(n,normalize(vec3(-.5,.9,.4))));float lighting=.2+.8*sunD;float strata=.5+.5*sin(p.y*1.6+sin(p.x*.55+p.z*.42)*.9+uTime*.04);vec3 base=mix(spectrumR(.18+float(SCENE)*.047),spectrumR(.5+float(SCENE)*.047),strata*.55);col=base*(.05+.4*pow(lighting,1.55))*(.85+.3*uIntensity);float seams=pow(.5+.5*sin(p.y*3.1+sin(p.x*.6)+p.z*.25-uTime*.12),34.);col+=spectrumR(.95+float(SCENE)*.047)*seams*(.12+.3*uAfterglow);col+=spectrumR(.9+float(SCENE)*.047)*pow(1.-abs(dot(rd,n)),4.)*.3;col+=vec3(1.,.95,.86)*pow(sunD,22.)*.26;col+=hueCol(fract(float(SCENE)*.618+.61))*(.03+.1*pow(sunD,3.))*(.5+.5*strata);if(SCENE==6){col=mix(col,vec3(.05,.11,.2)*(.35+.4*lighting),.34);col+=vec3(.45,.8,1.)*(.2+.24*sin(p.y*3.-uTime*.18));}if(SCENE==7)col=mix(col,vec3(.65,.3,.055)*lighting,.45);}
 col=mix(col,skyR(rd),1.-exp(-t*(.004+.007*uAtmosphere)));col=pow(max(col,vec3(0.)),vec3(1.1));col*=1.1;;col+=spectrumR(.1)*glow*.08;if(uClimate.z>.5&&uClimate.z<1.5){float rain=pow(.5+.5*sin(uv.x*183.),48.)*pow(.5+.5*sin(uv.y*37.+uTime*1.4),12.);col+=spectrumR(.85)*rain*.12;}fragColor=vec4(finishR(col,uv),1.);}`;
  const optics = [
    `void main(){vec2 uv=screenUV();vec3 col=vec3(.005,.009,.025);for(int i=0;i<15;i++){float k=float(i),z=1.+k*.12;vec2 p=rot2(.2*sin(k*.7))*uv*z;float sail=.28*sin(p.x*2.3+k*.4+uTime*.075)+.14*cos(p.x*4.-uTime*.04);float d=abs(p.y-sail-(k-7.)*.045),width=.025+.025*cos(p.x+k)*cos(p.x+k);float aa=max(.001,fwidth(d));vec3 c=spectrumR(k*.065+p.x*.13+float(SCENE)*.047);col=mix(col,c*(.16+.3*pow(max(0.,cos(p.x*2.-k)),4.)),(1.-smoothstep(width-aa,width+aa,d))*.6);col+=c*exp(-abs(d-width)*100.)*.11;}col+=vec3(.4,.25,.1)*exp(-length(uv-vec2(-.35,.25))*8.)*.45;fragColor=vec4(finishR(col,uv),1.);}`,
    `void main(){vec2 uv=screenUV();vec3 col=vec3(.002,.008,.017);for(int i=0;i<20;i++){float k=float(i),z=1.+k*.2;vec2 p=uv*z;float network=sin(p.x*1.5+sin(p.y*1.6+uTime*.045+k*.4))*.7+sin(p.y*1.7-k*.3+uTime*.04);float fiber=exp(-abs(network)*14.);float nodes=pow(max(0.,1.-abs(network)),18.)*pow(.5+.5*cos(p.x*2.6-p.y*2.+uTime*.08),18.);col+=spectrumR(k*.043+p.y*.05+float(SCENE)*.047)*(fiber*.045+nodes*.14)/(1.+k*.03);col+=vec3(.25,.4,.5)*exp(-dot(p-vec2(.3*sin(k),.2*cos(k)),p-vec2(.3*sin(k),.2*cos(k)))*40.)*.02;}fragColor=vec4(finishR(col,uv),1.);}`,
    `void main(){vec2 uv=screenUV();vec3 col=skyR(normalize(vec3(uv,1.)))*.3;vec2 p=vec2(uv.x,uv.y+.16);for(int i=0;i<18;i++){float k=float(i),z=1.+k*.18;float x=p.x*z+sin(uTime*.018)*uDrift;float river=.12*sin(x*2.2+k*.37+uTime*.035)+.045*sin(x*6.-uTime*.08);float y=-k*.024+river;float d=abs(p.y-y);float core=exp(-d*(95.+k*4.));col+=spectrumR(k*.06+x*.1+float(SCENE)*.047)*core*.16;col+=spectrumR(.2+k*.04)*exp(-d*17.)*.014;}fragColor=vec4(finishR(col,uv),1.);}`,
    `void main(){vec2 uv=screenUV();vec3 col=skyR(normalize(vec3(uv,1.)))*.5;for(int i=0;i<26;i++){float k=float(i),z=1.+k*.24;vec2 p=uv*z*vec2(3.2,2.1)+vec2(sin(uTime*.03+k)*.12,uTime*.16);vec2 cell=floor(p),q=fract(p)-.5;float h=hash12(cell+k*3.);float diamond=abs(q.x)*1.5+abs(q.y)*.7;float fade=pow(max(0.,1.-abs(q.y)*2.2),2.4);float shard=exp(-diamond*26.)*smoothstep(.55,.9,h)*fade*.16;col+=mix(spectrumR(k*.05+h*.1+float(SCENE)*.047),vec3(.7,.86,1.),.45)*shard*1.6/(1.+k*.02);float glint=exp(-dot(q*vec2(1.2,2.6),q*vec2(1.2,2.6))*120.)*fade*step(.9,h)*.7;col+=vec3(.8,.92,1.)*glint;}if(uv.y<-.12){float mirror=smoothstep(-.12,-.4,uv.y);col+=spectrumR(.2)*mirror*.02;col*=.55+.3*sin(uv.y*40.+uTime*.2+uv.x*9.);}fragColor=vec4(finishR(col,uv),1.);}`,
    `void main(){vec2 uv=screenUV();vec3 col=vec3(.003,.007,.022)+skyR(normalize(vec3(uv,1.)))*.22;for(int i=0;i<7;i++){float k=float(i),z=1.+k*.3;vec2 centre=vec2(sin(k*2.4+uTime*.02)*.62,cos(k*1.7+uTime*.015)*.22);vec2 p=rot2(sin(k)*.4)*(uv-centre)*z;float a=atan(p.y,p.x),r=length(p);float span=.055+.16*pow(abs(cos(a)),.7)*(.6+.4*pow(abs(sin(a)),.35))+.03*cos(a*4.+uTime*.05+k);float inside=1.-smoothstep(span-.012,span+.02,r);float vein=.5+.5*cos(a*7.+r*52.-uTime*.1+k);vec3 wing=mix(spectrumR(.2+k*.03),spectrumR(.5+k*.02),vein*.65)*(.2+.5*inside);col=mix(col,wing,inside*.62);col+=spectrumR(.1+k*.04)*exp(-abs(r-span)*130.)*.16;col+=vec3(.3,.4,.55)*exp(-r*30.)*.1;}fragColor=vec4(finishR(col,uv),1.);}`,
    `void main(){vec2 uv=screenUV();vec3 ro=vec3(0,0,uTime*.012),rd=normalize(vec3(uv,1.2));vec3 col=vec3(0.0);float tr=1.;for(int i=0;i<34;i++){float k=float(i),t=.25+k*.34;vec3 p=ro+rd*t;vec3 q=p;q.xz=rot2(.3*sin(p.y*.3+uTime*.02))*q.xz;q.xz=mod(q.xz+3.,6.)-3.;float f1=sin(q.x*3.1+sin(q.z*2.4+uTime*.03))*.6+sin(q.y*2.3-q.z*.8);float f2=sin(q.z*2.7+sin(q.y*2.1-uTime*.026))*.6+sin(q.x*2.9+q.y*.7);float lace=pow(exp(-abs(f1)*13.)*exp(-abs(f2)*13.),.75);float dust=cloudR(p*.8);col+=tr*mix(spectrumR(.8),vec3(.85,.9,1.),.35)*(lace*.34+dust*dust*.004*(1.-lace));tr*=exp(-lace*.35);}col+=skyR(normalize(vec3(uv,1.)))*tr*.12;fragColor=vec4(finishR(col,uv),1.);}`,
    `void main(){vec2 uv=screenUV();vec3 col=skyR(normalize(vec3(uv,1.)))*.3;for(int i=0;i<11;i++){float k=float(i),z=1.+k*.36;vec2 centre=vec2(sin(k*2.4)*.72,-.24-k*.014);vec2 p=(uv-centre)*z;float a=atan(p.y,p.x),r=length(p);float petal=.13+.055*cos(a*(5.+mod(k,4.))+uTime*.04+k);float body=1.-smoothstep(petal-.02,petal+.01,r);float fold=.5+.5*cos(a*(5.+mod(k,4.))+.6+k);vec3 metal=mix(vec3(.09,.12,.17),vec3(.5,.56,.64),pow(fold,2.4));metal=mix(metal,spectrumR(.3+k*.03),.5);col=mix(col,metal*(.25+.85*pow(fold,2.)),body*.72);col+=spectrumR(.15+k*.03)*exp(-abs(r-petal)*150.)*.3;col+=spectrumR(.15+k*.04)*exp(-r*20.)*.03;}fragColor=vec4(finishR(col,uv),1.);}`,
    `void main(){vec2 uv=screenUV();bool reflected=uv.y<-.18;vec2 p=uv;if(reflected)p.y=-.36-p.y+.008*sin(p.x*28.+uTime*.3);vec3 col=skyR(normalize(vec3(p,1.)))*.34;for(int i=0;i<32;i++){float k=float(i),z=1.+k*.18;vec2 centre=vec2(sin(k*2.39+uTime*.012)*.95,-.02+k*.009+.04*sin(uTime*.07+k));vec2 q=(p-centre)*z;float shell=abs(length(q*vec2(1.,.66))-(.05+.012*sin(k)));vec3 light=mix(vec3(1.,.5,.08),spectrumR(k*.044+float(SCENE)*.047),.34);col+=light*exp(-shell*150.)*.2;col+=light*exp(-length(q)*55.)*.42;col+=light*exp(-length(q)*9.)*.045;}if(reflected)col=col*.4+vec3(.02,.03,.05);fragColor=vec4(finishR(col,uv),1.);}`,
  ];
  function shader(i) {
    return (
      "const int SCENE=" +
      i +
      ";\n" +
      common +
      (i < 8 ? fields[i] + landscape : optics[i - 8])
    );
  }
  const blueprints = [
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
  ].map((biome, i) => ({ biome, style: specs[i][6], hue: specs[i][3] }));
  const api = { specs, defaults, fields, optics, shader, blueprints };
  if (typeof module !== "undefined") module.exports = api;
  else root.ResonantXII = api;
})(typeof window !== "undefined" ? window : globalThis);
