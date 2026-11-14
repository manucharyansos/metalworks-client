const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')

const source = fs.readFileSync(
  path.join(__dirname, '..', 'utils/org-chart.js'),
  'utf8'
)
const load = () =>
  import(
    `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
  )

const role = (id, name) => ({ id, name, value: name })
const positions = [
  {
    id: 1,
    parent_id: null,
    name: 'Owner',
    sort_order: 0,
    role: role(1, 'manager'),
    members: [],
  },
  {
    id: 2,
    parent_id: 1,
    name: 'Director',
    sort_order: 0,
    role: role(1, 'manager'),
    members: [],
  },
  {
    id: 3,
    parent_id: 2,
    name: 'Production',
    sort_order: 2,
    role: role(1, 'manager'),
    members: [],
  },
  {
    id: 4,
    parent_id: 2,
    name: 'Design',
    sort_order: 1,
    role: role(2, 'engineer'),
    members: [],
  },
  {
    id: 5,
    parent_id: 3,
    name: 'Cutter',
    sort_order: 0,
    role: role(3, 'laser'),
    factory: { id: 9, name: 'Sheets' },
    members: [{ user_id: 7, name: 'Ani', assignment_id: 70 }],
  },
  {
    id: 6,
    parent_id: 99,
    name: 'Lost parent',
    sort_order: 0,
    role: role(2, 'engineer'),
    members: [],
  },
]

test('positions become a tree in their own order and an unknown parent makes a top level', async () => {
  const { buildTree } = await load()
  const tree = buildTree(positions)
  assert.deepEqual(
    tree.map((node) => node.name),
    ['Owner', 'Lost parent']
  )
  const director = tree[0].children[0]
  assert.deepEqual(
    director.children.map((node) => node.name),
    ['Design', 'Production']
  )
  assert.equal(director.children[1].children[0].depth, 3)
})

test('a position cannot go under itself or anything below it', async () => {
  const { branchIds, parentOptions } = await load()
  assert.deepEqual([...branchIds(positions, 3)].sort(), [3, 5])
  const choices = parentOptions(positions, 2).map((row) => row.id)
  assert.ok(choices.includes(1) && choices.includes(6))
  assert.ok(![2, 3, 4, 5].some((id) => choices.includes(id)))
  assert.equal(parentOptions(positions).length, positions.length)
})

test('each department below the top chain keeps one colour, the top stays neutral', async () => {
  const { buildTree, departmentTones } = await load()
  const tones = departmentTones(
    buildTree(positions.filter((row) => row.id !== 6))
  )
  assert.equal(tones.get(1), null)
  assert.equal(tones.get(2), null)
  assert.equal(tones.get(4), 0)
  assert.equal(tones.get(3), 1)
  assert.equal(tones.get(5), 1, 'A position shares its department’s colour.')
})

test('people list every position they hold and the places still outside the chart', async () => {
  const { peopleOf, accessText } = await load()
  const people = peopleOf({
    positions,
    unplaced: [
      {
        user_id: 7,
        name: 'Ani',
        assignment_id: 71,
        role: role(2, 'engineer'),
        factory: null,
      },
    ],
  })
  assert.equal(people.length, 1)
  assert.deepEqual(
    people[0].assignments.map((row) => row.position?.name || null),
    ['Cutter', null]
  )
  assert.equal(
    accessText(
      role(3, 'laser'),
      { name: 'Sheets' },
      { laser: 'Լազերային կտրում' }
    ),
    'Լազերային կտրում · Sheets'
  )
  assert.equal(accessText(role(2, 'engineer'), null, {}), 'engineer')
})

test('every interface language names the same things', async () => {
  const { orgChartCopy } = await load()
  const keys = Object.keys(orgChartCopy.hy).sort()
  for (const locale of ['ru', 'en'])
    assert.deepEqual(Object.keys(orgChartCopy[locale]).sort(), keys)
})
