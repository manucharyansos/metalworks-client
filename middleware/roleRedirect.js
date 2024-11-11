export default function ({ $config, $auth, redirect }) {
  const userRole = $auth.user.role;

  if (userRole === $config.creatorRole) {
    return redirect('/creator');
  }
  if (userRole === $config.adminRole) {
    return redirect('/admin');
  }
  if (userRole === $config.laserRole) {
    return redirect('/factory/laser');
  }
  if (userRole === $config.bendRole) {
    return redirect('/factory/bend');
  }
}
