// middleware/authGuest.js
export default function ({ $auth, $config, redirect }) {
  // Ստուգել, արդյոք օգտատերը մուտք գործած է
  if ($auth.loggedIn) {
    const userRole = $auth.user.role.name;

    if (userRole === $config.creatorRole) {
      return redirect($config.dashboards.creator);
    }
    if (userRole === $config.adminRole) {
      return redirect($config.dashboards.admin);
    }
    if (userRole === $config.laserRole) {
      return redirect($config.dashboards.laser);
    }
    if (userRole === $config.bendRole) {
      return redirect($config.dashboards.bend);
    }
  }
}
