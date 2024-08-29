export default function ({ $auth, redirect, route }) {
  if (!$auth.loggedIn || $auth.user.role.name !== 'creator') {
    return redirect('/')
  }
  // if (route.path !== '/creator') {
  //   return redirect('/creator')
  // }
}
