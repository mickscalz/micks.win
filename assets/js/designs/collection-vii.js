/* Collection VII — THE LIVING ELSEWHERE.
   32 independent shader constructions. Epoch interpolation changes spatial
   parameters continuously; no video, stock backgrounds or palette-only rooms. */
(function (w) {
  "use strict";
  function reg(n, id, name, family, tag, kind, extra) {
    var d = {
      id: id,
      name: name,
      edition: 7,
      captivation: Math.round((100 - n * 0.27) * 100) / 100,
      family: family,
      vigor: 0.35 + (n % 7) * 0.09,
      tag: tag,
      blurb:
        "A living " +
        family +
        " world. Its structures develop new relationships as the internal rhythm drifts; stay with it to see the next fold.",
      kind: kind,
      theme: "dark",
      preview: "assets/previews/" + id + ".webp",
      art: "linear-gradient(140deg,#080c32,#592e99,#21b6bc,#dfa278)",
    };
    Object.assign(d, extra);
    d.paletteGroup =
      kind === "gl"
        ? [
            "indigo/violet",
            "violet/gold",
            "gold/cyan",
            "cyan/rose",
            "rose/indigo",
          ][Math.floor(((n - 1) * 0.61803398875) % 5)]
        : d.theme === "paper"
          ? "paper/spectral"
          : "spectral";
    d.motionClass = tag.split(" · ")[0];
    w.D(d);
    return d;
  }
  w.CabinetVII = { register: reg };
  var life = `
 float gene(float seed){seed+=floor(uRand)*.37;float t=uTime/12.,k=floor(t),f=fract(t);f=f*f*(3.-2.*f);return mix(.5,mix(hash11(k+seed),hash11(k+1.+seed),f),uNovelty);}
 vec3 aura(float t){float x=mod(t,5.);vec3 a,b;if(x<1.){a=vec3(.045,.025,.24);b=vec3(.49,.035,1.);}else if(x<2.){a=vec3(.49,.035,1.);b=vec3(1.3,.52,.045);}else if(x<3.){a=vec3(1.3,.52,.045);b=vec3(.015,.9,1.15);}else if(x<4.){a=vec3(.015,.9,1.15);b=vec3(.95,.38,.61);}else{a=vec3(.95,.38,.61);b=vec3(.045,.025,.24);}vec3 col=mix(a,b,smoothstep(0.,1.,fract(x)));vec3 safe=mix(vec3(.08,.34,.65),vec3(1.05,.66,.12),.5+.5*sin(t*1.2));col=mix(col,safe,uColorSafe);return mix(vec3(dot(col,vec3(.2126,.7152,.0722))),col,uColorRange);}
 float beat(){return .5+.23*sin(uTime*.67+.4*sin(uTime*.11))+.15*sin(uTime*.91+gene(91.)*3.)+.12*uPulse+.08*uBass+.04*uMid+.03*uTreble;}
 vec3 sky(vec3 rd){float mist=fbm2(rd.xy*2.+uTime*.012);return mix(vec3(.003,.006,.025),aura(uTime*.028+rd.y*.3)*.055,mist)+vec3(.22,.4,.6)*starLayer(rd.xy/max(.3,abs(rd.z)),90.,24.,3.)*.06;}
 `;
  function gl(n, id, name, family, tag, body, budget) {
    return reg(n, id, name, family, tag, "gl", {
      frag:
        life.replace(
          "float x=mod(t,5.)",
          "float x=mod(t+" +
            (((n - 1) * 0.61803398875) % 5).toFixed(4) +
            ",5.)",
        ) + body.replace(/screenUV\(\)/g, "(screenUV()+vec2(uStereo*.018,0))"),
      pixelBudget: budget || 850000,
    });
  }
  function solid(n, id, name, family, tag, field, camera, material, budget) {
    return gl(
      n,
      id,
      name,
      family,
      tag,
      field +
        `
 vec3 norm(vec3 p){vec2 e=vec2(.002,0);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx))+vec3(.00001));}
 void main(){vec2 uv=screenUV();${camera}float t=.015,g=0.;bool hit=false;for(int i=0;i<100;i++){float d=map(ro+rd*t);g+=exp(-abs(d)*55.)*.0015;if(abs(d)<.0018){hit=true;break;}t+=max(.001,abs(d)*.62);if(t>32.)break;}
 vec3 col=sky(rd);if(hit){vec3 p=ro+rd*t,n=norm(p);float a=clamp(map(p+n*.16)/.16,.15,1.),key=max(dot(n,normalize(vec3(-.5,1.,-1.))),0.),fill=max(dot(n,normalize(vec3(1.,.3,.8))),0.),fres=pow(1.-abs(dot(n,rd)),3.);vec3 base=${material};
 col=base*(.16+key*.67+fill*.22)*a;col+=aura(p.y*.24+uTime*.028+gene(7.))*fres*(.35+uIntensity*.5);col+=vec3(.4,.65,.75)*pow(max(dot(reflect(rd,n),normalize(vec3(-.5,1.,-1.))),0.),42.)*.5;
 col=mix(col,aura(uTime*.027+1.)*.09,1.-exp(-t*.045));}col+=aura(uTime*.025+gene(4.)*3.)*g*(.22+uIntensity*.45+uOnset*.18);fragColor=vec4(finish(col*uFade,uv,.19),1.);}`,
      budget,
    );
  }
  var orbit = `vec3 ro=vec3(3.*sin(uTime*.055),1.2,3.*cos(uTime*.055));vec3 rd=lookAt(ro,vec3(0),vec3(0,1,0))*normalize(vec3(uv+uMouse*.06,1.35));`;

  solid(
    1,
    "living-elsewhere",
    "The Living Elsewhere",
    "surreal",
    "fractal architecture · liquid-light river · organic lattice · floating shards",
    `
 float map(vec3 p){
 vec3 q=p;float ground=(p.y+1.3+.025*sin(p.x*3.+p.z*2.-uTime*.4))*.8;
 float angle=atan(q.z,q.x)+p.y*.65+uTime*.035,r=length(q.xz),fold=mod(angle+PI/8.,TAU/8.)-PI/8.;vec2 branch=vec2(cos(fold),sin(fold))*r;
 float target=.18+(.55+.42*gene(21.))*smoothstep(-1.25,.6,p.y)+.08*sin(p.y*3.+uTime*.15);float roots=length(vec2(branch.x-target,branch.y))-.05;roots=max(roots,abs(p.y+.35)-.95)*.45;
 vec3 g=rotY(uTime*.045)*rotZ(.16*sin(uTime*.09))*(p-vec3(0,.45,0));float grain=dot(sin(g*(3.7+gene(7.)*2.5)),cos(g.yzx*(3.7+gene(7.)*2.5)));
 float lattice=max((abs(grain)-.23)/9.,length(g)-.86);
 float rim=length(vec2(length(g.xy)-.9,g.z))-.035;
 vec3 s=p-vec3(0,1.55,0);s.xz=rot2(uTime*.055)*s.xz;vec3 id=floor((s+.4)/.8),tile=mod(s+.4,.8)-.4;tile.y+=.09*sin(dot(id,vec3(2.,1.,3.))+uTime*.15);float shards=max(sdBox(tile,vec3(.14,.018,.19)),max(abs(s.y)-.15,length(s.xz)-1.25));
 return min(ground,min(roots,min(lattice,min(rim,shards))));}
 `,
    `vec3 ro=vec3(4.2*sin(.35+sin(uTime*.035)*.25),.65+sin(uTime*.051)*.15,4.2*cos(.35+sin(uTime*.035)*.25));vec3 rd=lookAt(ro,vec3(0,.1,0),vec3(0,1,0))*normalize(vec3(uv+uMouse*.05,1.25));`,
    `p.y< -1.2 ? (vec3(.006,.018,.035)+aura(p.z*.22+uTime*.035+2.)*exp(-abs(p.x-.6*sin(p.z*.65-uTime*.18))*8.)*(.9+.25*sin(p.z*10.-uTime*.8))):aura((p.y+1.)*1.3+length(p.xz)*.6+uTime*.027)*( .65+.22*beat()+.2*pow(.5+.5*cos(dot(p,vec3(23.,27.,19.))),18.))`,
    650000,
  );

  solid(
    3,
    "mycelial-worldship",
    "Mycelial Worldship",
    "organic",
    "branching hull · living capillaries · asymmetric morphogenesis",
    `
 float map(vec3 p){p=rotY(uTime*.08)*p;float body=length(p*vec3(.7,1.5,1.))-.8;float a=atan(p.z,p.x),r=length(p.xz);float rib=length(vec2(r-(.8+.12*cos(a*7.+uTime*.2)),p.y-.17*sin(a*4.+uTime*.23)))-.055;return smin(body,rib,.18+gene(5.)*.12);}
 `,
    orbit,
    `aura(p.y*.9+atan(p.z,p.x)*.23+uTime*.02)*(.4+.8*pow(.5+.5*sin(p.x*35.+p.z*22.+uTime*.8),12.))`,
  );

  gl(
    5,
    "glass-amoeba",
    "Glass Amoeba",
    "microscopic",
    "refractive membrane · moving organelles · nested density",
    `
 void main(){vec2 uv=screenUV();vec3 ro=vec3(0,0,-3.),rd=normalize(vec3(uv,1.2)),col=vec3(.003,.007,.025);float tr=1.;for(int i=0;i<60;i++){vec3 p=ro+rd*(float(i)*.08);float shell=length(p)-(.9+.12*sin(p.x*3.+uTime*.24)*cos(p.y*4.-uTime*.19));float density=exp(-abs(shell)*55.);float organs=0.;for(int j=0;j<5;j++){float f=float(j),a=f*2.4+uTime*.11;organs+=exp(-length(p-vec3(sin(a),cos(a*1.13),sin(a*.73))*.48)*24.);}vec3 h=aura(p.x*.5+p.y*.4+uTime*.03);col+=tr*h*(density*.13+organs*.19);tr*=1.-density*.045;}fragColor=vec4(finish(col*uFade,uv,.18),1.);}`,
    650000,
  );

  solid(
    7,
    "city-of-nervous-stars",
    "City of Nervous Stars",
    "architectural",
    "levitating towers · neural windows · luminous ground currents",
    `
 float map(vec3 p){vec2 id=floor((p.xz+.7)/1.4);vec3 q=p;q.xz=mod(p.xz+.7,1.4)-.7;float h=.5+hash12(id)*2.6;float floatY=.2*sin(dot(id,vec2(2.,3.))+uTime*.2);float tower=sdBox(q-vec3(0,h*.5+floatY,0),vec3(.34,h*.5,.34));return min(p.y+.55,tower);}
 `,
    `vec3 ro=vec3(.7,1.3,uTime*.19);vec3 rd=normalize(vec3(uv.x,uv.y-.12,1.15));`,
    `p.y<-.5 ? aura(p.z*.16+uTime*.04)*(.06+.8*pow(.5+.5*sin(p.x*11.+sin(p.z*.8-uTime*.6)),18.)):aura(p.y*.23+uTime*.024)*(.25+pow(.5+.5*cos(p.y*25.),20.)*pow(.5+.5*cos((p.x+p.z)*27.),20.)*2.)`,
  );

  gl(
    9,
    "cocoon-galaxy",
    "Cocoon Galaxy",
    "celestial",
    "helical stellar filaments · expanding nursery · parallax",
    `
 void main(){vec2 uv=screenUV();vec3 col=vec3(.003,.005,.022),ro=vec3(uMouse*.15,-3.5),rd=normalize(vec3(uv,1.15));for(int i=0;i<50;i++){vec3 p=ro+rd*(float(i)*.13);p=rotX(.5)*rotY(uTime*.04)*p;float a=atan(p.z,p.x),r=length(p.xz);float arm=pow(.5+.5*cos(a*4.-r*(5.+gene(8.))),18.);float disk=exp(-abs(p.y)*18.)*exp(-r*1.1);float knot=pow(vnoise3(p*18.+uTime*.02),8.);col+=aura(r*.8+uTime*.03)*(arm*disk*.32+knot*disk*.8);}fragColor=vec4(finish(col*uFade,uv,.17),1.);}`,
    650000,
  );

  solid(
    11,
    "recursive-mangrove",
    "Recursive Mangrove",
    "organic",
    "inverted roots · recursive fork field · tidal atmosphere",
    `
 float map(vec3 p){vec3 q=p;float scale=1.,d=10.;for(int i=0;i<5;i++){q.xz=abs(q.xz)-vec2(.48,.3);q=rotZ(.42+gene(4.)*.12)*rotY(.63)*q;d=min(d,(length(q.xz)-.055)/scale);q*=1.65;scale*=1.65;}return min(p.y+1.3,max(d,abs(p.y)-1.3));}
 `,
    orbit,
    `mix(vec3(.015,.12,.14),aura(p.y*.4+uTime*.028),.75)*(.6+.7*pow(.5+.5*sin(p.y*30.-uTime),12.))`,
  );

  solid(
    13,
    "prism-leviathan",
    "Prism Leviathan",
    "surreal",
    "swimming crystalline anatomy · articulated fins · bioluminescence",
    `
 float map(vec3 p){p.z+=.22*sin(p.x*1.8-uTime*.6);p.y+=.1*cos(p.x*2.-uTime*.4);float body=length(p*vec3(.55,2.8,2.))-1.;float fin=max(abs(p.y)-.025,max(abs(p.z)-(.75-abs(p.x)*.32),abs(p.x)-1.5));return min(body,fin);}
 `,
    orbit,
    `aura(p.x*.6+uTime*.03)*(.45+.7*pow(.5+.5*cos(p.x*18.+p.z*13.-uTime),12.))`,
  );

  solid(
    15,
    "liminal-tidepool",
    "Liminal Tidepool",
    "landscape",
    "living liquid surface · floating luminous disks · atmospheric scale",
    `
 float map(vec3 p){vec2 id=floor((p.xz+1.2)/2.4);vec3 q=p;q.xz=mod(p.xz+1.2,2.4)-1.2;float y=.15*sin(uTime*.3+hash12(id)*6.);float pod=length(vec3(q.x,(p.y-y)*4.,q.z))-(.35+hash12(id)*.4);return min(p.y+.4+.06*sin(p.x*2.+p.z*1.3-uTime*.4),pod);}
 `,
    `vec3 ro=vec3(1.2,1.,uTime*.16);vec3 rd=normalize(vec3(uv.x,uv.y-.22,1.25));`,
    `aura(p.z*.1+p.x*.14+uTime*.023)*(p.y<-.25?.3:1.2)`,
  );

  gl(
    17,
    "inverse-monsoon",
    "Inverse Monsoon",
    "fluid",
    "upward rain · particulate thermals · luminous velocity traces",
    `
 void main(){vec2 uv=screenUV();vec3 col=vec3(.003,.008,.025);for(int l=0;l<5;l++){float f=float(l),scale=9.+f*5.;vec2 p=uv*scale+vec2(sin(uTime*.11+f)*.4,-uTime*(.4+f*.17));vec2 id=floor(p),q=fract(p)-.5,offset=(hash22(id+f)-.5)*.65;float streak=exp(-abs(q.x-offset.x)*95.)*exp(-abs(q.y-offset.y)*9.);col+=aura(hash12(id)*3.+uTime*.025)*streak*(.45+uDensity*.7)/(1.+f*.3);}float veil=fbm2(uv*3.+uTime*.03);col+=aura(uTime*.025)*veil*.075;fragColor=vec4(finish(col*uFade,uv,.2),1.);}`,
  );

  solid(
    19,
    "xenoflora-spires",
    "Xenoflora Spires",
    "organic",
    "curling leaf towers · living whorls · seed chambers",
    `
 float map(vec3 p){p=rotY(uTime*.07)*p;float a=atan(p.z,p.x),r=length(p.xz),height=p.y;float angle=mod(a+PI/5.,TAU/5.)-PI/5.;vec2 q=vec2(cos(angle),sin(angle))*r;float leaf=length(vec2(q.x-(.52+.22*sin(height*2.+uTime*.2)),q.y))-.045;leaf=max(leaf,abs(height)-1.3);return min(leaf,length(p-vec3(0,.65,0))-.34);}
 `,
    orbit,
    `aura(p.y*.6+uTime*.025)*(.65+.5*pow(.5+.5*cos(p.y*26.),15.))`,
  );

  solid(
    21,
    "cathedral-of-soft-laws",
    "Cathedral of Soft Laws",
    "architectural",
    "elastic vaults · changing metric · impossible interior",
    `
 float map(vec3 p){vec2 raw=p.xy;p.xy+=vec2(.18*sin(p.z*.6+uTime*.13),.12*cos(p.z*.7));vec3 q=p*(1.6+gene(2.)*.4);float g=dot(sin(q),cos(q.yzx));return max((abs(g)-.18)/5.,.65-length(raw-vec2(.95,0)));}
 `,
    `vec3 ro=vec3(.95,0,uTime*.22);vec3 rd=normalize(vec3(rot2(.08*sin(uTime*.1))*uv+uMouse*.04,1.));`,
    `aura(p.z*.22+p.y*.36+uTime*.024)*(.6+.35*cos(p.x*6.))`,
    650000,
  );

  solid(
    23,
    "polyhedral-molt",
    "Polyhedral Molt",
    "crystalline",
    "faceted cell division · sphere-to-octahedron morph · drifting plates",
    `
 float map(vec3 p){p=rotY(uTime*.08)*rotX(.35)*p;vec3 id=floor((p+.3)/.6),q=mod(p+.3,.6)-.3;q+=sin(id*2.+uTime*.2)*.035;float box=sdBox(q,vec3(.21)),oct=(dot(abs(q),vec3(1.))-.32)/1.732;float cell=mix(box,oct,gene(21.));return max(cell,length(p)-1.25);}
 `,
    orbit,
    `aura(dot(floor((p+.3)/.6),vec3(.19,.23,.31))+uTime*.022)`,
  );

  solid(
    25,
    "celestial-bronchi",
    "Celestial Bronchi",
    "microscopic",
    "branching respiratory space · radial alveoli · pulsing capillaries",
    `
 float map(vec3 p){p=rotY(uTime*.07)*p;vec3 q=p;float d=9.,scale=1.;for(int i=0;i<4;i++){q.x=abs(q.x)-.48;q=rotZ(.65)*q;q.y=abs(q.y)-.3;d=min(d,(length(q.xz)-.07)/scale);q*=1.75;scale*=1.75;}return max(d,length(p)-1.4);}
 `,
    orbit,
    `aura(p.y*.7+p.z*.4+uTime*.026)*(.65+.65*pow(.5+.5*sin(p.y*35.-uTime*1.2),12.))`,
  );

  gl(
    27,
    "lensing-lanterns",
    "Lensing Lanterns",
    "celestial",
    "nested ellipsoidal volumes · suspended light · atmospheric overlap",
    `
 void main(){vec2 uv=screenUV();vec3 col=vec3(.002,.004,.017),ro=vec3(0,0,-3.),rd=normalize(vec3(uv,1.2));float tr=1.;for(int i=0;i<52;i++){vec3 p=ro+rd*(float(i)*.12);float den=0.;vec3 light=vec3(0.);for(int j=0;j<5;j++){float f=float(j),a=f*2.4+uTime*.055;vec3 c=vec3(cos(a)*.85,sin(a*1.1)*.6,sin(a*.8)*.55);float shell=length((p-c)*vec3(1.,.7,1.))-.34;float d=exp(-abs(shell)*42.);light+=aura(f*.8+uTime*.024)*d;den+=d;}col+=tr*light*.11;tr*=1.-min(.8,den*.06);}fragColor=vec4(finish(col*uFade,uv,.2),1.);}`,
    600000,
  );

  gl(
    29,
    "plasma-root-delta",
    "Plasma Root Delta",
    "fluid",
    "branching drainage · advected light · river-like glow",
    `
 void main(){vec2 uv=screenUV(),p=uv*3.;vec3 col=vec3(.002,.007,.02);float sum=0.;for(int i=0;i<6;i++){float f=float(i);vec2 q=p;q.x+=sin(q.y*(1.+f*.3)+uTime*.17+f)*(.35+f*.06);float vein=exp(-abs(sin(q.x*(2.+f*.7)+f))*float(25+i*5));float taper=exp(-abs(q.y)*.25);col+=aura(f*.65+q.y*.15+uTime*.028)*vein*taper*.23;sum+=vein;}col+=aura(uTime*.02)*fbm2(p+uTime*.02)*.04;fragColor=vec4(finish(col*uFade,uv,.18),1.);}`,
  );

  solid(
    31,
    "chiral-sanctuary",
    "Chiral Sanctuary",
    "geometric",
    "opposed handedness · linked helicoids · sculptural phase exchange",
    `
 float map(vec3 p){p=rotY(uTime*.06)*p;float a=atan(p.z,p.x),r=length(p.xz);float sheet1=abs(sin(a*3.+p.y*4.-uTime*.2))*r*.3-.024;float sheet2=abs(sin(a*3.-p.y*4.+uTime*.17))*r*.3-.024;return max(min(sheet1,sheet2),max(r-1.1,max(.25-r,abs(p.y)-1.2)))*.4;}
 `,
    orbit,
    `aura(p.y*.8+atan(p.z,p.x)*.4+uTime*.026)`,
  );

  solid(
    33,
    "petrichor-on-titan",
    "Petrichor on Titan",
    "landscape",
    "wet basalt · slow terrain drift · reflected alien twilight",
    `
 float terrain(vec2 p){return .45*fbm2(p*.8)+.15*sin(p.x*.8+sin(p.y*.6));}
 float map(vec3 p){float floorD=(p.y-terrain(p.xz))*.6;vec2 id=floor((p.xz+1.)/2.);vec3 q=p;q.xz=mod(p.xz+1.,2.)-1.;float rock=length(q*vec3(1.6,1.,1.5)-vec3(0,.1,0))-(.2+hash12(id)*.3);return min(floorD,rock);}
 `,
    `vec3 ro=vec3(.2,1.15,uTime*.16);vec3 rd=normalize(vec3(uv.x,uv.y-.15,1.15));`,
    `mix(vec3(.015,.04,.07),aura(p.z*.07+uTime*.022)*.45,smoothstep(.1,.5,p.y))`,
  );

  gl(
    35,
    "phosphor-intelligence",
    "Phosphor Intelligence",
    "organic",
    "ridged luminous volume · cellular currents · coherent density drift",
    `
 void main(){vec2 uv=screenUV();vec3 ro=vec3(uMouse*.2,-2.),rd=normalize(vec3(uv,1.1)),col=vec3(.002,.004,.018);float tr=1.;for(int i=0;i<44;i++){vec3 p=ro+rd*(float(i)*.12);vec3 q=p+sin(p.yzx*1.7+uTime*.12)*.25;float den=pow(ridged3(q*1.6),5.)*exp(-dot(p,p)*.35);col+=tr*aura(p.z*.5+p.y*.5+uTime*.025)*den*.55;tr*=1.-den*.16;}fragColor=vec4(finish(col*uFade,uv,.2),1.);}`,
    550000,
  );

  solid(
    37,
    "crystal-nervure",
    "Crystal Nervure",
    "crystalline",
    "veined mineral growth · variable lattice · luminescent joints",
    `
 float map(vec3 p){p=rotY(uTime*.07)*p;vec3 q=mod(p+.3,.6)-.3;vec3 a=abs(q);float edges=min(length(a.xy),min(length(a.yz),length(a.xz)))-(.025+.015*beat());return max(edges,length(p)-1.2);}
 `,
    orbit,
    `aura(p.x*.5+p.y*.7+uTime*.026)*(.5+.8*pow(.5+.5*sin(dot(p,vec3(17,23,19))-uTime),15.))`,
  );

  solid(
    39,
    "cathedral-under-skin",
    "Cathedral Under Skin",
    "surreal",
    "breathing membrane · internal windows · soft cellular arches",
    `
 float map(vec3 p){p=rotY(uTime*.065)*p;float r=length(p),a=atan(p.z,p.x),b=atan(length(p.xz),p.y);float shell=abs(r-(1.+.08*sin(a*5.+uTime*.3)*sin(b*4.)))-.045;float holes=abs(sin(a*6.+b*2.))*abs(sin(b*5.-uTime*.12))-.35;return max(shell,-holes*.13)*.45;}
 `,
    orbit,
    `aura(p.y*.8+p.z*.3+uTime*.024)`,
  );

  gl(
    41,
    "aurora-lithography",
    "Aurora Lithography",
    "painterly",
    "translucent printed planes · volumetric ink · flowing registration",
    `
 void main(){vec2 uv=screenUV();vec3 col=vec3(.005,.008,.025);for(int i=0;i<14;i++){float f=float(i),z=.4+f*.18;vec2 p=uv*z+vec2(.04*sin(uTime*.12+f),uTime*.015);float ink=fbm2(p*4.+f*3.);float band=exp(-abs(p.y-.2*sin(p.x*4.+uTime*.18+f*.3))*23.);col+=aura(f*.32+uTime*.025)*band*smoothstep(.25,.7,ink)*.12;}fragColor=vec4(finish(col*uFade,uv,.18),1.);}`,
  );

  gl(
    43,
    "falling-upward",
    "Falling Upward",
    "fluid",
    "liquid trajectories · reversing gravity · luminous eddies",
    `
 void main(){vec2 uv=screenUV();vec3 col=vec3(.002,.005,.02);for(int i=0;i<38;i++){float f=float(i),seed=hash11(f*3.),age=fract(uTime*(.04+seed*.025)+seed),y=mix(-.65,.65,age);float x=(hash11(f+18.)-.5)*1.5+.14*sin(age*8.+uTime*.13+f);vec2 q=uv-vec2(x,y);float drop=exp(-length(q*vec2(1.,.6))*180.);float trail=exp(-abs(q.x)*210.)*exp(-abs(q.y+.025)*30.)*.06;col+=aura(seed*4.+uTime*.023)*(drop+trail)*(.3+uDensity*.6);}fragColor=vec4(finish(col*uFade,uv,.15),1.);}`,
  );

  solid(
    45,
    "axial-dreams",
    "Axial Dreams",
    "architectural",
    "helicoidal platforms · ascending camera · changing aperture",
    `
 float map(vec3 p){float r=length(p.xz),a=atan(p.z,p.x),phase=p.y-a*.25;float tier=abs(mod(phase+.18,.36)-.18)-.025;return max(tier,max(r-1.7,.5-r))*.55;}
 `,
    `vec3 ro=vec3(.2,uTime*.12,-3.);vec3 rd=normalize(vec3(uv.x,uv.y+.05,1.2));`,
    `aura(p.y*.3+atan(p.z,p.x)*.18+uTime*.024)`,
  );

  gl(
    47,
    "silk-nebula",
    "Silk Nebula",
    "celestial",
    "flowing spectral ribbons · elongated star wisps · deep layered light",
    `
 void main(){vec2 uv=screenUV();vec3 col=vec3(.002,.004,.018);for(int i=0;i<18;i++){float f=float(i),a=f*.31;vec2 p=rot2(a+uTime*.015)*uv;float y=.16*sin(p.x*(3.+f*.15)+uTime*.2+f)+.03*sin(p.x*14.-uTime*.4);float d=abs(p.y-y-f*.012+.1);col+=aura(f*.28+uTime*.027)*exp(-d*(90.+f*3.))*.18;}col+=starLayer(uv,90.,20.,4.)*vec3(.2,.35,.5)*.2;fragColor=vec4(finish(col*uFade,uv,.2),1.);}`,
  );

  gl(
    49,
    "luminous-palimpsest",
    "Luminous Palimpsest",
    "painterly",
    "liquid pigment strata · spectral erosion · luminous negative space",
    `
 void main(){vec2 uv=screenUV(),p=uv*2.3;vec3 col=vec3(.01,.012,.025);for(int i=0;i<5;i++){float f=float(i);vec2 q=p+vec2(fbm2(p+uTime*.025+f),fbm2(p-uTime*.019+f+8.))*1.8;float ink=fbm2(q*2.+f*4.);float rim=exp(-abs(ink-(.35+f*.055))*100.);col=mix(col,aura(f*.8+uTime*.024)*.45,smoothstep(.35+f*.04,.55+f*.04,ink)*.65);col+=aura(f*.8+uTime*.024)*rim*.15;}fragColor=vec4(finish(col*uFade,uv,.1),1.);}`,
    700000,
  );

  solid(
    51,
    "breath-of-obsidian",
    "Breath of Obsidian",
    "minimal",
    "monochrome interlude · porous black sculpture · radiating seams",
    `
 float map(vec3 p){p=rotY(uTime*.055)*rotZ(.2)*p;float shell=abs(length(p)-(.95+.08*sin(p.y*5.+uTime*.2)))-.045;float holes=dot(sin(p*5.),cos(p.yzx*5.));return max(shell,-(abs(holes)-.38)/9.);}
 `,
    orbit,
    `vec3(.11+.8*pow(.5+.5*sin(p.y*18.+uTime*.4),24.))`,
  );

  solid(
    53,
    "anemochory",
    "Anemochory",
    "organic",
    "windborne seed chambers · radial membranes · curling stalks",
    `
 float map(vec3 p){p=rotY(uTime*.06)*p;float d=9.;for(int i=0;i<7;i++){float f=float(i),a=f*2.399;vec3 c=vec3(cos(a)*.7,sin(f*1.7)*.8,sin(a)*.7);vec3 q=p-c;q.xz=rot2(q.y+uTime*.1)*q.xz;float seed=length(q*vec3(1.,1.8,1.))-(.18+.03*beat());float stem=length(q.xz)-.018;stem=max(stem,max(-q.y-.55,q.y));d=min(d,min(seed,stem));}return d;}
 `,
    orbit,
    `aura(p.y*.7+p.x*.4+uTime*.024)`,
  );

  solid(
    55,
    "crystalline-tectonics",
    "Crystalline Tectonics",
    "landscape",
    "drifting mineral plates · molten light seams · lifted strata",
    `
 float map(vec3 p){vec2 id=floor((p.xz+.4)/.8);vec3 q=p;q.xz=mod(p.xz+.4,.8)-.4;float h=.15+.45*sin(id.x*.4+id.y*.5+uTime*.15)+.2*gene(hash12(id)*22.);return sdBox(q-vec3(0,h,0),vec3(.34,.25,.34));}
 `,
    `vec3 ro=vec3(.4,1.4,uTime*.16);vec3 rd=normalize(vec3(uv.x,uv.y-.25,1.2));`,
    `aura(p.y*.9+p.z*.11+uTime*.023)*(.45+.65*pow(.5+.5*sin(p.y*35.),16.))`,
  );

  solid(
    57,
    "recursive-raindrop",
    "Recursive Raindrop",
    "crystalline",
    "nested droplets · internal cavities · scale recursion",
    `
 float map(vec3 p){p=rotY(uTime*.075)*p;float d=9.;for(int i=0;i<5;i++){float f=float(i),r=1.15-f*.19;vec3 q=rotX(f*.5+uTime*.04)*p;float shell=abs(length(q*vec3(1.,.8,1.))-r)-.025;float slot=abs(q.y)-(.16+.05*sin(uTime*.2+f));d=min(d,max(shell,-slot));}return d;}
 `,
    orbit,
    `aura(length(p)*1.5+p.y*.4+uTime*.025)`,
  );

  gl(
    59,
    "ultraviolet-estuary",
    "Ultraviolet Estuary",
    "fluid",
    "flowing tributaries · advected cellular light · liquid branching",
    `
 void main(){vec2 uv=screenUV(),p=uv*3.;float t=uTime*.11;for(int i=0;i<5;i++){float f=float(i);p+=vec2(sin(p.y*1.4+t+f),cos(p.x*1.7-t*.8+f))*.28;}float v=fbm2(p*3.);float river=exp(-abs(sin(p.x*3.+p.y*.7))*22.);vec3 col=aura(v*3.+t*.2)*(.08+.55*v+river*.6);col+=vec3(.3,.5,.6)*pow(.5+.5*cos(v*57.),24.)*.15;fragColor=vec4(finish(col*uFade,uv,.18),1.);}`,
  );

  gl(
    61,
    "quiet-superorganism",
    "Quiet Superorganism",
    "minimal",
    "breathing soft volume · slow organelles · auratic silence",
    `
 void main(){vec2 uv=screenUV();vec3 col=vec3(.004,.007,.025);float r=length(uv*vec2(1.,1.1)),a=atan(uv.y,uv.x),edge=.28+.035*sin(a*5.+uTime*.14)+.025*sin(a*3.-uTime*.1);float shell=exp(-abs(r-edge)*110.);col+=aura(a*.15+uTime*.018)*shell*.7;float inside=exp(-r*r*13.);col+=aura(uTime*.018+1.)*inside*.11;for(int i=0;i<8;i++){float f=float(i),ang=f*2.4+uTime*.035;vec2 c=vec2(cos(ang),sin(ang))*(.06+f*.016);col+=aura(f*.5+uTime*.02)*exp(-length(uv-c)*160.)*.4;}fragColor=vec4(finish(col*uFade,uv,.12),1.);}`,
  );

  solid(
    63,
    "dream-in-negative-space",
    "Dream in Negative Space",
    "surreal",
    "porous metric · inverse cells · endless interstitial passage",
    `
 float map(vec3 p){vec2 raw=p.xy;p.xy+=.15*sin(p.z*.4+vec2(0,2)+uTime*.1);vec3 q=mod(p+1.,2.)-1.;float cells=abs(length(q)-1.05)-.09;return max(cells,.53-length(raw));}
 `,
    `vec3 ro=vec3(0,0,uTime*.24);vec3 rd=normalize(vec3(rot2(.1*sin(uTime*.07))*uv,1.));`,
    `aura(p.z*.15+p.x*.4+uTime*.024)*(.55+.35*cos(p.y*9.))`,
  );
})(window);
