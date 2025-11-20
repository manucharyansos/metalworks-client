export default async function ({ app, route, redirect, $auth }) {
  const localePath = app.localePath

  if (!$auth.loggedIn) {
    if (route.path !== '/login') {
      return redirect(localePath('/login'))
    }
    return
  }

  if (!$auth.user) {
    try {
      await $auth.fetchUser()
    } catch (e) {
      return redirect(localePath('/login'))
    }
  }

  const role = $auth.user?.role?.name
  if (!role) return redirect(localePath('/login'))

  const allowedPrefixes = {
    admin: '/admin',
    manager: '/manager',
    engineer: '/engineer',
    laser: '/factory/laser',
    bend: '/factory/bend',
  }

  const allowedPrefix = localePath(allowedPrefixes[role] || '/')

  const currentPath = route.path
  const isInAllowedSection =
    currentPath.startsWith(allowedPrefix + '/') ||
    currentPath === allowedPrefix ||
    currentPath === '/'

  if (!isInAllowedSection) {
    return redirect(allowedPrefix)
  }
}
