/* XIII — LUMINOUS MERIDIANS.
   Thirty-two authored environments. Every field is a bounded heightfield
   (return terrainHeight - p.y) so the camera always sees a landscape rather than
   sitting inside solid geometry. Each world is a different construction:
   columns, slab towers, river terraces, a stair, tidal rings, orrery walls,
   monoliths, salt ramparts, cloud banks, glass shards, a stratified mesa, a
   cliff, tombs, ash dunes, a spiral reef, a rod forest, mountain ranges, salt
   crust, glacier ridges, a hedge maze, dunes, flooded terraces, a canyon, a
   cloud plateau, radial blades, interference terraces, crystal facets, a prism
   cataract, silk ripples, a pierced screen, a ribbed basin and a corridor of
   portals. Framing is derived from each world's own height so scale reads.

   The shared v4 pass (shading-xiii.js) supplies soft self-shadowing, AO,
   key/fill light, rippled water, height haze and a muted filmic grade. Kernels
   are shared verbatim with the allowlisted nursery. */
(function (root) {
  "use strict";
  const SH =
    typeof module !== "undefined"
      ? require("./shading-xiii.js")
      : root.ShadingXIII;

  const sunFor = (azDeg, offDeg = 214, elev = 0.50) => {
    const a = ((azDeg + offDeg) * Math.PI) / 180,
      v = [Math.sin(a) * 0.62, elev, Math.cos(a) * 0.78],
      l = Math.hypot(v[0], v[1], v[2]);
    return v.map((x) => +(x / l).toFixed(3));
  };

  const T = (id, name, note, family, opt) => ({ id, name, note, family, opt });

  const specs = [
    /* ---------------- architecture ------------------------------------- */
    T(
      "colonnade-of-nine-suns",
      "Colonnade of Nine Suns",
      "Basalt columns standing in a tidal mirror under a low sun",
      "architecture",
      {
        hue: 0.06, sky: [0.2, 0.2, 0.24], ground: [0.21, 0.13, 0.08],
        sun: sunFor(196,216,0.16), water: 0.10, haze: 0.0020,
        eye: [0, 4.5, 24],
        aim: [0, 1.6, -14],
        H: 3.4, dist: 26, az: 24, fov: 1.46, steps: 170, far: 150,
        field: `vec2 g=q*.26;vec2 id=floor(g);vec2 f=fract(g)-.5;
float hex=max(abs(f.x)*.866+abs(f.y)*.5,abs(f.y));
float col=(1.-smoothstep(.30,.44,hex))*(1.2+2.4*hash12(id));
float sea=.10+.06*sin(q.x*.12)*sin(q.y*.10);
return max(sea-.5,col)-p.y;`,
        albedo: `mix(vec3(.055,.055,.058),vec3(.20,.195,.19),pow(.5+.5*sin(p.x*2.2)*sin(p.z*2.0),2.))*(.66+.45*max(0.,n.y))`,
        emit: `{float r=length(p.xz+vec2(0.,9.));col+=vec3(1.,.70,.32)*pow(.5+.5*sin(r*1.3),70.)*1.5*smoothstep(1.2,0.,abs(p.y-.12));}`,
      }
    ),
    T(
      "obsidian-library",
      "Obsidian Library",
      "Slab towers around sunken lanes, lit from inside",
      "architecture",
      {
        hue: 0.60, sky: [0.12, 0.14, 0.21], ground: [0.06, 0.07, 0.10],
        sun: sunFor(18), water: -100, haze: 0.0028,
        H: 16, dist: 42, az: 18, fov: 1.44, steps: 200, far: 150,
        field: `vec2 g=q/13.;vec2 id=floor(g);vec2 f=abs(fract(g)-.5);
float box=1.-smoothstep(.26,.31,max(f.x,f.y));
float hgt=8.+8.*hash12(id);
float tower=box*hgt;
float cap=box*step(.55,fract(hgt*.7))*(hgt+.9);
float lane=-1.8+.4*sin(q.x*.18);
return max(lane,max(tower,cap))-p.y;`,
        albedo: `mix(vec3(.012,.012,.018),vec3(.085,.084,.10),pow(1.-abs(sin(p.x*.8)*sin(p.y*.6)),4.))*(.4+.7*max(0.,n.y))`,
        emit: `{float w=step(.78,fract(p.y*.45))*step(.70,fract((p.x+p.z)*.16));col+=mix(vec3(1.,.60,.28),vec3(.95,.44,.15),hash12(floor(p.xz*.7)))*(.35+.65*w);
          float lamp=.5+.5*sin(p.x*.085+p.z*.062-uTime*.85);
          col+=mix(vec3(.095,.052,.020),vec3(.028,.015,.006),w)*pow(lamp,5.)*(.30+.70*max(0.,n.y));
          }`,
      }
    ),
    T(
      "suspended-river-palace",
      "Suspended River Palace",
      "A river channel with terraces climbing away from it on both sides",
      "architecture",
      {
        hue: 0.50, sky: [0.15, 0.21, 0.28], ground: [0.08, 0.11, 0.13],
        sun: sunFor(40), water: 0.2, haze: 0.0026,
        H: 9, dist: 30, az: 40, fov: 1.46, steps: 187, far: 150,
        field: `float ax=abs(q.x);
float t=floor(ax/3.4);
float shelf=t*1.15*smoothstep(2.4,4.6,ax);
float lip=(1.-smoothstep(.55,.95,abs(fract(ax/3.4)-.5)))*.45*smoothstep(2.4,4.6,ax);
float chan=(1.-smoothstep(.4,3.2,ax))*1.6;
return min(shelf+lip,7.5)+chan-1.4-p.y;`,
        albedo: `mix(vec3(.045,.06,.07),vec3(.22,.24,.26),.35+.55*fbm2(p.xz*.35))*(.45+.65*max(0.,n.y))`,
        emit: `{float fall=pow(.5+.5*sin(p.y*.5),8.)*smoothstep(4.,.3,abs(p.x));col+=vec3(.40,.70,.86)*fall*.5;}`,
      }
    ),
    T(
      "thousand-year-stair",
      "Thousand Year Stair",
      "One stair cut through a monolith, climbing away from the viewer",
      "architecture",
      {
        hue: 0.09, sky: [0.21, 0.19, 0.19], ground: [0.21, 0.13, 0.08],
        sun: sunFor(10), water: -100, haze: 0.0022,
        eye: [7, 5.5, 23],
        aim: [0, 9, -20],
        H: 12, dist: 36, az: 10, fov: 1.42, steps: 200, far: 150,
        field: `float band=(-q.y)*.26+3.5;
float st=clamp(floor(band)*1.00,0.,11.);
float tread=smoothstep(.82,1.,fract(band))*.55;
float width=1.-smoothstep(4.4,8.0,abs(q.x));
float cliff=smoothstep(6.,14.,abs(q.x))*7.;
return (st+tread)*width+cliff-1.4-p.y;`,
        albedo: `mix(vec3(.10,.082,.068),vec3(.30,.25,.20),.30+.55*fbm2(p.xz*.28))*(.62+.5*max(0.,n.y))`,
      }
    ),
    T(
      "tideclock-basilica",
      "Tideclock Basilica",
      "Concentric tidal rings around a spire, water rising through them",
      "architecture",
      {
        hue: 0.44, sky: [0.14, 0.19, 0.25], ground: [0.07, 0.09, 0.11],
        sun: sunFor(34), water: 0.2, haze: 0.0028,
        H: 13, dist: 35, az: 34, fov: 1.44, steps: 193, far: 150,
        field: `float r=length(q);
float band=r*.40;
float terr=floor(band)*.72;
float lip=smoothstep(.80,1.,fract(band))*.40;
float ring=max(-2.2,terr+lip)*(1.-smoothstep(30.,38.,r));
float spire=(1.-smoothstep(1.3,3.4,r))*14.;
float drum=(1.-smoothstep(3.4,5.0,r))*3.4;
return max(ring,max(spire,drum))-p.y;`,
        albedo: `mix(vec3(.05,.065,.078),vec3(.26,.28,.30),.4+.5*fbm2(p.xz*.4))*(.45+.65*max(0.,n.y))`,
        emit: `{float band=pow(.5+.5*sin(p.y*1.4),22.)*smoothstep(5.2,1.,length(p.xz));col+=vec3(1.,.86,.60)*band*.45;}`,
      }
    ),
    T(
      "brass-orrery-mausoleum",
      "Brass Orrery Mausoleum",
      "Three concentric ring walls with tombs on the outermost orbit",
      "architecture",
      {
        hue: 0.10, sky: [0.19, 0.17, 0.17], ground: [0.19, 0.13, 0.08],
        sun: sunFor(30), water: -100, haze: 0.0024,
        H: 11, dist: 30, az: 30, fov: 1.46, steps: 193, far: 150,
        field: `float r=length(q);
float ringA=(1.-smoothstep(.6,1.5,abs(r-8.)))*5.5;
float ringB=(1.-smoothstep(.7,1.7,abs(r-14.)))*7.5;
float ringC=(1.-smoothstep(.8,1.8,abs(r-20.)))*4.2;
float hub=(1.-smoothstep(2.0,3.4,r))*11.;
float tomb=(1.-smoothstep(.8,1.6,length(mod(q+5.5,11.)-5.5)))*2.2;
float flatv=.35*sin(q.x*.2)*sin(q.y*.17);
return max(flatv,max(max(ringA,max(ringB,ringC)),max(hub,tomb)))-p.y;`,
        albedo: `mix(vec3(.16,.11,.055),vec3(.46,.33,.17),pow(.5+.5*sin(atan(p.z,p.x)*2.+length(p.xz)*.18),2.))*(.6+.5*max(0.,n.y))`,
      }
    ),
    T(
      "falling-light-colonnade",
      "Falling Light Colonnade",
      "A forest of pale monoliths, light arriving in shafts between them",
      "architecture",
      {
        hue: 0.13, sky: [0.23, 0.22, 0.21], ground: [0.2, 0.17, 0.13],
        sun: sunFor(34), water: -100, haze: 0.0026,
        eye: [1,6,26],
        aim: [0,9,-18],
        shadow: 4,         H: 13, dist: 40, az: 34, fov: 1.46, steps: 200, far: 150,
        field: `vec2 g=q/17.;vec2 id=floor(g);vec2 f=abs(fract(g)-.5);
float sx=1.-smoothstep(.18,.24,f.x);
float sy=1.-smoothstep(.22,.30,f.y);
float slab=sx*sy*(7.+11.*hash12(id));
float ledge=slab*step(.55,fract(hash12(id+5.)*3.))*.7;
float base=-1.5+.28*sin(q.x*.22)*sin(q.y*.20);
return max(base,slab+ledge)-p.y;`,
        albedo: `mix(vec3(.30,.29,.275),vec3(.62,.61,.58),.30+.55*fbm2(p.xz*.35))*(.72+.45*max(0.,n.y))`,
      }
    ),
    T(
      "salt-throne-citadel",
      "Salt Throne Citadel",
      "White ramparts ring a throne mesa; a causeway crosses the flats",
      "architecture",
      {
        hue: 0.11, sky: [0.20, 0.21, 0.24], ground: [0.19, 0.17, 0.14],
        sun: sunFor(20), water: -100, haze: 0.0020,
        H: 11, dist: 30, az: 20, fov: 1.44, steps: 193, far: 150,
        field: `float r=length(q);
float rampart=(1.-smoothstep(1.4,3.2,abs(r-16.)))*6.4;
float throne=(1.-smoothstep(2.2,4.4,r))*11.;
float causeway=(1.-smoothstep(1.2,2.4,abs(q.x)))*3.0*smoothstep(4.,9.,r);
float flatv=.4*sin(q.x*.21)*sin(q.y*.19);
return max(flatv,max(max(rampart,throne),causeway))-p.y;`,
        albedo: `mix(vec3(.28,.27,.24),vec3(.62,.60,.55),pow(.5+.5*sin(p.x*.6)*sin(p.z*.5),2.))*(.55+.55*max(0.,n.y))`,
      }
    ),

    /* ---------------- atmospheric -------------------------------------- */
    T(
      "whale-nebula",
      "Whale Nebula",
      "Long cloud banks seen from above, a swell running through them",
      "atmospheric",
      {
        hue: 0.53, sky: [0.11,0.14,0.22], ground: [0.07,0.07,0.10],
        sun: sunFor(30), water: -100, haze: 0.0020,
        H: 7, dist: 26, az: 30, fov: 1.48, steps: 181, far: 150,
        field: `float banks=3.0*sin(q.x*.10+q.y*.07)+1.9*sin(q.y*.14-q.x*.055);
float billow=1.1*fbm2(q*.07+vec2(uTime*.012,0.));
float swell=1.6*exp(-length(q-vec2(4.,-8.))*.06);
return banks+billow+swell-p.y;`,
        albedo: `mix(vec3(.055,.065,.10),vec3(.22,.24,.30),pow(.5+.5*sin(p.x*.30+p.z*.24),2.))*(.62+.5*max(0.,n.y))`,
      }
    ),
    T(
      "glass-monsoon",
      "Glass Monsoon",
      "A field of glass shards standing in shallow rain water",
      "atmospheric",
      {
        hue: 0.46, sky: [0.14,0.19,0.23], ground: [0.08,0.10,0.11],
        sun: sunFor(20), water: -0.6, haze: 0.0030,
        H: 13, dist: 34, az: 20, fov: 1.44, steps: 180, far: 150,
        field: `vec2 g=mod(q+4.2,8.4)-4.2;
vec2 id=floor((q+4.2)/8.4);
float d=max(abs(g.x)*.80,abs(g.y)*.62);
float hgt=6.+9.*hash12(id);
float shard=(1.-smoothstep(.0,2.6,d))*hgt;
float tip=(1.-smoothstep(.0,.9,d))*hgt*.55;
float floorv=-1.5+.22*sin(q.x*.3);
return max(floorv,max(shard,tip)-1.1)-p.y;`,
        albedo: `mix(vec3(.06,.10,.11),vec3(.30,.42,.46),pow(1.-abs(sin(p.x*.7)*sin(p.z*.6)),3.))*(.6+.5*max(0.,n.y))`,
        emit: `{float edge=pow(1.-abs(dot(n,vec3(.4,.8,.4))),6.);col+=vec3(.55,.82,.90)*edge*.16;}`,
      }
    ),
    T(
      "ember-stratosphere",
      "Ember Stratosphere",
      "A stratified mesa: stacked bands, every ledge catching the sun",
      "atmospheric",
      {
        hue: 0.05, sky: [0.25, 0.17, 0.14], ground: [0.23, 0.11, 0.07],
        sun: sunFor(32), water: -100, haze: 0.0018,
        H: 12, dist: 36, az: 32, fov: 1.46, steps: 193, far: 150,
        field: `float r=length(q*vec2(.85,1.));
float mesa=smoothstep(30.,10.,r)*12.;
float strata=floor(mesa*.9)*.55;
float notch=.6*sin(q.x*.3)*sin(q.y*.27);
return mix(strata+notch,-1.6,smoothstep(22.,32.,r))-p.y;`,
        albedo: `mix(vec3(.13,.07,.05),vec3(.40,.22,.13),pow(.5+.5*sin(p.y*2.2),3.))*(.55+.5*max(0.,n.y))`,
        emit: `{float band=pow(.5+.5*sin(p.y*2.2),24.)*exp(-length(p.xz)*.03);col+=vec3(1.,.42,.14)*band*.35;}`,
      }
    ),
    T(
      "cloudfall-abyss",
      "Cloudfall Abyss",
      "A plateau ending in a cliff: the ground simply stops",
      "atmospheric",
      {
        hue: 0.56, sky: [0.16,0.19,0.25], ground: [0.10,0.11,0.14],
        sun: sunFor(200), water: -100, haze: 0.0018,
        eye: [0,16,30],
        aim: [0,2,-2],
        H: 7, dist: 30, az: 0, fov: 1.50, steps: 200, far: 150,
        field: `float r=length(q);
float chasm=smoothstep(7.,10.,r);
float plateau=6.5+.25*fbm2(q*.12);
float h=mix(-18.,plateau,chasm);
float rim=(1.-smoothstep(.6,3.2,abs(r-8.5)))*1.6;
float shelf=floor((r-8.5)*.55)*.55*smoothstep(8.5,16.,r);
return h+rim*chasm+shelf*chasm-p.y;`,
        albedo: `mix(vec3(.09,.095,.105),vec3(.32,.33,.34),.35+.5*fbm2(p.xz*.20))*(.66+.45*max(0.,n.y))`,
        emit: `{float depth=smoothstep(-2.,-14.,p.y);col+=vec3(.26,.30,.38)*depth*.35;
          float mist=smoothstep(-16.,-1.,p.y)*(.5+.5*sin(p.y*.85+p.x*.05+p.z*.04-uTime*.55));
          col+=vec3(.10,.115,.15)*pow(mist,2.5)*.75;}`,
      }
    ),
    T(
      "aurora-necropolis",
      "Aurora Necropolis",
      "Blocks with lit lids under a green-violet sky",
      "atmospheric",
      {
        hue: 0.40, sky: [0.10, 0.17, 0.18], ground: [0.07, 0.09, 0.10],
        sun: sunFor(28), water: -100, haze: 0.0026,
        H: 4.5, dist: 21, az: 28, fov: 1.50, steps: 181, far: 150,
        field: `vec2 cell=vec2(11.,9.);
vec2 g=mod(q+cell*.5,cell)-cell*.5;
vec2 id=floor((q+cell*.5)/cell);
float bx=1.-smoothstep(2.0,2.5,abs(g.x));
float by=1.-smoothstep(1.1,1.5,abs(g.y));
float boxv=bx*by*(2.2+2.6*hash12(id));
float slab=boxv+step(2.6,boxv)*.5;
float dome=(1.-smoothstep(.5,1.5,length(g)))*1.1*hash12(id+3.);
float plain=-1.1+.22*fbm2(q*.09);
return max(plain,max(slab,dome))-p.y;`,
        albedo: `mix(vec3(.032,.038,.042),vec3(.15,.17,.18),.35+.5*fbm2(p.xz*.5))*(.5+.55*max(0.,n.y))`,
        emit: `{float lid=step(.86,fract(p.y*.6))*step(.4,hash12(floor(p.xz*.4)));col+=vec3(.32,.90,.70)*lid*.18;}`,
      }
    ),
    T(
      "luminous-ash-sea",
      "Luminous Ash Sea",
      "Ash dunes over a bed of molten cracks",
      "atmospheric",
      {
        hue: 0.03, sky: [0.14, 0.11, 0.13], ground: [0.15, 0.08, 0.06],
        sun: sunFor(26), water: -100, haze: 0.0026,
        H: 4, dist: 20, az: 26, fov: 1.50, steps: 181, far: 150,
        field: `float d=2.2*sin(q.x*.14+sin(q.y*.09)*1.4)+1.2*sin(q.y*.20-q.x*.06);
float crest=abs(d)*.55;
float grain=.3*fbm2(q*.4);
return crest+grain-1.1-p.y;`,
        albedo: `mix(vec3(.045,.04,.04),vec3(.19,.165,.15),pow(.5+.5*sin(p.x*.7+p.z*.55),2.))*(.5+.55*max(0.,n.y))`,
        emit: `{float cr=pow(.5+.5*sin((p.x+p.z)*.8),22.)*exp(-abs(p.y)*.5);col+=mix(vec3(1.,.60,.20),vec3(1.,.32,.09),hash12(floor(p.xz*.3)))*cr*.45;}`,
      }
    ),
    T(
      "dark-star-maelstrom",
      "Dark Star Maelstrom",
      "A spiral reef inside a whirlpool, arms turning slowly",
      "atmospheric",
      {
        hue: 0.68, sky: [0.09, 0.11, 0.18], ground: [0.05, 0.06, 0.09],
        sun: sunFor(24), water: -1.4, haze: 0.0030,
        eye: [6, 13, 24],
        aim: [0, 1, 0],
        H: 6, dist: 28, az: 22, fov: 1.44, steps: 187, far: 150,
        field: `float r=length(q);
float a=atan(q.y,q.x);
float arm=pow(.5+.5*sin(a*2.-r*.26+uTime*.05),3.);
float reef=arm*(8.0-5.0*smoothstep(3.,20.,r));
float rim=(1.-smoothstep(2.5,6.,abs(r-22.)))*3.0;
return max(reef*.95,rim*.8)-1.4-p.y;`,
        albedo: `mix(vec3(.03,.035,.05),vec3(.14,.15,.20),pow(.5+.5*sin(atan(p.z,p.x)*2.+length(p.xz)*.25),2.))*(.5+.55*max(0.,n.y))`,
        emit: `{float eye=exp(-length(p.xz)*.22);col+=vec3(.42,.58,.95)*eye*.55;}`,
      }
    ),
    T(
      "weeping-atmosphere",
      "Weeping Atmosphere",
      "Thin dark rods standing in a flooded basin while it rains",
      "atmospheric",
      {
        hue: 0.58, sky: [0.15, 0.18, 0.23], ground: [0.08, 0.09, 0.11],
        sun: sunFor(30), water: -0.8, haze: 0.0032,
        eye: [-14,7,26],
        aim: [2,5,-10],
        H: 9, dist: 30, az: 30, fov: 1.50, steps: 185, far: 150,
        field: `vec2 g=q/16.;vec2 id=floor(g);vec2 f=abs(fract(g)-.5);
float base=1.-smoothstep(.30,.36,max(f.x,f.y));
float hgt=(2.+9.*hash12(id))*step(.28,hash12(id+2.));
float roof=base*hgt;
float tower=step(.86,hash12(id+7.))*base*(hgt+5.);
float plain=-.9+.25*fbm2(q*.07);
return max(plain,max(roof,tower))-p.y;`,
        albedo: `mix(vec3(.055,.062,.072),vec3(.20,.22,.24),.4+.5*fbm2(p.xz*.4))*(.66+.5*max(0.,n.y))`,
        emit: `{float lit=step(.72,fract(p.y*.7))*step(.86,hash12(floor(p.xz*.3)));col+=vec3(1.,.72,.38)*lit*.55;
          float sheet=.5+.5*sin(p.x*.30+p.z*.19-uTime*1.25);
          col+=vec3(.045,.055,.072)*pow(sheet,3.)*.85*(.55+.45*max(0.,n.y));}`,
      }
    ),

    /* ---------------- terrain ------------------------------------------ */
    T(
      "valley-of-first-light",
      "Valley of First Light",
      "Ridged ranges on both sides; light reaches the valley floor last",
      "terrain",
      {
        hue: 0.10, sky: [0.22, 0.20, 0.19], ground: [0.21, 0.15, 0.10],
        sun: sunFor(18), water: -100, haze: 0.0018,
        H: 17, dist: 44, az: 18, fov: 1.44, steps: 206, far: 150,
        field: `float ax=abs(q.x);
float wall=smoothstep(8.,36.,ax);
float m=ridged3(vec3(q*.020,2.0))*23.;
float m2=fbm3(vec3(q*.062,5.3))*4.0;
float floorv=-1.6+.5*sin(q.y*.045)+.3*sin(q.y*.13);
return mix(floorv,m+m2-7.,wall)-p.y;`,
        albedo: `mix(vec3(.075,.07,.06),vec3(.27,.23,.18),.3+.55*ridged3(vec3(p.xz*.08,1.)))*(.55+.55*max(0.,n.y))`,
      }
    ),
    T(
      "saffron-salt-basin",
      "Saffron Salt Basin",
      "A polygon crust of salt plates cracking into the distance",
      "terrain",
      {
        hue: 0.09, sky: [0.24, 0.21, 0.18], ground: [0.25, 0.18, 0.11],
        sun: sunFor(24), water: -100, haze: 0.0016,
        H: 2.4, dist: 26, az: 24, fov: 1.46, steps: 193, far: 150,
        field: `vec2 g=q*.26;vec2 id=floor(g);vec2 f=fract(g)-.5;
float hex=max(abs(f.x)*.866+abs(f.y)*.5,abs(f.y));
float plate=(1.-smoothstep(.30,.42,hex))*(.6+1.0*hash12(id));
float tilt=dot(f,vec2(.35,-.22))*hash12(id+7.);
float far=smoothstep(34.,62.,length(q))*9.;
return plate+tilt+far-1.0-p.y;`,
        albedo: `mix(vec3(.22,.15,.09),vec3(.50,.39,.24),pow(.5+.5*sin(p.x*.5)*sin(p.z*.42),2.))*(.6+.5*max(0.,n.y))`,
      }
    ),
    T(
      "glacier-of-inner-fire",
      "Glacier of Inner Fire",
      "Sharp ice ridges with fire showing through the fissures",
      "terrain",
      {
        hue: 0.52, sky: [0.16, 0.20, 0.26], ground: [0.08, 0.10, 0.14],
        sun: sunFor(26), water: -100, haze: 0.0020,
        H: 15, dist: 40, az: 26, fov: 1.44, steps: 206, far: 150,
        field: `float m=ridged3(vec3(q*.013,3.4))*19.;
float m2=fbm3(vec3(q*.045,9.1))*4.5;
float basin=smoothstep(26.,10.,length(q))*-4.;
return m+m2+basin-9.0-p.y;`,
        albedo: `mix(vec3(.10,.13,.17),vec3(.40,.48,.56),pow(.5+.5*sin(p.x*.6+p.z*.45),2.))*(.55+.55*max(0.,n.y))`,
        emit: `{float f=pow(.5+.5*sin((p.x*1.7+p.z*1.4)),34.);col+=vec3(1.,.40,.15)*f*.42;}`,
      }
    ),
    T(
      "verdant-labyrinth",
      "Verdant Labyrinth",
      "A hedge maze on a slope, walls taller than the paths are wide",
      "terrain",
      {
        hue: 0.31, sky: [0.17, 0.21, 0.18], ground: [0.09, 0.12, 0.08],
        sun: sunFor(30), water: -100, haze: 0.0024,
        H: 4, dist: 20, az: 30, fov: 1.48, steps: 181, far: 150,
        field: `vec2 g=q/7.;vec2 id=floor(g);vec2 f=fract(g)-.5;
float wx=1.-smoothstep(.26,.33,abs(f.x));
float wy=1.-smoothstep(.26,.33,abs(f.y));
float hedge=mix(wy,wx,step(.5,hash12(id)));
float top=.18*sin(q.x*1.6)*sin(q.y*1.5);
float slope=smoothstep(-30.,30.,q.y)*.8;
return hedge*3.4+top+slope-p.y;`,
        albedo: `mix(vec3(.032,.065,.028),vec3(.13,.22,.08),.35+.55*fbm2(p.xz*.9))*(.55+.5*max(0.,n.y))`,
      }
    ),
    T(
      "dunes-of-the-quiet-bell",
      "Dunes of the Quiet Bell",
      "Long dunes with blades of light on the windward faces",
      "terrain",
      {
        hue: 0.12, sky: [0.23, 0.20, 0.18], ground: [0.25, 0.18, 0.11],
        sun: sunFor(28), water: -100, haze: 0.0018,
        H: 4.5, dist: 22, az: 28, fov: 1.50, steps: 187, far: 150,
        field: `float ph=q.x*.10+sin(q.y*.07)*1.7;
float d=3.0*sin(ph)+1.5*sin(q.y*.16-q.x*.045);
float crest=pow(abs(sin(ph)),1.4)*1.5;
float grain=.3*fbm2(q*.3);
return d+crest+grain-3.4-p.y;`,
        albedo: `mix(vec3(.16,.11,.07),vec3(.46,.34,.20),pow(.5+.5*sin(p.x*.45+sin(p.z*.29)),2.))*(.6+.5*max(0.,n.y))`,
      }
    ),
    T(
      "midnight-terraces",
      "Midnight Terraces",
      "Flooded terraces stepping up a dark hillside",
      "terrain",
      {
        hue: 0.55, sky: [0.13, 0.16, 0.22], ground: [0.07, 0.08, 0.11],
        sun: sunFor(212), water: 0.0, haze: 0.0024,
        eye: [-2,13,24],
        aim: [0,4,-12],
        H: 9, dist: 26, az: 24, fov: 1.52, steps: 190, far: 150,
        field: `float climb=clamp((-q.y+8.)*.30,0.,10.);
float terr=floor(climb)*1.0;
float lip=smoothstep(.80,1.,fract(climb))*.5;
float water=step(.45,fract(climb))*-.22;
float bank=abs(sin(q.x*.45))*0.;
return terr+lip+water-1.2-p.y;`,
        albedo: `mix(vec3(.08,.09,.10),vec3(.30,.31,.32),.4+.5*fbm2(p.xz*.3))*(.66+.5*max(0.,n.y))`,
        emit: `{float glint=pow(.5+.5*sin(p.y*1.9),18.);col+=vec3(.42,.54,.84)*glint*.14;}`,
      }
    ),
    T(
      "cinnabar-canyon-sea",
      "Cinnabar Canyon Sea",
      "High red canyon walls with a river running between them",
      "terrain",
      {
        hue: 0.02, sky: [0.22,0.15,0.12], ground: [0.25,0.10,0.06],
        sun: sunFor(188), water: -0.2, haze: 0.0022,
        eye: [0,4.2,30],
        aim: [2,9,-20],
        H: 13, dist: 32, az: 0, fov: 1.50, steps: 200, far: 150,
        field: `float cx=abs(q.x+5.*sin(q.y*.045));
float wall=smoothstep(7.,15.,cx)*21.;
float ledge=floor(wall*.42)*.62;
float talus=smoothstep(4.,9.,cx)*1.8;
float floorv=-.7+.35*sin(q.y*.06)+.25*sin(q.y*.23);
return max(floorv,max(ledge,talus))-p.y;`,
        albedo: `mix(vec3(.13,.048,.032),vec3(.42,.15,.08),pow(.5+.5*sin(p.y*.55),3.))*(.66+.45*max(0.,n.y))`,
      }
    ),
    T(
      "meadow-above-the-storm",
      "Meadow Above the Storm",
      "A grass plateau that ends over a sea of cloud",
      "terrain",
      {
        hue: 0.28, sky: [0.19, 0.22, 0.25], ground: [0.10, 0.13, 0.08],
        sun: sunFor(24), water: -100, haze: 0.0022,
        eye: [-2, 13.5, 17],
        aim: [0, 8.0, -26],
        steps: 180, far: 150,
        H: 9.5, dist: 34, az: 18, fov: 1.50, steps: 180, far: 150,
        field: `float r=length(q);
float ang=atan(q.y,q.x);
float rim=1.+.16*sin(ang*3.1)+.09*sin(ang*7.3);
float edge=smoothstep(19.,25.,r*rim);
float cloud=-6.5+1.6*fbm2(q*.045+vec2(uTime*.010,0.));
float grass=9.0+.5*fbm2(q*.06);
return mix(grass,cloud,edge)-p.y;`,
        albedo: `mix(mix(mix(vec3(.05,.08,.032),vec3(.19,.27,.10),.4+.5*fbm2(p.xz*.5))*(1.+.22*sin(p.x*2.6)*sin(p.z*2.2)),vec3(.16,.15,.13),smoothstep(.6,.9,fbm2(p.xz*.9))),vec3(.10,.10,.09),.0)*(.55+.5*max(0.,n.y))`,
      }
    ),

    /* ---------------- optical ------------------------------------------ */
    T(
      "kaleidoscope-iron-rain",
      "Kaleidoscope Iron Rain",
      "Eight-fold radial blades mirrored around a single axis",
      "optical",
      {
        hue: 0.63, sky: [0.14, 0.15, 0.20], ground: [0.08, 0.08, 0.10],
        sun: sunFor(0), water: -100, haze: 0.0026,
        eye: [0, 9, 22],
        aim: [0, 1, 0],
        steps: 175, far: 150,
        H: 6, dist: 26, az: 0, fov: 1.46, steps: 180, far: 150,
        field: `float r=length(q);
float a=atan(q.y,q.x);
float wedge=abs(fract(a/(TAU/8.))-.5)*2.;
float ridge=pow(max(0.,1.-wedge*1.25),1.7);
float ripple=.42+.58*sin(r*.52-uTime*.05);
float blend=fbm2(q*.10);
return ridge*(ripple*.9+blend*.35)*6.0-1.6-p.y;`,
        albedo: `mix(vec3(.14,.145,.16),vec3(.30,.31,.35),pow(1.-abs(sin(atan(p.z,p.x)*8.)),2.))*(.62+.5*max(0.,n.y))`,
        emit: `{float edge=pow(.5+.5*sin(atan(p.z,p.x)*16.),14.)*exp(-length(p.xz)*.02);col+=vec3(.50,.58,.78)*edge*.10;}`,
      }
    ),
    T(
      "moire-sanctum",
      "Moire Sanctum",
      "Two interference patterns laid over each other as terrain",
      "optical",
      {
        hue: 0.66, sky: [0.16,0.16,0.20], ground: [0.09,0.09,0.11],
        sun: sunFor(26), water: -100, haze: 0.0024,
        H: 4.2, dist: 22, az: 26, fov: 1.48, steps: 170, far: 150,
        field: `float r=length(q);
float g1=sin(q.x*.62)+sin(q.y*.62)*0.;
float w1=sin(q.x*.62)*sin(q.y*.62);
float w2=sin(r*.85-uTime*.08);
float h=(w1*.55+w2*.45)*3.2;
float carve=abs(sin(q.x*.31+q.y*.31))*.35;
return h-carve-1.5-p.y;`,
        albedo: `mix(vec3(.075,.075,.085),vec3(.30,.30,.34),pow(.5+.5*sin(p.x*.62)*sin(p.z*.62),2.))*(.6+.5*max(0.,n.y))`,
      }
    ),
    T(
      "crystalline-interference",
      "Crystalline Interference",
      "Faceted crystal shelves, every face a different refraction",
      "optical",
      {
        hue: 0.48, sky: [0.17, 0.19, 0.23], ground: [0.09, 0.1, 0.13],
        sun: sunFor(196), water: -100, haze: 0.0022,
        eye: [-7, 7, 24],
        aim: [0, 3, -8],
        H: 10, dist: 32, az: 26, fov: 1.50, steps: 185, far: 150,
        field: `vec2 g=mod(q+6.,12.)-6.;
vec2 id=floor((q+6.)/12.);
float d=max(abs(g.x)*.50,abs(g.y)*.44);
float hgt=3.+6.*hash12(id);
float tower=(1.-smoothstep(.3,2.6,d))*hgt;
float facets=abs(sin(atan(g.y,g.x)*3.+hash12(id)*6.))*.9;
float plain=-1.4+.25*fbm2(q*.08);
return max(plain,tower+facets*.5)-p.y;`,
        albedo: `mix(vec3(.22,.26,.31),vec3(.52,.60,.68),pow(.5+.5*sin(atan(p.z,p.x)*3.),2.))*(.70+.5*max(0.,n.y))`,
        emit: `{float e=pow(1.-abs(dot(n,normalize(vec3(.5,.7,.5)))),5.);col+=vec3(.42,.62,.95)*e*.20;}`,
      }
    ),
    T(
      "prism-cataract",
      "Prism Cataract",
      "Water falling in stepped sheets, spectrum caught on every lip",
      "optical",
      {
        hue: 0.75, sky: [0.16, 0.18, 0.23], ground: [0.08, 0.09, 0.12],
        sun: sunFor(26), water: -100, haze: 0.0024,
        H: 11, dist: 33, az: 34, fov: 1.44, steps: 193, far: 150,
        field: `float band=(-q.y)*.20+3.;
float st=clamp(floor(band)*1.45,0.,11.);
float tread=smoothstep(.70,1.,fract(band))*.75;
float h=st+tread;
float chan=1.-smoothstep(8.,13.,abs(q.x));
return mix(-2.4,h,chan)-p.y;`,
        albedo: `mix(vec3(.06,.07,.085),vec3(.26,.28,.32),.4+.5*fbm2(p.xz*.35))*(.5+.5*max(0.,n.y))`,
        emit: `{float sp=pow(.5+.5*sin(p.y*2.0),22.);col+=mix(vec3(1.,.5,.7),vec3(.5,.8,1.),.5+fract(p.y*.2))*sp*.30;}`,
      }
    ),
    T(
      "silk-of-solar-wind",
      "Silk of Solar Wind",
      "Long parallel silk ripples, back-lit, running to the horizon",
      "optical",
      {
        hue: 0.14, sky: [0.24, 0.20, 0.17], ground: [0.23, 0.16, 0.09],
        sun: sunFor(30, 200, 0.95), water: -100, haze: 0.0016,
        H: 2.4, dist: 18, az: 30, fov: 1.48, steps: 187, far: 150,
        field: `float ph=q.x*.34+uTime*.05;
float w=.95*sin(ph)+.40*sin(q.x*.86-q.y*.18)+.25*sin(q.y*.22);
float fine=.10*sin(q.x*1.5+q.y*.28);
float dunes=.22*fbm2(vec2(q.x*.07,q.y*.04));
return w+fine+dunes-1.5-p.y;`,
        albedo: `mix(vec3(.16,.11,.06),vec3(.44,.32,.17),pow(.5+.5*sin(p.x*.4),2.))*(.55+.55*max(0.,n.y))`,
        emit: `{float sheen=pow(.5+.5*sin(p.x*.4),14.);col+=vec3(1.,.80,.52)*sheen*.22;}`,
      }
    ),
    T(
      "lace-of-falling-numbers",
      "Lace of Falling Numbers",
      "A pierced screen of columns; light falls through the holes",
      "optical",
      {
        hue: 0.35, sky: [0.16, 0.19, 0.20], ground: [0.08, 0.10, 0.09],
        sun: sunFor(22), water: -100, haze: 0.0024,
        H: 16, dist: 41, az: 22, fov: 1.44, steps: 200, far: 150,
        field: `vec2 cell=vec2(6.,9.);
vec2 g=mod(q+cell*.5,cell)-cell*.5;
vec2 id=floor((q+cell*.5)/cell);
float d=length(g*vec2(1.,.55));
float col=(1.-smoothstep(.55,1.0,d))*(11.+5.*hash12(id));
float slot=(1.-smoothstep(.0,.5,length(vec2((g.x)*1.4,(g.y)*.6))))*5.;
float base=-1.4;
return max(base,col-max(0.,slot)-1.0)-p.y;`,
        albedo: `mix(vec3(.05,.06,.05),vec3(.22,.26,.22),.35+.5*fbm2(p.xz*.6))*(.5+.55*max(0.,n.y))`,
        emit: `{float bit=step(.78,fract(p.y*1.2))*step(.65,fract(p.x*.9));col+=vec3(.50,.90,.50)*bit*.16;}`,
      }
    ),
    T(
      "caustic-cathedral",
      "Caustic Cathedral",
      "A ribbed basin filled with water, caustics across the vault floor",
      "optical",
      {
        hue: 0.42, sky: [0.16, 0.2, 0.23], ground: [0.08, 0.11, 0.12],
        sun: sunFor(196), water: -0.6, haze: 0.0024,
        eye: [0,7,24],
        aim: [0,0,-6],
        H: 4, dist: 24, az: 24, fov: 1.50, steps: 190, far: 150,
        field: `float r=length(q);
float bowl=-smoothstep(34.,8.,r)*4.6;
float rib=abs(sin(atan(q.y,q.x)*9.))*(1.-smoothstep(30.,8.,r))*2.1;
float shelf=floor((bowl-rib)*1.1)*.40;
float rim=(1.-smoothstep(1.5,4.0,abs(r-27.)))*4.4;
return bowl-rib+shelf+rim-1.2-p.y;`,
        albedo: `mix(vec3(.14,.17,.185),vec3(.44,.48,.50),.4+.5*fbm2(p.xz*.35))*(.70+.5*max(0.,n.y))`,
        emit: `{float c=pow(.5+.5*sin(p.x*1.0+sin(p.z*1.2)),9.)*pow(.5+.5*sin(p.z*.9+sin(p.x*1.3)),9.);col+=vec3(.50,.82,.92)*c*.16;}`,
      }
    ),
    T(
      "meridian-of-infinite-doors",
      "Meridian of Infinite Doors",
      "Portal frames receding down a corridor of light",
      "optical",
      {
        hue: 0.16, sky: [0.18, 0.18, 0.17], ground: [0.12, 0.11, 0.09],
        sun: sunFor(0), water: -100, haze: 0.0024,
        eye: [0, 5.6, 26],
        aim: [0, 4.4, -22],
        steps: 180, far: 150,
        H: 8.2, dist: 34, az: 52, fov: 1.44, steps: 180, far: 150,
        field: `float side=1.-smoothstep(.55,1.5,abs(abs(q.x)-5.5));
float wallh=7.2*side;
float cross=1.-smoothstep(.35,1.1,abs(mod(q.y,9.5)-4.75));
float span=1.-smoothstep(4.6,7.0,abs(q.x));
float lintel=cross*span*smoothstep(3.4,4.2,abs(q.x))*8.2;
return max(-1.0,max(wallh,lintel))-p.y;`,
        albedo: `mix(vec3(.10,.095,.085),vec3(.34,.32,.28),pow(.5+.5*sin(p.z*.5),2.))*(.62+.5*max(0.,n.y))`,
        emit: `{float through=pow(.5+.5*sin(p.z*.6),10.)*smoothstep(4.4,.4,abs(p.x));col+=vec3(1.,.90,.68)*through*.30;}`,
      }
    ),
  ];

  const REQUIRED = [
    "hue", "sky", "ground", "sun", "water", "haze",
    "H", "dist", "az", "fov", "steps", "far", "field", "albedo",
  ];
  specs.forEach((s) => {
    const missing = REQUIRED.filter((k) => s.opt[k] === undefined);
    if (missing.length)
      throw new Error("XIII " + s.id + " is missing: " + missing.join(", "));
    for (const [k, n] of [["sky", 3], ["ground", 3], ["sun", 3]])
      if (!Array.isArray(s.opt[k]) || s.opt[k].length !== n)
        throw new Error("XIII " + s.id + " needs " + n + " numbers for " + k);
    for (const k of ["eye", "aim"])
      if (s.opt[k] !== undefined && (!Array.isArray(s.opt[k]) || s.opt[k].length !== 3))
        throw new Error("XIII " + s.id + " needs 3 numbers for " + k);
    for (const k of ["hue", "water", "haze", "H", "dist", "az", "fov", "steps", "far"])
      if (!Number.isFinite(s.opt[k]))
        throw new Error("XIII " + s.id + " needs a number for " + k);
    if (!/-p\.y;\s*$/.test(s.opt.field))
      throw new Error("XIII " + s.id + " field must return a heightfield (-p.y)");
  });

  const sunFromView = (o) => {
    const e = o.eye || [0, o.H, o.dist],
      a = o.aim || [0, o.H * 0.55, 0];
    const dx = a[0] - e[0],
      dz = a[2] - e[2],
      len = Math.hypot(dx, dz) || 1;
    // light from the camera side so the faces we see are the lit faces
    const v = [-(dx / len) * 0.80, 0.52, -(dz / len) * 0.80],
      l = Math.hypot(v[0], v[1], v[2]);
    return v.map((x) => +(x / l).toFixed(3));
  };

  const shader = (i) => {
    const s = specs[i];
    const opt = s.opt.eye ? { ...s.opt, sun: sunFromView(s.opt) } : s.opt;
    return `float worldField(vec3 p){vec2 q=p.xz;\n${opt.field}\n}\n${SH.common(
      opt
    )}\n${SH.main(opt)}`;
  };

  // Kernel defaults consumed by WorldKernels.defaults()/uniforms() and by the
  // sound-print generator. These are the same authored constants the shader
  // carries inline; they do not alter the rendered image.
  // Must stay inside nursery.js FORMS, which is what breeding validates against.
  const SHAPES = [
    "lattice", "vault", "terrain", "ribbon", "orbit", "bloom", "branch", "coral",
    "membrane", "sponge", "vortex", "shell",
  ];
  const defaults = (i) => {
    const s = specs[i];
    return {
      shape: SHAPES[i % SHAPES.length],
      hue: s.opt.hue,
      lobes: 5 + (i % 7),
      force: i % 8,
      growth: 0.72,
      mutation: 0.6,
      coupling: 0.64,
      lifecycle: 0.58,
      atmosphere: 0.6,
      symmetry: 0.56,
      drift: 0.52,
      afterglow: 0.7,
      topology: ["colony", "orbit", "lattice", "flow"][i % 4],
      material: i % 3 === 0 ? "mineral" : i % 3 === 1 ? "glass" : "silk",
      rhythm: i % 2 ? "tide" : "growth",
      depth: 0.82,
      relief: 0.74,
      landform: s.id,
      sky: ["dawn", "aurora", "storm", "night"][i % 4],
      water: s.opt.water > -100 ? "tide" : "dry",
      weather: i % 5 === 0 ? "mist" : i % 7 === 3 ? "rain" : "clear",
      camera: i % 3 === 0 ? "overlook" : i % 3 === 1 ? "glide" : "shore",
      scale: 0.72,
    };
  };

  const designs = specs.map((s, i) => ({
    id: s.id,
    name: s.name,
    note: s.note,
    family: s.family,
    shader: () => shader(i),
  }));

  const api = { specs, designs, shader, defaults };
  if (typeof module !== "undefined") module.exports = api;
  else root.LuminousXIII = api;
})(typeof window !== "undefined" ? window : globalThis);
