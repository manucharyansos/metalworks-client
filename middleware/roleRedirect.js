// middleware/roleRedirect.js
export default async function ({ app, route, redirect, $auth }) {
  const localePath = app.localePath

  const loginPath = localePath('/login')

  if (!$auth.loggedIn) {
    if (route.path !== loginPath) {
      return redirect(loginPath)
    }
    return
  }

  if (!$auth.user) {
    try {
      await $auth.fetchUser()
    } catch (e) {
      return redirect(loginPath)
    }
  }

  const role = $auth.user?.role?.name
  if (!role) {
    return redirect(loginPath)
  }

  const allowedPrefixes = {
    admin: '/admin',
    manager: '/manager',
    engineer: '/engineer',
    laser: '/factory/laser',
    bend: '/factory/bend',
  }

  const allowedPrefixRaw = allowedPrefixes[role] || '/'
  const allowedPrefix = localePath(allowedPrefixRaw)

  const currentPath = route.path

  const isInAllowedSection =
    currentPath === allowedPrefix ||
    currentPath.startsWith(allowedPrefix + '/') ||
    currentPath === '/'

  if (!isInAllowedSection) {
    return redirect(allowedPrefix)
  }
}
