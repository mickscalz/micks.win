# micks.win

**A Cabinet of Infinite Rooms** — 344 live-rendered worlds across ten collections.

**Collection X — Immensities:** sixteen new worlds spanning continental terrain,
volumetric cloud/nebula space, underwater optics, ribbon vaults and four distinct
living ecosystems. Continuous seeded development, richer light and colour,
state-preserving resize, spatially evolving atmospheres and 20 exact GPU nursery
kernels. [Constructions, shared improvements and honest limits](docs/IMMENSITIES.md).


**Collection IX:** eight landscape-scale worlds, whole-world breeding by default,
and audible opt-in atmospheric synthesis. Click **sound · on** in the dock; adjust
its volume under tune · audio. No entry gate or autoplay. IX offspring reuse the
exact allowlisted landform kernels; older worlds remain labelled adapters.
[Worlds, sound and motion details](docs/WORLDS-AND-SOUNDSCAPES.md).

Collection VIII, **The Unwritten Biosphere**, adds 64 worlds while preserving all 256 earlier ones.

No entry gate, videos, installed production packages or build step. **202 single-pass
WebGL2 worlds, four stateful GPU systems and 138 Canvas worlds** share one stage.

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
inspect provenance and save offspring with ancestry. All 344 sources have labelled
**habitat-v2 module adapters**, not exact clones of their original renderers. Twelve
GPU geometry grammars couple to a finite colony; legacy eco-v1 IDs and Canvas
recipes remain compatible. Whole-world scope is now the default; choose the legacy scope to use these habitats.

An opt-in **bounded automatic nursery** searches up to 20 generations / 96 genomes /
60 seconds and retains up to 24 diverse candidates, with Stop and transparent scores, with optional locally learned personal ranking from your explicit comparisons—not a universal beauty judge. Saves include available unsaved
ancestors within the 100-record library cap. Storage is session-only unless you
explicitly enable IndexedDB; numeric JSON import/export is bounded to 2 MiB / 512
records including source ancestry.

In **tune · audio → Music laboratory**, edit four bounded global/per-world routes.
Optional local look-ahead adds spectral/chroma/energy timelines, change candidates
and manual timing corrections. PCM16/float32 WAV uses a worker (32 MiB / 10 minutes).
MP3, FLAC and Ogg Vorbis use pinned local codecs in a **terminable worker**
(32 MiB / 3 decoded minutes / 45 seconds). Stop kills decoding, not just its result.
Other codecs need separate consent for the browser's inherently non-abortable native
fallback. No audio uploads or saved predictions.

Optional **Spotify Basic Pitch** now supplies genuine pretrained note-activity
estimates for the first four seconds: local, Apache-licensed, explicit opt-in,
~2.7 MiB of lazily loaded assets, a terminable single-thread model worker and a
60-second deadline. It does **not** infer mood/key/chords or musical meaning.

[Learning, decoder/model limits, licensing and the remaining solver boundary](docs/LEARNING-AND-DECODING.md).

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
- Arrow keys travel; **G** opens the gallery. Type a rank (1–344) or use its jump box.
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
- `assets/js/music-lab.js`, `music-analysis.js`, `audio-decode.js`: route profiles, interruptible local codecs, optional native fallback and PCM analysis worker.
- `assets/js/preference-model.js`: explicit-comparison personal ranker with opt-in storage.
- `assets/js/music-model*.js`: consent-gated local Basic Pitch inference; pinned assets under `assets/vendor/`.
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

The browser suite compiles and draws **all 344 worlds using real WebGL2**. It
checks nonblank Collection V–IX frames, temporal change in all 200 VI/VII/VIII/IX worlds,
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
| 1 | 10 | The Chromatic Rift Ocean | Continental rifts · luminous estuaries · chromatic sky ocean |
| 2 | 10 | Heliograph Cloud Sea | Volumetric cloud continents · solar halos · aerial depth |
| 3 | 10 | The Sapphire Spore Forest | Vast branching canopy · luminous spores · successive forest generations |
| 4 | 10 | Prismatic Monsoon Range | Immense mineral ridges · violet rain · braided light rivers |
| 5 | 10 | The Stellar Nursery Expanse | Deep emissive nebulae · stellar nurseries · drifting dust lanes |
| 6 | 10 | The Living Delta Atlas | Branching luminous rivers · nutrient memory · divergent watersheds |
| 7 | 10 | The World Tree Estuary | Towering branching forests · flooded roots · golden pollen |
| 8 | 10 | Spectral Ribbon Vault | Immense silk vaults · interwoven light sheets · spectral depth |
| 9 | 10 | Opal Dune Migration | Migrating dune folds · opal gradients · ribbons of sand light |
| 10 | 10 | Aurora Migration Council | Ribbon-wing migration · coherent flocking · inherited luminous anatomy |
| 11 | 10 | Ringfall Archipelago | Levitating ring mountains · archipelago shelves · auroral tides |
| 12 | 10 | Ocean of Caustic Light | Submerged light columns · refraction networks · plankton drift |
| 13 | 10 | The Violet Glacier Fjord | Vast glacial walls · luminous fjord · flowing mineral strata |
| 14 | 10 | Coral Tectonic Gardens | Branching reef cities · reproductive polyps · continuous colony succession |
| 15 | 10 | Ember Caldera World | Nested volcanic basins · liquid ember · copper mountains |
| 16 | 10 | The Rainbow Basin Lattice | Vast cellular basins · iridescent rims · luminous mineral lakes |
| 17 | 9 | Cathedral of the Tides | Submerged basalt arches · tidal causeways · sea haze |
| 18 | 9 | The Aurora Terraces | Terraced mountains · sky curtains · glacial rivers |
| 19 | 9 | Sea of Singing Glass | Wind-sculpted dunes · glass sails · airborne sand |
| 20 | 9 | Suspended Watersheds | Floating stone gardens · suspended rainfalls · deep valleys |
| 21 | 9 | The Monsoon Arcade | Flooded colonnades · concentric rain · layered roofs |
| 22 | 9 | Obsidian Orrery | Monumental orbital rings · black sea · stellar drift |
| 23 | 9 | River of the Inner Sun | Carved cliffs · luminous river · strata and mist |
| 24 | 9 | The Salt Mirror Horizon | Hexagonal salt shelves · mirrored horizon · light gates |
| 25 | 8 | The Unwritten Biosphere | living crown · reproductive satellites · folded habitat · light estuary |
| 26 | 8 | Eden of Divergence | genetic canopy · fertile blooms · nutrient weather |
| 27 | 8 | Orchid Engine | fertile petal volumes · asymmetrical flowering · spiral nectar |
| 28 | 8 | Abyssal Communion | colonial bells · sympathetic filaments · deep currents |
| 29 | 8 | Pearl Symbiont | mutually orbiting membranes · porous organelles · coupling |
| 30 | 8 | Glass Moth Migration | folded wing flock · inherited anatomy · parallax migration |
| 31 | 8 | Infinite Pollen Palace | growing cellular vaults · navigable pores · golden suspension |
| 32 | 8 | Cytokinesis Ballet | dividing cellular membranes · organelles · local inheritance |
| 33 | 8 | Planktonic Aurora | luminous colonial volume · curved stellar convection · soft filaments |
| 34 | 8 | Chromatic Myxomycete | chemotactic light trails · nutrient competition · colony memory |
| 35 | 8 | Ceramic Metamorph | hollow ceramic tissue · mineral growth · changing cutaway |
| 36 | 8 | Superorganism Canals | soft spring bridges · colony nodes · light transport |
| 37 | 8 | Suspended Rhizosphere | root bridges · recursive tissue · hanging island gravity |
| 38 | 8 | Octopod Kindergarten | tentacled young · soft muscular pulses · coordinated drift |
| 39 | 8 | Estuary of Two Suns | grazing liquid dunes · twin luminous horizons · mineral shore |
| 40 | 8 | Germinating Continents | living height field · resource bloom · emergent coastlines |
| 41 | 8 | Neural Nautilus | logarithmic chamber organism · rotating nursery · nested shells |
| 42 | 8 | Glass Polyp City | spatial coral terraces · crystalline colony · inherited facets |
| 43 | 8 | Chromatophore Weather | pigment organisms · fluid camouflage · iridescent field exchange |
| 44 | 8 | Symbiotic Lanterns | floating light vessels · slender roots · sympathetic respiration |
| 45 | 8 | Atlas of Soft Machines | pliant moving arches · slow metric distortion · living corridors |
| 46 | 8 | Reproductive Interferometer | communicating wave colonies · nested phase fronts · reproduction signals |
| 47 | 8 | Cryogenic Chrysalis | faceted cocoon · folded inner tissue · frost veins |
| 48 | 8 | Warm Machine Moss | jointed soft machines · slow constraints · inherited chain lengths |
| 49 | 8 | Rivers Without Banks | braided luminous waterways · continuous splitting · depth haze |
| 50 | 8 | Chimeric River | ribbon animals · articulated gills · meandering nursery |
| 51 | 8 | Murmuration Vault | articulated feather lattice · orbiting joint architecture · phase coordination |
| 52 | 8 | Fertile Nebular Dust | stellar attractor nurseries · curved particle streams · shared gravity |
| 53 | 8 | Mirrorgrove | infinite reflective stems · drifting canopy seeds · bent horizon |
| 54 | 8 | Dendritic Negotiations | negotiated branch space · inherited angles · flexible coral graph |
| 55 | 8 | Geode Heartbeat | breathing mineral cavity · inner crystal buds · lumen veins |
| 56 | 8 | Garden of Inverted Rain | buoyant rain spores · inverted seed fountains · opposing gravity |
| 57 | 8 | Unfurling Photosphere | radiant membranous star · filament convection · corona breathing |
| 58 | 8 | Symphony of Diatoms | silicate micro-shells · radial cellular anatomy · intergenerational variation |
| 59 | 8 | Amoebic Observatory | soft cellular dome · orbiting nuclei · permeable skin |
| 60 | 8 | Binary Tidepool | reaction–diffusion ecology · dividing spots · chemical coastlines |
| 61 | 8 | Silica Wing Sanctuary | bilateral wing organism · iridescent ribs · articulated sail |
| 62 | 8 | Feathers of Impossible Birds | articulated feather fans · structural colour · slow quill rotation |
| 63 | 8 | Gravity Pigment | levitating ink pools · nested density contours · organic confluence |
| 64 | 8 | Colonial Clocksea | coupled oscillatory colonies · orbit exchange · polyrhythmic motion |
| 65 | 8 | Tessellated Incubator | rotating nursery cells · folded panel opening · inner seeds |
| 66 | 8 | Tessera Organisms | living tessellated membrane · spatial morphogenesis · inherited topology |
| 67 | 8 | Rain of Living Stones | slow levitating strata · weathered mineral life · gravity reversals |
| 68 | 8 | Darklight Pollinators | pollinator exchanges · nectar nodes · two-parent inheritance |
| 69 | 8 | Spectrum Fungal Dream | branching light paths · spore halos · subterranean interference |
| 70 | 8 | Luminous Termite City | stigmergic towers · luminous voxel strata · cooperative build fields |
| 71 | 8 | Manta of the Void | sinuous ray anatomy · gill pulses · suspended photophores |
| 72 | 8 | Chromosome Archipelago | folded hereditary ribbons · island loops · luminous double helices |
| 73 | 8 | Folded Bioluminal Sea | rising liquid chambers · impossible wave volumes · soft gold edges |
| 74 | 8 | Noctilucent Kelp | flexible light blades · rising nutrient current · bioluminal tissue |
| 75 | 8 | Antlered Light | branch antlers · slow axis migration · luminal sap |
| 76 | 8 | Microbial Calligraphy | living ink paths · inherited curvature · paper memory |
| 77 | 8 | Opalescent Synapse | diffusing neural ribbons · transient nodes · membrane communication |
| 78 | 8 | Sporangia of Memory | hanging spore heads · seed ancestry · auratic microscopy |
| 79 | 8 | Coral Geodesic | spherical living scaffold · phase-grown bridges · negative space |
| 80 | 8 | Prismatic Mantle | pliant honeycomb skin · phase-coupled crest · depth-ordered plates |
| 81 | 8 | Seed of Another Ocean | folded water seed · nested inner horizon · iridescent rind |
| 82 | 8 | Cosmic Cell Gardens | nested orbital cell systems · slow precession · mutual illumination |
| 83 | 8 | Lenticular Monsoon | chromatic atmospheric sheets · oblique rain · fluid parallax |
| 84 | 8 | Cloud Reef | luminous mist organisms · collective convection · soft radiance |
| 85 | 8 | Quiet Xenolith | minimal mineral levitation · living aperture · negative space |
| 86 | 8 | Vernal Negative | ink botanical memory · branching negative space · quiet seasonal growth |
| 87 | 8 | Unborn Constellation | embryonic star chambers · orbit exchange · diffuse nursery light |
| 88 | 8 | Ancestral Embers | nonlinear ancestral trajectories · persistent firelight · phase-space ecology |
| 89 | 7 | The Living Elsewhere | fractal architecture · liquid-light river · organic lattice · floating shards |
| 90 | 7 | Lumen Garden | branching luminous flora · layered blooms · nocturnal parallax |
| 91 | 7 | Mycelial Worldship | branching hull · living capillaries · asymmetric morphogenesis |
| 92 | 7 | Siphonophore Procession | colonial organisms · articulated bells · trailing light tendrils |
| 93 | 7 | Glass Amoeba | refractive membrane · moving organelles · nested density |
| 94 | 7 | Chromatic Tecton | floating hexagonal plates · slow deformation · displaced continental cells |
| 95 | 7 | City of Nervous Stars | levitating towers · neural windows · luminous ground currents |
| 96 | 7 | Night of Nine Moons | occluding planets · auratic atmospheres · orbital shadows |
| 97 | 7 | Cocoon Galaxy | helical stellar filaments · expanding nursery · parallax |
| 98 | 7 | Mandible of Dawn | articulated exoskeleton · luminous limbs · curling anatomy |
| 99 | 7 | Recursive Mangrove | inverted roots · recursive fork field · tidal atmosphere |
| 100 | 7 | Jelly Forest | giant translucent bells · living filaments · deep-water haze |
| 101 | 7 | Prism Leviathan | swimming crystalline anatomy · articulated fins · bioluminescence |
| 102 | 7 | Aerial Root City | floating settlements · hanging roots · interconnecting light bridges |
| 103 | 7 | Liminal Tidepool | living liquid surface · floating luminous disks · atmospheric scale |
| 104 | 7 | Coral Computation | radial growing colony · branch renewal · luminous transport |
| 105 | 7 | Inverse Monsoon | upward rain · particulate thermals · luminous velocity traces |
| 106 | 7 | Stigmergy River | chemotactic agents · pheromone diffusion · emergent living channels |
| 107 | 7 | Xenoflora Spires | curling leaf towers · living whorls · seed chambers |
| 108 | 7 | Zoetrope of Petals | asymmetric orchid · translucent membranes · breathing folds |
| 109 | 7 | Cathedral of Soft Laws | elastic vaults · changing metric · impossible interior |
| 110 | 7 | Pelagic Constellations | steering lantern creatures · articulated bodies · underwater procession |
| 111 | 7 | Polyhedral Molt | faceted cell division · sphere-to-octahedron morph · drifting plates |
| 112 | 7 | Differential Reef | cellular division · local repulsion · bounded colony growth |
| 113 | 7 | Celestial Bronchi | branching respiratory space · radial alveoli · pulsing capillaries |
| 114 | 7 | Ribbon Ecology | interwoven ribbon animals · moving dorsal fins · spectral anatomy |
| 115 | 7 | Lensing Lanterns | nested ellipsoidal volumes · suspended light · atmospheric overlap |
| 116 | 7 | Floating Cartographies | shifting triangular continents · luminous boundaries · topographic parallax |
| 117 | 7 | Plasma Root Delta | branching drainage · advected light · river-like glow |
| 118 | 7 | Lantern Migration | windborne seed lanterns · suspended pollen · twilight layers |
| 119 | 7 | Chiral Sanctuary | opposed handedness · linked helicoids · sculptural phase exchange |
| 120 | 7 | Dust of Other Physics | counter-rotating attractors · velocity trails · curved stellar drift |
| 121 | 7 | Petrichor on Titan | wet basalt · slow terrain drift · reflected alien twilight |
| 122 | 7 | Amphibious Architecture | umbrella habitats · curved roofs · suspended foundations |
| 123 | 7 | Phosphor Intelligence | ridged luminous volume · cellular currents · coherent density drift |
| 124 | 7 | Moonlit Ink | flowing brush organisms · mineral paper · articulated ink tendrils |
| 125 | 7 | Crystal Nervure | veined mineral growth · variable lattice · luminescent joints |
| 126 | 7 | Chromatic Polyp | swaying polyp colony · radial feelers · active cell centres |
| 127 | 7 | Cathedral Under Skin | breathing membrane · internal windows · soft cellular arches |
| 128 | 7 | Xenolithic Mobile | floating mineral nuclei · translucent connecting membranes · drifting facets |
| 129 | 7 | Aurora Lithography | translucent printed planes · volumetric ink · flowing registration |
| 130 | 7 | Silk Caravans | windborne cloth colonies · semi-transparent sails · quiet migration |
| 131 | 7 | Falling Upward | liquid trajectories · reversing gravity · luminous eddies |
| 132 | 7 | Electric Pollination | flower signals · pollen agents · symbiotic motion |
| 133 | 7 | Axial Dreams | helicoidal platforms · ascending camera · changing aperture |
| 134 | 7 | Glass Larvae | segmented transparent anatomy · undulating motion · nested organelles |
| 135 | 7 | Silk Nebula | flowing spectral ribbons · elongated star wisps · deep layered light |
| 136 | 7 | Amoeboid Federation | merging soft cells · translucent boundaries · shared luminous interior |
| 137 | 7 | Luminous Palimpsest | liquid pigment strata · spectral erosion · luminous negative space |
| 138 | 7 | Reverse Waterfall | rising light streams · suspended droplets · opposing currents |
| 139 | 7 | Breath of Obsidian | monochrome interlude · porous black sculpture · radiating seams |
| 140 | 7 | Synaptic Orchard | branching neurons · travelling signals · layered dendrites |
| 141 | 7 | Anemochory | windborne seed chambers · radial membranes · curling stalks |
| 142 | 7 | Rainforest of Silica | three-dimensional branching minerals · suspended canopy · depth ordering |
| 143 | 7 | Crystalline Tectonics | drifting mineral plates · molten light seams · lifted strata |
| 144 | 7 | Blooming Archipelago | floating terraced islands · living crowns · atmospheric layers |
| 145 | 7 | Recursive Raindrop | nested droplets · internal cavities · scale recursion |
| 146 | 7 | Planetary Cilia | living planetoid · surface flow · polar ciliary waves |
| 147 | 7 | Ultraviolet Estuary | flowing tributaries · advected cellular light · liquid branching |
| 148 | 7 | Invertebrate Opera | undulating manta membranes · articulated wings · translucent living sculpture |
| 149 | 7 | Quiet Superorganism | breathing soft volume · slow organelles · auratic silence |
| 150 | 7 | Quiet Terrarium | glass habitat · suspended botanical forms · pale auratic space |
| 151 | 7 | Dream in Negative Space | porous metric · inverse cells · endless interstitial passage |
| 152 | 7 | Ocean of Memory | persistent light currents · gentle trail integration · evolving temporal field |
| 153 | 6 | Vertebrae of Light | flexing axial sculpture · repeated ribs · electric marrow |
| 154 | 6 | Chromofluid Rebellion | nested vector advection · liquid interference · moving pigment |
| 155 | 6 | Tesseract Tempest | four-dimensional rotations · perspective cells · hypercubic procession |
| 156 | 6 | Crown of Tides | lobed membrane · concentric rupture · oscillating silica |
| 157 | 6 | Event Horizon Garden | gravitational lens · accretion filaments · bent starlight |
| 158 | 6 | Enneper Dream | minimal surface · self-intersecting silk · rotating geometry |
| 159 | 6 | Nematode Palace | curling tubes · organic chambers · rotating radial skeleton |
| 160 | 6 | Opal Weatherfront | thin-film interference · converging pressure · spectral ridges |
| 161 | 6 | Stellar Cocoon | nested membranes · polar slits · inner star |
| 162 | 6 | Impossible Aqueduct | warped arcades · tiled stone · unending traversal |
| 163 | 6 | Aurora Labyrinth | volumetric curtains · lateral parallax · charged atmosphere |
| 164 | 6 | Chromatic Dominion | cyclic cellular competition · spiral fronts · living mosaic |
| 165 | 6 | Flame Manuscript | nonlinear iterated functions · accumulated density · spectral flame |
| 166 | 6 | Tectonic Rainbow | folding strata · shaded relief · geological colour flow |
| 167 | 6 | Elastic Constellation | Verlet membrane · wind forces · constraint network |
| 168 | 6 | Hyperbolic Hive | recursive cavities · cellular architecture · slow deformation |
| 169 | 6 | Phase Change | quasicrystal interference · shifting symmetry · moiré depth |
| 170 | 6 | Staircase Paradox | kinetic stepped loops · impossible return · coloured architecture |
| 171 | 6 | Clockwork Eclipse | nested orbital shells · moving apertures · obsidian and gold |
| 172 | 6 | Pressure Bloom | propagating wave packets · caustic ridges · chromatic collision |
| 173 | 6 | Lorenz Silk | chaotic trajectories · evolving attractor · ribbon projection |
| 174 | 6 | Velour Singularity | twisted textile shell · rippling folds · saturated velvet |
| 175 | 6 | Spectral Sandstorm | layered dune flight · analytic heights · impossible horizons |
| 176 | 6 | Amoeba Theatre | soft silhouettes · ciliated membranes · microscopic choreography |
| 177 | 6 | Prism Heart | faceted breathing solid · carved chambers · optical seams |
| 178 | 6 | Ink Between Stars | advected pigment plumes · negative space · luminous edges |
| 179 | 6 | Chromatic Sandpile | driven toppling lattice · avalanche fronts · granular symmetry |
| 180 | 6 | Elsewhere Cathedral | gyroid passage · living topology · iridescent depth |
| 181 | 6 | Impossible Rain | refractive droplets · cellular refraction · falling lenses |
| 182 | 6 | Riemann Cascade | complex logarithm · connected sheets · spectral helicoid |
| 183 | 6 | Recursive Monastery | nested box folds · distance-estimated fractal · immense scale |
| 184 | 6 | Silken Turbulence | anisotropic filaments · nested flow · satin highlights |
| 185 | 6 | Astral Nautilus | logarithmic shell · expanding ribs · iridescent cross-section |
| 186 | 6 | Seraphim Machine | articulated concentric wings · rotating union · pearlescence |
| 187 | 6 | Folded Spectrum | complex-plane tessellation · inversion drift · coloured infinities |
| 188 | 6 | Magnetic Pendulum | driven magnetic dynamics · chaotic trails · moving attractors |
| 189 | 6 | Magnetic Rose | dipole sculpture · polar petals · flowing field lines |
| 190 | 6 | Helium Dream | buoyant volume · thermals · chromatic density |
| 191 | 6 | Helix Promenade | braided helices · paired bridges · molecular scale |
| 192 | 6 | Interstellar Loom | crossed braided beams · camera flight · luminous junctions |
| 193 | 6 | Liquid Stained Glass | moving Voronoi cells · refractive seams · luminous enamel |
| 194 | 6 | Kaleidocycle Engine | inverting tetrahedral ring · faceted linkage · cyclic transformation |
| 195 | 6 | Ribbon Worldtree | branched helices · luminous sap · growing sculpture |
| 196 | 6 | Sunken Contours | bathymetric drift · moving islands · depth-light mapping |
| 197 | 6 | Orbital Debris | faceted asteroid flight · depth projection · distant suns |
| 198 | 6 | Antigravity Quarry | levitating cut blocks · moving seams · mineral interiors |
| 199 | 6 | Infinite Diffraction | curved gratings · spectral orders · moving optical lattice |
| 200 | 6 | Mercury Organism | coalescing metaballs · capillary necks · liquid chrome |
| 201 | 6 | Breathing Archaeology | eroding ceremonial rings · carved steps · pulsing voids |
| 202 | 6 | Neon Protoplasm | cellular thresholds · merging membranes · electrical nuclei |
| 203 | 6 | Peristaltic Transit | contracting passage · moving cross-sections · spectral depth |
| 204 | 6 | Aperture Mountain | perforated peaks · spiralling strata · orbital terrain |
| 205 | 6 | Refracted Memory | anamorphic tiles · chromatic displacement · liquid checkerwork |
| 206 | 6 | Delaunay Drift | triangular canopy · travelling deformation · low-poly light |
| 207 | 6 | Gravity Ballet | softened many-body dynamics · luminous trajectories · mutual orbit |
| 208 | 6 | Chromatic Faultline | sheared domains · melting edges · optical displacement |
| 209 | 6 | Dragon Kites | articulated aerial creatures · wind ribbons · layered flight |
| 210 | 6 | Cosmic Siphon | fluted funnel · endless fall · rotating chamber walls |
| 211 | 6 | Living Hologram | phase-wrapped relief · spectral scan planes · shifting normals |
| 212 | 6 | Lichen Observatory | differential growth · elastic boundary · self-avoiding folds |
| 213 | 6 | Corona Assembly | radial mechanisms · variable teeth · nested rotation |
| 214 | 6 | Afterimage Ocean | long-wave refraction · phase currents · changing horizon |
| 215 | 6 | Solar Centipede | segmented locomotion · procedural legs · radiant exoskeleton |
| 216 | 6 | Afterlight Archive | slit-scan accumulation · temporal painting · chromatic histories |
| 217 | 5 | Chromatic Expanse | volumetric flight · incandescent dust · stellar parallax |
| 218 | 5 | Leviathan Gate | monumental distance fields · atmospheric perspective · portal light |
| 219 | 5 | Thousand Suns | orbital light fields · stellar nurseries · radiant depth |
| 220 | 5 | Nebular Migration | 3D spiral arms · luminous star populations · orbital drift |
| 221 | 5 | Jade Maelstrom | submerged spiral · caustic shafts · abyssal scale |
| 222 | 5 | Iridescent Megastructure | repeated city SDF · spectral facades · orbital camera |
| 223 | 5 | Tidal Ribbons | woven sheet waves · depth-sorted strips · satin gradients |
| 224 | 5 | Plasma Anemone | polar-folded sculpture · soft glow · living filaments |
| 225 | 5 | Impossible Ocean | folded wave relief · metallic tides · impossible horizon |
| 226 | 5 | Chromatic Reef | coral branching · polychrome skeletons · underwater drift |
| 227 | 5 | Heliosphere | stellar plasma · limb scattering · chromatic prominences |
| 228 | 5 | Crystal Dunes | faceted terrain · cyan reflections · fractured crests |
| 229 | 5 | Firefly Citadel | spherical habitat · radiant towers · orbital fireflies |
| 230 | 5 | Velvet Vortex | anisotropic folds · logarithmic drapery · luminous dye |
| 231 | 5 | Lanternfish Ocean | layered shoals · translucent fins · bioluminescent wake |
| 232 | 5 | Prismatic Koi | steering shoal · articulated bodies · reflected ripples |
| 233 | 5 | Electric Glacier | traced ice canyon · subsurface seams · polar radiance |
| 234 | 5 | Bubble Cathedral | spherical vaults · spectral shells · deep perspective |
| 235 | 5 | Aerial Archipelago | floating islands · layered silhouettes · atmospheric vastness |
| 236 | 5 | Endless Causeway | infinite steps · floating treads · vanishing light |
| 237 | 5 | Spore Universe | fractal mist · emissive density · cosmic spores |
| 238 | 5 | Infinite Origami | unfolding octahedra · nested solids · crystalline choreography |
| 239 | 5 | Mosaic Mirage | warped tessellation · metallic relief · chromatic phase |
| 240 | 5 | Polar Roses | lobed porcelain · spectral lacquer · orbiting sculpture |
| 241 | 5 | Velvet Mandala | layered petals · spectral ink · slow radial counterpoint |
| 242 | 5 | Solar Sails | ray-plane facets · translucent membranes · celestial rigging |
| 243 | 5 | Liquid Spectrum | domain advection · pigment boundaries · marbled radiance |
| 244 | 5 | Ribbon Torus | woven toroidal surface · depth-sorted facets · chromatic weaving |
| 245 | 5 | Desert of Glass | pyramid field · mirrored facets · alien sunset |
| 246 | 5 | Fire Opal | internal mineral fire · spherical volume · chromatic inclusions |
| 247 | 5 | Bismuth Temple | stepped mineral terraces · isometric spirals · oxide colour |
| 248 | 5 | Laser Aviary | swept light planes · spectral rigging · haze depth |
| 249 | 5 | Painted Cosmos | painted gas veils · additive atmospheres · drifting pigments |
| 250 | 5 | Neon Topology | torus-knot tubes · depth ordering · luminous crossings |
| 251 | 5 | Chromatic Weather | billowing density · polar illumination · vast cloud strata |
| 252 | 5 | Auric Swarm | coupled orbital drift · additive particles · gravity theatre |
| 253 | 5 | Chromatic Rain | perspective light rain · spectral trails · deep falling field |
| 254 | 5 | Golden Abyss | logarithmic architecture · gilded ribs · falling perspective |
| 255 | 5 | Luminous Archways | nested polygon portals · perspective phases · colour procession |
| 256 | 5 | Opaline Petals | translucent bloom · layered bezier membranes · pearlescent light |
| 257 | 5 | Ember Dunes | layered terrain · drifting embers · incandescent twilight |
| 258 | 5 | Spectrum Choreography | 3D phase lattice · chromatic nodes · collective motion |
| 259 | 4 | Glass Meridian | convex optics · internal reflection · spectral dispersion |
| 260 | 4 | Dune Nocturne | height-field tracing · wind combs · blue-hour sand |
| 261 | 4 | Rain on Elsewhere | curved droplets · refracted bokeh · night glass |
| 262 | 4 | Cloisonné Sky | rose-window geometry · enamel cells · transmitted light |
| 263 | 4 | Ribbon Ballet | depth-sorted silk · parametric surfaces · folded light |
| 264 | 4 | Amber Reliquary | ellipsoid volume · suspended filaments · warm extinction |
| 265 | 4 | Folding Atlas | creased sheet · triangular mesh · travelling deformation |
| 266 | 4 | Silicate Reef | silica shells · radial pores · microscopic light |
| 267 | 4 | Chromatic Abacus | Verlet chains · distance constraints · pointer forces |
| 268 | 4 | Peacock Protocol | barb filaments · ocellar eyes · structural colour |
| 269 | 4 | Cyanotype Garden | botanical silhouettes · venation · photographic blue |
| 270 | 4 | Schlieren Atlas | density-gradient optics · thermal plumes · knife-edge light |
| 271 | 4 | Luminous Mycelium | branching growth · tip competition · luminous transport |
| 272 | 4 | Hyperbolic Bloom | Poincaré disk · circle inversions · infinite boundary |
| 273 | 4 | Prism Parade | isometric solids · phased extrusion · candy architecture |
| 274 | 4 | Circuit Dream | etched copper · routed pulses · soldermask relief |
| 275 | 4 | Kinetic Letterpress | invented glyphs · phase-driven typesetting · warm paper |
| 276 | 4 | Polar Porcelain | twisted ceramic · fluted silhouette · studio reflections |
| 277 | 4 | Oculus Automata | elementary cellular automata · spacetime quilting · rule 110 |
| 278 | 4 | Solar Organ | cylindrical light pipes · phase sequencing · radial depth |
| 279 | 3 | Prismatic Monolith | black crystal · spectral seams · sphere tracing |
| 280 | 3 | Orbital Garden | ringed planet · ray intersections · orbital shadows |
| 281 | 3 | Abyssal Medusa | bioluminescent anatomy · translucent filaments |
| 282 | 3 | Cathedral of Echoes | repeated vaults · distance-field architecture |
| 283 | 3 | Tidal Satin | ocean microfacets · rose-gold horizon |
| 284 | 3 | Kintsugi Earth | porcelain plates · gilded voronoi fractures |
| 285 | 3 | Newton Garden | complex dynamics · cubic basins of attraction |
| 286 | 3 | Murmuration | collective motion · local steering · dusk |
| 287 | 3 | Pyrotechnic Bloom | ballistic sparks · gravity · afterglow |
| 288 | 3 | Entropy Loom | woven light · anisotropic thread shading |
| 289 | 3 | Clockwork Orrery | brass gearing · mechanical harmonics · engraved circles |
| 290 | 3 | Polar Vortex | gas giant · spiral advection · cloud relief |
| 291 | 3 | Ink Calligraphy | brush ribbons · paper grain · negative space |
| 292 | 3 | Quasicrystal | aperiodic order · seven interfering lattices |
| 293 | 3 | Paper Lanterns | translucent rice paper · rising emissive forms |
| 294 | 3 | Tensegrity Swarm | icosahedral cages · depth-sorted projection |
| 295 | 3 | Topographic Dream | contour cartography · mineral pigments |
| 296 | 3 | Pendulum Tides | phase drift · pendulum waves · specular beads |
| 297 | 3 | Eclipse Observatory | occultation · polar streamers · diamond ring |
| 298 | 3 | Lenticular Orchard | optical ribs · interference lacquer · grazing light |
| 299 | 2 | Living Coral | gray–scott · reaction diffusion |
| 300 | 2 | Menger Cathedral | recursive solids · infinite subdivision |
| 301 | 2 | Caustic Abyss | underwater optics · bioluminescence |
| 302 | 2 | Indra's Pearls | circle inversion · kleinian group |
| 303 | 2 | Crystal Prison | refraction · chromatic dispersion |
| 304 | 2 | Infinite Regress | video feedback · self-similar optics |
| 305 | 2 | Cloudsea | volumetric scattering · flight |
| 306 | 2 | Phyllotaxis | golden angle · 137.5 degrees |
| 307 | 2 | Liquid Crystal | birefringence · crossed polarisers |
| 308 | 2 | Ferrofluid | magnetic potential · iron filings |
| 309 | 2 | Coronal Loops | solar magnetism · trapped plasma |
| 310 | 2 | Chladni Resonance | eigenmodes · singing plate |
| 311 | 2 | Diffraction Array | fraunhofer interference · phased emitters |
| 312 | 2 | Frost Dendrite | hexagonal symmetry · crystal growth |
| 313 | 2 | Harmonograph | three pendulums · long exposure |
| 314 | 2 | Fourier Epicycles | discrete transform · drawing with circles |
| 315 | 2 | Möbius Bloom | non-orientable surface · projection |
| 316 | 2 | Fractal Canopy | recursive growth · wind |
| 317 | 2 | Truchet Loops | stochastic tiling · travelling light |
| 318 | 2 | Sandfall | cellular automaton · granular physics |
| 319 | 2 | Ripple Tank | wave superposition · interference |
| 320 | 2 | Spirograph | hypotrochoid · rolling circles |
| 321 | 1 | Singular Bloom | volumetric nebula · gravitational lens |
| 322 | 1 | Chroma Flux | navier–stokes · live gpu fluid |
| 323 | 1 | Event Horizon | schwarzschild geodesics · accretion disk |
| 324 | 1 | Hyperspace | warp tunnel · chromatic aberration |
| 325 | 1 | Aurora Cathedral | volumetric curtains · ice water |
| 326 | 1 | Silk Currents | 65k gpu particles · curl noise · feedback |
| 327 | 1 | Liquid Chrome | metaballs · thin-film dispersion |
| 328 | 1 | Mandelbulb Infinite | power-8 fractal · orbit-trap colour |
| 329 | 1 | Strange Attractor | aizawa system · 60k points |
| 330 | 1 | Iridescence | gyroid lattice · thin-film interference |
| 331 | 1 | Supernova | shock front · lensed starfield |
| 332 | 1 | Hypnotic Moiré | op-art interference · do not stare too long |
| 333 | 1 | Infinite Frontier | procedural range · still water |
| 334 | 1 | Electric Storm | fractal lightning · wet city light |
| 335 | 1 | Quantum Foam | worley cells · soap-film interference |
| 336 | 1 | Cosmic Web | filamentary structure · depth parallax |
| 337 | 1 | Stained Cosmos | kaleidoscopic voronoi · leaded glass |
| 338 | 1 | Neon Horizon | retrowave grid · dying sun |
| 339 | 1 | Ink Bloom | metaball diffusion · gold on black |
| 340 | 1 | Silken Plasma | domain-warped fractal noise |
| 341 | 1 | Firefly Deep | bokeh depth of field · warm dusk |
| 342 | 1 | Digital Rain | glyph cascade · depth & bleed |
| 343 | 1 | Particle Morph | shape interpolation · your name in points |
| 344 | 1 | Silk Drape | layered gradient cloth · specular sheen |

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
