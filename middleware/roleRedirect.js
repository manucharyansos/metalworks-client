// middleware/roleRedirect.js
const FACTORY_ROLES = ['laser', 'bend', 'powder_catting', 'operator']

const factoryHome = (user) => {
  const role = user?.role?.name
  if (role === 'laser') return '/factory/laser'
  if (role === 'bend') return '/factory/bend'
  if (role === 'powder_catting') return '/factory/powder'
  return '/factory/workspace'
}

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
    if (!isPublicAuthPath) return redirect(loginPath)
    return
  }

  if (!$auth.user) {
    try {
      await $auth.fetchUser()
    } catch (e) {
      return redirect(loginPath)
    }
  }

  const user = $auth.user || {}
  const role = user?.role?.name
  if (!role) return redirect(loginPath)

  // Every staff position keeps its own workspace shell even when one business
  // permission is disabled. The page itself explains which function is locked;
  // users should not lose the sidebar/logout and fall back to a generic profile.
  let homeRaw = '/profile'
  let allowedBase = '/profile'

  if (role === 'admin') {
    homeRaw = '/admin'
    allowedBase = '/admin'
  } else if (role === 'manager') {
    homeRaw = '/manager'
    allowedBase = '/manager'
  } else if (role === 'engineer') {
    homeRaw = '/engineer'
    allowedBase = '/engineer'
  } else if (FACTORY_ROLES.includes(role) || user.factory_id) {
    homeRaw = factoryHome(user)
    allowedBase = '/factory'
  }

  // Profile is shared, but its page chooses the correct staff layout by role.
  if (currentPath === profilePath || currentPath.startsWith(profilePath + '/')) return

  const homePath = localePath(homeRaw)
  const allowedPrefix = localePath(allowedBase)

  if (currentPath === rootPath || isPublicAuthPath) return redirect(homePath)

  const isInAllowedSection =
    currentPath === allowedPrefix || currentPath.startsWith(allowedPrefix + '/')

  if (!isInAllowedSection) return redirect(homePath)
}
