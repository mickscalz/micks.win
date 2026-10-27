// Real Canvas offspring, IndexedDB, local PCM worker, profile consent and cancellation.
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
      "--autoplay-policy=no-user-gesture-required",
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
  await page.locator("#nurseryToggle").click();
  await page.locator("#nurseryScope").selectOption("habitat");
  assert.equal(
    await page.locator('#nurseryPool option[value^="source:"]').count(),
    328,
  );
  assert.ok(
    (await page.locator('#nurseryPool option[value^="founder:"]').count()) > 0,
  );
  await page.locator("[data-nursery-action=breed]").click();
  await wait(
    () =>
      document.querySelectorAll("#nurseryCandidates img").length === 2 &&
      !document.querySelector("[data-nursery-action=breed]").disabled,
  );
  assert.match(
    await page.locator("#nurseryCandidates img").first().getAttribute("alt"),
    /habitat-v2/,
  );
  const thumb = await page
    .locator("#nurseryCandidates img")
    .first()
    .evaluate(async (img) => {
      await img.decode();
      const c = document.createElement("canvas");
      c.width = 240;
      c.height = 150;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, 240, 150).data;
      return {
        max: Math.max(...data.filter((_, i) => i % 4 !== 3)),
        unique: new Set(data).size,
      };
    });
  assert.ok(thumb.max > 80 && thumb.unique > 50, "nonblank real GPU preview");
  // Render each form directly in one context: geometry must differ, not just palette.
  const forms = await page.evaluate(() => {
    const cv = document.createElement("canvas");
    cv.width = 180;
    cv.height = 112;
    const R = GLR.create(cv),
      p = Nursery.founderAny(Cabinet.designs[0]),
      result = [];
    for (const shape of Nursery.FORMS) {
      const a = Nursery.validate({ ...p, genome: { ...p.genome, shape } }),
        m = Nursery.renderer(a);
      m.init(R);
      for (let i = 0; i < 50; i++) m.advance({ dt: 0.05 });
      m.frame(R, { dt: 0 });
      const bytes = new Uint8Array(180 * 112 * 4);
      R.gl.readPixels(0, 0, 180, 112, R.gl.RGBA, R.gl.UNSIGNED_BYTE, bytes);
      const max = Math.max(...bytes.filter((_, i) => i % 4 !== 3)),
        hash = Nursery.hash(Array.from(bytes).join(","));
      result.push({ shape, max, hash, error: R.gl.getError() });
      m.dispose(R);
    }
    cv.remove();
    return result;
  });
  assert.equal(new Set(forms.map((f) => f.hash)).size, 12);
  for (const f of forms) {
    assert.equal(f.error, 0, f.shape);
    assert.ok(f.max > 65, f.shape + " nonblank");
  }
  await page
    .locator("#nurseryCandidates [data-nursery-action=audition]")
    .first()
    .click();
  const simulation = await page.evaluate(() => {
    const m = Cabinet.designs[Cabinet.index];
    testFrames(3);
    const before = JSON.stringify(m.L);
    for (let i = 0; i < 80; i++) m.advance({ dt: 0.05 });
    const changed = before !== JSON.stringify(m.L);
    Cabinet.paused = true;
    const state = JSON.stringify([m.L, m.clock]);
    Cabinet.needsDraw = true;
    testFrames(2);
    const held = state === JSON.stringify([m.L, m.clock]);
    Cabinet.paused = false;
    return { kind: m.kind, changed, held, texture: !!m.texture };
  });
  assert.deepEqual(simulation, {
    kind: "glx",
    changed: true,
    held: true,
    texture: true,
  });
  assert.equal(
    await page.evaluate(() => {
      const m = Cabinet.designs[Cabinet.index];
      Cabinet.leaveChild();
      return m.texture === null && Cabinet.designs.length === 328;
    }),
    true,
  );
  await page.locator("#nurseryToggle").click();
  await page
    .locator("summary")
    .filter({ hasText: "Advanced parent pool" })
    .click();
  await page.locator("#nurseryPoolMode").check();
  const ids = await page
    .locator("#nurseryPool option")
    .evaluateAll((o) => o.slice(0, 32).map((o) => o.value));
  await page.locator("#nurseryPool").selectOption(ids);
  await page.locator("[data-nursery-action=breed]").click();
  await wait(
    () => !document.querySelector("[data-nursery-action=breed]").disabled,
  );
  await page
    .locator("#nurseryCandidates [data-nursery-action=save]")
    .first()
    .click();
  await wait(() => NurseryUI.getLibrary().length === 1);
  assert.equal(
    await page.evaluate(() => NurseryUI.getLibrary()[0].parents.length),
    32,
  );
  await page
    .locator("summary")
    .filter({ hasText: "Bounded automatic nursery" })
    .click();
  await page.locator("#nurseryPool").selectOption(ids.slice(0, 4));
  await page.locator("#nurseryGenerations").fill("3");
  await page.locator("#nurseryBudget").fill("20");
  await page.locator("#nurseryArchive").fill("4");
  await page.locator("[data-nursery-action=evolve]").click();
  await wait(
    () => !document.querySelector("[data-nursery-action=evolve]").disabled,
  );
  assert.match(
    await page.locator("#nurseryStatus").textContent(),
    /candidate budget.*20 evaluated/,
  );
  assert.equal(
    await page.locator("#nurseryCandidates .nursery-item").count(),
    4,
  );
  // Save a deeper generation; its available unsaved ancestors must be stored too.
  const deeper = await page
    .locator("#nurseryCandidates input")
    .evaluateAll((inputs) =>
      inputs.findIndex((i) => /^Generation [23]/.test(i.value)),
    );
  assert.ok(deeper >= 0);
  await page
    .locator("#nurseryCandidates [data-nursery-action=save]")
    .nth(deeper)
    .click();
  await wait(
    () => !document.querySelector("[data-nursery-action=save]").disabled,
  );
  const family = await page.evaluate(() => {
    const saved = NurseryUI.getLibrary(),
      ids = new Set(saved.map((p) => p.id));
    Nursery.validateAncestry(saved);
    return {
      count: saved.length,
      complete: saved.every((p) =>
        p.parents.every((id) => !id.startsWith("child-") || ids.has(id)),
      ),
    };
  });
  assert.ok(family.count > 2);
  assert.equal(family.complete, true);
  await page.locator("#nurseryBudget").fill("96");
  await page.locator("#nurseryGenerations").fill("20");
  await page.locator("[data-nursery-action=evolve]").click();
  await page.locator("#nurseryStop").click();
  await wait(
    () => !document.querySelector("[data-nursery-action=evolve]").disabled,
  );
  assert.match(await page.locator("#nurseryStatus").textContent(), /^stopped/);
  // Real codecs through file metadata -> native decode -> float PCM -> DSP worker.
  await page.locator("#musicLabPanel").evaluate((e) => (e.open = true));
  for (const ext of ["mp3", "flac", "ogg"]) {
    await page
      .locator("#audioFile")
      .setInputFiles(path.join(root, "tests/fixtures/local-tone." + ext));
    await wait(
      () =>
        document.querySelector("#audioStatus").textContent.includes("ready") ||
        document.querySelector("audio")?.readyState >= 1,
    );
    await page.locator("#analyzeTrack").click();
    await wait(() => MusicLab.getAnalysis() !== null);
    const a = await page.evaluate(() => MusicLab.getAnalysis());
    assert.ok(a.duration > 2 && a.duration < 3);
    await page.locator("#audioStop").click();
    assert.equal(await page.evaluate(() => MusicLab.getAnalysis()), null);
  }
  // In-flight native decoder can't be aborted, but Stop rejects its result and no
  // second native decode may allocate concurrently.
  const cancel = await page.evaluate(async () => {
    document.querySelector("#nativeDecodeConsent").checked=true;
    const bytes = new ArrayBuffer(64), original = window.OfflineAudioContext;
    let finish,
      calls = 0;
    window.OfflineAudioContext = class {
      constructor() {
        calls++;
      }
      decodeAudioData() {
        return new Promise((resolve) => (finish = resolve));
      }
    };
    MusicLab.setFile(new File([bytes], "cancel.m4a"), { duration: 2.5 });
    const task = MusicLab.analyze();
    for (let i = 0; i < 20 && !finish; i++)
      await new Promise((r) => setTimeout(r, 10));
    MusicLab.release();
    await MusicLab.analyze();
    finish({
      numberOfChannels: 1,
      sampleRate: 16000,
      length: 1600,
      duration: 0.1,
      getChannelData: () => new Float32Array(1600),
    });
    await task;
    window.OfflineAudioContext = original;
    return { calls, analysis: MusicLab.getAnalysis() };
  });
  assert.deepEqual(cancel, { calls: 1, analysis: null });
  await page.setViewportSize({ width: 320, height: 740 });
  for (const id of ["experiencePanel", "nurseryPanel", "musicLabPanel"])
    assert.equal(
      await page
        .locator("#" + id)
        .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
      true,
      id + " overflow",
    );
  assert.deepEqual(errors, []);
  assert.deepEqual(glErrors, []);
  assert.deepEqual(uploads, []);
  console.log(
    "Evolution browser PASS: 328 adapters + legacy, 12 distinct real GPU forms/nonblank thumbnails/evolution/freeze/disposal, 32-parent UI, bounded search + stop + complete saved ancestry, real interruptible MP3/FLAC/Vorbis worker analysis, native cancellation/concurrency, 320px layout, no uploads.",
  );
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}
