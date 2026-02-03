import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) {
              return 'firebase';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react';
            }
            if (id.includes('@google/genai')) {
              return 'genai';
            }
            if (id.includes('lucide-react')) {
              return 'ui-icons';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})