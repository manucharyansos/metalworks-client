const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const { transformSync } = require('@babel/core')
const Vue = require('vue')
const loaded = new Map()
function load(name) {
  if (loaded.has(name)) return loaded.get(name)
  let source = fs.readFileSync(path.join(__dirname, '..', name), 'utf8')
  if (name.endsWith('.vue')) source = source.match(/<script>([\s\S]*?)<\/script>/)[1]
  const code = transformSync(source, { configFile: false, babelrc: false, plugins: [require('@babel/plugin-transform-modules-commonjs')] }).code
  const module = { exports: {} }
  new Function('require', 'module', 'exports', code)(request => request.endsWith('.vue') ? {} : request.startsWith('@/') ? load(request.slice(2) + '.js') : require(request), module, module.exports)
  loaded.set(name, module.exports)
  return module.exports
}
const route = load('utils/production-route.js')

test('file defaults preserve independent production paths and explicit task overrides', () => {
  const workshops = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]
  const files = [{ id: 10, production_factory_ids: [1, 2, 4] }, { id: 11, production_factory_ids: [3, 4] }]
  const routing = [{ file_id: 10, factory_ids: [1, 2, 4] }, { file_id: 11, factory_ids: [3, 4] }]
  const plan = route.routeFromFilePlans(files, workshops, routing)
  assert.equal(route.routeHasCycle(plan), false)
  assert.deepEqual(plan.stages.find(row => row.factory_id === 2).predecessor_factory_ids, [1])
  assert.deepEqual(plan.stages.find(row => row.factory_id === 4).predecessor_factory_ids, [2, 3])
  const changed = route.routeFromFilePlans(files, workshops, [{ file_id: 10, factory_ids: [4] }, { file_id: 11, factory_ids: [3, 4] }])
  assert.deepEqual(changed.stages.find(row => row.factory_id === 4).predecessor_factory_ids, [3])
  assert.equal(route.routeFromFilePlans([{ id: 9 }], workshops, []).mode, 'parallel', 'legacy defaults retain their previous behavior')
})
const factories = [{ id: 1, name: 'Laser' }, { id: 2, name: 'Bend' }, { id: 3, name: 'Powder' }]
const steps = () => factories.map((factory, index) => ({ id: index + 10, factory_id: factory.id, factory, status: 'pending', route_position: index, predecessor_ids: index ? [index + 9] : [], deadline: null }))
const order = () => ({ id: 55, company_id: 7, factory_orders: steps(), dates: { finish_date: '2026-11-20' } })
function component(name, propsData) {
  const definition = load(name).default
  return new Vue({ ...definition, mounted: [], beforeCreate() { this.$auth = { user: { id: 9 } }; this.$store = { state: { workspace: { company: { id: 7 } } } }; this.$notify = () => {} }, propsData })
}

test('sequential routes follow the chosen order; parallel routes remove dependencies', () => {
  const sequential = route.normalizeRoute({}, factories)
  assert.deepEqual(sequential.stages.map(row => row.predecessor_factory_ids), [[], [1], [2]])
  const reordered = route.normalizeRoute({ ...sequential, stages: [sequential.stages[1], sequential.stages[0], sequential.stages[2]] }, factories)
  assert.deepEqual(reordered.stages.map(row => row.predecessor_factory_ids), [[], [2], [1]])
  assert.deepEqual(route.normalizeRoute({ ...reordered, mode: 'parallel' }, factories).stages.map(row => row.predecessor_factory_ids), [[], [], []])
})

test('a mixed join waits for two independent branches and detects indirect cycles', () => {
  const plan = route.normalizeRoute({ mode: 'custom', stages: [{ factory_id: 3, predecessor_factory_ids: [2, 1] }] }, factories)
  assert.equal(route.routeHasCycle(plan), false)
  assert.deepEqual(plan.stages[0].predecessor_factory_ids, [1, 2])
  plan.stages.find(row => row.factory_id === 1).predecessor_factory_ids = [3]
  assert.equal(route.routeHasCycle(plan), true)
})

test('changing selected workshops prunes old company IDs and adds new workshops independently in mixed mode', () => {
  const plan = route.normalizeRoute({ mode: 'custom', stages: [{ factory_id: 8, deadline: '2026-11-05' }, { factory_id: 2, predecessor_factory_ids: [8, 1], deadline: '2026-11-06' }] }, [factories[1], factories[2]])
  assert.deepEqual(plan.stages, [{ factory_id: 2, predecessor_factory_ids: [], deadline: '2026-11-06' }, { factory_id: 3, predecessor_factory_ids: [], deadline: null }])
})

test('deadline warnings cover both overall deadline and preceding stage dates', () => {
  const plan = route.normalizeRoute({ stages: [{ factory_id: 1, deadline: '2026-11-12' }, { factory_id: 2, deadline: '2026-11-10' }, { factory_id: 3, deadline: '2026-11-21' }] }, factories)
  assert.deepEqual(route.routeWarnings(plan, '2026-11-20T10:00:00'), [2, 3])
})

test('legacy dependencies and explicit empty lists round-trip without exposing predecessor objects', () => {
  const rows = steps(); delete rows[1].predecessor_ids; rows[1].depends_on_id = 10
  assert.equal(route.routeFromSteps(rows).mode, 'sequential')
  rows[1].predecessor_ids = []
  assert.deepEqual(route.dependencyIds(rows[1]), [])
  assert.equal(route.routeFromSteps(rows).mode, 'custom')
  assert.equal(JSON.stringify(route.routeSnapshot(rows)).includes('operator'), false)
})

test('started stage dependencies stay fixed while future mixed dependencies remain editable', () => {
  const rows = steps(); rows[0].status = 'confirmed'
  const vm = component('components/engineer/ProductionRouteEditor.vue', { value: route.routeFromSteps(rows), factories, steps: rows })
  const inputs = []; vm.$on('input', value => inputs.push(value))
  vm.changeMode('parallel'); vm.move(1, 1); vm.toggle(1, 3, true)
  assert.equal(inputs.length, 0)
  vm.changeMode('custom'); assert.equal(inputs.at(-1).mode, 'custom')
  vm.value = inputs.at(-1); vm.toggle(3, 1, true)
  assert.deepEqual(inputs.at(-1).stages[2].predecessor_factory_ids, [1, 2])
  vm.$destroy()
})

test('route save sends its original snapshot and a late response cannot replace another company task', async () => {
  const vm = component('components/order/ProductionRoutePanel.vue', { order: order() })
  vm.draft = { ...vm.draft, mode: 'parallel' }
  let finish, sent
  vm.$axios = { put: (url, data) => { sent = { url, data }; return new Promise(resolve => { finish = resolve }) } }
  const updates = []; vm.$on('updated', value => updates.push(value))
  const pending = vm.save()
  assert.equal(sent.url, '/api/tasks/55/production-route')
  assert.deepEqual(JSON.parse(JSON.stringify(sent.data.previous_route)), route.routeSnapshot(steps()))
  assert.deepEqual(sent.data.production_route.stages.map(row => row.predecessor_factory_ids), [[], [], []])
  vm.order = { ...order(), id: 56, company_id: 8 }
  await Vue.nextTick()
  finish({ data: { order: order() } }); await pending
  assert.equal(updates.length, 0); assert.equal(vm.saving, false)
  vm.$destroy()
})

test('an external route edit blocks a stale draft and preserves the draft until refresh', async () => {
  const vm = component('components/order/ProductionRoutePanel.vue', { order: order() })
  vm.draft = { ...vm.draft, mode: 'parallel' }
  const updated = order(); updated.factory_orders[1].deadline = '2026-11-15'
  vm.order = updated; await Vue.nextTick()
  assert.equal(vm.stale, true); assert.equal(vm.draft.mode, 'parallel')
  vm.resetDraft(); assert.equal(vm.stale, false); assert.equal(vm.dirty, false)
  assert.equal(vm.draft.stages[1].deadline, '2026-11-15')
  vm.$destroy()
})

test('ready notifications open the exact operator task and are localized in every language', () => {
  const { notificationTarget, describeNotification } = load('utils/task-notifications.js')
  const notification = { type: 'step.ready', order_id: 55, factory_order_id: 12, data: { factory: 'Powder', deadline: '2026-11-20' } }
  assert.deepEqual(notificationTarget(notification, 'operator'), { path: '/factory/workspace', query: { order: '55', step: '12' } })
  for (const locale of ['hy', 'ru', 'en']) assert.match(describeNotification(notification, locale).text, /Powder/)
})

 test('four workshops use the complete company catalog and a fourth stage can join three branches', () => {
  const four = [...factories, { id: 44, name: 'Եռակցում և հավաքում' }]
  const plan = route.normalizeRoute({ mode: 'custom', stages: [{ factory_id: 44, predecessor_factory_ids: [1,2,3] }] }, four)
  assert.equal(plan.stages.length, 4)
  assert.deepEqual(plan.stages[0].predecessor_factory_ids, [1,2,3])
  assert.equal(route.routeHasCycle(plan), false)
})

test('refresh reads the latest saved route after a conflict and never overwrites another task', async () => {
  const vm = component('components/order/ProductionRoutePanel.vue', { order: order() })
  const current = order(); current.factory_orders[2].deadline = '2026-11-19'
  const updates = []; vm.$on('updated', value => { updates.push(value); vm.order = value })
  vm.$axios = { get: async url => { assert.equal(url, '/api/orders/55'); return { data: current } } }
  await vm.refresh(); await Vue.nextTick()
  assert.equal(vm.draft.stages[2].deadline, '2026-11-19'); assert.equal(vm.stale, false)
  let finish
  vm.$axios.get = () => new Promise(resolve => { finish = resolve })
  const pending = vm.refresh(); vm.order = { ...order(), id: 999 }; await Vue.nextTick()
  finish({ data: current }); await pending
  assert.equal(updates.length, 1); assert.equal(vm.order.id, 999)
  vm.$destroy()
})


test('a ready notification arriving before the next poll loads the task through the operator workshop API', async () => {
  const options = load('components/factory/FactoryOrdersBoard.vue').default
  const task = { id: 55, factory_orders: [{ factory_id: 2 }] }
  let opened
  const vm = { $route: { query: { order: '55' } }, $auth: { user: { id: 9, company: { id: 7 } } }, currentFactoryId: 2, getOrderByFactories: { orders: [] },
    $axios: { get: async url => { assert.equal(url, '/api/factories/factory/2'); return { data: { orders: [task] } } } }, toggleDetails: value => { opened = value } }
  await options.methods.openNotificationTask.call(vm)
  assert.equal(opened, task)
})
