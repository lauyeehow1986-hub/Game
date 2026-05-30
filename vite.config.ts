import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Game/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/phaser')) return 'phaser';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom'))
            return 'react';
          if (id.includes('node_modules/zustand')) return 'zustand';
          // Split the static content tree by sub-domain so the two largest
          // groups (cases, facilities) parallelise on HTTP/2 instead of
          // serialising as one fat 360 KB chunk. Historical cases pull in a
          // lot of citation text, so they get their own chunk too.
          if (id.includes('/src/content/cases/sars-2003-historical')) return 'content-historical';
          if (id.includes('/src/content/cases/covid19-historical')) return 'content-historical';
          if (id.includes('/src/content/cases/')) return 'content-cases';
          if (id.includes('/src/content/facilities/')) return 'content-facilities';
          if (id.includes('/src/content/')) return 'content';
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
