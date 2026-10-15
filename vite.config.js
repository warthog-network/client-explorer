/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // The bundled browser-node WASM is built with pthreads enabled; pthreads
    // require `SharedArrayBuffer`, which only becomes available when the
    // page is cross-origin-isolated (window.crossOriginIsolated === true).
    // Two response headers turn that on. We mirror browser-node-website's
    // settings so a fresh check-out of either repo gives identical headers.
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  test: {
    // The suite covers pure logic: the vendored history cache and, once added,
    // the formatting and trade helpers. Nothing here needs a DOM, so no jsdom.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
