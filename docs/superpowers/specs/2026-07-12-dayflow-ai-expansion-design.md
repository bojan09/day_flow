# DayFlow AI Expansion — Design Spec

Date: 2026-07-12
Status: Approved, pending implementation plan
Related: [2026-07-12-dayflow-rebrand-design.md](./2026-07-12-dayflow-rebrand-design.md) (independent subsystem — visual rebrand does not depend on this, can ship separately/in parallel)

## Context

DayFlow already has AI groundwork: a server-side proxy (`api/ai.js`, Vercel function) that keeps the API key server-only, `AICoach.jsx` (weekly coaching), `AIDailyFeedback.jsx` (daily feedback), and `nlpParser.js` (local, non-AI regex-based task text parsing). This spec expands AI capability and migrates the backend off Anthropic to a free-tier provider.

## Goals

- Migrate the AI backend from Anthropic (paid) to **Groq** (free tier) with no change to the client-facing proxy contract.
- Add three new AI-powered capabilities, in order: universal natural-language capture, smart scheduling assistant, AI-generated routines/plans.
- Every AI-drafted change (schedule suggestion, generated routine/plan) is a suggestion the user reviews and accepts — never auto-applied silently.
- Graceful degradation: AI failures/rate-limits fall back to existing local/manual flows, never a hard error blocking the user's task.

## Non-goals

- No voice input (voice features are deprecated per existing `memory.md`/`VoiceCommandBar.jsx` status — out of scope here).
- No client-side/self-hosted model — this is the hosted-free-tier-API path, not in-browser or self-hosted inference.
- Not replacing `AICoach.jsx`/`AIDailyFeedback.jsx` designs — those get the provider swap only, not new capability, in this pass (their content/UX is unchanged; only the underlying model differs, likely for the better given more capable free-tier options at similar/better speed).

## 1. Provider migration (Anthropic → Groq)

- `api/ai.js`: swap the upstream endpoint from `https://api.anthropic.com/v1/messages` to Groq's OpenAI-compatible chat completions endpoint (`https://api.groq.com/openai/v1/chat/completions`). Auth header changes to Groq's Bearer-token scheme.
- Env var: `GROQ_API_KEY` replaces `ANTHROPIC_API_KEY` (server-side only, never `VITE_`-prefixed — same rule as before).
- Model: default to `llama-3.3-70b-versatile` (good general quality/speed balance on Groq's free tier). Keep it a named constant (like the current `MODEL`) so it's a one-line change if a better free model becomes available later.
- Request/response shape: `api/ai.js`'s external contract (`POST {system, message} → {text}`) stays identical — `aiService.js` and every component calling it (`AICoach.jsx`, `AIDailyFeedback.jsx`) needs zero changes. Internally, translate `{system, message}` into Groq's `messages: [{role:"system",...},{role:"user",...}]` format and extract `choices[0].message.content` instead of Anthropic's `content[0].text`.
- Rate limiting: keep the existing per-IP in-memory limiter; retune the window/limit constants to Groq's free-tier request-per-minute caps (verify exact current limits at implementation time — they change; keep a comment noting where to check).
- `README.md`: update the AI section to reference `GROQ_API_KEY` instead of `ANTHROPIC_API_KEY`.

## 2. Feature: Universal natural-language capture

- `src/services/nlpParser.js` currently does local, non-AI parsing (regex/date-fns) of task text only. Add an AI-backed classification path: given one typed sentence, call `/api/ai` with a system prompt asking it to classify intent (task / habit / routine / calendar event) and extract relevant fields as JSON.
- Entry point: extend the existing quick-capture surface (`QuickCapture.jsx`, `QuickTaskBar.jsx`) to route through this — not a new separate UI. The dispatch pattern already used for mobile quick-add (`dayflow:quickcapture` event, per `memory.md`) is the integration point.
- Routing: once classified, pre-fill the appropriate existing create-flow (task form, `AddHabitModal`, routine creation, calendar event) with extracted fields — user still confirms/edits before saving, this is not a silent auto-create.
- **Fallback:** if the AI call fails, is rate-limited, or the device is offline, fall back to the existing local regex parser (task-only, current behavior) rather than blocking capture entirely. This preserves the current demo-mode/offline-first guarantee.

## 3. Feature: Smart scheduling assistant

- Extends `src/hooks/useSmartScheduler.js` and `src/components/tasks/SmartSchedulerPanel.jsx` (already exist as a base).
- Given overdue/unscheduled tasks, the assistant calls `/api/ai` with context (task priority/category, existing calendar/time-block load for the target window, and energy check-in data from `useEnergy.js` if available) and returns suggested time slots.
- **Never auto-applies.** Suggestions render in the existing `SmartSchedulerPanel.jsx` UI as accept/dismiss options per task, same interaction pattern the panel already uses for its current (presumably heuristic-only) suggestions.

## 4. Feature: AI-generated routines/plans

- New entry point from the Routines page (empty state / "+ New routine" flow) and Goals page (goal breakdown). User types a goal in plain text (e.g. "morning routine for deep work", "get back into running").
- AI call returns a draft: ordered steps (for routines, pre-filling the new numbered step-builder editor from the rebrand spec) or milestones (for goals, pre-filling `AddGoalModal.jsx`/goal breakdown flow).
- Draft opens directly in the existing editor UI for review/edit — **never saved without the user hitting Save** in that editor, same as manual creation.

## Sequencing

1. Provider migration (Groq swap) — foundational, everything else depends on it working.
2. Universal natural-language capture — highest daily-use value, extends existing NLP parser most directly.
3. Smart scheduling assistant — builds on capture's classification patterns and existing `SmartSchedulerPanel.jsx`.
4. AI-generated routines/plans — most novel, least urgent, built last.

## Open items for implementation planning

- Exact current Groq free-tier rate limits (verify at implementation time, they change) — sets the retuned `WINDOW_MS`/`LIMIT` constants in `api/ai.js`.
- Whether `llama-3.3-70b-versatile` stays the default or a newer/better free Groq model should be used — check Groq's model list at implementation time.
- JSON-mode/structured-output support on Groq's API for the classification (Feature 1) and routine/plan drafting (Feature 4) calls — use it if available for reliable field extraction instead of parsing free-text AI output.
- `AICoach.jsx`/`AIDailyFeedback.jsx` prompt tuning may be needed post-migration since model behavior differs between Claude and Llama — flag for a quick prompt-quality pass after the swap, not a redesign.
