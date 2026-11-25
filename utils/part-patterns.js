// Patterns a customer lays over a part: decorative or ventilation cut-outs that
// fill a rectangle or a circle with whole cells only. Every cell keeps a bridge
// of metal from the outline, the holes, the bends and the other patterns, and
// the pattern can be moved and turned. Imports only part-templates, so tests
// load this file directly.
import { samplePolygon } from '@/utils/part-templates'

const SQRT3 = Math.sqrt(3)
const TAU = Math.PI * 2
export const MAX_CELLS = 2500
// More holes than this and the 3D view would take too long to build.
export const MAX_3D_HOLES = 800

// Each kind: the cell's outline around (0, 0) and how cells sit next to each other.
export const PATTERNS = [
  { id: 'circles', layout: 'square' },
  { id: 'staggered', layout: 'hex' },
  { id: 'hexagons', layout: 'hex' },
  { id: 'squares', layout: 'square' },
  { id: 'diamonds', layout: 'diag' },
  { id: 'slots', layout: 'brick' },
  { id: 'triangles', layout: 'brick' },
  { id: 'crosses', layout: 'square' },
  { id: 'stars', layout: 'hex' },
]

export function patternById(id) {
  return PATTERNS.find((p) => p.id === id) || PATTERNS[0]
}

// The thinnest metal left between two cuts, and the smallest cut, for a thickness.
export function minBridge(thickness) {
  return Math.max(1.5, 0.8 * (Number(thickness) || 0))
}

export function minCell(thickness) {
  return Math.max(2, Number(thickness) || 0)
}

// A cell as { circle: r } or polygon points [x, y, bulge], with its box size.
function cell(kind, size) {
  const s = size
  const h = s / 2
  switch (kind) {
    case 'circles':
    case 'staggered':
      return { circle: h, w: s, h: s }
    case 'hexagons': {
      // Pointy-topped, flat to flat = size: the rows interlock as a honeycomb.
      const r = s / SQRT3
      return { points: ring(6, r, Math.PI / 6), w: s, h: 2 * r }
    }
    case 'squares':
      return {
        points: [
          [-h, -h],
          [h, -h],
          [h, h],
          [-h, h],
        ],
        w: s,
        h: s,
      }
    case 'diamonds':
      return {
        points: [
          [0, -h],
          [h, 0],
          [0, h],
          [-h, 0],
        ],
        w: s,
        h: s,
      }
    case 'slots': {
      // As wide as the size and three times as long, round at both ends.
      const half = s
      return {
        points: [
          [-half, -h, 0],
          [half, -h, 1],
          [half, h, 0],
          [-half, h, 1],
        ],
        w: 3 * s,
        h: s,
      }
    }
    case 'triangles': {
      const height = (s * SQRT3) / 2
      return {
        points: [
          [-h, -height / 3],
          [h, -height / 3],
          [0, (2 * height) / 3],
        ],
        w: s,
        h: height,
      }
    }
    case 'crosses': {
      const a = s / 6
      return {
        points: [
          [-a, -h],
          [a, -h],
          [a, -a],
          [h, -a],
          [h, a],
          [a, a],
          [a, h],
          [-a, h],
          [-a, a],
          [-h, a],
          [-h, -a],
          [-a, -a],
        ],
        w: s,
        h: s,
      }
    }
    case 'stars': {
      const points = []
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? h * 0.42 : h
        const angle = Math.PI / 2 + (Math.PI * i) / 5
        points.push([r * Math.cos(angle), r * Math.sin(angle)])
      }
      return { points, w: s, h: s }
    }
    default:
      return { circle: h, w: s, h: s }
  }
}

function ring(n, r, start) {
  return Array.from({ length: n }, (_, i) => [
    r * Math.cos(start + (TAU * i) / n),
    r * Math.sin(start + (TAU * i) / n),
  ])
}

// Steps between cells: along a row, between rows, and the shift of every other row.
function steps(layout, c, gap) {
  if (layout === 'hex') {
    const du = c.w + gap
    return { du, dv: (du * SQRT3) / 2, shift: du / 2 }
  }
  if (layout === 'diag') {
    const du = c.w + gap * Math.SQRT2
    return { du, dv: du / 2, shift: du / 2 }
  }
  if (layout === 'brick') {
    const du = c.w + gap
    return { du, dv: c.h + gap, shift: du / 2 }
  }
  return { du: c.w + gap, dv: c.h + gap, shift: 0 }
}

// A new pattern in the middle of the part, sized to it.
export function newPattern(part, kind = 'circles', thickness = 0) {
  const round = !part.outline.points
  const span = Math.min(part.width, part.height)
  const width = Math.round((round ? span : part.width) * 0.6)
  const height = Math.round((round ? span : part.height) * 0.6)
  const size = Math.min(
    40,
    Math.max(minCell(thickness) + 2, Math.round(Math.min(width, height) / 7))
  )
  return {
    kind,
    shape: round ? 'circle' : 'rect',
    cx: Math.round(part.width / 2),
    cy: Math.round(part.height / 2),
    width,
    height,
    angle: 0,
    size,
    gap: Math.ceil(Math.max(3, minBridge(thickness))),
  }
}

// The region a pattern fills, in part coordinates: the corners of its
// rectangle, or the centre and radius of its circle.
export function patternRegion(pattern) {
  const p = numbers(pattern)
  if (p.shape === 'circle')
    return { circle: { cx: p.cx, cy: p.cy, r: p.width / 2 } }
  const turn = (p.angle * Math.PI) / 180
  const place = ([u, v]) => [
    p.cx + u * Math.cos(turn) - v * Math.sin(turn),
    p.cy + u * Math.sin(turn) + v * Math.cos(turn),
  ]
  const w = p.width / 2
  const h = p.height / 2
  return {
    corners: [
      [-w, -h],
      [w, -h],
      [w, h],
      [-w, h],
    ].map(place),
  }
}

function numbers(pattern) {
  const p = {}
  for (const key of ['cx', 'cy', 'width', 'height', 'angle', 'size', 'gap'])
    p[key] = Number(pattern[key]) || 0
  return {
    ...p,
    kind: pattern.kind,
    shape: pattern.shape === 'circle' ? 'circle' : 'rect',
  }
}

// Every cell that fits inside the pattern's own region, in part coordinates;
// null when the grid would hold far more cells than a part may have.
function cells(pattern) {
  const p = numbers(pattern)
  if (p.size <= 0 || p.width <= 0 || (p.shape === 'rect' && p.height <= 0))
    return []
  const kind = patternById(p.kind)
  const c = cell(kind.id, p.size)
  const { du, dv, shift } = steps(kind.layout, c, Math.max(0, p.gap))
  const w = p.width / 2
  const h = (p.shape === 'circle' ? p.width : p.height) / 2
  const local = c.circle
    ? ring(16, c.circle, 0)
    : samplePolygon({ type: 'poly', points: c.points }, 6)
  const inRegion = (u, v) =>
    p.shape === 'circle'
      ? local.every(([x, y]) => Math.hypot(x + u, y + v) <= w + 1e-9)
      : Math.abs(u) + c.w / 2 <= w + 1e-9 && Math.abs(v) + c.h / 2 <= h + 1e-9
  const rows = Math.floor((2 * h - c.h) / dv + 1e-9) + 1
  const cols = Math.floor((2 * w - c.w) / du + 1e-9) + 1
  if (rows < 1 || cols < 1) return []
  if (rows * cols > MAX_CELLS * 4) return null
  const turn = (p.angle * Math.PI) / 180
  const [cos, sin] = [Math.cos(turn), Math.sin(turn)]
  const place = (x, y) => [p.cx + x * cos - y * sin, p.cy + x * sin + y * cos]
  const out = []
  for (let r = 0; r < rows; r++) {
    const v = (r - (rows - 1) / 2) * dv
    const odd = r % 2 === 1 && shift
    for (let k = odd ? -1 : 0; k < cols; k++) {
      const u = (k - (cols - 1) / 2) * du + (odd ? shift : 0)
      if (!inRegion(u, v)) continue
      if (c.circle) {
        const [x, y] = place(u, v)
        out.push({ type: 'circle', cx: x, cy: y, r: c.circle })
      } else {
        out.push({
          type: 'poly',
          points: c.points.map(([x, y, b = 0]) => [...place(x + u, y + v), b]),
        })
      }
    }
  }
  return out
}

// Segments and areas a cell must keep clear of, found through a coarse grid.
class Obstacles {
  constructor(size) {
    this.size = Math.max(2, size)
    this.segments = new Map()
    this.areas = new Map()
  }

  key(i, j) {
    return `${i}:${j}`
  }

  span(minX, minY, maxX, maxY, visit) {
    const g = this.size
    for (let i = Math.floor(minX / g); i <= Math.floor(maxX / g); i++)
      for (let j = Math.floor(minY / g); j <= Math.floor(maxY / g); j++)
        visit(this.key(i, j))
  }

  // A closed outline: its edges, and (when it is a hole) its inside.
  add(points, hole) {
    const box = bounds(points)
    const area = { points, box }
    for (let i = 0; i < points.length; i++) {
      const a = points[i]
      const b = points[(i + 1) % points.length]
      const seg = [a[0], a[1], b[0], b[1]]
      this.span(
        Math.min(a[0], b[0]),
        Math.min(a[1], b[1]),
        Math.max(a[0], b[0]),
        Math.max(a[1], b[1]),
        (key) => {
          if (!this.segments.has(key)) this.segments.set(key, [])
          this.segments.get(key).push(seg)
        }
      )
    }
    if (hole)
      this.span(box[0], box[1], box[2], box[3], (key) => {
        if (!this.areas.has(key)) this.areas.set(key, [])
        this.areas.get(key).push(area)
      })
  }

  // True when the polygon stays at least `margin` from every edge.
  clear(points, margin) {
    const box = bounds(points)
    const seen = new Set()
    let blocked = false
    this.span(
      box[0] - margin,
      box[1] - margin,
      box[2] + margin,
      box[3] + margin,
      (key) => {
        if (blocked) return
        for (const seg of this.segments.get(key) || []) {
          if (seen.has(seg)) continue
          seen.add(seg)
          for (let i = 0; i < points.length && !blocked; i++) {
            const a = points[i]
            const b = points[(i + 1) % points.length]
            if (
              segmentDistance(
                a[0],
                a[1],
                b[0],
                b[1],
                seg[0],
                seg[1],
                seg[2],
                seg[3]
              ) < margin
            )
              blocked = true
          }
          if (blocked) return
        }
      }
    )
    return !blocked
  }

  // Whether a point is inside one of the holes.
  inHole(x, y) {
    const g = this.size
    for (const area of this.areas.get(
      this.key(Math.floor(x / g), Math.floor(y / g))
    ) || []) {
      const [minX, minY, maxX, maxY] = area.box
      if (
        x >= minX &&
        x <= maxX &&
        y >= minY &&
        y <= maxY &&
        inside(x, y, area.points)
      )
        return true
    }
    return false
  }
}

function bounds(points) {
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const [x, y] of points) {
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }
  return [minX, minY, maxX, maxY]
}

function inside(x, y, polygon) {
  let result = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if (
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-12) + xi
    )
      result = !result
  }
  return result
}

function pointSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const length = dx * dx + dy * dy
  const t = length
    ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / length))
    : 0
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function crosses(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx)
  const d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx)
  const d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
  const d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax)
  return d1 * d2 < 0 && d3 * d4 < 0
}

function segmentDistance(ax, ay, bx, by, cx, cy, dx, dy) {
  if (crosses(ax, ay, bx, by, cx, cy, dx, dy)) return 0
  return Math.min(
    pointSegment(ax, ay, cx, cy, dx, dy),
    pointSegment(bx, by, cx, cy, dx, dy),
    pointSegment(cx, cy, ax, ay, bx, by),
    pointSegment(dx, dy, ax, ay, bx, by)
  )
}

/**
 * The part with its patterns cut in: { part, counts, issues }. Cells that do not
 * fit whole, or would leave less metal than a bridge next to the outline, a hole,
 * a bend or an earlier pattern, are left out; `counts` says how many stayed.
 */
export function layPatterns(part, patterns, thickness = 0) {
  const list = patterns || []
  if (!list.length) return { part, counts: [], issues: [] }
  const outline = samplePolygon(part.outline, 24)
  const scale = Math.max(
    4,
    ...list.map((p) => Number(p.size) + Number(p.gap) || 0)
  )
  const obstacles = new Obstacles(scale)
  obstacles.add(outline, false)
  for (const hole of part.holes) obstacles.add(samplePolygon(hole, 24), true)
  // The bend zone and a thickness either side stay whole, or the bend tears.
  const keep = Number(thickness) || part.fold?.thickness || 0
  for (const bend of part.fold?.bends || []) {
    const x0 = bend.x - bend.allowance / 2 - keep
    const x1 = bend.x + bend.allowance / 2 + keep
    obstacles.add(
      [
        [x0, -1],
        [x1, -1],
        [x1, part.height + 1],
        [x0, part.height + 1],
      ],
      true
    )
  }
  const holes = []
  const counts = []
  const issues = []
  list.forEach((pattern, index) => {
    const p = numbers(pattern)
    const margin = Math.max(p.gap, minBridge(thickness))
    if (p.size < minCell(thickness))
      issues.push({ index, key: 'patternSmall', min: minCell(thickness) })
    else if (p.gap < minBridge(thickness))
      issues.push({ index, key: 'patternBridge', min: minBridge(thickness) })
    const kept = []
    const laid = cells(pattern)
    if (laid === null) {
      counts.push(0)
      issues.push({ index, key: 'tooManyHoles' })
      return
    }
    for (const shape of laid) {
      const points = samplePolygon(shape, 6)
      if (!obstacles.clear(points, margin)) continue
      const [x, y] = points[0]
      if (!inside(x, y, outline) || obstacles.inHole(x, y)) continue
      kept.push(shape)
    }
    // Later patterns keep clear of this one too.
    for (const shape of kept) obstacles.add(samplePolygon(shape, 6), true)
    counts.push(kept.length)
    if (!kept.length) issues.push({ index, key: 'patternEmpty' })
    holes.push(...kept)
  })
  if (part.holes.length + holes.length > MAX_CELLS)
    issues.push({ key: 'tooManyHoles' })
  return { part: { ...part, holes: [...part.holes, ...holes] }, counts, issues }
}
