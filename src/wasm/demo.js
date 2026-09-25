// Loads the browser-node WASM (an emscripten-compiled wart-node) and exposes
// the small subset of its virtual HTTP API that this app needs.
//
// The artifacts in `public/wasm/` (`wart-node.js`, `wart-node.wasm`,
// `wart-node.worker.js`) come from `browser-node-website/src/js-external/`
// — pre-built and not regenerated as part of this repo's build pipeline.
//
// The `?url` import gives us the served URL string at build time. Vite's
// import-analysis plugin treats `?url` as an asset reference (handled
// explicitly via Vite's directive) instead of a code import, so it does
// not try to bundle the emscripten loader — bundling would rewrite
// `import.meta.url` and break the loader's `wart-node.wasm` lookup at
// runtime. The browser then does `import(loaderUrl)` against the served
// URL like a normal dynamic module import.

import loaderUrl from '/wasm/wart-node.js?url';

let instancePromise = null;

export function getDemoInstance(options = {}) {
  if (!instancePromise) {
    instancePromise = (async () => {
      const mod = await import(/* @vite-ignore */ loaderUrl);
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
