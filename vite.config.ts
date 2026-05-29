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
          // Co-locate all facility + case content + clusters/financing/data
          // tables into one content chunk. React shell renders first; the
          // content chunk loads in parallel rather than blocking the
          // entry chunk parse.
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
