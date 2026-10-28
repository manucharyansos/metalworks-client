const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const { transformSync } = require('@babel/core')

const source = fs.readFileSync(path.join(__dirname, '..', 'plugins/base-url.js'), 'utf8')
const code = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: [require('@babel/plugin-transform-modules-commonjs')],
}).code
const plugin = { exports: {} }
new Function('require', 'module', 'exports', code)(require, plugin, plugin.exports)
const { localApiFor, default: install } = plugin.exports

function resolveIn(hostname, configured) {
  const previousClient = process.client
  const previousWindow = global.window
  process.client = true
  global.window = { location: { hostname } }
  let baseURL = null
  let injected = null
  try {
    install(
      { $config: { baseURL: configured }, $axios: { setBaseURL: (url) => (baseURL = url) } },
      (name, value) => (injected = value)
    )
  } finally {
    process.client = previousClient
    if (previousWindow === undefined) delete global.window
    else global.window = previousWindow
  }
  assert.equal(injected, baseURL)
  return baseURL
}

test('a local API keeps its configured port and path and follows the browser host', () => {
  assert.equal(localApiFor('localhost', 'http://localhost:8000'), 'http://localhost:8000')
  assert.equal(localApiFor('127.0.0.1', 'http://127.0.0.1:8010'), 'http://127.0.0.1:8010')
  assert.equal(localApiFor('192.168.1.5', 'http://localhost:8010'), 'http://192.168.1.5:8010')
  assert.equal(
    localApiFor('localhost', 'http://localhost/metalworks-server/public/'),
    'http://localhost/metalworks-server/public'
  )
  assert.equal(localApiFor('::1', 'http://[::1]:8010'), 'http://[::1]:8010')
})

test('without a local configuration the historical :8000 development API is used', () => {
  assert.equal(localApiFor('localhost', ''), 'http://localhost:8000')
  assert.equal(localApiFor('localhost', 'https://api.metalworks.am'), 'http://localhost:8000')
  assert.equal(localApiFor('10.0.0.7', 'not a url'), 'http://10.0.0.7:8000')
})

test('the deployed site always uses the production API', () => {
  assert.equal(resolveIn('metalworks.am', 'https://api.metalworks.am'), 'https://api.metalworks.am')
  assert.equal(resolveIn('metalworks.am', 'http://localhost:8010'), 'https://api.metalworks.am')
  assert.equal(resolveIn('127.0.0.1', 'http://127.0.0.1:8010'), 'http://127.0.0.1:8010')
})
