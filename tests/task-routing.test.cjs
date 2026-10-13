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
  {
    propsData = {},
    state = {},
    methods = {},
    computed = {},
    hooks = {},
    can = true,
  } = {}
) {
  const definition = load(name).default
  const vm = new Vue({
    ...definition,
    mounted: [],
    beforeDestroy: [],
    ...hooks,
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
        confirmation_required: false,
        confirmation_method: null,
        deadline: null,
        priority: 'normal',
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

function taskSettings(step = null) {
  return component('components/order/TaskEvidenceSettings.vue', {
    propsData: {
      order: {
        ...routingOrder(),
        company_id: 1,
        confirmation_required: false,
        confirmation_method: null,
      },
      step,
    },
    hooks: {
      beforeCreate() {
        this.$auth = { user: { id: 5, role: { name: 'engineer' } } }
        this.$store = {
          state: Vue.observable({ workspace: { company: { id: 1 } } }),
        }
        this.$can = () => true
      },
    },
  })
}

test('existing-task requirements retain failed input and lock duplicate submissions until the API responds', async () => {
  const vm = taskSettings(),
    events = [],
    calls = []
  vm.$emit = (...args) => events.push(args)
  vm.required = true
  vm.method = 'photo_text'
  let finish
  vm.$axios = {
    put: (url, data) => {
      calls.push({ url, data })
      return new Promise((resolve, reject) => {
        finish = { resolve, reject }
      })
    },
  }
  const first = vm.save()
  await vm.save()
  assert.equal(vm.saving, true)
  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0], {
    url: '/api/tasks/20/evidence-requirements',
    data: {
      confirmation_required: true,
      confirmation_method: 'photo_text',
      previous_confirmation_required: false,
      previous_confirmation_method: null,
    },
  })
  finish.reject({ response: { data: { message: 'Temporary server failure' } } })
  await first
  assert.equal(vm.required, true)
  assert.equal(vm.method, 'photo_text')
  assert.match(vm.error, /Temporary server failure/)
  assert.equal(vm.saving, false)
  const next = vm.save()
  finish.resolve({
    data: {
      order: {
        ...vm.order,
        confirmation_required: true,
        confirmation_method: 'photo_text',
      },
    },
  })
  await next
  assert.equal(vm.dirty, false)
  assert.ok(
    events.some(
      ([event, data]) =>
        event === 'updated' && data.confirmation_method === 'photo_text'
    )
  )
  vm.$destroy()
})

test('workshop edits preserve draft requirements during refresh and send independent deadline and priority', async () => {
  const step = {
    ...routingOrder().factory_orders[0],
    confirmation_required: true,
    confirmation_method: 'text',
    deadline: '2026-10-18',
    priority: 'high',
  }
  const vm = taskSettings(step),
    calls = []
  vm.method = 'photo_text'
  vm.priority = 'urgent'
  vm.order = { ...vm.order, description: 'A fresh status read' }
  await Vue.nextTick()
  assert.equal(vm.method, 'photo_text')
  vm.$axios = {
    put: async (url, data) => {
      calls.push({ url, data })
      throw {
        response: {
          status: 409,
          data: { message: 'Changed in another session; refresh first' },
        },
      }
    },
  }
  await vm.save()
  assert.equal(calls[0].url, '/api/tasks/20/workshops/30/settings')
  assert.equal(calls[0].data.deadline, '2026-10-18')
  assert.equal(calls[0].data.priority, 'urgent')
  assert.equal(calls[0].data.previous_priority, 'high')
  assert.match(vm.error, /another session/)
  assert.equal(vm.method, 'photo_text')
  vm.reset()
  assert.equal(vm.method, 'text')
  assert.equal(vm.priority, 'high')
  vm.step = { ...step, engineer_confirmation_at: '2026-10-13' }
  await Vue.nextTick()
  assert.equal(vm.canManage, false)
  vm.$destroy()
})

test('a late settings response cannot replace a different task or company', async () => {
  const vm = taskSettings(),
    events = []
  vm.$emit = (...args) => events.push(args)
  vm.required = true
  vm.method = 'text'
  let resolve
  vm.$axios = {
    put: () =>
      new Promise((done) => {
        resolve = done
      }),
  }
  const request = vm.save()
  vm.$store.state.workspace.company.id = 2
  vm.order = { ...vm.order, id: 21, company_id: 2 }
  await Vue.nextTick()
  resolve({
    data: {
      order: {
        ...routingOrder(),
        confirmation_required: true,
        confirmation_method: 'text',
      },
    },
  })
  await request
  assert.equal(vm.required, false)
  assert.equal(vm.saving, false)
  assert.equal(events.filter(([event]) => event === 'updated').length, 0)
  vm.$destroy()
})

test('workshop creation inherits common evidence but accepts independent methods, deadline and priority', () => {
  const { workshopSettingsPayload } = load('utils/task-workflow.js')
  const result = workshopSettingsPayload(
    [{ id: 1 }, { id: 2 }],
    {
      2: {
        inherit: false,
        confirmation_required: true,
        confirmation_method: 'photo_text',
        deadline: '2026-10-19',
        priority: 'urgent',
      },
      99: { priority: 'urgent' },
    },
    true,
    'photo'
  )
  assert.deepEqual(result, [
    {
      factory_id: 1,
      confirmation_required: true,
      confirmation_method: 'photo',
      deadline: null,
      priority: 'normal',
    },
    {
      factory_id: 2,
      confirmation_required: true,
      confirmation_method: 'photo_text',
      deadline: '2026-10-19',
      priority: 'urgent',
    },
  ])
})

function fileVersions() {
  return component('components/order/TaskFileVersions.vue', {
    propsData: { order: { ...routingOrder(), company_id: 1 } },
    hooks: {
      beforeCreate() {
        this.$auth = { user: { id: 5, role: { name: 'engineer' } } }
        this.$store = {
          state: Vue.observable({ workspace: { company: { id: 1 } } }),
        }
        this.$can = () => true
      },
    },
  })
}

test('failed version upload keeps the chosen file and note, and a retry sends the current revision guard', async () => {
  const vm = fileVersions(),
    events = [],
    calls = []
  const file = {
    id: 60,
    original_name: 'drawing.txt',
    task_file_revision_id: 4,
    can_update: true,
    versions: [{ id: 4, version: 2 }],
  }
  vm.files = [file]
  vm.$emit = (...args) => events.push(args)
  const upload = new File(['New dimensions'], 'drawing.txt', {
    type: 'text/plain',
  })
  vm.select(file, { target: { files: [upload] } })
  vm.$set(vm.notes, 60, 'Corrected width')
  vm.$axios = {
    post: async (url, data) => {
      calls.push({
        url,
        file: data.get('file').name,
        note: data.get('note'),
        previous: data.get('previous_revision_id'),
      })
      throw { response: { data: { message: 'Upload interrupted' } } }
    },
  }
  await vm.change(file)
  assert.equal(vm.uploads[60], upload)
  assert.equal(vm.notes[60], 'Corrected width')
  assert.match(vm.error, /interrupted/)
  assert.deepEqual(calls[0], {
    url: '/api/tasks/20/files/60/versions',
    file: 'drawing.txt',
    note: 'Corrected width',
    previous: '4',
  })
  vm.$axios.post = async () => ({
    data: {
      order: vm.order,
      files: [
        {
          ...file,
          task_file_revision_id: 5,
          versions: [{ id: 5, version: 3 }],
        },
      ],
    },
  })
  await vm.change(file)
  assert.equal(vm.uploads[60], undefined)
  assert.equal(vm.notes[60], undefined)
  assert.equal(vm.currentVersion(vm.files[0]), 3)
  assert.equal(events.filter(([event]) => event === 'updated').length, 1)
  vm.$destroy()
})

test('old file-version reads are ignored on company change, and invalid extension/oversize selections stay blocked', async () => {
  const vm = fileVersions(),
    file = { id: 60, original_name: 'drawing.txt' }
  let resolve
  vm.$axios = {
    get: () =>
      new Promise((done) => {
        resolve = done
      }),
  }
  const read = vm.load()
  vm.$store.state.workspace.company.id = 2
  await Vue.nextTick()
  resolve({ data: { files: [file] } })
  await read
  assert.deepEqual(vm.files, [])
  assert.equal(vm.loaded, false)
  assert.equal(vm.loading, false)
  for (const upload of [
    { name: 'file.pdf', size: 2 },
    { name: 'file.txt', size: 10 * 1024 * 1024 + 1 },
  ]) {
    vm.select(file, { target: { files: [upload], value: 'file' } })
    assert.equal(vm.uploads[60], null)
    assert.ok(vm.error)
  }
  vm.$destroy()
})

test('evidence and file changes have localized notification text in all interface languages', () => {
  const { describeNotification } = load('utils/task-notifications.js')
  for (const locale of ['hy', 'ru', 'en']) {
    const proof = describeNotification(
      {
        type: 'step.settings_changed',
        data: {
          factory: 'Laser',
          confirmation_required: true,
          confirmation_method: 'photo_text',
          priority: 'urgent',
          deadline: '2026-10-18',
          needs_supplement: true,
        },
      },
      locale
    )
    assert.ok(proof.text.includes('Laser'))
    assert.ok(!proof.text.includes('{'))
    assert.ok(!proof.text.includes('photo_text'))
    const file = describeNotification(
      {
        type: 'step.file_version_changed',
        data: { factory: 'Laser', file_name: 'drawing.dxf', version: 3 },
      },
      locale
    )
    assert.ok(file.text.includes('drawing.dxf'))
    assert.ok(file.text.includes('v3'))
  }
})

test('operator boards show urgent work first and then the nearest workshop deadline without mutating the source', () => {
  const { sortWorkshopTasks } = load('utils/task-routing.js')
  const jobs = [
    {
      id: 1,
      dates: { finish_date: '2026-10-20' },
      factory_orders: [{ factory_id: 1, priority: 'normal' }],
    },
    {
      id: 2,
      factory_orders: [
        { factory_id: 1, priority: 'urgent', deadline: '2026-10-19' },
      ],
    },
    {
      id: 3,
      factory_orders: [
        { factory_id: 1, priority: 'urgent', deadline: '2026-10-18' },
      ],
    },
  ]
  assert.deepEqual(
    sortWorkshopTasks(jobs, 1).map((row) => row.id),
    [3, 2, 1]
  )
  assert.deepEqual(
    jobs.map((row) => row.id),
    [1, 2, 3]
  )
})

test('supplementing photo evidence reuses the retained image and pre-fills the previous text', async () => {
  const vm = component('components/factory/OrderActionModal.vue', {
    propsData: {
      actionOptions: [{ value: 'finished' }],
      cancelReasons: [],
      factoryOrder: {
        id: 30,
        confirmation_required: true,
        confirmation_method: 'photo_text',
        has_evidence_photo: true,
        evidence_text: 'Checked measurements',
      },
    },
  })
  vm.isOpen = true
  await Vue.nextTick()
  vm.localSelectedOption = { value: 'finished' }
  assert.equal(vm.evidenceText, 'Checked measurements')
  assert.equal(vm.canConfirm, true)
  let result
  vm.$emit = (event, value) => {
    if (event === 'confirm') result = value
  }
  vm.confirm()
  assert.equal(result.evidence_text, 'Checked measurements')
  assert.equal('evidence_photo' in result, false)
  vm.$destroy()
})
