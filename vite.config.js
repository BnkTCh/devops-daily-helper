import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    proxy: {
      '/jira-api': {
        target: 'https://foshtech.atlassian.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jira-api/, ''),
        secure: true,
      }
    }
  }
})
