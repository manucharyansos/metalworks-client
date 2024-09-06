export default function ({ app, redirect }) {
  if (!app.$auth.loggedIn) {
    return redirect('/login')
  }

  const adminRole = app.$config.adminRole
  const userRole = app.$auth.user.role.name

  if (userRole) {
    if (userRole !== adminRole) {
      return redirect('/')
    }
  }
}
