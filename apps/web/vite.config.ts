import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: { port: 5173 },
  resolve: {
    alias: {
      '@nico/battle-core': fileURLToPath(new URL('../../packages/battle-core/src', import.meta.url)),
    }
  }
})
