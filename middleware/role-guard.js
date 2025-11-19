export default async function ({ app, route, redirect }) {
  const needRole = route.meta?.[0]?.role

  if (!app.$auth.loggedIn) {
    try {
      await app.$auth.fetchUser()
    } catch (e) {
      console.log('fetchUser failed:', e)
    }
  }

  if (!app.$auth.loggedIn) {
    return redirect('/login')
  }

  const user = app.$auth.user || {}
  const role = user?.role?.name || user?.role || null

  if (needRole && role !== needRole) {
    const dashboards = {
      admin: process.env.ADMIN_DASHBOARD || '/admin',
      manager: process.env.MANAGER_DASHBOARD || '/manager',
      engineer: process.env.ENGINEER_DASHBOARD || '/engineer',
      operator: process.env.OPERATOR_DASHBOARD || '/factory',
    }

    const target = dashboards[role]
    if (target) {
      return redirect(target)
    } else {
      return redirect('/')
    }
  }
}
