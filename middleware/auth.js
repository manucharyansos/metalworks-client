// middleware/auth.js
export default async function ({ route, redirect, $auth }) {
  if (!$auth.loggedIn) {
    try {
      await $auth.fetchUser()
    } catch (e) {
      try {
        $auth.reset()
      } catch (_) {}
    }
  }

  if (!$auth.loggedIn) {
    return route.path === '/login' ? undefined : redirect('/login')
  }

  const role = $auth.user?.role?.name || $auth.user?.role

  const dashboardMap = {
    admin: '/admin',
    manager: '/manager',
    engineer: '/engineer',
    operator: '/factory/bend',
  }

  const targetDashboard = dashboardMap[role]

  if (!targetDashboard) {
    try {
      $auth.reset()
    } catch (_) {}
    return redirect('/login')
  }
  const requiredRole = route.meta?.find((m) => m.role)?.role
  if (requiredRole && role !== requiredRole) {
    return redirect(targetDashboard)
  }

  // Բոլոր դեպքերում թույլատրել
}
