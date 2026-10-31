const assert = require('node:assert/strict')
const fs = require('node:fs'), path = require('node:path')
const { test } = require('node:test')
const { transformSync } = require('@babel/core')
const modules = new Map()
function load(file) {
  if (modules.has(file)) return modules.get(file)
  const code = transformSync(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { configFile: false, babelrc: false, plugins: [require('@babel/plugin-transform-modules-commonjs')] }).code
  const module = { exports: {} }
  new Function('require', 'module', 'exports', code)(name => name.startsWith('@/') ? load(name.slice(2) + '.js') : require(name), module, module.exports)
  modules.set(file, module.exports)
  return module.exports
}
const { workshopSteps, taskStage, taskActionTarget } = load('utils/task-board.js')
const { notificationTarget } = load('utils/task-notifications.js')
const stages = ['created', 'accepted', 'in_progress', 'completed']
function store() {
  const definition = load('store/engineer/index.js'), state = definition.state(), requests = []
  const rootState = { workspace: { company: { id: 1 } }, auth: { user: { id: 7, permissions: ['orders.view'] } } }
  const runtime = { $axios: { get(url, config) { return new Promise((resolve, reject) => requests.push({ url, params: { ...config.params }, resolve, reject })) } } }
  const context = { state, rootState, commit(name, value) { definition.mutations[name](state, value) }, dispatch(name, value) { return definition.actions[name].call(runtime, context, value) } }
  return { ...context, requests, definition }
}
function result(stage, id, page = 1, last = 1) { return { data: { orders: [{ id, workflow_stage: stage }], pagination: { current_page: page, last_page: last, total: last * 4, per_page: 4 } } } }
async function populated() { const s = store(), pending = s.dispatch('fetchBoard');s.requests.forEach((r, i) => r.resolve(result(r.params.stage, i + 1)));await pending;return s }

test('engineer and INFO file sections never become workshops, including legacy flags, while archived workshops retain history', () => {
  const order = { factory_orders: ['SW', ' info ', 'PDF', 'POWDER', 'FUTURE'].map((value, id) => ({ id, status: 'pending', factory: { value, is_workshop: true, is_active: false } })) }
  assert.deepEqual(workshopSteps(order).map(s => s.factory.value), ['POWDER', 'FUTURE'])
  order.factory_orders[0].status = 'finished'
  assert.equal(taskStage(order), 'created')
  order.factory_orders[3].status = 'accepted'
  assert.equal(taskStage(order), 'accepted')
})
test('engineer proof and request notifications identify the exact workshop action without altering other roles', () => {
  for (const [type, action] of [['step.finished_review', 'proof'], ['request.submitted', 'request']]) {
    const n = { order_id: 45, factory_order_id: 19, type }
    assert.deepEqual(notificationTarget(n, 'engineer'), { path: '/engineer', query: { order: '45', step: '19', action } })
    assert.deepEqual(notificationTarget(n, 'operator'), { path: '/factory/workspace', query: {} })
  }
  assert.deepEqual(notificationTarget({ order_id: 45, factory_order_id: 'bad' }, 'engineer').query, { order: '45' })
})
test('notification focus selects current controls, handles already-decided requests and never focuses ordinary card opens', () => {
  const order = { factory_orders: [{ id: 10, pending_request: { id: 8 } }, { id: 11, awaiting_engineer_confirmation: true }, { id: 12, status: 'finished' }] }
  assert.equal(taskActionTarget(order, null), null)
  assert.deepEqual(taskActionTarget(order, { enabled: true, stepId: 11, action: 'proof' }), { stepId: 11, kind: 'proof' })
  assert.deepEqual(taskActionTarget(order, { enabled: true, stepId: 10, action: 'request' }), { stepId: 10, kind: 'request' })
  assert.deepEqual(taskActionTarget(order, { enabled: true, stepId: 12, action: 'request' }), { stepId: 12, kind: 'step' })
  assert.deepEqual(taskActionTarget(order, { enabled: true }), { stepId: 10, kind: 'request' })
})
test('all four engineer columns load with independent pagination and the same search and confirmation filters', async () => {
  const s = store(), pending = s.dispatch('fetchBoard', { search: '101.', confirmation: 'waiting', perPage: 12, reset: true })
  assert.deepEqual(s.requests.map(r => r.params.stage), stages)
  for (const r of s.requests) { assert.equal(r.params.per_page, 12);assert.equal(r.params.search, '101.');assert.equal(r.params.confirmation, 'waiting');r.resolve(result(r.params.stage, stages.indexOf(r.params.stage) + 1)) }
  assert.equal(await pending, true)
  assert.deepEqual(stages.map(stage => s.state.boardColumns[stage].orders[0].id), [1, 2, 3, 4])
})
test('one failed column can retry without discarding the other three columns', async () => {
  const s = store(), pending = s.dispatch('fetchBoard')
  s.requests.forEach((r, i) => i === 1 ? r.reject(new Error('503')) : r.resolve(result(r.params.stage, i + 1)))
  assert.equal(await pending, false)
  assert.equal(s.state.boardColumns.accepted.error, 'loadFailed')
  assert.equal(s.state.boardColumns.completed.orders[0].id, 4)
  const retry = s.dispatch('fetchBoardColumn', { stage: 'accepted' });s.requests.at(-1).resolve(result('accepted', 22));assert.equal(await retry, true)
  assert.equal(s.state.boardColumns.accepted.error, null)
  assert.equal(s.state.boardColumns.completed.orders[0].id, 4)
})
test('turning a column page preserves the other columns and clamps a page removed by a status change', async () => {
  const s = await populated(), pending = s.dispatch('fetchBoardColumn', { stage: 'created', page: 2 })
  assert.equal(s.requests.at(-1).params.page, 2)
  s.requests.at(-1).resolve(result('created', 90, 2, 2));await pending
  assert.equal(s.state.boardColumns.accepted.orders[0].id, 2)
  const refresh = s.dispatch('fetchBoardColumn', { stage: 'created' })
  s.requests.at(-1).resolve({ data: { orders: [], pagination: { current_page: 2, last_page: 1, total: 1 } } })
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(s.requests.at(-1).params.page, 1)
  s.requests.at(-1).resolve(result('created', 91));await refresh
  assert.equal(s.state.boardColumns.created.pagination.current_page, 1)
})
test('older filters, company changes and logout cannot publish stale engineer column data or errors', async () => {
  const s = store(), old = s.dispatch('fetchBoard', { search: 'old', reset: true }), fresh = s.dispatch('fetchBoard', { search: 'fresh', reset: true })
  s.requests.slice(4).forEach((r, i) => r.resolve(result(r.params.stage, 20 + i)));await fresh
  s.requests.slice(0, 4).forEach(r => r.reject(new Error('old failure')));await old
  assert.equal(s.state.boardColumns.created.orders[0].id, 20)
  assert.equal(s.state.boardColumns.created.error, null)
  const other = s.dispatch('fetchBoard');s.rootState.workspace.company.id = 2
  s.requests.slice(-4).forEach(r => r.resolve(result(r.params.stage, 99)));await other
  assert.equal(s.state.boardColumns.created.orders[0].id, 20)
  assert.deepEqual(s.definition.getters.getBoardColumns(s.state, {}, s.rootState).created.orders, [])
  const loggedOut = s.dispatch('fetchBoard', { reset: true });s.rootState.auth.user = null
  s.requests.slice(-4).forEach(r => r.resolve(result(r.params.stage, 100)));await loggedOut
  assert.deepEqual(s.state.boardColumns.created.orders, [])
})
test('closing the engineer board invalidates pending work and per-column size remains bounded', async () => {
  const s = store(), pending = s.dispatch('fetchBoard', { perPage: 1000 })
  assert.equal(s.state.boardPerPage, 100)
  s.commit('INVALIDATE_BOARD');s.requests.forEach(r => r.resolve(result(r.params.stage, 9)));await pending
  assert.deepEqual(s.state.boardColumns.created.orders, [])
  assert.equal(s.state.boardColumns.created.loading, false)
})

test('denied or switching workspaces never issue engineer board requests', async () => {
 const s = store(); s.rootState.auth.user.permissions = []
 assert.equal(await s.dispatch('fetchBoard'), false); assert.equal(s.requests.length, 0)
 s.rootState.auth.user.permissions = ['orders.view']; s.rootState.workspace.switching = true
 assert.equal(await s.dispatch('fetchBoard'), false); assert.equal(s.requests.length, 0)
})
