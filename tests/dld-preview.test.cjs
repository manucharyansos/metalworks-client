const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { DOMParser } = require('@xmldom/xmldom')
const helpers = import('data:text/javascript;base64,' + fs.readFileSync('utils/dld-preview.js').toString('base64'))
const preview = import('data:text/javascript;base64,' + fs.readFileSync('utils/factory-preview.js').toString('base64'))
const square = '4 0 0 10 0 false 10 0 10 10 false 10 10 0 10 false 0 10 0 0 false'
const xml = (hull = square, holes = '') => `<Workpiece><WorkpieceName value="Part"/><WorkpieceThickness value="1.5"/><StaticComponent><WorkpieceComponentName value="Plane"/><StaticComponentPart><StaticComponentHull value="${hull}"/><StaticComponentHoles value="${holes}"/></StaticComponentPart></StaticComponent></Workpiece>`
test('DLD contours preserve bounds and holes, flipping Y for SVG', async () => {
  const { parseDld } = await helpers
  const d = parseDld(xml(square, '1 Outline 1 4 5 4 5 true false 5 5'), DOMParser)
  assert.deepEqual(d.bounds, { minX: 0, minY: -10, maxX: 10, maxY: 0 })
  assert.equal(d.thickness, '1.5')
  assert.match(d.parts[0].path, /M0 0L10 0L10 -10L0 -10L0 0Z/)
  assert.match(d.parts[0].path, /A1 1 0 1 0 6 -5A1 1 0 1 0 4 -5Z/)
})
test('DLD rejects entities, unclosed or disconnected contours and invalid arcs', async () => {
  const { parseDld } = await helpers
  for (const source of ['<!DOCTYPE x>'+xml(), '<broken>', xml('1 0 0 1 1 false'), xml('2 0 0 1 1 false 2 2 0 0 false'), xml('1 0 0 0 0 true false 0 0'), xml('1 NaN 0 0 0 false'), xml('20001')]) assert.throws(() => parseDld(source, DOMParser))
  assert.throws(() => parseDld(' '.repeat(8 * 1024 * 1024 + 1), DOMParser))
})
test('DLD routing retains complete XML, including UTF-16, without text truncation', async () => {
  const { inspectFactoryPreview } = await preview
  const source = xml() + ' '.repeat(200001)
  const result = await inspectFactoryPreview(new Blob([source]), 'part.dld', 'file')
  assert.equal(result.type, 'dld'); assert.equal(result.text, source)
  const utf16 = await inspectFactoryPreview(new Blob([Buffer.from([255, 254]), Buffer.from(xml(), 'utf16le')]), 'part.dld', 'file')
  assert.equal(utf16.type, 'dld'); assert.equal(utf16.text, xml())
})
