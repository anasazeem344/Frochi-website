import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Single bundle — only 2 files output: frochi-app.js + frochi-app.css
      rollupOptions: {
        output: {
          entryFileNames: 'frochi-app.js',
          chunkFileNames: 'frochi-app-[name].js',
          assetFileNames: 'frochi-app[extname]',
          manualChunks: undefined,
        },
      },
    },
  };
});
