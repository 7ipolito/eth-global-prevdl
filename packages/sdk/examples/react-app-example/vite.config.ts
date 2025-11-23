import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ignore-aztec-imports',
      enforce: 'pre',
      resolveId(id) {
        // Ignore dynamic imports to aztec contracts that may not exist in all contexts
        if (
          id.includes('aztec/contracts/src/utils/sponsored_fpc') ||
          id.includes('aztec/contracts/src/artifacts/AdTargeting') ||
          id.includes('aztec/contracts/src/artifacts/AdAuction')
        ) {
          return { id: id, external: false };
        }
        return null;
      },
      load(id) {
        // Return empty module for aztec contract imports that don't exist
        if (
          id.includes('aztec/contracts/src/utils/sponsored_fpc') ||
          id.includes('aztec/contracts/src/artifacts/AdTargeting') ||
          id.includes('aztec/contracts/src/artifacts/AdAuction')
        ) {
          // Return a mock module that exports null/default
          if (id.includes('AdTargeting')) {
            return 'export const AdTargetingContract = { artifact: null, at: () => null };';
          }
          if (id.includes('AdAuction')) {
            return 'export const AdAuctionContract = { artifact: null, at: () => null };';
          }
          return 'export default null; export function getSponsoredFPCInstance() { return null; }';
        }
        return null;
      },
    },
  ],
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

