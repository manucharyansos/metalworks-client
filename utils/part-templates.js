// Ready-made parts a customer sizes instead of uploading a drawing: each
// template turns its dimensions (mm) into cut geometry, which becomes an R12
// ASCII DXF for the request (measured and priced like any uploaded DXF) and an
// SVG preview. Bent templates add bend lines on a BEND layer, which the
// measurer counts as bends. No imports: tests load this file directly.

const BULGE_90 = Math.tan(Math.PI / 8) // a quarter circle, counter-clockwise
const TAU = Math.PI * 2
// Inner bend radius ≈ thickness and the neutral axis at 40 % of the thickness:
// the usual press-brake estimate; the engineer confirms the flat pattern.
const K_FACTOR = 0.4

// The largest sheet the laser takes, mm.
export const SHEET = { length: 3000, width: 1500 }
// Dimensions that are counts, not millimetres.
export const COUNTS = ['bolts', 'holes', 'teeth', 'sides', 'points']
// Every key problem() can return; the copy has a text for each.
export const PROBLEMS = [
  'range',
  'holesFit',
  'holesEdge',
  'centerFit',
  'slotLength',
  'pitchSmall',
  'tooManyHoles',
  'borderFit',
  'innerFit',
  'boltsFit',
  'boltsSpacing',
  'holesWidth',
  'lengthShort',
  'holesSpacing',
  'chamferFit',
  'legFit',
  'bendShort',
  'holesBend',
  'boreFit',
  'archHeight',
  'sheetSize',
]

const poly = (points) => ({ type: 'poly', points: clean(points) })
const circle = (cx, cy, d) => ({ type: 'circle', cx, cy, r: d / 2 })
const line = (x1, y1, x2, y2) => ({ x1, y1, x2, y2 })

// Drops repeated vertices (a full round end makes two corners meet).
function clean(points) {
  const out = []
  for (const [x, y, b = 0] of points) {
    const last = out[out.length - 1]
    if (last && Math.hypot(last[0] - x, last[1] - y) < 1e-9) last[2] = b
    else out.push([x, y, b])
  }
  const first = out[0]
  const last = out[out.length - 1]
  if (
    out.length > 1 &&
    Math.hypot(first[0] - last[0], first[1] - last[1]) < 1e-9
  ) {
    first[2] = last[2] || first[2]
    out.pop()
  }
  return out
}

export function roundedRect(x, y, w, h, r = 0) {
  const k = Math.max(0, Math.min(r, w / 2, h / 2))
  if (!k)
    return poly([
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ])
  return poly([
    [x + k, y, 0],
    [x + w - k, y, BULGE_90],
    [x + w, y + k, 0],
    [x + w, y + h - k, BULGE_90],
    [x + w - k, y + h, 0],
    [x + k, y + h, BULGE_90],
    [x, y + h - k, 0],
    [x, y + k, BULGE_90],
  ])
}

// A horizontal slot (stadium) of total length and width, centred on (cx, cy).
export function slot(cx, cy, length, width) {
  const r = width / 2
  const half = length / 2 - r
  if (half <= 1e-9) return circle(cx, cy, width)
  return poly([
    [cx - half, cy - r, 0],
    [cx + half, cy - r, 1],
    [cx + half, cy + r, 0],
    [cx - half, cy + r, 1],
  ])
}

function regular(cx, cy, n, radius, start) {
  const points = []
  for (let i = 0; i < n; i++) {
    const a = start + (TAU * i) / n
    points.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)])
  }
  return poly(points)
}

function boltCircle(cx, cy, pcd, count, d, start = Math.PI / 2) {
  return Array.from({ length: count }, (_, i) => {
    const a = start + (TAU * i) / count
    return circle(cx + (pcd / 2) * Math.cos(a), cy + (pcd / 2) * Math.sin(a), d)
  })
}

const bendAllowance = (thickness) =>
  (Math.PI / 2) * (thickness + K_FACTOR * thickness)

// Involute spur gear: tip, flanks, root, one tooth after another, counter-clockwise.
function gear(cx, cy, module, teeth) {
  const alpha = (20 * Math.PI) / 180
  const rp = (module * teeth) / 2
  const ra = rp + module
  const rf = rp - 1.25 * module
  const rb = rp * Math.cos(alpha)
  const inv = (a) => Math.tan(a) - a
  const half = Math.PI / (2 * teeth) + inv(alpha)
  const beta = (r) => half - inv(Math.acos(Math.min(1, rb / Math.max(r, rb))))
  const start = Math.max(rf, rb)
  const at = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  const points = []
  const steps = 8
  for (let t = 0; t < teeth; t++) {
    const c = (TAU * t) / teeth
    const gap = Math.PI / teeth
    for (let i = 0; i <= 3; i++)
      points.push(at(rf, c - gap + ((gap - beta(start)) * i) / 3))
    if (rf < rb) points.push(at(rb, c - beta(rb)))
    for (let i = 1; i <= steps; i++) {
      const r = start + ((ra - start) * i) / steps
      points.push(at(r, c - beta(r)))
    }
    for (let i = 1; i < 3; i++)
      points.push(at(ra, c - beta(ra) + (2 * beta(ra) * i) / 3))
    for (let i = steps; i >= 1; i--) {
      const r = start + ((ra - start) * i) / steps
      points.push(at(r, c + beta(r)))
    }
    if (rf < rb) points.push(at(rb, c + beta(rb)))
    for (let i = 0; i < 3; i++)
      points.push(at(rf, c + beta(start) + ((gap - beta(start)) * i) / 3))
  }
  return { outline: poly(points), root: rf, tip: ra }
}

// Each template: dimensions with limits, a check for what limits cannot say,
// and the geometry. Shapes are centred or start at the origin, in mm.
export const TEMPLATES = [
  {
    id: 'rect-plate',
    category: 'plates',
    params: [
      ['width', 200, 10, 3000],
      ['height', 100, 10, 1500],
      ['radius', 0, 0, 500],
      ['holeD', 10, 0, 200],
      ['inset', 15, 3, 500],
    ],
    check: (p) =>
      p.holeD ? cornerHoles(p, p.width, p.height, p.radius) : null,
    build: (p) => ({
      outline: roundedRect(0, 0, p.width, p.height, p.radius),
      holes: p.holeD
        ? [
            [p.inset, p.inset],
            [p.width - p.inset, p.inset],
            [p.width - p.inset, p.height - p.inset],
            [p.inset, p.height - p.inset],
          ].map(([x, y]) => circle(x, y, p.holeD))
        : [],
    }),
  },
  {
    id: 'center-hole-plate',
    category: 'plates',
    params: [
      ['width', 150, 20, 3000],
      ['height', 150, 20, 1500],
      ['radius', 5, 0, 500],
      ['centerD', 60, 1, 1400],
      ['holeD', 10, 0, 200],
      ['inset', 15, 3, 500],
    ],
    check: (p) => {
      if (p.centerD + 4 > Math.min(p.width, p.height)) return 'centerFit'
      if (!p.holeD) return null
      if (
        Math.hypot(p.width / 2 - p.inset, p.height / 2 - p.inset) <
        p.centerD / 2 + p.holeD / 2 + 2
      )
        return 'holesFit'
      return cornerHoles(p, p.width, p.height, p.radius)
    },
    build: (p) => ({
      outline: roundedRect(0, 0, p.width, p.height, p.radius),
      holes: [
        circle(p.width / 2, p.height / 2, p.centerD),
        ...(p.holeD
          ? [
              [p.inset, p.inset],
              [p.width - p.inset, p.inset],
              [p.width - p.inset, p.height - p.inset],
              [p.inset, p.height - p.inset],
            ].map(([x, y]) => circle(x, y, p.holeD))
          : []),
      ],
    }),
  },
  {
    id: 'base-plate',
    category: 'plates',
    params: [
      ['width', 250, 50, 2000],
      ['height', 250, 50, 2000],
      ['holeD', 18, 4, 100],
      ['slot', 0, 0, 200],
      ['inset', 35, 5, 500],
      ['centerD', 0, 0, 500],
    ],
    check: (p) => {
      if (p.slot && p.slot <= p.holeD) return 'slotLength'
      const span = Math.max(p.slot, p.holeD)
      if (p.inset * 2 + span + 2 > Math.min(p.width, p.height))
        return 'holesFit'
      if (span / 2 + 3 > p.inset) return 'holesEdge'
      if (
        p.centerD &&
        (p.centerD + 4 > Math.min(p.width, p.height) ||
          Math.hypot(p.width / 2 - p.inset, p.height / 2 - p.inset) <
            p.centerD / 2 + span / 2 + 2)
      )
        return 'centerFit'
      return null
    },
    build: (p) => ({
      outline: roundedRect(0, 0, p.width, p.height, 0),
      holes: [
        ...[
          [p.inset, p.inset],
          [p.width - p.inset, p.inset],
          [p.width - p.inset, p.height - p.inset],
          [p.inset, p.height - p.inset],
        ].map(([x, y]) =>
          p.slot ? slot(x, y, p.slot, p.holeD) : circle(x, y, p.holeD)
        ),
        ...(p.centerD ? [circle(p.width / 2, p.height / 2, p.centerD)] : []),
      ],
    }),
  },
  {
    id: 'perforated-plate',
    category: 'plates',
    params: [
      ['width', 300, 30, 3000],
      ['height', 200, 30, 1500],
      ['holeD', 8, 2, 100],
      ['pitch', 20, 4, 500],
      ['margin', 15, 3, 500],
    ],
    check: (p) =>
      p.pitch < p.holeD + 2
        ? 'pitchSmall'
        : perforation(p).length < 1
        ? 'holesFit'
        : perforation(p).length > 2500
        ? 'tooManyHoles'
        : null,
    build: (p) => ({
      outline: roundedRect(0, 0, p.width, p.height, 0),
      holes: perforation(p).map(([x, y]) => circle(x, y, p.holeD)),
    }),
  },
  {
    id: 'frame',
    category: 'plates',
    params: [
      ['width', 300, 30, 3000],
      ['height', 200, 30, 1500],
      ['border', 30, 5, 700],
      ['radius', 0, 0, 500],
    ],
    check: (p) =>
      p.border * 2 + 5 > Math.min(p.width, p.height) ? 'borderFit' : null,
    build: (p) => ({
      outline: roundedRect(0, 0, p.width, p.height, p.radius),
      holes: [
        roundedRect(
          p.border,
          p.border,
          p.width - 2 * p.border,
          p.height - 2 * p.border,
          Math.max(0, p.radius - p.border)
        ),
      ],
    }),
  },
  {
    id: 'round-flange',
    category: 'flanges',
    params: [
      ['outerD', 200, 20, 1500],
      ['innerD', 100, 0, 1400],
      ['pcd', 150, 10, 1450],
      ['bolts', 6, 2, 36],
      ['boltD', 14, 2, 100],
    ],
    check: (p) => {
      if (p.innerD && p.innerD + 4 > p.outerD) return 'innerFit'
      if (
        p.pcd + p.boltD + 4 > p.outerD ||
        (p.innerD && p.pcd - p.boltD - 4 < p.innerD)
      )
        return 'boltsFit'
      if (p.pcd * Math.sin(Math.PI / Math.round(p.bolts)) < p.boltD + 2)
        return 'boltsSpacing'
      return null
    },
    build: (p) => ({
      outline: circle(0, 0, p.outerD),
      holes: [
        ...(p.innerD ? [circle(0, 0, p.innerD)] : []),
        ...boltCircle(0, 0, p.pcd, Math.round(p.bolts), p.boltD),
      ],
    }),
  },
  {
    id: 'square-flange',
    category: 'flanges',
    params: [
      ['size', 150, 30, 1500],
      ['radius', 10, 0, 500],
      ['centerD', 70, 0, 1400],
      ['holeD', 12, 2, 100],
      ['inset', 20, 4, 500],
    ],
    check: (p) => {
      if (p.centerD && p.centerD + 4 > p.size) return 'centerFit'
      if (
        p.centerD &&
        Math.SQRT2 * (p.size / 2 - p.inset) < p.centerD / 2 + p.holeD / 2 + 2
      )
        return 'holesFit'
      return cornerHoles(p, p.size, p.size, p.radius)
    },
    build: (p) => ({
      outline: roundedRect(0, 0, p.size, p.size, p.radius),
      holes: [
        ...(p.centerD ? [circle(p.size / 2, p.size / 2, p.centerD)] : []),
        ...[
          [p.inset, p.inset],
          [p.size - p.inset, p.inset],
          [p.size - p.inset, p.size - p.inset],
          [p.inset, p.size - p.inset],
        ].map(([x, y]) => circle(x, y, p.holeD)),
      ],
    }),
  },
  {
    id: 'washer',
    category: 'flanges',
    params: [
      ['outerD', 60, 6, 1500],
      ['innerD', 30, 1, 1400],
    ],
    check: (p) => (p.innerD + 4 > p.outerD ? 'innerFit' : null),
    build: (p) => ({
      outline: circle(0, 0, p.outerD),
      holes: [circle(0, 0, p.innerD)],
    }),
  },
  {
    id: 'disc',
    category: 'flanges',
    params: [
      ['diameter', 100, 5, 1500],
      ['holeD', 0, 0, 1400],
    ],
    check: (p) => (p.holeD && p.holeD + 4 > p.diameter ? 'innerFit' : null),
    build: (p) => ({
      outline: circle(0, 0, p.diameter),
      holes: p.holeD ? [circle(0, 0, p.holeD)] : [],
    }),
  },
  {
    id: 'link',
    category: 'brackets',
    params: [
      ['length', 150, 20, 3000],
      ['width', 30, 8, 500],
      ['holes', 2, 1, 30],
      ['holeD', 12, 2, 400],
    ],
    check: (p) =>
      p.holeD + 4 > p.width
        ? 'holesWidth'
        : p.length < p.width
        ? 'lengthShort'
        : linkHoles(p).spacing !== null && linkHoles(p).spacing < p.holeD + 2
        ? 'holesSpacing'
        : null,
    build: (p) => ({
      outline: slot(p.length / 2, p.width / 2, p.length, p.width),
      holes: linkHoles(p).centers.map((x) => circle(x, p.width / 2, p.holeD)),
    }),
  },
  {
    id: 'strip',
    category: 'brackets',
    params: [
      ['length', 300, 20, 6000],
      ['width', 40, 8, 1000],
      ['holes', 4, 1, 60],
      ['holeD', 10, 2, 400],
      ['offset', 20, 3, 1000],
    ],
    check: (p) => {
      if (p.holeD + 4 > p.width) return 'holesWidth'
      if (p.holeD / 2 + 2 > p.offset || p.offset * 2 > p.length)
        return 'holesEdge'
      const n = Math.round(p.holes)
      if (n > 1 && (p.length - 2 * p.offset) / (n - 1) < p.holeD + 2)
        return 'holesSpacing'
      return null
    },
    build: (p) => {
      const n = Math.round(p.holes)
      const step = n > 1 ? (p.length - 2 * p.offset) / (n - 1) : 0
      return {
        outline: roundedRect(0, 0, p.length, p.width, 0),
        holes: Array.from({ length: n }, (_, i) =>
          circle(
            n > 1 ? p.offset + step * i : p.length / 2,
            p.width / 2,
            p.holeD
          )
        ),
      }
    },
  },
  {
    id: 'lug',
    category: 'brackets',
    params: [
      ['width', 60, 10, 1000],
      ['height', 70, 5, 2000],
      ['holeD', 20, 0, 900],
    ],
    check: (p) =>
      p.holeD && p.holeD + 6 > p.width
        ? 'holesWidth'
        : p.holeD && p.holeD / 2 + 3 > p.height
        ? 'holesEdge'
        : null,
    build: (p) => ({
      outline: poly([
        [0, 0, 0],
        [p.width, 0, 0],
        [p.width, p.height, 1],
        [0, p.height, 0],
      ]),
      holes: p.holeD ? [circle(p.width / 2, p.height, p.holeD)] : [],
    }),
  },
  {
    id: 'gusset',
    category: 'brackets',
    params: [
      ['legA', 150, 20, 2000],
      ['legB', 150, 20, 2000],
      ['chamfer', 15, 0, 300],
      ['holeD', 0, 0, 200],
      ['inset', 30, 5, 500],
    ],
    check: (p) => {
      const l = Math.hypot(p.legA, p.legB)
      if (p.chamfer * 2 >= Math.min(p.legA, p.legB, l)) return 'chamferFit'
      if (
        p.holeD &&
        (p.inset - p.holeD / 2 < 3 ||
          p.inset / p.legA + p.inset / p.legB >
            1 - ((p.holeD / 2 + 3) * l) / (p.legA * p.legB))
      )
        return 'holesFit'
      return null
    },
    build: (p) => {
      const { legA: a, legB: b, chamfer: c } = p
      const l = Math.hypot(a, b)
      const points = c
        ? [
            [0, 0],
            [a - c, 0],
            [a - (c * a) / l, (c * b) / l],
            [(c * a) / l, b - (c * b) / l],
            [0, b - c],
          ]
        : [
            [0, 0],
            [a, 0],
            [0, b],
          ]
      return {
        outline: poly(points),
        holes: p.holeD ? [circle(p.inset, p.inset, p.holeD)] : [],
      }
    },
  },
  {
    id: 'l-plate',
    category: 'brackets',
    params: [
      ['width', 150, 20, 3000],
      ['height', 150, 20, 3000],
      ['leg', 40, 5, 1500],
    ],
    check: (p) => (p.leg + 5 > Math.min(p.width, p.height) ? 'legFit' : null),
    build: (p) => ({
      outline: poly([
        [0, 0],
        [p.width, 0],
        [p.width, p.leg],
        [p.leg, p.leg],
        [p.leg, p.height],
        [0, p.height],
      ]),
      holes: [],
    }),
  },
  {
    id: 'bent-l',
    category: 'bent',
    bends: 1,
    params: [
      ['legA', 80, 10, 1500],
      ['legB', 60, 10, 1500],
      ['width', 50, 10, 2000],
      ['thickness', 3, 0.5, 20],
      ['holeD', 8, 0, 200],
    ],
    check: (p) => {
      const flat = bentL(p)
      if (flat.a <= 2 * p.thickness || flat.b <= 2 * p.thickness)
        return 'bendShort'
      if (p.holeD && p.holeD + 4 > p.width) return 'holesFit'
      // A hole closer than about twice the thickness to the bend gets pulled out of round.
      if (p.holeD && p.holeD + 4 * p.thickness > Math.min(flat.a, flat.b))
        return 'holesBend'
      return null
    },
    build: (p) => {
      const flat = bentL(p)
      const x = flat.a + flat.ba / 2
      return {
        outline: roundedRect(0, 0, flat.length, p.width, 0),
        holes: p.holeD
          ? [
              circle(flat.a / 2, p.width / 2, p.holeD),
              circle(flat.length - flat.b / 2, p.width / 2, p.holeD),
            ]
          : [],
        bends: [line(x, 0, x, p.width)],
        flat: flat.length,
      }
    },
  },
  {
    id: 'bent-u',
    category: 'bent',
    bends: 2,
    params: [
      ['base', 80, 10, 1500],
      ['side', 40, 10, 1500],
      ['width', 50, 10, 2000],
      ['thickness', 3, 0.5, 20],
      ['holeD', 0, 0, 200],
    ],
    check: (p) => {
      const flat = bentU(p)
      if (flat.s <= 2 * p.thickness || flat.c <= 2 * p.thickness)
        return 'bendShort'
      if (p.holeD && p.holeD + 4 > p.width) return 'holesFit'
      if (p.holeD && p.holeD + 4 * p.thickness > flat.c) return 'holesBend'
      return null
    },
    build: (p) => {
      const flat = bentU(p)
      const x1 = flat.s + flat.ba / 2
      const x2 = flat.s + flat.ba + flat.c + flat.ba / 2
      return {
        outline: roundedRect(0, 0, flat.length, p.width, 0),
        holes: p.holeD ? [circle(flat.length / 2, p.width / 2, p.holeD)] : [],
        bends: [line(x1, 0, x1, p.width), line(x2, 0, x2, p.width)],
        flat: flat.length,
      }
    },
  },
  {
    id: 'gear',
    category: 'gears',
    params: [
      ['module', 3, 1, 20],
      ['teeth', 24, 8, 150],
      ['bore', 20, 0, 1000],
    ],
    check: (p) =>
      p.bore &&
      p.bore + 2 * p.module + 4 >
        2 * ((p.module * p.teeth) / 2 - 1.25 * p.module)
        ? 'boreFit'
        : null,
    build: (p) => {
      const g = gear(0, 0, p.module, Math.round(p.teeth))
      return { outline: g.outline, holes: p.bore ? [circle(0, 0, p.bore)] : [] }
    },
  },
  {
    id: 'polygon',
    category: 'shapes',
    params: [
      ['sides', 6, 3, 16],
      ['size', 100, 10, 2000],
      ['holeD', 0, 0, 1800],
    ],
    check: (p) =>
      p.holeD && p.holeD + 4 > p.size * Math.cos(Math.PI / Math.round(p.sides))
        ? 'innerFit'
        : null,
    build: (p) => {
      const n = Math.round(p.sides)
      return {
        outline: regular(0, 0, n, p.size / 2, -Math.PI / 2 + Math.PI / n),
        holes: p.holeD ? [circle(0, 0, p.holeD)] : [],
      }
    },
  },
  {
    id: 'ellipse',
    category: 'shapes',
    params: [
      ['width', 150, 10, 3000],
      ['height', 80, 10, 1500],
    ],
    check: () => null,
    build: (p) => ({
      outline: poly(
        Array.from({ length: 144 }, (_, i) => [
          (p.width / 2) * Math.cos((TAU * i) / 144),
          (p.height / 2) * Math.sin((TAU * i) / 144),
        ])
      ),
      holes: [],
    }),
  },
  {
    id: 'trapezoid',
    category: 'shapes',
    params: [
      ['bottom', 150, 10, 3000],
      ['top', 90, 0, 3000],
      ['height', 80, 10, 1500],
    ],
    check: () => null,
    build: (p) => {
      const off = (p.bottom - p.top) / 2
      return {
        outline: poly([
          [0, 0],
          [p.bottom, 0],
          [p.bottom - off, p.height],
          [off, p.height],
        ]),
        holes: [],
      }
    },
  },
  {
    id: 'star',
    category: 'shapes',
    params: [
      ['points', 5, 3, 24],
      ['outerD', 100, 10, 2000],
      ['innerD', 40, 2, 1990],
    ],
    check: (p) => (p.innerD + 2 > p.outerD ? 'innerFit' : null),
    build: (p) => {
      const n = Math.round(p.points)
      const points = []
      for (let i = 0; i < n * 2; i++) {
        const r = (i % 2 ? p.innerD : p.outerD) / 2
        const a = Math.PI / 2 + (Math.PI * i) / n
        points.push([r * Math.cos(a), r * Math.sin(a)])
      }
      return { outline: poly(points), holes: [] }
    },
  },
  {
    id: 'arch',
    category: 'shapes',
    params: [
      ['width', 80, 10, 2000],
      ['height', 120, 10, 3000],
    ],
    check: (p) => (p.height <= p.width / 2 ? 'archHeight' : null),
    build: (p) => ({
      outline: poly([
        [0, 0, 0],
        [p.width, 0, 0],
        [p.width, p.height - p.width / 2, 1],
        [0, p.height - p.width / 2, 0],
      ]),
      holes: [],
    }),
  },
]

// Four corner holes: apart from each other, off the edges and inside a rounded corner.
function cornerHoles(p, width, height, radius) {
  if (p.inset * 2 + p.holeD + 2 > Math.min(width, height)) return 'holesFit'
  if (p.holeD / 2 + 2 > p.inset) return 'holesEdge'
  const r = Math.min(radius, width / 2, height / 2)
  if (p.inset < r && Math.SQRT2 * (r - p.inset) + p.holeD / 2 + 2 > r)
    return 'holesEdge'
  return null
}

function perforation(p) {
  const usable = (size) => size - 2 * p.margin - p.holeD
  const count = (size) =>
    usable(size) < 0 ? 0 : Math.floor(usable(size) / p.pitch + 1e-9) + 1
  const nx = count(p.width)
  const ny = count(p.height)
  if (nx * ny > 5000) return new Array(nx * ny)
  const x0 = (p.width - (nx - 1) * p.pitch) / 2
  const y0 = (p.height - (ny - 1) * p.pitch) / 2
  const centers = []
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < ny; j++)
      centers.push([x0 + i * p.pitch, y0 + j * p.pitch])
  return centers
}

function linkHoles(p) {
  const n = Math.round(p.holes)
  const first = p.width / 2
  const last = p.length - p.width / 2
  if (n === 1) return { centers: [p.length / 2], spacing: null }
  const spacing = (last - first) / (n - 1)
  return {
    centers: Array.from({ length: n }, (_, i) => first + spacing * i),
    spacing,
  }
}

function bentL(p) {
  const ba = bendAllowance(p.thickness)
  const a = p.legA - 2 * p.thickness
  const b = p.legB - 2 * p.thickness
  return { a, b, ba, length: a + ba + b }
}

function bentU(p) {
  const ba = bendAllowance(p.thickness)
  const s = p.side - 2 * p.thickness
  const c = p.base - 4 * p.thickness
  return { s, c, ba, length: s + ba + c + ba + s }
}

export function templateById(id) {
  return TEMPLATES.find((t) => t.id === id) || null
}

export function defaults(template) {
  return Object.fromEntries(template.params.map(([key, value]) => [key, value]))
}

// The first problem with the dimensions: a key of the copy, or null when it can be cut.
export function problem(template, values) {
  for (const [key, , min, max] of template.params) {
    const value =
      values[key] === '' || values[key] === null ? NaN : Number(values[key])
    if (!Number.isFinite(value) || value < min || value > max)
      return { key: 'range', param: key, min, max }
  }
  const issue = template.check(numbers(template, values))
  if (issue) return { key: issue }
  const part = buildPart(template, values)
  if (
    Math.max(part.width, part.height) > SHEET.length ||
    Math.min(part.width, part.height) > SHEET.width
  ) {
    return { key: 'sheetSize', ...SHEET }
  }
  return null
}

function numbers(template, values) {
  return Object.fromEntries(
    template.params.map(([key]) => [key, Number(values[key])])
  )
}

// Geometry moved so its lower left corner is the origin.
export function buildPart(template, values) {
  const part = template.build(numbers(template, values))
  const shapes = [part.outline, ...(part.holes || [])]
  const bounds = box(shapes)
  const move = (shape) =>
    shape.type === 'circle'
      ? { ...shape, cx: shape.cx - bounds.minX, cy: shape.cy - bounds.minY }
      : {
          ...shape,
          points: shape.points.map(([x, y, b]) => [
            x - bounds.minX,
            y - bounds.minY,
            b,
          ]),
        }
  return {
    outline: move(part.outline),
    holes: (part.holes || []).map(move),
    bends: (part.bends || []).map((l) =>
      line(
        l.x1 - bounds.minX,
        l.y1 - bounds.minY,
        l.x2 - bounds.minX,
        l.y2 - bounds.minY
      )
    ),
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
    flat: part.flat || null,
  }
}

function box(shapes) {
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity]
  const add = (x, y) => {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  for (const shape of shapes) {
    if (shape.type === 'circle') {
      add(shape.cx - shape.r, shape.cy - shape.r)
      add(shape.cx + shape.r, shape.cy + shape.r)
      continue
    }
    const pts = shape.points
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1, b] = pts[i]
      add(x1, y1)
      if (!b) continue
      // A bulged segment may reach past its ends: include its extreme points.
      const [x2, y2] = pts[(i + 1) % pts.length]
      for (const [x, y] of arcPoints(x1, y1, x2, y2, b, 24)) add(x, y)
    }
  }
  return { minX, minY, maxX, maxY }
}

function arcPoints(x1, y1, x2, y2, bulge, steps) {
  const chord = Math.hypot(x2 - x1, y2 - y1)
  const theta = 4 * Math.atan(bulge)
  const radius = chord / (2 * Math.sin(Math.abs(theta) / 2))
  const offset = radius * Math.cos(Math.abs(theta) / 2) * (bulge > 0 ? 1 : -1)
  const cx = (x1 + x2) / 2 - (offset * (y2 - y1)) / chord
  const cy = (y1 + y2) / 2 + (offset * (x2 - x1)) / chord
  const a1 = Math.atan2(y1 - cy, x1 - cx)
  return Array.from({ length: steps + 1 }, (_, i) => [
    cx + radius * Math.cos(a1 + (theta * i) / steps),
    cy + radius * Math.sin(a1 + (theta * i) / steps),
  ])
}

const n4 = (value) => String(Math.round(value * 10000) / 10000)

// R12 ASCII DXF: polylines with bulges, circles, and bend lines on layer BEND.
export function toDxf(part) {
  const out = []
  const pair = (code, value) => out.push(String(code), String(value))
  pair(0, 'SECTION')
  pair(2, 'HEADER')
  pair(9, '$ACADVER')
  pair(1, 'AC1009')
  pair(9, '$INSUNITS')
  pair(70, 4)
  pair(9, '$MEASUREMENT')
  pair(70, 1)
  pair(0, 'ENDSEC')
  pair(0, 'SECTION')
  pair(2, 'TABLES')
  pair(0, 'TABLE')
  pair(2, 'LTYPE')
  pair(70, 1)
  pair(0, 'LTYPE')
  pair(2, 'CONTINUOUS')
  pair(70, 0)
  pair(3, 'Solid line')
  pair(72, 65)
  pair(73, 0)
  pair(40, '0.0')
  pair(0, 'ENDTAB')
  pair(0, 'TABLE')
  pair(2, 'LAYER')
  pair(70, 2)
  pair(0, 'LAYER')
  pair(2, '0')
  pair(70, 0)
  pair(62, 7)
  pair(6, 'CONTINUOUS')
  pair(0, 'LAYER')
  pair(2, 'BEND')
  pair(70, 0)
  pair(62, 1)
  pair(6, 'CONTINUOUS')
  pair(0, 'ENDTAB')
  pair(0, 'ENDSEC')
  pair(0, 'SECTION')
  pair(2, 'ENTITIES')
  for (const shape of [part.outline, ...part.holes]) {
    if (shape.type === 'circle') {
      pair(0, 'CIRCLE')
      pair(8, '0')
      pair(10, n4(shape.cx))
      pair(20, n4(shape.cy))
      pair(30, 0)
      pair(40, n4(shape.r))
      continue
    }
    pair(0, 'POLYLINE')
    pair(8, '0')
    pair(66, 1)
    pair(10, 0)
    pair(20, 0)
    pair(30, 0)
    pair(70, 1)
    for (const [x, y, b] of shape.points) {
      pair(0, 'VERTEX')
      pair(8, '0')
      pair(10, n4(x))
      pair(20, n4(y))
      pair(30, 0)
      if (b) pair(42, n4(b))
    }
    pair(0, 'SEQEND')
    pair(8, '0')
  }
  for (const l of part.bends) {
    pair(0, 'LINE')
    pair(8, 'BEND')
    pair(10, n4(l.x1))
    pair(20, n4(l.y1))
    pair(30, 0)
    pair(11, n4(l.x2))
    pair(21, n4(l.y2))
    pair(31, 0)
  }
  pair(0, 'ENDSEC')
  pair(0, 'EOF')
  return out.join('\r\n') + '\r\n'
}

// SVG path data in drawing coordinates (y up): the caller flips it.
export function svgPath(part) {
  const d = []
  for (const shape of [part.outline, ...part.holes]) {
    if (shape.type === 'circle') {
      const { cx, cy, r } = shape
      d.push(
        `M${n4(cx + r)} ${n4(cy)}A${n4(r)} ${n4(r)} 0 1 1 ${n4(cx - r)} ${n4(
          cy
        )}A${n4(r)} ${n4(r)} 0 1 1 ${n4(cx + r)} ${n4(cy)}Z`
      )
      continue
    }
    const pts = shape.points
    let path = `M${n4(pts[0][0])} ${n4(pts[0][1])}`
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1, b] = pts[i]
      const [x2, y2] = pts[(i + 1) % pts.length]
      if (!b) {
        path += `L${n4(x2)} ${n4(y2)}`
        continue
      }
      const theta = 4 * Math.atan(Math.abs(b))
      const r = Math.hypot(x2 - x1, y2 - y1) / (2 * Math.sin(theta / 2))
      path += `A${n4(r)} ${n4(r)} 0 ${theta > Math.PI ? 1 : 0} ${
        b > 0 ? 1 : 0
      } ${n4(x2)} ${n4(y2)}`
    }
    d.push(path + 'Z')
  }
  return d.join('')
}
