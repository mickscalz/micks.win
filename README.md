# micks.win

**A Cabinet of Infinite Rooms** — 256 live-rendered worlds across seven collections.
Collection VII, **The Living Elsewhere**, adds 64 worlds while preserving all 192 earlier ones.

No entry gate, videos, application dependencies or build step. **150 single-pass
WebGL2 worlds, four stateful GPU systems and 102 Canvas worlds** share one stage.

**Standing order:** newest collection first; highest editorial captivation score
first within each collection. Guided travel, the rail and gallery follow that
order. Adaptive and Autonomous travel are explicit alternatives. Scores are an
editorial judgement, not measured audience attention.

## Run

```sh
python3 -m http.server 3000
# Open http://localhost:3000
```

Use a current browser with WebGL2 and hardware acceleration. npm is only needed
for development tests. Microphone access requires HTTPS or localhost and explicit
browser permission; local audio files do not require a microphone.

## Collection VII — The Living Elsewhere

**32 shader constructions and 32 drawn constructions**, spanning organic,
crystalline, fluid, celestial, architectural, microscopic, landscape, geometric,
painterly, surreal and minimal families. These are independently constructed
worlds, not a set of palette swaps.

The opening world combines a porous living lattice, curving roots, a luminous
river and suspended tessellations. Other worlds include branching worldships,
membrane volumes, levitating cities, inverted rain, spore processions, soft-law
interiors, migrating lanterns, agent trails, dividing cells, growing radial
colonies, microscopic larvae, crystalline tectonics and persistent light currents.

New shader geometry uses smoothly interpolated seeded parameters on roughly
12-second visual epochs. Drawn worlds combine independent oscillations with
smoothly changing phase and palette offsets; simulations also develop their own
state. Motion/reduced-motion settings deliberately stretch these intervals.
Palette offsets differ between worlds, with indigo, violet, gold, cyan, rose,
blue/gold contrast and quieter paper/negative-space interludes. Transitions use
3.6-second snapshot dissolves, without the previous per-world flash or zoom reset.

Lighting is procedural shading, glow, fog and translucent approximation — not
path-traced GI, true refraction, display HDR or a guarantee of hardware motion blur.
Only the active world advances; inactive stateful worlds retain their state.

## Shape the experience

**tune · audio** opens the optional controls; the visual starts without it.

- **Manual:** stay until you navigate. **Guided** (default): ranked 21-second travel.
- **Adaptive:** recent-world/family/palette/motion-type avoidance, explicit session likes/skips and a
  slow visual arc influence world selection. Available audio energy/onset density
  also influence target intensity; this is a rules-based conductor, not a trained model.
- **Autonomous:** adaptive selection plus gradual density/intensity variation
  through development, peaks and breathing room. The panel explains changes.
- Eight controls: **novelty, intensity, motion, detail, brightness, color range,
  density, audio reactivity**. Like, Skip, Save, Calmer, Brighter, More Abstract and
  More Energetic provide direct overrides. Saved/liked worlds can be revisited and
  unmarked. Detail limits raster/population budgets; density/intensity response
  also depends on the construction. Legacy worlds retain their original visual
  algorithms, with shared motion, brightness, quality and navigation controls.
- **Calm now** immediately lowers motion, intensity, brightness and density.
  Reduced motion follows the system preference at first load; reduced flashes is
  on by default. A blue/gold contrast palette is available for the new collection.
  There is no medical/photosensitivity safety guarantee; pause or leave if uncomfortable.
- The modal traps focus, makes underlying controls inert, supports Escape,
  and remains scrollable at 320px. Transport shortcuts do not hijack its inputs.

### Optional audio and privacy

Audio is **off until you choose a local file or explicitly request the microphone**.
Web Audio measures RMS energy, low/mid/high frequency balance, spectral-flux
onsets, onset density, recent dynamics and distinguishable channel balance.
A BPM estimate appears only after at least six consistent onsets with sufficient
confidence; otherwise it says **tempo uncertain**. Timing uses the audio clock,
not a potentially slowed animation clock. Sections, track identity and mood are
**not inferred**. Mono/indistinguishable channels are reported as unknown/mono.

No audio is recorded, uploaded or retained. Microphone input is not sent to the
speakers. Stop, Reset and leaving the page release streams, contexts and file
object URLs. Permission denial, unsupported audio and silence have a graceful
internal-rhythm fallback; no browser-tab/system-audio capture is claimed.

Controls and feedback are session-only unless you check **Remember settings,
likes and saved worlds on this device**. That opt-in stores only those three
categories in local storage (`cabinet-experience-v1`, with a separate consent key).
It does not retain audio, file names, credentials, track facts or interaction logs.
Turning remembering off deletes stored preferences; Reset also clears session
choices and stops audio. No telemetry or remote personalization service is used.

### Performance

Real frame intervals drive automatic raster-budget reduction and recovery, Canvas
pixel density and bounded active populations. High/Balanced/Economy are explicit
presets. The panel shows FPS, frame interval and current quality, plus JS heap or
battery level only where the browser exposes them. Thermal data is unavailable;
no temperature reading is invented. Simulations remain bounded and do not advance
on a held redraw. Software-rendered test FPS is not a hardware performance promise.

## Navigation

- Pointer movement, touch or keyboard wake the interface; it fades after **3500ms**
  of inactivity. There is no mandatory welcome screen.
- Arrow keys travel; **G** opens the gallery. Type a rank (1–256) or use its jump box.
- **Space** freezes the scene. **L / ∞ Linger** keeps this world moving past the
  travel timer; leaving Linger starts a full dwell without rewinding the artwork.
- **H** enters immersion, with a keyboard/touch return control; Escape exits.
- The filmstrip and gallery use actual rendered WebP thumbnails, with a readable
  fallback if an image fails. Latest collection, WebGL, GPU-system and Canvas
  filters share the same catalogue.

## Architecture

- `index.html`, `assets/css/style.css`: direct-entry stage, transport, gallery,
  accessibility and optional conductor panel.
- `assets/js/designs/collection-vii*.js`: the 64 new constructions; older files
  preserve Collections I–VI.
- `assets/js/experience.js`: local conductor, consent, feedback, audio analysis,
  accessibility settings and performance state.
- `assets/js/glsl-prelude.js`, `gl.js`: shared shader helpers, uniforms, cached
  programs, targets and ping-pong buffers.
- `assets/js/catalogue.js`: edition-descending, score-descending stable ranking.
- `assets/js/engine.js`: lazy initialization, separate travel/art clocks, smooth
  transitions, quality adaptation and navigation.

Rooms register with `window.D({id, edition, name, tag, blurb, captivation, art,
kind, ...})`. `gl` rooms provide `frag`; `glx` and `2d` rooms provide `init` and
`frame`. Counts, ranks and latest-collection filters derive from the registry.

## Tests

```sh
npm ci
npm test
npx playwright-core install --with-deps chromium
npm run test:browser
```

Unit tests cover the complete registry, assets/order, independent new shader
sources, consent/sanitization/reset, selection, accessibility, quality bounds,
synthetic band/onset/tempo/stereo analysis, audio-clock independence, permission
denial and cancellation of pending streams.

The browser suite compiles and draws **all 256 worlds using real WebGL2**. It
checks nonblank Collection V–VII frames, temporal change in all 128 VI/VII worlds,
held-state stability in their 54 Canvas constructions, navigation, filters,
collection boundaries, wraparound, idle/wake, immersion, real thumbnails and
mobile layout under a GitHub project-Pages subpath. The experience suite tests
all four modes/eight sliders, consent across reloads, saved recall, modal focus,
quality, calm/contrast and narrow-screen bounds. It decodes an actual generated
stereo WAV through the browser's real Web Audio graph, checks analysis and stop,
and checks microphone denial via a controlled permission mock. Unit stream mocks
cover teardown races; physical microphone hardware is not part of CI.

Set `CHROMIUM_PATH` to use an existing Chromium executable. CI runs the unit and
browser suites for pull requests and pushes to main, using installed Chrome or
Playwright Chromium. Deterministic animation tests are not FPS benchmarks.

### Refresh gallery stills

With a static server running, use `npm run previews`. It writes actual 480×300
WebP captures to `assets/previews/`. `PREVIEW_IDS=living-elsewhere npm run previews`
rebuilds one scene; `SITE_URL` selects a different server. Stateful Canvas rooms
can specify `previewFrames` for warm-up. The full-screen scene remains live.

## Catalogue

| Rank | Collection | World | Construction |
| ---: | ---: | --- | --- |
| 1 | 7 | The Living Elsewhere | fractal architecture · liquid-light river · organic lattice · floating shards |
| 2 | 7 | Lumen Garden | branching luminous flora · layered blooms · nocturnal parallax |
| 3 | 7 | Mycelial Worldship | branching hull · living capillaries · asymmetric morphogenesis |
| 4 | 7 | Siphonophore Procession | colonial organisms · articulated bells · trailing light tendrils |
| 5 | 7 | Glass Amoeba | refractive membrane · moving organelles · nested density |
| 6 | 7 | Chromatic Tecton | floating hexagonal plates · slow deformation · displaced continental cells |
| 7 | 7 | City of Nervous Stars | levitating towers · neural windows · luminous ground currents |
| 8 | 7 | Night of Nine Moons | occluding planets · auratic atmospheres · orbital shadows |
| 9 | 7 | Cocoon Galaxy | helical stellar filaments · expanding nursery · parallax |
| 10 | 7 | Mandible of Dawn | articulated exoskeleton · luminous limbs · curling anatomy |
| 11 | 7 | Recursive Mangrove | inverted roots · recursive fork field · tidal atmosphere |
| 12 | 7 | Jelly Forest | giant translucent bells · living filaments · deep-water haze |
| 13 | 7 | Prism Leviathan | swimming crystalline anatomy · articulated fins · bioluminescence |
| 14 | 7 | Aerial Root City | floating settlements · hanging roots · interconnecting light bridges |
| 15 | 7 | Liminal Tidepool | living liquid surface · floating luminous disks · atmospheric scale |
| 16 | 7 | Coral Computation | radial growing colony · branch renewal · luminous transport |
| 17 | 7 | Inverse Monsoon | upward rain · particulate thermals · luminous velocity traces |
| 18 | 7 | Stigmergy River | chemotactic agents · pheromone diffusion · emergent living channels |
| 19 | 7 | Xenoflora Spires | curling leaf towers · living whorls · seed chambers |
| 20 | 7 | Zoetrope of Petals | asymmetric orchid · translucent membranes · breathing folds |
| 21 | 7 | Cathedral of Soft Laws | elastic vaults · changing metric · impossible interior |
| 22 | 7 | Pelagic Constellations | steering lantern creatures · articulated bodies · underwater procession |
| 23 | 7 | Polyhedral Molt | faceted cell division · sphere-to-octahedron morph · drifting plates |
| 24 | 7 | Differential Reef | cellular division · local repulsion · bounded colony growth |
| 25 | 7 | Celestial Bronchi | branching respiratory space · radial alveoli · pulsing capillaries |
| 26 | 7 | Ribbon Ecology | interwoven ribbon animals · moving dorsal fins · spectral anatomy |
| 27 | 7 | Lensing Lanterns | nested ellipsoidal volumes · suspended light · atmospheric overlap |
| 28 | 7 | Floating Cartographies | shifting triangular continents · luminous boundaries · topographic parallax |
| 29 | 7 | Plasma Root Delta | branching drainage · advected light · river-like glow |
| 30 | 7 | Lantern Migration | windborne seed lanterns · suspended pollen · twilight layers |
| 31 | 7 | Chiral Sanctuary | opposed handedness · linked helicoids · sculptural phase exchange |
| 32 | 7 | Dust of Other Physics | counter-rotating attractors · velocity trails · curved stellar drift |
| 33 | 7 | Petrichor on Titan | wet basalt · slow terrain drift · reflected alien twilight |
| 34 | 7 | Amphibious Architecture | umbrella habitats · curved roofs · suspended foundations |
| 35 | 7 | Phosphor Intelligence | ridged luminous volume · cellular currents · coherent density drift |
| 36 | 7 | Moonlit Ink | flowing brush organisms · mineral paper · articulated ink tendrils |
| 37 | 7 | Crystal Nervure | veined mineral growth · variable lattice · luminescent joints |
| 38 | 7 | Chromatic Polyp | swaying polyp colony · radial feelers · active cell centres |
| 39 | 7 | Cathedral Under Skin | breathing membrane · internal windows · soft cellular arches |
| 40 | 7 | Xenolithic Mobile | floating mineral nuclei · translucent connecting membranes · drifting facets |
| 41 | 7 | Aurora Lithography | translucent printed planes · volumetric ink · flowing registration |
| 42 | 7 | Silk Caravans | windborne cloth colonies · semi-transparent sails · quiet migration |
| 43 | 7 | Falling Upward | liquid trajectories · reversing gravity · luminous eddies |
| 44 | 7 | Electric Pollination | flower signals · pollen agents · symbiotic motion |
| 45 | 7 | Axial Dreams | helicoidal platforms · ascending camera · changing aperture |
| 46 | 7 | Glass Larvae | segmented transparent anatomy · undulating motion · nested organelles |
| 47 | 7 | Silk Nebula | flowing spectral ribbons · elongated star wisps · deep layered light |
| 48 | 7 | Amoeboid Federation | merging soft cells · translucent boundaries · shared luminous interior |
| 49 | 7 | Luminous Palimpsest | liquid pigment strata · spectral erosion · luminous negative space |
| 50 | 7 | Reverse Waterfall | rising light streams · suspended droplets · opposing currents |
| 51 | 7 | Breath of Obsidian | monochrome interlude · porous black sculpture · radiating seams |
| 52 | 7 | Synaptic Orchard | branching neurons · travelling signals · layered dendrites |
| 53 | 7 | Anemochory | windborne seed chambers · radial membranes · curling stalks |
| 54 | 7 | Rainforest of Silica | three-dimensional branching minerals · suspended canopy · depth ordering |
| 55 | 7 | Crystalline Tectonics | drifting mineral plates · molten light seams · lifted strata |
| 56 | 7 | Blooming Archipelago | floating terraced islands · living crowns · atmospheric layers |
| 57 | 7 | Recursive Raindrop | nested droplets · internal cavities · scale recursion |
| 58 | 7 | Planetary Cilia | living planetoid · surface flow · polar ciliary waves |
| 59 | 7 | Ultraviolet Estuary | flowing tributaries · advected cellular light · liquid branching |
| 60 | 7 | Invertebrate Opera | undulating manta membranes · articulated wings · translucent living sculpture |
| 61 | 7 | Quiet Superorganism | breathing soft volume · slow organelles · auratic silence |
| 62 | 7 | Quiet Terrarium | glass habitat · suspended botanical forms · pale auratic space |
| 63 | 7 | Dream in Negative Space | porous metric · inverse cells · endless interstitial passage |
| 64 | 7 | Ocean of Memory | persistent light currents · gentle trail integration · evolving temporal field |
| 65 | 6 | Vertebrae of Light | flexing axial sculpture · repeated ribs · electric marrow |
| 66 | 6 | Chromofluid Rebellion | nested vector advection · liquid interference · moving pigment |
| 67 | 6 | Tesseract Tempest | four-dimensional rotations · perspective cells · hypercubic procession |
| 68 | 6 | Crown of Tides | lobed membrane · concentric rupture · oscillating silica |
| 69 | 6 | Event Horizon Garden | gravitational lens · accretion filaments · bent starlight |
| 70 | 6 | Enneper Dream | minimal surface · self-intersecting silk · rotating geometry |
| 71 | 6 | Nematode Palace | curling tubes · organic chambers · rotating radial skeleton |
| 72 | 6 | Opal Weatherfront | thin-film interference · converging pressure · spectral ridges |
| 73 | 6 | Stellar Cocoon | nested membranes · polar slits · inner star |
| 74 | 6 | Impossible Aqueduct | warped arcades · tiled stone · unending traversal |
| 75 | 6 | Aurora Labyrinth | volumetric curtains · lateral parallax · charged atmosphere |
| 76 | 6 | Chromatic Dominion | cyclic cellular competition · spiral fronts · living mosaic |
| 77 | 6 | Flame Manuscript | nonlinear iterated functions · accumulated density · spectral flame |
| 78 | 6 | Tectonic Rainbow | folding strata · shaded relief · geological colour flow |
| 79 | 6 | Elastic Constellation | Verlet membrane · wind forces · constraint network |
| 80 | 6 | Hyperbolic Hive | recursive cavities · cellular architecture · slow deformation |
| 81 | 6 | Phase Change | quasicrystal interference · shifting symmetry · moiré depth |
| 82 | 6 | Staircase Paradox | kinetic stepped loops · impossible return · coloured architecture |
| 83 | 6 | Clockwork Eclipse | nested orbital shells · moving apertures · obsidian and gold |
| 84 | 6 | Pressure Bloom | propagating wave packets · caustic ridges · chromatic collision |
| 85 | 6 | Lorenz Silk | chaotic trajectories · evolving attractor · ribbon projection |
| 86 | 6 | Velour Singularity | twisted textile shell · rippling folds · saturated velvet |
| 87 | 6 | Spectral Sandstorm | layered dune flight · analytic heights · impossible horizons |
| 88 | 6 | Amoeba Theatre | soft silhouettes · ciliated membranes · microscopic choreography |
| 89 | 6 | Prism Heart | faceted breathing solid · carved chambers · optical seams |
| 90 | 6 | Ink Between Stars | advected pigment plumes · negative space · luminous edges |
| 91 | 6 | Chromatic Sandpile | driven toppling lattice · avalanche fronts · granular symmetry |
| 92 | 6 | Elsewhere Cathedral | gyroid passage · living topology · iridescent depth |
| 93 | 6 | Impossible Rain | refractive droplets · cellular refraction · falling lenses |
| 94 | 6 | Riemann Cascade | complex logarithm · connected sheets · spectral helicoid |
| 95 | 6 | Recursive Monastery | nested box folds · distance-estimated fractal · immense scale |
| 96 | 6 | Silken Turbulence | anisotropic filaments · nested flow · satin highlights |
| 97 | 6 | Astral Nautilus | logarithmic shell · expanding ribs · iridescent cross-section |
| 98 | 6 | Seraphim Machine | articulated concentric wings · rotating union · pearlescence |
| 99 | 6 | Folded Spectrum | complex-plane tessellation · inversion drift · coloured infinities |
| 100 | 6 | Magnetic Pendulum | driven magnetic dynamics · chaotic trails · moving attractors |
| 101 | 6 | Magnetic Rose | dipole sculpture · polar petals · flowing field lines |
| 102 | 6 | Helium Dream | buoyant volume · thermals · chromatic density |
| 103 | 6 | Helix Promenade | braided helices · paired bridges · molecular scale |
| 104 | 6 | Interstellar Loom | crossed braided beams · camera flight · luminous junctions |
| 105 | 6 | Liquid Stained Glass | moving Voronoi cells · refractive seams · luminous enamel |
| 106 | 6 | Kaleidocycle Engine | inverting tetrahedral ring · faceted linkage · cyclic transformation |
| 107 | 6 | Ribbon Worldtree | branched helices · luminous sap · growing sculpture |
| 108 | 6 | Sunken Contours | bathymetric drift · moving islands · depth-light mapping |
| 109 | 6 | Orbital Debris | faceted asteroid flight · depth projection · distant suns |
| 110 | 6 | Antigravity Quarry | levitating cut blocks · moving seams · mineral interiors |
| 111 | 6 | Infinite Diffraction | curved gratings · spectral orders · moving optical lattice |
| 112 | 6 | Mercury Organism | coalescing metaballs · capillary necks · liquid chrome |
| 113 | 6 | Breathing Archaeology | eroding ceremonial rings · carved steps · pulsing voids |
| 114 | 6 | Neon Protoplasm | cellular thresholds · merging membranes · electrical nuclei |
| 115 | 6 | Peristaltic Transit | contracting passage · moving cross-sections · spectral depth |
| 116 | 6 | Aperture Mountain | perforated peaks · spiralling strata · orbital terrain |
| 117 | 6 | Refracted Memory | anamorphic tiles · chromatic displacement · liquid checkerwork |
| 118 | 6 | Delaunay Drift | triangular canopy · travelling deformation · low-poly light |
| 119 | 6 | Gravity Ballet | softened many-body dynamics · luminous trajectories · mutual orbit |
| 120 | 6 | Chromatic Faultline | sheared domains · melting edges · optical displacement |
| 121 | 6 | Dragon Kites | articulated aerial creatures · wind ribbons · layered flight |
| 122 | 6 | Cosmic Siphon | fluted funnel · endless fall · rotating chamber walls |
| 123 | 6 | Living Hologram | phase-wrapped relief · spectral scan planes · shifting normals |
| 124 | 6 | Lichen Observatory | differential growth · elastic boundary · self-avoiding folds |
| 125 | 6 | Corona Assembly | radial mechanisms · variable teeth · nested rotation |
| 126 | 6 | Afterimage Ocean | long-wave refraction · phase currents · changing horizon |
| 127 | 6 | Solar Centipede | segmented locomotion · procedural legs · radiant exoskeleton |
| 128 | 6 | Afterlight Archive | slit-scan accumulation · temporal painting · chromatic histories |
| 129 | 5 | Chromatic Expanse | volumetric flight · incandescent dust · stellar parallax |
| 130 | 5 | Leviathan Gate | monumental distance fields · atmospheric perspective · portal light |
| 131 | 5 | Thousand Suns | orbital light fields · stellar nurseries · radiant depth |
| 132 | 5 | Nebular Migration | 3D spiral arms · luminous star populations · orbital drift |
| 133 | 5 | Jade Maelstrom | submerged spiral · caustic shafts · abyssal scale |
| 134 | 5 | Iridescent Megastructure | repeated city SDF · spectral facades · orbital camera |
| 135 | 5 | Tidal Ribbons | woven sheet waves · depth-sorted strips · satin gradients |
| 136 | 5 | Plasma Anemone | polar-folded sculpture · soft glow · living filaments |
| 137 | 5 | Impossible Ocean | folded wave relief · metallic tides · impossible horizon |
| 138 | 5 | Chromatic Reef | coral branching · polychrome skeletons · underwater drift |
| 139 | 5 | Heliosphere | stellar plasma · limb scattering · chromatic prominences |
| 140 | 5 | Crystal Dunes | faceted terrain · cyan reflections · fractured crests |
| 141 | 5 | Firefly Citadel | spherical habitat · radiant towers · orbital fireflies |
| 142 | 5 | Velvet Vortex | anisotropic folds · logarithmic drapery · luminous dye |
| 143 | 5 | Lanternfish Ocean | layered shoals · translucent fins · bioluminescent wake |
| 144 | 5 | Prismatic Koi | steering shoal · articulated bodies · reflected ripples |
| 145 | 5 | Electric Glacier | traced ice canyon · subsurface seams · polar radiance |
| 146 | 5 | Bubble Cathedral | spherical vaults · spectral shells · deep perspective |
| 147 | 5 | Aerial Archipelago | floating islands · layered silhouettes · atmospheric vastness |
| 148 | 5 | Endless Causeway | infinite steps · floating treads · vanishing light |
| 149 | 5 | Spore Universe | fractal mist · emissive density · cosmic spores |
| 150 | 5 | Infinite Origami | unfolding octahedra · nested solids · crystalline choreography |
| 151 | 5 | Mosaic Mirage | warped tessellation · metallic relief · chromatic phase |
| 152 | 5 | Polar Roses | lobed porcelain · spectral lacquer · orbiting sculpture |
| 153 | 5 | Velvet Mandala | layered petals · spectral ink · slow radial counterpoint |
| 154 | 5 | Solar Sails | ray-plane facets · translucent membranes · celestial rigging |
| 155 | 5 | Liquid Spectrum | domain advection · pigment boundaries · marbled radiance |
| 156 | 5 | Ribbon Torus | woven toroidal surface · depth-sorted facets · chromatic weaving |
| 157 | 5 | Desert of Glass | pyramid field · mirrored facets · alien sunset |
| 158 | 5 | Fire Opal | internal mineral fire · spherical volume · chromatic inclusions |
| 159 | 5 | Bismuth Temple | stepped mineral terraces · isometric spirals · oxide colour |
| 160 | 5 | Laser Aviary | swept light planes · spectral rigging · haze depth |
| 161 | 5 | Painted Cosmos | painted gas veils · additive atmospheres · drifting pigments |
| 162 | 5 | Neon Topology | torus-knot tubes · depth ordering · luminous crossings |
| 163 | 5 | Chromatic Weather | billowing density · polar illumination · vast cloud strata |
| 164 | 5 | Auric Swarm | coupled orbital drift · additive particles · gravity theatre |
| 165 | 5 | Chromatic Rain | perspective light rain · spectral trails · deep falling field |
| 166 | 5 | Golden Abyss | logarithmic architecture · gilded ribs · falling perspective |
| 167 | 5 | Luminous Archways | nested polygon portals · perspective phases · colour procession |
| 168 | 5 | Opaline Petals | translucent bloom · layered bezier membranes · pearlescent light |
| 169 | 5 | Ember Dunes | layered terrain · drifting embers · incandescent twilight |
| 170 | 5 | Spectrum Choreography | 3D phase lattice · chromatic nodes · collective motion |
| 171 | 4 | Glass Meridian | convex optics · internal reflection · spectral dispersion |
| 172 | 4 | Dune Nocturne | height-field tracing · wind combs · blue-hour sand |
| 173 | 4 | Rain on Elsewhere | curved droplets · refracted bokeh · night glass |
| 174 | 4 | Cloisonné Sky | rose-window geometry · enamel cells · transmitted light |
| 175 | 4 | Ribbon Ballet | depth-sorted silk · parametric surfaces · folded light |
| 176 | 4 | Amber Reliquary | ellipsoid volume · suspended filaments · warm extinction |
| 177 | 4 | Folding Atlas | creased sheet · triangular mesh · travelling deformation |
| 178 | 4 | Silicate Reef | silica shells · radial pores · microscopic light |
| 179 | 4 | Chromatic Abacus | Verlet chains · distance constraints · pointer forces |
| 180 | 4 | Peacock Protocol | barb filaments · ocellar eyes · structural colour |
| 181 | 4 | Cyanotype Garden | botanical silhouettes · venation · photographic blue |
| 182 | 4 | Schlieren Atlas | density-gradient optics · thermal plumes · knife-edge light |
| 183 | 4 | Luminous Mycelium | branching growth · tip competition · luminous transport |
| 184 | 4 | Hyperbolic Bloom | Poincaré disk · circle inversions · infinite boundary |
| 185 | 4 | Prism Parade | isometric solids · phased extrusion · candy architecture |
| 186 | 4 | Circuit Dream | etched copper · routed pulses · soldermask relief |
| 187 | 4 | Kinetic Letterpress | invented glyphs · phase-driven typesetting · warm paper |
| 188 | 4 | Polar Porcelain | twisted ceramic · fluted silhouette · studio reflections |
| 189 | 4 | Oculus Automata | elementary cellular automata · spacetime quilting · rule 110 |
| 190 | 4 | Solar Organ | cylindrical light pipes · phase sequencing · radial depth |
| 191 | 3 | Prismatic Monolith | black crystal · spectral seams · sphere tracing |
| 192 | 3 | Orbital Garden | ringed planet · ray intersections · orbital shadows |
| 193 | 3 | Abyssal Medusa | bioluminescent anatomy · translucent filaments |
| 194 | 3 | Cathedral of Echoes | repeated vaults · distance-field architecture |
| 195 | 3 | Tidal Satin | ocean microfacets · rose-gold horizon |
| 196 | 3 | Kintsugi Earth | porcelain plates · gilded voronoi fractures |
| 197 | 3 | Newton Garden | complex dynamics · cubic basins of attraction |
| 198 | 3 | Murmuration | collective motion · local steering · dusk |
| 199 | 3 | Pyrotechnic Bloom | ballistic sparks · gravity · afterglow |
| 200 | 3 | Entropy Loom | woven light · anisotropic thread shading |
| 201 | 3 | Clockwork Orrery | brass gearing · mechanical harmonics · engraved circles |
| 202 | 3 | Polar Vortex | gas giant · spiral advection · cloud relief |
| 203 | 3 | Ink Calligraphy | brush ribbons · paper grain · negative space |
| 204 | 3 | Quasicrystal | aperiodic order · seven interfering lattices |
| 205 | 3 | Paper Lanterns | translucent rice paper · rising emissive forms |
| 206 | 3 | Tensegrity Swarm | icosahedral cages · depth-sorted projection |
| 207 | 3 | Topographic Dream | contour cartography · mineral pigments |
| 208 | 3 | Pendulum Tides | phase drift · pendulum waves · specular beads |
| 209 | 3 | Eclipse Observatory | occultation · polar streamers · diamond ring |
| 210 | 3 | Lenticular Orchard | optical ribs · interference lacquer · grazing light |
| 211 | 2 | Living Coral | gray–scott · reaction diffusion |
| 212 | 2 | Menger Cathedral | recursive solids · infinite subdivision |
| 213 | 2 | Caustic Abyss | underwater optics · bioluminescence |
| 214 | 2 | Indra's Pearls | circle inversion · kleinian group |
| 215 | 2 | Crystal Prison | refraction · chromatic dispersion |
| 216 | 2 | Infinite Regress | video feedback · self-similar optics |
| 217 | 2 | Cloudsea | volumetric scattering · flight |
| 218 | 2 | Phyllotaxis | golden angle · 137.5 degrees |
| 219 | 2 | Liquid Crystal | birefringence · crossed polarisers |
| 220 | 2 | Ferrofluid | magnetic potential · iron filings |
| 221 | 2 | Coronal Loops | solar magnetism · trapped plasma |
| 222 | 2 | Chladni Resonance | eigenmodes · singing plate |
| 223 | 2 | Diffraction Array | fraunhofer interference · phased emitters |
| 224 | 2 | Frost Dendrite | hexagonal symmetry · crystal growth |
| 225 | 2 | Harmonograph | three pendulums · long exposure |
| 226 | 2 | Fourier Epicycles | discrete transform · drawing with circles |
| 227 | 2 | Möbius Bloom | non-orientable surface · projection |
| 228 | 2 | Fractal Canopy | recursive growth · wind |
| 229 | 2 | Truchet Loops | stochastic tiling · travelling light |
| 230 | 2 | Sandfall | cellular automaton · granular physics |
| 231 | 2 | Ripple Tank | wave superposition · interference |
| 232 | 2 | Spirograph | hypotrochoid · rolling circles |
| 233 | 1 | Singular Bloom | volumetric nebula · gravitational lens |
| 234 | 1 | Chroma Flux | navier–stokes · live gpu fluid |
| 235 | 1 | Event Horizon | schwarzschild geodesics · accretion disk |
| 236 | 1 | Hyperspace | warp tunnel · chromatic aberration |
| 237 | 1 | Aurora Cathedral | volumetric curtains · ice water |
| 238 | 1 | Silk Currents | 65k gpu particles · curl noise · feedback |
| 239 | 1 | Liquid Chrome | metaballs · thin-film dispersion |
| 240 | 1 | Mandelbulb Infinite | power-8 fractal · orbit-trap colour |
| 241 | 1 | Strange Attractor | aizawa system · 60k points |
| 242 | 1 | Iridescence | gyroid lattice · thin-film interference |
| 243 | 1 | Supernova | shock front · lensed starfield |
| 244 | 1 | Hypnotic Moiré | op-art interference · do not stare too long |
| 245 | 1 | Infinite Frontier | procedural range · still water |
| 246 | 1 | Electric Storm | fractal lightning · wet city light |
| 247 | 1 | Quantum Foam | worley cells · soap-film interference |
| 248 | 1 | Cosmic Web | filamentary structure · depth parallax |
| 249 | 1 | Stained Cosmos | kaleidoscopic voronoi · leaded glass |
| 250 | 1 | Neon Horizon | retrowave grid · dying sun |
| 251 | 1 | Ink Bloom | metaball diffusion · gold on black |
| 252 | 1 | Silken Plasma | domain-warped fractal noise |
| 253 | 1 | Firefly Deep | bokeh depth of field · warm dusk |
| 254 | 1 | Digital Rain | glyph cascade · depth & bleed |
| 255 | 1 | Particle Morph | shape interpolation · your name in points |
| 256 | 1 | Silk Drape | layered gradient cloth · specular sheen |

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
