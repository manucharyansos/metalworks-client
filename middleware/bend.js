export default function ({ app, redirect }) {
  if (!app.$auth.loggedIn) {
    return redirect('/login')
  }

  const bendRole = app.$config.bendRole
  const userRole = app.$auth.user.role.name

  if (userRole !== bendRole) {
    return redirect('/')
  }
}
