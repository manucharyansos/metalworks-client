export default function ({ app, redirect }) {
  if (!app.$auth.loggedIn) {
    return redirect('/login')
  }

  const managerRole = app.$config.managerRole
  const userRole = app.$auth.user.role.name

  if (userRole) {
    if (userRole !== managerRole) {
      return redirect('/')
    }
  }
}
