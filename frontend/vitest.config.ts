import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
    deps: {
      // Apollo Client 4 : le package separe core et react en sous-modules.
      // Vite dev pre-bundle tout avec esbuild, mais vitest SSR utilise CJS
      // par defaut. optimizer.web force le pre-bundling comme en dev.
      optimizer: {
        web: {
          include: ['@apollo/client', '@apollo/client/testing'],
        },
      },
    },
  },
})
