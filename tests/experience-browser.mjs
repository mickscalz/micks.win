// Real browser controls, local WAV decoding / Web Audio analysis, and privacy checks.
import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const server = http.createServer((req, res) => {
  const file = path.resolve(
    root,
    "." + new URL(req.url, "http://local").pathname,
  );
  if (
    !file.startsWith(root + path.sep) ||
    !fs.existsSync(file) ||
    fs.statSync(file).isDirectory()
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
    }[path.extname(file)] || "application/octet-stream",
  );
  res.end(fs.readFileSync(file));
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
  const context = await browser.newContext({
      viewport: { width: 480, height: 700 },
      reducedMotion: "reduce",
    }),
    page = await context.newPage(),
    errors = [],
    uploads = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("request", (r) => {
    if (r.method() !== "GET") uploads.push(r.url());
  });
  await page.route("**/fonts.googleapis.com/**", (r) =>
    r.fulfill({ body: "" }),
  );
  await page.route("**/fonts.gstatic.com/**", (r) => r.fulfill({ body: "" }));
  await page.addInitScript(() => {
    let at = performance.now(),
      serial = 0,
      jobs = new Map();
    window.requestAnimationFrame = (f) => {
      jobs.set(++serial, f);
      return serial;
    };
    window.cancelAnimationFrame = (id) => jobs.delete(id);
    window.testFrames = (n) => {
      for (let i = 0; i < n; i++) {
        at += 16.6667;
        const work = [...jobs.values()];
        jobs.clear();
        work.forEach((f) => f(at));
      }
    };
    window.micRequests = 0;
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: async () => {
          window.micRequests++;
          throw new DOMException("Test denial", "NotAllowedError");
        },
      },
    });
  });
  const url = `http://127.0.0.1:${server.address().port}/index.html`;
  await page.goto(url);
  await page.waitForFunction(() => window.Cabinet && Cabinet.playing, null, {
    polling: 50,
  });
  await page.evaluate(() => {
    Cabinet.idleDelay = 60000;
    Cabinet.wakeUI();
  });
  assert.equal(
    await page.evaluate(() => Experience.settings.reducedMotion),
    true,
  );
  assert.equal(await page.evaluate(() => micRequests), 0);
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  await page.evaluate(() => {
    Cabinet.idleDelay = 60000;
    Cabinet.wakeUI();
  });
  await page.locator("#experienceToggle").click();
  assert.equal(await page.locator("#experiencePanel").isVisible(), true);
  assert.equal(await page.locator("#ctl").evaluate((e) => e.inert), true);
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "experienceClose",
  );
  await page.keyboard.press("Shift+Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "resetExperience",
  );
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "experienceClose",
  );
  for (const [key, value] of [
    ["novelty", 0.9],
    ["intensity", 0.2],
    ["motion", 0.4],
    ["detail", 0.5],
    ["brightness", 0.55],
    ["color", 0.3],
    ["density", 0.2],
    ["reactivity", 0.8],
  ]) {
    await page.locator(`[data-setting="${key}"]`).evaluate((el, v) => {
      el.value = v;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, String(value));
    assert.equal(
      await page.evaluate((k) => Experience.settings[k], key),
      value,
    );
  }
  assert.match(
    await page.locator("#stage").getAttribute("style"),
    /brightness\(0.55\)/,
  );
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  await page.locator('[data-setting="mode"]').selectOption("manual");
  await page.evaluate(() => {
    Cabinet.t = 60;
    testFrames(3);
  });
  assert.equal(await page.evaluate(() => Cabinet.index), 0);
  await page.locator('[data-feedback="like"]').click();
  await page.locator('[data-feedback="save"]').click();
  assert.equal(await page.locator("#savedWorlds button").count(), 1);
  assert.equal(await page.locator("#likedWorlds button").count(), 1);
  await page.locator('[data-feedback="skip"]').click();
  assert.equal(await page.evaluate(() => Cabinet.index), 1);
  await page.locator("#savedWorlds button").click();
  assert.equal(await page.evaluate(() => Cabinet.index), 0);
  await page.locator("#rememberExperience").check();
  assert.equal(await page.evaluate(() => localStorage.length), 2);
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("cabinet-experience-v1")),
  );
  assert.deepEqual(Object.keys(stored).sort(), ["likes", "saved", "settings"]);
  await page.reload();
  await page.waitForFunction(() => window.Cabinet && Cabinet.playing, null, {
    polling: 50,
  });
  assert.equal(await page.evaluate(() => Experience.settings.brightness), 0.55);
  assert.equal(await page.evaluate(() => Experience.settings.mode), "manual");
  await page.evaluate(() => {
    Cabinet.idleDelay = 60000;
    Cabinet.wakeUI();
  });
  await page.locator("#experienceToggle").click();
  await page.locator("#rememberExperience").uncheck();
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  await page.locator('[data-setting="colorSafe"]').check();
  await page.locator('[data-setting="calm"]').check();
  assert.ok(await page.evaluate(() => Experience.frame().intensity <= 0.3));
  assert.ok(await page.evaluate(() => Experience.frame().brightness <= 0.65));
  await page.locator('[data-setting="mode"]').selectOption("adaptive");
  await page.evaluate(() => {
    Cabinet.t = 37;
    testFrames(1);
  });
  assert.notEqual(await page.evaluate(() => Cabinet.index), 0);
  await page.locator('[data-setting="mode"]').selectOption("autonomous");
  await page.evaluate(() => {
    Experience.advance(15);
    testFrames(1);
  });
  assert.match(
    await page.locator("#experienceStatus").textContent(),
    /Autonomous/,
  );
  await page.locator('[data-setting="quality"]').selectOption("economy");
  const low = await page.evaluate(() => document.querySelector("#c2d").width);
  await page.locator('[data-setting="quality"]').selectOption("high");
  assert.ok(
    (await page.evaluate(() => document.querySelector("#c2d").width)) > low,
  );
  await page.locator("#microphoneStart").click();
  await page.waitForFunction(
    () =>
      document
        .querySelector("#audioStatus")
        .textContent.includes("permission denied"),
    null,
    { polling: 50 },
  );
  assert.equal(await page.evaluate(() => micRequests), 1);
  assert.equal(await page.evaluate(() => Experience.signal.source), "internal");
  // Decode actual stereo PCM, not a mocked AnalyserNode. No test file is retained.
  const rate = 24000,
    seconds = 4,
    frames = rate * seconds,
    wav = Buffer.alloc(44 + frames * 4);
  wav.write("RIFF");
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(2, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 4, 28);
  wav.writeUInt16LE(4, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(frames * 4, 40);
  for (let i = 0; i < frames; i++) {
    const v = Math.sin((i / rate) * Math.PI * 2 * 110) * 0.25;
    wav.writeInt16LE(Math.round(v * 32767), 44 + i * 4);
    wav.writeInt16LE(Math.round(v * 0.35 * 32767), 46 + i * 4);
  }
  await page.locator("#audioFile").setInputFiles({
    name: "private-signal.wav",
    mimeType: "audio/wav",
    buffer: wav,
  });
  await page.waitForFunction(
    () =>
      document.querySelector("#audioPlayer audio") &&
      !document.querySelector("#audioPlayer audio").paused,
    null,
    { polling: 50 },
  );
  await page.evaluate(
    () => (document.querySelector("#audioPlayer audio").loop = true),
  );
  await page.waitForFunction(
    () => {
      Experience.advance(0.05);
      return (
        Experience.signal.energy > 0.05 &&
        Experience.signal.stereoReliable &&
        document.querySelector("#audioPlayer audio").currentTime > 0.05
      );
    },
    null,
    { polling: 50, timeout: 15000 },
  );
  const measured = await page.evaluate(() => {
    for (let i = 0; i < 60; i++) Experience.advance(1 / 60);
    return { ...Experience.signal };
  });
  assert.equal(measured.source, "file");
  assert.ok(measured.bass > measured.treble);
  assert.equal(measured.stereoReliable, true);
  assert.ok(measured.balance < -0.2);
  assert.equal(measured.tempo, null);
  assert.match(
    await page.locator("#signalReadout").textContent(),
    /sections and mood not inferred/,
  );
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  await page.locator("#audioStop").click();
  assert.equal(await page.evaluate(() => Experience.signal.source), "internal");
  assert.equal(await page.locator("#audioPlayer audio").count(), 0);
  await page.locator("#resetExperience").click();
  assert.equal(await page.evaluate(() => Experience.settings.brightness), 1);
  assert.equal(await page.evaluate(() => Experience.settings.mode), "guided");
  assert.equal(await page.locator("#savedWorlds button").count(), 0);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#ctl").evaluate((e) => e.inert), false);
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    "experienceToggle",
  );
  // Every available control stays inside a narrow phone's scrollable dialog.
  await page.setViewportSize({ width: 320, height: 740 });
  await page.evaluate(() => {
    Cabinet.idleDelay = 60000;
    Cabinet.wakeUI();
  });
  await page.locator("#experienceToggle").click();
  assert.equal(
    await page
      .locator("#experiencePanel")
      .evaluate((e) => e.scrollWidth <= e.clientWidth),
    true,
  );
  for (const selector of ["#experienceDock", "#experiencePanel"]) {
    const b = await page.locator(selector).boundingBox();
    assert.ok(b.x >= 0 && b.x + b.width <= 321, selector + " overflows phone");
  }
  await page.locator("#experienceClose").click();
  await page.locator("#calmNow").click();
  assert.equal(await page.evaluate(() => Experience.settings.calm), true);
  assert.equal(uploads.length, 0, "audio/preferences must not be uploaded");
  assert.deepEqual(errors, []);
  console.log(
    "Experience browser PASS: 4 modes, 8 sliders, immediate calm/contrast, focus trap, consent/reload/reset, saved recall, quality presets, denied mic, actual stereo WAV analysis/stop, 320px layout; no uploads.",
  );
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}
