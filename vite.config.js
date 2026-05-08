// Config: Vite build tool configuration
// v6.4: manual chunk splitting for optimal caching and lazy loading
import { defineConfig } from 'vite'
import react           from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader:  'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: { loader: { '.js': 'jsx' } },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk — rarely changes, cached long-term
          'vendor-react':    ['react', 'react-dom'],
          'vendor-router':   ['react-router-dom'],
          'vendor-dates':    ['date-fns'],
          'vendor-supabase': ['@supabase/supabase-js'],

          // Core views — loaded on first visit
          'views-core':  [
            './src/components/today/TodayView',
            './src/components/tasks/TasksView',
            './src/components/habits/HabitsView',
            './src/components/focus/FocusMode',
          ],

          // Secondary views — lazy loaded
          'views-secondary': [
            './src/components/notes/NotesView',
            './src/components/goals/GoalsView',
            './src/components/calendar/CalendarView',
            './src/components/workouts/WorkoutsView',
            './src/components/insights/InsightsView',
          ],

          // Tertiary views — loaded on demand
          'views-tertiary': [
            './src/components/balance/BalanceView',
            './src/components/braindump/BrainDump',
            './src/components/challenges/ChallengesView',
            './src/components/projects/ProjectsView',
            './src/components/bookmarks/BookmarksView',
            './src/components/weekly/WeeklyReview',
            './src/components/ideas/IdeasView',
            './src/components/routines/RoutinesView',
            './src/components/timeblock/TimeBlockView',
            './src/components/search/SearchView',
          ],
        },
      },
    },
    // Warn when a chunk exceeds 500kb
    chunkSizeWarningLimit: 500,
  },
})
