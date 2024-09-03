export default function ({ app, redirect }) {
  if (!app.$auth.loggedIn) {
    return redirect('/login')
  }

  const laserRole = app.$config.laserRole
  const userRole = app.$auth.user.role.name

  if (userRole !== laserRole) {
    return redirect('/')
  }
}
