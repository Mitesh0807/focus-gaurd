import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copy } from 'vite-plugin-copy';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup/popup.html'),
        options: resolve(__dirname, 'pages/options.html'),
        background: resolve(__dirname, 'background/background.js'),
        blocked: resolve(__dirname, 'pages/blocked.html'),
        debug: resolve(__dirname, 'pages/debug.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    outDir: 'dist',
  },
  plugins: [
    copy({
      targets: [
        { src: 'manifest.json', dest: 'dist' },
        { src: 'assets/icons', dest: 'dist/assets' },
      ],
      hook: 'buildEnd',
    }),
  ],
});
