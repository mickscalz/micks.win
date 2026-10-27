# micks.win

**A Cabinet of Infinite Rooms** — 320 live-rendered worlds across eight collections.
Collection VIII, **The Unwritten Biosphere**, adds 64 worlds while preserving all 256 earlier ones.

No entry gate, videos, application dependencies or build step. **182 single-pass
WebGL2 worlds, four stateful GPU systems and 134 Canvas worlds** share one stage.

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

## New: lineage nursery & music laboratory

Open **breed · nursery** to recombine **2–32 parent genomes**, audition/name twins,
inspect provenance and save offspring with ancestry. All 320 sources have labelled
**habitat-v2 module adapters**, not exact clones of their original renderers. Twelve
GPU geometry grammars couple to a finite colony; legacy eco-v1 IDs and Canvas
recipes remain compatible. The authored catalogue itself is unchanged.

An opt-in **bounded automatic nursery** searches up to 20 generations / 96 genomes /
60 seconds and retains up to 24 diverse candidates, with Stop and transparent
heuristic scores—not a learned beauty judge. Saves include available unsaved
ancestors within the 100-record library cap. Storage is session-only unless you
explicitly enable IndexedDB; numeric JSON import/export is bounded to 2 MiB / 512
records including source ancestry.

In **tune · audio → Music laboratory**, edit four bounded global/per-world routes.
Optional local look-ahead adds spectral/chroma/energy timelines, change candidates
and manual timing corrections. PCM16/float32 WAV uses a worker (32 MiB / 10 minutes).
Browser-supported MP3/AAC/M4A/FLAC/Ogg/WebM can use native decode (32 MiB / 3 minutes,
16 kHz mono/stereo output). Codec availability varies; native decode can allocate
extra memory and cannot be aborted in flight—Stop discards stale results and another
native decode cannot overlap. No uploads/model downloads/audio persistence.

See [usage, limits, storage semantics and verification](docs/NURSERY-AND-MUSIC-LAB.md).
Arbitrary source-code genetics, runtime checkpoints, overnight jobs, streaming
all-codec guarantees and learned musical understanding are **not** shipped.
[The roadmap](docs/EVOLUTION-ROADMAP.md) distinguishes these from delivered tools.

## Collection VIII — The Unwritten Biosphere

**32 new shader fields + 32 new drawn systems.** The opening world is a luminous
living crown over a dark light estuary. New constructions range from orchid
volumes, symbiotic membranes, navigable cellular palaces and migrating glass
moths to chemical tidepools, inherited flowering canopies, pigment organisms,
nonlinear ancestral embers, mineral weather and architectural colony fields.

The drawn ecology engine has a finite nutrient field, energy budgets, two-parent
gene crossover, bounded mutation, reproduction, aging/renewal and local memory.
Specialised systems add actual reaction–diffusion, attractor integration and
persistent pigment buffers. Shader fields use smooth seeded parameter changes;
they are **not** the same individual-agent solver. Only active worlds advance.
These are procedural rules, not sentience, trained intelligence, a biological
model or an objective measure of beauty. The panel names the mechanism and
shows live population, birth/renewal and generation counters for agent ecologies.

New controls: **growth/reproduction, genetic variation, ecological coupling,
lifecycle pace, atmospheric depth, order/asymmetry, camera/habitat drift and light
persistence**. Each grammar interprets applicable traits differently. The shared
motion, colour strength, brightness, quality and travel controls still apply to
older constructions. Populations, trail lengths, chemistry grids and render
budgets stay finite; “endless evolution” means continued variation within those
limits, not unbounded memory or complexity.

### Configurable time and 24 passages

The default world interval is **36 seconds** (configurable **5–600s**, including
arrival), with a **5-second transition** (configurable **0–30s**). Transition length
is capped at 80% of the world interval. **0** disables transitions. Interval edits
apply immediately; duration/style edits apply to the next passage. An active
passage is cancelled immediately if transition length is set to zero. Linger is
still indefinite; freezing also freezes an in-progress transition. Navigating
while frozen reveals the destination immediately rather than trapping an old
snapshot over it.

Choose **Organic, Tidal or Linear easing**, transition refraction strength, a
specific style or non-immediately-repeating curated shuffle. Try the selected
passage using the panel's **Try passage to next world** button.

| Passage | Drawing/transport grammar |
| --- | --- |
| Velvet dissolve | Convex, unwarped temporal blend |
| Mycelial passage | Branching organic-noise front |
| Liquid tide | Undulating vertical flood and liquid displacement |
| Breathing iris | Soft radial opening with opposing depth motion |
| Nebular diffusion | Multiscale cloud density exchange |
| Silken crossing | Sinuous horizontal wavefront |
| Petal unfurling | Seven-lobed growing aperture |
| Prismatic refraction | Offset crystalline cell facets |
| Contour inundation | Intersecting contour fields |
| Cellular succession | Staggered cell-by-cell colonisation |
| Spiral migration | Angular spiral transfer and counterrotation |
| Auroral veil | Curving auroral curtains |
| Root-light invasion | Braided root-like threshold field |
| Dune transference | Dune-ridge flood and lateral drift |
| Orbital eclipse | Off-centre moving occultation |
| Origami continuum | Triangular folded reveal |
| Reverse rain | Uneven rising column fronts |
| Lenticular overlap | Lens-striped lateral displacement |
| Ribbon interweave | Opposing alternating strip journeys |
| Capillary ripples | Concentric rippling transfer |
| Constellation ignition | Seeded distributed stellar apertures |
| Membrane exchange | Smooth fluid-cell membrane warp |
| Horizon folding | Two horizons opening away from a central fold |
| Ink capillarity | Fine branching pigment invasion |

The compositor carries a **snapshot of the outgoing world** into the **live
incoming world**; it does not run two simulations or breed them. Repeated manual
navigation captures the current composite for continuity. It uses a separate,
bounded-resolution WebGL2 pass, with an ordinary dissolve fallback if unavailable
or lost. Reduced motion / Calm forces a plain dissolve regardless of the saved
style. Distortion is bounded, colour mixing is convex and there are no additive
white flashes; this is not a medical/photosensitivity guarantee.

### Breeding and deeper musical analysis

The [delivery notes](docs/NURSERY-AND-MUSIC-LAB.md) cover typed 2–32-parent
compositions, coupled GPU habitats, a local offspring library and ancestry, bounded
automatic diversity search, editable audio routes and browser-codec look-ahead.
[The roadmap](docs/EVOLUTION-ROADMAP.md) covers the remaining design programme.

**Still future:** arbitrary cross-renderer source genetics, runtime checkpoints,
autonomous overnight jobs, constant-memory streaming decode, full musical structure
and learned emotional understanding. Source adapters are not exact recombinations
of original painters or solvers. Heuristic search cannot guarantee beauty.

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

- **Manual:** stay until you navigate. **Guided** (default): ranked travel (36s default; configurable).
- **Adaptive:** recent-world/family/palette/motion-type avoidance, explicit session likes/skips and a
  slow visual arc influence world selection. Available audio energy/onset density
  also influence target intensity; this is a rules-based conductor, not a trained model.
- **Autonomous:** adaptive selection plus gradual density/intensity variation
  through development, peaks and breathing room. The panel explains changes.
- Core controls: **novelty, intensity, motion, detail, brightness, color range,
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

Attack (0.02–1s), release (0.1–6s) and sensitivity are now editable. Energy and
band envelopes use separate attack/release rates on the audio clock. In the new
living systems, bounded routes map bass to growth pressure, mids to coupling,
sustained energy to haze and highs to light persistence; zero reactivity bypasses
them. Manual values remain the base. A quiet
sustain need not become hard frame-by-frame flashing. This is an incremental
expressive improvement, **not** harmonic, emotional or section analysis.

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
- Arrow keys travel; **G** opens the gallery. Type a rank (1–320) or use its jump box.
- **Space** freezes the scene. **L / ∞ Linger** keeps this world moving past the
  travel timer; leaving Linger starts a full dwell without rewinding the artwork.
- **H** enters immersion, with a keyboard/touch return control; Escape exits.
- The filmstrip and gallery use actual rendered WebP thumbnails, with a readable
  fallback if an image fails. Latest collection, WebGL, GPU-system and Canvas
  filters share the same catalogue.

## Architecture

- `index.html`, `assets/css/style.css`: direct-entry stage, transport, gallery,
  accessibility and optional conductor panel.
- `assets/js/designs/collection-viii*.js`: the 64 new constructions and bounded
  ecology engine; older files preserve Collections I–VII.
- `assets/js/transitions.js`: 24 masked/warped passages and a safe dissolve fallback.
- `assets/js/nursery*.js`, `habitat.js`: versioned recipes, GPU/Canvas phenotypes, bounded diversity search, library and ancestry.
- `assets/js/music-lab.js`, `music-analysis.js`, `audio-decode.js`: route profiles, bounded browser-native decode and local PCM analysis worker.
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
# Nursery/music integration only:
npm run test:labs
```

Unit tests cover the complete registry, assets/order, independent new shader
sources, consent/sanitization/reset, selection, accessibility, quality bounds,
synthetic band/onset/tempo/stereo analysis, audio-clock independence, permission
denial and cancellation of pending streams.

The browser suite compiles and draws **all 320 worlds using real WebGL2**. It
checks nonblank Collection V–VIII frames, temporal change in all 192 VI/VII/VIII worlds,
held-state stability in their 86 Canvas constructions, nonblank deferred quality
resizes, navigation, filters,
collection boundaries, wraparound, idle/wake, immersion, real thumbnails and
mobile layout under a GitHub project-Pages subpath. The experience suite tests
all four modes/eight sliders, consent across reloads, saved recall, modal focus,
quality, calm/contrast and narrow-screen bounds. It decodes an actual generated
stereo WAV through the browser's real Web Audio graph, checks analysis and stop,
and checks microphone denial via a controlled permission mock. The transition suite
renders all 24 unique midpoint images and verifies orientation, endpoints, frozen
redraws, interruptions, reduced-motion clamping, context-loss fallback, timing,
new sliders and narrow-phone bounds. Ecology units verify seed determinism,
reproduction, parental references, finite populations/genes and held-state purity.
New Canvas checks advance two seconds of real simulation before comparing rendered
endpoints; intermediate painting is skipped except when it is part of pigment or
field memory. Unit stream mocks
cover teardown races; physical microphone hardware is not part of CI.

Set `CHROMIUM_PATH` to use an existing Chromium executable. CI runs the unit and
browser suites for pull requests and pushes to main, using installed Chrome or
Playwright Chromium. Deterministic animation tests are not FPS benchmarks.

### Refresh gallery stills

With a static server running, use `npm run previews`. It writes actual 480×300
WebP captures to `assets/previews/`. `PREVIEW_IDS=unwritten-biosphere npm run previews`
rebuilds one scene; `SITE_URL` selects a different server. Stateful Canvas rooms
can specify `previewFrames` for warm-up. The full-screen scene remains live.

## Catalogue

| Rank | Collection | World | Construction |
| ---: | ---: | --- | --- |
| 1 | 8 | The Unwritten Biosphere | living crown · reproductive satellites · folded habitat · light estuary |
| 2 | 8 | Eden of Divergence | genetic canopy · fertile blooms · nutrient weather |
| 3 | 8 | Orchid Engine | fertile petal volumes · asymmetrical flowering · spiral nectar |
| 4 | 8 | Abyssal Communion | colonial bells · sympathetic filaments · deep currents |
| 5 | 8 | Pearl Symbiont | mutually orbiting membranes · porous organelles · coupling |
| 6 | 8 | Glass Moth Migration | folded wing flock · inherited anatomy · parallax migration |
| 7 | 8 | Infinite Pollen Palace | growing cellular vaults · navigable pores · golden suspension |
| 8 | 8 | Cytokinesis Ballet | dividing cellular membranes · organelles · local inheritance |
| 9 | 8 | Planktonic Aurora | luminous colonial volume · curved stellar convection · soft filaments |
| 10 | 8 | Chromatic Myxomycete | chemotactic light trails · nutrient competition · colony memory |
| 11 | 8 | Ceramic Metamorph | hollow ceramic tissue · mineral growth · changing cutaway |
| 12 | 8 | Superorganism Canals | soft spring bridges · colony nodes · light transport |
| 13 | 8 | Suspended Rhizosphere | root bridges · recursive tissue · hanging island gravity |
| 14 | 8 | Octopod Kindergarten | tentacled young · soft muscular pulses · coordinated drift |
| 15 | 8 | Estuary of Two Suns | grazing liquid dunes · twin luminous horizons · mineral shore |
| 16 | 8 | Germinating Continents | living height field · resource bloom · emergent coastlines |
| 17 | 8 | Neural Nautilus | logarithmic chamber organism · rotating nursery · nested shells |
| 18 | 8 | Glass Polyp City | spatial coral terraces · crystalline colony · inherited facets |
| 19 | 8 | Chromatophore Weather | pigment organisms · fluid camouflage · iridescent field exchange |
| 20 | 8 | Symbiotic Lanterns | floating light vessels · slender roots · sympathetic respiration |
| 21 | 8 | Atlas of Soft Machines | pliant moving arches · slow metric distortion · living corridors |
| 22 | 8 | Reproductive Interferometer | communicating wave colonies · nested phase fronts · reproduction signals |
| 23 | 8 | Cryogenic Chrysalis | faceted cocoon · folded inner tissue · frost veins |
| 24 | 8 | Warm Machine Moss | jointed soft machines · slow constraints · inherited chain lengths |
| 25 | 8 | Rivers Without Banks | braided luminous waterways · continuous splitting · depth haze |
| 26 | 8 | Chimeric River | ribbon animals · articulated gills · meandering nursery |
| 27 | 8 | Murmuration Vault | articulated feather lattice · orbiting joint architecture · phase coordination |
| 28 | 8 | Fertile Nebular Dust | stellar attractor nurseries · curved particle streams · shared gravity |
| 29 | 8 | Mirrorgrove | infinite reflective stems · drifting canopy seeds · bent horizon |
| 30 | 8 | Dendritic Negotiations | negotiated branch space · inherited angles · flexible coral graph |
| 31 | 8 | Geode Heartbeat | breathing mineral cavity · inner crystal buds · lumen veins |
| 32 | 8 | Garden of Inverted Rain | buoyant rain spores · inverted seed fountains · opposing gravity |
| 33 | 8 | Unfurling Photosphere | radiant membranous star · filament convection · corona breathing |
| 34 | 8 | Symphony of Diatoms | silicate micro-shells · radial cellular anatomy · intergenerational variation |
| 35 | 8 | Amoebic Observatory | soft cellular dome · orbiting nuclei · permeable skin |
| 36 | 8 | Binary Tidepool | reaction–diffusion ecology · dividing spots · chemical coastlines |
| 37 | 8 | Silica Wing Sanctuary | bilateral wing organism · iridescent ribs · articulated sail |
| 38 | 8 | Feathers of Impossible Birds | articulated feather fans · structural colour · slow quill rotation |
| 39 | 8 | Gravity Pigment | levitating ink pools · nested density contours · organic confluence |
| 40 | 8 | Colonial Clocksea | coupled oscillatory colonies · orbit exchange · polyrhythmic motion |
| 41 | 8 | Tessellated Incubator | rotating nursery cells · folded panel opening · inner seeds |
| 42 | 8 | Tessera Organisms | living tessellated membrane · spatial morphogenesis · inherited topology |
| 43 | 8 | Rain of Living Stones | slow levitating strata · weathered mineral life · gravity reversals |
| 44 | 8 | Darklight Pollinators | pollinator exchanges · nectar nodes · two-parent inheritance |
| 45 | 8 | Spectrum Fungal Dream | branching light paths · spore halos · subterranean interference |
| 46 | 8 | Luminous Termite City | stigmergic towers · luminous voxel strata · cooperative build fields |
| 47 | 8 | Manta of the Void | sinuous ray anatomy · gill pulses · suspended photophores |
| 48 | 8 | Chromosome Archipelago | folded hereditary ribbons · island loops · luminous double helices |
| 49 | 8 | Folded Bioluminal Sea | rising liquid chambers · impossible wave volumes · soft gold edges |
| 50 | 8 | Noctilucent Kelp | flexible light blades · rising nutrient current · bioluminal tissue |
| 51 | 8 | Antlered Light | branch antlers · slow axis migration · luminal sap |
| 52 | 8 | Microbial Calligraphy | living ink paths · inherited curvature · paper memory |
| 53 | 8 | Opalescent Synapse | diffusing neural ribbons · transient nodes · membrane communication |
| 54 | 8 | Sporangia of Memory | hanging spore heads · seed ancestry · auratic microscopy |
| 55 | 8 | Coral Geodesic | spherical living scaffold · phase-grown bridges · negative space |
| 56 | 8 | Prismatic Mantle | pliant honeycomb skin · phase-coupled crest · depth-ordered plates |
| 57 | 8 | Seed of Another Ocean | folded water seed · nested inner horizon · iridescent rind |
| 58 | 8 | Cosmic Cell Gardens | nested orbital cell systems · slow precession · mutual illumination |
| 59 | 8 | Lenticular Monsoon | chromatic atmospheric sheets · oblique rain · fluid parallax |
| 60 | 8 | Cloud Reef | luminous mist organisms · collective convection · soft radiance |
| 61 | 8 | Quiet Xenolith | minimal mineral levitation · living aperture · negative space |
| 62 | 8 | Vernal Negative | ink botanical memory · branching negative space · quiet seasonal growth |
| 63 | 8 | Unborn Constellation | embryonic star chambers · orbit exchange · diffuse nursery light |
| 64 | 8 | Ancestral Embers | nonlinear ancestral trajectories · persistent firelight · phase-space ecology |
| 65 | 7 | The Living Elsewhere | fractal architecture · liquid-light river · organic lattice · floating shards |
| 66 | 7 | Lumen Garden | branching luminous flora · layered blooms · nocturnal parallax |
| 67 | 7 | Mycelial Worldship | branching hull · living capillaries · asymmetric morphogenesis |
| 68 | 7 | Siphonophore Procession | colonial organisms · articulated bells · trailing light tendrils |
| 69 | 7 | Glass Amoeba | refractive membrane · moving organelles · nested density |
| 70 | 7 | Chromatic Tecton | floating hexagonal plates · slow deformation · displaced continental cells |
| 71 | 7 | City of Nervous Stars | levitating towers · neural windows · luminous ground currents |
| 72 | 7 | Night of Nine Moons | occluding planets · auratic atmospheres · orbital shadows |
| 73 | 7 | Cocoon Galaxy | helical stellar filaments · expanding nursery · parallax |
| 74 | 7 | Mandible of Dawn | articulated exoskeleton · luminous limbs · curling anatomy |
| 75 | 7 | Recursive Mangrove | inverted roots · recursive fork field · tidal atmosphere |
| 76 | 7 | Jelly Forest | giant translucent bells · living filaments · deep-water haze |
| 77 | 7 | Prism Leviathan | swimming crystalline anatomy · articulated fins · bioluminescence |
| 78 | 7 | Aerial Root City | floating settlements · hanging roots · interconnecting light bridges |
| 79 | 7 | Liminal Tidepool | living liquid surface · floating luminous disks · atmospheric scale |
| 80 | 7 | Coral Computation | radial growing colony · branch renewal · luminous transport |
| 81 | 7 | Inverse Monsoon | upward rain · particulate thermals · luminous velocity traces |
| 82 | 7 | Stigmergy River | chemotactic agents · pheromone diffusion · emergent living channels |
| 83 | 7 | Xenoflora Spires | curling leaf towers · living whorls · seed chambers |
| 84 | 7 | Zoetrope of Petals | asymmetric orchid · translucent membranes · breathing folds |
| 85 | 7 | Cathedral of Soft Laws | elastic vaults · changing metric · impossible interior |
| 86 | 7 | Pelagic Constellations | steering lantern creatures · articulated bodies · underwater procession |
| 87 | 7 | Polyhedral Molt | faceted cell division · sphere-to-octahedron morph · drifting plates |
| 88 | 7 | Differential Reef | cellular division · local repulsion · bounded colony growth |
| 89 | 7 | Celestial Bronchi | branching respiratory space · radial alveoli · pulsing capillaries |
| 90 | 7 | Ribbon Ecology | interwoven ribbon animals · moving dorsal fins · spectral anatomy |
| 91 | 7 | Lensing Lanterns | nested ellipsoidal volumes · suspended light · atmospheric overlap |
| 92 | 7 | Floating Cartographies | shifting triangular continents · luminous boundaries · topographic parallax |
| 93 | 7 | Plasma Root Delta | branching drainage · advected light · river-like glow |
| 94 | 7 | Lantern Migration | windborne seed lanterns · suspended pollen · twilight layers |
| 95 | 7 | Chiral Sanctuary | opposed handedness · linked helicoids · sculptural phase exchange |
| 96 | 7 | Dust of Other Physics | counter-rotating attractors · velocity trails · curved stellar drift |
| 97 | 7 | Petrichor on Titan | wet basalt · slow terrain drift · reflected alien twilight |
| 98 | 7 | Amphibious Architecture | umbrella habitats · curved roofs · suspended foundations |
| 99 | 7 | Phosphor Intelligence | ridged luminous volume · cellular currents · coherent density drift |
| 100 | 7 | Moonlit Ink | flowing brush organisms · mineral paper · articulated ink tendrils |
| 101 | 7 | Crystal Nervure | veined mineral growth · variable lattice · luminescent joints |
| 102 | 7 | Chromatic Polyp | swaying polyp colony · radial feelers · active cell centres |
| 103 | 7 | Cathedral Under Skin | breathing membrane · internal windows · soft cellular arches |
| 104 | 7 | Xenolithic Mobile | floating mineral nuclei · translucent connecting membranes · drifting facets |
| 105 | 7 | Aurora Lithography | translucent printed planes · volumetric ink · flowing registration |
| 106 | 7 | Silk Caravans | windborne cloth colonies · semi-transparent sails · quiet migration |
| 107 | 7 | Falling Upward | liquid trajectories · reversing gravity · luminous eddies |
| 108 | 7 | Electric Pollination | flower signals · pollen agents · symbiotic motion |
| 109 | 7 | Axial Dreams | helicoidal platforms · ascending camera · changing aperture |
| 110 | 7 | Glass Larvae | segmented transparent anatomy · undulating motion · nested organelles |
| 111 | 7 | Silk Nebula | flowing spectral ribbons · elongated star wisps · deep layered light |
| 112 | 7 | Amoeboid Federation | merging soft cells · translucent boundaries · shared luminous interior |
| 113 | 7 | Luminous Palimpsest | liquid pigment strata · spectral erosion · luminous negative space |
| 114 | 7 | Reverse Waterfall | rising light streams · suspended droplets · opposing currents |
| 115 | 7 | Breath of Obsidian | monochrome interlude · porous black sculpture · radiating seams |
| 116 | 7 | Synaptic Orchard | branching neurons · travelling signals · layered dendrites |
| 117 | 7 | Anemochory | windborne seed chambers · radial membranes · curling stalks |
| 118 | 7 | Rainforest of Silica | three-dimensional branching minerals · suspended canopy · depth ordering |
| 119 | 7 | Crystalline Tectonics | drifting mineral plates · molten light seams · lifted strata |
| 120 | 7 | Blooming Archipelago | floating terraced islands · living crowns · atmospheric layers |
| 121 | 7 | Recursive Raindrop | nested droplets · internal cavities · scale recursion |
| 122 | 7 | Planetary Cilia | living planetoid · surface flow · polar ciliary waves |
| 123 | 7 | Ultraviolet Estuary | flowing tributaries · advected cellular light · liquid branching |
| 124 | 7 | Invertebrate Opera | undulating manta membranes · articulated wings · translucent living sculpture |
| 125 | 7 | Quiet Superorganism | breathing soft volume · slow organelles · auratic silence |
| 126 | 7 | Quiet Terrarium | glass habitat · suspended botanical forms · pale auratic space |
| 127 | 7 | Dream in Negative Space | porous metric · inverse cells · endless interstitial passage |
| 128 | 7 | Ocean of Memory | persistent light currents · gentle trail integration · evolving temporal field |
| 129 | 6 | Vertebrae of Light | flexing axial sculpture · repeated ribs · electric marrow |
| 130 | 6 | Chromofluid Rebellion | nested vector advection · liquid interference · moving pigment |
| 131 | 6 | Tesseract Tempest | four-dimensional rotations · perspective cells · hypercubic procession |
| 132 | 6 | Crown of Tides | lobed membrane · concentric rupture · oscillating silica |
| 133 | 6 | Event Horizon Garden | gravitational lens · accretion filaments · bent starlight |
| 134 | 6 | Enneper Dream | minimal surface · self-intersecting silk · rotating geometry |
| 135 | 6 | Nematode Palace | curling tubes · organic chambers · rotating radial skeleton |
| 136 | 6 | Opal Weatherfront | thin-film interference · converging pressure · spectral ridges |
| 137 | 6 | Stellar Cocoon | nested membranes · polar slits · inner star |
| 138 | 6 | Impossible Aqueduct | warped arcades · tiled stone · unending traversal |
| 139 | 6 | Aurora Labyrinth | volumetric curtains · lateral parallax · charged atmosphere |
| 140 | 6 | Chromatic Dominion | cyclic cellular competition · spiral fronts · living mosaic |
| 141 | 6 | Flame Manuscript | nonlinear iterated functions · accumulated density · spectral flame |
| 142 | 6 | Tectonic Rainbow | folding strata · shaded relief · geological colour flow |
| 143 | 6 | Elastic Constellation | Verlet membrane · wind forces · constraint network |
| 144 | 6 | Hyperbolic Hive | recursive cavities · cellular architecture · slow deformation |
| 145 | 6 | Phase Change | quasicrystal interference · shifting symmetry · moiré depth |
| 146 | 6 | Staircase Paradox | kinetic stepped loops · impossible return · coloured architecture |
| 147 | 6 | Clockwork Eclipse | nested orbital shells · moving apertures · obsidian and gold |
| 148 | 6 | Pressure Bloom | propagating wave packets · caustic ridges · chromatic collision |
| 149 | 6 | Lorenz Silk | chaotic trajectories · evolving attractor · ribbon projection |
| 150 | 6 | Velour Singularity | twisted textile shell · rippling folds · saturated velvet |
| 151 | 6 | Spectral Sandstorm | layered dune flight · analytic heights · impossible horizons |
| 152 | 6 | Amoeba Theatre | soft silhouettes · ciliated membranes · microscopic choreography |
| 153 | 6 | Prism Heart | faceted breathing solid · carved chambers · optical seams |
| 154 | 6 | Ink Between Stars | advected pigment plumes · negative space · luminous edges |
| 155 | 6 | Chromatic Sandpile | driven toppling lattice · avalanche fronts · granular symmetry |
| 156 | 6 | Elsewhere Cathedral | gyroid passage · living topology · iridescent depth |
| 157 | 6 | Impossible Rain | refractive droplets · cellular refraction · falling lenses |
| 158 | 6 | Riemann Cascade | complex logarithm · connected sheets · spectral helicoid |
| 159 | 6 | Recursive Monastery | nested box folds · distance-estimated fractal · immense scale |
| 160 | 6 | Silken Turbulence | anisotropic filaments · nested flow · satin highlights |
| 161 | 6 | Astral Nautilus | logarithmic shell · expanding ribs · iridescent cross-section |
| 162 | 6 | Seraphim Machine | articulated concentric wings · rotating union · pearlescence |
| 163 | 6 | Folded Spectrum | complex-plane tessellation · inversion drift · coloured infinities |
| 164 | 6 | Magnetic Pendulum | driven magnetic dynamics · chaotic trails · moving attractors |
| 165 | 6 | Magnetic Rose | dipole sculpture · polar petals · flowing field lines |
| 166 | 6 | Helium Dream | buoyant volume · thermals · chromatic density |
| 167 | 6 | Helix Promenade | braided helices · paired bridges · molecular scale |
| 168 | 6 | Interstellar Loom | crossed braided beams · camera flight · luminous junctions |
| 169 | 6 | Liquid Stained Glass | moving Voronoi cells · refractive seams · luminous enamel |
| 170 | 6 | Kaleidocycle Engine | inverting tetrahedral ring · faceted linkage · cyclic transformation |
| 171 | 6 | Ribbon Worldtree | branched helices · luminous sap · growing sculpture |
| 172 | 6 | Sunken Contours | bathymetric drift · moving islands · depth-light mapping |
| 173 | 6 | Orbital Debris | faceted asteroid flight · depth projection · distant suns |
| 174 | 6 | Antigravity Quarry | levitating cut blocks · moving seams · mineral interiors |
| 175 | 6 | Infinite Diffraction | curved gratings · spectral orders · moving optical lattice |
| 176 | 6 | Mercury Organism | coalescing metaballs · capillary necks · liquid chrome |
| 177 | 6 | Breathing Archaeology | eroding ceremonial rings · carved steps · pulsing voids |
| 178 | 6 | Neon Protoplasm | cellular thresholds · merging membranes · electrical nuclei |
| 179 | 6 | Peristaltic Transit | contracting passage · moving cross-sections · spectral depth |
| 180 | 6 | Aperture Mountain | perforated peaks · spiralling strata · orbital terrain |
| 181 | 6 | Refracted Memory | anamorphic tiles · chromatic displacement · liquid checkerwork |
| 182 | 6 | Delaunay Drift | triangular canopy · travelling deformation · low-poly light |
| 183 | 6 | Gravity Ballet | softened many-body dynamics · luminous trajectories · mutual orbit |
| 184 | 6 | Chromatic Faultline | sheared domains · melting edges · optical displacement |
| 185 | 6 | Dragon Kites | articulated aerial creatures · wind ribbons · layered flight |
| 186 | 6 | Cosmic Siphon | fluted funnel · endless fall · rotating chamber walls |
| 187 | 6 | Living Hologram | phase-wrapped relief · spectral scan planes · shifting normals |
| 188 | 6 | Lichen Observatory | differential growth · elastic boundary · self-avoiding folds |
| 189 | 6 | Corona Assembly | radial mechanisms · variable teeth · nested rotation |
| 190 | 6 | Afterimage Ocean | long-wave refraction · phase currents · changing horizon |
| 191 | 6 | Solar Centipede | segmented locomotion · procedural legs · radiant exoskeleton |
| 192 | 6 | Afterlight Archive | slit-scan accumulation · temporal painting · chromatic histories |
| 193 | 5 | Chromatic Expanse | volumetric flight · incandescent dust · stellar parallax |
| 194 | 5 | Leviathan Gate | monumental distance fields · atmospheric perspective · portal light |
| 195 | 5 | Thousand Suns | orbital light fields · stellar nurseries · radiant depth |
| 196 | 5 | Nebular Migration | 3D spiral arms · luminous star populations · orbital drift |
| 197 | 5 | Jade Maelstrom | submerged spiral · caustic shafts · abyssal scale |
| 198 | 5 | Iridescent Megastructure | repeated city SDF · spectral facades · orbital camera |
| 199 | 5 | Tidal Ribbons | woven sheet waves · depth-sorted strips · satin gradients |
| 200 | 5 | Plasma Anemone | polar-folded sculpture · soft glow · living filaments |
| 201 | 5 | Impossible Ocean | folded wave relief · metallic tides · impossible horizon |
| 202 | 5 | Chromatic Reef | coral branching · polychrome skeletons · underwater drift |
| 203 | 5 | Heliosphere | stellar plasma · limb scattering · chromatic prominences |
| 204 | 5 | Crystal Dunes | faceted terrain · cyan reflections · fractured crests |
| 205 | 5 | Firefly Citadel | spherical habitat · radiant towers · orbital fireflies |
| 206 | 5 | Velvet Vortex | anisotropic folds · logarithmic drapery · luminous dye |
| 207 | 5 | Lanternfish Ocean | layered shoals · translucent fins · bioluminescent wake |
| 208 | 5 | Prismatic Koi | steering shoal · articulated bodies · reflected ripples |
| 209 | 5 | Electric Glacier | traced ice canyon · subsurface seams · polar radiance |
| 210 | 5 | Bubble Cathedral | spherical vaults · spectral shells · deep perspective |
| 211 | 5 | Aerial Archipelago | floating islands · layered silhouettes · atmospheric vastness |
| 212 | 5 | Endless Causeway | infinite steps · floating treads · vanishing light |
| 213 | 5 | Spore Universe | fractal mist · emissive density · cosmic spores |
| 214 | 5 | Infinite Origami | unfolding octahedra · nested solids · crystalline choreography |
| 215 | 5 | Mosaic Mirage | warped tessellation · metallic relief · chromatic phase |
| 216 | 5 | Polar Roses | lobed porcelain · spectral lacquer · orbiting sculpture |
| 217 | 5 | Velvet Mandala | layered petals · spectral ink · slow radial counterpoint |
| 218 | 5 | Solar Sails | ray-plane facets · translucent membranes · celestial rigging |
| 219 | 5 | Liquid Spectrum | domain advection · pigment boundaries · marbled radiance |
| 220 | 5 | Ribbon Torus | woven toroidal surface · depth-sorted facets · chromatic weaving |
| 221 | 5 | Desert of Glass | pyramid field · mirrored facets · alien sunset |
| 222 | 5 | Fire Opal | internal mineral fire · spherical volume · chromatic inclusions |
| 223 | 5 | Bismuth Temple | stepped mineral terraces · isometric spirals · oxide colour |
| 224 | 5 | Laser Aviary | swept light planes · spectral rigging · haze depth |
| 225 | 5 | Painted Cosmos | painted gas veils · additive atmospheres · drifting pigments |
| 226 | 5 | Neon Topology | torus-knot tubes · depth ordering · luminous crossings |
| 227 | 5 | Chromatic Weather | billowing density · polar illumination · vast cloud strata |
| 228 | 5 | Auric Swarm | coupled orbital drift · additive particles · gravity theatre |
| 229 | 5 | Chromatic Rain | perspective light rain · spectral trails · deep falling field |
| 230 | 5 | Golden Abyss | logarithmic architecture · gilded ribs · falling perspective |
| 231 | 5 | Luminous Archways | nested polygon portals · perspective phases · colour procession |
| 232 | 5 | Opaline Petals | translucent bloom · layered bezier membranes · pearlescent light |
| 233 | 5 | Ember Dunes | layered terrain · drifting embers · incandescent twilight |
| 234 | 5 | Spectrum Choreography | 3D phase lattice · chromatic nodes · collective motion |
| 235 | 4 | Glass Meridian | convex optics · internal reflection · spectral dispersion |
| 236 | 4 | Dune Nocturne | height-field tracing · wind combs · blue-hour sand |
| 237 | 4 | Rain on Elsewhere | curved droplets · refracted bokeh · night glass |
| 238 | 4 | Cloisonné Sky | rose-window geometry · enamel cells · transmitted light |
| 239 | 4 | Ribbon Ballet | depth-sorted silk · parametric surfaces · folded light |
| 240 | 4 | Amber Reliquary | ellipsoid volume · suspended filaments · warm extinction |
| 241 | 4 | Folding Atlas | creased sheet · triangular mesh · travelling deformation |
| 242 | 4 | Silicate Reef | silica shells · radial pores · microscopic light |
| 243 | 4 | Chromatic Abacus | Verlet chains · distance constraints · pointer forces |
| 244 | 4 | Peacock Protocol | barb filaments · ocellar eyes · structural colour |
| 245 | 4 | Cyanotype Garden | botanical silhouettes · venation · photographic blue |
| 246 | 4 | Schlieren Atlas | density-gradient optics · thermal plumes · knife-edge light |
| 247 | 4 | Luminous Mycelium | branching growth · tip competition · luminous transport |
| 248 | 4 | Hyperbolic Bloom | Poincaré disk · circle inversions · infinite boundary |
| 249 | 4 | Prism Parade | isometric solids · phased extrusion · candy architecture |
| 250 | 4 | Circuit Dream | etched copper · routed pulses · soldermask relief |
| 251 | 4 | Kinetic Letterpress | invented glyphs · phase-driven typesetting · warm paper |
| 252 | 4 | Polar Porcelain | twisted ceramic · fluted silhouette · studio reflections |
| 253 | 4 | Oculus Automata | elementary cellular automata · spacetime quilting · rule 110 |
| 254 | 4 | Solar Organ | cylindrical light pipes · phase sequencing · radial depth |
| 255 | 3 | Prismatic Monolith | black crystal · spectral seams · sphere tracing |
| 256 | 3 | Orbital Garden | ringed planet · ray intersections · orbital shadows |
| 257 | 3 | Abyssal Medusa | bioluminescent anatomy · translucent filaments |
| 258 | 3 | Cathedral of Echoes | repeated vaults · distance-field architecture |
| 259 | 3 | Tidal Satin | ocean microfacets · rose-gold horizon |
| 260 | 3 | Kintsugi Earth | porcelain plates · gilded voronoi fractures |
| 261 | 3 | Newton Garden | complex dynamics · cubic basins of attraction |
| 262 | 3 | Murmuration | collective motion · local steering · dusk |
| 263 | 3 | Pyrotechnic Bloom | ballistic sparks · gravity · afterglow |
| 264 | 3 | Entropy Loom | woven light · anisotropic thread shading |
| 265 | 3 | Clockwork Orrery | brass gearing · mechanical harmonics · engraved circles |
| 266 | 3 | Polar Vortex | gas giant · spiral advection · cloud relief |
| 267 | 3 | Ink Calligraphy | brush ribbons · paper grain · negative space |
| 268 | 3 | Quasicrystal | aperiodic order · seven interfering lattices |
| 269 | 3 | Paper Lanterns | translucent rice paper · rising emissive forms |
| 270 | 3 | Tensegrity Swarm | icosahedral cages · depth-sorted projection |
| 271 | 3 | Topographic Dream | contour cartography · mineral pigments |
| 272 | 3 | Pendulum Tides | phase drift · pendulum waves · specular beads |
| 273 | 3 | Eclipse Observatory | occultation · polar streamers · diamond ring |
| 274 | 3 | Lenticular Orchard | optical ribs · interference lacquer · grazing light |
| 275 | 2 | Living Coral | gray–scott · reaction diffusion |
| 276 | 2 | Menger Cathedral | recursive solids · infinite subdivision |
| 277 | 2 | Caustic Abyss | underwater optics · bioluminescence |
| 278 | 2 | Indra's Pearls | circle inversion · kleinian group |
| 279 | 2 | Crystal Prison | refraction · chromatic dispersion |
| 280 | 2 | Infinite Regress | video feedback · self-similar optics |
| 281 | 2 | Cloudsea | volumetric scattering · flight |
| 282 | 2 | Phyllotaxis | golden angle · 137.5 degrees |
| 283 | 2 | Liquid Crystal | birefringence · crossed polarisers |
| 284 | 2 | Ferrofluid | magnetic potential · iron filings |
| 285 | 2 | Coronal Loops | solar magnetism · trapped plasma |
| 286 | 2 | Chladni Resonance | eigenmodes · singing plate |
| 287 | 2 | Diffraction Array | fraunhofer interference · phased emitters |
| 288 | 2 | Frost Dendrite | hexagonal symmetry · crystal growth |
| 289 | 2 | Harmonograph | three pendulums · long exposure |
| 290 | 2 | Fourier Epicycles | discrete transform · drawing with circles |
| 291 | 2 | Möbius Bloom | non-orientable surface · projection |
| 292 | 2 | Fractal Canopy | recursive growth · wind |
| 293 | 2 | Truchet Loops | stochastic tiling · travelling light |
| 294 | 2 | Sandfall | cellular automaton · granular physics |
| 295 | 2 | Ripple Tank | wave superposition · interference |
| 296 | 2 | Spirograph | hypotrochoid · rolling circles |
| 297 | 1 | Singular Bloom | volumetric nebula · gravitational lens |
| 298 | 1 | Chroma Flux | navier–stokes · live gpu fluid |
| 299 | 1 | Event Horizon | schwarzschild geodesics · accretion disk |
| 300 | 1 | Hyperspace | warp tunnel · chromatic aberration |
| 301 | 1 | Aurora Cathedral | volumetric curtains · ice water |
| 302 | 1 | Silk Currents | 65k gpu particles · curl noise · feedback |
| 303 | 1 | Liquid Chrome | metaballs · thin-film dispersion |
| 304 | 1 | Mandelbulb Infinite | power-8 fractal · orbit-trap colour |
| 305 | 1 | Strange Attractor | aizawa system · 60k points |
| 306 | 1 | Iridescence | gyroid lattice · thin-film interference |
| 307 | 1 | Supernova | shock front · lensed starfield |
| 308 | 1 | Hypnotic Moiré | op-art interference · do not stare too long |
| 309 | 1 | Infinite Frontier | procedural range · still water |
| 310 | 1 | Electric Storm | fractal lightning · wet city light |
| 311 | 1 | Quantum Foam | worley cells · soap-film interference |
| 312 | 1 | Cosmic Web | filamentary structure · depth parallax |
| 313 | 1 | Stained Cosmos | kaleidoscopic voronoi · leaded glass |
| 314 | 1 | Neon Horizon | retrowave grid · dying sun |
| 315 | 1 | Ink Bloom | metaball diffusion · gold on black |
| 316 | 1 | Silken Plasma | domain-warped fractal noise |
| 317 | 1 | Firefly Deep | bokeh depth of field · warm dusk |
| 318 | 1 | Digital Rain | glyph cascade · depth & bleed |
| 319 | 1 | Particle Morph | shape interpolation · your name in points |
| 320 | 1 | Silk Drape | layered gradient cloth · specular sheen |

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
