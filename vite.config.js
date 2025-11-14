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
  // For GitHub Pages - uncomment if deploying to a subdirectory
  // base: '/your-repo-name/',
  // For root domain or custom domain, leave base as '/' (default)
  base: '/'
});
