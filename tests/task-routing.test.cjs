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
  if (name.endsWith('.vue'))
    source = source.match(/<script>([\s\S]*?)<\/script>/)[1]
  const code = transformSync(source, {
    configFile: false,
    babelrc: false,
    plugins: [require('@babel/plugin-transform-modules-commonjs')],
  }).code
  const module = { exports: {} }
  const dependency = (request) => {
    if (request.endsWith('.vue')) return {}
    if (request.startsWith('@/')) return load(request.slice(2) + '.js')
    return require(request)
  }
  new Function('require', 'module', 'exports', code)(
    dependency,
    module,
    module.exports
  )
  loaded.set(name, module.exports)
  return module.exports
}

function component(
  name,
  { propsData = {}, state = {}, methods = {}, computed = {}, can = true } = {}
) {
  const definition = load(name).default
  const vm = new Vue({
    ...definition,
    mounted: [],
    beforeDestroy: [],
    propsData,
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

const routingOrder = () => ({
  id: 20,
  creator_id: 5,
  status: 'pending',
  selected_files: [
    { pmp_file: { id: 60, original_name: 'drawing.dxf' }, quantity: 2 },
  ],
  factory_orders: [
    {
      id: 30,
      factory_id: 1,
      status: 'pending',
      operator_id: null,
      factory: { name: 'Laser' },
      files: [{ id: 60, original_name: 'drawing.dxf' }],
    },
  ],
})
const workload = () => ({
  factories: [
    {
      id: 1,
      name: 'Laser',
      operators: [
        { id: 7, name: 'Operator', active_tasks: 2, overdue_tasks: 1 },
      ],
    },
    {
      id: 2,
      name: 'Bend',
      operators: [{ id: 8, name: 'Bender', active_tasks: 0, overdue_tasks: 0 }],
    },
  ],
})
function panel(user = { id: 5, role: { name: 'engineer' } }) {
  const vm = component('components/order/TaskRoutingPanel.vue', {
    propsData: { order: routingOrder() },
    state: { workload: workload() },
  })
  vm.$auth = { user }
  vm.$i18n = { locale: 'hy' }
  return vm
}

test('routing is available to the creator and management with permission, and preserves unsaved choices during refresh', async () => {
  const { canManageTask, assignmentLocked } = load('utils/task-routing.js')
  for (const [role, id, expected] of [
    ['engineer', 5, true],
    ['engineer', 6, false],
    ['admin', 6, true],
    ['manager', 6, true],
    ['laser', 5, false],
    ['authenticatedUser', 5, false],
  ]) {
    assert.equal(
      canManageTask({ id, role: { name: role } }, routingOrder(), true),
      expected
    )
    assert.equal(
      canManageTask({ id, role: { name: role } }, routingOrder(), false),
      false
    )
  }
  assert.equal(assignmentLocked({ status: 'confirmed' }), false)
  assert.equal(
    assignmentLocked({
      status: 'finished',
      awaiting_engineer_confirmation: true,
    }),
    true
  )
  const vm = panel()
  vm.assignmentDrafts[30] = '7'
  vm.order = { ...routingOrder(), description: 'Refresh with new status' }
  await Vue.nextTick()
  assert.equal(vm.assignmentDrafts[30], '7')
  vm.$destroy()
})

test('operator replacement waits for the API and retains selections on validation errors', async () => {
  const vm = panel(),
    events = [],
    calls = []
  vm.$emit = (...args) => events.push(args)
  vm.assignmentDrafts[30] = '7'
  vm.$axios = {
    put: async (url, data) => {
      calls.push({ url, data })
      throw {
        response: {
          data: {
            errors: {
              operator_id: ['Operator no longer belongs to this workshop'],
            },
          },
        },
      }
    },
  }
  await vm.assign(vm.order.factory_orders[0])
  assert.deepEqual(calls, [
    { url: '/api/tasks/20/workshops/30/operator', data: { operator_id: 7 } },
  ])
  assert.equal(events.length, 0)
  assert.equal(vm.assignmentDrafts[30], '7')
  assert.match(vm.error, /no longer belongs/)
  assert.equal(vm.saving, false)
  const updated = {
    ...routingOrder(),
    factory_orders: [{ ...routingOrder().factory_orders[0], operator_id: 7 }],
  }
  vm.$axios.put = async () => ({
    data: { order: updated, workload: workload() },
  })
  await vm.assign(vm.order.factory_orders[0])
  assert.equal(events[0][0], 'updated')
  assert.equal(events[0][1].factory_orders[0].operator_id, 7)
  vm.$destroy()
})

test('new workshop reuses existing files, defaults to the preceding job, and sends optional operator and quantities', async () => {
  const vm = panel(),
    calls = [],
    events = []
  vm.$emit = (...args) => events.push(args)
  vm.factoryId = '2'
  await Vue.nextTick()
  assert.equal(vm.dependsOnId, '30')
  assert.equal(vm.newOperatorId, '')
  assert.equal(vm.quantities[60], 2)
  vm.selectedFileIds = [60]
  assert.equal(vm.canAdd, true)
  vm.quantities[60] = 1.5
  assert.equal(vm.canAdd, false)
  vm.quantities[60] = 2
  vm.$axios = {
    post: async (url, data) => {
      calls.push({ url, data })
      return { data: { order: routingOrder(), workload: workload() } }
    },
  }
  await vm.addWork()
  assert.deepEqual(calls, [
    {
      url: '/api/tasks/20/workshops',
      data: {
        factory_id: 2,
        operator_id: null,
        depends_on_id: 30,
        files: [{ id: 60, quantity: 2 }],
      },
    },
  ])
  assert.equal(vm.factoryId, '')
  assert.equal(events[0][0], 'updated')
  vm.$destroy()
})

test('failed file routing preserves the complete input for retry and closed work has no available target', async () => {
  const vm = panel()
  vm.factoryId = '2'
  await Vue.nextTick()
  vm.newOperatorId = '8'
  vm.selectedFileIds = [60]
  vm.$axios = {
    post: async () => {
      throw { response: { data: { message: 'Connection interrupted' } } }
    },
  }
  await vm.addWork()
  assert.equal(vm.factoryId, '2')
  assert.equal(vm.dependsOnId, '30')
  assert.equal(vm.newOperatorId, '8')
  assert.deepEqual([...vm.selectedFileIds], [60])
  assert.equal(vm.saving, false)
  assert.equal(vm.error, 'Connection interrupted')
  vm.order = {
    ...routingOrder(),
    factory_orders: [
      {
        ...routingOrder().factory_orders[0],
        status: 'finished',
        completed_at: '2026-10-09',
      },
    ],
  }
  await Vue.nextTick()
  assert.deepEqual(
    vm.availableFactories.map((factory) => factory.id),
    [2]
  )
  vm.$destroy()
})

test('dependency blocks operator drag and status actions until the API reports previous work complete', () => {
  for (const blocked of [true, false]) {
    const task = {
      id: 20,
      factory_orders: [
        {
          id: 30,
          factory_id: 1,
          operator_id: 7,
          status: 'pending',
          is_blocked: blocked,
        },
      ],
    }
    const vm = component('components/factory/OrderCard.vue', {
      propsData: { order: task, factoryId: 1, currentUserId: 7 },
    })
    assert.equal(vm.isLocked, blocked)
    vm.$destroy()
  }
})

test('workload labels show actual counts in every language and company refresh clears old counts after success', async () => {
  const { operatorWorkloadLabel, routingCopy } = load('utils/task-routing.js')
  for (const locale of ['hy', 'ru', 'en'])
    assert.equal(
      operatorWorkloadLabel(
        { name: 'Sos', active_tasks: 3, overdue_tasks: 1 },
        locale
      ),
      `Sos · ${routingCopy[locale].active}: 3 · ${routingCopy[locale].overdue}: 1`
    )
  assert.equal(operatorWorkloadLabel({ name: 'Sos' }, 'en'), 'Sos')
  const vm = component('pages/engineer/workload/index.vue', {
    state: { factories: workload().factories },
  })
  vm.$axios = { get: async () => ({ data: { company_id: 2, factories: [] } }) }
  await vm.refresh()
  assert.deepEqual([...vm.factories], [])
  assert.equal(vm.loading, false)
  vm.$destroy()
})

test('adding files to an existing independent workshop keeps its existing dependency choice', async () => {
  const vm = panel()
  vm.order = {
    ...routingOrder(),
    factory_orders: [
      ...routingOrder().factory_orders,
      {
        id: 31,
        factory_id: 2,
        status: 'pending',
        depends_on_id: null,
        files: [],
      },
    ],
  }
  await Vue.nextTick()
  vm.factoryId = '2'
  await Vue.nextTick()
  assert.equal(vm.dependsOnId, '')
  vm.$destroy()
})

test('manager details fetch every workshop and task file before displaying routing controls', async () => {
  const vm = component('components/manager/FactoryOrdersManager.vue', {
    propsData: { kind: 'laser' },
  })
  const full = {
    ...routingOrder(),
    factory_orders: [
      ...routingOrder().factory_orders,
      { id: 31, factory_id: 2, status: 'pending', files: [] },
    ],
  }
  const calls = []
  vm.$axios = {
    get: async (url) => {
      calls.push(url)
      return { data: full }
    },
  }
  await vm.openDetails({ id: 20, factory_orders: [full.factory_orders[0]] })
  assert.deepEqual(calls, ['/api/orders/20'])
  assert.equal(vm.selectedOrder.factory_orders.length, 2)
  assert.equal(vm.selectedOrder.selected_files.length, 1)
  assert.equal(vm.isDetailsOpen, true)
  assert.equal(vm.detailsLoading, false)
  vm.isDetailsOpen = false
  vm.$axios.get = async () => {
    throw { response: { data: { message: 'Could not load task' } } }
  }
  await vm.openDetails({ id: 21 })
  assert.equal(vm.isDetailsOpen, false)
  assert.equal(vm.detailsLoading, false)
  vm.$destroy()
})
