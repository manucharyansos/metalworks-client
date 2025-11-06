export default ({ app }, inject) => {
  const can = (permission) => {
    const perms = app.$auth.user?.permissions || []
    return perms.includes(permission)
  }

  inject('can', can)
}
