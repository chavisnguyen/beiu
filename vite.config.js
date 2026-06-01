import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project Pages: https://chavisnguyen.github.io/beiu/ → base /beiu/
// Local dev: pnpm dev (base /)
export default defineConfig({
  plugins: [react()],
  base:
    process.env.VITE_BASE_URL ||
    (process.env.GITHUB_ACTIONS === 'true' ? '/beiu/' : '/'),
})
