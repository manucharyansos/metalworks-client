const PRODUCTION_API_BASE_URL = 'https://api.metalworks.am'

export function isLocalBrowserHost(hostname) {
  if (!hostname) return false
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return true
  }

  return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(hostname)
}

export function localApiFor(hostname, configured = '') {
  const safeHost = hostname === '::1' ? '[::1]' : hostname
  // A local API configured at build time (API_BASE_URL=http://localhost:8010)
  // keeps its port and path; only the host follows the browser, so the app
  // still works when opened from another device on the LAN.
  try {
    const url = new URL(configured)
    if (isLocalBrowserHost(url.hostname.replace(/^\[|\]$/g, ''))) {
      url.hostname = safeHost
      return url.toString().replace(/\/+$/, '')
    }
  } catch (e) {}
  return `http://${safeHost}:8000`
}

export default ({ $axios, $config }, inject) => {
  const configured = String(
    $config?.baseURL ||
      $config?.apiBase ||
      $axios?.defaults?.baseURL ||
      process.env.API_BASE_URL ||
      process.env.BASE_URL ||
      PRODUCTION_API_BASE_URL
  ).replace(/\/+$/, '')

  let baseUrl = configured

  if (process.client) {
    const hostname = window.location.hostname
    baseUrl = isLocalBrowserHost(hostname)
      ? localApiFor(hostname, configured)
      : PRODUCTION_API_BASE_URL
  }

  if ($axios?.setBaseURL) {
    $axios.setBaseURL(baseUrl)
  }

  inject('baseUrl', baseUrl)
}
