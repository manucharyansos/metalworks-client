export default function ({ $auth, redirect, route }) {
  if ($auth.loggedIn) {
    const nextRoute = route.query.redirect || '/dashboard'
    return redirect(nextRoute)
  }
}
