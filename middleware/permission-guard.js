const routePermission = (path) => {
  const rules = [
    ['/manager/create/users', 'clients.create'],
    ['/manager/create/workers', 'workers.create'],
    ['/manager/create/materials', 'materials.create'],
    ['/manager/update/users', 'clients.update'],
    ['/manager/update/workers', 'workers.update'],
    ['/manager/update/materials', 'materials.update'],
    ['/manager/update/order', 'orders.update'],
    ['/manager/clients', 'clients.view'],
    ['/manager/workers', 'workers.view'],
    ['/manager/materials', 'materials.view'],
    ['/engineer/orders/create', 'orders.create'],
    ['/engineer/files', 'pmp_files.view'],
    ['/factory/', 'factory.view'],
  ]

  const match = rules.find(([prefix]) => path.startsWith(prefix))
  if (match) return [match[1]]

  if (path === '/manager' || path.startsWith('/manager?')) return ['orders.view']
  if (path === '/engineer' || path.startsWith('/engineer?')) return ['orders.view']

  return []
}

export default async function ({ app, route, redirect }) {
  const path = route.path || ''
  const isProtectedWorkspace =
    path === '/manager' ||
    path.startsWith('/manager/') ||
    path === '/engineer' ||
    path.startsWith('/engineer/') ||
    path.startsWith('/factory/') ||
    path.startsWith('/admin')

  if (!isProtectedWorkspace) return

  if (!app.$auth.loggedIn) {
    try {
      await app.$auth.fetchUser()
    } catch (e) {}
  }

  if (!app.$auth.loggedIn) {
    return redirect('/login')
  }

  const meta = (route.meta && route.meta[0]) || {}
  const fromMeta = meta.permission
    ? [meta.permission]
    : Array.isArray(meta.permissions)
    ? meta.permissions
    : []
  const required = fromMeta.length ? fromMeta : routePermission(path)

  if (!required.length) return

  const user = app.$auth.user || {}
  const role = user?.role?.name || user?.role || null
  if (role === 'admin') return

  const granted = new Set(Array.isArray(user.permissions) ? user.permissions : [])
  const mode = meta.permissionMode === 'any' ? 'any' : 'all'
  const allowed =
    mode === 'any'
      ? required.some((permission) => granted.has(permission))
      : required.every((permission) => granted.has(permission))

  if (!allowed && path !== '/profile') {
    return redirect('/profile?access=denied')
  }
}
