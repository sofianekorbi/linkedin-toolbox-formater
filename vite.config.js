import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Content script
        content: resolve(__dirname, 'content/content.js'),
        // Background script  
        background: resolve(__dirname, 'background/background.js'),
        // CSS files
        'content-styles': resolve(__dirname, 'content/content.css')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background/background.js';
          }
          if (chunkInfo.name === 'content') {
            return 'content/content.js';
          }
          return '[name].js';
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'content-styles.css') {
            return 'content/content.css';
          }
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/styles/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
        chunkFileNames: 'chunks/[name]-[hash].js'
      }
    },
    // Configuration spécifique pour Chrome Extension
    target: 'esnext',
    minify: false, // Désactivé pour le debug
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@content': resolve(__dirname, 'content'),
      '@background': resolve(__dirname, 'background'),
      '@assets': resolve(__dirname, 'assets')
    }
  },
  // Configuration pour le développement
  server: {
    hmr: false // HMR désactivé pour les extensions Chrome
  },
  // Optimisation des dépendances
  optimizeDeps: {
    exclude: ['chrome']
  },
  define: {
    // Variables d'environnement
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});