// Tests: stoicThemeSelection — the spec forbids showing a random quote each
// day, so these pin the context rules and the determinism.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { selectTheme, selectReference } from './stoicThemeSelection.js'
import { STOIC_REFERENCES } from './stoicReferences.js'

test('no signal yields no themed pick', () => {
  assert.equal(selectTheme({ todayTaskCount: 3, overdueCount: 1 }), null)
})

test('a backlog selects adversity, ahead of everything else', () => {
  const picked = selectTheme({
    overdueCount: 6, todayTaskCount: 12, yesterdayLivedIntention: 'not_today', hasCarryForward: true,
  })
  assert.equal(picked.theme, 'adversity')
})

test('a heavy day selects control', () => {
  assert.equal(selectTheme({ todayTaskCount: 9 }).theme, 'control')
})

test('yesterday off-intention selects discipline, not judgement', () => {
  assert.equal(selectTheme({ yesterdayLivedIntention: 'not_today' }).theme, 'discipline')
})

test('a carry-forward note selects responsibility', () => {
  assert.equal(selectTheme({ hasCarryForward: true }).theme, 'responsibility')
})

test('a partial day selects patience', () => {
  assert.equal(selectTheme({ yesterdayLivedIntention: 'partially' }).theme, 'patience')
})

test('an empty day selects presence', () => {
  assert.equal(selectTheme({ todayTaskCount: 0, overdueCount: 0 }).theme, 'presence')
})

test('a selected reference actually carries the chosen theme', () => {
  const ref = selectReference('2026-09-04', { todayTaskCount: 10 })
  assert.equal(ref.theme, 'control')
  assert.ok(ref.themes.includes('control'))
  assert.ok(ref.reason)
})

test('the same day always resolves to the same reference', () => {
  const a = selectReference('2026-09-04', { overdueCount: 6 })
  const b = selectReference('2026-09-04', { overdueCount: 6 })
  assert.equal(a.id, b.id)
})

test('an ordinary day — no rule fires — still returns a verified reference', () => {
  // Deliberately mid-range: too few tasks to be heavy, too few overdue to be a
  // backlog, and not empty enough to count as an open day.
  const ref = selectReference('2026-09-04', { todayTaskCount: 3, overdueCount: 1 })
  assert.ok(ref)
  assert.equal(ref.reason, null, 'no context reason to show')
  assert.ok(STOIC_REFERENCES.some(r => r.id === ref.id))
})

test('an empty context reads as an open day rather than no signal', () => {
  const ref = selectReference('2026-09-04', {})
  assert.equal(ref.theme, 'presence')
})

test('a theme with no verified quote falls back rather than returning nothing', () => {
  // 'acceptance' is a spec theme the curated set has no verified quote for yet.
  const pool = STOIC_REFERENCES.filter(r => r.themes.includes('time'))
  const ref = selectReference('2026-09-04', { todayTaskCount: 9 }, pool) // wants 'control'
  assert.ok(ref, 'must still return something')
  assert.equal(ref.theme, null, 'reports that no themed match was possible')
})

test('a non-numeric seed still resolves to a real reference', () => {
  // The evening passes "<date>-evening" to get a different passage from the
  // morning. Summing the parts as numbers made this NaN and returned undefined,
  // which rendered as an empty quote.
  const ref = selectReference('2026-09-04-evening', { todayTaskCount: 3, overdueCount: 1 })
  assert.ok(ref, 'must return a reference')
  assert.ok(ref.quote && ref.quote.length > 0, 'quote must not be empty')
  assert.ok(ref.author, 'author must not be empty')
})

test('morning and evening seeds are independent', () => {
  const morning = selectReference('2026-09-04', { todayTaskCount: 3, overdueCount: 1 })
  const evening = selectReference('2026-09-04-evening', { todayTaskCount: 3, overdueCount: 1 })
  assert.ok(morning.quote && evening.quote)
  // Both must be real entries; they may coincide, but neither may be blank.
  assert.ok(STOIC_REFERENCES.some(r => r.id === morning.id))
  assert.ok(STOIC_REFERENCES.some(r => r.id === evening.id))
})

test('every reference carries an attribution and a translation', () => {
  // Guards the spec rule against unattributed or fabricated quotations.
  for (const r of STOIC_REFERENCES) {
    assert.ok(r.quote && r.quote.length > 0, `${r.id} has a quote`)
    assert.ok(r.author, `${r.id} names an author`)
    assert.ok(r.work, `${r.id} names a work`)
    assert.ok(r.translation, `${r.id} names the translation it quotes`)
    assert.ok(Array.isArray(r.themes) && r.themes.length, `${r.id} has themes`)
  }
})
