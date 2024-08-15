export default function ({ app, redirect, next }) {
  if (!app.$auth.loggedIn) {
    return redirect('/login')
  }

}
