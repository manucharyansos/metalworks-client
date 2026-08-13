export default ({ app }, inject) => {
  const userState = () => {
    const user = app.$auth.user || {}
    return {
      role: user?.role?.name || user?.role || null,
      granted: new Set(Array.isArray(user.permissions) ? user.permissions : []),
    }
  }

  const can = (permission) => {
    if (!permission) return true
    const { role, granted } = userState()
    if (role === 'admin') return true
    if (permission === 'roles.view' && role === 'manager') return true
    return granted.has(permission)
  }

  const canAny = (items = []) => {
    const list = Array.isArray(items) ? items : [items]
    if (!list.length) return true
    return list.some((permission) => can(permission))
  }

  const canAll = (items = []) => {
    const list = Array.isArray(items) ? items : [items]
    if (!list.length) return true
    return list.every((permission) => can(permission))
  }

  inject('can', can)
  inject('canAny', canAny)
  inject('canAll', canAll)
}
