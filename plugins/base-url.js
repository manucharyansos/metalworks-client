const PRODUCTION_API_BASE_URL = 'https://api.metalworks.am'

export default ({ $axios, $config }, inject) => {
  const configured =
    $config?.baseURL ||
    $config?.apiBase ||
    $axios?.defaults?.baseURL ||
    process.env.API_BASE_URL ||
    process.env.BASE_URL ||
    PRODUCTION_API_BASE_URL

  const isBrowserLocal =
    process.client && ['localhost', '127.0.0.1'].includes(window.location.hostname)
  const pointsToLocalApi = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(
    String(configured)
  )

  const baseUrl =
    process.client && !isBrowserLocal && pointsToLocalApi
      ? PRODUCTION_API_BASE_URL
      : configured

  if ($axios?.setBaseURL && process.client && !isBrowserLocal && pointsToLocalApi) {
    $axios.setBaseURL(PRODUCTION_API_BASE_URL)
  }

  inject('baseUrl', String(baseUrl).replace(/\/+$/, ''))
}
