// Each build writes its id to version.json. A tab that is still running an
// older build reloads on its next page change, or when the user clicks
// Refresh in the notice, so a deploy reaches open tabs without Ctrl+F5.

export const VERSION_CHECK_INTERVAL = 5 * 60 * 1000
const RELOADED_KEY = 'metalworks.version.reloaded'

export function versionUrl(base = '/') {
  return `${String(base || '/').replace(/\/?$/, '/')}version.json`
}

// True when a newer build is out and this tab has not reloaded for it yet
// (a cached old page must not make it reload over and over).
export function needsReload(current, latest, reloadedFor) {
  return Boolean(
    current &&
      latest &&
      String(latest) !== String(current) &&
      String(reloadedFor || '') !== String(latest)
  )
}

export function readReloaded(storage) {
  try {
    return storage?.getItem(RELOADED_KEY) || ''
  } catch (_) {
    return ''
  }
}

export function markReloaded(storage, id) {
  try {
    storage?.setItem(RELOADED_KEY, String(id))
  } catch (_) {}
}

// The id of the deployed build, or null when it cannot be read.
export async function fetchLatestBuild(fetcher, url, now = Date.now()) {
  try {
    const response = await fetcher(`${url}?t=${now}`, {
      cache: 'no-store',
      credentials: 'omit',
    })
    if (!response?.ok) return null
    const data = await response.json()
    return data && typeof data.buildId === 'string' && data.buildId
      ? data.buildId
      : null
  } catch (_) {
    return null
  }
}
