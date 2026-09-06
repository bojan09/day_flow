// Config: Playwright
// Purpose: Real-browser critical-path tests against the built demo-mode app.
//
// This exists to catch a class of bug the unit/DOM suite structurally
// cannot: things that only break in an actual browser against a real build —
// the service-worker caching a stale bundle, a route guard bouncing a click
// that "worked" in jsdom, a reload silently losing state. All three of those
// bit this project mid-session before this suite existed. Run via
// `npm run test:e2e`, which builds the app in demo mode (no Supabase keys)
// first — see scripts/e2e.sh.
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false, // the app shares one localStorage-backed demo dataset per run
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
