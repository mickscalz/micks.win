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
  const page = await browser.newPage({ viewport: { width: 820, height: 800 } }),
    errors = [],
    uploads = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("request", (r) => {
    if (["POST", "PUT"].includes(r.method())) uploads.push(r.url());
  });
  page.on("dialog", (d) => d.accept());
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
  const wait = (fn, arg = null, opts = {}) =>
    page.waitForFunction(fn, arg, { polling: 50, ...opts });
  const goto = async () => {
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await wait(() => window.Cabinet?.playing);
    await page.evaluate(() => {
      Cabinet.idleDelay = 60000;
      Cabinet.wakeUI();
      Experience.set("transitionDuration", 0);
      testFrames(3);
    });
  };
  await goto();
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  assert.deepEqual(
    await page.evaluate(async () =>
      (await indexedDB.databases()).map((x) => x.name),
    ),
    [],
  );
  await page.locator("#nurseryToggle").click();
  // Explicit legacy adapters exercise the unchanged version-1 renderer/storage path.
  await page.locator('#nurseryScope').selectOption('habitat');
  await page.locator('#nurseryParent0').selectOption('founder:eden-of-divergence');
  await page.locator('#nurseryParent1').selectOption('founder:glass-moth-migration');
  await page.locator("[data-nursery-action=breed]").click();
  await wait(
    () =>
      document.querySelectorAll("#nurseryCandidates .nursery-item").length ===
      2,
  );
  await page.locator("#nurseryCandidates img").first().scrollIntoViewIfNeeded();
  await wait(
    () => document.querySelector("#nurseryCandidates img").naturalWidth === 240,
  );
  await page
    .locator("#nurseryCandidates input[type=text]")
    .first()
    .fill("First <seed>");
  await page
    .locator("#nurseryCandidates [data-nursery-action=audition]")
    .first()
    .click();
  const scene = await page.evaluate(() => {
    testFrames(3);
    const d = Cabinet.designs[Cabinet.index],
      cv = document.querySelector("#c2d"),
      out = document.createElement("canvas");
    out.width = 64;
    out.height = 40;
    const c = out.getContext("2d"),
      sample = () => {
        c.drawImage(cv, 0, 0, 64, 40);
        return [...c.getImageData(0, 0, 64, 40).data];
      };
    const a = sample();
    for (let i = 0; i < 120; i++)
      d.advance({ dt: 1 / 60, experience: Experience.frame() });
    testFrames(3);
    const b = sample();
    let sum = 0,
      max = 0;
    for (let i = 0; i < a.length; i++)
      if (i % 4 !== 3) {
        sum += Math.abs(a[i] - b[i]);
        max = Math.max(max, b[i]);
      }
    Cabinet.paused = true;
    const state = JSON.stringify(d);
    Cabinet.needsDraw = true;
    testFrames(1);
    const held = state === JSON.stringify(d);
    Cabinet.paused = false;
    return {
      id: d.id,
      kind: d.kind,
      mean: sum / (64 * 40 * 3),
      max,
      held,
      linger: Cabinet.lingering,
    };
  });
  assert.match(scene.id, /^child-/);
  assert.equal(scene.kind, "2d");
  assert.ok(scene.mean > 0.5);
  assert.ok(scene.max > 60);
  assert.equal(scene.held, true);
  assert.equal(scene.linger, true);
  await wait(
    () => document.querySelector("#cardMeterVal").textContent === "unrated",
  );
  assert.equal(
    await page.locator("[data-act=linger]").getAttribute("aria-pressed"),
    "true",
  );
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.evaluate(() => Cabinet.designs.length), 360);
  assert.equal(
    await page.evaluate(() =>
      Cabinet.designs.some((x) => x.id.startsWith("child-")),
    ),
    false,
  );
  await page.locator("#nurseryToggle").click();
  await page.evaluate(() => {
    window.originalOpen = indexedDB.open;
    indexedDB.open = () => {
      throw new DOMException("Database denied", "SecurityError");
    };
  });
  await page.locator("#nurseryRemember").click();
  await wait(() =>
    document
      .querySelector("#nurseryStatus")
      .textContent.includes("Database denied"),
  );
  assert.equal(await page.locator("#nurseryRemember").isChecked(), false);
  await page.evaluate(() => (indexedDB.open = originalOpen));
  await page.locator("#nurseryRemember").check();
  await wait(() =>
    document
      .querySelector("#nurseryStatus")
      .textContent.includes("Device library loaded"),
  );
  await page
    .locator("#nurseryCandidates [data-nursery-action=save]")
    .first()
    .click();
  await wait(() => NurseryUI.getLibrary().length === 1);
  const first = await page.evaluate(() => NurseryUI.getLibrary()[0].id);
  await goto();
  assert.equal(await page.evaluate(() => NurseryUI.getLibrary().length), 0);
  await page.locator("#nurseryToggle").click();
  await page.locator("#nurseryRemember").check();
  await wait(() => NurseryUI.getLibrary().length === 1);
  assert.equal(
    await page.locator("#nurseryLibrary span").first().textContent(),
    "First <seed> · generation 1 · " +
      (await page.evaluate(() => NurseryUI.getLibrary()[0].genome.shape)),
  );
  await page.locator("#nurseryParent0").selectOption(first);
  await page.locator("[data-nursery-action=breed]").click();
  await page
    .locator("#nurseryCandidates [data-nursery-action=save]")
    .first()
    .click();
  await wait(() => NurseryUI.getLibrary().length === 2);
  assert.equal(
    await page.evaluate(() => NurseryUI.getLibrary().at(-1).generation),
    2,
  );
  await page
    .locator(`#nurseryLibrary [data-id="${first}"][data-nursery-action=delete]`)
    .click();
  await wait(() => NurseryUI.getLibrary().length === 1);
  await page.locator("#nurseryLibrary [data-nursery-action=ancestry]").click();
  assert.match(
    await page.locator("#nurseryAncestry").textContent(),
    /Missing ancestor/,
  );
  const downloadPromise = page.waitForEvent("download");
  await page.locator("[data-nursery-action=export]").click();
  const download = await downloadPromise,
    stream = await download.createReadStream();
  let text = "";
  for await (const chunk of stream) text += chunk.toString();
  const bundle = JSON.parse(text);
  assert.equal(bundle.version, 1);
  assert.ok(bundle.recipes.length >= 1);
  assert.ok(!text.includes("audio"));
  assert.ok(!text.includes("data:image"));
  await page.locator("#nurseryRemember").uncheck();
  await wait(() =>
    document.querySelector("#nurseryStatus").textContent.includes("erased"),
  );
  await goto();
  await page.locator("#nurseryToggle").click();
  await page.locator("#nurseryRemember").check();
  await wait(() =>
    document
      .querySelector("#nurseryStatus")
      .textContent.includes("Device library loaded"),
  );
  assert.equal(await page.evaluate(() => NurseryUI.getLibrary().length), 0);
  await page.locator("#nurseryImport").setInputFiles({
    name: "family.json",
    mimeType: "application/json",
    buffer: Buffer.from(text),
  });
  await wait(() => NurseryUI.getLibrary().length === 1);
  await page.locator("#nurseryImport").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ version: 2, recipes: [] })),
  });
  await wait(() =>
    document.querySelector("#nurseryStatus").textContent.includes("versioned"),
  );
  assert.equal(await page.evaluate(() => NurseryUI.getLibrary().length), 1);
  // A quota error must not report a successful save or modify the session library.
  await page.locator("[data-nursery-action=breed]").click();
  await page.evaluate(() => {
    window.oldPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Quota denied", "QuotaExceededError");
    };
  });
  await page
    .locator("#nurseryCandidates [data-nursery-action=save]")
    .first()
    .click();
  await wait(() =>
    document
      .querySelector("#nurseryStatus")
      .textContent.includes("Quota denied"),
  );
  assert.equal(await page.evaluate(() => NurseryUI.getLibrary().length), 1);
  await page.evaluate(() => (IDBObjectStore.prototype.put = oldPut));
  await page.locator("#nurseryRemember").uncheck();
  await page.locator("[data-nursery-action=clear]").click();
  await wait(() => NurseryUI.getLibrary().length === 0);
  // No storage without consent, but route changes are immediate.
  await page.locator("#musicLabPanel > summary").click();
  await page.locator("#musicRoutes select").first().selectOption("energy");
  await page
    .locator("#musicRoutes input[type=range]")
    .first()
    .evaluate((el) => {
      el.value = "-0.4";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
  assert.equal(
    await page.evaluate(() => MusicLab.serialize().global[0].amount),
    -0.4,
  );
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  await page.locator("#rememberExperience").check();
  await goto();
  assert.equal(
    await page.evaluate(() => MusicLab.serialize().global[0].amount),
    -0.4,
  );
  await page.locator("#experienceToggle").click();
  await page.locator("#rememberExperience").uncheck();
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  await page.locator("#musicLabPanel > summary").click();
  await page.locator("#musicScope").selectOption("world");
  await page.locator("#musicRoutes select").nth(1).selectOption("mutation");
  const worldProfile = await page.evaluate(() => ({
    id: Cabinet.designs[Cabinet.index].id,
    all: MusicLab.serialize(),
  }));
  assert.equal(worldProfile.all[worldProfile.id][0].target, "mutation");
  assert.equal(worldProfile.all.global[0].target, "growth");
  await page.locator("#musicResetRoutes").click();
  assert.equal(
    await page.evaluate(
      (id) => Object.hasOwn(MusicLab.serialize(), id),
      worldProfile.id,
    ),
    false,
  );
  await page.locator("#musicScope").selectOption("global");
  // Actual PCM through Web Audio, and a real worker analyzing the same user-selected file.
  const rate = 8000,
    seconds = 16,
    count = rate * seconds,
    wav = Buffer.alloc(44 + count * 2);
  wav.write("RIFF");
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++) {
    const t = i / rate,
      v =
        Math.sin(t * Math.PI * 2 * (t < 8 ? 110 : 440)) * (t < 8 ? 0.15 : 0.5);
    wav.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  await page.locator("#audioFile").setInputFiles({
    name: "private-lookahead.wav",
    mimeType: "audio/wav",
    buffer: wav,
  });
  await wait(
    () =>
      document.querySelector("#audioPlayer audio") &&
      !document.querySelector("#audioPlayer audio").paused,
  );
  await page.evaluate(() => {
    document.querySelector("#musicLabPanel").open = true;
  });
  await page.locator("#analyzeTrack").click();
  await wait(() => MusicLab.getAnalysis(), null, {
    polling: 50,
    timeout: 30000,
  });
  const analyzed = await page.evaluate(() => MusicLab.getAnalysis());
  assert.equal(analyzed.duration, 16);
  assert.equal(analyzed.rows.length, 32);
  assert.ok(analyzed.changes.length >= 1);
  assert.ok(Math.abs(analyzed.rows[20].centroid - 440) < 10);
  await page.locator("#lookaheadEnabled").check();
  await page.locator("#musicRoutes select").first().selectOption("arc");
  await page
    .locator("#musicRoutes input[type=range]")
    .first()
    .evaluate((el) => {
      el.value = "0.6";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
  const routed = await page.evaluate(() => {
    const e = { growth: 0.5, coupling: 0.5, atmosphere: 0.5, afterglow: 0.5 };
    return MusicLab.apply(e, Experience.signal, 1, {}).growth;
  });
  assert.notEqual(routed, 0.5);
  for (let i = 0; i < 3; i++) {
    await page.locator("#tapMusicTempo").click();
    if (i < 2) await page.waitForTimeout(450);
  }
  const tempoText = () => page.locator("#analysisDetails").textContent();
  const bpm1 = Number(
    (await tempoText()).match(/Corrected tempo ([0-9.]+)/)[1],
  );
  await page.locator("#halfMusicTempo").click();
  const bpm2 = Number(
    (await tempoText()).match(/Corrected tempo ([0-9.]+)/)[1],
  );
  assert.ok(Math.abs(bpm2 - bpm1 / 2) < 0.15);
  await page.locator("#doubleMusicTempo").click();
  assert.ok(
    Math.abs(
      Number((await tempoText()).match(/Corrected tempo ([0-9.]+)/)[1]) - bpm1,
    ) < 0.15,
  );
  await page.locator("#addMusicMarker").click();
  assert.match(
    await page.locator("#analysisDetails").textContent(),
    /1 manual markers/,
  );
  await page.locator("#clearMusicMarkers").click();
  assert.match(
    await page.locator("#analysisDetails").textContent(),
    /0 manual markers/,
  );
  await page.evaluate(() => {
    MusicLab.analyze();
    document.querySelector("#audioStop").click();
  });
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => MusicLab.getAnalysis()), null);
  assert.equal(await page.locator("#lookaheadEnabled").isChecked(), false);
  assert.equal(await page.locator("#audioFile").inputValue(), "");
  await page.setViewportSize({ width: 320, height: 740 });
  for (const id of ["experiencePanel", "nurseryPanel", "musicLabPanel"])
    assert.equal(
      await page
        .locator("#" + id)
        .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
      true,
      id + " horizontal overflow",
    );
  assert.deepEqual(uploads, []);
  assert.deepEqual(errors, []);
  console.log(
    "Labs browser PASS: real offspring/evolution/freeze, restored 360 catalogue, twins/generations/ancestry, IndexedDB opt-in/reload/erase/quota, JSON export/import, route consent/reload, real PCM worker/look-ahead, stop cancellation, 320px layout and no uploads.",
  );
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}
