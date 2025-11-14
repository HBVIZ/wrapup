import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'docs',
    assetsDir: 'assets'
  },
  // For GitHub Pages - set to your repository name
  // If repo is "wrapup", use: base: '/wrapup/'
  // If using custom domain or username.github.io repo, use: base: '/'
  base: '/wrapup/',
});
