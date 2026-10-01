const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const helpers = import(moduleUrl(read('utils/cad-model.js')))
const preview = import(moduleUrl(read('utils/factory-preview.js')))
const fixtures = path.join(path.dirname(require.resolve('occt-import-js/package.json')), 'test/testfiles')
let runtime
const occt = () => runtime || (runtime = require('occt-import-js')({ print() {}, printErr() {} }))
const options = { linearUnit: 'millimeter', linearDeflectionType: 'bounding_box_ratio', linearDeflection: 0.001, angularDeflection: 0.3 }
const sample = () => ({ success: true, meshes: [{ name: 'Part', attributes: { position: { array: [0, 0, 0, 10, 0, 0, 0, 20, 0] } }, index: { array: [0, 1, 2] } }] })

test('genuine IGES geometry is detected inside an IQS-named payload', async () => {
  const bytes = fs.readFileSync(path.join(fixtures, 'cube-10x10mm/Cube 10x10.igs'))
  const detected = await (await preview).inspectFactoryPreview(new Blob([bytes]), 'part.iqs', 'file')
  assert.equal(detected.type, 'model')
  assert.equal(detected.format, 'iges')
  const model = (await helpers).normalizeCadModel((await occt()).ReadIgesFile(detected.bytes, options), detected.format, 'mm')
  assert.ok(model.triangles >= 12)
  assert.ok(model.meshes.every(mesh => mesh.index.length > 0 && mesh.position.length > 0))
  for (const size of model.bounds.max.map((max, axis) => max - model.bounds.min[axis])) assert.ok(Math.abs(size - 10) < 0.01)
  assert.equal(model.unit, 'mm')
  assert.equal((await helpers).modelTransferables(model).length, model.meshes.length * 3)
})

test('STEP source units are normalized to millimeters by the CAD importer', async () => {
  const sizes = []
  for (const file of ['cube-mm.step', 'cube-m.step', 'cube-in.step']) {
    const bytes = fs.readFileSync(path.join(fixtures, 'cube-units', file))
    const detected = await (await preview).inspectFactoryPreview(new Blob([bytes]), 'renamed.iqs', 'file')
    assert.equal(detected.format, 'step')
    const model = (await helpers).normalizeCadModel((await occt()).ReadStepFile(detected.bytes, options), 'step', 'mm')
    sizes.push(model.bounds.max.map((max, axis) => max - model.bounds.min[axis]))
  }
  assert.deepEqual(sizes, [[1000, 1000, 1000], [1000, 1000, 1000], [1000, 1000, 1000]])
})

test('an actual STEP assembly retains multiple named parts', async () => {
  const bytes = fs.readFileSync(path.join(fixtures, 'cax-if/as1_pe_203.stp'))
  const model = (await helpers).normalizeCadModel((await occt()).ReadStepFile(bytes, options), 'step', 'mm')
  assert.ok(model.meshes.length > 1)
  assert.ok(model.meshes.some(mesh => mesh.name))
  assert.ok(model.triangles > 12)
  assert.ok(model.vertices > 8)
  assert.ok(model.bounds.min.every(Number.isFinite))
})

test('ASCII and binary STL and negative-index OBJ are recognized by their contents', async () => {
  const { inspectFactoryPreview } = await preview
  const stl = fs.readFileSync(path.join(fixtures, 'cube-10x10mm/Cube 10x10.stl'))
  assert.equal((await inspectFactoryPreview(new Blob([stl]), 'model.iqs', 'file')).format, 'stl')
  const binary = Buffer.alloc(134)
  binary.writeUInt32LE(1, 80)
  assert.equal((await inspectFactoryPreview(new Blob([binary]), 'model.iqs', 'file')).format, 'stl')
  const obj = 'v 0 0 0\nv 1 0 0\nv 0 1 0\nf -3 -2 -1\n'
  assert.equal((await inspectFactoryPreview(new Blob([obj]), 'model.iqs', 'file')).format, 'obj')
})

test('IQS text and unknown binary payloads are not invented into models', async () => {
  const { inspectFactoryPreview } = await preview
  const text = 'G01 X20 Y30\nԾրագիր'
  assert.equal((await inspectFactoryPreview(new Blob([text]), 'program.iqs', 'file')).type, 'text')
  assert.equal((await inspectFactoryPreview(new Blob([Buffer.from([0, 255, 0, 1])]), 'unknown.iqs', 'file')).type, 'file')
  assert.equal((await inspectFactoryPreview(new Blob(['broken']), 'broken.igs', 'file')).format, 'iges')
  const failed = (await occt()).ReadIgesFile(new Uint8Array([0, 1, 2, 3]), options)
  const { normalizeCadModel } = await helpers
  assert.throws(() => normalizeCadModel(failed, 'iges', 'mm'), { code: 'empty' })
})

test('nonfinite positions, invalid indices and invalid colored faces never reach WebGL', async () => {
  const { normalizeCadModel } = await helpers
  for (const mutate of [
    mesh => { mesh.attributes.position.array[1] = NaN },
    mesh => { mesh.attributes.position.array[1] = Infinity },
    mesh => { mesh.index.array[0] = 0.5 },
    mesh => { mesh.index.array[0] = -1 },
    mesh => { mesh.index.array[0] = 3 },
    mesh => { mesh.index.array = { length: 999999999 } },
    mesh => { mesh.brep_faces = [{ first: 0, last: 1, color: [1, 0, 0] }] },
    mesh => { mesh.brep_faces = [{ first: 0, last: 0, color: [1, 0, 0] }, { first: 0, last: 0, color: [0, 1, 0] }] },
  ]) {
    const source = sample(); mutate(source.meshes[0])
    assert.throws(() => normalizeCadModel(source, 'stl', null), { code: 'invalid' })
  }
})

test('geometry complexity is bounded before output allocation', async () => {
  const { normalizeCadModel, MAX_MODEL_PARTS, MAX_MODEL_TRIANGLES, MAX_MODEL_VERTICES } = await helpers
  const source = sample()
  source.meshes = Array(MAX_MODEL_PARTS + 1).fill(source.meshes[0])
  assert.throws(() => normalizeCadModel(source, 'obj', null), { code: 'too_complex' })
  const tooManyVertices = sample()
  tooManyVertices.meshes[0].attributes.position.array = new Float32Array((MAX_MODEL_VERTICES + 1) * 3)
  assert.throws(() => normalizeCadModel(tooManyVertices, 'stl', null), { code: 'too_complex' })
  const tooManyTriangles = sample()
  tooManyTriangles.meshes[0].index.array = new Uint32Array((MAX_MODEL_TRIANGLES + 1) * 3)
  assert.throws(() => normalizeCadModel(tooManyTriangles, 'obj', null), { code: 'too_complex' })
})
