# micks.win

**A Cabinet of Infinite Rooms** — 66 real-time worlds across three collections.
Collection III adds 20 new rooms; all 46 earlier rooms remain.

**Ordering, from now on:** newest collection first, then highest editorial
captivation score within that collection. The cycle, rail and gallery use the
same order, and every new visit starts with the newest collection's top room.
Older rooms follow as Collection II and then Collection I. Scores express an
editorial judgement, not measured audience attention or a scientific ranking.

No videos, no runtime libraries, no build step. Forty single-pass WebGL2 worlds,
four stateful GPU systems and twenty-two Canvas 2D worlds share one stage.
The cabinet advances every 21 seconds, with snapshot crossfades and adaptive
WebGL resolution. Complex new scenes have per-room pixel budgets.

## Run

```sh
python3 -m http.server 3000
# Open http://localhost:3000
```

Use a current browser with WebGL2 and hardware acceleration. The application
itself needs no npm installation; npm is only used for development tests.

## Collection III — material, atmosphere and impossible places

Twenty new worlds explore reflective black crystal, orbital intersections and
shadows, bioluminescent anatomy, repeated architectural vaults, microfacet waves,
gilded ceramic fractures, complex Newton basins, aperiodic lattices, woven
threads, storm relief, luminous paper and optical lacquer.

Six drawn rooms add local-rule flocking, ballistic fireworks, mechanical gearing,
calligraphic ribbons on paper, projected icosahedral cages and pendulum waves.
The paper, porcelain and cartography rooms use dark typography on a pale local
scrim so the interface remains readable on deliberately bright compositions.

## Collection II — retained in full

The second collection explores recursive solids, refractive optics, phyllotaxis,
Chladni modes, magnetic fields, birefringence, iterative circle inversion,
volumetric clouds, solar loops, diffraction, and hexagonal frost.

Two rooms are stateful GPU simulations:

- **Living Coral:** Gray–Scott reaction diffusion on a 256² ping-pong lattice.
  A weighted nine-point Laplacian, diffusion, feed and kill rates evolve two
  chemicals into spots and labyrinths. The pointer seeds new chemistry.
- **Infinite Regress:** a 512² optical-feedback texture, transformed and fed
  back every frame. Rotating emitters leave nested, chromatically sheared echoes.

Eight drawn rooms use accumulated pendulum strokes, Fourier epicycles,
a projected Möbius ribbon, recursive branching, Truchet arcs, a falling-sand
cellular automaton, wave interference and rolling-circle hypotrochoids.

## Controls

| Control | Action |
|---|---|
| ← / → | Previous / next world |
| Space | Hold / resume the cycle |
| 1–66 | Jump by rank; type two digits within one second |
| 0 | Jump to rank 10 |
| G | Gallery: filter by latest / shaders / simulations / drawn |
| Gallery “go to” | Jump directly to any rank |
| S | Shuffle |
| F | Fullscreen |
| Pointer | Influence the interactive worlds |

The active rail marker scrolls into view on narrow screens. Gallery filters
show their counts, support keyboard focus, and expose their pressed state. All
66 tiles use small WebP stills rendered from the actual scenes, not placeholder
gradients (optimised for a small total download).

## The rooms

| Rank | Collection | World | Technique |
|---:|---:|---|---|
| 01 | 3 | Prismatic Monolith | black crystal · spectral seams · sphere tracing |
| 02 | 3 | Orbital Garden | ringed planet · ray intersections · orbital shadows |
| 03 | 3 | Abyssal Medusa | bioluminescent anatomy · translucent filaments |
| 04 | 3 | Cathedral of Echoes | repeated vaults · distance-field architecture |
| 05 | 3 | Tidal Satin | ocean microfacets · rose-gold horizon |
| 06 | 3 | Kintsugi Earth | porcelain plates · gilded voronoi fractures |
| 07 | 3 | Newton Garden | complex dynamics · cubic basins of attraction |
| 08 | 3 | Murmuration | collective motion · local steering · dusk |
| 09 | 3 | Pyrotechnic Bloom | ballistic sparks · gravity · afterglow |
| 10 | 3 | Entropy Loom | woven light · anisotropic thread shading |
| 11 | 3 | Clockwork Orrery | brass gearing · mechanical harmonics · engraved circles |
| 12 | 3 | Polar Vortex | gas giant · spiral advection · cloud relief |
| 13 | 3 | Ink Calligraphy | brush ribbons · paper grain · negative space |
| 14 | 3 | Quasicrystal | aperiodic order · seven interfering lattices |
| 15 | 3 | Paper Lanterns | translucent rice paper · rising emissive forms |
| 16 | 3 | Tensegrity Swarm | icosahedral cages · depth-sorted projection |
| 17 | 3 | Topographic Dream | contour cartography · mineral pigments |
| 18 | 3 | Pendulum Tides | phase drift · pendulum waves · specular beads |
| 19 | 3 | Eclipse Observatory | occultation · polar streamers · diamond ring |
| 20 | 3 | Lenticular Orchard | optical ribs · interference lacquer · grazing light |
| 21 | 2 | Living Coral | gray–scott · reaction diffusion |
| 22 | 2 | Menger Cathedral | recursive solids · infinite subdivision |
| 23 | 2 | Caustic Abyss | underwater optics · bioluminescence |
| 24 | 2 | Indra's Pearls | circle inversion · kleinian group |
| 25 | 2 | Crystal Prison | refraction · chromatic dispersion |
| 26 | 2 | Infinite Regress | video feedback · self-similar optics |
| 27 | 2 | Cloudsea | volumetric scattering · flight |
| 28 | 2 | Phyllotaxis | golden angle · 137.5 degrees |
| 29 | 2 | Liquid Crystal | birefringence · crossed polarisers |
| 30 | 2 | Ferrofluid | magnetic potential · iron filings |
| 31 | 2 | Coronal Loops | solar magnetism · trapped plasma |
| 32 | 2 | Chladni Resonance | eigenmodes · singing plate |
| 33 | 2 | Diffraction Array | fraunhofer interference · phased emitters |
| 34 | 2 | Frost Dendrite | hexagonal symmetry · crystal growth |
| 35 | 2 | Harmonograph | three pendulums · long exposure |
| 36 | 2 | Fourier Epicycles | discrete transform · drawing with circles |
| 37 | 2 | Möbius Bloom | non-orientable surface · projection |
| 38 | 2 | Fractal Canopy | recursive growth · wind |
| 39 | 2 | Truchet Loops | stochastic tiling · travelling light |
| 40 | 2 | Sandfall | cellular automaton · granular physics |
| 41 | 2 | Ripple Tank | wave superposition · interference |
| 42 | 2 | Spirograph | hypotrochoid · rolling circles |
| 43 | 1 | Singular Bloom | volumetric nebula · gravitational lens |
| 44 | 1 | Chroma Flux | navier–stokes · live gpu fluid |
| 45 | 1 | Event Horizon | schwarzschild geodesics · accretion disk |
| 46 | 1 | Hyperspace | warp tunnel · chromatic aberration |
| 47 | 1 | Aurora Cathedral | volumetric curtains · ice water |
| 48 | 1 | Silk Currents | 65k gpu particles · curl noise · feedback |
| 49 | 1 | Liquid Chrome | metaballs · thin-film dispersion |
| 50 | 1 | Mandelbulb Infinite | power-8 fractal · orbit-trap colour |
| 51 | 1 | Strange Attractor | aizawa system · 60k points |
| 52 | 1 | Iridescence | gyroid lattice · thin-film interference |
| 53 | 1 | Supernova | shock front · lensed starfield |
| 54 | 1 | Hypnotic Moiré | op-art interference · do not stare too long |
| 55 | 1 | Infinite Frontier | procedural range · still water |
| 56 | 1 | Electric Storm | fractal lightning · wet city light |
| 57 | 1 | Quantum Foam | worley cells · soap-film interference |
| 58 | 1 | Cosmic Web | filamentary structure · depth parallax |
| 59 | 1 | Stained Cosmos | kaleidoscopic voronoi · leaded glass |
| 60 | 1 | Neon Horizon | retrowave grid · dying sun |
| 61 | 1 | Ink Bloom | metaball diffusion · gold on black |
| 62 | 1 | Silken Plasma | domain-warped fractal noise |
| 63 | 1 | Firefly Deep | bokeh depth of field · warm dusk |
| 64 | 1 | Digital Rain | glyph cascade · depth & bleed |
| 65 | 1 | Particle Morph | shape interpolation · your name in points |
| 66 | 1 | Silk Drape | layered gradient cloth · specular sheen |

## Architecture

- `index.html`: stage, title card, controls, gallery and entrance.
- `assets/css/style.css`: glass interface, responsive rail, technique filters.
- `assets/js/glsl-prelude.js`: noise, SDFs, palettes, camera and film finish.
- `assets/js/gl.js`: cached programs, targets, ping-pong buffers and uniforms.
- `assets/js/designs/*.js`: each room's metadata and renderer.
- `assets/js/catalogue.js`: newest-first collection policy and within-collection ranking.
- `assets/js/engine.js`: lazy initialization, cycling, crossfades and navigation.

New rooms register with `window.D({ id, edition, name, tag, blurb, captivation,
art, kind, ... })`. Increment `edition` for a new collection: no manual global
renumbering is required. `catalogue.js` derives display `rank` and `collectionRank`
from edition (descending), score (descending), then ID (stable tie-break). A `gl` room supplies `frag`; `glx` and `2d` rooms
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

The catalogue test checks all 66 unique IDs, contiguous ranks, newest-first ordering and within-collection editorial ranking,
renderer contracts, script syntax, relative asset paths and script load order.
The browser test uses **real WebGL2**, not mocked contexts: it visits and draws
every room, checks GL errors, exercises filters, two-digit jumps, numeric entry,
automatic wraparound, collection boundaries, paper theme reset and mobile resize. It serves the page under `/micks.win/`
to catch GitHub project-Pages path regressions. To use a custom Chromium binary,
set `CHROMIUM_PATH`. CI runs both suites for pull requests and pushes to main.

### Refresh gallery stills

With the static server running, use `npm run previews`. It renders each room in
Chromium and writes its 480×300 WebP to `assets/previews/`. Use
`PREVIEW_IDS=crystal-prison npm run previews` to rebuild one scene, or `SITE_URL`
to point at a different local address. Stateful drawn rooms can set `previewFrames` for their warm-up. These are gallery thumbnails only; the
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
