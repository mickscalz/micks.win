# micks.win

**A Cabinet of Infinite Rooms** — 192 real-time worlds across six collections.
Collection VI adds 64 new rooms; all 128 earlier rooms remain.

**Ordering, from now on:** newest collection first, then highest editorial
captivation score within that collection. The cycle, rail and gallery use the
same order, and every new visit starts with the newest collection's top room.
Earlier rooms follow as Collections V, IV, III, II and I. Scores express an
editorial judgement, not measured audience attention or a scientific ranking.

No videos, no runtime libraries, no build step. 118 single-pass WebGL2 worlds,
four stateful GPU systems and 70 Canvas 2D worlds share one stage.
The cabinet advances every 21 seconds, with snapshot crossfades and adaptive
WebGL resolution. Complex new scenes have per-room pixel budgets.

## Run

```sh
python3 -m http.server 3000
# Open http://localhost:3000
```

Use a current browser with WebGL2 and hardware acceleration. The application
itself needs no npm installation; npm is only used for development tests.

## Collection VI — After the Impossible

64 new constructions: **42 WebGL worlds and 22 Canvas worlds**. All 128
previous worlds are retained, with Collection VI leading the cycle and gallery.
Geometry, density, trajectories and cellular state change over time, not only
palette. Independent, slow clocks avoid a single synchronised breathing loop.

The new collection spans navigable gyroid chambers, bent-ray accretion disks,
rotating 4D hypercubes, articulated ring sculptures, advected pigment, Enneper
surfaces, branching helices, interference relief, softened gravitational dynamics,
infinite arcades, volumetric auroras, cyclic cellular fronts, liquid organisms,
geological folds, elastic membranes, recursive cavities, quasicrystals, kinetic
stairs, slotted shells, pressure packets, Lorenz trajectories, folded velvet,
spectral dune flight, ciliated cells, carved gems, luminous ink, toppling sandpiles,
vertebral corridors, moving droplet lenses, logarithmic Riemann sheets, box-fold
architecture, anisotropic threads, logarithmic shells, lobed membranes, complex
inversions, magnetic pendulums, dipole sculptures, buoyant volumes, molecular
braids, crossed beams, Voronoi enamel, inverting tetrahedra, organic tube palaces,
bathymetry, asteroid flight, levitating quarries, diffraction beats, nonlinear
flame accumulation, breathing ruins, merging membranes, contracting tunnels,
perforated mountains, refracted checkerwork, triangular canopies, stellar shells,
sheared optical domains, articulated kites, fluted siphons, holographic relief,
differential-growth boundaries, radial machinery, afterimage seas, segmented
creatures and slit-scan temporal paintings.

**Linger (L or the infinity button)** stays in the current world while its
animation continues. It is separate from Space, which truly freezes motion.
Leaving Linger restarts a full 21-second dwell without rewinding the artwork.
Manual navigation still works, and the choice persists until toggled off.
The control is available on touch screens and exposes its pressed state.

New simulations use local seeded populations, capped histories and bounded
lattices. Held frames and resize redraws do not advance simulation state.
Heavy shaders have individual pixel budgets; inactive scenes are not advanced.
All 64 new thumbnail assets are rendered from these same live renderers.

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
| Space | Freeze / resume world motion and cycling |
| L / infinity button | Linger in this world while it keeps evolving |
| 1–192 | Jump by rank; type successive digits within one second |
| 0 | Jump to rank 10 |
| G | Gallery: filter by latest / shaders / simulations / drawn |
| Gallery “go to” | Jump directly to any rank |
| S | Shuffle |
| F | Fullscreen |
| H / “immerse” | Hide interface; H, Escape or “return” restores it |
| Pointer | Influence the interactive worlds |

The active image thumbnail scrolls into view on narrow screens. Gallery filters
show their counts, support keyboard focus, and expose their pressed state. All
192 tiles use small WebP stills rendered from the actual scenes, not placeholder
gradients (optimised for a small total download).

## The rooms

| Rank | Collection | World | Technique |
|---|---|---|---|
| 01 | 6 | Vertebrae of Light | flexing axial sculpture · repeated ribs · electric marrow |
| 02 | 6 | Chromofluid Rebellion | nested vector advection · liquid interference · moving pigment |
| 03 | 6 | Tesseract Tempest | four-dimensional rotations · perspective cells · hypercubic procession |
| 04 | 6 | Crown of Tides | lobed membrane · concentric rupture · oscillating silica |
| 05 | 6 | Event Horizon Garden | gravitational lens · accretion filaments · bent starlight |
| 06 | 6 | Enneper Dream | minimal surface · self-intersecting silk · rotating geometry |
| 07 | 6 | Nematode Palace | curling tubes · organic chambers · rotating radial skeleton |
| 08 | 6 | Opal Weatherfront | thin-film interference · converging pressure · spectral ridges |
| 09 | 6 | Stellar Cocoon | nested membranes · polar slits · inner star |
| 10 | 6 | Impossible Aqueduct | warped arcades · tiled stone · unending traversal |
| 11 | 6 | Aurora Labyrinth | volumetric curtains · lateral parallax · charged atmosphere |
| 12 | 6 | Chromatic Dominion | cyclic cellular competition · spiral fronts · living mosaic |
| 13 | 6 | Flame Manuscript | nonlinear iterated functions · accumulated density · spectral flame |
| 14 | 6 | Tectonic Rainbow | folding strata · shaded relief · geological colour flow |
| 15 | 6 | Elastic Constellation | Verlet membrane · wind forces · constraint network |
| 16 | 6 | Hyperbolic Hive | recursive cavities · cellular architecture · slow deformation |
| 17 | 6 | Phase Change | quasicrystal interference · shifting symmetry · moiré depth |
| 18 | 6 | Staircase Paradox | kinetic stepped loops · impossible return · coloured architecture |
| 19 | 6 | Clockwork Eclipse | nested orbital shells · moving apertures · obsidian and gold |
| 20 | 6 | Pressure Bloom | propagating wave packets · caustic ridges · chromatic collision |
| 21 | 6 | Lorenz Silk | chaotic trajectories · evolving attractor · ribbon projection |
| 22 | 6 | Velour Singularity | twisted textile shell · rippling folds · saturated velvet |
| 23 | 6 | Spectral Sandstorm | layered dune flight · analytic heights · impossible horizons |
| 24 | 6 | Amoeba Theatre | soft silhouettes · ciliated membranes · microscopic choreography |
| 25 | 6 | Prism Heart | faceted breathing solid · carved chambers · optical seams |
| 26 | 6 | Ink Between Stars | advected pigment plumes · negative space · luminous edges |
| 27 | 6 | Chromatic Sandpile | driven toppling lattice · avalanche fronts · granular symmetry |
| 28 | 6 | Elsewhere Cathedral | gyroid passage · living topology · iridescent depth |
| 29 | 6 | Impossible Rain | refractive droplets · cellular refraction · falling lenses |
| 30 | 6 | Riemann Cascade | complex logarithm · connected sheets · spectral helicoid |
| 31 | 6 | Recursive Monastery | nested box folds · distance-estimated fractal · immense scale |
| 32 | 6 | Silken Turbulence | anisotropic filaments · nested flow · satin highlights |
| 33 | 6 | Astral Nautilus | logarithmic shell · expanding ribs · iridescent cross-section |
| 34 | 6 | Seraphim Machine | articulated concentric wings · rotating union · pearlescence |
| 35 | 6 | Folded Spectrum | complex-plane tessellation · inversion drift · coloured infinities |
| 36 | 6 | Magnetic Pendulum | driven magnetic dynamics · chaotic trails · moving attractors |
| 37 | 6 | Magnetic Rose | dipole sculpture · polar petals · flowing field lines |
| 38 | 6 | Helium Dream | buoyant volume · thermals · chromatic density |
| 39 | 6 | Helix Promenade | braided helices · paired bridges · molecular scale |
| 40 | 6 | Interstellar Loom | crossed braided beams · camera flight · luminous junctions |
| 41 | 6 | Liquid Stained Glass | moving Voronoi cells · refractive seams · luminous enamel |
| 42 | 6 | Kaleidocycle Engine | inverting tetrahedral ring · faceted linkage · cyclic transformation |
| 43 | 6 | Ribbon Worldtree | branched helices · luminous sap · growing sculpture |
| 44 | 6 | Sunken Contours | bathymetric drift · moving islands · depth-light mapping |
| 45 | 6 | Orbital Debris | faceted asteroid flight · depth projection · distant suns |
| 46 | 6 | Antigravity Quarry | levitating cut blocks · moving seams · mineral interiors |
| 47 | 6 | Infinite Diffraction | curved gratings · spectral orders · moving optical lattice |
| 48 | 6 | Mercury Organism | coalescing metaballs · capillary necks · liquid chrome |
| 49 | 6 | Breathing Archaeology | eroding ceremonial rings · carved steps · pulsing voids |
| 50 | 6 | Neon Protoplasm | cellular thresholds · merging membranes · electrical nuclei |
| 51 | 6 | Peristaltic Transit | contracting passage · moving cross-sections · spectral depth |
| 52 | 6 | Aperture Mountain | perforated peaks · spiralling strata · orbital terrain |
| 53 | 6 | Refracted Memory | anamorphic tiles · chromatic displacement · liquid checkerwork |
| 54 | 6 | Delaunay Drift | triangular canopy · travelling deformation · low-poly light |
| 55 | 6 | Gravity Ballet | softened many-body dynamics · luminous trajectories · mutual orbit |
| 56 | 6 | Chromatic Faultline | sheared domains · melting edges · optical displacement |
| 57 | 6 | Dragon Kites | articulated aerial creatures · wind ribbons · layered flight |
| 58 | 6 | Cosmic Siphon | fluted funnel · endless fall · rotating chamber walls |
| 59 | 6 | Living Hologram | phase-wrapped relief · spectral scan planes · shifting normals |
| 60 | 6 | Lichen Observatory | differential growth · elastic boundary · self-avoiding folds |
| 61 | 6 | Corona Assembly | radial mechanisms · variable teeth · nested rotation |
| 62 | 6 | Afterimage Ocean | long-wave refraction · phase currents · changing horizon |
| 63 | 6 | Solar Centipede | segmented locomotion · procedural legs · radiant exoskeleton |
| 64 | 6 | Afterlight Archive | slit-scan accumulation · temporal painting · chromatic histories |
| 65 | 5 | Chromatic Expanse | volumetric flight · incandescent dust · stellar parallax |
| 66 | 5 | Leviathan Gate | monumental distance fields · atmospheric perspective · portal light |
| 67 | 5 | Thousand Suns | orbital light fields · stellar nurseries · radiant depth |
| 68 | 5 | Nebular Migration | 3D spiral arms · luminous star populations · orbital drift |
| 69 | 5 | Jade Maelstrom | submerged spiral · caustic shafts · abyssal scale |
| 70 | 5 | Iridescent Megastructure | repeated city SDF · spectral facades · orbital camera |
| 71 | 5 | Tidal Ribbons | woven sheet waves · depth-sorted strips · satin gradients |
| 72 | 5 | Plasma Anemone | polar-folded sculpture · soft glow · living filaments |
| 73 | 5 | Impossible Ocean | folded wave relief · metallic tides · impossible horizon |
| 74 | 5 | Chromatic Reef | coral branching · polychrome skeletons · underwater drift |
| 75 | 5 | Heliosphere | stellar plasma · limb scattering · chromatic prominences |
| 76 | 5 | Crystal Dunes | faceted terrain · cyan reflections · fractured crests |
| 77 | 5 | Firefly Citadel | spherical habitat · radiant towers · orbital fireflies |
| 78 | 5 | Velvet Vortex | anisotropic folds · logarithmic drapery · luminous dye |
| 79 | 5 | Lanternfish Ocean | layered shoals · translucent fins · bioluminescent wake |
| 80 | 5 | Prismatic Koi | steering shoal · articulated bodies · reflected ripples |
| 81 | 5 | Electric Glacier | traced ice canyon · subsurface seams · polar radiance |
| 82 | 5 | Bubble Cathedral | spherical vaults · spectral shells · deep perspective |
| 83 | 5 | Aerial Archipelago | floating islands · layered silhouettes · atmospheric vastness |
| 84 | 5 | Endless Causeway | infinite steps · floating treads · vanishing light |
| 85 | 5 | Spore Universe | fractal mist · emissive density · cosmic spores |
| 86 | 5 | Infinite Origami | unfolding octahedra · nested solids · crystalline choreography |
| 87 | 5 | Mosaic Mirage | warped tessellation · metallic relief · chromatic phase |
| 88 | 5 | Polar Roses | lobed porcelain · spectral lacquer · orbiting sculpture |
| 89 | 5 | Velvet Mandala | layered petals · spectral ink · slow radial counterpoint |
| 90 | 5 | Solar Sails | ray-plane facets · translucent membranes · celestial rigging |
| 91 | 5 | Liquid Spectrum | domain advection · pigment boundaries · marbled radiance |
| 92 | 5 | Ribbon Torus | woven toroidal surface · depth-sorted facets · chromatic weaving |
| 93 | 5 | Desert of Glass | pyramid field · mirrored facets · alien sunset |
| 94 | 5 | Fire Opal | internal mineral fire · spherical volume · chromatic inclusions |
| 95 | 5 | Bismuth Temple | stepped mineral terraces · isometric spirals · oxide colour |
| 96 | 5 | Laser Aviary | swept light planes · spectral rigging · haze depth |
| 97 | 5 | Painted Cosmos | painted gas veils · additive atmospheres · drifting pigments |
| 98 | 5 | Neon Topology | torus-knot tubes · depth ordering · luminous crossings |
| 99 | 5 | Chromatic Weather | billowing density · polar illumination · vast cloud strata |
| 100 | 5 | Auric Swarm | coupled orbital drift · additive particles · gravity theatre |
| 101 | 5 | Chromatic Rain | perspective light rain · spectral trails · deep falling field |
| 102 | 5 | Golden Abyss | logarithmic architecture · gilded ribs · falling perspective |
| 103 | 5 | Luminous Archways | nested polygon portals · perspective phases · colour procession |
| 104 | 5 | Opaline Petals | translucent bloom · layered bezier membranes · pearlescent light |
| 105 | 5 | Ember Dunes | layered terrain · drifting embers · incandescent twilight |
| 106 | 5 | Spectrum Choreography | 3D phase lattice · chromatic nodes · collective motion |
| 107 | 4 | Glass Meridian | convex optics · internal reflection · spectral dispersion |
| 108 | 4 | Dune Nocturne | height-field tracing · wind combs · blue-hour sand |
| 109 | 4 | Rain on Elsewhere | curved droplets · refracted bokeh · night glass |
| 110 | 4 | Cloisonné Sky | rose-window geometry · enamel cells · transmitted light |
| 111 | 4 | Ribbon Ballet | depth-sorted silk · parametric surfaces · folded light |
| 112 | 4 | Amber Reliquary | ellipsoid volume · suspended filaments · warm extinction |
| 113 | 4 | Folding Atlas | creased sheet · triangular mesh · travelling deformation |
| 114 | 4 | Silicate Reef | silica shells · radial pores · microscopic light |
| 115 | 4 | Chromatic Abacus | Verlet chains · distance constraints · pointer forces |
| 116 | 4 | Peacock Protocol | barb filaments · ocellar eyes · structural colour |
| 117 | 4 | Cyanotype Garden | botanical silhouettes · venation · photographic blue |
| 118 | 4 | Schlieren Atlas | density-gradient optics · thermal plumes · knife-edge light |
| 119 | 4 | Luminous Mycelium | branching growth · tip competition · luminous transport |
| 120 | 4 | Hyperbolic Bloom | Poincaré disk · circle inversions · infinite boundary |
| 121 | 4 | Prism Parade | isometric solids · phased extrusion · candy architecture |
| 122 | 4 | Circuit Dream | etched copper · routed pulses · soldermask relief |
| 123 | 4 | Kinetic Letterpress | invented glyphs · phase-driven typesetting · warm paper |
| 124 | 4 | Polar Porcelain | twisted ceramic · fluted silhouette · studio reflections |
| 125 | 4 | Oculus Automata | elementary cellular automata · spacetime quilting · rule 110 |
| 126 | 4 | Solar Organ | cylindrical light pipes · phase sequencing · radial depth |
| 127 | 3 | Prismatic Monolith | black crystal · spectral seams · sphere tracing |
| 128 | 3 | Orbital Garden | ringed planet · ray intersections · orbital shadows |
| 129 | 3 | Abyssal Medusa | bioluminescent anatomy · translucent filaments |
| 130 | 3 | Cathedral of Echoes | repeated vaults · distance-field architecture |
| 131 | 3 | Tidal Satin | ocean microfacets · rose-gold horizon |
| 132 | 3 | Kintsugi Earth | porcelain plates · gilded voronoi fractures |
| 133 | 3 | Newton Garden | complex dynamics · cubic basins of attraction |
| 134 | 3 | Murmuration | collective motion · local steering · dusk |
| 135 | 3 | Pyrotechnic Bloom | ballistic sparks · gravity · afterglow |
| 136 | 3 | Entropy Loom | woven light · anisotropic thread shading |
| 137 | 3 | Clockwork Orrery | brass gearing · mechanical harmonics · engraved circles |
| 138 | 3 | Polar Vortex | gas giant · spiral advection · cloud relief |
| 139 | 3 | Ink Calligraphy | brush ribbons · paper grain · negative space |
| 140 | 3 | Quasicrystal | aperiodic order · seven interfering lattices |
| 141 | 3 | Paper Lanterns | translucent rice paper · rising emissive forms |
| 142 | 3 | Tensegrity Swarm | icosahedral cages · depth-sorted projection |
| 143 | 3 | Topographic Dream | contour cartography · mineral pigments |
| 144 | 3 | Pendulum Tides | phase drift · pendulum waves · specular beads |
| 145 | 3 | Eclipse Observatory | occultation · polar streamers · diamond ring |
| 146 | 3 | Lenticular Orchard | optical ribs · interference lacquer · grazing light |
| 147 | 2 | Living Coral | gray–scott · reaction diffusion |
| 148 | 2 | Menger Cathedral | recursive solids · infinite subdivision |
| 149 | 2 | Caustic Abyss | underwater optics · bioluminescence |
| 150 | 2 | Indra's Pearls | circle inversion · kleinian group |
| 151 | 2 | Crystal Prison | refraction · chromatic dispersion |
| 152 | 2 | Infinite Regress | video feedback · self-similar optics |
| 153 | 2 | Cloudsea | volumetric scattering · flight |
| 154 | 2 | Phyllotaxis | golden angle · 137.5 degrees |
| 155 | 2 | Liquid Crystal | birefringence · crossed polarisers |
| 156 | 2 | Ferrofluid | magnetic potential · iron filings |
| 157 | 2 | Coronal Loops | solar magnetism · trapped plasma |
| 158 | 2 | Chladni Resonance | eigenmodes · singing plate |
| 159 | 2 | Diffraction Array | fraunhofer interference · phased emitters |
| 160 | 2 | Frost Dendrite | hexagonal symmetry · crystal growth |
| 161 | 2 | Harmonograph | three pendulums · long exposure |
| 162 | 2 | Fourier Epicycles | discrete transform · drawing with circles |
| 163 | 2 | Möbius Bloom | non-orientable surface · projection |
| 164 | 2 | Fractal Canopy | recursive growth · wind |
| 165 | 2 | Truchet Loops | stochastic tiling · travelling light |
| 166 | 2 | Sandfall | cellular automaton · granular physics |
| 167 | 2 | Ripple Tank | wave superposition · interference |
| 168 | 2 | Spirograph | hypotrochoid · rolling circles |
| 169 | 1 | Singular Bloom | volumetric nebula · gravitational lens |
| 170 | 1 | Chroma Flux | navier–stokes · live gpu fluid |
| 171 | 1 | Event Horizon | schwarzschild geodesics · accretion disk |
| 172 | 1 | Hyperspace | warp tunnel · chromatic aberration |
| 173 | 1 | Aurora Cathedral | volumetric curtains · ice water |
| 174 | 1 | Silk Currents | 65k gpu particles · curl noise · feedback |
| 175 | 1 | Liquid Chrome | metaballs · thin-film dispersion |
| 176 | 1 | Mandelbulb Infinite | power-8 fractal · orbit-trap colour |
| 177 | 1 | Strange Attractor | aizawa system · 60k points |
| 178 | 1 | Iridescence | gyroid lattice · thin-film interference |
| 179 | 1 | Supernova | shock front · lensed starfield |
| 180 | 1 | Hypnotic Moiré | op-art interference · do not stare too long |
| 181 | 1 | Infinite Frontier | procedural range · still water |
| 182 | 1 | Electric Storm | fractal lightning · wet city light |
| 183 | 1 | Quantum Foam | worley cells · soap-film interference |
| 184 | 1 | Cosmic Web | filamentary structure · depth parallax |
| 185 | 1 | Stained Cosmos | kaleidoscopic voronoi · leaded glass |
| 186 | 1 | Neon Horizon | retrowave grid · dying sun |
| 187 | 1 | Ink Bloom | metaball diffusion · gold on black |
| 188 | 1 | Silken Plasma | domain-warped fractal noise |
| 189 | 1 | Firefly Deep | bokeh depth of field · warm dusk |
| 190 | 1 | Digital Rain | glyph cascade · depth & bleed |
| 191 | 1 | Particle Morph | shape interpolation · your name in points |
| 192 | 1 | Silk Drape | layered gradient cloth · specular sheen |

## Architecture

- `index.html`: stage, title card, controls, gallery and direct-entry stage.
- `assets/css/style.css`: glass interface, responsive rail, technique filters.
- `assets/js/designs/collection-vi*.js`: the 64 Collection VI constructions.
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

The catalogue test checks all 192 unique IDs, contiguous ranks, newest-first ordering and within-collection editorial ranking,
renderer contracts, script syntax, relative asset paths and script load order.
The browser test uses **real WebGL2**, not mocked contexts: it visits and draws
every room, checks GL errors, exercises filters, two-digit jumps, numeric entry,
automatic wraparound, collection boundaries, paper theme reset, stateful hold, immersion focus/exit, idle/wake interaction and mobile resize.
It also checks meaningful temporal change in all 64 new worlds, held redraws
without simulation advancement in all 22 new Canvas rooms, keyboard/touch Linger,
320px control bounds, three-digit jumps, nonblank new-world frames, decoded first/last
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
