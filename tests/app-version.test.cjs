const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const helpersUrl = moduleUrl(read('utils/app-version.js'))
const helpers = import(helpersUrl)
const plugin = import(moduleUrl(read('plugins/app-version.client.js').replace("'~/utils/app-version'", `'${helpersUrl}'`)))

const memoryStorage = () => {
  const rows = new Map()
  return { getItem: (key) => (rows.has(key) ? rows.get(key) : null), setItem: (key, value) => rows.set(key, String(value)) }
}

test('a tab reloads only for a newer build it has not reloaded for yet', async () => {
  const { needsReload, versionUrl } = await helpers
  assert.equal(needsReload('20261101', '20261102', ''), true)
  assert.equal(needsReload('20261101', '20261101', ''), false)
  assert.equal(needsReload('20261101', '20261102', '20261102'), false, 'no reload loop on a cached old page')
  assert.equal(needsReload('20261101', null, ''), false)
  assert.equal(needsReload('', '20261102', ''), false)
  assert.equal(versionUrl('/work/'), '/work/version.json')
  assert.equal(versionUrl('/work'), '/work/version.json')
  assert.equal(versionUrl(), '/version.json')
})

test('the deployed build id is read without caches and failures read as unknown', async () => {
  const { fetchLatestBuild, markReloaded, readReloaded } = await helpers
  const calls = []
  const answer = (body, ok = true) => async (url, options) => {
    calls.push([url, options])
    return { ok, json: async () => (typeof body === 'function' ? body() : body) }
  }
  assert.equal(await fetchLatestBuild(answer({ buildId: '20261102' }), '/work/version.json', 7), '20261102')
  assert.deepEqual(calls[0], ['/work/version.json?t=7', { cache: 'no-store', credentials: 'omit' }])
  assert.equal(await fetchLatestBuild(answer({ buildId: '20261102' }, false), '/v.json'), null)
  assert.equal(await fetchLatestBuild(answer(() => { throw new SyntaxError('html') }), '/v.json'), null)
  assert.equal(await fetchLatestBuild(answer({ buildId: 5 }), '/v.json'), null)
  assert.equal(await fetchLatestBuild(async () => { throw new Error('offline') }, '/v.json'), null)
  const storage = memoryStorage()
  markReloaded(storage, '20261102')
  assert.equal(readReloaded(storage), '20261102')
  const broken = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') } }
  assert.equal(readReloaded(broken), '')
  assert.doesNotThrow(() => markReloaded(broken, 'x'))
})

test('a generated site gets version.json with its build id', () => {
  const writeVersionFile = require('../build/write-version-file.cjs')
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), 'mw-version-'))
  const file = writeVersionFile(dist, '20261101120000')
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { buildId: '20261101120000' })
  assert.equal(writeVersionFile('', 'x'), null)
  fs.rmSync(dist, { recursive: true, force: true })
  const config = read('nuxt.config.js')
  assert.match(config, /'generate:done': \(generator\) => writeVersionFile\(generator\.distPath, buildId\)/)
  assert.match(config, /publicRuntimeConfig: \{\s*baseURL: apiBaseURL,\s*buildId,/)
  assert.match(config, /plugins\/app-version\.client\.js', mode: 'client'/)
})

test('an open tab on an old build shows Refresh and moves to the new build on its next page change', async () => {
  const { default: install } = await plugin
  const appended = []
  const listeners = {}
  const afterEach = []
  let reloads = 0
  let deployed = '20261101'
  global.document = {
    hidden: false,
    body: { appendChild: (node) => appended.push(node) },
    addEventListener: (name, handler) => { listeners[name] = handler },
    createElement: (tag) => ({ tag, style: {}, children: [], setAttribute() {}, append(...nodes) { this.children.push(...nodes) }, addEventListener(name, handler) { this[`on${name}`] = handler } }),
  }
  global.window = {
    sessionStorage: memoryStorage(),
    fetch: async () => ({ ok: true, json: async () => ({ buildId: deployed }) }),
    setInterval: () => 0,
    location: { reload: () => { reloads++ } },
  }
  const app = {
    router: { options: { base: '/work/' }, afterEach: (handler) => afterEach.push(handler) },
    i18n: { te: () => true, t: (key) => key },
  }
  try {
    install({ app, $config: { buildId: '20261101' } })
    await new Promise((resolve) => setImmediate(resolve))
    assert.equal(appended.length, 0, 'same build: nothing to show')
    afterEach.forEach((handler) => handler())
    assert.equal(reloads, 0)

    deployed = '20261102'
    listeners.visibilitychange()
    await new Promise((resolve) => setImmediate(resolve))
    assert.equal(appended.length, 1)
    assert.deepEqual(appended[0].children.map((node) => node.textContent), ['app_update.available', 'app_update.reload'])
    listeners.visibilitychange()
    await new Promise((resolve) => setImmediate(resolve))
    assert.equal(appended.length, 1, 'the notice is shown once')

    afterEach.forEach((handler) => handler())
    assert.equal(reloads, 1, 'the next page change loads the new build')
    afterEach.forEach((handler) => handler())
    assert.equal(reloads, 1, 'never twice for the same build')
  } finally {
    delete global.document
    delete global.window
  }
})

test('the notice texts exist in every language', () => {
  for (const locale of ['hy', 'ru', 'en']) {
    const texts = JSON.parse(read(`locales/${locale}.json`)).app_update
    assert.ok(texts?.available?.length > 5, `${locale}.available`)
    assert.ok(texts?.reload?.length > 3, `${locale}.reload`)
  }
})
