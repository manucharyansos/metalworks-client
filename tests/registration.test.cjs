const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')

function sourceURL(source) { return `data:text/javascript;base64,${Buffer.from(source).toString('base64')}` }
async function load(file) { return import(sourceURL(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'))) }
async function registrationForm() {
  let source = fs.readFileSync(path.join(__dirname, '..', 'pages/register.vue'), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]
  source = source.replace(/^import .*$/gm, '')
  const { registrationCopy } = await load('utils/registration-copy.js')
  const component = (await import(sourceURL(`const mapGetters = () => ({}), mapActions = () => ({}), InputWithLabelIcon = {}, WorkspaceBranding = {};\n${source}`))).default
  const vm = { ...component.data(), $i18n: { locale: 'en' }, $store: { commit() {} }, $delete: (object, key) => { delete object[key] }, getRegistrationErrors: {}, getErrorMessage: null }
  Object.assign(vm, component.methods)
  Object.defineProperty(vm, 'copy', { get: () => registrationCopy(vm.$i18n.locale) })
  Object.defineProperty(vm, 'fields', { get: () => component.computed.fields.call(vm) })
  vm.form = { name: 'Li', email: 'new@example.invalid', password: 'new-password', password_confirmation: 'new-password', last_name: '', patronymic: '', job_title: '' }
  return vm
}

async function authHarness(axios) {
  const auth = await load('store/authCustom/index.js')
  const state = auth.state()
  return { state, run: payload => auth.actions.registerUser.call({ $axios: axios }, { commit: (name, value) => auth.mutations[name](state, value) }, payload) }
}

test('pending acknowledgement never signs in or creates client-side identity', async () => {
  const calls = []
  const h = await authHarness({ get: async (url, config) => calls.push({ url, config }), post: async (url, body, config) => { calls.push({ url, body, config }); return { status: 202, data: { status: 'pending' } } } })
  assert.deepEqual(await h.run({ name: 'Li' }), { status: 'pending' })
  assert.equal(h.state.user, null)
  assert.deepEqual(calls.map(call => call.url), ['/sanctum/csrf-cookie', '/api/register'])
  assert.ok(calls.every(call => call.config.timeout === 15000))
})

test('one stale CSRF response performs exactly one new handshake and retry', async () => {
  let handshakes = 0, posts = 0
  const h = await authHarness({ get: async () => handshakes++, post: async () => { if (++posts === 1) throw { response: { status: 419 } }; return { status: 202, data: { status: 'pending' } } } })
  assert.equal((await h.run({})).status, 'pending')
  assert.equal(handshakes, 2); assert.equal(posts, 2)
})

for (const status of [422, 429, 503, undefined]) {
  test(`registration failure ${status || 'timeout'} stops, preserves field errors and allows retry`, async () => {
    let posts = 0
    const h = await authHarness({ get: async () => {}, post: async () => { posts++; throw { response: status ? { status, data: { message: 'Try later', errors: { email: ['Use the current password'] } } } : undefined } } })
    assert.equal(await h.run({}), false)
    assert.equal(posts, 1)
    assert.equal(h.state.errorMessage, status ? 'Try later' : 'Registration failed')
    assert.deepEqual(h.state.registrationErrors, status ? { email: ['Use the current password'] } : {})
  })
}

test('repeated CSRF failures are bounded to two requests', async () => {
  let handshakes = 0
  const h = await authHarness({ get: async () => { handshakes++; throw { response: { status: 419 } } }, post: async () => assert.fail('must not POST without CSRF') })
  assert.equal(await h.run({}), false)
  assert.equal(handshakes, 2)
})

test('old immediate-registration response cannot be mistaken for accepted application', async () => {
  const h = await authHarness({ get: async () => {}, post: async () => ({ status: 201, data: { user: { id: 123 } } }) })
  assert.equal(await h.run({}), false)
  assert.equal(h.state.user, null)
})

test('both applicant types choose among multiple companies and sole company is automatic', async () => {
  const vm = await registrationForm()
  vm.$axios = { $get: async () => ({ companies: [{ id: 1, name: 'MetalWorks' }, { id: 2, name: 'Second Works' }] }) }
  await vm.loadCompanies()
  assert.equal(vm.companyId, '')
  assert.equal(vm.validateFields(), false)
  assert.equal(vm.localErrors.company_id, 'Select a company')
  vm.$axios.$get = async () => ({ companies: [{ id: 1, name: 'MetalWorks' }] })
  await vm.loadCompanies()
  assert.equal(vm.companyId, 1)
  assert.equal(vm.validateFields(), true)
  vm.isEmployee = true
  assert.equal(vm.validateFields(), false)
  assert.ok(vm.localErrors.last_name); assert.ok(vm.localErrors.job_title)
  vm.form.last_name = 'Surname'; vm.form.job_title = 'Operator'
  assert.equal(vm.validateFields(), true)
  assert.equal(vm.fields.find(field => field.key === 'patronymic').required, false)
  assert.ok(!vm.fields.some(field => field.key === 'phone' || field.key === 'role_id'))
})

test('empty or failed company directory stays actionable without permitting an unassigned request', async () => {
  const vm = await registrationForm()
  vm.$axios = { $get: async () => { throw new Error('offline') } }
  await vm.loadCompanies()
  assert.equal(vm.companiesLoading, false); assert.ok(vm.companiesError)
  vm.$axios.$get = async () => ({ companies: [] })
  await vm.loadCompanies()
  assert.equal(vm.companiesError, vm.copy.noCompanies)
  assert.equal(vm.validateFields(), false)
})

test('unchecking employee removes previous staff data from submitted client request', async () => {
  const vm = await registrationForm()
  vm.companyId = 1; vm.companies = [{ id: 1 }]
  vm.form.last_name = 'Old surname'; vm.form.patronymic = 'Old middle'; vm.form.job_title = 'Administrator'
  let body
  vm.registerUser = async payload => { body = payload; return { status: 'pending' } }
  await vm.sendRegister()
  assert.equal(body.is_employee, false); assert.equal(body.last_name, null); assert.equal(body.patronymic, null); assert.equal(body.job_title, null)
  assert.equal(vm.accepted, true); assert.equal(vm.loading, false)
  assert.equal(vm.form.password, ''); assert.equal(vm.form.password_confirmation, '')
})

test('double submit cannot create two requests and failure releases the form', async () => {
  const vm = await registrationForm()
  vm.companyId = 1; vm.companies = [{ id: 1 }]
  let finish, calls = 0
  vm.registerUser = () => { calls++; return new Promise(resolve => { finish = resolve }) }
  const submitted = vm.sendRegister()
  await vm.sendRegister()
  assert.equal(calls, 1); assert.equal(vm.loading, true)
  finish(false); await submitted
  assert.equal(vm.loading, false); assert.equal(vm.accepted, false); assert.ok(vm.submitError)
})

test('editing a field clears its stale error while retaining errors in untouched fields', async () => {
  const vm = await registrationForm()
  vm.isEmployee = true; vm.companyId = 1; vm.companies = [{ id: 1 }]
  assert.equal(vm.validateFields(), false)
  vm.form.last_name = 'Surname'; vm.clearFieldError('last_name')
  assert.equal(vm.fieldError('last_name'), '')
  assert.ok(vm.fieldError('job_title'))
})

test('public application endpoints cannot carry a stale company header; reviews remain scoped', async () => {
  const { isCompanyRequest } = await load('utils/company-workspace.js')
  for (const url of ['/api/register', '/api/register/', '/api/registration/companies', '/api/registration/companies?locale=ru']) assert.equal(isCompanyRequest(url), false)
  for (const url of ['/api/registration-requests', '/api/registration-requests/options', '/api/registration-requests/12/approve']) assert.equal(isCompanyRequest(url), true)
})
