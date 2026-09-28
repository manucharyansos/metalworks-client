const normalizePath = (path = '') => {
  const normalized = path.replace(/^\/(hy|ru|en)(?=\/|$)/, '')
  return normalized || '/'
}

const routePermissions = (path, query = {}) => {
  if (path === '/manager/clients' && query.create === '1') return ['clients.create']
  if (path === '/manager/workers' && query.create === '1') return ['workers.create']
  if (path === '/manager/materials' && query.create === '1') return ['materials.create']
  if (path === '/manager/clients' && query.edit) return ['clients.update']
  if (path === '/manager/workers' && query.edit) return ['workers.update']
  if (path === '/manager/materials' && query.edit) return ['materials.update']

  // Production pages own their permission UX. Keeping them routable means a
  // worker never loses the role sidebar/logout just because one permission is
  // disabled; the board shows the exact missing permission instead.
  if (path.startsWith('/factory/')) return []

  const rules = [
    ['/manager/create/users', ['clients.create']],
    ['/manager/create/workers', ['workers.create']],
    ['/manager/create/materials', ['materials.create']],
    ['/manager/update/users', ['clients.update']],
    ['/manager/update/workers', ['workers.update']],
    ['/manager/update/materials', ['materials.update']],
    ['/manager/update/order', ['orders.update']],
    ['/manager/clients', ['clients.view']],
    ['/manager/workers', ['workers.view']],
    ['/manager/materials', ['materials.view']],
    ['/engineer/orders/create', ['orders.create']],
    ['/engineer/files/view', ['pmp.view', 'pmp_files.view']],
    ['/engineer/files', ['pmp.view']],
  ]

  const match = rules.find(([prefix]) => path.startsWith(prefix))
  if (match) return match[1]

  if (path === '/manager') return ['orders.view']

  // The engineer home page already renders PermissionDenied inside the
  // engineer layout when orders.view is missing.
  if (path === '/engineer') return []

  return []
}

export default async function ({ app, route, redirect }) {
  const rawPath = route.path || ''
  const path = normalizePath(rawPath)
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
    return redirect(app.localePath ? app.localePath('/login') : '/login')
  }

  const meta = (route.meta && route.meta[0]) || {}
  const fromMeta = meta.permission
    ? [meta.permission]
    : Array.isArray(meta.permissions)
    ? meta.permissions
    : []
  const required = fromMeta.length ? fromMeta : routePermissions(path, route.query || {})

  if (!required.length) return

  const user = app.$auth.user || {}
  const role = user?.role?.name || user?.role || null
  if (['admin', 'manager'].includes(role)) return

  const granted = new Set(Array.isArray(user.permissions) ? user.permissions : [])
  const mode = meta.permissionMode === 'any' ? 'any' : 'all'
  const allowed =
    mode === 'any'
      ? required.some((permission) => granted.has(permission))
      : required.every((permission) => granted.has(permission))

  if (!allowed && path !== '/profile') {
    const profile = app.localePath ? app.localePath('/profile') : '/profile'
    return redirect(`${profile}?access=denied`)
  }
}
