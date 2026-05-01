import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import Devtools from 'vite-plugin-devtools';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  plugins: [
    Devtools({
      insertDevtools: true,
      silent: false,
    }),
    {
      name: 'copy-public-assets',
      closeBundle() {
        if (fs.existsSync('public')) {
          const files = fs.readdirSync('public');
          files.forEach(file => {
            if (file === '_headers' || file === '_redirects') {
              fs.copyFileSync(resolve('public', file), resolve('dist', file));
            }
          });
        }
      }
    }
  ]
});
