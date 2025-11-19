export default async function ({ app, route, redirect, $auth }) {
  const toLocale = (p) => (app.localePath ? app.localePath(p) : p)
  const loginPath = toLocale('/login')
  const homePath = toLocale('/')

  if (route.path === loginPath) return

  if (!$auth.loggedIn) {
    try {
      await $auth.fetchUser()
    } catch (e) {
      // ignore
    }
  }

  if (!$auth.loggedIn) {
    if (route.path !== loginPath) {
      return redirect(loginPath)
    }
    return
  }

  const userRole = $auth.user?.role?.name || $auth.user?.role

  if (route.path === homePath) {
    const dashboards = app.$config?.dashboards || {}
    const target = dashboards[userRole] || '/'
    return redirect(toLocale(target))
  }

  const requiredRole = route.meta?.[0]?.role
  if (requiredRole && requiredRole !== userRole) {
    const dashboards = app.$config?.dashboards || {}
    const target = dashboards[userRole] || '/'
    return redirect(toLocale(target))
  }
}
