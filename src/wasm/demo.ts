/**
 * Loads the browser-node WASM, an emscripten-compiled `wart-node`, and exposes
 * the small subset of its virtual HTTP API that this app needs.
 *
 * The emscripten artifacts are served verbatim from `public/wasm/` so Vite's
 * import-analysis pipeline never touches them; pthreads worker files contain
 * runtime-built `import()` calls that Vite cannot statically resolve and would
 * either emit warnings or rewrite into broken hashed URLs.
 *
 * Emscripten's loader asks for the `.wasm` and `.worker.js` via the main
 * script's URL. `locateFile` is overridden so those resolutions land on the same
 * `public/wasm/` directory regardless of where Vite bundled this module from.
 */

/** Options forwarded to the emscripten module factory. */
export interface DemoInstanceOptions {
  locateFile?: (filename: string) => string;
  [key: string]: unknown;
}

/** The subset of the emscripten instance this module calls. */
interface EmscriptenInstance {
  virtual_get(path: string): string;
  _free?: (ptr: unknown) => void;
}

let instancePromise: Promise<EmscriptenInstance> | null = null;

export function getDemoInstance(
  options: DemoInstanceOptions = {},
): Promise<EmscriptenInstance> {
  if (!instancePromise) {
    instancePromise = (async () => {
      const baseHref = new URL(import.meta.env.BASE_URL, location.origin).href;
      const wasmDir = new URL('wasm/', baseHref).href;
      const mainScriptUrl = new URL('wart-node.js', wasmDir).href;
      const mod = await import(/* @vite-ignore */ mainScriptUrl);
      const mainFn = mod.default || mod;
      const instance: EmscriptenInstance = await mainFn({
        print: () => {},
        printErr: () => {},
        locateFile: (filename: string) => new URL(filename, wasmDir).href,
        ...options,
      });
      return instance;
    })().catch((err: unknown) => {
      instancePromise = null;
      throw err;
    });
  }
  return instancePromise;
}

let memoized: EmscriptenInstance | null = null;

/**
 * Issue a GET against the browser node's virtual HTTP API and parse the JSON
 * body. The caller owns the response shape; nothing here inspects it.
 */
export async function demoGet<T>(path: string): Promise<T> {
  if (memoized == null) memoized = await getDemoInstance();
  return JSON.parse(memoized.virtual_get(path)) as T;
}

export function disposeDemo(): void {
  if (memoized && typeof memoized._free === 'function') {
    try { memoized._free(memoized); } catch (_) { /* noop */ }
  }
  instancePromise = null;
  memoized = null;
}