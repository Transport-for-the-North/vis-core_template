/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['lz-string'],
  },
  build: {
    // Disable source maps in production to reduce build size significantly
    sourcemap: false,
    // Use terser for minification (more compatible, fixes circular dependency issues)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true,
      },
      mangle: {
        safari10: true, // Fix Safari 10+ issues
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // Simplified chunk splitting to avoid circular dependency issues
        manualChunks: (id) => {
          // Split node_modules into separate chunks
          if (id.includes('node_modules')) {
            // React and related - keep together
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            // Map libraries (these are large)
            if (id.includes('mapbox-gl') || id.includes('maplibre') || id.includes('@mapcomponents') || id.includes('leaflet')) {
              return 'map-vendor';
            }
            // Turf.js (geographic library - can be large)
            if (id.includes('@turf')) {
              return 'turf-vendor';
            }
            // Other large vendor libraries
            if (id.includes('@transport-for-the-north/vis-core')) {
              return 'vis-core-vendor';
            }
            // styled-components and related
            if (id.includes('styled-components') || id.includes('stylis')) {
              return 'styled-vendor';
            }
            // All other node_modules
            return 'vendor';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**', // Exclude Playwright E2E tests
    ],
    server: {
      deps: {
        inline: ['lz-string', '@transport-for-the-north/vis-core'],
      },
    },
  },
})
