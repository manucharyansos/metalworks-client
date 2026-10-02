const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const { transformSync } = require('@babel/core')
const Vue = require('vue')

const root = path.join(__dirname, '..')
const loaded = new Map()
function load(name) {
  if (loaded.has(name)) return loaded.get(name)
  let source = fs.readFileSync(path.join(root, name), 'utf8')
  if (name.endsWith('.vue')) source = source.match(/<script>([\s\S]*?)<\/script>/)[1]
  const code = transformSync(source, {
    configFile: false, babelrc: false,
    plugins: [require('@babel/plugin-transform-modules-commonjs')],
  }).code
  const module = { exports: {} }
  const dependency = (request) => {
    if (request.endsWith('.vue')) return {}
    if (request.startsWith('@/')) return load(request.slice(2) + '.js')
    return require(request)
  }
  new Function('require', 'module', 'exports', code)(dependency, module, module.exports)
  loaded.set(name, module.exports)
  return module.exports
}

function component(name, { propsData = {}, state = {}, methods = {}, computed = {}, can = true } = {}) {
  const definition = load(name).default
  const vm = new Vue({
    ...definition, mounted: [], propsData,
    data: () => ({ ...definition.data?.(), ...state }),
    methods: { ...definition.methods, ...methods },
    computed: { ...definition.computed, ...computed },
  })
  vm.$can = () => can
  vm.$t = (key) => key
  vm.$formatDate = (value) => String(value)
  vm.$notify = () => {}
  return vm
}

const actions = [
  { value: 'confirmed', label: 'Կատարել' },
  { value: 'canceled', label: 'Մերժել' },
  { value: 'date_changed', label: 'Կատարման ժամկետի փոխարինում' },
  { value: 'finished', label: 'Ավարտել' },
]
const order = (status = 'confirmed', operator = 7) => ({
  id: 10, order_number: { number: 'QA-990-01' },
  factory_orders: [{ id: 15, factory_id: 1, status, operator_id: operator }],
})
const payload = { status: 'canceled', canceling: 'no_material', cancel_date: null, operator_finish_date: null }

test('the current operator can edit and drag an API confirmed task; finished and other operators stay locked', () => {
  for (const [status, operator, locked] of [
    ['confirmed', 7, false], ['confirmed', '7', false], ['finished', 7, true], ['confirmed', 8, true],
  ]) {
    const vm = component('components/factory/OrderCard.vue', {
      propsData: { order: order(status, operator), factoryId: '1', currentUserId: 7 },
    })
    assert.equal(vm.isLocked, locked)
    assert.equal(vm.isCompleted, status === 'finished')
    vm.$destroy()
  }
  const readOnly = component('components/factory/OrderCard.vue', {
    propsData: { order: order(), factoryId: 1, currentUserId: 7 }, can: false,
  })
  assert.equal(readOnly.isLocked, true)
  readOnly.$destroy()
})

test('factory dates use the operator local day at midnight instead of the previous UTC day', () => {
  const { localFactoryDate, localFactoryTimestamp } = load('utils/factory-order-status.js')
  const prior = process.env.TZ
  process.env.TZ = 'Asia/Yerevan'
  try {
    const time = new Date('2026-10-01T20:15:00Z')
    assert.equal(localFactoryDate(time), '2026-10-02')
    assert.equal(localFactoryTimestamp(time), '2026-10-02 00:15:00')
  } finally {
    if (prior === undefined) delete process.env.TZ
    else process.env.TZ = prior
  }
})

test('action dialog requires reason/date, sends the existing API fields, and waits for the parent to close it', () => {
  const vm = component('components/factory/OrderActionModal.vue', {
    propsData: { actionOptions: actions, cancelReasons: [{ value: 'no_material' }], tomorrowDate: '2026-10-03' },
  })
  const emitted = []
  vm.$emit = (...args) => emitted.push(args)
  vm.localSelectedOption = actions[1]
  assert.equal(vm.canConfirm, false)
  vm.confirm()
  assert.deepEqual(emitted, [])
  vm.localAdditionalOption = { value: 'no_material' }
  assert.equal(vm.canConfirm, true)
  vm.confirm()
  assert.deepEqual(emitted, [['confirm', payload]])
  vm.saving = true
  vm.confirm()
  vm.close()
  assert.equal(emitted.length, 1)
  vm.saving = false
  vm.localSelectedOption = actions[2]
  for (const invalid of [null, '', '2026-10-02']) {
    vm.localChangeDate = invalid
    assert.equal(vm.canConfirm, false)
  }
  vm.localChangeDate = '2026-10-05'
  vm.confirm()
  assert.deepEqual(emitted[1], ['confirm', {
    status: 'date_changed', canceling: '', cancel_date: '2026-10-05', operator_finish_date: null,
  }])
  vm.$destroy()
})

for (const name of ['pages/factory/laser/index.vue', 'pages/factory/bend/index.vue', 'components/factory/FactoryOrdersBoard.vue']) {
  function board(options = {}) {
    return component(name, {
      state: { currentFactoryId: 1, currentUserId: 7, actionOptions: actions, statusOptions: actions, ...options.state },
      methods: { fetchOrdersByFactory: async () => true, ...options.methods },
      computed: { getOrderByFactories: () => ({ orders: [] }), ...options.computed },
      can: options.can ?? true,
    })
  }

  test(`${name}: confirmed opens status actions from card and details`, () => {
    const vm = board({ state: { details: order(), isOpenDetails: true } })
    assert.equal(vm.canUpdateDetails, true)
    vm.updateOrder(vm.details)
    assert.equal(vm.isModal, true)
    assert.equal(vm.initialStatus, 'confirmed')
    assert.equal(vm.isOpenDetails, false)
    assert.equal(vm.selectedOrder.id, 10)
    vm.$destroy()
  })

  test(`${name}: failed/pending save retains the order and a retry closes only after success`, async () => {
    const requests = []
    let resolve, refreshed = 0
    const vm = board({ methods: {
      doneFinishedOrder: (body) => { requests.push(body); return new Promise((done) => { resolve = done }) },
      fetchOrdersByFactory: async () => { refreshed++ },
    } })
    vm.updateOrder(order())
    const first = vm.handleModalConfirm(payload)
    assert.equal(vm.isSaving, true)
    vm.closeModal()
    await vm.handleModalConfirm(payload)
    assert.equal(requests.length, 1)
    assert.equal(vm.isModal, true)
    resolve(false)
    await first
    assert.equal(vm.isSaving, false)
    assert.equal(vm.isModal, true)
    assert.equal(vm.selectedOrder.id, 10)
    assert.equal(refreshed, 0)
    const second = vm.handleModalConfirm(payload)
    resolve(true)
    await second
    assert.deepEqual(requests[1], { id: 10, factory_id: 1, factory_order: payload })
    assert.equal(vm.isModal, false)
    assert.equal(refreshed, 1)
    vm.$destroy()
  })

  test(`${name}: consecutive drags work after the API assigns the current operator`, async () => {
    const item = order('waiting', null), sent = []
    const vm = board({ methods: { doneFinishedOrder: async (body) => {
      sent.push(body)
      Object.assign(item.factory_orders[0], body.factory_order, { operator_id: 7 })
      return true
    } } })
    vm.onDragStart(item, { id: 'no_status' })
    await vm.onDrop({ value: 'confirmed' })
    assert.equal(vm.draggingOrder, null)
    assert.equal(item.factory_orders[0].status, 'confirmed')
    vm.onDragStart(item, { id: 'confirmed' })
    await vm.onDrop({ value: 'null' })
    assert.equal(sent.length, 2)
    assert.equal(item.factory_orders[0].status, null)
    vm.onDragStart(item, { id: 'no_status' })
    vm.clearDrag()
    await vm.onDrop({ value: 'finished' })
    assert.equal(sent.length, 2, 'cancelled drag cannot update a stale card')
    vm.$destroy()
  })

  test(`${name}: rejection/date drops request input and finished/foreign/read-only cards never update`, async () => {
    let updates = 0
    const vm = board({ methods: { doneFinishedOrder: async () => { updates++; return true } } })
    for (const status of ['canceled', 'date_changed']) {
      await vm.updateOrderStatusByDrag(order(), status)
      assert.equal(vm.isModal, true)
      assert.equal(vm.initialStatus, status)
      vm.closeModal()
    }
    await vm.updateOrderStatusByDrag(order('finished'), 'confirmed')
    await vm.updateOrderStatusByDrag(order('confirmed', 8), 'finished')
    assert.equal(updates, 0)
    vm.$can = () => false
    vm.updateOrder(order())
    await vm.updateOrderStatusByDrag(order(), 'finished')
    assert.equal(vm.isModal, false)
    assert.equal(updates, 0)
    vm.$destroy()
  })

  test(`${name}: waiting and pending orders remain in the unassigned column`, () => {
    const vm = board({ computed: { getOrderByFactories: () => ({ orders: [order('waiting'), { ...order('pending'), id: 11 }] }) } })
    assert.equal(vm.boardColumns.find((column) => column.value === 'null').orders.length, 2)
    vm.$destroy()
  })
}

test('manager status form remains open after an API error and sends the selected factory on retry', async () => {
  const requests = []
  let failing = true
  const vm = component('components/manager/FactoryOrdersManager.vue', {
    propsData: { kind: 'laser' }, state: { selectedFactoryId: '1' }, methods: { loadOrders: async () => {} },
  })
  vm.$axios = { put: async (url, body) => { requests.push({ url, body }); if (failing) throw { response: { data: { message: 'Try again' } } } } }
  vm.openEdit(order())
  await vm.saveStatus(payload)
  assert.equal(vm.isEditOpen, true)
  assert.equal(vm.selectedOrder.id, 10)
  failing = false
  await vm.saveStatus(payload)
  assert.deepEqual(requests[1], { url: '/api/factories/updateOrder/10', body: { factory_id: '1', factory_order: payload } })
  assert.equal(vm.isEditOpen, false)
  vm.$destroy()
})
