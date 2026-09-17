const SUPPORTED = [
  { code: 'hy', label: 'HY', title: 'Հայերեն' },
  { code: 'ru', label: 'RU', title: 'Русский' },
  { code: 'en', label: 'EN', title: 'English' },
]

function localeCode(i18n) {
  const value = String(i18n?.locale || 'hy').toLowerCase().split('-')[0]
  return SUPPORTED.some((item) => item.code === value) ? value : 'hy'
}

export default ({ app, $auth }) => {
  if (!process.client) return

  let root = null
  let switching = false

  const applyActiveState = () => {
    if (!root) return
    const active = localeCode(app.i18n)
    root.querySelectorAll('button[data-locale]').forEach((button) => {
      const selected = button.dataset.locale === active
      button.setAttribute('aria-pressed', selected ? 'true' : 'false')
      button.disabled = switching
      button.style.background = selected ? '#0f172a' : 'transparent'
      button.style.color = selected ? '#ffffff' : '#64748b'
      button.style.boxShadow = selected ? '0 1px 3px rgba(15,23,42,.18)' : 'none'
    })
  }

  const changeLocale = (code) => {
    if (
      switching ||
      !SUPPORTED.some((item) => item.code === code) ||
      code === localeCode(app.i18n)
    ) {
      return
    }

    switching = true
    applyActiveState()
    document.cookie = `i18n_redirected=${encodeURIComponent(code)}; path=/; max-age=31536000; samesite=lax`

    let target = null
    try {
      if (typeof app.switchLocalePath === 'function') target = app.switchLocalePath(code)
    } catch (_) {}

    if (!target) {
      const path = app.router?.currentRoute?.fullPath || window.location.pathname || '/'
      const clean = path.replace(/^\/(ru|en)(?=\/|$)/, '') || '/'
      target = code === 'hy' ? clean : `/${code}${clean === '/' ? '' : clean}`
    }

    window.location.assign(target)
  }

  const create = () => {
    if (root || document.querySelector('[data-global-language-switcher]')) return
    root = document.createElement('div')
    root.setAttribute('data-global-language-switcher', '')
    root.setAttribute('aria-label', 'Language')
    root.style.cssText = [
      'position:fixed',
      'right:16px',
      'bottom:16px',
      'z-index:2147483000',
      'display:flex',
      'gap:3px',
      'padding:4px',
      'border:1px solid rgba(148,163,184,.35)',
      'border-radius:14px',
      'background:rgba(255,255,255,.94)',
      'backdrop-filter:blur(14px)',
      'box-shadow:0 10px 30px rgba(15,23,42,.14)',
    ].join(';')

    for (const item of SUPPORTED) {
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.locale = item.code
      button.textContent = item.label
      button.title = item.title
      button.style.cssText = [
        'border:0',
        'border-radius:10px',
        'padding:8px 10px',
        'font:700 11px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        'letter-spacing:.06em',
        'cursor:pointer',
        'transition:all .15s ease',
      ].join(';')
      button.addEventListener('click', () => changeLocale(item.code))
      root.appendChild(button)
    }

    document.body.appendChild(root)
    applyActiveState()
  }

  const sync = () => {
    const pageSwitcher = document.querySelector('[data-language-switcher]')
    const authenticated = Boolean($auth?.loggedIn)
    if (authenticated && !pageSwitcher) create()
    else if (root && (!authenticated || pageSwitcher)) {
      root.remove()
      root = null
    }
    applyActiveState()
  }

  const run = () => window.requestAnimationFrame(sync)
  const start = () => {
    run()
    window.setTimeout(run, 250)
    window.setTimeout(run, 1000)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    start()
  }

  app.router?.afterEach?.(run)
  if (app.router?.app?.$watch) {
    app.router.app.$watch(() => Boolean($auth?.loggedIn), run)
  }
}
