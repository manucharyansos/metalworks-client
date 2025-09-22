export default ({ $axios, app }) => {
  $axios.onRequest((config) => {
    const lc = app.i18n && app.i18n.locale ? app.i18n.locale : 'hy'
    config.headers['X-Locale'] = lc
    return config
  })
}
