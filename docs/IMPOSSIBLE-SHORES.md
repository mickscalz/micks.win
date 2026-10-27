# XI — Impossible Shores

Sixteen new complete environments bring the cabinet to **360 worlds** across
11 editions: **218 single-pass WebGL2**, four stateful GPU systems and 138 Canvas
worlds. The 344 earlier worlds remain. Edition XI is newest first, with editorial
ordering interleaving architecture, landscapes, volumes and optical fields.

## Sixteen constructions

| World | Construction |
| --- | --- |
| Oceans Above the Sky | Repeated suspended ocean shelves, falling light sheets, caustic tidal floor |
| The Crystal Moon Labyrinth | Carved crystal block fields, changing height, emissive seams, twin moons |
| Leviathan Cloud Gardens | Intersecting hollow toroidal garden arches at landscape scale |
| The Liquid Opal Grotto | Sinuous enclosing cavern field with iridescent mineral light and water |
| Amethyst Gravity Causeway | Staggered floating causeway slabs and upright suspended gates |
| The Sunken Starlight Palace | Repeated celestial colonnades, half-vaults and flooded ground |
| The Molten Snowfields | Ridged compound terrain with icy lit faces and hot flowing seams |
| Orchard of Ringed Moons | Repeated moon spheres and inclined rings above a tidal plain |
| The Pearlstorm Nebula | Folded noise volumes, front-to-back emissive accumulation and extinction |
| The Aureole World Engine | Counterrotating projected orbital arcs and a reflected lower horizon |
| Sapphire Tidal Aurora | Layered auroral light curtains and an undulating reflected ocean |
| Hypersilk Worldsheets | Depth-layered translucent sheets, continuous folds and luminous edges |
| The Living Prism Horizon | Separate faceted mountain layers, parallax and luminous ridges |
| Dreamtide Coral Expanse | Layered underwater branching light interference, plankton and caustics |
| Silver Rain Infinity | Depth-layered falling streaks with a refracted moon halo |
| Bioluminescent Eventide | Analytic branching light roots, layered luminous filaments and spores |

Eight different distance-field constructions and eight different volume/optical
integrations; not sixteen palette variants of one object. Screenshots in
`assets/previews` are actual renderer captures, not illustrative art. Shared
quintic development avoids abrupt epoch changes; light, caustics and colour flow
with simulation time. Optical constructions are artistic field models, not
physically complete fluid/atmospheric or biological simulations.

The sixteen source bodies are shared with the allowlisted world-v3 nursery,
bringing exact GPU source kernels to **36** (IX 8 + X 12 + XI 16). Source defaults,
enums and IDs are appended; existing recipes retain their identities and modules.
Offspring choose inherited environment bodies/modules, not arbitrary source-code
fusion. Older worlds and the four Canvas X ecologies remain labelled adapters.
Some modules affect different kernels differently; not every control changes
geometrical structure in every optical environment.

## Fixing the frozen birth experience

Three distinct problems contributed:

1. Paired nursery pictures were deterministic **stills**, with no live birth view.
2. Full-stage audition inherited the stage's **Hold** state.
3. Offspring began with resting agents and a slow, zero-phase visual clock.

Changes:

- A separate **live firstborn** canvas runs the actual offspring renderer at
  240×150, approximately 12 FPS, while the nursery is visible and open. It is not
  a CSS transform of a still. The original paired stills remain available for
  fair, reproducible preference comparisons.
- **Audition / Play** explicitly resumes a held stage. A later Hold immediately
  freezes playback again. The live firstborn also respects Hold and labels it.
- v1/v2 agents receive small, deterministic initial velocities. All three
  offspring renderers use a seeded nonresting visual phase and bounded visual
  pacing, while the actual integrated simulation clock remains unchanged.
  Authored founders retain phase 0 and rate 1. Neither recipe schemas nor
  seed/identity calculations change. Twins and imported seeds remain repeatable.
- Motion = 0 is never overridden. Calm, reduced-motion, intensity, colour safety
  and the effective conductor settings remain in effect. A zero-motion or held
  newborn still paints its initial frame instead of presenting a blank canvas.
- Hidden/closed nursery and hidden documents stop preview simulation. Only one
  live firstborn is retained; replacements dispose their old model, reuse the GPU
  context where possible, and release resources on page exit.

The deterministic visual phase/pacing changes presentation of existing offspring,
not their genetic identity. Simulation ages still measure integrated dt, not the
accelerated visual phase. This is a liveliness/presentation fix, not a new solver
or a claim of autonomous intelligence.

## Verification

- `npm test`: 65 tests, including source/default parity for XI, append-only exact
  kernels, deterministic motion profiles, seeded agent velocity and unchanged IDs.
- `npm run test:browser`: nine suites. The original regression traverses and
  compiles all 360 worlds. The new birth suite exercises the live viewport,
  explicit audition from Hold, later Hold, Motion = 0, and actual first-two-second
  render differences for v1/v2 plus **all 36** world-v3 environment bodies.
- Motion verification also averages **5×5 pixel blocks**, requiring both a mean
  difference and at least 20 substantially changed spatial blocks, so ordinary
  per-pixel shader grain cannot stand in for structural/light motion. Repainting
  without advancing dt must reproduce exactly the held pixels and clock.
- Real WebGL2 shader compilation/readback, resource replacement, no-upload checks
  and existing privacy/audio/accessibility/transition tests remain in place.

Pixel budgets are bounded to 320k–500k for XI. A second small preview context is
allocated only after breeding; the full-stage context remains shared. Economy is
available. Tests establish deterministic state/render behavior, not device FPS
or battery-performance claims.
