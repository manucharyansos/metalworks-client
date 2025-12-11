export default async function ({ app, route, redirect }) {
  const needRole = route.meta && route.meta[0] && route.meta[0].role

  if (!app.$auth.loggedIn) {
    try {
      await app.$auth.fetchUser()
    } catch (e) {
      try {
        app.$auth.reset()
      } catch (_) {}
    }
  }

  if (!app.$auth.loggedIn) {
    return redirect('/login')
  }

  const user = app.$auth.user || {}
  const role = user?.role?.name || user?.role || null

  if (needRole && role !== needRole) {
    const dashboards = app.$config?.dashboards || {}
    return redirect(dashboards[role] || '/')
  }
}
