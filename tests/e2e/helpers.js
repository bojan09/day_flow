// Test helpers: shared demo-mode setup for e2e specs.
import { expect } from '@playwright/test'

/**
 * Enter demo mode from a cold load and land on a clean dashboard view.
 *
 * Demo mode can stack two first-run modals (onboarding, then weekly review)
 * with a render delay between them, so this doesn't check-once-and-move-on —
 * it loops dismissing whatever overlay is on top until none remain. A
 * single up-front isVisible() check without a settle pause missed the
 * second modal entirely and left it intercepting every later click.
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
  for (let i = 0; i < 5; i++) {
    const skipSetup = page.getByRole('button', { name: /skip setup/i })
    if (await skipSetup.isVisible().catch(() => false)) {
      await skipSetup.click()
      await page.waitForTimeout(500)
      continue
    }
    const closeReview = page.getByRole('button', { name: /^close$/i })
    if (await closeReview.isVisible().catch(() => false)) {
      await closeReview.click()
      await page.waitForTimeout(500)
      continue
    }
    break
  }
}

export async function goToDailyGoals(page) {
  await dismissModals(page)
  await page.getByRole('button', { name: /^dailygoals$/i }).first().click()
  await expect(page.locator('h1')).toHaveText(/dailygoals/i)
  await dismissModals(page)
}
