export default function ({ app, redirect, route }) {
  const accessiblePages = ['/', '/contact', '/services'];

  if (accessiblePages.includes(route.path)) {
    return;
  }

  if (!app.$auth.loggedIn) {
    if (route.path !== '/login') {
      return redirect('/login');
    }
    return;
  } else if (route.path === '/login') {
    return redirect('/');
  }

  const userRole = app.$auth.user.role.name;
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

  if (route.path !== targetRoute) {
    return redirect(targetRoute);
  }
}
