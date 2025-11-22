import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@prevdl/sdk': path.resolve(__dirname, '../../src'),
      '@prevdl/sdk/components': path.resolve(__dirname, '../../src/components'),
      '@prevdl/sdk/core': path.resolve(__dirname, '../../src/core/PrevDLAds'),
    },
  },
  optimizeDeps: {
    exclude: ['@prevdl/sdk'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  define: {
    global: 'globalThis',
  },
});

