/* Collection IV — meshes, living graphs, constraints and printed matter.
   All random streams are seeded; every simulation owns bounded local state. */
(function(w){
  'use strict';
  var TAU=Math.PI*2;
  function rng(seed){var n=seed;return function(){n^=n<<13;n^=n>>>17;n^=n<<5;return(n>>>0)/4294967296;};}
  function room(id,name,score,tag,blurb,init,frame,frames,theme){w.D({id:id,name:name,edition:4,rank:0,captivation:score,tag:tag,blurb:blurb,kind:'2d',theme:theme||'dark',init:init,frame:frame,previewFrames:frames||1,
    art:'linear-gradient(140deg,#071625,#34788b,#cb9e7b)',preview:'assets/previews/'+id+'.webp'});}
  function ground(c,W,H){c.fillStyle='#06101d';c.fillRect(0,0,W,H);var g=c.createRadialGradient(W*.55,H*.4,0,W*.55,H*.4,H*.7);g.addColorStop(0,'rgba(39,67,85,.35)');g.addColorStop(1,'rgba(6,16,29,0)');c.fillStyle=g;c.fillRect(0,0,W,H);}
  function turn(p,t){var a=t*.14,co=Math.cos(a),si=Math.sin(a);var x=p[0]*co+p[2]*si,z=-p[0]*si+p[2]*co;return[x,p[1],z];}
  function project(p,W,H){var s=Math.min(W,H)*1.12/(3.5+p[2]);return[W*.53+p[0]*s,H*.49+p[1]*s];}
  function polygon(c,P){c.beginPath();c.moveTo(P[0][0],P[0][1]);for(var i=1;i<P.length;i++)c.lineTo(P[i][0],P[i][1]);c.closePath();}

  room('ribbon-ballet','Ribbon Ballet',95,'depth-sorted silk · parametric surfaces · folded light',
    'Three lengths of silk performing a dance with no floor. Where one disappears, another catches the light it leaves behind.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;ground(c,W,H);var faces=[];
      function point(u,v,r){var a=u*TAU,phase=t*.13+r*TAU/3;var p=[1.22*Math.sin(a+phase),.95*Math.sin(a*2.+phase)*.8,.7*Math.cos(a*1.+phase)];p[0]+=v*Math.cos(a*2.+phase);p[1]+=v*Math.sin(a*2.+phase);return turn(p,t*.35);}
      for(var r=0;r<3;r++)for(var i=0;i<100;i++){var u=i/100,V=[point(u,-.105,r),point(u,.105,r),point(u+.01,.105,r),point(u+.01,-.105,r)];var z=V.reduce(function(a,p){return a+p[2];},0)/4;var light=.45+.55*Math.abs(Math.sin(u*TAU*2.+t*.13+r*2.));faces.push({V:V,z:z,r:r,l:light});}
      faces.sort(function(a,b){return b.z-a.z;});for(var i=0;i<faces.length;i++){var f=faces[i],P=f.V.map(function(v){return project(v,W,H);});polygon(c,P);var hue=[192,332,34][f.r],shine=c.createLinearGradient(P[0][0],P[0][1],P[1][0],P[1][1]);shine.addColorStop(0,'hsl('+hue+',50%,'+(17+f.l*24)+'%)');shine.addColorStop(.5,'hsl('+hue+',56%,'+(43+f.l*27)+'%)');shine.addColorStop(1,'hsl('+hue+',48%,'+(21+f.l*27)+'%)');c.fillStyle=shine;c.fill();c.strokeStyle='hsla('+hue+',48%,40%,.3)';c.lineWidth=.6;c.stroke();}
    });

  room('folding-atlas','Folding Atlas',93,'creased sheet · triangular mesh · travelling deformation',
    'A landscape learning how to fold itself into a letter. Peaks become valleys; the creases keep the memory of both.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;ground(c,W,H);var faces=[],N=26,M=20;
      function vertex(i,j){var x=(i/N-.5)*3.7,y=(j/M-.5)*2.6,z=.20*Math.sin(x*3.+t*.6)+.17*Math.cos(y*4.-t*.4)+.07*((i+j)%2);var yy=y*.65-z*.76,zz=y*.76+z*.65;return turn([x,yy,zz],t*.2);}
      for(var j=0;j<M;j++)for(var i=0;i<N;i++){var a=vertex(i,j),b=vertex(i+1,j),d=vertex(i,j+1),e=vertex(i+1,j+1);[[a,b,e],[a,e,d]].forEach(function(V,k){var v=V[1],u=V[0],z=V[2];var nx=(v[1]-u[1])*(z[2]-u[2])-(v[2]-u[2])*(z[1]-u[1]),ny=(v[2]-u[2])*(z[0]-u[0])-(v[0]-u[0])*(z[2]-u[2]),nz=(v[0]-u[0])*(z[1]-u[1])-(v[1]-u[1])*(z[0]-u[0]);var len=Math.hypot(nx,ny,nz)||1;faces.push({V:V,z:(u[2]+v[2]+z[2])/3,l:Math.abs((nx*.2-ny*.5+nz*.8)/len),h:(i+j+k)%7});});}
      faces.sort(function(a,b){return b.z-a.z;});faces.forEach(function(f){polygon(c,f.V.map(function(p){return project(p,W,H);}));c.fillStyle=f.h<2?'hsl(18,42%,'+(25+f.l*42)+'%)':'hsl(178,28%,'+(21+f.l*47)+'%)';c.fill();c.strokeStyle='rgba(4,22,30,.2)';c.lineWidth=.45;c.stroke();});
    });

  room('chromatic-abacus','Chromatic Abacus',91,'Verlet chains · distance constraints · pointer forces',
    'Colour has weight here. Move a hand through the strings and watch the disturbance find its way along every small connection.',
    function(){this.chains=[];for(var j=0;j<10;j++){var row=[];for(var i=0;i<32;i++){var x=.13+i/31*.74,y=.15+j*.061+Math.sin(i/31*Math.PI)*.03;row.push({x:x,y:y,ox:x,oy:y});}this.chains.push(row);}},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t,dt=Math.min(S.dt,1/30);ground(c,W,H);var chains=this.chains;
      for(var j=0;j<chains.length;j++){var row=chains[j];if(dt>0){for(var i=1;i<row.length-1;i++){var p=row[i],vx=(p.x-p.ox)*.99,vy=(p.y-p.oy)*.99;p.ox=p.x;p.oy=p.y;p.x+=vx;p.y+=vy+dt*dt*.13;
          if(S.pointer.active){var dx=p.x-S.pointer.x,dy=p.y-(1.-S.pointer.y),d=dx*dx+dy*dy+.003;if(d<.028){p.x+=dx/d*dt*.004;p.y+=dy/d*dt*.004;}}}
        for(var k=0;k<8;k++){row[0].x=.13;row[0].y=.15+j*.061+.012*Math.sin(t*.4+j*.3);row[31].x=.87;row[31].y=.15+j*.061-.012*Math.sin(t*.4+j*.3);
          for(var i=0;i<31;i++){var a=row[i],b=row[i+1],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,err=(d-.74/31*1.035)/d*.5;if(i>0){a.x+=dx*err;a.y+=dy*err;}if(i<30){b.x-=dx*err;b.y-=dy*err;}}}}
        c.beginPath();row.forEach(function(p,i){if(i)c.lineTo(p.x*W,p.y*H);else c.moveTo(p.x*W,p.y*H);});c.strokeStyle='rgba(122,171,193,.3)';c.lineWidth=.7;c.stroke();
        row.forEach(function(p,i){var r=Math.min(W,H)*.0075,hue=(j*28+i*2+t*2)%360;c.beginPath();c.arc(p.x*W,p.y*H,r,0,TAU);c.fillStyle='hsl('+hue+',57%,60%)';c.fill();c.beginPath();c.arc(p.x*W-r*.25,p.y*H-r*.3,r*.27,0,TAU);c.fillStyle='rgba(255,255,255,.65)';c.fill();});}
    },120);

  room('cyanotype-garden','Cyanotype Garden',89,'botanical silhouettes · venation · photographic blue',
    'Leaves pressed against a sheet of midnight. Light passes through the veins and leaves behind a garden that never needs to grow old.',
    function(){this.r=rng(4481);this.leaves=[];for(var i=0;i<19;i++)this.leaves.push({x:this.r(),y:this.r(),a:this.r()*TAU,s:.07+this.r()*.12});},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;c.fillStyle='#073c73';c.fillRect(0,0,W,H);var g=c.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,H);g.addColorStop(0,'rgba(26,103,152,.5)');g.addColorStop(1,'rgba(1,20,54,.6)');c.fillStyle=g;c.fillRect(0,0,W,H);
      this.leaves.forEach(function(l,i){c.save();c.translate(l.x*W,l.y*H);c.rotate(l.a+.035*Math.sin(t*.25+i));var len=l.s*Math.min(W,H)*2.3;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(len*.8,-len*.34,len*.6,-len*.9,0,-len);c.bezierCurveTo(-len*.6,-len*.9,-len*.8,-len*.34,0,0);c.fillStyle='rgba(184,225,223,.67)';c.fill();
        c.strokeStyle='rgba(8,67,109,.65)';c.lineWidth=.85;c.beginPath();c.moveTo(0,len*.2);c.lineTo(0,-len*.95);c.stroke();for(var v=1;v<10;v++){var y=-len*v/11,width=Math.sin(v/11*Math.PI)*len*.36;c.beginPath();c.moveTo(-width,y-len*.1);c.quadraticCurveTo(0,y,0,y+len*.06);c.quadraticCurveTo(0,y,width,y-len*.1);c.stroke();}c.restore();});
    });

  room('luminous-mycelium','Luminous Mycelium',87,'branching growth · tip competition · luminous transport',
    'A network deciding where the darkness is thinnest. Every fork is a question, every returning pulse an answer from somewhere out of sight.',
    function(){this.r=rng(7821);this.edges=[];this.tips=[];this.clock=0;for(var i=0;i<8;i++)this.tips.push({x:.5,y:.5,sx:.5,sy:.5,a:i*TAU/8,age:0});},
    function(S){var c=S.ctx,W=S.w,H=S.h,dt=S.dt;ground(c,W,H);this.clock+=dt;var r=this.r;
      if(dt>0){var next=[];for(var i=0;i<this.tips.length;i++){var p=this.tips[i];p.a+=(r()-.5)*.45;var x=p.x+Math.cos(p.a)*dt*.08,y=p.y+Math.sin(p.a)*dt*.08;
          if(x<.05||x>.95||y<.07||y>.93)continue;if(Math.hypot(x-p.sx,y-p.sy)>.006){this.edges.push({x:p.sx,y:p.sy,X:x,Y:y,b:this.clock});p.sx=x;p.sy=y;}p.x=x;p.y=y;p.age+=dt;next.push(p);
          if(r()<dt*.48&&next.length<60)next.push({x:x,y:y,sx:x,sy:y,a:p.a+(r()>.5?1:-1)*(.4+r()*.5),age:0});}this.tips=next.slice(0,60);if(this.edges.length>6500)this.edges.splice(0,this.edges.length-6500);}
      // Eight material batches rather than thousands of individual strokes.
      var bins=Array.from({length:8},function(){return[];});for(var i=0;i<this.edges.length;i++){var e=this.edges[i],age=this.clock-e.b,pulse=Math.pow(.5+.5*Math.cos(age*3.-S.t*1.4),12.);bins[Math.min(7,Math.floor(pulse*8))].push(e);}
      c.lineCap='round';c.lineWidth=Math.max(.7,Math.min(W,H)*.002);for(var b=0;b<8;b++){var pulse=b/7;c.beginPath();bins[b].forEach(function(e){c.moveTo(e.x*W,e.y*H);c.lineTo(e.X*W,e.Y*H);});c.strokeStyle='rgba('+(65+Math.round(pulse*100))+','+(150+Math.round(pulse*70))+',180,'+(.30+pulse*.55)+')';c.stroke();}
      c.lineCap='butt';this.tips.forEach(function(p){c.beginPath();c.arc(p.x*W,p.y*H,Math.min(W,H)*.0027,0,TAU);c.fillStyle='#b5ece7';c.fill();});
    },300);

  room('prism-parade','Prism Parade',85,'isometric solids · phased extrusion · candy architecture',
    'A city built from translucent sweets. The skyline changes its mind with every breath, and the streets are always catching the afternoon.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;c.fillStyle='#e6d8c9';c.fillRect(0,0,W,H);var R=Math.min(W,H)*.065,cx=W*.53,cy=H*.53;
      function iso(x,y,z){return[cx+(x-y)*R*.866,cy+(x+y)*R*.5-z*R];}
      for(var sum=0;sum<=16;sum++)for(var i=0;i<9;i++){var j=sum-i;if(j<0||j>=9)continue;var x=i-4,y=j-4,z=.4+1.5*Math.pow(.5+.5*Math.sin(i*.7+j*.8-t*.5),2.);var a=iso(x,y,0),b=iso(x+1,y,0),d=iso(x,y+1,0),e=iso(x+1,y+1,0),A=iso(x,y,z),B=iso(x+1,y,z),D=iso(x,y+1,z),E=iso(x+1,y+1,z),h=(i*15+j*13+170)%360;
        [[D,E,e,d],[B,E,e,b],[A,B,E,D]].forEach(function(P,k){polygon(c,P);c.fillStyle='hsl('+h+', '+[28,38,44][k]+'%, '+[42,53,73][k]+'%)';c.fill();c.strokeStyle='rgba(255,248,232,.28)';c.lineWidth=.7;c.stroke();});}
    },1,'paper');

  room('kinetic-letterpress','Kinetic Letterpress',83,'invented glyphs · phase-driven typesetting · warm paper',
    'An alphabet from a language that only exists while it is moving. The meaning is not in the letters. It is in the space they leave for one another.',
    function(){this.glyphs=[];var r=rng(2813);for(var i=0;i<144;i++)this.glyphs.push(Math.floor(r()*8));},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;c.fillStyle='#ded4bc';c.fillRect(0,0,W,H);var N=12,M=12,step=Math.min(W*.74/N,H*.82/M),left=W*.53-N*step/2,top=H*.50-M*step/2;
      for(var j=0;j<M;j++)for(var i=0;i<N;i++){var k=j*N+i,g=this.glyphs[k],phase=t*.35+i*.37+j*.23,scale=.6+.27*Math.sin(phase);c.save();c.translate(left+(i+.5)*step,top+(j+.5)*step);c.rotate(Math.sin(phase*.5)*.18);c.scale(scale,scale);c.strokeStyle=(i+j)%7===0?'#ad5038':'#243d43';c.lineWidth=step*.085;c.lineCap='square';var r=step*.32;
        c.beginPath();if(g<3){c.arc(0,0,r,(g*.5)*Math.PI,(g*.5+1.4)*Math.PI);c.moveTo(-r,r);c.lineTo(r,r);}else if(g<6){c.moveTo(-r,-r);c.lineTo(r,-r);c.lineTo(g===4?-r:r,r);c.moveTo(-r,0);c.lineTo(r,0);}else{c.moveTo(0,-r);c.lineTo(r,r);c.lineTo(-r,r);c.closePath();if(g===7){c.moveTo(-r,-r);c.lineTo(r,r);}}c.stroke();c.restore();}c.lineCap='butt';
    },1,'paper');

  room('oculus-automata','Oculus Automata',81,'elementary cellular automata · spacetime quilting · rule 110',
    'One row of cells, three neighbours, one rule. Out of almost nothing comes a tapestry no one could have drawn by hand.',
    function(){var r=rng(110);this.rows=[];this.row=Array.from({length:161},function(){return r()>.72?1:0;});this.phase=0;this.image=w.document.createElement('canvas');this.image.width=161;this.image.height=120;this.ic=this.image.getContext('2d');this.pixels=this.ic.createImageData(161,120);this.palette=Array.from({length:360},function(_,i){return[0,2.1,4.2].map(function(p){return 70+Math.round(70*(1+Math.cos(i/360*TAU+p)));});});},
    function(S){var c=S.ctx,W=S.w,H=S.h;this.phase+=S.dt*35;while(this.phase>=1){this.phase--;this.rows.push(this.row.slice());if(this.rows.length>120)this.rows.shift();var a=this.row,b=[];for(var i=0;i<a.length;i++){var code=a[(i+a.length-1)%a.length]*4+a[i]*2+a[(i+1)%a.length];b.push((110>>code)&1);}this.row=b;}
      c.fillStyle='#070e1a';c.fillRect(0,0,W,H);var cell=Math.min(W*.87/161,H*.85/120),left=(W-cell*161)/2,top=(H-cell*120)/2;
      var pix=this.pixels.data;for(var j=0;j<120;j++)for(var i=0;i<161;i++){var off=(j*161+i)*4,row=this.rows[j],on=row&&row[i],rgb=this.palette[Math.floor((i*.7+j*.8+S.t*3+155)%360)],shade=.7+((i+j)%3)*.12;pix[off]=on?rgb[0]*shade:7;pix[off+1]=on?rgb[1]*shade:14;pix[off+2]=on?rgb[2]*shade:26;pix[off+3]=255;}
      this.ic.putImageData(this.pixels,0,0);c.save();c.imageSmoothingEnabled=false;c.drawImage(this.image,left,top,161*cell,120*cell);c.restore();
    },230);
})(window);
