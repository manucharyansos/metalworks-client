export default function ({ app, redirect, route }) {
  if (!app.$auth.loggedIn) {
    if (route.name !== 'login' && route.name !== 'register') {
      return redirect('/login');
    }
  } else {
    if (['contact', 'services'].includes(route.name)) {
      return;
    }

    // Role-based redirection for other pages
    const user = app.$auth.user;
    const creatorRole = app.$config.creatorRole;
    const adminRole = app.$config.adminRole;
    const laserRole = app.$config.laserRole;
    const bendRole = app.$config.bendRole;
    const userRole = user.role.name;

    let targetRoute = '/';

    if (userRole === creatorRole) {
      targetRoute = '/creator';
    } else if (userRole === adminRole) {
      targetRoute = '/admin';
    } else if (userRole === laserRole) {
      targetRoute = '/factory/laser';
    } else if (userRole === bendRole) {
      targetRoute = '/factory/bend';
    }

    if (route.path !== targetRoute) {
      return redirect(targetRoute);
    }
  }
}
