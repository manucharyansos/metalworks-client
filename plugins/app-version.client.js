import {
  VERSION_CHECK_INTERVAL,
  fetchLatestBuild,
  markReloaded,
  needsReload,
  readReloaded,
  versionUrl,
} from '~/utils/app-version'

// Brings tabs that stay open across a deploy onto the new build.
export default ({ app, $config, isDev }) => {
  const current = $config?.buildId
  // The dev server has no version.json; checking there only logs 404s.
  if (!current || isDev) return
  const url = versionUrl(app.router?.options?.base)
  const storage = window.sessionStorage
  let latest = current
  let notice = null
  let checking = false

  const outdated = () => needsReload(current, latest, readReloaded(storage))
  const reload = () => {
    markReloaded(storage, latest)
    window.location.reload()
  }
  const text = (key, fallback) =>
    app.i18n?.te?.(key) ? app.i18n.t(key) : fallback
  const showNotice = () => {
    if (notice || !document.body) return
    notice = document.createElement('div')
    notice.setAttribute('role', 'status')
    notice.setAttribute('data-app-update', '')
    notice.style.cssText =
      'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2000;display:flex;align-items:center;gap:12px;max-width:calc(100vw - 32px);padding:10px 10px 10px 16px;border-radius:9999px;background:#0f172a;color:#fff;font:500 14px/1.3 system-ui,sans-serif;box-shadow:0 10px 30px rgba(15,23,42,.3)'
    const label = document.createElement('span')
    label.textContent = text(
      'app_update.available',
      'A new version of the site is available.'
    )
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = text('app_update.reload', 'Refresh')
    button.style.cssText =
      'flex-shrink:0;border:0;border-radius:9999px;padding:7px 14px;background:#fff;color:#0f172a;font-weight:700;cursor:pointer'
    button.addEventListener('click', reload)
    notice.append(label, button)
    document.body.appendChild(notice)
  }
  const check = async () => {
    if (checking || document.hidden) return
    checking = true
    const found = await fetchLatestBuild(window.fetch.bind(window), url)
    checking = false
    if (found) latest = found
    if (outdated()) showNotice()
  }

  // Leaving a page is a safe moment: its unsaved-changes guard has run.
  app.router?.afterEach(() => {
    if (outdated()) reload()
  })
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) check()
  })
  window.setInterval(check, VERSION_CHECK_INTERVAL)
  check()
}
