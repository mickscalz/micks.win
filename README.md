# micks.win

**A Cabinet of Infinite Rooms** — 46 real-time worlds, with 22 new rooms in the
second collection. The original 24 remain; the new rooms are interleaved into
one editorial ranking, rather than appended after the originals.

No videos, no runtime libraries, no build step. Twenty-six single-pass WebGL2
worlds, four stateful GPU systems and sixteen Canvas 2D worlds share one stage.
The cabinet advances every 21 seconds, with snapshot crossfades and adaptive
WebGL resolution. Captivation scores are subjective editorial choices, not
measurements of audience attention.

## Run

```sh
python3 -m http.server 3000
# Open http://localhost:3000
```

Use a current browser with WebGL2 and hardware acceleration. The application
itself needs no npm installation; npm is only used for development tests.

## The expansion

The new collection explores recursive solids, refractive optics, phyllotaxis,
Chladni modes, magnetic fields, birefringence, iterative circle inversion,
volumetric clouds, solar loops, diffraction, and hexagonal frost.

Two rooms are stateful GPU simulations:

- **Living Coral:** Gray–Scott reaction diffusion on a 256² ping-pong lattice.
  A weighted nine-point Laplacian, diffusion, feed and kill rates evolve two
  chemicals into spots and labyrinths. The pointer seeds new chemistry.
- **Infinite Regress:** a 512² optical-feedback texture, transformed and fed
  back every frame. Rotating emitters leave nested, chromatically sheared echoes.

Eight new drawn rooms use accumulated pendulum strokes, Fourier epicycles,
a projected Möbius ribbon, recursive branching, Truchet arcs, a falling-sand
cellular automaton, wave interference and rolling-circle hypotrochoids.

## Controls

| Control | Action |
|---|---|
| ← / → | Previous / next world |
| Space | Hold / resume the cycle |
| 1–46 | Jump by rank; type two digits within one second |
| 0 | Jump to rank 10 |
| G | Gallery: filter by shaders / simulations / drawn |
| Gallery “go to” | Jump directly to any rank |
| S | Shuffle |
| F | Fullscreen |
| Pointer | Influence the interactive worlds |

The active rail marker scrolls into view on narrow screens. Gallery filters
show their counts, support keyboard focus, and expose their pressed state. All
46 tiles use small WebP stills rendered from the actual scenes, not placeholder
gradients (about 500 KB for the whole gallery).

## The rooms

| Rank | World | Technique |
|---:|---|---|
| 01 | Singular Bloom | volumetric nebula · gravitational lens |
| 02 | Living Coral | gray–scott · reaction diffusion |
| 03 | Chroma Flux | navier–stokes · live gpu fluid |
| 04 | Menger Cathedral | recursive solids · infinite subdivision |
| 05 | Event Horizon | schwarzschild geodesics · accretion disk |
| 06 | Caustic Abyss | underwater optics · bioluminescence |
| 07 | Hyperspace | warp tunnel · chromatic aberration |
| 08 | Indra's Pearls | circle inversion · kleinian group |
| 09 | Aurora Cathedral | volumetric curtains · ice water |
| 10 | Crystal Prison | refraction · chromatic dispersion |
| 11 | Silk Currents | 65k gpu particles · curl noise · feedback |
| 12 | Infinite Regress | video feedback · self-similar optics |
| 13 | Liquid Chrome | metaballs · thin-film dispersion |
| 14 | Cloudsea | volumetric scattering · flight |
| 15 | Mandelbulb Infinite | power-8 fractal · orbit-trap colour |
| 16 | Phyllotaxis | golden angle · 137.5 degrees |
| 17 | Strange Attractor | aizawa system · 60k points |
| 18 | Liquid Crystal | birefringence · crossed polarisers |
| 19 | Iridescence | gyroid lattice · thin-film interference |
| 20 | Supernova | shock front · lensed starfield |
| 21 | Ferrofluid | magnetic potential · iron filings |
| 22 | Hypnotic Moiré | op-art interference · do not stare too long |
| 23 | Infinite Frontier | procedural range · still water |
| 24 | Electric Storm | fractal lightning · wet city light |
| 25 | Coronal Loops | solar magnetism · trapped plasma |
| 26 | Quantum Foam | worley cells · soap-film interference |
| 27 | Cosmic Web | filamentary structure · depth parallax |
| 28 | Chladni Resonance | eigenmodes · singing plate |
| 29 | Stained Cosmos | kaleidoscopic voronoi · leaded glass |
| 30 | Neon Horizon | retrowave grid · dying sun |
| 31 | Diffraction Array | fraunhofer interference · phased emitters |
| 32 | Ink Bloom | metaball diffusion · gold on black |
| 33 | Silken Plasma | domain-warped fractal noise |
| 34 | Frost Dendrite | hexagonal symmetry · crystal growth |
| 35 | Firefly Deep | bokeh depth of field · warm dusk |
| 36 | Digital Rain | glyph cascade · depth & bleed |
| 37 | Harmonograph | three pendulums · long exposure |
| 38 | Particle Morph | shape interpolation · your name in points |
| 39 | Silk Drape | layered gradient cloth · specular sheen |
| 40 | Fourier Epicycles | discrete transform · drawing with circles |
| 41 | Möbius Bloom | non-orientable surface · projection |
| 42 | Fractal Canopy | recursive growth · wind |
| 43 | Truchet Loops | stochastic tiling · travelling light |
| 44 | Sandfall | cellular automaton · granular physics |
| 45 | Ripple Tank | wave superposition · interference |
| 46 | Spirograph | hypotrochoid · rolling circles |

## Architecture

- `index.html`: stage, title card, controls, gallery and entrance.
- `assets/css/style.css`: glass interface, responsive rail, technique filters.
- `assets/js/glsl-prelude.js`: noise, SDFs, palettes, camera and film finish.
- `assets/js/gl.js`: cached programs, targets, ping-pong buffers and uniforms.
- `assets/js/designs/*.js`: each room's metadata and renderer.
- `assets/js/engine.js`: lazy initialization, cycling, crossfades and navigation.

New rooms register with `window.D({ id, rank, name, tag, blurb, captivation,
art, kind, ... })`. A `gl` room supplies `frag`; `glx` and `2d` rooms
supply `init` and `frame`. The next room is warmed before the cut. Gallery
counts and rank totals derive from the catalogue, not hard-coded JS constants.
Only the active world is advanced. Inactive stateful worlds retain their state.

## Tests

```sh
npm ci
npm test
npx playwright-core install --with-deps chromium
npm run test:browser
```

The catalogue test checks all 46 unique IDs, contiguous ranks, editorial ordering,
renderer contracts, script syntax, relative asset paths and script load order.
The browser test uses **real WebGL2**, not mocked contexts: it visits and draws
every room, checks GL errors, exercises filters, two-digit jumps, numeric entry,
automatic wraparound and mobile resize. It serves the page under `/micks.win/`
to catch GitHub project-Pages path regressions. To use a custom Chromium binary,
set `CHROMIUM_PATH`. CI runs both suites for pull requests and pushes to main.

### Refresh gallery stills

With the static server running, use `npm run previews`. It renders each room in
Chromium and writes its 480×300 WebP to `assets/previews/`. Use
`PREVIEW_IDS=crystal-prison npm run previews` to rebuild one scene, or `SITE_URL`
to point at a different local address. These are gallery thumbnails only; the
full-screen worlds remain live-rendered.

## Publishing and the custom domain

GitHub Pages deploys `main` through `.github/workflows/pages.yml`. The workflow
publishes only HTML, CSS, JavaScript and assets; development dependencies and tests
are not included. The default URL is <https://mickscalz.github.io/micks.win/>.

**For this Actions-based publishing source, configure `micks.win` in repository
Settings → Pages → Custom domain. A `CNAME` file is ignored by GitHub's Actions
Pages deployment and cannot claim the domain.** This corrects the earlier README.
See [GitHub's custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

The intended Cloudflare DNS-only records are the four GitHub apex A addresses
`185.199.108.153` through `185.199.111.153`, four AAAA addresses
`2606:50c0:8000::153` through `2606:50c0:8003::153`, and `www` CNAME to
`mickscalz.github.io`. After GitHub provisions the certificate, enable Enforce
HTTPS in Pages settings. Verify ownership in account-level Pages settings to
protect against domain takeover. This expansion does not change DNS or domain settings.
