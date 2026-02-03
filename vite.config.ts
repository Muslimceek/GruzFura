import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
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
            return 'vendor';
          }
        }
      }
    }
  },
  define: {
    // Fallback to empty string to prevent "process is not defined" or JSON parsing errors if env var is missing
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  }
})