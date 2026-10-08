export default ({ $axios, store }, inject) => {
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

  const fileSuffix = (download) => {
    const params = []
    const companyId = store?.state?.workspace?.company?.id
    if (companyId) params.push(`company_id=${encodeURIComponent(companyId)}`)
    if (download) params.push('download=1')
    return params.length ? `?${params.join('&')}` : ''
  }
  const getFileUrl = (filePath, download = false) => {
    const encodedPath = encodePath(filePath)
    if (!encodedPath) return null

    const suffix = fileSuffix(download)
    return `${baseURL}/api/secure-files/path/${encodedPath}${suffix}`
  }

  const getPmpFileUrl = (fileOrId, download = false) => {
    const id = typeof fileOrId === 'object' ? fileOrId?.id : fileOrId
    if (!id) {
      const path = typeof fileOrId === 'object' ? fileOrId?.path : null
      return getFileUrl(path, download)
    }

    const suffix = fileSuffix(download)
    return `${baseURL}/api/secure-files/pmp/${encodeURIComponent(id)}${suffix}`
  }

  const getOrderFileUrl = (fileOrId, download = false) => {
    const id = typeof fileOrId === 'object' ? fileOrId?.id : fileOrId
    if (!id) {
      const path = typeof fileOrId === 'object' ? fileOrId?.path : null
      return getFileUrl(path, download)
    }

    const suffix = fileSuffix(download)
    return `${baseURL}/api/secure-files/order/${encodeURIComponent(id)}${suffix}`
  }

  inject('getFileUrl', getFileUrl)
  inject('getPmpFileUrl', getPmpFileUrl)
  inject('getOrderFileUrl', getOrderFileUrl)
}
