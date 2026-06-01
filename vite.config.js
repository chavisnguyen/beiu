import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Actions set VITE_BASE_URL (xem .github/workflows/deploy-pages.yml)
// User site tech-dicsoft.github.io → /
// Project site → /tên-repo/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_URL || '/',
})
