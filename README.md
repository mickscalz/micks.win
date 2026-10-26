# micks.win

**A Cabinet of Infinite Rooms** — 128 real-time worlds across five collections.
Collection V adds 42 new rooms; all 86 earlier rooms remain.

**Ordering, from now on:** newest collection first, then highest editorial
captivation score within that collection. The cycle, rail and gallery use the
same order, and every new visit starts with the newest collection's top room.
Earlier rooms follow as Collections IV, III, II and I. Scores express an
editorial judgement, not measured audience attention or a scientific ranking.

No videos, no runtime libraries, no build step. Seventy-six single-pass WebGL2 worlds,
four stateful GPU systems and forty-eight Canvas 2D worlds share one stage.
The cabinet advances every 21 seconds, with snapshot crossfades and adaptive
WebGL resolution. Complex new scenes have per-room pixel budgets.

## Run

```sh
python3 -m http.server 3000
# Open http://localhost:3000
```

Use a current browser with WebGL2 and hardware acceleration. The application
itself needs no npm installation; npm is only used for development tests.

## Collection V — The Unbounded

**Direct entry. No front screen, no “enter” click, no seven-second gate.**
The newest world starts rendering as soon as the engine is ready. Remote font
stylesheets have been removed from the critical path; local/system fonts keep
entry independent of a third-party font service.

The interface and bottom filmstrip fade after 3.5 seconds of inactivity. Mouse
movement, touch, wheel input or keyboard interaction brings them back. Tab
navigation keeps controls visible, and the gallery stays open while browsing.
Automatic world changes do not wake the interface. H still pins manual immersion
for people who want to influence a world with the pointer without showing UI.

The old bottom rail consisted of CSS tick marks, not thumbnails. It now contains
real image elements with document-relative absolute URLs, native lazy loading,
decoded scene previews, current-room borders and number overlays. A failed image
is replaced by a readable world name and rank rather than an empty rectangle.

Twenty-four shader worlds explore volumetric stellar flight, monumental gates,
star nurseries, abyssal vortices, spectral megastructures, polar-folded sculptures,
metallic wave fields, stellar plasma, faceted landscapes, glowing shoals, ice
canyons, spherical vaults, floating causeways, fractal mist, metallic mosaics,
lobed lacquer, solar membranes, advected pigments, pyramid fields, opal volumes,
swept lasers, cloud strata and logarithmic architecture.

Eighteen drawn worlds add spiral galaxies, woven waves, coral skeletons,
spherical city habitats, articulated koi, aerial islands, nested octahedra, velvet
mandalas, toroidal weaving, mineral terraces, painted atmospheres, torus knots,
orbital swarms, spectral rain, nested portals, translucent petals, ember dunes
and phase lattices. All motion is live; gallery stills are rendered from the
actual scenes. Scores remain subjective editorial ordering, not audience metrics.

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
| 1–128 | Jump by rank; type successive digits within one second |
| 0 | Jump to rank 10 |
| G | Gallery: filter by latest / shaders / simulations / drawn |
| Gallery “go to” | Jump directly to any rank |
| S | Shuffle |
| F | Fullscreen |
| H / “immerse” | Hide interface; H, Escape or “return” restores it |
| Pointer | Influence the interactive worlds |

The active image thumbnail scrolls into view on narrow screens. Gallery filters
show their counts, support keyboard focus, and expose their pressed state. All
128 tiles use small WebP stills rendered from the actual scenes, not placeholder
gradients (optimised for a small total download).

## The rooms

| Rank | Collection | World | Technique |
|---:|---:|---|---|
| 01 | 5 | Chromatic Expanse | volumetric flight · incandescent dust · stellar parallax |
| 02 | 5 | Leviathan Gate | monumental distance fields · atmospheric perspective · portal light |
| 03 | 5 | Thousand Suns | orbital light fields · stellar nurseries · radiant depth |
| 04 | 5 | Nebular Migration | 3D spiral arms · luminous star populations · orbital drift |
| 05 | 5 | Jade Maelstrom | submerged spiral · caustic shafts · abyssal scale |
| 06 | 5 | Iridescent Megastructure | repeated city SDF · spectral facades · orbital camera |
| 07 | 5 | Tidal Ribbons | woven sheet waves · depth-sorted strips · satin gradients |
| 08 | 5 | Plasma Anemone | polar-folded sculpture · soft glow · living filaments |
| 09 | 5 | Impossible Ocean | folded wave relief · metallic tides · impossible horizon |
| 10 | 5 | Chromatic Reef | coral branching · polychrome skeletons · underwater drift |
| 11 | 5 | Heliosphere | stellar plasma · limb scattering · chromatic prominences |
| 12 | 5 | Crystal Dunes | faceted terrain · cyan reflections · fractured crests |
| 13 | 5 | Firefly Citadel | spherical habitat · radiant towers · orbital fireflies |
| 14 | 5 | Velvet Vortex | anisotropic folds · logarithmic drapery · luminous dye |
| 15 | 5 | Lanternfish Ocean | layered shoals · translucent fins · bioluminescent wake |
| 16 | 5 | Prismatic Koi | steering shoal · articulated bodies · reflected ripples |
| 17 | 5 | Electric Glacier | traced ice canyon · subsurface seams · polar radiance |
| 18 | 5 | Bubble Cathedral | spherical vaults · spectral shells · deep perspective |
| 19 | 5 | Aerial Archipelago | floating islands · layered silhouettes · atmospheric vastness |
| 20 | 5 | Endless Causeway | infinite steps · floating treads · vanishing light |
| 21 | 5 | Spore Universe | fractal mist · emissive density · cosmic spores |
| 22 | 5 | Infinite Origami | unfolding octahedra · nested solids · crystalline choreography |
| 23 | 5 | Mosaic Mirage | warped tessellation · metallic relief · chromatic phase |
| 24 | 5 | Polar Roses | lobed porcelain · spectral lacquer · orbiting sculpture |
| 25 | 5 | Velvet Mandala | layered petals · spectral ink · slow radial counterpoint |
| 26 | 5 | Solar Sails | ray-plane facets · translucent membranes · celestial rigging |
| 27 | 5 | Liquid Spectrum | domain advection · pigment boundaries · marbled radiance |
| 28 | 5 | Ribbon Torus | woven toroidal surface · depth-sorted facets · chromatic weaving |
| 29 | 5 | Desert of Glass | pyramid field · mirrored facets · alien sunset |
| 30 | 5 | Fire Opal | internal mineral fire · spherical volume · chromatic inclusions |
| 31 | 5 | Bismuth Temple | stepped mineral terraces · isometric spirals · oxide colour |
| 32 | 5 | Laser Aviary | swept light planes · spectral rigging · haze depth |
| 33 | 5 | Painted Cosmos | painted gas veils · additive atmospheres · drifting pigments |
| 34 | 5 | Neon Topology | torus-knot tubes · depth ordering · luminous crossings |
| 35 | 5 | Chromatic Weather | billowing density · polar illumination · vast cloud strata |
| 36 | 5 | Auric Swarm | coupled orbital drift · additive particles · gravity theatre |
| 37 | 5 | Chromatic Rain | perspective light rain · spectral trails · deep falling field |
| 38 | 5 | Golden Abyss | logarithmic architecture · gilded ribs · falling perspective |
| 39 | 5 | Luminous Archways | nested polygon portals · perspective phases · colour procession |
| 40 | 5 | Opaline Petals | translucent bloom · layered bezier membranes · pearlescent light |
| 41 | 5 | Ember Dunes | layered terrain · drifting embers · incandescent twilight |
| 42 | 5 | Spectrum Choreography | 3D phase lattice · chromatic nodes · collective motion |
| 43 | 4 | Glass Meridian | convex optics · internal reflection · spectral dispersion |
| 44 | 4 | Dune Nocturne | height-field tracing · wind combs · blue-hour sand |
| 45 | 4 | Rain on Elsewhere | curved droplets · refracted bokeh · night glass |
| 46 | 4 | Cloisonné Sky | rose-window geometry · enamel cells · transmitted light |
| 47 | 4 | Ribbon Ballet | depth-sorted silk · parametric surfaces · folded light |
| 48 | 4 | Amber Reliquary | ellipsoid volume · suspended filaments · warm extinction |
| 49 | 4 | Folding Atlas | creased sheet · triangular mesh · travelling deformation |
| 50 | 4 | Silicate Reef | silica shells · radial pores · microscopic light |
| 51 | 4 | Chromatic Abacus | Verlet chains · distance constraints · pointer forces |
| 52 | 4 | Peacock Protocol | barb filaments · ocellar eyes · structural colour |
| 53 | 4 | Cyanotype Garden | botanical silhouettes · venation · photographic blue |
| 54 | 4 | Schlieren Atlas | density-gradient optics · thermal plumes · knife-edge light |
| 55 | 4 | Luminous Mycelium | branching growth · tip competition · luminous transport |
| 56 | 4 | Hyperbolic Bloom | Poincaré disk · circle inversions · infinite boundary |
| 57 | 4 | Prism Parade | isometric solids · phased extrusion · candy architecture |
| 58 | 4 | Circuit Dream | etched copper · routed pulses · soldermask relief |
| 59 | 4 | Kinetic Letterpress | invented glyphs · phase-driven typesetting · warm paper |
| 60 | 4 | Polar Porcelain | twisted ceramic · fluted silhouette · studio reflections |
| 61 | 4 | Oculus Automata | elementary cellular automata · spacetime quilting · rule 110 |
| 62 | 4 | Solar Organ | cylindrical light pipes · phase sequencing · radial depth |
| 63 | 3 | Prismatic Monolith | black crystal · spectral seams · sphere tracing |
| 64 | 3 | Orbital Garden | ringed planet · ray intersections · orbital shadows |
| 65 | 3 | Abyssal Medusa | bioluminescent anatomy · translucent filaments |
| 66 | 3 | Cathedral of Echoes | repeated vaults · distance-field architecture |
| 67 | 3 | Tidal Satin | ocean microfacets · rose-gold horizon |
| 68 | 3 | Kintsugi Earth | porcelain plates · gilded voronoi fractures |
| 69 | 3 | Newton Garden | complex dynamics · cubic basins of attraction |
| 70 | 3 | Murmuration | collective motion · local steering · dusk |
| 71 | 3 | Pyrotechnic Bloom | ballistic sparks · gravity · afterglow |
| 72 | 3 | Entropy Loom | woven light · anisotropic thread shading |
| 73 | 3 | Clockwork Orrery | brass gearing · mechanical harmonics · engraved circles |
| 74 | 3 | Polar Vortex | gas giant · spiral advection · cloud relief |
| 75 | 3 | Ink Calligraphy | brush ribbons · paper grain · negative space |
| 76 | 3 | Quasicrystal | aperiodic order · seven interfering lattices |
| 77 | 3 | Paper Lanterns | translucent rice paper · rising emissive forms |
| 78 | 3 | Tensegrity Swarm | icosahedral cages · depth-sorted projection |
| 79 | 3 | Topographic Dream | contour cartography · mineral pigments |
| 80 | 3 | Pendulum Tides | phase drift · pendulum waves · specular beads |
| 81 | 3 | Eclipse Observatory | occultation · polar streamers · diamond ring |
| 82 | 3 | Lenticular Orchard | optical ribs · interference lacquer · grazing light |
| 83 | 2 | Living Coral | gray–scott · reaction diffusion |
| 84 | 2 | Menger Cathedral | recursive solids · infinite subdivision |
| 85 | 2 | Caustic Abyss | underwater optics · bioluminescence |
| 86 | 2 | Indra's Pearls | circle inversion · kleinian group |
| 87 | 2 | Crystal Prison | refraction · chromatic dispersion |
| 88 | 2 | Infinite Regress | video feedback · self-similar optics |
| 89 | 2 | Cloudsea | volumetric scattering · flight |
| 90 | 2 | Phyllotaxis | golden angle · 137.5 degrees |
| 91 | 2 | Liquid Crystal | birefringence · crossed polarisers |
| 92 | 2 | Ferrofluid | magnetic potential · iron filings |
| 93 | 2 | Coronal Loops | solar magnetism · trapped plasma |
| 94 | 2 | Chladni Resonance | eigenmodes · singing plate |
| 95 | 2 | Diffraction Array | fraunhofer interference · phased emitters |
| 96 | 2 | Frost Dendrite | hexagonal symmetry · crystal growth |
| 97 | 2 | Harmonograph | three pendulums · long exposure |
| 98 | 2 | Fourier Epicycles | discrete transform · drawing with circles |
| 99 | 2 | Möbius Bloom | non-orientable surface · projection |
| 100 | 2 | Fractal Canopy | recursive growth · wind |
| 101 | 2 | Truchet Loops | stochastic tiling · travelling light |
| 102 | 2 | Sandfall | cellular automaton · granular physics |
| 103 | 2 | Ripple Tank | wave superposition · interference |
| 104 | 2 | Spirograph | hypotrochoid · rolling circles |
| 105 | 1 | Singular Bloom | volumetric nebula · gravitational lens |
| 106 | 1 | Chroma Flux | navier–stokes · live gpu fluid |
| 107 | 1 | Event Horizon | schwarzschild geodesics · accretion disk |
| 108 | 1 | Hyperspace | warp tunnel · chromatic aberration |
| 109 | 1 | Aurora Cathedral | volumetric curtains · ice water |
| 110 | 1 | Silk Currents | 65k gpu particles · curl noise · feedback |
| 111 | 1 | Liquid Chrome | metaballs · thin-film dispersion |
| 112 | 1 | Mandelbulb Infinite | power-8 fractal · orbit-trap colour |
| 113 | 1 | Strange Attractor | aizawa system · 60k points |
| 114 | 1 | Iridescence | gyroid lattice · thin-film interference |
| 115 | 1 | Supernova | shock front · lensed starfield |
| 116 | 1 | Hypnotic Moiré | op-art interference · do not stare too long |
| 117 | 1 | Infinite Frontier | procedural range · still water |
| 118 | 1 | Electric Storm | fractal lightning · wet city light |
| 119 | 1 | Quantum Foam | worley cells · soap-film interference |
| 120 | 1 | Cosmic Web | filamentary structure · depth parallax |
| 121 | 1 | Stained Cosmos | kaleidoscopic voronoi · leaded glass |
| 122 | 1 | Neon Horizon | retrowave grid · dying sun |
| 123 | 1 | Ink Bloom | metaball diffusion · gold on black |
| 124 | 1 | Silken Plasma | domain-warped fractal noise |
| 125 | 1 | Firefly Deep | bokeh depth of field · warm dusk |
| 126 | 1 | Digital Rain | glyph cascade · depth & bleed |
| 127 | 1 | Particle Morph | shape interpolation · your name in points |
| 128 | 1 | Silk Drape | layered gradient cloth · specular sheen |

## Architecture

- `index.html`: stage, title card, controls, gallery and direct-entry stage.
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

The catalogue test checks all 128 unique IDs, contiguous ranks, newest-first ordering and within-collection editorial ranking,
renderer contracts, script syntax, relative asset paths and script load order.
The browser test uses **real WebGL2**, not mocked contexts: it visits and draws
every room, checks GL errors, exercises filters, two-digit jumps, numeric entry,
automatic wraparound, collection boundaries, paper theme reset, stateful hold, immersion focus/exit, idle/wake interaction and mobile resize.
It also checks three-digit jumps, nonblank new-world frames, decoded first/last
filmstrip images and the broken-image fallback. It serves the page under `/micks.win/`
to catch GitHub project-Pages path regressions. To use a custom Chromium binary,
set `CHROMIUM_PATH`. CI runs both suites for pull requests and pushes to main.
It uses the runner’s installed Google Chrome when available, falling back to
Playwright’s Chromium installation when needed; both paths run the same real-WebGL suite.

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
