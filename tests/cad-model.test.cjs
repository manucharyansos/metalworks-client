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

// A single-part STEP file whose solid bodies are boxes, listed in the shape
// representation in `order` (like a SolidWorks multi-body part).
function boxesStep(boxes, order) {
  const lines = []
  let next = 0
  const add = (entity) => { lines.push(`#${++next} = ${entity} ;`); return `#${next}` }
  const real = (value) => value.toFixed(1)
  const point = (p) => add(`CARTESIAN_POINT ( 'NONE', ( ${p.map(real).join(', ')} ) )`)
  const direction = (d) => add(`DIRECTION ( 'NONE', ( ${d.map(real).join(', ')} ) )`)
  const mm = add('( LENGTH_UNIT ( ) NAMED_UNIT ( * ) SI_UNIT ( .MILLI., .METRE. ) )')
  const rad = add('( NAMED_UNIT ( * ) PLANE_ANGLE_UNIT ( ) SI_UNIT ( $, .RADIAN. ) )')
  const sr = add('( NAMED_UNIT ( * ) SI_UNIT ( $, .STERADIAN. ) SOLID_ANGLE_UNIT ( ) )')
  const accuracy = add(`UNCERTAINTY_MEASURE_WITH_UNIT ( LENGTH_MEASURE ( 1.0E-05 ), ${mm}, 'distance_accuracy_value', 'NONE' )`)
  const context = add(`( GEOMETRIC_REPRESENTATION_CONTEXT ( 3 ) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT ( ( ${accuracy} ) ) GLOBAL_UNIT_ASSIGNED_CONTEXT ( ( ${mm}, ${rad}, ${sr} ) ) REPRESENTATION_CONTEXT ( 'NONE', 'WORKASPACE' ) )`)
  const solids = boxes.map(({ name, min, max }) => {
    const v = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]
      .map((corner) => corner.map((c, axis) => (c ? max[axis] : min[axis])))
    const vertices = v.map((p) => add(`VERTEX_POINT ( 'NONE', ${point(p)} )`))
    const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].map(([a, b]) => {
      const d = v[b].map((value, axis) => value - v[a][axis])
      const length = Math.hypot(...d)
      const line = add(`LINE ( 'NONE', ${point(v[a])}, ${add(`VECTOR ( 'NONE', ${direction(d.map((value) => value / length))}, ${real(length)} )`)} )`)
      return add(`EDGE_CURVE ( 'NONE', ${vertices[a]}, ${vertices[b]}, ${line}, .T. )`)
    })
    // [edge, same direction] loops, counter-clockwise seen from outside.
    const faces = [
      [[0, 0, -1], [[3, 0], [2, 0], [1, 0], [0, 0]]],
      [[0, 0, 1], [[4, 1], [5, 1], [6, 1], [7, 1]]],
      [[0, -1, 0], [[0, 1], [9, 1], [4, 0], [8, 0]]],
      [[0, 1, 0], [[2, 1], [11, 1], [6, 0], [10, 0]]],
      [[-1, 0, 0], [[8, 1], [7, 0], [11, 0], [3, 1]]],
      [[1, 0, 0], [[1, 1], [10, 1], [5, 0], [9, 0]]],
    ].map(([normal, loop]) => {
      const edgesOfLoop = loop.map(([edge, same]) => add(`ORIENTED_EDGE ( 'NONE', *, *, ${edges[edge]}, ${same ? '.T.' : '.F.'} )`))
      const bound = add(`FACE_OUTER_BOUND ( 'NONE', ${add(`EDGE_LOOP ( 'NONE', ( ${edgesOfLoop.join(', ')} ) )`)}, .T. )`)
      const origin = normal.map((n, axis) => (n > 0 ? max[axis] : min[axis]))
      const reference = normal[0] ? [0, 1, 0] : [1, 0, 0]
      const plane = add(`PLANE ( 'NONE', ${add(`AXIS2_PLACEMENT_3D ( 'NONE', ${point(origin)}, ${direction(normal)}, ${direction(reference)} )`)} )`)
      return add(`ADVANCED_FACE ( 'NONE', ( ${bound} ), ${plane}, .T. )`)
    })
    return add(`MANIFOLD_SOLID_BREP ( '${name}', ${add(`CLOSED_SHELL ( 'NONE', ( ${faces.join(', ')} ) )`)} )`)
  })
  const placement = add(`AXIS2_PLACEMENT_3D ( 'NONE', ${point([0, 0, 0])}, ${direction([0, 0, 1])}, ${direction([1, 0, 0])} )`)
  const representation = add(`ADVANCED_BREP_SHAPE_REPRESENTATION ( 'Bodies', ( ${order.map((i) => solids[i]).join(', ')}, ${placement} ), ${context} )`)
  const application = add("APPLICATION_CONTEXT ( 'automotive_design' )")
  add(`APPLICATION_PROTOCOL_DEFINITION ( 'international standard', 'automotive_design', 2000, ${application} )`)
  const product = add(`PRODUCT ( 'Bodies', 'Bodies', '', ( ${add(`PRODUCT_CONTEXT ( 'NONE', ${application}, 'mechanical' )`)} ) )`)
  const formation = add(`PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE ( 'ANY', '', ${product}, .NOT_KNOWN. )`)
  const definition = add(`PRODUCT_DEFINITION ( 'UNKNOWN', '', ${formation}, ${add(`PRODUCT_DEFINITION_CONTEXT ( 'detailed design', ${application}, 'design' )`)} )`)
  add(`SHAPE_DEFINITION_REPRESENTATION ( ${add(`PRODUCT_DEFINITION_SHAPE ( 'NONE', 'NONE', ${definition} )`)}, ${representation} )`)
  return [
    'ISO-10303-21;', 'HEADER;', "FILE_DESCRIPTION ( ( 'STEP AP214' ), '1' );",
    "FILE_NAME ( 'Bodies.STEP', '2026-10-30T00:00:00', ( '' ), ( '' ), 'test', 'test', '' );",
    "FILE_SCHEMA ( ( 'AUTOMOTIVE_DESIGN' ) );", 'ENDSEC;', '', 'DATA;', ...lines, 'ENDSEC;', 'END-ISO-10303-21;', '',
  ].join('\r\n')
}

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
  assert.ok(model.triangles > 12)
  assert.ok(model.vertices > 8)
  assert.ok(model.bounds.min.every(Number.isFinite))
  // The solids are only called "SOLID"; the assembly tree names them.
  const names = model.meshes.map(mesh => mesh.name)
  assert.equal(names[0], 'PLATE')
  assert.ok(names.includes('L_BRACKET_ASSEMBLY_ASM (14)'))
  assert.ok(names.includes('ROD_ASM (3)'))
  assert.equal(new Set(names).size, names.length)
})

test('repeated part names are numbered and unique names stay as they are', async () => {
  const bytes = fs.readFileSync(path.join(fixtures, 'cax-if/as1-oc-214.stp'))
  const names = (await helpers).normalizeCadModel((await occt()).ReadStepFile(bytes, options), 'step', 'mm').meshes.map(mesh => mesh.name)
  assert.deepEqual(names.filter(name => name.startsWith('nut')), ['nut (1)', 'nut (2)', 'nut (3)', 'nut (4)', 'nut (5)', 'nut (6)', 'nut (7)', 'nut (8)'])
  assert.ok(names.includes('plate'))
  assert.ok(names.includes('rod'))
  assert.equal(new Set(names).size, names.length)
})

test('a multi-body STEP part takes the body names written in the file', async () => {
  const { stepBodyNames, normalizeCadModel } = await helpers
  const step = [
    'DATA;',
    "#10 = MANIFOLD_SOLID_BREP ( '\\X2\\0421043a044004430433043b0435043d04380435\\X0\\5', #20 ) ;",
    "#11 = MANIFOLD_SOLID_BREP ( 'Boss-Extrude1', #21 ) ;",
    "#12 = BREP_WITH_VOIDS ( 'Caf\\X\\E9 d''angle', #22, ( #23 ) ) ;",
    "#13 = AXIS2_PLACEMENT_3D ( 'NONE', #1, #2, #3 ) ;",
    "#14 = ADVANCED_BREP_SHAPE_REPRESENTATION ( 'Part', ( #11, #13,\r\n #10, #12 ), #30 ) ;",
    "#15 = SHAPE_REPRESENTATION ( 'Part', ( #13 ), #30 ) ;",
  ].join('\r\n')
  const bodies = stepBodyNames(step)
  assert.deepEqual(bodies, ['Boss-Extrude1', 'Скругление5', "Café d'angle"])
  const source = sample()
  source.meshes = [0, 1, 2].map(() => sample().meshes[0])
  source.meshes.forEach(mesh => { mesh.name = '' })
  source.root = { name: 'Moxraman', meshes: [0, 1, 2], children: [] }
  assert.deepEqual(normalizeCadModel(source, 'step', 'mm', { bodyNames: bodies }).meshes.map(mesh => mesh.name), bodies)
  // A body count that does not match the parts is not trusted.
  assert.deepEqual(normalizeCadModel(source, 'step', 'mm', { bodyNames: bodies.slice(1) }).meshes.map(mesh => mesh.name), ['Moxraman (1)', 'Moxraman (2)', 'Moxraman (3)'])
  // Assemblies (several parts with their own bodies) keep the tree names.
  assert.equal(stepBodyNames(step + "\r\n#16 = ADVANCED_BREP_SHAPE_REPRESENTATION ( 'Other', ( #10 ), #30 ) ;"), null)
  assert.equal(stepBodyNames(fs.readFileSync(path.join(fixtures, 'cax-if/as1-oc-214.stp'), 'utf8')), null)
})

test('each body name lands on the body it belongs to after OpenCascade import', async () => {
  const { stepBodyNames, normalizeCadModel } = await helpers
  const boxes = [
    { name: 'Alpha', min: [0, 0, 0], max: [10, 10, 10] },
    { name: '\\X2\\0411043504420430\\X0\\', min: [100, 0, 0], max: [130, 20, 5] },
    { name: 'Gamma', min: [300, 0, 0], max: [310, 50, 50] },
  ]
  const step = boxesStep(boxes, [2, 0, 1])
  const model = normalizeCadModel((await occt()).ReadStepFile(Buffer.from(step), options), 'step', 'mm', { bodyNames: stepBodyNames(step) })
  assert.equal(model.meshes.length, 3)
  const expected = ['Alpha', 'Бета', 'Gamma']
  for (const mesh of model.meshes) {
    let minX = Infinity
    for (let i = 0; i < mesh.position.length; i += 3) minX = Math.min(minX, mesh.position[i])
    const box = boxes.findIndex(({ min }) => Math.abs(min[0] - minX) < 0.01)
    assert.equal(mesh.name, expected[box])
  }
  assert.deepEqual(model.meshes.map(mesh => mesh.name), ['Gamma', 'Alpha', 'Бета'])
})

test('the CAD worker parses with the webpack 4 parser, since Babel does not process it', () => {
  const webpack = path.dirname(require.resolve('webpack/package.json'))
  const acorn = require(require.resolve('acorn', { paths: [webpack] }))
  assert.doesNotThrow(() => acorn.parse(read('workers/cad-model.worker.js'), { ecmaVersion: 11, sourceType: 'module' }))
})

test('type names such as SOLID or Body2 are not shown as part names', async () => {
  const { normalizeCadModel } = await helpers
  const source = sample()
  source.meshes = ['SOLID', 'Body2', 'NONE', 'Bracket'].map(name => ({ ...sample().meshes[0], name }))
  assert.deepEqual(normalizeCadModel(source, 'step', 'mm').meshes.map(mesh => mesh.name), ['', '', '', 'Bracket'])
  // A single unnamed part is named after its file.
  const bytes = fs.readFileSync(path.join(fixtures, 'cube-10x10mm/Cube 10x10.igs'))
  const model = normalizeCadModel((await occt()).ReadIgesFile(bytes, options), 'iges', 'mm', { filename: 'uploads/Cube 10x10.igs' })
  assert.deepEqual(model.meshes.map(mesh => mesh.name), ['Cube 10x10'])
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

test('zero normals stored in a file are dropped so the viewer computes lighting', async () => {
  const { normalizeCadModel } = await helpers
  const zero = sample()
  zero.meshes[0].attributes.normal = { array: [0, 0, 0, 0, 0, 0, 0, 0, 0] }
  assert.equal(normalizeCadModel(zero, 'stl', null).meshes[0].normal, null)
  const real = sample()
  real.meshes[0].attributes.normal = { array: [0, 0, 1, 0, 0, 1, 0, 0, 1] }
  assert.deepEqual(Array.from(normalizeCadModel(real, 'stl', null).meshes[0].normal), [0, 0, 1, 0, 0, 1, 0, 0, 1])
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
