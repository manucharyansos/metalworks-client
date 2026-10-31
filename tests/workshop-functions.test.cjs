const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const Vue = require('vue')
const compiler = require('vue-template-compiler')
const renderer = require('vue-server-renderer').createRenderer()

Vue.config.productionTip = false
Vue.config.devtools = false
Vue.config.silent = true

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const workflowUrl = moduleUrl(read('utils/task-workflow.js'))
const catalogUrl = moduleUrl(read('utils/workshop-catalog.js').replace("'@/utils/task-workflow'", JSON.stringify(workflowUrl)))

// A single-file component with its template compiled and its helpers loaded.
async function component(file) {
  const parsed = compiler.parseComponent(read(file))
  const source = parsed.script.content.replace(/import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g, (_, names, specifier) => {
    if (specifier === '@/utils/workshop-catalog') return `import ${names} from '${catalogUrl}'`
    if (specifier === '@/utils/task-workflow') return `import ${names} from '${workflowUrl}'`
    return `const ${names} = {}`
  })
  const options = (await import(moduleUrl(source))).default
  return { ...options, ...compiler.compileToFunctions(parsed.template.content) }
}
const translate = (key, values) => (values ? `${key} ${Object.values(values).join(' ')}` : key)

const factories = () => [
  { id: 2, value: 'DLD', name: 'Bend', is_workshop: true, functions: [{ id: 21, name: 'Flange', is_active: true }] },
  { id: 1, value: 'DXF', name: 'Laser', is_workshop: true, functions: [
    { id: 11, name: 'Engraving', is_active: true },
    { id: 12, name: 'Old', is_active: false },
  ] },
]

test('the production path offers ticked workshops their active functions and drops them with the workshop', async () => {
  const options = await component('components/engineer/FileProductionPlan.vue')
  const vm = new Vue({
    ...options,
    propsData: { factories: factories(), value: { production_factory_ids: [1], production_function_ids: null, inspection_required: false } },
    methods: { ...options.methods, $t: translate },
  })
  const emitted = []
  vm.$on('input', (value) => emitted.push(value))
  vm.open = true
  const html = await renderer.renderToString(vm)
  assert.match(html, /data-file-plan-function="11"/)
  assert.doesNotMatch(html, /data-file-plan-function="12"/, 'archived functions are not offered')
  assert.doesNotMatch(html, /data-file-plan-function="21"/, 'workshops that are not ticked show no functions')
  vm.toggleFunction(11, true)
  assert.deepEqual(emitted.at(-1), { production_factory_ids: [1], production_function_ids: [11], inspection_required: false })
  vm.value = emitted.at(-1)
  vm.select(2, true)
  assert.deepEqual(emitted.at(-1), { production_factory_ids: [1, 2], production_function_ids: [11], inspection_required: false })
  vm.value = { ...emitted.at(-1), production_function_ids: [11, 21, 12] }
  vm.select(1, false)
  assert.deepEqual(emitted.at(-1), { production_factory_ids: [2], production_function_ids: [21], inspection_required: false })
  vm.value = { production_factory_ids: [1, 2], production_function_ids: [11, 21], inspection_required: false }
  assert.equal(vm.summary, 'Laser → Bend · file_plan.functions_count 2')
  vm.$destroy()
})

test('task files show the functions their workshop was given, also from stored text', async () => {
  const options = await component('components/File/FileProductionAttributes.vue')
  const render = (file) => renderer.renderToString(new Vue({ ...options, propsData: { file }, methods: { ...options.methods, $t: translate } }))
  let html = await render({ pivot: { production_functions: [{ id: 1, name: 'Engraving' }, { id: 2, name: 'Deburring' }, { id: 3, name: 'Engraving' }] } })
  assert.equal((html.match(/✓ Engraving/g) || []).length, 1)
  assert.match(html, /✓ Deburring/)
  html = await render({ pivot: { production_functions: JSON.stringify([{ id: 4, name: 'Threading' }]) } })
  assert.match(html, /✓ Threading/)
  for (const pivot of [{ production_functions: 'broken' }, { production_functions: null }, {}]) {
    assert.doesNotMatch(await render({ pivot }), /data-file-functions/)
  }
})

test('managers add, rename and archive workshop functions through the workshop API', async () => {
  const options = await component('components/settings/WorkshopCatalogManager.vue')
  const calls = []
  const workshops = [{ id: 5, name: 'Laser', is_active: true, functions: [{ id: 9, name: 'Engraving', is_active: true }] }]
  const vm = new Vue({ ...options, mounted() {}, methods: { ...options.methods, $notify() {} } })
  vm.$i18n = { locale: 'en' }
  vm.$axios = {
    get: async (url) => { calls.push(['get', url]); return { data: { workshops } } },
    post: async (url, body) => { calls.push(['post', url, body]) },
    put: async (url, body) => { calls.push(['put', url, body]) },
  }
  await vm.load()
  assert.deepEqual(vm.functionDrafts, { 5: { id: null, name: '' } })
  vm.functionDrafts[5].name = 'Deburring'
  await vm.saveFunction(workshops[0])
  assert.deepEqual(calls.find((call) => call[0] === 'post'), ['post', '/api/workshops/5/functions', { name: 'Deburring' }])
  assert.deepEqual(vm.functionDrafts[5], { id: null, name: '' })
  vm.editFunction(workshops[0], workshops[0].functions[0])
  assert.deepEqual(vm.functionDrafts[5], { id: 9, name: 'Engraving' })
  vm.functionDrafts[5].name = 'Laser marking'
  await vm.saveFunction(workshops[0])
  assert.deepEqual(calls.filter((call) => call[0] === 'put').at(-1), ['put', '/api/workshops/5/functions/9', { name: 'Laser marking' }])
  await vm.toggleFunction(workshops[0], workshops[0].functions[0])
  assert.deepEqual(calls.filter((call) => call[0] === 'put').at(-1), ['put', '/api/workshops/5/functions/9', { name: 'Engraving', is_active: false }])
  assert.equal(vm.saving, false)
  vm.$axios.post = async () => { throw Object.assign(new Error('taken'), { response: { data: { message: 'Name taken' } } }) }
  vm.functionDrafts[5].name = 'Engraving'
  await vm.saveFunction(workshops[0])
  assert.equal(vm.functionError.id, 5)
  assert.equal(vm.functionDrafts[5].name, 'Engraving', 'a failed save keeps what was typed')
  vm.$destroy()
})

test('function texts exist in every language', () => {
  for (const locale of ['hy', 'ru', 'en']) {
    const plan = JSON.parse(read(`locales/${locale}.json`)).file_plan
    for (const key of ['functions', 'functions_count', 'functions_help']) assert.ok(plan[key]?.length > 3, `${locale}.${key}`)
    assert.match(plan.functions_count, /\{count\}/)
  }
})
