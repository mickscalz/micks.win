// MODEL_DEPS points to a temporary npm install's node_modules, never credentials.
const path = require("node:path"),
  fs = require("node:fs");
const deps = process.env.MODEL_DEPS;
if (!deps)
  throw Error(
    "Set MODEL_DEPS to node_modules containing esbuild@0.25.12, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@4.22.0 and @tensorflow/tfjs-backend-wasm@4.22.0",
  );
const dest = "assets/vendor/basic-pitch";
fs.mkdirSync(dest, { recursive: true });
require(path.join(deps, "esbuild")).buildSync({
  entryPoints: ["tools/music-runtime-entry.js"],
  outfile: dest + "/runtime.min.js",
  bundle: true,
  minify: true,
  platform: "browser",
  format: "iife",
  target: "es2020",
  nodePaths: [deps],
  alias: {
    "@tensorflow/tfjs": path.join(deps, "@tensorflow/tfjs/dist/index.js"),
  },
  legalComments: "linked",
});
for (const f of ["model.json", "group1-shard1of1.bin"])
  fs.copyFileSync(
    path.join(deps, "@spotify/basic-pitch/model", f),
    dest + "/" + f,
  );
for (const f of ["tfjs-backend-wasm.wasm", "tfjs-backend-wasm-simd.wasm"])
  fs.copyFileSync(
    path.join(deps, "@tensorflow/tfjs-backend-wasm/dist", f),
    dest + "/" + f,
  );
fs.copyFileSync(
  path.join(deps, "@spotify/basic-pitch/LICENSE"),
  dest + "/LICENSE",
);
