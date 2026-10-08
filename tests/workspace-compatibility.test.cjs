const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const Vue = require('vue')
const compiler = require('vue-template-compiler')
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const routeUrl = moduleUrl(read('utils/workspace-route.js'))
const brandsUrl = moduleUrl(read('config/workspace-brands.js'))
const companyCopyUrl = moduleUrl(read('utils/company-copy.js'))
const brandLogoUrl = moduleUrl(read('utils/brand-logo.js'))
async function component(file, render = false) {
  const parsed = compiler.parseComponent(read(file))
  const source = parsed.script.content.replace(/import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g, (_, names, specifier) => {
    if (specifier === '@/utils/workspace-route') return `import ${names} from '${routeUrl}'`
    if (specifier === '~/config/workspace-brands') return `import ${names} from '${brandsUrl}'`
    if (specifier === '~/utils/company-copy') return `import ${names} from '${companyCopyUrl}'`
    if (specifier === '~/utils/brand-logo') return `import ${names} from '${brandLogoUrl}'`
    if (specifier === '~/static/logo.png') return `const ${names} = '/work/_nuxt/img/metalworks-test.png'`
    if (specifier === 'vuex') return 'const mapActions = () => ({}); const mapGetters = () => ({})'
    return `const ${names} = {}`
  })
  const options = (await import(moduleUrl(source))).default
  if (options.components?.WorkspaceLogo) options.components.WorkspaceLogo = await component('components/auth/WorkspaceLogo.vue', true)
  return render ? { ...options, ...compiler.compileToFunctions(parsed.template.content) } : options
}

for (const [role, links] of [
  ['engineer', ['/engineer', '/engineer/files', '/engineer/orders/create']],
  ['manager', ['/manager', '/manager/workers', '/manager/clients', '/manager/materials']],
  ['admin', ['/admin', '/admin/users', '/admin/reports', '/admin/file-extension']],
  ['factory', ['/factory/laser', '/profile']],
]) {
  test(`${role} layout retains its navigation, identity, settings, and routed page`, async () => {
    const auth = { loggedIn: true, user: { id: 1, name: 'QA', last_name: 'User', email: 'qa@example.invalid', phone: '555000', role: { name: role === 'factory' ? 'laser' : role }, permissions: ['orders.view'] } }
    const context = { beforeCreate() {
      this.$auth = auth
      this.$store = { state: { workspace: { company: null, companies: [], switching: false } } }
      this.$route = { path: `/ru${links[0]}`, fullPath: `/ru${links[0]}` }
      this.$router = { options: { base: '/work/' } }
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
      CompanySelector: { ...await component('components/layout/CompanySelector.vue', true), ...context },
      WorkspaceTransition: { ...await component('components/layout/WorkspaceTransition.vue', true), ...context },
      NuxtLink: { props: ['to'], render(h) { return h('a', { attrs: { href: this.to } }, this.$slots.default) } },
      Nuxt: { render: h => h('main', 'Existing route content') },
      LanguageDropdown: { render: h => h('button', 'RU') },
    }
    const html = await require('vue-server-renderer').createRenderer().renderToString(new Vue({ ...options, ...context }))
    assert.match(html, /QA User/)
    assert.match(html, /qa@example.invalid/)
    assert.doesNotMatch(html, /555000|workspace_layout.phone_not_set/)
    assert.match(html, /Existing route content/)
    for (const link of links) assert.ok(html.includes(`href="/ru${link}"`), link)
    const header = html.match(/<header[\s\S]*?<\/header>/)[0]
    const sidebar = html.match(/<aside[\s\S]*?<\/aside>/)[0]
    assert.match(sidebar, /src="\/work\/_nuxt\/img\/metalworks-test.png" alt="MetalWorks"/)
    const identityRows = [...sidebar.matchAll(/<p[^>]*>([^<]*)<\/p>/g)].slice(0, 3).map(match => match[1].trim())
    assert.deepEqual(identityRows, ['MetalWorks', 'QA User', 'qa@example.invalid'])
    assert.doesNotMatch(header, /href="\/ru\/profile"/, 'header does not duplicate sidebar settings')
    assert.match(sidebar, /href="\/ru\/profile"/, 'account settings remain accessible in the sidebar')
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
  const projects = {
    10: { id: 10, files: [{ id: 1, remote_number_id: 101, factory_id: 6, original_name: 'note.txt' }] },
    20: { id: 20, files: [{ id: 5, remote_number_id: 201, factory_id: 6 }, { id: 6, remote_number_id: 202, factory_id: 6 }] },
  }
  const vm = new Vue({
    ...options, mounted() {},
    data: () => ({ ...options.data(), getFactory: [{ id: 6, value: 'INFO', operators: [{ id: 40, name: 'QA Operator' }] }], getPmpes: { pmp: [] }, getPmp: projects[10], allClients: [] }),
    methods: { ...options.methods, $notify: item => notifications.push(item), async checkPmpByRemoteNumber() { this.getPmp = projects[this.selectedPmp.id]; return true }, createNewOrder: async payload => { requests.push(payload); return true } },
  })
  vm.$route = { path: '/engineer/orders/create' }
  vm.$auth = { user: { id: 30 } }
  vm.$router = { push() {} }
  vm.$t = key => key
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
  vm.selectFromOtherFactory()
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
  assert.equal(requests[0].link_existing_files, true)
})

test('orders can still request all existing subgroup files with the original server flag', async () => {
  const { vm, requests } = await orderPage()
  vm.files_existing = false
  await vm.pmpFiles()
  assert.equal(requests.length, 1)
  assert.equal(requests[0].link_existing_files, false)
  assert.deepEqual(requests[0].selected_files, [])
  assert.equal(requests[0].remote_number_id, 101)
})

test('failed order saves retain the selected files, quantities, and entered details', async () => {
  const { vm, notifications } = await orderPage()
  vm.files_existing = true
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

for (const selectedMode of [false, true]) {
  test(`empty subgroup cannot create an order in ${selectedMode ? 'selected' : 'all'} file mode`, async () => {
    const { vm, requests, notifications } = await orderPage()
    vm.orderPmp.files = []
    vm.files_existing = selectedMode
    assert.equal(vm.canProceedToFiles, false)
    assert.equal(vm.canSubmit, false)
    assert.equal(vm.orderFileIssue, 'order_files.empty_subgroup')
    await vm.pmpFiles()
    assert.equal(requests.length, 0)
    assert.equal(vm.isLoading, false)
    assert.equal(vm.description, 'QA order')
    assert.equal(notifications.at(-1).text, 'order_files.empty_subgroup')
  })
}

test('files in another subgroup cannot enable order creation or file picking', async () => {
  const { vm, requests } = await orderPage()
  vm.orderPmp.files[0].remote_number_id = 102
  vm.selectFromOtherFactory()
  assert.equal(vm.isFiles, false)
  assert.equal(vm.canSubmit, false)
  await vm.pmpFiles()
  assert.equal(requests.length, 0)
})

test('selected file mode requires at least one selected file and opens the populated factory', async () => {
  const { vm, requests } = await orderPage()
  assert.equal(vm.canSubmit, true)
  vm.selectFromOtherFactory()
  assert.equal(vm.isFiles, true)
  assert.equal(vm.autoOpenFactoryId, 6)
  assert.equal(vm.canSubmit, false)
  await vm.pmpFiles()
  assert.equal(requests.length, 0)
  vm.handleFilesSelected([{ id: 1, quantity: 2 }])
  assert.equal(vm.canSubmit, true)
  await vm.pmpFiles()
  assert.deepEqual(requests[0].selected_files, [{ id: 1, quantity: 2 }])
})

test('stale file IDs and fractional quantities cannot be saved', async () => {
  const { vm, requests, notifications } = await orderPage()
  vm.files_existing = true
  vm.handleFilesSelected([{ id: 5, quantity: 2 }])
  assert.equal(vm.canSubmit, false)
  await vm.pmpFiles()
  assert.equal(requests.length, 0)
  assert.equal(notifications.at(-1).text, 'order_files.wrong_subgroup')
  vm.handleFilesSelected([{ id: 1, quantity: 1.5 }])
  assert.equal(vm.canSubmit, false)
  await vm.pmpFiles()
  assert.equal(requests.length, 0)
})

test('a pending or failed subgroup read cannot create an order and Retry restores the form', async () => {
  const { vm, requests } = await orderPage()
  let complete
  vm.checkPmpByRemoteNumber = () => new Promise(resolve => { complete = resolve })
  const loading = vm.loadSelectedPmpFiles()
  assert.equal(vm.orderFileIssue, 'order_files.loading')
  assert.equal(vm.canSubmit, false)
  await vm.pmpFiles()
  assert.equal(requests.length, 0)
  complete(false)
  await loading
  assert.equal(vm.orderFileIssue, 'order_files.load_failed')
  await vm.pmpFiles()
  assert.equal(requests.length, 0)
  assert.equal(vm.description, 'QA order')
  vm.checkPmpByRemoteNumber = async () => true
  await vm.loadSelectedPmpFiles()
  assert.equal(vm.canSubmit, true)
  assert.equal(vm.pmpFilesLoadError, false)
})

test('an older group read cannot overwrite the current subgroup files or loading state', async () => {
  const { vm } = await orderPage()
  const pending = {}
  vm.checkPmpByRemoteNumber = id => new Promise(resolve => { pending[id] = resolve })
  const first = vm.loadSelectedPmpFiles()
  vm.selectPmpGroup({ id: 20, group: '002' })
  await Vue.nextTick()
  const second = vm.selectPmpRemoteNumber({ id: 201, remote_number: '01' })
  vm.getPmp = { id: 20, files: [{ id: 5, remote_number_id: 201, factory_id: 6 }] }
  pending[201](true)
  await second
  vm.getPmp = { id: 10, files: [{ id: 1, remote_number_id: 101, factory_id: 6 }] }
  pending[101](true)
  await first
  assert.equal(vm.orderPmp.id, 20)
  assert.deepEqual(vm.subgroupFiles.map(file => file.id), [5])
  assert.equal(vm.canSubmit, true)
})

test('a Laravel 422 file validation message is displayed without clearing the order', async () => {
  const { vm, notifications } = await orderPage()
  vm.createNewOrder = async () => { throw { response: { status: 422, data: { errors: { selected_files: ['No files in the selected subgroup'] } } } } }
  await vm.pmpFiles()
  assert.match(notifications.at(-1).text, /No files in the selected subgroup/)
  assert.equal(vm.description, 'QA order')
  assert.equal(vm.remote_number_id, 101)
  assert.equal(vm.isLoading, false)
})

test('empty selected-file view renders a disabled Save button and a visible explanation', async () => {
  const { vm } = await orderPage()
  const rendered = await component('pages/engineer/orders/create/index.vue', true)
  vm.$options.render = rendered.render
  vm.$options.staticRenderFns = rendered.staticRenderFns
  vm.$options.components.ShowFiles = { render: h => h('div', 'File picker') }
  vm.$options.components.notifications = { render: h => h('div') }
  vm.$can = () => true
  vm.files_existing = true
  vm.isFiles = true
  const html = await require('vue-server-renderer').createRenderer().renderToString(vm)
  assert.match(html, /order_files.select_files/)
  assert.match(html, /<button[^>]*disabled="disabled"[^>]*>\s*order_create.save/)
})

test('order file warnings and recovery text exist in all three languages', () => {
  for (const locale of ['hy', 'ru', 'en']) {
    const messages = JSON.parse(read(`locales/${locale}.json`)).order_files
    for (const key of ['loading', 'load_failed', 'empty_subgroup', 'select_files', 'wrong_subgroup', 'retry']) {
      assert.equal(typeof messages[key], 'string')
      assert.ok(messages[key].length > 0)
    }
  }
})
