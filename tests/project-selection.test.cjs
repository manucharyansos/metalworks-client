const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const Vue = require('vue')

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const policyUrl = moduleUrl(read('utils/factory-file-policy.js'))
async function component(file) {
  let source = read(file).match(/<script>([\s\S]*?)<\/script>/)[1]
  source = source.replace(/import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g, (_, names, specifier) => {
    if (specifier === '~/utils/factory-file-policy') return `import ${names} from '${policyUrl}'`
    if (specifier === 'vuex') return 'const mapActions = () => ({}); const mapGetters = () => ({})'
    return `const ${names} = {}`
  })
  return (await import(moduleUrl(source))).default
}
const groups = () => [
  { id: 10, group: '001', group_name: 'First group', remote_number: [
    { id: 101, remote_number: '01', remote_number_name: 'First part' },
    { id: 102, remote_number: '02', remote_number_name: 'Second part' },
  ] },
  { id: 20, group: '002', group_name: 'Other group', remote_number: [
    { id: 201, remote_number: '01', remote_number_name: 'Other part' },
  ] },
]
async function selection(list = groups()) {
  const options = await component('pages/engineer/files/index.vue')
  const routes = [], notifications = []
  const vm = new Vue({
    ...options,
    created() {},
    data: () => ({ ...options.data(), getPmpes: { pmp: list } }),
    methods: {
      ...options.methods,
      $can: () => true,
      $notify: item => notifications.push(item),
      localePath: path => `/ru${path}`,
      fetchPmps: async () => true,
    },
  })
  vm.$router = { push: route => { routes.push(route); return Promise.resolve() } }
  async function enter(field, value, handler) {
    vm[field] = value
    vm[handler]()
    await Vue.nextTick()
  }
  return { vm, routes, notifications, enter }
}

test('subgroups stay disabled until an exact existing group is entered', async () => {
  const { vm, enter } = await selection()
  assert.equal(vm.isExistingGroup, false)
  assert.equal(vm.pmpRemoteNumbers.length, 0)
  await enter('pmpGroup', '00', 'onGroupCodeInput')
  assert.equal(vm.isExistingGroup, false)
  assert.equal(vm.showCreateGroup, true)
  await enter('pmpGroup', '001', 'onGroupCodeInput')
  assert.equal(vm.isExistingGroup, true)
  assert.equal(vm.pmpGroupName, 'First group')
  assert.deepEqual(vm.pmpRemoteNumbers.map(part => part.id), [101, 102])
})

test('editing a selected group never keeps it selected through its old name', async () => {
  const { vm, enter } = await selection()
  vm.applyGroup(groups()[0]); vm.applyRemote(groups()[0].remote_number[0])
  await Vue.nextTick()
  await enter('pmpGroup', '990', 'onGroupCodeInput')
  assert.equal(vm.isExistingGroup, false)
  assert.equal(vm.pmpGroupName, '')
  assert.equal(vm.remoteNumberId, null)
  assert.equal(vm.pmpRemoteNumber, '')
  assert.equal(vm.showView, false)
  assert.equal(vm.showCreateGroup, true)
})

test('changing groups clears the old subgroup even when subgroup codes are equal', async () => {
  const { vm, enter, routes } = await selection()
  vm.applyGroup(groups()[0]); vm.applyRemote(groups()[0].remote_number[0])
  await Vue.nextTick()
  await enter('pmpGroup', '002', 'onGroupCodeInput')
  assert.equal(vm.pmpGroupName, 'Other group')
  assert.deepEqual(vm.pmpRemoteNumbers.map(part => part.id), [201])
  assert.equal(vm.remoteNumberId, null)
  assert.equal(vm.showView, false)
  await enter('pmpRemoteNumber', '01', 'onRemoteCodeInput')
  vm.viewFiles()
  assert.equal(vm.remoteNumberId, 201)
  assert.deepEqual(routes, [{ path: '/ru/engineer/files/view', query: { id: 201 } }])
})

test('typing a new subgroup code preserves it and shows Create instead of View', async () => {
  const { vm, enter, routes } = await selection()
  vm.applyGroup(groups()[0]); vm.applyRemote(groups()[0].remote_number[0])
  await Vue.nextTick()
  await enter('pmpRemoteNumber', '09', 'onRemoteCodeInput')
  assert.equal(vm.pmpRemoteNumber, '09')
  assert.equal(vm.pmpRemoteNumberName, '')
  assert.equal(vm.showView, false)
  assert.equal(vm.showCreateRemote, true)
  vm.viewFiles()
  assert.deepEqual(routes, [])
})

test('names can select existing records and edited names clear stale codes', async () => {
  const { vm, enter, routes } = await selection()
  await enter('pmpGroupName', 'First group', 'onGroupNameInput')
  assert.equal(vm.pmpGroup, '001')
  await enter('pmpRemoteNumberName', 'Second part', 'onRemoteNameInput')
  assert.equal(vm.pmpRemoteNumber, '02')
  assert.equal(vm.showView, true)
  assert.equal(vm.showCreateRemote, false)
  vm.viewFiles()
  assert.deepEqual(routes, [{ path: '/ru/engineer/files/view', query: { id: 102 } }])
  await enter('pmpRemoteNumberName', 'New part', 'onRemoteNameInput')
  assert.equal(vm.pmpRemoteNumber, '')
  assert.equal(vm.showView, false)
  assert.equal(vm.showCreateRemote, true)
  await enter('pmpGroupName', 'New group', 'onGroupNameInput')
  assert.equal(vm.pmpGroup, '')
  assert.equal(vm.isExistingGroup, false)
  assert.equal(vm.showCreateGroup, true)
})

test('group data arriving after typing enables only the matching group subgroups', async () => {
  const { vm, enter } = await selection([])
  await enter('pmpGroup', '001', 'onGroupCodeInput')
  assert.equal(vm.isExistingGroup, false)
  vm.getPmpes = { pmp: groups() }
  await Vue.nextTick()
  assert.equal(vm.pmpGroupName, 'First group')
  assert.deepEqual(vm.pmpRemoteNumbers.map(part => part.id), [101, 102])
})

test('Create appears before both fields are completed, with saving disabled until complete', async () => {
  const { vm, enter } = await selection()
  await enter('pmpGroupName', 'New group', 'onGroupNameInput')
  assert.equal(vm.showCreateGroup, true)
  assert.equal(vm.canCreateGroup, false)
  await enter('pmpGroup', '990', 'onGroupCodeInput')
  assert.equal(vm.canCreateGroup, true)
  vm.applyGroup(groups()[0]); await Vue.nextTick()
  await enter('pmpRemoteNumber', '09', 'onRemoteCodeInput')
  assert.equal(vm.showCreateRemote, true)
  assert.equal(vm.canCreateRemote, false)
  await enter('pmpRemoteNumberName', 'New part', 'onRemoteNameInput')
  assert.equal(vm.canCreateRemote, true)
})

test('partial codes do not autocomplete and prevent the next typed digit', async () => {
  const { vm, enter } = await selection()
  await enter('pmpGroup', '1', 'onGroupCodeInput')
  assert.equal(vm.pmpGroup, '1')
  assert.equal(vm.isExistingGroup, false)
  await enter('pmpGroup', '001', 'onGroupCodeInput')
  await enter('pmpRemoteNumber', '1', 'onRemoteCodeInput')
  assert.equal(vm.pmpRemoteNumber, '1')
  assert.equal(vm.showView, false)
  await enter('pmpRemoteNumber', '01', 'onRemoteCodeInput')
  assert.equal(vm.remoteNumberId, 101)
})

test('native subgroup inputs are disabled until a group is selected and actions match the selection', async () => {
  const compiler = require('vue-template-compiler')
  const renderer = require('vue-server-renderer').createRenderer()
  const { vm, enter } = await selection()
  Object.assign(vm.$options, compiler.compileToFunctions(read('pages/engineer/files/index.vue').match(/<template>([\s\S]*?)<\/template>/)[1]))
  vm.$options.components = {
    InfoTooltip: { render: h => h('span') },
    notifications: { render: h => h('span') },
  }
  let html = await renderer.renderToString(vm)
  for (const id of ['pmp-remote-code', 'pmp-remote-name']) {
    assert.match(html, new RegExp(`<input(?=[^>]*id="${id}")(?=[^>]*disabled="disabled")[^>]*>`))
  }
  await enter('pmpGroup', '001', 'onGroupCodeInput')
  html = await renderer.renderToString(vm)
  for (const id of ['pmp-remote-code', 'pmp-remote-name']) {
    assert.doesNotMatch(html, new RegExp(`<input(?=[^>]*id="${id}")(?=[^>]*disabled)[^>]*>`))
  }
  await enter('pmpRemoteNumber', '01', 'onRemoteCodeInput')
  html = await renderer.renderToString(vm)
  assert.match(html, /Դիտել ֆայլերը/)
  assert.doesNotMatch(html, /Ստեղծել ենթախումբ/)
  await enter('pmpRemoteNumber', '09', 'onRemoteCodeInput')
  html = await renderer.renderToString(vm)
  assert.match(html, /Ստեղծել ենթախումբ/)
  assert.doesNotMatch(html, /Դիտել ֆայլերը/)
})

test('saved groups remain usable even when refreshing the group list fails', async () => {
  const { vm, notifications, enter } = await selection()
  const store = await import(moduleUrl(read('store/pmp/index.js')))
  const state = store.state()
  state.pmps = vm.getPmpes
  const commit = (name, data) => { store.mutations[name](state, data); vm.getPmpes = state.pmps }
  let calls = 0
  vm.createPmp = payload => store.actions.createPmp.call({ $axios: { post: async (url, data) => {
    calls++
    assert.equal(url, '/api/engineers/pmps')
    assert.equal(data.group, '990')
    return { data: { id: 30, ...data, remote_number: [] } }
  } } }, { commit }, payload)
  vm.fetchPmps = async () => false
  await enter('pmpGroup', '990', 'onGroupCodeInput')
  await enter('pmpGroupName', 'New group', 'onGroupNameInput')
  await vm.addPmpGroup(); await Vue.nextTick()
  assert.equal(calls, 1)
  assert.equal(vm.isExistingGroup, true)
  assert.equal(vm.existingGroup.id, 30)
  assert.equal(vm.showCreateGroup, false)
  assert.equal(vm.saving, false)
  assert.ok(notifications.some(item => item.type === 'warning'))
})

test('saved subgroups navigate by their server ID and preserve existing group files on refresh failure', async () => {
  const { vm, routes, enter } = await selection()
  const store = await import(moduleUrl(read('store/pmp/index.js')))
  const state = store.state()
  state.pmps = { pmp: groups() }
  state.pmps.pmp[0].files = [{ id: 50, original_name: 'previous.pdf' }]
  vm.getPmpes = state.pmps
  const commit = (name, data) => { store.mutations[name](state, data); vm.getPmpes = state.pmps }
  vm.rememberNumberPmp = payload => store.actions.rememberNumberPmp.call({ $axios: { post: async (url, data) => {
    assert.equal(url, '/api/engineers/pmps/10/remote-number')
    assert.equal(data.group, '001')
    return { data: { ...groups()[0], remote_number: [...groups()[0].remote_number, { id: 109, remote_number: '09', remote_number_name: 'New part' }] } }
  } } }, { commit }, payload)
  vm.fetchPmps = async () => false
  vm.applyGroup(groups()[0]); await Vue.nextTick()
  await enter('pmpRemoteNumber', '09', 'onRemoteCodeInput')
  await enter('pmpRemoteNumberName', 'New part', 'onRemoteNameInput')
  await vm.addPmpGroupRemoteNumber()
  assert.deepEqual(routes, [{ path: '/ru/engineer/files/view', query: { id: 109 } }])
  assert.deepEqual(state.pmps.pmp[0].files.map(file => file.original_name), ['previous.pdf'])
})

test('legacy API compatibility reads the real factory list and relies on existing server format validation', async () => {
  const { actions } = await import(moduleUrl(read('store/factory/index.js')))
  for (const status of [404, 405]) {
    const calls = [], commits = []
    const policies = await actions.fetchFactoryFilePolicies.call({ $axios: { get: async url => {
      calls.push(url)
      if (url === '/api/factory-file-policies') throw { response: { status } }
      return { data: [{ id: 6, value: 'INFO', name: 'Information' }, { id: 3, value: 'DXF', name: 'Cutting', extensions: ['dxf'] }, { id: 4, value: 'IQS', name: 'Laser', file_extensions: [] }] }
    } } }, { commit: (...args) => commits.push(args) })
    assert.deepEqual(calls, ['/api/factory-file-policies', '/api/factories/factory'])
    assert.deepEqual(policies[0].extensions, ['*'])
    assert.equal(policies[0].serverValidatedFormats, true)
    assert.deepEqual(policies[1].extensions, ['dxf'])
    assert.equal(policies[1].serverValidatedFormats, false)
    assert.deepEqual(policies[2].extensions, [])
    assert.deepEqual(commits, [['SET_FACTORY', policies]])
  }
})

test('policy auth, network, and server errors never enable the compatibility picker', async () => {
  const { actions } = await import(moduleUrl(read('store/factory/index.js')))
  for (const status of [401, 403, 419, 422, 429, 500, undefined]) {
    const calls = []
    await assert.rejects(actions.fetchFactoryFilePolicies.call({ $axios: { get: async url => {
      calls.push(url); throw { response: { status } }
    } } }, { commit() { assert.fail('must not commit a failed policy') } }))
    assert.deepEqual(calls, ['/api/factory-file-policies'])
  }
  await assert.rejects(actions.fetchFactoryFilePolicies.call({ $axios: { get: async url => {
    if (url === '/api/factory-file-policies') throw { response: { status: 404 } }
    return { data: [{ id: 3, value: 'DXF', extensions: null }] }
  } } }, { commit() { assert.fail('must not permit malformed policy data') } }))
})

async function filesPage() {
  const options = await component('pages/engineer/files/view.vue')
  const vm = new Vue({
    ...options,
    created() {},
    data: () => ({ ...options.data(), id: 101, getPmp: { ...groups()[0], files: [{ id: 1, remote_number_id: 101 }] }, getFactory: ['SW', 'DLD', 'DXF', 'IQS', 'INFO', 'PDF'].map((value, i) => ({ id: i + 1, value })), getMaterials: [] }),
    methods: { ...options.methods, $t: key => key, fetchPmp: async () => true, fetchFactory: async () => true },
  })
  return vm
}

test('opening a selected subgroup goes straight to its factories and files', async () => {
  const vm = await filesPage()
  vm.fetchFactoryFilePolicies = async () => vm.getFactory.map(factory => ({ ...factory, extensions: ['*'], serverValidatedFormats: true }))
  await vm.loadPage()
  assert.equal(vm.projectReady, true)
  assert.equal(vm.pageError, '')
  assert.equal(vm.factoryListError, '')
  assert.equal(vm.isOpen, 'factories')
  assert.equal(vm.selectedRemoteNumberId, 101)
  assert.equal(vm.selectedFiles[0].id, 1)
  assert.equal(vm.factoryPolicies.length, 6)
})

test('format loading failure keeps the readable project and factories available for viewing', async () => {
  const vm = await filesPage()
  vm.fetchFactoryFilePolicies = async () => { throw { response: { status: 403 } } }
  await vm.loadPage()
  assert.equal(vm.projectReady, true)
  assert.equal(vm.pageError, '')
  assert.equal(vm.factoryListError, '')
  assert.equal(vm.getFactory.length, 6)
  assert.equal(vm.allowedExtensions.length, 0)
  assert.equal(vm.canSubmitFile, false)
})

test('project and factory errors are distinct and failed projects cannot expose stale files', async () => {
  const vm = await filesPage()
  vm.fetchPmp = async () => { throw { response: { status: 404 } } }
  vm.fetchFactoryFilePolicies = async () => vm.getFactory
  await vm.loadPage()
  assert.equal(vm.projectReady, false)
  assert.equal(vm.pageError, 'file_upload.project_failed')
  assert.equal(vm.factoryListError, '')
  vm.fetchPmp = async () => true
  vm.fetchFactoryFilePolicies = async () => { throw { response: { status: 500 } } }
  vm.fetchFactory = async () => false
  await vm.loadPage()
  assert.equal(vm.projectReady, true)
  assert.equal(vm.pageError, '')
  assert.equal(vm.factoryListError, 'file_upload.factories_failed')
})


test('file breadcrumbs retain both project codes and never show files from another subgroup', async () => {
  const page = await component('pages/engineer/files/view.vue')
  const pmp = { ...groups()[0], files: [
    { id: 1, remote_number_id: 101, factory_id: 6, original_name: 'first.pdf' },
    { id: 2, remote_number_id: 102, factory_id: 6, original_name: 'other.pdf' },
  ] }
  const vm = { ...page.data(), getPmp: pmp, getFactory: [{ id: 6, value: 'DLD' }], projectReady: true }
  for (const [name, method] of Object.entries(page.methods)) vm[name] = method.bind(vm)
  for (const [name, getter] of Object.entries(page.computed)) Object.defineProperty(vm, name, { get: getter.bind(vm) })
  vm.showFiles(pmp.remote_number[0])
  assert.deepEqual(vm.breadcrumb, ['001 — First group', '01 — First part'])
  vm.selectFactory(vm.getFactory[0])
  vm.selectedFile = pmp.files[0]
  assert.deepEqual(vm.breadcrumb, ['001 — First group', '01 — First part', 'DLD', 'first.pdf'])
  vm.selectBreadcrumb(2)
  assert.equal(vm.selectedRemoteNumberId, 101)
  assert.deepEqual(vm.selectedFiles.map(file => file.id), [1])
  assert.equal(vm.selectedFile, null)
  vm.selectBreadcrumb(1)
  assert.equal(vm.selectedFactoryId, null)
  assert.equal(vm.selectedRemoteNumberId, 101)
  vm.selectBreadcrumb(0)
  assert.equal(vm.selectedRemoteNumber, null)
  assert.deepEqual(vm.breadcrumb, ['001 — First group'])
})
