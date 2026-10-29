const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const policyUrl = moduleUrl(read('utils/factory-file-policy.js'))

async function page() {
  let source = read('pages/engineer/files/view.vue').match(/<script>([\s\S]*?)<\/script>/)[1]
  source = source.replace(/import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g, (_, names, specifier) => {
    if (specifier === '~/utils/factory-file-policy') return `import ${names} from '${policyUrl}'`
    if (specifier === 'vuex') return 'const mapActions = () => ({}); const mapGetters = () => ({})'
    return `const ${names} = {}`
  })
  return (await import(moduleUrl(source))).default
}

const pmp = () => ({
  id: 10,
  group: '990',
  group_name: 'QA',
  remote_number: [{ id: 101, remote_number: '01', remote_number_name: 'Part' }],
  files: [
    { id: 1, remote_number_id: 101, factory_id: 1, original_name: 'Bracket.SLDPRT', path: 'a' },
    { id: 2, remote_number_id: 101, factory_id: 3, original_name: 'bracket.step', path: 'b' },
    { id: 3, remote_number_id: 101, factory_id: 1, original_name: 'frame.sldasm', path: 'c' },
    { id: 4, remote_number_id: 102, factory_id: 3, original_name: 'frame.igs', path: 'd' },
    { id: 5, remote_number_id: 101, factory_id: 2, original_name: 'notes.txt', path: 'e' },
  ],
})

async function explorer() {
  const options = await page()
  const vm = { ...options.data(), getPmp: pmp(), projectReady: true, viewed: [] }
  vm.getFactory = [
    { id: 1, value: 'SW', name: 'SW' },
    { id: 2, value: 'INFO', name: 'INFO' },
    { id: 3, value: 'IQS', name: 'IGS' },
  ]
  for (const [name, method] of Object.entries(options.methods)) vm[name] = method.bind(vm)
  for (const [name, getter] of Object.entries(options.computed)) Object.defineProperty(vm, name, { get: getter.bind(vm) })
  vm.viewFile = (filePath, file) => { vm.viewed.push(file.id); vm.selectedFile = file }
  vm.clearPreview = () => {}
  vm.resetFileFields = () => {}
  vm.showFiles(vm.getPmp.remote_number[0])
  return vm
}

test('INFO is pinned on its own and the other sections keep their order', async () => {
  const vm = await explorer()
  assert.equal(vm.infoSection.value, 'INFO')
  assert.deepEqual(vm.productionSections.map((section) => section.value), ['SW', 'IQS'])
  assert.equal(vm.sectionFileCount(1), 2)
  assert.equal(vm.sectionFileCount(3), 1)
})

test('opening a folder keeps it open, Up leaves it and search filters only names', async () => {
  const vm = await explorer()
  vm.openSection(vm.getFactory[0])
  assert.equal(vm.sectionOpen, true)
  vm.openSection(vm.getFactory[0])
  assert.equal(vm.sectionOpen, true)
  assert.deepEqual(vm.visibleFiles.map((file) => file.id), [1, 3])
  vm.fileQuery = 'FRAME'
  assert.deepEqual(vm.visibleFiles.map((file) => file.id), [3])
  vm.goUp()
  assert.equal(vm.sectionOpen, false)
  assert.equal(vm.fileQuery, '')
  vm.openSection(vm.getFactory[0])
  assert.equal(vm.sectionOpen, true)
})

test('a SolidWorks part opens its same-name 3D export from the same subgroup', async () => {
  const vm = await explorer()
  vm.openSection(vm.getFactory[0])
  const [part, , assembly] = vm.getPmp.files
  assert.equal(vm.hasCompanionModel(part), true)
  assert.equal(vm.hasCompanionModel(assembly), false)
  vm.selectedFile = assembly
  assert.equal(vm.companionModel, null)
  vm.selectedFile = part
  assert.equal(vm.companionModel.id, 2)
  vm.openCompanionModel()
  assert.deepEqual(vm.viewed, [2])
  assert.equal(vm.selectedFactoryId, 3)
  assert.equal(vm.sectionOpen, true)
})
