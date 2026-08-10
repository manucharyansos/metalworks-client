export default ({ $axios }, inject) => {
  const getFileUrl = (filePath) => {
    if (!filePath) return null

    const baseURL = String($axios.defaults.baseURL || '').replace(/\/+$/, '')
    const normalizedPath = String(filePath)
      .replace(/\\/g, '/')
      .replace(/^\/+/, '')
    const encodedPath = normalizedPath
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/')

    return `${baseURL}/api/secure-files/path/${encodedPath}`
  }

  inject('getFileUrl', getFileUrl)
}
