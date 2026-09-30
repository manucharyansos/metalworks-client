const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const Vue = require('vue')
const compiler = require('vue-template-compiler')
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const routeUrl = moduleUrl(read('utils/workspace-route.js'))
async function component(file, render = false) {
  const parsed = compiler.parseComponent(read(file))
  const source = parsed.script.content.replace(/import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g, (_, names, specifier) => {
    if (specifier === '@/utils/workspace-route') return `import ${names} from '${routeUrl}'`
    if (specifier === 'vuex') return 'const mapActions = () => ({}); const mapGetters = () => ({})'
    return `const ${names} = {}`
  })
  const options = (await import(moduleUrl(source))).default
  return render ? { ...options, ...compiler.compileToFunctions(parsed.template.content) } : options
}

for (const [role, links] of [
  ['engineer', ['/engineer', '/engineer/files', '/engineer/orders/create']],
  ['manager', ['/manager', '/manager/workers', '/manager/clients', '/manager/materials']],
  ['admin', ['/admin', '/admin/users', '/admin/reports', '/admin/file-extension']],
  ['factory', ['/factory/laser', '/profile']],
]) {
  test(`${role} layout retains its navigation, identity, settings, and routed page`, async () => {
    const auth = { loggedIn: true, user: { id: 1, name: 'QA User', email: 'qa@example.invalid', phone: '555000', role: { name: role === 'factory' ? 'laser' : role }, permissions: ['orders.view'] } }
    const context = { beforeCreate() {
      this.$auth = auth
      this.$route = { path: `/ru${links[0]}`, fullPath: `/ru${links[0]}` }
      this.$i18n = { locale: 'ru' }
      this.$can = () => true
      this.$t = key => key
      this.localePath = value => `/ru${value}`
    } }
    const options = await component(`layouts/${role}.vue`, true)
    options.components = {
      ...options.components,
      WorkspaceIdentity: { ...await component('components/layout/WorkspaceIdentity.vue', true), ...context },
      WorkspaceSettingsIcon: await component('components/layout/WorkspaceSettingsIcon.vue', true),
      NuxtLink: { props: ['to'], render(h) { return h('a', { attrs: { href: this.to } }, this.$slots.default) } },
      Nuxt: { render: h => h('main', 'Existing route content') },
      LanguageDropdown: { render: h => h('button', 'RU') },
    }
    const html = await require('vue-server-renderer').createRenderer().renderToString(new Vue({ ...options, ...context }))
    assert.match(html, /QA User/)
    assert.match(html, /qa@example.invalid/)
    assert.match(html, /555000/)
    assert.match(html, /Existing route content/)
    for (const link of links) assert.ok(html.includes(`href="/ru${link}"`), link)
    assert.ok((html.match(/<circle/g) || []).length >= 2, 'settings gears render in header and sidebar')
  })
}

function bind(options, values) {
  const vm = { ...options.data(), ...values }
  for (const [name, method] of Object.entries(options.methods || {})) vm[name] = method.bind(vm)
  for (const [name, getter] of Object.entries(options.computed || {})) Object.defineProperty(vm, name, { get: getter.bind(vm) })
  return vm
}

test('order file selection supports INFO attachments and Select all preserves other factory selections', async () => {
  const options = await component('components/File/ShowFactoryFiles/ShowFiles.vue')
  const vm = bind(options, {
    pmps: { exists: true, pmp: { remote_number: [{ id: 101 }, { id: 201 }], files: [
      { id: 1, remote_number_id: 101, factory_id: 6, original_name: 'note.txt' },
      { id: 2, remote_number_id: 101, factory_id: 6, original_name: 'voice.webm' },
      { id: 3, remote_number_id: 101, factory_id: 3, original_name: 'part.dxf' },
      { id: 4, remote_number_id: 201, factory_id: 6, original_name: 'other.txt' },
    ] } },
    factories: [{ id: 6, value: 'INFO' }, { id: 3, value: 'DXF' }],
    remoteNumberId: 101, selectedFactory: { id: 6 }, selectedFiles: [3], fileQuantities: { 3: 7 },
  })
  const events = []
  vm.$emit = (name, value) => {
    if (name === 'update:selectedFiles') vm.selectedFiles = value
    if (name === 'update:fileQuantities') vm.fileQuantities = value
    events.push({ name, value })
  }
  assert.deepEqual(vm.factoriesWithCount.map(factory => factory.fileCount), [2, 1])
  vm.toggleSelectAll()
  assert.deepEqual(vm.selectedFiles, [3, 1, 2])
  assert.equal(vm.fileQuantities[3], 7)
  assert.equal(vm.allSelected, true)
  vm.toggleSelectAll()
  assert.deepEqual(vm.selectedFiles, [3])
  assert.deepEqual(vm.fileQuantities, { 3: 7 })
  vm.toggleFileSelection(1); vm.updateQuantity(1, '4'); vm.submitSelectedFiles()
  const submitted = events.find(item => item.name === 'files-selected').value
  assert.deepEqual(submitted.map(file => [file.id, file.quantity]), [[1, 4], [3, 7]])
  assert.ok(!submitted.some(file => file.id === 4))
})

async function orderPage() {
  const options = await component('pages/engineer/orders/create/index.vue')
  const notifications = [], requests = []
  const vm = new Vue({
    ...options, mounted() {},
    data: () => ({ ...options.data(), getFactory: [{ id: 6, value: 'INFO', operators: [{ id: 40, name: 'QA Operator' }] }], getPmpes: { pmp: [] }, getPmp: { id: 10, files: [{ id: 1, factory_id: 6, original_name: 'note.txt' }] }, allClients: [] }),
    methods: { ...options.methods, $notify: item => notifications.push(item), checkPmpByRemoteNumber: async () => true, createNewOrder: async payload => { requests.push(payload); return true } },
  })
  vm.$route = { path: '/engineer/orders/create' }
  vm.$auth = { user: { id: 30 } }
  vm.$router = { push() {} }
  vm.selectedClient = { user: { id: 20 } }
  vm.finishDate = '2026-10-15T12:00'
  vm.description = 'QA order'
  vm.selectPmpGroup({ id: 10, group: '001', group_name: 'First group' })
  await Vue.nextTick()
  await vm.selectPmpRemoteNumber({ id: 101, remote_number: '01' })
  return { vm, notifications, requests }
}

test('order group/subgroup changes clear stale file selections and retain client and order details', async () => {
  const { vm } = await orderPage()
  vm.handleFilesSelected([{ id: 1, quantity: 4 }])
  vm.selectPmpGroup({ id: 10, group: '001' })
  await Vue.nextTick()
  assert.deepEqual([...vm.selectedFiles], [1])
  vm.selectPmpGroup({ id: 20, group: '002' })
  assert.equal(vm.selectedPmpRemoteNumber, null)
  assert.equal(vm.remote_number_id, null)
  assert.equal(vm.canProceedToFiles, false)
  assert.deepEqual([...vm.selectedFiles], [])
  await Vue.nextTick()
  assert.equal(vm.selectedClient.user.id, 20)
  assert.equal(vm.description, 'QA order')
  assert.equal(vm.finishDate, '2026-10-15T12:00')
  await vm.selectPmpRemoteNumber({ id: 201, remote_number: '01' })
  vm.handleFilesSelected([{ id: 5, quantity: 2 }])
  await vm.selectPmpRemoteNumber({ id: 202, remote_number: '02' })
  assert.deepEqual([...vm.selectedFiles], [])
  assert.equal(vm.canProceedToFiles, true)
})

test('orders keep their selected-file quantities, factory operator, and existing API payload', async () => {
  const { vm, requests } = await orderPage()
  vm.handleFilesSelected([{ id: 1, quantity: 4 }])
  await Vue.nextTick()
  vm.factoryOperators = { 6: 40 }
  await vm.pmpFiles()
  assert.equal(requests.length, 1)
  assert.equal(requests[0].pmp_id, 10)
  assert.equal(requests[0].remote_number_id, 101)
  assert.equal(requests[0].user_id, 20)
  assert.equal(requests[0].creator_id, 30)
  assert.deepEqual(requests[0].selected_files, [{ id: 1, quantity: 4 }])
  assert.deepEqual(requests[0].factory_operators, [{ factory_id: 6, user_id: 40 }])
  assert.equal(requests[0].link_existing_files, false)
})

test('orders can still request all existing subgroup files with the original server flag', async () => {
  const { vm, requests } = await orderPage()
  vm.files_existing = true
  await vm.pmpFiles()
  assert.equal(requests.length, 1)
  assert.equal(requests[0].link_existing_files, true)
  assert.deepEqual(requests[0].selected_files, [])
  assert.equal(requests[0].remote_number_id, 101)
})

test('failed order saves retain the selected files, quantities, and entered details', async () => {
  const { vm, notifications } = await orderPage()
  vm.handleFilesSelected([{ id: 1, quantity: 4 }])
  vm.createNewOrder = async () => { throw { response: { data: { error: 'QA validation failure' } } } }
  await vm.pmpFiles()
  assert.deepEqual([...vm.selectedFiles], [1])
  assert.equal(vm.fileQuantities[1], 4)
  assert.equal(vm.description, 'QA order')
  assert.equal(vm.selectedClient.user.id, 20)
  assert.equal(vm.isLoading, false)
  assert.ok(!notifications.some(item => item.type === 'success' && item.text.includes('ստեղծվեց')))
})

test('legacy factory compatibility retains operators needed by order creation', async () => {
  const { actions } = await import(moduleUrl(read('store/factory/index.js')))
  const policies = await actions.fetchFactoryFilePolicies.call({ $axios: { get: async url => {
    if (url === '/api/factory-file-policies') throw { response: { status: 404 } }
    return { data: [{ id: 6, value: 'INFO', operators: [{ id: 40, name: 'QA Operator' }] }] }
  } } }, { commit() {} })
  assert.deepEqual(policies[0].operators, [{ id: 40, name: 'QA Operator' }])
})
