// The materials the template builder offers: the company's Materials section
// (each material with the thicknesses and sheets it is stocked in), joined with
// the price list where it names the same material and thickness, which then
// prices the part at once. A price-list material missing from the section is
// offered too. No imports: tests load this file directly.

// "Սև պողպատ St37", "сев  поГпат" and "Սև-պողպատ" all read the same.
export function sameName(a, b) {
  const norm = (value) =>
    String(value || '')
      .toLocaleLowerCase()
      .replace(/[\s\-_.,()]+/g, '')
  const [x, y] = [norm(a), norm(b)]
  return Boolean(x && y) && (x === y || x.startsWith(y) || y.startsWith(x))
}

const sameThickness = (a, b) => Math.abs(Number(a) - Number(b)) < 0.005

/**
 * [{ key, name, group, thicknesses: [{ key, thickness, pricingId, sheets }] }]:
 * one entry per material, each thickness once, with the price list's id when
 * it lists it and the sheet sizes the company holds.
 */
export function materialChoices(catalog = [], pricing = []) {
  const out = []
  const used = new Set()
  for (const material of catalog || []) {
    const priced = (pricing || []).find((p) => sameName(p.name, material.name))
    if (priced) used.add(priced.id)
    const thicknesses = []
    for (const sheet of material.sheets || []) {
      const thickness = Number(sheet.thickness)
      if (!(thickness > 0)) continue
      let entry = thicknesses.find((t) => sameThickness(t.thickness, thickness))
      if (!entry) {
        const match = priced?.thicknesses.find((t) =>
          sameThickness(t.thickness, thickness)
        )
        entry = {
          key: `c${material.id}-${thickness}`,
          thickness,
          pricingId: match ? match.id : null,
          sheets: [],
        }
        thicknesses.push(entry)
      }
      if (sheet.width && sheet.length)
        entry.sheets.push({
          width: Number(sheet.width),
          length: Number(sheet.length),
        })
    }
    if (!thicknesses.length) continue
    thicknesses.sort((a, b) => a.thickness - b.thickness)
    out.push({
      key: `c${material.id}`,
      name: material.name,
      group: material.group || null,
      thicknesses,
    })
  }
  for (const material of pricing || []) {
    if (used.has(material.id)) continue
    const thicknesses = (material.thicknesses || [])
      .map((t) => ({
        key: `p${t.id}`,
        thickness: Number(t.thickness),
        pricingId: t.id,
        sheets: [],
      }))
      .filter((t) => t.thickness > 0)
      .sort((a, b) => a.thickness - b.thickness)
    if (thicknesses.length)
      out.push({
        key: `p${material.id}`,
        name: material.name,
        group: null,
        thicknesses,
      })
  }
  return out
}

// The largest sheet a choice is stocked in, as { length, width } (length ≥ width).
export function largestSheet(choice) {
  let best = null
  for (const sheet of choice?.sheets || []) {
    const [length, width] = [
      Math.max(sheet.width, sheet.length),
      Math.min(sheet.width, sheet.length),
    ]
    if (!best || length * width > best.length * best.width)
      best = { length, width }
  }
  return best
}
