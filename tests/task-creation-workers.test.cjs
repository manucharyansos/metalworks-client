const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const Vue = require('vue')
const compiler = require('vue-template-compiler')

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const moduleUrl = (source) =>
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const workflowUrl = moduleUrl(read('utils/task-workflow.js'))
const catalogUrl = moduleUrl(read('utils/workshop-catalog.js').replace("'@/utils/task-workflow'", JSON.stringify(workflowUrl)))
const routingUrl = moduleUrl(read('utils/task-routing.js'))

// Loads a single-file component: its script becomes real code, its template a render function.
async function component(file, { render = false } = {}) {
  const parsed = compiler.parseComponent(read(file))
  const source = parsed.script.content.replace(
    /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g,
    (_, names, specifier) => {
      if (specifier === '@/utils/workshop-catalog') return `import ${names} from '${catalogUrl}'`
      if (specifier === '@/utils/production-route') return `import ${names} from '${moduleUrl(read('utils/production-route.js'))}'`
      if (specifier === '@/utils/task-workflow') return `import ${names} from '${workflowUrl}'`
      if (specifier === '@/utils/task-routing') return `import ${names} from '${routingUrl}'`
      if (specifier === 'vuex') return 'const mapActions = () => ({}); const mapGetters = () => ({})'
      return `const ${names} = {}`
    }
  )
  const options = (await import(moduleUrl(source))).default
  if (options.components?.TaskFileRouting) options.components.TaskFileRouting = await component('components/engineer/TaskFileRouting.vue', { render: true })
  if (options.components?.ProductionRouteEditor) options.components.ProductionRouteEditor = await component('components/engineer/ProductionRouteEditor.vue', { render: true })
  return render ? { ...options, ...compiler.compileToFunctions(parsed.template.content) } : options
}

const routing = () => import(routingUrl)

const workload = () => ({
  factories: [
    {
      id: 1,
      name: 'Laser',
      unassigned_tasks: 3,
      operators: [
        { id: 7, name: 'Busy', active_tasks: 5, overdue_tasks: 2 },
        { id: 8, name: 'Free', active_tasks: 0, overdue_tasks: 0 },
        { id: 9, name: 'Middle', active_tasks: 2, overdue_tasks: 0 },
      ],
    },
    { id: 2, name: 'Bend', unassigned_tasks: 0, operators: [{ id: 20, name: 'Only', active_tasks: 4 }] },
    { id: 3, name: 'Powder', unassigned_tasks: 0, operators: [] },
  ],
})
const factories = [{ id: 1, name: 'Laser' }, { id: 2, name: 'Bend' }, { id: 3, name: 'Powder' }]

// ── load balancing ──────────────────────────────────────────────────────────

test('the least busy operator is chosen by open jobs, then overdue, then urgent, then name', async () => {
  const { leastBusyOperator } = await routing()
  assert.equal(leastBusyOperator([]), null)
  assert.equal(leastBusyOperator(undefined), null)
  assert.equal(leastBusyOperator([{ id: 1, name: 'A', active_tasks: 3 }, { id: 2, name: 'B', active_tasks: 1 }]).id, 2)
  assert.equal(
    leastBusyOperator([{ id: 1, name: 'A', active_tasks: 2, overdue_tasks: 1 }, { id: 2, name: 'B', active_tasks: 2, overdue_tasks: 0 }]).id,
    2,
    'equal open jobs: fewer overdue wins'
  )
  assert.equal(
    leastBusyOperator([{ id: 1, name: 'A', active_tasks: 2, urgent_tasks: 3 }, { id: 2, name: 'B', active_tasks: 2, urgent_tasks: 1 }]).id,
    2,
    'then fewer urgent'
  )
  assert.equal(leastBusyOperator([{ id: 5, name: 'Zed' }, { id: 4, name: 'Ann' }]).id, 4, 'missing counts count as zero; ties go by name')
  const input = [{ id: 1, name: 'A', active_tasks: 3 }, { id: 2, name: 'B', active_tasks: 1 }]
  leastBusyOperator(input)
  assert.deepEqual(input.map((operator) => operator.id), [1, 2], 'the list is not reordered in place')
})

test('balancing gives every workshop its own lightest operator and leaves empty workshops unassigned', async () => {
  const { balancedAssignments } = await routing()
  assert.deepEqual(balancedAssignments(factories, workload()), { 1: 8, 2: 20, 3: null })
  assert.deepEqual(balancedAssignments([{ id: 9, name: 'Unknown' }], workload()), { 9: null })
  assert.deepEqual(balancedAssignments([{ id: 4, operators: [{ id: 1, name: 'Fallback' }] }], null), { 4: 1 }, 'works from the factory list before the live counts arrive')
  assert.deepEqual(balancedAssignments(undefined, undefined), {})
})

// ── the picker ──────────────────────────────────────────────────────────────

async function picker(props = {}) {
  const options = await component('components/engineer/TaskOperatorPicker.vue')
  const emitted = []
  const vm = new Vue({
    ...options,
    propsData: { factories, workload: workload(), value: {}, ...props },
  })
  vm.$t = (key) => key
  vm.$i18n = { locale: 'en' }
  vm.$emit = (name, payload) => emitted.push([name, payload])
  return { vm, emitted }
}

test('choosing an operator emits a new map with a numeric id and never mutates the parent value', async () => {
  const value = { 2: 20 }
  const { vm, emitted } = await picker({ value })
  vm.choose(1, '9')
  assert.deepEqual(emitted.at(-1), ['input', { 1: 9, 2: 20 }])
  vm.choose(2, '')
  assert.deepEqual(emitted.at(-1), ['input', { 2: null }])
  assert.deepEqual(value, { 2: 20 })
})

test('the picker can balance every workshop at once, keep other choices, and clear them again', async () => {
  const { vm, emitted } = await picker({ value: { 99: 5 } })
  vm.balance()
  assert.deepEqual(emitted.at(-1), ['input', { 99: 5, 1: 8, 2: 20, 3: null }])
  const second = await picker({ value: { 1: 8, 2: 20 } })
  assert.equal(second.vm.hasChoice, true)
  second.vm.clear()
  assert.deepEqual(second.emitted.at(-1), ['input', { 1: null, 2: null, 3: null }])
  assert.equal((await picker({ value: { 1: null } })).vm.hasChoice, false)
})

test('balancing waits for the live counts and a disabled picker changes nothing', async () => {
  const waiting = await picker({ workload: null })
  waiting.vm.balance()
  assert.deepEqual(waiting.emitted, [])
  const locked = await picker({ disabled: true, value: { 1: 8 } })
  locked.vm.choose(1, '7'); locked.vm.balance(); locked.vm.clear()
  assert.deepEqual(locked.emitted, [])
})

test('only a real choice is recommended: the lightest operator when there are two or more', async () => {
  const { vm } = await picker()
  const [laser, bend] = factories
  const operators = vm.operatorsFor(laser)
  assert.deepEqual(operators.map((operator) => vm.isRecommended(laser, operator)), [false, true, false])
  assert.equal(vm.isRecommended(bend, vm.operatorsFor(bend)[0]), false, 'a single operator is not a recommendation')
  assert.equal(vm.poolJobs(laser), 3)
  assert.equal(vm.poolJobs(bend), 0)
  assert.equal(vm.selected(1), '')
  assert.equal((await picker({ value: { 1: 8 } })).vm.selected(1), '8')
})

test('the picker shows each workshop, the recommendation, an empty-workshop warning and the pool size', async () => {
  const { vm } = await picker({ value: { 1: 8 } })
  const rendered = await component('components/engineer/TaskOperatorPicker.vue', { render: true })
  vm.$options.render = rendered.render
  vm.$options.staticRenderFns = rendered.staticRenderFns
  const html = await require('vue-server-renderer').createRenderer().renderToString(vm)
  for (const id of [1, 2, 3]) assert.match(html, new RegExp(`data-operator-row="${id}"`))
  assert.match(html, /Free[^<]*★ recommended/)
  assert.doesNotMatch(html, /Only[^<]*★/)
  assert.match(html, /data-no-operators/, 'a workshop without operators is explained')
  assert.match(html, /data-pool-jobs[^>]*>\s*Open jobs without an operator: 3/)
  assert.match(html, /<option value="8" selected="selected">/)
  assert.doesNotMatch(await require('vue-server-renderer').createRenderer().renderToString(new Vue({ ...vm.$options, propsData: { factories: [], workload: workload() }, render: rendered.render })), /data-operator-picker/)
})

test('the picker is translated into all three languages', async () => {
  const { routingCopy } = await routing()
  for (const locale of ['hy', 'ru', 'en'])
    for (const key of ['autoBalance', 'clearChoices', 'recommended', 'balanceHelp', 'noOperatorsHere', 'poolJobs'])
      assert.ok(routingCopy[locale][key]?.length > 3, `${locale}.${key}`)
  for (const locale of ['hy', 'ru', 'en']) {
    const messages = JSON.parse(read(`locales/${locale}.json`)).order_create
    for (const key of ['files_mode_whole', 'files_mode_selected', 'use_whole_subgroup'])
      assert.ok(messages[key]?.length > 3, `${locale}.${key}`)
    assert.match(messages.files_mode_whole, /\{count\}/)
    assert.match(messages.files_mode_selected, /\{count\}/)
  }
})

// ── the creation page ───────────────────────────────────────────────────────

async function orderPage({ files, workloads } = {}) {
  const options = await component('pages/engineer/orders/create/index.vue')
  const requests = []
  const answers = [...(workloads || [workload()])]
  const subgroupFiles = files || [
    { id: 1, remote_number_id: 101, factory_id: 1, original_name: 'part.dxf' },
    { id: 2, remote_number_id: 101, factory_id: 2, original_name: 'bend.dld' },
  ]
  const vm = new Vue({
    ...options,
    mounted() {},
    data: () => ({
      ...options.data(),
      getFactory: [{ id: 1, value: 'DXF', name: 'Laser' }, { id: 2, value: 'DLD', name: 'Bend' }],
      getPmpes: { pmp: [] },
      getPmp: { id: 10, files: subgroupFiles },
      allClients: [],
    }),
    methods: {
      ...options.methods,
      $notify() {},
      async checkPmpByRemoteNumber() { return true },
      createNewOrder: async (payload) => { requests.push(payload); return true },
    },
  })
  vm.$route = { path: '/engineer/orders/create' }
  vm.$auth = { user: { id: 30 } }
  vm.$router = { push() {} }
  vm.$t = (key) => key
  vm.$i18n = { locale: 'en' }
  vm.$axios = { async $get(url) { vm.$axios.calls.push(url); const next = answers.length > 1 ? answers.shift() : answers[0]; if (next instanceof Error) throw next; return next } }
  vm.$axios.calls = []
  vm.selectedClient = { user: { id: 20 } }
  vm.finishDate = '2026-10-15T12:00'
  vm.description = 'QA order'
  vm.selectPmpGroup({ id: 10, group: '001', group_name: 'First' })
  await Vue.nextTick()
  await vm.selectPmpRemoteNumber({ id: 101, remote_number: '01' })
  vm.workload = workload()
  return { vm, requests }
}

test('workers can be chosen before creating from the whole subgroup and are sent with that request', async () => {
  const { vm, requests } = await orderPage()
  await Vue.nextTick()
  assert.equal(vm.files_existing, false, 'whole-subgroup mode')
  assert.deepEqual(vm.selectedFactories.map((factory) => factory.id), [1, 2])
  vm.factoryOperators = { 1: 8, 2: null }
  await vm.pmpFiles()
  assert.equal(requests.length, 1)
  assert.equal(requests[0].link_existing_files, false)
  assert.deepEqual(requests[0].factory_operators, [{ factory_id: 1, user_id: 8 }])
})

test('the configuration editor has one operator picker backed by the existing choices', async () => {
  const source = compiler.compile(compiler.parseComponent(read('pages/engineer/orders/create/index.vue')).template.content)
  const uses = source.render.match(/_c\('TaskOperatorPicker'/g) || []
  assert.equal(uses.length, 1, 'configuration editor owns the single operator picker')
  assert.doesNotMatch(source.render, /factoryOperators\[factory\.id\]/, 'no second hand-written operator list is left')
})

test('Back from the file picker with nothing chosen returns to whole-subgroup creation', async () => {
  const { vm, requests } = await orderPage()
  vm.selectFromOtherFactory()
  assert.equal(vm.isFiles, true)
  assert.equal(vm.files_existing, false, 'opening settings does not change the file mode')
  assert.equal(vm.canSubmit, true, 'whole-subgroup creation remains available')
  vm.backToDetails()
  assert.equal(vm.isFiles, false)
  assert.equal(vm.files_existing, false)
  assert.deepEqual([...vm.selectedFiles], [])
  assert.equal(vm.canSubmit, true, 'the Create button works again and means the whole subgroup')
  await vm.pmpFiles()
  assert.equal(requests[0].link_existing_files, false)
})

test('Back with a valid choice keeps it, says so, and can return to the whole subgroup', async () => {
  const { vm, requests } = await orderPage()
  vm.selectFromOtherFactory()
  vm.handleFilesSelected([{ id: 1, quantity: 3 }])
  vm.backToDetails()
  assert.equal(vm.files_existing, true)
  assert.equal(vm.usesSelectedFiles, true)
  assert.deepEqual(vm.selectedFactories.map((factory) => factory.id), [1])

  const rendered = await component('pages/engineer/orders/create/index.vue', { render: true })
  vm.$options.render = rendered.render
  vm.$options.staticRenderFns = rendered.staticRenderFns
  vm.$options.components = { ...vm.$options.components, CreateOrderForm: { render: (h) => h('div') }, TaskCreationOptions: { render: (h) => h('div') }, TaskWorkshopOptions: { render: (h) => h('div') }, TaskOperatorPicker: { render: (h) => h('div') }, SelectWithLabel: { render: (h) => h('div') }, notifications: { render: (h) => h('div') } }
  vm.$can = () => true
  let html = await require('vue-server-renderer').createRenderer().renderToString(vm)
  assert.match(html, /data-files-mode/)
  assert.match(html, /order_create\.files_mode_selected/)
  assert.match(html, /data-use-whole-subgroup/)

  vm.useWholeSubgroup()
  assert.equal(vm.files_existing, false)
  assert.deepEqual([...vm.selectedFiles], [])
  assert.deepEqual(vm.fileQuantities, {})
  html = await require('vue-server-renderer').createRenderer().renderToString(vm)
  assert.match(html, /order_create\.files_mode_whole/)
  assert.doesNotMatch(html, /data-use-whole-subgroup/)
  await vm.pmpFiles()
  assert.equal(requests[0].link_existing_files, false)
  assert.equal(requests[0].selected_files.length, 0)
})

test('opening the file picker or deselecting a file keeps the choices, but only the task’s own workshops are sent', async () => {
  const { vm, requests } = await orderPage()
  await Vue.nextTick()
  vm.factoryOperators = { 1: 8, 2: 20 }
  vm.selectFromOtherFactory() // nothing is selected yet
  await Vue.nextTick()
  assert.deepEqual({ ...vm.factoryOperators }, { 1: 8, 2: 20 }, 'entering the picker erases nothing')
  vm.handleFilesSelected([{ id: 1, quantity: 1 }]) // only the laser file
  vm.backToDetails()
  await Vue.nextTick()
  assert.deepEqual(vm.selectedFactories.map((factory) => factory.id), [1])
  assert.deepEqual({ ...vm.factoryOperators }, { 1: 8, 2: 20 }, 'the bend choice waits in case the file comes back')
  await vm.pmpFiles()
  assert.deepEqual(requests[0].factory_operators, [{ factory_id: 1, user_id: 8 }], 'the server rejects operators for workshops without a job')
  // a different subgroup has other workshops: stale choices are gone
  vm.selectPmpGroup({ id: 11, group: '002' })
  await Vue.nextTick()
  assert.deepEqual({ ...vm.factoryOperators }, {})
})

test('opening the files step reloads the live workload and a chosen operator who vanished is cleared', async () => {
  const afterRefresh = workload()
  afterRefresh.factories[0].operators = afterRefresh.factories[0].operators.filter((operator) => operator.id !== 8)
  const { vm } = await orderPage({ workloads: [afterRefresh] })
  vm.factoryOperators = { 1: 8, 2: 20 }
  const before = vm.$axios.calls.length
  vm.selectFromOtherFactory()
  await new Promise((resolve) => setTimeout(resolve, 0))
  assert.equal(vm.$axios.calls.length, before + 1)
  assert.equal(vm.$axios.calls.at(-1), '/api/task-workload')
  assert.equal(vm.factoryOperators[1], null, 'operator 8 no longer exists in that workshop')
  assert.equal(vm.factoryOperators[2], 20, 'other choices are untouched')
  assert.equal(vm.workloadLoading, false)
})

test('a slow workload answer cannot overwrite a newer one, and failures are shown without losing choices', async () => {
  const { vm } = await orderPage()
  const first = workload(); first.factories[0].operators[1].name = 'STALE'
  const second = workload(); second.factories[0].operators[1].name = 'FRESH'
  const pending = []
  vm.$axios.$get = () => new Promise((resolve, reject) => pending.push({ resolve, reject }))
  vm.factoryOperators = { 1: 9 }
  const slow = vm.loadWorkload()
  const quick = vm.loadWorkload()
  assert.equal(vm.workloadLoading, true)
  pending[1].resolve(second)
  await quick
  pending[0].resolve(first)
  await slow
  assert.equal(vm.workload.factories[0].operators[1].name, 'FRESH')
  assert.equal(vm.workloadLoading, false)

  const failing = vm.loadWorkload()
  pending[2].reject(new Error('offline'))
  await failing
  assert.equal(vm.workloadError.length > 0, true)
  assert.equal(vm.factoryOperators[1], 9, 'a failed refresh keeps the engineer’s choice')
  assert.equal(vm.workloadLoading, false)
  const ok = vm.loadWorkload()
  pending[3].resolve(second)
  await ok
  assert.equal(vm.workloadError, '')
})


test('typing a task project search before the catalog response arrives stays usable', async () => {
  const options = await component('pages/engineer/orders/create/index.vue')
  const filter = options.computed.filteredPmpGroups
  for (const getPmpes of [undefined, {}, { pmp: null }, { pmp: {} }]) {
    assert.deepEqual(filter.call({ getPmpes, pmpGroupSearch: '987' }), [])
  }
  const groups = [{ id: 1, group: 987, group_name: null }, { id: 2, group: '988', group_name: 'Powder parts' }]
  assert.deepEqual(filter.call({ getPmpes: { pmp: groups }, pmpGroupSearch: '987' }), [groups[0]])
  assert.deepEqual(filter.call({ getPmpes: { pmp: groups }, pmpGroupSearch: 'powder' }), [groups[1]])
})


test('an empty description can open settings and create a whole-subgroup task', async () => {
  const { vm, requests } = await orderPage()
  vm.description = ''
  assert.equal(vm.canProceedToFiles, true)
  assert.equal(vm.canSubmit, true)
  vm.selectFromOtherFactory()
  assert.equal(vm.isFiles, true)
  assert.equal(vm.files_existing, false)
  vm.backToDetails()
  await vm.pmpFiles()
  assert.equal(requests[0].description, '')
  assert.equal(requests[0].link_existing_files, false)
})

test('the settings accordion opens one section at a time without losing its slots', async () => {
  const options = await component('components/engineer/TaskConfigurationEditor.vue', { render: true })
  const vm = new Vue({ ...options, propsData: { fileCount: 2, workshopCount: 4 }, methods: { ...options.methods, $t: key => key } })
  const render = () => require('vue-server-renderer').createRenderer().renderToString(vm)
  let html = await render()
  assert.equal((html.match(/aria-expanded="true"/g) || []).length, 1)
  vm.toggleSection('route')
  assert.equal(vm.activeSection, 'route')
  html = await render()
  assert.equal((html.match(/aria-expanded="true"/g) || []).length, 1)
  assert.equal((html.match(/data-task-config-panel=/g) || []).length, 6, 'closed sections stay mounted to preserve inputs')
  vm.toggleSection('operators')
  assert.equal(vm.activeSection, 'operators')
  vm.toggleSection('operators')
  assert.equal(vm.activeSection, null)
  vm.disabled = true
  vm.toggleSection('files')
  assert.equal(vm.activeSection, null)
})
