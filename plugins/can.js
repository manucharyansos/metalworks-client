export default ({ app }, inject) => {
  const permissions = () => {
    const user = app.$auth.user || {}
    const role = user?.role?.name || user?.role || null

    if (role === 'admin') return null
    return new Set(Array.isArray(user.permissions) ? user.permissions : [])
  }

  const can = (permission) => {
    if (!permission) return true
    const granted = permissions()
    return granted === null || granted.has(permission)
  }

  const canAny = (items = []) => {
    const list = Array.isArray(items) ? items : [items]
    if (!list.length) return true
    const granted = permissions()
    return granted === null || list.some((permission) => granted.has(permission))
  }

  const canAll = (items = []) => {
    const list = Array.isArray(items) ? items : [items]
    if (!list.length) return true
    const granted = permissions()
    return granted === null || list.every((permission) => granted.has(permission))
  }

  inject('can', can)
  inject('canAny', canAny)
  inject('canAll', canAll)
}
