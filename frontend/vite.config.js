import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite compiles the React frontend and provides the local dev server.
export default defineConfig({
  plugins: [react()],
})
