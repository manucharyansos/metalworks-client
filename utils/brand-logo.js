export function resolveBrandLogo(brand, base, apiBase, fallbackLogo) {
  const metalworks = brand?.slug === 'metalworks' || String(brand?.id) === 'metalworks'
  const logo = brand?.logo
  if ((!logo || logo === 'logo.png') && metalworks) return fallbackLogo
  if (!logo) return null
  if (/^https?:\/\//i.test(logo)) return logo
  if (logo.startsWith('/api/')) return `${String(apiBase || '').replace(/\/+$/, '')}${logo}`
  const prefix = String(base || '/').replace(/\/?$/, '/')
  if (logo.startsWith(prefix)) return logo
  return `${prefix}${logo.replace(/^\/+/, '')}`
}
