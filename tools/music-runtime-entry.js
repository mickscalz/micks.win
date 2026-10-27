// Build-only entry. Not loaded by the cabinet. See assets/vendor/README.md.
import * as tf from "@tensorflow/tfjs";
import { BasicPitch } from "@spotify/basic-pitch/esm/inference.js";
import { setWasmPaths, setThreadsCount } from "@tensorflow/tfjs-backend-wasm";
self.BasicPitchRuntime = { tf, BasicPitch, setWasmPaths, setThreadsCount };
