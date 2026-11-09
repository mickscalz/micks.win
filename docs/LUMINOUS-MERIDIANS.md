# Collection XIII — Luminous Meridians

Thirty-two new authored environments. The cabinet goes from 376 to **408 worlds**
(266 WebGL, 4 GLX, 138 canvas) across thirteen collections, and whole-world
nursery reuse goes from 52 to **84 exact GPU kernels**.

## What is actually new

| part | detail |
| --- | --- |
| fields | 32 hand-written environment bodies, one construction each |
| shading | one new shared pass (`assets/js/designs/shading-xiii.js`) used by all 32 |
| kernels | `worldKernel` 52–83, verbatim reuse of the same fields in breeding |
| previews | 32 real 960×600 stills rendered from the shaders themselves |
| sound | unchanged and still opt-in; each world has a palette-derived fingerprint |

Every field returns **terrain height minus the sample's y**, i.e. a heightfield
with a well-defined surface. The shared pass turns that into "height above
ground" once, and the march, the soft shadows and the occlusion taps all use
the same sign convention. That is the one structural rule of this collection:
it is why the camera always sees a landscape instead of the inside of a solid.

## The shading pass

* **March** — fixed-step march between two bounds derived from the camera: the
  distance at which the ray reaches the world's own height, and the distance at
  which it leaves the terrain's vertical range. Seven bisection steps refine the
  crossing. A height-proportional step was tried and rejected: at grazing angles
  it crawls and never arrives.
* **Normals** — rebuilt from the field gradient with distance-scaled taps, so
  far geometry stops looking like crumpled foil.
* **Light** — one key light with soft self-shadowing (bounded march), plus a
  sky-fill wrap and a small rim term so vertical faces and silhouettes stay
  legible instead of collapsing to black.
* **Occlusion** — four taps lifted along the normal. Sampling straight along
  the normal with the wrong sign reads the inside of thin geometry and produced
  black slabs; the hemisphere-biased taps fixed that.
* **Water** — a rippled normal, a muted sky reflection, a restrained sun glint;
  not a mirror.
* **Grade** — mild desaturation, cool shadows and warm highlights, then the
  shared `finish()` tone map. The palette is muted on purpose: no neon, no
  pastel wash.

Each world also gets its own sun. Worlds with an explicit `eye`/`aim` derive the
key light *from that view*, so the faces the camera sees are the lit faces.
Worlds posed from a distance use a per-world sun angle and elevation instead.

## The 32 constructions

| # | world | construction | family |
| --- | --- | --- | --- |
| 1 | Colonnade of Nine Suns | low basalt shelf in a still tidal mirror | architecture |
| 2 | Obsidian Library | slab towers around sunken lanes, lit windows | architecture |
| 3 | Suspended River Palace | river channel with terraces climbing both banks | architecture |
| 4 | Thousand Year Stair | one stair cut through a monolith | architecture |
| 5 | Tideclock Basilica | tidal terraces around a spire | architecture |
| 6 | Brass Orrery Mausoleum | three concentric ring walls and tombs | architecture |
| 7 | Falling Light Colonnade | pale monolith forest, lights shafts between | architecture |
| 8 | Salt Throne Citadel | white ramparts around a throne mesa | architecture |
| 9 | Whale Nebula | long cloud banks seen from above | atmospheric |
| 10 | Glass Monsoon | sharp glass crystals in rain water | atmospheric |
| 11 | Ember Stratosphere | stratified mesa, every ledge lit | atmospheric |
| 12 | Cloudfall Abyss | plateau with a chasm punched into it | atmospheric |
| 13 | Aurora Necropolis | tomb blocks with lit lids | atmospheric |
| 14 | Luminous Ash Sea | ash dunes over molten cracks | atmospheric |
| 15 | Dark Star Maelstrom | spiral reef inside a whirlpool | atmospheric |
| 16 | Weeping Atmosphere | drowned district in steady rain | atmospheric |
| 17 | Valley of First Light | ridged ranges flanking a valley floor | terrain |
| 18 | Saffron Salt Basin | polygon salt crust | terrain |
| 19 | Glacier of Inner Fire | ridged ice with fire in the fissures | terrain |
| 20 | Verdant Labyrinth | hedge maze on a slope | terrain |
| 21 | Dunes of the Quiet Bell | long dunes with lit windward faces | terrain |
| 22 | Midnight Terraces | stepped flooded terraces | terrain |
| 23 | Cinnabar Canyon Sea | high canyon walls, river at the floor | terrain |
| 24 | Meadow Above the Storm | grass plateau ending over cloud | terrain |
| 25 | Kaleidoscope Iron Rain | eight-fold radial blade ridges | optical |
| 26 | Moire Sanctum | standing-wave interference terraces | optical |
| 27 | Crystalline Interference | faceted crystal towers | optical |
| 28 | Prism Cataract | stepped sheet waterfall | optical |
| 29 | Silk of Solar Wind | long back-lit silk ripples | optical |
| 30 | Lace of Falling Numbers | pierced screen of columns | optical |
| 31 | Caustic Cathedral | ribbed basin with caustics | optical |
| 32 | Meridian of Infinite Doors | portal corridor | optical |

## Verification

```bash
node -e "require('./assets/js/designs/luminous-xiii.js')"   # specs + shape checks
npm test                                                    # 67 unit tests
npm run test:browser                                        # real WebGL2 draws
```

The design module validates itself at load: every spec must define the full
option set, `sky`/`ground`/`sun` must be 3 numbers, `eye`/`aim` 3 numbers when
present, all scalars must be finite, and every field must end by returning a
heightfield. A mangled spec throws immediately instead of shipping a black
frame.

## Limits, stated plainly

* These are procedural environments, not simulations of anything.
* Breeding reuses the exact field and the baked constants; offspring are new
  parameter combinations, not new constructions.
* Previews are single frames at a fixed time, not the live animation.
* The pass is one key light plus fill. There is no global illumination, no
  refraction, no volumetric scattering — the haze is a height/distance blend.
