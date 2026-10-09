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
  const vm = { ...options.data(), $i18n: { locale: 'ru' }, $set: (object, key, value) => { object[key] = value }, $delete: (object, key) => { delete object[key] }, ...extra }
  for (const [key, method] of Object.entries(options.methods)) vm[key] = method.bind(vm)
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
