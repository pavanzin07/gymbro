import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist'
  },
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.js']
  }
});
