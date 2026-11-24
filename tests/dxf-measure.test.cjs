const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const { transformSync } = require('@babel/core')

// The same drawings as metalworks-server tests/Unit/DxfMeasureTest.php, so the
// viewer shows the numbers the server prices with.
const source = fs.readFileSync(
  path.join(__dirname, '..', 'utils', 'dxf-measure.js'),
  'utf8'
)
const code = transformSync(source, {
  configFile: false,
  babelrc: false,
  plugins: [require('@babel/plugin-transform-modules-commonjs')],
}).code
const loaded = { exports: {} }
// eslint-disable-next-line no-new-func
new Function('module', 'exports', code)(loaded, loaded.exports)
const { measureDxf } = loaded.exports

const dxf = (entities, units = 4, blocks = '') =>
  `0\nSECTION\n2\nHEADER\n9\n$INSUNITS\n70\n${units}\n0\nENDSEC\n` +
  `0\nSECTION\n2\nBLOCKS\n${blocks}0\nENDSEC\n` +
  `0\nSECTION\n2\nENTITIES\n${entities.join('')}0\nENDSEC\n0\nEOF\n`
const line = (x1, y1, x2, y2, layer = '0') =>
  `0\nLINE\n8\n${layer}\n10\n${x1}\n20\n${y1}\n11\n${x2}\n21\n${y2}\n`
const circle = (x, y, r) => `0\nCIRCLE\n8\n0\n10\n${x}\n20\n${y}\n40\n${r}\n`
const lwpolyline = (vertices, closed) =>
  `0\nLWPOLYLINE\n8\n0\n90\n${vertices.length}\n70\n${closed ? 1 : 0}\n` +
  vertices
    .map((v) => `10\n${v[0]}\n20\n${v[1]}\n${v[2] ? `42\n${v[2]}\n` : ''}`)
    .join('')
// The R12 form the customer's template builder writes.
const polyline = (vertices) =>
  `0\nPOLYLINE\n8\n0\n66\n1\n10\n0\n20\n0\n30\n0\n70\n1\n` +
  vertices
    .map(
      (v) =>
        `0\nVERTEX\n8\n0\n10\n${v[0]}\n20\n${v[1]}\n30\n0\n${
          v[2] ? `42\n${v[2]}\n` : ''
        }`
    )
    .join('') +
  `0\nSEQEND\n8\n0\n`
const near = (actual, expected, delta, label) =>
  assert.ok(
    Math.abs(actual - expected) <= delta,
    `${label}: ${actual} is not within ${delta} of ${expected}`
  )

test('a plate with a hole has two pierces and its net area', () => {
  const m = measureDxf(
    dxf([
      lwpolyline(
        [
          [0, 0],
          [100, 0],
          [100, 50],
          [0, 50],
        ],
        true
      ),
      circle(50, 25, 5),
    ])
  )
  near(m.cutLengthMm, 300 + 2 * Math.PI * 5, 0.2, 'cut')
  assert.equal(m.pierces, 2)
  assert.equal(m.bends, 0)
  assert.deepEqual([m.widthMm, m.heightMm], [100, 50])
  near(m.areaMm2, 5000 - Math.PI * 25, 0.5, 'area')
})

test('loose lines join into one outline and bend lines are not cut', () => {
  const m = measureDxf(
    dxf([
      line(0, 0, 100, 0),
      line(100, 0, 100, 50.00001),
      line(100, 50, 0, 50),
      line(0, 50, 0, 0),
      line(40, 0, 40, 50, 'BEND_LINES'),
    ])
  )
  near(m.cutLengthMm, 300, 0.01, 'cut')
  assert.equal(m.pierces, 1)
  assert.equal(m.bends, 1)
  assert.equal(m.openContours, 0)
  near(m.areaMm2, 5000, 0.01, 'area')
})

test('bulged polyline arcs are measured as arcs', () => {
  const m = measureDxf(
    dxf([
      lwpolyline(
        [
          [0, 0, 0],
          [30, 0, 1],
          [30, 10, 0],
          [0, 10, 1],
        ],
        true
      ),
    ])
  )
  near(m.cutLengthMm, 60 + 2 * Math.PI * 5, 0.1, 'cut')
  near(m.widthMm, 40, 0.1, 'width')
  near(m.areaMm2, 300 + Math.PI * 25, 0.5, 'area')
  assert.equal(m.pierces, 1)
})

test('blocks are placed and scaled and inches become millimetres', () => {
  const block = `0\nBLOCK\n8\n0\n2\nHOLE\n70\n0\n10\n5\n20\n5\n${circle(
    5,
    5,
    10
  )}0\nENDBLK\n8\n0\n`
  const m = measureDxf(
    dxf(
      ['0\nINSERT\n8\n0\n2\nHOLE\n10\n100\n20\n100\n41\n2\n42\n2\n'],
      4,
      block
    )
  )
  near(m.cutLengthMm, 2 * Math.PI * 20, 0.1, 'cut')
  near(m.widthMm, 40, 0.1, 'width')
  const inch = measureDxf(
    dxf(
      [
        lwpolyline(
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
          ],
          true
        ),
      ],
      1
    )
  )
  near(inch.cutLengthMm, 4 * 25.4, 0.01, 'inch cut')
  near(inch.areaMm2, 25.4 * 25.4, 0.1, 'inch area')
})

test('outlines that do not close are counted', () => {
  // Three sides of a frame, a loose line and a closed hole: two open outlines.
  const m = measureDxf(
    dxf([
      line(0, 0, 100, 0),
      line(100, 0, 100, 50),
      line(100, 50, 0, 50),
      line(0, 70, 100, 70),
      circle(50, 25, 5),
    ])
  )
  assert.equal(m.openContours, 2)
  assert.equal(m.pierces, 3)

  // Two squares that touch at a corner are closed, though four ends meet there.
  const square = (x, y) => [
    line(x, y, x + 10, y),
    line(x + 10, y, x + 10, y + 10),
    line(x + 10, y + 10, x, y + 10),
    line(x, y + 10, x, y),
  ]
  assert.equal(
    measureDxf(dxf([...square(0, 0), ...square(10, 10)])).openContours,
    0
  )

  // A gap wider than the join tolerance leaves an outline open.
  const gap = measureDxf(
    dxf([
      line(0, 0, 100, 0),
      line(100, 0, 100, 50),
      line(100, 50, 0, 50),
      line(0, 50, 0, 0.2),
    ])
  )
  assert.equal(gap.openContours, 1)
})

test('an R12 polyline keeps its bulges and a bend line stays a bend', () => {
  // A slot 100 mm between its round ends of radius 10, a hole and a bend line.
  const m = measureDxf(
    dxf([
      polyline([
        [10, 0, 0],
        [110, 0, 1],
        [110, 20, 0],
        [10, 20, 1],
      ]),
      circle(10, 10, 4),
      line(60, 0, 60, 20, 'BEND'),
    ])
  )
  near(m.cutLengthMm, 200 + 2 * Math.PI * 10 + 2 * Math.PI * 4, 0.2, 'cut')
  assert.equal(m.pierces, 2)
  assert.equal(m.bends, 1)
  assert.deepEqual([m.widthMm, m.heightMm], [120, 20])
  near(m.areaMm2, 100 * 20 + Math.PI * 100 - Math.PI * 16, 1, 'area')
})

test('a sheet with thousands of holes is measured quickly', () => {
  const holes = []
  for (let i = 0; i < 50; i++)
    for (let j = 0; j < 50; j++) holes.push(circle(10 + i * 20, 10 + j * 20, 4))
  const started = Date.now()
  const m = measureDxf(
    dxf([
      lwpolyline(
        [
          [0, 0],
          [1000, 0],
          [1000, 1000],
          [0, 1000],
        ],
        true
      ),
      ...holes,
    ])
  )
  assert.ok(Date.now() - started < 5000, 'measured in under 5 s')
  assert.equal(m.pierces, 2501)
  near(m.areaMm2, 1000000 - 2500 * Math.PI * 16, 1250, 'area')
})

test('files that cannot be measured are refused', () => {
  for (const text of [
    'not a drawing',
    'AutoCAD Binary DXF\r\n\x1A\x00',
    dxf(['0\nTEXT\n8\n0\n10\n0\n20\n0\n40\n5\n1\nHello\n']),
  ])
    assert.throws(() => measureDxf(text))
})
