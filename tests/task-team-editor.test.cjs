const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const { transformSync } = require('@babel/core')
const Vue = require('vue')

const root = path.join(__dirname, '..')
const loaded = new Map()
function load(name) {
  if (loaded.has(name)) return loaded.get(name)
  let source = fs.readFileSync(path.join(root, name), 'utf8')
  if (name.endsWith('.vue'))
    source = source.match(/<script>([\s\S]*?)<\/script>/)[1]
  const code = transformSync(source, {
    configFile: false,
    babelrc: false,
    plugins: [require('@babel/plugin-transform-modules-commonjs')],
  }).code
  const module = { exports: {} }
  const dependency = (request) => {
    if (request.endsWith('.vue')) return {}
    if (request.startsWith('@/')) return load(request.slice(2) + '.js')
    return require(request)
  }
  // Runs the project's own transpiled source, as the other component tests do.
  // eslint-disable-next-line no-new-func
  new Function('require', 'module', 'exports', code)(
    dependency,
    module,
    module.exports
  )
  loaded.set(name, module.exports)
  return module.exports
}

function editor(step, workers) {
  const definition = load('components/order/TaskTeamEditor.vue').default
  const vm = new Vue({ ...definition, propsData: { step, workers } })
  return vm
}

const workers = [
  { id: 4, name: 'Hamlet' },
  { id: 7, name: 'Kamo' },
]

test('a helper who is no longer production staff is named and dropped on save', async () => {
  const step = {
    id: 12,
    order_id: 5,
    operator_id: 4,
    team_version: 'v1',
    operator: { id: 4, name: 'Hamlet' },
    helpers: [
      { id: 7, name: 'Kamo' },
      { id: 9, name: 'Avet' },
    ],
  }
  const vm = editor(step, workers)
  assert.deepEqual(
    vm.staleHelpers.map((h) => h.name),
    ['Avet']
  )
  assert.deepEqual(vm.keptHelpers, [7])
  assert.equal(vm.changed, true, 'saving is offered so the helper can leave')
  let sent = null
  vm.$axios = {
    $put: (url, body) => {
      sent = { url, body }
      return Promise.resolve({ order: {} })
    },
  }
  await vm.save()
  assert.equal(sent.url, '/api/tasks/5/workshops/12/team')
  assert.deepEqual(sent.body, {
    operator_id: 4,
    helper_ids: [7],
    team_version: 'v1',
  })
})

test('an operator who left production is named, and nothing is dropped before the list loads', () => {
  const step = {
    id: 12,
    order_id: 5,
    operator_id: 9,
    team_version: 'v1',
    operator: { id: 9, name: 'Avet' },
    helpers: [{ id: 7, name: 'Kamo' }],
  }
  assert.equal(editor(step, workers).staleOperator.name, 'Avet')
  const loading = editor(step, [])
  assert.equal(loading.staleOperator, null)
  assert.deepEqual(loading.staleHelpers, [])
  assert.deepEqual(loading.keptHelpers, [7])
  assert.equal(loading.changed, false)
})
