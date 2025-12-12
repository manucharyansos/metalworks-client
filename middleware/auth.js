// middleware/auth.js
export default async function ({ route, redirect, $auth }) {
  if (!$auth.loggedIn) {
    try {
      await $auth.fetchUser()
    } catch (e) {}
  }

  if (!$auth.loggedIn) {
    if (route.path !== '/login') {
      return redirect('/login')
    }
    return
  }

  const role = $auth.user?.role?.name || $auth.user?.role

  const dashboardMap = {
    admin: '/admin',
    manager: '/manager',
    engineer: '/engineer',
    operator: '/factory',
  }

  const targetDashboard = dashboardMap[role]

  if (!targetDashboard) {
    return redirect('/logout')
  }
  const requiredRole = route.meta?.find((m) => m.role)?.role
  if (requiredRole && role !== requiredRole) {
    return redirect(targetDashboard)
  }

  // Բոլոր դեպքերում թույլատրել
}
