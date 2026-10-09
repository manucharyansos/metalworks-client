const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const load = file => import(moduleUrl(read(file)))
async function component(file) {
  const source = read(file).match(/<script>([\s\S]*?)<\/script>/)[1].replace(/import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g, (_, names, specifier) => specifier.startsWith('~/utils/') ? `import ${names} from '${moduleUrl(read(specifier.replace('~/', '') + '.js'))}'` : `const ${names} = {}`)
  return (await import(moduleUrl(source))).default
}
function vmFor(options, extra) {
  const vm = { $i18n: { locale: 'ru' }, $set: (object, key, value) => { object[key] = value }, $delete: (object, key) => { delete object[key] }, ...extra }
  for (const [key, method] of Object.entries(options.methods)) vm[key] = method.bind(vm)
  Object.assign(vm, options.data.call(vm), extra)
  for (const [key, getter] of Object.entries(options.computed || {})) Object.defineProperty(vm, key, { get: () => getter.call(vm) })
  return vm
}
const roles = [{ id: 1, name: 'engineer' }, { id: 2, name: 'laser' }, { id: 3, name: 'bend' }]
const factories = [{ id: 10, name: 'Workshop A' }, { id: 11, name: 'Workshop B' }]

test('role checkboxes preserve the existing primary assignment and remove only unchecked positions', async () => {
  const { selectAssignmentRoles } = await load('utils/staff-assignments.js')
  const original = [{ role_id: 2, factory_id: 10 }, { role_id: 2, factory_id: 11 }, { role_id: 1, factory_id: null }]
  const snapshot = JSON.stringify(original)
  assert.deepEqual(selectAssignmentRoles(original, [1, 2, 3]), [...original, { role_id: 3, factory_id: null }])
  assert.deepEqual(selectAssignmentRoles(original, [1]), [{ role_id: 1, factory_id: null }])
  assert.equal(JSON.stringify(original), snapshot)
})

test('workshop checkboxes apply only to their position and retain a surviving primary assignment', async () => {
  const { selectAssignmentWorkshops } = await load('utils/staff-assignments.js')
  const original = [{ role_id: 1, factory_id: null }, { role_id: 2, factory_id: 10 }, { role_id: 3, factory_id: 10 }]
  const expanded = selectAssignmentWorkshops(original, 2, [10, 11, 11])
  assert.deepEqual(expanded, [{ role_id: 1, factory_id: null }, { role_id: 2, factory_id: 10 }, { role_id: 2, factory_id: 11 }, { role_id: 3, factory_id: 10 }])
  assert.deepEqual(selectAssignmentWorkshops(expanded, 2, [11]), [{ role_id: 1, factory_id: null }, { role_id: 2, factory_id: 11 }, { role_id: 3, factory_id: 10 }])
  assert.equal(original.length, 3)
})

test('an operator cannot be saved after unchecking every workshop', async () => {
  const { selectAssignmentWorkshops, selectAssignmentRoles, assignmentError, assignmentCopy } = await load('utils/staff-assignments.js')
  const rows = selectAssignmentWorkshops([{ role_id: 1, factory_id: null }, { role_id: 2, factory_id: 10 }], 2, [])
  const copy = assignmentCopy('ru')
  assert.equal(assignmentError(rows, roles, factories, copy), copy.chooseWorkshop)
  assert.equal(assignmentError(selectAssignmentRoles(rows, [1]), roles, factories, copy), null)
})

test('a client adds companies without sending employee positions or workshops', async () => {
  const options = await component('components/users/CompanyMembershipModal.vue')
  const calls = [], events = []
  const vm = vmFor(options, { user: { id: 12 }, sourceCompanyId: 2, targetType: 'client', roles: [], companies: [{ id: 1, access: {} }, { id: 2, selection_locked: true, access: {} }], rows: [{ company_id: 1, enabled: true, role_id: null }, { company_id: 2, enabled: true, role_id: 4 }], originals: [{ company_id: 1, enabled: false, role_id: null }, { company_id: 2, enabled: true, role_id: 4 }], $axios: { $put: async (...args) => calls.push(args) }, $emit: (...event) => events.push(event) })
  await vm.save()
  assert.deepEqual(calls, [['/api/company-access/12', { access: [{ company_id: 1, enabled: true }] }, { timeout: 15000, params: { source_company_id: 2 } }]])
  assert.deepEqual(events, [['saved'], ['close']])
})

test('company checkboxes preserve the source membership and protected employee memberships', async () => {
  const options = await component('components/users/CompanyMembershipModal.vue')
  const vm = vmFor(options, { user: { id: 12 }, companies: [{ id: 1, selection_locked: true }, { id: 2 }, { id: 3, read_only: true }], rows: [{ company_id: 1, enabled: true }, { company_id: 2, enabled: false }, { company_id: 3, enabled: true }] })
  vm.setCompanyIds([2])
  assert.deepEqual(vm.rows.map(row => row.enabled), [true, true, true])
  vm.setCompanyIds([])
  assert.deepEqual(vm.rows.map(row => row.enabled), [true, false, true])
})

test('changing the reviewed company cannot be overwritten by an older workshop response', async () => {
  const options = await component('components/registration/RegistrationRequests.vue')
  const pending = []
  const vm = vmFor(options, { selected: { company_id: 1 }, $axios: { $get: (_, config) => new Promise(resolve => pending.push({ id: config.params.company_id, resolve })) } })
  const first = vm.loadOptions()
  vm.selected = { company_id: 2 }
  const second = vm.loadOptions()
  pending[1].resolve({ roles, factories: [{ id: 20 }] }); await second
  pending[0].resolve({ roles, factories: [{ id: 10 }] }); await first
  assert.deepEqual(pending.map(row => row.id), [1, 2])
  assert.deepEqual(vm.factories, [{ id: 20 }])
  assert.equal(vm.optionsLoading, false)
})

test('request type switches reset pagination while preserving company and review status', async () => {
  const options = await component('components/registration/RegistrationRequests.vue')
  const calls = []
  const vm = vmFor(options, { page: 3, status: 'approved', companyId: 2, $axios: { $get: async (_, config) => { calls.push(config.params); return { data: [], counts: {}, meta: { last_page: 1 }, companies: [] } } } })
  assert.deepEqual(vm.requestTypes.map(item => item.value), ['', 'client', 'employee'])
  await vm.changeType('client')
  await vm.changeType('employee')
  await vm.changeType('')
  assert.deepEqual(calls, [
    { status: 'approved', page: 1, company_id: 2, type: 'client' },
    { status: 'approved', page: 1, company_id: 2, type: 'employee' },
    { status: 'approved', page: 1, company_id: 2 },
  ])
  assert.equal(vm.loading, false)
})

test('client company selection cannot expose staff assignments left in workspace state', async () => {
  const options = await component('components/layout/CompanySelector.vue')
  const assignments = [{ id: 1, role: { name: 'laser' }, factory: { name: 'Workshop A' } }, { id: 2, role: { name: 'bend' }, factory: { name: 'Workshop B' } }]
  const vm = { $auth: { user: { role: { name: 'authenticatedUser' } } }, $store: { state: { workspace: { assignments } } } }
  assert.deepEqual(options.computed.assignments.call(vm), [])
  vm.$auth.user.role.name = 'laser'
  assert.deepEqual(options.computed.assignments.call(vm), assignments)
})

test('enabling another employee company opens its production roles without copying source workshops', async () => {
  const options = await component('components/users/CompanyAccessEditor.vue')
  const events = []
  const vm = { currentCompanyId: 1, roles, defaultAssignments: [{ role_id: 2, factory_id: 10 }, { role_id: 2, factory_id: 11 }, { role_id: 1, factory_id: null }], value: [{ company_id: 1, enabled: true, role_id: 2, factory_id: 10 }, { company_id: 2, enabled: false, role_id: '', factory_id: null }, { company_id: 3, enabled: true, role_id: 3, factory_id: 30, read_only: true }], $emit: (_, rows) => events.push(rows) }
  options.methods.selectCompanies.call(vm, [1, 2])
  assert.deepEqual(events[0][1], { company_id: 2, enabled: true, role_id: 2, factory_id: null, assignments: [{ role_id: 2, factory_id: null }, { role_id: 1, factory_id: null }] })
  assert.deepEqual(events[0][2], vm.value[2])
  assert.equal(vm.value[1].enabled, false)
})

test('worker editing saves only changed destinations and preserves protected and mixed company memberships', async () => {
  const options = await component('components/users/WorkerFormModal.vue')
  const events = []
  const vm = vmFor(options, { visible: true, canManageCompanies: true, roles, factories, companies: [{ id: 1, factories }, { id: 2, factories: [{ id: 20 }, { id: 21 }] }, { id: 3, factories: [] }], $auth: { user: { is_platform_admin: false, company: { id: 1 } } }, worker: { id: 15, name: 'Worker', email: 'worker@example.invalid', role_id: 2, factory_id: 10, assignments: [{ role_id: 2, factory_id: 10 }], worker: { phone: '123' }, company_access: [{ company_id: 1, enabled: true, role_id: 2, factory_id: 10 }, { company_id: 2, enabled: true, role_id: 2, factory_id: 20, assignments: [{ role_id: 2, factory_id: 20 }] }, { company_id: 3, enabled: true, role_id: 99, factory_id: null, read_only: true }] }, $emit: (_, value) => events.push(value) })
  vm.bootstrap()
  vm.form.phone = '456'
  vm.submit()
  assert.equal('company_access' in events[0].payload, false)
  vm.companyAccess[1].assignments.push({ role_id: 2, factory_id: 21 })
  vm.submit()
  assert.deepEqual(events[1].payload.company_access, [{ company_id: 2, enabled: true, role_id: 2, factory_id: 20, assignments: [{ role_id: 2, factory_id: 20 }, { role_id: 2, factory_id: 21 }] }])
  assert.equal(vm.originalAccess[1].assignments.length, 1)
  assert.equal(vm.worker.company_access[1].assignments.length, 1)
  assert.equal(vm.originalAccess[2].role_id, 99)
})

test('requests open all statuses and show separate type counts with unavailable company names disabled', async () => {
  const options = await component('components/registration/RegistrationRequests.vue')
  const calls = []
  const vm = vmFor(options, { $axios: { $get: async (_, config) => { calls.push(config.params); return { data: [{ id: 1, type: 'employee', status: 'approved' }], counts: { pending: 1, approved: 2, rejected: 0 }, type_counts: { client: 1, employee: 2 }, meta: { last_page: 1 }, companies: [{ id: 1 }], unmanaged_companies: [{ id: 2, name: 'Second' }] } } } })
  await vm.loadRequests()
  assert.deepEqual(calls[0], { status: 'all', page: 1 })
  assert.equal(vm.requests[0].status, 'approved')
  assert.deepEqual(vm.requestTypes.map(item => item.count), [3, 1, 2])
  assert.equal(vm.totalCount, 3)
  assert.deepEqual(vm.unmanagedCompanies, [{ id: 2, name: 'Second' }])
  const membership = await component('components/users/CompanyMembershipModal.vue')
  const clientVm = vmFor(membership, { user: { id: 1 }, targetType: 'client', unmanagedCompanies: vm.unmanagedCompanies })
  assert.equal(clientVm.companyOptions[0].disabled, true)
  assert.equal('access' in clientVm.companyOptions[0], false)
})

test('an older API keeps its pending list usable and reports that all-status support needs a server update', async () => {
  const options = await component('components/registration/RegistrationRequests.vue')
  const calls = []
  const vm = vmFor(options, { $axios: { $get: async (_, config) => {
    calls.push(config.params)
    if (config.params.status === 'all') throw { response: { status: 422, data: { errors: { status: ['Invalid status'] } } } }
    return { data: [{ type: 'employee' }], counts: { pending: 1, approved: 1, rejected: 0 }, meta: { last_page: 1 }, companies: [] }
  } } })
  await vm.loadRequests()
  assert.deepEqual(calls, [{ status: 'all', page: 1 }, { status: 'pending', page: 1 }])
  assert.equal(vm.status, 'pending')
  assert.equal(vm.requests[0].type, 'employee')
  assert.equal(vm.notice, vm.copy.serverUpdate)
  assert.equal(vm.listError, '')
  assert.equal(vm.requestTypes[2].count, null)
})
