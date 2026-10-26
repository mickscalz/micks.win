/* Collection VI — AFTER THE IMPOSSIBLE.
   Forty-two independently constructed fields, surfaces and optical systems.
   Slow, incommensurate clocks deform geometry as well as colour. */
(function (w) {
  'use strict';
  // Reordered after reviewing real frames: alternate spatial, fluid, 4D and
  // sculptural work at the front rather than grouping similar treatments.
  var priority={1:28,28:1,2:5,5:2,4:34,34:4,7:43,43:7,9:55,55:9,13:48,48:13};
  function register(n,id,name,tag,blurb,kind,extra) {
    var place=priority[n]||n;
    var d={id:id,name:name,edition:6,rank:0,captivation:Math.round((100-place*.24)*100)/100,
      tag:tag,blurb:blurb,kind:kind,theme:'dark',preview:'assets/previews/'+id+'.webp',
      art:'linear-gradient(135deg,#130a32,#3946b5,#ef5678,#16b9ad)'};
    Object.assign(d,extra);w.D(d);return d;
  }
  w.CabinetVI={register:register};
  function shader(n,id,name,tag,blurb,frag,budget) {
    return register(n,id,name,tag,blurb,'gl',{frag:frag,pixelBudget:budget||1000000});
  }
  // Common illumination, not common geometry: every field below is different.
  function surface(n,id,name,tag,blurb,field,camera,material,budget) {
    return shader(n,id,name,tag,blurb,field+`
      vec3 normalAt(vec3 p){vec2 e=vec2(.002,0);return normalize(vec3(field(p+e.xyy)-field(p-e.xyy),field(p+e.yxy)-field(p-e.yxy),field(p+e.yyx)-field(p-e.yyx)));}
      void main(){vec2 uv=screenUV();${camera}
        float dist=.02,nearD=1.;bool hit=false;
        for(int i=0;i<112;i++){float d=field(ro+rd*dist);nearD=min(nearD,abs(d));if(abs(d)<.002){hit=true;break;}dist+=max(.001,abs(d)*.68);if(dist>28.)break;}
        vec3 col=mix(vec3(.006,.009,.026),vec3(.04,.018,.085),clamp(uv.y+.5,0.,1.));
        if(hit){vec3 p=ro+rd*dist,nor=normalAt(p);float key=max(dot(nor,normalize(vec3(-.6,1.,-1.))),0.);
          float rim=pow(1.-abs(dot(nor,rd)),2.);float ao=clamp(field(p+nor*.12)/.12,.18,1.);
          vec3 base=${material};
          col=base*(.22+key*.72)*ao+base*rim*.38;
          col+=vec3(.5,.75,1.)*pow(max(dot(reflect(rd,nor),normalize(vec3(-.6,1.,-1.))),0.),36.)*.36;
          col=mix(col,vec3(.025,.035,.09),1.-exp(-dist*.035));
        }
        fragColor=vec4(finish(col*uFade,uv,.19),1.);
      }`,budget);
  }

  surface(1,'elsewhere-cathedral','Elsewhere Cathedral','gyroid passage · living topology · iridescent depth',
    'The walls are also doorways. The ceiling is another floor. An entire architecture changes its mind around you.',`
    float field(vec3 p){vec2 raw=p.xy;p.xy+=vec2(.18*sin(p.z*.7+uTime*.11),.22*cos(p.z*.6-uTime*.13));
      float k=1.7+.12*sin(uTime*.071);vec3 q=p*k;
      float g=dot(sin(q),cos(q.yzx));return max((abs(g)-(.17+.055*sin(p.z*.8+uTime*.19)))/(k*3.1),.7-length(raw-vec2(PI/(2.*k),0.)));}
    `,`vec3 ro=vec3(PI/(2.*(1.7+.12*sin(uTime*.071))),0.,uTime*.24);vec3 rd=normalize(vec3(rot2(.12*sin(uTime*.11))*uv+uMouse*.09,1.));`,
    `spectrum(dot(p,vec3(.22,.31,.18))+uTime*.021+sin(p.z*.8)*.15)*(.7+.35*sin(p.y*4.+p.z))`,850000);

  shader(2,'event-horizon-garden','Event Horizon Garden','gravitational lens · accretion filaments · bent starlight',
    'Light arrives by the long route. A garden of incandescent orbits flowers around a hole in the idea of distance.',`
    void main(){vec2 uv=screenUV();vec3 ro=vec3(0.,1.1+sin(uTime*.09)*.3,-3.8),p=ro,rd=normalize(vec3(uv*1.5,1.));
      rd=rotZ(.28+sin(uTime*.06)*.2)*rd;vec3 col=vec3(0.);float trans=1.;
      for(int i=0;i<80;i++){float r=length(p);rd=normalize(rd-p*(.016/(r*r*r+.05)));p+=rd*.09;
        float R=length(p.xz);float disk=exp(-abs(p.y)*24.)*smoothstep(.66,.95,R)*(1.-smoothstep(2.6,3.4,R));
        float spiral=.35+.65*pow(.5+.5*sin(atan(p.z,p.x)*9.+R*12.-uTime*1.3),3.);
        col+=trans*disk*spiral*spectrum(R*.21-uTime*.023+atan(p.z,p.x)*.07)*.21;trans*=1.-disk*.11;
        if(r<.48){trans=0.;break;}}
      col+=trans*vec3(.4,.6,1.)*starLayer(rd.xy/max(.2,abs(rd.z)),58.,19.,7.)*.6;
      fragColor=vec4(finish(col*uFade,uv,.2),1.);
    }`,500000);

  surface(4,'seraphim-machine','Seraphim Machine','articulated concentric wings · rotating union · pearlescence',
    'Not a wheel, not a creature. Its wings open at different speeds, and the spaces they leave behind become new wings.',`
    float field(vec3 p){float d=10.;for(int i=0;i<7;i++){float f=float(i);vec3 q=rotY(uTime*(.09+f*.009)+f*.7)*rotX(f*.4+sin(uTime*.17+f)*.35)*p;
      float r=length(q.xy),a=atan(q.y,q.x);float radius=.3+f*.16+.07*sin(a*5.+uTime*.3+f);
      d=min(d,length(vec2(r-radius,q.z))-(.022+f*.003));}return d;}
    `,`vec3 ro=vec3(uMouse*.35,3.4);vec3 rd=normalize(vec3(uv,-1.25));`,
    `mix(vec3(.06,.14,.3),spectrum(length(p)*.6+uTime*.024),.75)+.25*pow(.5+.5*sin(p.z*24.+uTime),8.)`);

  shader(5,'chromofluid-rebellion','Chromofluid Rebellion','nested vector advection · liquid interference · moving pigment',
    'Colours do not sit on a surface here. They stretch the surface, fold the current, then escape into another colour.',`
    void main(){vec2 uv=screenUV(),p=uv*3.2;float t=uTime*.14;
      for(int i=0;i<6;i++){float f=float(i)+1.;p+=.46/f*vec2(sin(p.y*f+t*(1.+f*.08)+sin(p.x)),cos(p.x*f-t*.83+cos(p.y)));p=rot2(.11*sin(t*.37+f))*p;}
      float v=sin(p.x*3.+cos(p.y*2.))+cos(p.y*3.4+t);float bands=.5+.5*sin(v*3.+p.x*1.4-t);
      vec3 col=spectrum(v*.24+t*.09);col=mix(col,vec3(.015,.025,.065),pow(bands,14.)*.85);
      col+=vec3(.5,.8,.9)*pow(1.-abs(sin(v*2.8+p.y)),32.)*.65;
      fragColor=vec4(finish(col*uFade,uv,.12),1.);
    }`,1000000);

  surface(7,'ribbon-worldtree','Ribbon Worldtree','branched helices · luminous sap · growing sculpture',
    'Each branch is a stairway to another branch. The trunk keeps winding upward, carrying entire seasons in its light.',`
    float field(vec3 p){float a=p.y*1.2+uTime*.16;vec3 q=p;q.xz=rot2(a)*q.xz;
      float trunk=length(q.xz)-.09;float d=trunk;
      for(int i=0;i<5;i++){float f=float(i),h=mod(p.y+f*.73+2.,3.)-1.5;
        vec2 v=rot2(f*2.399+sin(uTime*.13+f)*.3)*q.xz;float branch=length(vec2(v.y,v.x*.55+h))-.04;
        branch=max(branch,max(-v.x,v.x-1.05));d=smin(d,branch,.1);}return max(d,abs(p.y)-1.8);}
    `,`vec3 ro=vec3(3.*sin(uTime*.09),.1,3.*cos(uTime*.09));vec3 rd=lookAt(ro,vec3(0),vec3(0,1,0))*normalize(vec3(uv,1.2));`,
    `spectrum(p.y*.21+uTime*.018)*(.8+.4*pow(.5+.5*sin(p.y*27.-uTime*2.),8.))`);

  shader(8,'opal-weatherfront','Opal Weatherfront','thin-film interference · converging pressure · spectral ridges',
    'A weather map for a planet made of mother-of-pearl. Pressure moves in iridescent folds, without ever repeating the forecast.',`
    float heightAt(vec2 p){return .4+.18*sin(p.x*2.+sin(p.y*1.5+uTime*.13))+.13*cos(p.y*3.+sin(p.x*1.4-uTime*.11))+.045*fbm2(p*2.+uTime*.02);}
    void main(){vec2 uv=screenUV(),p=uv*2.;float h=heightAt(p),e=.004;vec3 n=normalize(vec3(heightAt(p-vec2(e,0))-heightAt(p+vec2(e,0)),heightAt(p-vec2(0,e))-heightAt(p+vec2(0,e)),.018));
      float incidence=dot(n,normalize(vec3(.3,.4,1.)));vec3 col=spectrum(h*2.7+incidence*.8+uTime*.017);
      float contour=pow(.5+.5*cos(h*68.-uTime*.4),18.);col*=.35+.65*incidence;col+=contour*vec3(.65,.85,1.)*.35;
      fragColor=vec4(finish(col*uFade,uv,.14),1.);
    }`,750000);

  surface(10,'impossible-aqueduct','Impossible Aqueduct','warped arcades · tiled stone · unending traversal',
    'Water travels uphill through arches that return to themselves. The horizon is an address, not an edge.',`
    float field(vec3 p){p.x+=.6*sin(p.z*.25+uTime*.07);vec3 q=p;q.z=mod(p.z+1.5,3.)-1.5;
      float arch=max(abs(length(vec2(p.x,p.y-.1))-1.35)-.17,abs(q.z)-.19);
      float legs=max(abs(abs(p.x)-1.35)-.17,max(-p.y-.1,abs(q.z)-.19));
      return min(min(arch,legs),abs(p.y+1.2)-.07);}
    `,`vec3 ro=vec3(.1,.05,uTime*.35);vec3 rd=normalize(vec3(uv+uMouse*.06,1.2));`,
    `mix(vec3(.08,.32,.35),vec3(.9,.38,.16),.5+.5*sin(p.z*.36+uTime*.04))*(.65+.35*step(.08,abs(sin(p.y*10.+p.z*.2))))`);

  shader(11,'aurora-labyrinth','Aurora Labyrinth','volumetric curtains · lateral parallax · charged atmosphere',
    'Walk between curtains of magnetic weather. Every opening contains another sky.',`
    void main(){vec2 uv=screenUV();vec3 ro=vec3(uMouse*.2,uTime*.18),rd=normalize(vec3(uv,1.));vec3 col=vec3(.002,.005,.02);float tr=1.;
      for(int i=0;i<48;i++){float z=float(i)*.16;vec3 p=ro+rd*z;float w=sin(p.x*3.+sin(p.z*1.7+uTime*.16)*1.3)+.4*sin(p.z*4.-uTime*.19);
        float sheet=exp(-abs(w)*22.)*exp(-abs(p.y)*1.7);float ribs=.4+.6*pow(.5+.5*sin(p.z*37.+p.y*3.-uTime*.8),3.);
        col+=tr*spectrum(p.y*.3+p.z*.11+uTime*.019)*sheet*ribs*.26;tr*=1.-sheet*.07;}
      fragColor=vec4(finish(col*uFade,uv,.18),1.);
    }`,550000);

  surface(13,'mercury-organism','Mercury Organism','coalescing metaballs · capillary necks · liquid chrome',
    'A liquid animal with no preferred outline. Its limbs dissolve into its body and emerge somewhere it has never been.',`
    float field(vec3 p){float d=5.;for(int i=0;i<9;i++){float f=float(i),a=f*2.399+uTime*(.17+.012*f);vec3 c=vec3(sin(a)*.78,cos(a*1.13+f)*.65,sin(a*.79+2.)*.65);
      d=smin(d,length(p-c)-(.24+.09*sin(uTime*.21+f)),.3);}return d;}
    `,`vec3 ro=vec3(uMouse*.35,3.3);vec3 rd=normalize(vec3(uv,-1.2));`,
    `mix(vec3(.035,.055,.09),spectrum(dot(reflect(rd,nor),vec3(.4,.6,.2))*1.3+uTime*.022),.8)+pow(.5+.5*sin(reflect(rd,nor).y*19.),20.)*.4`);

  shader(14,'tectonic-rainbow','Tectonic Rainbow','folding strata · shaded relief · geological colour flow',
    'A million years of stone flowing in one breath. The strata fold, slide, expose a new interior, then close again.',`
    float rock(vec2 p){p+=vec2(.25*sin(p.y*2.+uTime*.17),.2*cos(p.x*2.-uTime*.13));return fbm2(p*2.)+.22*sin(p.x*2.+p.y+uTime*.09);}
    void main(){vec2 uv=screenUV(),p=uv*3.;float h=rock(p),e=.01;vec2 grad=vec2(rock(p+vec2(e,0))-h,rock(p+vec2(0,e))-h)/e;
      float layers=.5+.5*sin(h*85.+uTime*.2);vec3 col=spectrum(h*3.+uTime*.011);col*=.35+.65*max(dot(normalize(vec3(-grad,.9)),normalize(vec3(-.5,.8,1.))),0.);
      col*=.6+.4*smoothstep(.05,.3,layers);fragColor=vec4(finish(col*uFade,uv,.12),1.);
    }`,850000);

  surface(16,'hyperbolic-hive','Hyperbolic Hive','recursive cavities · cellular architecture · slow deformation',
    'There are too many rooms to fit inside the building. The building solves this by becoming the rooms.',`
    float field(vec3 p){p=rotY(uTime*.06)*p;float outer=length(p)-1.3;vec3 q=p;float cut=-10.,scale=1.;
      for(int i=0;i<3;i++){q=mod(q*3.+1.5,3.)-1.5;scale*=3.;vec3 a=abs(q);float holes=min(max(a.x,a.y),min(max(a.y,a.z),max(a.z,a.x)))-.53-.07*sin(uTime*.19);cut=max(cut,-holes/scale);}
      return max(outer,cut);}
    `,`vec3 ro=vec3(2.5*sin(uTime*.08),1.2,2.5*cos(uTime*.08));vec3 rd=lookAt(ro,vec3(0),vec3(0,1,0))*normalize(vec3(uv,1.2));`,
    `mix(vec3(.07,.12,.22),spectrum(length(p)*.7+p.y*.2+uTime*.013),.8)`);

  shader(17,'phase-change','Phase Change','quasicrystal interference · shifting symmetry · moiré depth',
    'Order appears without a repeating tile. Five directions become seven, dissolve, and find each other somewhere new.',`
    void main(){vec2 uv=screenUV(),p=uv*17.;float a=0.,b=0.;for(int i=0;i<7;i++){float f=float(i),ang=f*TAU/7.+uTime*.014;vec2 d=vec2(cos(ang),sin(ang));
      a+=cos(dot(p,d)*(1.+.14*sin(uTime*.11+f))+uTime*.13*sin(f));b+=sin(dot(p,rot2(.39)*d)*1.08-uTime*.17);}
      float v=a*.3+b*.18;vec3 col=spectrum(v*.32+uTime*.014);col*=.25+.75*pow(.5+.5*sin(v*4.),2.);col+=pow(.5+.5*cos(v*8.),28.)*vec3(.4,.6,.8)*.45;
      fragColor=vec4(finish(col*uFade,uv,.14),1.);
    }`,1100000);

  surface(19,'clockwork-eclipse','Clockwork Eclipse','nested orbital shells · moving apertures · obsidian and gold',
    'An eclipse assembled from moving parts. Each shell reveals a different machinery of light.',`
    float field(vec3 p){float d=9.;for(int i=0;i<4;i++){float f=float(i);vec3 q=rotX(f*.7+uTime*(.08+f*.018))*rotY(f+uTime*.11)*p;
      float shell=abs(length(q)-(.55+f*.24))-.035;float slot=min(abs(q.y)-(.32+.08*sin(uTime*.13+f)),abs(q.x)-.12);d=min(d,max(shell,-slot));}return d;}
    `,`vec3 ro=vec3(uMouse*.3,3.5);vec3 rd=normalize(vec3(uv,-1.2));`,
    `mix(vec3(.035,.028,.055),vec3(1.,.48,.06),pow(1.-abs(dot(nor,rd)),2.))`);

  shader(20,'pressure-bloom','Pressure Bloom','propagating wave packets · caustic ridges · chromatic collision',
    'Every pulse changes the waves it passes through. Flowers made of pressure open across the entire surface.',`
    void main(){vec2 uv=screenUV(),p=uv*3.;float v=0.;vec2 g=vec2(0.);for(int i=0;i<6;i++){float f=float(i);vec2 c=vec2(sin(f*2.4+uTime*.12),cos(f*1.7-uTime*.09))*1.25;
      vec2 q=p-c;float r=length(q)+.001;float phase=r*(7.+f)-uTime*(.7+f*.09);v+=sin(phase)*exp(-r*.4);g+=q/r*cos(phase)*exp(-r*.4);}
      vec3 n=normalize(vec3(g*.7,1.));vec3 col=mix(vec3(.005,.035,.09),vec3(.03,.7,.65),smoothstep(-1.5,2.,v))*(.3+.7*max(dot(n,normalize(vec3(.4,.7,1.))),0.));col+=exp(-abs(v-.2*sin(uTime*.13))*9.)*vec3(.9,.3,.04)*.7;
      col+=pow(max(0.,n.z),18.)*vec3(.35,.7,.8);fragColor=vec4(finish(col*uFade,uv,.18),1.);
    }`);

  surface(22,'velour-singularity','Velour Singularity','twisted textile shell · rippling folds · saturated velvet',
    'A fabric woven around an absent centre. The folds travel in opposite directions and never find a seam.',`
    float field(vec3 p){vec3 q=rotY(uTime*.07)*p;float a=atan(q.z,q.x),r=length(q.xz);float tube=length(vec2(r-.78,q.y));float fold=.095*sin(a*11.+atan(q.y,r-.78)*5.+uTime*.4);
      return (abs(tube-(.24+fold))-.025)*.35;}
    `,`vec3 ro=vec3(2.7,1.8,2.7);vec3 rd=lookAt(ro,vec3(0),vec3(0,1,0))*normalize(vec3(uv,1.35));`,
    `spectrum(atan(p.z,p.x)*.23+p.y*.5+uTime*.019)*(.45+.55*pow(1.-abs(dot(nor,rd)),.6))`);

  shader(23,'spectral-sandstorm','Spectral Sandstorm','layered dune flight · analytic heights · impossible horizons',
    'The dunes are taller than continents. Their crests carry a moving fringe of colours the sky has not learned yet.',`
    float dune(vec2 p){return sin(p.x*.8+sin(p.y*.4))* .55+sin(p.x*2.+p.y*.55)*.14+sin(p.y*.9)*.1;}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(uTime*.09,1.4,uTime*.45),rd=normalize(vec3(uv.x,uv.y-.15,1.));float t=.2;bool hit=false;
      for(int i=0;i<70;i++){vec3 p=ro+rd*t;float d=p.y-dune(p.xz);if(d<.004){hit=true;break;}t+=max(.02,d*.55);if(t>35.)break;}
      vec3 col=mix(vec3(.48,.11,.24),vec3(.04,.07,.24),clamp(uv.y+.5,0.,1.));if(hit){vec3 p=ro+rd*t;float h=dune(p.xz);vec3 n=normalize(vec3(dune(p.xz-vec2(.01,0))-h,.01,dune(p.xz-vec2(0,.01))-h));
        col=spectrum(h*.7+p.z*.035+uTime*.013)*(.3+.7*max(dot(n,normalize(vec3(-.4,1.,-.6))),0.));col*=.7+.3*sin(p.x*40.+p.z*7.+h*16.);col=mix(col,vec3(.6,.2,.38),1.-exp(-t*.055));}
      fragColor=vec4(finish(col*uFade,uv,.12),1.);
    }`,600000);

  surface(25,'prism-heart','Prism Heart','faceted breathing solid · carved chambers · optical seams',
    'A gemstone with an interior weather system. Its facets part just enough to let the colours escape.',`
    float field(vec3 p){vec3 q=rotY(uTime*.13)*rotX(.5+sin(uTime*.11)*.3)*p;
      float oct=(abs(q.x)+abs(q.y)+abs(q.z)-1.5)/1.732;float sphere=length(q)-(.96+.11*sin(uTime*.3));
      float seam=min(abs(q.x),min(abs(q.y),abs(q.z)))-.035;return max(max(oct,-sphere),-seam);}
    `,`vec3 ro=vec3(uMouse*.4,3.1);vec3 rd=normalize(vec3(uv,-1.2));`,
    `spectrum(dot(nor,vec3(.3,.6,.8))+p.y*.3+uTime*.023)*1.15`);

  shader(26,'ink-between-stars','Ink Between Stars','advected pigment plumes · negative space · luminous edges',
    'Ink learns to move in vacuum. Its edges catch starlight; its interior keeps the dark.',`
    void main(){vec2 uv=screenUV(),p=uv*2.5;vec2 q=vec2(fbm2(p+uTime*.025),fbm2(p+vec2(8.,-uTime*.031)));
      float f=fbm2(p*2.6+q*4.);float ink=smoothstep(.41,.57,f);float edge=exp(-abs(f-.49)*90.);vec3 col=mix(vec3(.009,.015,.04),spectrum(f*2.+uTime*.023)*.5,ink);
      col+=spectrum(q.x+uTime*.017)*edge*.65;col+=vec3(.4,.6,.85)*starLayer(uv+uTime*.001,85.,20.,8.)*(1.-ink)*.35;
      fragColor=vec4(finish(col*uFade,uv,.16),1.);
    }`,800000);

  surface(28,'vertebrae-of-light','Vertebrae of Light','flexing axial sculpture · repeated ribs · electric marrow',
    'A spine for a creature as long as the night. Every vertebra is a little cathedral, flexing around a river of light.',`
    float field(vec3 p){p.xy-=vec2(.32*sin(p.z*.65+uTime*.2),.25*cos(p.z*.8-uTime*.17));vec3 q=p;q.z=mod(q.z+.24,.48)-.24;q.xy=rot2(p.z*.45+uTime*.11)*q.xy;
      float ribs=length(vec2(length(q.xy)-.8,q.z))-.045;float strut=sdBox(q,vec3(.055,.82,.04));return min(ribs,strut);}
    `,`vec3 ro=vec3(.1,.1,uTime*.45);vec3 rd=normalize(vec3(uv+uMouse*.05,1.1));`,
    `spectrum(p.z*.12+p.x*.3+uTime*.021)*(.7+.4*pow(.5+.5*sin(p.z*10.-uTime),8.))`);

  shader(29,'impossible-rain','Impossible Rain','refractive droplets · cellular refraction · falling lenses',
    'Rain does not fall on the landscape. Every drop contains a different landscape, and they fall through one another.',`
    void main(){vec2 uv=screenUV();vec3 col=vec3(.015,.02,.055);for(int layer=0;layer<3;layer++){float f=float(layer),scale=5.+f*4.;vec2 p=uv*scale+vec2(f*7.,uTime*(.23+f*.1)),id=floor(p),q=fract(p)-.5;
      vec2 center=(hash22(id+f)-.5)*.45;vec2 v=q-center;float r=.16+hash12(id)*.14,d=length(v)/r;float mask=1.-smoothstep(.92,1.,d);
      vec2 refr=uv+v*sqrt(max(0.,1.-d*d))*.38;vec3 lens=spectrum(refr.x*1.2+refr.y*.9+uTime*.015+f*.17);
      lens*=.35+.65*sqrt(max(0.,1.-d*d));lens+=exp(-length(v-vec2(-.04,.065))*55.)*.7;col=mix(col,lens,mask*(.85-f*.15));}
      fragColor=vec4(finish(col*uFade,uv,.16),1.);
    }`,900000);

  surface(31,'recursive-monastery','Recursive Monastery','nested box folds · distance-estimated fractal · immense scale',
    'Every balcony looks onto another monastery. The smallest window is a view of the whole place.',`
    float field(vec3 p){vec3 z=p;float scale=1.;for(int i=0;i<5;i++){z=abs(z)-vec3(.8,.7,.65);z=rotZ(.25+sin(uTime*.07)*.14)*rotY(.5)*z;z*=1.65;scale*=1.65;}return sdBox(z,vec3(.5))/scale;}
    `,`vec3 ro=vec3(2.5*sin(uTime*.065),1.25,2.5*cos(uTime*.065));vec3 rd=lookAt(ro,vec3(0),vec3(0,1,0))*normalize(vec3(uv,1.15));`,
    `mix(vec3(.12,.08,.19),vec3(.55,.85,.72),.5+.5*sin(p.y*4.+p.z*3.+uTime*.12))`,500000);

  shader(32,'silken-turbulence','Silken Turbulence','anisotropic filaments · nested flow · satin highlights',
    'A thousand strands share one current, but no strand follows it exactly. Light walks sideways along the weave.',`
    void main(){vec2 uv=screenUV(),p=uv*2.8;float t=uTime*.09;for(int i=0;i<4;i++){float f=float(i);p+=vec2(sin(p.y*1.7+t+f),cos(p.x*1.3-t*.8+f))*.35;}
      float lines=pow(.5+.5*sin(p.x*95.+sin(p.y*5.+t)*9.),12.);float weave=.5+.5*sin(p.y*7.+sin(p.x*2.)*2.-t);
      vec3 col=spectrum(p.x*.2+p.y*.1+t*.15)*(.16+lines*.8);col+=vec3(.3,.55,.6)*pow(weave,8.)*lines;
      fragColor=vec4(finish(col*uFade,uv,.16),1.);
    }`,1100000);

  surface(34,'crown-of-tides','Crown of Tides','lobed membrane · concentric rupture · oscillating silica',
    'The crown is a wave paused halfway through breaking. It keeps trying to become a sea.',`
    float field(vec3 p){p=rotY(uTime*.1)*p;float a=atan(p.z,p.x),r=length(p.xz);float height=.45*cos(a*9.+uTime*.32)*smoothstep(.25,1.2,r);
      float sheet=abs(p.y-height)-.025;return max(sheet,max(r-1.2,.22-r))*.2;}
    `,`vec3 ro=vec3(2.2,2.5,2.2);vec3 rd=lookAt(ro,vec3(0),vec3(0,1,0))*normalize(vec3(uv,1.25));`,
    `spectrum(length(p.xz)*.8+atan(p.z,p.x)*.12+uTime*.014)`);

  shader(35,'folded-spectrum','Folded Spectrum','complex-plane tessellation · inversion drift · coloured infinities',
    'A map that refuses to remain flat. Turn one corner and the entire country moves inside it.',`
    void main(){vec2 uv=screenUV(),p=uv*2.;float accum=0.,fold=0.;for(int i=0;i<7;i++){p=abs(p)-vec2(.47+.06*sin(uTime*.11),.32);p=rot2(.6+uTime*.017)*p/max(.2,dot(p,p));accum+=exp(-length(p)*2.)/float(i+1);fold+=length(p)*.03;}
      vec3 col=spectrum(accum*.7+fold*.1+uTime*.016)*(.15+accum*.7);col+=pow(.5+.5*sin(fold*40.),24.)*.22;
      fragColor=vec4(finish(col*uFade,uv,.15),1.);
    }`,850000);

  surface(37,'magnetic-rose','Magnetic Rose','dipole sculpture · polar petals · flowing field lines',
    'Iron filings would arrange themselves into this flower, if iron could remember colour and flowers could remember stars.',`
    float field(vec3 p){p=rotX(.4)*rotY(uTime*.09)*p;float r=length(p),a=atan(p.z,p.x),theta=atan(length(p.xz),p.y);
      float petal=.67+.19*cos(a*7.+uTime*.2)*sin(theta*3.);return (abs(r-petal)-(.035+.02*sin(theta*9.-uTime*.4)))*.4;}
    `,`vec3 ro=vec3(uMouse*.3,2.9);vec3 rd=normalize(vec3(uv,-1.25));`,
    `spectrum(atan(p.z,p.x)*.22+p.y*.4+uTime*.021)*(.65+.45*pow(.5+.5*sin(length(p)*70.-uTime),6.))`);

  shader(38,'helium-dream','Helium Dream','buoyant volume · thermals · chromatic density',
    'The clouds rise through one another without mixing. Each carries a different atmosphere from a world below.',`
    void main(){vec2 uv=screenUV();vec3 col=vec3(.012,.008,.03);float tr=1.;for(int i=0;i<36;i++){float z=float(i)*.13;vec3 p=vec3(uv*(1.+z*.3),z);p.y-=uTime*.07;
      float density=fbm3(p*2.4+vec3(sin(p.y*.9+uTime*.15),0,0));density=smoothstep(.36,.7,density);
      vec3 hue=spectrum(p.y*.22+p.z*.18+uTime*.012);col+=tr*hue*density*.17;tr*=1.-density*.12;}
      fragColor=vec4(finish(col*uFade,uv,.16),1.);
    }`,600000);

  surface(40,'interstellar-loom','Interstellar Loom','crossed braided beams · camera flight · luminous junctions',
    'A loom large enough to weave trajectories. Where two threads meet, a new direction is born.',`
    float field(vec3 p){float z=p.z;vec3 q=p;q.xy=rot2(.16*sin(z*.5+uTime*.1))*q.xy;
      vec2 a=mod(q.xy+vec2(.5*sin(z*.8),0)+1.,2.)-1.;
      float x=length(vec2(a.y,sin(z*2.)*.15))-.035;
      float y=length(vec2(a.x,cos(z*2.)*.15))-.035;return min(x,y);}
    `,`vec3 ro=vec3(.4,.4,uTime*.4);vec3 rd=normalize(vec3(uv+uMouse*.04,1.));`,
    `spectrum(p.x*.22+p.y*.32+p.z*.08+uTime*.014)`);

  shader(41,'liquid-stained-glass','Liquid Stained Glass','moving Voronoi cells · refractive seams · luminous enamel',
    'A window whose pieces are still deciding their shapes. The lead melts; the light stays.',`
    void main(){vec2 uv=screenUV(),p=uv*7.;vec2 id=floor(p),f=fract(p);float d1=9.,d2=9.,key=0.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j)),h=hash22(id+o),c=o+.5+.36*sin(uTime*.23+TAU*h);float d=length(c-f);if(d<d1){d2=d1;d1=d;key=hash12(id+o);}else d2=min(d2,d);}
      float seam=smoothstep(.015,.075,d2-d1);vec3 col=spectrum(key+uTime*.018)*(.4+.6*exp(-d1*d1*2.));col*=.12+.88*seam;col+=vec3(.4,.5,.7)*pow(1.-seam,5.)*.13;
      fragColor=vec4(finish(col*uFade,uv,.12),1.);
    }`,900000);

  surface(43,'nematode-palace','Nematode Palace','curling tubes · organic chambers · rotating radial skeleton',
    'The palace grows a new corridor every time an old one curls back into the wall.',`
    float field(vec3 p){float d=8.;for(int i=0;i<8;i++){float f=float(i);vec3 q=rotZ(f*TAU/8.+uTime*.05)*p;
      q.x-=.55+.18*sin(q.y*3.+uTime*.25+f);q.z-=.2*cos(q.y*2.+uTime*.21+f);
      float tube=length(q.xz)-(.065+.025*cos(q.y*5.-uTime*.3));tube=max(tube,abs(q.y)-1.1);d=smin(d,tube,.1);}return d;}
    `,`vec3 ro=vec3(2.*sin(uTime*.08),.6,2.*cos(uTime*.08));vec3 rd=lookAt(ro,vec3(0),vec3(0,1,0))*normalize(vec3(uv,1.2));`,
    `spectrum(p.y*.4+p.z*.3+uTime*.019)`);

  shader(44,'sunken-contours','Sunken Contours','bathymetric drift · moving islands · depth-light mapping',
    'The ocean floor rolls like a sleeping creature. Its contours trace coastlines that have never broken the surface.',`
    void main(){vec2 uv=screenUV(),p=uv*3.+vec2(uTime*.018,0);float h=fbm2(p+vec2(sin(uTime*.07),cos(uTime*.09)))+.14*sin(p.x*2.+uTime*.13);
      float line=pow(.5+.5*cos(h*120.),24.);vec3 col=mix(vec3(.005,.018,.07),vec3(.02,.55,.48),smoothstep(.25,.8,h));
      col=mix(col,vec3(.95,.5,.2),smoothstep(.65,.86,h));col+=line*spectrum(h+uTime*.01)*.35;
      fragColor=vec4(finish(col*uFade,uv,.15),1.);
    }`);

  surface(46,'antigravity-quarry','Antigravity Quarry','levitating cut blocks · moving seams · mineral interiors',
    'The mountain has been quarried without removing anything. Every block floats close enough to remember where it belonged.',`
    float field(vec3 p){p=rotY(uTime*.07)*p;vec3 id=floor((p+.25)/.5),q=mod(p+.25,.5)-.25;
      q.y+=.07*sin(dot(id,vec3(1.,2.,3.))+uTime*.3);float boxes=sdBox(q,vec3(.19));return max(boxes,length(p)-1.25);}
    `,`vec3 ro=vec3(2.5,1.9,2.8);vec3 rd=lookAt(ro,vec3(0),vec3(0,1,0))*normalize(vec3(uv,1.25));`,
    `spectrum(dot(floor((p+.25)/.5),vec3(.11,.17,.07))+uTime*.017)*(.65+.35*sin(p.y*40.))`);

  shader(47,'infinite-diffraction','Infinite Diffraction','curved gratings · spectral orders · moving optical lattice',
    'Two almost identical patterns disagree. Their disagreement grows into a landscape of enormous moving colour.',`
    void main(){vec2 uv=screenUV(),p=uv*4.;vec2 q=rot2(.035+sin(uTime*.07)*.07)*p+uMouse*.06;
      float a=sin((length(p-vec2(.5*sin(uTime*.11),0)))*95.);float b=sin(length(q-vec2(-.1,.04))*97.);
      float beat=a*b;vec3 col=spectrum(beat*.6+length(p)*.18+uTime*.014)*(.18+.82*pow(.5+.5*beat,2.));
      fragColor=vec4(finish(col*uFade,uv,.14),1.);
    }`,1100000);

  surface(49,'breathing-archaeology','Breathing Archaeology','eroding ceremonial rings · carved steps · pulsing voids',
    'An ancient machine mistaken for a ruin. The stairs expand, the portals narrow, and the stone takes another breath.',`
    float field(vec3 p){vec3 q=rotY(uTime*.08)*p;float y=floor(q.y*5.)/5.;float radius=.7+.2*sin(y*4.+uTime*.2);
      float shell=abs(length(q.xz)-radius)-.12;float tier=abs(mod(q.y+.1,.2)-.1)-.065;
      float d=max(max(shell,tier),abs(q.y)-1.05);float gates=abs(sin(atan(q.z,q.x)*5.))- .16;return max(d,-gates*.13);}
    `,`vec3 ro=vec3(2.7,1.5,2.7);vec3 rd=lookAt(ro,vec3(0),vec3(0,1,0))*normalize(vec3(uv,1.3));`,
    `mix(vec3(.1,.18,.23),vec3(.8,.45,.15),.5+.5*sin(p.y*5.+uTime*.09))`);

  shader(50,'neon-protoplasm','Neon Protoplasm','cellular thresholds · merging membranes · electrical nuclei',
    'Life before it chooses a species. Membranes join, nuclei wander, and the whole experiment glows from within.',`
    void main(){vec2 uv=screenUV(),p=uv*4.;float v=0.;vec3 color=vec3(0.);for(int i=0;i<12;i++){float f=float(i);vec2 c=vec2(sin(f*2.4+uTime*(.07+f*.003)),cos(f*1.7-uTime*.11))*2.;float d=length(p-c);float weight=.06/(d*d+.025);v+=weight;color+=spectrum(f*.14+uTime*.015)*weight;}
      color/=max(.01,v);float skin=exp(-abs(v-1.)*14.);vec3 col=color*(smoothstep(.7,1.2,v)*.32+skin*.9);col+=pow(max(0.,v-2.),.5)*color*.18;
      fragColor=vec4(finish(col*uFade,uv,.18),1.);
    }`,1000000);

  surface(52,'aperture-mountain','Aperture Mountain','perforated peaks · spiralling strata · orbital terrain',
    'The mountain is full of sky. Every layer has turned a little further than the layer beneath it.',`
    float field(vec3 p){vec3 q=p;q.xz=rot2(q.y*.8+uTime*.08)*q.xz;float r=length(q.xz),a=atan(q.z,q.x);
      float cone=max((r-(1.-q.y*.55))*.8,abs(q.y)-1.1);float holes=abs(sin(a*6.)*sin(q.y*9.+uTime*.15))-.34;return max(cone,-holes*.12);}
    `,`vec3 ro=vec3(2.7,1.8,2.9);vec3 rd=lookAt(ro,vec3(0),vec3(0,1,0))*normalize(vec3(uv,1.35));`,
    `spectrum(p.y*.32+length(p.xz)*.17+uTime*.012)`);

  shader(53,'refracted-memory','Refracted Memory','anamorphic tiles · chromatic displacement · liquid checkerwork',
    'A tiled floor remembers every wave that ever passed over it. The memories bend the tiles into something almost recognisable.',`
    void main(){vec2 uv=screenUV(),p=uv*5.;float t=uTime*.16;p+=.6*vec2(sin(p.y*1.5+t)+sin(p.x*.8-t*.7),cos(p.x*1.7-t));
      vec2 g=fract(p)-.5;vec2 id=floor(p);float tile=mod(id.x+id.y,2.);float bevel=(1.-smoothstep(.32,.45,max(abs(g.x),abs(g.y))));
      vec3 col=mix(spectrum(id.x*.07+id.y*.09+uTime*.017)*.12,spectrum(p.x*.04+p.y*.05+uTime*.017),tile);
      col*=.35+.65*bevel;col+=vec3(.15,.25,.35)*pow(1.-bevel,4.);fragColor=vec4(finish(col*uFade,uv,.12),1.);
    }`,1000000);

  surface(55,'stellar-cocoon','Stellar Cocoon','nested membranes · polar slits · inner star',
    'Something is growing inside the star. Its translucent armour opens along unfamiliar lines of longitude.',`
    float field(vec3 p){p=rotY(uTime*.11)*rotZ(.2)*p;float r=length(p),a=atan(p.z,p.x),b=atan(length(p.xz),p.y);
      float shell=abs(r-(.9+.08*sin(b*6.+uTime*.3)))-.035;float slits=abs(sin(a*8.+sin(b*3.+uTime*.17)))-.52;return min(max(shell,-slits*.12),r-.33);}
    `,`vec3 ro=vec3(uMouse*.3,3.);vec3 rd=normalize(vec3(uv,-1.2));`,
    `mix(vec3(.95,.33,.04),spectrum(p.y*.5+uTime*.015),smoothstep(.35,.7,length(p)))`);

  shader(56,'chromatic-faultline','Chromatic Faultline','sheared domains · melting edges · optical displacement',
    'The image has a fault running through time. Each side moves through a different spectrum, and the boundary refuses to heal.',`
    void main(){vec2 uv=screenUV(),p=uv*3.;float fault=sin(p.y*1.4+uTime*.15)*.4+sin(p.y*4.-uTime*.2)*.12;float side=smoothstep(-.03,.03,p.x-fault);
      vec2 q=p+vec2(side*.5,side*sin(uTime*.11));float f=fbm2(q*2.+uTime*.025);vec3 col=spectrum(f*2.+side*.35+uTime*.02);
      col*=.3+.7*pow(.5+.5*sin(f*38.+q.y*5.),2.);col+=exp(-abs(p.x-fault)*80.)*vec3(.7,.85,1.)*.7;
      fragColor=vec4(finish(col*uFade,uv,.14),1.);
    }`);

  surface(58,'cosmic-siphon','Cosmic Siphon','fluted funnel · endless fall · rotating chamber walls',
    'A river of space falls through a funnel with no bottom. The walls flare outward as the descent carries you inward.',`
    float field(vec3 p){float r=length(p.xy),a=atan(p.y,p.x),radius=1.05+.18*sin(p.z*.65)+.1*sin(a*12.+p.z*.4+uTime*.15);
      return (abs(r-radius)-.055)*.6;}
    `,`vec3 ro=vec3(.12*sin(uTime*.13),.1*cos(uTime*.11),uTime*.55);vec3 rd=normalize(vec3(rot2(uTime*.035)*uv+uMouse*.05,1.));`,
    `spectrum(p.z*.1+atan(p.y,p.x)*.2+uTime*.014)*(.55+.45*pow(.5+.5*sin(p.z*13.-uTime*.5),5.))`);

  shader(59,'living-hologram','Living Hologram','phase-wrapped relief · spectral scan planes · shifting normals',
    'An object made only of the way light would have touched it. The scan keeps finding new shapes inside the old one.',`
    void main(){vec2 uv=screenUV(),p=uv*3.;float t=uTime*.17;float h=sin(p.x*2.+t)*cos(p.y*2.3-t*.7)+.4*sin(length(p)*4.-t);
      float scan=pow(.5+.5*cos(h*32.+p.y*7.-t*2.),18.);float dots=pow(.5+.5*sin(p.x*110.),8.)*pow(.5+.5*sin(p.y*110.),8.);
      vec3 col=spectrum(h*.4+uTime*.019)*(.06+scan*.9+dots*.18);col+=vec3(.08,.3,.4)*exp(-abs(h)*3.);
      fragColor=vec4(finish(col*uFade,uv,.18),1.);
    }`,1100000);

  surface(61,'corona-assembly','Corona Assembly','radial mechanisms · variable teeth · nested rotation',
    'A sun assembled by patient machines. Every tooth moves at a different speed, making a larger motion none of them can see.',`
    float field(vec3 p){float d=9.;for(int i=0;i<5;i++){float f=float(i);vec3 q=rotY(f*.5+uTime*.04)*p;float r=length(q.xy),a=atan(q.y,q.x)+uTime*(.1+f*.013)*mix(-1.,1.,mod(f,2.));
      float ring=abs(r-(.3+f*.2))-(.025+.025*pow(.5+.5*cos(a*(12.+f*4.)),8.));d=min(d,max(ring,abs(q.z)-.05));}return d;}
    `,`vec3 ro=vec3(uMouse*.3,3.3);vec3 rd=normalize(vec3(uv,-1.25));`,
    `mix(vec3(.06,.035,.12),spectrum(length(p)*.6+uTime*.016),.8)`);

  shader(62,'afterimage-ocean','Afterimage Ocean','long-wave refraction · phase currents · changing horizon',
    'An ocean made from the colours left behind after looking at the sun. Every current carries a different afterimage.',`
    void main(){vec2 uv=screenUV();float horizon=.12+.025*sin(uTime*.09);float depth=1./max(.055,abs(uv.y-horizon));vec2 p=vec2(uv.x*depth,depth+uTime*.27);
      float wave=sin(p.x*.9+sin(p.y*.5+uTime*.2))*sin(p.y*1.3-uTime*.4);vec3 col=spectrum(p.y*.035+wave*.23+uTime*.016)*(.25+.5*abs(wave));
      col=mix(col,vec3(.035,.055,.13),exp(-abs(uv.y-horizon)*17.));float sun=exp(-length((uv-vec2(.22,.29))*vec2(1.,1.5))*27.);col+=vec3(.95,.35,.3)*sun;
      fragColor=vec4(finish(col*uFade,uv,.16),1.);
    }`,900000);
})(window);
