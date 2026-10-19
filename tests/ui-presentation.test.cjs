const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const { transformSync } = require('@babel/core')
const compiler = require('vue-template-compiler')
function load(file) {
  let source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  if (file.endsWith('.vue')) source = compiler.parseComponent(source).script.content
  const code = transformSync(source, { configFile: false, babelrc: false, plugins: [require('@babel/plugin-transform-modules-commonjs')] }).code
  const module = { exports: {} }
  new Function('module', 'exports', code)(module, module.exports)
  return module.exports
}
const { taskDeadline } = load('utils/task-deadline.js')
const now = Date.parse('2026-10-19T12:00:00Z')
test('task deadlines distinguish remaining, overdue, missing and invalid values', () => {
  assert.deepEqual(taskDeadline('2026-10-21T15:00:00Z', { now }), { label: 'Մնացել է՝ 2 օր 3 ժ', tone: 'neutral' })
  assert.deepEqual(taskDeadline('2026-10-19T17:00:00Z', { now }), { label: 'Մնացել է՝ 5 ժ', tone: 'amber' })
  assert.deepEqual(taskDeadline('2026-10-18T10:00:00Z', { now }), { label: 'Ժամկետն անցել է՝ 1 օր 2 ժ', tone: 'red' })
  for (const value of ['', undefined, 'not a date']) assert.deepEqual(taskDeadline(value, { now }), { label: 'Ժամկետ նշված չէ', tone: 'neutral' })
})
test('finished and rejected tasks never display an overdue countdown', () => {
  assert.deepEqual(taskDeadline('2020-01-01', { completed: true, now }), { label: 'Ավարտված է', tone: 'green' })
  assert.deepEqual(taskDeadline('2020-01-01', { rejected: true, now }), { label: 'Մերժված է', tone: 'neutral' })
})
test('deadline labels are readable in every existing interface language', () => {
  assert.equal(taskDeadline('2026-10-20T14:00:00Z', { locale: 'ru', now }).label, 'Осталось: 1 д 2 ч')
  assert.equal(taskDeadline('2026-10-18T10:00:00Z', { locale: 'en', now }).label, 'Overdue by: 1 d 2 h')
  assert.equal(taskDeadline('2026-10-19T12:30:00Z', { locale: 'en', now }).label, 'Remaining: less than an hour')
})
test('operator avatars support Armenian names, extra spaces and unassigned work', () => {
  const initials = load('components/ui/PersonAvatar.vue').default.computed.initials
  assert.equal(initials.call({ name: '  Գոռ  Ավետիսյան  ' }), 'ԳԱ')
  assert.equal(initials.call({ name: 'QA Operator' }), 'QO')
  assert.equal(initials.call({ name: '' }), '?')
})

test('admin and manager task editors save through their existing authorized API routes', async () => {
  const { actions } = load('store/orders/index.js')
  const payload = { name: '101.02', description: 'Keep every existing field', factories: [{ id: 1 }], status: 'pending' }
  for (const [role, expected] of [['admin', '/api/admin/order/18'], ['manager', '/api/orders/order/18']]) {
    const commits = []
    const saved = { order: { ...payload, id: 18 }, message: 'saved' }
    const result = await actions.updateOrder.call({
      $auth: { user: { role: { name: role } } },
      $axios: { async put(url, data) { assert.equal(url, expected); assert.strictEqual(data, payload); return { data: saved } } },
    }, { commit: (...args) => commits.push(args) }, { id: 18, payload })
    assert.strictEqual(result, saved)
    assert.deepEqual(commits, [['SET_ORDER', saved.order]])
  }
})

test('a failed task edit preserves the server error and propagates it to the existing modal', async () => {
  const { actions } = load('store/orders/index.js')
  const error = Object.assign(new Error('Temporary failure'), { response: { data: { message: 'Try again' } } })
  const commits = []
  await assert.rejects(actions.updateOrder.call({ $auth: { user: { role: { name: 'admin' } } }, $axios: { async put() { throw error } } }, { commit: (...args) => commits.push(args) }, { id: 18, payload: {} }), e => e === error)
  assert.deepEqual(commits, [['ERROR', error.response.data]])
})
