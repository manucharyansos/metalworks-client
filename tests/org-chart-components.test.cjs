const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const Vue = require('vue')
const compiler = require('vue-template-compiler')
const { createRenderer } = require('vue-server-renderer')

function component(name, imports = {}) {
  const source = fs.readFileSync(
    path.join(__dirname, '../components/staff', name + '.vue'),
    'utf8'
  )
  const sfc = compiler.parseComponent(source)
  const script = sfc.script.content
    .replace(/import[\s\S]*?from\s+['"][^'"]+['"]\s*/g, '')
    .replace('export default', 'return')
  const options = new Function(...Object.keys(imports), script)(
    ...Object.values(imports)
  )
  const compiled = compiler.compile(sfc.template.content)
  assert.deepEqual(compiled.errors, [])
  return { ...options, ...compiler.compileToFunctions(sfc.template.content) }
}

async function utilities() {
  const source = fs.readFileSync(
    path.join(__dirname, '../utils/org-chart.js'),
    'utf8'
  )
  return import(
    `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
  )
}

test('engineer leaf positions render as siblings in the same row', async () => {
  const utils = await utilities()
  const branch = component('OrgChartBranch', utils)
  const rows = [
    { id: 1, parent_id: null, name: 'Engineer', members: [] },
    { id: 2, parent_id: 1, name: 'Qeo', members: [] },
    { id: 3, parent_id: 1, name: 'Asd', members: [] },
  ]
  const tree = utils.buildTree(rows)
  const html = await createRenderer().renderToString(
    new Vue({
      render: (h) =>
        h(branch, {
          props: {
            node: tree[0],
            tones: new Map([
              [1, 0],
              [2, 0],
              [3, 0],
            ]),
            t: utils.orgChartCopy.en,
          },
        }),
    })
  )
  assert.match(html, /class="org-children org-children--row"/)
  assert.doesNotMatch(html, /org-children--stack/)
  assert.match(html, /data-org-position="2"/)
  assert.match(html, /data-org-position="3"/)
})

test('a new peer shares the parent but never copies its access role', async () => {
  const utils = await utilities()
  const chart = component('OrgChart', {
    ...utils,
    OrgChartBranch: {},
    membershipCopy: () => ({}),
    apiErrorMessage: () => '',
  })
  const parent = { id: 1, role: { id: 1 } }
  const manager = { id: 2, parent_id: 1, role: { id: 2 } }
  const context = {
    chart: { positions: [parent, manager] },
    $nextTick: () => {},
    ...chart.methods,
  }
  context.openSibling(manager)
  assert.equal(context.draft.parent_id, 1)
  assert.equal(context.draft.role_id, null)
  assert.equal(context.draft.name, '')
  context.openSibling(parent)
  assert.equal(context.draft.parent_id, null)
  assert.equal(context.draft.role_id, null)
  const choices = chart.computed.parentChoices.call({
    chart: { positions: [parent, manager] },
    draft: { id: null },
  })
  assert.deepEqual(
    choices.map((row) => row.id),
    [1, 2]
  )
})
