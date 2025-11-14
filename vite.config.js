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
  base: '/wrapup/',
  // For root domain (username.github.io), use: base: '/'
});
