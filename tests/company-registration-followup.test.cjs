const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const sourceURL = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const load = file => import(sourceURL(read(file)))

test('branding resolves bundled MetalWorks, public API logos and base-prefixed paths correctly', async () => {
  const { resolveBrandLogo } = await load('utils/brand-logo.js')
  const fallback = '/work/_nuxt/img/metalworks.123.png', base = '/work/', api = 'https://api.example.invalid'
  assert.equal(resolveBrandLogo({ slug: 'metalworks', logo: 'logo.png' }, base, api, fallback), fallback)
  assert.equal(resolveBrandLogo({ slug: 'metalworks', logo: null }, base, api, fallback), fallback)
  assert.equal(resolveBrandLogo({ slug: 'second', logo: null }, base, api, fallback), null)
  assert.equal(resolveBrandLogo({ slug: 'second', logo: '/api/workspace/brands/2/logo?v=5' }, base, api, fallback), api + '/api/workspace/brands/2/logo?v=5')
  assert.equal(resolveBrandLogo({ logo: '/work/_nuxt/img/company.png' }, base, api, fallback), '/work/_nuxt/img/company.png')
  assert.equal(resolveBrandLogo({ logo: 'brand.png' }, base, api, fallback), '/work/brand.png')
  assert.equal(resolveBrandLogo({ logo: 'https://api.example.invalid/logo' }, base, api, fallback), 'https://api.example.invalid/logo')
})

test('active companies replace offline branding and directory failure keeps the bundled default', async () => {
  let source = read('components/auth/WorkspaceBranding.vue').match(/<script>([\s\S]*?)<\/script>/)[1]
  source = source.replace(/^import .*$/gm, '')
  const component = (await import(sourceURL(`const workspaceBrands = [{slug:'metalworks',name:'MetalWorks'}], WorkspaceLogo = {};\n${source}`))).default
  const vm = { ...component.data(), brands: null, $axios: { $get: async () => ({ brands: [{ id: 1, name: 'MetalWorks' }, { id: 2, name: 'Second Works' }] }) } }
  await component.methods.loadBrands.call(vm)
  assert.deepEqual(component.computed.activeBrands.call(vm).map(brand => brand.name), ['MetalWorks', 'Second Works'])
  vm.publishedBrands = null; vm.$axios.$get = async () => { throw new Error('offline') }
  await component.methods.loadBrands.call(vm)
  assert.equal(component.computed.activeBrands.call(vm)[0].slug, 'metalworks')
})

test('only changed company memberships are sent and unchanged null fields stay unchanged', async () => {
  const { changedCompanyAccess } = await load('utils/membership-copy.js')
  const old = [{ company_id: 1, enabled: true, role_id: 4, factory_id: null }, { company_id: 2, enabled: false, role_id: null, factory_id: null }]
  assert.deepEqual(changedCompanyAccess(old.map(row => ({ ...row })), old), [])
  assert.deepEqual(changedCompanyAccess([{ ...old[0], factory_id: undefined }, { company_id: 2, enabled: true, role_id: '7', factory_id: '9' }], old), [{ company_id: 2, enabled: true, role_id: 7, factory_id: 9 }])
  assert.deepEqual(changedCompanyAccess([{ ...old[0], enabled: false }, old[1]], old), [{ company_id: 1, enabled: false, role_id: 4, factory_id: null }])
})

test('public branding ignores old selection while company access and notification endpoints remain scoped', async () => {
  const { isCompanyRequest } = await load('utils/company-workspace.js')
  for (const url of ['/api/workspace/brands', '/api/workspace/brands/2/logo?v=5', 'https://api.example.invalid/api/workspace/brands']) assert.equal(isCompanyRequest(url), false)
  for (const url of ['/api/company-access/12', '/api/registration-requests/3/notify']) assert.equal(isCompanyRequest(url), true)
})

test('membership form requires the destination workshop and sends only reviewed changes', async () => {
  let source = read('components/users/CompanyMembershipModal.vue').match(/<script>([\s\S]*?)<\/script>/)[1]
  source = source.replace(/^import .*$/gm, '')
  const helpers = await load('utils/membership-copy.js')
  const staffHelpers = sourceURL(read('utils/staff-assignments.js'))
  const component = (await import(sourceURL(`import { assignmentRows, assignmentError, assignmentCopy } from '${staffHelpers}'; const StaffAssignmentsEditor = {}, CheckboxSelect = {}, membershipCopy = () => ({}), changedCompanyAccess = () => [];\n${source}`))).default
  const calls = [], events = []
  const old = [{ company_id: 1, enabled: true, role_id: 3, factory_id: null }, { company_id: 2, enabled: false, role_id: null, factory_id: null }]
  const vm = { ...component.data(), userId: 12, copy: helpers.membershipCopy('ru'), roles: [{ id: 7, name: 'laser' }], companies: [{ id: 1, read_only: true }, { id: 2, factories: [{ id: 9 }] }], originals: old, rows: [old[0], { company_id: 2, enabled: true, role_id: 7, factory_id: null }], $set: (object, key, value) => { object[key] = value }, $emit: (...event) => events.push(event), $axios: { $put: async (...call) => calls.push(call) } }
  Object.assign(vm, component.methods)
  Object.defineProperty(vm, 'changes', { get: () => helpers.changedCompanyAccess(vm.rows, vm.originals) })
  await vm.save()
  assert.equal(calls.length, 0); assert.equal(vm.errors[2], vm.copy.chooseWorkshop)
  vm.rows[1].factory_id = 9
  await vm.save()
  assert.deepEqual(calls[0][1], { access: [{ company_id: 2, enabled: true, role_id: 7, factory_id: 9 }] })
  assert.deepEqual(events, [['saved'], ['close']]); assert.equal(vm.busy, false)
})
