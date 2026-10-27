# Collection IX: worlds, not isolated silhouettes

Historical IX release notes. The current Collection X expansion brings the total
to 344 and exact GPU kernels to 20; see [Immensities](IMMENSITIES.md).


328 authored worlds, newest first. IX adds eight independently constructed
landscape-scale fields with actual renderer-generated gallery stills:

1. Cathedral of the Tides — repeated sea arches and tidal causeways.
2. The Aurora Terraces — stepped mountains, sky curtains and glacial river.
3. Sea of Singing Glass — wind dunes and thin glass sails.
4. Suspended Watersheds — hanging islands, waterfall ribbons and deep floor.
5. The Monsoon Arcade — flooded pillars, layered roofs and rain.
6. Obsidian Orrery — monumental intersecting rings over a black mirror sea.
7. River of the Inner Sun — carved cliffs and a luminous channel.
8. The Salt Mirror Horizon — salt shelves, mirrored gaps and a light gate.

## Whole-world breeding (default)

`world-v3` inherits landform, sky, water, weather and camera **independently** as
categorical modules, with separate scale, relief, depth, materials, rhythms,
colour and bounded growth/drift traits. Each module has donor weights in lineage.
It renders an environment, not a creature on a backdrop. Up to 32 parents and
bounded multi-generation searches work as before. Seeds vary the continuous flow;
twins have identical genes, not identical runtime phases. Hold freezes the world.

`designs/world-kernels.js` is the allowlisted shared implementation used by BOTH
IX authored shaders and v3 offspring. The exact selected IX landform field is
reused, not reimplemented as a generic object. Sky/water/weather/camera recombine
around it. A child selects one whole landform field; it does **not** fuse every
parent's terrain topology or numerical simulation state. No imported executable
shader code is evaluated.

The **older 320 worlds still use approximate environment adapters**, derived from
source metadata and existing typed genes. This does not implement arbitrary
reaction-diffusion/fluid/feedback solver splicing. Their original catalogue
renderers are unchanged. The older habitat/creature scope remains available.
Saved v1/v2 recipes retain their schemas, identities and renderers; world founders
use `world:` IDs so they cannot collide with existing `source:` adapters.
The export envelope stays version 1; each enclosed recipe declares its own version.

Personal preference ranking still learns the existing genotype/image features;
it can learn actual rendered environment appearance but does not yet have dedicated
one-hot coefficients for the new environment modules. No claim of universal beauty.

## Audible atmospheres

The previous internal rhythm is a visual control signal, **not sound output**.
A new, separate Web Audio synth generates slowly drifting harmonic beds, filtered
wind and water-like noise locally. Click **sound · on** in the dock to unlock it;
there is no entry screen, autoplay or microphone request. Adjust Atmosphere volume
under tune · audio. Sound is OFF again on reload (no stored consent or settings).
World changes smoothly retune a single bounded graph instead of accumulating
nodes. This is procedural ambience, not field recordings or music generation.

A dynamics compressor and conservative levels limit output; begin with a low
system volume. Volume zero silences the synth. Sound off closes its AudioContext
immediately. Hidden tabs suspend it; returning resumes an already enabled context
subject to browser policy. Page exit closes it. Local file/mic input ducks the
atmosphere to 18%, and stopping input restores the selected volume. Visual Hold
intentionally does not mute audio; its independent sound toggle remains available.
No audio assets, network requests, recordings, uploads or persistent settings are
needed for this synth. Actual speakers/headphones and the browser/site mute
setting still determine whether you hear the output.

## Motion fixes

- v2 colony displacement now deposits density bilinearly rather than hopping
  whole values between cells. A dt-based exponential relaxation removes hard
  birth-density changes. Rendering with dt=0 cannot mutate this density.
- Ecology heading follows the shortest angular path with time-based easing,
  retaining heading at near-zero speed instead of flickering `atan2` directions.
- Display-only age/energy envelopes soften reproduction/renewal silhouette
  changes; biological traits and recipe identities are untouched.
- Performance still depends on hardware, screen size and quality preset. These
  fixes remove specific discontinuities; they do not guarantee 60 fps everywhere.

## Verification

`npm test`: world schema, complete donor provenance, deterministic replay, eight
exact shared field bodies, strict module validation, legacy compatibility,
multi-generation ancestry, continuous density across grid boundaries and held
redraws. Existing legacy recipe golden identity tests remain in place.

`npm run test:browser` includes `tests/worlds-browser.mjs`: all eight fields compile
in real WebGL2, distinct/nonblank frames and actual motion; independent module
pixel changes; held redraws; default v3 UI and rendered thumbnails; real gesture
unlock under Chromium's gesture-required audio policy, nonzero analyser RMS,
zero-volume silence, repeated world switches, immediate off and 320px layout.
The rest of the suite retains all-world rendering, legacy recipes, transitions,
audio decoding, note inference, learning and privacy checks.
