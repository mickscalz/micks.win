/* Eighteen moving compositions: projected meshes, painted skies and living
   schools. Coordinates are resolution-independent; random streams are local. */
(function(w){
  'use strict';
  var TAU=Math.PI*2,reg=w.CabinetV.register;
  function rng(s){return function(){s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}
  function room(n,id,name,tag,blurb,init,frame,extra){return reg(n,id,name,tag,blurb,'2d',Object.assign({init:init,frame:frame,previewFrames:1},extra));}
  function bg(c,W,H,colors){var g=c.createLinearGradient(0,0,W,H);colors.forEach(function(s,i){g.addColorStop(i/(colors.length-1),s);});c.fillStyle=g;c.fillRect(0,0,W,H);}
  function rot(p,t){var a=t*.12,ca=Math.cos(a),sa=Math.sin(a),x=p[0]*ca+p[2]*sa,z=-p[0]*sa+p[2]*ca;return[x,p[1],z];}
  function proj(p,W,H){var k=Math.min(W,H)*1.2/Math.max(.3,3.8+p[2]);return[W*.52+p[0]*k,H*.49+p[1]*k];}
  function poly(c,P){c.beginPath();c.moveTo(P[0][0],P[0][1]);for(var i=1;i<P.length;i++)c.lineTo(P[i][0],P[i][1]);c.closePath();}
  function faces(c,F,W,H){F.sort(function(a,b){return b.z-a.z;});F.forEach(function(f){poly(c,f.p.map(function(p){return proj(p,W,H);}));c.fillStyle=f.color;c.fill();c.strokeStyle=f.stroke||f.color;c.lineWidth=.45;c.stroke();});}
  function starGlow(c,x,y,r,color){var g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}

  room(4,'nebular-migration','Nebular Migration','3D spiral arms · luminous star populations · orbital drift',
    'A galaxy does not turn as one thing. It turns as a hundred billion small things, each carrying a little of the dark with it.',
    function(){var r=rng(501);this.stars=[];for(var i=0;i<5200;i++){var radius=Math.pow(r(),.65)*2.,a=radius*3.5+(i%4)*TAU/4+(r()-.5)*.5;this.stars.push([Math.cos(a)*radius,(r()-.5)*.16,Math.sin(a)*radius,r(),r()]);}},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#06031c','#15052d','#030d26']);starGlow(c,W*.52,H*.49,H*.38,'rgba(86,28,155,.32)');var bins=Array.from({length:8},function(){return[];});
      this.stars.forEach(function(s){var a=t*.035,sn=Math.sin(a),co=Math.cos(a),x=s[0]*co+s[2]*sn,z=-s[0]*sn+s[2]*co,p=[x,s[1]+z*.36,z*.8],P=proj(p,W,H);bins[Math.floor(s[3]*7.99)].push([P,s[4],p[2]]);});
      c.globalCompositeOperation='lighter';bins.forEach(function(B,i){c.beginPath();B.forEach(function(s){var size=(1.05+s[1]*1.8)*Math.min(W,H)/600;c.rect(s[0][0],s[0][1],size,size);});c.fillStyle=['#5d43b2','#6e6ee5','#4dbacb','#77bfe5','#c887db','#ef6fb0','#f7af77','#ffe8bc'][i];c.fill();});starGlow(c,W*.52,H*.49,H*.10,'rgba(255,184,130,.65)');c.globalCompositeOperation='source-over';
    });

  room(7,'tidal-ribbons','Tidal Ribbons','woven sheet waves · depth-sorted strips · satin gradients',
    'A tide moving through a loom wide as the sea. Every thread keeps its own rhythm; the whole sheet remembers all of them.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#090422','#170d39','#021b29']);var F=[];
      function p(x,y){return rot([x,y*.55,.3*Math.sin(x*2.2+y*2.-t*.6)+.15*Math.cos(x*4.-t*.3)],t*.2);}
      for(var j=0;j<22;j++)for(var i=0;i<45;i++){var x=(i/45-.5)*4.,y=(j/22-.5)*2.9,V=[p(x,y),p(x+.088,y),p(x+.088,y+.065),p(x,y+.065)],z=V.reduce(function(s,v){return s+v[2];},0)/4,h=(j*12+i*.8+t*3)%360;F.push({p:V,z:z,color:'hsl('+h+',65%,'+(35+20*(.5+.5*Math.cos(x*2.+y-t*.6)))+'%)'});}faces(c,F,W,H);
    });

  room(10,'chromatic-reef','Chromatic Reef','coral branching · polychrome skeletons · underwater drift',
    'A reef built from light instead of limestone. Its branches are busy turning empty water into a place.',
    function(){var r=rng(510),branches=[];function grow(x,y,z,a,len,depth,h){if(depth<1)return;var end=[x+Math.cos(a)*len,y-Math.sin(a)*len,z+(r()-.5)*len];branches.push({a:[x,y,z],b:end,d:depth,h:h});grow(end[0],end[1],end[2],a+.25+r()*.3,len*.72,depth-1,h+9);grow(end[0],end[1],end[2],a-.25-r()*.3,len*.73,depth-1,h-7);}for(var k=0;k<6;k++)grow((k-2.5)*.52,.9,(r()-.5),Math.PI*.5,.4,7,160+k*35);this.B=branches;},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#020c29','#052c42','#08102e']);var B=this.B.map(function(b){var a=rot(b.a,t*.2),d=rot(b.b,t*.2);a[0]+=.025*Math.sin(t*.6+a[1]*3.);d[0]+=.025*Math.sin(t*.6+d[1]*3.);return{a:a,b:d,d:b.d,h:b.h,z:(a[2]+d[2])/2};});B.sort(function(a,b){return b.z-a.z;});c.lineCap='round';B.forEach(function(b){var a=proj(b.a,W,H),d=proj(b.b,W,H);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(d[0],d[1]);c.strokeStyle='hsl('+b.h+',65%,'+(40+b.d*3)+'%)';c.lineWidth=Math.max(.6,b.d*Math.min(W,H)*.0015);c.stroke();});c.lineCap='butt';
    });

  room(13,'firefly-citadel','Firefly Citadel','spherical habitat · radiant towers · orbital fireflies',
    'A city that has grown around its own small world. The towers point toward every horizon, and the smallest lights are free to leave.',
    function(){var r=rng(513);this.heights=Array.from({length:288},function(){return .06+r()*.31;});},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#040a25','#22072e','#071c33']);var F=[],NL=24,NT=12;
      function point(lat,lon,r){var p=rot([Math.cos(lat)*Math.cos(lon)*r,Math.sin(lat)*r,Math.cos(lat)*Math.sin(lon)*r],t*.7),a=.28;return[p[0],p[1]*Math.cos(a)-p[2]*Math.sin(a),p[1]*Math.sin(a)+p[2]*Math.cos(a)];}
      function push(P,h,l,edge){F.push({p:P,z:P.reduce(function(v,p){return v+p[2];},0)/P.length,color:'hsl('+h+',62%,'+l+'%)',stroke:edge?'hsla('+h+',90%,75%,.3)':undefined});}
      for(var j=0;j<NT;j++)for(var i=0;i<NL;i++){var lat=-Math.PI/2+j/NT*Math.PI,lon=i/NL*TAU,dl=Math.PI/NT,da=TAU/NL,h=(i*17+j*27+t*2+165)%360;
        var floor=[point(lat,lon,1.),point(lat+dl,lon,1.),point(lat+dl,lon+da,1.),point(lat,lon+da,1.)];push(floor,210,10,false);
        if(j===0||j===NT-1)continue;var Ht=this.heights[j*NL+i],la=lat+dl*.18,lb=lat+dl*.82,aa=lon+da*.18,ab=lon+da*.82;
        var B=[point(la,aa,1.005),point(lb,aa,1.005),point(lb,ab,1.005),point(la,ab,1.005)],T=[point(la,aa,1.+Ht),point(lb,aa,1.+Ht),point(lb,ab,1.+Ht),point(la,ab,1.+Ht)];
        for(var k=0;k<4;k++)push([B[k],B[(k+1)%4],T[(k+1)%4],T[k]],h,20+k*5,true);push(T,h,52+Ht*35,true);}
      faces(c,F,W,H);c.globalCompositeOperation='lighter';for(var k=0;k<85;k++){var a=k*2.399+t*.08,r=1.4+.25*Math.sin(k),p=proj(rot([Math.cos(a)*r,Math.sin(a)*r*.7,.5*Math.sin(k*1.7+t*.2)],t*.3),W,H);c.fillStyle='hsla('+(30+k*5)+',100%,75%,.75)';c.fillRect(p[0],p[1],1.7,1.7);}c.globalCompositeOperation='source-over';
    });

  room(16,'prismatic-koi','Prismatic Koi','steering shoal · articulated bodies · reflected ripples',
    'The fish carry fragments of sunset beneath the water. Each turn joins the fragments into a new picture.',
    function(){var r=rng(516);this.fish=[];for(var i=0;i<32;i++)this.fish.push({x:r(),y:r(),a:r()*TAU,s:.04+r()*.04,h:i*11.25});},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t,dt=S.dt;bg(c,W,H,['#021b29','#073c47','#081831']);var F=this.fish;
      F.forEach(function(f,i){if(dt>0){f.a+=Math.sin(t*.4+i)*dt*.5;f.x+=Math.cos(f.a)*dt*.045;f.y+=Math.sin(f.a)*dt*.045;f.x=(f.x+1.1)%1.1;f.y=(f.y+1.1)%1.1;}c.save();c.translate(f.x*W,f.y*H);c.rotate(f.a);var L=f.s*Math.min(W,H),tail=Math.sin(t*4.+i)*L*.12;c.beginPath();c.moveTo(L*.5,0);c.bezierCurveTo(L*.2,-L*.22,-L*.25,-L*.2,-L*.5,tail);c.bezierCurveTo(-L*.25,L*.2,L*.2,L*.22,L*.5,0);var g=c.createLinearGradient(-L*.5,0,L*.5,0);g.addColorStop(0,'hsl('+f.h+',75%,48%)');g.addColorStop(.55,'hsl('+(f.h+35)+',80%,72%)');g.addColorStop(1,'#f3ddc0');c.fillStyle=g;c.fill();c.beginPath();c.moveTo(-L*.4,tail);c.lineTo(-L*.8,-L*.2+tail);c.lineTo(-L*.8,L*.2+tail);c.closePath();c.fillStyle='hsla('+f.h+',80%,64%,.6)';c.fill();c.restore();});
      c.strokeStyle='rgba(137,225,236,.12)';c.lineWidth=.8;for(var i=0;i<9;i++){var r=((t*.03+i*.11)%1)*Math.min(W,H)*.4;c.beginPath();c.ellipse(W*(.2+(i*.27)% .6),H*(.2+(i*.19)%.6),r,r*.45,.2,0,TAU);c.stroke();}
    },{previewFrames:90});

  room(19,'aerial-archipelago','Aerial Archipelago','floating islands · layered silhouettes · atmospheric vastness',
    'An archipelago above the weather. The islands cast their shadows on clouds that have never seen the sea.',
    function(){var r=rng(519);this.islands=Array.from({length:35},function(){return{x:r(),y:r(),z:r(),s:r()};});},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#160e41','#9a447f','#e8a36c']);var B=this.islands.slice().sort(function(a,b){return b.z-a.z;});B.forEach(function(b,i){var x=((b.x+t*.005*(1.-b.z))%1.2-.1)*W,y=(.18+b.y*.65)*H,sz=(.035+.1*b.s)*(1.-b.z*.65)*W;c.beginPath();c.moveTo(x-sz,y);c.bezierCurveTo(x-sz*.4,y-sz*.3,x+sz*.3,y-sz*.22,x+sz,y);c.lineTo(x+sz*.3,y+sz*.3);c.lineTo(x-sz*.2,y+sz*.8);c.lineTo(x-sz*.55,y+sz*.2);c.closePath();c.fillStyle='hsla('+(215+b.z*65)+',40%,'+(15+b.z*35)+'%,'+(.9-b.z*.2)+')';c.fill();c.beginPath();c.ellipse(x,y,sz,sz*.15,0,0,TAU);c.fillStyle='hsla('+(160+b.z*70)+',40%,'+(30+b.z*35)+'%,.8)';c.fill();});
      var fog=c.createLinearGradient(0,H*.4,0,H);fog.addColorStop(0,'rgba(223,139,165,0)');fog.addColorStop(1,'rgba(205,133,167,.45)');c.fillStyle=fog;c.fillRect(0,H*.4,W,H*.6);
    });

  room(22,'infinite-origami','Infinite Origami','unfolding octahedra · nested solids · crystalline choreography',
    'A sculpture that keeps finding another inside. The folds do not conceal anything. They are how the inside learns to be outside.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#080720','#20113d','#061d2a']);var F=[];
      for(var level=0;level<6;level++){var R=1.45-level*.19,spin=t*.16+level*.24,V=[[0,-R,0],[R,0,0],[0,0,R],[-R,0,0],[0,0,-R],[0,R,0]].map(function(v){var p=rot(v,spin*8.);var a=.25*Math.sin(t*.3+level);return[p[0],p[1]*Math.cos(a)-p[2]*Math.sin(a),p[1]*Math.sin(a)+p[2]*Math.cos(a)];});
        for(var j=0;j<4;j++)for(var k=0;k<2;k++){var A=V[k?5:0],B=V[j+1],C=V[(j+1)%4+1],mid=B.map(function(v,d){return(v+C[d])/2;}),axis=B.map(function(v,d){return v-C[d];}),len=Math.hypot(...axis);axis=axis.map(function(v){return v/len;});var v=A.map(function(x,d){return x-mid[d];}),angle=.55*Math.sin(t*.32+level*.55+j*.4),co=Math.cos(angle),si=Math.sin(angle),dot=v.reduce(function(n,x,d){return n+x*axis[d];},0),cross=[axis[1]*v[2]-axis[2]*v[1],axis[2]*v[0]-axis[0]*v[2],axis[0]*v[1]-axis[1]*v[0]],tip=v.map(function(x,d){return mid[d]+x*co+cross[d]*si+axis[d]*dot*(1.-co);}),P=[tip,B,C],h=level*35+j*63+t*3;F.push({p:P,z:(P[0][2]+P[1][2]+P[2][2])/3,color:'hsla('+h+',70%,'+(34+level*4+k*10)+'%,.84)',stroke:'rgba(225,240,250,.23)'});}}

      faces(c,F,W,H);
    });

  room(25,'velvet-mandala','Velvet Mandala','layered petals · spectral ink · slow radial counterpoint',
    'A flower too elaborate to belong to a single season. Every ring opens at a different speed.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#15031e','#070c24','#230a27']);c.save();c.translate(W*.52,H*.49);var R=Math.min(W,H)*.43;
      for(var ring=7;ring>=0;ring--){var count=12+ring*4,rad=R*(.14+ring*.115);c.save();c.rotate(t*(ring%2?.025:-.02));for(var i=0;i<count;i++){var a=i/count*TAU,hue=(i/count*210+ring*32+t*2)%360;c.save();c.rotate(a);c.beginPath();c.moveTo(rad*.55,0);c.bezierCurveTo(rad*.85,-R*.055,rad*1.08,-R*.035,rad*1.10,0);c.bezierCurveTo(rad*1.08,R*.035,rad*.85,R*.055,rad*.55,0);var g=c.createLinearGradient(rad*.55,0,rad*1.1,0);g.addColorStop(0,'hsl('+hue+',65%,18%)');g.addColorStop(.7,'hsl('+hue+',72%,58%)');g.addColorStop(1,'hsl('+(hue+25)+',85%,75%)');c.fillStyle=g;c.fill();c.restore();}c.restore();}c.restore();
    });

  room(28,'ribbon-torus','Ribbon Torus','woven toroidal surface · depth-sorted facets · chromatic weaving',
    'A ring braided from currents of colour. You can follow a strand for as long as you like; it never quite returns as the same strand.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#030c24','#1a083a','#041c30']);var F=[];function P(a,b){var r=.37+.08*Math.sin(a*4.+t*.4),v=[(1.+r*Math.cos(b))*Math.cos(a),r*Math.sin(b),(1.+r*Math.cos(b))*Math.sin(a)];var p=rot(v,t);return[p[0],p[1]*.8-p[2]*.4,p[1]*.4+p[2]*.8];}
      for(var i=0;i<72;i++)for(var j=0;j<16;j++){if((i+j)%3===0)continue;var a=i/72*TAU,b=j/16*TAU,V=[P(a,b),P(a+TAU/72,b),P(a+TAU/72,b+TAU/16),P(a,b+TAU/16)];F.push({p:V,z:V.reduce(function(s,p){return s+p[2];},0)/4,color:'hsl('+((i*4+j*7+t*3)%360)+',65%,'+(30+20*Math.sin(b+1.))+'%)'});}faces(c,F,W,H);
    });

  room(31,'bismuth-temple','Bismuth Temple','stepped mineral terraces · isometric spirals · oxide colour',
    'A mineral that grew as if it had already seen a city. Its staircases are too small to climb, too large to stop exploring.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#081323','#112d3b','#1c1234']);var R=Math.min(W,H)*.25;function P(x,y,z){return[W*.52+(x-y)*R*.75,H*.52+(x+y)*R*.36-z*R];}
      for(var layer=0;layer<15;layer++){var r=1.-layer*.052,z=layer*.045+.06*Math.sin(t*.3+layer*.24),inside=r-.045,V=[P(-r,-r,z),P(r,-r,z),P(r,r,z),P(-r,r,z)],I=[P(-inside,-inside,z+.045),P(inside,-inside,z+.045),P(inside,inside,z+.045),P(-inside,inside,z+.045)];for(var j=0;j<4;j++){poly(c,[V[j],V[(j+1)%4],I[(j+1)%4],I[j]]);c.fillStyle='hsl('+((layer*29+j*18+t*3)%360)+',65%,'+(35+j*7)+'%)';c.fill();c.strokeStyle='rgba(220,239,228,.35)';c.lineWidth=.6;c.stroke();}}
    });

  room(33,'painted-cosmos','Painted Cosmos','painted gas veils · additive atmospheres · drifting pigments',
    'A sky painted before there were edges. Each new veil changes the colours of every veil behind it.',
    function(){var r=rng(533);this.puffs=Array.from({length:100},function(){return{x:r(),y:r(),s:.07+r()*.23,h:r()*360,p:r()*TAU};});},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#06031c','#0c0629','#040d22']);c.globalCompositeOperation='screen';this.puffs.forEach(function(p){var x=(p.x+.025*Math.sin(t*.07+p.p))*W,y=(p.y+.04*Math.cos(t*.06+p.p))*H,r=p.s*Math.min(W,H);var g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'hsla('+p.h+',90%,50%,.22)');g.addColorStop(.5,'hsla('+(p.h+30)+',90%,45%,.09)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);});c.globalCompositeOperation='source-over';
    });

  room(34,'neon-topology','Neon Topology','torus-knot tubes · depth ordering · luminous crossings',
    'One unbroken line, woven into a room. Each crossing is a promise that the line will find its way through.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#06051c','#14092e','#031c28']);var points=[];
      for(var i=0;i<1250;i++){var a=i/1250*TAU,r=1.+.35*Math.cos(5*a),p=rot([r*Math.cos(3*a),.35*Math.sin(5*a),r*Math.sin(3*a)],t);points.push({p:p,a:a});}points.sort(function(a,b){return b.p[2]-a.p[2];});
      points.forEach(function(q){var P=proj(q.p,W,H),r=Math.min(W,H)*.011/(1.+q.p[2]*.15),h=q.a/TAU*300+t*4;c.beginPath();c.arc(P[0],P[1],r,0,TAU);c.fillStyle='hsl('+h+',75%,50%)';c.fill();c.beginPath();c.arc(P[0]-r*.22,P[1]-r*.25,r*.35,0,TAU);c.fillStyle='hsla('+h+',80%,85%,.6)';c.fill();});
    });

  room(36,'auric-swarm','Auric Swarm','coupled orbital drift · additive particles · gravity theatre',
    'A small parliament of stars arguing about where the centre ought to be. They never agree, and the disagreement is luminous.',
    function(){var r=rng(536);this.P=Array.from({length:1400},function(){var a=r()*TAU,b=r()*TAU,R=.3+r()*1.2;return{x:Math.cos(a)*R,y:Math.sin(a)*R*.7,z:Math.sin(b)*R,a:a,v:.1+r()*.4,h:r()*360};});},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#09041f','#1d0926','#041528']);var bins=Array.from({length:12},function(){return[];});this.P.forEach(function(p){var a=p.a+t*p.v*.2,R=Math.hypot(p.x,p.y),q=rot([Math.cos(a)*R,Math.sin(a)*R*.7,p.z*.65+Math.sin(t*.2+p.a)*.2],t*.2),P=proj(q,W,H);bins[Math.floor(p.h/30)].push(P);});c.globalCompositeOperation='lighter';bins.forEach(function(B,i){c.beginPath();B.forEach(function(p){c.rect(p[0],p[1],2.8,2.8);});c.fillStyle='hsl('+(i*30+t*2)+',85%,65%)';c.fill();});starGlow(c,W*.52,H*.49,H*.22,'rgba(163,79,45,.18)');c.globalCompositeOperation='source-over';
    });

  room(37,'chromatic-rain','Chromatic Rain','perspective light rain · spectral trails · deep falling field',
    'Rain falling through a city that is made only of colour. The drops keep the shapes of the windows they have passed.',
    function(){var r=rng(537);this.drops=Array.from({length:650},function(){return{x:(r()-.5)*5.,y:r()*4.-2.,z:r()*4.,v:.2+r()*.5,h:r()*360};});},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#100525','#041e37','#210a32']);c.globalCompositeOperation='lighter';this.drops.forEach(function(d){var y=((d.y+t*d.v+2)%4)-2,P=proj([d.x,y,d.z],W,H),Q=proj([d.x,y-.08-d.v*.12,d.z],W,H);c.beginPath();c.moveTo(Q[0],Q[1]);c.lineTo(P[0],P[1]);c.strokeStyle='hsla('+(d.h+t*2)+',90%,65%,'+(.22+.5/(1.+d.z))+')';c.lineWidth=1.4/(1.+d.z*.2);c.stroke();});c.globalCompositeOperation='source-over';
    });

  room(39,'luminous-archways','Luminous Archways','nested polygon portals · perspective phases · colour procession',
    'A procession of doorways with no building around them. Each one opens onto a slightly different version of distance.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#0a0425','#07142a','#170629']);var R=Math.min(W,H)*.47;for(var i=29;i>=0;i--){var z=1.+((i*.34-t*.1)%10+10)%10,r=R/z,a=t*.06+z*.14,h=(i*17+t*4)%360;c.beginPath();for(var j=0;j<=8;j++){var p=j/8*TAU+a,x=W*.52+Math.cos(p)*r,y=H*.49+Math.sin(p)*r;if(j)c.lineTo(x,y);else c.moveTo(x,y);}c.strokeStyle='hsla('+h+',85%,62%,'+(.35+.6/(1.+z))+')';c.lineWidth=Math.max(.6,3./z);c.stroke();}
    });

  room(40,'opaline-petals','Opaline Petals','translucent bloom · layered bezier membranes · pearlescent light',
    'A flower with the scale of a weather system. Its petals are thin enough for one colour to remember another through them.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#1b0631','#082b3e','#170a2d']);c.save();c.translate(W*.52,H*.49);var R=Math.min(W,H)*.45;c.globalCompositeOperation='screen';for(var ring=3;ring>=0;ring--)for(var i=0;i<11;i++){var a=i/11*TAU+ring*.24+t*(ring%2?.025:-.02),len=R*(.45+ring*.18);c.save();c.rotate(a);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-len*.5,-len*.7,-len*.35,-len,len*.1,-len);c.bezierCurveTo(len*.6,-len*.85,len*.55,-len*.2,0,0);var g=c.createLinearGradient(0,0,0,-len);g.addColorStop(0,'hsla('+(i*22+ring*35)+',85%,45%,.1)');g.addColorStop(.65,'hsla('+(i*22+ring*35)+',80%,60%,.3)');g.addColorStop(1,'hsla('+(i*22+ring*35+40)+',90%,80%,.6)');c.fillStyle=g;c.fill();c.restore();}c.restore();
    });

  room(41,'ember-dunes','Ember Dunes','layered terrain · drifting embers · incandescent twilight',
    'The dunes are still warm from a sun that left hours ago. Small sparks travel from crest to crest, looking for the last of the light.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#1c103b','#b23662','#f99a53']);starGlow(c,W*.72,H*.32,H*.15,'rgba(255,180,99,.7)');for(var l=0;l<12;l++){var y=H*(.42+l*.05),amp=H*(.03+l*.001),g=c.createLinearGradient(0,y,0,H);g.addColorStop(0,'hsl('+(315+l*7)+',45%,'+(47-l*2.5)+'%)');g.addColorStop(1,'#100d27');c.fillStyle=g;c.beginPath();c.moveTo(0,H);for(var x=0;x<=W+8;x+=8){var h=Math.sin(x/W*(5+l*.3)+l*1.4+t*.025)*amp+Math.sin(x/W*13.+l)*amp*.35;c.lineTo(x,y+h);}c.lineTo(W,H);c.closePath();c.fill();}c.globalCompositeOperation='lighter';for(var i=0;i<110;i++){var x=((i*.618+t*.007)%1)*W,y=((i*.371-t*.012)%1+1)%1*H;c.fillStyle='rgba(255,174,96,'+(.2+.5*(.5+.5*Math.sin(i+t)))+')';c.fillRect(x,y,1.4,1.4);}c.globalCompositeOperation='source-over';
    });

  room(42,'spectrum-choreography','Spectrum Choreography','3D phase lattice · chromatic nodes · collective motion',
    'Every point knows one simple motion. Put enough of them together, and the simplicity becomes something you can no longer hold in your head.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,['#07051e','#0c1731','#170827']);var points=[];for(var j=0;j<27;j++)for(var i=0;i<45;i++){var x=(i/44-.5)*3.6,z=(j/26-.5)*2.5,y=.35*Math.sin(x*2.+z*2.-t*.6)+.15*Math.sin(z*4.+t*.3),p=rot([x,y,z],t*.3);points.push({p:p,h:i*5+j*7});}points.sort(function(a,b){return b.p[2]-a.p[2];});points.forEach(function(q){var P=proj(q.p,W,H),r=Math.min(W,H)*.0045/(1.+q.p[2]*.15);c.beginPath();c.arc(P[0],P[1],r,0,TAU);c.fillStyle='hsl('+((q.h+t*4)%360)+',80%,65%)';c.fill();});
    });
})(window);
