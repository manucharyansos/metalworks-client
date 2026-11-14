// The org chart: a company's positions under one another, with the employees
// who hold them. Kept free of imports so tests can load it directly.

export const orgChartCopy = {
  hy: {
    title: 'Կառուցվածք',
    help: 'Ընկերության հաստիքները և նրանց ենթակա հաստիքները։ Յուրաքանչյուր հաստիք իր աշխատակիցներին տալիս է մուտքի մակարդակ, իսկ արտադրական հաստիքները՝ նաև արտադրամաս։',
    addTop: 'Նոր հաստիք',
    addChild: 'Ենթակա հաստիք',
    addEmployee: 'Աշխատակից',
    edit: 'Խմբագրել',
    remove: 'Ջնջել',
    vacant: 'Թափուր',
    empty: 'Կառուցվածքը դեռ դատարկ է',
    emptyHint:
      'Ստեղծեք այն աշխատակիցների ներկա հաստիքներից կամ ավելացրեք առաջին հաստիքը։',
    generate: 'Ստեղծել ներկա հաստիքներից',
    noPositions:
      'Դեռ հաստիք չկա, որտեղ աշխատակցին տեղավորել։ Նախ ստեղծեք կառուցվածքը կամ ավելացրեք հաստիք։',
    unplaced: 'Չտեղավորված աշխատակիցներ',
    place: 'Տեղավորել',
    move: 'Տեղափոխել',
    removeFrom: 'Հանել այս հաստիքից',
    name: 'Անվանում',
    parent: 'Ենթակա է',
    noParent: 'Վերին մակարդակ',
    access: 'Մուտքի մակարդակ',
    workshop: 'Արտադրամաս',
    chooseWorkshop: 'Ընտրեք արտադրամասը',
    duties: 'Պարտականություններ',
    dutiesPlaceholder: 'Ինչով է զբաղվում այս հաստիքը (ոչ պարտադիր)',
    save: 'Պահպանել',
    cancel: 'Չեղարկել',
    newPosition: 'Նոր հաստիք',
    editPosition: 'Խմբագրել հաստիքը',
    employee: 'Աշխատակից',
    chooseEmployee: 'Ընտրեք աշխատակցին',
    position: 'Հաստիք',
    choosePosition: 'Ընտրեք հաստիքը',
    instead: 'Փոխարինի',
    extra: 'Լրացուցիչ հաստիք՝ ներկաները պահելով',
    accessNote: 'Աշխատակիցը կստանա այս հաստիքի մուտքի մակարդակը։',
    confirmRemove:
      'Ջնջե՞լ «{name}» հաստիքը։ Ենթակա հաստիքները կբարձրանան մեկ մակարդակ։',
    locked: 'Ադմինիստրատորին փոխում է միայն պլատֆորմի ադմինիստրատորը։',
    loadFailed: 'Չհաջողվեց բեռնել կառուցվածքը։',
    retry: 'Կրկին փորձել',
    zoomIn: 'Մեծացնել',
    zoomOut: 'Փոքրացնել',
    actions: 'Գործողություններ',
    people: 'աշխատակից',
  },
  ru: {
    title: 'Оргструктура',
    help: 'Должности компании и подчинённые им должности. Каждая должность даёт своим сотрудникам уровень доступа, а производственные — ещё и цех.',
    addTop: 'Новая должность',
    addChild: 'Подчинённая должность',
    addEmployee: 'Сотрудник',
    edit: 'Изменить',
    remove: 'Удалить',
    vacant: 'Вакансия',
    empty: 'Оргструктура пока пуста',
    emptyHint:
      'Создайте её из текущих должностей сотрудников или добавьте первую должность.',
    generate: 'Создать из текущих должностей',
    noPositions:
      'Пока нет должности, куда разместить сотрудника. Сначала создайте оргструктуру или добавьте должность.',
    unplaced: 'Сотрудники вне структуры',
    place: 'Разместить',
    move: 'Переместить',
    removeFrom: 'Убрать с этой должности',
    name: 'Название',
    parent: 'Подчиняется',
    noParent: 'Верхний уровень',
    access: 'Уровень доступа',
    workshop: 'Цех',
    chooseWorkshop: 'Выберите цех',
    duties: 'Обязанности',
    dutiesPlaceholder: 'Чем занимается эта должность (необязательно)',
    save: 'Сохранить',
    cancel: 'Отмена',
    newPosition: 'Новая должность',
    editPosition: 'Изменить должность',
    employee: 'Сотрудник',
    chooseEmployee: 'Выберите сотрудника',
    position: 'Должность',
    choosePosition: 'Выберите должность',
    instead: 'Вместо',
    extra: 'Дополнительная должность, текущие сохраняются',
    accessNote: 'Сотрудник получит уровень доступа этой должности.',
    confirmRemove:
      'Удалить должность «{name}»? Подчинённые должности поднимутся на уровень выше.',
    locked: 'Администратора меняет только администратор платформы.',
    loadFailed: 'Не удалось загрузить оргструктуру.',
    retry: 'Повторить',
    zoomIn: 'Увеличить',
    zoomOut: 'Уменьшить',
    actions: 'Действия',
    people: 'сотр.',
  },
  en: {
    title: 'Org chart',
    help: 'The company’s positions and the positions under them. Each position gives its employees an access level, and production positions also a workshop.',
    addTop: 'New position',
    addChild: 'Subordinate position',
    addEmployee: 'Employee',
    edit: 'Edit',
    remove: 'Delete',
    vacant: 'Vacant',
    empty: 'The org chart is empty',
    emptyHint:
      'Create it from the positions employees hold now, or add the first position.',
    generate: 'Create from current positions',
    noPositions:
      'There is no position to place the employee in yet. Create the chart first or add a position.',
    unplaced: 'Employees outside the chart',
    place: 'Place',
    move: 'Move',
    removeFrom: 'Remove from this position',
    name: 'Name',
    parent: 'Reports to',
    noParent: 'Top level',
    access: 'Access level',
    workshop: 'Workshop',
    chooseWorkshop: 'Choose the workshop',
    duties: 'Responsibilities',
    dutiesPlaceholder: 'What this position does (optional)',
    save: 'Save',
    cancel: 'Cancel',
    newPosition: 'New position',
    editPosition: 'Edit position',
    employee: 'Employee',
    chooseEmployee: 'Choose the employee',
    position: 'Position',
    choosePosition: 'Choose the position',
    instead: 'Instead of',
    extra: 'An extra position, keeping the current ones',
    accessNote: 'The employee gets this position’s access level.',
    confirmRemove:
      'Delete the “{name}” position? Its subordinate positions move up one level.',
    locked: 'Only the platform administrator changes an administrator.',
    loadFailed: 'Could not load the org chart.',
    retry: 'Retry',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    actions: 'Actions',
    people: 'people',
  },
}

export const PRODUCTION_ROLES = ['laser', 'bend', 'powder_catting', 'operator']

const byOrder = (a, b) =>
  (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || a.id - b.id

// Positions as a tree; a parent outside the list makes a position top-level.
export function buildTree(positions = []) {
  const known = new Set(positions.map((row) => row.id))
  const children = new Map()
  for (const row of positions) {
    const parent = known.has(row.parent_id) ? row.parent_id : null
    if (!children.has(parent)) children.set(parent, [])
    children.get(parent).push(row)
  }
  const grow = (row, depth, seen) => {
    if (seen.has(row.id)) return null
    const path = new Set(seen).add(row.id)
    return {
      ...row,
      depth,
      children: (children.get(row.id) || [])
        .slice()
        .sort(byOrder)
        .map((child) => grow(child, depth + 1, path))
        .filter(Boolean),
    }
  }
  return (children.get(null) || [])
    .slice()
    .sort(byOrder)
    .map((row) => grow(row, 0, new Set()))
    .filter(Boolean)
}

// The position and every position under it: none of them can become its parent.
export function branchIds(positions = [], id) {
  const ids = new Set()
  const queue = [id]
  while (queue.length) {
    const current = queue.shift()
    if (current == null || ids.has(current)) continue
    ids.add(current)
    for (const row of positions)
      if (row.parent_id === current) queue.push(row.id)
  }
  return ids
}

// Every position in tree order with its depth, for indented selects.
export function flatPositions(positions = []) {
  const out = []
  const walk = (nodes) =>
    nodes.forEach((node) => {
      out.push(node)
      walk(node.children)
    })
  walk(buildTree(positions))
  return out
}

// The parents a position may get: anything outside its own branch.
export function parentOptions(positions = [], id = null) {
  const blocked = id == null ? new Set() : branchIds(positions, id)
  return flatPositions(positions).filter((row) => !blocked.has(row.id))
}

// Departments get their own colour: below a single top chain (owner, then
// director), each branch where the chart first splits is one department.
export function departmentTones(tree = [], tones = 6) {
  const toneOf = new Map()
  let hub = tree
  const chain = []
  while (hub.length === 1 && hub[0].children.length) {
    chain.push(hub[0].id)
    hub = hub[0].children
  }
  const paint = (node, tone) => {
    toneOf.set(node.id, tone)
    node.children.forEach((child) => paint(child, tone))
  }
  hub.forEach((node, index) => paint(node, index % tones))
  chain.forEach((id) => toneOf.set(id, null))
  return toneOf
}

// "Laser cutting · Sheet workshop": the access level and, for production, the workshop.
export function accessText(role, factory, roleNames = {}) {
  const label = roleNames[role?.name] || role?.value || role?.name || ''
  return factory?.name ? `${label} · ${factory.name}` : label
}

// Everyone in the chart with every position they hold or still need.
export function peopleOf(chart = {}) {
  const people = new Map()
  const add = (row, position) => {
    if (!people.has(row.user_id))
      people.set(row.user_id, {
        user_id: row.user_id,
        name: row.name,
        email: row.email,
        locked: Boolean(row.locked),
        assignments: [],
      })
    people.get(row.user_id).assignments.push({
      assignment_id: row.assignment_id,
      role: row.role,
      factory: row.factory,
      position: position ? { id: position.id, name: position.name } : null,
    })
  }
  for (const position of chart.positions || [])
    for (const row of position.members || []) add(row, position)
  for (const row of chart.unplaced || []) add(row, null)
  return [...people.values()].sort((a, b) =>
    String(a.name).localeCompare(String(b.name))
  )
}

export function initials(name) {
  return (
    String(name || '?')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || '?'
  )
}
