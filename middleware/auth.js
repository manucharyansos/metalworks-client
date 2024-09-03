export default function ({ app, redirect, route }) {
  if (!app.$auth.loggedIn) {
    return redirect('/login')
  }
  const creatorRole = app.$config.creatorRole
  const adminRole = app.$config.adminRole
  const laserRole = app.$config.laserRole

  const userRole = app.$auth.user.role.name

  let targetRoute = '/'
  if (userRole === creatorRole) {
    targetRoute = '/creator'
  } else if (userRole === adminRole) {
    targetRoute = '/admin'
  } else if (userRole === laserRole) {
    targetRoute = '/factory/laser'
  }

  if (route.path !== targetRoute) {
    return redirect(targetRoute)
  }
}
