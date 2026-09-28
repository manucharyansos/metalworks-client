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

  if (needRole && role !== needRole && !(allowPrivileged && privileged)) {
    const dashboards = app.$config?.dashboards || {}
    return redirect(dashboards[role] || '/')
  }
}
