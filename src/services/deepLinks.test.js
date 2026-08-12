import assert from 'node:assert/strict'; import test from 'node:test'; import { normalizeDeepLink, dashboardStateFromLocation } from './deepLinks.js'
test('maps approved links',()=>{ assert.equal(normalizeDeepLink('/tasks/a').search,'?openTask=a'); assert.equal(normalizeDeepLink('/focus/a').search,'?focusTask=a'); assert.equal(normalizeDeepLink('/habits').hash,'#habits') })
test('rejects unsafe links',()=>{ for(const value of ['https://evil.example','//evil.example','/tasks\\a','/%2e%2e/secret','/unknown']) assert.equal(normalizeDeepLink(value),null) })
test('derives dashboard state',()=>assert.deepEqual(dashboardStateFromLocation({pathname:'/dashboard',search:'?openTask=a&action=add-task',hash:'#tasks'}),{tab:'tasks',openTaskId:'a',focusTaskId:null,action:'add-task'}))
