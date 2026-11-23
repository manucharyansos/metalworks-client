// Measures a flat (laser) DXF the way the server prices it (app/Support/DxfMeasure.php):
// cut length, separate contours (pierces), bend lines, bounding size and the net
// area (outer contours minus holes), all in millimetres. Keep the two in step;
// tests/dxf-measure.test.cjs and tests/Unit/DxfMeasureTest.php share their cases.
// No imports: tests load this file directly.

const MAX_POINTS = 3000000
const MAX_DEPTH = 8
const JOIN = 0.05
const BEND_LAYER = /bend|ծռ|կռ|гиб/iu
const UNITS = {
  0: 1,
  1: 25.4,
  2: 304.8,
  4: 1,
  5: 10,
  6: 1000,
  8: 0.0000254,
  9: 0.0254,
  10: 914.4,
  14: 100,
}

function pairs(text) {
  const lines = String(text).split(/\r\n|\n|\r/)
  const out = []
  for (let i = 0; i < lines.length - 1; i += 2) {
    const code = lines[i].trim()
    if (code === '' || !/^-?\d+$/.test(code))
      throw new Error('The file is not an ASCII DXF.')
    out.push([Number(code), lines[i + 1].trim()])
  }
  return out
}

function records(list) {
  const result = []
  let current = null
  for (const [code, value] of list) {
    if (code === 0) {
      if (
        current &&
        current.type === 'POLYLINE' &&
        (value === 'VERTEX' || value === 'SEQEND')
      ) {
        if (value === 'VERTEX') current.vertices.push([])
        else {
          result.push(current)
          current = null
        }
        continue
      }
      if (current) result.push(current)
      current = { type: value, data: {}, pairs: [], vertices: [] }
      continue
    }
    if (!current) continue
    if (current.type === 'POLYLINE' && current.vertices.length) {
      current.vertices[current.vertices.length - 1].push([code, value])
      continue
    }
    ;(current.data[code] = current.data[code] || []).push(value)
    current.pairs.push([code, value])
  }
  if (current) result.push(current)
  return result
}

function sections(list) {
  const header = {}
  const blocks = {}
  let entities = []
  for (let i = 0; i < list.length; i++) {
    if (
      !(list[i][0] === 0 && list[i][1] === 'SECTION') ||
      list[i + 1]?.[0] !== 2
    )
      continue
    const name = list[i + 1][1]
    i += 2
    const start = i
    while (i < list.length && !(list[i][0] === 0 && list[i][1] === 'ENDSEC'))
      i++
    const body = list.slice(start, i)
    if (name === 'HEADER') {
      for (let j = 0; j < body.length; j++)
        if (body[j][0] === 9 && body[j + 1]) header[body[j][1]] = body[j + 1][1]
    } else if (name === 'BLOCKS') {
      let current = null
      for (const record of records(body)) {
        if (record.type === 'BLOCK') {
          current = record.data[2]?.[0] ?? record.data[3]?.[0] ?? null
          if (current !== null)
            blocks[current] = {
              base: [
                Number(record.data[10]?.[0] || 0),
                Number(record.data[20]?.[0] || 0),
              ],
              entities: [],
            }
        } else if (record.type === 'ENDBLK') current = null
        else if (current !== null) blocks[current].entities.push(record)
      }
    } else if (name === 'ENTITIES') entities = records(body)
  }
  return [header, blocks, entities]
}

function arc(cx, cy, r, start, end) {
  const steps = Math.max(8, Math.ceil(((end - start) / (2 * Math.PI)) * 180))
  const points = []
  for (let i = 0; i <= steps; i++) {
    const a = start + ((end - start) * i) / steps
    points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return points
}

function polyline(vertices, closed, flip) {
  if (vertices.length < 2) return null
  const points = [[vertices[0][0], vertices[0][1]]]
  const count = vertices.length
  const segments = closed ? count : count - 1
  for (let i = 0; i < segments; i++) {
    const [x1, y1, bulge] = vertices[i]
    const [x2, y2] = vertices[(i + 1) % count]
    if (Math.abs(bulge) < 1e-9) {
      points.push([x2, y2])
      continue
    }
    const chord = Math.hypot(x2 - x1, y2 - y1)
    if (chord < 1e-12) continue
    const theta = 4 * Math.atan(bulge)
    const radius = chord / (2 * Math.sin(Math.abs(theta) / 2))
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    const offset = radius * Math.cos(Math.abs(theta) / 2) * (bulge > 0 ? 1 : -1)
    const cx = mx - (offset * (y2 - y1)) / chord
    const cy = my + (offset * (x2 - x1)) / chord
    const a1 = Math.atan2(y1 - cy, x1 - cx)
    const steps = Math.max(
      4,
      Math.ceil((Math.abs(theta) / (2 * Math.PI)) * 180)
    )
    for (let s = 1; s <= steps; s++) {
      const a = a1 + (theta * s) / steps
      points.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)])
    }
  }
  return { points: flip(points), closed: Boolean(closed) }
}

function spline(record) {
  const controls = []
  const fits = []
  const knots = []
  let weights = []
  for (const [code, value] of record.pairs) {
    if (code === 10) controls.push([Number(value), 0])
    else if (code === 20 && controls.length)
      controls[controls.length - 1][1] = Number(value)
    else if (code === 11) fits.push([Number(value), 0])
    else if (code === 21 && fits.length)
      fits[fits.length - 1][1] = Number(value)
    else if (code === 40) knots.push(Number(value))
    else if (code === 41) weights.push(Number(value))
  }
  const closed = (Number(record.data[70]?.[0] || 0) & 1) === 1
  const degree = Number(record.data[71]?.[0] ?? 3)
  const n = controls.length
  if (n < 2 || knots.length !== n + degree + 1 || degree < 1) {
    if (fits.length >= 2) return { points: fits, closed }
    return n >= 2 ? { points: controls, closed } : null
  }
  if (weights.length !== n) weights = new Array(n).fill(1)
  const low = knots[degree]
  const high = knots[n]
  const steps = Math.max(32, n * 16)
  const points = []
  for (let i = 0; i <= steps; i++) {
    const t = low + ((high - low) * i) / steps
    let k = degree
    while (k < n - 1 && t >= knots[k + 1]) k++
    const d = []
    for (let j = 0; j <= degree; j++) {
      const c = controls[k - degree + j]
      const w = weights[k - degree + j]
      d[j] = [c[0] * w, c[1] * w, w]
    }
    for (let r = 1; r <= degree; r++) {
      for (let j = degree; j >= r; j--) {
        const left = knots[j + k - degree]
        const right = knots[j + 1 + k - r]
        const alpha = right - left === 0 ? 0 : (t - left) / (right - left)
        for (let c = 0; c < 3; c++)
          d[j][c] = (1 - alpha) * d[j - 1][c] + alpha * d[j][c]
      }
    }
    const w = d[degree][2] || 1
    points.push([d[degree][0] / w, d[degree][1] / w])
  }
  return { points, closed }
}

function shape(record) {
  const d = record.data
  const f = (code, fallback = 0) =>
    d[code]?.[0] !== undefined ? Number(d[code][0]) : fallback
  const mirror = f(230, 1) < 0
  const flip = (points) => (mirror ? points.map((p) => [-p[0], p[1]]) : points)
  switch (record.type) {
    case 'LINE':
      return {
        points: [
          [f(10), f(20)],
          [f(11), f(21)],
        ],
        closed: false,
      }
    case 'CIRCLE':
      return {
        points: flip(arc(f(10), f(20), f(40), 0, 2 * Math.PI)),
        closed: true,
      }
    case 'ARC': {
      const start = (f(50) * Math.PI) / 180
      let end = (f(51) * Math.PI) / 180
      if (end <= start) end += 2 * Math.PI
      return {
        points: flip(arc(f(10), f(20), f(40), start, end)),
        closed: false,
      }
    }
    case 'LWPOLYLINE': {
      const vertices = []
      for (const [code, value] of record.pairs) {
        if (code === 10) vertices.push([Number(value), 0, 0])
        else if (code === 20 && vertices.length)
          vertices[vertices.length - 1][1] = Number(value)
        else if (code === 42 && vertices.length)
          vertices[vertices.length - 1][2] = Number(value)
      }
      return polyline(vertices, f(70) & 1, flip)
    }
    case 'POLYLINE': {
      const flags = f(70)
      if (flags & (16 | 64)) return null
      const vertices = record.vertices.map((vertex) => {
        const v = [0, 0, 0]
        for (const [code, value] of vertex) {
          if (code === 10) v[0] = Number(value)
          else if (code === 20) v[1] = Number(value)
          else if (code === 42) v[2] = Number(value)
        }
        return v
      })
      return polyline(vertices, flags & 1, flip)
    }
    case 'ELLIPSE': {
      const [cx, cy, mx, my] = [f(10), f(20), f(11), f(21)]
      const ratio = f(40, 1)
      const start = f(41)
      let end = f(42, 2 * Math.PI)
      if (end <= start) end += 2 * Math.PI
      const full = Math.abs(end - start - 2 * Math.PI) < 1e-6
      const steps = Math.max(
        16,
        Math.ceil(((end - start) / (2 * Math.PI)) * 180)
      )
      const side = mirror ? -1 : 1
      const points = []
      for (let i = 0; i <= steps; i++) {
        const t = start + ((end - start) * i) / steps
        points.push([
          cx + mx * Math.cos(t) - side * my * ratio * Math.sin(t),
          cy + my * Math.cos(t) + side * mx * ratio * Math.sin(t),
        ])
      }
      return { points, closed: full }
    }
    case 'SPLINE':
      return spline(record)
    default:
      return null
  }
}

const apply = (m, x, y) => [
  m[0] * x + m[1] * y + m[4],
  m[2] * x + m[3] * y + m[5],
]

const compose = (o, i) => [
  o[0] * i[0] + o[1] * i[2],
  o[0] * i[1] + o[1] * i[3],
  o[2] * i[0] + o[3] * i[2],
  o[2] * i[1] + o[3] * i[3],
  o[0] * i[4] + o[1] * i[5] + o[4],
  o[2] * i[4] + o[3] * i[5] + o[5],
]

function contours(paths) {
  const loops = []
  let pierces = 0
  const parent = new Map()
  const cells = new Map()
  const find = (key) => {
    while (parent.get(key) !== key) {
      parent.set(key, parent.get(parent.get(key)))
      key = parent.get(key)
    }
    return key
  }
  const node = ([x, y]) => {
    const cx = Math.floor(x / JOIN)
    const cy = Math.floor(y / JOIN)
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (const [px, py, key] of cells.get(`${cx + dx}:${cy + dy}`) || [])
          if (Math.hypot(px - x, py - y) <= JOIN) return key
    const key = `${cx}:${cy}:${parent.size}`
    const cell = `${cx}:${cy}`
    if (!cells.has(cell)) cells.set(cell, [])
    cells.get(cell).push([x, y, key])
    parent.set(key, key)
    return key
  }
  const open = []
  paths.forEach((path, index) => {
    const points = path.points
    const first = points[0]
    const last = points[points.length - 1]
    if (
      path.closed ||
      Math.hypot(first[0] - last[0], first[1] - last[1]) <= JOIN
    ) {
      pierces++
      loops.push(points)
      return
    }
    const a = node(first)
    const b = node(last)
    parent.set(find(a), find(b))
    open.push([index, a, b])
  })
  const groups = new Map()
  for (const member of open) {
    const root = find(member[1])
    if (!groups.has(root)) groups.set(root, [])
    groups.get(root).push(member)
  }
  for (const members of groups.values()) {
    pierces++
    const loop = walk(members, paths)
    if (loop) loops.push(loop)
  }
  return [pierces, loops]
}

function walk(members, paths) {
  const ends = new Map()
  members.forEach(([, a, b], position) => {
    for (const key of [a, b]) {
      if (!ends.has(key)) ends.set(key, [])
      ends.get(key).push(position)
    }
  })
  for (const list of ends.values()) if (list.length !== 2) return null
  const used = new Set([0])
  const [index, start, next] = members[0]
  const points = [...paths[index].points]
  let at = next
  while (used.size < members.length) {
    const position = ends.get(at).find((candidate) => !used.has(candidate))
    if (position === undefined) return null
    used.add(position)
    const [i, a, b] = members[position]
    let piece = paths[i].points
    if (a !== at) piece = [...piece].reverse()
    points.push(...piece.slice(1))
    at = a === at ? b : a
  }
  return at === start ? points : null
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

function netArea(loops) {
  if (!loops.length || loops.length > 5000) return null
  const shapes = loops
    .map((points) => {
      let area = 0
      for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i]
        const [x2, y2] = points[(i + 1) % points.length]
        area += x1 * y2 - x2 * y1
      }
      return { points, area: Math.abs(area) / 2 }
    })
    .sort((a, b) => b.area - a.area)
  let total = 0
  shapes.forEach((shape, i) => {
    let depth = 0
    const [x, y] = shape.points[0]
    for (let j = 0; j < i; j++) if (inside(x, y, shapes[j].points)) depth++
    total += depth % 2 === 0 ? shape.area : -shape.area
  })
  return Math.round(Math.max(0, total) * 10) / 10
}

const round1 = (value) => Math.round(value * 10) / 10

/** { cutLengthMm, pierces, bends, widthMm, heightMm, areaMm2 } for an ASCII DXF text. */
export function measureDxf(text) {
  if (String(text).startsWith('AutoCAD Binary DXF'))
    throw new Error('Binary DXF is not supported.')
  const [header, blocks, entities] = sections(pairs(text))
  const scale = UNITS[Number(header.$INSUNITS || 0)] ?? 1
  let total = 0
  const expand = (list, matrix, depth) => {
    const paths = []
    for (const record of list) {
      const layer = String(record.data[8]?.[0] ?? '0')
      if (layer.toUpperCase() === 'DEFPOINTS') continue
      if (record.type === 'INSERT') {
        const name = record.data[2]?.[0]
        const block = name !== undefined && blocks[name]
        if (depth >= MAX_DEPTH || !block) continue
        const sx = Number(record.data[41]?.[0] ?? 1) || 1
        const sy = Number(record.data[42]?.[0] ?? 1) || 1
        const angle = (Number(record.data[50]?.[0] || 0) * Math.PI) / 180
        const [cos, sin] = [Math.cos(angle), Math.sin(angle)]
        const local = [cos * sx, -sin * sy, sin * sx, cos * sy, 0, 0]
        local[4] =
          Number(record.data[10]?.[0] || 0) -
          (local[0] * block.base[0] + local[1] * block.base[1])
        local[5] =
          Number(record.data[20]?.[0] || 0) -
          (local[2] * block.base[0] + local[3] * block.base[1])
        paths.push(...expand(block.entities, compose(matrix, local), depth + 1))
        continue
      }
      const found = shape(record)
      if (!found) continue
      total += found.points.length
      if (total > MAX_POINTS)
        throw new Error('The DXF is too detailed to measure.')
      paths.push({
        points: found.points.map(([x, y]) => {
          const [px, py] = apply(matrix, x, y)
          return [px * scale, py * scale]
        }),
        closed: found.closed,
        bend: BEND_LAYER.test(layer),
      })
    }
    return paths
  }
  const all = expand(entities, [1, 0, 0, 1, 0, 0], 0)
  const paths = all.filter((path) => !path.bend)
  if (!paths.length) throw new Error('The DXF has no cut contours.')
  let length = 0
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const { points } of paths) {
    for (let i = 1; i < points.length; i++)
      length += Math.hypot(
        points[i][0] - points[i - 1][0],
        points[i][1] - points[i - 1][1]
      )
    for (const [x, y] of points) {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }
  const [pierces, loops] = contours(paths)
  return {
    cutLengthMm: round1(length),
    pierces,
    bends: all.length - paths.length,
    widthMm: round1(maxX - minX),
    heightMm: round1(maxY - minY),
    areaMm2: netArea(loops),
  }
}
