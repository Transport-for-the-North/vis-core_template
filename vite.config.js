/* eslint-env node */
/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Enable with: VITE_USE_LOCAL_VIS_CORE=1
  const useLocalVisCore = env.VITE_USE_LOCAL_VIS_CORE === '1'

  // Optional override if vis-core isn't a sibling at ../vis-core
  // e.g. VITE_LOCAL_VIS_CORE_PATH="D:/code/vis-core"
  const visCoreRepoRoot = path.resolve(
    env.VITE_LOCAL_VIS_CORE_PATH ?? path.join(process.cwd(), '..', 'vis-core'),
  )

  // The actual package folder inside the vis-core repo
  const visCorePkgRoot = path.join(visCoreRepoRoot, 'packages', 'vis-core')
  const visCoreDistRoot = path.join(visCorePkgRoot, 'dist')

  return {
    plugins: [react()],

    // Added: optional local vis-core aliasing
    resolve: {
      alias: useLocalVisCore
        ? [
          // Root import -> local dist entry
          {
            find: /^@transport-for-the-north\/vis-core$/,
            replacement: path.join(visCoreDistRoot, 'index.js'),
          },

          // Catch-all: allow importing any file under the package during local dev
          // @transport-for-the-north/vis-core/<anything> -> <local>/dist/<anything>
          {
            find: /^@transport-for-the-north\/vis-core\/(.*)$/,
            replacement: path.join(visCoreDistRoot, '$1'),
          },
        ]
        : [],

      // Dedupe React to prevent multiple React copies when using local vis-core.
      // vis-core has react/react-dom as peerDependencies but also devDependencies.
      dedupe: [
        'react',
        'react-dom',
        'styled-components',
        'react/jsx-runtime',
        'react-router',
        'react-router-dom'
      ],
    },

    server: {
      port: 3000,

      // Added: allow Vite dev server to read/watch the sibling repo
      fs: {
        allow: [visCorePkgRoot, process.cwd()],
      },
    },

    optimizeDeps: {
      include: ['lz-string'],

      // Added: avoid prebundling vis-core so local changes are reflected reliably
      exclude: useLocalVisCore ? ['@transport-for-the-north/vis-core'] : [],
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
              if (
                id.includes('react') ||
                id.includes('react-dom') ||
                id.includes('react-router') ||
                id.includes('scheduler') ||
                id.includes('recharts')
              ) {
                return 'react-vendor'
              }
              // Map libraries (these are large)
              if (
                id.includes('mapbox-gl') ||
                id.includes('maplibre') ||
                id.includes('@mapcomponents') ||
                id.includes('leaflet')
              ) {
                return 'map-vendor'
              }
              // Turf.js (geographic library - can be large)
              if (id.includes('@turf')) {
                return 'turf-vendor'
              }
              // Other large vendor libraries
              if (id.includes('@transport-for-the-north/vis-core')) {
                return 'vis-core-vendor'
              }
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
      exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'], // Exclude Playwright E2E tests
      server: {
        deps: {
          inline: ['lz-string', '@transport-for-the-north/vis-core'],
        },
      },
    },
  }
})