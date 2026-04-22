import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@changelog/types': new URL('../../packages/types/src/index.ts', import.meta.url).pathname,
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3456',
      '/auth': 'http://localhost:3456',
      '/widget': 'http://localhost:3456',
    },
  },
})
