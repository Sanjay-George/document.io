import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // anchor.ts drives the real DOM (querySelectorAll, CSS.escape) — needs jsdom.
    environment: 'jsdom',
    // Tests live in a dedicated tests/ tree (mirroring src/), not co-located.
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        // Remove hashes from filenames
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      }
    }
  },
})
