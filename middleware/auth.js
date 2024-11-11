export default function ({ app, redirect, route }) {
  const accessiblePages = ['/', '/contact', '/services'];

  if (app.$auth.loggedIn && route.path === '/login') {
    return redirect('/');
  }

  if (!app.$auth.loggedIn && route.path !== '/login' && !accessiblePages.includes(route.path)) {
    return redirect('/login');
  }

  const userRole = app.$auth.user?.role?.name;
  const { creatorRole, adminRole, laserRole, bendRole } = app.$config;

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

  if (app.$auth.loggedIn && route.path !== targetRoute) {
    return redirect(targetRoute);
  }
}
