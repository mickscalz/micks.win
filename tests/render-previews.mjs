// Rebuild the lightweight gallery stills from the procedural renderers.
// Start the static server first; SITE_URL and PREVIEW_IDS (comma-separated) are optional.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,
 args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage();
 await page.route('**/fonts.googleapis.com/**',r=>r.fulfill({body:''}));
 await page.route('**/fonts.gstatic.com/**',r=>r.fulfill({body:''}));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
 await page.goto(process.env.SITE_URL||'http://localhost:3000');
 await page.locator('#enter').click();
 await page.evaluate(()=>{
   const cv=document.createElement('canvas');cv.width=384;cv.height=240;
   const c2=document.createElement('canvas');c2.width=960;c2.height=600;
   window.previewState={cv,c2,R:GLR.create(cv),ctx:c2.getContext('2d')};
 });
 const ids=await page.evaluate(()=>DESIGNS.map(d=>d.id));
 const chosen=process.env.PREVIEW_IDS?process.env.PREVIEW_IDS.split(','):ids;
 fs.mkdirSync(path.join(root,'assets/previews'),{recursive:true});
 for(const id of chosen){
   if(!ids.includes(id))throw Error('Unknown room: '+id);
   const image=await page.evaluate(async id=>{
     const {cv,c2,R,ctx}=previewState,d=DESIGNS.find(d=>d.id===id);
     c2.width=960;R.bind(null);R.gl.disable(R.gl.BLEND);R.clear(0,0,0,1);
     const is2d=d.kind==='2d';
     const S={ctx,t:8,dt:1/60,w:is2d?960:384,h:is2d?600:240,mouse:{x:0,y:0},
       pointer:{active:false,x:.5,y:.5},fade:1,energy:.5,seed:.37,dpr:1};
     if(d.kind==='gl'){
       const p=R.shader(d.frag,d.id);if(!p)throw Error('Compile failed: '+id);
       R.blit(p,null,{uRes:[384,240],uTime:8,uFade:1,uMouse:[0,0],uDt:1/60,uEnergy:.5,uRand:.37});
     }else{
       d.init(is2d?S:R);
       let frames=is2d?(d.previewFrames||1):200;
       if(id==='living-coral')frames=220;
       if(id==='digital-rain')frames=90;
       if(id==='harmonograph'||id==='fourier-epicycles'||id==='spirograph')frames=180;
       for(let i=0;i<frames;i++){
         S.t=(is2d && frames===1)?8:i/60;
         if(is2d)d.frame(S);else d.frame(R,S);
         if(i%30===0)await new Promise(r=>setTimeout(r,0));
       }
     }
     const thumb=document.createElement('canvas');thumb.width=480;thumb.height=300;
     thumb.getContext('2d').drawImage(is2d?c2:cv,0,0,480,300);
     return {webp:thumb.toDataURL('image/webp',.77).split(',')[1], png:thumb.toDataURL('image/png').split(',')[1]};
   },id);
   fs.writeFileSync(path.join(root,'assets/previews',id+'.webp'),Buffer.from(image.webp,'base64'));
   if(process.env.PREVIEW_DEBUG_DIR){fs.mkdirSync(process.env.PREVIEW_DEBUG_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.PREVIEW_DEBUG_DIR,id+'.png'),Buffer.from(image.png,'base64'));}
   console.log('Rendered '+id);
 }
} finally {await browser.close();}
