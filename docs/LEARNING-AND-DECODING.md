# Learning and interruptible audio — next-stage delivery

This extends PR #14 without replacing the 320 authored worlds or rewriting v1/v2
recipes. It addresses three boundaries with real code, while keeping the fourth
explicitly open. Direct entry, existing safety controls and opt-in privacy remain.

## What changed (and what did not)

| Earlier boundary | Delivered change | Still not claimed |
| --- | --- | --- |
| Selection only used hand-written proxies | A locally trained pairwise preference ranker, using explicit comparisons, genes and measured rendered thumbnails | Universal beauty, attention prediction, calibrated preference confidence or a human evaluation study |
| Compressed decoding could not be interrupted | MP3, FLAC and Ogg Vorbis decode/resample in a dedicated terminable worker; Stop kills its WASM work | Abortable native `decodeAudioData`, all-codec streaming, constant total memory or hard peak-memory isolation |
| No learned music model | Opt-in pretrained Spotify Basic Pitch note-activity estimates, running locally | Verified transcription, key/chord/mood/genre/section understanding, full-track inference or musical truth |
| Source adapters were not exact solver recombination | **Still open**; an audited extraction plan is below | Arbitrary original shader/solver cross-breeding |

## Personal visual learning

In the nursery, audition/view two candidates. Choose **compare from here** on a
reference, then **prefer over reference** on another candidate. This is an explicit
label. Viewing time, mouse movements, saves and auditions are not silently treated
as training examples.

`preference-model.js` trains a regularized pairwise logistic ranker. Features are
whole-module one-hot genes, bounded numeric genes and eight measurements from an
actual 64×40 sample of the 2.5-second procedural preview: luminance, contrast,
saturation, edge energy, occupied fraction and mean RGB. It does not inspect a
saved screenshot or download a vision model. This small model is deliberately
inspectable: the UI shows its strongest signed feature weights and relative utility.
Those utility values are **not calibrated probabilities of beauty**.

- Three unique unordered recipe pairs enable learned ranking. Re-rating the same
  pair replaces its earlier label, including reversing a preference; it does not
  inflate evidence. At most 128 pairs are kept.
- Enable **Use learned personal ranking** for the next search. Within the existing
  30% moderate-trait score term, the learned prediction blends in at `pairs / 20`,
  capped at 1. The 55% diversity term and 15% optional reference-similarity term
  remain. Without sufficient evidence/opt-in, the old score is unchanged.
- Learned search actually renders each evaluated candidate for its image features.
  That work counts toward its time budget. A bounded GPU draw cannot be interrupted
  halfway by JavaScript; Stop is checked after evaluation before retaining a child.
- Small/biased training sets can overfit. Similar twins and repetitive labels are
  weak evidence. There is no population-trained aesthetic model or universal score.

Default: session-only. **Load / remember my comparisons on this device** is a
separate checkbox, off each visit. No localStorage read occurs until that action.
Only versioned numeric feature pairs and recipe IDs persist, not images, names,
audio or file names. Loading merges session labels with stored labels, preferring
current session choices. Unchecking erases device data but retains the session
model. **Erase learned preferences** and ordinary **reset preferences** erase both.
Quota/blocked-storage failures retain the session model and report the failure.
Model weights are refitted deterministically from the labels, not stored executable
code. No comparison data goes into recipe exports or ordinary settings profiles.

## Interruptible compressed decoding

`audio-decode-worker.js` uses pinned, locally hosted dependencies:

- `minimp3-wasm@0.1.0`, Apache-2.0 / embedded CC0 minimp3;
- `@wasm-audio-decoders/flac@0.2.11`, MIT / embedded BSD libFLAC;
- `@wasm-audio-decoders/ogg-vorbis@0.1.20`, MIT / embedded BSD libogg/libvorbis.

Files are sniffed by container/header rather than trusting a filename. Codecs load
only after explicit file analysis. There is no CDN or audio upload. See
[`assets/vendor/README.md`](../assets/vendor/README.md), full license notices and
SHA-256 provenance for the exact distributed assets.

Limits: **32 MiB encoded**, **3 minutes of actual decoded audio**, mono/stereo,
8–192 kHz input and **45 seconds per decoder job**. FLAC STREAMINFO is preflighted before its decoder loads; actual samples are still
checked afterward. FLAC/Vorbis input is fed in
512-byte encoded chunks; MP3 scans its bounded encoded buffer then decodes one-second
chunks. Both feed a 32-tap, 64-phase low-pass resampler, preserving stereo polarity,
with bounded 16 kHz float-WAV output for the existing DSP worker. Actual decoded
sample counts—not playback metadata alone—enforce duration. Tests compare whole/
chunked output and alias attenuation.

Stop/replacement/cancel/page teardown calls `Worker.terminate()`, rejects the pending
job exactly once and ignores late messages. Timeout also terminates. Supported
worker codecs **never silently fall back** to native decoding if decoding fails.
There is a separate, unchecked-per-visit **Allow native fallback** consent for other
containers/codecs (e.g. AAC/M4A/Opus/WebM when the browser supports them).

That fallback still uses finite metadata / 32 MiB / 3 minutes. It remains inherently
non-abortable; Stop invalidates results and a second native job cannot overlap.
The UI says this before consent. File reading itself is not abortable here. This is
not constant-memory streaming: the encoded file, decoder memory, bounded PCM output
and final WAV can coexist. The browser can allocate extra WASM/native memory; input,
output and elapsed-time budgets are not a hostile-code hard-memory sandbox.
PCM16/float32 WAV retains the existing 32 MiB / 10-minute fast path.

## A genuine learned music model, with narrower claims

The optional **Spotify Basic Pitch 1.0.1** graph and unchanged pretrained weights
come from the official Apache-2.0 npm distribution. Inference is not a rebranding
of heuristic chroma. The model estimates pitched note activity; this integration
summarizes its raw frame activations into 0.5-second bins and top four MIDI pitches.
It is not the upstream full MIDI/pitch-bend postprocessor and does not emit
verified note events.

- Opt-in checkbox defaults off every visit; model/runtime assets (~2.5 MiB with
  SIMD) are requested from this site only when analysis is explicitly requested
  with that checkbox checked. No microphone inference, external inference service,
  CDN, account or credential is involved.
- At most the **first four seconds**, resampled to 22.05 kHz mono. The stronger-energy
  stereo channel is selected, avoiding anti-phase cancellation but potentially
  missing notes on the other channel. A 16 kHz decoder output has already lost
  frequencies above its Nyquist limit; upsampling does not recover them.
- TensorFlow.js / WASM **4.22.0**, one WASM thread, one dedicated model worker and
  a **60-second deadline**. Worker termination stops inference and frees its tensor
  context. Fixed excerpt and time budgets bound the job, not its exact peak memory;
  unavailable WASM or low-memory failures leave ordinary DSP analysis usable.
- An optional `notes` route uses note activity only with look-ahead enabled, during
  playback inside the evaluated excerpt. It bypasses elsewhere; no whole-track
  predictions are fabricated. Existing ±35%/calm modulation limits still apply.
- Stop, disable, file replacement, reset and reload clear model predictions and
  terminate active inference. No application-managed model/data cache is created.
  The normal browser HTTP cache can retain **public** model/runtime files; disabling
  inference does not pretend to erase that browser-managed cache.

Basic Pitch is best on a single pitched instrument. Percussion, dense stereo mixes,
unusual timbres, noise and out-of-distribution material can produce wrong or
spurious activations. Raw sigmoid activations are not calibrated confidence. No
mood, key, chords, named sections, downbeats or comprehensive musical understanding
is inferred. Tests exercise the real graph on an A4 tone and silence; those checks
are **not** a real-world transcription or listening benchmark.

Runtime build source is in `tools/music-runtime-entry.js` and
`tools/build-music-runtime.cjs`; exact dependencies and reproduction instructions
are recorded with the vendored files. Heavy runtime/model assets are never imported
at world entry. Full license and transitive legal notices are shipped locally.

## Exact source-solver recombination: what the audit found

The original contracts are **182 single-pass GL shaders**, **4 stateful GPU solvers**
and **134 Canvas renderers**, not one interchangeable genome. The four GPU states
illustrate the incompatibility:

- `living-coral`: reaction–diffusion chemistry ping-pong state;
- `infinite-regress`: recursive image feedback state;
- `chroma-flux`: separate velocity, dye, pressure and divergence textures;
- `silk-currents`: particle-position and accumulated trail textures.

Those state vectors, boundary conditions, time steps and conservation assumptions
cannot be averaged or renamed into compatible children. Reusing an unmodified
parent renderer as a dominant core would preserve that parent, but is **not** exact
multi-parent solver recombination. Overlaying those outputs would not meet the
coupling goal either. No such shortcut was added under a genetic label.

The next safe implementation is **allowlisted shared kernel extraction**, beginning
with compatible single-pass fields and explicit ecology/field bridges:

1. Move selected source field/force/material kernels into shared typed modules,
   preserving original authored worlds against rendered fixtures. Originals and
   offspring must call the *same functions*, not two approximate copies.
2. Define units, state layout, allowed parameter ranges, deterministic seed policy,
   resource ownership and a stable read-only coupling interface for each module.
3. Version the new recipe schema (never reinterpret old v1/v2 recipes) and record
   exact source kernel/version/donor per module. Reject incompatible combinations.
4. Prove that each module changes geometry/development, that coupling acts in both
   directions where promised, and that stop/freeze/disposal/resource bounds hold.
5. Extend source families one contract at a time, with human visual review. A claim
   of *all-320 exact cross-solver recombination* must wait for that work and testing.

That remaining boundary is intentionally **not marked resolved by this delivery**.

## Verification

`npm test` covers pairwise learning direction, unique evidence/reset/validation,
learned search hooks/cancellation/ancestry, stereo/chunked resampling and alias
attenuation, worker settle-once/timeout/termination, note excerpt/channel/input
bounds and vendored-asset hashes, alongside all existing regression tests.

`npm run test:browser` includes the real 320-world/24-transition suites and adds
explicit training, learned selection, consent/reload/erase, actual decoder/model
worker termination, MP3/FLAC/Vorbis decoding, no silent native fallback, lazy model
loading, actual Basic Pitch note/silence results, 320px layout and no uploads.
Software-GPU/synthetic-audio tests are not hardware FPS, universal beauty or a
real-world musical accuracy study.
