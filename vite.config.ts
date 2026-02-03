
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
    // Removed manualChunks to avoid initialization order issues with React
  },
  define: {
    // Fallback to empty string to prevent "process is not defined" or JSON parsing errors if env var is missing
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "")
  }
})
