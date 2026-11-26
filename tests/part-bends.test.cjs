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
const { applyBends, crossings, newBend } = load('utils/part-bends.js')
const { layPatterns, newPattern } = load('utils/part-patterns.js')
const { materialChoices, largestSheet, sameName } = load(
  'utils/part-materials.js'
)
const { partModel } = load('utils/part-mesh.js')
const {
  assemble,
  dropPlacement,
  jointMatrix,
  newJoint,
  partEdges,
  swapPlacements,
} = load('utils/part-assembly.js')
const { measureDxf } = load('utils/dxf-measure.js')
const { moreCopy } = load('utils/part-builder-more.js')
const THREE = require('three')

const sheet = (width, height) =>
  buildPart(templateById('blank'), { width, height, radius: 0 })
const near = (actual, expected, delta, label) =>
  assert.ok(
    Math.abs(actual - expected) <= delta,
    `${label}: ${actual} is not within ${delta} of ${expected}`
  )

test('bends drawn on a flat sheet go into the DXF and fold it', () => {
  const base = sheet(300, 100)
  const bends = [
    { axis: 'x', at: 60, angle: 90, up: true },
    { axis: 'x', at: 240, angle: 90, up: true },
  ]
  const { part, issue } = applyBends(base, bends, 2)
  assert.equal(issue, null)
  assert.equal(part.bends.length, 2)
  assert.deepEqual(part.bends[0], { x1: 60, y1: 0, x2: 60, y2: 100 })
  assert.equal(measureDxf(toDxf(part)).bends, 2)
  assert.equal(part.fold.axis, 'x')
  near(part.fold.bends[0].turn, Math.PI / 2, 1e-9, 'turn')
  near(
    part.fold.bends[0].allowance,
    (Math.PI / 2) * (2 + 0.8),
    1e-9,
    'allowance'
  )
  // Downwards turns the other way; level lines run across the height.
  const down = applyBends(
    base,
    [{ axis: 'y', at: 50, angle: 120, up: false }],
    2
  )
  assert.equal(down.issue, null)
  assert.deepEqual(down.part.bends[0], { x1: 0, y1: 50, x2: 300, y2: 50 })
  assert.ok(down.part.fold.bends[0].turn < 0)
  assert.equal(down.part.fold.axis, 'y')
  // Nothing to add, nothing changes.
  assert.deepEqual(applyBends(base, [], 2), { part: base, issue: null })
})

test('a bend line follows the outline of a shaped part', () => {
  const l = buildPart(
    templateById('l-plate'),
    defaults(templateById('l-plate'))
  )
  // 150 × 150 with a 40 mm leg: at x = 100 the sheet is only the bottom leg.
  assert.deepEqual(crossings(l, 'x', 100), [[0, 40]])
  assert.deepEqual(crossings(l, 'x', 20), [[0, 150]])
  const { part } = applyBends(
    l,
    [{ axis: 'x', at: 100, angle: 90, up: true }],
    2
  )
  assert.deepEqual(part.bends[0], { x1: 100, y1: 0, x2: 100, y2: 40 })
})

test('bends that cannot be made are named', () => {
  const base = sheet(300, 100)
  const check = (bends, t = 2) => applyBends(base, bends, t).issue
  assert.deepEqual(check([{ axis: 'x', at: 150, angle: 20 }]), {
    key: 'bendAngle',
    index: 0,
  })
  assert.deepEqual(check([{ axis: 'x', at: 3, angle: 90 }]), {
    key: 'bendEdge',
    index: 0,
  })
  assert.deepEqual(
    check([
      { axis: 'x', at: 100, angle: 90 },
      { axis: 'x', at: 108, angle: 90 },
    ]),
    { key: 'bendClose', index: 1 }
  )
  const holed = buildPart(
    templateById('rect-plate'),
    defaults(templateById('rect-plate'))
  )
  // The corner holes sit 15 mm in: a bend at 20 mm pulls them out of round.
  assert.deepEqual(
    applyBends(holed, [{ axis: 'x', at: 20, angle: 90 }], 2).issue,
    {
      key: 'holesBend',
      index: 0,
    }
  )
  for (const locale of ['hy', 'ru', 'en'])
    for (const key of ['bendAngle', 'bendEdge', 'bendClose'])
      assert.ok(moreCopy(locale).bends.problems[key], `${locale} ${key}`)
})

test('a new bend takes the middle of the widest free stretch', () => {
  const base = sheet(300, 100)
  assert.equal(newBend(base, [], 'x').at, 150)
  assert.equal(newBend(base, [{ at: 150 }], 'x').at, 75)
  assert.equal(newBend(base, [], 'y').at, 50)
})

test('patterns keep clear of level bend lines too', () => {
  const base = sheet(300, 300)
  const { part } = applyBends(
    base,
    [{ axis: 'y', at: 150, angle: 90, up: true }],
    2
  )
  const laid = layPatterns(
    part,
    [{ ...newPattern(part, 'circles', 2), width: 280, height: 280 }],
    2
  )
  const zone = part.fold.bends[0]
  for (const hole of laid.part.holes)
    for (const [, y] of samplePolygon(hole, 8))
      assert.ok(Math.abs(y - 150) >= zone.allowance / 2 + 2, 'off the bend')
})

test('the Materials section and the price list make one list', () => {
  const catalog = [
    {
      id: 1,
      name: 'Սև պողպատ',
      group: 'Թիթեղ',
      sheets: [
        { thickness: 3, width: 1250, length: 2500 },
        { thickness: 3, width: 1500, length: 3000 },
        { thickness: 2, width: 1250, length: 2500 },
      ],
    },
    { id: 2, name: 'Empty', sheets: [{ thickness: 0 }] },
  ]
  const pricing = [
    { id: 7, name: 'Սև պողպատ St37', thicknesses: [{ id: 70, thickness: 3 }] },
    { id: 8, name: 'AISI 304', thicknesses: [{ id: 80, thickness: 1 }] },
  ]
  const list = materialChoices(catalog, pricing)
  assert.deepEqual(
    list.map((m) => m.name),
    ['Սև պողպատ', 'AISI 304']
  )
  const [steel, stainless] = list
  assert.deepEqual(
    steel.thicknesses.map((t) => [t.thickness, t.pricingId, t.sheets.length]),
    [
      [2, null, 1],
      [3, 70, 2],
    ]
  )
  assert.deepEqual(largestSheet(steel.thicknesses[1]), {
    length: 3000,
    width: 1500,
  })
  assert.equal(largestSheet(stainless.thicknesses[0]), null)
  assert.equal(stainless.thicknesses[0].pricingId, 80)
  assert.ok(sameName('Սև-պողպատ', 'սև պողպատ St37'))
  assert.ok(!sameName('Steel', 'Aluminium'))
  assert.deepEqual(materialChoices([], []), [])
})

test('a part folds in 3D to its outside size and lies flat unfolded', () => {
  const angle = templateById('bent-l')
  const part = buildPart(angle, defaults(angle))
  const material = new THREE.MeshStandardMaterial()
  const model = partModel(part, 3, material)
  model.pose(0)
  const flat = new THREE.Box3()
    .setFromObject(model.group)
    .getSize(new THREE.Vector3())
  near(Math.max(flat.x, flat.y), part.width, 0.5, 'flat length')
  near(flat.z, 50, 0.01, 'width')
  model.pose(1)
  const bent = new THREE.Box3()
    .setFromObject(model.group)
    .getSize(new THREE.Vector3())
  // Leg A 80 and leg B 60 outside, give or take the bend's own rounding.
  near(Math.max(bent.x, bent.y), 80, 1.5, 'leg A')
  near(Math.min(bent.x, bent.y), 60, 1.5, 'leg B')
  model.dispose()

  // A sheet with bends drawn by hand folds into a channel.
  const { part: channel } = applyBends(
    sheet(200, 80),
    [
      { axis: 'x', at: 50, angle: 90, up: true },
      { axis: 'x', at: 150, angle: 90, up: true },
    ],
    2
  )
  const folded = partModel(channel, 2, material)
  const size = new THREE.Box3()
    .setFromObject(folded.group)
    .getSize(new THREE.Vector3())
  near(size.y, 50, 2, 'sides stand up')
  // Between the bend lines 100 mm of flat sheet; outside, the base grows by
  // the bends' own rounding: 100 − allowance + 2 × (radius + thickness).
  near(size.x, 100 - (Math.PI / 2) * 2.8 + 8, 1.5, 'base outside')
  folded.dispose()
})

test('assembly joints put a part edge to edge at the angle asked', () => {
  const plate = (w, h, t) =>
    new THREE.Box3(new THREE.Vector3(0, 0, -h), new THREE.Vector3(w, t, 0))
  const base = plate(400, 300, 2)
  const wall = plate(400, 200, 2)
  // The wall as a solid, where a matrix puts it.
  const placed = (matrix) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(400, 2, 200).translate(200, 1, -100)
    )
    mesh.applyMatrix4(matrix)
    return new THREE.Box3().setFromObject(mesh)
  }
  // The wall stands up on the base's back edge.
  const [, up] = assemble(
    [base, wall],
    [2, 2],
    [{ type: 'root' }, { ...newJoint([]), parentEdge: 'top', angle: 90 }]
  )
  const box = placed(up)
  near(box.min.y, 0, 2, 'stands on the base')
  near(box.max.y, 201, 2, 'as tall as the wall')
  near(box.min.z, -301, 2, 'at the back edge')
  near(box.max.z, -299, 2, 'thin across')
  // At 180° it carries the base on, coplanar.
  const on = jointMatrix(partEdges(base, 2).right, partEdges(wall, 2).left, {
    angle: 180,
  })
  const flatBox = placed(on)
  near(flatBox.min.x, 400, 0.01, 'starts at the right edge')
  near(flatBox.max.y - flatBox.min.y, 2, 0.01, 'stays flat')
  // A positive offset slides along the drawing's axes, whichever edge it is:
  // to the right on the front and back edges, backwards on the side ones.
  const short = plate(300, 150, 2)
  const slid = (parentEdge, offset) => {
    const [, matrix] = assemble(
      [base, short],
      [2, 2],
      [{ type: 'root' }, { ...newJoint([]), parentEdge, offset }]
    )
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(300, 2, 150).translate(150, 1, -75)
    )
    mesh.applyMatrix4(matrix)
    return new THREE.Box3().setFromObject(mesh)
  }
  near(slid('bottom', 50).min.x, 100, 0.5, 'front edge: to the right')
  near(slid('top', 50).min.x, 100, 0.5, 'back edge: to the right')
  near(
    slid('right', 50).getCenter(new THREE.Vector3()).z,
    -200,
    0.5,
    'right edge: back'
  )
  near(
    slid('left', 50).getCenter(new THREE.Vector3()).z,
    -200,
    0.5,
    'left edge: back'
  )
  // Joints pick the base's free edges in turn; free placements keep their matrix.
  assert.equal(
    newJoint([
      { type: 'root' },
      { type: 'joint', parent: 0, parentEdge: 'bottom' },
    ]).parentEdge,
    'right'
  )
  const moved = new THREE.Matrix4().makeTranslation(10, 20, 30)
  const [, kept] = assemble(
    [base, wall],
    [2, 2],
    [{ type: 'root' }, { type: 'free', matrix: moved.toArray() }]
  )
  assert.deepEqual(kept.toArray(), moved.toArray())
  // Side by side: in order along x, a gap apart.
  const row = assemble([base, wall], [2, 2], [], 'row')
  assert.ok(row[1].elements[12] > 400)
})

test('joints follow their parts when the order changes or one goes', () => {
  const joint = (parent, parentEdge) => ({
    ...newJoint([]),
    parent,
    parentEdge,
  })
  const placements = [
    { type: 'root' },
    joint(0, 'bottom'),
    joint(0, 'right'),
    joint(2, 'top'),
  ]
  // Parts 3 and 2 swap: each keeps the part it joins.
  const swapped = swapPlacements(placements, 2, 1)
  assert.deepEqual(
    swapped.map((p) => p.parent),
    [undefined, 0, 0, 1]
  )
  assert.equal(swapped[1].parentEdge, 'right')
  assert.equal(swapped[3].parentEdge, 'top')
  // The first part moves down: it joins the new first part on a free edge.
  const reRooted = swapPlacements(
    [{ type: 'root' }, joint(0, 'bottom'), joint(0, 'right')],
    0,
    1
  )
  assert.equal(reRooted[0].type, 'root')
  assert.equal(reRooted[1].parent, 0)
  assert.equal(reRooted[1].parentEdge, 'bottom')
  assert.equal(reRooted[2].parent, 1, 'still on the part it joined')
  // Part 3 goes: part 4, which stood on it, joins the first part on a free edge.
  const dropped = dropPlacement(placements, 2)
  assert.equal(dropped.length, 3)
  assert.equal(dropped[1].parentEdge, 'bottom')
  assert.equal(dropped[2].parent, 0)
  assert.equal(dropped[2].parentEdge, 'right')
  // Free placements stay as they were left.
  const free = { type: 'free', matrix: new THREE.Matrix4().toArray() }
  assert.equal(
    dropPlacement([{ type: 'root' }, joint(0, 'bottom'), free], 1)[1],
    free
  )
})

test('saved assembly exports every placed detail as STEP in millimetres', async () => {
  const { placedParts, assemblyStep } = load('utils/assembly-geometry.js')
  const parts = placedParts(
    [1, 2].map(thickness => ({ part: sheet(40, 20), thickness })),
    [],
    'row'
  )
  const cad = await require('occt-import-js')()
  const result = cad.ReadStepFile(Buffer.from(assemblyStep(parts)), null)
  assert.equal(result.success, true)
  assert.equal(result.meshes.length, 2)
  const bounds = result.meshes.map(mesh => {
    const xs = mesh.attributes.position.array.filter((_, i) => i % 3 === 0)
    return [Math.min(...xs), Math.max(...xs)]
  })
  assert.deepEqual(bounds, [[0, 40], [60, 100]])
})
