export default function ({ app, redirect }) {
  if (!app.$auth.loggedIn) {
    return redirect('/login')
  }

  const engineerRole = app.$config.engineerRole
  const userRole = app.$auth.user.role.name

  if (userRole) {
    if (userRole !== engineerRole) {
      return redirect('/')
    }
  }
}
