export default ({ $axios }, inject) => {
  const baseURL = String($axios.defaults.baseURL || '').replace(/\/+$/, '')

  const encodePath = (filePath) => {
    if (!filePath) return null

    const normalizedPath = String(filePath)
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')

    return normalizedPath
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/')
  }

  const getFileUrl = (filePath, download = false) => {
    const encodedPath = encodePath(filePath)
    if (!encodedPath) return null

    const suffix = download ? '?download=1' : ''
    return `${baseURL}/api/secure-files/path/${encodedPath}${suffix}`
  }

  const getPmpFileUrl = (fileOrId, download = false) => {
    const id = typeof fileOrId === 'object' ? fileOrId?.id : fileOrId
    if (!id) {
      const path = typeof fileOrId === 'object' ? fileOrId?.path : null
      return getFileUrl(path, download)
    }

    const suffix = download ? '?download=1' : ''
    return `${baseURL}/api/secure-files/pmp/${encodeURIComponent(id)}${suffix}`
  }

  const getOrderFileUrl = (fileOrId, download = false) => {
    const id = typeof fileOrId === 'object' ? fileOrId?.id : fileOrId
    if (!id) {
      const path = typeof fileOrId === 'object' ? fileOrId?.path : null
      return getFileUrl(path, download)
    }

    const suffix = download ? '?download=1' : ''
    return `${baseURL}/api/secure-files/order/${encodeURIComponent(id)}${suffix}`
  }

  inject('getFileUrl', getFileUrl)
  inject('getPmpFileUrl', getPmpFileUrl)
  inject('getOrderFileUrl', getOrderFileUrl)
}
