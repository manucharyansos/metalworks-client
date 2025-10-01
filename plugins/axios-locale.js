export default function ({ $axios, app, req }) {
  const readLocale = () => {
    const fromI18n = app.i18n?.locale
    const fromCookie = process.server
      ? (req?.headers?.cookie || '').match(
          /(?:^|;\s*)i18n_redirected=([^;]+)/
        )?.[1]
      : app.$cookies
      ? app.$cookies.get('i18n_redirected')
      : null
    const loc = fromI18n || fromCookie || 'hy'
    return ['hy', 'ru', 'en'].includes(loc) ? loc : 'hy'
  }

  const set = () => {
    const loc = readLocale()
    $axios.setHeader('X-Locale', loc)
    if ($axios.setQueryParams) $axios.setQueryParams({ locale: loc })
  }

  set()
  $axios.onRequest(set)
}
