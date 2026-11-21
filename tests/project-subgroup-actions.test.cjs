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

const { projectCopy } = load('utils/project-copy.js')

function actions({
  locale = 'hy',
  granted = ['pmp.update', 'pmp_files.delete'],
} = {}) {
  const definition = load(
    'components/engineer/ProjectSubgroupActions.vue'
  ).default
  const vm = new Vue({
    ...definition,
    propsData: {
      pmp: { id: 3, group: '7', group_name: 'Gates' },
      remote: { id: 9, remote_number: '1', remote_number_name: 'Left' },
    },
  })
  vm.$can = (permission) => granted.includes(permission)
  vm.$i18n = { locale }
  vm.notices = []
  vm.$notify = (notice) => vm.notices.push(notice)
  vm.events = []
  vm.$on('renamed', (pmp) => vm.events.push(['renamed', pmp]))
  vm.$on('deleted', (result) => vm.events.push(['deleted', result]))
  return vm
}

test('renaming sends both trimmed names and keeps the codes', async () => {
  const vm = actions()
  assert.equal(vm.groupCode, '007')
  assert.equal(vm.subgroupCode, '01')
  vm.openRename()
  assert.deepEqual(vm.form, { group_name: 'Gates', remote_number_name: 'Left' })
  assert.equal(vm.canSave, false, 'nothing changed yet')
  vm.form.remote_number_name = '  Left wing  '
  assert.equal(vm.canSave, true)
  let sent = null
  vm.$axios = {
    $put: (url, body) => {
      sent = { url, body }
      return Promise.resolve({ pmp: { id: 3, group_name: 'Gates' } })
    },
  }
  await vm.saveNames()
  assert.deepEqual(sent, {
    url: '/api/engineers/pmps/remote-number/9',
    body: { group_name: 'Gates', remote_number_name: 'Left wing' },
  })
  assert.deepEqual(vm.events, [['renamed', { id: 3, group_name: 'Gates' }]])
  assert.equal(vm.renaming, false)
  assert.equal(vm.notices[0].group, 'project-actions')
  vm.openRename()
  vm.form.group_name = '   '
  assert.equal(vm.canSave, false, 'an empty name is never sent')
})

test('a taken name shows at its field, in the reader’s language', async () => {
  const taken = {
    response: {
      status: 422,
      data: {
        errors: { group_name: ['«Fences» անունով խումբ արդեն կա (988)։'] },
      },
    },
  }
  for (const [locale, expected] of [
    ['hy', '«Fences» անունով խումբ արդեն կա (988)։'],
    ['en', projectCopy('en').groupTaken],
  ]) {
    const vm = actions({ locale })
    vm.openRename()
    vm.form.group_name = 'Fences'
    vm.$axios = { $put: () => Promise.reject(taken) }
    await vm.saveNames()
    assert.equal(vm.fieldErrors.group_name, expected)
    assert.equal(vm.renaming, true, 'the dialog stays open to fix the name')
    assert.equal(vm.events.length, 0)
  }
})

test('a subgroup that tasks use is shown with them and cannot be deleted', async () => {
  const vm = actions()
  const calls = []
  vm.$axios = {
    $get: (url) => {
      calls.push(url)
      return Promise.resolve({
        files: 2,
        tasks: [
          { id: 1, number: '2026-11-0001', name: 'Gate', status: 'pending' },
        ],
        tasks_total: 3,
        removes_group: false,
        can_delete: false,
      })
    },
    $delete: () => assert.fail('a used subgroup is never sent for deletion'),
  }
  await vm.openDelete()
  assert.deepEqual(calls, ['/api/engineers/pmps/remote-number/9/deletion'])
  assert.equal(vm.hiddenTasks, 2)
  await vm.confirmDelete()
  assert.equal(vm.events.length, 0)
})

test('deleting an unused subgroup reports whether its group went too', async () => {
  const vm = actions()
  vm.$axios = {
    $get: () =>
      Promise.resolve({
        files: 1,
        tasks: [],
        tasks_total: 0,
        removes_group: true,
        can_delete: true,
      }),
    $delete: (url) => {
      assert.equal(url, '/api/engineers/pmps/remote-number/9')
      return Promise.resolve({ group_deleted: true })
    },
  }
  await vm.openDelete()
  await vm.confirmDelete()
  assert.deepEqual(vm.events, [['deleted', { groupDeleted: true }]])
  assert.equal(vm.removing, false)
})

test('renaming needs the project right and deleting also the file right', () => {
  assert.equal(actions({ granted: [] }).canRename, false)
  const renamer = actions({ granted: ['pmp.update'] })
  assert.equal(renamer.canRename, true)
  assert.equal(renamer.canDelete, false)
  assert.equal(actions().canDelete, true)
})

test('Russian counts take the right word form', () => {
  const ru = projectCopy('ru')
  assert.match(ru.files(1), /1 файл в/)
  assert.match(ru.files(3), /3 файла/)
  assert.match(ru.files(11), /11 файлов/)
  assert.match(ru.files(21), /21 файл в/)
  assert.match(ru.blocked(2), /2 заданиях/)
  assert.match(ru.blocked(1), /1 задании/)
})
