import assert from 'node:assert/strict'
import test from 'node:test'
import { buildRecoveryQueue, shouldOfferRecovery } from './recovery.js'

test('requires a meaningful overdue backlog and excludes completed work', () => {
  const queue = buildRecoveryQueue({ tasks: [{ id: 'a', date: '2026-08-10', completed: false }, { id: 'b', date: '2026-08-10', completed: true }], habits: [], routines: [], today: '2026-08-12' })
  assert.deepEqual(queue.map(item => item.id), ['a'])
  assert.equal(shouldOfferRecovery(queue), false)
})
test('offers for three overdue tasks or combined backlog of four', () => {
  const overdue = [1,2,3].map(id => ({ id: String(id), type: 'task', overdue: true }))
  assert.equal(shouldOfferRecovery(overdue), true)
  assert.equal(shouldOfferRecovery([overdue[0], { type: 'habit' }, { type: 'routine' }, { type: 'habit' }]), true)
})
test('orders oldest tasks before habits and routines', () => {
  const queue = buildRecoveryQueue({ tasks: [{ id: 'b', date: '2026-08-11' }, { id: 'a', date: '2026-08-09' }], habits: [{ id: 'h', name: 'Walk', missed: true }], routines: [{ id: 'r', name: 'Morning', completion: 20 }], today: '2026-08-12' })
  assert.deepEqual(queue.map(item => item.id), ['a','b','h','r'])
})
