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

test('the client column names the client and shows the description and times', () => {
  const vm = tasksPage()
  assert.deepEqual(vm.columns, ['task', 'client', 'status', 'due'])
  assert.equal(vm.c.client, 'Պատվիրատու')
  const order = {
    client: { company_name: '', name: 'Աննա', last_name: 'Պետրոսյան' },
    created_at: '28/10/2026',
    created_time: '2026-10-28T06:15:00+00:00',
    completed_at: '2026-10-31T12:20:00.000000Z',
    dates: { finish_date: '2026-10-30 11:40:00' },
  }
  assert.equal(vm.customer(order), 'Աննա Պետրոսյան')
  assert.equal(
    vm.customer({ client: { company_name: 'Metal LLC', name: 'Aram' } }),
    'Metal LLC'
  )
  assert.equal(vm.customer({ client: { user: { name: 'Portal' } } }), 'Portal')
  assert.equal(vm.customer({}), '')
  // 990.01 is project 990, item 01: their names lead, the code moves aside.
  const named = {
    name: '990.01',
    remote_number: { remote_number_name: 'Շրջանակ', pmp: { group_name: 'Դարպաս' } },
  }
  assert.equal(vm.taskTitle(named), 'Դարպաս · Շրջանակ')
  assert.equal(vm.taskCode(named), '990.01')
  assert.equal(vm.taskTitle({ name: '990.01' }), '990.01', 'no names: the code')
  assert.equal(vm.taskCode({ name: '990.01' }), '')
  const same = { remote_number_name: 'Test', pmp: { group_name: 'Test' } }
  assert.equal(vm.taskTitle({ name: '1.01', remote_number: same }), 'Test')
  // The hour comes from the zoned value, shown in the viewer's own time zone.
  const local = new Date('2026-10-28T06:15:00Z')
  const pad = (n) => String(n).padStart(2, '0')
  assert.equal(
    vm.createdText(order),
    `${pad(local.getDate())}.${pad(local.getMonth() + 1)}.${local.getFullYear()}, ${pad(local.getHours())}:${pad(local.getMinutes())}`
  )
  assert.equal(
    vm.createdText({ created_at: '28/10/2026' }),
    '28.10.2026',
    'a server without created_time still shows the day'
  )
  assert.equal(vm.createdText({}), '—')
  assert.equal(vm.dueText(order), '30.10.2026, 11:40')
  assert.match(vm.completedText(order), /^31\.10\.2026, \d\d:\d\d$/)
  const { planningCopy } = load('utils/planning-copy.js')
  for (const locale of ['hy', 'ru', 'en'])
    for (const key of ['client', 'createdAt', 'finishAt', 'completedAt'])
      assert.ok(planningCopy[locale][key], `${locale}.${key}`)
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
  const { jobWindow, jobLanes, loadLevel, jobCount, firstFreeDay } = load(
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
  // Unfinished overdue work is due now: it holds the operator today, not every
  // future day, so planned free days stay visible.
  assert.deepEqual(
    jobWindow({ starts_on: '2026-10-31', due_date: '2026-11-05' }, today),
    { start: '2026-10-31', end: today, due: '2026-11-05', overdue: true }
  )
  assert.equal(jobWindow({ due_date: null }, today), null)
  const held = [
    { window: { start: '2026-11-01', end: '2026-11-07' } },
    { window: { start: '2026-11-08', end: '2026-11-09' } },
    { window: null },
  ]
  assert.equal(firstFreeDay(held, today), '2026-11-10', 'back-to-back jobs')
  assert.equal(firstFreeDay([], today), today)
  assert.equal(firstFreeDay(held, today, 2), '', 'nothing free in the range')

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
  assert.equal(cutter.freeFrom, '2026-11-14')
  assert.equal(vm.statusText(cutter), 'Ազատ՝ 14.11.2026-ից')
  assert.equal(vm.statusTone(cutter), 'blue')
  assert.equal(vm.busyText(cutter), 'Զբաղված՝ 5/7 օր')
  assert.equal(cutter.meterTone, 'amber')
  assert.equal(bender.counts['2026-11-11'], 0)
  assert.equal(vm.statusText(bender), 'Ազատ է այսօր')
  assert.equal(bender.undated, 1)
  assert.equal(bender.minutes, 90)
  assert.equal(
    bender.freeDays,
    5,
    'free from Monday to Sunday except its two job days'
  )
  const bend = (row) => row.jobs.find((job) => job.id === 8)
  assert.equal(vm.barState(bend(bender)), 'waiting')
  assert.equal(bend(cutter).helper, true)
  assert.equal(vm.barState(bend(cutter)), 'waiting', 'waiting wins over helper')
  assert.equal(vm.barState({ ...bend(cutter), blocked: false }), 'helper')
  // One cell per day: how many jobs, the colour, and a deadline mark.
  const busyDay = cutter.cells.find((cell) => cell.day === '2026-11-12')
  assert.equal(busyDay.count, 2)
  assert.equal(busyDay.level, 'busy')
  assert.equal(busyDay.due, 1)
  assert.equal(busyDay.clickable, true, 'a busy day opens its jobs')
  const freeDay = cutter.cells.find((cell) => cell.day === '2026-11-14')
  assert.equal(freeDay.level, 'free')
  assert.equal(freeDay.slot, false, 'nothing to place without edit rights')
  assert.equal(freeDay.clickable, false)
  assert.match(vm.cellTitle(cutter, busyDay), /#2026-10-0003 · 990.01 · Laser/)
  vm.cellClick(cutter, busyDay)
  assert.equal(vm.expanded, 4)
  assert.deepEqual(
    vm.detailJobs(cutter).map((job) => job.id),
    [7, 8]
  )
  vm.toggleRow(cutter)
  assert.equal(vm.focusDay, '', 'the name shows all of their jobs')
  vm.toggleRow(cutter)
  assert.equal(vm.expanded, null)
  assert.deepEqual(vm.dayTotals['2026-11-12'], { free: 0, busy: 2, due: 1 })
  assert.deepEqual(vm.dayTotals['2026-11-14'], { free: 2, busy: 0, due: 0 })
  assert.deepEqual(
    { ...vm.overview },
    { freeToday: 1, busyToday: 1, late: 0, unassigned: 0 }
  )
  assert.equal(vm.loadText(0), 'Ազատ')
  vm.operatorFilter = '5'
  assert.deepEqual(
    vm.timelineRows.map((row) => row.operator.name),
    ['Bender']
  )
  vm.$destroy()
})

test('overdue work is today’s work: it is flagged and later days stay free', () => {
  const vm = calendar({ date: '2026-11-09', period: 'week' })
  vm.data = {
    today: '2026-11-10',
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
        title: 'Gate · Frame',
        workshop: 'Laser',
        factory_id: 2,
        operator_id: 4,
        helpers: [],
        starts_on: '2026-11-01',
        due_date: '2026-11-05',
        deadline_source: 'stage',
      },
      {
        id: 8,
        order_id: 4,
        name: '991.01',
        workshop: 'Laser',
        factory_id: 2,
        operator_id: null,
        helpers: [],
        due_date: '2026-11-30',
        can_edit: true,
      },
    ],
  }
  const [row] = vm.timelineRows
  const cell = (day) => row.cells.find((item) => item.day === day)
  assert.equal(row.late, 1)
  assert.equal(cell('2026-11-10').count, 1, 'overdue work fills today')
  assert.equal(cell('2026-11-10').late, true)
  assert.equal(cell('2026-11-11').count, 0, 'but not the days after it')
  assert.equal(cell('2026-11-11').slot, true)
  assert.equal(cell('2026-11-09').past, true)
  assert.equal(row.freeFrom, '2026-11-11')
  assert.equal(vm.statusText(row), 'Ազատ՝ 11.11.2026-ից')
  assert.deepEqual(
    { ...vm.overview },
    { freeToday: 0, busyToday: 1, late: 1, unassigned: 1 }
  )
  vm.cellClick(row, cell('2026-11-11'))
  assert.equal(vm.slot.late, 1, 'placing work warns about the overdue job')
  assert.equal(
    vm.fill(vm.t.lateWarning, { count: vm.slot.late }),
    'Այս օպերատորն ունի 1 ուշացած աշխատանք։'
  )
  vm.closeSlot()
  vm.cellClick(row, cell('2026-11-10'))
  assert.equal(vm.expanded, 4)
  assert.equal(vm.focusDay, '2026-11-10')
  assert.deepEqual(
    vm.detailJobs(row).map((job) => job.id),
    [7]
  )
  assert.equal(vm.jobTitle(vm.detailJobs(row)[0]), '#3 · Gate · Frame')
  vm.cellClick(row, cell('2026-11-10'))
  assert.equal(vm.expanded, null, 'a second click closes the jobs')
  vm.$destroy()
})

test('hours planned on a day put the work on that day, and overdue work moves there', async () => {
  const { holds } = load('utils/operator-calendar.js')
  assert.equal(holds({ window: null, booked: ['2026-11-17'] }, '2026-11-17'), true)
  assert.equal(
    holds({ window: { start: '2026-11-10', end: '2026-11-12' } }, '2026-11-17'),
    false
  )
  const vm = calendar({ date: '2026-11-16', period: 'week' })
  const reserved = (id, step, from, to, extra = {}) => ({
    id,
    operator_id: 4,
    factory_order_id: step,
    starts_at: from,
    ends_at: to,
    order_id: 3,
    task: '990.01',
    workshop: 'Laser',
    can_edit: true,
    ...extra,
  })
  vm.data = {
    today: '2026-11-12',
    factories: [
      { id: 2, name: 'Laser', operators: [{ id: 4, name: 'Cutter' }] },
    ],
    workers: [],
    shifts: [],
    bookings: [
      reserved(21, 7, '2026-11-17 10:00:00', '2026-11-17 12:00:00'),
      // Planned after the shown week: that day is not offered as free.
      reserved(22, 7, '2026-11-25 09:00:00', '2026-11-25 11:00:00'),
      // Hours for work the operator no longer holds still occupy them.
      reserved(23, 99, '2026-11-19 08:00:00', '2026-11-19 09:00:00', {
        task: '555.01',
        can_edit: false,
        assignment_changed: true,
      }),
    ],
    tasks: [
      {
        id: 7,
        order_id: 3,
        name: '990.01',
        title: 'Gate · Frame',
        workshop: 'Laser',
        factory_id: 2,
        operator_id: 4,
        helpers: [],
        starts_on: '2026-11-01',
        due_date: '2026-11-09',
        order_due_at: '2026-11-10 18:00:00',
        deadline_source: 'stage',
        can_edit: true,
      },
    ],
  }
  const [row] = vm.timelineRows
  const cell = (day) => row.cells.find((item) => item.day === day)
  const job = row.jobs.find((item) => item.id === 7)
  assert.equal(row.late, 1, 'the work is still overdue')
  assert.equal(job.window.rescheduled, true)
  assert.equal(row.freeFrom, '2026-11-12', 'it no longer fills today')
  assert.equal(cell('2026-11-17').count, 1, 'it shows on its planned day')
  assert.equal(cell('2026-11-17').reserved, true)
  assert.equal(cell('2026-11-17').slot, false, 'a planned day is not free')
  assert.match(vm.cellTitle(row, cell('2026-11-17')), /10:00–12:00/)
  assert.equal(vm.timesOn(job, '2026-11-17'), '10:00–12:00')
  assert.equal(
    vm.plannedText(job),
    '17.11.2026 10:00–12:00, 25.11.2026 09:00–11:00'
  )
  assert.equal(cell('2026-11-19').count, 1, 'leftover hours occupy the day')
  assert.equal(vm.isUndated(row.jobs.find((item) => item.id === 99)), false)
  assert.equal(cell('2026-11-18').slot, true)
  vm.cellClick(row, cell('2026-11-17'))
  assert.deepEqual(
    vm.detailJobs(row).map((item) => item.id),
    [7]
  )
  // A free day takes the operator's own work too, up to the next planned day.
  vm.openSlot(row, '2026-11-20')
  assert.equal(vm.slot.end, '2026-11-24', 'the 25th is planned already')
  assert.deepEqual(
    vm.slotGroups.map((group) => [group.key, group.items.map((t) => t.id)]),
    [['own', [7]]]
  )
  vm.slot.stageId = 7
  vm.syncSlotDeadline()
  assert.equal(vm.slotOrderPassed, true, 'the task deadline is behind')
  assert.equal(vm.slot.extendOrder, true, 'so moving the work moves it too')
  assert.equal(vm.slotLimitBinds, true)
  assert.equal(vm.slotBlocked, false)
  assert.equal(vm.slotExtends, true)
  assert.equal(vm.slotDeadlineMax, null, 'any later day is accepted')
  const placedBodies = []
  vm.$axios = {
    $post: (url, body) => {
      placedBodies.push(body)
      return Promise.resolve({})
    },
  }
  await vm.placeStage()
  assert.equal(placedBodies[0].extend_order, true)
  assert.equal(placedBodies[0].deadline, '2026-11-24')
  assert.match(vm.placedText, /Ընդհանուր ժամկետ՝ 24\.11\.2026/)
  // Left unticked, the days do not fit, but hours can still be planned.
  vm.openSlot(row, '2026-11-20')
  vm.slot.stageId = 7
  vm.syncSlotDeadline()
  vm.slot.extendOrder = false
  vm.syncSlotLimit()
  assert.equal(vm.slotBlocked, true)
  const planned = []
  vm.planJob = (task, day) => planned.push([task.id, day])
  vm.planFromSlot()
  assert.deepEqual(planned, [[7, '2026-11-20']])
  assert.equal(vm.slot, null)
  // Saving hours opens that day's jobs so the move is visible at once.
  const posted = []
  vm.$axios = {
    $post: (url, body) => {
      posted.push([url, body.starts_at])
      return Promise.resolve({})
    },
  }
  vm.booking = {
    operator_id: 4,
    factory_order_id: 7,
    day: '2026-11-21',
    start: '10:00',
    end: '11:00',
  }
  vm.closeDetail()
  await vm.book()
  assert.deepEqual(posted, [
    ['/api/operator-calendar/bookings', '2026-11-21 10:00'],
  ])
  assert.equal(vm.expanded, 4)
  assert.equal(vm.focusDay, '2026-11-21')
  vm.$destroy()
})

test('a month shows every day as a column and tasks use their project names', () => {
  const vm = calendar({ date: '2026-11-06', period: 'month' })
  assert.equal(vm.days[0], '2026-11-01')
  assert.equal(vm.days.length, 30)
  assert.equal(vm.gridStyle['--days'], 30)
  assert.equal(vm.gridStyle['--cell-min'], '1.55rem', 'narrow month columns')
  assert.equal(vm.weekdayOf('2026-11-02'), 'Երկ')
  assert.equal(vm.dateOf('2026-11-02'), '2 նոյ')
  assert.equal(
    vm.jobTitle({ order_id: 1, order_number: '2026-10-0001', name: '990.01' }),
    '#2026-10-0001 · 990.01'
  )
  assert.equal(
    vm.jobTitle({
      order_id: 1,
      order_number: '2026-10-0001',
      name: '990.01',
      title: 'Դարպաս · Շրջանակ',
    }),
    '#2026-10-0001 · Դարպաս · Շրջանակ',
    'the names replace the 990.01 code when the server sends them'
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
  assert.equal(vm.gridStyle['--cell-min'], '3.25rem')
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
    vm.slot && { ...vm.slot, operator: { ...vm.slot.operator }, factoryIds: [...vm.slot.factoryIds] },
    {
      operator: { id: 4, name: 'Cutter' },
      factoryIds: [2],
      start: '2026-11-11',
      end: '2026-11-25',
      late: 0,
      stageId: '',
      startsOn: '2026-11-11',
      deadline: '2026-11-25',
      extendOrder: false,
    }
  )
  assert.deepEqual(
    Array.from(vm.slotCandidates, (task) => task.id),
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
