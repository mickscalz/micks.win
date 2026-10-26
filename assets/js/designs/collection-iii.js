/* Collection III — material, atmosphere and impossible places.
   Every scene has its own geometry and lighting; only the film finish is shared.
   Scores are editorial. catalogue.js orders collections newest-first, then scores. */
(function (w) {
  'use strict';
  function room(id, name, score, tag, blurb, art, frag, budget) {
    w.D({ id: id, name: name, edition: 3, rank: 0, captivation: score,
      tag: tag, blurb: blurb, art: art, preview: 'assets/previews/' + id + '.webp',
      kind: 'gl', theme: /^(kintsugi-earth|topographic-dream)$/.test(id) ? 'paper' : 'dark', pixelBudget: budget || 1300000, frag: frag });
  }

  room('prismatic-monolith', 'Prismatic Monolith', 99,
    'black crystal · spectral seams · sphere tracing',
    'An object without a maker, standing in a desert without a sun. The seams remember a light that the stone will not let out.',
    'linear-gradient(135deg,#040912,#167c8d,#b65eff,#060510)', `
    vec3 local(vec3 p){p.y-=0.18;p.xz=rot2(uTime*.12+uMouse.x*.4)*p.xz;p.xy=rot2(.12*sin(uTime*.2))*p.xy;return p;}
    float shape(vec3 p){vec3 q=local(p);return sdBox(q,vec3(.52,1.12,.40))-.075;}
    vec3 norm(vec3 p){vec2 e=vec2(.002,0);return normalize(vec3(shape(p+e.xyy)-shape(p-e.xyy),shape(p+e.yxy)-shape(p-e.yxy),shape(p+e.yyx)-shape(p-e.yyx)));}
    vec3 sky(vec3 r){float a=atan(r.z,r.x);float rib=pow(.5+.5*sin(a*4.+r.y*7.+uTime*.12),12.);return vec3(.008,.012,.03)+vec3(.08,.22,.3)*rib+vec3(.25,.05,.19)*pow(max(r.y,0.),3.);}
    void main(){
      vec2 uv=screenUV();vec3 ro=vec3(2.9,.75+uMouse.y*.5,4.5);
      vec3 rd=normalize(lookAt(ro,vec3(0,.12,0),vec3(0,1,0))*vec3(uv,1.25));
      float t=0.;float hit=0.;
      for(int i=0;i<76;i++){float h=shape(ro+rd*t);if(h<.0014){hit=1.;break;}t+=h*.85;if(t>14.)break;}
      vec3 col=sky(rd)*.5;
      if(hit>.5){vec3 p=ro+rd*t,n=norm(p),q=local(p);float fres=pow(1.-max(dot(n,-rd),0.),4.);
        float dif=max(dot(n,normalize(vec3(-.6,1.,2.))),0.);
        float seam=abs(sin(q.y*4.8+sin(q.x*8.)*.65+q.z*3.));
        vec3 spectral=spectrum(q.y*.35+q.x*.6+uTime*.025);
        col=vec3(.008,.014,.024)*( .2+dif)+sky(reflect(rd,n))*(.35+fres*1.4);
        col+=spectral*exp(-seam*75.)*1.5+spectral*exp(-seam*12.)*.055;
        col+=vec3(.4,.8,1.)*pow(max(dot(reflect(rd,n),normalize(vec3(-1,2,2))),0.),60.)*.8;
      }
      float ground=(-1.08-ro.y)/rd.y;
      if(ground>0.&&(hit<.5||ground<t)){vec3 p=ro+rd*ground;float grains=vnoise2(p.xz*25.);float shadow=1.-.8*exp(-length(p.xz)*1.8);
        col=vec3(.015,.024,.035)*shadow*(.5+grains*.5);
        col+=vec3(.08,.23,.30)*exp(-abs(p.x)*1.5)*exp(-abs(p.z)*.65)*.3;
        col=mix(col,sky(rd)*.4,1.-exp(-ground*.035));}
      col+=vec3(.1,.32,.42)*exp(-length(uv-vec2(0,.03))*6.)*.05;
      fragColor=vec4(finish(col*uFade,uv,.4),1.);
    }`, 1000000);

  room('orbital-garden', 'Orbital Garden', 98,
    'ringed planet · ray intersections · orbital shadows',
    'Ice, dust and a billion uncompleted moons. You are looking across the plane of a ring system wide enough to swallow every horizon you have known.',
    'radial-gradient(ellipse at 55% 50%,#ddbfa4,#8a6178,#192747,#020510)', `
    float ball(vec3 ro,vec3 rd,vec3 c,float r){vec3 o=ro-c;float b=dot(o,rd),h=b*b-dot(o,o)+r*r;return h>0.?-b-sqrt(h):-1.;}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(0,.5,4.8),rd=normalize(vec3(uv*2.,-1.8));
      vec3 light=normalize(vec3(-1.,.7,2.));vec3 col=vec3(.002,.004,.012);
      float stars=starLayer(uv+vec2(uTime*.001,0),62.,10.,2.)+starLayer(uv,19.,14.,4.);
      col+=vec3(.62,.75,1.)*stars*.16;
      vec3 nring=normalize(vec3(.2,.9,.38));float tp=-dot(ro,nring)/dot(rd,nring);
      float tb=ball(ro,rd,vec3(0),.86);
      if(tb>0.){vec3 p=ro+rd*tb,n=normalize(p);float dif=max(dot(n,light),0.);
        float bands=.5+.3*sin(p.y*35.+fbm3(p*3.)*4.+uTime*.15);
        vec3 gas=mix(vec3(.16,.22,.36),vec3(.59,.40,.27),bands);
        float shadow=1.;float rt=-dot(p,nring)/dot(light,nring);vec3 rp=p+light*rt;
        if(rt>0.&&length(rp)>1.09&&length(rp)<1.95)shadow=.32;
        col=gas*(.035+.85*dif*shadow);
        col+=vec3(.15,.38,.8)*pow(1.-max(dot(n,-rd),0.),4.)*.45;
      }
      float nearest=tb>0.?tb:1.e5;
      if(tp>0.){vec3 pp=ro+rd*tp;float r=length(pp);if(r>1.09&&r<1.95&&(tb<0.||tp<tb)){
        float bands=.45+.2*sin(r*220.)+.18*sin(r*410.)+.1*sin(r*61.);
        float gap=1.-.9*exp(-pow((r-1.58)*70.,2.));
        float sh=ball(pp+light*.015,light,vec3(0),.86)>0.?.07:1.;
        vec3 dust=mix(vec3(.26,.17,.19),vec3(.65,.53,.36),bands)*gap*sh*.65;
        col=mix(col,dust,.92);nearest=min(nearest,tp);
      }}
      // A moon crosses a different orbital plane.
      vec3 mc=vec3(1.28*cos(uTime*.05),.95,1.1*sin(uTime*.05));float tm=ball(ro,rd,mc,.11);
      if(tm>0.&&tm<nearest){vec3 n=normalize(ro+rd*tm-mc);col=vec3(.4,.46,.55)*(.04+.7*max(dot(n,light),0.));}
      fragColor=vec4(finish(col*uFade,uv,.3),1.);
    }`);

  room('abyssal-medusa', 'Abyssal Medusa', 97,
    'bioluminescent anatomy · translucent filaments',
    'Something older than bone is rising through the dark. Its whole nervous system is a lantern, and every thread carries the pulse.',
    'radial-gradient(at 50% 35%,#9bfcff,#3a58b9,#160b38,#010613)', `
    float strand(vec2 p,float phase,float t){float y=clamp(-p.y,0.,.75);float x=.016*sin(y*24.-t*2.+phase)+.028*sin(y*12.+phase);return abs(p.x-x);}
    void main(){vec2 uv=screenUV();float T=uTime;vec3 col=vec3(.001,.006,.016);
      for(int layer=0;layer<3;layer++){float f=float(layer),sc=1.+f*.68;vec2 p=uv*sc;
        p.x-=.32*sin(f*3.6+T*.09)+uMouse.x*.06;p.y-=.12*cos(f*2.8+T*.13);
        float pulse=.5+.5*sin(T*1.9-f);p.y*=1.+.045*pulse;
        vec2 bell=vec2(p.x/.23,(p.y-.16)/.16);float rr=length(bell);
        float cap=exp(-abs(rr-1.)*65.)*smoothstep(-.15,.15,bell.y);
        float inside=exp(-pow(rr,4.)*2.)*smoothstep(-.1,.4,bell.y);
        float ribs=pow(.5+.5*cos(atan(bell.y,bell.x)*16.),12.)*inside;
        vec3 tint=mix(vec3(.05,.65,.95),vec3(.65,.16,.75),f*.35);
        col+=tint*(cap*.9+inside*.08+ribs*.23)/(1.+f*.65);
        for(int j=0;j<13;j++){float fj=float(j),sx=(fj-6.)*.027;
          vec2 q=p-vec2(sx,.135);float y=-q.y;float d=strand(q,fj*.86,T);
          float gate=smoothstep(-.01,.045,y)*(1.-smoothstep(.48,.85,y));
          float signal=pow(.5+.5*sin(y*25.-T*2.8+fj*.5),8.);
          col+=tint*(exp(-d*1100.)*.55+exp(-d*120.)*.025)*gate*(.25+signal)/(1.+f);
        }
        col+=vec3(.4,.85,1.)*exp(-length(p-vec2(0,.21))*50.)*.3;
      }
      float dust=starLayer(uv+vec2(T*.003,-T*.009),42.,9.,12.);
      col+=vec3(.2,.55,.85)*dust*.12;
      fragColor=vec4(finish(col*uFade,uv,.5),1.);
    }`, 1100000);

  room('cathedral-of-echoes', 'Cathedral of Echoes', 96,
    'repeated vaults · distance-field architecture',
    'A corridor whose end keeps moving away. Every arch is an echo of the one before it, and the light has been travelling longer than you have.',
    'linear-gradient(180deg,#040716,#264251,#b77e44,#070914)', `
    float vault(vec3 p){
      float z=mod(p.z+1.8,3.6)-1.8;
      vec2 q=vec2(abs(p.x),p.y);
      float column=length(vec2(q.x-1.25,z))-.12;
      column=max(column,abs(p.y-.15)-1.45);
      vec2 arch=vec2(p.x,p.y-.45);float ring=abs(length(arch)-1.25)-.1;
      float arch3=max(max(ring,abs(z)-.14),.45-p.y);
      return min(column,arch3);
    }
    float world(vec3 p){return min(vault(p),p.y+1.25);}
    vec3 normalAt(vec3 p){vec2 e=vec2(.003,0);return normalize(vec3(world(p+e.xyy)-world(p-e.xyy),world(p+e.yxy)-world(p-e.yxy),world(p+e.yyx)-world(p-e.yyx)));}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(uMouse.x*.45,-.12,uTime*.8);
      vec3 rd=normalize(vec3(uv.x,uv.y+.04+uMouse.y*.1,1.15));float t=.01,h=0.;
      for(int i=0;i<90;i++){h=world(ro+rd*t);if(h<.0015||t>55.)break;t+=max(h*.8,.008);}
      vec3 col=vec3(.003,.008,.02);
      if(t<55.){vec3 p=ro+rd*t,n=normalAt(p);float ao=.5+.5*clamp(world(p+n*.15)/.15,0.,1.);
        float lit=max(dot(n,normalize(vec3(.4,.8,-.5))),0.);
        vec3 stone=mix(vec3(.022,.045,.065),vec3(.10,.14,.17),vnoise3(p*6.));
        col=stone*(.15+.6*lit)*ao;
        float z=mod(p.z+1.8,3.6)-1.8;
        float edge=exp(-abs(abs(p.x)-1.25)*90.)*exp(-abs(z)*20.);
        col+=vec3(.3,.75,1.)*edge*.35;
        float inner=abs(length(vec2(p.x,p.y-.45))-1.15);
        col+=vec3(.08,.55,.9)*exp(-inner*110.)*step(.45,p.y)*exp(-abs(z)*5.)*.35;
        if(p.y< -1.24){float tiles=pow(abs(sin(p.x*3.4)*sin(p.z*1.8)),30.);col+=vec3(.12,.3,.4)*tiles*.17;}
        col=mix(col,vec3(.18,.065,.018),1.-exp(-t*.035));
      }
      float sun=exp(-length(uv-vec2(0,.025))*23.);col+=vec3(.9,.40,.1)*sun*.7;
      fragColor=vec4(finish(col*uFade,uv,.45),1.);
    }`, 950000);

  room('tidal-satin', 'Tidal Satin', 95,
    'ocean microfacets · rose-gold horizon',
    'The sea has borrowed the sky for a surface. A thousand tiny slopes catch a different piece of the same impossible sunset.',
    'linear-gradient(#201835,#cb7181,#e5b783,#153545,#030a13)', `
    float waves(vec2 p){float v=0.;float a=.5;mat2 m=rot2(.8);for(int i=0;i<5;i++){v+=a*sin(p.x+sin(p.y*.8+uTime*.3))*cos(p.y-uTime*.65);p=m*p*1.9;a*=.47;}return v;}
    vec3 sky(vec3 r){float y=max(r.y,0.);vec3 c=mix(vec3(.48,.19,.18),vec3(.026,.035,.09),smoothstep(0.,.5,y));
      float sun=length(r.xy-vec2(.19,.13));c+=vec3(1.,.68,.32)*exp(-sun*38.)*.7;
      c+=vec3(.12,.045,.09)*fbm2(r.xy*5.+vec2(uTime*.015,0));return c;}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(0,1.8,uTime*.1);vec3 rd=normalize(vec3(uv.x*1.3,uv.y-.02,1.));vec3 col=sky(rd);
      if(rd.y<-.001){float t=-ro.y/rd.y;vec3 p=ro+rd*t;float scale=.75;
        vec2 q=p.xz*scale;float e=.03;float h=waves(q);
        vec3 n=normalize(vec3((h-waves(q+vec2(e,0)))*.27,e,(h-waves(q+vec2(0,e)))*.27));
        vec3 refl=reflect(rd,n);float fres=pow(1.-max(dot(-rd,n),0.),4.);
        col=mix(vec3(.005,.027,.045),sky(refl),.25+.65*fres);
        vec3 ld=normalize(vec3(.19,.13,1.));float spec=pow(max(dot(refl,ld),0.),130.);
        col+=vec3(.95,.55,.20)*spec*.9;
        col=mix(col,vec3(.26,.10,.11),1.-exp(-t*.012));
      }
      fragColor=vec4(finish(col*uFade,uv,.32),1.);
    }`);

  room('kintsugi-earth', 'Kintsugi Earth', 94,
    'porcelain plates · gilded voronoi fractures',
    'A broken planet repaired with light. The fault lines are not a flaw in the material; they are the most valuable thing it has.',
    'linear-gradient(135deg,#e8ddbe,#38566a,#c6912e,#0a1c29)', `
    vec3 cells(vec2 p){vec2 i=floor(p),f=fract(p);float d1=20.,d2=20.,id=0.;
      for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 o=vec2(float(x),float(y));vec2 seed=hash22(i+o);vec2 r=o+seed-f;float d=dot(r,r);
        if(d<d1){d2=d1;d1=d;id=hash12(i+o);}else if(d<d2)d2=d;}
      return vec3(sqrt(d1),sqrt(d2)-sqrt(d1),id);
    }
    void main(){vec2 uv=screenUV();vec2 p=rot2(.14*sin(uTime*.06))*uv*5.5;
      p+=vec2(uTime*.028,0)+uMouse*.12;vec3 c=cells(p);
      float crack=exp(-c.y*90.),halo=exp(-c.y*16.);
      vec3 ceramic=mix(vec3(.035,.075,.10),vec3(.55,.54,.43),step(.58,c.z));
      float grain=fbm2(p*15.);float bevel=smoothstep(0.,.12,c.y);
      vec3 col=ceramic*(.2+.45*bevel)*(.8+.2*grain);
      col+=vec3(1.,.63,.16)*crack*(.5+.5*sin(uTime*.65+c.z*6.));
      col+=vec3(.7,.27,.04)*halo*.12;
      col+=vec3(.35,.55,.6)*pow(max(0.,1.-abs(c.x-.3)*4.),8.)*.025;
      fragColor=vec4(finish(col*uFade,uv,.4),1.);
    }`);

  room('newton-garden', 'Newton Garden', 93,
    'complex dynamics · cubic basins of attraction',
    'Three roots pull on every point in the plane. The boundaries between their kingdoms contain infinitely many smaller versions of the argument.',
    'conic-gradient(#ef945f,#299a9c,#514ba7,#ef945f)', `
    vec2 cmul(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}
    vec2 cdiv(vec2 a,vec2 b){return vec2(dot(a,b),a.y*b.x-a.x*b.y)/max(dot(b,b),.000001);}
    void main(){vec2 uv=screenUV();float T=uTime;vec2 z=rot2(T*.023)*(uv*3.1)+vec2(.10,.04)*sin(T*.09)+uMouse*.12;
      vec2 target=vec2(cos(T*.05),sin(T*.05));float it=0.,trap=9.;
      for(int i=0;i<32;i++){vec2 z2=cmul(z,z),f=cmul(z2,z)-target;float e=dot(f,f);if(e<.000002)break;
        z-=cdiv(f,3.*z2);trap=min(trap,abs(length(z)-.8));it+=1.;}
      float a=atan(z.y,z.x);float root=mod(floor((a-uTime*.05/3.+TAU+PI/3.)/(TAU/3.)),3.);
      vec3 base=root<.5?vec3(.18,.73,.77):(root<1.5?vec3(.76,.24,.12):vec3(.36,.24,.72));
      float contour=.68+.32*cos(it*1.6);float border=smoothstep(4.,20.,it);
      vec3 col=base*(.035+.25*contour)*exp(-it*.045);
      col+=vec3(.9,.64,.35)*exp(-trap*30.)*border*.30;
      col+=vec3(.15,.35,.55)*pow(border,3.)*.16;
      fragColor=vec4(finish(col*uFade,uv,.36),1.);
    }`);

  room('polar-vortex', 'Polar Vortex', 88,
    'gas giant · spiral advection · cloud relief',
    'Weather on a world that has no ground. The eye is a thousand kilometres wide, and the storm has forgotten when it began.',
    'conic-gradient(#124253,#d1a27b,#276d78,#102238,#124253)', `
    float cloud(vec2 p){float r=length(p),a=atan(p.y,p.x);vec2 q=r*vec2(cos(a+r*4.5-uTime*.13),sin(a+r*4.5-uTime*.13));
      return fbm2(q*4.7+vec2(uTime*.035,0));}
    void main(){vec2 uv=screenUV();vec2 p=uv*1.8+uMouse*.05;float r=length(p);float n=cloud(p),e=.006;
      vec2 g=vec2(cloud(p+vec2(e,0))-n,cloud(p+vec2(0,e))-n)/e;
      vec3 normal=normalize(vec3(-g*.20,1.));float dif=max(dot(normal,normalize(vec3(-.4,.65,.8))),0.);
      float spiral=.5+.5*sin(atan(p.y,p.x)*5.+r*24.-uTime*.4+n*8.);
      vec3 c=mix(vec3(.018,.07,.10),vec3(.46,.34,.23),smoothstep(.3,.7,n));
      c=mix(c,vec3(.07,.29,.32),spiral*.25);c*=.16+.85*dif;
      c*=smoothstep(.045,.15,r);c+=vec3(.03,.22,.28)*exp(-abs(r-.15)*50.)*.5;
      c+=vec3(.5,.66,.6)*pow(max(dot(reflect(normalize(vec3(.4,-.65,-.8)),normal),vec3(0,0,1)),0.),22.)*.08;
      fragColor=vec4(finish(c*uFade,uv,.45),1.);
    }`);

  room('entropy-loom', 'Entropy Loom', 90,
    'woven light · anisotropic thread shading',
    'Over, under, over, under. A machine could weave this cloth, but it could never decide what the colours ought to feel like.',
    'linear-gradient(45deg,#03252c,#238b91,#a76094,#ba9553)', `
    void main(){vec2 uv=screenUV();vec2 p=rot2(.32)*uv*28.;p+=vec2(uTime*.07,sin(uTime*.1)*.35);
      p+=vec2(sin(p.y*.13),cos(p.x*.17))*.55;
      vec2 id=floor(p),f=fract(p)-.5;float parity=mod(id.x+id.y,2.);
      float across=parity<.5?f.x:f.y,along=parity<.5?f.y:f.x;
      float profile=sqrt(max(0.,1.-pow(across/.45,2.)));
      float fiber=.83+.17*sin(across*260.+sin(along*25.)*.3);
      vec3 thread=parity<.5?mix(vec3(.02,.20,.22),vec3(.12,.52,.44),.5+.5*sin(id.x*.17)):
        mix(vec3(.20,.045,.14),vec3(.58,.31,.12),.5+.5*cos(id.y*.14));
      float relief=pow(profile,2.)*(.3+.7*(1.-smoothstep(.3,.5,abs(along))));
      vec3 col=thread*(.15+.65*profile)*fiber;
      col+=vec3(.42,.7,.72)*pow(profile,20.)*relief*.16;
      col*=(1.-smoothstep(.39,.5,abs(across)));
      fragColor=vec4(finish(col*uFade,uv,.38),1.);
    }`);

  room('quasicrystal', 'Quasicrystal', 86,
    'aperiodic order · seven interfering lattices',
    'An order that cannot be tiled, a symmetry that cannot repeat. Seven directions of light meet without ever agreeing on a grid.',
    'radial-gradient(#ba9aff,#315ba0,#041526)', `
    float field(vec2 p){float s=0.;for(int j=0;j<7;j++){float a=float(j)*PI/7.;s+=cos(dot(p,vec2(cos(a),sin(a))));}return s/7.;}
    void main(){vec2 uv=screenUV();vec2 p=rot2(uTime*.012)*uv*52.;float v=field(p);float v2=field(p*1.618+uTime*.15);
      float knots=pow(max(0.,v),5.);float line=exp(-abs(v-.18)*80.);
      vec3 col=vec3(.002,.006,.015)+vec3(.03,.12,.2)*pow(abs(v2),2.);
      col+=mix(vec3(.06,.62,.72),vec3(.8,.22,.6),.5+.5*sin(v2*6.+uTime*.1))*line*.4;
      col+=vec3(.9,.72,.4)*knots*1.1;
      col+=vec3(.4,.28,.7)*exp(-abs(v2-.1)*50.)*.08;
      fragColor=vec4(finish(col*uFade,uv,.42),1.);
    }`);

  room('paper-lanterns', 'Paper Lanterns', 85,
    'translucent rice paper · rising emissive forms',
    'A festival on a planet you have not visited. Each light is a wish, each fold is a small shadow, and none of them needs to come back down.',
    'radial-gradient(at 50% 75%,#dc7b24,#71313b,#14132b,#020818)', `
    void main(){vec2 uv=screenUV();vec3 col=vec3(.002,.006,.018);
      col+=vec3(.10,.025,.015)*exp(-length(uv-vec2(0,-.6))*3.);
      for(int i=0;i<24;i++){float fi=float(i),h=hash11(fi*8.7);float sc=mix(.017,.08,h*h);
        vec2 pos=vec2((hash11(fi*3.7)-.5)*1.8,mod(hash11(fi*2.8)+uTime*(.006+.017*h),1.3)-.65);
        pos.x+=sin(uTime*.12+fi)*.025;vec2 p=(uv-pos)/sc;
        p=rot2(.07*sin(uTime*.6+fi))*p;
        vec2 fold=abs(p)*vec2(.85,.62);float d=sqrt(sqrt(dot(fold*fold,fold*fold)));float paper=1.-smoothstep(.97,1.05,d);
        float folds=.7+.3*cos(p.x*10.);float light=exp(-length(p-vec2(0,-.6))*1.8);
        vec3 amber=mix(vec3(.28,.025,.008),vec3(1.,.50,.09),light);
        col+=amber*paper*folds*(.4+h*.7);
        col+=vec3(.8,.19,.025)*exp(-length(p)*1.5)*.07;
        col+=vec3(1.,.82,.35)*exp(-length(p-vec2(0,-.8))*18.)*.8;
      }
      col+=vec3(.5,.65,.85)*starLayer(uv,55.,12.,8.)*.15;
      fragColor=vec4(finish(col*uFade,uv,.4),1.);
    }`);

  room('topographic-dream', 'Topographic Dream', 83,
    'contour cartography · mineral pigments',
    'A map of a country that moves while you read it. The coastlines are ink, the mountains are numbers, and the scale is whatever you need it to be.',
    'linear-gradient(140deg,#dccca6,#6a8b79,#21585c,#0d2635)', `
    float terrain(vec2 p){return fbm2(p)+.18*fbm2(p*2.7+3.);}
    void main(){vec2 uv=screenUV();vec2 p=rot2(.18)*uv*3.+vec2(uTime*.012,-uTime*.007);
      float h=terrain(p),e=.004;vec2 g=vec2(terrain(p+vec2(e,0))-h,terrain(p+vec2(0,e))-h)/e;
      float shade=dot(normalize(vec3(-g*.6,1.)),normalize(vec3(-.5,.7,1.)));
      vec3 pigment=mix(vec3(.018,.07,.09),vec3(.14,.30,.25),smoothstep(.28,.65,h));
      pigment=mix(pigment,vec3(.61,.52,.34),smoothstep(.55,.8,h));
      float contour=1.-smoothstep(.02,.075,abs(fract(h*25.)-.5));
      float coast=exp(-abs(h-.45)*280.);
      vec3 col=pigment*(.35+.65*shade);col*=1.-.45*contour;
      col+=vec3(.66,.65,.4)*coast*.4;
      float paper=hash12(floor(gl_FragCoord.xy));col*=.94+.06*paper;
      fragColor=vec4(finish(col*uFade,uv,.33),1.);
    }`);

  room('eclipse-observatory', 'Eclipse Observatory', 81,
    'occultation · polar streamers · diamond ring',
    'For a moment the daylight has a hole in it. The black is absolute; the corona is not fire, but a field made visible by the absence of everything else.',
    'radial-gradient(#02020a 25%,#fff0bf 26%,#bc744a 28%,#132139 45%,#01050d 75%)', `
    void main(){vec2 uv=screenUV();vec2 p=uv-vec2(.08,.07);float r=length(p),a=atan(p.y,p.x);float R=.205;
      float wave=fbm2(vec2(a*4.,r*20.-uTime*.1));
      float rays=.2+.8*pow(.5+.5*sin(a*28.+wave*8.),5.);
      float outer=max(0.,r-R);float halo=exp(-outer*24.)*smoothstep(R-.002,R+.001,r);
      vec3 col=vec3(.001,.003,.009);
      col+=vec3(.7,.64,.46)*halo*(.16+rays*.65);
      col+=vec3(.22,.35,.6)*exp(-outer*8.)*rays*.07*smoothstep(R,R+.004,r);
      float ring=exp(-abs(r-R)*1800.);col+=vec3(1.,.78,.45)*ring*.7;
      float theta=.45+.08*sin(uTime*.08);vec2 diamond=R*vec2(cos(theta),sin(theta));
      col+=vec3(1.,.9,.68)*exp(-length(p-diamond)*250.)*.95;
      col+=vec3(.7,.75,1.)*starLayer(uv,35.,14.,1.)*.3*smoothstep(R+.05,R+.18,r);
      col*=smoothstep(R-.003,R,r);
      fragColor=vec4(finish(col*uFade,uv,.4),1.);
    }`);

  room('lenticular-orchard', 'Lenticular Orchard', 80,
    'optical ribs · interference lacquer · grazing light',
    'Tilt your head and the colour changes. The surface is made of a thousand miniature lenses, each keeping a different part of the spectrum.',
    'linear-gradient(110deg,#12264b,#51c6c0,#f3c690,#99407c,#101527)', `
    void main(){vec2 uv=screenUV();vec2 p=rot2(-.25)*uv;
      float sweep=p.x+.08*sin(p.y*8.+uTime*.21);float f=fract(sweep*48.);
      float n=sin(f*PI);float fres=pow(1.-n,2.);
      float film=.5+.5*sin(p.y*5.+sweep*8.+uTime*.16+uMouse.x);
      vec3 c=spectrum(film*.55+p.y*.4+uTime*.015);
      c*=.025+.28*pow(n,3.);
      c+=spectrum(film+.34)*pow(n,42.)*.45;
      c+=vec3(.24,.62,.72)*fres*.025;
      float drop=exp(-length((uv-vec2(.18,.04))*vec2(1.,1.3))*4.);c*=.35+.65*drop;
      fragColor=vec4(finish(c*uFade,uv,.38),1.);
    }`);
})(window);
