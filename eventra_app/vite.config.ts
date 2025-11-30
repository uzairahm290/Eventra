import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173, // default Vite port
    proxy: {
      "/api": {
        target: "http://localhost:5152", // switched to HTTP backend port
        changeOrigin: true
      }
    } 
  }
})
