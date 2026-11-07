/* eslint-disable vue/one-component-per-file -- each test builds its own instance */
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
    // Store helpers are stubbed: tests set the mapped values directly.
    if (request === 'vuex')
      return { mapActions: () => ({}), mapGetters: () => ({}) }
    return require(request)
  }
  // Runs the project's own transpiled source, as the other component tests do.
  // eslint-disable-next-line no-new-func
  new Function('require', 'module', 'exports', code)(
    dependency,
    module,
    module.exports
  )
  loaded.set(name, module.exports)
  return module.exports
}

function component(name, { state = {}, computed = {}, propsData = {} } = {}) {
  const definition = load(name).default
  const vm = new Vue({
    ...definition,
    propsData,
    data: () => ({ ...definition.data?.(), ...state }),
    computed: { ...definition.computed, ...computed },
    mounted: [],
  })
  vm.$can = () => true
  vm.$t = (key) => key
  vm.$notify = () => {}
  return vm
}

test('each workshop opens its own program first, then drawings, images and models', () => {
  const { preferredPreviewFile, fileKind, fileTypeSummary } =
    load('utils/file-kind.js')
  const file = (id, name, extra = {}) => ({ id, original_name: name, ...extra })
  assert.equal(
    preferredPreviewFile([
      file(1, 'notes.txt'),
      file(2, 'frame.step'),
      file(3, 'drawing.PDF'),
      file(4, 'bend.dld'),
    ]).id,
    4,
    'the press brake program wins'
  )
  assert.equal(
    preferredPreviewFile([file(1, 'weld.igs'), file(2, 'weld.pdf')]).id,
    2
  )
  assert.equal(
    preferredPreviewFile([
      file(1, 'cut.dxf', { operator_download_restricted: true }),
      file(2, 'photo.jpg'),
    ]).id,
    2,
    'files the operator may not open are skipped'
  )
  assert.equal(preferredPreviewFile([file(1, 'archive.zip')]), null)
  assert.deepEqual(
    ['a.DXF', 'b.dld', 'c.pdf', 'd.png', 'e.stp', 'f.SLDPRT', 'g.zip'].map(
      fileKind
    ),
    ['program', 'program', 'drawing', 'image', 'model', 'cad', 'other']
  )
  const summary = fileTypeSummary(
    [
      file(1, 'a.dxf'),
      file(2, 'b.dxf'),
      file(3, 'c.pdf'),
      file(4, 'd.png'),
      file(5, 'e.step'),
    ],
    2
  )
  assert.deepEqual(summary.shown, [
    { label: 'DXF', count: 2, kind: 'program' },
    { label: 'PDF', count: 1, kind: 'drawing' },
  ])
  assert.equal(summary.more, 2)
})

test('board columns get short titles and the engineer colours', () => {
  const { columnLabel, columnTone, factoryBoardCopy } = load(
    'utils/factory-board-copy.js'
  )
  const { boardCopy } = load('utils/task-board.js')
  assert.equal(
    columnLabel({ id: 'no_status' }, boardCopy.hy),
    boardCopy.hy.shortCreated
  )
  assert.equal(
    columnLabel({ id: 'confirmed' }, boardCopy.ru),
    boardCopy.ru.in_progress
  )
  assert.equal(
    columnLabel({ id: 'custom', label: 'Custom' }, boardCopy.hy),
    'Custom'
  )
  assert.deepEqual(
    ['no_status', 'accepted', 'confirmed', 'canceled', 'finished'].map((id) =>
      columnTone({ id })
    ),
    ['created', 'accepted', 'in_progress', 'rejected', 'created']
  )
  for (const locale of ['hy', 'ru', 'en'])
    for (const key of Object.keys(factoryBoardCopy.hy))
      assert.ok(factoryBoardCopy[locale][key], `${locale}.${key}`)
})

test('the shared board toggles stages and clears every filter', () => {
  const vm = component('components/factory/FactoryTaskBoard.vue', {
    propsData: { selected: ['accepted'], search: '  990 ' },
  })
  const sent = []
  vm.$emit = (...args) => sent.push(args)
  assert.equal(vm.hasFilters, true)
  vm.toggleStage('confirmed')
  vm.toggleStage('accepted')
  vm.clearFilters()
  assert.deepEqual(sent, [
    ['update:selected', ['accepted', 'confirmed']],
    ['update:selected', []],
    ['update:search', ''],
    ['update:selected', []],
  ])
  vm.$destroy()
})

for (const name of [
  'pages/factory/laser/index.vue',
  'pages/factory/bend/index.vue',
  'components/factory/FactoryOrdersBoard.vue',
]) {
  test(`${name}: search counts, page reset and a failed first load`, async () => {
    const step = (status) => [{ factory_id: 1, status }]
    const orders = [
      { id: 1, name: 'Frame 990', factory_orders: step('accepted') },
      {
        id: 2,
        name: 'Door',
        order_number: { number: '2026-11-0002' },
        factory_orders: step(null),
      },
      {
        id: 3,
        name: 'Rail',
        prefix_code: { code: 'AB990' },
        factory_orders: step('accepted'),
      },
    ]
    const vm = component(name, {
      state: { currentFactoryId: 1, currentUserId: 7, currentPage: 3 },
      computed: { getOrderByFactories: () => ({ orders }) },
    })
    vm.searchable = '990'
    await Vue.nextTick()
    assert.equal(vm.currentPage, 1, 'a new search starts from the first page')
    assert.deepEqual(vm.searchMatches.map((order) => order.id).sort(), [1, 3])
    assert.equal(
      vm.stageChips.find((column) => column.id === 'accepted').orders.length,
      2
    )
    vm.selectedStatuses = ['null']
    assert.deepEqual(
      vm.filteredBySearch.map((order) => order.id),
      []
    )
    vm.searchable = 'door'
    assert.deepEqual(
      vm.filteredBySearch.map((order) => order.id),
      [2]
    )

    vm.fetchOrdersByFactory = () => Promise.resolve(false)
    await vm.loadBoard()
    assert.equal(vm.loaded, true)
    assert.equal(vm.loadFailed, true)
    vm.fetchOrdersByFactory = () => Promise.resolve(undefined)
    await vm.retryLoad()
    assert.equal(vm.loadFailed, false)
    vm.details = orders[0]
    assert.equal(vm.detailsStep.status, 'accepted')
    vm.$destroy()
  })
}
