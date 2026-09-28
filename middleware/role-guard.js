const ROLE_HOMES = {
  admin: '/admin',
  manager: '/manager',
  engineer: '/engineer',
  laser: '/factory/laser',
  bend: '/factory/bend',
  powder_catting: '/factory/powder',
  operator: '/factory/workspace',
}

export default async function ({ app, route, redirect }) {
  const meta = (route.meta && route.meta[0]) || {}
  const needRole = meta.role
  const allowPrivileged = Boolean(meta.allowPrivileged)

  if (!app.$auth.loggedIn) {
    try {
      await app.$auth.fetchUser()
    } catch (e) {}
  }

  if (!app.$auth.loggedIn) {
    const login = typeof app.localePath === 'function' ? app.localePath('/login') : '/login'
    return redirect(login)
  }

  const user = app.$auth.user || {}
  const role = user?.role?.name || user?.role || null
  const privileged = ['admin', 'manager'].includes(role)

  // Managers use dedicated production-management workspaces instead of
  // operator-only screens, so operator ownership never blocks management.
  if (role === 'manager') {
    const managerProductionRoutes = {
      laser: '/manager/factories/laser',
      bend: '/manager/factories/bend',
      powder_catting: '/manager/factories/powder',
    }
    const targetRaw = managerProductionRoutes[needRole]

    if (targetRaw && String(route.path || '').includes('/factory/')) {
      const target = typeof app.localePath === 'function'
        ? app.localePath(targetRaw)
        : targetRaw
      return redirect({ path: target, query: route.query || {} })
    }
  }

  if (needRole && role !== needRole && !(allowPrivileged && privileged)) {
    const dashboards = app.$config?.dashboards || {}
    const rawTarget = dashboards[role] || ROLE_HOMES[role] || '/profile'
    const target = typeof app.localePath === 'function'
      ? app.localePath(rawTarget)
      : rawTarget
    return redirect(target)
  }
}
