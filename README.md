# DayFlow

A professional daily planner and productivity application. Built with React, Vite, Tailwind CSS, and Supabase.

## Features

- **Today View** — Adaptive daily command center with pinnable, hideable widgets ordered by time of day
- **Tasks** — NLP-powered task entry, priority levels, categories, recurring tasks, sub-tasks, projects
- **Habits** — Streak tracking, habit rules, loop optimiser, weekly calendar heatmap
- **Goals** — Milestone tracking, AI goal breakdown, forecasting
- **Focus** — Pomodoro timer with session history and XP rewards
- **Notes / Ideas / Brain Dump / Bookmarks** — Full thought capture system
- **Insights** — Productivity heatmap, mood chart, category trends, weekly/monthly comparisons
- **AI Coach** — Weekly coaching, auto-journal drafts, daily feedback (Groq API)
- **Balance Wheel** — Life area scoring
- **Workouts** — Recurring session tracking
- **Calendar / Schedule** — Monthly calendar view and time-block planner
- **PWA** — Installable, offline-first with background sync, push notifications
- **3 Themes** — Light, Dark, Forest with full CSS variable design system
- **Gamification** — XP, level system, achievements, streak celebrations

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 8 |
| Styling | Tailwind CSS 3 + CSS variables |
| Routing | React Router 7 |
| Backend / Auth | Supabase |
| Dates | date-fns 3 |
| Animations | Tailwind keyframes |
| AI | Groq (Llama) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 20.19+ (or 22.12+)
- A Supabase project (or run in demo/localStorage mode without one)

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/bojan09/day_flow.git
cd day_flow

# 2. Install dependencies
npm install

# 3. Configure environment (optional — app runs in demo mode without this)
cp .env.example .env.local
# Edit .env.local and add your Supabase credentials:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Start development server
npm run dev
```

The app runs at `http://localhost:5173`.

**Demo mode:** If no `.env.local` is provided, the app runs fully in localStorage mode with no authentication required. All features work except cloud sync.

### Supabase Setup

Run the migration files in your Supabase SQL editor in this order:

1. `supabase/schema.sql` — Main tables and RLS policies
2. `supabase/storage.sql` — Storage bucket for avatar uploads
3. `supabase/migration-task-reminders.sql` — Legacy reminder columns (safe to skip when using V2 core)
4. `supabase/migration-recurrence-controls.sql` — Legacy recurrence columns (safe to skip when using V2 core)
5. `supabase/migrations/202608120001_dayflow_v2_core.sql` — Task reconciliation, Capture Inbox, and OneSignal preference/delivery tables
6. `supabase/migrations/202608120002_notification_cron.sql` — Vault-backed five-minute OneSignal scheduler
7. `supabase/email-templates.sql` — Custom auth email templates (optional)
8. `supabase/oauth-setup.sql` — Google OAuth configuration (optional)

`supabase/push-subscriptions.sql` belongs to the deprecated native VAPID system. Existing deployments retain that table for rollback safety; V2 does not delete production data.

### OneSignal delivery

After applying `202608120002_notification_cron.sql`, configure Vault secrets named `project_url` and `cron_secret`, then deploy the scheduler:

```bash
supabase functions deploy process-notifications --no-verify-jwt
supabase secrets set ONESIGNAL_APP_ID=... ONESIGNAL_REST_API_KEY=... CRON_SECRET=... PUBLIC_APP_URL=https://your-dayflow-domain.example
```

`--no-verify-jwt` is used because the function performs its own constant-time `CRON_SECRET` authorization. Keep the REST API key and cron secret server-side; do not prefix either with `VITE_`.

Configure the OneSignal web app with the same production origin. DayFlow loads the v16 SDK only after `VITE_ONESIGNAL_APP_ID` is configured and uses `/push/onesignal/OneSignalSDKWorker.js` with the isolated `/push/onesignal/` scope. See [`docs/dayflow-v2-manual-qa.md`](docs/dayflow-v2-manual-qa.md) for deployment and live-delivery checks.

### Build for Production

```bash
npm run build
# Output in /dist
```

## Project Structure

```
src/
├── components/       # All UI components, grouped by feature
│   ├── auth/         # Auth forms, guards, user menu
│   ├── dashboard/    # App shell: TopBar, SideNav, BottomNav, MobileDrawer
│   ├── today/        # Today view and all its widgets
│   ├── tasks/        # Task management
│   ├── habits/       # Habit tracking
│   ├── insights/     # Analytics and AI coaching
│   ├── ui/           # Shared primitives: Button, Card, Modal, etc.
│   └── ...           # One directory per feature
├── hooks/            # Custom React hooks (data + UI state)
├── services/         # Supabase client, mappers, storage, notifications
├── layouts/          # DashboardLayout
├── pages/            # Route-level page components
└── utils/            # Date helpers, constants, toast, PWA utilities
```

## Architecture Notes

- **No inline CSS** — all colours use CSS variables (`var(--bg)`, `var(--accent)`, etc.) for theme compatibility
- **camelCase ↔ snake_case** — all Supabase reads/writes pass through `src/services/mappers.js`
- **Offline-first** — writes queue locally when offline and replay on reconnect via `useOfflineQueue`
- **Lazy loading** — secondary and tertiary views are code-split for fast initial load
- **Auth** — `useAuth` (JSX) is the single canonical auth hook; do not create a `.js` duplicate

## Deployment

The project is configured for Vercel (`vercel.json` handles SPA routing). Any static host works.

```bash
# Deploy with Vercel CLI
vercel --prod
```

Set the following environment variables in your hosting provider:

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Recommended | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Recommended | Supabase anon key |
| `VITE_ONESIGNAL_APP_ID` | For web push | OneSignal Web App ID. The SDK remains disabled when omitted. |
| `GROQ_API_KEY` | For AI features | **Server-side only** — set in Vercel project env. Powers all AI features via the `/api/ai` proxy (Groq free tier). Never prefix with `VITE_`. |

AI features call the `/api/ai` Vercel serverless function, so they work on the deployed app (or `vercel dev` locally) — not under plain `vite dev`.

## License

Private project — all rights reserved.
