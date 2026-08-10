// middleware/roleRedirect.js
export default async function ({ app, route, redirect, $auth }) {
  const localePath = app.localePath

  const loginPath = localePath('/login')
  const profilePath = localePath('/profile')
  const rootPath = localePath('/')
  const publicAuthPaths = [
    localePath('/login'),
    localePath('/register'),
    localePath('/forgot-password'),
    localePath('/reset-password'),
  ]

  const currentPath = route.path
  const isPublicAuthPath = publicAuthPaths.includes(currentPath)

  if (!$auth.loggedIn) {
    if (!isPublicAuthPath) {
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

  // Every authenticated role can access its personal profile.
  if (currentPath === profilePath || currentPath.startsWith(profilePath + '/')) {
    return
  }

  const allowedPrefixes = {
    admin: '/admin',
    manager: '/manager',
    engineer: '/engineer',
    laser: '/factory/laser',
    bend: '/factory/bend',
    authenticatedUser: '/profile',
  }

  const allowedPrefixRaw = allowedPrefixes[role] || '/profile'
  const allowedPrefix = localePath(allowedPrefixRaw)

  if (role === 'authenticatedUser' && currentPath === rootPath) {
    return redirect(profilePath)
  }

  const isInAllowedSection =
    currentPath === allowedPrefix ||
    currentPath.startsWith(allowedPrefix + '/') ||
    currentPath === rootPath

  if (!isInAllowedSection) {
    return redirect(allowedPrefix)
  }
}
