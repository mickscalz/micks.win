/* Session nursery with explicitly loaded/remembered IndexedDB recipes. */
(function (w, d) {
  "use strict";
  const N = w.Nursery,
    library = new Map(),
    founders = new Map();
  let candidates = [],
    remember = false,
    db = null,
    busy = false,
    queue = Promise.resolve(),
    selected = null;
  const $ = (id) => d.getElementById(id),
    status = (s) => ($("nurseryStatus").textContent = s);
  function option(value, text) {
    const o = d.createElement("option");
    o.value = value;
    o.textContent = text;
    return o;
  }
  function all() {
    return [...founders.values(), ...library.values()];
  }
  function recipe(id) {
    return library.get(id) || founders.get(id);
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
      "[data-nursery-action],#nurseryRemember,#nurseryImport",
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
            (founders.has(p.id) ? "Authored adapter · " : "Offspring · ") +
              p.name,
          ),
        );
      if (all().some((p) => p.id === previous[i])) s.value = previous[i];
      else if (i < 2) s.selectedIndex = i;
    }
    const list = $("nurseryLibrary");
    list.replaceChildren();
    for (const p of library.values()) {
      const row = d.createElement("div");
      row.className = "nursery-item";
      const text = d.createElement("span");
      text.textContent =
        p.name + " · generation " + p.generation + " · " + p.genome.shape;
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
      const prior = out.get(p.id) || founders.get(p.id);
      if (
        prior &&
        JSON.stringify([prior.seed, prior.genome, prior.parents]) !==
          JSON.stringify([p.seed, p.genome, p.parents])
      )
        throw Error("Conflicting recipe identity; import rejected");
      if (!founders.has(p.id)) out.set(p.id, p);
    }
    if (out.size > 100) throw Error("Library limit: 100 saved offspring");
    N.validateAncestry([...founders.values(), ...out.values()]);
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
    if (items.size > 132) throw Error("Export exceeds 132 versioned records");
    const blob = new Blob(
        [JSON.stringify({ version: 1, recipes: [...items.values()] })],
        { type: "application/json" },
      ),
      url = URL.createObjectURL(blob),
      a = d.createElement("a");
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
      " · eco-v1 · recipe restarts, not simulation checkpoints. Tree display: 12 levels / 200 nodes maximum; exports retain stored recipes. " +
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
    const cv = d.createElement("canvas");
    cv.width = 240;
    cv.height = 150;
    const model = N.renderer(recipe);
    model.init();
    const e = w.CabinetVIII.ecology.tune({});
    for (let i = 0; i < 50; i++) model.advance({ dt: 0.05, experience: e });
    model.frame({
      ctx: cv.getContext("2d"),
      w: 240,
      h: 150,
      dt: 0,
      experience: e,
    });
    const image = d.createElement("img");
    image.className = "nursery-thumbnail";
    image.width = 240;
    image.height = 150;
    image.alt = "Actual eco-v1 recipe at 2.5 simulated seconds, default tuning";
    image.src = cv.toDataURL("image/webp", 0.77);
    return image;
  }
  function auditions() {
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
      for (const [label, action] of [
        ["audition", "audition"],
        ["save", "save"],
        ["traits", "traits"],
      ]) {
        const b = d.createElement("button");
        b.textContent = label;
        b.dataset.nurseryAction = action;
        b.dataset.candidate = i;
        row.append(b);
      }
      box.append(row);
    }
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
      const parents = [0, 1, 2, 3]
        .map((i) => recipe($("nurseryParent" + i).value))
        .filter(Boolean);
      const weights = [0, 1, 2, 3]
        .filter((i) => $("nurseryParent" + i).value)
        .map((i) => Number($("nurseryWeight" + i).value));
      const seed = new Uint32Array(1);
      crypto.getRandomValues(seed);
      candidates = [
        N.breed(parents, {
          seed: seed[0] || 1,
          mood: $("nurseryMood").value,
          weights,
        }),
      ];
      candidates[0].name = $("nurseryMood").value + " seedling";
      candidates.push(N.twin(candidates[0], (seed[0] ^ 0x7139abcd) >>> 0 || 1));
      auditions();
      status(
        "Two twins: same inherited genome, different habitat seeds. Audition before saving.",
      );
    } else if (action === "audition")
      play(candidates[Number(button.dataset.candidate)]);
    else if (action === "traits")
      ancestry(candidates[Number(button.dataset.candidate)]);
    else if (action === "save") {
      const p = N.validate(candidates[Number(button.dataset.candidate)]),
        next = merge([p]);
      if (remember) await transaction([p]);
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
      auditions();
      $("nurseryAncestry").replaceChildren();
      render();
      status("Nursery cleared. Authored worlds unchanged.");
    } else if (action === "return") {
      w.Cabinet.leaveChild();
      status("Returned to the authored catalogue.");
    }
  }
  function mount() {
    for (const world of w.Cabinet.designs)
      try {
        const f = N.founder(world);
        founders.set(f.id, f);
      } catch (_) {}
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
        if (file.size > 524288) throw Error("Import limit: 512 KiB");
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
      if (db) db.close();
    });
  }
  w.NurseryUI = {
    mount,
    getLibrary: () => [...library.values()].map(N.validate),
  };
})(window, document);
