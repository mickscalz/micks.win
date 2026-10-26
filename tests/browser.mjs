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
 const page=await browser.newPage({viewport:{width:480,height:320}});
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
 await page.locator('#enter').click();
 assert.equal(await page.evaluate(()=>Cabinet.index),0);
 assert.match(await page.locator('#cardCollection').textContent(),/collection 04.*latest.*rank 01/);
 const count=await page.evaluate(()=>Cabinet.designs.length);assert.equal(count,86);
 const ordering=await page.evaluate(()=>Cabinet.designs.map(d=>({id:d.id,edition:d.edition,cap:d.captivation})));
 assert.equal(ordering[0].id,'glass-meridian');
 for(let i=1;i<ordering.length;i++){assert.ok(ordering[i-1].edition>=ordering[i].edition);if(ordering[i-1].edition===ordering[i].edition)assert.ok(ordering[i-1].cap>=ordering[i].cap);}
 const results=[];
 for(let i=0;i<count;i++){
  const result=await page.evaluate(i=>{
   Cabinet.show(i);testFrames(3);
   const d=Cabinet.designs[i];
   const gl=document.querySelector('#gl').getContext('webgl2');
   gl.finish();
   return {id:d.id,kind:d.kind,index:Cabinet.index,requested:i,broken:!!Cabinet.broken[d.id],error:gl.getError()};
  },i);
  assert.equal(result.index,i,`room was skipped: ${result.id}`);
  assert.equal(result.broken,false,result.id);
  assert.equal(result.error,0,`WebGL error: ${result.id}`);
  results.push(result);console.log(`✓ ${String(i+1).padStart(2,'0')} ${result.id} (${result.kind})`);
 }
 await page.keyboard.press('g');
 assert.equal(await page.locator('.tile').count(),86);
 for(const [family,count] of [['latest',20],['gl',52],['glx',4],['2d',30],['all',86]]){
  await page.locator(`[data-filter="${family}"]`).click();
  assert.equal(await page.locator('.tile:not([hidden])').count(),count);
  assert.equal(await page.locator(`[data-filter="${family}"]`).getAttribute('aria-pressed'),'true');
  if(family==='latest')assert.deepEqual(await page.locator('.tile:not([hidden])').evaluateAll(tiles=>[...new Set(tiles.map(t=>t.dataset.edition))]),['4']);
 }
 await page.locator('#galJump').fill('86');
 await page.locator('#galJump').press('Tab');
 assert.equal(await page.evaluate(()=>Cabinet.index),85);
 await page.keyboard.press('Escape');
 await page.keyboard.press('1');await page.keyboard.press('2');
 assert.equal(await page.evaluate(()=>Cabinet.index),11);
 await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>Cabinet.index),12);
 await page.keyboard.press(' ');assert.equal(await page.evaluate(()=>Cabinet.paused),true);
 await page.keyboard.press(' ');assert.equal(await page.evaluate(()=>Cabinet.paused),false);
 // Crossing a release boundary must reach the preceding collection, not mix scores.
 await page.evaluate(()=>{Cabinet.show(19);Cabinet.t=20.99;testFrames(2);});
 assert.equal(await page.evaluate(()=>Cabinet.designs[Cabinet.index].edition),3);
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
 await page.evaluate(()=>{Cabinet.show(85);Cabinet.t=20.99;testFrames(2);});
 assert.equal(await page.evaluate(()=>Cabinet.index),0);
 await page.setViewportSize({width:375,height:812});
 await page.evaluate(()=>testFrames(2));
 assert.ok(await page.locator('#ctl [data-act="immerse"]').isVisible(),'immersion must be reachable on touch screens');
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
 assert.deepEqual(errors,[]);
 console.log('\n86 rooms: real WebGL compilation, draw calls, keyboard, filters, jump, wraparound and mobile resize PASS.');
} finally {
 if(browser)await browser.close();
 await new Promise(r=>server.close(r));
}
