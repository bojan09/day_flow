// E2E: completing a task must survive a real page reload.
//
// This is the exact regression class fixed in commit c399aac: toggleTask
// assigned its target inside the setTasks updater and read it on the next
// line, so persist() usually never ran. The unit test for that bug mocks
// persist() and asserts it was called — correct, but it cannot see whether
// a real reload in a real browser actually shows the task as done. This
// spec closes that gap by driving the whole stack: click → localStorage
// write → full page reload → re-render from storage.
import { test, expect } from '@playwright/test'
import { enterDemoMode, goToDailyGoals } from './helpers.js'

test('completing a task survives a reload', async ({ page }) => {
  await enterDemoMode(page)
  await goToDailyGoals(page)

  const title = `E2E persistence check ${Date.now()}`

  // The quick-add row. Targeted by aria-label rather than the placeholder:
  // the placeholder rotates through example phrases every 30s, and a second
  // input elsewhere on the page (NLPTaskInput) happens to share one of those
  // phrases as its own static placeholder — a real strict-mode ambiguity
  // this hit during development.
  const quickAdd = page.getByRole('textbox', { name: 'Quick add task' })
  await quickAdd.fill(title)
  await quickAdd.press('Enter')

  const row = page.locator('li', { hasText: title })
  await expect(row).toBeVisible()

  // The row's checkbox is the first button in the row.
  await row.getByRole('button').first().click()

  // The real assertion: reload from scratch and confirm the write landed.
  await page.reload()
  await goToDailyGoals(page)

  // Filter to Done, where a completed task belongs.
  await page.getByRole('button', { name: /^done$/i }).click()
  await expect(page.locator('li', { hasText: title })).toBeVisible()
})

test('deleting a task survives a reload', async ({ page }) => {
  await enterDemoMode(page)
  await goToDailyGoals(page)

  const title = `E2E delete check ${Date.now()}`
  const quickAdd = page.getByRole('textbox', { name: 'Quick add task' })
  await quickAdd.fill(title)
  await quickAdd.press('Enter')

  const row = page.locator('li', { hasText: title })
  await expect(row).toBeVisible()
  await row.hover()
  await row.getByRole('button', { name: /delete task/i }).click()

  await expect(page.getByText(/task deleted/i)).toBeVisible()

  await page.reload()
  await goToDailyGoals(page)
  await page.getByRole('button', { name: /^all$/i }).click()
  await expect(page.locator('li', { hasText: title })).toHaveCount(0)
})
