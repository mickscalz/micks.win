/* Collection VI: twenty-two kinetic constructions and bounded simulations.
   All randomness is seeded locally; advancing state requires a positive dt. */
(function(w){
  'use strict';
  var TAU=Math.PI*2,reg=w.CabinetVI.register;
  function rng(seed){return function(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};}
  function room(n,id,name,tag,blurb,init,frame,extra){return reg(n,id,name,tag,blurb,'2d',Object.assign({init:init,frame:frame,previewFrames:1},extra));}
  function hue(h,l,a){return 'hsla('+((h%360+360)%360)+',78%,'+(l||60)+'%,'+(a===undefined?1:a)+')';}
  function bg(c,W,H,paper){var g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,paper?'#efe4da':'#040b24');g.addColorStop(.55,paper?'#f8eee0':'#190b32');g.addColorStop(1,paper?'#dbd7e3':'#062b38');c.fillStyle=g;c.fillRect(0,0,W,H);}
  function spin(p,t){var a=t*.17,co=Math.cos(a),sn=Math.sin(a),x=p[0]*co+p[2]*sn,z=-p[0]*sn+p[2]*co;return[x,p[1]*.94-z*.34,p[1]*.34+z*.94];}
  function proj(p,W,H){var k=Math.min(W,H)*1.35/Math.max(.3,4.+p[2]);return[W*.5+p[0]*k,H*.5+p[1]*k,k];}
  function path(c,P,close){c.beginPath();P.forEach(function(p,i){if(i)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);});if(close)c.closePath();}
  function drawFaces(c,F,W,H){F.sort(function(a,b){return b.z-a.z;});F.forEach(function(f){path(c,f.p.map(function(p){return proj(p,W,H);}),true);c.fillStyle=f.color;c.fill();c.strokeStyle=f.edge||f.color;c.lineWidth=.6;c.stroke();});}
  function face(F,P,color,edge){F.push({p:P,z:P.reduce(function(s,p){return s+p[2];},0)/P.length,color:color,edge:edge});}
  function glow(c,x,y,r,color){var g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}

  room(3,'tesseract-tempest','Tesseract Tempest','four-dimensional rotations · perspective cells · hypercubic procession',
    'Sixteen corners, four directions, no outside. The fourth direction keeps turning into a place you almost recognise.',
    function(){this.V=[];this.E=[];for(var i=0;i<16;i++){this.V.push([0,1,2,3].map(function(k){return(i>>k&1)?1:-1;}));for(var j=0;j<i;j++){var d=i^j;if((d&(d-1))===0)this.E.push([i,j]);}}},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H);var V=this.V,E=this.E;
      for(var layer=6;layer>=0;layer--){var scale=.24+layer*.19;var P=V.map(function(v){var p=v.slice();[[0,3,t*.21],[1,3,t*.137],[0,2,t*.083]].forEach(function(r){var a=p[r[0]],b=p[r[1]],co=Math.cos(r[2]),si=Math.sin(r[2]);p[r[0]]=a*co-b*si;p[r[1]]=a*si+b*co;});var k=2.4/(2.8-p[3]);return spin([p[0]*k*scale,p[1]*k*scale,p[2]*k*scale],t*.3);});
        E.forEach(function(e,i){var a=proj(P[e[0]],W,H),b=proj(P[e[1]],W,H);path(c,[a,b]);c.strokeStyle=hue(layer*41+i*4+t*5,64,.42+layer*.065);c.lineWidth=(.7+layer*.16)*Math.min(W,H)/600;c.stroke();});
        P.forEach(function(p,i){var q=proj(p,W,H);c.fillStyle=hue(layer*41+i*9+t*5,80,.8);c.beginPath();c.arc(q[0],q[1],1.3+layer*.18,0,TAU);c.fill();});}
    });

  room(6,'enneper-dream','Enneper Dream','minimal surface · self-intersecting silk · rotating geometry',
    'A surface with no interest in staying on one side of itself. Its three wings exchange places without ever letting go.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H);var F=[],N=32,limit=1.15+.13*Math.sin(t*.17);
      function p(u,v){var a=.55+.12*Math.sin(t*.11);return spin([(u-u*u*u/3+u*v*v)*a,(v-v*v*v/3+v*u*u)*a,(u*u-v*v)*a],t);}
      for(var j=0;j<N;j++)for(var i=0;i<N;i++){var u=(i/N-.5)*limit*2,v=(j/N-.5)*limit*2,d=limit*2/N,P=[p(u,v),p(u+d,v),p(u+d,v+d),p(u,v+d)];face(F,P,hue(i*5+j*4+t*3,35+23*(.5+.5*Math.sin(u*3-v*2+t*.2))),hue(i*5+j*4+t*3,70,.23));}drawFaces(c,F,W,H);
    });

  room(9,'gravity-ballet','Gravity Ballet','softened many-body dynamics · luminous trajectories · mutual orbit',
    'No orbit is prescribed. Every light changes every other light, and the dance keeps inventing its next step.',
    function(){var r=rng(609);this.B=Array.from({length:56},function(_,i){var a=r()*TAU,d=.3+r()*1.1;return{x:Math.cos(a)*d,y:Math.sin(a)*d,vx:-Math.sin(a)*.16,vy:Math.cos(a)*.16,m:i<4?1.2:.035,h:i*6.4,trail:[]};});},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t,B=this.B;bg(c,W,H);if(S.dt>0){var dt=Math.min(S.dt,.025);B.forEach(function(b,i){var ax=-b.x*.035,ay=-b.y*.035;B.forEach(function(a,j){if(i===j)return;var x=a.x-b.x,y=a.y-b.y,d=x*x+y*y+.07,k=.045*a.m/Math.pow(d,1.5);ax+=x*k;ay+=y*k;});b.vx=(b.vx+ax*dt)*.9995;b.vy=(b.vy+ay*dt)*.9995;});B.forEach(function(b){b.x+=b.vx*dt;b.y+=b.vy*dt;b.trail.push([b.x,b.y]);if(b.trail.length>300)b.trail.shift();});}
      var k=Math.min(W,H)*.36;B.forEach(function(b,i){path(c,b.trail.map(function(p){return[W*.5+p[0]*k,H*.5+p[1]*k];}));c.strokeStyle=hue(b.h+t*4,58,.58);c.lineWidth=i<4?2:1;c.stroke();var x=W*.5+b.x*k,y=H*.5+b.y*k;c.fillStyle=hue(b.h+t*4,82);c.beginPath();c.arc(x,y,i<4?4:1.5,0,TAU);c.fill();if(i<4)glow(c,x,y,25,hue(b.h+t*4,60,.3));});
    },{previewFrames:480});

  room(12,'chromatic-dominion','Chromatic Dominion','cyclic cellular competition · spiral fronts · living mosaic',
    'Twelve colours take turns consuming their neighbours. No colour wins; the borders become the world.',
    function(){this.N=144;this.M=90;this.r=rng(612);this.A=new Uint8Array(this.N*this.M);this.B=new Uint8Array(this.A.length);for(var y=0;y<this.M;y++)for(var x=0;x<this.N;x++){var phase=Math.atan2(y-24,x-34)+Math.atan2(y-64,x-102)-Math.atan2(y-24,x-108);this.A[y*this.N+x]=((Math.floor(phase/TAU*12+24))%12+12)%12;}this.cv=document.createElement('canvas');this.cv.width=this.N;this.cv.height=this.M;this.cx=this.cv.getContext('2d');this.image=this.cx.createImageData(this.N,this.M);},
    function(S){var c=S.ctx,W=S.w,H=S.h,N=this.N,M=this.M,A=this.A,B=this.B;if(S.dt>0){for(var y=0;y<M;y++)for(var x=0;x<N;x++){var idx=y*N+x,next=(A[idx]+1)%12,count=0;for(var j=-1;j<=1;j++)for(var i=-1;i<=1;i++){if(A[((y+j+M)%M)*N+(x+i+N)%N]===next)count++;}B[idx]=count>=1?next:A[idx];}this.A=B;this.B=A;A=B;}
      var data=this.image.data;for(var i=0;i<A.length;i++){var h=A[i]/12+S.t*.006;data[i*4]=128+115*Math.sin(h*TAU);data[i*4+1]=128+115*Math.sin(h*TAU+2.1);data[i*4+2]=128+115*Math.sin(h*TAU+4.2);data[i*4+3]=255;}this.cx.putImageData(this.image,0,0);c.imageSmoothingEnabled=false;c.drawImage(this.cv,0,0,W,H);c.imageSmoothingEnabled=true;
    },{previewFrames:180});

  room(15,'elastic-constellation','Elastic Constellation','Verlet membrane · wind forces · constraint network',
    'The constellation is a piece of cloth. Its stars pull on one another, bending the entire sky into a sail.',
    function(){var N=29,M=19;this.N=N;this.M=M;this.P=[];for(var j=0;j<M;j++)for(var i=0;i<N;i++){var x=(i/(N-1)-.5)*3.,y=(j/(M-1)-.5)*1.9;this.P.push({x:x,y:y,z:0,ox:x,oy:y,oz:0,pin:j===0});}},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t,N=this.N,M=this.M,P=this.P;bg(c,W,H);if(S.dt>0){var dt=Math.min(S.dt,.03);P.forEach(function(p,k){if(p.pin)return;var i=k%N,j=Math.floor(k/N),force=.65*Math.sin(i*.28+j*.17-t*.8)+.3*Math.cos(i*.53-t*.37);if(S.pointer.active){var x=(S.pointer.x-.5)*3.,y=(.5-S.pointer.y)*2.;force+=.6*Math.exp(-((p.x-x)*(p.x-x)+(p.y-y)*(p.y-y))*2.);}var x=p.x,y=p.y,z=p.z;p.x+=(p.x-p.ox)*.985;p.y+=(p.y-p.oy)*.985+dt*dt*3.;p.z+=(p.z-p.oz)*.985+force*dt*dt*25.;p.ox=x;p.oy=y;p.oz=z;});
        function constrain(a,b,rest){var x=b.x-a.x,y=b.y-a.y,z=b.z-a.z,d=Math.hypot(x,y,z)||1,f=(d-rest)/d,wa=a.pin?0:(b.pin?1:.5),wb=b.pin?0:(a.pin?1:.5);a.x+=x*f*wa;a.y+=y*f*wa;a.z+=z*f*wa;b.x-=x*f*wb;b.y-=y*f*wb;b.z-=z*f*wb;}
        for(var pass=0;pass<5;pass++)for(var j=0;j<M;j++)for(var i=0;i<N;i++){var k=j*N+i;if(i<N-1)constrain(P[k],P[k+1],3./(N-1));if(j<M-1)constrain(P[k],P[k+N],1.9/(M-1));}
      }
      for(var j=0;j<M;j++){var row=[];for(var i=0;i<N;i++)row.push(proj(spin([P[j*N+i].x,P[j*N+i].y,P[j*N+i].z],t*.2),W,H));path(c,row);c.strokeStyle=hue(j*13+t*4,65,.85);c.lineWidth=1.4;c.stroke();}
      for(var i=0;i<N;i++){var col=[];for(var j=0;j<M;j++)col.push(proj(spin([P[j*N+i].x,P[j*N+i].y,P[j*N+i].z],t*.2),W,H));path(c,col);c.strokeStyle=hue(i*9+t*4,62,.5);c.lineWidth=.8;c.stroke();}
    },{previewFrames:150});

  room(18,'staircase-paradox','Staircase Paradox','kinetic stepped loops · impossible return · coloured architecture',
    'The stairs return to their beginning, but the beginning is no longer at the same height.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,true);var F=[];
      function box(x,y,z,s,h,co){var V=[[-s,0,-s],[s,0,-s],[s,0,s],[-s,0,s],[-s,-h,-s],[s,-h,-s],[s,-h,s],[-s,-h,s]].map(function(p){return spin([p[0]+x,p[1]+y,p[2]+z],t*.25);});[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]].forEach(function(ids,k){face(F,ids.map(function(i){return V[i];}),hue(co,28+k*9),hue(co,75,.22));});}
      for(var ring=0;ring<3;ring++)for(var i=0;i<44;i++){var a=i/44*TAU,r=.65+ring*.38,phase=a+t*.22+ring,y=.25*Math.sin(phase)+ring*.3;box(Math.cos(a)*r,y,Math.sin(a)*r,.07,.09+.10*(.5+.5*Math.sin(phase*3.)),i*7+ring*47+t*3);}drawFaces(c,F,W,H);
    },{theme:'paper'});

  room(21,'lorenz-silk','Lorenz Silk','chaotic trajectories · evolving attractor · ribbon projection',
    'Two paths begin almost together. A moment later, an entire universe fits between them.',
    function(){var r=rng(621);this.P=Array.from({length:18},function(_,i){return{x:.1+r()*.05,y:.1,z:.1,h:i*20,trail:[]};});for(var step=0;step<6000;step++)this.P.forEach(function(p){var x=p.x,y=p.y,z=p.z,dt=.004,rho=30.+4.*Math.sin(p.h*.03);p.x+=10*(y-x)*dt;p.y+=(x*(rho-z)-y)*dt;p.z+=(x*y-z*8/3)*dt;p.trail.push([p.x*.045,(p.z-25)*-.045,p.y*.045]);if(p.trail.length>900)p.trail.shift();});},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H);var P=this.P;if(S.dt>0){for(var step=0;step<4;step++)P.forEach(function(p){var dt=Math.min(S.dt,.032)/4,rho=30.+4.*Math.sin(t*.031+p.h*.03),x=p.x,y=p.y,z=p.z;p.x+=10*(y-x)*dt;p.y+=(x*(rho-z)-y)*dt;p.z+=(x*y-z*8/3)*dt;p.trail.push([p.x*.045,(p.z-25)*-.045,p.y*.045]);if(p.trail.length>900)p.trail.shift();});}
      P.forEach(function(p){path(c,p.trail.filter(function(v,i){return i%3===0;}).map(function(v){return proj(spin(v,t*.35),W,H);}));c.strokeStyle=hue(p.h+t*3,62,.7);c.lineWidth=Math.max(1.1,Math.min(W,H)*.0028);c.stroke();});
    },{previewFrames:100});

  room(24,'amoeba-theatre','Amoeba Theatre','soft silhouettes · ciliated membranes · microscopic choreography',
    'A stage full of small lives, large enough to become landscapes. Their edges are busy feeling the world.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,true);for(var k=0;k<8;k++){var a=k*2.399+t*.025,x=W*(.5+.38*Math.cos(a)),y=H*(.5+.36*Math.sin(a*1.13)),r=Math.min(W,H)*(.095+.03*Math.sin(k*3.));var P=[];
        for(var i=0;i<96;i++){var b=i/96*TAU,d=r*(1.+.13*Math.sin(b*5.+t*.6+k)+.08*Math.cos(b*9.-t*.4));P.push([x+Math.cos(b)*d,y+Math.sin(b)*d]);if(i%3===0){path(c,[[x+Math.cos(b)*d,y+Math.sin(b)*d],[x+Math.cos(b+.05*Math.sin(t*2.+i))*(d+r*.18),y+Math.sin(b+.05*Math.sin(t*2.+i))*(d+r*.18)]]);c.strokeStyle=hue(k*29+t*4,38,.65);c.lineWidth=.8;c.stroke();}}
        path(c,P,true);var g=c.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r*1.3);g.addColorStop(0,hue(k*29+t*4,85,.8));g.addColorStop(1,hue(k*29+t*4,40,.35));c.fillStyle=g;c.fill();c.strokeStyle=hue(k*29+t*4,36,.7);c.lineWidth=1.2;c.stroke();c.fillStyle=hue(k*29+t*4+35,36,.7);c.beginPath();c.ellipse(x+r*.1*Math.sin(t*.2+k),y,r*.22,r*.15,t*.13,0,TAU);c.fill();}
    },{theme:'paper'});

  room(27,'chromatic-sandpile','Chromatic Sandpile','driven toppling lattice · avalanche fronts · granular symmetry',
    'Four grains arrive, and a continent moves. The smallest disturbance can redraw every border.',
    function(){this.N=151;this.A=new Float32Array(151*151);this.B=new Float32Array(this.A.length);this.cv=document.createElement('canvas');this.cv.width=this.cv.height=this.N;this.cx=this.cv.getContext('2d');this.im=this.cx.createImageData(this.N,this.N);for(var i=0;i<this.A.length;i++)this.A[i]=3;},
    function(S){var c=S.ctx,W=S.w,H=S.h,N=this.N,A=this.A,B=this.B;if(S.dt>0){var mid=(N>>1)*N+(N>>1);A[mid]+=34;A[mid+N*22]+=4;A[mid-N*22]+=4;for(var step=0;step<9;step++){B.set(A);for(var y=1;y<N-1;y++)for(var x=1;x<N-1;x++){var k=y*N+x;if(A[k]>=4){var q=Math.floor(A[k]/4);B[k]-=q*4;B[k-1]+=q;B[k+1]+=q;B[k-N]+=q;B[k+N]+=q;}}for(var edge=0;edge<N;edge++){B[edge]=B[(N-1)*N+edge]=B[edge*N]=B[edge*N+N-1]=0;}var tmp=A;A=B;B=tmp;}this.A=A;this.B=B;}
      var data=this.im.data;for(var i=0;i<A.length;i++){var h=(A[i]%7)/7+S.t*.008;data[i*4]=110+105*Math.cos(h*TAU);data[i*4+1]=100+98*Math.cos(h*TAU+2.1);data[i*4+2]=130+112*Math.cos(h*TAU+4.2);data[i*4+3]=255;}this.cx.putImageData(this.im,0,0);bg(c,W,H);c.imageSmoothingEnabled=false;var size=Math.min(W,H)*.94;c.drawImage(this.cv,W*.5-size*.5,H*.5-size*.5,size,size);c.imageSmoothingEnabled=true;
    },{previewFrames:180});

  room(30,'riemann-cascade','Riemann Cascade','complex logarithm · connected sheets · spectral helicoid',
    'Going around once does not return you to the same place. Going around again only makes the staircase more beautiful.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H);var F=[];
      function p(a,r){return spin([Math.cos(a)*r, a*.095-.9+.08*Math.sin(r*4.+t*.3),Math.sin(a)*r],t*.5);}
      for(var j=0;j<128;j++)for(var i=0;i<12;i++){var a=j/128*TAU*3,r=.14+i/12*.95,da=TAU*3/128,dr=.95/12;face(F,[p(a,r),p(a+da,r),p(a+da,r+dr),p(a,r+dr)],hue(j*2+i*4+t*4,38+18*Math.sin(a*.5+r)),hue(j*2+t*4,75,.15));}drawFaces(c,F,W,H);
    });

  room(33,'astral-nautilus','Astral Nautilus','logarithmic shell · expanding ribs · iridescent cross-section',
    'The shell remembers every size it has ever been. Its oldest room is still glowing at the centre.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H);var F=[];
      function p(a,b){var r=.12*Math.exp(a*.16),tube=r*.35;return spin([(r+tube*Math.cos(b))*Math.cos(a),(r+tube*Math.cos(b))*Math.sin(a),tube*Math.sin(b)],t*.7);}
      for(var j=0;j<120;j++)for(var i=0;i<14;i++){var a=j/120*TAU*2.35,b=i/14*TAU,da=TAU*2.35/120,db=TAU/14,phase=j*2+i*9+t*3;face(F,[p(a,b),p(a+da,b),p(a+da,b+db),p(a,b+db)],hue(phase,30+25*(.5+.5*Math.cos(b+t*.13))),j%4===0?hue(phase,80,.6):undefined);}drawFaces(c,F,W,H);
    });

  room(36,'magnetic-pendulum','Magnetic Pendulum','driven magnetic dynamics · chaotic trails · moving attractors',
    'The pendulum is choosing between several futures. The magnets keep moving the futures around.',
    function(){var r=rng(636);this.P=Array.from({length:28},function(_,i){var a=i/28*TAU;return{x:Math.cos(a),y:Math.sin(a),vx:0,vy:0,h:i*13,trail:[]};});},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,true);var magnets=[];for(var i=0;i<5;i++){var a=i/5*TAU+t*.031;magnets.push([Math.cos(a)*.7,Math.sin(a)*.7]);}var k=Math.min(W,H)*.34;
      if(S.dt>0)this.P.forEach(function(p){var ax=-p.x*.15,ay=-p.y*.15;magnets.forEach(function(m){var x=m[0]-p.x,y=m[1]-p.y,d=x*x+y*y+.06,f=.07/Math.pow(d,1.5);ax+=x*f;ay+=y*f;});var dt=Math.min(S.dt,.03);p.vx=(p.vx+ax*dt)*.997;p.vy=(p.vy+ay*dt)*.997;p.x+=p.vx*dt;p.y+=p.vy*dt;p.trail.push([p.x,p.y]);if(p.trail.length>140)p.trail.shift();});
      magnets.forEach(function(m,i){var q=proj(spin([m[0],.5,m[1]],t*.15),W,H);glow(c,q[0],q[1],28,hue(i*72+t*3,44,.3));c.beginPath();c.ellipse(q[0],q[1],12,5,0,0,TAU);c.strokeStyle=hue(i*72+t*3,32,.8);c.lineWidth=2;c.stroke();});
      var anchor=proj(spin([0,-1.5,0],t*.15),W,H),P=this.P.slice().sort(function(a,b){return b.y-a.y;});
      P.forEach(function(p){path(c,p.trail.map(function(v){return proj(spin([v[0],.4,v[1]],t*.15),W,H);}));c.strokeStyle=hue(p.h+t*4,36,.38);c.lineWidth=.8;c.stroke();var tip=proj(spin([p.x,.25,p.y],t*.15),W,H);path(c,[anchor,tip]);c.strokeStyle=hue(p.h+t*4,35,.4);c.lineWidth=.9;c.stroke();c.fillStyle=hue(p.h+t*4,42,.9);c.beginPath();c.arc(tip[0],tip[1],4,0,TAU);c.fill();});
      c.fillStyle='#40314a';c.beginPath();c.arc(anchor[0],anchor[1],6,0,TAU);c.fill();
    },{previewFrames:240,theme:'paper'});

  room(39,'helix-promenade','Helix Promenade','braided helices · paired bridges · molecular scale',
    'A promenade between two twisting rivers. Every bridge is a different colour of the same long thought.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H);var seg=[];
      for(var k=0;k<5;k++)for(var j=0;j<100;j++){var y=(j/100-.5)*3.3,a=j*.13+t*.3+k*.8,r=.22+.025*Math.sin(j*.14-t*.4),x=(k-2)*.65;var P=[spin([x+Math.cos(a)*r,y,Math.sin(a)*r],t*.3),spin([x-Math.cos(a)*r,y,-Math.sin(a)*r],t*.3)];seg.push({P:P,z:(P[0][2]+P[1][2])/2,h:j*2+k*37+t*3,j:j});}
      seg.sort(function(a,b){return b.z-a.z;});seg.forEach(function(s){var a=proj(s.P[0],W,H),b=proj(s.P[1],W,H);if(s.j%3===0){path(c,[a,b]);c.strokeStyle=hue(s.h,60,.55);c.lineWidth=1.2;c.stroke();}c.fillStyle=hue(s.h,72,.9);[a,b].forEach(function(p){c.beginPath();c.arc(p[0],p[1],Math.max(1,p[2]*.015),0,TAU);c.fill();});});
    });

  room(42,'kaleidocycle-engine','Kaleidocycle Engine','inverting tetrahedral ring · faceted linkage · cyclic transformation',
    'A ring turns itself inside out without breaking. The colours on the outside disappear into the mechanism and return transformed.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,true);var F=[];
      for(var k=0;k<24;k++){var a=k/24*TAU,phase=t*.4+a,r=1.+.09*Math.sin(phase),center=[Math.cos(a)*r,Math.sin(a)*r,0],co=Math.cos(phase),si=Math.sin(phase);
        var V=[[.17,0,.22],[-.17,0,.22],[0,.2,-.22],[0,-.2,-.22]].map(function(v){var x=v[0],y=v[1]*co-v[2]*si,z=v[1]*si+v[2]*co;return spin([center[0]+x*Math.cos(a)-y*Math.sin(a),center[1]+x*Math.sin(a)+y*Math.cos(a),z],t*.3);});
        [[0,1,2],[0,3,1],[0,2,3],[1,3,2]].forEach(function(ids,i){face(F,ids.map(function(j){return V[j];}),hue(k*15+i*27+t*4,28+i*12),hue(k*15,85,.7));});}drawFaces(c,F,W,H);
    },{theme:'paper'});

  room(45,'orbital-debris','Orbital Debris','faceted asteroid flight · depth projection · distant suns',
    'The smallest pebble is a mountain. A quiet river of broken worlds passes close enough to touch.',
    function(){var r=rng(645);this.B=Array.from({length:120},function(){return{x:(r()-.5)*7,y:(r()-.5)*5,z:r()*14,s:.035+r()*.14,h:r()*360,a:r()*TAU};});},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H);glow(c,W*.75,H*.28,H*.3,'rgba(200,70,120,.2)');var F=[];this.B.forEach(function(b){var z=((b.z-t*.28)%14+14)%14-2.5;var a=b.a+t*.11,V=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(function(p){var q=spin([p[0]*b.s,p[1]*b.s,p[2]*b.s],a);return[q[0]+b.x,q[1]+b.y,q[2]+z];});[[0,2,4],[2,1,4],[1,3,4],[3,0,4],[2,0,5],[1,2,5],[3,1,5],[0,3,5]].forEach(function(ids,i){face(F,ids.map(function(j){return V[j];}),hue(b.h+t*2,18+i*5),hue(b.h+t*2,64,.25));});});drawFaces(c,F,W,H);
    });

  room(48,'flame-manuscript','Flame Manuscript','nonlinear iterated functions · accumulated density · spectral flame',
    'A manuscript written by repeatedly folding the same point. Its letters are made of probability, and the ink keeps changing its mind.',
    function(){this.r=rng(648);this.x=.1;this.y=.1;this.cv=document.createElement('canvas');this.cv.width=640;this.cv.height=400;this.cx=this.cv.getContext('2d');this.cx.fillStyle='#050719';this.cx.fillRect(0,0,640,400);},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t,cc=this.cx;if(S.dt>0){cc.fillStyle='rgba(5,7,25,.025)';cc.fillRect(0,0,640,400);var bins=Array.from({length:12},function(){return[];});
        for(var j=0;j<6500;j++){var x=this.x,y=this.y,a=-1.4+.06*Math.sin(t*.037),b=1.65+.05*Math.cos(t*.029);this.x=Math.sin(a*y)+Math.cos(a*x);this.y=Math.sin(b*x)+.72*Math.cos(b*y);var bin=Math.min(11,Math.floor((Math.atan2(this.y,this.x)+Math.PI)/TAU*12));bins[bin].push([320+this.x*142,200+this.y*102]);}
        cc.globalCompositeOperation='lighter';bins.forEach(function(B,k){cc.beginPath();B.forEach(function(p){cc.rect(p[0],p[1],1.,1.);});cc.fillStyle=hue(k*30+t*4,55,.14);cc.fill();});cc.globalCompositeOperation='source-over';}c.drawImage(this.cv,0,0,W,H);
    },{previewFrames:100});

  room(51,'peristaltic-transit','Peristaltic Transit','contracting passage · moving cross-sections · spectral depth',
    'The tunnel carries you like a living river. Its contractions travel toward you and then pass through the place where you were.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H);for(var j=65;j>=0;j--){var z=((j*.25-t*.5)%16.5+16.5)%16.5,k=Math.min(W,H)*1.2/(z+.7),cx=W*.5+Math.sin(z*.35+t*.11)*k*.32,cy=H*.5+Math.cos(z*.3-t*.09)*k*.2,r=(.7+.15*Math.sin(z*1.8-t*.9))*k,P=[];
        for(var i=0;i<=64;i++){var a=i/64*TAU,shape=1.+.12*Math.cos(a*4.+z*.2+t*.1);P.push([cx+Math.cos(a)*r*shape,cy+Math.sin(a)*r*shape]);}path(c,P,true);c.strokeStyle=hue(z*20+t*4,55+12*Math.sin(z),.7);c.lineWidth=Math.max(.6,3/(z+.7));c.stroke();}
    });

  room(54,'delaunay-drift','Delaunay Drift','triangular canopy · travelling deformation · low-poly light',
    'The canopy catches a wind that changes direction at every vertex. Its facets keep making new agreements with the light.',
    function(){var r=rng(654);this.N=36;this.M=24;this.jitter=Array.from({length:37*25},function(){return[(r()-.5)*.06,(r()-.5)*.06];});},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H);var F=[],N=this.N,M=this.M,J=this.jitter;
      function p(i,j){var x=(i/N-.5)*4.+J[j*(N+1)+i][0],y=(j/M-.5)*2.8+J[j*(N+1)+i][1],z=.32*Math.sin(x*2.+t*.4)*Math.cos(y*2.-t*.31)+.16*Math.cos(x*3.+y*3.-t*.17);return spin([x,y,z],t*.15);}
      for(var j=0;j<M;j++)for(var i=0;i<N;i++){var A=p(i,j),B=p(i+1,j),C=p(i+1,j+1),D=p(i,j+1),h=i*5+j*7+t*3;face(F,[A,B,C],hue(h,28+24*(.5+.5*Math.sin(i*.3+j*.5-t*.3))));face(F,[A,C,D],hue(h+15,34+24*(.5+.5*Math.cos(i*.3-j*.4-t*.27))));}drawFaces(c,F,W,H);
    });

  room(57,'dragon-kites','Dragon Kites','articulated aerial creatures · wind ribbons · layered flight',
    'The kites have forgotten their strings. They follow one another through the weather, trailing small fragments of sunset.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H,true);for(var k=0;k<9;k++){var depth=.35+k*.075,size=Math.min(W,H)*depth*.17,cx=W*(.5+.4*Math.sin(t*.06+k*2.4)),cy=H*(.5+.34*Math.cos(t*.073+k*1.7));
        for(var j=32;j>=0;j--){var q=j/32,x=cx-q*size*4.5,y=cy+Math.sin(q*9.-t*1.4+k)*size*(.15+q*.4),r=size*(1.-q)*.22+1;c.fillStyle=hue(k*39+j*4+t*4,46+q*20,.8);path(c,[[x+r,y],[x,y-r],[x-r,y],[x,y+r]],true);c.fill();if(j<10){var wing=size*(.7-q)*Math.sin(t*1.4+k+q*4.);path(c,[[x,y],[x-size*.3,y-wing],[x-size*.5,y],[x,y]],true);c.fillStyle=hue(k*39+t*4,64,.35);c.fill();}}}
    },{theme:'paper'});

  room(60,'lichen-observatory','Lichen Observatory','differential growth · elastic boundary · self-avoiding folds',
    'The edge grows faster than the space inside it. The only answer is to fold, and then to fold the folds.',
    function(){this.P=[];for(var i=0;i<110;i++){var a=i/110*TAU,r=.68+.1*Math.sin(a*9.)+.065*Math.sin(a*17.);this.P.push({x:Math.cos(a)*r,y:Math.sin(a)*r});}},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t,P=this.P;bg(c,W,H,true);if(S.dt>0){var N=P.length,moves=[];for(var i=0;i<N;i++){var p=P[i],a=P[(i+N-1)%N],b=P[(i+1)%N],dx=(a.x+b.x-2*p.x)*.07,dy=(a.y+b.y-2*p.y)*.07;
          for(var j=0;j<N;j++){if(j===i||j===(i+1)%N||j===(i+N-1)%N)continue;var q=P[j],x=p.x-q.x,y=p.y-q.y,d=x*x+y*y;if(d<.013&&d>.000001){var f=(.013-d)*.003/d;dx+=x*f;dy+=y*f;}}var radial=(.92-Math.hypot(p.x,p.y))*.006;dx+=p.x*radial;dy+=p.y*radial;moves.push([dx,dy]);}
        P.forEach(function(p,i){p.x+=Math.max(-.008,Math.min(.008,moves[i][0]));p.y+=Math.max(-.008,Math.min(.008,moves[i][1]));});if(P.length<520){for(var i=P.length-1;i>=0;i--){var a=P[i],b=P[(i+1)%P.length];if(Math.hypot(a.x-b.x,a.y-b.y)>.045){P.splice(i+1,0,{x:(a.x+b.x)*.5,y:(a.y+b.y)*.5});if(P.length>=520)break;}}}}
      var scale=Math.min(W,H)*.38;for(var layer=14;layer>=0;layer--){var factor=.36+layer*.045;path(c,P.map(function(p){return[W*.5+p.x*scale*factor,H*.5+p.y*scale*factor];}),true);c.fillStyle=hue(layer*21+t*3,70,.16);c.fill();c.strokeStyle=hue(layer*21+t*3,35,.8);c.lineWidth=1.;c.stroke();}
    },{previewFrames:160,theme:'paper'});

  room(63,'solar-centipede','Solar Centipede','segmented locomotion · procedural legs · radiant exoskeleton',
    'A creature that walks across the night without touching it. The wave moving down its body is older than the stars around it.',function(){},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t;bg(c,W,H);var scale=Math.min(W,H)*.1;for(var j=62;j>=0;j--){var q=j/62,a=q*TAU*1.35+t*.14,r=(.22+q*.68)*Math.min(W,H)*.5,x=W*.5+Math.cos(a)*r,y=H*.5+Math.sin(a)*r*.8,angle=a+Math.PI*.5,s=scale*(.13+.24*(1.-q));
        for(var side=-1;side<=1;side+=2){var phi=angle+side*1.2+.3*Math.sin(t*2.-j*.4),knee=[x+Math.cos(phi)*s*2.,y+Math.sin(phi)*s*2.],foot=[knee[0]+Math.cos(phi+side*.9)*s*1.5,knee[1]+Math.sin(phi+side*.9)*s*1.5];path(c,[[x,y],knee,foot]);c.strokeStyle=hue(j*5+t*5,62,.75);c.lineWidth=Math.max(.7,s*.14);c.stroke();}
        c.save();c.translate(x,y);c.rotate(angle);c.beginPath();c.ellipse(0,0,s*.8,s,0,0,TAU);c.fillStyle=hue(j*5+t*5,46+10*Math.sin(j*.3-t*.6));c.fill();c.strokeStyle=hue(j*5+t*5+30,78,.8);c.lineWidth=1;c.stroke();c.restore();}
    });

  function scanColumn(raw,x,t){for(var y=0;y<300;y++){var v=y/300,phase=Math.sin(v*9.+t*.7)+.5*Math.sin(v*23.-t*.31)+.25*Math.cos(v*41.+t*.23),h=phase*.3+t*.045,idx=(y*480+x)*4;raw[idx]=128+115*Math.sin(h*TAU);raw[idx+1]=128+115*Math.sin(h*TAU+2.1);raw[idx+2]=128+115*Math.sin(h*TAU+4.2);raw[idx+3]=255;}}

  room(64,'afterlight-archive','Afterlight Archive','slit-scan accumulation · temporal painting · chromatic histories',
    'The left side is a memory. The right side is still arriving. The image is a small archive of its own becoming.',
    function(){this.cv=document.createElement('canvas');this.cv.width=480;this.cv.height=300;this.cx=this.cv.getContext('2d');this.image=this.cx.createImageData(480,300);this.cursor=0;for(var x=0;x<480;x++)scanColumn(this.image.data,x,(x-480)/240);this.cx.putImageData(this.image,0,0);},
    function(S){var c=S.ctx,W=S.w,H=S.h,t=S.t,raw=this.image.data;if(S.dt>0){for(var col=0;col<4;col++){var x=this.cursor;scanColumn(raw,x,t);this.cursor=(this.cursor+1)%480;}this.cx.putImageData(this.image,0,0);}
      bg(c,W,H);var n=480-this.cursor;c.drawImage(this.cv,this.cursor,0,n,300,0,0,W*n/480,H);if(this.cursor)c.drawImage(this.cv,0,0,this.cursor,300,W*n/480,0,W*this.cursor/480,H);
    },{previewFrames:180});
})(window);
