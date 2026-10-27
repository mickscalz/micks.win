/* Version-2 cross-family phenotype: a GPU habitat coupled to a finite ecology.
   Source traits are adapters, never imported/concatenated executable shaders. */
(function (w) {
  "use strict";
  const N = w.Nursery,
    clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const body = `
uniform sampler2D uColony;
uniform vec4 uForm; // shape, hue, lobes, relief
uniform vec4 uHabitat; // topology, material, rhythm, depth
float lifeAt(vec3 p){return texture(uColony,clamp(p.xz*.19+.5,vec2(.01),vec2(.99))).r;}
float segmentD(vec3 p,vec3 a,vec3 b,float radius){vec3 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.))-radius;}
float field(vec3 p){
 float t=uTime, rhythm=uHabitat.z, breathe=rhythm<.5?sin(t*.19):rhythm<1.5?pow(.5+.5*sin(t*.65),4.)*2.-1.:rhythm<2.5?sin(t*.12)*sin(t*.037):sin(t*.27+atan(p.z,p.x));
 p=rotY(t*.025*uDrift)*p;p.y*=1.2-.4*uHabitat.w;
 float life=lifeAt(p),s=uForm.x,r=.83+uGrowth*.2+life*uForm.w*.23;
 float a=atan(p.z,p.x),f=0.;
 if(s<.5){float petals=.12*cos(a*uForm.z+t*.08);f=length(p*vec3(1.,1.5,1.))-(r+petals*(.4+uSymmetry));}
 else if(s<1.5){p=rotX(.5)*p;f=sdTorus(p,vec2(.85,.16+.06*sin(a*3.+t*.12)));}
 else if(s<2.5){f=length(vec2(p.y-.24*sin(p.x*2.+t*.17),p.z))-(.12+.04*cos(p.x*3.));f=max(f,abs(p.x)-1.55);}
 else if(s<3.5){vec3 q=p;float stem=length(q.xz)-.12;stem=max(stem,abs(q.y)-1.25);for(int i=0;i<5;i++){float k=float(i),y=-.7+k*.35;vec3 b=q-vec3(sin(k*2.4+t*.05)*.38,y,cos(k*2.4)*.38);stem=min(stem,length(b)-(.2+.05*k));}f=stem;}
 else if(s<4.5){f=sdBox(p-vec3(0,-.7,0),vec3(1.1,.08,.72));for(int i=0;i<3;i++){vec3 q=p-vec3(0,0,float(i)*.55-.55);float arch=max(sdTorus(q.xzy,vec2(.9,.08)),-q.y);vec3 pillar=vec3(abs(q.x)-.9,q.y+.32,q.z);f=min(f,min(arch,sdBox(pillar,vec3(.075,.35,.075))));}}
 else if(s<5.5){vec3 q=p;f=sdBox(q,vec3(.85));float scale=1.;for(int i=0;i<3;i++){vec3 a3=mod(q*scale,2.)-1.;scale*=3.;vec3 b3=1.-3.*abs(a3);float crossD=min(max(b3.x,b3.y),min(max(b3.y,b3.z),max(b3.z,b3.x)))/scale;f=max(f,crossD);}}
 else if(s<6.5){float h=.32*sin(p.x*2.+t*.13)*cos(p.z*2.-t*.11);f=max(abs(p.y-h)-.045,length(p.xz)-1.5);}
 else if(s<7.5){vec3 q=p;float box=sdBox(q,vec3(.95));q=mod(q+.3,.6)-.3;float bars=min(length(q.xy),min(length(q.xz),length(q.yz)))-.055;f=max(box,bars);}
 else if(s<8.5){f=sdTorus(p,vec2(1.,.08));f=min(f,sdTorus(rotX(1.1)*p,vec2(.78,.07)));f=min(f,length(p)-.32);}
 else if(s<9.5){float h=.3*sin(p.x*2.)+.2*cos(p.z*3.+t*.08)+life*.4;f=max(p.y-h,max(abs(p.x)-1.5,abs(p.z)-1.5));f=max(f,-p.y-.5);}
 else if(s<10.5){f=segmentD(p,vec3(0,-1.,0),vec3(0,.75,0),.11);for(int i=0;i<6;i++){float k=float(i),a=k*2.399;vec3 root=vec3(0,-.65+k*.16,0),tip=vec3(cos(a)*.72,.65+.12*sin(k),sin(a)*.72);vec3 mid=mix(root,tip,.6)+vec3(0,-.15,0);f=min(f,segmentD(p,root,mid,.08));f=min(f,segmentD(p,mid,tip,.055));vec3 fork=tip+vec3(sin(a)*.22,-.13,cos(a)*.22);f=min(f,segmentD(p,mid,fork,.04));f=min(f,length(p-tip)-(.08+.02*sin(t*.12+k)));}}
 else{p=rotX(.7)*p;float twist=atan(p.z,p.x)+length(p.xz)*2.-t*.15;f=sdTorus(p,vec2(.9+.1*sin(twist*3.),.12));}
 f-=.025*breathe*(.3+uLife)+life*.07*uForm.w;
 return f;
}
vec3 pigment(float k){vec3 c=.5+.5*cos(TAU*(vec3(0.,.28,.56)+uForm.y/360.+k));vec3 safe=mix(vec3(.07,.32,.67),vec3(1.,.72,.24),.5+.5*sin(k*4.));return mix(c,safe,uColorSafe);}
void main(){vec2 uv=screenUV();float phase=uTime*.025*uDrift;vec3 ro=vec3(3.5*sin(.55+phase),1.7,3.5*cos(.55+phase));vec3 rd=lookAt(ro,vec3(0),vec3(0,1,0))*normalize(vec3(uv*2.,1.6));float tr=.1;bool hit=false;float glow=0.;for(int i=0;i<64;i++){vec3 p=ro+rd*tr;float h=field(p);glow+=exp(-abs(h)*30.)*.002;if(abs(h)<.003){hit=true;break;}tr+=max(.003,abs(h)*.48);if(tr>9.)break;}vec3 col=vec3(.003,.008,.018)+pigment(uv.y*.12)*.015*uAtmosphere;
 if(hit){vec3 p=ro+rd*tr;vec2 e=vec2(.004,0);vec3 n=normalize(vec3(field(p+e.xyy)-field(p-e.xyy),field(p+e.yxy)-field(p-e.yxy),field(p+e.yyx)-field(p-e.yyx))+vec3(.000001));float light=max(0.,dot(n,normalize(vec3(-.6,1.,-.7)))),rim=pow(max(0.,1.-abs(dot(n,rd))),3.);float cells=lifeAt(p),micro=.5+.5*sin(p.y*18.+p.x*9.+uTime*.1);vec3 base=pigment(p.y*.14+p.z*.07+cells*.25);float material=uHabitat.y;float gloss=material<.5?.2:material<1.5?.65:material<2.5?.04:.12;
 if(material<.5){base*=.94+.06*sin(p.y*170.+sin(p.x*35.)*.4);}else if(material<1.5){base=mix(pigment(dot(refract(rd,n,.72),vec3(2.,3.,1.))*.2),base,.35);base*=.65+.35*rim;}else if(material<2.5){base=mix(vec3(.015),base,step(.55,light))*.85;rim=step(.65,rim);}else{n=normalize(floor(n*7.+.5)+vec3(.0001));light=max(0.,dot(n,normalize(vec3(-.6,1.,-.7))));base*=.7+.3*fract(sin(dot(floor(p*14.),vec3(12.98,78.23,43.1)))*43758.5453);}
 col=base*(.2+.65*light+.08*micro)+pigment(.3)*rim*(.3+gloss);col+=pigment(.5)*cells*(.2+uAfterglow*.6);col+=pow(max(0.,dot(reflect(rd,n),normalize(vec3(-.6,1.,-.7)))),24.)*gloss;col*=exp(-tr*.025*uAtmosphere);}
 col+=pigment(.45)*glow*(.3+uAfterglow*.5);col=mix(vec3(dot(col,vec3(.2126,.7152,.0722))),col,uColorRange);fragColor=vec4(finish(col*uFade,uv,.16),1.);}`;
  function environment(g, x, y, t) {
    const X = (x - 0.5) * 2,
      Y = (y - 0.5) * 2;
    let ax = 0,
      ay = 0;
    if (g.topology === "orbit") {
      ax = -Y;
      ay = X;
    } else if (g.topology === "lattice") {
      ax = -Math.sin(X * Math.PI * 3);
      ay = -Math.sin(Y * Math.PI * 3);
    } else if (g.topology === "flow") {
      ax = Math.cos(Y * 3 + t * 0.1);
      ay = Math.sin(X * 3 - t * 0.1);
    } else {
      ax = -X * 0.6 + Math.sin(Y * 4 + t * 0.1) * 0.3;
      ay = -Y * 0.6 + Math.cos(X * 4) * 0.3;
    }
    const radial = Math.hypot(X, Y),
      shape = g.shape;
    if (["shell", "orbit", "vortex"].includes(shape)) {
      const pressure = (radial - 0.57) * 0.8;
      ax -= X * pressure;
      ay -= Y * pressure;
    } else if (["lattice", "sponge", "vault"].includes(shape)) {
      ax -= Math.sin(X * 9) * 0.32;
      ay -= Math.sin(Y * 9) * 0.32;
    } else if (["terrain", "membrane", "ribbon"].includes(shape)) {
      ay -= (Y - 0.25 * Math.sin(X * 4 + t * 0.1)) * 0.7;
    } else {
      ax += Math.sin(Y * g.lobes) * 0.15;
      ay -= Y * 0.15;
    }
    return [ax, ay];
  }
  // Continuous, bilinear deposition replaces single-cell jumps in the GPU
  // displacement texture. Frame-rate-independent relaxation removes birth pops.
  function rasterize(L, previous, dt) {
    const target = new Float32Array(48 * 30);
    for (let i = 0; i < target.length; i++) target[i] = clamp(L.field[i]) * 140;
    for (const p of L.agents) {
      const x = clamp(p.x) * 47,
        y = clamp(p.y) * 29,
        ix = Math.floor(x),
        iy = Math.floor(y),
        fx = x - ix,
        fy = y - iy;
      for (let dy = 0; dy < 2; dy++)
        for (let dx = 0; dx < 2; dx++) {
          const k = Math.min(29, iy + dy) * 48 + Math.min(47, ix + dx);
          target[k] += 95 * (dx ? fx : 1 - fx) * (dy ? fy : 1 - fy);
        }
    }
    const alpha = previous ? 1 - Math.exp(-Math.max(0, dt) * 12) : 1;
    const out = previous || new Float32Array(target.length);
    for (let i = 0; i < out.length; i++)
      out[i] += (Math.min(255, target[i]) - out[i]) * alpha;
    return out;
  }
  function create(input) {
    const recipe = N.validate(input),
      g = recipe.genome;
    return {
      id: recipe.id,
      name: recipe.name,
      nursery: true,
      recipeSolver: "habitat-v2",
      genome: g,
      kind: "glx",
      edition: 8,
      rank: 0,
      collectionRank: 0,
      captivation: 0,
      pixelBudget: 380000,
      family: "hybrid",
      theme: "dark",
      tag:
        "GPU habitat · " +
        g.shape +
        " / " +
        g.topology +
        " · generation " +
        recipe.generation,
      blurb:
        "Cross-family module phenotype, not a splice of source shaders. A finite colony deforms this habitat; the habitat guides its movement. Save via the nursery.",
      lifeMechanism: "Nutrient/GPU feedback · " + recipe.id,
      init(R) {
        this.L = w.CabinetVIII.ecology.create(recipe.seed, 65, g.force);
        this.clock = 0;
        this.motion = w.OffspringMotion.profile(recipe);
        w.OffspringMotion.awaken(this.L.agents, recipe);
        this.density = rasterize(this.L, null, 0);
        this.pixels = new Uint8Array(48 * 30 * 4);
        this.prog = R.shader(body, "nursery-habitat-v2");
        if (!this.prog) throw Error("Habitat shader unavailable");
        const gl = R.gl;
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        for (const param of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER])
          gl.texParameteri(gl.TEXTURE_2D, param, gl.LINEAR);
        for (const param of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T])
          gl.texParameteri(gl.TEXTURE_2D, param, gl.CLAMP_TO_EDGE);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA8,
          48,
          30,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          this.pixels,
        );
      },
      advance(S) {
        const e = w.CabinetVIII.ecology.tune(S);
        for (const k of N.KEYS)
          e[k] = clamp(g[k] * 0.65 + (e[k] ?? 0.5) * 0.35);
        if (S.dt > 0) {
          const dt = Math.min(S.dt, 0.05);
          this.clock += dt;
          for (const p of this.L.agents) {
            const f = environment(g, p.x, p.y, this.clock);
            p.vx = clamp(p.vx + f[0] * dt * 0.012 * e.coupling, -0.14, 0.14);
            p.vy = clamp(p.vy + f[1] * dt * 0.012 * e.coupling, -0.14, 0.14);
          }
          w.CabinetVIII.ecology.advance(this.L, dt, e);
          rasterize(this.L, this.density, dt);
        }
        return e;
      },
      frame(R, S) {
        const e = this.advance(S),
          bytes = this.pixels;
        bytes.fill(0);
        for (let i = 0; i < this.density.length; i++) {
          bytes[i * 4] = Math.round(this.density[i]);
          bytes[i * 4 + 3] = 255;
        }
        const gl = R.gl;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texSubImage2D(
          gl.TEXTURE_2D,
          0,
          0,
          0,
          48,
          30,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          bytes,
        );
        R.blit(
          this.prog,
          null,
          {
            uRes: [R.canvas.width, R.canvas.height],
            uTime: w.OffspringMotion.time(this.clock, this.motion),
            uFade: S.fade ?? 1,
            uGrowth: e.growth,
            uLife: e.lifecycle,
            uDrift: e.drift,
            uSymmetry: e.symmetry,
            uAfterglow: e.afterglow,
            uAtmosphere: e.atmosphere,
            uColorSafe: e.colorSafe ? 1 : 0,
            uColorRange: S.experience?.color ?? 1,
            uForm: [N.FORMS.indexOf(g.shape), g.hue, g.lobes, g.relief],
            uHabitat: [
              N.MODULES.topology.indexOf(g.topology),
              N.MODULES.material.indexOf(g.material),
              N.MODULES.rhythm.indexOf(g.rhythm),
              g.depth,
            ],
          },
          [{ name: "uColony", tex: this.texture }],
        );
      },
      dispose(R) {
        if (this.texture) {
          R.gl.deleteTexture(this.texture);
          this.texture = null;
        }
      },
    };
  }
  w.HabitatRenderer = { create, environment, rasterize };
})(window);
