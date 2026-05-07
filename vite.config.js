import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
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
    proxy: {
      '/api': {
        target: 'https://yt-studio-production.ruhdevopsytstudio.workers.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  define: {
    __API_URL__: JSON.stringify('https://yt-studio-production.ruhdevopsytstudio.workers.dev')
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
