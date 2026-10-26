# micks.win

**A Cabinet of Infinite Rooms** — 86 real-time worlds across four collections.
Collection IV adds 20 new rooms; all 66 earlier rooms remain.

**Ordering, from now on:** newest collection first, then highest editorial
captivation score within that collection. The cycle, rail and gallery use the
same order, and every new visit starts with the newest collection's top room.
Earlier rooms follow as Collections III, II and I. Scores express an
editorial judgement, not measured audience attention or a scientific ranking.

No videos, no runtime libraries, no build step. Fifty-two single-pass WebGL2 worlds,
four stateful GPU systems and thirty Canvas 2D worlds share one stage.
The cabinet advances every 21 seconds, with snapshot crossfades and adaptive
WebGL resolution. Complex new scenes have per-room pixel budgets.

## Run

```sh
python3 -m http.server 3000
# Open http://localhost:3000
```

Use a current browser with WebGL2 and hardware acceleration. The application
itself needs no npm installation; npm is only used for development tests.

## Collection IV — light as matter

Twelve new shader worlds explore convex-prism dispersion, traced wind-combed
terrain, droplet refraction, rose-window enamel, volumetric amber, porous
silica shells, structural feather colour, density-gradient optics, Poincaré circle
inversions, etched circuitry, fluted ceramic and phase-sequenced light pipes.

Eight drawn worlds add depth-sorted silk ribbons, triangulated folding sheets,
Verlet bead chains with pointer forces, cyanotype botanicals, bounded branching
networks, isometric extrusions, invented moving glyphs and rule-110 spacetime
quilts. Growth strokes are batched; cellular automata use a small pixel buffer
rather than thousands of per-frame canvas fills.

**Immersion:** press H or use “immerse” to clear the interface. A visible return
button, H or Escape restores it; G exits immersion and opens the gallery.
Hidden controls become inert and focus moves to the return button. Hold now
freezes renderer state as well as the clock, while still allowing navigation
and resize to redraw. Browser modifier-key shortcuts are left alone.

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
| 1–86 | Jump by rank; type successive digits within one second |
| 0 | Jump to rank 10 |
| G | Gallery: filter by latest / shaders / simulations / drawn |
| Gallery “go to” | Jump directly to any rank |
| S | Shuffle |
| F | Fullscreen |
| H / “immerse” | Hide interface; H, Escape or “return” restores it |
| Pointer | Influence the interactive worlds |

The active rail marker scrolls into view on narrow screens. Gallery filters
show their counts, support keyboard focus, and expose their pressed state. All
86 tiles use small WebP stills rendered from the actual scenes, not placeholder
gradients (optimised for a small total download).

## The rooms

| Rank | Collection | World | Technique |
|---:|---:|---|---|
| 01 | 4 | Glass Meridian | convex optics · internal reflection · spectral dispersion |
| 02 | 4 | Dune Nocturne | height-field tracing · wind combs · blue-hour sand |
| 03 | 4 | Rain on Elsewhere | curved droplets · refracted bokeh · night glass |
| 04 | 4 | Cloisonné Sky | rose-window geometry · enamel cells · transmitted light |
| 05 | 4 | Ribbon Ballet | depth-sorted silk · parametric surfaces · folded light |
| 06 | 4 | Amber Reliquary | ellipsoid volume · suspended filaments · warm extinction |
| 07 | 4 | Folding Atlas | creased sheet · triangular mesh · travelling deformation |
| 08 | 4 | Silicate Reef | silica shells · radial pores · microscopic light |
| 09 | 4 | Chromatic Abacus | Verlet chains · distance constraints · pointer forces |
| 10 | 4 | Peacock Protocol | barb filaments · ocellar eyes · structural colour |
| 11 | 4 | Cyanotype Garden | botanical silhouettes · venation · photographic blue |
| 12 | 4 | Schlieren Atlas | density-gradient optics · thermal plumes · knife-edge light |
| 13 | 4 | Luminous Mycelium | branching growth · tip competition · luminous transport |
| 14 | 4 | Hyperbolic Bloom | Poincaré disk · circle inversions · infinite boundary |
| 15 | 4 | Prism Parade | isometric solids · phased extrusion · candy architecture |
| 16 | 4 | Circuit Dream | etched copper · routed pulses · soldermask relief |
| 17 | 4 | Kinetic Letterpress | invented glyphs · phase-driven typesetting · warm paper |
| 18 | 4 | Polar Porcelain | twisted ceramic · fluted silhouette · studio reflections |
| 19 | 4 | Oculus Automata | elementary cellular automata · spacetime quilting · rule 110 |
| 20 | 4 | Solar Organ | cylindrical light pipes · phase sequencing · radial depth |
| 21 | 3 | Prismatic Monolith | black crystal · spectral seams · sphere tracing |
| 22 | 3 | Orbital Garden | ringed planet · ray intersections · orbital shadows |
| 23 | 3 | Abyssal Medusa | bioluminescent anatomy · translucent filaments |
| 24 | 3 | Cathedral of Echoes | repeated vaults · distance-field architecture |
| 25 | 3 | Tidal Satin | ocean microfacets · rose-gold horizon |
| 26 | 3 | Kintsugi Earth | porcelain plates · gilded voronoi fractures |
| 27 | 3 | Newton Garden | complex dynamics · cubic basins of attraction |
| 28 | 3 | Murmuration | collective motion · local steering · dusk |
| 29 | 3 | Pyrotechnic Bloom | ballistic sparks · gravity · afterglow |
| 30 | 3 | Entropy Loom | woven light · anisotropic thread shading |
| 31 | 3 | Clockwork Orrery | brass gearing · mechanical harmonics · engraved circles |
| 32 | 3 | Polar Vortex | gas giant · spiral advection · cloud relief |
| 33 | 3 | Ink Calligraphy | brush ribbons · paper grain · negative space |
| 34 | 3 | Quasicrystal | aperiodic order · seven interfering lattices |
| 35 | 3 | Paper Lanterns | translucent rice paper · rising emissive forms |
| 36 | 3 | Tensegrity Swarm | icosahedral cages · depth-sorted projection |
| 37 | 3 | Topographic Dream | contour cartography · mineral pigments |
| 38 | 3 | Pendulum Tides | phase drift · pendulum waves · specular beads |
| 39 | 3 | Eclipse Observatory | occultation · polar streamers · diamond ring |
| 40 | 3 | Lenticular Orchard | optical ribs · interference lacquer · grazing light |
| 41 | 2 | Living Coral | gray–scott · reaction diffusion |
| 42 | 2 | Menger Cathedral | recursive solids · infinite subdivision |
| 43 | 2 | Caustic Abyss | underwater optics · bioluminescence |
| 44 | 2 | Indra's Pearls | circle inversion · kleinian group |
| 45 | 2 | Crystal Prison | refraction · chromatic dispersion |
| 46 | 2 | Infinite Regress | video feedback · self-similar optics |
| 47 | 2 | Cloudsea | volumetric scattering · flight |
| 48 | 2 | Phyllotaxis | golden angle · 137.5 degrees |
| 49 | 2 | Liquid Crystal | birefringence · crossed polarisers |
| 50 | 2 | Ferrofluid | magnetic potential · iron filings |
| 51 | 2 | Coronal Loops | solar magnetism · trapped plasma |
| 52 | 2 | Chladni Resonance | eigenmodes · singing plate |
| 53 | 2 | Diffraction Array | fraunhofer interference · phased emitters |
| 54 | 2 | Frost Dendrite | hexagonal symmetry · crystal growth |
| 55 | 2 | Harmonograph | three pendulums · long exposure |
| 56 | 2 | Fourier Epicycles | discrete transform · drawing with circles |
| 57 | 2 | Möbius Bloom | non-orientable surface · projection |
| 58 | 2 | Fractal Canopy | recursive growth · wind |
| 59 | 2 | Truchet Loops | stochastic tiling · travelling light |
| 60 | 2 | Sandfall | cellular automaton · granular physics |
| 61 | 2 | Ripple Tank | wave superposition · interference |
| 62 | 2 | Spirograph | hypotrochoid · rolling circles |
| 63 | 1 | Singular Bloom | volumetric nebula · gravitational lens |
| 64 | 1 | Chroma Flux | navier–stokes · live gpu fluid |
| 65 | 1 | Event Horizon | schwarzschild geodesics · accretion disk |
| 66 | 1 | Hyperspace | warp tunnel · chromatic aberration |
| 67 | 1 | Aurora Cathedral | volumetric curtains · ice water |
| 68 | 1 | Silk Currents | 65k gpu particles · curl noise · feedback |
| 69 | 1 | Liquid Chrome | metaballs · thin-film dispersion |
| 70 | 1 | Mandelbulb Infinite | power-8 fractal · orbit-trap colour |
| 71 | 1 | Strange Attractor | aizawa system · 60k points |
| 72 | 1 | Iridescence | gyroid lattice · thin-film interference |
| 73 | 1 | Supernova | shock front · lensed starfield |
| 74 | 1 | Hypnotic Moiré | op-art interference · do not stare too long |
| 75 | 1 | Infinite Frontier | procedural range · still water |
| 76 | 1 | Electric Storm | fractal lightning · wet city light |
| 77 | 1 | Quantum Foam | worley cells · soap-film interference |
| 78 | 1 | Cosmic Web | filamentary structure · depth parallax |
| 79 | 1 | Stained Cosmos | kaleidoscopic voronoi · leaded glass |
| 80 | 1 | Neon Horizon | retrowave grid · dying sun |
| 81 | 1 | Ink Bloom | metaball diffusion · gold on black |
| 82 | 1 | Silken Plasma | domain-warped fractal noise |
| 83 | 1 | Firefly Deep | bokeh depth of field · warm dusk |
| 84 | 1 | Digital Rain | glyph cascade · depth & bleed |
| 85 | 1 | Particle Morph | shape interpolation · your name in points |
| 86 | 1 | Silk Drape | layered gradient cloth · specular sheen |

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

The catalogue test checks all 86 unique IDs, contiguous ranks, newest-first ordering and within-collection editorial ranking,
renderer contracts, script syntax, relative asset paths and script load order.
The browser test uses **real WebGL2**, not mocked contexts: it visits and draws
every room, checks GL errors, exercises filters, two-digit jumps, numeric entry,
automatic wraparound, collection boundaries, paper theme reset, stateful hold, immersion focus/exit and mobile resize. It serves the page under `/micks.win/`
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
