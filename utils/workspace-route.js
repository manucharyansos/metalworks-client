export function isWorkspaceRouteActive(path, item) {
  const current = String(path || '/')
    .replace(/^\/(hy|ru|en)(?=\/|$)/, '')
    .replace(/\/+$/, '') || '/'
  const target = item.to.replace(/\/+$/, '') || '/'
  return current === target || (!item.exact && current.startsWith(`${target}/`))
}
