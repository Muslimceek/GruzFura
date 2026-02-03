import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500, // увеличьте лимит до 1500 КБ (или больше по необходимости)
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})