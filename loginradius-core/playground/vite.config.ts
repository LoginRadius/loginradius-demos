/// <reference types="vite/client" />
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5001,
    host: 'localhost',
  },
  preview: {
    port: 4301,
    host: 'localhost',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});
