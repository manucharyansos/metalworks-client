const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const compiler = require('vue-template-compiler')

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const moduleUrl = (source) =>
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const selectionUrl = moduleUrl(read('utils/permission-selection.js'))
const loadSelection = () => import(selectionUrl)

// Representative server catalog: projects -> files -> uploads, plus creation
// lookups and an unrelated task list that must survive a partial revocation.
const slugs = [
  'orders.view',
  'orders.create',
  'clients.view',
  'factory.view',
  'pmp.view',
  'pmp.create',
  'pmp_files.view',
  'pmp_files.upload',
  'pmp_group.check_remote_number',
]
const permissions = slugs.map((slug, index) => ({ id: index + 1, slug }))
const id = (slug) =>
  permissions.find((permission) => permission.slug === slug).id
const dependencies = {
  'orders.create': [
    'clients.view',
    'factory.view',
    'pmp.view',
    'pmp_files.view',
    'pmp_group.check_remote_number',
  ],
  'pmp.create': ['pmp.view'],
  'pmp_files.view': ['pmp.view'],
  'pmp_files.upload': ['pmp.view', 'pmp_files.view'],
}

test('a sole lookup can be disabled even when other sections have dependencies', async () => {
  const { togglePermissionSelection } = await loadSelection()
  assert.deepEqual(
    togglePermissionSelection(
      permissions,
      [id('clients.view')],
      dependencies,
      id('clients.view')
    ),
    []
  )
})

test('disabling customer access also disables task creation and retains unrelated grants', async () => {
  const { togglePermissionSelection } = await loadSelection()
  const selected = permissions.map((permission) => permission.id)
  const next = togglePermissionSelection(
    permissions,
    selected,
    dependencies,
    id('clients.view')
  )
  assert.deepEqual(
    next,
    selected.filter(
      (value) => ![id('clients.view'), id('orders.create')].includes(value)
    )
  )
  assert.equal(
    selected.length,
    permissions.length,
    'the previous selection is not mutated'
  )
})

test('revoking project access removes dependent files and uploads across multiple sections', async () => {
  const { togglePermissionSelection } = await loadSelection()
  const next = togglePermissionSelection(
    permissions,
    permissions.map((permission) => permission.id),
    dependencies,
    id('pmp.view')
  )
  assert.deepEqual(
    next,
    [
      'orders.view',
      'clients.view',
      'factory.view',
      'pmp_group.check_remote_number',
    ].map(id)
  )
  for (const permission of permissions.filter((item) =>
    next.includes(item.id)
  )) {
    for (const dependency of dependencies[permission.slug] || [])
      assert.ok(
        next.includes(id(dependency)),
        'saving cannot restore a revoked dependency'
      )
  }
})

test('enabling follows transitive dependencies and stays inside the assignable catalog', async () => {
  const { togglePermissionSelection } = await loadSelection()
  const graph = {
    'pmp_files.upload': ['pmp_files.view', 'foreign.permission'],
    'pmp_files.view': ['pmp.view'],
  }
  const next = togglePermissionSelection(
    permissions,
    [],
    graph,
    String(id('pmp_files.upload'))
  )
  assert.deepEqual(
    new Set(next),
    new Set(['pmp_files.upload', 'pmp_files.view', 'pmp.view'].map(id))
  )
})

test('cyclic dependency metadata terminates and every selected function can be switched off', async () => {
  const { togglePermissionSelection } = await loadSelection()
  const graph = {
    'pmp.view': ['pmp_files.view'],
    'pmp_files.view': ['pmp.view'],
  }
  const selected = togglePermissionSelection(
    permissions,
    [],
    graph,
    id('pmp.view')
  )
  assert.equal(selected.length, 2)
  assert.deepEqual(
    togglePermissionSelection(
      permissions,
      selected,
      graph,
      id('pmp_files.view')
    ),
    []
  )
  assert.deepEqual(
    togglePermissionSelection(
      permissions,
      [id('orders.view')],
      dependencies,
      99999
    ),
    [id('orders.view')]
  )
})

async function pageMethods() {
  const script = compiler.parseComponent(read('pages/admin/users/index.vue'))
    .script.content
  const source = script.replace(
    /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g,
    (_, names, specifier) => {
      if (specifier === '~/utils/permission-selection')
        return `import ${names} from '${selectionUrl}'`
      if (specifier === 'vuex')
        return 'const mapActions = () => ({}); const mapGetters = () => ({})'
      return `const ${names} = {}`
    }
  )
  return (await import(moduleUrl(source))).default.methods
}

test('the editor saves the revoked selection and keeps drafts after an API failure', async () => {
  const methods = await pageMethods()
  const notifications = [],
    requests = []
  let fail = true,
    reloaded = false
  const vm = {
    selectedUser: { id: 24 },
    permissionsRaw: permissions,
    permissionScope: { dependencies },
    userPermissionIds: permissions.map((permission) => permission.id),
    permissionSaving: false,
    $t: (key, values) => `${key}: ${values.count}`,
    $notify: (notice) => notifications.push(notice),
    $axios: {
      async $put(url, data) {
        requests.push({ url, data })
        if (fail) throw { response: { data: { message: 'Temporary failure' } } }
      },
    },
    async loadSelectedPermissions() {
      reloaded = true
    },
  }
  methods.togglePermission.call(vm, id('clients.view'))
  assert.ok(!vm.userPermissionIds.includes(id('clients.view')))
  assert.ok(!vm.userPermissionIds.includes(id('orders.create')))
  assert.equal(notifications[0].type, 'info')
  const draft = [...vm.userPermissionIds]
  await methods.savePermissions.call(vm)
  assert.deepEqual(requests[0], {
    url: '/api/users/24/permissions',
    data: { permissions: draft },
  })
  assert.deepEqual(vm.userPermissionIds, draft)
  assert.equal(reloaded, false)
  assert.equal(vm.permissionSaving, false)
  assert.equal(notifications.at(-1).text, 'Temporary failure')
  assert.deepEqual(vm.permissionFeedback, {
    type: 'error',
    text: 'Temporary failure',
  })
  fail = false
  await methods.savePermissions.call(vm)
  assert.equal(reloaded, true)
  vm.permissionSaving = true
  methods.togglePermission.call(vm, id('orders.view'))
  assert.deepEqual(
    vm.userPermissionIds,
    draft,
    'an in-flight save cannot change underneath the response'
  )
})
