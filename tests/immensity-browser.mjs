// X: all shared GPU environment kernels, finite evolving ecologies and resize continuity.
import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const server = http.createServer((req, res) => {
  const f = path.resolve(root, "." + new URL(req.url, "http://local").pathname);
  if (
    !f.startsWith(root + path.sep) ||
    !fs.existsSync(f) ||
    fs.statSync(f).isDirectory()
  ) {
    res.writeHead(404).end();
    return;
  }
  res.setHeader(
    "Content-Type",
    {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".webp": "image/webp",
    }[path.extname(f)] || "application/octet-stream",
  );
  res.end(fs.readFileSync(f));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--autoplay-policy=user-gesture-required",
    ],
  });
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } }),
    errors = [],
    uploads = [],
    glErrors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error" && m.text().includes("[gl]"))
      glErrors.push(m.text());
  });
  page.on("request", (r) => {
    if (["POST", "PUT"].includes(r.method())) uploads.push(r.url());
  });
  page.on("dialog", (x) => x.accept());
  await page.route("**/fonts.googleapis.com/**", (r) =>
    r.fulfill({ body: "" }),
  );
  await page.route("**/fonts.gstatic.com/**", (r) => r.fulfill({ body: "" }));
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    window.testAudioContexts = [];
    window.AudioContext = new Proxy(Native, {
      construct(target, args) {
        const actual = Reflect.construct(target, args);
        window.testAudioContexts.push(actual);
        return actual;
      },
    });
    let time = performance.now(),
      n = 0,
      jobs = new Map();
    window.requestAnimationFrame = (f) => (jobs.set(++n, f), n);
    window.cancelAnimationFrame = (id) => jobs.delete(id);
    window.testFrames = (n) => {
      for (let i = 0; i < n; i++) {
        time += 16.6667;
        const q = [...jobs.values()];
        jobs.clear();
        q.forEach((f) => f(time));
      }
    };
  });
  const wait = (f, arg = null) =>
    page.waitForFunction(f, arg, { polling: 50, timeout: 45000 });
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  await wait(() => window.Cabinet?.playing);
  await page.evaluate(() => {
    Cabinet.idleDelay = 60000;
    Experience.set("transitionDuration", 0);
    testFrames(2);
  });
  const result = await page.evaluate(() => {
    const cv = document.createElement("canvas");
    cv.width = 180;
    cv.height = 112;
    const R = GLR.create(cv),
      gl = R.gl;
    const bytes = () => {
      gl.finish();
      const a = new Uint8Array(cv.width * cv.height * 4);
      gl.readPixels(0, 0, cv.width, cv.height, gl.RGBA, gl.UNSIGNED_BYTE, a);
      return a;
    };
    const diff = (a, b) =>
      a.reduce((s, x, i) => s + (i % 4 === 3 ? 0 : Math.abs(x - b[i])), 0) /
      (cv.width * cv.height * 3);
    const stats = [];
    for (const d of Cabinet.designs.filter(
      (d) => d.edition === 10 && d.kind === "gl",
    )) {
      const recipe = Nursery.worldFounder(d),
        m = Nursery.renderer(recipe);
      m.init(R);
      m.clock = 12.99;
      m.frame(R, { dt: 0, fade: 1 });
      const a = bytes();
      m.clock += 1 / 60;
      m.frame(R, { dt: 0, fade: 1 });
      const b = bytes();
      m.clock = 67;
      m.frame(R, { dt: 0, fade: 1 });
      const mid = bytes();
      m.clock = 800;
      m.frame(R, { dt: 0, fade: 1 });
      const late = bytes();
      m.frame(R, { dt: 0, fade: 1 });
      const held = bytes();
      const full = late.filter((x, i) => i % 4 !== 3),
        lo = Math.min(...full),
        hi = Math.max(...full);
      stats.push({
        id: d.id,
        near: diff(a, b),
        mid: diff(a, mid),
        late: diff(mid, late),
        held: diff(late, held),
        lo,
        hi,
      });
      m.dispose(R);
    }
    // Feed a known, nonzero trail through both unchanged and actual resize paths.
    const particle = Object.assign(
      {},
      Cabinet.designs.find((d) => d.id === "silk-currents"),
    );
    particle.init(R);
    R.bind(particle.trail.read);
    R.clear(0.23, 0.31, 0.41, 1);
    const original = particle.trail;
    particle.resize(R, cv.width, cv.height);
    const same = particle.trail === original;
    cv.width = 220;
    cv.height = 140;
    particle.resize(R, 220, 140);
    const copy = R.shader(
      "uniform sampler2D uT;void main(){fragColor=texture(uT,vUv);}",
      "check-copy",
    );
    R.blit(copy, null, { uRes: [220, 140] }, [
      { name: "uT", tex: particle.trail.read.tex },
    ]);
    const output = bytes(),
      at = (70 * 220 + 110) * 4;
    const preserved = Array.from(output.slice(at, at + 3));
    return {
      stats,
      same,
      preserved,
      targets: R.targets.length,
      error: gl.getError(),
    };
  });
  assert.equal(result.error, 0);
  assert.equal(result.same, true);
  assert.equal(result.targets, 4, "resizing must dispose the old two targets");
  for (const [i, x] of result.preserved.entries())
    assert.ok(
      Math.abs(x - [59, 79, 105][i]) < 3,
      "particle history survived resize",
    );
  for (const s of result.stats) {
    assert.ok(s.hi - s.lo > 30 && s.hi > 50, JSON.stringify(s));
    assert.ok(s.near < 12, "no epoch cut " + JSON.stringify(s));
    assert.ok(
      s.mid > 0.1 && s.late > 0.1,
      "development continues " + JSON.stringify(s),
    );
    assert.equal(s.held, 0);
  }
  // Real engine resize suppression: unchanged logical dimensions do not reset rain.
  const rain = await page.evaluate(() => {
    const i = Cabinet.designs.findIndex((d) => d.id === "digital-rain");
    Cabinet.show(i);
    testFrames(3);
    const d = Cabinet.designs[i],
      before = d.cols;
    Cabinet.paused = true;
    for (let j = 0; j < 4; j++) {
      Cabinet.pendingResize = true;
      testFrames(1);
    }
    const same = before === d.cols;
    Cabinet.paused = false;
    return same;
  });
  assert.equal(rain, true);
  await page.evaluate(() => Cabinet.wakeUI());
  await page.locator("#nurseryToggle").click();
  const labels = await page.locator("#nurseryParent0 option").allTextContents();
  assert.ok(
    labels.filter((x) => x.startsWith("Exact environment kernel")).length >= 20,
  );
  await page.locator("#experienceClose").click();
  await page.evaluate(() => {
    Cabinet.show(
      Cabinet.designs.findIndex((d) => d.id === "sapphire-spore-forest"),
    );
    testFrames(40);
  });
  await page.locator("#experienceToggle").click();
  assert.match(
    await page.locator("#organismReadout").textContent(),
    /Population \d+ · births \d+ · renewals \d+ · generation \d+/,
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(glErrors, []);
  assert.deepEqual(uploads, []);
  console.log(
    "Immensity browser PASS: twelve exact v3 GPU kernels remain nonblank and diverge at 67/800 seconds, smooth epoch crossing and held freeze; unchanged resizes preserve live state, real GPU trail history survives resize with no target leak; twenty exact nursery labels and live X population counters.",
  );
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}
