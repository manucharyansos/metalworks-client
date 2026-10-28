const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const { transformSync } = require('@babel/core')
const Vue = require('vue')
const compiler = require('vue-template-compiler')
const modules = new Map()
function load(file) {
  if (modules.has(file)) return modules.get(file)
  let source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  if (file.endsWith('.vue')) source = compiler.parseComponent(source).script.content
  const code = transformSync(source, { configFile: false, babelrc: false, plugins: [require('@babel/plugin-transform-modules-commonjs')] }).code
  const module = { exports: {} }
  const dependency = name => ['@/components/ui/PersonAvatar.vue', '@/components/ui/TaskDeadline.vue'].includes(name) ? load(name.slice(2)) : name.endsWith('.vue') ? {} : name.startsWith('@/') ? load(name.slice(2) + '.js') : require(name)
  new Function('require', 'module', 'exports', code)(dependency, module, module.exports)
  if (['components/ui/PersonAvatar.vue', 'components/ui/TaskDeadline.vue'].includes(file)) Object.assign(module.exports.default, compiler.compileToFunctions(compiler.parseComponent(fs.readFileSync(path.join(__dirname, '..', file), 'utf8')).template.content))
  modules.set(file, module.exports)
  return module.exports
}
function component(file, { propsData = {}, state = {}, methods = {}, computed = {}, can = true, role = 'laser', render = false } = {}) {
  const definition = load(file).default
  const template = render ? compiler.parseComponent(fs.readFileSync(path.join(__dirname, '..', file), 'utf8')).template.content : null
  return new Vue({ ...definition, ...(template ? compiler.compileToFunctions(template) : {}), mounted: [], created: [], propsData,
    beforeCreate() { this.$i18n = { locale: 'hy' }; this.$auth = { user: { id: 7, role: { name: role } } }; this.$can = () => can; this.$t = value => value; this.$formatDate = value => String(value); this.$notify = () => {} },
    data: () => ({ ...definition.data?.(), ...state }), methods: { ...definition.methods, ...methods }, computed: { ...definition.computed, ...computed },
  })
}
const step = (status, extra = {}) => ({ id: 15, factory_id: 1, operator_id: 7, status, factory: { id: 1, name: 'Laser', is_reference: false }, ...extra })
const task = (status, extra = {}) => ({ id: 10, name: '990.01', description: 'Task QA', status: 'pending', factory_orders: [step(status, extra)] })
const { factoryBoardColumns, taskStage, boardCopy, stepStatusText } = load('utils/task-board.js')

test('every task has one engineer stage, including null, partially complete, reference and rejected jobs', () => {
  for (const [row, expected] of [
    [task(null), 'created'], [task('pending'), 'created'], [task('waiting'), 'created'], [task('accepted'), 'accepted'], [task('confirmed'), 'in_progress'], [task('date_changed'), 'in_progress'],
    [task('finished', { confirmation_required: true }), 'in_progress'], [task('finished', { confirmation_required: true, engineer_confirmation_at: '2026-10-15' }), 'completed'],
    [task('finished'), 'completed'], [task('canceled'), 'created'],
    [{ ...task('finished'), factory_orders: [step('finished'), step(null, { id: 16, factory_id: 2 })] }, 'in_progress'],
    [{ ...task('finished'), factory_orders: [step('finished'), step(null, { factory: { is_reference: true } }), step('canceled')] }, 'completed'],
  ]) assert.equal(taskStage(row), expected, JSON.stringify(row))
})

test('workshop board has Created, Accepted, In progress, Rejected; approved and waiting completions share In progress', () => {
  const statuses = [null, 'pending', 'waiting', 'accepted', 'confirmed', 'date_changed', 'finished', 'canceled']
  const rows = statuses.map((status, id) => ({ ...task(status), id }))
  const columns = factoryBoardColumns(rows, 1, [{ value: 'finished' }, { value: 'date_changed' }, { value: 'accepted' }])
  assert.deepEqual(columns.map(c => c.value), ['null', 'accepted', 'confirmed', 'canceled'])
  assert.deepEqual(columns.map(c => c.orders.length), [3, 1, 3, 1])
  assert.equal(columns.flatMap(c => c.orders).length, rows.length)
  assert.equal(factoryBoardColumns([{ id: 11, factory_orders: [step('accepted', { factory_id: 2 })] }], 1).flatMap(c => c.orders).length, 0)
  assert.equal(factoryBoardColumns([task('custom')], 1, [{ value: 'custom', label: 'Custom' }]).at(-1).orders.length, 1)
  assert.equal(stepStatusText(step('finished', { awaiting_engineer_confirmation: true, confirmation_required: true })), boardCopy.hy.review)
  assert.equal(stepStatusText(step('finished')), boardCopy.hy.finished)
})

test('a rejected card permits a reopen request, but pending requests, another operator and completed work remain locked', () => {
  for (const [status, extra, can, locked] of [
    ['canceled', {}, true, false], ['canceled', { is_blocked: true }, true, false], ['canceled', { pending_request: { type: 'reopen' } }, true, true],
    ['canceled', { operator_id: 8 }, true, true], ['canceled', {}, false, true], ['accepted', {}, true, false], ['finished', {}, true, true],
  ]) {
    const vm = component('components/factory/OrderCard.vue', { propsData: { order: task(status, extra), factoryId: 1, currentUserId: 7 }, can })
    assert.equal(vm.isLocked, locked)
    let prevented = false, moved = false
    vm.$emit = () => { moved = true }
    vm.onDragStart({ preventDefault() { prevented = true }, dataTransfer: { setData() {} } })
    assert.equal(prevented, locked); assert.equal(moved, !locked)
    vm.$destroy()
  }
})

test('reopen dialog offers only live target stages and preserves a failed request for retry', () => {
  const vm = component('components/factory/OrderActionModal.vue', { propsData: { factoryOrder: step('canceled'), actionOptions: [{ value: 'finished' }, { value: 'canceled' }], cancelReasons: [] } })
  assert.equal(vm.reopenMode, true); assert.equal(vm.requestMode, true)
  assert.deepEqual(vm.availableActions.map(a => a.value), ['pending', 'accepted', 'confirmed'])
  vm.localSelectedOption = { value: 'finished' }; assert.equal(vm.canConfirm, false)
  vm.localSelectedOption = vm.availableActions[1]; vm.requestNote = '  Material arrived  '
  const sent = []; vm.$emit = (...args) => sent.push(args)
  vm.confirm(); assert.equal(sent[0][1].status, 'accepted'); assert.equal(sent[0][1].request_note, 'Material arrived')
  vm.saving = true; assert.equal(vm.canConfirm, false)
  vm.saving = false; assert.equal(vm.canConfirm, true); assert.equal(vm.requestNote, '  Material arrived  ')
  vm.$destroy()
  const manager = component('components/factory/OrderActionModal.vue', { propsData: { factoryOrder: step('canceled'), actionOptions: [{ value: 'confirmed' }], cancelReasons: [] }, role: 'manager' })
  assert.equal(manager.reopenMode, false); assert.equal(manager.requestMode, false); manager.$destroy()
})

for (const file of ['pages/factory/laser/index.vue', 'pages/factory/bend/index.vue', 'components/factory/FactoryOrdersBoard.vue']) {
  test(`${file}: dragging rejected work asks first and never moves it optimistically`, async () => {
    let sends = 0
    const row = task('canceled')
    const vm = component(file, { state: { currentFactoryId: 1, currentUserId: 7 }, computed: { getOrderByFactories: () => ({ orders: [row] }) }, methods: { doneFinishedOrder: async () => { sends++; return true } } })
    await vm.updateOrderStatusByDrag(row, 'accepted')
    assert.equal(sends, 0); assert.equal(vm.isModal, true); assert.equal(vm.initialStatus, 'accepted'); assert.equal(row.factory_orders[0].status, 'canceled')
    vm.closeModal(); row.factory_orders[0].pending_request = { type: 'reopen' }
    await vm.updateOrderStatusByDrag(row, 'confirmed'); assert.equal(vm.isModal, false); assert.equal(sends, 0)
    vm.$destroy()
  })
}

function engineerStore(axios) {
  const definition = load('store/engineer/index.js'), state = definition.state(), rootState = { workspace: { company: { id: 1 } } }
  const context = { state, rootState, commit(name, value) { definition.mutations[name](state, value) } }
  return { state, rootState, fetch: options => definition.actions.fetchOrders.call({ $axios: axios }, context, options) }
}
test('engineer filters send separate stages and ignore older page responses and errors', async () => {
  const requests = []
  const store = engineerStore({ get(url, config) { return new Promise((resolve, reject) => requests.push({ config, resolve, reject })) } })
  const first = store.fetch({ page: 3, stage: 'accepted' })
  const second = store.fetch({ page: 1, stage: 'completed', confirmation: 'waiting' })
  assert.equal(requests[0].config.params.stage, 'accepted'); assert.equal(requests[1].config.params.stage, 'completed'); assert.equal(requests[1].config.params.confirmation, 'waiting')
  requests[1].resolve({ data: { orders: [{ id: 22 }], pagination: { current_page: 1, total: 1 }, stage_counts: { completed: 1 } } }); await second
  requests[0].reject(new Error('Stale response')); await first
  assert.equal(store.state.orders[0].id, 22); assert.equal(store.state.error, null); assert.equal(store.state.loading, false); assert.equal(store.state.stageCounts.completed, 1)
  const third = store.fetch({ stage: '' }); store.rootState.workspace.company.id = 2
  requests[2].resolve({ data: { orders: [{ id: 99 }], stage_counts: { created: 99 } } }); await third
  assert.equal(store.state.orders[0].id, 22); assert.equal(store.state.stageCounts.created, 0)
})

test('engineer cards show workshop ownership, both proof requirements and approval state without marking waiting work completed', async () => {
  const row = task('finished', { confirmation_required: true, confirmation_method: 'photo_text', awaiting_engineer_confirmation: true, operator: { name: 'QA Operator' }, deadline: '2026-10-18', priority: 'urgent', files: [{ id: 4 }] })
  const vm = component('components/engineer/OrderCard.vue', { propsData: { order: row }, render: true })
  const html = await require('vue-server-renderer').createRenderer().renderToString(vm)
  assert.equal(vm.stage, 'in_progress'); assert.equal(vm.completedSteps, 0); assert.match(html, /QA Operator/); assert.match(html, /2026-10-18/); assert.match(html, /Նկար \+ Տեքստ/); assert.match(html, /Սպասում է ինժեների հաստատմանը/)
  vm.order = { ...row, factory_orders: [{ ...row.factory_orders[0], completed_at: '2026-10-15', engineer_confirmation_at: '2026-10-15', awaiting_engineer_confirmation: false }] }
  assert.equal(vm.stage, 'completed'); assert.equal(vm.isOverdue, false)
  vm.$destroy()
})

test('reopening and accepting notifications are readable in all three interface languages', () => {
  const { describeNotification, notificationCopy } = load('utils/task-notifications.js')
  for (const locale of ['hy', 'ru', 'en']) {
    const result = describeNotification({ type: 'request.submitted', data: { actor: 'QA', factory: 'Laser', request_type: 'reopen', requested_status: 'accepted' } }, locale)
    assert.ok(result.text.includes('QA')); assert.ok(result.text.includes('Laser')); assert.ok(result.text.includes(notificationCopy[locale].statuses.accepted))
    assert.doesNotMatch(result.text, /\{\w+\}/)
  }
})

test('single task and job badges use singular status labels, while columns keep plural headings', () => {
  const { taskStageText, taskStatusText } = load('utils/task-board.js')
  assert.equal(taskStageText('created', 'ru'), 'Создано')
  assert.equal(taskStageText('accepted', 'ru'), 'Принято')
  assert.equal(taskStageText('completed', 'ru'), 'Завершено')
  assert.equal(taskStageText('rejected', 'ru'), 'Отклонено')
  assert.equal(taskStageText('in_progress', 'en'), 'In progress')
  assert.equal(stepStatusText(step(null)), boardCopy.hy.shortCreated)
  assert.equal(stepStatusText(step('accepted'), 'ru'), 'Принято')
  assert.equal(stepStatusText(step('canceled'), 'en'), 'Rejected')
  for (const [raw, expected] of [['pending', 'Created'], [null, 'Created'], ['confirmed', 'In progress'], ['completed', 'Completed'], ['canceled', 'Rejected'], ['custom_status', 'custom_status']]) {
    assert.equal(taskStatusText(raw, 'en'), expected)
  }
  assert.equal(factoryBoardColumns([], 1, [], 'ru')[0].label, boardCopy.ru.created)
})
