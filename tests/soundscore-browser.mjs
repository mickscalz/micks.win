// Real audible, world-scored ambience: determinism, visual correspondence,
// bounded node use, Hold/motion=0, and no hidden state or uploads.
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
    requests = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("request", (r) => {
    requests.push(r.url());
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
    window.testNodes = 0;
    window.testOscillators = [];
    window.AudioContext = new Proxy(Native, {
      construct(target, args) {
        const actual = Reflect.construct(target, args);
        window.testAudioContexts.push(actual);
        const create = actual.createOscillator.bind(actual);
        actual.createOscillator = () => {
          window.testNodes++;
          const node = create();
          window.testOscillators.push(node);
          return node;
        };
        return actual;
      },
    });
    let time = performance.now(),
      n = 0,
      jobs = new Map();
    window.requestAnimationFrame = (f) => (jobs.set(++n, f), n);
    window.cancelAnimationFrame = (id) => jobs.delete(id);
    window.testFrames = (k) => {
      for (let i = 0; i < k; i++) {
        time += 16.6667;
        const q = [...jobs.values()];
        jobs.clear();
        q.forEach((f) => f(time));
      }
    };
  });
  // Drive the real control handlers; gesture unlock itself is covered by the
  // worlds suite, so this suite focuses on the score, its graph and its limits.
  const setValue = async (selector, value, event) => {
    await page.evaluate(
      ({ selector, value, event }) => {
        const e = document.querySelector(selector);
        e.value = value;
        e.dispatchEvent(new Event(event, { bubbles: true }));
      },
      { selector, value, event },
    );
    await page.waitForTimeout(80);
  };
  const click = async (selector) => {
    await page.evaluate((sel) => {
      document.body.classList.remove("is-idle");
      document.querySelector(sel).click();
    }, selector);
    await page.waitForTimeout(60);
  };
  const wait = (f, arg = null) =>
    page.waitForFunction(f, arg, { polling: 50, timeout: 45000 });
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  await wait(() => window.Cabinet?.playing);
  await page.evaluate(() => {
    Cabinet.idleDelay = 600000;
    Experience.set("transitionDuration", 0);
    testFrames(2);
  });
  // Silence is the genuine default: no audio graph exists before a gesture.
  assert.equal(await page.evaluate(() => Soundscape.enabled), false);
  assert.equal(await page.evaluate(() => testAudioContexts.length), 0);
  assert.equal(await page.evaluate(() => Soundscape.sample().state), "off");
  await click("#ambientToggle");
  await wait(
    () => Soundscape.enabled && Soundscape.sample().state === "running",
  );
  await wait(() => Soundscape.sample().rms > 0.002);
  const nodes = await page.evaluate(() => testNodes);
  assert.ok(nodes > 8 && nodes < 40, "a bounded graph, actual oscillators");
  // Every world gets a distinct, documented visual-to-sound fingerprint.
  const show = (id) =>
    page.evaluate((id) => {
      const i = Cabinet.designs.findIndex((d) => d.id === id);
      Cabinet.show(i, { snapshot: false });
      testFrames(2);
      return Soundscape.debug().profile;
    }, id);
  const pearl = await show("inverted-pearl-sea");
  assert.equal(pearl.biome, "water");
  assert.equal(pearl.style, "hybrid");
  assert.equal(pearl.wet, true);
  const dunes = await show("saffron-leviathan-dunes");
  assert.equal(dunes.biome, "earth");
  assert.equal(dunes.style, "cinematic");
  const moth = await show("halo-moth-constellations");
  assert.equal(moth.biome, "organic");
  assert.equal(moth.style, "melodic");
  const obsidian = await show("obsidian-lace-nebula");
  assert.equal(obsidian.biome, "cosmic");
  const basilica = await show("mirror-rain-basilica");
  assert.equal(basilica.biome, "architecture");
  const fingerprints = new Set(
    [pearl, dunes, moth, obsidian, basilica].map((p) => p.fingerprint),
  );
  assert.equal(fingerprints.size, 5, "distinct musical identities");
  assert.ok(
    new Set([pearl.bpm, dunes.bpm, moth.bpm]).size > 1,
    "movement changes tempo, not only timbre",
  );
  assert.match(await page.locator("#ambientFingerprint").textContent(), /BPM/);
  // Deterministic scores: identical worlds and seeds replay identically.
  const replay = await page.evaluate(() =>
    JSON.parse(
      JSON.stringify([
        Soundscape.profile(
          Cabinet.designs.find((d) => d.id === "oceans-above-the-sky"),
        ),
        Soundscape.profile(
          Cabinet.designs.find((d) => d.id === "oceans-above-the-sky"),
        ),
        Soundscape.profile(
          Cabinet.designs.find((d) => d.id === "obsidian-lace-nebula"),
        ),
      ]),
    ),
  );
  assert.deepEqual(replay[0], replay[1]);
  assert.notDeepEqual(replay[0], replay[2]);
  // Travelling the gallery must not allocate per world or per note.
  await page.evaluate(() => {
    for (let i = 0; i < 40; i++) Cabinet.show(i % 16, { snapshot: false });
    testFrames(4);
  });
  assert.equal(await page.evaluate(() => testAudioContexts.length), 1);
  assert.equal(await page.evaluate(() => testNodes), nodes);
  // The score actually plays: note events advance and level varies over time.
  await page.evaluate(() => {
    Cabinet.idleDelay = 600000;
    Cabinet.show(
      Cabinet.designs.findIndex((d) => d.id === "inverted-pearl-sea"),
      { snapshot: false },
    );
  });
  const before = await page.evaluate(() => Soundscape.debug().notesPlayed);
  const levels = [];
  for (let i = 0; i < 14; i++) {
    await page.evaluate(() => testFrames(20));
    await page.waitForTimeout(150);
    levels.push(await page.evaluate(() => Soundscape.sample().rms));
  }
  const after = await page.evaluate(() => Soundscape.debug().notesPlayed);
  assert.ok(after > before, "real melodic events over time");
  assert.ok(
    Math.max(...levels) - Math.min(...levels) > 0.0008,
    "living, not a static drone",
  );
  assert.ok(Math.max(...levels) < 0.3, "bounded output");
  // Hold stops new notes but keeps quiet atmosphere; resume continues.
  await page.keyboard.press(" ");
  await wait(() => Soundscape.debug().held === true);
  const heldAt = await page.evaluate(() => Soundscape.debug().notesPlayed);
  await page.evaluate(() => testFrames(60));
  await page.waitForTimeout(600);
  assert.equal(
    await page.evaluate(() => Soundscape.debug().notesPlayed),
    heldAt,
  );
  assert.ok(await page.evaluate(() => Soundscape.sample().rms > 0.0004));
  assert.match(
    await page.locator("#ambientStatus").textContent(),
    /Atmosphere on/,
  );
  await page.keyboard.press(" ");
  await wait(() => Soundscape.debug().held === false);
  await page.evaluate(() => testFrames(60));
  await page.waitForTimeout(300);
  assert.ok(
    (await page.evaluate(() => Soundscape.debug().notesPlayed)) > heldAt,
  );
  // Effective motion=0 is honoured without changing saved preferences.
  await page.evaluate(() => {
    Experience.set("motion", 0);
    testFrames(6);
  });
  await wait(() => Soundscape.debug().held === true);
  await page.evaluate(() => {
    Experience.set("motion", 1);
    testFrames(6);
  });
  await wait(() => Soundscape.debug().held === false);
  // Explicit musical direction and phrase restart remain user-controlled.
  await click("#experienceToggle");
  await setValue("#ambientStyle", "cinematic", "change");
  await wait(() => Soundscape.debug().profile.style === "cinematic");
  assert.match(
    await page.locator("#ambientFingerprint").textContent(),
    /cinematic/,
  );
  await click("#ambientReplay");
  assert.equal(await page.evaluate(() => Soundscape.debug().beat), 0);
  await setValue("#ambientStyle", "auto", "change");
  await wait(() =>
    ["hybrid", "melodic", "cinematic"].includes(
      Soundscape.debug().profile.style,
    ),
  );
  // Volume is a real control, including true silence.
  await setValue("#ambientVolume", "0", "input");
  await wait(() => Soundscape.sample().rms < 0.0001);
  await setValue("#ambientVolume", "0.35", "input");
  await page.evaluate(() => testFrames(20));
  await wait(() => Soundscape.sample().rms > 0.002);
  // 320 px: new controls fit and remain reachable.
  await page.setViewportSize({ width: 320, height: 720 });
  for (const id of ["ambientStyle", "ambientReplay", "ambientFingerprint"]) {
    const box = await page.locator("#" + id).boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= 321, id + " fits");
  }
  await click("#experienceToggle");
  await click("#ambientToggle");
  assert.equal(await page.evaluate(() => Soundscape.sample().state), "off");
  await wait(() => testAudioContexts.every((c) => c.state === "closed"));
  assert.deepEqual(uploads, []);
  assert.ok(!requests.some((u) => /\.(mp3|wav|ogg|flac)$/i.test(u)));
  assert.deepEqual(errors, []);
  console.log(
    "\nSound score browser PASS: opt-in silence, bounded graph, distinct deterministic visual→sound fingerprints, real note events, Hold/motion=0, explicit direction, 320 px.",
  );
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}
