// Actual first-seconds motion for v1/v2/v3 newborns, not static thumbnail claims.
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
  await page.locator("#nurseryToggle").click();
  await page.locator("[data-nursery-action=breed]").click();
  await wait(
    () =>
      NurseryUI.getBirthState() &&
      document.querySelectorAll("#nurseryCandidates img").length === 2 &&
      !document.querySelector("[data-nursery-action=breed]").disabled,
  );
  const mini = await page.evaluate(() => {
    const source = document.querySelector(".nursery-live canvas"),
      cv = document.createElement("canvas");
    cv.width = 120;
    cv.height = 75;
    const c = cv.getContext("2d");
    const pixels = () => {
      c.drawImage(source, 0, 0, 120, 75);
      return c.getImageData(0, 0, 120, 75).data;
    };
    testFrames(2);
    const a = pixels(),
      start = NurseryUI.getBirthState().clock;
    testFrames(120);
    const b = pixels(),
      end = NurseryUI.getBirthState().clock;
    return {
      start,
      end,
      diff:
        a.reduce((s, x, i) => s + (i % 4 === 3 ? 0 : Math.abs(x - b[i])), 0) /
        (120 * 75 * 3),
    };
  });
  assert.ok(mini.end > mini.start + 0.5);
  assert.ok(mini.diff > 0.4, JSON.stringify(mini));
  // A held stage must not silently hold an explicitly requested full audition.
  await page.evaluate(() => {
    Cabinet.paused = true;
    testFrames(2);
  });
  const heldMini = await page.evaluate(() => {
    const at = NurseryUI.getBirthState().clock;
    window.previousBirthCanvas = document.querySelector(".nursery-live canvas");
    testFrames(60);
    return at === NurseryUI.getBirthState().clock;
  });
  assert.ok(heldMini);
  // Replacing a held newborn reuses the context and still paints its first frame.
  await page.locator("[data-nursery-action=breed]").click();
  await wait(
    () =>
      NurseryUI.getBirthState() &&
      !document.querySelector("[data-nursery-action=breed]").disabled,
  );
  const replaced = await page.evaluate(() => {
    const cv = document.createElement("canvas");
    cv.width = 120;
    cv.height = 75;
    const c = cv.getContext("2d"),
      source = document.querySelector(".nursery-live canvas");
    c.drawImage(source, 0, 0, 120, 75);
    const pixels = c
      .getImageData(0, 0, 120, 75)
      .data.filter((_, i) => i % 4 !== 3);
    return {
      same: source === previousBirthCanvas,
      clock: NurseryUI.getBirthState().clock,
      span: Math.max(...pixels) - Math.min(...pixels),
      count: document.querySelectorAll(".nursery-live canvas").length,
    };
  });
  assert.ok(replaced.same);
  assert.equal(replaced.clock, 0);
  assert.ok(replaced.span > 5);
  assert.equal(replaced.count, 1);
  const stopped = await page.evaluate(() => {
    Cabinet.paused = false;
    const at = NurseryUI.getBirthState().clock,
      panel = document.getElementById("nurseryPanel");
    panel.open = false;
    testFrames(18);
    const closed = NurseryUI.getBirthState().clock === at;
    panel.open = true;
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    testFrames(18);
    const hidden = NurseryUI.getBirthState().clock === at;
    delete document.hidden;
    Cabinet.paused = true;
    return { closed, hidden };
  });
  assert.deepEqual(stopped, { closed: true, hidden: true });
  await page.locator("[data-nursery-action=audition]").first().click();
  assert.equal(await page.evaluate(() => Cabinet.paused), false);
  assert.equal(
    await page.locator("#ctl [data-act=play]").getAttribute("aria-pressed"),
    "false",
  );
  const live = await page.evaluate(() => {
    const d = Cabinet.designs[Cabinet.index],
      start = d.clock;
    testFrames(90);
    return { start, end: d.clock, nursery: d.nursery };
  });
  assert.ok(live.nursery && live.end > live.start + 0.5);
  await page.keyboard.press(" ");
  const held = await page.evaluate(() => {
    const m = Cabinet.designs[Cabinet.index],
      at = m.clock;
    Cabinet.needsDraw = true;
    testFrames(20);
    return at === m.clock;
  });
  assert.ok(held);
  // motion=0 is an intentional safety setting, not something a birth overrides.
  await page.evaluate(() => {
    Cabinet.leaveChild();
    Experience.set("motion", 0);
    Cabinet.playChild(
      Nursery.renderer(
        Nursery.breed(
          [
            Nursery.worldFounder(
              Cabinet.designs.find((d) => d.id === "oceans-above-the-sky"),
            ),
            Nursery.worldFounder(
              Cabinet.designs.find((d) => d.id === "sapphire-tidal-aurora"),
            ),
          ],
          { seed: 81 },
        ),
      ),
    );
    testFrames(30);
  });
  assert.equal(
    await page.evaluate(() => Cabinet.designs[Cabinet.index].clock),
    0,
  );
  await page.evaluate(() => {
    Cabinet.leaveChild();
    Experience.set("motion", 1);
  });
  const motion = await page.evaluate(() => {
    const cv = document.createElement("canvas");
    cv.width = 200;
    cv.height = 125;
    const R = GLR.create(cv),
      gl = R.gl;
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 125;
    const c = canvas.getContext("2d");
    const drawing = document.createElement("canvas");
    drawing.width = 200;
    drawing.height = 125;
    const draw = drawing.getContext("2d");
    const sample = (source) => {
      c.clearRect(0, 0, 200, 125);
      c.drawImage(source, 0, 0, 200, 125);
      return c.getImageData(0, 0, 200, 125).data;
    };
    const delta = (a, b) =>
      a.reduce((s, x, i) => s + (i % 4 === 3 ? 0 : Math.abs(x - b[i])), 0) /
      (200 * 125 * 3);
    const legacy = Cabinet.designs
      .filter(
        (d) =>
          d.edition === 8 &&
          d.kind === "2d" &&
          d.lifeMechanism.startsWith("Nutrient"),
      )
      .slice(0, 2)
      .map(Nursery.founder);
    const records = [
      Nursery.breed(legacy, { seed: 91 }),
      Nursery.breed(
        legacy.map((p, i) =>
          Nursery.founderAny(
            Cabinet.designs.find((d) => "founder:" + d.id === p.id),
          ),
        ),
        { seed: 92 },
      ),
    ];
    const gpu = Cabinet.designs.filter(
      (d) => d.kind === "gl" && Number.isInteger(d.worldKernel),
    );
    for (const d of gpu) {
      const a = Nursery.worldFounder(d),
        b = Nursery.worldFounder(gpu.find((x) => x.id !== d.id));
      records.push(
        Nursery.breed([a, b], { seed: 101 + d.worldKernel, weights: [1, 0] }),
      );
    }
    const structural = (a, b) => {
      let changed = 0,
        mean = 0;
      for (let y = 0; y < 25; y++)
        for (let x = 0; x < 40; x++) {
          let d = 0;
          for (let ch = 0; ch < 3; ch++) {
            let before = 0,
              after = 0;
            for (let yy = 0; yy < 5; yy++)
              for (let xx = 0; xx < 5; xx++) {
                const at = ((y * 5 + yy) * 200 + x * 5 + xx) * 4 + ch;
                before += a[at];
                after += b[at];
              }
            d += Math.abs(before - after) / 25;
          }
          mean += d / 3;
          if (d > 9) changed++;
        }
      return { mean: mean / 1000, changed };
    };
    const result = [];
    for (const recipe of records) {
      const m = Nursery.renderer(recipe),
        isGPU = m.kind === "glx";
      if (isGPU) m.init(R);
      else m.init();
      const S = {
        dt: 0,
        fade: 1,
        w: 200,
        h: 125,
        ctx: draw,
        experience: { motion: 1 },
        mouse: { x: 0, y: 0 },
      };
      if (isGPU) {
        m.frame(R, S);
        gl.finish();
      } else m.frame(S);
      const a = sample(isGPU ? cv : drawing);
      for (let i = 0; i < 120; i++)
        m.advance({ dt: 1 / 60, experience: S.experience });
      if (isGPU) {
        m.frame(R, S);
        gl.finish();
      } else m.frame(S);
      const b = sample(isGPU ? cv : drawing),
        at = m.clock;
      if (isGPU) {
        m.frame(R, S);
        gl.finish();
      } else m.frame(S);
      const frozen = sample(isGPU ? cv : drawing);
      result.push({
        solver: recipe.solver,
        form: recipe.genome.landform || recipe.genome.shape,
        motion: delta(a, b),
        structural: structural(a, b),
        held: delta(b, frozen),
        clock: m.clock === at,
      });
      if (result.length <= 3) {
        if (m.dispose) m.dispose(R);
        const replay = Nursery.renderer(
          Nursery.validate(JSON.parse(JSON.stringify(recipe))),
        );
        if (isGPU) {
          replay.init(R);
          replay.frame(R, S);
          gl.finish();
        } else {
          replay.init();
          replay.frame(S);
        }
        if (delta(a, sample(isGPU ? cv : drawing)) !== 0)
          throw Error("Seed replay changed birth pixels: " + recipe.solver);
        if (replay.dispose) replay.dispose(R);
      } else if (m.dispose) m.dispose(R);
    }
    return { result, error: gl.getError() };
  });
  assert.equal(motion.error, 0);

  for (const s of motion.result) {
    assert.ok(
      s.structural.mean > 0.6 && s.structural.changed >= 20 && s.motion > 1,
      "newborn appears still " + JSON.stringify(s),
    );
    assert.equal(s.held, 0, JSON.stringify(s));
    assert.ok(s.clock);
  }
  assert.equal(motion.result.length, 38);
  await page.evaluate(() => Cabinet.wakeUI());
  await page.locator("#nurseryToggle").click();
  await page.locator("[data-nursery-action=clear]").click();
  await wait(() => NurseryUI.getBirthState() === null);
  assert.equal(await page.locator(".nursery-live canvas").count(), 0);
  assert.equal(await page.locator("#nurseryCandidates img").count(), 0);
  assert.deepEqual(errors, []);
  assert.deepEqual(glErrors, []);
  assert.deepEqual(uploads, []);
  console.log(
    "Birth + shores browser PASS: real live firstborn viewport, explicit audition resumes Hold, later Hold and motion=0 remain effective; first-two-second motion and exact held redraw for v1/v2 plus all 36 world-v3 kernels. No uploads.",
  );
} finally {
  if (browser) await browser.close();
  await new Promise((r) => server.close(r));
}
