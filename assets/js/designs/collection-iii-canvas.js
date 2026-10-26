/* Collection III — six drawn worlds, six different mechanisms.
   No dependencies; state is owned by each room and only advanced on stage. */
(function(w){
  'use strict';
  var TAU=Math.PI*2;
  function rand(seed){var s=seed;return function(){s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function meta(id,name,score,tag,blurb,art,init,frame,warmup){w.D({id:id,name:name,edition:3,rank:0,captivation:score,tag:tag,blurb:blurb,art:art,
    preview:'assets/previews/'+id+'.webp',kind:'2d',theme:id==='ink-calligraphy'?'paper':'dark',init:init,frame:frame,previewFrames:warmup||1});}
  function background(ctx,W,H,stops){var g=ctx.createLinearGradient(0,0,0,H);for(var i=0;i<stops.length;i++)g.addColorStop(stops[i][0],stops[i][1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}

  meta('murmuration','Murmuration',92,'collective motion · local steering · dusk',
    'No bird knows the shape of the flock. Each follows only its neighbours, and together they write something that none of them could imagine.',
    'linear-gradient(#111f3c,#9c627b,#efb980,#253b4b)',
    function(){var r=rand(6601);this.birds=[];for(var i=0;i<230;i++){var a=r()*TAU,rad=Math.sqrt(r());this.birds.push({x:.5+Math.cos(a)*rad*.29,y:.44+Math.sin(a)*rad*.22,vx:(r()-.5)*.1,vy:(r()-.5)*.1,z:r(),ph:r()*TAU});}},
    function(S){var ctx=S.ctx,W=S.w,H=S.h,dt=Math.min(S.dt,.035),T=S.t;
      background(ctx,W,H,[[0,'#101c35'],[.5,'#765569'],[.78,'#bb8c79'],[1,'#233044']]);
      // A pale, partially obscured moon, not an emissive sun.
      ctx.fillStyle='rgba(240,223,194,.68)';ctx.beginPath();ctx.arc(W*.72,H*.29,H*.047,0,TAU);ctx.fill();
      for(var l=0;l<5;l++){ctx.fillStyle='rgba(30,40,58,'+( .11+l*.025)+')';ctx.beginPath();ctx.moveTo(0,H);
        for(var x=0;x<=W+12;x+=12){var y=H*(.82+l*.035)+Math.sin(x/W*8.+l*2.)*H*.028+Math.sin(x/W*19.+l)*H*.012;ctx.lineTo(x,y);}ctx.lineTo(W,H);ctx.fill();}
      var B=this.birds,targetX=.5+.18*Math.sin(T*.15)+S.mouse.x*.12,targetY=.44+.10*Math.cos(T*.19)-S.mouse.y*.07;
      var updates=[];
      for(var i=0;i<B.length;i++){var b=B[i],ax=0,ay=0,vx=0,vy=0,cx=0,cy=0,n=0;
        for(var j=0;j<B.length;j++){if(i===j)continue;var q=B[j],dx=q.x-b.x,dy=q.y-b.y,d=dx*dx+dy*dy;
          if(d<.012){cx+=q.x;cy+=q.y;vx+=q.vx;vy+=q.vy;n++;if(d<.0005){ax-=dx/(d+.0001)*.0009;ay-=dy/(d+.0001)*.0009;}}}
        if(n){ax+=(cx/n-b.x)*.6+(vx/n-b.vx)*.9;ay+=(cy/n-b.y)*.6+(vy/n-b.vy)*.9;}
        ax+=(targetX-b.x)*.14;ay+=(targetY-b.y)*.14;
        var nvx=b.vx+ax*dt,nvy=b.vy+ay*dt,sp=Math.hypot(nvx,nvy),lim=.035+b.z*.025;
        if(sp>lim){nvx=nvx/sp*lim;nvy=nvy/sp*lim;}updates.push([nvx,nvy]);
      }
      for(var k=0;k<B.length;k++){var b=B[k];b.vx=updates[k][0];b.vy=updates[k][1];b.x+=b.vx*dt;b.y+=b.vy*dt;
        var X=b.x*W,Y=b.y*H,sz=(1.4+b.z*2.9)*Math.min(W,H)/650;
        var angle=Math.atan2(b.vy*H,b.vx*W),wing=(.35+.65*Math.abs(Math.sin(T*(5.+b.z*3.)+b.ph)))*sz*2.5;
        ctx.save();ctx.translate(X,Y);ctx.rotate(angle);ctx.fillStyle='rgba(7,14,28,'+(.45+b.z*.5)+')';
        ctx.beginPath();ctx.moveTo(sz*2,0);ctx.lineTo(-sz,wing);ctx.lineTo(-sz*.15,0);ctx.lineTo(-sz,-wing);ctx.closePath();ctx.fill();ctx.restore();}
    },180);

  meta('pyrotechnic-bloom','Pyrotechnic Bloom',91,'ballistic sparks · gravity · afterglow',
    'A garden that lives for three seconds at a time. Gravity draws every stem; the colour belongs to the instant before it goes out.',
    'radial-gradient(at 40% 30%,#ffb98d,#6f346e,#081528,#01050d)',
    function(){this.r=rand(882);this.sparks=[];this.next=0;this.serial=0;},
    function(S){var ctx=S.ctx,W=S.w,H=S.h,dt=Math.min(S.dt,.035),T=S.t;
      ctx.fillStyle='#030815';ctx.fillRect(0,0,W,H);
      if(T>=this.next){this.next=T+.9;var cx=.18+this.r()*.64,cy=.18+this.r()*.4,hue=(this.serial++*137.5+24)%360;
        for(var j=0;j<190;j++){var a=this.r()*TAU,v=.10+this.r()*.20;this.sparks.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:3.0+this.r()*1.4,age:0,h:hue+this.r()*24});}}
      ctx.globalCompositeOperation='lighter';
      for(var i=this.sparks.length-1;i>=0;i--){var p=this.sparks[i],ox=p.x,oy=p.y;p.age+=dt;if(p.age>p.life){this.sparks.splice(i,1);continue;}
        p.vx*=Math.exp(-dt*.32);p.vy+=dt*.075;p.x+=p.vx*dt;p.y+=p.vy*dt;
        var a=Math.pow(1.-p.age/p.life,1.6),flick=.65+.35*Math.sin(p.age*46.+i),sc=Math.min(W,H)/650;
        ctx.strokeStyle='hsla('+p.h+',95%,70%,'+(Math.min(1,a*flick*1.55))+')';ctx.lineWidth=Math.max(.9,2.1*sc);
        ctx.beginPath();ctx.moveTo((p.x-p.vx*.13)*W,(p.y-p.vy*.13)*H);ctx.lineTo(p.x*W,p.y*H);ctx.stroke();
        if(i%3===0){ctx.fillStyle='hsla('+p.h+',100%,65%,'+(a*.20)+')';ctx.beginPath();ctx.arc(p.x*W,p.y*H,6*sc,0,TAU);ctx.fill();}}
      ctx.globalCompositeOperation='source-over';
      var mist=ctx.createLinearGradient(0,H*.7,0,H);mist.addColorStop(0,'rgba(8,15,30,0)');mist.addColorStop(1,'rgba(28,24,48,.65)');ctx.fillStyle=mist;ctx.fillRect(0,H*.7,W,H*.3);
    },150);

  meta('clockwork-orrery','Clockwork Orrery',89,'brass gearing · mechanical harmonics · engraved circles',
    'A machine for keeping time on a world with three suns. The teeth agree perfectly. The hands never will.',
    'radial-gradient(#d6ac61,#3d4f52,#0a192a,#020710)',
    function(){},
    function(S){var ctx=S.ctx,W=S.w,H=S.h,t=S.t,R=Math.min(W,H)*.37;
      ctx.fillStyle='#030b15';ctx.fillRect(0,0,W,H);
      var glow=ctx.createRadialGradient(W*.5,H*.48,0,W*.5,H*.48,R*1.8);glow.addColorStop(0,'rgba(37,66,77,.4)');glow.addColorStop(1,'rgba(3,11,21,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
      function gear(x,y,r,teeth,ang){ctx.save();ctx.translate(x,y);ctx.rotate(ang);
        ctx.beginPath();for(var j=0;j<teeth*4;j++){var a=j/(teeth*4)*TAU,rr=r*(j%4===1||j%4===2?1.:.94);var px=Math.cos(a)*rr,py=Math.sin(a)*rr;if(!j)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();
        ctx.strokeStyle='rgba(223,184,111,.7)';ctx.lineWidth=1.2;ctx.stroke();
        for(var ring=0;ring<3;ring++){ctx.beginPath();ctx.arc(0,0,r*(.87-ring*.17),0,TAU);ctx.strokeStyle='rgba(160,183,179,'+(.24-ring*.05)+')';ctx.lineWidth=.7;ctx.stroke();}
        for(var k=0;k<teeth;k++){var aa=k/teeth*TAU;ctx.beginPath();ctx.moveTo(Math.cos(aa)*r*.77,Math.sin(aa)*r*.77);ctx.lineTo(Math.cos(aa)*r*.82,Math.sin(aa)*r*.82);ctx.strokeStyle='rgba(232,193,113,.4)';ctx.stroke();}
        for(var s=0;s<6;s++){var a=s/6*TAU;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.19,Math.sin(a)*r*.19);ctx.lineTo(Math.cos(a)*r*.56,Math.sin(a)*r*.56);ctx.strokeStyle='rgba(141,169,174,.36)';ctx.lineWidth=r*.018;ctx.stroke();}
        ctx.beginPath();ctx.arc(0,0,r*.14,0,TAU);ctx.strokeStyle='rgba(250,213,143,.7)';ctx.lineWidth=2;ctx.stroke();ctx.restore();}
      gear(W*.44,H*.49,R,72,t*.07);gear(W*.44+R*1.36,H*.49,R*.4,29,-t*.174);
      gear(W*.44-R*.72,H*.49-R*.94,R*.23,17,-t*.3);
      ctx.save();ctx.translate(W*.44,H*.49);
      for(var p=0;p<3;p++){var rr=R*(.32+p*.15),a=t*(.16+p*.11)+p*2.;ctx.beginPath();ctx.arc(0,0,rr,0,TAU);ctx.strokeStyle='rgba(120,180,193,.16)';ctx.lineWidth=.6;ctx.stroke();
        var x=Math.cos(a)*rr,y=Math.sin(a)*rr;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(x,y);ctx.strokeStyle='rgba(232,198,128,.4)';ctx.stroke();ctx.beginPath();ctx.arc(x,y,3+p,0,TAU);ctx.fillStyle=['#d4af69','#8fc3cc','#cc8599'][p];ctx.fill();}
      ctx.restore();
    });

  meta('ink-calligraphy','Ink Calligraphy',87,'brush ribbons · paper grain · negative space',
    'Not everything vast has to be bright. A single stroke can hold as much motion as a galaxy, if you leave enough silence around it.',
    'linear-gradient(135deg,#e7ddc5,#aeb7af,#293e4a,#bd633e)',
    function(){var c=w.document.createElement('canvas');c.width=512;c.height=384;var g=c.getContext('2d'),im=g.createImageData(512,384),r=rand(1993);
      for(var i=0;i<im.data.length;i+=4){var n=(r()-.5)*16;im.data[i]=224+n;im.data[i+1]=215+n;im.data[i+2]=193+n;im.data[i+3]=255;}g.putImageData(im,0,0);this.paper=c;},
    function(S){var ctx=S.ctx,W=S.w,H=S.h,t=S.t;ctx.drawImage(this.paper,0,0,W,H);
      var colors=['rgba(13,32,45,.88)','rgba(33,68,80,.78)','rgba(168,66,36,.70)'];
      for(var ribbon=0;ribbon<3;ribbon++){var pts=[],r=ribbon,phi=t*.065+r*.8;
        for(var j=0;j<=220;j++){var u=j/220,a=u*TAU*1.55+phi,rad=(.27-.17*u)*(1.+.07*Math.sin(u*17.+t*.1));
          var x=W*(.52+rad*Math.cos(a)*.95)+Math.sin(u*8.+r)*W*.035;
          var y=H*(.50+rad*Math.sin(a)*1.55);var width=(3+Math.pow(Math.sin(u*Math.PI),2.)*20)*(1.-r*.2)*Math.min(W,H)/700;
          pts.push({x:x,y:y,w:width,a:a});}
        ctx.beginPath();for(var i=0;i<pts.length;i++){var p=pts[i],X=p.x+Math.cos(p.a)*p.w,Y=p.y+Math.sin(p.a)*p.w;if(!i)ctx.moveTo(X,Y);else ctx.lineTo(X,Y);}
        for(var i=pts.length-1;i>=0;i--){var p=pts[i];ctx.lineTo(p.x-Math.cos(p.a)*p.w,p.y-Math.sin(p.a)*p.w);}ctx.closePath();ctx.fillStyle=colors[r];ctx.fill();
        // Fine dry-brush striations follow the same stroke, not a screen overlay.
        for(var bristle=0;bristle<5;bristle++){ctx.beginPath();for(var k=0;k<pts.length;k++){var p=pts[k],off=(bristle/4-.5)*p.w*.7;var X=p.x+Math.cos(p.a)*off,Y=p.y+Math.sin(p.a)*off;if(!k)ctx.moveTo(X,Y);else ctx.lineTo(X,Y);}ctx.strokeStyle='rgba(221,212,190,.12)';ctx.lineWidth=.6;ctx.stroke();}
      }
    });

  meta('tensegrity-swarm','Tensegrity Swarm',84,'icosahedral cages · depth-sorted projection',
    'Rigid rods that never quite touch, held apart by a web of tension. A structure that survives because it refuses to settle.',
    'radial-gradient(#a7dae5,#245877,#17233c,#030612)',
    function(){var g=(1+Math.sqrt(5))/2;this.V=[];for(var s=-1;s<=1;s+=2)for(var t=-1;t<=1;t+=2){this.V.push([0,s,t*g],[s,t*g,0],[t*g,0,s]);}
      this.E=[];for(var i=0;i<this.V.length;i++)for(var j=i+1;j<this.V.length;j++){var a=this.V[i],b=this.V[j],d=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);if(d<2.01)this.E.push([i,j]);}},
    function(S){var ctx=S.ctx,W=S.w,H=S.h,T=S.t;ctx.fillStyle='#030815';ctx.fillRect(0,0,W,H);
      var glow=ctx.createRadialGradient(W*.52,H*.45,0,W*.52,H*.45,H*.65);glow.addColorStop(0,'rgba(18,55,84,.5)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
      var cages=[];for(var c=0;c<7;c++){var a=T*.12+c*TAU/7,depth=Math.sin(a)*1.5;var scale=(.15+.02*Math.cos(c))*Math.min(W,H)/(3.+depth*.4),px=W*.5+Math.cos(a)*Math.min(W,H)*.28,py=H*.47+Math.sin(a*1.3+c)*H*.16;
        var P=[],ry=T*.3+c,rx=T*.17+c*.7;for(var i=0;i<this.V.length;i++){var v=this.V[i],x=v[0]*Math.cos(ry)+v[2]*Math.sin(ry),z=-v[0]*Math.sin(ry)+v[2]*Math.cos(ry),y=v[1]*Math.cos(rx)-z*Math.sin(rx),zz=v[1]*Math.sin(rx)+z*Math.cos(rx);var k=4/(4+zz*.2);P.push([px+x*scale*k,py+y*scale*k,zz]);}cages.push({P:P,z:depth,c:c});}
      cages.sort(function(a,b){return b.z-a.z;});
      for(var k=0;k<cages.length;k++){var C=cages[k],P=C.P;ctx.strokeStyle='hsla('+(184+C.c*11)+',65%,70%,'+(.2+(1.5-C.z)*.12)+')';ctx.lineWidth=.9;
        ctx.beginPath();for(var e=0;e<this.E.length;e++){var pair=this.E[e];ctx.moveTo(P[pair[0]][0],P[pair[0]][1]);ctx.lineTo(P[pair[1]][0],P[pair[1]][1]);}ctx.stroke();
        for(var v=0;v<P.length;v++){ctx.fillStyle='rgba(185,233,245,.75)';ctx.beginPath();ctx.arc(P[v][0],P[v][1],1.6,0,TAU);ctx.fill();}}
    });

  meta('pendulum-tides','Pendulum Tides',82,'phase drift · pendulum waves · specular beads',
    'Forty-eight pendulums released together, each with a slightly different period. Order leaves slowly, then returns all at once.',
    'linear-gradient(130deg,#041727,#658998,#f0d7ae,#082333)',
    function(){},
    function(S){var ctx=S.ctx,W=S.w,H=S.h,t=S.t;ctx.fillStyle='#020a14';ctx.fillRect(0,0,W,H);var span=Math.min(W*.78,H*1.25),start=W*.5-span*.5,top=H*.18;
      ctx.strokeStyle='rgba(124,174,190,.35)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(start-14,top);ctx.lineTo(start+span+14,top);ctx.stroke();
      var beads=[];for(var i=0;i<48;i++){var phase=t*1.7/Math.sqrt(1.+i*.027),swing=Math.sin(phase)*.66,len=H*(.32+.20*i/47),x=start+i/47*span,y=top+len*Math.cos(swing),dx=Math.sin(swing)*len;
        ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x+dx,y);ctx.strokeStyle='rgba(140,179,190,.18)';ctx.lineWidth=.65;ctx.stroke();beads.push({x:x+dx,y:y,r:Math.max(3.0,Math.min(W,H)*.012),i:i});}
      for(var j=0;j<beads.length;j++){var b=beads[j],g=ctx.createRadialGradient(b.x-b.r*.3,b.y-b.r*.4,0,b.x,b.y,b.r);g.addColorStop(0,'#f4e8d4');g.addColorStop(.24,'#a9c8cf');g.addColorStop(.7,'#284b61');g.addColorStop(1,'#081522');ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();
        ctx.fillStyle='rgba(55,119,145,.07)';ctx.beginPath();ctx.ellipse(b.x,H*.83,b.r*1.5,b.r*.5,0,0,TAU);ctx.fill();}
    });
})(window);
