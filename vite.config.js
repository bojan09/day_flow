// Config: Vite build tool configuration
// Function-based manualChunks: object form previously let rollup merge
// react into vendor-router, producing a 0.04kB vendor-react chunk.
import { defineConfig } from 'vite'
import react           from '@vitejs/plugin-react'

// View chunk groups (paths matched against module id)
const VIEW_CHUNKS = {
  'views-core': [
    '/components/today/TodayView',
    '/components/tasks/TasksView',
    '/components/goals/GoalsView',
    '/components/habits/HabitsView',
    '/components/focus/FocusMode',
  ],
  'views-secondary': [
    '/components/notes/NotesView',
    '/components/calendar/CalendarView',
    '/components/workouts/WorkoutsView',
    '/components/insights/InsightsView',
  ],
  'views-tertiary': [
    '/components/balance/BalanceView',
    '/components/braindump/BrainDump',
    '/components/challenges/ChallengesView',
    '/components/projects/ProjectsView',
    '/components/bookmarks/BookmarksView',
    '/components/weekly/WeeklyReview',
    '/components/ideas/IdeasView',
    '/components/routines/RoutinesView',
    '/components/timeblock/TimeBlockView',
    '/components/search/SearchView',
  ],
}

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader:  'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: { loader: { '.js': 'jsx' } },
    // Pre-bundle these up front. Most views are lazy-loaded, so otherwise Vite
    // only discovers their deps when a view is first opened and re-optimizes
    // mid-session, forcing a reload each time on a cold cache. Vite handles
    // that correctly on its own — this just avoids the churn. Dev-only;
    // production is pre-bundled by Rollup regardless.
    include: ['react', 'react-dom', 'react-router', 'lucide-react', 'date-fns'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-router'))    return 'vendor-router'
            if (id.includes('/react/') ||
                id.includes('/react-dom/') ||
                id.includes('/scheduler/'))     return 'vendor-react'
            if (id.includes('date-fns'))        return 'vendor-dates'
            if (id.includes('@supabase'))       return 'vendor-supabase'
            return 'vendor-misc'
          }
          for (const [chunk, paths] of Object.entries(VIEW_CHUNKS)) {
            if (paths.some(p => id.includes(p))) return chunk
          }
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
