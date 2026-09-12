const DATE_LOCALES = { hy: 'hy-AM', ru: 'ru-RU', en: 'en-US' }

export default ({ app }) => {
  if (!process.client) return

  const activeLocale = () => {
    const code = String(app.i18n?.locale || 'hy').toLowerCase().split('-')[0]
    return DATE_LOCALES[code] || DATE_LOCALES.hy
  }

  const resolveLegacyLocale = (locales) => {
    if (locales == null) return locales
    if (typeof locales === 'string' && locales.toLowerCase() === 'hy-am') return activeLocale()
    if (Array.isArray(locales)) {
      return locales.map((locale) =>
        typeof locale === 'string' && locale.toLowerCase() === 'hy-am'
          ? activeLocale()
          : locale
      )
    }
    return locales
  }

  const NativeDateTimeFormat = Intl.DateTimeFormat
  function LocaleAwareDateTimeFormat(locales, options) {
    return new NativeDateTimeFormat(resolveLegacyLocale(locales), options)
  }
  LocaleAwareDateTimeFormat.prototype = NativeDateTimeFormat.prototype
  Object.setPrototypeOf(LocaleAwareDateTimeFormat, NativeDateTimeFormat)
  Intl.DateTimeFormat = LocaleAwareDateTimeFormat

  const nativeDate = Date.prototype.toLocaleDateString
  const nativeTime = Date.prototype.toLocaleTimeString
  const nativeString = Date.prototype.toLocaleString

  Date.prototype.toLocaleDateString = function (locales, options) {
    return nativeDate.call(this, resolveLegacyLocale(locales), options)
  }
  Date.prototype.toLocaleTimeString = function (locales, options) {
    return nativeTime.call(this, resolveLegacyLocale(locales), options)
  }
  Date.prototype.toLocaleString = function (locales, options) {
    return nativeString.call(this, resolveLegacyLocale(locales), options)
  }
}
