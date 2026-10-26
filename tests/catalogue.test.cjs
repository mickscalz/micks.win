const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
const window = {};
const scope = vm.createContext({ window });
for (const file of scripts) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  new vm.Script(source, { filename: file }); // parse all assets, including engine
  if (file.includes('/designs/') || file.includes('glsl-prelude') || file.endsWith('/catalogue.js')) vm.runInContext(source, scope);
}
const designs = window.DESIGNS.slice().sort((a,b) => a.rank-b.rank);

test('192 distinct designs: newest collections first, editorial scores descending within each', () => {
  assert.equal(designs.length, 192);
  assert.equal(new Set(designs.map(d => d.id)).size, 192);
  assert.deepEqual(Array.from(designs, d => d.rank), Array.from({length:192}, (_,i) => i+1));
  for (let i=1;i<designs.length;i++) {
    assert.ok(designs[i-1].edition >= designs[i].edition);
    if(designs[i-1].edition===designs[i].edition) assert.ok(designs[i-1].captivation >= designs[i].captivation);
  }
  assert.equal(designs[0].id,'vertebrae-of-light');
  assert.deepEqual([6,5,4,3,2,1].map(e=>designs.filter(d=>d.edition===e).length),[64,42,20,20,22,24]);
});
test('every room honours its renderer contract and carries gallery copy', () => {
  for (const d of designs) {
    for (const k of ['id','name','tag','blurb','art']) assert.ok(typeof d[k]==='string' && d[k].length, `${d.id}: ${k}`);
    assert.ok(Number.isInteger(d.edition) && d.edition >= 1, d.id+': edition');
    assert.ok(Number.isFinite(d.captivation) && d.captivation >= 0 && d.captivation <= 100, d.id+': score');
    assert.match(d.id, /^[a-z0-9-]+$/);
    assert.ok(d.preview && fs.existsSync(path.join(root, d.preview)), `${d.id}: rendered gallery preview`);
    assert.ok(['gl','glx','2d'].includes(d.kind), d.id);
    if(d.kind==='gl') assert.match(d.frag, /void main\(\)/, d.id);
    else {
      assert.equal(typeof d.init, 'function', d.id);
      assert.equal(typeof d.frame, 'function', d.id);
    }
  }
  assert.equal(designs.filter(d=>d.kind==='gl').length,118);
  assert.equal(designs.filter(d=>d.kind==='glx').length,4);
  assert.equal(designs.filter(d=>d.kind==='2d').length,70);
});
test('all local assets exist, use relative paths, and load before the engine', () => {
  for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const url=m[1];
    if(/^(https?:|data:|#)/.test(url)) continue;
    assert.ok(!url.startsWith('/'),`project Pages path must be relative: ${url}`);
    assert.ok(fs.existsSync(path.join(root,url)),url);
  }
  const engine=scripts.indexOf('assets/js/engine.js');
  assert.ok(scripts.filter(f=>f.includes('/designs/')).every(f=>scripts.indexOf(f)<engine));
  assert.match(html,/id="cardTotal">\/ 192/);
  assert.match(html,/id="galCount">192/);
});
test('new simulation shader bodies do not redeclare shared uniforms', () => {
  const src=fs.readFileSync(path.join(root,'assets/js/designs/sims.js'),'utf8');
  assert.ok(!/uniform (?:float|vec2) u(?:Time|Res|Mouse|Rand|Fade|Dt|Energy);/.test(src));
});

test('future releases always lead, even when their scores are lower; tie order is stable',()=>{
  const sample=[{id:'old',edition:1,captivation:99},{id:'b',edition:9,captivation:4},{id:'a',edition:9,captivation:4},{id:'middle',edition:2,captivation:80}];
  const ordered=window.CabinetCatalogue.order(sample);
  assert.deepEqual(Array.from(ordered,d=>d.id),['a','b','middle','old']);
  assert.deepEqual(Array.from(ordered,d=>d.collectionRank),[1,2,1,1]);
  assert.deepEqual(Array.from(window.CabinetCatalogue.order(ordered),d=>d.id),['a','b','middle','old']);
});

test('direct entry has no click gate and the bottom rail uses real preview images',()=>{
 assert.doesNotMatch(html,/id="(?:enter|curtain)"/);
 const src=fs.readFileSync(path.join(root,'assets/js/engine.js'),'utf8');
 assert.match(src,/createElement\('img'\)/);
 assert.match(src,/img\.src = new w.URL/);
 assert.match(src,/rail__item--fallback/);
});


test('Collection VI adds 64 independently named constructions with bounded render budgets',()=>{
 const latest=designs.filter(d=>d.edition===6);
 assert.equal(latest.length,64);
 assert.equal(latest.filter(d=>d.kind==='gl').length,42);
 assert.equal(latest.filter(d=>d.kind==='2d').length,22);
 assert.equal(new Set(latest.map(d=>d.name)).size,64);
 const shaders=latest.filter(d=>d.kind==='gl');
 assert.equal(new Set(shaders.map(d=>d.frag)).size,42);
 for(const d of shaders){assert.match(d.frag,/uTime/);assert.ok(d.pixelBudget>=400000&&d.pixelBudget<=1100000,d.id);}
 for(const file of ['collection-vi.js','collection-vi-canvas.js']){
   const source=fs.readFileSync(path.join(root,'assets/js/designs',file),'utf8');
   assert.doesNotMatch(source,/Math\.random\(/,'new populations must use local seeded randomness');
 }
});
