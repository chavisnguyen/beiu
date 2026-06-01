import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: dùng base tương đối để tránh 404 khi tên repo khác tên folder local
// https://<user>.github.io/<repo>/
const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const base = isGitHubPages ? './' : '/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
