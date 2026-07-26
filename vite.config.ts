import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 5173,
  },
  build: {
    // p5 is intentionally a separate large async chunk (~1MB minified).
    chunkSizeWarningLimit: 1200,
  },
});
