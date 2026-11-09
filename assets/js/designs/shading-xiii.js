/* Shared v4 shading for Collection XIII.
   Convention: every world field returns  terrainHeight(q) - p.y , i.e. NEGATIVE
   while a point is above the ground. `above()` flips that into a signed height
   used by the march, the soft shadows and the ambient-occlusion taps. The
   normal is rebuilt from the field gradient with its y axis flipped so it always
   points up. No uniforms are declared here: the renderer's authored pipeline
   bakes constants into the same source, and these worlds need none. */
(function (root) {
  "use strict";
  const num = (v, d) => (Number.isFinite(v) ? v : d);
  const vec = (v, d) => (Array.isArray(v) && v.length === 3 ? v : d);
  const common = (o = {}) => `
const vec3 PAL=vec3(${num(o.hue, 0.08).toFixed(3)},${(num(o.hue, 0.08) + 0.10).toFixed(3)},${(num(o.hue, 0.08) + 0.21).toFixed(3)});
const vec3 SKYC=vec3(${vec(o.sky, [0.15, 0.18, 0.22]).join(",")});
const vec3 GROUND=vec3(${vec(o.ground, [0.12, 0.11, 0.09]).join(",")});
const float WATER_Y=${num(o.water, -100).toFixed(2)};
const float HAZE=${num(o.haze, 0.0025).toFixed(4)};
const float SHADOW_T=${num(o.shadow, 60).toFixed(1)};
vec3 sunDir(){return normalize(vec3(${vec(o.sun, [0.3, 0.5, 0.8]).join(",")}));}
float worldField(vec3 p);
float above(vec3 p){return -worldField(p);}
vec3 tint(float x){vec3 c=.5+.5*cos(TAU*(PAL+x));c=mix(vec3(luma(c)),c,.55);return c;}
float softShadow(vec3 ro,vec3 rd,float maxT){
  float res=1.,t=.12;
  for(int i=0;i<20;i++){float h=above(ro+rd*t);res=min(res,9.*h/t);if(res<.02||t>maxT)break;t+=clamp(h,.10,1.6);}
  return clamp(res,.0,1.);
}
vec3 sky(vec3 rd){
  float up=clamp(rd.y,0.,1.);
  vec3 zen=SKYC*.62+vec3(.010,.013,.024);
  vec3 hor=mix(SKYC*1.75,GROUND*.95,.45)+vec3(.022,.018,.014);
  vec3 c=mix(hor,zen,pow(up,.60));
  c=mix(c,mix(hor,GROUND*.55,.55),smoothstep(0.,-.22,rd.y));
  float sd=max(0.,dot(rd,sunDir()));
  c+=mix(vec3(1.,.80,.58),tint(.12),.40)*pow(sd,6.)*.22;
  float disc=length(rd-sunDir());
  c+=vec3(1.,.94,.82)*(exp(-disc*disc*16000.)*9.+pow(sd,420.)*1.8);
  c+=vec3(.72,.80,1.)*starLayer(rd.xz/max(.35,abs(rd.y))*.55,160.,24.,11.)*smoothstep(.24,.64,rd.y)*.40*(1.-sd);
  return c;
}
vec3 grade(vec3 c){
  float l=luma(c);
  c=mix(vec3(l),c,.94);
  c=mix(c*vec3(.94,.97,1.05),c*vec3(1.05,1.00,.94),smoothstep(.12,.70,l));
  vec3 t=clamp(c,0.,1.);
  c=mix(c,t*t*(3.-2.*t),.22);
  c=max(c,vec3(0.));
  return c*.94;
}
vec3 applyHaze(vec3 col,float t,vec3 rd){
  float f=(1.-exp(-t*HAZE))*.40;
  return mix(col,sky(rd)*.92+tint(.4)*.03,f);
}
vec3 shade(vec3 p,vec3 n,vec3 rd,vec3 alb){
  alb*=1.35;
  vec3 l=sunDir();
  float nl=max(0.,dot(n,l));
  float sh=nl>0.?softShadow(p+n*.10,l,SHADOW_T):0.;
  // Cloud shadow drifting across the land: the world's own weather, not a decal.
  float drift=sin(p.x*.075+p.z*.055-uTime*1.35)*.5+.5;
  vec3 key=mix(vec3(1.,.86,.70),vec3(.86,.92,1.),.32)*(1.34+.32*uIntensity)*mix(.70,1.,smoothstep(.15,.75,drift));
  vec3 h=normalize(l-rd);
  float spec=pow(max(0.,dot(n,h)),60.)*sh;
  float ao=1.;
  {vec3 up=normalize(n+vec3(0.,1.1,0.));float o=0.,w=1.;for(int i=0;i<4;i++){float hh=.16+.26*float(i);o+=max(0.,hh-above(p+up*hh))*w;w*=.70;}ao=clamp(1.-.55*o,.35,1.);}
  vec3 amb=alb*mix(GROUND*.50+vec3(.055,.058,.070),SKYC*.85+vec3(.030,.034,.048),.5+.5*n.y)*1.05*ao;
  vec3 bounce=alb*max(0.,n.y)*GROUND*.22;
  float fres=pow(1.-max(0.,dot(n,-rd)),4.);
  vec3 c=alb*nl*sh*key+amb+bounce+key*spec*alb*.16+SKYC*fres*.07;
  // sky-side wrap keeps vertical faces and silhouettes legible
  float wrap=clamp(dot(n,sunDir())*.5+.5,0.,1.);
  c+=alb*(wrap*.55+.35)*(SKYC*.95+vec3(.030,.033,.044))*ao;
  c+=alb*pow(1.-max(0.,n.y),2.)*SKYC*.10*ao;
  return c;
}
vec3 waterSurface(vec3 ro,vec3 rd,float tMax,vec3 base){
  float t=rd.y<-.0008?(WATER_Y-ro.y)/rd.y:1e9;
  if(t<0.||t>tMax)return base;
  vec3 p=ro+rd*t;
  float w1=sin(p.x*.55+uTime*.26),w2=sin(p.z*.47-uTime*.20);
  vec3 n=normalize(vec3(.030*w1+.012*sin(p.z*1.4+uTime*.5),1.,.030*w2+.012*cos(p.x*1.3-uTime*.4)));
  vec3 refl=sky(reflect(rd,n))*.72+SKYC*.10;
  float fres=.03+.97*pow(1.-max(0.,dot(n,-rd)),5.);
  vec3 c=mix(tint(.22)*.05+SKYC*.03,refl,fres*.85);
  c+=mix(vec3(1.,.88,.70),tint(.3),.4)*pow(max(0.,dot(reflect(rd,n),sunDir())),140.)*.55;
  c+=tint(.3)*pow(.5+.5*sin(length(p.xz)*1.2-uTime*.6),16.)*.03;
  return mix(base,c,.86);
}
`;
  const main = (o = {}) => `
void main(){
  vec2 uv=screenUV();
  float sway=sin(uTime*.05)*.6*uDrift;
  float H=${num(o.H, 10).toFixed(2)};
  float dist=${num(o.dist, 30).toFixed(2)}*0.84;
  float az=${((num(o.az, 20) * Math.PI) / 180).toFixed(4)};
  vec3 ro=${o.eye ? 'vec3('+o.eye.join(',')+')' : 'vec3(sin(az)*dist,H*0.95+3.0,cos(az)*dist)'}+vec3(sway,0.,0.);
  vec3 at=${o.aim ? 'vec3('+o.aim.join(',')+')' : 'vec3(0.,H*0.55,0.)'};
  vec3 rd=lookAt(ro,at,vec3(0,1,0))*normalize(vec3(uv*${num(o.fov, 1.5).toFixed(2)}+uMouse*.008,1.26));
  vec3 col=sky(rd);bool hit=false;
  float t0=rd.y<-.002?max(.05,(ro.y-H*1.2)/(-rd.y)):.05;
  float t1=rd.y<-.002?min(${num(o.far, 150).toFixed(1)},(ro.y+6.)/(-rd.y)):${num(o.far, 150).toFixed(1)};
  float dt=max(.05,(t1-t0)/float(${Math.max(40, Math.round(num(o.steps, 150)))}));
  float t=t0;
  for(int i=0;i<${Math.max(40, Math.round(num(o.steps, 150)))};i++){
    t=t0+dt*float(i+1);
    if(above(ro+rd*t)<0.0){hit=true;break;}
  }
  if(hit){float a=max(t0,t-dt),b=t;for(int k=0;k<7;k++){float m=(a+b)*.5;if(above(ro+rd*m)<0.0)b=m;else a=m;}t=b;}
  if(hit){
    vec3 p=ro+rd*t;vec2 e=vec2(max(.015,t*.0035),0.);
    vec3 fg=vec3(worldField(p+e.xyy)-worldField(p-e.xyy),worldField(p+e.yxy)-worldField(p-e.yxy),worldField(p+e.yyx)-worldField(p-e.yyx));
    vec3 n=normalize(vec3(fg.x,-fg.y,fg.z)+vec3(1e-6));
    col=shade(p,n,rd,${o.albedo});
    {vec3 base_=col;col=vec3(0.);${o.emit || ""}col=base_+col*.55;}
  }
  ${o.water > -100 ? "col=waterSurface(ro,rd,t,col);" : ""}
  col=applyHaze(col,t,rd);
  col=grade(col);
  fragColor=vec4(finish(max(col,vec3(0))*(.42+.42*uIntensity)*uFade,uv,.14),1.);
}
`;
  const api = { common, main };
  if (typeof module !== "undefined") module.exports = api;
  else root.ShadingXIII = api;
})(typeof window !== "undefined" ? window : globalThis);
