# Lineage Nursery & Music Laboratory — first working release

This adds tools to the existing 320-world cabinet, not another numbered collection.
Entry remains direct. No server, account, credential, audio upload or model download
is required. All processing is in the browser.

## Breed a family

1. Open **breed · nursery**. Choose **2–4 different parents** and their weights.
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

Only Collection VIII **nutrient-agent** constructions are adapted initially.
Shaders, reaction–diffusion and nonlinear attractors have different solver
contracts and cannot silently be mixed into this solver.

Founders are explicitly labelled **eco-v1 adapters**, not exact copies of the
original world's renderer. Their source ecology seed and force family are retained;
geometry is mapped to one of four bounded drawing grammars (bloom, shell, ribbon,
branch), material to a source-palette approximation, and developmental genes to
seeded variants around the ecology defaults. This is a deliberately small typed
phenotype vocabulary, not arbitrary recombination of all 320 original algorithms.

Children inherit whole shape, force, lobe-count and material modules from selected
parents. Eight continuous behavioural/environment genes are weighted and mutated.
Calm limits developmental speed and drift; wild widens mutation without removing
numerical/resource bounds. Inspection reports per-trait weights, mutation and
clamping. The phenotype uses actual nutrient competition, birth/renewal and inherited
agent variation. Geometry, structural order, movement, timing and habitat memory
are affected—not only colour. Manual ecological controls nudge inherited traits;
shared motion, calm, brightness and quality controls remain available.

### Library, privacy and deletion

- Default: **session only**, with no nursery database opened or data written.
- Check **Load / remember nursery on this device** to open IndexedDB, load its
  contents and persist saves. This checkbox is intentionally off on each visit;
  check it again to load an existing device library. There is no silent database
  access before that action.
- Uncheck to erase the device library while retaining session recipes. Export to
  keep them. **Clear nursery** removes both session and device recipes after confirmation.
- Maximum **100 saved recipes**, 2 audition candidates, 4 parents, finite ecology
  populations/fields/trails, and a bounded ancestry display (depth 12 / 200 nodes).
- Deletes never cascade into children. Descendants retain the deleted parent's ID,
  visibly labelled missing. Available founders/parents are included in exports;
  a deleted parent's name/traits cannot be reconstructed from its ID.
- JSON is limited to **512 KiB / 132 records** (100 saved recipes plus up to
  32 founder records for lossless ancestry export), validates schema, numbers, discrete
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
The first worker supports uncompressed **PCM16 or float32 mono/stereo WAV**, 8–192 kHz,
limited to **32 MiB / 10 minutes**, whichever limit is reached first. It rejects
compressed/unsupported data with a useful message. MP3 and other browser-playable
formats continue to use real-time analysis and manual tap tempo; they do not yet
receive a decoded look-ahead timeline.

A dedicated worker scans the bounded input and retains only compact timeline
features on the main thread. The transferred PCM buffer is released when the worker
exits. It is not a streaming decoder or a claim of constant total decoding memory:
the worker holds at most the accepted 32 MiB buffer during analysis. No whole-track
Web Audio `AudioBuffer` is retained just to make a thumbnail.

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

Cancel terminates a running worker and discards its result. Stop audio, replace the
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

Next priorities: more expressive/compatible phenotype grammars and visual/listening
review; explicit runtime checkpoints and richer ancestry navigation; wider codec
support via bounded decoding, better onset/tempo/downbeat tracking and uncertainty;
then optional HPSS/models after device/licensing evaluation. Unattended breeding,
quality-diversity automation and **32+ parents remain future work**. Starting with
2–4 inspectable contributors avoids averaging entire worlds into an indistinct mix.
