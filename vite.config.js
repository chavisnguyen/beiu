import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function getGitHubPagesBase() {
  if (process.env.GITHUB_PAGES !== 'true') return '/'

  // User/org site: repo tên <user>.github.io → URL gốc https://tech-dicsoft.github.io/
  const repoName = (process.env.GITHUB_REPOSITORY || '').split('/')[1] || ''
  if (repoName.endsWith('.github.io')) return '/'

  // Project site: https://<user>.github.io/<repo>/
  return './'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: getGitHubPagesBase(),
})
