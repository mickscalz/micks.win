/* Collection V — THE UNBOUNDED. Geometry, atmosphere and chromatic scale.
   Independent shader bodies; no video, image backgrounds or palette-only modes. */
(function(w){
  'use strict';
  function register(n,id,name,tag,blurb,kind,extra){var d={id:id,name:name,edition:5,rank:0,captivation:Math.round((100-n*.45)*100)/100,tag:tag,blurb:blurb,kind:kind,theme:'dark',preview:'assets/previews/'+id+'.webp',art:'linear-gradient(130deg,#0b0733,#dd346b,#08cdd0,#6925d4)'};Object.assign(d,extra);w.D(d);return d;}
  function scene(n,id,name,tag,blurb,frag,budget){return register(n,id,name,tag,blurb,'gl',{frag:frag,pixelBudget:budget||1100000});}
  w.CabinetV={register:register};

  scene(1,'chromatic-expanse','Chromatic Expanse','volumetric flight · incandescent dust · stellar parallax',
    'There is no far wall. Every veil of colour opens onto another, and every bright speck is a distance too large to finish imagining.',`
    void main(){vec2 uv=screenUV();vec3 ro=vec3(uMouse*.22,uTime*.16),rd=normalize(vec3(uv,1.1));vec3 col=vec3(.001,.002,.012);float trans=1.;
      for(int i=0;i<44;i++){float t=.3+float(i)*.15;vec3 p=ro+rd*t;vec3 q=p;q.xy=rot2(p.z*.32+uTime*.04)*q.xy;
        float cloud=fbm3(q*1.35+vec3(0,sin(p.z)*.5,0));float ribbons=exp(-abs(q.y-.7*sin(q.x*1.6+p.z*.8))*5.);float rho=smoothstep(.35,.8,cloud)*ribbons;
        vec3 hue=mix(vec3(.08,.02,.9),vec3(1.4,.035,.22),.5+.5*sin(p.z*.85+q.x));hue=mix(hue,vec3(.015,1.1,1.5),smoothstep(.55,.9,cloud));
        float glow=pow(max(0.,cloud-.35),3.)*14.;col+=trans*hue*(rho*.09+glow*.1);trans*=1.-rho*.055;}
      col+=vec3(.5,.8,1.)*starLayer(uv+ro.xy*.02,66.,16.,3.)*.3;
      col+=vec3(1.,.75,.45)*starLayer(uv*rot2(.06)+vec2(0,uTime*.003),25.,24.,8.)*.5;
      col+=vec3(.12,.5,.9)*exp(-length(uv-vec2(.27,.13))*8.)*.25;fragColor=vec4(finish(col*uFade,uv,.24),1.);
    }`,850000);

  scene(2,'leviathan-gate','Leviathan Gate','monumental distance fields · atmospheric perspective · portal light',
    'An entrance built for something larger than a landscape. The figures at its feet would be mountains, if there were any figures here.',`
    float map(vec3 p){vec3 q=p;float frame=max(abs(length(q.xy-vec2(0,1.1))-2.35)-.19,abs(q.z)-.28);float floorD=p.y+1.4;
      vec3 c=p;c.x=abs(c.x)-2.35;float pillars=sdBox(c-vec3(0,-.15,0),vec3(.2,1.25,.3));return min(floorD,min(frame,pillars));}
    vec3 norm(vec3 p){vec2 e=vec2(.004,0);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(uMouse.x*.7,.25,7.),rd=normalize(vec3(uv.x,uv.y+.08,-1.05));float t=0.;bool hit=false;
      for(int i=0;i<88;i++){float d=map(ro+rd*t);if(d<.003){hit=true;break;}t+=d*.8;if(t>35.)break;}
      vec3 col=vec3(.004,.009,.026);float portal=exp(-length(uv-vec2(0,.1))*2.6);col+=mix(vec3(.06,.02,.3),vec3(.02,.6,.7),.5+.5*sin(uv.y*8.+uTime*.1))*portal*.25;
      if(hit){vec3 p=ro+rd*t,n=norm(p);float light=max(dot(n,normalize(vec3(-.5,1.,1.))),0.);col=vec3(.025,.045,.085)*(.2+light);float seam=pow(.5+.5*cos(p.y*27.),28.);col+=vec3(.05,.8,1.)*seam*exp(-abs(p.z)*5.)*.22;
        if(p.y< -1.38){float lane=pow(.5+.5*cos(p.x*8.),30.);col+=vec3(.08,.6,.8)*lane*exp(-abs(p.x)*.8)*.4;}col=mix(col,vec3(.02,.08,.15),1.-exp(-t*.025));}
      float core=exp(-length(uv-vec2(0,.07))*13.);col+=vec3(.8,.3,.95)*core*.35;fragColor=vec4(finish(col*uFade,uv,.35),1.);
    }`,950000);

  scene(3,'thousand-suns','Thousand Suns','orbital light fields · stellar nurseries · radiant depth',
    'Not one sunrise, but an entire sky of them. Each orbit is a different colour of time.',`
    void main(){vec2 uv=screenUV();vec3 col=vec3(.003,.002,.018);vec2 p=rot2(uTime*.025)*uv;
      for(int i=0;i<28;i++){float f=float(i),a=f*2.39996+uTime*(.025+.003*mod(f,4.)),r=.05+.42*sqrt((f+.5)/28.);vec2 c=vec2(cos(a),sin(a))*r;float d=length(p-c),size=.004+.014*hash11(f*3.7);
        vec3 hue=spectrum(f*.11+uTime*.008)*1.8;col+=hue*(exp(-d*d/(size*size))*.9+exp(-d*25.)*.028);float rays=pow(abs(cos(atan(p.y-c.y,p.x-c.x)*3.+f)),35.);col+=hue*rays*exp(-d*50.)*.1;}
      float n=fbm2(p*5.+uTime*.02);col+=vec3(.16,.025,.28)*pow(n,3.)*.8;col+=vec3(.5,.65,1.)*starLayer(uv,90.,22.,17.)*.13;
      fragColor=vec4(finish(col*uFade,uv,.3),1.);
    }`);

  scene(5,'jade-maelstrom','Jade Maelstrom','submerged spiral · caustic shafts · abyssal scale',
    'Below the last blue, the ocean folds into a green cathedral. The light arrives in long, broken columns.',`
    void main(){vec2 uv=screenUV();vec2 p=uv+vec2(0,.1);float r=length(p),a=atan(p.y,p.x);float depth=1./max(.08,r);vec2 q=vec2(a*2.+depth*.5-uTime*.12,log(r+.02)*3.+uTime*.15);
      float rock=fbm2(q*2.3),ribs=pow(.5+.5*sin(a*15.+depth*.8),6.);vec3 col=mix(vec3(.002,.025,.045),vec3(.015,.3,.24),rock)*(.3+r*.9);
      col+=vec3(.08,.6,.42)*ribs*smoothstep(.05,.4,r)*.24;float rays=pow(.5+.5*sin(uv.x*17.+uv.y*4.+uTime*.07),15.);col+=vec3(.2,.9,.65)*rays*exp(-abs(uv.x)*2.)*smoothstep(-.5,.5,uv.y)*.2;
      col*=smoothstep(.015,.10,r);col+=vec3(.03,.3,.34)*starLayer(uv+vec2(uTime*.002,-uTime*.006),49.,14.,12.)*.13;fragColor=vec4(finish(col*uFade,uv,.3),1.);
    }`);

  scene(6,'iridescent-megastructure','Iridescent Megastructure','repeated city SDF · spectral facades · orbital camera',
    'A city with no street level, extending beyond its own horizon. Every facade is remembering a different sky.',`
    float city(vec3 p){vec2 id=floor((p.xz+1.2)/2.4);vec3 q=p;q.xz=mod(p.xz+1.2,2.4)-1.2;float h=.6+hash12(id)*4.;return min(p.y+1.,sdBox(q-vec3(0,h*.5-1.,0),vec3(.65,h*.5,.65)));}
    vec3 cn(vec3 p){vec2 e=vec2(.003,0);return normalize(vec3(city(p+e.xyy)-city(p-e.xyy),city(p+e.yxy)-city(p-e.yxy),city(p+e.yyx)-city(p-e.yyx)));}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(1.2,2.5+sin(uTime*.12)*.5,uTime*.3),rd=normalize(vec3(uv.x,uv.y-.08,1.2));float t=.05;bool hit=false;
      for(int i=0;i<95;i++){float d=city(ro+rd*t);if(d<.003){hit=true;break;}t+=d*.8;if(t>45.)break;}
      vec3 col=mix(vec3(.12,.02,.19),vec3(.015,.15,.24),uv.y+.5);if(hit){vec3 p=ro+rd*t,n=cn(p);float dif=max(dot(n,normalize(vec3(-1,2,-1))),0.);vec3 hue=spectrum(p.y*.13+dot(n,rd)*.35+uTime*.01);float fres=pow(1.-max(dot(n,-rd),0.),2.);col=mix(vec3(.012,.025,.06),hue*.48,.22+.65*fres)+hue*dif*.1;
        float windows=pow(.5+.5*cos(p.y*22.),14.)*pow(.5+.5*cos((p.x+p.z)*19.),14.);col+=vec3(.3,.9,1.)*windows*.48;float panel=min(abs(sin(p.y*18.)),abs(sin((p.x+p.z)*15.)));col*=.65+.35*smoothstep(.0,.14,panel);col=mix(col,vec3(.16,.06,.28),1.-exp(-t*.04));}
      fragColor=vec4(finish(col*uFade,uv,.25),1.);
    }`,900000);

  scene(8,'plasma-anemone','Plasma Anemone','polar-folded sculpture · soft glow · living filaments',
    'A crown of electricity, breathing in a place without air. The spaces between its limbs are as deliberate as the limbs themselves.',`
    float form(vec3 p){float a=atan(p.z,p.x),r=length(p.xz);float fold=mod(a+PI/12.,TAU/12.)-PI/12.;vec2 q=vec2(cos(fold),sin(fold))*r;
      float spine=.55+.16*sin(p.y*3.+uTime*.6);float arms=length(vec2(q.x-spine,q.y))-(.045+.014*sin(p.y*7.+uTime));arms=max(arms,abs(p.y)-1.);return smin(arms,length(p-vec3(0,-.8,0))-.48,.25);}
    vec3 nn(vec3 p){vec2 e=vec2(.003,0);return normalize(vec3(form(p+e.xyy)-form(p-e.xyy),form(p+e.yxy)-form(p-e.yxy),form(p+e.yyx)-form(p-e.yyx)));}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(2.4,1.2,3.5),rd=normalize(lookAt(ro,vec3(0),vec3(0,1,0))*vec3(uv,1.25));float t=0.,glow=0.;bool hit=false;
      for(int i=0;i<84;i++){vec3 p=ro+rd*t;p.xz=rot2(uTime*.1)*p.xz;float d=form(p);glow+=exp(-abs(d)*35.)*.006;if(d<.002){hit=true;break;}t+=d*.7;if(t>8.)break;}
      vec3 col=vec3(.005,.002,.018)+vec3(.3,.04,.65)*glow;if(hit){vec3 p=ro+rd*t;p.xz=rot2(uTime*.1)*p.xz;vec3 n=nn(p);float f=pow(1.-max(dot(n,-rd),0.),2.);col=spectrum(p.y*.26+uTime*.03)*(.2+f*.9);col+=vec3(.05,.6,1.)*pow(.5+.5*sin(p.y*18.-uTime*2.),16.)*.3;}
      fragColor=vec4(finish(col*uFade,uv,.4),1.);
    }`,950000);

  scene(9,'impossible-ocean','Impossible Ocean','folded wave relief · metallic tides · impossible horizon',
    'An ocean that has forgotten which direction is down. Waves climb into the sky without ever quite leaving the water.',`
    float sea(vec2 p){return sin(p.x*3.+sin(p.y*2.+uTime*.3))* .35+sin(p.y*4.-uTime*.4)*.16;}
    void main(){vec2 uv=screenUV();vec2 p=rot2(.18*sin(uTime*.1))*uv;float k=1./max(.12,abs(p.y+.12));vec2 q=vec2(p.x*k,k*.4+uTime*.12);float e=.005;vec3 n=normalize(vec3(sea(q-vec2(e,0))-sea(q+vec2(e,0)),.012,sea(q-vec2(0,e))-sea(q+vec2(0,e))));
      float dif=max(dot(n,normalize(vec3(-.5,1.,-.3))),0.),spec=pow(max(dot(n,normalize(vec3(.2,1.,.1))),0.),28.);vec3 col=mix(vec3(.008,.004,.08),vec3(.015,.25,.4),dif);col+=vec3(1.,.45,.21)*spec*.4;
      col=mix(col,vec3(.25,.08,.3),exp(-abs(p.y+.12)*20.)*.65);col+=spectrum(q.x*.15)*pow(.5+.5*sin(q.x*18.+sea(q)*3.),20.)*.04;
      fragColor=vec4(finish(col*uFade,uv,.25),1.);
    }`);

  scene(11,'heliosphere','Heliosphere','stellar plasma · limb scattering · chromatic prominences',
    'A sun seen close enough to have weather. The bright surface is only the beginning of how far its influence reaches.',`
    void main(){vec2 uv=screenUV();vec2 p=uv-vec2(.10,.04);float r=length(p),R=.32;vec3 col=vec3(.01,.002,.022);float corona=exp(-max(0.,r-R)*17.);float a=atan(p.y,p.x);
      float loops=pow(.5+.5*sin(a*23.+fbm2(p*12.+uTime*.04)*8.-uTime*.3),5.);col+=mix(vec3(1.,.06,.025),vec3(.45,.015,.6),.5+.5*sin(a*2.))*(corona*.35+loops*corona*.14);
      if(r<R){vec3 n=vec3(p/R,sqrt(max(0.,1.-r*r/(R*R))));float cloud=fbm3(n*9.+vec3(0,uTime*.09,0));vec3 hot=mix(vec3(.7,.015,.06),vec3(1.4,.65,.08),smoothstep(.25,.8,cloud));col=hot*(.4+.6*n.z);col+=vec3(.5,.1,.8)*pow(cloud,5.);}
      col+=vec3(.2,.3,.65)*starLayer(uv,55.,22.,11.)*.08;fragColor=vec4(finish(col*uFade,uv,.35),1.);
    }`);

  scene(12,'crystal-dunes','Crystal Dunes','faceted terrain · cyan reflections · fractured crests',
    'The desert has crystallised in mid-storm. Its dunes are cutting the dawn into pieces small enough to carry.',`
    float heightAt(vec2 p){vec2 id=floor(p);vec2 f=fract(p);float a=hash12(id)*.7,b=hash12(id+vec2(1,0))*.7,c=hash12(id+vec2(0,1))*.7,d=hash12(id+1.)*.7;return f.x+f.y<1.?a+(b-a)*f.x+(c-a)*f.y:d+(c-d)*(1.-f.x)+(b-d)*(1.-f.y);}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(.3,1.15,uTime*.14),rd=normalize(vec3(uv.x,uv.y-.12,1.));float t=.1;bool hit=false;
      for(int i=0;i<100;i++){vec3 p=ro+rd*t;float d=p.y-heightAt(p.xz);if(d<.003){hit=true;break;}t+=max(.015,d*.35);if(t>30.)break;}
      vec3 col=mix(vec3(.09,.025,.24),vec3(.35,.1,.22),exp(-abs(rd.y)*5.));if(hit){vec3 p=ro+rd*t;float e=.005;vec3 n=normalize(vec3(heightAt(p.xz-vec2(e,0))-heightAt(p.xz+vec2(e,0)),2.*e,heightAt(p.xz-vec2(0,e))-heightAt(p.xz+vec2(0,e))));float dif=max(dot(n,normalize(vec3(-1,1,-.5))),0.);col=mix(vec3(.015,.08,.16),vec3(.05,.65,.66),dif);col+=vec3(1.,.35,.22)*pow(max(dot(n,normalize(vec3(.3,1.,-.3))),0.),30.)*.55;col=mix(col,vec3(.22,.06,.29),1.-exp(-t*.04));}
      fragColor=vec4(finish(col*uFade,uv,.3),1.);
    }`,900000);

  scene(14,'velvet-vortex','Velvet Vortex','anisotropic folds · logarithmic drapery · luminous dye',
    'A whirlpool made from fabric, not water. The deeper folds are darker than night; the raised threads catch every colour it leaves behind.',`
    void main(){vec2 uv=screenUV(),p=uv-uMouse*.04;float r=length(p),a=atan(p.y,p.x);float fold=a*7.+log(r+.025)*8.-uTime*.45;float h=.5+.5*sin(fold+sin(a*3.-uTime*.1)*.7);
      vec3 col=spectrum(a/TAU+log(r+.1)*.12+uTime*.018)*(.04+.6*pow(h,3.));float silk=pow(max(0.,sin(fold+.6)),28.);col+=mix(vec3(.9,.12,.4),vec3(.12,.6,1.),.5+.5*sin(a))*silk*.4;
      col*=smoothstep(.008,.07,r);col+=vec3(.15,.02,.3)*exp(-r*8.)*.15;fragColor=vec4(finish(col*uFade,uv,.3),1.);
    }`);

  scene(15,'lanternfish-ocean','Lanternfish Ocean','layered shoals · translucent fins · bioluminescent wake',
    'A thousand small lights have agreed to move together. The ocean is large enough to keep their secret.',`
    void main(){vec2 uv=screenUV();vec3 col=vec3(.002,.009,.03);for(int l=0;l<4;l++){float f=float(l),scale=7.+f*3.;vec2 p=uv*scale+vec2(uTime*(.12+f*.045),f*9.);vec2 id=floor(p),q=fract(p)-.5;vec2 off=(hash22(id+f)-.5)*.55;q-=off;q.y+=sin(q.x*10.+uTime*3.+hash12(id)*TAU)*.015;
        float body=length(q/vec2(.13,.042));float fish=exp(-body*body*2.);float tail=exp(-abs(q.y)*100.)*exp(-abs(q.x+.18)*22.);vec3 hue=mix(vec3(.03,.7,.95),vec3(.9,.15,.55),hash12(id+f));col+=hue*(fish*.38+tail*.08)/(1.+f*.6);
        col+=vec3(.5,.9,1.)*exp(-length(q-vec2(.08,.01))*180.)*.3/(1.+f);}
      col+=vec3(.015,.1,.17)*exp(-length(uv-vec2(.2,.45))*3.);fragColor=vec4(finish(col*uFade,uv,.35),1.);
    }`);

  scene(17,'electric-glacier','Electric Glacier','traced ice canyon · subsurface seams · polar radiance',
    'Something is conducting lightning through a glacier. The canyon is a circuit, the ice a slow blue flame.',`
    float walls(vec3 p){float wave=.17*sin(p.z*.8+sin(p.y*2.));return min(p.y+1.1,(.6+wave+.12*sin(p.y*5.+p.z))-abs(p.x));}
    vec3 normalAt(vec3 p){vec2 e=vec2(.003,0);return normalize(vec3(walls(p+e.xyy)-walls(p-e.xyy),walls(p+e.yxy)-walls(p-e.yxy),walls(p+e.yyx)-walls(p-e.yyx)));}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(0,.1,uTime*.35),rd=normalize(vec3(uv,1.));float t=.02;bool hit=false;
      for(int i=0;i<90;i++){float d=walls(ro+rd*t);if(d<.003){hit=true;break;}t+=d*.55;if(t>25.)break;}
      vec3 col=vec3(.02,.1,.19);if(hit){vec3 p=ro+rd*t,n=normalAt(p);float dif=max(dot(n,normalize(vec3(-.4,1.,-.6))),0.);col=vec3(.025,.18,.29)*(.3+.8*dif);float vein=abs(sin(p.y*7.+fbm2(p.yz*2.)*8.));col+=vec3(.08,.8,1.1)*exp(-vein*35.)*(.5+.5*sin(p.z-uTime));col+=vec3(.5,.15,.8)*pow(1.-abs(dot(n,rd)),3.)*.3;col=mix(col,vec3(.02,.2,.32),1.-exp(-t*.07));}
      fragColor=vec4(finish(col*uFade,uv,.25),1.);
    }`,900000);

  scene(18,'bubble-cathedral','Bubble Cathedral','spherical vaults · spectral shells · deep perspective',
    'A building made from the thinnest possible walls. Each room contains another sky, each reflection another impossible room.',`
    void main(){vec2 uv=screenUV();vec3 col=vec3(.003,.006,.025);for(int i=0;i<18;i++){float f=float(i),z=1.5+mod(f*.75-uTime*.16,12.);vec2 center=vec2(sin(f*2.4),cos(f*1.7))*.9/z;float radius=(.36+.2*hash11(f))/z;vec2 q=uv-center;float r=length(q)/radius;
        float shell=exp(-abs(r-1.)*65.);float inside=1.-smoothstep(.9,1.,r);vec3 tint=spectrum(atan(q.y,q.x)/TAU+r*.8+uTime*.02+f*.07);col+=tint*(shell*.7+inside*.025)/(1.+z*.1);
        col+=vec3(.5,.8,1.)*exp(-length(q-vec2(-.25,.3)*radius)*120./max(radius,.02))*.1;}
      fragColor=vec4(finish(col*uFade,uv,.35),1.);
    }`);

  scene(20,'endless-causeway','Endless Causeway','infinite steps · floating treads · vanishing light',
    'A path across a universe that has not yet decided whether to have a ground. The next step is always lit before you reach it.',`
    float map(vec3 p){vec3 q=p;q.z=mod(p.z+uTime*.22,1.6)-.8;float tread=sdBox(q-vec3(0,-.7,0),vec3(1.1,.09,.48));return tread;}
    vec3 norm(vec3 p){vec2 e=vec2(.003,0);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(.25,.65,-2.),rd=normalize(vec3(uv.x,uv.y-.12,1.));float t=.02;bool hit=false;for(int i=0;i<95;i++){float d=map(ro+rd*t);if(d<.002){hit=true;break;}t+=d*.85;if(t>40.)break;}
      vec3 col=vec3(.012,.004,.035)+vec3(.19,.035,.24)*exp(-length(uv-vec2(0,.1))*4.);if(hit){vec3 p=ro+rd*t,n=norm(p);col=spectrum(p.z*.08+uTime*.012)*(.1+.25*max(n.y,0.));float edge=exp(-abs(abs(p.x)-1.08)*130.);col+=vec3(.1,.9,1.)*edge*.8;col=mix(col,vec3(.12,.025,.2),1.-exp(-t*.05));}
      col+=vec3(.45,.6,1.)*starLayer(uv,55.,19.,23.)*.17;fragColor=vec4(finish(col*uFade,uv,.3),1.);
    }`,1000000);

  scene(21,'spore-universe','Spore Universe','fractal mist · emissive density · cosmic spores',
    'A universe small enough to drift on a breath, large enough to lose yourself in. Scale is only an agreement the light has stopped keeping.',`
    void main(){vec2 uv=screenUV();vec3 ro=vec3(0,0,uTime*.12),rd=normalize(vec3(uv,1.2));vec3 col=vec3(.002,.004,.02);float tr=1.;
      for(int i=0;i<38;i++){vec3 p=ro+rd*(.1+float(i)*.14);vec3 q=p;for(int j=0;j<3;j++){q=abs(q)/max(dot(q,q),.28)-vec3(.7,.9,.6);q.xy=rot2(.45+uTime*.012)*q.xy;}
        float density=fbm3(p*2.);float d=exp(-length(q)*3.5)*.12*density*density;vec3 hue=spectrum(p.z*.13+p.x*.3+p.y*.2+length(q)*.1);col+=tr*hue*d*1.5;tr*=exp(-d*1.8);}
      col+=vec3(.4,.7,1.)*starLayer(uv,78.,24.,7.)*.16;fragColor=vec4(finish(col*uFade,uv,.25),1.);
    }`,900000);

  scene(23,'mosaic-mirage','Mosaic Mirage','warped tessellation · metallic relief · chromatic phase',
    'A million tiny mirrors, each tilted toward a different dream. Move, and the entire mosaic changes its allegiance.',`
    void main(){vec2 uv=screenUV();vec2 p=uv*24.;p+=vec2(sin(p.y*.3+uTime*.3),cos(p.x*.25-uTime*.2))*1.2;vec2 id=floor(p),q=fract(p)-.5;float a=hash12(id)*TAU+uTime*.1;q=rot2(a)*q;
      float bevel=pow(max(0.,1.-max(abs(q.x),abs(q.y))*2.),.3);vec3 hue=spectrum(id.x*.035+id.y*.028+uTime*.02);float face=.3+.7*max(0.,dot(normalize(vec3(q*.9,bevel+.05)),normalize(vec3(-.6,.8,1.))));
      float grout=smoothstep(0.,.06,.5-max(abs(fract(p).x-.5),abs(fract(p).y-.5)));vec3 col=hue*face*grout*.65;col+=vec3(.45,.8,1.)*pow(bevel,24.)*.16;fragColor=vec4(finish(col*uFade,uv,.2),1.);
    }`);

  scene(24,'polar-roses','Polar Roses','lobed porcelain · spectral lacquer · orbiting sculpture',
    'A flower carved from the reflection of a flower. Its petals turn slowly enough for the colours to flow like weather.',`
    float rose(vec3 p){float r=length(p);float a=atan(p.z,p.x),b=atan(p.y,length(p.xz));return r-(.75+.17*cos(a*8.+uTime*.25)*cos(b*5.));}
    vec3 rn(vec3 p){vec2 e=vec2(.002,0);return normalize(vec3(rose(p+e.xyy)-rose(p-e.xyy),rose(p+e.yxy)-rose(p-e.yxy),rose(p+e.yyx)-rose(p-e.yyx)));}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(1.8,.8,3.1),rd=normalize(lookAt(ro,vec3(0),vec3(0,1,0))*vec3(uv,1.3));float t=0.;bool hit=false;for(int i=0;i<88;i++){float d=rose(ro+rd*t);if(d<.0015){hit=true;break;}t+=d*.42;if(t>7.)break;}
      vec3 col=vec3(.009,.003,.023);if(hit){vec3 p=ro+rd*t,n=rn(p);float fres=pow(1.-max(dot(n,-rd),0.),3.);col=spectrum(p.y*.3+atan(p.z,p.x)/TAU+uTime*.02)*(.16+.65*fres);col+=vec3(.7,.9,1.)*pow(max(dot(reflect(rd,n),normalize(vec3(-1,2,3))),0.),45.)*.7;}
      fragColor=vec4(finish(col*uFade,uv,.35),1.);
    }`,950000);

  scene(26,'solar-sails','Solar Sails','ray-plane facets · translucent membranes · celestial rigging',
    'A fleet sailing on light alone. The sails are wide enough to throw shadows across worlds that have not been named.',`
    void main(){vec2 uv=screenUV();vec3 col=vec3(.003,.007,.025);for(int i=0;i<12;i++){float f=float(i),z=1.5+mod(f*.8-uTime*.07,8.);vec2 center=vec2(sin(f*2.4),cos(f*1.7))*.8/z;vec2 p=rot2(f*.8+uTime*.04)*(uv-center)*z;
        float shape=max(abs(p.x)*.75+p.y*.5,-p.y)-.32;float sail=1.-smoothstep(-.006,.006,shape);float fold=abs(p.x)+p.y*.3;vec3 hue=spectrum(f*.13+uTime*.01);col+=hue*sail*(.12+.25*pow(.5+.5*cos(fold*12.),3.))/(1.+z*.08);col+=vec3(.4,.7,.9)*exp(-abs(shape)*280.)*.12;}
      col+=vec3(.4,.65,1.)*starLayer(uv,60.,22.,2.)*.12;fragColor=vec4(finish(col*uFade,uv,.3),1.);
    }`);

  scene(27,'liquid-spectrum','Liquid Spectrum','domain advection · pigment boundaries · marbled radiance',
    'Colour becomes a liquid, then a current, then an entire climate. Nothing here is still long enough to become a pattern twice.',`
    void main(){vec2 uv=screenUV(),p=uv*3.;vec2 q=vec2(fbm2(p+uTime*.045),fbm2(p+vec2(4.2,-uTime*.036)));vec2 r=vec2(fbm2(p+q*3.+vec2(1.7,9.2)),fbm2(p+q*3.+vec2(8.3,2.8)));float f=fbm2(p+r*4.);
      vec3 col=mix(vec3(.025,.008,.18),vec3(.012,.25,.48),smoothstep(.18,.65,f));col=mix(col,vec3(.6,.012,.25),smoothstep(.42,.8,r.x));col=mix(col,vec3(1.,.56,.07),pow(q.y,3.)*.7);
      float lines=pow(.5+.5*cos(f*75.+r.x*10.),18.);col+=spectrum(f+r.y)*lines*.045;fragColor=vec4(finish(col*uFade,uv,.2),1.);
    }`);

  scene(29,'desert-of-glass','Desert of Glass','pyramid field · mirrored facets · alien sunset',
    'The pyramids continue after the sun has run out of names for them. Every face is a different fragment of the last sunset.',`
    float field(vec3 p){vec2 id=floor((p.xz+1.5)/3.);vec3 q=p;q.xz=mod(p.xz+1.5,3.)-1.5;float h=.7+hash12(id)*1.2;float pyr=max((abs(q.x)+abs(q.z))*.7+p.y*.6-h*.5,-p.y-.8);return min(p.y+.8,pyr);}
    vec3 pn(vec3 p){vec2 e=vec2(.003,0);return normalize(vec3(field(p+e.xyy)-field(p-e.xyy),field(p+e.yxy)-field(p-e.yxy),field(p+e.yyx)-field(p-e.yyx)));}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(1.5,1.4,uTime*.25),rd=normalize(vec3(uv.x,uv.y-.05,1.));float t=.03;bool hit=false;for(int i=0;i<100;i++){float d=field(ro+rd*t);if(d<.003){hit=true;break;}t+=d*.6;if(t>32.)break;}
      vec3 col=mix(vec3(.08,.015,.18),vec3(.55,.09,.13),exp(-abs(rd.y)*5.));if(hit){vec3 p=ro+rd*t,n=pn(p);float k=dot(reflect(rd,n),normalize(vec3(-1,.8,.4)));col=spectrum(n.x*.2+n.z*.3+p.y*.04+uTime*.01)*(.18+.3*max(n.y,0.));col+=vec3(1.,.45,.18)*pow(max(k,0.),25.)*.7;col=mix(col,vec3(.27,.035,.19),1.-exp(-t*.05));}
      fragColor=vec4(finish(col*uFade,uv,.28),1.);
    }`,950000);

  scene(30,'fire-opal','Fire Opal','internal mineral fire · spherical volume · chromatic inclusions',
    'A stone with a sunset trapped inside it. Turn it once and the sunset becomes an ocean. Turn it again and neither has ever existed.',`
    void main(){vec2 uv=screenUV();vec3 ro=vec3(0,0,3.),rd=normalize(vec3(uv,-1.35));float b=dot(ro,rd),h=b*b-dot(ro,ro)+.8*.8;vec3 col=vec3(.009,.002,.018);
      if(h>0.){float near=-b-sqrt(h),far=-b+sqrt(h),stepSize=(far-near)/32.,tr=1.;vec3 sum=vec3(0);for(int i=0;i<32;i++){vec3 p=ro+rd*(near+(float(i)+.5)*stepSize);p=rotY(uTime*.12)*p;float n=fbm3(p*6.);float flake=pow(.5+.5*sin(n*35.+p.z*4.),12.);vec3 hue=spectrum(n*1.3+p.y*.3+uTime*.02);float rho=.08+flake*.65;sum+=tr*hue*rho*stepSize*1.9;tr*=exp(-rho*stepSize*2.);}
        vec3 n=normalize(ro+rd*near);float f=pow(1.-max(dot(n,-rd),0.),4.);col=sum+vec3(.2,.32,.48)*f;col+=vec3(1.,.7,.4)*pow(max(dot(reflect(rd,n),normalize(vec3(-1,2,3))),0.),70.)*.4;}
      fragColor=vec4(finish(col*uFade,uv,.35),1.);
    }`,850000);

  scene(32,'laser-aviary','Laser Aviary','swept light planes · spectral rigging · haze depth',
    'Light has learned to leave trails through the dark. The trails have learned to make rooms.',`
    float segment(vec2 p,vec2 a,vec2 b){vec2 q=p-a,v=b-a;return length(q-v*clamp(dot(q,v)/max(dot(v,v),.0001),0.,1.));}
    void main(){vec2 uv=screenUV();vec3 col=vec3(.006,.002,.025);for(int i=0;i<28;i++){float f=float(i),z=1.+mod(f*.23+uTime*.08,6.);float a=f*2.4+uTime*.12;vec2 c=vec2(cos(a),sin(a))*.65/z,other=vec2(cos(a+1.8),sin(a+1.8))*.65/z;float d=segment(uv,c,other);vec3 hue=spectrum(f*.08+uTime*.02);col+=hue*(exp(-d*900.)*.6+exp(-d*65.)*.045)/(1.+z*.2);}
      col+=vec3(.3,.015,.28)*fbm2(uv*4.+uTime*.02)*.12;fragColor=vec4(finish(col*uFade,uv,.3),1.);
    }`);

  scene(35,'chromatic-weather','Chromatic Weather','billowing density · polar illumination · vast cloud strata',
    'Weather on a planet where the sky has more colours than the ground has names. The storm is moving too slowly to know that it is beautiful.',`
    void main(){vec2 uv=screenUV();vec2 p=uv*3.;p.x+=uTime*.035;float n=fbm2(p+vec2(fbm2(p*.7-uTime*.025)*2.,0));float cloud=smoothstep(.32,.76,n);float e=.012;vec2 grad=vec2(fbm2(p+vec2(e,0))-fbm2(p-vec2(e,0)),fbm2(p+vec2(0,e))-fbm2(p-vec2(0,e)))/(2.*e);float light=.5+.5*dot(normalize(vec3(grad,1.)),normalize(vec3(-1,1,1)));
      vec3 col=mix(vec3(.025,.012,.13),vec3(.05,.35,.6),uv.y+.5);vec3 plume=mix(vec3(.8,.04,.2),vec3(.03,.75,.65),smoothstep(.2,.8,n));plume=mix(plume,vec3(.9,.42,.1),pow(light,5.)*.6);col=mix(col,plume*(.2+light*.65),cloud);
      col+=vec3(.4,.3,.8)*exp(-abs(n-.5)*60.)*.1;fragColor=vec4(finish(col*uFade,uv,.2),1.);
    }`);

  scene(38,'golden-abyss','Golden Abyss','logarithmic architecture · gilded ribs · falling perspective',
    'The bottom is always one more horizon away. Gold turns to amber, amber to darkness, and darkness opens again.',`
    void main(){vec2 uv=screenUV(),p=uv+uMouse*.035;float r=length(p),a=atan(p.y,p.x),z=-log(r+.004)*2.-uTime*.25;vec2 q=vec2(a/TAU*28.,z*2.);vec2 id=floor(q),f=fract(q)-.5;float frame=min(abs(f.x)-.36,abs(f.y)-.36);float edge=exp(-abs(frame)*100.);float ridge=pow(.5+.5*cos(a*28.),20.);vec3 col=vec3(.01,.003,.009);
      col+=vec3(.6,.25,.035)*edge*(.2+smoothstep(.0,.4,r));col+=vec3(1.,.55,.12)*ridge*.12;col+=vec3(.25,.025,.08)*hash12(id)*smoothstep(.0,.3,r)*.13;
      col*=smoothstep(.003,.045,r);fragColor=vec4(finish(col*uFade,uv,.4),1.);
    }`);
})(window);
