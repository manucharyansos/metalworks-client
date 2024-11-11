// export default function ({ app, redirect, route }) {
//   const accessiblePages = ['/', '/contact', '/services'];
//
//   // Ստուգել, եթե օգտատերը մուտք չի գործել և փորձել է մուտք գործել արգելված էջեր
//   if (!app.$auth.loggedIn) {
//     if (accessiblePages.includes(route.path)) {
//       return; // Եթե էջը հասանելի է առանց մուտքի, թույլատրել
//     }
//     return redirect('/login'); // Ուղղորդել դեպի login
//   }
//
//   // Եթե օգտատերը մուտք է գործել և գտնվում է login կամ register էջում՝ ուղղորդել գլխավոր էջ
//   if (app.$auth.loggedIn && (route.path === '/login' || route.path === '/register')) {
//     return redirect('/');
//   }
//
//   // Ստանալ օգտատիրոջ դերը և դերի համար նպատակակետը
//   const userRole = app.$auth.user?.role?.name;
//   const { creatorRole, adminRole, laserRole, bendRole } = app.$config;
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
//   // Եթե օգտատերը մուտք է գործել և չի գտնվում իր դերի էջում, այն ուղղորդում ենք այնտեղ
//   if (app.$auth.loggedIn && route.path !== targetRoute && !accessiblePages.includes(route.path)) {
//     return redirect(targetRoute);
//   }
// }
