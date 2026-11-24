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

const {
  COUNTS,
  PROBLEMS,
  SHEET,
  TEMPLATES,
  buildPart,
  defaults,
  problem,
  svgPath,
  templateById,
  toDxf,
} = load('utils/part-templates.js')
const { measureDxf } = load('utils/dxf-measure.js')
const { mm, partFileName, partNote, problemText, templateCopy } = load(
  'utils/part-template-copy.js'
)

const near = (actual, expected, delta, label) =>
  assert.ok(
    Math.abs(actual - expected) <= delta,
    `${label}: ${actual} is not within ${delta} of ${expected}`
  )
const measure = (part) => measureDxf(toDxf(part))
const allowance = (t) => (Math.PI / 2) * (t + 0.4 * t)

// The part's own size, its contours and bend lines, as the server's measurer reads them.
function assertMeasures(template, part, label) {
  const m = measure(part)
  near(m.widthMm, part.width, 0.1, `${label} width`)
  near(m.heightMm, part.height, 0.1, `${label} height`)
  assert.equal(m.pierces, 1 + part.holes.length, `${label} pierces`)
  assert.equal(m.bends, template.bends || 0, `${label} bends`)
  assert.ok(m.areaMm2 > 0, `${label} area`)
  // Holes stay inside the outline: the outline alone spans the whole part.
  const outline = measure({ outline: part.outline, holes: [], bends: [] })
  near(outline.widthMm, part.width, 0.1, `${label} outline width`)
  near(outline.heightMm, part.height, 0.1, `${label} outline height`)
  return m
}

test('every template is valid at its defaults and its DXF measures as drawn', () => {
  assert.equal(TEMPLATES.length, 22)
  assert.equal(new Set(TEMPLATES.map((t) => t.id)).size, TEMPLATES.length)
  for (const template of TEMPLATES) {
    const values = defaults(template)
    assert.equal(problem(template, values), null, template.id)
    const part = buildPart(template, values)
    assertMeasures(template, part, template.id)
    const subpaths = svgPath(part).match(/M/g).length
    assert.equal(subpaths, 1 + part.holes.length, `${template.id} preview`)
  }
})

test('a rectangular plate cuts its outline and four holes', () => {
  const template = templateById('rect-plate')
  const m = measure(buildPart(template, defaults(template)))
  near(m.cutLengthMm, 600 + 4 * Math.PI * 10, 0.2, 'cut')
  assert.equal(m.pierces, 5)
  near(m.areaMm2, 20000 - 4 * Math.PI * 25, 1, 'area')

  const rounded = buildPart(template, { ...defaults(template), radius: 20 })
  near(
    measure(rounded).cutLengthMm,
    600 - 8 * 20 + 2 * Math.PI * 20 + 4 * Math.PI * 10,
    0.2,
    'rounded cut'
  )
})

test('a bent angle unfolds with the bend allowance and one bend line', () => {
  const template = templateById('bent-l')
  const part = buildPart(template, defaults(template))
  const flat = 80 - 6 + allowance(3) + (60 - 6)
  near(part.width, flat, 0.001, 'flat length')
  near(part.flat, flat, 0.001, 'flat')
  assert.equal(part.height, 50)
  assert.equal(part.bends.length, 1)
  near(part.bends[0].x1, 74 + allowance(3) / 2, 0.001, 'bend line')
  const dxf = toDxf(part)
  assert.match(dxf, /\r\nLINE\r\n8\r\nBEND\r\n/)
  assert.equal(measure(part).bends, 1)
})

test('a U channel unfolds into three straight parts and two bends', () => {
  const template = templateById('bent-u')
  const part = buildPart(template, defaults(template))
  near(part.width, 2 * (40 - 6) + (80 - 12) + 2 * allowance(3), 0.001, 'flat')
  assert.equal(measure(part).bends, 2)
})

test('flanges, gears and rounded shapes keep their arcs', () => {
  const flange = templateById('round-flange')
  const m = measure(buildPart(flange, defaults(flange)))
  near(m.cutLengthMm, Math.PI * (200 + 100 + 6 * 14), 0.5, 'flange cut')
  assert.equal(m.pierces, 8)

  const lug = templateById('lug')
  const lugPart = buildPart(lug, defaults(lug))
  near(lugPart.height, 70 + 30, 0.001, 'lug height')
  near(
    measure(lugPart).cutLengthMm,
    60 + 2 * 70 + Math.PI * 30 + Math.PI * 20,
    0.3,
    'lug cut'
  )

  const gear = templateById('gear')
  const gearPart = buildPart(gear, defaults(gear))
  near(gearPart.width, 3 * (24 + 2), 0.05, 'gear tip diameter')
})

test('out-of-range and impossible dimensions are named', () => {
  const plate = templateById('rect-plate')
  const values = defaults(plate)
  assert.deepEqual(problem(plate, { ...values, width: 5 }), {
    key: 'range',
    param: 'width',
    min: 10,
    max: 3000,
  })
  assert.equal(problem(plate, { ...values, height: '' }).param, 'height')
  assert.equal(problem(plate, { ...values, holeD: 90 }).key, 'holesFit')
  assert.equal(problem(plate, { ...values, inset: 5 }).key, 'holesEdge')
  assert.equal(problem(plate, { ...values, radius: 60 }).key, 'holesEdge')
  assert.equal(problem(plate, { ...values, holeD: 0, inset: 3 }), null)

  const washer = templateById('washer')
  assert.equal(problem(washer, { outerD: 40, innerD: 38 }).key, 'innerFit')
  const perforated = templateById('perforated-plate')
  const grid = defaults(perforated)
  assert.equal(problem(perforated, { ...grid, pitch: 9 }).key, 'pitchSmall')
  assert.equal(
    problem(perforated, { ...grid, width: 3000, height: 1500, pitch: 10 }).key,
    'tooManyHoles'
  )
  const angle = templateById('bent-l')
  assert.equal(
    problem(angle, { ...defaults(angle), legB: 12 }).key,
    'bendShort'
  )
  assert.equal(
    problem(angle, { ...defaults(angle), legB: 30, holeD: 20 }).key,
    'holesBend'
  )
  const polygon = templateById('polygon')
  assert.deepEqual(problem(polygon, { sides: 6, size: 2000, holeD: 0 }), {
    key: 'sheetSize',
    ...SHEET,
  })
})

// A small seeded generator, so a failure repeats.
function random(seed) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

test('any dimensions within the limits give a cuttable part or a named problem', () => {
  const next = random(20261124)
  const seen = new Set()
  for (const template of TEMPLATES) {
    let valid = 0
    for (let run = 0; run < 160; run++) {
      const values = {}
      for (const [key, , min, max] of template.params) {
        // Half the runs stay near the defaults, where most real parts are.
        const low = run % 2 ? min : Math.max(min, defaults(template)[key] / 3)
        const high =
          run % 2 ? max : Math.min(max, defaults(template)[key] * 3 || max)
        const value = low + (high - low) * next()
        values[key] = COUNTS.includes(key)
          ? Math.round(value)
          : Math.round(value * 10) / 10
      }
      const issue = problem(template, values)
      if (issue) {
        assert.ok(PROBLEMS.includes(issue.key), `${template.id}: ${issue.key}`)
        seen.add(issue.key)
        continue
      }
      valid++
      assertMeasures(
        template,
        buildPart(template, values),
        `${template.id} ${JSON.stringify(values)}`
      )
    }
    assert.ok(valid > 0, `${template.id} never produced a valid part`)
  }
  assert.ok(seen.size > 5)
})

test('every template, dimension and problem has a text in each language', () => {
  const keys = new Set(TEMPLATES.flatMap((t) => t.params.map(([key]) => key)))
  const zeros = new Set(
    TEMPLATES.flatMap((t) =>
      t.params.filter(([, , min]) => min === 0).map(([key]) => key)
    )
  )
  const categories = new Set(['all', ...TEMPLATES.map((t) => t.category)])
  for (const locale of ['hy', 'ru', 'en']) {
    const t = templateCopy(locale)
    for (const template of TEMPLATES) {
      const [name, description] = t.templates[template.id] || []
      assert.ok(name && description, `${locale} ${template.id}`)
    }
    for (const key of keys) assert.ok(t.params[key], `${locale} param ${key}`)
    for (const key of zeros) assert.ok(t.zeros[key], `${locale} zero ${key}`)
    for (const key of categories)
      assert.ok(t.categories[key], `${locale} category ${key}`)
    for (const key of PROBLEMS)
      assert.ok(t.problems[key], `${locale} problem ${key}`)
  }
  assert.equal(templateCopy('ru-RU'), templateCopy('ru'))
  assert.equal(templateCopy('de'), templateCopy('hy'))
})

test('the part goes to the request with a readable name and note', () => {
  const plate = templateById('rect-plate')
  const values = { ...defaults(plate), holeD: 0 }
  const part = buildPart(plate, values)
  const hy = templateCopy('hy')
  assert.equal(partFileName(hy, plate, part), 'Ուղղանկյուն թիթեղ 200x100.dxf')
  assert.equal(
    partFileName(templateCopy('en'), plate, part),
    'Rectangular plate 200x100.dxf'
  )
  const note = partNote(hy, plate, values, part)
  assert.match(note, /^Ձևանմուշ «Ուղղանկյուն թիթեղ»։ Լայնություն՝ 200 մմ, /)
  assert.match(note, /Անցքի տրամագիծ՝ առանց անցքերի/)

  const angle = templateById('bent-l')
  const bent = buildPart(angle, defaults(angle))
  const enNote = partNote(templateCopy('en'), angle, defaults(angle), bent)
  assert.match(enNote, /Flange A \(outside\): 80 mm/)
  assert.match(enNote, /Flat pattern: 134\.6 × 50 mm\.$/)

  const flange = templateById('round-flange')
  assert.match(
    partNote(
      templateCopy('ru'),
      flange,
      defaults(flange),
      buildPart(flange, defaults(flange))
    ),
    /Количество болтов: 6,/
  )
  assert.equal(mm(134.597), '134.6')
  assert.equal(
    problemText(hy, plate, problem(plate, { ...values, width: 5 })),
    '«Լայնություն»՝ 10-ից 3000։'
  )
})

test('the DXF is plain R12 text with CRLF line ends', () => {
  const template = templateById('lug')
  const dxf = toDxf(buildPart(template, defaults(template)))
  assert.ok(dxf.startsWith('0\r\nSECTION\r\n2\r\nHEADER\r\n'))
  assert.match(dxf, /\$ACADVER\r\n1\r\nAC1009\r\n/)
  assert.match(dxf, /\$INSUNITS\r\n70\r\n4\r\n/)
  assert.ok(dxf.endsWith('0\r\nEOF\r\n'))
  assert.equal(dxf.split('\n').length, dxf.split('\r\n').length)
  assert.match(dxf, /\r\n42\r\n1\r\n/)
})
