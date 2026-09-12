const DATE_LOCALES = {
  hy: 'hy-AM',
  ru: 'ru-RU',
  en: 'en-US',
}

export default ({ app }, inject) => {
  const code = () => {
    const value = String(app.i18n?.locale || 'hy').toLowerCase().split('-')[0]
    return DATE_LOCALES[value] ? value : 'hy'
  }

  inject('dateLocale', () => DATE_LOCALES[code()])
  inject('localeCode', code)
}
