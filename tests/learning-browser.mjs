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
  const page = await browser.newPage({ viewport: { width: 850, height: 800 } }),
    errors = [],
    requests = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("request", (r) =>
    requests.push({ url: r.url(), method: r.method() }),
  );
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
  const wait = (fn) =>
    page.waitForFunction(fn, null, { polling: 50, timeout: 45000 });
  const goto = async () => {
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await wait(() => window.Cabinet?.playing);
    await page.evaluate(() => {
      Cabinet.idleDelay = 60000;
      Experience.set("transitionDuration", 0);
      testFrames(2);
    });
    await page.locator("#nurseryToggle").click();
  };
  await goto();
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  assert.equal(
    requests.some((r) => r.url.includes("/vendor/")),
    false,
  );
  assert.deepEqual(await page.evaluate(() => NurseryUI.getTaste()), {
    count: 0,
    ready: false,
    remember: false,
  });
  for (let i = 0; i < 3; i++) {
    await page.locator("[data-nursery-action=breed]").click();
    await wait(
      () => !document.querySelector("[data-nursery-action=breed]").disabled,
    );
    await page
      .locator("#nurseryCandidates [data-nursery-action=compare]")
      .first()
      .click();
    await page
      .locator("#nurseryCandidates [data-nursery-action=prefer]")
      .nth(1)
      .click();
    await wait(
      () => !document.querySelector("[data-nursery-action=breed]").disabled,
    );
    assert.equal(await page.evaluate(() => NurseryUI.getTaste().count), i + 1);
    await page
      .locator("#nurseryCandidates [data-nursery-action=prefer]")
      .nth(1)
      .click();
    await wait(
      () => !document.querySelector("[data-nursery-action=breed]").disabled,
    );
    assert.equal(await page.evaluate(() => NurseryUI.getTaste().count), i + 1);
  }
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  await page
    .locator("summary")
    .filter({ hasText: "Learn my visual preferences" })
    .click();
  await page.locator("#nurseryLearned").check();
  await page.locator("#nurseryRememberTaste").check();
  await wait(() => NurseryUI.getTaste().remember);
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("cabinet-pairwise-taste-v1")),
  );
  assert.equal(stored.pairs.length, 3);
  assert.equal("src" in stored.pairs[0], false);
  await page
    .locator("summary")
    .filter({ hasText: "Bounded automatic nursery" })
    .click();
  await page.locator("#nurseryGenerations").fill("1");
  await page.locator("#nurseryBudget").fill("4");
  await page.locator("#nurseryArchive").fill("2");
  await page.locator("#nurserySeconds").fill("60");
  await page.locator("[data-nursery-action=evolve]").click();
  await wait(
    () => !document.querySelector("[data-nursery-action=evolve]").disabled,
  );
  assert.match(
    await page.locator("#nurseryStatus").textContent(),
    /locally learned/,
  );
  assert.ok(
    (
      await page
        .locator("#nurseryCandidates .preference-score")
        .first()
        .textContent()
    ).includes("Personal rank"),
  );
  await goto();
  assert.equal(await page.locator("#nurseryRememberTaste").isChecked(), false);
  assert.equal(await page.evaluate(() => NurseryUI.getTaste().count), 0);
  await page
    .locator("summary")
    .filter({ hasText: "Learn my visual preferences" })
    .click();
  await page.locator("#nurseryRememberTaste").check();
  await wait(() => NurseryUI.getTaste().count === 3);
  await page.locator("[data-nursery-action=resetTaste]").click();
  await wait(() => NurseryUI.getTaste().count === 0);
  assert.equal(
    await page.evaluate(() =>
      localStorage.getItem("cabinet-pairwise-taste-v1"),
    ),
    null,
  );
  // A real worker is terminated on its first progress message. It cannot deliver
  // decoded output afterward, and no native fallback is involved.
  const cancellation = await page.evaluate(async () => {
    const data = await fetch("tests/fixtures/local-tone.mp3").then((r) =>
      r.arrayBuffer(),
    );
    let terminations = 0,
      progress = 0,
      job;
    class Tracked extends Worker {
      terminate() {
        terminations++;
        super.terminate();
      }
    }
    job = AudioDecode.startWorker(data, {
      WorkerClass: Tracked,
      progress: () => {
        progress++;
        job.cancel();
      },
    });
    let error;
    try {
      await job.promise;
    } catch (e) {
      error = e.message;
    }
    await new Promise((r) => setTimeout(r, 50));
    return { terminations, progress, error };
  });
  assert.equal(cancellation.terminations, 1);
  assert.equal(cancellation.progress, 1);
  assert.match(cancellation.error, /terminated/);
  // Unsupported codec must not silently invoke the unabortable native decoder.
  const noFallback = await page.evaluate(async () => {
    const original = window.OfflineAudioContext;
    let calls = 0;
    window.OfflineAudioContext = class {
      constructor() {
        calls++;
      }
    };
    MusicLab.setFile(new File([new Uint8Array(64)], "unknown.m4a"), {
      duration: 2,
    });
    await MusicLab.analyze();
    window.OfflineAudioContext = original;
    return {
      calls,
      status: document.querySelector("#analysisStatus").textContent,
    };
  });
  assert.equal(noFallback.calls, 0);
  assert.match(noFallback.status, /consent/);
  assert.equal(
    requests.some((r) => r.url.includes("/vendor/basic-pitch/")),
    false,
    "no model download before opt-in",
  );
  await page.locator("#musicLabPanel").evaluate((e) => (e.open = true));
  await page
    .locator("summary")
    .filter({ hasText: "Optional learned note model" })
    .click();
  await page.locator("#musicModelEnabled").check();
  await page
    .locator("#audioFile")
    .setInputFiles(path.join(root, "tests/fixtures/local-tone.mp3"));
  await wait(() => document.querySelector("audio")?.readyState >= 1);
  await page.locator("#analyzeTrack").click();
  await wait(() => MusicLab.getNoteAnalysis() !== null);
  const notes = await page.evaluate(() => MusicLab.getNoteAnalysis());
  assert.equal(notes.model, "Spotify Basic Pitch 1.0.1");
  assert.ok(notes.duration > 2 && notes.duration < 3);
  assert.equal(notes.rows[1].notes[0].midi, 69);
  assert.ok(notes.rows.every((r) => r.activity >= 0 && r.activity <= 1));
  const routeSafety = await page.evaluate(() => {
    const prior = MusicLab.serialize(),
      clock = { currentTime: 0.5, paused: false };
    MusicLab.setFile(new File([new Uint8Array(1)], "route-clock-only"), clock);
    MusicLab.restore({
      global: Array.from({ length: 4 }, () => ({
        source: "notes",
        target: "growth",
        amount: 0.6,
        enabled: true,
      })),
    });
    const cb = document.querySelector("#lookaheadEnabled");
    cb.checked = true;
    cb.dispatchEvent(new Event("change"));
    const active = MusicLab.apply({ growth: 0.5 }, {}, 1, {}).growth,
      calm = MusicLab.apply({ growth: 0.5 }, {}, 1, { calm: true }).growth,
      zero = MusicLab.apply({ growth: 0.5 }, {}, 0, {}).growth;
    clock.currentTime = 10;
    const outside = MusicLab.apply({ growth: 0.5 }, {}, 1, {}).growth;
    clock.currentTime = 0.5;
    clock.paused = true;
    const paused = MusicLab.apply({ growth: 0.5 }, {}, 1, {}).growth;
    MusicLab.restore(prior);
    return { active, calm, zero, outside, paused };
  });
  assert.ok(
    routeSafety.active !== 0.5 &&
      Math.abs(routeSafety.active - 0.5) <= 0.1750001,
  );
  assert.ok(Math.abs(routeSafety.calm - 0.5) <= 0.0525001);
  assert.equal(routeSafety.zero, 0.5);
  assert.equal(routeSafety.outside, 0.5);
  assert.equal(routeSafety.paused, 0.5);
  await page.locator("#audioStop").click();
  assert.equal(await page.evaluate(() => MusicLab.getNoteAnalysis()), null);
  // The actual neural graph also sees silence as lower note activity than the tone.
  const silence = await page.evaluate(
    async () => MusicModel.start(new Float32Array(22050)).promise,
  );
  assert.ok(
    Math.max(...silence.rows.map((r) => r.activity)) < notes.rows[1].activity,
  );
  const modelCancel = await page.evaluate(async () => {
    let count = 0,
      job;
    class Tracked extends Worker {
      terminate() {
        count++;
        super.terminate();
      }
    }
    job = MusicModel.start(new Float32Array(22050), {
      WorkerClass: Tracked,
      progress: () => job.cancel(),
    });
    let error;
    try {
      await job.promise;
    } catch (e) {
      error = e.message;
    }
    return { count, error };
  });
  assert.equal(modelCancel.count, 1);
  assert.match(modelCancel.error, /terminated/);
  await page.setViewportSize({ width: 320, height: 740 });
  assert.equal(
    await page
      .locator("#nurseryPanel")
      .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
    true,
  );
  assert.equal(
    requests.some((r) => ["POST", "PUT"].includes(r.method)),
    false,
  );
  assert.deepEqual(errors, []);
  console.log(
    "Learning browser PASS: explicit comparison training/ranking, unique evidence, opt-in persistence/reload/erase, actual decoder/model worker termination, real Basic Pitch graph + correct tone pitch/silence discrimination, opt-in lazy model loading, no silent native fallback, 320px layout and no uploads.",
  );
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}
