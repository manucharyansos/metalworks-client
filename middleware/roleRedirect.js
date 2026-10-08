// middleware/roleRedirect.js
const FACTORY_ROLES = ['laser', 'bend', 'powder_catting', 'operator']
const normalizePath = (path = '') => path.replace(/\/+$/, '') || '/'

const has = (user, permission) =>
  Array.isArray(user?.permissions) && user.permissions.includes(permission)

const engineerHome = (user) => {
  if (has(user, 'orders.view')) return '/engineer'
  if (has(user, 'pmp.view')) return '/engineer/files'
  if (has(user, 'orders.create')) return '/engineer/orders/create'
  return '/engineer'
}

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
  const profilePath = normalizePath(localePath('/profile'))
  const rootPath = normalizePath(localePath('/'))
  const publicAuthPaths = [
    localePath('/login'),
    localePath('/register'),
    localePath('/forgot-password'),
    localePath('/reset-password'),
  ].map(normalizePath)

  const currentPath = normalizePath(route.path)
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

  // A position determines the workspace shell. Permissions determine which
  // functions inside that shell are active. This prevents sidebar/logout from
  // disappearing when one permission is disabled.
  let homeRaw = '/profile'
  let allowedBase = '/profile'

  if (role === 'admin') {
    homeRaw = '/admin'
    allowedBase = '/admin'
  } else if (role === 'manager') {
    homeRaw = '/manager'
    allowedBase = '/manager'
  } else if (role === 'engineer') {
    homeRaw = engineerHome(user)
    allowedBase = '/engineer'
  } else if (FACTORY_ROLES.includes(role) || user.factory_id) {
    homeRaw = factoryHome(user)
    allowedBase = '/factory'
  }

  // Profile is shared, but pages/profile.vue chooses the same role layout.
  if (currentPath === profilePath || currentPath.startsWith(profilePath + '/')) return

  const homePath = localePath(homeRaw)
  const allowedPrefix = normalizePath(localePath(allowedBase))

  if (currentPath === rootPath || isPublicAuthPath) return redirect(homePath)

  const isInAllowedSection =
    currentPath === allowedPrefix || currentPath.startsWith(allowedPrefix + '/')

  if (!isInAllowedSection) return redirect(homePath)
}
