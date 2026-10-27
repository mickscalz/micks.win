// Real whole-world rendering and audible Web Audio output under gesture policy.
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
  assert.equal(await page.evaluate(() => Soundscape.enabled), false);
  assert.equal(await page.evaluate(() => Soundscape.sample().state), "off");
  // A real click unlocks the context; no test override of AudioContext or output.
  await page.locator("#ambientToggle").click();
  await wait(
    () => Soundscape.enabled && Soundscape.sample().state === "running",
  );
  await wait(() => Soundscape.sample().rms > 0.002);
  const rms = await page.evaluate(() => Soundscape.sample().rms);
  assert.ok(rms < 0.3, "bounded ambient output");
  await page.evaluate(() => {
    for (let i = 0; i < 80; i++) Cabinet.show(i % 8, { snapshot: false });
  });
  assert.equal(await page.evaluate(() => Soundscape.sample().state), "running");
  assert.equal(
    await page.evaluate(() => testAudioContexts.length),
    1,
    "travel must not allocate more audio graphs",
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await wait(() => Soundscape.sample().state === "suspended");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await wait(() => Soundscape.sample().state === "running");
  await page.locator("#experienceToggle").click();
  await page.locator("#ambientVolume").fill("0");
  await wait(() => Soundscape.sample().rms < 0.0001);
  await page.locator("#ambientVolume").fill("0.35");
  await wait(() => Soundscape.sample().rms > 0.002);
  await page.locator("#experienceClose").click();
  await page.locator("#ambientToggle").click();
  assert.equal(await page.evaluate(() => Soundscape.sample().state), "off");
  await wait(() => testAudioContexts.every((c) => c.state === "closed"));
  // A cancelled in-flight resume cannot turn sound back on later.
  await page.evaluate(async () => {
    const pending = Soundscape.start();
    await Soundscape.stop();
    await pending;
  });
  assert.equal(await page.evaluate(() => Soundscape.enabled), false);
  await wait(() => testAudioContexts.every((c) => c.state === "closed"));
  // Default UI really breeds landscapes, not just a renamed habitat renderer.
  await page.locator("#nurseryToggle").click();
  assert.equal(await page.locator("#nurseryScope").inputValue(), "world");
  assert.equal(
    await page.locator('#nurseryPool option[value^="world:"]').count(),
    328,
  );
  await page.locator("[data-nursery-action=breed]").click();
  await wait(
    () =>
      document.querySelectorAll("#nurseryCandidates img").length === 2 &&
      !document.querySelector("[data-nursery-action=breed]").disabled,
  );
  assert.match(
    await page.locator("#nurseryCandidates img").first().getAttribute("alt"),
    /world-v3/,
  );
  await page.locator("[data-nursery-action=save]").first().click();
  await wait(() =>
    document.querySelector("#nurseryCount").textContent.includes("1"),
  );
  assert.equal(
    await page.locator("#nurseryLibrary .nursery-item").count(),
    1,
    "world founders are not redundant saved offspring",
  );
  const render = await page.evaluate(() => {
    const cv = document.createElement("canvas");
    cv.width = 240;
    cv.height = 150;
    const R = GLR.create(cv),
      gl = R.gl;
    const sample = () => {
      gl.finish();
      const b = new Uint8Array(240 * 150 * 4);
      gl.readPixels(0, 0, 240, 150, gl.RGBA, gl.UNSIGNED_BYTE, b);
      return b;
    };
    const difference = (a, b) =>
      a.reduce((s, v, i) => s + (i % 4 === 3 ? 0 : Math.abs(v - b[i])), 0) /
      (240 * 150 * 3);
    const outputs = [],
      signatures = [],
      stats = [];
    for (let i = 0; i < 8; i++) {
      const source = Cabinet.designs.find((d) => d.worldKernel === i),
        founder = Nursery.worldFounder(source),
        m = Nursery.renderer(founder);
      m.init(R);
      for (let j = 0; j < 50; j++) m.advance({ dt: 0.05 });
      m.frame(R, { dt: 0, fade: 1 });
      const a = sample(),
        clock = m.clock;
      m.frame(R, { dt: 0, fade: 1 });
      const b = sample();
      if (difference(a, b) !== 0 || m.clock !== clock)
        throw Error("held world advances");
      for (let j = 0; j < 60; j++) m.advance({ dt: 0.05 });
      m.frame(R, { dt: 0, fade: 1 });
      const moved = difference(a, sample());
      let lo = 255,
        hi = 0;
      for (let j = 0; j < a.length; j++)
        if (j % 4 !== 3) {
          lo = Math.min(lo, a[j]);
          hi = Math.max(hi, a[j]);
        }
      stats.push({ id: source.id, lo, hi, moved });
      outputs.push(a);
      signatures.push(JSON.stringify(WorldKernels.uniforms(founder.genome)));
      m.dispose(R);
    }
    const pairs = [];
    for (let i = 0; i < 8; i++)
      for (let j = i + 1; j < 8; j++)
        pairs.push(difference(outputs[i], outputs[j]));
    // Isolate each environment module: changing it changes real pixels.
    const base = Nursery.worldFounder(
      Cabinet.designs.find((d) => d.worldKernel === 0),
    );
    const image = (g) => {
      const r = Nursery.validate({ ...base, genome: g }),
        m = Nursery.renderer(r);
      m.init(R);
      m.frame(R, { dt: 0, fade: 1 });
      const b = sample();
      m.dispose(R);
      return b;
    };
    const a = image(base.genome),
      changes = {};
    for (const [k, value] of Object.entries({
      landform: "glass-dunes",
      sky: "aurora",
      water: "dry",
      weather: "rain",
      camera: "overlook",
      scale: 0.95,
    }))
      changes[k] = difference(a, image({ ...base.genome, [k]: value }));
    return { stats, pairs, changes, signatures, gl: gl.getError() };
  });
  assert.equal(render.gl, 0);
  for (const s of render.stats) {
    assert.ok(s.hi - s.lo > 35 && s.hi > 60, JSON.stringify(s));
    assert.ok(s.moved > 0.05, "static environment " + JSON.stringify(s));
  }
  assert.ok(
    render.pairs.every((d) => d > 2),
    "eight structurally different world renders",
  );
  for (const [k, delta] of Object.entries(render.changes))
    assert.ok(delta > 0.1, k + " must change the environment: " + delta);
  await page.setViewportSize({ width: 320, height: 740 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await page.locator("#experienceClose").click();
  assert.ok(await page.locator("#ambientToggle").isVisible());
  assert.deepEqual(errors, []);
  assert.deepEqual(glErrors, []);
  assert.deepEqual(uploads, []);
  console.log(
    "Worlds browser PASS: eight distinct real environment kernels and moving frames; isolated sky/water/weather/camera/scale inheritance, default world-v3 UI and actual thumbnails; held redraw freeze; gesture-unlocked audible RMS " +
      rms.toFixed(4) +
      ", zero-volume silence, repeated travel, immediate off, 320px layout, no uploads.",
  );
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}
