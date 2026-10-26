/* VIII — THE UNWRITTEN BIOSPHERE. Independently constructed fields, not
   intelligence claims. Bounded marching, smooth mutations, no external assets. */
(function (w) {
  "use strict";
  function register(n, id, name, family, tag, kind, extra) {
    var d = {
      id: id,
      name: name,
      edition: 8,
      captivation: Math.round((100 - n * 0.24) * 100) / 100,
      kind: kind,
      family: family,
      tag: tag,
      blurb:
        tag +
        ". Stay: its inherited rhythms and slowly changing field parameters develop new relationships. Procedural life, not a recording.",
      vigor: 0.3 + (n % 8) * 0.085,
      theme: "dark",
      preview: "assets/previews/" + id + ".webp",
      art: "linear-gradient(145deg,#020916,#167b8e,#c8768f,#e7cb80)",
      paletteGroup: [
        "pearl/plasma",
        "copper/teal",
        "orchid/lime",
        "gold/indigo",
        "ice/ember",
      ][n % 5],
      motionClass: tag.split(" · ")[0],
    };
    Object.assign(d, extra);
    w.D(d);
    return d;
  }
  w.CabinetVIII = { register: register };
  var common = `
 float dna(float seed){float t=uTime/(18.-uLife*10.),i=floor(t),f=fract(t);f=f*f*(3.-2.*f);return mix(.5,mix(hash11(i+seed+floor(uRand)),hash11(i+1.+seed+floor(uRand)),f),uMutation*uNovelty);}
 float breath(){return .5+.18*sin(uTime*.43+sin(uTime*.071))+.1*sin(uTime*.73)+uPulse*.12;}
 vec3 bio(float t){t+=WORLD;vec3 c=.5+.5*cos(TAU*(vec3(.03,.31,.64)+t));c=pow(max(c,vec3(0)),vec3(.8));vec3 safe=mix(vec3(.04,.31,.65),vec3(1.,.72,.2),.5+.5*sin(t*TAU));c=mix(c,safe,uColorSafe);return mix(vec3(dot(c,vec3(.2126,.7152,.0722))),c,uColorRange);}
 vec3 atmosphere(vec3 rd){float cloud=fbm2(rd.xy*2.+uTime*.008);return vec3(.002,.005,.012)+bio(rd.y*.18+uTime*.007)*cloud*.065*uAtmosphere;}
 `;
  function shader(n, id, name, family, tag, body, budget) {
    return register(n, id, name, family, tag, "gl", {
      frag: common.replace("WORLD", ((n * 0.137508) % 1).toFixed(5)) + body,
      pixelBudget: budget || 620000,
      lifeMechanism:
        "Continuous seeded field mutation; light and form are coupled to slow envelopes.",
    });
  }
  var orbit =
    "vec3 ro=vec3(sin(uTime*(.013+uDrift*.025)+.5)*4.,.5+.3*sin(uTime*.019),cos(uTime*(.013+uDrift*.025)+.5)*4.);vec3 rd=lookAt(ro,vec3(0),vec3(0,1,0))*normalize(vec3(uv+uMouse*.035,1.4));";
  function solid(n, id, name, family, tag, field, camera, material, budget) {
    return shader(
      n,
      id,
      name,
      family,
      tag,
      field +
        `
 vec3 normalAt(vec3 p){vec2 e=vec2(.002,0);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx))+vec3(.000001));}
 void main(){vec2 uv=screenUV();${camera || orbit}float travel=.01,glow=0.;bool hit=false;for(int j=0;j<88;j++){float h=map(ro+rd*travel);glow+=exp(-abs(h)*65.)*.002;if(abs(h)<.002){hit=true;break;}travel+=max(.001,abs(h)*.55);if(travel>24.)break;}
 vec3 col=atmosphere(rd);if(hit){vec3 p=ro+rd*travel,n=normalAt(p);float key=max(dot(n,normalize(vec3(-.6,1.,-.7))),0.),rim=pow(max(0.,1.-abs(dot(n,rd))),3.);vec3 pigment=${material || "bio(p.y*.16+p.x*.09+uTime*.009)"};float micro=.5+.5*sin(p.y*32.+p.x*17.+uTime*.31);col=pigment*(.19+.68*key+.17*micro)+bio(p.z*.12+uTime*.012+.3)*rim*(.35+uIntensity*.65)*(n.y>.97?.1:1.)*${n === 1 ? "smoothstep(-1.42,-1.2,p.y)" : "1."};col+=vec3(1.,.91,.77)*pow(max(dot(reflect(rd,n),normalize(vec3(-.6,1.,-.7))),0.),36.)*.3;col=mix(col,atmosphere(rd)*2.,max(1.-exp(-travel*.035*uAtmosphere),smoothstep(17.,24.,travel)));}col+=bio(uTime*.012+.3)*glow*(.35+uIntensity*.8+uAfterglow*.2);fragColor=vec4(finish(col*uFade,uv,.13),1.);}`,
      budget,
    );
  }
  solid(
    1,
    "unwritten-biosphere",
    "The Unwritten Biosphere",
    "organic",
    "living crown · reproductive satellites · folded habitat · light estuary",
    `
 float map(vec3 p){vec3 q=p;float tide=.035*sin(p.x*2.+p.z*1.7-uTime*.23);float floorD=p.y+1.55+tide;
 q=rotY(uTime*.025)*q;float a=atan(q.z,q.x),r=length(q.xz),crown=length(vec2(r-(.85+.13*sin(a*8.+uTime*.12+q.y*2.)),q.y-.42-.2*cos(a*4.+uTime*.16)))-(.18+.08*dna(4.));
 float petals=length(vec2(r-(1.05+.14*sin(a*8.-uTime*.14)),q.y-.52-.32*sin(a*8.+dna(8.)*4.)))-.038;petals=max(petals,abs(q.y-.55)-.65);
 float roots=length(vec2(r-(.18+.63*smoothstep(-1.4,.45,q.y)),sin(a*8.+q.y*1.8+uTime*.16)*r))-.035;roots=max(roots,abs(q.y+.45)-1.05)*.5;
 vec3 s=q;s.xz=rot2(uTime*.04)*s.xz;float angle=mod(atan(s.z,s.x)+PI/4.,TAU/4.)-PI/4.;vec3 pod=vec3(cos(angle)*r-1.65,s.y-.2-.24*sin(a*3.+uTime*.19),sin(angle)*r);float satellite=length(pod*vec3(1.,1.3,1.))-(.11+.09*uGrowth*breath());
 return min(floorD,min(crown,min(petals,min(roots,satellite))));}
 `,
    "vec3 ro=vec3(sin(.6+uTime*.013*uDrift)*5.,.7+.15*sin(uTime*.023),cos(.6+uTime*.013*uDrift)*5.);vec3 rd=lookAt(ro,vec3(0,-.05,0),vec3(0,1,0))*normalize(vec3(uv+uMouse*.04,1.4));",
    "p.y< -1.4 ? (vec3(.003,.012,.025)+bio(p.z*.09+uTime*.012)*exp(-abs(p.x-.7*sin(p.z*.7-uTime*.15))*6.)*1.3):bio(p.y*.26+atan(p.z,p.x)*.1+uTime*.009)*(.65+.28*breath())",
    580000,
  );
  solid(
    3,
    "orchid-engine",
    "Orchid Engine",
    "organic",
    "fertile petal volumes · asymmetrical flowering · spiral nectar",
    `float map(vec3 p){p=rotY(uTime*.04)*p;float a=atan(p.z,p.x),r=length(p.xz),lobes=6.;float edge=.75+.21*cos(a*lobes+uTime*.16);float bowl=length(vec2(r-edge,p.y-.26*sin(a*3.+uTime*.12)))-.16;float core=length(p*vec3(1,1.6,1))-(.28+.08*breath());return min(bowl,core);}`,
  );
  solid(
    5,
    "pearl-symbiont",
    "Pearl Symbiont",
    "microscopic",
    "mutually orbiting membranes · porous organelles · coupling",
    `float map(vec3 p){float d=10.;for(int i=0;i<7;i++){float f=float(i),a=f*2.39996+uTime*.08;vec3 c=vec3(cos(a),sin(a*1.13),cos(a*.7))*(.4+.22*uCoupling);vec3 q=p-c;float shell=abs(length(q)-(.28+.04*sin(uTime*.3+f)))-.025;d=smin(d,shell,.09+.1*uGrowth);}return d;}`,
  );
  solid(
    7,
    "infinite-pollen-palace",
    "Infinite Pollen Palace",
    "architectural",
    "growing cellular vaults · navigable pores · golden suspension",
    `float map(vec3 p){p.xy+=.18*vec2(sin(p.z*.7+uTime*.12),cos(p.z*.6));vec3 q=p*(1.8+dna(2.)*.5);float shell=abs(dot(sin(q),cos(q.yzx)))-.2;return max(shell/5.,.55-length(p.xy));}`,
    "vec3 ro=vec3(.2,.1,uTime*(.08+.06*uDrift));vec3 rd=normalize(vec3(uv,1.3));",
    "bio(p.z*.055+p.y*.08+uTime*.012)",
  );
  shader(
    9,
    "planktonic-aurora",
    "Planktonic Aurora",
    "celestial",
    "luminous colonial volume · curved stellar convection · soft filaments",
    `void main(){vec2 uv=screenUV();vec3 col=vec3(.002,.004,.014),ro=vec3(0,0,-3.),rd=normalize(vec3(uv,1.3));float tr=1.;for(int j=0;j<56;j++){vec3 p=ro+rd*float(j)*.11;p=rotX(.5)*rotY(uTime*.02)*p;float r=length(p.xz),a=atan(p.z,p.x),spiral=pow(.5+.5*cos(a*5.-r*(6.+dna(2.)*2.)+uTime*.09),14.);float density=exp(-abs(p.y-.12*sin(r*4.-uTime*.2))*12.)*exp(-r*r*.55);col+=bio(r*.15+uTime*.01)*density*(.04+spiral*.3)*tr;tr*=1.-density*.035;}fragColor=vec4(finish(col*uFade,uv,.1),1.);}`,
  );
  solid(
    11,
    "ceramic-metamorph",
    "Ceramic Metamorph",
    "crystalline",
    "hollow ceramic tissue · mineral growth · changing cutaway",
    `float map(vec3 p){p=rotY(uTime*.035)*rotX(.2)*p;vec3 q=p;float body=length(q)-1.;float holes=10.;for(int i=0;i<8;i++){float f=float(i),a=f*2.4+uTime*.04;holes=min(holes,length(p-vec3(cos(a),sin(a*1.3),sin(a))*.86)-(.27+.08*dna(f)));}return max(abs(body)-.045,-holes);}`,
    null,
    "mix(vec3(.8,.85,.76),bio(p.y*.15+uTime*.008),.48)",
  );
  solid(
    13,
    "suspended-rhizosphere",
    "Suspended Rhizosphere",
    "organic",
    "root bridges · recursive tissue · hanging island gravity",
    `float map(vec3 p){vec3 q=p;float sc=1.,d=10.;for(int j=0;j<4;j++){q.xz=abs(q.xz)-vec2(.55,.28);q=rotY(.65+uSymmetry*.2)*rotZ(.45+dna(3.)*.12)*q;d=min(d,(length(q.xz)-.055)/sc);q*=1.7;sc*=1.7;}return max(d,abs(p.y)-1.25);}`,
  );
  solid(
    15,
    "estuary-of-two-suns",
    "Estuary of Two Suns",
    "landscape",
    "grazing liquid dunes · twin luminous horizons · mineral shore",
    `float map(vec3 p){float land=p.y+.6+.19*sin(p.x*.8+sin(p.z*.5-uTime*.06))+.045*fbm2(p.xz*2.+uTime*.01);float suns=min(length(p-vec3(-3.,2.,8.))-.9,length(p-vec3(2.,1.5,7.))-.55);return min(land,suns);}`,
    "vec3 ro=vec3(sin(uTime*.015)*.5,.7,uTime*.035);vec3 rd=normalize(vec3(uv.x,uv.y-.12,1.35));",
    "p.y>1.?bio(p.x*.15+uTime*.01)*1.8:mix(vec3(.02,.09,.12),bio(p.z*.1+uTime*.008),.5+.4*sin(p.x*2.+p.z*.8-uTime*.2))",
  );
  solid(
    17,
    "neural-nautilus",
    "Neural Nautilus",
    "surreal",
    "logarithmic chamber organism · rotating nursery · nested shells",
    `float map(vec3 p){p=rotX(.4)*rotY(uTime*.035)*p;float d=10.;for(int i=0;i<22;i++){float f=float(i),a=f*.41+uTime*.03,r=.13*exp(f*.087);vec3 c=vec3(cos(a)*r,sin(a)*r,.12*sin(a*2.));d=smin(d,abs(length(p-c)-(.09+f*.008))-.018,.025);}return d;}`,
  );
  shader(
    19,
    "chromatophore-weather",
    "Chromatophore Weather",
    "painterly",
    "pigment organisms · fluid camouflage · iridescent field exchange",
    `void main(){vec2 uv=screenUV(),q=uv;for(int j=0;j<5;j++){float f=float(j);q+=.09*vec2(sin(q.y*3.+uTime*.07+f),cos(q.x*4.-uTime*.09+f));}float n=fbm2(q*(3.+dna(3.))),vein=abs(sin(n*23.+uTime*.12));vec3 col=bio(n*.7+uTime*.009)*(.35+.8*n)+bio(n*.7+.4)*exp(-vein*38.)*.5;fragColor=vec4(finish(col*uFade,uv,.15),1.);}`,
  );
  solid(
    21,
    "atlas-of-soft-machines",
    "Atlas of Soft Machines",
    "architectural",
    "pliant moving arches · slow metric distortion · living corridors",
    `float map(vec3 p){p.x+=.2*sin(p.z*.9+uTime*.16);vec3 q=p;q.z=mod(q.z+1.3,2.6)-1.3;float arch=length(vec2(length(q.xy-vec2(0,-.7))-1.4,q.z))-.13;float floorD=p.y+1.3;return min(arch,floorD);}`,
    "vec3 ro=vec3(.3*sin(uTime*.04),.1,uTime*.19);vec3 rd=normalize(vec3(uv,1.35));",
  );
  solid(
    23,
    "cryogenic-chrysalis",
    "Cryogenic Chrysalis",
    "crystalline",
    "faceted cocoon · folded inner tissue · frost veins",
    `float map(vec3 p){p=rotY(uTime*.04)*p;vec3 q=p;float poly=(abs(q.x)+abs(q.y)*.7+abs(q.z)-1.1)/1.7;float cuts=abs(sin(p.y*7.+uTime*.18))* .045;return max(abs(poly)-.035-cuts,-(length(p)-.6));}`,
    null,
    "mix(vec3(.5,.8,.86),bio(p.y*.14+uTime*.01),.4)",
  );
  shader(
    25,
    "rivers-without-banks",
    "Rivers Without Banks",
    "fluid",
    "braided luminous waterways · continuous splitting · depth haze",
    `void main(){vec2 uv=screenUV();vec3 col=vec3(.002,.008,.015);for(int j=0;j<11;j++){float f=float(j),c=(f-5.)*.075+.17*sin(uv.x*3.+f*.7+uTime*.1)+.035*sin(uv.x*12.-uTime*.16+f),d=abs(uv.y-c);col+=bio(f*.09+uTime*.01)*exp(-d*(90.+30.*sin(f)))*(.6+uIntensity*.6);col+=bio(f*.09+.2)*exp(-d*15.)*.027;}fragColor=vec4(finish(col*uFade,uv,.1),1.);}`,
  );
  solid(
    27,
    "murmuration-vault",
    "Murmuration Vault",
    "geometric",
    "articulated feather lattice · orbiting joint architecture · phase coordination",
    `float map(vec3 p){p=rotY(uTime*.04)*p;float d=10.;for(int j=0;j<14;j++){float f=float(j),a=f*2.4;vec3 c=vec3(cos(a),sin(a*1.31),sin(a))*.8;vec3 q=rotY(a+uTime*.07)*rotZ(.3*sin(f+uTime*.15))*(p-c);d=min(d,sdBox(q,vec3(.32,.018,.09)));}return d;}`,
  );
  solid(
    29,
    "mirrorgrove",
    "Mirrorgrove",
    "landscape",
    "infinite reflective stems · drifting canopy seeds · bent horizon",
    `float map(vec3 p){vec2 id=floor((p.xz+1.)/2.);vec3 q=p;q.xz=mod(q.xz+1.,2.)-1.;q.x+=.15*sin(p.y*1.8+hash12(id)*6.+uTime*.15);float stem=length(q.xz)-.055;float bulb=length(vec3(q.x,p.y-1.8-.2*sin(uTime*.16+hash12(id)*6.),q.z))-(.24+.1*hash12(id));return min(p.y+.5,min(max(stem,abs(p.y-.6)-1.2),bulb));}`,
    "vec3 ro=vec3(.7,.9,uTime*.12);vec3 rd=normalize(vec3(uv.x,uv.y-.05,1.4));",
  );
  solid(
    31,
    "geode-heartbeat",
    "Geode Heartbeat",
    "crystalline",
    "breathing mineral cavity · inner crystal buds · lumen veins",
    `float map(vec3 p){p=rotY(uTime*.03)*p;float outer=abs(length(p)-1.)-.065;vec3 q=p;for(int j=0;j<3;j++){q=abs(q)-.42;q=rotY(.72)*rotZ(.51)*q;}float buds=(abs(q.x)+abs(q.y)+abs(q.z)-.19)/2.;return max(min(outer,buds),-(length(p-vec3(0,.2,.9))-.73));}`,
  );
  shader(
    33,
    "unfurling-photosphere",
    "Unfurling Photosphere",
    "celestial",
    "radiant membranous star · filament convection · corona breathing",
    `void main(){vec2 uv=screenUV();float r=length(uv),a=atan(uv.y,uv.x),edge=.42+.025*sin(a*13.+uTime*.14)+.018*sin(a*23.-uTime*.19);float core=exp(-max(0.,r-edge)*30.),fil=pow(.5+.5*sin(a*39.+fbm2(uv*8.+uTime*.03)*7.),8.);vec3 col=bio(r*.8+uTime*.008)*core*(.25+.6*fil)+bio(.3+uTime*.009)*exp(-abs(r-edge)*110.)*.65;col*=smoothstep(.04,.36,r);fragColor=vec4(finish(col*uFade,uv,.12),1.);}`,
  );
  solid(
    35,
    "amoebic-observatory",
    "Amoebic Observatory",
    "microscopic",
    "soft cellular dome · orbiting nuclei · permeable skin",
    `float map(vec3 p){float r=1.+.09*sin(p.x*3.+uTime*.16)*cos(p.y*4.-uTime*.2);float skin=abs(length(p)-r)-.02;float nuclei=10.;for(int j=0;j<5;j++){float f=float(j),a=f*2.4+uTime*.12;vec3 c=vec3(cos(a),sin(a*1.21),sin(a*.7))*.52;nuclei=min(nuclei,length(p-c)-.13);}return min(max(skin,-(length(p-vec3(.1,.3,.85))-.75)),nuclei);}`,
  );
  solid(
    37,
    "silica-wing-sanctuary",
    "Silica Wing Sanctuary",
    "surreal",
    "bilateral wing organism · iridescent ribs · articulated sail",
    `float map(vec3 p){p=rotY(.25*sin(uTime*.07))*p;float x=abs(p.x),wing=abs(p.z-.15*sin(x*3.-uTime*.3))-.022;float shape=pow((x-.65)/.65,2.)+pow(p.y/(.5+.2*sin(x*3.)),2.)-1.;float vein=abs(sin((p.y+x*.4)*26.))-.2;return min(max(max(wing,shape*.2),-vein*.025),length(vec2(p.x,p.z))-.06);}`,
  );
  shader(
    39,
    "gravity-pigment",
    "Gravity Pigment",
    "painterly",
    "levitating ink pools · nested density contours · organic confluence",
    `void main(){vec2 uv=screenUV();float f=0.;for(int j=0;j<7;j++){float i=float(j),a=i*2.4+uTime*.055;vec2 c=vec2(cos(a),sin(a*1.17))*.35;f+=.035/(dot(uv-c,uv-c)+.018);}float lines=pow(.5+.5*cos(f*(6.+uSymmetry*5.)+uTime*.15),15.);vec3 col=mix(vec3(.025,.03,.05),bio(f*.05+uTime*.007),smoothstep(.4,2.2,f));col+=bio(f*.07+.35)*lines*.25;fragColor=vec4(finish(col*uFade,uv,.13),1.);}`,
  );
  solid(
    41,
    "tessellated-incubator",
    "Tessellated Incubator",
    "geometric",
    "rotating nursery cells · folded panel opening · inner seeds",
    `float map(vec3 p){p=rotY(uTime*.05)*rotX(.25)*p;vec3 q=p;float d=10.;for(int j=0;j<3;j++){float f=float(j);vec3 s=q;s.xy=rot2(f*TAU/3.)*s.xy;float plate=sdBox(s-vec3(.65,0,0),vec3(.025,.65,.65));d=min(d,plate);}return min(max(d,length(p)-1.1),length(p)-(.24+.1*breath()));}`,
  );
  solid(
    43,
    "rain-of-living-stones",
    "Rain of Living Stones",
    "landscape",
    "slow levitating strata · weathered mineral life · gravity reversals",
    `float map(vec3 p){vec3 id=floor((p+1.)/2.),q=mod(p+1.,2.)-1.;q.y+=.25*sin(uTime*.18+hash13(id)*6.);float rock=length(q*vec3(1.1,1.4,1.1))-.4;return rock*.65;}`,
    "vec3 ro=vec3(.7,.9,uTime*.13);vec3 rd=normalize(vec3(uv,1.4));",
  );
  shader(
    45,
    "spectrum-fungal-dream",
    "Spectrum Fungal Dream",
    "organic",
    "branching light paths · spore halos · subterranean interference",
    `void main(){vec2 uv=screenUV();vec3 col=vec3(.002,.006,.014);for(int j=0;j<14;j++){float f=float(j),y=(f-6.5)*.065+.11*sin(uv.x*4.+f*.7+uTime*.1)+.06*sin(uv.x*9.-uTime*.12+f*1.3);float d=abs(uv.y-y);float knots=pow(.5+.5*cos(uv.x*31.+f*2.-uTime*.2),15.);col+=bio(f*.09+uTime*.008)*(exp(-d*170.)*.5+exp(-length(vec2(uv.y-y,sin(uv.x*18.+f)*.03))*70.)*knots*.3);}fragColor=vec4(finish(col*uFade,uv,.1),1.);}`,
  );
  solid(
    47,
    "manta-of-the-void",
    "Manta of the Void",
    "organic",
    "sinuous ray anatomy · gill pulses · suspended photophores",
    `float map(vec3 p){p.z+=.18*sin(p.x*2.-uTime*.4);float body=length(p*vec3(.8,2.8,1.4))-.8;float wings=max(abs(p.y-.12*sin(abs(p.x)*3.-uTime*.5))-.025,max(abs(p.z)-(.8-abs(p.x)*.35),abs(p.x)-1.5));return min(body,wings);}`,
  );
  solid(
    49,
    "folded-bioluminal-sea",
    "Folded Bioluminal Sea",
    "fluid",
    "rising liquid chambers · impossible wave volumes · soft gold edges",
    `float map(vec3 p){p.y+=.23*sin(p.x*2.+uTime*.17)*cos(p.z*1.6-uTime*.13);float sheet=abs(p.y)-.045;float wall=abs(sin(p.x*1.7+p.z*.6))-.25;return min(sheet,max(wall*.2,abs(p.y)-1.));}`,
    "vec3 ro=vec3(2.8,2.3,2.8+uTime*.04);vec3 rd=lookAt(ro,vec3(0),vec3(0,1,0))*normalize(vec3(uv,1.35));",
  );
  solid(
    51,
    "antlered-light",
    "Antlered Light",
    "organic",
    "branch antlers · slow axis migration · luminal sap",
    `float map(vec3 p){p=rotY(uTime*.04)*p;float d=10.;for(int j=0;j<6;j++){float f=float(j),sc=1.+f*.22;vec3 q=p;q.x=abs(q.x)-f*.12;q.xz=rot2(.15*f+uTime*.015)*q.xz;q.x+=.18*sin(q.y*2.+f);d=min(d,max(length(q.xz)-.027,abs(q.y-(f*.12-.4))-(.9-f*.09)));}return d;}`,
  );
  shader(
    53,
    "opalescent-synapse",
    "Opalescent Synapse",
    "microscopic",
    "diffusing neural ribbons · transient nodes · membrane communication",
    `void main(){vec2 uv=screenUV();vec3 col=vec3(.003,.007,.02);for(int j=0;j<10;j++){float f=float(j),a=f*2.4+uTime*.025;vec2 c=vec2(cos(a),sin(a*1.17))*.32;float r=length(uv-c),wave=sin(r*39.-uTime*.4+f);col+=bio(f*.1+uTime*.007)*exp(-abs(wave)*26.)*exp(-r*6.)*.18;col+=bio(f*.1+.3)*exp(-r*90.)*.7;}fragColor=vec4(finish(col*uFade,uv,.13),1.);}`,
  );
  solid(
    55,
    "coral-geodesic",
    "Coral Geodesic",
    "architectural",
    "spherical living scaffold · phase-grown bridges · negative space",
    `float map(vec3 p){p=rotY(uTime*.025)*p;float r=length(p),a=atan(p.z,p.x),b=atan(length(p.xz),p.y);float grid=min(abs(sin(a*7.+uTime*.05))*r,abs(sin(b*6.+dna(2.)*.8))*r);return max(grid-.035,abs(r-.95)-.055);}`,
  );
  solid(
    57,
    "seed-of-another-ocean",
    "Seed of Another Ocean",
    "surreal",
    "folded water seed · nested inner horizon · iridescent rind",
    `float map(vec3 p){p=rotY(uTime*.04)*p;float rind=abs(length(p*vec3(.85,1.15,1.))-1.)-.04;float inner=abs(p.y+.12*sin(p.x*3.+p.z*2.-uTime*.3))-.025;inner=max(inner,length(p)-.85);return max(min(rind,inner),-(length(p-vec3(0,.4,.8))-.65));}`,
  );
  shader(
    59,
    "lenticular-monsoon",
    "Lenticular Monsoon",
    "fluid",
    "chromatic atmospheric sheets · oblique rain · fluid parallax",
    `void main(){vec2 uv=screenUV();vec3 col=vec3(.002,.006,.02);for(int j=0;j<6;j++){float f=float(j);vec2 q=rot2(.2+f*.08)*uv*(8.+f*4.)+vec2(uTime*.03,-uTime*(.15+f*.06));vec2 id=floor(q),p=fract(q)-.5;float rain=exp(-abs(p.x-(hash12(id)-.5)*.7)*90.)*exp(-abs(p.y)*6.);col+=bio(f*.13+hash12(id)*.2+uTime*.007)*rain*.7;}fragColor=vec4(finish(col*uFade,uv,.12),1.);}`,
  );
  solid(
    61,
    "quiet-xenolith",
    "Quiet Xenolith",
    "minimal",
    "minimal mineral levitation · living aperture · negative space",
    `float map(vec3 p){p=rotY(uTime*.03)*rotZ(.14*sin(uTime*.08))*p;float body=sdBox(p,vec3(.7,.7,.24))-.08;float hole=length(p.xy)-(.26+.045*breath());return max(body,-hole);}`,
    null,
    "mix(vec3(.2,.24,.3),bio(p.y*.15+uTime*.006),.3)",
  );
  solid(
    63,
    "unborn-constellation",
    "Unborn Constellation",
    "celestial",
    "embryonic star chambers · orbit exchange · diffuse nursery light",
    `float map(vec3 p){float d=10.;for(int j=0;j<9;j++){float f=float(j),a=f*2.4+uTime*.035;vec3 c=vec3(cos(a),sin(a*1.31),sin(a*.8))*.85;float shell=abs(length(p-c)-(.13+.035*sin(f+uTime*.13)))-.018;d=smin(d,shell,.035+.05*uCoupling);}return d;}`,
  );
})(window);
