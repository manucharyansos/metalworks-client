export default function ({ app, redirect, route }) {
  if (!app.$auth.loggedIn) {
    if (route.name !== 'login' && route.name !== 'register') {
      return redirect('/login');
    }
  }
}
