// Loads the browser-node WASM (an emscripten-compiled wart-node) and exposes
// the small subset of its virtual HTTP API that this app needs.
//
// The emscripten artifacts are served verbatim from `public/wasm/` so Vite's
// import-analysis pipeline never touches them; pthreads worker files contain
// runtime-built `import()` calls that Vite cannot statically resolve and would
// either emit warnings or rewrite into broken hashed URLs.
//
// Emscripten's loader asks for the `.wasm` and `.worker.js` via the main
// script's URL. We override `locateFile` so those resolutions land on the same
// `public/wasm/` directory regardless of where Vite bundled `demo.js` from.

let instancePromise = null;

export function getDemoInstance(options = {}) {
  if (!instancePromise) {
    instancePromise = (async () => {
      const baseHref = new URL(import.meta.env.BASE_URL, location.origin).href;
      const wasmDir = new URL('wasm/', baseHref).href;
      const mainScriptUrl = new URL('wart-node.js', wasmDir).href;
      const mod = await import(/* @vite-ignore */ mainScriptUrl);
      const mainFn = mod.default || mod;
      const instance = await mainFn({
        print: () => {},
        printErr: () => {},
        locateFile: (filename) => new URL(filename, wasmDir).href,
        ...options,
      });
      return instance;
    })().catch((err) => {
      instancePromise = null;
      throw err;
    });
  }
  return instancePromise;
}

let memoized = null;

export async function demoGet(path) {
  if (memoized == null) memoized = await getDemoInstance();
  const instance = memoized;
  return JSON.parse(instance.virtual_get(path));
}

export function disposeDemo() {
  if (memoized && typeof memoized._free === 'function') {
    try { memoized._free(memoized); } catch (_) { /* noop */ }
  }
  instancePromise = null;
  memoized = null;
}
