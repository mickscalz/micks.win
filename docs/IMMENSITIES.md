# Collection X — Immensities

Sixteen additional authored worlds bring the catalogue to **344**. Newest first;
editorial ordering interleaves landscapes, optical environments and living systems.
Existing 328 worlds, 24 passages, direct entry, fading UI and actual thumbnails remain.

## Sixteen constructions, not palette swaps

| World | Distinct construction |
| --- | --- |
| The Chromatic Rift Ocean | Continental height-field rifts, emissive strata, estuaries and auroral sky |
| Heliograph Cloud Sea | Front-to-back volumetric cloud integration with optical extinction and directional shading |
| The Sapphire Spore Forest | Growing branch graph, bifurcating tips, luminous transport, spores and forest succession |
| Prismatic Monsoon Range | Ridged mountain height field, layered mineral gradients and rain |
| The Stellar Nursery Expanse | Deep emissive volume, curved dust lanes, extinction and stellar points |
| The Living Delta Atlas | Forking flow tips depositing a decaying, bilinearly accumulated nutrient/rivers field |
| The World Tree Estuary | Forest-scale trunk/limb distance fields, suspended crowns and flooded ground |
| Spectral Ribbon Vault | Sixteen analytically antialiased, interwoven depth-layered ribbon sheets |
| Opal Dune Migration | Compound dune folds, cross-grain detail and slow structural field development |
| Aurora Migration Council | Cohesive/aligned ribbon-wing flock, shortest-path banking and inherited renewal traits |
| Ringfall Archipelago | Repeated floating ring mountains, suspended shelves and mirror water |
| Ocean of Caustic Light | Depth-integrated caustic interference, light shafts and soft plankton points |
| The Violet Glacier Fjord | High glacial channel walls, flowing strata and luminous fjord |
| Coral Tectonic Gardens | Multiple branching colonies, polyps, moving light shafts and staggered succession |
| Ember Caldera World | Radial caldera/rim terrain, hot emissive seams and molten channel |
| The Rainbow Basin Lattice | Repeated mineral basins with iridescent rims and mirror lakes |

The twelve GPU worlds use different environment bodies: eight distinct distance
fields plus four volume/optical constructions. The four Canvas systems use
separate development/steering rules, not four calls to one recoloured walker.
The images in `assets/previews` are captured from those actual renderers.

## Evolution and smoothness

- GPU developmental channels interpolate independent seeded targets with quintic
  easing. Value, velocity and acceleration are continuous at epoch boundaries.
  Targets continue diverging rather than cycling a short pre-authored sequence.
  These are continuously developing *fields*, not simulated biological genomes.
- Living worlds have finite branches/agents/field memory. They fork, inherit
  variation, age and renew under different rules. No periodic full-world reset.
  The flock renews a bounded population in place with inherited hue/wing traits;
  forest, delta and reef systems create new branches/tips.
- Living worlds are deterministically warmed into developed states before entry,
  so neither direct entry nor thumbnails begin as nearly empty seed lines.
- Positive-dt-only semi-fixed substeps (at most 1/60 s, 0.1 s catch-up budget)
  keep steering/development bounded. Hold does not consume randomness or advance
  age, field memory or generation. Light/size envelopes soften renewal.
- Delta deposition distributes continuously between cells and uses filtered
  enlargement rather than block-stepping across screen-sized squares.
- New living worlds expose actual population, births, renewals and generation in
  the existing conductor readout. These are procedural counters, not AI claims.

Growth affects development/density; mutation/novelty set seeded field variation;
lifecycle affects epoch/development pace; coupling shapes field/agent relationships;
drift controls motion; atmosphere/afterglow control haze/emission. Exact mappings
vary by construction, not every slider has identical meaning in every algorithm.
Intensity, colour accessibility, reduced motion and existing quality controls
remain available. These worlds favour luminous gradients over rapid flashes.

## Improvements to shared systems

**Resize continuity:** the engine memoises each renderer's actual surface size.
Unchanged performance checks no longer call reset-heavy resize handlers. Canvas
simulations use logical viewport dimensions, not backing-buffer resolution, for
that decision. This prevents e.g. digital rain columns being regenerated whenever
quality is reassessed. Genuine resizing of Silk Currents resamples both trail
buffers before disposing the old targets, instead of erasing the particle history.

**Frame pacing:** pointer response uses time-based exponential smoothing. Hidden
page transitions reset timing/performance sampling, preventing background time
from triggering a catch-up jump or false adaptive-quality penalty on return.

**Audio:** two continuously modulated filter bands and separate spatial positions
add slower evolving wind/water timbres without allocating a graph per world. Calm
now also halves the atmosphere gain. Opt-in, volume zero, immediate off, input
ducking, hidden-tab suspension, no uploads and no remembered sound consent remain.

**Nursery:** twelve new GPU environments reuse the same allowlisted kernel bodies
and defaults in world-v3 offspring. Together with IX, **20 exact GPU environment
kernels** are supported. Imports remain typed module IDs, never executable code.
The four new Canvas systems and older 320 original worlds still use labelled
adapters, not exact numerical solver splices. A v3 child selects one complete
environment kernel and combines the supported surrounding modules/numeric traits;
this is not arbitrary multi-solver or multi-terrain topology fusion. Optical
kernels do not all implement water/camera modules like literal terrestrial terrain.
Legacy v1/v2/v3 identities and existing recipe schemas remain compatible.

## Tests and limits

Unit tests cover all sixteen registrations, twelve exact source/offspring kernels,
strict provenance/replay, bounded C2-continuous channels, deterministic simulations,
more than 100 seconds of new development, actual generations, finite capacities
and held-state purity, alongside the existing legacy/privacy/decoder/model tests.

Real Chromium/WebGL checks cover distinct moving source renders, twelve shared
v3 kernels at 67/800 seconds, small frame changes across an epoch boundary, exact
held redraws, nonblank pixels, exact-kernel nursery labels and population readout.
A known nonzero GPU trail is actually copied through a resize and read back;
unchanged resizes retain the original buffers, and old targets are disposed.
The complete browser runner also retains gallery, keyboard, mobile, 24 passages,
local audio, learning, saved recipe/storage and decoder/model checks.

Deterministic tests are **not hardware FPS benchmarks**. Ray/volume budgets,
populations and memory are bounded, but weak GPUs may still need Economy quality.
Development is not literally infinite: finite precision, seeds and population
caps apply. Personal preference ranking still uses prior genotype/image features,
not a universal aesthetic metric. Basic Pitch/decoder algorithms were not silently
changed. Larger simulation-solver fusion and learned long-horizon world design
remain separate future work, not claims of this release.
