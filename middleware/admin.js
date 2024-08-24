export default function ({ $auth, redirect }) {
  if (!$auth.loggedIn || !$auth.user.role) {
    return redirect('/')
  }
}
