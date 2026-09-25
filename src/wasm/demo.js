// Loads the browser-node WASM (an emscripten-compiled wart-node) and exposes
// the small subset of its virtual HTTP API that this app needs.
//
// The artifacts in `public/wasm/` (`wart-node.js`, `wart-node.wasm`,
// `wart-node.worker.js`) come from `browser-node-website/src/js-external/`
// — pre-built and not regenerated as part of this repo's build pipeline.
// Loading the loader via a dynamic `import()` keeps Vite from trying
// to bundle emscripten's complex module, which would rewrite
// `import.meta.url` in unhelpful ways.

let instancePromise = null;

export function getDemoInstance(options = {}) {
  if (!instancePromise) {
    instancePromise = (async () => {
      const mod = await import(/* @vite-ignore */ '/wasm/wart-node.js');
      const mainFn = mod.default || mod;
      const instance = await mainFn({
        print: () => {},
        printErr: () => {},
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
