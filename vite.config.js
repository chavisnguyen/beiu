import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://<user>.github.io/<repo>/
const repoName = process.env.GITHUB_REPOSITORY_NAME
const isGitHubPages = process.env.GITHUB_PAGES === 'true' && repoName
const base = isGitHubPages ? `/${repoName}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
