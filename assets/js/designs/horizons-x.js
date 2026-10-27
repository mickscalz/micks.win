/* X — IMMENSITIES. Twelve independent GPU environment kernels; the nursery
   executes the very same allowlisted bodies. No executable recipe imports. */
(function (root) {
  "use strict";
  const specs = [
    [
      "chromatic-rift-ocean",
      "The Chromatic Rift Ocean",
      "chromatic-rift",
      "aurora",
      "tide",
      "mist",
      "overlook",
      188,
      "Continental rifts · luminous estuaries · chromatic sky ocean",
      "ocean",
    ],
    [
      "heliograph-cloud-sea",
      "Heliograph Cloud Sea",
      "heliograph-clouds",
      "dawn",
      "dry",
      "clear",
      "glide",
      28,
      "Volumetric cloud continents · solar halos · aerial depth",
      "atmosphere",
    ],
    [
      "prismatic-monsoon-range",
      "Prismatic Monsoon Range",
      "prismatic-range",
      "storm",
      "river",
      "rain",
      "overlook",
      245,
      "Immense mineral ridges · violet rain · braided light rivers",
      "landscape",
    ],
    [
      "world-tree-estuary",
      "The World Tree Estuary",
      "world-tree",
      "dawn",
      "tide",
      "pollen",
      "shore",
      120,
      "Towering branching forests · flooded roots · golden pollen",
      "organic",
    ],
    [
      "opal-dune-migration",
      "Opal Dune Migration",
      "opal-dunes",
      "dawn",
      "dry",
      "pollen",
      "glide",
      32,
      "Migrating dune folds · opal gradients · ribbons of sand light",
      "desert",
    ],
    [
      "ringfall-archipelago",
      "Ringfall Archipelago",
      "ringfall",
      "aurora",
      "mirror",
      "mist",
      "shore",
      287,
      "Levitating ring mountains · archipelago shelves · auroral tides",
      "architecture",
    ],
    [
      "violet-glacier-fjord",
      "The Violet Glacier Fjord",
      "violet-fjord",
      "night",
      "river",
      "mist",
      "overlook",
      265,
      "Vast glacial walls · luminous fjord · flowing mineral strata",
      "geology",
    ],
    [
      "ember-caldera-world",
      "Ember Caldera World",
      "ember-caldera",
      "storm",
      "river",
      "clear",
      "overlook",
      14,
      "Nested volcanic basins · liquid ember · copper mountains",
      "geology",
    ],
    [
      "stellar-nursery-expanse",
      "The Stellar Nursery Expanse",
      "stellar-clouds",
      "night",
      "dry",
      "clear",
      "glide",
      296,
      "Deep emissive nebulae · stellar nurseries · drifting dust lanes",
      "cosmic",
    ],
    [
      "spectral-ribbon-vault",
      "Spectral Ribbon Vault",
      "spectral-ribbons",
      "night",
      "dry",
      "clear",
      "glide",
      198,
      "Immense silk vaults · interwoven light sheets · spectral depth",
      "abstract",
    ],
    [
      "ocean-of-caustic-light",
      "Ocean of Caustic Light",
      "caustic-depths",
      "dawn",
      "tide",
      "clear",
      "shore",
      172,
      "Submerged light columns · refraction networks · plankton drift",
      "ocean",
    ],
    [
      "rainbow-basin-lattice",
      "The Rainbow Basin Lattice",
      "rainbow-basins",
      "aurora",
      "mirror",
      "clear",
      "overlook",
      330,
      "Vast cellular basins · iridescent rims · luminous mineral lakes",
      "geometry",
    ],
  ];
  function defaults(i) {
    const s = specs[i];
    return {
      shape: [
        "terrain",
        "membrane",
        "terrain",
        "branch",
        "ribbon",
        "orbit",
        "terrain",
        "terrain",
        "vortex",
        "ribbon",
        "membrane",
        "lattice",
      ][i],
      hue: s[7],
      lobes: 5 + (i % 7),
      force: i % 8,
      growth: 0.7,
      mutation: 0.65,
      coupling: 0.65,
      lifecycle: 0.55,
      atmosphere: 0.55,
      symmetry: 0.5,
      drift: 0.45,
      afterglow: 0.7,
      topology: [
        "flow",
        "flow",
        "lattice",
        "colony",
        "flow",
        "orbit",
        "flow",
        "flow",
        "colony",
        "flow",
        "flow",
        "lattice",
      ][i],
      material: i % 3 === 0 ? "mineral" : i % 3 === 1 ? "silk" : "glass",
      rhythm: i % 2 ? "growth" : "tide",
      depth: 0.8,
      relief: 0.7,
      landform: s[2],
      sky: s[3],
      water: s[4],
      weather: s[5],
      camera: s[6],
      scale: 0.65,
    };
  }
  const declarations = `
uniform vec4 uWorld;
uniform vec4 uClimate;
uniform vec4 uEcology;
uniform float uLobes;
uniform float uForce;
uniform float uDepth;
float evolveX(float seed){float phase=uTime/((12.+hash11(seed)*7.)*(1.3-uLife*.55)),k=floor(phase),f=fract(phase);f=f*f*f*(f*(f*6.-15.)+10.);return mix(hash11(k+seed*13.7+uForce*.9),hash11(k+1.+seed*13.7+uForce*.9),f);}
float variation(float seed){return (evolveX(seed)-.5)*uMutation*uNovelty;}
vec3 luminous(float phase){phase+=uWorld.z/360.+variation(8.)*.18;vec3 c=.5+.5*cos(TAU*(vec3(.04,.33,.67)+phase));c=mix(c,vec3(.08,.43,.92)*(.5+.5*cos(phase*4.))+vec3(.95,.62,.18)*(.5+.5*sin(phase*4.)),uColorSafe);return mix(vec3(luma(c)),c,uColorRange);}
float segmentX(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.))-r;}
float noiseX(vec3 p){return vnoise3(p)*.58+vnoise3(p*2.03+3.7)*.28+vnoise3(p*4.11-2.1)*.14;}
vec3 skyX(vec3 rd){float h=exp(-max(0.,rd.y)*3.5);vec3 c=mix(vec3(.009,.025,.07)+luminous(.25)*.035,luminous(.65)*.15+vec3(.045,.055,.09),h);float cloud=noiseX(rd*3.+vec3(uTime*.008,0,0));c+=luminous(.8)*smoothstep(.42,.85,cloud)*.09*uAtmosphere;
 if(uClimate.x<.5)c+=vec3(.8,.23,.08)*pow(h,4.)*.3;
 else if(uClimate.x<1.5){float a=pow(.5+.5*sin(rd.x*10.+sin(rd.z*8.+uTime*.028)*2.5+rd.y*8.),5.);c+=luminous(rd.y*.6+uTime*.003)*a*smoothstep(-.04,.32,rd.y)*.6;}
 else if(uClimate.x<2.5)c*=.6+.5*cloud;
 else {c*=.34;float stars=pow(hash12(floor(rd.xz/max(.15,abs(rd.y))*210.)),95.);c+=vec3(stars)*smoothstep(.02,.4,rd.y)*.75;}
 vec3 sun=normalize(vec3(-.5,.22,-.8));c+=vec3(1.,.7,.38)*pow(max(0.,dot(rd,sun)),230.)*1.2;return c;}
vec3 finalX(vec3 c,vec2 uv){return finish(max(vec3(0),c)*(.35+uIntensity*.85)*uFade,uv,.1);}
vec3 cameraX(){float glide=sin(uTime*.012)*uDrift;return vec3(9.+glide*1.5,6.,14.);}
vec3 rayX(vec3 ro,vec3 at,vec2 uv){return lookAt(ro,at,vec3(0,1,0))*normalize(vec3(uv*(1.9-uDepth*.35)+uMouse*.018,1.3));}
vec3 weatherX(vec3 col,vec2 uv){if(uClimate.z>.5&&uClimate.z<1.5){vec2 r=uv*vec2(180.,30.);float rain=pow(.5+.5*sin(r.x+sin(floor(r.x)*2.)),32.)*pow(.5+.5*sin(r.y+uTime*1.5),9.);col+=vec3(.09,.14,.21)*rain;}if(uClimate.z>1.5&&uClimate.z<2.5){float dust=pow(.5+.5*sin(uv.x*100.+sin(uv.y*71.+uTime*.07)),35.)*pow(.5+.5*sin(uv.y*123.-uTime*.13),28.);col+=luminous(.1)*dust*.18;}return col;}
`;
  // Height/volume definitions are structurally independent, not indexed palette variants.
  const fields = [
    `float fieldX(vec3 p){float channel=abs(p.x+2.1*sin(p.z*.12));float ridge=2.7+2.3*noiseX(vec3(p.x*.1,0,p.z*.1))-5.1*exp(-channel*channel*.045);return (p.y-ridge)*.42;}`,
    null,
    `float fieldX(vec3 p){float mountain=pow(abs(sin(p.x*.17+sin(p.z*.11))),1.3)*5.+noiseX(p*.14)*2.;return (p.y-mountain+1.2)*.32;}`,
    `float fieldX(vec3 p){vec3 q=p;q.xz=mod(q.xz+7.,14.)-7.;float trunk=max(length(q.xz)-max(.13,.65-q.y*.07),abs(q.y-2.6)-4.);float d=min(p.y+1.5,trunk);for(int i=0;i<5;i++){float k=float(i),a=k*2.399;vec3 start=vec3(0,1.2+k*.7,0),tip=vec3(cos(a)*(2.7-k*.2),3.6+k*.6,sin(a)*(2.7-k*.2));d=min(d,segmentX(q,start,tip,.23-k*.025));vec3 crown=(q-tip)*vec3(1.,1.7,1.);d=min(d,length(crown)-(1.05+.1*sin(k)));}return d*.55;}`,
    `float fieldX(vec3 p){float a=p.x*.23+sin(p.z*.12+variation(2.))*.9;float dunes=1.6*sin(a)+.5*sin(a*2.3+p.z*.13)+.12*sin(p.z*1.2+p.x*.3);return (p.y-dunes+1.)*.6;}`,
    `float fieldX(vec3 p){vec3 q=p;q.xz=mod(q.xz+7.,14.)-7.;float ring=sdTorus(rotZ(.38)*rotX(.65)* (q-vec3(0,2.,0)),vec2(3.6,.22));float island=max(length(q.xz)-3.7,max(q.y-.1,-q.y-2.5+length(q.xz)*.4));return min(p.y+3.,min(ring,island));}`,
    `float fieldX(vec3 p){float channel=abs(p.x+2.*sin(p.z*.09));float glacier=5.2-7.*exp(-channel*channel*.027)+.35*sin(p.z*.5+p.x*.2);return (p.y-glacier)*.32;}`,
    `float fieldX(vec3 p){vec2 q=p.xz;float r=length(q),a=atan(q.y,q.x);float caldera=3.*exp(-pow((r-8.)*.32,2.))-1.7*exp(-r*r*.05)+.65*noiseX(p*.2)+.25*cos(a*6.);return (p.y-caldera)*.48;}`,
    null,
    null,
    null,
    `float fieldX(vec3 p){vec2 q=p.xz*.28;q.x+=mod(floor(q.y),2.)*.5;vec2 cell=fract(q)-.5;float r=length(cell);float rim=exp(-pow((r-.4)*20.,2.))*2.2;return (p.y-rim+1.)*.48;}`,
  ];
  const landscape = `
float sceneX(vec3 p){float size=.8+uWorld.x*.7;vec3 q=p/size;float vertical=.7+uWorld.y*.6+uGrowth*.15;q.y/=vertical;q.x+=sin(q.z*.11+uTime*.025)*(.15+uCoupling*.2)*(1.2-uSymmetry*.4);q.z+=variation(3.)*.4;return fieldX(q)*size*min(1.,vertical);}
void main(){vec2 uv=screenUV();vec3 ro=cameraX();ro.y=8.+uWorld.y*2.;if(uClimate.w<.5)ro=vec3(11.,7.5,17.);if(uClimate.w>1.5)ro=vec3(13.,11.,19.);ro.x+=sin(uTime*.009)*uDrift;for(int safe=0;safe<3;safe++)ro.y+=max(0.,.08-sceneX(ro))*4.;vec3 rd=rayX(ro,vec3(0,1.4,-9.),uv);float travel=.05,halo=0.;bool hit=false;
 for(int i=0;i<72;i++){float d=sceneX(ro+rd*travel);halo+=exp(-abs(d)*5.)*.004;if(abs(d)<.008){hit=true;break;}travel+=max(.006,abs(d)*.62);if(travel>100.)break;}
 vec3 col=skyX(rd);float water=-.8+.07*sin(uTime*.1),wt=rd.y<-.001?(water-ro.y)/rd.y:1000.;vec3 wp=ro+rd*wt;bool channel=uClimate.y<1.5||abs(wp.x+2.*sin(wp.z*.09))<2.8;
 if(uClimate.y<2.5&&channel&&wt>0.&&wt<travel){vec3 n=normalize(vec3(.03*cos(wp.x*.8+uTime*.13),1.,.035*sin(wp.z*.65-uTime*.12)));col=mix(luminous(.5)*.07,skyX(reflect(rd,n)),.6);float foam=pow(.5+.5*sin(wp.x*.7+sin(wp.z*.4)-uTime*.19),10.);col+=luminous(wp.z*.009+.1)*foam*(.15+.3*uAfterglow);if(WORLD==7)col+=vec3(1.,.12,.008)*(.7+.3*foam);travel=wt;}
 else if(hit){vec3 p=ro+rd*travel;float ep=max(.008,travel*.00025);vec2 e=vec2(ep,0);vec3 n=normalize(vec3(sceneX(p+e.xyy)-sceneX(p-e.xyy),sceneX(p+e.yxy)-sceneX(p-e.yxy),sceneX(p+e.yyx)-sceneX(p-e.yyx))+vec3(.00001));float light=.22+.78*max(0.,dot(n,normalize(vec3(-.6,1.,.35))));float strata=.5+.5*sin(p.y*(2.5+uLobes*.4)+sin(p.z*.13));vec3 stone=mix(luminous(.28+p.y*.017),luminous(.6+p.z*.008),strata*.65);stone=mix(stone,skyX(reflect(rd,n)),uEcology.y>.5&&uEcology.y<1.5?.25:.04);col=stone*(.17+.4*light);float vein=pow(.5+.5*sin(p.y*3.+p.z*.2+sin(p.x*.3)+uTime*.08),22.);col+=luminous(.1+p.z*.012)*vein*(.12+.6*uAfterglow);col+=luminous(.75)*pow(1.-abs(dot(n,rd)),3.)*.28;
 if(WORLD==3)col=mix(col,luminous(.28)*.28,smoothstep(.3,.9,n.y));if(WORLD==7)col+=vec3(1.,.08,.002)*vein*.4;}
 float fog=1.-exp(-travel*(.007+uAtmosphere*.016)*(uClimate.z<.5?1.35:1.));col=mix(col,skyX(rd),fog);col+=luminous(.05)*halo*.1;col=weatherX(col,uv);fragColor=vec4(finalX(col,uv),1.);}`;
  const clouds = `void main(){vec2 uv=screenUV();vec3 ro=vec3(uTime*.018*uDrift,3.,8.),rd=rayX(ro,vec3(0,3.8,-4.),uv);vec3 col=vec3(0);float trans=1.;for(int i=0;i<36;i++){float t=float(i)*.75+.4;vec3 p=ro+rd*t;float ridge=noiseX(p*(.28/(.7+uWorld.x*.6))+vec3(0,uTime*.006,0));float d=smoothstep(.51+variation(4.)*.1,.78,ridge)*exp(-pow((p.y-2.)*.35,2.));float absorb=1.-exp(-d*(.1+uGrowth*.14));float shade=clamp(.3+(ridge-vnoise3((p+vec3(-1,1,-1))*.25))*1.5,.05,1.);vec3 light=mix(vec3(.025,.045,.11),vec3(.85,.5,.3)+luminous(p.y*.03+.65)*.3,shade);col+=trans*absorb*light*1.4;trans*=1.-absorb;}col+=skyX(rd)*trans;float ring=abs(length(uv-vec2(-.3,.12))-.24);col+=luminous(.15)*exp(-ring*100.)*.28;fragColor=vec4(finalX(weatherX(col,uv),uv),1.);}`;
  const nebula = `void main(){vec2 uv=screenUV();vec3 ro=vec3(sin(uTime*.013)*.5*uDrift,0,uTime*.009),rd=normalize(vec3(uv*(1.6-uDepth*.3),1.));vec3 col=vec3(.001,.002,.012);float trans=1.;for(int i=0;i<44;i++){float t=float(i)*.34+.2;vec3 p=ro+rd*t;vec3 q=rotZ(.5+uTime*.006)*p/(.7+uWorld.x*.6);float curl=sin(q.x*.8+sin(q.z*.3))*1.2;float density=exp(-pow(q.y-curl,2.)*1.8)*smoothstep(.32,.85,noiseX(q*.7+variation(2.)));float dust=exp(-pow(q.y-curl+.23,2.)*7.)*.12;vec3 emission=luminous(q.z*.07+q.x*.1)*density*(.12+.18*uAfterglow);col+=trans*emission;trans*=exp(-density*.06-dust*.12);}float stars=starLayer(uv+vec2(uTime*.0007,0),80.,18.,3.);col+=vec3(.8,.86,1.)*stars*.85;col+=luminous(.13)*pow(max(0.,1.-length(uv-vec2(-.27,.12))*15.),10.)*1.5;col=mix(col,col+skyX(normalize(vec3(uv,1.)))*.12,uAtmosphere);fragColor=vec4(finalX(weatherX(col,uv),uv),1.);}`;
  const ribbons = `void main(){vec2 uv=screenUV();vec3 col=vec3(.004,.008,.025);for(int i=0;i<16;i++){float k=float(i),depth=1.+k*.19;vec2 p=uv*depth*(1.3-uWorld.x*.5);float y=.3*sin(p.x*2.1+k*.65+uTime*.08)+.12*sin(p.x*4.-k*.2-uTime*.051);float d=abs(p.y-y-(k-7.5)*.065);float width=.008+.02*uGrowth+.024*(.5+.5*sin(k+uTime*.031));float aa=max(fwidth(d),.001);float ribbon=1.-smoothstep(width-aa,width+aa,d);float edge=exp(-abs(d-width)*100.);vec3 c=luminous(k*.071+p.x*.11+uTime*.002);col=mix(col,c*(.2+.3*cos(p.x*2.+k)*cos(p.x*2.+k)),ribbon*.8/depth);col+=c*edge*.12/depth;}col+=skyX(normalize(vec3(uv,1.)))*.16*uAtmosphere;fragColor=vec4(finalX(weatherX(col,uv),uv),1.);}`;
  const caustics = `void main(){vec2 uv=screenUV();vec3 ro=vec3(0,2,0),rd=normalize(vec3(uv*(1.4-uDepth*.4),1.));vec3 col=mix(vec3(.003,.025,.075),luminous(.4)*.21,clamp(uv.y+.5,0.,1.));for(int i=0;i<28;i++){float z=float(i)*.65+1.;vec3 p=ro+rd*z;p.x+=sin(uTime*.025)*uDrift;float lattice=sin(p.x*2.+sin(p.z*.6+uTime*.09))*cos(p.z*1.7-uTime*.07)+sin(p.y*1.6+p.z*.5)*.5;float beam=pow(.5+.5*cos(p.x*.7+sin(p.z*.5)),24.);float caustic=exp(-abs(lattice)*18.);col+=luminous(p.z*.025+.3)*(caustic*.022+beam*.018)*exp(-z*.045);vec3 cell=floor(p*2.),point=fract(p*2.)-.5;float plankton=exp(-dot(point,point)*85.)*step(.91,hash13(cell));col+=luminous(.7)*plankton*.07;}float sunbeam=pow(max(0.,1.-abs(uv.x+.2+uv.y*.35)),18.);col+=vec3(.12,.3,.3)*sunbeam;fragColor=vec4(finalX(weatherX(col,uv),uv),1.);}`;
  function shader(i) {
    return (
      declarations +
      "\nconst int WORLD=" +
      i +
      ";\n" +
      (fields[i]
        ? fields[i] + landscape
        : i === 1
          ? clouds
          : i === 8
            ? nebula
            : i === 9
              ? ribbons
              : caustics)
    );
  }
  const api = { specs, defaults, fields, shader };
  if (typeof module !== "undefined") module.exports = api;
  else root.HorizonX = api;
})(typeof window !== "undefined" ? window : globalThis);
