const SUPPORTED = [
  { code: 'hy', label: 'HY', title: 'Հայերեն' },
  { code: 'ru', label: 'RU', title: 'Русский' },
  { code: 'en', label: 'EN', title: 'English' },
]

function localeCode(i18n) {
  const value = String(i18n?.locale || 'hy').toLowerCase().split('-')[0]
  return SUPPORTED.some((item) => item.code === value) ? value : 'hy'
}

export default ({ app, $auth, $axios }) => {
  if (!process.client) return

  let root = null
  let switching = false
  let identity = null
  let identityLoading = null
  let identityUserId = null

  const withRouterBase = (target) => {
    if (!target || /^https?:\/\//i.test(target)) return target
    const base = String(app.router?.options?.base || '/').trim() || '/'
    if (base === '/') return target

    const normalizedBase = `/${base.replace(/^\/+|\/+$/g, '')}/`
    if (target === normalizedBase.slice(0, -1) || target.startsWith(normalizedBase)) {
      return target
    }

    return `${normalizedBase.slice(0, -1)}/${String(target).replace(/^\/+/, '')}`
  }

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
      const path = app.router?.currentRoute?.fullPath || '/'
      const clean = path.replace(/^\/(ru|en)(?=\/|$)/, '') || '/'
      target = code === 'hy' ? clean : `/${code}${clean === '/' ? '' : clean}`
    }

    window.location.assign(withRouterBase(target))
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

  const renderIdentity = () => {
    if (!identity) return

    const displayName = String(identity.display_name || identity.name || '').trim() || 'MetalWorks'
    const secondary = String(identity.phone || identity.email || '').trim()

    document.querySelectorAll('aside p').forEach((nameNode) => {
      const isBrand = nameNode.textContent.trim() === 'MetalWorks'
      const isManaged = nameNode.dataset.userIdentityName === 'true'
      if (!isBrand && !isManaged) return

      nameNode.dataset.userIdentityName = 'true'
      nameNode.textContent = displayName
      nameNode.title = displayName

      let container = nameNode.parentElement
      if (!container) return

      if (container.tagName === 'A') {
        const wrapper = document.createElement('div')
        wrapper.className = 'min-w-0'
        wrapper.setAttribute('data-user-identity-container', '')
        container.insertBefore(wrapper, nameNode)
        wrapper.appendChild(nameNode)
        container = wrapper
      }

      let secondaryNode = Array.from(container.children).find(
        (child) => child.dataset?.userIdentityPhone === 'true'
      )

      if (!secondaryNode) {
        secondaryNode = Array.from(container.children).find(
          (child) => child !== nameNode && child.tagName === 'P'
        )
      }

      if (!secondaryNode) {
        secondaryNode = document.createElement('p')
        container.appendChild(secondaryNode)
      }

      secondaryNode.dataset.userIdentityPhone = 'true'
      secondaryNode.className = 'truncate text-xs text-slate-500 dark:text-slate-400'
      secondaryNode.textContent = secondary
      secondaryNode.title = secondary
    })
  }

  const loadIdentity = async () => {
    if (!$auth?.loggedIn || !$axios) return null

    const currentId = $auth.user?.id || null
    if (identity && identityUserId === currentId) return identity
    if (identityLoading) return identityLoading

    identityLoading = $axios
      .$get('/api/profile/identity')
      .then((data) => {
        identity = data || null
        identityUserId = currentId || identity?.id || null

        if ($auth.user && identity) {
          if (identity.last_name !== undefined) $auth.user.last_name = identity.last_name
          if (identity.phone !== undefined) $auth.user.phone = identity.phone
        }

        renderIdentity()
        return identity
      })
      .catch(() => null)
      .finally(() => {
        identityLoading = null
      })

    return identityLoading
  }

  const syncIdentity = () => {
    if (!$auth?.loggedIn) {
      identity = null
      identityUserId = null
      identityLoading = null
      return
    }

    const currentId = $auth.user?.id || null
    if (identityUserId && currentId && identityUserId !== currentId) {
      identity = null
      identityUserId = null
    }

    if (identity) renderIdentity()
    loadIdentity()
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
    syncIdentity()
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
    app.router.app.$watch(() => $auth?.user?.id || null, run)
  }
}
