import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',  // Changed from 'terser' to 'esbuild' (built-in, no extra dependency)
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['js/app.js'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@js': path.resolve(__dirname, 'js'),
      '@css': path.resolve(__dirname, 'css'),
    },
  },
  optimizeDeps: {
    exclude: [],
  },
  esbuild: {
    supported: {
      'top-level-await': true,
    },
  },
});