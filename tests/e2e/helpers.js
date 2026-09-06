// Test helpers: shared demo-mode setup for e2e specs.
import { expect } from '@playwright/test'

/**
 * Enter demo mode from a cold load and land on a clean dashboard view.
 *
 * Demo mode can stack two first-run modals — onboarding and the weekly
 * review — that mount independently with no coordination between them, so
 * either can still be animating in while the other is already clickable.
 * This doesn't check-once-and-move-on: it loops, waits for each candidate
 * to actually become visible rather than trusting a single snapshot, and
 * gives each click a short timeout so one genuinely covered by the other
 * modal fails fast and the loop retries instead of hanging for the whole
 * test budget. All three properties were needed — earlier versions of this
 * helper flaked under exactly this stacking a few times before landing here.
 */
export async function enterDemoMode(page) {
  // '/' redirects to /welcome (marketing) in demo mode — the "try without an
  // account" entry lives on /auth, so go straight there.
  await page.goto('/auth')
  await page.getByRole('button', { name: /try without an account/i }).click()
  await page.waitForURL(/\/dashboard/)
  await page.waitForTimeout(500) // let the first modal mount before checking
  await dismissModals(page)
}

async function dismissModals(page) {
  for (let i = 0; i < 6; i++) {
    const skipSetup   = page.getByRole('button', { name: /skip setup/i })
    const closeReview = page.getByRole('button', { name: /^close$/i })

    // waitFor(visible) rather than a single isVisible() snapshot: the two
    // modals mount independently and a point-in-time check can run in the
    // gap before the second one has rendered, missing it entirely.
    if (await waitVisible(skipSetup)) {
      // A short per-click timeout, not the test's full 30s: onboarding and
      // the weekly review can both become "visible" (present, not
      // display:none) while one still covers the other, so a click can hang
      // on a genuinely-covered element. Failing fast lets the loop retry
      // from scratch — re-checking Skip setup first — instead of spending
      // the whole test budget stuck on one click.
      if (await tryClick(skipSetup)) { await page.waitForTimeout(400); continue }
    }
    if (await waitVisible(closeReview)) {
      if (await tryClick(closeReview)) { await page.waitForTimeout(400); continue }
    }
    break
  }
}

function waitVisible(locator, timeout = 1000) {
  return locator.first().waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false)
}

function tryClick(locator, timeout = 2000) {
  return locator.click({ timeout }).then(() => true).catch(() => false)
}

export async function goToDailyGoals(page) {
  await dismissModals(page)
  await page.getByRole('button', { name: /^dailygoals$/i }).first().click()
  await expect(page.locator('h1')).toHaveText(/dailygoals/i)
  await dismissModals(page)
}
