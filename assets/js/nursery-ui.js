/* Session nursery with explicitly loaded/remembered IndexedDB recipes. */
(function (w, d) {
  "use strict";
  const N = w.Nursery,
    library = new Map(),
    founders = new Map(),
    worlds = new Map();
  let candidates = [],
    remember = false,
    db = null,
    busy = false,
    queue = Promise.resolve(),
    selected = null;
  let previewR = null,
    stopped = false;
  const transient = new Map(),
    observations = new Map(),
    tasteKey = "cabinet-pairwise-taste-v1";
  let ranker = w.PreferenceModel.create(),
    comparison = null,
    rememberTaste = false;
  function tasteStatus() {
    $("nurseryLearningStatus").textContent =
      ranker.count +
      " unique pair comparisons · " +
      (ranker.ready ? "personal ranker trained" : "3 required before ranking") +
      " · " +
      (rememberTaste ? "remembered on this device" : "session only") +
      ". Learned feature weights: " +
      ranker
        .explain()
        .map((x) => x.feature + " " + x.weight.toFixed(2))
        .join(", ");
    $("nurseryComparison").textContent = comparison
      ? "Reference: " +
        comparison.name +
        ". Choose another candidate you prefer."
      : "Choose a comparison reference, then prefer another candidate. No implicit ratings.";
    $("nurseryCandidates")
      .querySelectorAll(".preference-score")
      .forEach((el, i) => {
        const obs = observations.get(candidates[i]?.id);
        el.textContent =
          ranker.ready && obs
            ? "Personal rank " +
              ranker.predict(obs.features).toFixed(2) +
              " (relative utility, not probability of beauty)"
            : "";
      });
  }
  function persistTaste() {
    if (!rememberTaste) return;
    try {
      localStorage.setItem(
        tasteKey,
        JSON.stringify({ version: 1, pairs: ranker.snapshot() }),
      );
    } catch (e) {
      rememberTaste = false;
      $("nurseryRememberTaste").checked = false;
      throw Error("Taste storage unavailable; trained session model retained");
    }
  }
  function resetTaste() {
    stopped = true;
    ranker.clear();
    comparison = null;
    rememberTaste = false;
    let erased = true;
    try {
      localStorage.removeItem(tasteKey);
    } catch (_) {
      erased = false;
    }
    $("nurseryRememberTaste").checked = false;
    $("nurseryLearned").checked = false;
    tasteStatus();
    if (!erased)
      status(
        "Session preferences erased; device erasure could not be confirmed because browser storage is blocked.",
      );
    return erased;
  }

  const $ = (id) => d.getElementById(id),
    status = (s) => ($("nurseryStatus").textContent = s);
  function option(value, text) {
    const o = d.createElement("option");
    o.value = value;
    o.textContent = text;
    return o;
  }
  function all() {
    return [
      ...($("nurseryScope").value === "world" ? worlds : founders).values(),
      ...library.values(),
    ];
  }
  function recipe(id) {
    return (
      library.get(id) || founders.get(id) || worlds.get(id) || transient.get(id)
    );
  }
  function run(job) {
    queue = queue.then(async () => {
      busy = true;
      controls();
      try {
        await job();
      } catch (e) {
        status(e.message || "Nursery operation failed; session retained");
      } finally {
        busy = false;
        controls();
      }
    });
    return queue;
  }
  function controls() {
    d.querySelectorAll(
      "[data-nursery-action],#nurseryRemember,#nurseryImport,#nurseryLearned,#nurseryRememberTaste,#nurseryScope",
    ).forEach((el) => (el.disabled = busy));
  }
  function render() {
    const previous = [0, 1, 2, 3].map((i) => $("nurseryParent" + i).value);
    for (let i = 0; i < 4; i++) {
      const s = $("nurseryParent" + i);
      s.replaceChildren();
      if (i > 1) s.append(option("", "None"));
      for (const p of all())
        s.append(
          option(
            p.id,
            (p.parents.length === 0
              ? p.version === 3 &&
                w.WorldKernels.specs.some((s) => "world:" + s[0] === p.id)
                ? "IX exact field · "
                : p.solver + " adapter · "
              : "Offspring · ") + p.name,
          ),
        );
      if (all().some((p) => p.id === previous[i])) s.value = previous[i];
      else if (i < 2) s.selectedIndex = i;
    }
    const pool = $("nurseryPool"),
      prior = new Set([...pool.selectedOptions].map((o) => o.value));
    pool.replaceChildren();
    for (const p of all()) {
      const o = option(p.id, p.name + " · " + p.solver);
      o.selected = prior.has(p.id);
      pool.append(o);
    }
    const taste = $("nurseryTaste"),
      oldTaste = taste.value;
    taste.replaceChildren(option("", "No preference · diversity only"));
    for (const p of library.values()) taste.append(option(p.id, p.name));
    taste.value = oldTaste;
    const list = $("nurseryLibrary");
    list.replaceChildren();
    for (const p of library.values()) {
      const row = d.createElement("div");
      row.className = "nursery-item";
      const text = d.createElement("span");
      text.textContent =
        p.name +
        " · generation " +
        p.generation +
        " · " +
        (p.genome.landform || p.genome.shape);
      row.append(text);
      for (const [label, action] of [
        ["play", "play"],
        ["ancestry", "ancestry"],
        ["delete", "delete"],
      ]) {
        const b = d.createElement("button");
        b.textContent = label;
        b.dataset.nurseryAction = action;
        b.dataset.id = p.id;
        row.append(b);
      }
      list.append(row);
    }
    $("nurseryCount").textContent =
      library.size +
      "/100 saved recipes · " +
      (remember ? "remembering on this device" : "session only");
    controls();
  }
  async function openDB() {
    return new Promise((resolve, reject) => {
      let abandoned = false;
      const r = indexedDB.open("cabinet-nursery-v1", 1);
      r.onupgradeneeded = () =>
        r.result.createObjectStore("recipes", { keyPath: "id" });
      r.onerror = () =>
        reject(Error("Local database unavailable; use session mode/export"));
      r.onblocked = () => {
        abandoned = true;
        return reject(
          Error("Database blocked by another tab; close it and retry"),
        );
      };
      r.onsuccess = () => {
        if (abandoned) {
          r.result.close();
          return;
        }
        const result = r.result;
        result.onversionchange = () => {
          result.close();
          db = null;
          remember = false;
          $("nurseryRemember").checked = false;
          status("Database changed in another tab; session retained");
        };
        resolve(result);
      };
    });
  }
  async function transaction(items, clear = false) {
    if (!db) throw Error("Database not open");
    return new Promise((resolve, reject) => {
      const t = db.transaction("recipes", "readwrite"),
        s = t.objectStore("recipes");
      let problem = null;
      const request = s.getAll();
      request.onsuccess = () => {
        try {
          const existing = clear
            ? new Map()
            : new Map(request.result.map((r) => [r.id, N.validate(r)]));
          for (const item of items) {
            const prior = existing.get(item.id);
            if (
              prior &&
              JSON.stringify([prior.seed, prior.genome, prior.parents]) !==
                JSON.stringify([item.seed, item.genome, item.parents])
            )
              throw Error("Conflicting device recipe; nothing overwritten");
            existing.set(item.id, item);
          }
          if (existing.size > 100)
            throw Error(
              "Device library full (100 recipes). Export and clear some first.",
            );
          N.validateAncestry([...existing.values()]);
          if (clear) s.clear();
          for (const item of items) s.put(item);
        } catch (e) {
          problem = e;
          t.abort();
        }
      };
      t.oncomplete = resolve;
      t.onerror = t.onabort = () =>
        reject(
          problem ||
            Error("Storage failed or quota exceeded; no save was confirmed"),
        );
    });
  }
  async function loadDB() {
    return new Promise((resolve, reject) => {
      const t = db.transaction("recipes", "readonly"),
        r = t.objectStore("recipes").getAll();
      let result;
      r.onsuccess = () => (result = r.result);
      t.oncomplete = () => resolve(result);
      t.onerror = () => reject(Error("Could not read nursery database"));
    });
  }
  function merge(items) {
    const out = new Map(library);
    for (const p of items) {
      const prior = out.get(p.id) || founders.get(p.id) || worlds.get(p.id);
      if (
        prior &&
        JSON.stringify([prior.seed, prior.genome, prior.parents]) !==
          JSON.stringify([p.seed, p.genome, p.parents])
      )
        throw Error("Conflicting recipe identity; import rejected");
      if (!founders.has(p.id) && !worlds.has(p.id)) out.set(p.id, p);
    }
    if (out.size > 100) throw Error("Library limit: 100 saved offspring");
    // Validate only relevant source ancestry, not two complete catalogues.
    const graph = new Map(out);
    function include(p) {
      for (const id of p.parents) {
        const source = founders.get(id) || worlds.get(id);
        if (source && !graph.has(id)) graph.set(id, source);
      }
    }
    out.forEach(include);
    N.validateAncestry([...graph.values()]);
    return out;
  }
  function exportFile() {
    const items = new Map(library);
    function include(p) {
      for (const id of p.parents) {
        const parent = recipe(id);
        if (parent && !items.has(id)) {
          items.set(id, parent);
          include(parent);
        }
      }
    }
    for (const p of library.values()) include(p);
    if (items.size > 512) throw Error("Export exceeds 512 versioned records");
    const blob = new Blob(
        [JSON.stringify({ version: 1, recipes: [...items.values()] })],
        { type: "application/json" },
      ),
      url = blob.size <= 2097152 ? URL.createObjectURL(blob) : null,
      a = d.createElement("a");
    if (!url) throw Error("Export exceeds 2 MiB; export a smaller library");
    a.href = url;
    a.download = "cabinet-nursery.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status("Recipe JSON exported. No audio or filenames included.");
  }
  function ancestry(p) {
    selected = p;
    $("nurseryAncestry").replaceChildren();
    const title = d.createElement("h4");
    title.textContent = p.name + " · ancestry & inheritance";
    $("nurseryAncestry").append(title);
    const tree = d.createElement("ul");
    let budget = 200;
    function branch(id, into, seen, depth) {
      if (--budget < 0) return;
      const li = d.createElement("li"),
        parent = recipe(id);
      li.textContent = parent
        ? parent.name + " · " + id
        : "Missing ancestor · " + id;
      into.append(li);
      if (parent && depth < 12 && !seen.has(id)) {
        const next = new Set(seen);
        next.add(id);
        if (parent.parents.length) {
          const ul = d.createElement("ul");
          li.append(ul);
          parent.parents.forEach((x) => branch(x, ul, next, depth + 1));
        }
      } else if (depth >= 12) li.append(" · deeper ancestors omitted");
    }
    p.parents.forEach((id) => branch(id, tree, new Set([p.id]), 0));
    $("nurseryAncestry").append(tree);
    const info = d.createElement("p");
    info.className = "tune-help";
    info.textContent =
      "Seed " +
      p.seed +
      " · " +
      p.solver +
      " · recipe restarts, not simulation checkpoints. Tree display: 12 levels / 200 nodes maximum; exports retain stored recipes. " +
      p.provenance
        .map(
          (g) =>
            g.trait +
            ": " +
            g.weights
              .map((x, i) => Math.round(x * 100) + "% parent " + (i + 1))
              .join(", ") +
            (g.mutation ? " · mutation " + g.mutation.toFixed(3) : "") +
            (g.clamped ? " · safety/temperament clamp" : ""),
        )
        .join("; ");
    $("nurseryAncestry").append(info);
  }
  function preview(recipe) {
    if (observations.has(recipe.id)) {
      const image = new Image(240, 150),
        obs = observations.get(recipe.id);
      image.src = obs.src;
      image.alt =
        "Actual " +
        recipe.solver +
        " recipe at 2.5 simulated seconds, default tuning";
      image.className = "nursery-thumbnail";
      return image;
    }
    const cv = d.createElement("canvas");
    cv.width = 240;
    cv.height = 150;
    const model = N.renderer(recipe);
    const e = w.CabinetVIII.ecology.tune({});
    let output = cv;
    if (model.kind === "glx") {
      if (!previewR) {
        const gpu = d.createElement("canvas");
        gpu.width = 240;
        gpu.height = 150;
        previewR = w.GLR.create(gpu);
      }
      if (!previewR) throw Error("WebGL2 unavailable for habitat previews");
      try {
        model.init(previewR);
        for (let i = 0; i < 50; i++) model.advance({ dt: 0.05, experience: e });
        model.frame(previewR, { dt: 0, fade: 1, experience: e });
        previewR.gl.finish();
        output = previewR.canvas;
      } finally {
        model.dispose(previewR);
      }
    } else {
      model.init();
      for (let i = 0; i < 50; i++) model.advance({ dt: 0.05, experience: e });
      model.frame({
        ctx: cv.getContext("2d"),
        w: 240,
        h: 150,
        dt: 0,
        experience: e,
      });
    }
    const image = d.createElement("img");
    image.className = "nursery-thumbnail";
    image.width = 240;
    image.height = 150;
    image.alt =
      "Actual " +
      recipe.solver +
      " recipe at 2.5 simulated seconds, default tuning";
    image.src = output.toDataURL("image/webp", 0.77);
    const sample = d.createElement("canvas");
    sample.width = 64;
    sample.height = 40;
    const c = sample.getContext("2d", { willReadFrequently: true });
    c.drawImage(output, 0, 0, 64, 40);
    observations.set(recipe.id, {
      src: image.src,
      features: w.PreferenceModel.features(
        recipe,
        w.PreferenceModel.pixels(c.getImageData(0, 0, 64, 40).data, 64, 40),
      ),
    });
    if (observations.size > 128)
      observations.delete(observations.keys().next().value);
    return image;
  }
  async function auditions() {
    const box = $("nurseryCandidates");
    box.replaceChildren();
    for (let i = 0; i < candidates.length; i++) {
      const p = candidates[i],
        row = d.createElement("div");
      row.className = "nursery-item";
      const name = d.createElement("input");
      name.type = "text";
      name.maxLength = 70;
      name.value = p.name;
      name.setAttribute("aria-label", "Offspring " + (i + 1) + " name");
      name.oninput = () => (p.name = name.value);
      row.append(name, preview(p));
      if (p.version === 3) {
        const summary = d.createElement("small");
        summary.className = "tune-help";
        summary.textContent =
          "World · " +
          [
            p.genome.landform,
            p.genome.sky,
            p.genome.water,
            p.genome.weather,
            p.genome.camera,
          ].join(" / ");
        row.append(summary);
      }
      for (const [label, action] of [
        ["audition", "audition"],
        ["save", "save"],
        ["traits", "traits"],
        ["compare from here", "compare"],
        ["prefer over reference", "prefer"],
      ]) {
        const b = d.createElement("button");
        b.textContent = label;
        b.dataset.nurseryAction = action;
        b.dataset.candidate = i;
        row.append(b);
      }
      const score = d.createElement("small");
      score.className = "preference-score";
      row.append(score);
      box.append(row);
      await new Promise((r) => setTimeout(r, 0));
    }
    tasteStatus();
  }
  function play(p) {
    w.Cabinet.playChild(N.renderer(p));
    w.Experience.open(false);
    status(
      "Playing " +
        p.name +
        " · Linger on; arrow travel returns to authored catalogue.",
    );
  }
  async function action(action, button) {
    if (action === "breed") {
      const { parents, weights } = parentSelection();
      const seed = new Uint32Array(1);
      crypto.getRandomValues(seed);
      candidates = [
        N.breed(parents, {
          seed: seed[0] || 1,
          mood: $("nurseryMood").value,
          weights,
          scope: $("nurseryScope").value,
        }),
      ];
      transient.clear();
      candidates[0].name =
        $("nurseryMood").value +
        (candidates[0].version === 3 ? " world" : " seedling");
      candidates.push(N.twin(candidates[0], (seed[0] ^ 0x7139abcd) >>> 0 || 1));
      await auditions();
      status(
        candidates[0].version === 3
          ? "Two world twins: independent inherited landform, sky, water, weather and camera modules. Different flow seeds; audition before saving."
          : "Two twins: same inherited genome, different habitat seeds. Audition before saving.",
      );
    } else if (action === "evolve") {
      const selection = parentSelection(),
        learnedEnabled = $("nurseryLearned").checked && ranker.ready,
        model = learnedEnabled
          ? w.PreferenceModel.create(ranker.snapshot())
          : null;
      stopped = false;
      $("nurseryStop").disabled = false;
      try {
        const seed = new Uint32Array(1);
        crypto.getRandomValues(seed);
        const result = await w.NurseryEvolution.run({
          ...selection,
          scope: $("nurseryScope").value,
          seed: seed[0] || 1,
          mood: $("nurseryMood").value,
          generations: Number($("nurseryGenerations").value),
          candidates: Number($("nurseryBudget").value),
          seconds: Number($("nurserySeconds").value),
          archive: Number($("nurseryArchive").value),
          taste: recipe($("nurseryTaste").value),
          evaluate: learnedEnabled
            ? async (p) => {
                preview(p);
              }
            : null,
          learned: learnedEnabled
            ? (p) => {
                const prediction = model.predict(
                  observations.get(p.id).features,
                );
                return (
                  (1 - model.strength) * w.NurseryEvolution.quality(p) +
                  model.strength * prediction
                );
              }
            : null,
          cancelled: () => stopped,
          progress: (p) =>
            status(
              "Local search · " +
                p.count +
                " candidates · generation " +
                p.generation +
                " · " +
                p.retained +
                " diverse survivors. Stop is immediate between candidates.",
            ),
        });
        $("nurseryStop").disabled = true;
        transient.clear();
        result.ancestry.forEach((p) => transient.set(p.id, p));
        candidates = result.recipes;
        await auditions();
        status(
          result.reason +
            " · " +
            result.count +
            " evaluated genomes, " +
            candidates.length +
            " retained. Ranking: " +
            (learnedEnabled
              ? "locally learned personal preference + diversity"
              : "moderate traits + diversity") +
            "; not universal beauty. Saving includes available unsaved ancestry (100-record limit).",
        );
      } finally {
        $("nurseryStop").disabled = true;
      }
    } else if (action === "compare") {
      const p = candidates[Number(button.dataset.candidate)];
      preview(p);
      comparison = {
        id: p.id,
        name: p.name,
        features: observations.get(p.id).features,
      };
      tasteStatus();
    } else if (action === "prefer") {
      const p = candidates[Number(button.dataset.candidate)];
      if (!comparison || comparison.id === p.id)
        throw Error("Choose a different comparison reference first");
      preview(p);
      ranker.add(
        p.id,
        comparison.id,
        observations.get(p.id).features,
        comparison.features,
      );
      try {
        persistTaste();
      } finally {
        tasteStatus();
      }
      status(
        "Personal comparison learned locally. It does not establish universal beauty.",
      );
    } else if (action === "resetTaste") {
      if (resetTaste())
        status("Personal ranker and stored comparisons erased.");
    } else if (action === "audition")
      play(candidates[Number(button.dataset.candidate)]);
    else if (action === "traits")
      ancestry(candidates[Number(button.dataset.candidate)]);
    else if (action === "save") {
      const p = N.validate(candidates[Number(button.dataset.candidate)]),
        items = new Map([[p.id, p]]);
      function collect(child) {
        for (const id of child.parents) {
          const ancestor = recipe(id);
          if (
            ancestor &&
            !founders.has(id) &&
            !worlds.has(id) &&
            !library.has(id) &&
            !items.has(id)
          ) {
            items.set(id, N.validate(ancestor));
            collect(ancestor);
          }
        }
      }
      collect(p);
      const batch = [...items.values()],
        next = merge(batch);
      if (remember) await transaction(batch);
      library.clear();
      next.forEach((p, k) => library.set(k, p));
      render();
      status(
        "Saved " +
          p.name +
          (remember
            ? " to this device."
            : " for this session; export to keep it."),
      );
    } else if (action === "play") play(library.get(button.dataset.id));
    else if (action === "ancestry") ancestry(library.get(button.dataset.id));
    else if (action === "delete") {
      const id = button.dataset.id;
      const dependents = [...library.values()].filter((p) =>
        p.parents.includes(id),
      );
      if (
        !w.confirm(
          "Delete this recipe? " +
            (dependents.length
              ? "Descendants will retain the parent ID, marked missing; their recipes are not deleted."
              : "This cannot be undone."),
        )
      )
        return;
      const next = [...library.values()].filter((p) => p.id !== id);
      if (remember) await transaction(next, true);
      library.delete(id);
      transient.delete(id);
      render();
      if (selected?.id === id) $("nurseryAncestry").replaceChildren();
      status(
        "Recipe deleted. Descendant provenance retained; missing ancestors are labelled.",
      );
    } else if (action === "export") exportFile();
    else if (action === "clear") {
      if (
        !w.confirm(
          "Clear all saved offspring on this device and in this session? Export first to keep them.",
        )
      )
        return;
      if (db) await transaction([], true);
      w.Cabinet.leaveChild();
      selected = null;
      library.clear();
      candidates = [];
      transient.clear();
      await auditions();
      $("nurseryAncestry").replaceChildren();
      render();
      status("Nursery cleared. Authored worlds unchanged.");
    } else if (action === "return") {
      w.Cabinet.leaveChild();
      status("Returned to the authored catalogue.");
    }
  }
  function parentSelection() {
    if ($("nurseryPoolMode").checked) {
      const selected = [...$("nurseryPool").selectedOptions],
        raw = $("nurseryPoolWeights").value.trim(),
        weights = raw ? raw.split(",").map(Number) : selected.map(() => 1);
      if (selected.length < 2 || selected.length > 32)
        throw Error("Select 2–32 different pool parents");
      if (
        weights.length !== selected.length ||
        weights.some((x) => !Number.isFinite(x) || x < 0 || x > 1)
      )
        throw Error(
          "Give one weight (0–1) per selected pool parent, in displayed order",
        );
      return { parents: selected.map((o) => recipe(o.value)), weights };
    }
    const indices = [0, 1, 2, 3].filter((i) => $("nurseryParent" + i).value);
    return {
      parents: indices.map((i) => recipe($("nurseryParent" + i).value)),
      weights: indices.map((i) => Number($("nurseryWeight" + i).value)),
    };
  }
  function mount() {
    $("nurseryRememberTaste").onchange = () => {
      const enabled = $("nurseryRememberTaste").checked;
      run(async () => {
        try {
          if (enabled) {
            const text = localStorage.getItem(tasteKey);
            if (text) {
              if (text.length > 300000)
                throw Error("Stored taste data too large");
              const obj = JSON.parse(text);
              if (obj.version !== 1) throw Error("Unsupported taste model");
              const loaded = w.PreferenceModel.create(obj.pairs);
              for (const p of ranker.snapshot())
                loaded.add(p.winner, p.loser, p.a, p.b);
              ranker = loaded;
            }
            rememberTaste = true;
            persistTaste();
          } else {
            localStorage.removeItem(tasteKey);
            rememberTaste = false;
          }
          tasteStatus();
        } catch (e) {
          rememberTaste = false;
          $("nurseryRememberTaste").checked = false;
          tasteStatus();
          throw e;
        }
      });
    };
    tasteStatus();
    for (const world of w.Cabinet.designs) {
      const f = N.founderAny(world);
      founders.set(f.id, f);
      const wf = N.worldFounder(world);
      worlds.set(wf.id, wf);
    }
    $("nurseryStop").onclick = () => {
      stopped = true;
      status("Stopping search; keeping completed candidates.");
    };
    d.addEventListener("visibilitychange", () => {
      if (d.hidden) stopped = true;
    });
    for (const world of w.Cabinet.designs)
      try {
        const f = N.founder(world);
        founders.set(f.id, f);
      } catch (_) {}
    $("nurseryScope").onchange = () => {
      stopped = true;
      render();
    };
    render();
    $("nurseryToggle").onclick = () => {
      w.Experience.open(true);
      $("nurseryPanel").open = true;
      $("nurseryPanel").scrollIntoView({ block: "start" });
      $("nurseryParent0").focus();
    };
    $("nurseryPanel").addEventListener("click", (e) => {
      const b = e.target.closest("[data-nursery-action]");
      if (b) run(() => action(b.dataset.nurseryAction, b));
    });
    $("nurseryRemember").onchange = () => {
      const enabled = $("nurseryRemember").checked;
      run(async () => {
        try {
          if (enabled) {
            if (!db) db = await openDB();
            const stored = await loadDB();
            if (stored.length > 100)
              throw Error("Database exceeds capacity; export/reset it first");
            const next = merge(stored.map(N.validate));
            await transaction([...next.values()]);
            library.clear();
            next.forEach((p, k) => library.set(k, p));
            remember = true;
            status(
              "Device library loaded. New saves persist only while this is checked.",
            );
          } else {
            if (db) await transaction([], true);
            remember = false;
            status(
              "Device nursery erased; session recipes retained. Export to keep them.",
            );
          }
          render();
        } catch (e) {
          remember = false;
          $("nurseryRemember").checked = false;
          throw e;
        }
      });
    };
    $("nurseryImport").onchange = (e) => {
      const file = e.target.files[0];
      e.target.value = "";
      if (!file) return;
      run(async () => {
        if (file.size > 2097152) throw Error("Import limit: 2 MiB");
        const items = N.importRecipes(await file.text()),
          next = merge(items);
        if (remember) await transaction([...next.values()]);
        library.clear();
        next.forEach((p, k) => library.set(k, p));
        render();
        status(
          "Validated recipes imported; missing ancestor IDs remain visible.",
        );
      });
    };
    w.addEventListener("pagehide", () => {
      stopped = true;
      if (db) db.close();
    });
  }
  w.NurseryUI = {
    mount,
    resetTaste,
    getTaste: () => ({
      count: ranker.count,
      ready: ranker.ready,
      remember: rememberTaste,
    }),
    getLibrary: () => [...library.values()].map(N.validate),
  };
})(window, document);
