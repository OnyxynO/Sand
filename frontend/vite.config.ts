import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    // Configuration pour Docker - polling necessaire pour detecter les changements
    watch: {
      usePolling: true,
      interval: 1000,
    },
    // HMR via WebSocket
    hmr: {
      host: 'localhost',
      port: 5173,
    },
  },
})
