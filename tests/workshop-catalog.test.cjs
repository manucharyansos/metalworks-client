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
  const dependency = name => name.endsWith('.vue') ? {} : (name.startsWith('@/') || name.startsWith('~/')) ? load(name.slice(2) + '.js') : require(name)
  new Function('require', 'module', 'exports', code)(dependency, module, module.exports)
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
const { isWorkshop, isReferenceFile, fileDestinations, fileRoutingPayload, categorySections, catalogCopy } = load('utils/workshop-catalog.js')
const factories = [{ id: 1, name: 'Laser', value: 'DXF', is_workshop: true, is_active: true }, { id: 2, name: 'Powder', value: 'POWDER', is_workshop: true, is_active: true }, { id: 3, name: 'Welding', value: 'CUSTOM', is_workshop: true, is_active: true }, { id: 4, value: 'INFO', is_workshop: false, is_reference: true }, { id: 5, value: 'SW', is_workshop: false }, { id: 6, name: 'Archived', is_workshop: true, is_active: false }]

test('positions and file sections never become workshops, and newly created workshops need no fixed name', () => {
  assert.deepEqual(factories.filter(isWorkshop).map(row => row.id), [1, 2, 3])
  assert.equal(isWorkshop({ id: 9, name: 'Completely new process', is_workshop: true, is_active: true }), true)
  const { OPERATOR_ROLES, assignmentError } = load('utils/staff-assignments.js')
  assert.ok(OPERATOR_ROLES.includes('operator'))
  assert.equal(assignmentError([{ role_id: 7, factory_id: 3 }], [{ id: 7, name: 'operator' }], factories.filter(isWorkshop), {}), null)
})

test('a file format is independent of its workshop, explicit empty choices stay empty, and references do not create jobs', () => {
  const drawing = { id: 10, original_name: 'part.dxf', factory_id: 90, routing_factory_id: 3, is_reference_file: false }
  const info = { id: 11, original_name: 'info.pdf', is_reference_file: true }
  assert.deepEqual(fileDestinations(drawing, factories), [3])
  assert.deepEqual(fileDestinations(drawing, factories, { 10: [2, 3, 2, 4, 5, 6, 100] }), [2, 3])
  assert.deepEqual(fileDestinations(drawing, factories, { 10: [] }), [])
  assert.deepEqual(fileRoutingPayload([drawing, info], factories, { 10: [2, 3] }), [{ file_id: 10, factory_ids: [2, 3] }])
  assert.equal(isReferenceFile({ ...info, is_reference_file: false }), false)
  assert.deepEqual(fileDestinations({ id: 12, routing_factory_id: null, factory_id: 1 }, factories), [])
  assert.deepEqual(fileDestinations({ id: 12, routing_factory_ids: [2, 3], routing_factory_id: 1 }, factories), [2, 3])
  assert.deepEqual(fileDestinations({ id: 12, routing_factory_ids: [], routing_factory_id: 1 }, factories), [], 'an explicitly empty saved route does not fall back to a different workshop')
})

test('file routing checkboxes preserve other files, permit several workshops and never mutate the parent', () => {
  const value = { 20: [1] }, file = { id: 10, original_name: 'part.step', routing_factory_id: 1, is_reference_file: false }
  const vm = component('components/engineer/TaskFileRouting.vue', { propsData: { files: [file], factories, value } })
  const sent = []; vm.$emit = (name, data) => sent.push({ name, data })
  vm.select(file, 2, true)
  assert.deepEqual(sent[0], { name: 'input', data: { 10: [1, 2], 20: [1] } }); assert.equal(value[10], undefined)
  vm.value = sent[0].data; vm.select(file, 1, false); assert.deepEqual(sent[1].data[10], [2])
  vm.disabled = true; vm.select(file, 3, true); assert.equal(sent.length, 2)
  vm.$destroy()
})

test('reference sharing offers the task’s selected real workshops and includes a newly added powder job', () => {
  const vm = component('components/engineer/TaskCreationOptions.vue', { propsData: { files: [{ id: 10, factory_id: 4, is_reference_file: true }], factories, selectedWorkshops: [factories[1], factories[2]] } })
  assert.deepEqual(vm.workshops.map(row => row.id), [2, 3]); assert.equal(vm.referenceFiles.length, 1)
  vm.$destroy()
})

test('category identities remain distinct from the legacy file FK', () => {
  assert.deepEqual(categorySections([{ id: 8, legacy_factory_id: 50, code: 'INFO', name: 'Reference' }])[0], { id: 50, legacy_factory_id: 50, code: 'INFO', value: 'INFO', name: 'Reference', file_category_id: 8 })
})

test('management keeps an entered category and formats on failure, then saves the same draft on retry', async () => {
  const vm = component('components/settings/WorkshopCatalogManager.vue', { propsData: { categories: true }, methods: { load: async () => {} } })
  vm.draft = { id: null, name: 'Reference photos', is_reference: true, default_factory_id: '3', extensions: ' .JPG, png ', is_active: true }
  let failing = true; const sent = []
  vm.$axios = { post: async (url, body) => { sent.push({ url, body }); if (failing) throw { response: { data: { errors: { name: ['Try again'] } } } } } }
  await vm.save(); assert.equal(vm.error, 'Try again'); assert.equal(vm.draft.name, 'Reference photos'); assert.equal(vm.draft.extensions, ' .JPG, png ')
  failing = false; await vm.save(); assert.equal(sent.length, 2); assert.deepEqual(sent[1].body, { name: 'Reference photos', is_reference: true, default_factory_id: null, extensions: ['jpg', 'png'], is_active: true }); assert.equal(vm.draft.name, '')
  vm.$destroy()
})

test('archiving a workshop waits for the server and preserves the row when active work blocks it', async () => {
  const vm = component('components/settings/WorkshopCatalogManager.vue', { methods: { load: async () => {} } })
  const item = { id: 3, name: 'Welding', is_active: true }; vm.items = [item]
  vm.$axios = { put: async () => { throw { response: { data: { message: 'Transfer open work first' } } } } }
  await vm.toggle(item); assert.equal(vm.itemError.id, 3); assert.equal(vm.itemError.message, 'Transfer open work first'); assert.equal(item.is_active, true); assert.equal(vm.saving, false)
  vm.$destroy()
})

test('late catalog reads cannot expose a previous company and all labels exist in three languages', async () => {
  const vm = component('components/settings/WorkshopCatalogManager.vue')
  vm.$store = { state: { workspace: { company: { id: 1 } } }, commit() { throw new Error('Stale context must not commit') } }
  let answer; vm.$axios = { get: () => new Promise(resolve => { answer = resolve }) }
  const promise = vm.load(); vm.$store.state.workspace.company.id = 2
  answer({ data: { workshops: [{ id: 1, name: 'Company 1 private workshop' }] } }); await promise; assert.equal(vm.items.length, 0)
  for (const code of ['ru', 'en']) for (const key of Object.keys(catalogCopy.hy)) assert.ok(catalogCopy[code][key], code+': '+key)
  vm.$destroy()
})


test('admin and manager employee forms offer a generic operator and require its workshop', () => {
  const form = load('components/users/WorkerFormModal.vue').default
  const roles = [{ id: 7, name: 'operator' }, { id: 8, name: 'engineer' }, { id: 9, name: 'authenticatedUser' }]
  const allowed = form.computed.allowedRoles.call({ roles, $auth: { user: { role: { name: 'manager' } } } })
  assert.deepEqual(allowed.map(row => row.name), ['operator', 'engineer'])
  assert.equal(form.computed.requiresFactory.call({ selectedRole: roles[0] }), true)
  assert.equal(form.computed.requiresFactory.call({ selectedRole: roles[1] }), false)
  for (const file of ['components/users/CompanyAccessEditor.vue', 'components/users/CompanyMembershipModal.vue']) {
    const modal = load(file).default
    assert.equal(modal.methods.needsWorkshop.call({ roles, row: () => ({ role_id: 7 }) }, 1), true)
  }
})

test('deleting a category uses DELETE, waits for success, and retains a non-empty section on failure', async () => {
  let fail = true
  const vm = component('components/settings/WorkshopCatalogManager.vue', { propsData: { categories: true }, methods: { load: async () => {} } })
  const item = { id: 3, name: 'Drawings', is_active: true }
  vm.items = [item]
  vm.edit(item)
  vm.$axios = { delete: async url => {
    assert.equal(url, '/api/file-categories/3')
    if (fail) throw { response: { data: { errors: { category: ['Remove files first'] } } } }
  } }
  await vm.remove(item)
  assert.equal(vm.itemError.message, 'Remove files first')
  assert.equal(vm.items.length, 1)
  fail = false
  await vm.remove(item)
  assert.equal(vm.items.length, 0)
  assert.equal(vm.draft.id, null)
  assert.equal(vm.saving, false)
  vm.$destroy()
})

test('late category deletion cannot remove a new company’s section or reset its draft', async () => {
  const vm = component('components/settings/WorkshopCatalogManager.vue', { propsData: { categories: true }, methods: { load: async () => {} } })
  vm.$store = Vue.observable({ state: { workspace: { company: { id: 1 } } } })
  let finish
  vm.$axios = { delete: () => new Promise(resolve => { finish = resolve }) }
  const pending = vm.remove({ id: 3 })
  vm.$store.state.workspace.company.id = 2
  await Vue.nextTick()
  vm.items = [{ id: 4, name: 'Private' }]
  vm.draft = { id: 4, name: 'New draft' }
  finish({})
  await pending
  assert.equal(vm.items[0].id, 4)
  assert.equal(vm.draft.name, 'New draft')
  vm.$destroy()
})

test('six production identities distinguish tube and sheet cutting and preserve custom workshops', () => {
  const { workshopKind, workshopPage, productionWorkshopOptions } = load('utils/workshop-catalog.js')
  const rows = [
    { id: 1, value: 'DXF', name: 'Custom sheet name' },
    { id: 2, value: 'IQS', name: 'Custom tube name' },
    { id: 3, value: 'DLD' }, { id: 4, value: 'WELD' },
    { id: 5, value: 'ROLL' }, { id: 6, value: 'POWDER' },
  ]
  assert.deepEqual(rows.map(workshopKind), ['laser-sheets', 'laser-tubes', 'bend', 'welding', 'rolling', 'powder'])
  assert.deepEqual(productionWorkshopOptions(rows).map(row => row.operation), ['cutting', 'cutting', 'bending', 'welding', 'rolling', 'powder'])
  assert.deepEqual(workshopPage(rows[1]), { path: '/manager/factories/laser-tubes', query: { factory_id: '2' } })
  assert.deepEqual(workshopPage(rows[4], 'admin'), { path: '/admin/factories/rolling', query: { factory_id: '5' } })
  assert.deepEqual(workshopPage(rows[3], 'factory'), { path: '/factory/welding' })
  assert.deepEqual(workshopPage({ id: 40, value: 'WORK_CUSTOM', name: 'Assembly' }), { path: '/manager/factories/workspace', query: { factory_id: '40' } })
  assert.equal(workshopKind({ id: 4, value: 'WORK_EXISTING', name: 'Զոդում' }), 'welding')
  assert.equal(workshopKind({ id: 5, value: 'WORK_EXISTING', name: 'Вальцовка' }), 'rolling')
  assert.equal(workshopKind({ id: 6, value: 'INFO', name: 'Laser cutting' }), null)
})

test('each management page selects only its real active production workshop', () => {
  const rows = ['DXF', 'IQS', 'DLD', 'WELD', 'ROLL', 'POWDER'].map((value, index) => ({ id: index+1, value, is_workshop: true, is_active: true }))
  const kinds = ['laser-sheets', 'laser-tubes', 'bend', 'welding', 'rolling', 'powder']
  for (const [index, kind] of kinds.entries()) {
    const vm = component('components/manager/FactoryOrdersManager.vue', { propsData: { kind }, state: { factories: rows } })
    assert.deepEqual(vm.matchingFactories.map(row => row.id), [index+1], kind)
    assert.ok(vm.title && vm.helpText)
    assert.equal(vm.matchesKind({ ...rows[index], is_active: false }), false)
    assert.equal(vm.matchesKind({ ...rows[index], is_workshop: false }), false)
    vm.$destroy()
  }
  const vm = component('components/manager/FactoryOrdersManager.vue', { propsData: { kind: 'laser' }, state: { factories: rows } })
  assert.deepEqual(vm.matchingFactories.map(row => row.id), [1, 2], 'legacy combined laser page remains compatible')
  vm.$destroy()
})

test('all named production pages exist for admin manager and operator and reject unknown page names', () => {
  const kinds = ['laser-sheets', 'laser-tubes', 'bend', 'welding', 'rolling', 'powder']
  for (const file of ['pages/admin/factories/_kind.vue', 'pages/manager/factories/_kind.vue', 'pages/factory/_kind.vue']) {
    const page = load(file).default
    for (const kind of kinds) assert.equal(page.validate({ params: { kind } }), true, file+': '+kind)
    assert.equal(page.validate({ params: { kind: 'not-a-workshop' } }), false)
  }
})

test('an operator visiting another named workshop is redirected to their own production page', () => {
  const guard = load('middleware/workshop-workspace.js').default
  const user = { id: 7, factory_id: 4, factory: { id: 4, value: 'WELD', name: 'Զոդում' } }
  const redirects = []
  const app = { $auth: { user }, localePath: value => ({ ...value, path: '/ru'+value.path }) }
  guard({ app, route: { params: { kind: 'welding' } }, redirect: value => redirects.push(value) })
  assert.equal(redirects.length, 0)
  guard({ app, route: { params: { kind: 'rolling' } }, redirect: value => redirects.push(value) })
  assert.deepEqual(redirects, [{ path: '/ru/factory/welding' }])
  user.factory = null
  guard({ app, route: { params: { kind: 'rolling' } }, redirect: value => redirects.push(value) })
  assert.deepEqual(redirects[1], { path: '/ru/factory/workspace' })
})
