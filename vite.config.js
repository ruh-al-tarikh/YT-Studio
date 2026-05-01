import { defineConfig } from 'vite'
import Devtools from 'vite-plugin-devtools'

export default defineConfig({
  plugins: [
    Devtools({
      // Enable devtools UI
      insertDevtools: true,
      // Customize behavior
      silent: false,
    })
  ],
})
