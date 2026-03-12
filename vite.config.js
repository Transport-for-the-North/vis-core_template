/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

// Load .env.local for local development overrides
dotenv.config({ path: '.env.local' })

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Use local vis-core when USE_LOCAL_VIS_CORE=true
      // Set VIS_CORE_PATH in .env.local to your local vis-core dist folder
      ...(process.env.USE_LOCAL_VIS_CORE === 'true' && process.env.VIS_CORE_PATH && {
        '@transport-for-the-north/vis-core': process.env.VIS_CORE_PATH
      })
    }
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['lz-string'],
    exclude: process.env.USE_LOCAL_VIS_CORE === 'true' ? ['@transport-for-the-north/vis-core'] : [],
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
