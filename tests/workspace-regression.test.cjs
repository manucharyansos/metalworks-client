const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')

function sourceModule(file, scriptOnly = false) {
  let source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  if (scriptOnly) source = source.match(/<script>([\s\S]*?)<\/script>/)[1]
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
}

const payload = { data: { email: 'qa@example.invalid', password: 'test-only' } }
const failure = (status, message) => ({ response: { status, data: { message } } })

async function attemptLogin(outcomes) {
  const { actions } = await sourceModule('store/authCustom/index.js')
  const calls = []
  const commits = []
  const result = await actions.loginUser.call({
    $auth: {
      async loginWith(strategy, data) {
        calls.push({ strategy, data })
        const outcome = outcomes.shift()
        if (outcome) throw outcome
      },
    },
  }, { commit: (...args) => commits.push(args) }, payload)
  return { calls, commits, result }
}

test('first login succeeds without sending duplicate credentials', async () => {
  const { calls, result } = await attemptLogin([null])
  assert.equal(result, true)
  assert.equal(calls.length, 1)
})

test('expired CSRF session recovers on one click with the same payload', async () => {
  const { calls, commits, result } = await attemptLogin([failure(419, 'CSRF token mismatch.'), null])
  assert.equal(result, true)
  assert.equal(calls.length, 2)
  assert.ok(calls.every(call => call.strategy === 'runtimeSanctum' && call.data === payload))
  assert.deepEqual(commits, [['setErrorMessage', null]])
})

test('the installed cookie strategy performs a fresh CSRF handshake before the retry', async () => {
  const { CookieScheme } = await import('../node_modules/@nuxtjs/auth-next/dist/runtime.mjs')
  const { actions } = await sourceModule('store/authCustom/index.js')
  const calls = []
  let logins = 0
  const strategy = Object.create(CookieScheme.prototype)
  strategy.options = {
    endpoints: { csrf: { url: '/sanctum/csrf-cookie' }, login: { url: '/api/login' } },
    user: { autoFetch: true },
  }
  strategy.requestHandler = { interceptor: true }
  strategy.updateTokens = () => {}
  strategy.fetchUser = async () => calls.push('/api/user')
  strategy.$auth = {
    reset: () => calls.push('reset'),
    async request(endpoint, defaults) {
      const url = defaults.url || endpoint.url
      calls.push(url)
      if (url === '/api/login' && ++logins === 1) throw failure(419, 'Expired')
      return { data: {} }
    },
  }
  const result = await actions.loginUser.call({
    $auth: { loginWith: () => strategy.login(payload) },
  }, { commit() {} }, payload)
  assert.equal(result, true)
  assert.deepEqual(calls, ['reset', '/sanctum/csrf-cookie', '/api/login', 'reset', '/sanctum/csrf-cookie', '/api/login', '/api/user'])
})

test('persistent CSRF errors stop after one retry and retain the server explanation', async () => {
  const { calls, commits, result } = await attemptLogin([failure(419, 'Expired'), failure(419, 'CSRF token mismatch.')])
  assert.equal(result, false)
  assert.equal(calls.length, 2)
  assert.deepEqual(commits.at(-1), ['setErrorMessage', 'CSRF token mismatch.'])
})

for (const status of [401, 403, 422, 429, 500]) {
  test(`HTTP ${status} does not trigger another login`, async () => {
    const { calls, result } = await attemptLogin([failure(status, 'Rejected')])
    assert.equal(result, false)
    assert.equal(calls.length, 1)
  })
}

test('network failures do not submit credentials again', async () => {
  const { calls, result } = await attemptLogin([new Error('Network Error')])
  assert.equal(result, false)
  assert.equal(calls.length, 1)
})

test('titles match localized routes without matching unrelated prefixes', async () => {
  const { isWorkspaceRouteActive: active } = await sourceModule('utils/workspace-route.js')
  for (const prefix of ['', '/hy', '/ru', '/en']) {
    assert.equal(active(`${prefix}/manager/`, { to: '/manager', exact: true }), true)
    assert.equal(active(`${prefix}/manager/users/12`, { to: '/manager/users' }), true)
    assert.equal(active(`${prefix}/manager/users`, { to: '/manager', exact: true }), false)
    assert.equal(active(`${prefix}/manager/users-extra`, { to: '/manager/users' }), false)
    assert.equal(active(`${prefix}/engineer/files`, { to: '/engineer/files' }), true)
  }
})

test('an old account response cannot overwrite the new account identity', async () => {
  const { default: identity } = await sourceModule('components/layout/WorkspaceIdentity.vue', true)
  const pending = []
  const context = {
    ...identity.data(),
    authUser: { id: 1 },
    $auth: { loggedIn: true },
    $axios: { $get: () => new Promise(resolve => pending.push(resolve)) },
  }
  const originalClient = process.client
  process.client = true
  try {
    const oldRequest = identity.methods.loadIdentity.call(context)
    context.authUser = { id: 2 }
    const newRequest = identity.methods.loadIdentity.call(context)
    pending[1]({ id: 2, display_name: 'Current user' })
    await newRequest
    pending[0]({ id: 1, display_name: 'Previous user' })
    await oldRequest
    assert.equal(context.identity.id, 2)
  } finally {
    process.client = originalClient
  }
})

test('refreshing the same account clears and reloads its sidebar identity', async () => {
  const { default: identity } = await sourceModule('components/layout/WorkspaceIdentity.vue', true)
  let reloads = 0
  const context = { identity: { display_name: 'Old name' }, loadIdentity() { reloads++ } }
  identity.watch['$auth.user'].handler.call(context)
  assert.equal(context.identity, null)
  assert.equal(reloads, 1)
})
