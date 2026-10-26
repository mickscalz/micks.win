# Lineage Nursery & Music Laboratory — expanded local tools

This adds tools to the existing 320-world cabinet, not another numbered collection.
Entry remains direct. No server, account, credential, audio upload or model download
is required. All processing is in the browser.

## Breed a family

1. Open **breed · nursery**. Choose **2–4 different parents** in the quick slots, or enable the advanced pool for **2–32** contributors and optional weights.
   Optional parent slots may be left empty; zero weight excludes a parent's traits.
2. Choose balanced, calm or wild variation, then **breed twins**. These have the
   same inherited world genotype but different population/habitat seeds.
3. Compare actual procedural thumbnails (2.5 simulated seconds at default tuning),
   then name and audition each child. The main stage runs its actual ecology, not a
   thumbnail or pixel crossfade. Auditions enable Linger; arrow travel or **return
   to authored world** restores the original catalogue and previous Linger state.
4. Save either child, inspect its ancestry and per-trait contributions, and select
   saved offspring as parents for subsequent generations.

### What is compatible?

All **320 authored worlds** have deterministic, labelled **habitat-v2 module
adapters**. They map source names/tags/families and seeded variation to shared
geometry, topology, material, rhythm, depth and relief genes. These are inspired
approximations—not clones, recovered shader parameters, arbitrary executable
shader splices, or a claim that every source solver now cross-breeds directly.

The v2 phenotype uses twelve genuinely different 3D fields (bloom, shell, ribbon,
branch, vault, sponge, membrane, lattice, orbit, terrain, coral, vortex). Four
materials change shading, four rhythms change development, and four topologies
change agent flow. Shape-specific structural flow influences a finite nutrient
colony on the CPU; its agents and persistent 48×30 field feed GPU geometry and
material deformation. This is coupled procedural development, not a pixel overlay
or a GPU fluid solver/readback loop. Populations still use the bounded Collection
VIII birth/renewal rules. Main-stage auditions and real thumbnails share the same
renderer; temporary GPU textures are disposed when leaving/replacing a child.

Whole shape, hue, lobe-count, force, topology, material and rhythm modules have one
weighted donor. Eight behavioural/environment genes plus depth/relief blend with
bounded mutation. Seventeen per-trait provenance records explain the result.
Thirty-two contributors do **not** guarantee that all donate a categorical module;
continuous traits show all normalized weights. Calm limits development/drift;
wild widens bounded variation. Existing manual ecology, motion, contrast,
brightness and quality controls remain available.

**Legacy eco-v1 recipes keep their IDs, twelve-trait genomes and Canvas renderer.**
Their Collection VIII adapters remain selectable. A mix involving v2, or more than
four v1 parents, creates a v2 child with explicit default modules for old parents;
it never rewrites the old recipe. Pure 2–4-parent v1 breeding remains reproducible.

### Bounded automatic nursery

Explicitly start each run; it never runs overnight or starts on page entry.
Budgets: **1–20 generations**, **1–96 candidates**, **1–60 seconds** of genome search,
and **1–24 retained survivors**. Each generation evaluates up to eight children,
then carries selected descendants and original contributors forward. Search yields
after each candidate. Stop takes effect between candidates and hiding the page
also requests stop. Final real thumbnail rendering is outside the search timer.

Selection greedily combines 55% minimum genome distance to selected survivors,
30% moderate growth/coupling/lifecycle/drift proxy and 15% similarity to an optional
saved taste reference (neutral when absent). Genome distance compares all seventeen
traits, with circular hue and whole-module differences. It is **not** rendered
image-quality measurement, learned taste, proof of beauty or a photosensitivity
screen. Your taste reference is used only for that run. Every retained survivor can
be inspected, auditioned, named and saved manually. Saving also includes available
unsaved ancestors from that run; a family that would exceed 100 saved records is
rejected transactionally, not silently pruned. Replacing the run discards unsaved
candidates; export/save first to keep them.

### Library, privacy and deletion

- Default: **session only**, with no nursery database opened or data written.
- Check **Load / remember nursery on this device** to open IndexedDB, load its
  contents and persist saves. This checkbox is intentionally off on each visit;
  check it again to load an existing device library. There is no silent database
  access before that action.
- Uncheck to erase the device library while retaining session recipes. Export to
  keep them. **Clear nursery** removes both session and device recipes after confirmation.
- Maximum **100 saved recipes**, 2 manual twins or 24 automated survivors, 32 parents,
  finite ecology populations/fields/trails, and a bounded ancestry display (depth 12 / 200 nodes).
- Deletes never cascade into children. Descendants retain the deleted parent's ID,
  visibly labelled missing. Available founders/parents are included in exports;
  a deleted parent's name/traits cannot be reconstructed from its ID.
- JSON is limited to **2 MiB UTF-8 / 512 total versioned records**, including available source ancestry, validates schema, numbers, discrete
  modules, IDs, generation order and cycles. Unknown executable fields are ignored,
  never evaluated. Conflicting identities are rejected rather than overwritten.
- Storage operations are serialized; database writes are transactional and capacity
  is checked inside the transaction. Quota/block/version-change failures are
  reported; a failed save is not shown as successful.
- Recipes contain no audio, file names, credentials or preferences. Names are rendered
  as text. The nursery consent is independent of ordinary settings consent.

Recipes are versioned numeric data. Their stable IDs are reproducible fingerprints
with conflict checks, **not cryptographic signatures** or proof of external ancestry.
A saved seed restarts a recipe. It is **not a runtime checkpoint** of an ecosystem
that has already evolved. No migration of future incompatible solver versions is
attempted: unsupported versions are rejected explicitly.

## Shape music response

Expand **Music laboratory** in the same dialog. Four rows each have a signal,
target trait, signed strength and bypass checkbox. A negative strength inverts a
route. Global defaults apply unless that world has its own override; resetting a
world profile restores inheritance from global. Reset-all removes all overrides.

Available real-time signals: bass, mids, highs, energy and onset. Optional local
features add future energy arc, chroma/energy novelty, spectral high-frequency
fraction, spectral flatness, and a tempo phase clock. Routes target the eight
living-system traits, not a universal full-screen brightness pulse.

Combined modulation is bounded to **±35% of the manually supplied trait value**;
calm/reduced-motion attenuates that bound further. Existing safety/quality controls
remain in charge. Zero audio reactivity bypasses all routes. A missing look-ahead
feature is bypassed, not invented. Legacy worlds may not implement these new traits.

Up to **64 profiles** persist only with the existing **Remember settings** checkbox.
Turning remembering off removes stored preferences; current session edits remain.
Reset preferences removes profiles and stops audio. No audio-derived feature data
is included in saved settings.

## Optional local-file look-ahead

Choose a playback file in the audio controls, then explicitly request analysis.
The fast worker path supports uncompressed **PCM16 or float32 mono/stereo WAV**,
8–192 kHz, limited to **32 MiB / 10 minutes**. Other files use browser-native
`OfflineAudioContext.decodeAudioData` when available: MP3, AAC/M4A, FLAC, Ogg and
WebM depend on the browser/OS codec and finite playback metadata. This path accepts
**32 MiB encoded / 3 minutes**, requests 16 kHz decoding and rejects output beyond
mono/stereo/three-minute limits. It interleaves bounded float PCM in yielding chunks
and sends it to the same analysis worker, preserving separate stereo channels.

**Native decoding is not abortable, streaming, constant-memory or hard-memory
sandboxed.** Encoded size and metadata are checked before decode; actual output is
checked afterward. The native implementation can allocate extra buffers before
those checks, especially for malformed or misleading files. Only one native decode
can be in flight; Stop/replacement immediately invalidate its result but the browser
may finish the underlying work. Another analysis waits for it to finish. PCM worker
analysis can be terminated. For unknown metadata, excessive duration, unsupported
codec or decoder failure, real-time playback/tap tempo remain available if playable.
No file/features are stored or uploaded; only compact timeline features remain on
the main thread after analysis. These output budgets are not a universal guarantee
against hostile decoder inputs or low-memory device failures.

Features:

- RMS and a conservative positive energy-change envelope at 50 ms resolution;
- 1024/4096-point Hann-window FFTs, centroid, 85% rolloff, flatness and high-frequency fraction;
- 12 pitch-class energy bins (chroma), energy-normalized timeline and chroma/energy
  novelty candidates spaced at least 6 seconds apart;
- Coarse autocorrelation tempo candidates, confidence-gated and suppressed for
  silence/steady tones/insufficient onset evidence. Half/double aliases and variable
  tempo remain limitations. This is not beat/downbeat transcription.

The timeline displays energy, a chroma strip, candidate markers and your manual
annotations, with numerical observations in text. Enable optional feature routes
explicitly, then choose arc/novelty/spectral/texture/beat in a route. Arc and spectral
features read **0–10 seconds ahead** of the playback clock. Manual markers contribute
a small novelty cue when that feature is routed. Tap tempo, half/double tempo and
±2-second alignment offset correct the continuous beat route; uncertain beat
routes free-run independently rather than asserting a tempo. The route is bypassed
when no tempo evidence/override exists. Manual correction can change phase; no
automatic beat event resets every world's simulation clock.

Cancel terminates a running worker and discards its result; native decode results
are epoch-invalidated rather than aborted. Stop audio, replace the
file, leave the page or reload to release file references, feature data and timing
corrections. File/analysis state is never persisted. Microphone analysis stays causal
and is never routed back to speakers. RMS combines channel power; spectra average per-channel magnitudes, avoiding
anti-phase cancellation. Confidence and manual listening still matter.

No trained model, harmonic/percussive source separation, chord/key/emotion/genre
recognition, named verse/chorus segmentation, streaming account integration or
measured latency compensation is claimed. Gold markers are **change candidates**,
not musical truth. Chroma energy is not proof of a key or harmony.

## Verification and next steps

`npm test` includes deterministic multi-generation recipes, module/weight inheritance,
provenance, malformed/oversize imports, bounded eco simulation and hold, PCM tone/
pulse/silence/float fixtures, profile bounds and route safety/bypass. `npm run test:labs`
uses real Chromium Canvas, Web Audio, a real worker and IndexedDB to exercise
breeding, save/reload/erase, ancestry, JSON transfer, quota failure, profile consent,
actual PCM analysis, look-ahead, cancellation, mobile layout and no uploads.

The full `npm run test:browser` also runs `tests/evolution-browser.mjs`: all 320
adapters, twelve distinct real GPU forms/nonblank thumbnails, freeze/disposal,
32-parent controls, automated search/Stop/complete saved ancestry, actual MP3 and
FLAC native decode through the worker, stale-native-result/concurrency handling,
mobile layout and no uploads. Unit tests cover v1 identity compatibility, v2
provenance/validation, deterministic search and all budgets, decode preflight and
UTF-8 import limits. Synthetic codec fixtures are original generated tones.
Software-GPU regression tests are not hardware FPS or listening/beauty studies.

Remaining: more expressive phenotypes and human visual/listening review, richer
ancestry navigation/runtime checkpoints, streaming decode and stronger codec
preflight, better onset/downbeat/variable-tempo tracking and uncertainty. Optional
licensed on-device learned models/HPSS need device, download, privacy and licensing
evaluation and are **not implemented**. There is no learned mood/chord/section or
universal aesthetic understanding. More than 32 parents and overnight jobs are not
shipped; more contributors are not automatically better.
