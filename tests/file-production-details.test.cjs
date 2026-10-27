const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const Vue = require('vue')
const compiler = require('vue-template-compiler')
const { transformSync } = require('@babel/core')
const cache = new Map()
function load(name) {
  if (cache.has(name)) return cache.get(name)
  let source = fs.readFileSync(path.join(__dirname, '..', name), 'utf8')
  if (name.endsWith('.vue')) source = compiler.parseComponent(source).script.content
  const code = transformSync(source, { configFile: false, babelrc: false, plugins: [require('@babel/plugin-transform-modules-commonjs')] }).code
  const module = { exports: {} }
  new Function('require', 'module', 'exports', code)(specifier => {
    if (specifier.endsWith('.vue') || specifier.includes('.worker.')) return {}
    if (specifier === 'three' || specifier.includes('OrbitControls')) return {}
    if (specifier.startsWith('@/')) return load(specifier.slice(2) + '.js')
    return require(specifier)
  }, module, module.exports)
  cache.set(name, module.exports)
  return module.exports
}
const utils = load('utils/file-production-details.js')
const flush = () => new Promise(resolve => setImmediate(resolve))
const plain = value => JSON.parse(JSON.stringify(value))
const file = (id = 1) => ({ id, original_name: 'part.txt', quantity: 99, material_type: 'Library material', thickness: 8, dimensions: 'Library dimensions', inspection_required: true })
const details = (id = 1) => ({ id, original_name: 'part.txt', source: 'task', quantity: 3, material_type: 'Steel', thickness: 0, dimensions: '1000 × 2000', inspection_required: true, workshops: [{ id: 4, name: 'Laser', current: true }] })
function component(name, props, axios = {}) {
  const options = load(name).default
  const source = fs.readFileSync(path.join(__dirname, '..', name), 'utf8')
  return new Vue({ ...options, ...compiler.compileToFunctions(compiler.parseComponent(source).template.content), propsData: props,
    beforeCreate() {
      this.$t = key => key
      this.$axios = axios
      this.$store = { state: { workspace: Vue.observable({ company: { id: 7 }, assignmentId: 1 }) } }
      this.$auth = { user: { id: 9, company: { id: 7 } } }
      this.$getPmpFileUrl = value => '/api/secure-files/pmp/' + value.id
      this.$can = () => true
    },
  })
}

test('task metadata preserves zero, false and null snapshots instead of current library values', () => {
  const current = { ...file(), pivot: { quantity: 3, material_type: null, thickness: 0, dimensions: null, inspection_required: false } }
  assert.equal(utils.fileAttribute(current, 'quantity'), 3)
  assert.equal(utils.fileAttribute(current, 'thickness'), 0)
  assert.equal(utils.fileAttribute(current, 'material_type'), null)
  const snapshot = utils.fileDetailsFallback(current)
  assert.equal(snapshot.dimensions, null)
  assert.equal(snapshot.inspection_required, false)
  assert.equal(utils.fileAttribute(file(), 'material_type'), 'Library material')
})

test('details requests retain the exact task step and revision and isolate company assignments', () => {
  const value = { ...file(), pivot: { factory_order_id: '12', task_file_revision_id: '25' } }
  assert.deepEqual(utils.fileDetailsContext(value, '8'), { factory_order_id: 12, order_id: 8, revision_id: 25 })
  assert.deepEqual(utils.fileDetailsContext(file(), null), {})
  assert.deepEqual(utils.fileDetailsContext({ pivot: { factory_order_id: 'invalid' } }, 0), {})
  const key = workspace => utils.fileDetailsIdentity(value, 8, workspace, { id: 9 })
  assert.notEqual(key({ company: { id: 7 }, assignmentId: 1 }), key({ company: { id: 7 }, assignmentId: 2 }))
  assert.notEqual(key({ company: { id: 7 } }), key({ company: { id: 8 } }))
  assert.notEqual(utils.fileDetailsIdentity(value, 8, {}, { id: 9, role: { name: 'engineer' } }), utils.fileDetailsIdentity(value, 8, {}, { id: 9, role: { name: 'operator' }, factory_id: 4 }))
})

test('a late metadata response cannot overwrite a newly opened file or a new company assignment', async () => {
  const requests = []
  const vm = component('components/File/FileMetadataPanel.vue', { file: file(), orderId: 5 }, {
    $get: (url, options) => new Promise((resolve, reject) => requests.push({ url, options, resolve, reject })),
  })
  vm.file = file(2)
  await Vue.nextTick()
  assert.equal(requests.length, 2)
  requests[1].resolve({ details: details(2) }); await flush()
  requests[0].resolve({ details: details(1) }); await flush()
  assert.equal(vm.details.id, 2)
  vm.$store.state.workspace.assignmentId = 2
  await Vue.nextTick()
  assert.equal(vm.details, null)
  assert.equal(vm.loading, true)
  requests[2].reject({ response: { status: 403 } }); await flush()
  assert.equal(vm.details, null)
  assert.equal(vm.error, 'file_details.unavailable')
  vm.$destroy()
})

test('metadata failures retain the selected file and retry without showing stale details', async () => {
  let fails = true
  const original = file()
  const vm = component('components/File/FileMetadataPanel.vue', { file: original }, {
    $get: async () => { if (fails) throw { response: { status: 503 } }; return { details: details() } },
  })
  await flush()
  assert.equal(vm.details, null)
  assert.equal(vm.error, 'file_details.failed')
  assert.equal(vm.file, original)
  fails = false
  await vm.load()
  assert.equal(vm.error, '')
  assert.equal(vm.details.quantity, 3)
  assert.equal(vm.details.thickness, 0)
  vm.$destroy()
})

test('the complete metadata panel renders saved attributes and safe workshop names', async () => {
  const data = { ...details(), workshops: [{ id: 4, name: 'Laser <script>', current: true }] }
  const vm = component('components/File/FileMetadataPanel.vue', { file: file() }, { $get: async () => ({ details: data }) })
  await flush()
  const html = await require('vue-server-renderer').createRenderer().renderToString(vm)
  for (const key of ['quantity', 'material_type', 'thickness', 'dimensions']) assert.match(html, new RegExp('data-file-attribute="' + key + '"'))
  assert.match(html, /1000 × 2000/)
  assert.match(html, /file_plan.inspection_required/)
  assert.match(html, /Laser &lt;script&gt;/)
  assert.doesNotMatch(html, /Library material|Library dimensions/)
  vm.$destroy()
})

test('switching a preview discards late file bytes and cancels pending work', async () => {
  let release
  const old = new Blob(['old text'], { type: 'text/plain' })
  old.arrayBuffer = () => new Promise(resolve => { release = resolve })
  const vm = component('components/File/FilePreview.vue', { file: file() }, {
    get: async url => ({ data: url.endsWith('/1') ? old : new Blob(['new text'], { type: 'text/plain' }) }),
  })
  vm.metadata = details()
  const pending = vm.loadPreview()
  await flush()
  vm.file = file(2)
  await Vue.nextTick()
  vm.metadata = details(2)
  await vm.loadPreview()
  release(new TextEncoder().encode('old text').buffer)
  await pending
  assert.equal(vm.kind, 'text')
  assert.equal(vm.text, 'new text')
  let cancelled = false
  vm.cancelWorker = () => { cancelled = true }
  vm.onDetailsError()
  assert.equal(cancelled, true)
  assert.equal(vm.text, '')
  assert.equal(vm.metadata, null)
  assert.equal(vm.detailsError, true)
  vm.$destroy()
})

test('operator and manager previews retain the selected attachment and snapshot quantity in whole-subgroup tasks', () => {
  const selected = { ...file(), pivot: { quantity: 3, factory_order_id: 10, task_file_revision_id: 27 } }
  const order = { id: 20, link_existing_files: false, factory_orders: [{ id: 10, factory_id: 4, factory: { id: 4, value: 'DXF', is_workshop: true }, files: [selected] }] }
  const vm = component('components/factory/ProductionOrderDetailsPanel.vue', { details: order })
  vm.openFile(selected)
  assert.equal(vm.previewFile, selected)
  assert.equal(vm.selectedQuantity(selected), 3)
  assert.equal(plain(vm.previewFile).pivot.task_file_revision_id, 27)
  vm.closePreview()
  assert.equal(vm.activePreviewFile, null)
  vm.$destroy()
})

test('late DXF responses are discarded after switching files or closing the viewer', async () => {
  const definition = load('components/File/DxfViewerModal.vue').default
  const replies = [], parsed = [], notices = []
  const oldWindow = global.window
  global.window = { removeEventListener() {} }
  const vm = new Vue({ ...definition, propsData: { dxfUrl: '/drawing.dxf' },
    beforeCreate() {
      this.$axios = { get: () => new Promise(resolve => replies.push(resolve)) }
      this.$notify = value => notices.push(value)
    },
    methods: { ...definition.methods, cleanupThree() {}, initThree() { this.scene = {}; this.camera = {}; this.renderer = {} }, parseDxf(value) { parsed.push(value) } },
  })
  try {
    const first = vm.loadDxfFile(); await flush()
    const second = vm.loadDxfFile(); await flush()
    replies[1]({ status: 200, data: 'new drawing' }); await second
    replies[0]({ status: 200, data: 'old drawing' }); await first
    assert.deepEqual(parsed, ['new drawing'])
    const closed = vm.loadDxfFile(); await flush()
    vm.$destroy()
    replies[2]({ status: 200, data: 'closed drawing' }); await closed
    assert.deepEqual(parsed, ['new drawing'])
    assert.deepEqual(notices, [])
  } finally { global.window = oldWindow }
})

test('closing a 3D viewport releases its resources without forcing native context loss', () => {
  const dispose = load('components/File/ModelViewer.vue').default.methods.disposeViewport
  const calls = []
  const vm = { viewport: {
    controls: { dispose() { calls.push('controls') } },
    scene: { traverse(fn) { fn({ geometry: { dispose() { calls.push('geometry') } }, material: { dispose() { calls.push('material') } } }) } },
    renderer: { dispose() { calls.push('renderer'); dispose.call(vm) }, forceContextLoss() { assert.fail('Closing must not synchronously invalidate the native graphics context') } },
  } }
  dispose.call(vm)
  assert.equal(vm.viewport, null)
  assert.deepEqual(calls, ['controls', 'geometry', 'material', 'renderer'])
})
