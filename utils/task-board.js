import { isStepCompleted, isStepRejected } from '@/utils/task-workflow'
import { isProductionWorkshop } from '@/utils/workshop-catalog'

export function workshopSteps(order) {
  return (order?.factory_orders || []).filter(
    (step) => !step.factory || isProductionWorkshop(step.factory)
  )
}

export function taskActionTarget(order, target) {
  if (!target?.enabled) return null
  const steps = workshopSteps(order)
  const step =
    steps.find((step) => String(step.id) === String(target.stepId)) ||
    steps.find(
      (step) => step.pending_request || step.awaiting_engineer_confirmation
    ) ||
    steps[0]
  if (!step) return null
  const kind =
    target.action === 'proof' && step.awaiting_engineer_confirmation
      ? 'proof'
      : step.pending_request
      ? 'request'
      : step.awaiting_engineer_confirmation
      ? 'proof'
      : 'step'
  return { stepId: step.id, kind }
}

export const boardCopy = {
  hy: {
    loading: 'Բեռնվում է…',
    retry: 'Կրկին փորձել',
    loadFailed: 'Չհաջողվեց բեռնել սյունակը',
    empty: 'Այս կարգավիճակով առաջադրանքներ չկան',
    previousPage: 'Նախորդ էջ',
    nextPage: 'Հաջորդ էջ',
    perColumn: 'Յուրաքանչյուր սյունակում',
    shortCreated: 'Ստեղծված',
    created: 'Ստեղծված առաջադրանքներ',
    accepted: 'Ընդունված',
    in_progress: 'Կատարվում է',
    completed: 'Ավարտված',
    rejected: 'Մերժված',
    all: 'Բոլոր առաջադրանքները',
    accept: 'Ընդունել',
    start: 'Սկսել',
    review: 'Սպասում է ինժեների հաստատմանը',
    finished: 'Ավարտը հաստատված է',
    recentHelp: 'Հաստատված ավարտները ցուցադրվում են ևս 48 ժամ։',
    approvedAt: 'Ավարտված է',
    reopen: 'Վերաբացման հարցում',
    reopenHelp:
      'Մերժված աշխատանքը կվերաբացվի միայն ստեղծող ինժեների համաձայնությամբ։',
    reopenTarget: 'Վերաբացել որպես',
    pendingReopen: 'Վերաբացման հարցումը սպասում է պատասխանին',
    files: 'Ֆայլեր',
    operator: 'Կատարող',
    deadline: 'Ժամկետ',
    noOperator: 'Չնշանակված',
    stage: 'Առաջադրանքների փուլերը',
    engineer: 'Ինժեներ',
  },
  ru: {
    loading: 'Загрузка…',
    retry: 'Повторить',
    loadFailed: 'Не удалось загрузить колонку',
    empty: 'Нет задач с этим статусом',
    previousPage: 'Предыдущая страница',
    nextPage: 'Следующая страница',
    perColumn: 'В каждой колонке',
    shortCreated: 'Создано',
    created: 'Созданные задания',
    accepted: 'Принятые',
    in_progress: 'В работе',
    completed: 'Завершённые',
    rejected: 'Отклонённые',
    all: 'Все задания',
    accept: 'Принять',
    start: 'Начать',
    review: 'Ожидает подтверждения инженера',
    finished: 'Завершение подтверждено',
    recentHelp: 'Подтверждённые завершения остаются видимыми ещё 48 часов.',
    approvedAt: 'Завершено',
    reopen: 'Запрос на возобновление',
    reopenHelp:
      'Отклонённая работа возобновится только после согласия создавшего её инженера.',
    reopenTarget: 'Возобновить как',
    pendingReopen: 'Запрос на возобновление ожидает ответа',
    files: 'Файлы',
    operator: 'Исполнитель',
    deadline: 'Срок',
    noOperator: 'Не назначен',
    stage: 'Этапы заданий',
    engineer: 'Инженер',
  },
  en: {
    loading: 'Loading…',
    retry: 'Try again',
    loadFailed: 'Could not load this column',
    empty: 'No tasks with this status',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    perColumn: 'Per column',
    shortCreated: 'Created',
    created: 'Created tasks',
    accepted: 'Accepted',
    in_progress: 'In progress',
    completed: 'Completed',
    rejected: 'Rejected',
    all: 'All tasks',
    accept: 'Accept',
    start: 'Start',
    review: 'Waiting for engineer approval',
    finished: 'Completion confirmed',
    recentHelp: 'Confirmed completions remain visible for another 48 hours.',
    approvedAt: 'Completed',
    reopen: 'Reopen request',
    reopenHelp:
      'Rejected work will reopen only after the creating engineer agrees.',
    reopenTarget: 'Reopen as',
    pendingReopen: 'Reopen request is waiting for an answer',
    files: 'Files',
    operator: 'Operator',
    deadline: 'Deadline',
    noOperator: 'Unassigned',
    stage: 'Task stages',
    engineer: 'Engineer',
  },
}

export function taskStage(order) {
  const steps = workshopSteps(order)
  const active = steps.filter((step) => !isStepRejected(step))
  if (
    order?.status === 'completed' ||
    (active.length && active.every(isStepCompleted))
  )
    return 'completed'
  if (
    active.some(
      (step) =>
        [
          'confirmed',
          'in_progress',
          'date_changed',
          'finished',
          'completed',
          'done',
        ].includes(step.status) || step.completed_at
    )
  )
    return 'in_progress'
  if (active.some((step) => step.status === 'accepted')) return 'accepted'
  return 'created'
}

export function boardColumnForStep(step) {
  const status = String(step?.status || '').toLowerCase()
  if (['', 'null', 'pending', 'waiting'].includes(status)) return 'null'
  if (['canceled', 'cancelled', 'rejected'].includes(status)) return 'canceled'
  if (
    [
      'confirmed',
      'in_progress',
      'date_changed',
      'finished',
      'completed',
      'done',
    ].includes(status)
  )
    return 'confirmed'
  return status
}

export function factoryBoardColumns(
  orders,
  factoryId,
  options = [],
  locale = 'hy'
) {
  const t = boardCopy[locale] || boardCopy.hy
  const columns = [
    {
      id: 'no_status',
      value: 'null',
      label: t.created,
      icon: '•',
      color: '#64748B',
    },
    {
      id: 'accepted',
      value: 'accepted',
      label: t.accepted,
      icon: '✓',
      color: '#6366F1',
    },
    {
      id: 'confirmed',
      value: 'confirmed',
      label: t.in_progress,
      icon: '↻',
      color: '#2563EB',
    },
    {
      id: 'canceled',
      value: 'canceled',
      label: t.rejected,
      icon: '×',
      color: '#E11D48',
    },
  ]
  for (const option of options) {
    const value = boardColumnForStep({ status: option.value })
    if (columns.some((column) => column.value === value)) continue
    columns.push({
      ...option,
      id: value,
      value,
      icon: '•',
      color: option.color || '#64748B',
    })
  }
  return columns.map((column) => ({
    ...column,
    orders: orders.filter((order) => {
      const step = order.factory_orders?.find(
        (row) => String(row.factory_id) === String(factoryId)
      )
      return step && boardColumnForStep(step) === column.value
    }),
  }))
}

export function stepStatusText(step, locale = 'hy') {
  const t = boardCopy[locale] || boardCopy.hy
  if (step?.awaiting_engineer_confirmation) return t.review
  if (isStepCompleted(step)) return t.finished
  if (isStepRejected(step)) return t.rejected
  const column = boardColumnForStep(step)
  // A single job is "Created"; t.created is the plural column heading.
  return column === 'null'
    ? t.shortCreated
    : column === 'confirmed'
    ? t.in_progress
    : column === 'accepted'
    ? t.accepted
    : column
}
