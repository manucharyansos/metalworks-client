export default function ({ app, redirect, route }) {
  if (app.$auth.loggedIn && route.path === '/login') {
    return redirect('/')
  }
  if (!app.$auth.loggedIn && route.path !== '/login') {
    return redirect('/login')
  }
}
