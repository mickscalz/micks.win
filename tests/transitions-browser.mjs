// Real WebGL2 transition endpoints, orientation, variation, freeze, fallback,
// interruption, safety overrides and integration. No visual contexts mocked.
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
    ],
  });
  const p = await browser.newPage({ viewport: { width: 420, height: 300 } }),
    errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => {
    if (m.type() === "error" && /\[gl\]|\[cabinet\]/.test(m.text()))
      errors.push(m.text());
  });
  await p.route("**/fonts.googleapis.com/**", (r) => r.fulfill({ body: "" }));
  await p.route("**/fonts.gstatic.com/**", (r) => r.fulfill({ body: "" }));
  await p.addInitScript(() => {
    let time = performance.now(),
      serial = 0,
      jobs = new Map();
    window.requestAnimationFrame = (f) => {
      jobs.set(++serial, f);
      return serial;
    };
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
  await p.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  await p.waitForFunction(() => window.Cabinet && Cabinet.playing, null, {
    polling: 50,
  });
  await p.evaluate(() => {
    Cabinet.idleDelay = 60000;
    Cabinet.wakeUI();
    Experience.set("mode", "manual");
    const make = () => {
        const c = document.createElement("canvas");
        c.width = 240;
        c.height = 150;
        return c;
      },
      a = make(),
      b = make(),
      out = make(),
      fallback = make(),
      read = make();
    const ca = a.getContext("2d"),
      cb = b.getContext("2d");
    ca.fillStyle = "rgb(220,20,40)";
    ca.fillRect(0, 0, 240, 75);
    ca.fillStyle = "rgb(20,40,210)";
    ca.fillRect(0, 75, 240, 75);
    cb.fillStyle = "rgb(20,200,70)";
    cb.fillRect(0, 0, 120, 150);
    cb.fillStyle = "rgb(240,170,30)";
    cb.fillRect(120, 0, 120, 150);
    fallback.getContext("2d").drawImage(a, 0, 0);
    window.trTest = {
      a,
      b,
      out,
      fallback,
      read,
      T: CabinetTransitions.create(out, fallback),
    };
    window.trPixels = () => {
      const x = trTest.read.getContext("2d");
      x.drawImage(trTest.out, 0, 0, 240, 150);
      return Array.from(x.getImageData(0, 0, 240, 150).data);
    };
  });
  const styles = await p.evaluate(() =>
    CabinetTransitions.styles.map((s) => s.id),
  );
  assert.equal(styles.length, 24);
  assert.equal(new Set(styles).size, 24);
  const hashes = [];
  for (const style of styles) {
    const result = await p.evaluate((style) => {
      const { T, a, b, out } = trTest,
        config = {
          ...Experience.getSettings(),
          worldDuration: 30,
          transitionDuration: 2,
          transitionStyle: style,
          transitionEase: "linear",
          transitionWarp: 0.7,
          reducedMotion: false,
          calm: false,
        };
      T.begin(a, config);
      const start = trPixels().slice(0, 4);
      T.render(b, 1, config);
      const mid = trPixels();
      let hash = 2166136261;
      for (let i = 0; i < mid.length; i += 13)
        hash = Math.imul(hash ^ mid[i], 16777619);
      const state = T.getState();
      T.render(b, 0, config);
      const held = trPixels().every((v, i) => v === mid[i]);
      const captured = document.createElement("canvas");
      captured.width = 240;
      captured.height = 150;
      T.capture(captured.getContext("2d"));
      const capture = captured
        .getContext("2d")
        .getImageData(0, 0, 240, 150).data;
      let delta = 0;
      for (let i = 0; i < capture.length; i++)
        delta += Math.abs(capture[i] - mid[i]);
      T.render(b, 0.98, config);
      const nearEnd = trPixels(),
        expected = trTest.b.getContext("2d").getImageData(0, 0, 240, 150).data;
      let endDelta = 0;
      for (let i = 0; i < expected.length; i++)
        endDelta += Math.abs(expected[i] - nearEnd[i]);
      T.render(b, 0.03, config);
      return {
        start,
        hash,
        state,
        held,
        captureDelta: delta / capture.length,
        endDelta: endDelta / expected.length,
        done: T.getState(),
        opacity: out.style.opacity,
        glError: out.getContext("webgl2").getError(),
      };
    }, style);
    assert.ok(
      Math.abs(result.start[0] - 220) <= 2 &&
        Math.abs(result.start[1] - 20) <= 2 &&
        Math.abs(result.start[2] - 40) <= 2,
      style + " inverted or changed outgoing endpoint",
    );
    assert.equal(result.state.renderer, "webgl2");
    assert.ok(Math.abs(result.state.progress - 0.5) < 0.001);
    assert.equal(result.held, true, style + " changed on held redraw");
    assert.ok(result.captureDelta < 1, style + " bad interruption capture");
    assert.ok(result.endDelta < 2, style + " incoming endpoint not reached");
    assert.equal(result.done.active, false);
    assert.equal(result.opacity, "0");
    assert.equal(result.glError, 0);
    hashes.push(result.hash);
    console.log("✓ passage " + style);
  }
  assert.equal(
    new Set(hashes).size,
    24,
    "the 24 styles must produce distinct midpoint images",
  );
  const safety = await p.evaluate(() => {
    const { T, a, b, out } = trTest,
      config = {
        ...Experience.getSettings(),
        worldDuration: 5,
        transitionDuration: 30,
        transitionStyle: "vortex",
        reducedMotion: true,
        calm: false,
      };
    T.begin(a, config);
    const safe = T.getState();
    T.render(b, 0.5, config);
    const g = out.getContext("webgl2");
    g.getExtension("WEBGL_lose_context").loseContext();
    return safe;
  });
  assert.equal(safety.style, "dissolve");
  assert.equal(safety.duration, 4);
  await p.waitForTimeout(80);
  const fallback = await p.evaluate(() => {
    const { T, a, b } = trTest,
      cfg = {
        ...Experience.getSettings(),
        worldDuration: 10,
        transitionDuration: 2,
      };
    T.begin(a, cfg);
    T.render(b, 0.5, cfg);
    return { ...T.getState(), opacity: Number(trTest.fallback.style.opacity) };
  });
  assert.equal(fallback.renderer, "dissolve-fallback");
  assert.ok(fallback.opacity > 0 && fallback.opacity < 1);
  await p.evaluate(() => {
    Experience.set("transitionDuration", 2);
    Experience.set("transitionStyle", "petals");
    Experience.set("worldDuration", 12);
    Cabinet.show(1);
    testFrames(2);
  });
  assert.equal(await p.evaluate(() => Cabinet.dwell), 12);
  assert.equal(
    await p.evaluate(() => Cabinet.transitions.getState().style),
    "petals",
  );
  await p.keyboard.press(" ");
  const before = await p.evaluate(() => Cabinet.transitions.getState().elapsed);
  await p.evaluate(() => {
    Cabinet.needsDraw = true;
    testFrames(3);
  });
  assert.equal(
    await p.evaluate(() => Cabinet.transitions.getState().elapsed),
    before,
  );
  await p.evaluate(() => Cabinet.show(2));
  assert.equal(
    await p.evaluate(() => Cabinet.transitions.getState().active),
    false,
    "paused navigation must not leave the old snapshot covering the target",
  );
  await p.keyboard.press(" ");
  assert.equal(
    await p
      .locator("#gl")
      .evaluate((el) => getComputedStyle(el).transitionDuration),
    "0s",
  );
  await p.locator("#experienceToggle").click();
  assert.equal(
    await p.locator('[data-setting="transitionStyle"] option').count(),
    25,
  );
  for (const [key, value] of [
    ["worldDuration", 55],
    ["transitionDuration", 7],
    ["transitionWarp", 0.3],
    ["growth", 0.8],
    ["mutation", 0.7],
    ["coupling", 0.4],
    ["lifecycle", 0.6],
    ["atmosphere", 0.2],
    ["symmetry", 0.9],
    ["drift", 0.1],
    ["afterglow", 0.8],
    ["audioAttack", 0.2],
    ["audioRelease", 2.5],
    ["audioSensitivity", 0.8],
  ]) {
    await p.locator(`[data-setting="${key}"]`).evaluate((el, v) => {
      el.value = v;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, String(value));
    assert.equal(await p.evaluate((k) => Experience.settings[k], key), value);
  }
  await p.locator('[data-setting="transitionEase"]').selectOption("sine");
  assert.equal(
    await p.evaluate(() => Experience.settings.transitionEase),
    "sine",
  );
  const old = await p.evaluate(() => Cabinet.index);
  await p.locator("#previewTransition").click();
  assert.equal(await p.evaluate(() => Cabinet.index), old + 1);
  await p.evaluate(() => {
    Cabinet.show(1);
    testFrames(30);
  });
  assert.match(
    await p.locator("#organismReadout").textContent(),
    /Population \d+ · births \d+ · renewals \d+ · generation \d+/,
  );
  await p.setViewportSize({ width: 320, height: 740 });
  assert.equal(
    await p
      .locator("#experiencePanel")
      .evaluate((e) => e.scrollWidth <= e.clientWidth),
    true,
  );
  await p.locator("#experienceClose").click();
  assert.equal(
    await p.evaluate(() => document.activeElement.id),
    "experienceToggle",
  );
  assert.deepEqual(errors, []);
  console.log(
    "24 transitions PASS: unique renders, orientation/endpoints, freeze, interruption, reduced-motion clamp, context-loss fallback, timing controls, 14 new sliders and 320px dialog.",
  );
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}
