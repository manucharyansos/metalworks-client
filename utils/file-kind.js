// What kind of production file a name is, for badges, card summaries and the
// file a workshop most likely needs first.
const KINDS = [
  // Machine programs: laser (DXF) and press brake (Delem DLD).
  { kind: 'program', rank: 0, extensions: ['dxf', 'dld'] },
  { kind: 'drawing', rank: 1, extensions: ['pdf'] },
  {
    kind: 'image',
    rank: 2,
    extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif'],
  },
  {
    kind: 'model',
    rank: 3,
    extensions: ['step', 'stp', 'igs', 'iges', 'stl', 'obj'],
  },
  // CAD files whose saved view can be shown.
  {
    kind: 'cad',
    rank: 4,
    extensions: [
      'sldprt',
      'sldasm',
      'slddrw',
      'dwg',
      'ipt',
      'iam',
      'par',
      'psm',
      'dft',
    ],
  },
  {
    kind: 'text',
    rank: 5,
    extensions: ['txt', 'md', 'csv', 'log', 'json', 'xml', 'yaml', 'yml'],
  },
]

export function fileExtensionOf(name) {
  const match = String(name || '')
    .toLowerCase()
    .match(/\.([a-z0-9_]+)$/)
  return match ? match[1] : ''
}

function kindOf(name) {
  const extension = fileExtensionOf(name)
  return KINDS.find((entry) => entry.extensions.includes(extension)) || null
}

export function fileKind(name) {
  return kindOf(name)?.kind || 'other'
}

// The file to show first: machine programs, then drawings, images, 3D models
// and CAD views, in list order within each kind. Files the operator may not
// open are skipped.
export function preferredPreviewFile(files) {
  let best = null
  let bestRank = Infinity
  for (const file of files || []) {
    if (!file || file.operator_download_restricted) continue
    const entry = kindOf(file.original_name || file.path)
    if (entry && entry.rank < bestRank) {
      best = file
      bestRank = entry.rank
    }
  }
  return best
}

// "DXF 3", "PDF 1" … most frequent first, for a compact summary on cards.
export function fileTypeSummary(files, limit = 3) {
  const counts = new Map()
  for (const file of files || []) {
    const extension = fileExtensionOf(file?.original_name || file?.path)
    const label = extension ? extension.toUpperCase() : '—'
    counts.set(label, (counts.get(label) || 0) + 1)
  }
  const rows = [...counts.entries()]
    .map(([label, count]) => ({ label, count, kind: fileKind(`x.${label}`) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  return {
    shown: rows.slice(0, limit),
    more: rows.slice(limit).reduce((sum, row) => sum + row.count, 0),
  }
}
