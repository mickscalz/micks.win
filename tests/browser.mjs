// Real WebGL2 smoke test, no mocks. Set CHROMIUM_PATH for a custom installation.
// A tiny local server tests the SAME subpath as GitHub project Pages.
import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 const rel=decodeURIComponent(new URL(req.url,'http://local').pathname).replace(/^\/micks.win\//,'');
 const file=path.resolve(root,rel||'index.html');
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try {
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:480,height:320},hasTouch:true});
 const waitUntil=fn=>page.waitForFunction(fn,null,{polling:50});
 // Physical key timing is independent of a slow software-GPU readback.
 // Send a fast typed sequence with explicit monotonic event timestamps.
 const typeRank=text=>page.evaluate(text=>{let at=performance.now();for(const key of text){const event=new KeyboardEvent('keydown',{key,bubbles:true});Object.defineProperty(event,'timeStamp',{value:at});window.dispatchEvent(event);at+=40;}},text);
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:') && r.status()>=400)errors.push('Asset HTTP '+r.status()+': '+r.url());});
 page.on('console',m=>{if(m.type()==='error' && /\[gl\]|\[cabinet\]/.test(m.text()))errors.push(m.text());});
 await page.route('**/fonts.googleapis.com/**',r=>r.fulfill({body:''}));
 await page.route('**/fonts.gstatic.com/**',r=>r.fulfill({body:''}));
 // Drive the real animation callback deterministically: no wall-clock races.
 await page.addInitScript(()=>{
   let time=performance.now(), serial=0; const jobs=new Map();
   window.requestAnimationFrame=f=>{jobs.set(++serial,f);return serial;};
   window.cancelAnimationFrame=id=>jobs.delete(id);
   window.testFrames=n=>{for(let i=0;i<n;i++){time+=16.6667;const batch=[...jobs.values()];jobs.clear();batch.forEach(f=>f(time));}};
 });
 await page.goto(`http://127.0.0.1:${server.address().port}/micks.win/`);
 await waitUntil(()=>window.Cabinet && Cabinet.playing);
 assert.equal(await page.locator('#enter, #curtain').count(),0);
 assert.equal(await page.evaluate(()=>Cabinet.index),0);
 assert.match(await page.locator('#cardCollection').textContent(),/collection 06.*latest.*rank 01/);
 const count=await page.evaluate(()=>Cabinet.designs.length);assert.equal(count,192);
 const ordering=await page.evaluate(()=>Cabinet.designs.map(d=>({id:d.id,edition:d.edition,cap:d.captivation})));
 assert.equal(ordering[0].id,'vertebrae-of-light');
 for(let i=1;i<ordering.length;i++){assert.ok(ordering[i-1].edition>=ordering[i].edition);if(ordering[i-1].edition===ordering[i].edition)assert.ok(ordering[i-1].cap>=ordering[i].cap);}
 // The interface fades on real inactivity, never covers a gallery, and wakes
 // before keyboard focus or a touch can land on invisible controls.
 await page.evaluate(()=>{Cabinet.idleDelay=120;Cabinet.wakeUI();});
 await waitUntil(()=>document.body.classList.contains('is-idle'));
 await page.mouse.move(40,40);
 await waitUntil(()=>!document.body.classList.contains('is-idle'));
 await page.keyboard.press('Tab');
 await page.waitForTimeout(180);
 assert.equal(await page.locator('body').evaluate(b=>b.classList.contains('is-idle')),false);
 await page.evaluate(()=>{Cabinet.idleDelay=60000;Cabinet.wakeUI();});
 const results=[];
 const dynamicCanvas=['gravity-ballet','chromatic-dominion','elastic-constellation','lorenz-silk','chromatic-sandpile','magnetic-pendulum','flame-manuscript','lichen-observatory','afterlight-archive'];
 for(let i=0;i<count;i++){
  const result=await page.evaluate(({i,dynamicCanvas})=>{
   Cabinet.show(i);Cabinet.t=8;testFrames(3);
   const d=Cabinet.designs[i];
   const gl=document.querySelector('#gl').getContext('webgl2');
   gl.finish();
   let pixels=null;
   if(d.edition>=5){const thumb=document.createElement('canvas');thumb.width=40;thumb.height=25;const ctx=thumb.getContext('2d');ctx.drawImage(document.querySelector(d.kind==='2d'?'#c2d':'#gl'),0,0,40,25);const raw=ctx.getImageData(0,0,40,25).data;let lo=255,hi=0;for(let k=0;k<raw.length;k++)if(k%4!==3){lo=Math.min(lo,raw[k]);hi=Math.max(hi,raw[k]);}pixels={lo,hi};}
   let motion=null,frozen=true;
   if(d.edition===6){
     const sample=()=>{const cv=document.createElement('canvas');cv.width=48;cv.height=30;const c=cv.getContext('2d');c.drawImage(document.querySelector(d.kind==='2d'?'#c2d':'#gl'),0,0,48,30);return c.getImageData(0,0,48,30).data;};
     const before=sample(),pin=Cabinet.lingering;Cabinet.lingering=true;Cabinet.t=38;testFrames(dynamicCanvas.includes(d.id)?120:4);gl.finish();const after=sample();
     let sum=0,moved=0;for(let k=0;k<before.length;k+=4){const delta=Math.abs(before[k]-after[k])+Math.abs(before[k+1]-after[k+1])+Math.abs(before[k+2]-after[k+2]);sum+=delta;if(delta>25)moved++;}motion={mean:sum/(48*30*3),moved};
     if(d.kind==='2d'){Cabinet.paused=true;const state=JSON.stringify(d);Cabinet.needsDraw=true;testFrames(1);frozen=state===JSON.stringify(d);Cabinet.paused=false;}
     Cabinet.lingering=pin;
   }
   return {pixels,motion,frozen,id:d.id,kind:d.kind,index:Cabinet.index,requested:i,broken:!!Cabinet.broken[d.id],error:gl.getError()};
  },{i,dynamicCanvas});
  assert.equal(result.index,i,`room was skipped: ${result.id}`);
  assert.equal(result.broken,false,result.id);
  assert.equal(result.error,0,`WebGL error: ${result.id}`);
  if(result.pixels){assert.ok(result.pixels.hi>45 && result.pixels.hi-result.pixels.lo>35,`blank/flat frame: ${result.id} ${JSON.stringify(result.pixels)}`);}
  if(result.motion){assert.ok(result.motion.mean>1&&result.motion.moved>8,`no meaningful evolution: ${result.id} ${JSON.stringify(result.motion)}`);assert.ok(result.frozen,`held redraw advanced state: ${result.id}`);}
  results.push(result);console.log(`✓ ${String(i+1).padStart(2,'0')} ${result.id} (${result.kind})${result.motion?' · evolution '+result.motion.moved+' pixels · hold '+result.frozen:''}`);
 }
 await page.evaluate(()=>Cabinet.wakeUI());
 await page.keyboard.press('g');
 assert.equal(await page.locator('.tile').count(),192);
 for(const [family,count] of [['latest',64],['gl',118],['glx',4],['2d',70],['all',192]]){
  await page.locator(`[data-filter="${family}"]`).click();
  assert.equal(await page.locator('.tile:not([hidden])').count(),count);
  assert.equal(await page.locator(`[data-filter="${family}"]`).getAttribute('aria-pressed'),'true');
  if(family==='latest')assert.deepEqual(await page.locator('.tile:not([hidden])').evaluateAll(tiles=>[...new Set(tiles.map(t=>t.dataset.edition))]),['6']);
 }
 await page.locator('#galJump').fill('192');
 await page.locator('#galJump').press('Tab');
 assert.equal(await page.evaluate(()=>Cabinet.index),191);
 await page.keyboard.press('Escape');
 await page.keyboard.press('Escape');
 await typeRank('192');
 assert.equal(await page.evaluate(()=>Cabinet.index),191);
 await page.keyboard.press('Escape');
 await typeRank('12');
 assert.equal(await page.evaluate(()=>Cabinet.index),11);
 await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>Cabinet.index),12);
 await page.keyboard.press(' ');assert.equal(await page.evaluate(()=>Cabinet.paused),true);
 await page.keyboard.press(' ');assert.equal(await page.evaluate(()=>Cabinet.paused),false);
 // Crossing a release boundary must reach the preceding collection, not mix scores.
 await page.evaluate(()=>{Cabinet.show(63);Cabinet.t=20.99;testFrames(2);});
 assert.equal(await page.evaluate(()=>Cabinet.designs[Cabinet.index].edition),5);
 // Linger is NOT pause: geometry keeps evolving past the dwell, manual travel
 // remains available, and leaving it starts a full dwell without a time reset.
 await page.evaluate(()=>Cabinet.show(0));
 await page.keyboard.press('l');
 assert.equal(await page.locator('[data-act="linger"]').getAttribute('aria-pressed'),'true');
 await page.evaluate(()=>{Cabinet.t=37;testFrames(3);});
 assert.equal(await page.evaluate(()=>Cabinet.index),0);
 assert.ok(await page.evaluate(()=>Cabinet.t)>37);
 await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>Cabinet.index),1);
 assert.equal(await page.evaluate(()=>Cabinet.lingering),true);
 await page.evaluate(()=>{Cabinet.t=37;testFrames(1);});
 const age=await page.evaluate(()=>Cabinet.t);
 await page.keyboard.press('l');
 assert.equal(await page.evaluate(()=>Cabinet.t),age,'leaving Linger must not rewind the artwork');
 await page.evaluate(()=>testFrames(2));
 assert.equal(await page.evaluate(()=>Cabinet.index),1);
 await page.evaluate(()=>Cabinet.show(0));
 // Bright rooms get dark typography, and leaving them restores the dark-world theme.
 await page.evaluate(()=>Cabinet.show(Cabinet.designs.findIndex(d=>d.id==='ink-calligraphy')));
 assert.equal(await page.locator('body').getAttribute('data-world-theme'),'paper');
 await page.evaluate(()=>Cabinet.show(0));
 assert.equal(await page.locator('body').getAttribute('data-world-theme'),'dark');
 // Hold must freeze stateful renderers, not only their displayed clock.
 await page.evaluate(()=>{Cabinet.show(Cabinet.designs.findIndex(d=>d.id==='chromatic-abacus'));testFrames(3);});
 await page.keyboard.press(' ');
 assert.equal(await page.locator('#ctl [data-act="play"]').getAttribute('aria-pressed'),'true');
 const held=await page.evaluate(()=>({t:Cabinet.t,state:JSON.stringify(Cabinet.designs[Cabinet.index].chains)}));
 await page.evaluate(()=>testFrames(15));
 assert.deepEqual(await page.evaluate(()=>({t:Cabinet.t,state:JSON.stringify(Cabinet.designs[Cabinet.index].chains)})),held);
 await page.evaluate(()=>{Cabinet.show(0);testFrames(1);});
 assert.equal(await page.evaluate(()=>Cabinet.fade),1,'paused navigation still paints a fully revealed world');
 await page.keyboard.press(' ');
 await page.evaluate(()=>testFrames(2));
 assert.equal(await page.evaluate(()=>Cabinet.fade),1,'resuming a paused jump must not flash back to black');
 await page.evaluate(()=>window.dispatchEvent(new KeyboardEvent('keydown',{key:'h',ctrlKey:true})));
 assert.equal(await page.evaluate(()=>!!Cabinet.immersive),false,'browser modifier shortcuts are not intercepted');
 // Immersion has a keyboard/touch exit, no hidden tab targets, and gallery restores UI.
 await page.keyboard.press('h');
 assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('is-immersive')),true);
 assert.equal(await page.locator('#ctl').evaluate(el=>el.inert),true);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'immerseReturn');
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('#ctl').evaluate(el=>el.inert),false);
 await page.locator('#ctl [data-act="immerse"]').click();
 await page.keyboard.press('g');
 assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('is-immersive')),false);
 assert.equal(await page.locator('#gal').getAttribute('aria-hidden'),'false');
 await page.keyboard.press('Escape');
 // Deterministic clock: cross the dwell threshold and prove automatic cycling.
 await page.evaluate(()=>{Cabinet.show(191);Cabinet.t=20.99;testFrames(2);});
 assert.equal(await page.evaluate(()=>Cabinet.index),0);
 await page.setViewportSize({width:375,height:812});
 await page.evaluate(()=>testFrames(2));
 await page.evaluate(()=>{Cabinet.idleDelay=120;Cabinet.wakeUI();});
 await page.mouse.move(0,0);
 await waitUntil(()=>document.body.classList.contains('is-idle'));
 await page.touchscreen.tap(190,120);
 await waitUntil(()=>!document.body.classList.contains('is-idle'));
 await page.evaluate(()=>{Cabinet.idleDelay=60000;Cabinet.wakeUI();});
 assert.ok(await page.locator('#ctl [data-act="immerse"]').isVisible(),'immersion must be reachable on touch screens');
 await page.locator('#ctl [data-act="linger"]').click();
 assert.equal(await page.evaluate(()=>Cabinet.lingering),true);
 await page.locator('#ctl [data-act="linger"]').click();
 assert.equal(await page.evaluate(()=>Cabinet.lingering),false);
 await page.setViewportSize({width:320,height:740});
 const bounds=await page.locator('#ctl').boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=321,'touch controls overflow a narrow phone');
 await page.locator('#ctl [data-act="immerse"]').click();
 await page.locator('#immerseReturn').click();
 assert.equal(await page.locator('#ctl').evaluate(el=>el.inert),false);
 assert.ok(await page.locator('[data-act="gallery"]').isVisible(),'gallery must be reachable on touch screens');
 await page.locator('[data-act="gallery"]').click();
 assert.equal(await page.locator('.chip').count(),5);
 await page.locator('.gal__close').waitFor({state:'visible'});
 assert.ok(await page.locator('.gal__close').isVisible());
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('#gal').getAttribute('aria-hidden'),'true');
 assert.equal(await page.evaluate(()=>document.querySelector('#gal').inert),true);
 // Bottom rail must contain actual decoded pictures, at both ends of the
 // horizontally scrolling list, not blank CSS ticks or broken relative paths.
 assert.equal(await page.locator('#rail img').count(),192);
 await page.evaluate(()=>{Cabinet.show(0);Cabinet.wakeUI();});
 await waitUntil(()=>{const im=document.querySelector('#rail img');return im.complete&&im.naturalWidth>0;});
 await page.evaluate(()=>Cabinet.show(191));
 await waitUntil(()=>{const im=document.querySelector('#rail button:last-child img');return im.complete&&im.naturalWidth>0;});
 await page.evaluate(()=>{document.querySelector('#rail img').src='data:image/webp;base64,broken';});
 await page.locator('.rail__item--fallback .rail__fallback').waitFor({state:'attached'});
 assert.match(await page.locator('.rail__fallback').first().textContent(),/Vertebrae of Light/);
 assert.deepEqual(errors,[]);
 console.log('\n192 rooms: real WebGL compilation, draw calls, keyboard, filters, jump, wraparound and mobile resize PASS.');
} finally {
 if(browser)await browser.close();
 await new Promise(r=>server.close(r));
}
