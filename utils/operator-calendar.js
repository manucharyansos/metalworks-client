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
    title: 'Օպերատորների օրացույց',
    help: 'Ժամերը՝ Երևանի ժամով։ Ազատ միջակայքերը հաշվարկվում են աշխատանքային գրաֆիկից և ամրագրումներից։ Չպլանավորված աշխատանքների առկայության դեպքում դրանք ամբողջ ծանրաբեռնվածությունը չեն արտացոլում։',
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
  },
  ru: {
    title: 'Календарь операторов',
    help: 'Время Еревана. Свободные интервалы рассчитаны по рабочему графику и броням. При наличии незапланированных работ они не отражают полную загрузку.',
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
  },
  en: {
    title: 'Operator calendar',
    help: 'Yerevan time. Free intervals use working hours and reservations. Unscheduled work means these gaps do not represent total available capacity.',
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
  },
}
