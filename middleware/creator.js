export default function ({ app, redirect }) {
  if (!app.$auth.loggedIn) {
    return redirect('/login')
  }

  const creatorRole = app.$config.creatorRole
  const userRole = app.$auth.user.role.name

  if (userRole) {
    if (userRole !== creatorRole) {
      return redirect('/')
    }
  }
}
