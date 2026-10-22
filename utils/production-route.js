// Factory IDs describe a draft; saved dependencies refer to workshop job IDs.
export function dependencyIds(step) {
  return (
    step.predecessor_ids ?? (step.depends_on_id ? [step.depends_on_id] : [])
  )
    .map(Number)
    .filter((id, index, all) => all.indexOf(id) === index)
}

export function routeSnapshot(steps = []) {
  const rows = [...steps].sort(
    (a, b) => (a.route_position || 0) - (b.route_position || 0) || a.id - b.id
  )
  return rows.map((step) => ({
    factory_id: Number(step.factory_id),
    predecessor_factory_ids: dependencyIds(step)
      .map((id) =>
        Number(rows.find((row) => Number(row.id) === id)?.factory_id || -id)
      )
      .sort((a, b) => a - b),
    deadline: step.deadline?.slice(0, 10) || null,
  }))
}

export function routeFromSteps(steps) {
  const stages = routeSnapshot(steps)
  const parallel = stages.every(
    (stage) => !stage.predecessor_factory_ids.length
  )
  const sequential = stages.every((stage, index) =>
    index === 0
      ? !stage.predecessor_factory_ids.length
      : stage.predecessor_factory_ids.length === 1 &&
        stage.predecessor_factory_ids[0] === stages[index - 1].factory_id
  )
  return {
    mode: parallel ? 'parallel' : sequential ? 'sequential' : 'custom',
    stages,
  }
}

export function normalizeRoute(value, factories = []) {
  const allowed = new Set(factories.map((factory) => Number(factory.id)))
  const seen = new Set()
  const stages = []
  for (const stage of value?.stages || []) {
    const id = Number(stage.factory_id)
    if (!allowed.has(id) || seen.has(id)) continue
    seen.add(id)
    stages.push({
      factory_id: id,
      predecessor_factory_ids: [
        ...new Set((stage.predecessor_factory_ids || []).map(Number)),
      ]
        .filter((id) => allowed.has(id) && id !== Number(stage.factory_id))
        .sort((a, b) => a - b),
      deadline: stage.deadline || null,
    })
  }
  for (const id of allowed) {
    if (!seen.has(id))
      stages.push({
        factory_id: id,
        predecessor_factory_ids: [],
        deadline: null,
      })
  }
  const mode = ['parallel', 'sequential', 'custom'].includes(value?.mode)
    ? value.mode
    : 'sequential'
  return {
    mode,
    stages: stages.map((stage, index) => ({
      ...stage,
      predecessor_factory_ids:
        mode === 'parallel'
          ? []
          : mode === 'sequential'
          ? index
            ? [stages[index - 1].factory_id]
            : []
          : stage.predecessor_factory_ids,
    })),
  }
}

export function routeHasCycle(plan) {
  const graph = new Map(
    plan.stages.map((stage) => [
      stage.factory_id,
      stage.predecessor_factory_ids,
    ])
  )
  const visited = new Set()
  const active = new Set()
  function visit(id) {
    if (active.has(id) || !graph.has(id)) return true
    if (visited.has(id)) return false
    active.add(id)
    if (graph.get(id).some(visit)) return true
    active.delete(id)
    visited.add(id)
    return false
  }
  return plan.stages.some((stage) => visit(stage.factory_id))
}

export function routeFromFilePlans(files = [], factories = [], routing = []) {
  const graph = new Map(factories.map((factory) => [Number(factory.id), []]))
  const ordered = []
  let hasPlan = false
  for (const file of files) {
    if (!Array.isArray(file.production_factory_ids) || file.is_reference_file)
      continue
    hasPlan = true
    const targets =
      routing.find((row) => Number(row.file_id) === Number(file.id))
        ?.factory_ids || []
    const path = [
      ...new Set([...file.production_factory_ids, ...targets].map(Number)),
    ].filter((id) => targets.includes(id) && graph.has(id))
    path.forEach((id, index) => {
      if (!ordered.includes(id)) ordered.push(id)
      if (index) graph.get(id).push(path[index - 1])
    })
  }
  if (!hasPlan) return { mode: 'parallel', stages: [] }
  for (const id of graph.keys()) if (!ordered.includes(id)) ordered.push(id)
  return {
    mode: 'custom',
    stages: ordered.map((id) => ({
      factory_id: id,
      predecessor_factory_ids: [...new Set(graph.get(id))].sort(
        (a, b) => a - b
      ),
      deadline: null,
    })),
  }
}

export function routeWarnings(plan, overallDeadline) {
  const end = overallDeadline?.slice(0, 10)
  return plan.stages
    .filter(
      (stage) =>
        stage.deadline &&
        ((end && stage.deadline > end) ||
          stage.predecessor_factory_ids.some((id) => {
            const previous = plan.stages.find((row) => row.factory_id === id)
            return previous?.deadline && stage.deadline < previous.deadline
          }))
    )
    .map((stage) => stage.factory_id)
}

export const routeCopy = {
  hy: {
    title: 'Արտադրական երթուղի',
    help: 'Ընտրեք՝ որ արտադրամասերը երբ են սկսում։ Հաջորդ փուլը բացվում է նախորդների ավարտից և, եթե պահանջվում է, ինժեների հաստատումից հետո։',
    sequential: 'Հաջորդական',
    parallel: 'Զուգահեռ',
    custom: 'Խառը',
    sequentialHelp:
      'Փուլերը կատարվում են ներքևի հերթականությամբ։ Փոխեք հերթը սլաքներով։',
    parallelHelp: 'Բոլոր արտադրամասերը կարող են սկսել միաժամանակ։',
    customHelp:
      'Յուրաքանչյուր փուլի համար նշեք բոլոր արտադրամասերը, որոնց ավարտին այն սպասում է։ Առանց նշումների՝ կարող է սկսել անմիջապես։',
    after: 'Սպասում է',
    start: 'Կարող է սկսել անմիջապես',
    all: 'Սպասում է նշված բոլոր փուլերի ավարտին',
    deadline: 'Արտադրամասի վերջնաժամկետ',
    deadlineHelp:
      'Դատարկ թողնելու դեպքում գործում է առաջադրանքի ընդհանուր ժամկետը։',
    warning:
      'Ստուգեք ժամկետը․ այն ընդհանուր ժամկետից ուշ է կամ նախորդ փուլի ժամկետից շուտ։',
    cycle:
      'Հերթականությունը շրջան է կազմում։ Փոխեք նախորդ փուլերի ընտրությունը։',
    locked:
      'Սկսված փուլերի կախվածությունը և ավարտված փուլերի ժամկետները պահպանվում են։',
    up: 'Տեղափոխել վերև',
    down: 'Տեղափոխել ներքև',
    save: 'Պահպանել երթուղին',
    saving: 'Պահպանվում է…',
    saved: 'Երթուղին պահպանված է',
    refresh: 'Թարմացնել',
    stale: 'Երթուղին փոխվել է։ Թարմացրեք այն՝ փոփոխությունները տեսնելու համար։',
    failed: 'Չհաջողվեց պահպանել երթուղին',
    ready: 'Նախորդ փուլերն ավարտված են․ ձեր հերթն է',
  },
  ru: {
    title: 'Производственный маршрут',
    help: 'Следующий этап открывается после завершения предыдущих и подтверждения инженера, если оно требуется.',
    sequential: 'Последовательно',
    parallel: 'Параллельно',
    custom: 'Смешанный',
    sequentialHelp:
      'Этапы выполняются в указанном порядке. Изменяйте порядок стрелками.',
    parallelHelp: 'Все цеха могут начать одновременно.',
    customHelp:
      'Для каждого этапа отметьте все предыдущие цеха. Без отметок этап может начать сразу.',
    after: 'Ожидает',
    start: 'Может начать сразу',
    all: 'Ожидает завершения всех отмеченных этапов',
    deadline: 'Срок цеха',
    deadlineHelp: 'Если пусто, действует общий срок задания.',
    warning:
      'Проверьте срок: он позже общего срока или раньше предыдущего этапа.',
    cycle: 'Маршрут образует цикл. Измените зависимости.',
    locked:
      'Зависимости начатых этапов и сроки завершённых этапов сохраняются.',
    up: 'Переместить выше',
    down: 'Переместить ниже',
    save: 'Сохранить маршрут',
    saving: 'Сохранение…',
    saved: 'Маршрут сохранён',
    refresh: 'Обновить',
    stale: 'Маршрут изменён. Обновите его, чтобы увидеть изменения.',
    failed: 'Не удалось сохранить маршрут',
    ready: 'Предыдущие этапы завершены. Ваша очередь',
  },
  en: {
    title: 'Production route',
    help: 'The next stage opens after all prerequisites finish, including engineer approval when required.',
    sequential: 'Sequential',
    parallel: 'Parallel',
    custom: 'Mixed',
    sequentialHelp: 'Stages run in this order. Use the arrows to reorder them.',
    parallelHelp: 'All workshops may start at once.',
    customHelp:
      'Choose all prerequisites for each stage. With none selected, a stage may start immediately.',
    after: 'Waits for',
    start: 'May start immediately',
    all: 'Waits for every selected stage to finish',
    deadline: 'Workshop deadline',
    deadlineHelp: 'Leave blank to use the overall task deadline.',
    warning:
      'Check this deadline: it is after the task deadline or before a prerequisite deadline.',
    cycle: 'This route contains a cycle. Change the prerequisites.',
    locked:
      'Dependencies of started stages and deadlines of completed stages are preserved.',
    up: 'Move up',
    down: 'Move down',
    save: 'Save route',
    saving: 'Saving…',
    saved: 'Route saved',
    refresh: 'Refresh',
    stale: 'The route has changed. Refresh to review the changes.',
    failed: 'Could not save the route',
    ready: 'Previous stages finished. It is your turn',
  },
}
