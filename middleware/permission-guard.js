export default async function ({ app, route, redirect }) {
  if (!app.$auth.loggedIn) {
    try {
      await app.$auth.fetchUser()
    } catch (e) {}
  }

  if (!app.$auth.loggedIn) {
    return redirect('/login')
  }

  const meta = (route.meta && route.meta[0]) || {}
  const required = meta.permission
    ? [meta.permission]
    : Array.isArray(meta.permissions)
    ? meta.permissions
    : []

  if (!required.length) return

  const user = app.$auth.user || {}
  const role = user?.role?.name || user?.role || null
  if (role === 'admin') return

  const granted = new Set(Array.isArray(user.permissions) ? user.permissions : [])
  const mode = meta.permissionMode === 'any' ? 'any' : 'all'
  const allowed =
    mode === 'any'
      ? required.some((permission) => granted.has(permission))
      : required.every((permission) => granted.has(permission))

  if (!allowed) {
    return redirect('/profile?access=denied')
  }
}
