/* eslint-disable vue/one-component-per-file -- each test builds its own instance */
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
  const module = { exports: {} }
  const dependency = (request) => {
    if (request.endsWith('.vue')) return {}
    if (request.startsWith('@/')) return load(request.slice(2) + '.js')
    // Store helpers are stubbed: tests set the mapped values as plain data.
    if (request === 'vuex')
      return { mapActions: () => ({}), mapGetters: () => ({}) }
    return require(request)
  }
  // Runs the project's own transpiled source, as the other component tests do.
  // eslint-disable-next-line no-new-func
  new Function('require', 'module', 'exports', code)(
    dependency,
    module,
    module.exports
  )
  loaded.set(name, module.exports)
  return module.exports
}

function component(
  name,
  { state = {}, hooks = {}, computed = {}, propsData = {} } = {}
) {
  const definition = load(name).default
  const vm = new Vue({
    ...definition,
    propsData,
    data: () => ({ ...definition.data?.(), ...state }),
    computed: { ...definition.computed, ...computed },
    mounted: [],
    ...hooks,
  })
  vm.$can = () => true
  vm.$t = (key) => key
  vm.$notify = () => {}
  return vm
}

const wall = load('utils/wall-time.js')

test('server wall-clock text is read as local time in every browser', () => {
  const local = new Date(2026, 10, 5, 18, 30).getTime()
  assert.equal(wall.parseWallTime('2026-11-05 18:30:00'), local)
  assert.equal(wall.parseWallTime('2026-11-05T18:30'), local)
  // A bare date is local midnight, not UTC midnight (04:00 in Yerevan).
  assert.equal(
    wall.parseWallTime('2026-11-05'),
    new Date(2026, 10, 5).getTime()
  )
  assert.equal(
    wall.parseWallTime('2026-10-31T12:05:11.000000Z'),
    Date.parse('2026-10-31T12:05:11.000Z')
  )
  for (const value of ['', null, undefined, 'soon', '2026-02-31', '31/10/2026'])
    assert.ok(Number.isNaN(wall.parseWallTime(value)), String(value))
})

test('dates are numeric and a bare date never shows an invented time', () => {
  assert.equal(wall.formatWallDate('2026-11-05 18:30:00'), '05.11.2026')
  assert.equal(
    wall.formatWallDateTime('2026-11-05 18:30:00'),
    '05.11.2026, 18:30'
  )
  assert.equal(wall.formatWallDateTime('2026-11-25'), '25.11.2026')
  assert.equal(wall.formatWallDateTime(null), '—')
  // Text the API already formatted stays readable instead of "Invalid Date".
  assert.equal(wall.formatWallDate('31/10/2026'), '31/10/2026')
})

test('calendar days use Armenian names without browser locale data', () => {
  assert.equal(wall.calendarDayLabel('2026-11-02', 'hy'), 'Երկ, 2 նոյ')
  assert.equal(wall.calendarDayLabel('2026-11-08', 'hy'), 'Կիր, 8 նոյ')
  assert.equal(wall.calendarDayLabel('2026-11-02', 'en'), 'Mon, Nov 2')
  assert.equal(wall.calendarDayLabel('bad', 'hy'), 'bad')
})

test('a deadline given as a date counts from local midnight', () => {
  const { taskDeadline } = load('utils/task-deadline.js')
  const now = new Date(2026, 10, 5, 14, 0).getTime()
  assert.deepEqual(taskDeadline('2026-11-05', { now }), {
    label: 'Ժամկետն անցել է՝ 14 ժ',
    tone: 'red',
  })
  assert.deepEqual(taskDeadline('2026-11-05 18:00:00', { now }), {
    label: 'Մնացել է՝ 4 ժ',
    tone: 'amber',
  })
})

function tasksPage(state = {}) {
  return component('pages/engineer/index.vue', {
    state,
    hooks: { created: [], beforeDestroy: [] },
  })
}

test('an impossible due range keeps the last results and sends no request', async () => {
  const vm = tasksPage()
  let calls = 0
  vm.$axios = {
    get: () => {
      calls++
      return Promise.resolve({ data: {} })
    },
  }
  vm.orders = [{ id: 1 }]
  vm.filters.due_from = '2026-11-10'
  vm.filters.due_to = '2026-11-01'
  // The filter watcher marks the list as loading, then its debounce fetches.
  await Vue.nextTick()
  assert.equal(vm.loading, true)
  clearTimeout(vm.timer)
  await vm.fetchRows()
  assert.equal(calls, 0)
  assert.equal(vm.rangeInvalid, true)
  assert.equal(vm.error, '')
  assert.equal(vm.loading, false)
  assert.deepEqual(
    vm.orders.map((order) => order.id),
    [1]
  )
  vm.$destroy()
})

test('the task list keeps counts, pages and filter state from the API', async () => {
  const vm = tasksPage()
  vm.$axios = {
    get: (url, { params }) => {
      assert.equal(url, '/api/engineers/engineer')
      assert.equal(params.filter_options, 1)
      assert.equal(params.search, undefined, 'empty filters are not sent')
      return Promise.resolve({
        data: {
          orders: [{ id: 7 }],
          pagination: { last_page: 3, total: 51, from: 1, to: 25 },
          stage_counts: {
            created: 40,
            accepted: 1,
            in_progress: 10,
            completed: 0,
          },
          filter_options: {
            factories: [{ id: 2, name: 'Laser' }],
            operators: [],
          },
        },
      })
    },
  }
  await vm.fetchRows()
  assert.equal(vm.total, 51)
  assert.equal(vm.lastPage, 3)
  assert.equal(vm.stageTotal, 51)
  assert.equal(vm.rangeText, '1–25 / 51')
  assert.equal(vm.hasFilters, false)
  vm.filters.operator_id = 4
  assert.equal(vm.advancedFilterCount, 1)
  assert.equal(vm.hasFilters, true)
  vm.$destroy()
})

test('task rows show numbers, priorities and overdue only for open work', () => {
  const vm = tasksPage()
  const open = {
    id: 3,
    workflow_stage: 'in_progress',
    status: 'pending',
    priority_rank: 2,
    order_number: { number: '2026-10-0003' },
    dates: { finish_date: '2020-01-01 10:00:00' },
  }
  assert.equal(vm.orderNumber(open), '2026-10-0003')
  assert.equal(vm.orderNumber({ id: 9 }), 9)
  assert.equal(vm.priorityKey(open), 'urgent')
  assert.equal(vm.priorityKey({ priority_rank: null }), 'normal')
  assert.equal(vm.dueText(open), '01.01.2020, 10:00')
  assert.equal(vm.isOverdue(open), true)
  assert.equal(vm.isOverdue({ ...open, workflow_stage: 'completed' }), false)
  assert.equal(vm.isOverdue({ ...open, status: 'canceled' }), false)
  assert.equal(vm.isOverdue({ ...open, dates: null }), false)
  assert.equal(vm.stageLabel('created'), 'Ստեղծված')
  vm.$destroy()
})

function calendar(state = {}) {
  const vm = component('components/engineer/OperatorCalendar.vue', { state })
  vm.refresh = async () => {}
  return vm
}

test('calendar arrows move by the selected period and Today returns to today', () => {
  const vm = calendar({ date: '2026-11-06', period: 'week' })
  vm.shiftDate(1)
  assert.equal(vm.date, '2026-11-13')
  vm.period = 'day'
  vm.shiftDate(-1)
  assert.equal(vm.date, '2026-11-12')
  vm.period = 'month'
  vm.date = '2026-01-31'
  vm.shiftDate(1)
  assert.equal(vm.date, '2026-02-01', 'month moves never skip a short month')
  vm.data = { ...vm.data, today: '2026-11-06' }
  vm.goToday()
  assert.equal(vm.date, '2026-11-06')
  vm.$destroy()
})

test('a job occupies its operator from its start to its workshop deadline', () => {
  const { jobWindow, jobLanes, loadLevel, jobCount, OPEN_END } = load(
    'utils/operator-calendar.js'
  )
  const today = '2026-11-06'
  assert.deepEqual(
    jobWindow({ starts_on: '2026-11-03', due_date: '2026-11-12' }, today),
    {
      start: '2026-11-03',
      end: '2026-11-12',
      due: '2026-11-12',
      overdue: false,
    }
  )
  // A start after the deadline (bad data) collapses to the deadline day.
  assert.equal(
    jobWindow({ starts_on: '2026-11-20', due_date: '2026-11-12' }, today).start,
    '2026-11-12'
  )
  assert.equal(jobWindow({ due_date: '2026-11-12' }, today).start, '2026-11-12')
  // Unfinished overdue work keeps the operator busy until it is done.
  assert.deepEqual(
    jobWindow({ starts_on: '2026-10-31', due_date: '2026-11-05' }, today),
    { start: '2026-10-31', end: OPEN_END, due: '2026-11-05', overdue: true }
  )
  assert.equal(jobWindow({ due_date: null }, today), null)

  const days = [
    '2026-11-09',
    '2026-11-10',
    '2026-11-11',
    '2026-11-12',
    '2026-11-13',
    '2026-11-14',
    '2026-11-15',
  ]
  const job = (id, start, end) => ({ id, window: { start, end } })
  const lanes = jobLanes(
    [
      job(1, '2026-11-01', '2026-11-09'),
      job(2, '2026-11-03', '2026-11-12'),
      job(3, '2026-11-10', '2026-11-11'),
      job(4, '2026-11-20', '2026-11-24'),
      { id: 5, window: null },
    ],
    days
  )
  assert.deepEqual(
    lanes.map((bar) => [
      bar.job.id,
      bar.from,
      bar.to,
      bar.lane,
      bar.continuesBefore,
      bar.continuesAfter,
    ]),
    [
      [1, 0, 0, 0, true, false],
      [2, 0, 3, 1, true, false],
      [3, 1, 2, 0, false, false],
    ],
    'a lane is reused once its previous job has ended; hidden and undated jobs are skipped'
  )
  assert.deepEqual([0, 1, 2, 3, 7].map(loadLevel), [
    'free',
    'light',
    'busy',
    'heavy',
    'heavy',
  ])
  assert.equal(jobCount(2), '2 աշխատանք')
  assert.deepEqual(
    [1, 3, 5, 11, 21, 22].map((n) => jobCount(n, 'ru')),
    ['1 работа', '3 работы', '5 работ', '11 работ', '21 работа', '22 работы']
  )
  assert.equal(jobCount(1, 'en'), '1 job')
})

test('the workload view shows each operator’s busy days, free days and deadlines', () => {
  const vm = calendar({ date: '2026-11-09', period: 'week' })
  vm.data = {
    today: '2026-11-06',
    factories: [
      {
        id: 2,
        name: 'Laser',
        operators: [
          { id: 4, name: 'Cutter' },
          { id: 5, name: 'Bender' },
        ],
      },
    ],
    workers: [],
    shifts: [],
    bookings: [],
    tasks: [
      {
        id: 7,
        order_id: 3,
        order_number: '2026-10-0003',
        name: '990.01',
        workshop: 'Laser',
        factory_id: 2,
        operator_id: 4,
        helpers: [],
        starts_on: '2026-10-31',
        due_date: '2026-11-12',
        deadline_source: 'stage',
      },
      {
        id: 8,
        order_id: 3,
        order_number: '2026-10-0003',
        name: '990.01',
        workshop: 'Bend',
        factory_id: 2,
        operator_id: 5,
        helpers: [{ id: 4, name: 'Cutter' }],
        starts_on: '2026-11-12',
        due_date: '2026-11-13',
        deadline_source: 'stage',
        blocked: true,
        estimated_minutes: 90,
      },
      {
        id: 9,
        order_id: 4,
        name: 'Undated',
        workshop: 'Laser',
        factory_id: 2,
        operator_id: 5,
        helpers: [],
        due_date: null,
      },
    ],
  }
  const [cutter, bender] = vm.timelineRows
  assert.equal(cutter.operator.name, 'Cutter')
  assert.equal(cutter.counts['2026-11-09'], 1)
  assert.equal(
    cutter.counts['2026-11-12'],
    2,
    'helping on another job adds to the day'
  )
  assert.equal(cutter.counts['2026-11-14'], 0)
  assert.equal(cutter.busyUntil, '2026-11-13')
  assert.equal(vm.summary(cutter), 'Զբաղված է մինչև 13.11.2026')
  assert.equal(bender.counts['2026-11-11'], 0)
  assert.equal(bender.undated, 1)
  assert.equal(bender.minutes, 90)
  assert.equal(
    bender.freeDays,
    5,
    'free from Monday to Sunday except its two job days'
  )
  assert.equal(vm.barState(bender.lanes[0].job), 'waiting')
  assert.equal(cutter.lanes[1].job.helper, true)
  assert.equal(
    vm.barState(cutter.lanes[1].job),
    'waiting',
    'waiting wins over helper'
  )
  assert.equal(
    vm.barState({ ...cutter.lanes[1].job, blocked: false }),
    'helper'
  )
  assert.deepEqual(vm.dayTotals['2026-11-12'], { free: 0, busy: 2, due: 1 })
  assert.deepEqual(vm.dayTotals['2026-11-14'], { free: 2, busy: 0, due: 0 })
  assert.equal(vm.loadText(0), 'Ազատ')
  assert.equal(vm.monthLevel('2026-11-12'), 'heavy')
  assert.equal(vm.monthText('2026-11-14'), '2 ազատ · 0 զբաղված')
  vm.operatorFilter = '5'
  assert.equal(vm.monthText('2026-11-12'), '1 աշխատանք')
  vm.$destroy()
})

test('month days sit under their weekday and tasks use visible order numbers', () => {
  const vm = calendar({ date: '2026-11-06', period: 'month' })
  assert.equal(vm.days[0], '2026-11-01')
  assert.equal(vm.monthLead, 6, '1 November 2026 is a Sunday')
  assert.equal(vm.weekdayNames[0], 'Երկ')
  assert.equal(
    vm.jobTitle({ order_id: 1, order_number: '2026-10-0001', name: '990.01' }),
    '#2026-10-0001 · 990.01'
  )
  assert.equal(vm.jobTitle({ order_id: 1, name: '990.01' }), '#1 · 990.01')
  assert.equal(
    vm.bookingTitle({
      order_id: 2,
      order_number: '2026-10-0002',
      task: 'Frame',
    }),
    '#2026-10-0002 · Frame'
  )
  vm.period = 'week'
  assert.equal(vm.monthLead, 0)
  vm.$destroy()
})

test('free time around a day starts no earlier than today and stops at the next job', () => {
  const { freeSegment } = load('utils/operator-calendar.js')
  const jobs = [
    { window: { start: '2026-11-02', end: '2026-11-12' } },
    { window: { start: '2026-11-20', end: '2026-11-24' } },
  ]
  assert.deepEqual(freeSegment(jobs, '2026-11-15', '2026-11-06'), {
    start: '2026-11-13',
    end: '2026-11-19',
  })
  assert.equal(freeSegment(jobs, '2026-11-10', '2026-11-06'), null, 'busy day')
  assert.equal(freeSegment(jobs, '2026-11-05', '2026-11-06'), null, 'past day')
  assert.deepEqual(freeSegment([], '2026-11-08', '2026-11-06', 3), {
    start: '2026-11-06',
    end: '2026-11-11',
  })
})

test('a free day in the embedded calendar is reported to the form instead of a dialog', () => {
  const vm = calendar({ date: '2026-11-09', period: 'week' })
  const events = []
  vm.$on('pick', (slot) => events.push(slot))
  vm.data = {
    today: '2026-11-06',
    factories: [
      { id: 2, name: 'Laser', operators: [{ id: 4, name: 'Cutter' }] },
    ],
    workers: [],
    shifts: [],
    bookings: [],
    tasks: [
      {
        id: 7,
        order_id: 3,
        name: '990.01',
        workshop: 'Laser',
        factory_id: 2,
        operator_id: 4,
        helpers: [],
        starts_on: '2026-11-01',
        due_date: '2026-11-10',
      },
      {
        id: 8,
        order_id: 3,
        name: '990.01',
        workshop: 'Laser',
        factory_id: 2,
        operator_id: null,
        helpers: [],
        due_date: '2026-11-30',
        order_due_at: '2026-11-30 18:00:00',
        can_edit: true,
      },
    ],
  }
  const [row] = vm.timelineRows
  assert.equal(vm.slotOpen(row, '2026-11-10'), false, 'a busy day has no slot')
  assert.equal(
    vm.slotOpen(row, '2026-11-12'),
    true,
    'editable unassigned work can be placed'
  )
  vm.openSlot(row, '2026-11-12')
  assert.deepEqual(
    vm.slot && { ...vm.slot, operator: { ...vm.slot.operator } },
    {
      operator: { id: 4, name: 'Cutter' },
      factoryIds: [2],
      start: '2026-11-11',
      end: '2026-11-25',
      stageId: '',
      startsOn: '2026-11-11',
      deadline: '2026-11-25',
    }
  )
  assert.deepEqual(
    vm.slotCandidates.map((task) => task.id),
    [8]
  )
  vm.closeSlot()
  vm.$destroy()

  const picker = component('components/engineer/OperatorCalendar.vue', {
    state: { date: '2026-11-09', period: 'week' },
    propsData: { picker: true },
  })
  picker.refresh = () => Promise.resolve()
  const picked = []
  picker.$on('pick', (slot) => picked.push(slot))
  picker.data = vm.data
  picker.openSlot(picker.timelineRows[0], '2026-11-12')
  assert.equal(picker.slot, null)
  assert.equal(picked[0].start, '2026-11-11')
  assert.deepEqual(events, [])
  picker.$destroy()
})

test('a free period opened on the create page fills the deadline and an optional operator', () => {
  const vm = component('pages/engineer/orders/create/index.vue', {
    state: {
      getFactory: [],
      getPmpes: { pmp: [] },
      getPmp: { id: 1, files: [] },
      allClients: [],
    },
    computed: {
      taskWorkshops: () => [
        { id: 2, name: 'Laser' },
        { id: 4, name: 'Bend' },
      ],
      isEditingMode: () => false,
    },
  })
  vm.$route = {
    path: '/engineer/orders/create',
    query: {
      operator_id: '4',
      factory_id: '2',
      start: '2099-01-05',
      end: '2099-01-09',
    },
  }
  vm.slotFromQuery()
  assert.equal(vm.finishDate, '2099-01-09T18:00')
  assert.equal(vm.factoryOperators[2], 4)
  assert.equal(
    vm.factoryOperators[4],
    undefined,
    'other workshops stay untouched'
  )
  assert.deepEqual(vm.slotPlannedStarts(), [
    { factory_id: 2, starts_on: '2099-01-05' },
  ])
  assert.match(vm.slotStatus, /slot_applied/)
  // A later choice replaces the operator the first one filled in.
  vm.applySlot({
    operator: { id: 5, name: 'B' },
    factoryIds: [2],
    start: '2099-02-01',
    end: '2099-02-03',
  })
  assert.equal(vm.factoryOperators[2], 5)
  assert.equal(vm.finishDate, '2099-02-03T18:00')
  // Clearing keeps the operator optional.
  vm.clearSlot()
  assert.equal(vm.factoryOperators[2], null)
  assert.equal(vm.slot, null)
  assert.deepEqual(vm.slotPlannedStarts(), [])
  vm.$route.query = { operator_id: 'x', start: '2099-01-05', end: '2099-01-09' }
  vm.slotFromQuery()
  assert.equal(vm.slot, null, 'a broken link is ignored')
  assert.equal(
    vm.applySlot({
      operator: { id: 4 },
      factoryIds: [],
      start: '2099-01-09',
      end: '2099-01-05',
    }),
    false
  )
  // The free-days calendar is a dialog: picking a day fills the form and closes it.
  vm.openWorkload()
  assert.equal(vm.workloadOpen, true)
  vm.pickSlot({
    operator: { id: 4, name: 'Cutter' },
    factoryIds: [2],
    start: '2099-03-02',
    end: '2099-03-06',
  })
  assert.equal(vm.workloadOpen, false)
  assert.equal(vm.finishDate, '2099-03-06T18:00')
  vm.openWorkload()
  vm.pickSlot({ operator: { id: 4 }, factoryIds: [], start: 'bad', end: 'x' })
  assert.equal(vm.workloadOpen, true, 'an invalid pick keeps the calendar open')
  vm.closeWorkload()
  assert.equal(vm.workloadOpen, false)
  vm.$destroy()
})
