// Notifications are stored with a machine-readable `type` and `data`. The text
// is built here so it follows the interface language; the server's Armenian
// `message` is only a fallback for types this file does not know yet.

export const notificationCopy = {
  hy: {
    title: 'Ծանուցումներ',
    open: 'Բացել ծանուցումները',
    empty: 'Նոր ծանուցումներ չկան',
    markAll: 'Նշել բոլորը կարդացված',
    loadFailed: 'Չհաջողվեց բեռնել ծանուցումները',
    markFailed: 'Չհաջողվեց նշել կարդացված։ Կրկին փորձեք։',
    task: 'Առաջադրանք',
    statuses: {
      pending: 'Սպասում',
      confirmed: 'Կատարվում է',
      finished: 'Ավարտված',
      completed: 'Ավարտված',
      done: 'Ավարտված',
      canceled: 'Մերժված',
      cancelled: 'Մերժված',
      date_changed: 'Ժամկետը փոխված է',
    },
    reasons: {
      unclear: 'Ոչ հստակ առաջադրանք',
      wrong_data: 'Սխալ տվյալներ',
      no_material: 'Նյութի բացակայություն',
      other: 'Այլ պատճառ',
    },
    types: {
      'step.status_changed':
        '«{factory}» արտադրամաս · {actor}՝ կարգավիճակը փոխել է՝ {from} → {to}',
      'step.finished_review':
        '«{factory}» արտադրամաս · {actor}՝ ավարտել է աշխատանքը։ Սպասում է ձեր հաստատմանը',
      'request.submitted.reject':
        '«{factory}» արտադրամաս · {actor}՝ խնդրում է մերժել աշխատանքը ({reason})։ Սպասում է ձեր համաձայնությանը',
      'request.submitted.deadline':
        '«{factory}» արտադրամաս · {actor}՝ խնդրում է ժամկետը փոխել մինչև {date}։ Սպասում է ձեր համաձայնությանը',
      'request.withdrawn':
        '«{factory}» արտադրամաս · {actor}՝ հետ է վերցրել իր հարցումը',
      'request.approved': 'Ինժեները համաձայնել է ձեր հարցմանը{note}',
      'request.declined': 'Ինժեները չի համաձայնել ձեր հարցմանը{note}',
      'step.finish_confirmed': 'Ինժեները հաստատել է ձեր աշխատանքի ավարտը',
      'step.finish_returned':
        'Ինժեները վերադարձրել է աշխատանքը վերանայման՝ {noteText}',
      'step.assigned': 'Ձեզ նշանակվել է աշխատանք՝ «{factory}» արտադրամաս',
      'step.unassigned': 'Աշխատանքը փոխանցվել է մեկ այլ կատարողի',
    },
  },
  ru: {
    title: 'Уведомления',
    open: 'Открыть уведомления',
    empty: 'Новых уведомлений нет',
    markAll: 'Отметить все прочитанными',
    loadFailed: 'Не удалось загрузить уведомления',
    markFailed: 'Не удалось отметить прочитанными. Попробуйте ещё раз.',
    task: 'Задание',
    statuses: {
      pending: 'Ожидание',
      confirmed: 'Выполняется',
      finished: 'Завершено',
      completed: 'Завершено',
      done: 'Завершено',
      canceled: 'Отклонено',
      cancelled: 'Отклонено',
      date_changed: 'Срок изменён',
    },
    reasons: {
      unclear: 'Задание неясно',
      wrong_data: 'Неверные данные',
      no_material: 'Нет материала',
      other: 'Другая причина',
    },
    types: {
      'step.status_changed':
        'Цех «{factory}» · {actor} изменил(а) статус: {from} → {to}',
      'step.finished_review':
        'Цех «{factory}» · {actor} завершил(а) работу. Ожидает вашего подтверждения',
      'request.submitted.reject':
        'Цех «{factory}» · {actor} просит отказаться от работы ({reason}). Ожидает вашего согласия',
      'request.submitted.deadline':
        'Цех «{factory}» · {actor} просит перенести срок до {date}. Ожидает вашего согласия',
      'request.withdrawn': 'Цех «{factory}» · {actor} отозвал(а) свой запрос',
      'request.approved': 'Инженер согласился с вашим запросом{note}',
      'request.declined': 'Инженер отклонил ваш запрос{note}',
      'step.finish_confirmed': 'Инженер подтвердил завершение вашей работы',
      'step.finish_returned': 'Инженер вернул работу на доработку: {noteText}',
      'step.assigned': 'Вам назначена работа в цехе «{factory}»',
      'step.unassigned': 'Работа передана другому исполнителю',
    },
  },
  en: {
    title: 'Notifications',
    open: 'Open notifications',
    empty: 'No new notifications',
    markAll: 'Mark all as read',
    loadFailed: 'Could not load notifications',
    markFailed: 'Could not mark as read. Please try again.',
    task: 'Task',
    statuses: {
      pending: 'Waiting',
      confirmed: 'In progress',
      finished: 'Finished',
      completed: 'Finished',
      done: 'Finished',
      canceled: 'Rejected',
      cancelled: 'Rejected',
      date_changed: 'Deadline changed',
    },
    reasons: {
      unclear: 'Unclear task',
      wrong_data: 'Wrong data',
      no_material: 'No material',
      other: 'Other reason',
    },
    types: {
      'step.status_changed':
        '“{factory}” · {actor} changed the status: {from} → {to}',
      'step.finished_review':
        '“{factory}” · {actor} finished the work. Waiting for your confirmation',
      'request.submitted.reject':
        '“{factory}” · {actor} asks to reject the job ({reason}). Waiting for your consent',
      'request.submitted.deadline':
        '“{factory}” · {actor} asks to move the deadline to {date}. Waiting for your consent',
      'request.withdrawn': '“{factory}” · {actor} withdrew their request',
      'request.approved': 'The engineer approved your request{note}',
      'request.declined': 'The engineer declined your request{note}',
      'step.finish_confirmed': 'The engineer confirmed your finished work',
      'step.finish_returned': 'The engineer sent the work back: {noteText}',
      'step.assigned': 'You were assigned a job in “{factory}”',
      'step.unassigned': 'The job was handed to another operator',
    },
  },
}

function fill(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '')
}

function formatDate(value, locale) {
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return String(value || '')
  return date.toLocaleDateString(locale === 'hy' ? 'hy-AM' : locale)
}

// Returns { ref, text }: `ref` is the task number, `text` the localized sentence.
export function describeNotification(notification, locale = 'hy') {
  const t = notificationCopy[locale] || notificationCopy.hy
  const data = notification?.data || {}
  const ref =
    data.order_number ||
    data.order_name ||
    (notification?.order_id ? `#${notification.order_id}` : '')
  const key =
    notification?.type === 'request.submitted'
      ? `request.submitted.${
          data.request_type === 'deadline' ? 'deadline' : 'reject'
        }`
      : notification?.type
  const template = t.types[key]
  if (!template) return { ref, text: notification?.message || '' }
  const status = (value, label) =>
    t.statuses[value] || label || value || t.statuses.pending
  const note = data.decision_note ? `. ${data.decision_note}` : ''
  return {
    ref,
    text: fill(template, {
      actor: data.actor || '',
      factory: data.factory || '',
      from: status(data.from_status, data.from_label),
      to: status(data.to_status, data.to_label),
      reason: t.reasons[data.reason] || data.reason || '',
      date: formatDate(data.proposed_date, locale),
      note,
      noteText: data.note || '',
    }),
  }
}

const FACTORY_HOME = {
  laser: '/factory/laser',
  bend: '/factory/bend',
  powder_catting: '/factory/powder',
  operator: '/factory/workspace',
}

// Where a notification leads, for the signed-in role. Engineers land on the
// task itself; everyone else lands on their own workspace.
export function notificationTarget(notification, role) {
  if (role === 'engineer') {
    return {
      path: '/engineer',
      query: notification?.order_id
        ? { order: String(notification.order_id) }
        : {},
    }
  }
  if (FACTORY_HOME[role]) return { path: FACTORY_HOME[role], query: {} }
  if (role === 'manager') return { path: '/manager', query: {} }
  if (role === 'admin') return { path: '/admin', query: {} }
  return { path: '/', query: {} }
}
