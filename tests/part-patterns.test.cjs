const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const { transformSync } = require('@babel/core')

const root = path.join(__dirname, '..')
const loaded = new Map()
function load(name) {
  if (loaded.has(name)) return loaded.get(name)
  const source = fs.readFileSync(path.join(root, name), 'utf8')
  const code = transformSync(source, {
    configFile: false,
    babelrc: false,
    plugins: [require('@babel/plugin-transform-modules-commonjs')],
  }).code
  const exported = { exports: {} }
  const dependency = (request) =>
    request.startsWith('@/') ? load(request.slice(2) + '.js') : require(request)
  // Runs the project's own transpiled source, as the other utility tests do.
  // eslint-disable-next-line no-new-func
  new Function('require', 'module', 'exports', code)(
    dependency,
    exported,
    exported.exports
  )
  loaded.set(name, exported.exports)
  return exported.exports
}

const { buildPart, defaults, samplePolygon, templateById, toDxf } = load(
  'utils/part-templates.js'
)
const {
  MAX_CELLS,
  PATTERNS,
  layPatterns,
  minBridge,
  minCell,
  newPattern,
  patternRegion,
} = load('utils/part-patterns.js')
const { measureDxf } = load('utils/dxf-measure.js')
const { RAL_COLORS, isDark, ralCode, ralColor, ralName } = load(
  'utils/ral-colors.js'
)
const { builderCopy } = load('utils/part-builder-copy.js')

const sheet = (width = 600, height = 400) =>
  buildPart(templateById('blank'), { width, height, radius: 0 })

const points = (shape) => samplePolygon(shape, 8)
const bounds = (shapes) => {
  const all = shapes.flatMap(points)
  return [
    Math.min(...all.map((p) => p[0])),
    Math.min(...all.map((p) => p[1])),
    Math.max(...all.map((p) => p[0])),
    Math.max(...all.map((p) => p[1])),
  ]
}
const cellsOf = (laid, base) => laid.part.holes.slice(base.holes.length)
const near = (actual, expected, delta, label) =>
  assert.ok(
    Math.abs(actual - expected) <= delta,
    `${label}: ${actual} is not within ${delta} of ${expected}`
  )

test('every pattern kind fills a blank sheet with whole, closed cells', () => {
  const base = sheet()
  for (const kind of PATTERNS) {
    const pattern = newPattern(base, kind.id, 3)
    const laid = layPatterns(base, [pattern], 3)
    assert.deepEqual(laid.issues, [], kind.id)
    assert.ok(laid.counts[0] > 5, `${kind.id} cells`)
    const m = measureDxf(toDxf(laid.part))
    assert.equal(m.pierces, 1 + laid.counts[0], `${kind.id} pierces`)
    assert.equal(m.openContours, 0, `${kind.id} closed`)
    assert.deepEqual([m.widthMm, m.heightMm], [600, 400], `${kind.id} size`)
    // Every cell stays inside its own area.
    const [minX, minY, maxX, maxY] = bounds(cellsOf(laid, base))
    assert.ok(minX >= pattern.cx - pattern.width / 2 - 1e-6, `${kind.id} left`)
    assert.ok(maxX <= pattern.cx + pattern.width / 2 + 1e-6, `${kind.id} right`)
    assert.ok(
      minY >= pattern.cy - pattern.height / 2 - 1e-6,
      `${kind.id} bottom`
    )
    assert.ok(maxY <= pattern.cy + pattern.height / 2 + 1e-6, `${kind.id} top`)
  }
})

test('cells keep a bridge from the edge, the holes and each other', () => {
  const base = sheet(300, 200)
  // An area larger than the sheet, turned: only cells a bridge inside stay.
  const pattern = {
    ...newPattern(base, 'squares', 3),
    width: 400,
    height: 300,
    angle: 30,
    size: 12,
    gap: 4,
  }
  const laid = layPatterns(base, [pattern], 3)
  const cells = cellsOf(laid, base)
  assert.ok(cells.length > 20)
  const [minX, minY, maxX, maxY] = bounds(cells)
  assert.ok(minX >= 4 - 1e-6 && minY >= 4 - 1e-6, 'bridge from the lower edges')
  assert.ok(
    maxX <= 296 + 1e-6 && maxY <= 196 + 1e-6,
    'bridge from the upper edges'
  )

  // A plate with a centre hole: no cell comes closer than a bridge to it.
  const plate = templateById('center-hole-plate')
  const holed = buildPart(plate, {
    ...defaults(plate),
    width: 300,
    height: 300,
    centerD: 80,
  })
  const ring = layPatterns(
    holed,
    [{ ...newPattern(holed, 'circles', 2), width: 260, height: 260 }],
    2
  )
  const centre = holed.holes.find((h) => h.type === 'circle' && h.r === 40)
  for (const cell of cellsOf(ring, holed)) {
    for (const [x, y] of points(cell)) {
      assert.ok(
        Math.hypot(x - centre.cx, y - centre.cy) >= 40 + 3 - 1e-6,
        'clear of the centre hole'
      )
    }
  }

  // A second pattern on top of the first keeps clear of its cells.
  const two = layPatterns(
    base,
    [
      newPattern(base, 'circles', 3),
      { ...newPattern(base, 'squares', 3), cx: 170 },
    ],
    3
  )
  const first = two.part.holes.slice(0, two.counts[0]).map(points)
  const second = two.part.holes.slice(two.counts[0]).map(points)
  const gap = Math.min(
    ...second.flatMap((a) =>
      first.flatMap((b) =>
        a.flatMap(([x, y]) => b.map(([u, v]) => Math.hypot(x - u, y - v)))
      )
    )
  )
  assert.ok(gap >= minBridge(3) - 0.5, `patterns ${gap.toFixed(2)} mm apart`)
})

test('a pattern stays off the bend zones of a bent part', () => {
  const angle = templateById('bent-l')
  const base = buildPart(angle, {
    ...defaults(angle),
    legA: 150,
    legB: 150,
    width: 120,
    holeD: 0,
  })
  const laid = layPatterns(base, [newPattern(base, 'circles', 3)], 3)
  assert.ok(laid.counts[0] > 10)
  const bend = base.fold.bends[0]
  for (const cell of cellsOf(laid, base)) {
    for (const [x] of points(cell)) {
      assert.ok(
        Math.abs(x - bend.x) >= bend.allowance / 2 + 3,
        'outside the bend and a thickness more'
      )
    }
  }
})

test('impossible patterns are named instead of drawn', () => {
  const base = sheet(200, 100)
  const outside = layPatterns(
    base,
    [{ ...newPattern(base, 'circles', 3), cx: 900 }],
    3
  )
  assert.deepEqual(outside.issues, [{ index: 0, key: 'patternEmpty' }])
  assert.equal(outside.part.holes.length, 0)

  const small = layPatterns(
    base,
    [{ ...newPattern(base, 'circles', 5), size: 3 }],
    5
  )
  assert.deepEqual(small.issues[0], {
    index: 0,
    key: 'patternSmall',
    min: minCell(5),
  })
  const narrow = layPatterns(
    base,
    [{ ...newPattern(base, 'circles', 5), gap: 2 }],
    5
  )
  assert.deepEqual(narrow.issues[0], {
    index: 0,
    key: 'patternBridge',
    min: minBridge(5),
  })

  const big = sheet(3000, 1500)
  const crowded = layPatterns(
    big,
    [
      {
        ...newPattern(big, 'circles', 1),
        width: 2900,
        height: 1400,
        size: 4,
        gap: 2,
      },
    ],
    1
  )
  // Far past the limit the grid is not even laid out.
  assert.deepEqual(crowded.issues, [{ index: 0, key: 'tooManyHoles' }])
  assert.equal(crowded.part.holes.length, 0)
  // Within reach of it, the cells are laid and the part says it has too many.
  const dense = layPatterns(
    big,
    [
      {
        ...newPattern(big, 'circles', 1),
        width: 1500,
        height: 1000,
        size: 12,
        gap: 3,
      },
    ],
    1
  )
  assert.ok(dense.part.holes.length > MAX_CELLS)
  assert.deepEqual(dense.issues, [{ key: 'tooManyHoles' }])
  assert.deepEqual(layPatterns(base, [], 3), {
    part: base,
    counts: [],
    wanted: [],
    issues: [],
  })
})

test('a single element repeats in a row, a grid or a ring', () => {
  const base = sheet(600, 400)
  const { ELEMENTS, newElement, arrayCount } = load('utils/part-patterns.js')
  for (const kind of ELEMENTS) {
    const one = newElement(base, kind, 3)
    const laid = layPatterns(base, [one], 3)
    assert.deepEqual([laid.counts[0], laid.wanted[0]], [1, 1], kind)
    assert.deepEqual(laid.issues, [], kind)
    const m = measureDxf(toDxf(laid.part))
    assert.equal(m.pierces, 2, `${kind} pierces`)
    assert.equal(m.openContours, 0, `${kind} closed`)
  }
  const star = newElement(base, 'star', 3)
  const row = layPatterns(base, [{ ...star, count: 5, dx: 100 }], 3)
  assert.deepEqual([row.counts[0], row.wanted[0]], [5, 5])
  const grid = { ...star, layout: 'grid', rows: 3, cols: 4, dx: 110, dy: 110 }
  assert.equal(arrayCount(grid), 12)
  assert.equal(layPatterns(base, [grid], 3).counts[0], 12)
  const ring = { ...star, layout: 'circle', count: 8, ring: 140, w: 40, h: 40 }
  const round = layPatterns(base, [ring], 3)
  assert.equal(round.counts[0], 8)
  // Every star of the ring sits 140 mm from the centre.
  for (const shape of cellsOf(round, base)) {
    const pts = points(shape)
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
    assert.ok(Math.abs(Math.hypot(cx - 300, cy - 200) - 140) < 3)
  }
  // Too many for the sheet: the ones that do not fit are left out, and said so.
  const crowded = layPatterns(base, [{ ...star, count: 12, dx: 100 }], 3)
  assert.ok(crowded.counts[0] < crowded.wanted[0])
  assert.equal(crowded.wanted[0], 12)
})

test('elements stretch, round their corners and turn', () => {
  const base = sheet(400, 300)
  const { newElement } = load('utils/part-patterns.js')
  const oval = { ...newElement(base, 'circle', 2), w: 120, h: 40 }
  const [minX, minY, maxX, maxY] = bounds(
    cellsOf(layPatterns(base, [oval], 2), base)
  )
  assert.ok(
    Math.abs(maxX - minX - 120) < 0.5 && Math.abs(maxY - minY - 40) < 0.5
  )
  const card = { ...newElement(base, 'rect', 2), w: 100, h: 60, radius: 10 }
  const rounded = measureDxf(toDxf(layPatterns(base, [card], 2).part))
  near(
    rounded.cutLengthMm - 1400,
    2 * (100 + 60) - 8 * 10 + 2 * Math.PI * 10,
    0.5,
    'rounded rectangle'
  )
  const turned = { ...card, radius: 0, spin: 90 }
  const [tx0, ty0, tx1, ty1] = bounds(
    cellsOf(layPatterns(base, [turned], 2), base)
  )
  assert.ok(Math.abs(tx1 - tx0 - 60) < 0.5 && Math.abs(ty1 - ty0 - 100) < 0.5)
  const slot = { ...newElement(base, 'slot', 2), w: 20, h: 80 }
  const upright = bounds(cellsOf(layPatterns(base, [slot], 2), base))
  assert.ok(
    Math.abs(upright[3] - upright[1] - 80) < 0.5,
    'a tall slot stands up'
  )
})

test('a new pattern sits in the middle and its area turns with it', () => {
  const base = sheet(400, 200)
  const pattern = newPattern(base, 'hexagons', 3)
  assert.deepEqual([pattern.cx, pattern.cy, pattern.shape], [200, 100, 'rect'])
  assert.ok(pattern.gap >= minBridge(3) && pattern.size >= minCell(3))
  const flange = buildPart(templateById('disc'), defaults(templateById('disc')))
  assert.equal(
    newPattern(flange, 'circles', 2).shape,
    'circle',
    'round parts get a round area'
  )

  const { corners } = patternRegion({
    ...pattern,
    width: 100,
    height: 50,
    angle: 90,
  })
  const xs = corners.map((c) => Math.round(c[0]))
  const ys = corners.map((c) => Math.round(c[1]))
  assert.deepEqual(
    [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)],
    [175, 225, 50, 150]
  )
  assert.deepEqual(
    patternRegion({ ...pattern, shape: 'circle', width: 80 }).circle,
    { cx: 200, cy: 100, r: 40 }
  )
})

test('RAL codes are read however they are typed', () => {
  assert.equal(ralCode('RAL 9005'), '9005')
  assert.equal(ralCode('ral7016'), '7016')
  assert.equal(ralCode('3020'), '3020')
  assert.equal(ralCode('red'), '')
  assert.equal(ralColor('RAL 9005').hex, '#0E0E10')
  assert.equal(ralColor('1234'), null)
  assert.equal(ralName(ralColor('9016'), 'en'), 'Traffic white')
  assert.equal(ralName(ralColor('9016'), 'ru-RU'), 'Транспортный белый')
  assert.equal(new Set(RAL_COLORS.map((c) => c.code)).size, RAL_COLORS.length)
  for (const colour of RAL_COLORS) {
    assert.match(colour.code, /^\d{4}$/)
    assert.match(colour.hex, /^#[0-9A-F]{6}$/)
    for (const locale of ['hy', 'ru', 'en'])
      assert.ok(colour.names[locale], `${colour.code} ${locale}`)
  }
  assert.equal(isDark('#0E0E10'), true)
  assert.equal(isDark('#F1F0EA'), false)
})

test('the builder speaks every pattern kind and problem in each language', () => {
  for (const locale of ['hy', 'ru', 'en']) {
    const b = builderCopy(locale)
    for (const kind of PATTERNS)
      assert.ok(b.patterns.kinds[kind.id], `${locale} ${kind.id}`)
    for (const key of ['patternEmpty', 'patternSmall', 'patternBridge'])
      assert.ok(b.patterns.problems[key], `${locale} ${key}`)
    assert.ok(
      b.material.title && b.paint.title && b.bend.title && b.view.solid,
      locale
    )
    assert.match(
      b.patterns.note(1, 'x', {
        size: 5,
        gap: 3,
        area: '10 × 10',
        cx: 1,
        cy: 2,
        angle: 15,
        count: 4,
      }),
      /15°/
    )
  }
  assert.equal(builderCopy('de'), builderCopy('hy'))
})
