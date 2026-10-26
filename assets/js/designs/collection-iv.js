/* Collection IV — light as matter. Original analytic / distance-field studies.
   Register releases by edition; catalogue.js owns every displayed rank. */
(function(w){
  'use strict';
  function room(id,name,score,tag,blurb,frag,budget,theme){
    w.D({id:id,name:name,edition:4,rank:0,captivation:score,tag:tag,blurb:blurb,
      kind:'gl',pixelBudget:budget||1200000,theme:theme||'dark',
      art:'linear-gradient(140deg,#061023,#2a6b85,#b67caa,#080b19)',
      preview:'assets/previews/'+id+'.webp',frag:frag});
  }
  room('glass-meridian','Glass Meridian',99,'convex optics · internal reflection · spectral dispersion',
    'A wedge of nothing, dividing the room into colours. Move around it and the far side of the world arrives by a different route.',`
    vec3 planeN(int i){if(i==0)return vec3(0,0,1);if(i==1)return vec3(0,0,-1);if(i==2)return vec3(0,-1,0);if(i==3)return vec3(.866,.5,0);return vec3(-.866,.5,0);}
    float planeK(int i){return i<2?.32:(i==2?.72:.64);}
    vec2 clipPrism(vec3 ro,vec3 rd,out vec3 en,out vec3 ex){float lo=-1.e4,hi=1.e4;en=vec3(0);ex=vec3(0);
      for(int i=0;i<5;i++){vec3 n=planeN(i);float d=dot(rd,n),v=planeK(i)-dot(ro,n);if(abs(d)<.00001){if(v<0.)return vec2(1,-1);}else{float t=v/d;if(d<0.&&t>lo){lo=t;en=n;}if(d>0.&&t<hi){hi=t;ex=n;}}}return vec2(lo,hi);}
    vec3 studio(vec3 p,vec3 r){vec3 col=vec3(.012,.018,.032);float t=( -1.25-p.y)/r.y;
      if(t>0.){vec3 q=p+r*t;float lines=pow(.5+.5*cos(q.x*3.+q.z*.6),18.);col=vec3(.035,.045,.06)+spectrum(q.x*.16+q.z*.06)*lines*.28;col*=exp(-length(q.xz)*.055);}
      float strip=pow(max(0.,1.-abs(r.x+.24*sin(uTime*.08))),65.);col+=vec3(.6,.8,1.)*strip*pow(max(r.y,0.),.4)*1.8;
      col+=spectrum(atan(r.x,r.z)/TAU+uTime*.02)*pow(max(0.,r.y),2.)*.45;return col;}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(.12,.1,4.2),rd=normalize(vec3(uv, -1.35));mat3 M=rotY(.38+uTime*.1+uMouse.x*.28)*rotZ(.12);
      vec3 o=M*ro,d=M*rd,n0,n1;vec2 hit=clipPrism(o,d,n0,n1);vec3 col=studio(ro,rd);
      if(hit.x>0.&&hit.y>hit.x){vec3 p=o+d*hit.x;vec3 reflected=studio(ro+rd*hit.x,transpose(M)*reflect(d,n0));vec3 glass=vec3(0);
        for(int c=0;c<3;c++){float ior=1.44+float(c)*.045;vec3 inside=refract(d,n0,1./ior);vec3 a,b;vec2 back=clipPrism(p+inside*.002,inside,a,b);vec3 end=p+inside*(back.y+.002);vec3 ray=refract(inside,-b,ior);
          if(dot(ray,ray)<.001)ray=reflect(inside,-b);vec3 seen=studio(transpose(M)*end,transpose(M)*ray);glass[c]=seen[c]*exp(-back.y*.025);}
        float f=.035+.965*pow(1.-max(dot(-d,n0),0.),5.);col=mix(glass,reflected,f);float edge=min(hit.y-hit.x,1.);col+=vec3(.18,.38,.55)*exp(-edge*70.)*.6;}
      fragColor=vec4(finish(col*uFade,uv,.35),1.);
    }`,1100000);

  room('dune-nocturne','Dune Nocturne',98,'height-field tracing · wind combs · blue-hour sand',
    'The wind has written the same sentence for a million years. Tonight the dunes are reading it back in silver.',`
    float land(vec2 p){return .18*sin(p.x*.9+p.y*.34)+.23*sin(p.x*.43-p.y*.6)+.07*sin(p.x*1.8+p.y*.6);}
    float field(vec3 p){return p.y-land(p.xz);}
    vec3 normalAt(vec3 p){float e=.015;return normalize(vec3(land(p.xz-vec2(e,0))-land(p.xz+vec2(e,0)),2.*e,land(p.xz-vec2(0,e))-land(p.xz+vec2(0,e))));}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(uMouse.x*.4,.65,uTime*.15),rd=normalize(vec3(uv.x,uv.y-.1,1.));float t=.1;bool hit=false;
      for(int i=0;i<100;i++){float h=field(ro+rd*t);if(h<.004){hit=true;break;}t+=max(.025,h*.55);if(t>45.)break;}
      vec3 col=mix(vec3(.008,.014,.045),vec3(.08,.12,.2),exp(-abs(rd.y)*7.));
      float moon=length(uv-vec2(.38,.25));col+=vec3(.55,.72,.95)*(1.-smoothstep(.035,.037,moon));col+=vec3(.2,.3,.55)*exp(-moon*17.)*.15;
      col+=vec3(.5,.65,1.)*starLayer(uv,45.,16.,22.)*.08;
      if(hit){vec3 p=ro+rd*t,n=normalAt(p);float dif=max(dot(n,normalize(vec3(-.7,.38,-.25))),0.);float comb=.5+.5*sin(p.x*65.+p.z*12.+land(p.xz)*8.);
        float slope=1.-max(n.y,0.);col=mix(vec3(.008,.018,.045),vec3(.09,.13,.21),dif);col*=.8+.2*comb;col+=vec3(.15,.25,.38)*pow(slope,2.);col=mix(col,vec3(.04,.07,.12),1.-exp(-t*.025));}
      fragColor=vec4(finish(col*uFade,uv,.3),1.);
    }`,1000000);

  room('rain-on-elsewhere','Rain on Elsewhere',97,'curved droplets · refracted bokeh · night glass',
    'A city dissolves on the other side of a window. Every drop holds a smaller city, upside down and almost close enough to touch.',`
    vec3 city(vec2 p){vec3 col=mix(vec3(.018,.013,.025),vec3(.008,.022,.04),smoothstep(-.4,.4,p.y));
      for(int i=0;i<32;i++){float f=float(i);vec2 q=vec2((hash11(f*8.1)-.5)*2.,(hash11(f*7.8)-.5)*.9);float r=.014+hash11(f+33.)*.052;vec2 d=p-q;d.x*=1.2;
        float disk=exp(-dot(d,d)/(r*r)*1.7);vec3 hue=mix(vec3(.1,.5,.8),vec3(1.,.21,.055),hash11(f*4.));col+=hue*disk*(.3+.65*hash11(f+2.));col+=hue*exp(-length(d)*13.)*.018;}return col;}
    void main(){vec2 uv=screenUV();vec2 bend=vec2(0);float shine=0.;
      for(int l=0;l<2;l++){float f=float(l),sc=12.+f*9.;vec2 p=uv*sc+vec2(f*8.,uTime*(.24+f*.15));vec2 cell=floor(p),q=fract(p)-.5;vec2 off=(hash22(cell+f)-.5)*.65;q-=off;float r=.08+hash12(cell)*.12;
        float d=length(q*vec2(1.,.75));float mask=1.-smoothstep(r*.8,r,d);bend+=q*mask*.22;shine+=exp(-length(q-vec2(-r*.3,r*.35))*65.)*mask*.045;
        float tail=exp(-abs(q.x)*90.)*smoothstep(-.35,-.1,q.y)*(1.-smoothstep(-.12,.1,q.y));bend.x+=tail*.003;}
      vec3 col=city(uv+bend+uMouse*.015);col+=vec3(.48,.75,.9)*shine;
      col+=vec3(.07,.13,.17)*pow(.5+.5*sin(uv.y*3.+uTime*.1),3.)*.04;
      fragColor=vec4(finish(col*uFade,uv,.3),1.);
    }`);

  room('cloisonne-sky','Cloisonné Sky',96,'rose-window geometry · enamel cells · transmitted light',
    'A window with no wall around it. Each small chamber of colour borrows its brightness from a sun you cannot see.',`
    void main(){vec2 uv=screenUV(),p=rot2(uTime*.025)*uv;float r=length(p),a=atan(p.y,p.x);float sector=TAU/12.,fold=abs(mod(a+sector*.5,sector)-sector*.5);vec2 q=vec2(cos(fold),sin(fold))*r;
      float band=floor(r*7.);float petal=abs(length(vec2((q.x-.24)/.21,q.y/.055))-1.)*.025;
      float seam=min(petal,abs(r-.105));seam=min(seam,abs(r-.43));
      if(r>.36)seam=min(seam,abs(sin(a*12.))*r*.2);
      vec3 enamel=spectrum(band*.12+floor((a+PI)/sector)*.11+uTime*.012);
      enamel=mix(enamel,vec3(.012,.05,.12),.18);float grain=vnoise2(p*180.);vec3 col=enamel*(.25+.13*grain);
      col=mix(vec3(.016,.021,.025),col,smoothstep(.0015,.0045,seam));col+=vec3(.28,.18,.055)*exp(-abs(seam-.002)*1100.)*.2;
      col*=1.-smoothstep(.45,.47,r);col+=vec3(.006,.009,.018);col+=vec3(.7,.48,.13)*exp(-abs(r-.465)*1200.)*.5;
      fragColor=vec4(finish(col*uFade,uv,.2),1.);
    }`);

  room('amber-reliquary','Amber Reliquary',94,'ellipsoid volume · suspended filaments · warm extinction',
    'A little piece of an ancient afternoon, sealed before there were names for afternoons. Something is still turning inside.',`
    void main(){vec2 uv=screenUV();vec3 ro=vec3(0,0,3.2),rd=normalize(vec3(uv,-1.35));mat3 m=rotY(uTime*.11)*rotZ(.2);vec3 o=m*ro,d=m*rd;
      vec3 scale=vec3(.72,1.,.55);vec3 so=o/scale,sd=d/scale;float A=dot(sd,sd),B=dot(so,sd),C=dot(so,so)-1.;float h=B*B-A*C;vec3 col=vec3(.009,.006,.013);
      if(h>0.){float start=(-B-sqrt(h))/A,end=(-B+sqrt(h))/A,stepSize=(end-start)/38.;vec3 sum=vec3(0);float trans=1.;
        for(int i=0;i<38;i++){vec3 p=o+d*(start+(float(i)+.5)*stepSize);float angle=atan(p.z,p.x),rad=length(p.xz);
          float wing=exp(-abs(rad-(.20+.12*sin(p.y*8.+angle*3.+uTime*.25)))*100.)*exp(-p.y*p.y*8.);
          float fleck=pow(vnoise3(p*24.),15.)*5.;float rho=.45+wing*4.+fleck;vec3 glow=vec3(.8,.23,.018)*(.2+wing*.9+fleck*.5);
          float alpha=1.-exp(-rho*stepSize*1.5);sum+=trans*glow*alpha;trans*=1.-alpha;}
        vec3 p=o+d*start,n=normalize(p/(scale*scale));float rim=pow(1.-max(dot(n,-d),0.),3.);col=sum+vec3(.45,.16,.016)*rim*.7;
        col+=vec3(1.,.7,.35)*pow(max(dot(reflect(d,n),normalize(vec3(-1,2,3))),0.),80.)*.65;}
      col+=vec3(.2,.055,.01)*exp(-length(uv)*6.)*.12;fragColor=vec4(finish(col*uFade,uv,.45),1.);
    }`,900000);

  room('silicate-reef','Silicate Reef',92,'silica shells · radial pores · microscopic light',
    'Under a microscope, a teaspoon of ocean becomes architecture. Each tiny shell is a cathedral of pores, held together by a little borrowed light.',`
    void main(){vec2 uv=screenUV(),p=uv*5.+uMouse*.08;vec2 g=floor(p);vec3 col=vec3(.003,.018,.025);
      for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 id=g+vec2(i,j),h=hash22(id),q=p-id-.5-(h-.5)*.32;q=rot2(h.x*TAU+uTime*.025)*q;
        q/=vec2(.31+h.x*.06,.40+h.y*.07);float r=length(q),a=atan(q.y,q.x);float mask=1.-smoothstep(.97,1.,r);
        vec3 n=normalize(vec3(q*.5,sqrt(max(.001,1.-r*r))));float dif=max(dot(n,normalize(vec3(-.4,.7,1.))),0.);
        float pores=pow(.5+.5*cos(a*18.),14.)*exp(-pow((r-.68)*18.,2.));pores+=pow(.5+.5*cos(a*12.),12.)*exp(-pow((r-.36)*21.,2.));
        vec3 shell=mix(vec3(.018,.12,.13),vec3(.18,.35,.23),h.x)*(.3+dif);shell*=1.-pores*.92;
        shell+=vec3(.22,.43,.32)*exp(-abs(r-.96)*110.);shell+=vec3(.15,.27,.22)*pow(.5+.5*cos(a*36.),14.)*mask*.1;
        shell+=vec3(.3,.55,.42)*exp(-r*15.)*.2;col=mix(col,shell,mask*.96);}
      fragColor=vec4(finish(col*uFade,uv,.3),1.);
    }`);

  room('peacock-protocol','Peacock Protocol',90,'barb filaments · ocellar eyes · structural colour',
    'No pigment knows how to be this blue. It takes an arrangement of tiny distances, repeated until light mistakes it for a colour.',`
    void main(){vec2 uv=screenUV();vec3 col=vec3(.003,.014,.018);
      for(int i=0;i<9;i++){float f=float(i),ang=(f-4.)*.23;vec2 p=rot2(ang+.025*sin(uTime*.22+f))*(uv-vec2(0,-.42));p.y-=.50;
        vec2 q=p/vec2(.095,.18);float r=length(q);float eye=length((q-vec2(0,.12))*vec2(1.,.9));float mask=1.-smoothstep(.86,1.13,r);
        vec3 iris=mix(vec3(.025,.4,.35),vec3(.1,.22,.75),smoothstep(.3,.75,eye));iris=mix(iris,vec3(.8,.47,.08),smoothstep(.78,.84,eye));iris=mix(vec3(.003,.008,.025),iris,smoothstep(.24,.34,eye));
        float barbs=pow(.5+.5*cos((abs(q.x)*1.4+q.y)*90.+uTime*.2),9.);iris*=.65+.35*barbs;
        col=mix(col,iris,mask);float stem=exp(-abs(p.x)*1100.)*smoothstep(-.5,-.1,p.y)*(1.-smoothstep(.1,.22,p.y));col+=vec3(.15,.31,.13)*stem*.4;}
      fragColor=vec4(finish(col*uFade,uv,.4),1.);
    }`);

  room('schlieren-atlas','Schlieren Atlas',88,'density-gradient optics · thermal plumes · knife-edge light',
    'You cannot see warm air. You can see what warm air does to the light that was trying to pass through it.',`
    float density(vec2 p){float y=p.y+uTime*.065;vec2 q=p*4.;q.x+=.45*sin(y*5.)+.12*sin(y*13.);return fbm2(q+vec2(0,-y*2.))*exp(-p.x*p.x*2.);}
    void main(){vec2 uv=screenUV(),p=uv+uMouse*.07;float e=.005;vec2 g=vec2(density(p+vec2(e,0))-density(p-vec2(e,0)),density(p+vec2(0,e))-density(p-vec2(0,e)))/(2.*e);
      float k=dot(g,vec2(cos(uTime*.09),sin(uTime*.09)));vec3 col=mix(vec3(.018,.04,.085),vec3(.88,.53,.19),smoothstep(-2.,2.,k));
      col*=.45+.55*smoothstep(-1.,1.,k);col+=vec3(.08,.3,.6)*exp(-abs(k)*5.)*.18;
      float grid=max(pow(.5+.5*cos(uv.x*TAU*20.+g.x*.05),40.),pow(.5+.5*cos(uv.y*TAU*20.+g.y*.05),40.));col+=grid*.012;
      fragColor=vec4(finish(col*uFade,uv,.25),1.);
    }`);

  room('hyperbolic-bloom','Hyperbolic Bloom',86,'Poincaré disk · circle inversions · infinite boundary',
    'More room appears every time you approach the edge. Infinity is not far away here. It is a border you can almost put a finger on.',`
    void main(){vec2 uv=screenUV(),z=rot2(uTime*.035)*uv/.46;float r=length(z);vec3 col=vec3(.006,.01,.025);float folds=0.;
      if(r<1.){vec2 p=z;for(int j=0;j<20;j++){float a=atan(p.y,p.x),sector=TAU/7.;a=mod(a+sector*.5,sector)-sector*.5;p=vec2(cos(a),abs(sin(a)))*length(p);
          vec2 c=vec2(1.12,0.);float rad2=1.12*1.12-1.;vec2 d=p-c;if(dot(d,d)<rad2){p=c+d*rad2/dot(d,d);folds+=1.;}else break;}
        float edge=min(abs(p.y),abs(length(p-vec2(1.12,0.))-sqrt(1.12*1.12-1.)));vec3 tile=mix(vec3(.015,.055,.10),vec3(.03,.4,.37),.5+.5*sin(folds*.9+p.x*2.+uTime*.05));
        col=tile*(.12+.3*exp(-length(p)*2.));col+=vec3(.85,.63,.27)*exp(-edge*350.)*.65;col*=smoothstep(0.,.018,1.-r);}
      col+=vec3(.25,.47,.7)*exp(-abs(r-1.)*350.)*.3;fragColor=vec4(finish(col*uFade,uv,.25),1.);
    }`);

  room('circuit-dream','Circuit Dream',84,'etched copper · routed pulses · soldermask relief',
    'A city for signals. The avenues only wake for a fraction of a second, but something is always finding its way home.',`
    void main(){vec2 uv=screenUV(),p=rot2(.22)*uv*18.;vec2 id=floor(p),q=fract(p)-.5;float h=hash12(id);if(h>.5)q=q.yx;
      float track=min(abs(q.x-.2),abs(q.x+.2));float stop=1.-smoothstep(.3,.48,abs(q.y));float horizontal=exp(-abs(q.y-.25)*55.)*(1.-smoothstep(.18,.25,abs(q.x)));float copper=exp(-track*48.)*stop+horizontal*.8;
      float pad=exp(-abs(length(q-vec2(.2,.3))-.065)*90.)+exp(-abs(length(q+vec2(.2,.3))-.065)*90.);
      float pulse=pow(.5+.5*cos(q.y*4.+id.x*.8+id.y*.5-uTime*2.5),35.);vec3 col=vec3(.004,.026,.025)*(1.+vnoise2(p*30.)*.3);
      col+=vec3(.36,.18,.045)*(copper+pad*.6)*.65;col+=mix(vec3(.06,.8,.48),vec3(.2,.45,1.),h)*(copper+pad)*pulse*.9;
      float chip=1.-smoothstep(.20,.23,max(abs(q.x),abs(q.y)));col=mix(col,vec3(.009,.015,.021),chip*step(.85,h));
      fragColor=vec4(finish(col*uFade,uv,.35),1.);
    }`);

  room('polar-porcelain','Polar Porcelain',82,'twisted ceramic · fluted silhouette · studio reflections',
    'An impossible vessel on a table made of night. The glaze is quiet; the silhouette has been moving since before you arrived.',`
    float vase(vec3 p){float y=clamp(p.y,-.95,.95);float radius=.36+.14*cos(y*3.)+.045*sin(atan(p.z,p.x)*18.+y*4.-uTime*.3);float side=length(p.xz)-radius;return max(side,abs(p.y)-.95);}
    vec3 vn(vec3 p){vec2 e=vec2(.002,0);return normalize(vec3(vase(p+e.xyy)-vase(p-e.xyy),vase(p+e.yxy)-vase(p-e.yxy),vase(p+e.yyx)-vase(p-e.yyx)));}
    void main(){vec2 uv=screenUV();vec3 ro=vec3(2.5,.8,3.3),rd=normalize(lookAt(ro,vec3(0),vec3(0,1,0))*vec3(uv,1.25));float t=0.;bool hit=false;
      for(int i=0;i<72;i++){float d=vase(ro+rd*t);if(d<.0015){hit=true;break;}t+=d*.7;if(t>8.)break;}
      vec3 col=vec3(.013,.024,.034);if(hit){vec3 p=ro+rd*t,n=vn(p);float dif=max(dot(n,normalize(vec3(-1,2,3))),0.);float rim=pow(1.-max(dot(n,-rd),0.),3.);
        col=vec3(.43,.63,.63)*(.12+.55*dif)+vec3(.15,.37,.47)*rim;col+=vec3(1.,.81,.57)*pow(max(dot(reflect(rd,n),normalize(vec3(-1,1,2))),0.),45.)*.8;
        col+=vec3(.72,.85,.82)*pow(max(dot(reflect(rd,n),normalize(vec3(2,1,1))),0.),90.)*.8;
        if(p.y>.94)col*=.18;}
      col+=vec3(.07,.15,.18)*exp(-length(uv-vec2(0,-.3))*8.)*.25;fragColor=vec4(finish(col*uFade,uv,.45),1.);
    }`,1000000);

  room('solar-organ','Solar Organ',80,'cylindrical light pipes · phase sequencing · radial depth',
    'An instrument too large to hear. Its pipes breathe in sequence, playing a chord slowly enough to be mistaken for a place.',`
    void main(){vec2 uv=screenUV();vec2 p=uv;float a=atan(p.y,p.x)+uTime*.025,r=length(p),sector=TAU/36.;float f=floor((a+PI)/sector),q=mod(a+sector*.5,sector)-sector*.5;
      float width=.010+(.018+.012*sin(f*2.4))*r;float d=abs(sin(q)*r);float end=.2+.18*hash11(f*5.);float gate=smoothstep(.08,.12,r)*(1.-smoothstep(end+.14,end+.15,r));
      float cyl=sqrt(max(0.,1.-pow(d/max(width,.0001),2.)));float mask=(1.-smoothstep(width*.85,width,d))*gate;
      float pulse=.5+.5*sin(f*.7-uTime*.6);vec3 brass=mix(vec3(.13,.08,.035),vec3(.55,.36,.13),cyl);vec3 col=vec3(.008,.01,.022)+brass*mask*.45;
      col+=spectrum(f*.03+uTime*.015)*mask*pow(pulse,8.)*.75;col+=vec3(.3,.6,.85)*exp(-r*30.)*.3;
      fragColor=vec4(finish(col*uFade,uv,.35),1.);
    }`);
})(window);
