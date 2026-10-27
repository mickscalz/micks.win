# Pinned local codec dependencies

Loaded from this site **only after explicit local-file analysis**, inside a
terminable worker. No CDN, analytics or runtime model downloads.

Unmodified distribution files:

- `minimp3-wasm@0.1.0`: `dist/minimp3-wasm.js`, `dist/decoder.opt.wasm`.
  Apache-2.0 wrapper by bashi, with embedded CC0 minimp3. Full licenses in its folder.
  Source/build: https://github.com/bashi/minimp3-wasm/tree/12cf7fcd80300ce4dc29075d9e3684c2d8989d47
  minimp3 revision: `9eea8134f8214f970ce761b97c4f4fc534f87301`.
- `@wasm-audio-decoders/flac@0.2.11`: `dist/flac-decoder.min.js`.
  Wrapper/common MIT by Ethan Halsall; embedded libFLAC BSD-3-Clause.
  Source/build: https://github.com/eshaz/wasm-audio-decoders/tree/11530fe7d1ed6d78e6b968297e7f858c322704d2
  libFLAC revision: `1507800de4b70e21be71f38caa0d9079d0bc6e45`.
- `@wasm-audio-decoders/ogg-vorbis@0.1.20`: `dist/ogg-vorbis-decoder.min.js`.
  Wrapper/common MIT; embedded libogg/libvorbis BSD-3-Clause.
  Source/build: https://github.com/eshaz/wasm-audio-decoders/tree/6fe55b9a29543d0a5a2d896338c39199a81d9a58
  libogg `3069cc2bb44160982cdb21b2b8f0660c76b17572`,
  libvorbis `84c023699cdf023a32fa4ded32019f194afcdad0`.

Bundled `codec-parser` and `simple-yenc` dependencies are MIT;
`@eshaz/web-worker` is Apache-2.0. Full notices included. Embedded WASM is part of the unmodified upstream JS bundles.
The unused source-map comments point to upstream files; no source maps are required
at runtime. Do not run formatters over these files.

Install the exact npm versions above into a temporary directory and copy these
files to reproduce. `SHA256SUMS` records every vendored executable asset.

## Optional learned note model

`basic-pitch/` contains the **unchanged** graph and pretrained weight shard from
`@spotify/basic-pitch@1.0.1` (Spotify, Apache-2.0), and a built runtime combining its
inference API with TensorFlow.js / WASM **4.22.0** (Google, Apache-2.0). Full Apache
license and bundled transitive legal notices are included. No model training or
weight modification is claimed here. Upstream: https://github.com/spotify/basic-pitch-ts
and https://github.com/tensorflow/tfjs .

Only these optional assets are loaded after the separate model opt-in and explicit
file analysis. `setThreadsCount(1)` avoids requiring cross-origin isolation or an
extra threaded WASM asset. Disable/Stop terminates inference; normal browser HTTP
cache may retain public model files, not audio or predictions.

Rebuild the runtime and recopy unchanged weights/WASM into this folder:

```sh
npm install --prefix /tmp/music-build @spotify/basic-pitch@1.0.1 \
  @tensorflow/tfjs@4.22.0 @tensorflow/tfjs-core@4.22.0 \
  @tensorflow/tfjs-backend-wasm@4.22.0 esbuild@0.25.12
MODEL_DEPS=/tmp/music-build/node_modules node tools/build-music-runtime.cjs
```

The build aliases all Basic Pitch TensorFlow.js imports to 4.22.0 so it does not
bundle its older 3.x dependency as a second engine. The source is in `tools/` and
esbuild retains linked legal comments in `runtime.min.js.LEGAL.txt`. Model/runtime
hashes are checked in the unit suite. Do not format generated/vendor files.
