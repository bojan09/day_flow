// Config: Vite build tool configuration
// Function-based manualChunks: object form previously let rollup merge
// react into vendor-router, producing a 0.04kB vendor-react chunk.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('react-router') ||
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/scheduler/')) return 'vendor-react'
          if (id.includes('date-fns')) return 'vendor-dates'
          if (id.includes('@supabase')) return 'vendor-supabase'

          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
