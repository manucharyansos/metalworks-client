const STORAGE_KEY = 'metalworks.company.selection'

export function readCompanySelection(storage, userId, companies) {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) || 'null')
    return String(saved?.userId) === String(userId) && companies.some((c) => String(c.id) === String(saved?.companyId))
      ? saved.companyId : null
  } catch (_) { return null }
}

export function saveCompanySelection(storage, userId, companyId) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify({ userId, companyId })) } catch (_) {}
}

export function clearCompanySelection(storage) {
  try { storage.removeItem(STORAGE_KEY) } catch (_) {}
}

export function companyHome(user) {
  const role = user?.role?.name
  if (role === 'admin') return '/admin'
  if (role === 'manager') return '/manager'
  if (role === 'engineer') {
    const permissions = user.permissions || []
    if (permissions.includes('orders.view')) return '/engineer'
    if (permissions.includes('pmp.view')) return '/engineer/files'
    if (permissions.includes('orders.create')) return '/engineer/orders/create'
    return '/engineer'
  }
  return { laser: '/factory/laser', bend: '/factory/bend', powder_catting: '/factory/powder', operator: '/factory/workspace' }[role] || '/profile'
}

export function isCompanyRequest(url) {
  const path = String(url || '').replace(/^https?:\/\/[^/]+/, '').split('?')[0]
  return path.startsWith('/api/') && !/^\/api\/(login|register(?:\/|$)|registration\/companies(?:\/|$)|logout|companies(?:\/|$)|password(?:\/|$)|forgot-password|reset-password)/.test(path)
}
