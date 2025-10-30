import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true, // Automatically open browser when running dev server
    port: 3000  // Use port 3000 (like your homepage project)
  }
})
