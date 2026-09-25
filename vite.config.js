import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    // /wasm/wart-node.js is served as-is from public/wasm/ at runtime.
    // Tell Rollup not to try to bundle it: the dynamic import() is
    // intentional, the .js file is huge (the emscripten loader) and
    // must come from the served URL, not be inlined into the bundle.
    rollupOptions: {
      external: [/^\/wasm\//],
    },
  },
})