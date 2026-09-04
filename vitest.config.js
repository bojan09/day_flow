// Config: Vitest — component/hook tests only.
// Pure-logic tests run on node:test (`npm test`); these need the app's own
// module resolution (extensionless imports) and a DOM, which vitest provides
// by reusing the Vite config.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.jsx'],
    globals: false,
  },
})
