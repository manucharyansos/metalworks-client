export default function ({ app, redirect, route }) {
  const user = app.$auth.user
  if (user) {
    const creatorRole = app.$config.creatorRole
    const adminRole = app.$config.adminRole
    const laserRole = app.$config.laserRole
    const bendRole = app.$config.bendRole
    const userRole = user.role.name

    let targetRoute = '/'

    if (userRole) {
      if (userRole === creatorRole) {
        targetRoute = '/creator'
      } else if (userRole === adminRole) {
        targetRoute = '/admin'
      } else if (userRole === laserRole) {
        targetRoute = '/factory/laser'
      } else if (userRole === bendRole) {
        targetRoute = '/factory/bend'
      }
      if (route.path !== targetRoute) {
        return redirect(targetRoute)
      }
    }
  }
}
