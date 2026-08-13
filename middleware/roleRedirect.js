// middleware/roleRedirect.js
const has = (user, permission) =>
  Array.isArray(user?.permissions) && user.permissions.includes(permission)

const managerHome = (user) => {
  if (has(user, 'orders.view')) return '/manager'
  if (has(user, 'clients.view')) return '/manager/clients'
  if (has(user, 'workers.view')) return '/manager/workers'
  if (has(user, 'materials.view')) return '/manager/materials'
  if (has(user, 'clients.create')) return '/manager/clients?create=1'
  if (has(user, 'workers.create')) return '/manager/workers?create=1'
  if (has(user, 'materials.create')) return '/manager/materials?create=1'
  return '/profile'
}

const engineerHome = (user) => {
  if (has(user, 'orders.view')) return '/engineer'
  if (has(user, 'pmp.view')) return '/engineer/files'
  if (has(user, 'orders.create')) return '/engineer/orders/create'
  return '/profile'
}

const factoryHome = (user) => {
  if (!has(user, 'factory.view')) return '/profile'
  const role = user?.role?.name
  if (role === 'laser') return '/factory/laser'
  if (role === 'bend') return '/factory/bend'
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

  if (currentPath === profilePath || currentPath.startsWith(profilePath + '/')) return

  let homeRaw = '/profile'
  let allowedBase = '/profile'

  if (role === 'admin') {
    homeRaw = '/admin'
    allowedBase = '/admin'
  } else if (role === 'manager') {
    homeRaw = managerHome(user)
    allowedBase = '/manager'
  } else if (role === 'engineer') {
    homeRaw = engineerHome(user)
    allowedBase = '/engineer'
  } else if (role === 'authenticatedUser' || role === 'guestUser') {
    homeRaw = '/profile'
    allowedBase = '/profile'
  } else if (user.factory_id) {
    homeRaw = factoryHome(user)
    allowedBase = '/factory'
  }

  const homeParts = homeRaw.split('?')
  const homePath = localePath(homeParts[0]) + (homeParts[1] ? `?${homeParts[1]}` : '')
  const allowedPrefix = localePath(allowedBase)

  if (currentPath === rootPath || isPublicAuthPath) return redirect(homePath)

  const isInAllowedSection =
    currentPath === allowedPrefix ||
    currentPath.startsWith(allowedPrefix + '/')

  if (!isInAllowedSection) return redirect(homePath)
}
