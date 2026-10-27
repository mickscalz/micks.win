# Collection XII — Resonant Infinities

Sixteen new authored environments bring the cabinet to **376 worlds across twelve
collections** and extend whole-world nursery reuse to **52 exact GPU kernels**
(8 + 12 + 16 + 16). They occupy ranks 1–16, newest first.

## The sixteen constructions

Eight surface/scene fields (ray-marched, shared verbatim with the nursery) and
eight optical compositions (bounded procedural layers).

| # | World | Construction | Musical identity |
| --- | --- | --- | --- |
| 1 | The Inverted Pearl Sea | Vaulted ocean ceiling, pearl piers and a mirrored tide | water · hybrid |
| 2 | Stairwell to Andromeda | Helical treads, rail rings, suspended celestial landings | orbit · cinematic |
| 3 | Gardens of a Dying Star | Monumental petal crowns, ember cores, plasma horizon | fire · hybrid |
| 4 | The Mirror-Rain Basilica | Fluted columns, flooded arcade, celestial rain | architecture · melodic |
| 5 | The Tesseract Estuary | Nested rotating cubic worldframes over glass | orbit · hybrid |
| 6 | Velvet Eclipse Badlands | Mesa rings, crater rims, eclipsed sky | cosmic · cinematic |
| 7 | Cathedral of Frozen Lightning | Crystalline branching bolts as a luminous forest | crystal · melodic |
| 8 | The Saffron Leviathan Dunes | Compound dune waves, crest lines, solar dust | earth · cinematic |
| 9 | Organza Solar Sails | Translucent layered sails with soft harmonic edges | wind · melodic |
| 10 | The Luminous Mycelium Cosmos | Interlaced light filaments and node constellations | organic · hybrid |
| 11 | Rivers Through Time | Braided parallax rivers over a luminous plain | flow · melodic |
| 12 | Ocean of Diamond Rain | Depth-layered falling prisms and a refracted sea | crystal · hybrid |
| 13 | Halo-Moth Constellations | Paired wing membranes drifting in orbital groups | organic · melodic |
| 14 | The Obsidian Lace Nebula | Interwoven dust filaments against stellar extinction | cosmic · cinematic |
| 15 | The Mercury Blossom Horizon | Liquid-metal petals with spectral rims | crystal · hybrid |
| 16 | The Infinite Lantern Tide | Lantern flotillas with luminous inner seeds and reflection | water · melodic |

Curation order and ranks are fixed in `assets/js/designs/collection-xii.js`.
Palette, scene camera and hue window are per world; the previous full-rainbow tone
mapping was replaced by a restrained warm/cool window so that colour identifies a
place instead of randomising every surface.

## Sound: a fingerprint, not a random drone

`assets/js/soundscape-score.js` is a pure, dependency-free composition layer:

- **Palette → harmony and tone.** Real gradient colours are converted to a weighted
  hue; from it come the root register, scale (dorian, lydian, whole tone, major and
  minor pentatonic, phrygian), warmth and filter brightness. Achromatic art falls
  back to a neutral register.
- **Scene intent → scale family.** Landform, material and world identity select a
  biome (water, crystal, rain, organic, fire, orbit, architecture, cosmic, wind,
  earth, flow, abstract), which supplies the default scale, texture level and air.
- **Material → texture.** Glass biases upper partials and a higher cutoff, silk
  softens them, mineral rounds them.
- **Movement and depth → phrasing and space.** Drift and lifecycle set tempo
  (40–84 BPM), melodic density and stereo width; depth sets delay space.
- **Seeded phrase.** A 16-step motif is derived from the world's own seed, with
  rests, accents, an octave contour and a four-chord progression. The same world
  always produces the same notes; different worlds produce different pitches,
  registers and tempi.
- **Deterministic readout.** A short fingerprint hash plus the style, biome, scale,
  BPM, key and texture are shown in the conductor so the mapping is inspectable.

`assets/js/soundscape.js` performs that score on one bounded graph: four pad
voices, three melodic voices, two filtered-noise beds, one delay space and one
compressor. There are **no per-note nodes and no allocation while travelling**;
notes reuse their voices. Hold stops new notes and keeps a quiet sustained
atmosphere; Motion = 0, reduced motion and Calm set Hold automatically. Volume
zero is genuine silence. Everything is opt-in and nothing is downloaded, uploaded
or stored.

Musical direction may be left at **world fingerprint** or overridden to melodic,
cinematic or combined; a button restarts the current phrase from its first beat.

## Honest limits

- This is **authored mapping**, not emotion recognition, an AI music model or a
  claim that a world has feelings. The same art direction always gives the same
  score, so it cannot "understand" a listener.
- Harmony is modal and diatonic; there is no modulation, voice-leading analysis or
  generative counterpoint.
- Sound is optional: the experience is complete and silent by default.
- Timing follows the simulation clock, not the audio clock; under soft rendering a
  note may land a frame late, though pitch, order and tempo remain correct.
- Nursery offspring reuse only their own solved environment; scores come from
  labelled scene intent, never a hidden embedding of another world's code.
- Procedural fields are bounded; no world is claimed to evolve indefinitely.
- Device frame rate and battery use are not benchmarked here, and software-GPU
  timings are not hardware performance promises.

## Verification

`npm test` covers 52 distinct fingerprints, deterministic replay, palette-driven
register, material-driven cutoff, in-scale pitches, rest counts and chord
membership. `tests/soundscore-browser.mjs` runs real Web Audio under gesture
policy: default silence with no audio context, a bounded graph, distinct
fingerprints for representative worlds, no allocation across gallery travel, real
audible note events and level variation, Hold and Motion = 0, explicit direction,
phrase restart, true silence at zero volume, 320 px layout, no uploads and no
downloads of audio files.
