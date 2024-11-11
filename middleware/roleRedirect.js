  export default function ({ app, redirect, route }) {
    // Skip the redirection for 'contact' and 'services' routes
    if (['contact', 'services'].includes(route.name)) {
      return;
    }

    const user = app.$auth.user;

    // If user is not authenticated, redirect to login page
    if (!user) {
      return redirect('/login');
    }

    // Retrieve roles from app configuration
    const creatorRole = app.$config.creatorRole;
    const adminRole = app.$config.adminRole;
    const laserRole = app.$config.laserRole;
    const bendRole = app.$config.bendRole;

    // Get the user's role
    const userRole = user.role.name;

    // Default target route
    let targetRoute = '/';

    // Determine target route based on user role
    if (userRole === creatorRole) {
      targetRoute = '/creator';
    } else if (userRole === adminRole) {
      targetRoute = '/admin';
    } else if (userRole === laserRole) {
      targetRoute = '/factory/laser';
    } else if (userRole === bendRole) {
      targetRoute = '/factory/bend';
    }

    // Redirect only if the current route is not the target route
    if (route.path !== targetRoute) {
      return redirect(targetRoute);
    }
  }

