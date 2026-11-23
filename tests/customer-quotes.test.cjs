const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const { transformSync } = require('@babel/core')
const Vue = require('vue')

const root = path.join(__dirname, '..')
const loaded = new Map()
function load(name) {
  if (loaded.has(name)) return loaded.get(name)
  let source = fs.readFileSync(path.join(root, name), 'utf8')
  if (name.endsWith('.vue'))
    source = source.match(/<script>([\s\S]*?)<\/script>/)[1]
  const code = transformSync(source, {
    configFile: false,
    babelrc: false,
    plugins: [require('@babel/plugin-transform-modules-commonjs')],
  }).code
  const exported = { exports: {} }
  const dependency = (request) => {
    if (request.endsWith('.vue')) return {}
    if (request.startsWith('@/')) return load(request.slice(2) + '.js')
    return require(request)
  }
  // Runs the project's own transpiled source, as the other component tests do.
  // eslint-disable-next-line no-new-func
  new Function('require', 'module', 'exports', code)(
    dependency,
    exported,
    exported.exports
  )
  loaded.set(name, exported.exports)
  return exported.exports
}

const { formatMoney, itemPayload, reasonsText, serviceName, quoteCopy } = load(
  'utils/quote-copy.js'
)
const { pricingPayload } = load('utils/pricing-copy.js')
const { describeNotification, notificationTarget } = load(
  'utils/task-notifications.js'
)

test('drams are whole and grouped, and missing prices show a dash', () => {
  assert.equal(formatMoney(18060), '18 060 ֏')
  assert.equal(formatMoney('1605.6'), '1 606 ֏')
  assert.equal(formatMoney(null), '—')
})

test('a part sends a list thickness or a typed material, never both', () => {
  assert.deepEqual(
    itemPayload({
      workshop_ids: ['3', 5],
      pricing_thickness_id: '7',
      material: 'St37',
      thickness: '2',
      quantity: '0',
      bends: '',
      paint_ral: ' 9005 ',
      primer_required: 1,
      note: ' ',
    }),
    {
      workshop_ids: [3, 5],
      pricing_thickness_id: 7,
      material: null,
      thickness: null,
      quantity: 1,
      bends: null,
      paint_ral: '9005',
      primer_required: true,
      note: null,
    }
  )
  const typed = itemPayload({
    workshop_ids: [],
    pricing_thickness_id: null,
    material: ' Copper ',
    thickness: '1.5',
    quantity: 12.4,
    bends: '3',
  })
  assert.deepEqual(
    [typed.material, typed.thickness, typed.quantity, typed.bends],
    ['Copper', 1.5, 12, 3]
  )
})

test('reasons for a manager price read in the interface language', () => {
  assert.deepEqual(reasonsText(['material', 'bends'], 'en'), [
    quoteCopy('en').reasons.material,
    quoteCopy('en').reasons.bends,
  ])
  // A switched-off price list says it once instead of listing everything.
  assert.deepEqual(reasonsText(['disabled', 'material'], 'ru'), [
    quoteCopy('ru').reasons.disabled,
  ])
  // A model file is never priced instantly: no point asking for a material.
  assert.deepEqual(reasonsText(['drawing', 'material'], 'hy'), [
    quoteCopy('hy').reasons.drawing,
  ])
  assert.equal(serviceName({ value: 'dld', name: 'Կռում' }, 'en'), 'Bending')
  assert.equal(
    serviceName({ value: 'WORK_X', name: 'Assembly' }, 'en'),
    'Assembly'
  )
})

test('order request notices name the request and open where each side works', () => {
  const offer = {
    type: 'quote.quoted',
    data: { quote_id: 9, quote_number: 'Q-2026-0004', price: '15000.00' },
  }
  const { ref, text } = describeNotification(offer, 'en')
  assert.equal(ref, 'Q-2026-0004')
  assert.equal(text, 'Your request has an offer: 15 000 ֏')
  assert.deepEqual(notificationTarget(offer, 'authenticatedUser'), {
    path: '/customer/requests',
    query: { quote: '9' },
  })
  assert.deepEqual(
    notificationTarget(
      { type: 'quote.submitted', data: { quote_id: 9 } },
      'manager'
    ),
    { path: '/manager/quotes', query: { quote: '9' } }
  )
  assert.deepEqual(
    notificationTarget(
      { type: 'quote.submitted', data: { quote_id: 9 } },
      'admin'
    ),
    { path: '/admin/quotes', query: { quote: '9' } }
  )
})

test('the price list is sent with numbers, new rows without ids', () => {
  const payload = pricingPayload({
    settings: {
      enabled: 1,
      bend_price: '500',
      paint_price_m2: '',
      primer_price_m2: 0,
      paint_min_part: '200',
      setup_fee: '0',
      min_order: '5000',
      waste_percent: '10',
      discounts: [{ min_qty: '10', percent: '5' }],
      vat_included: true,
      customer_note: '  ',
    },
    materials: [
      {
        id: null,
        key: 'row-1',
        name: ' St37 ',
        density: '7850',
        price_per_kg: '600',
        is_active: true,
        thicknesses: [
          {
            key: 'row-2',
            thickness: '2',
            cut_price_per_m: '400',
            pierce_price: '50',
            is_active: true,
          },
        ],
      },
    ],
  })
  assert.equal(payload.settings.paint_price_m2, 0)
  assert.deepEqual(payload.settings.discounts, [{ min_qty: 10, percent: 5 }])
  assert.equal(payload.settings.customer_note, null)
  assert.deepEqual(payload.materials[0], {
    id: null,
    name: 'St37',
    density: 7850,
    price_per_kg: 600,
    is_active: true,
    thicknesses: [
      {
        id: null,
        thickness: 2,
        cut_price_per_m: 400,
        pierce_price: 50,
        is_active: true,
      },
    ],
  })
})

function card(item = {}) {
  const definition = load('components/customer/QuotePartCard.vue').default
  const options = {
    workshops: [
      { id: 1, value: 'DXF', name: 'Laser', powder: false },
      { id: 2, value: 'DLD', name: 'Bend', powder: false },
      { id: 3, value: 'POWDER', name: 'Paint', powder: true },
    ],
    pricing: {
      materials: [
        { id: 4, name: 'St37', thicknesses: [{ id: 8, thickness: 2 }] },
        {
          id: 5,
          name: 'AISI 304',
          thicknesses: [
            { id: 9, thickness: 1 },
            { id: 10, thickness: 2 },
          ],
        },
      ],
    },
  }
  const vm = new Vue({
    ...definition,
    propsData: {
      item: {
        id: 11,
        original_name: 'plate.dxf',
        size: 2048,
        workshop_ids: [1],
        quantity: 1,
        metrics: { status: 'ok', bends: 2 },
        ...item,
      },
      options,
    },
  })
  vm.$i18n = { locale: 'en' }
  vm.sent = []
  vm.$on('change', (event) => vm.sent.push(event))
  return vm
}

test('picking a list material with one thickness chooses it and sends the change', () => {
  const vm = card()
  assert.equal(vm.materialChoice, '', 'nothing chosen yet')
  vm.materialChoice = '4'
  vm.pickMaterial()
  assert.equal(vm.sent.at(-1).payload.pricing_thickness_id, 8)
  vm.materialChoice = '5'
  vm.pickMaterial()
  assert.equal(
    vm.sent.at(-1).payload.pricing_thickness_id,
    null,
    'two thicknesses: the customer picks'
  )
  vm.materialChoice = 'other'
  vm.pickMaterial()
  assert.equal(vm.custom, true)
})

test('bending and powder coating show their own fields as they are ticked', () => {
  const vm = card({ pricing_thickness_id: 8 })
  assert.equal(vm.materialChoice, '4', 'a saved thickness finds its material')
  assert.equal(vm.bending, false)
  vm.toggle(2)
  vm.toggle(3)
  assert.equal(vm.bending, true)
  assert.equal(vm.powder, true)
  assert.deepEqual(vm.sent.at(-1).payload.workshop_ids, [1, 2, 3])
  vm.toggle(1)
  assert.deepEqual(vm.sent.at(-1).payload.workshop_ids, [2, 3])
  vm.step(-1)
  assert.equal(vm.form.quantity, 1, 'never below one')
})
