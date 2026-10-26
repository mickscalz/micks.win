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
 const count=await page.evaluate(()=>Cabinet.designs.length);assert.equal(count,46);
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
 assert.equal(await page.locator('.tile').count(),46);
 for(const [family,count] of [['gl',26],['glx',4],['2d',16],['all',46]]){
  await page.locator(`[data-filter="${family}"]`).click();
  assert.equal(await page.locator('.tile:not([hidden])').count(),count);
  assert.equal(await page.locator(`[data-filter="${family}"]`).getAttribute('aria-pressed'),'true');
 }
 await page.locator('#galJump').fill('46');
 await page.locator('#galJump').press('Tab');
 assert.equal(await page.evaluate(()=>Cabinet.index),45);
 await page.keyboard.press('Escape');
 await page.keyboard.press('1');await page.keyboard.press('2');
 assert.equal(await page.evaluate(()=>Cabinet.index),11);
 await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>Cabinet.index),12);
 await page.keyboard.press(' ');assert.equal(await page.evaluate(()=>Cabinet.paused),true);
 await page.keyboard.press(' ');assert.equal(await page.evaluate(()=>Cabinet.paused),false);
 // Deterministic clock: cross the dwell threshold and prove automatic cycling.
 await page.evaluate(()=>{Cabinet.show(45);Cabinet.t=20.99;testFrames(2);});
 assert.equal(await page.evaluate(()=>Cabinet.index),0);
 await page.setViewportSize({width:375,height:812});
 await page.evaluate(()=>testFrames(2));
 assert.ok(await page.locator('[data-act="gallery"]').isVisible(),'gallery must be reachable on touch screens');
 await page.locator('[data-act="gallery"]').click();
 assert.equal(await page.locator('.chip').count(),4);
 await page.locator('.gal__close').waitFor({state:'visible'});
 assert.ok(await page.locator('.gal__close').isVisible());
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('#gal').getAttribute('aria-hidden'),'true');
 assert.equal(await page.evaluate(()=>document.querySelector('#gal').inert),true);
 assert.deepEqual(errors,[]);
 console.log('\n46 rooms: real WebGL compilation, draw calls, keyboard, filters, jump, wraparound and mobile resize PASS.');
} finally {
 if(browser)await browser.close();
 await new Promise(r=>server.close(r));
}
