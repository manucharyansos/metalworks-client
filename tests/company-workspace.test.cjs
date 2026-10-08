const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')

function moduleSource(file) {
  let source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  source = source.replace(/(['"])~\/(utils\/company-(?:workspace|copy))\1/g, (_, quote, dependency) => `'${moduleSource(dependency + '.js')}'`)
  return `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
}
const load = (file) => import(moduleSource(file))
function memoryStorage() { const data = new Map(); return { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) } }
const companies = [{ id: 1, name: 'MetalWorks' }, { id: 2, name: 'Second Works' }]
const user = { id: 9, company: companies[0], companies, role: { name: 'admin' } }

async function harness(callback, setup, overrides = {}) {
  const plugin = (await load('plugins/company-context.client.js')).default
  const workspace = await load('store/workspace/index.js')
  const storage = memoryStorage()
  if (setup) await setup(storage)
  const originalWindow = global.window, originalDocument = global.document
  const listeners = {}, watchers = [], replacements = [], calls = [], alerts = []
  const activeUser = overrides.user || user
  const hooks = {}, state = { workspace: workspace.state(), auth: { user: activeUser } }
  let confirmation = true
  global.window = { sessionStorage: storage, confirm: () => confirmation, alert: message => alerts.push(message), location: { replace: path => replacements.push(path) } }
  global.document = { addEventListener: (name, listener) => { listeners[name] = listener } }
  const store = { state, commit: (name, payload) => workspace.mutations[name.split('/')[1]](state.workspace, payload), watch: (_, listener) => watchers.push(listener) }
  const auth = { user: activeUser, setUser(value) { this.user = value; state.auth.user = value } }
  const axios = {
    onRequest: cb => { hooks.request = cb }, onResponse: cb => { hooks.response = cb }, onError: cb => { hooks.error = cb },
    async $get(url, config) {
      config = { ...config, url, method: 'get' }; hooks.request(config); calls.push(config)
      if (overrides.response) {
        try { return await overrides.response(config) }
        catch (error) { error.config = config; return hooks.error(error) }
      }
      const id = Number(config.headers['X-Company-ID'])
      const assignment = activeUser.assignments?.find(row => String(row.id) === String(config.headers['X-Assignment-ID'] || activeUser.assignment_id))
      const response = { ...activeUser, company: companies.find(c => c.id === id), role: id === 1 && assignment ? assignment.role : { name: id === 2 ? 'laser' : 'admin' }, factory_id: assignment?.factory_id || (id === 2 ? 11 : null), assignment_id: id === 1 ? assignment?.id : null }
      hooks.response({ config }); return response
    },
  }
  let service
  try {
    await plugin({ app: { i18n: { locale: 'ru' }, localePath: value => value, router: { options: { base: '/work/' }, afterEach() {} } }, store, $auth: auth, $axios: axios }, (_, value) => { service = value })
    await callback({ state, hooks, service, storage, watchers, replacements, calls, alerts, listeners, confirm: value => { confirmation = value } })
  } finally { global.window = originalWindow; global.document = originalDocument }
}

test('company selection is scoped to the signed-in account and allowed directory', async () => {
  const { saveCompanySelection, readCompanySelection } = await load('utils/company-workspace.js')
  const storage = memoryStorage()
  saveCompanySelection(storage, 9, 2)
  assert.equal(readCompanySelection(storage, 9, companies), 2)
  assert.equal(readCompanySelection(storage, 10, companies), null)
  assert.equal(readCompanySelection(storage, 9, [companies[0]]), null)
})

test('business requests carry selected company while login clears old selection', async () => {
  await harness(({ hooks, state }) => {
    const request = { url: '/api/workers', method: 'get' }; hooks.request(request)
    assert.equal(request.headers['X-Company-ID'], '1')
    const login = { url: '/api/login', method: 'post', headers: { 'X-Company-ID': '1' } }; hooks.request(login)
    assert.equal(login.headers['X-Company-ID'], undefined)
    assert.equal(state.workspace.company, null)
  })
})

test('switching fetches target permissions and reloads before showing target data', async () => {
  await harness(async ({ service, calls, replacements, state, storage }) => {
    await service.switchCompany(2)
    assert.equal(calls.at(-1).headers['X-Company-ID'], '2')
    assert.deepEqual(replacements, ['/work/factory/laser'])
    assert.equal(state.workspace.company.id, 1)
    assert.equal(state.workspace.switching, true)
    assert.equal((await load('utils/company-workspace.js')).readCompanySelection(storage, 9, companies), 2)
  })
})

test('cancelled drafts and unavailable companies never trigger switching', async () => {
  await harness(async ({ service, confirm, calls, replacements, state }) => {
    service.setDirty(true); confirm(false)
    await service.switchCompany(2)
    await service.switchCompany(99)
    assert.equal(calls.length, 0); assert.equal(replacements.length, 0); assert.equal(state.workspace.switching, false)
  })
})

test('pending writes finish in their original company before switching', async () => {
  await harness(async ({ service, hooks, alerts, calls, replacements }) => {
    const saving = { url: '/api/workers', method: 'post' }; hooks.request(saving)
    await service.switchCompany(2)
    assert.equal(alerts.length, 1); assert.equal(calls.length, 0)
    hooks.response({ config: saving })
    await service.switchCompany(2)
    assert.equal(replacements.length, 1)
  })
})

test('an unrelated successful write does not discard a connected form draft', async () => {
  await harness(async ({ service, hooks, listeners, confirm, calls, replacements }) => {
    const form = { isConnected: true }
    const input = { closest: selector => selector.includes('form') ? form : null }
    listeners.input({ target: input })
    const upload = { url: '/api/pmp-files', method: 'post' }
    hooks.request(upload); hooks.response({ config: upload })
    confirm(false)
    await service.switchCompany(2)
    assert.equal(calls.length, 0)
    form.isConnected = false
    await service.switchCompany(2)
    assert.equal(replacements.length, 1)
  })
})

test('company selection controls do not mark the workspace as an unsaved form', async () => {
  await harness(async ({ service, listeners, confirm, replacements }) => {
    const form = { isConnected: true }
    listeners.change({ target: { closest: () => form } })
    confirm(false)
    await service.switchCompany(2)
    assert.equal(replacements.length, 1)
  })
})

test('reload restores the saved company before page mounting', async () => {
  await harness(({ calls, state }) => {
    assert.equal(calls.length, 1)
    assert.equal(state.workspace.company.id, 2)
  }, async storage => (await load('utils/company-workspace.js')).saveCompanySelection(storage, 9, 2))
})

test('embedded file links capture the selected company and preserve downloading', async () => {
  const plugin = (await load('plugins/url-helper.js')).default
  const helpers = {}, store = { state: { workspace: { company: { id: 2 } } } }
  plugin({ $axios: { defaults: { baseURL: 'https://api.example.invalid' } }, store }, (name, value) => { helpers[name] = value })
  const old = helpers.getPmpFileUrl({ id: 3 }, true)
  assert.equal(old, 'https://api.example.invalid/api/secure-files/pmp/3?company_id=2&download=1')
  store.state.workspace.company.id = 1
  assert.ok(helpers.getOrderFileUrl(4).endsWith('?company_id=1'))
  assert.ok(old.includes('company_id=2'))
})

const assignmentUser = { ...user, role: { name: 'engineer' }, assignment_id: 21, assignments: [{ id: 21, role: { name: 'engineer' }, factory_id: null }, { id: 22, role: { name: 'laser' }, factory_id: 11 }] }

test('assignment selection is scoped to the signed-in user and company', async () => {
  const helpers = await load('utils/company-workspace.js'); const storage = memoryStorage()
  helpers.saveCompanySelection(storage, 9, 1, 22)
  assert.equal(helpers.readAssignmentSelection(storage, 9, 1), 22)
  assert.equal(helpers.readAssignmentSelection(storage, 9, 2), null)
  assert.equal(helpers.readAssignmentSelection(storage, 10, 1), null)
  helpers.clearCompanySelection(storage)
  assert.equal(helpers.readAssignmentSelection(storage, 9, 1), null)
})

test('business requests carry active assignment while public requests remove both context headers', async () => {
  await harness(({ hooks, state }) => {
    const config = { url: '/api/workers', method: 'get' }; hooks.request(config)
    assert.equal(config.headers['X-Assignment-ID'], '21')
    for (const url of ['/api/login', '/api/workspace/brands', '/api/registration/companies']) {
      const config = { url, headers: { 'X-Company-ID': '1', 'X-Assignment-ID': '22' } }; hooks.request(config)
      assert.deepEqual(config.headers, {})
    }
    assert.equal(state.workspace.assignmentId, null)
  }, null, { user: assignmentUser })
})

test('switching assignments reloads the permitted role and workshop without carrying old page data', async () => {
  await harness(async ({ service, calls, replacements, storage, state }) => {
    await service.switchAssignment(99); assert.equal(calls.length, 0)
    await service.switchAssignment(22)
    assert.equal(calls[0].headers['X-Company-ID'], '1'); assert.equal(calls[0].headers['X-Assignment-ID'], '22')
    assert.deepEqual(replacements, ['/work/factory/laser'])
    assert.equal(state.workspace.assignmentId, 21)
    assert.equal((await load('utils/company-workspace.js')).readAssignmentSelection(storage, 9, 1), 22)
  }, null, { user: assignmentUser })
})

test('changing companies never carries the previous company assignment id', async () => {
  await harness(async ({ service, calls }) => {
    await service.switchCompany(2)
    assert.equal(calls[0].headers['X-Assignment-ID'], undefined)
    assert.equal(calls[0].headers['X-Company-ID'], '2')
  }, null, { user: assignmentUser })
})

test('pending writes and cancelled drafts also block assignment switches', async () => {
  await harness(async ({ service, hooks, calls, alerts, confirm }) => {
    const write = { url: '/api/workers', method: 'put' }; hooks.request(write)
    await service.switchAssignment(22); assert.equal(calls.length, 0); assert.equal(alerts.length, 1)
    hooks.response({ config: write }); service.setDirty(true); confirm(false)
    await service.switchAssignment(22); assert.equal(calls.length, 0)
  }, null, { user: assignmentUser })
})

test('reload restores the working assignment before the page mounts', async () => {
  await harness(({ state, calls }) => {
    assert.equal(calls[0].headers['X-Assignment-ID'], '22')
    assert.equal(state.workspace.assignmentId, 22)
    assert.equal(state.auth.user.role.name, 'laser')
  }, async storage => (await load('utils/company-workspace.js')).saveCompanySelection(storage, 9, 1, 22), { user: assignmentUser })
})

test('a revoked saved assignment only refreshes the identity using the primary assignment', async () => {
  await harness(async ({ calls, state, storage }) => {
    assert.equal(calls.length, 2); assert.equal(calls[0].headers['X-Assignment-ID'], '99'); assert.equal(calls[1].headers['X-Assignment-ID'], undefined)
    assert.equal(state.workspace.assignmentId, 21)
    assert.equal((await load('utils/company-workspace.js')).readAssignmentSelection(storage, 9, 1), 21)
  }, async storage => (await load('utils/company-workspace.js')).saveCompanySelection(storage, 9, 1, 99), { user: assignmentUser, response(config) {
    if (config.headers['X-Assignment-ID']) throw new Error('Revoked assignment')
    return assignmentUser
  } })
})

test('rejected reads and writes stay rejected after the Nuxt Axios error hook', async () => {
  await harness(async ({ hooks, state }) => {
    const failure = { config: { url: '/api/orders', method: 'put' }, response: { status: 403, data: { message: 'Permission denied.' } } }
    hooks.request(failure.config)
    await assert.rejects(hooks.error(failure), error => error === failure)
    assert.equal(state.auth.user.id, assignmentUser.id)
    assert.equal(state.workspace.assignmentId, assignmentUser.assignment_id)
  }, null, { user: assignmentUser })
})

test('revoking an active assignment refreshes identity without replaying the failed write', async () => {
  await harness(async ({ hooks, calls, replacements }) => {
    const failure = { config: { url: '/api/orders/5', method: 'put', data: { name: 'Unsaved draft' } }, response: { status: 403, data: { message: 'Position access denied.' } } }
    hooks.request(failure.config)
    await assert.rejects(hooks.error(failure), error => error === failure)
    assert.equal(calls.length, 1)
    assert.equal(calls[0].url, '/api/user')
    assert.equal(calls[0].method, 'get')
    assert.equal(calls[0].headers['X-Assignment-ID'], undefined)
    assert.deepEqual(replacements, ['/work/engineer'])
  }, null, { user: assignmentUser })
})

test('private file URLs capture the chosen working assignment', async () => {
  const plugin = (await load('plugins/url-helper.js')).default; const helpers = {}, store = { state: { workspace: { company: { id: 1 }, assignmentId: 22 } } }
  plugin({ $axios: { defaults: { baseURL: 'https://api.example.invalid' } }, store }, (key, value) => { helpers[key] = value })
  const old = helpers.getOrderFileUrl(7, true)
  assert.equal(old, 'https://api.example.invalid/api/secure-files/order/7?company_id=1&assignment_id=22&download=1')
  store.state.workspace.assignmentId = 21
  assert.ok(helpers.getOrderFileUrl(7).includes('assignment_id=21')); assert.ok(old.includes('assignment_id=22'))
})
