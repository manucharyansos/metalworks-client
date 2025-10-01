export default function ({ app, route, redirect, req }) {
  const i18n = app.i18n
  if (!i18n || !i18n.localePath) return

  const cookieLocale = process.server
    ? (req?.headers?.cookie || '').match(
        /(?:^|;\s*)i18n_redirected=([^;]+)/
      )?.[1]
    : app.$cookies
    ? app.$cookies.get('i18n_redirected')
    : null

  const current = i18n.locale || cookieLocale || 'hy'
  const path = route.path
  const alreadyLocalized =
    path === i18n.localePath(path, current) ||
    path.startsWith(`/${current}/`) ||
    (current === i18n.defaultLocale &&
      app.$config?.i18n?.strategy === 'prefix_except_default')

  if (alreadyLocalized) return

  const target = i18n.localePath({ path, query: route.query }, current)
  if (target && target !== path) {
    return redirect(target)
  }
}
