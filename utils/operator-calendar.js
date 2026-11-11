// Calendar timestamps are local wall times in the explicit Asia/Yerevan schedule.
export function freeIntervals(shifts, bookings) {
  const result = []
  for (const shift of shifts) {
    let cursor = shift.starts_at
    for (const booking of [...bookings].sort((a, b) =>
      a.starts_at.localeCompare(b.starts_at)
    )) {
      if (booking.ends_at <= cursor || booking.starts_at >= shift.ends_at)
        continue
      if (booking.starts_at > cursor)
        result.push({ starts_at: cursor, ends_at: booking.starts_at })
      if (booking.ends_at > cursor) cursor = booking.ends_at
      if (cursor >= shift.ends_at) break
    }
    if (cursor < shift.ends_at)
      result.push({ starts_at: cursor, ends_at: shift.ends_at })
  }
  return result
}
const DAY = /^\d{4}-\d{2}-\d{2}$/

// An open job keeps its operator busy from the day it can start until its
// deadline. Overdue work is due now: it fills today, not every future day, so
// the calendar still shows what is planned ahead; overdue counts are shown apart.
export function jobWindow(job, today) {
  const due = job?.due_date
  if (!DAY.test(due || '')) return null
  const start =
    DAY.test(job.starts_on || '') && job.starts_on < due ? job.starts_on : due
  const overdue = Boolean(today && due < today)
  return { start, end: overdue ? today : due, due, overdue }
}

// Whether a job holds its operator on a day: inside its deadline window, or on
// a day with hours reserved for it (`booked`, a list of "YYYY-MM-DD" days).
export function holds(job, day) {
  return Boolean(
    (job?.window && job.window.start <= day && day <= job.window.end) ||
      (Array.isArray(job?.booked) && job.booked.includes(day))
  )
}

const covers = (jobs, day) => jobs.some((job) => holds(job, day))

// The first day from today on which none of the jobs holds the operator, or
// '' when every day up to `limit` days ahead is taken.
export function firstFreeDay(jobs, today, limit = 120) {
  if (!DAY.test(today || '')) return ''
  let day = today
  for (let i = 0; i <= limit; i++) {
    if (!covers(jobs, day)) return day
    day = addDays(day, 1)
  }
  return ''
}

// Rows for the visible days so jobs that overlap never share a row.
export function jobLanes(jobs, days) {
  if (!days.length) return []
  const first = days[0]
  const last = days[days.length - 1]
  const lanes = []
  return jobs
    .filter(
      (job) => job.window && job.window.end >= first && job.window.start <= last
    )
    .sort(
      (a, b) =>
        a.window.start.localeCompare(b.window.start) ||
        a.window.end.localeCompare(b.window.end) ||
        a.id - b.id
    )
    .map((job) => {
      const from = days.indexOf(
        job.window.start < first ? first : job.window.start
      )
      const to = days.indexOf(job.window.end > last ? last : job.window.end)
      let lane = lanes.findIndex((end) => end < from)
      if (lane === -1) {
        lane = lanes.length
        lanes.push(to)
      } else lanes[lane] = to
      return {
        job,
        from,
        to,
        lane,
        continuesBefore: job.window.start < first,
        continuesAfter: job.window.end > last,
      }
    })
}

function addDays(day, count) {
  const date = new Date(`${day}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + count)
  return date.toISOString().slice(0, 10)
}

// The free days around `day` for one operator: never before today and at most
// `limit` days on either side, so an idle operator gets a usable range.
export function freeSegment(jobs, day, today, limit = 13) {
  const busy = (date) => covers(jobs, date)
  if (!DAY.test(day || '') || day < today || busy(day)) return null
  let start = day
  let end = day
  for (let i = 0; i < limit; i++) {
    const before = addDays(start, -1)
    if (before < today || busy(before)) break
    start = before
  }
  for (let i = 0; i < limit; i++) {
    const after = addDays(end, 1)
    if (busy(after)) break
    end = after
  }
  return { start, end }
}

// How busy one operator is on a day, by the number of open jobs it holds.
export function loadLevel(count) {
  if (count <= 0) return 'free'
  if (count === 1) return 'light'
  return count === 2 ? 'busy' : 'heavy'
}

export function jobCount(count, locale = 'hy') {
  if (locale === 'ru') {
    const ones = count % 10
    const tens = count % 100
    const word =
      ones === 1 && tens !== 11
        ? 'работа'
        : ones >= 2 && ones <= 4 && (tens < 12 || tens > 14)
        ? 'работы'
        : 'работ'
    return `${count} ${word}`
  }
  if (locale === 'en') return `${count} ${count === 1 ? 'job' : 'jobs'}`
  return `${count} աշխատանք`
}

export function weekDates(date) {
  const d = new Date(date + 'T12:00:00Z')
  if (Number.isNaN(d.getTime())) return []
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(d)
    day.setUTCDate(day.getUTCDate() + i)
    return day.toISOString().slice(0, 10)
  })
}
export const calendarCopy = {
  hy: {
    openJobs: 'Կցված աշխատանքներ',
    late: 'Ուշացած',
    undated: 'Առանց ժամկետի',
    stageDue: 'Արտադրամասի ժամկետ',
    orderDue: 'Ընդհանուր ժամկետ',
    minutes: 'րոպե',
    noUnassigned: 'Բոլոր աշխատանքներն ունեն կատարող։',
    duration: 'Նախատեսվող տևողություն (րոպե)',
    findSlot: 'Գտնել ազատ ժամ',
    suggested: 'Առաջարկվող սկիզբ',
    confirmSlot: 'Հաստատել ժամը',
    confirmed: 'Հաստատված ժամ',
    change: 'Փոխել',
    noSlot:
      'Այս միջակայքում ազատ ժամ չկա։ Ընտրեք այլ օր կամ պահպանեք միայն տևողությունը։',
    predecessor: 'Նախ հաստատեք նախորդ քայլի ժամը։',
    searchFrom: 'Որոնել այս ամսաթվից',

    title: 'Օպերատորների օրացույց',
    help: 'Յուրաքանչյուր աշխատանք օպերատորին զբաղեցնում է սկսելու օրից մինչև արտադրամասին տրված ժամկետը, իսկ եթե այն չկա՝ մինչև առաջադրանքի ընդհանուր ժամկետը։ Թիվը ցույց է տալիս, թե քանի աշխատանք ունի օպերատորն այդ օրը։ Ուշացած աշխատանքը հաշվվում է որպես այսօրվա աշխատանք և նշվում է կարմիր «!» նշանով։',
    how: 'Ինչպե՞ս է հաշվվում',
    refresh: 'Թարմացնել',
    all: 'Բոլոր արտադրամասերը',
    shift: 'Աշխատանքային գրաֆիկ',
    operator: 'Օպերատոր',
    start: 'Սկիզբ',
    end: 'Ավարտ',
    addShift: 'Ավելացնել աշխատանքային ժամերը',
    empty: 'Գրաֆիկը նշված չէ',
    free: 'Չամրագրված ժամեր',
    busy: 'Ամրագրված',
    remove: 'Հանել',
    confirm: 'Հանե՞լ այս միջակայքը։',
    plan: 'Պլանավորել աշխատանքը',
    task: 'Առաջադրանք',
    day: 'Օր',
    save: 'Ամրագրել',
    queue: 'Չպլանավորված աշխատանքներ',
    queueHelp:
      'Նախ նշանակեք կատարողին առաջադրանքի էջում։ Երկար աշխատանքը կարելի է բաժանել մի քանի օրերի միջակայքների։',
    pending: 'Սպասում է նախորդ քայլին',
    changed: 'Կատարողը փոխված է․ վերապլանավորեք',
    unassigned: 'Կատարողը նշանակված չէ',
    noTasks: 'Չպլանավորված աշխատանք չկա',
    fail: 'Չհաջողվեց կատարել գործողությունը։',
    unknown: 'Անհասանելի աշխատակից',
    partial:
      'Միջակայքերի առկայությունը դեռ չի հաստատում, որ աշխատանքի ամբողջ տևողությունը պլանավորված է։',
    other: 'Այլ ինժիների առաջադրանք',
    noOptions: 'Նախ ընտրեք օպերատորի և նրան նշանակված առաջադրանքը։',
    date: 'Շաբաթ',
    loading: 'Բեռնվում է…',
    freeDay: 'Ազատ',
    freeShort: 'ազատ',
    available: 'Ազատ է',
    busyUntil: 'Զբաղված է մինչև',
    lateWork: 'Ունի ուշացած աշխատանք',
    slotTitle: 'Ազատ ժամանակ',
    placeExisting: 'Տեղադրել կամ տեղափոխել աշխատանք',
    placeHelp:
      'Չնշանակված աշխատանքը կնշանակվի այս օպերատորին, իսկ նրա սեփական աշխատանքը կտեղափոխվի այս օրերին։ Սկիզբը և արտադրամասի ժամկետը կդառնան ընտրված օրերը։',
    noCandidates: 'Այս օպերատորի արտադրամասերում չնշանակված աշխատանք չկա։',
    chooseWork: 'Ընտրեք աշխատանքը',
    place: 'Տեղադրել',
    placed: 'Աշխատանքը տեղադրվեց',
    createNew: 'Ստեղծել նոր առաջադրանք',
    createHelp:
      'Ստեղծման էջում կլրացվեն օպերատորը և ժամկետը։ Կատարող նշանակելը պարտադիր չէ։',
    close: 'Փակել',
    pickHint: 'Սեղմեք օպերատորի ազատ օրվա վրա՝ աշխատանք տեղադրելու համար։',
    freeDays: 'Ազատ օրեր',
    estimate: 'Գնահատված ժամանակ',
    hours: 'ժ',
    waiting: 'Սպասում է նախորդ արտադրամասին',
    reserved: 'Պլանավորված ժամ',
    legend: 'Ծանրաբեռնվածություն',
    busyOperators: 'զբաղված',
    noOperators: 'Ընտրված ֆիլտրերով օպերատոր չկա։',
    lead: 'Զբաղվածությունը հաշվարկվում է առաջադրանքների ժամկետներից։ Սեղմեք ազատ օրվա վրա՝ աշխատանք տեղադրելու, կամ օպերատորի վրա՝ նրա աշխատանքները տեսնելու համար։',
    freeToday: 'Այսօր ազատ',
    busyToday: 'Այսօր զբաղված',
    lateJobs: 'Ուշացած աշխատանքներ',
    unassignedJobs: 'Առանց կատարողի',
    statusFree: 'Ազատ է այսօր',
    statusFreeFrom: 'Ազատ՝ {date}-ից',
    statusBusyLong: 'Զբաղված է {days}+ օր',
    statusNoWork: 'Աշխատանք չունի',
    busyDays: 'Զբաղված՝ {busy}/{total} օր',
    jobs: 'Աշխատանքներ',
    noJobs: 'Աշխատանք չկա',
    showAll: 'Ցույց տալ բոլորը',
    jobsOnDay: '{day}-ի աշխատանքները',
    dueMark: 'Աշխատանքի ժամկետ',
    lateMark: 'Ունի ուշացած աշխատանք',
    pastDay: 'Անցած օր',
    placeHere: 'Տեղադրել աշխատանք',
    planJob: 'Պլանավորել ժամերը',
    freeOperators: 'Ազատ օպերատորներ',
    lateWarning: 'Այս օպերատորն ունի {count} ուշացած աշխատանք։',
    reservations: 'Ամրագրված ժամեր',
    unassignedWork: 'Չնշանակված աշխատանքներ',
    operatorWork: 'Այս օպերատորի աշխատանքները',
    plannedOn: 'Պլանավորված՝ {when}',
    orderDuePassed:
      'Արտադրամասի ժամկետը չի կարող լինել առաջադրանքի ընդհանուր ժամկետից ({date}) ուշ։ Նշեք ներքևում՝ ընդհանուր ժամկետն էլ տեղափոխելու համար, կամ պլանավորեք ժամեր այս օրը։',
    planHoursHere: 'Պլանավորել ժամեր այս օրը',
    extendOrder: 'Տեղափոխել նաև առաջադրանքի ընդհանուր ժամկետը (հիմա՝ {from})',
    extendOrderTo: 'Առաջադրանքի ընդհանուր ժամկետը կդառնա {to} (հիմա՝ {from})',
    taskDeadline: 'Ընդհանուր ժամկետ՝ {date}',
    reservedMark: 'Ամրագրված ժամեր',
  },
  ru: {
    openJobs: 'Назначенные работы',
    late: 'Просрочено',
    undated: 'Без срока',
    stageDue: 'Срок цеха',
    orderDue: 'Общий срок',
    minutes: 'мин',
    noUnassigned: 'Все работы назначены.',
    duration: 'Длительность (минуты)',
    findSlot: 'Найти время',
    suggested: 'Предлагаемое начало',
    confirmSlot: 'Подтвердить время',
    confirmed: 'Подтверждено',
    change: 'Изменить',
    noSlot:
      'Нет свободного интервала. Выберите другую дату или сохраните только длительность.',
    predecessor: 'Сначала подтвердите время предыдущего этапа.',
    searchFrom: 'Искать с даты',

    title: 'Календарь операторов',
    help: 'Каждая работа занимает оператора со дня начала до срока цеха, а если его нет — до общего срока задания. Число показывает, сколько работ у оператора в этот день. Просроченная работа считается работой на сегодня и отмечена красным «!».',
    how: 'Как считается?',
    refresh: 'Обновить',
    all: 'Все цеха',
    shift: 'Рабочий график',
    operator: 'Оператор',
    start: 'Начало',
    end: 'Конец',
    addShift: 'Добавить рабочие часы',
    empty: 'График не задан',
    free: 'Незабронированное время',
    busy: 'Забронировано',
    remove: 'Убрать',
    confirm: 'Убрать этот интервал?',
    plan: 'Запланировать работу',
    task: 'Задание',
    day: 'Дата',
    save: 'Забронировать',
    queue: 'Незапланированные работы',
    queueHelp:
      'Сначала назначьте исполнителя в задании. Длительную работу можно разделить на интервалы в разные дни.',
    pending: 'Ожидает предыдущий этап',
    changed: 'Исполнитель изменён: перепланируйте',
    unassigned: 'Исполнитель не назначен',
    noTasks: 'Нет незапланированных работ',
    fail: 'Не удалось выполнить действие.',
    unknown: 'Недоступный сотрудник',
    partial:
      'Наличие интервалов не подтверждает, что запланирована вся длительность работы.',
    other: 'Задание другого инженера',
    noOptions: 'Выберите оператора и назначенное ему задание.',
    date: 'Неделя',
    loading: 'Загрузка…',
    freeDay: 'Свободен',
    freeShort: 'свободны',
    available: 'Свободен',
    busyUntil: 'Занят до',
    lateWork: 'Есть просроченная работа',
    slotTitle: 'Свободное время',
    placeExisting: 'Поставить или перенести работу',
    placeHelp:
      'Неназначенная работа будет назначена этому оператору, а его собственная работа перенесена на эти дни. Начало и срок цеха станут выбранными днями.',
    noCandidates: 'В цехах этого оператора нет неназначенных работ.',
    chooseWork: 'Выберите работу',
    place: 'Поставить',
    placed: 'Работа поставлена',
    createNew: 'Создать новое задание',
    createHelp:
      'На странице создания будут заполнены оператор и сроки. Назначать исполнителя не обязательно.',
    close: 'Закрыть',
    pickHint: 'Нажмите на свободный день оператора, чтобы поставить работу.',
    freeDays: 'Свободные дни',
    estimate: 'Оценка времени',
    hours: 'ч',
    waiting: 'Ждёт предыдущий цех',
    reserved: 'Запланированное время',
    legend: 'Загрузка',
    busyOperators: 'заняты',
    noOperators: 'Нет операторов по выбранным фильтрам.',
    lead: 'Загрузка считается по срокам заданий. Нажмите на свободный день, чтобы поставить работу, или на оператора, чтобы увидеть его работы.',
    freeToday: 'Свободны сегодня',
    busyToday: 'Заняты сегодня',
    lateJobs: 'Просроченные работы',
    unassignedJobs: 'Без исполнителя',
    statusFree: 'Свободен сегодня',
    statusFreeFrom: 'Свободен с {date}',
    statusBusyLong: 'Занят {days}+ дней',
    statusNoWork: 'Нет работ',
    busyDays: 'Занят {busy} из {total} дн.',
    jobs: 'Работы',
    noJobs: 'Нет работ',
    showAll: 'Показать все',
    jobsOnDay: 'Работы на {day}',
    dueMark: 'Срок работы',
    lateMark: 'Есть просроченная работа',
    pastDay: 'Прошедший день',
    placeHere: 'Поставить работу',
    planJob: 'Запланировать часы',
    freeOperators: 'Свободные операторы',
    lateWarning: 'У этого оператора просроченных работ: {count}.',
    reservations: 'Забронированное время',
    unassignedWork: 'Неназначенные работы',
    operatorWork: 'Работы этого оператора',
    plannedOn: 'Запланировано: {when}',
    orderDuePassed:
      'Срок цеха не может быть позже общего срока задания ({date}). Отметьте ниже перенос общего срока или запланируйте часы на этот день.',
    planHoursHere: 'Запланировать часы на этот день',
    extendOrder: 'Перенести и общий срок задания (сейчас {from})',
    extendOrderTo: 'Общий срок задания станет {to} (сейчас {from})',
    taskDeadline: 'Общий срок: {date}',
    reservedMark: 'Забронированные часы',
  },
  en: {
    openJobs: 'Assigned work',
    late: 'Overdue',
    undated: 'No deadline',
    stageDue: 'Workshop deadline',
    orderDue: 'Task deadline',
    minutes: 'min',
    noUnassigned: 'All jobs have an operator.',
    duration: 'Estimated duration (minutes)',
    findSlot: 'Find a slot',
    suggested: 'Suggested start',
    confirmSlot: 'Confirm time',
    confirmed: 'Time confirmed',
    change: 'Change',
    noSlot: 'No slot found. Pick another date or save just the estimate.',
    predecessor: 'Confirm the preceding stage first.',
    searchFrom: 'Search from',

    title: 'Operator calendar',
    help: 'Each job keeps its operator busy from the day it can start until its workshop deadline, or the task deadline when the workshop has none. The number shows how many jobs the operator has that day. Overdue work counts as today’s work and is marked with a red “!”.',
    how: 'How is it calculated?',
    refresh: 'Refresh',
    all: 'All workshops',
    shift: 'Working hours',
    operator: 'Operator',
    start: 'Start',
    end: 'End',
    addShift: 'Add working hours',
    empty: 'Hours not configured',
    free: 'Unreserved time',
    busy: 'Reserved',
    remove: 'Remove',
    confirm: 'Remove this interval?',
    plan: 'Schedule work',
    task: 'Task',
    day: 'Date',
    save: 'Reserve',
    queue: 'Unscheduled work',
    queueHelp:
      'Assign an operator on the task page first. Long jobs can use multiple intervals on different days.',
    pending: 'Waiting for previous stage',
    changed: 'Operator changed: reschedule',
    unassigned: 'No operator assigned',
    noTasks: 'No unscheduled work',
    fail: 'The action could not be completed.',
    unknown: 'Unavailable operator',
    partial:
      'Reserved intervals do not confirm that the entire job duration has been planned.',
    other: 'Another engineer’s task',
    noOptions: 'Select an operator and a task assigned to them.',
    date: 'Week',
    loading: 'Loading…',
    freeDay: 'Free',
    freeShort: 'free',
    available: 'Available',
    busyUntil: 'Busy until',
    lateWork: 'Has overdue work',
    slotTitle: 'Free time',
    placeExisting: 'Place or move work',
    placeHelp:
      'Unassigned work is assigned to this operator, and their own work moves to these days. The start and the workshop deadline become the chosen days.',
    noCandidates: 'No unassigned work in this operator’s workshops.',
    chooseWork: 'Select work',
    place: 'Place',
    placed: 'Work placed',
    createNew: 'Create a new task',
    createHelp:
      'The create page opens with this operator and the dates filled in. Assigning an operator stays optional.',
    close: 'Close',
    pickHint: 'Click an operator’s free day to place work there.',
    freeDays: 'Free days',
    estimate: 'Estimated time',
    hours: 'h',
    waiting: 'Waiting for the previous workshop',
    reserved: 'Reserved time',
    legend: 'Workload',
    busyOperators: 'busy',
    noOperators: 'No operators match the selected filters.',
    lead: 'Workload comes from task deadlines. Click a free day to place work there, or an operator to see their jobs.',
    freeToday: 'Free today',
    busyToday: 'Busy today',
    lateJobs: 'Overdue jobs',
    unassignedJobs: 'Without an operator',
    statusFree: 'Free today',
    statusFreeFrom: 'Free from {date}',
    statusBusyLong: 'Busy {days}+ days',
    statusNoWork: 'No work',
    busyDays: 'Busy {busy} of {total} days',
    jobs: 'Jobs',
    noJobs: 'No jobs',
    showAll: 'Show all',
    jobsOnDay: 'Jobs on {day}',
    dueMark: 'Job deadline',
    lateMark: 'Has overdue work',
    pastDay: 'Past day',
    placeHere: 'Place work',
    planJob: 'Plan hours',
    freeOperators: 'Free operators',
    lateWarning: 'This operator has {count} overdue jobs.',
    reservations: 'Reserved hours',
    unassignedWork: 'Unassigned work',
    operatorWork: 'This operator’s work',
    plannedOn: 'Planned: {when}',
    orderDuePassed:
      'A workshop deadline cannot be later than the task deadline ({date}). Tick below to move the task deadline too, or plan hours on this day.',
    planHoursHere: 'Plan hours on this day',
    extendOrder: 'Also move the task deadline (now {from})',
    extendOrderTo: 'The task deadline becomes {to} (now {from})',
    taskDeadline: 'Task deadline: {date}',
    reservedMark: 'Reserved hours',
  },
}

// Treat schedule strings as Yerevan wall-clock values, independent of the browser zone.
export function endOfSlot(start, minutes) {
  const ms = Date.parse(start.slice(0, 16).replace(' ', 'T') + ':00Z')
  return new Date(ms + Number(minutes) * 60000)
    .toISOString()
    .slice(0, 16)
    .replace('T', ' ')
}
export function firstStageSlot(shifts, bookings, minutes, earliest) {
  if (!Number.isInteger(minutes) || minutes < 1) return null
  const gaps = freeIntervals(
    [...shifts].sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    bookings
  )
  for (const gap of gaps) {
    const start = [gap.starts_at.slice(0, 16), earliest.slice(0, 16)].sort()[1]
    if (endOfSlot(start, minutes) <= gap.ends_at.slice(0, 16)) return start
  }
  return null
}
export function calendarDays(date, period) {
  if (!/^\d{4}-\d\d-\d\d$/.test(date)) return []
  if (period === 'day') return [date]
  if (period !== 'month') return weekDates(date)
  const prefix = date.slice(0, 7)
  const [year, month] = prefix.split('-').map(Number)
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return Array.from(
    { length: count },
    (_, index) => prefix + '-' + String(index + 1).padStart(2, '0')
  )
}
