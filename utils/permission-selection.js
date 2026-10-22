// Follow the server's dependency graph in both directions. Revoking a lookup
// also revokes actions that need it, so saving cannot silently grant it again.
export function togglePermissionSelection(
  permissions,
  selectedIds,
  dependencies,
  permissionId
) {
  const selected = new Set(selectedIds.map(Number))
  const permission = permissions.find(
    (item) => Number(item.id) === Number(permissionId)
  )
  if (!permission) return Array.from(selected)

  const bySlug = new Map(
    permissions.map((item) => [item.slug, Number(item.id)])
  )
  const enabling = !selected.has(Number(permission.id))
  const dependents = {}
  Object.entries(dependencies).forEach(([slug, required]) => {
    required.forEach((dependency) => {
      if (!dependents[dependency]) dependents[dependency] = []
      dependents[dependency].push(slug)
    })
  })

  const graph = enabling ? dependencies : dependents
  const pending = [permission.slug]
  const visited = new Set()
  while (pending.length) {
    const slug = pending.pop()
    if (visited.has(slug) || !bySlug.has(slug)) continue
    visited.add(slug)
    if (enabling) selected.add(bySlug.get(slug))
    else selected.delete(bySlug.get(slug))
    pending.push(...(graph[slug] || []))
  }

  return Array.from(selected)
}
