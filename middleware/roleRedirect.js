export default function ({ app, route, redirect, $auth, $config }) {
  const toLocale = (p) => (app.localePath ? app.localePath(p) : p)
  const path = route.path
  const isLoggedIn = $auth && $auth.loggedIn

  const roleToPath = (role) => {
    const map = {
      [$config.managerRole]: $config.dashboards.manager,
      [$config.engineerRole]: $config.dashboards.engineer,
      [$config.adminRole]: $config.dashboards.admin,
      [$config.laserRole]: $config.dashboards.laser,
      [$config.bendRole]: $config.dashboards.bend,
    }
    return map[role] || '/'
  }

  const root = toLocale('/')
  if (path === '/' || path === root) {
    if (!isLoggedIn) {
      const login = toLocale('/login')
      if (path !== login) return redirect(login)
      return
    }
    const target = toLocale(roleToPath($auth.user?.role?.name))
    if (path !== target) {
      return redirect(target)
    }
  }
}
