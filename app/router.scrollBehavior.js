export default function scrollBehavior(to, from, savedPosition) {
  if (savedPosition) return savedPosition

  const baseName = (n) => (n || '').replace(/___\w+$/, '')
  const stripHash = (p) => (p || '').split('#')[0]

  if (baseName(to.name) && baseName(to.name) === baseName(from.name)) {
    return false
  }

  if (stripHash(to.path) === stripHash(from.path)) {
    return false
  }
  return { x: 0, y: 0 }
}
