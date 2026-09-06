#!/usr/bin/env bash
# Runs the Playwright e2e suite against a demo-mode build.
#
# The app only renders in usable demo mode (AuthGuard passes everyone
# through, "Try without an account" actually reaches /dashboard) when no
# Supabase keys are present at build time — see AuthGuard.jsx. Real keys
# configured means every /dashboard hit with no session bounces to /auth,
# which is not what these tests exercise. So: move any real keys aside,
# build, test, and restore the keys no matter how the test run ends.
set -euo pipefail
cd "$(dirname "$0")/.."

restore() {
  [ -f .env.realkeys.bak ]       && mv .env.realkeys.bak .env
  [ -f .env.local.realkeys.bak ] && mv .env.local.realkeys.bak .env.local
  return 0
}
trap restore EXIT

[ -f .env ]       && mv .env .env.realkeys.bak
[ -f .env.local ] && mv .env.local .env.local.realkeys.bak

npm run build
npx playwright test "$@"
