// export default function ({ app, redirect, route }) {
//   const accessiblePages = ['/', 'contact', 'services'];
//
//   if (accessiblePages.includes(route.name)) {
//     return;
//   }
//
//   const user = app.$auth.user;
//
//   const userRole = user.role.name;
//   const creatorRole = app.$config.creatorRole;
//   const adminRole = app.$config.adminRole;
//   const laserRole = app.$config.laserRole;
//   const bendRole = app.$config.bendRole;
//
//   let targetRoute = '/';
//
//   if (userRole === creatorRole) {
//     targetRoute = '/creator';
//   } else if (userRole === adminRole) {
//     targetRoute = '/admin';
//   } else if (userRole === laserRole) {
//     targetRoute = '/factory/laser';
//   } else if (userRole === bendRole) {
//     targetRoute = '/factory/bend';
//   }
//
//   if (route.path !== targetRoute) {
//     return redirect(targetRoute);
//   }
// }
