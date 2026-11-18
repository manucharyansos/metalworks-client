const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const { transformSync } = require('@babel/core')

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
  // Runs the project's own transpiled source, as the other tests do.
  // eslint-disable-next-line no-new-func
  new Function('require', 'module', 'exports', code)(
    dependency,
    module,
    module.exports
  )
  loaded.set(name, module.exports)
  return module.exports
}

test('a powder-coating job sends its colour and primer request, other jobs do not', () => {
  const { workshopSettingsPayload, paintSettings } = load(
    'utils/task-workflow.js'
  )
  const rows = workshopSettingsPayload(
    [{ id: 3 }, { id: 7 }],
    {
      3: { priority: 'high', paint_ral: '  RAL 9005 ', primer_required: true },
      7: { priority: 'normal' },
    }
  )
  assert.equal(rows[0].paint_ral, 'RAL 9005')
  assert.equal(rows[0].primer_required, true)
  assert.equal(rows[0].priority, 'high')
  assert.equal('paint_ral' in rows[1], false, 'nothing filled in, nothing sent')
  assert.deepEqual(paintSettings({ primer_required: true }), {
    paint_ral: null,
    primer_required: true,
  })
  assert.deepEqual(paintSettings({ paint_ral: '   ' }), {})
})

test('the paint copy falls back to Armenian and covers every language', () => {
  const { paintCopy } = load('utils/task-paint.js')
  const hy = paintCopy('hy')
  assert.equal(paintCopy('de'), hy)
  for (const locale of ['ru', 'en'])
    assert.deepEqual(Object.keys(paintCopy(locale)), Object.keys(hy))
})

test('view-only models sit with the CAD views and models in the file badges', () => {
  const { fileKind } = load('utils/file-kind.js')
  assert.equal(fileKind('part.SLDPRT'), 'cad')
  assert.equal(fileKind('frame.step'), 'model')
  assert.equal(fileKind('sheet.dwg'), 'cad')
  assert.equal(fileKind('bend.dld'), 'program')
})
