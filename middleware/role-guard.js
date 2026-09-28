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
    return redirect('/login')
  }

  const user = app.$auth.user || {}
  const role = user?.role?.name || user?.role || null
  const privileged = ['admin', 'manager'].includes(role)

  // Managers have a dedicated management view for laser cutting. If a manager
  // opens the operator URL directly, send them to the manager-safe version
  // instead of bouncing back to the dashboard.
  if (
    role === 'manager' &&
    needRole === 'laser' &&
    String(route.path || '').includes('/factory/laser')
  ) {
    const target = typeof app.localePath === 'function'
      ? app.localePath('/manager/factories/laser')
      : '/manager/factories/laser'
    return redirect({ path: target, query: route.query || {} })
  }

  if (needRole && role !== needRole && !(allowPrivileged && privileged)) {
    const dashboards = app.$config?.dashboards || {}
    return redirect(dashboards[role] || '/')
  }
}
