export const OPERATOR_ROLES = ['laser', 'bend', 'powder_catting']

export function assignmentRows(assignments, roleId, factoryId) {
  const rows = assignments?.length ? assignments : [{ role_id: roleId || '', factory_id: factoryId || null }]
  return rows.map(row => ({ role_id: Number(row.role_id) || '', factory_id: Number(row.factory_id) || null }))
}

export function selectedRoleIds(rows) {
  return [...new Set(rows.map(row => Number(row.role_id)).filter(Boolean))]
}

export function newCompanyAssignments(rows, roles) {
  return selectedRoleIds(rows).filter(id => roles.some(role => Number(role.id) === id && role.name !== 'authenticatedUser'))
    .map(role_id => ({ role_id, factory_id: null }))
}

export function selectAssignmentRoles(rows, ids) {
  const selected = [...new Set(ids.map(Number).filter(Boolean))]
  const result = rows.filter(row => selected.includes(Number(row.role_id))).map(row => ({ ...row }))
  for (const id of selected) if (!result.some(row => Number(row.role_id) === id)) result.push({ role_id: id, factory_id: null })
  return result
}

export function selectAssignmentWorkshops(rows, roleId, ids) {
  const selected = [...new Set(ids.map(Number).filter(Boolean))]
  const existing = rows.filter(row => Number(row.role_id) === Number(roleId))
  const replacements = existing.filter(row => selected.includes(Number(row.factory_id))).map(row => ({ ...row }))
  for (const id of selected) if (!replacements.some(row => Number(row.factory_id) === id)) replacements.push({ role_id: Number(roleId), factory_id: id })
  if (!replacements.length) replacements.push({ role_id: Number(roleId), factory_id: null })
  let inserted = false
  const result = []
  for (const row of rows) {
    if (Number(row.role_id) !== Number(roleId)) result.push({ ...row })
    else if (!inserted) { result.push(...replacements); inserted = true }
  }
  if (!inserted) result.push(...replacements)
  return result
}

export function assignmentError(rows, roles, factories, copy) {
  if (!rows?.length) return copy.chooseRole
  const seen = new Set()
  for (const row of rows) {
    const role = roles.find(role => String(role.id) === String(row.role_id))
    if (!role) return copy.chooseRole
    if (OPERATOR_ROLES.includes(role.name) && !factories.some(factory => String(factory.id) === String(row.factory_id))) return copy.chooseWorkshop
    if (!OPERATOR_ROLES.includes(role.name) && row.factory_id) return copy.chooseRole
    const key = `${row.role_id}:${row.factory_id || 0}`
    if (seen.has(key)) return copy.duplicate
    seen.add(key)
  }
  if (rows.length > 1 && rows.some(row => roles.find(role => String(role.id) === String(row.role_id))?.name === 'authenticatedUser')) return copy.clientOnly
  return null
}

export function assignmentCopy(locale) {
  const copy = {
    hy: { title: 'Հաստիքներ և արտադրամասեր', add: 'Ավելացնել հաստիք', remove: 'Հեռացնել', primary: 'Հիմնական', makePrimary: 'Դարձնել հիմնական', role: 'Հաստիք', workshop: 'Արտադրամաս', chooseRole: 'Ընտրեք հաստիքը', chooseWorkshop: 'Ընտրեք արտադրամասը', duplicate: 'Այս հաստիքն ու արտադրամասն արդեն ընտրված են։', clientOnly: 'Հաճախորդի հասանելիությունը չի համատեղվում աշխատակցի հաստիքների հետ նույն ընկերությունում։', hint: 'Ավելացրեք անհրաժեշտ հաստիքներն ու արտադրամասերը։ Հիմնական հաստիքը բացվում է մուտքից հետո, մյուսները կարելի է ընտրել կողային ընտրացանկից։', select: 'Աշխատանքային հաստիք և արտադրամաս' },
    ru: { title: 'Должности и цеха', add: 'Добавить должность', remove: 'Удалить', primary: 'Основная', makePrimary: 'Сделать основной', role: 'Должность', workshop: 'Цех', chooseRole: 'Выберите должность', chooseWorkshop: 'Выберите цех', duplicate: 'Эта должность и цех уже выбраны.', clientOnly: 'Доступ клиента нельзя совмещать с должностями сотрудника в одной компании.', hint: 'Добавьте нужные должности и цеха. Основная должность открывается после входа; другие доступны в боковом меню.', select: 'Рабочая должность и цех' },
    en: { title: 'Positions and workshops', add: 'Add position', remove: 'Remove', primary: 'Primary', makePrimary: 'Make primary', role: 'Position', workshop: 'Workshop', chooseRole: 'Select a position', chooseWorkshop: 'Select a workshop', duplicate: 'This position and workshop are already selected.', clientOnly: 'Client access cannot be combined with employee positions in one company.', hint: 'Add the required positions and workshops. The primary position opens after sign-in; others are available in the sidebar.', select: 'Working position and workshop' },
  }
  const selection = {
    hy: { roles: 'Հաստիքներ', workshopsFor: 'Արտադրամասեր՝', noWorkshops: 'Այս ընկերությունում արտադրամասեր դեռ չկան։', workshopHint: 'Նշեք այս հաստիքի հասանելի արտադրամասերը։', productionHint: 'Արտադրամասերը ընտրելու համար նշեք արտադրական հաստիքը՝ լազերային կտրում, կռում կամ փոշեներկում։', hint: 'Նշեք անհրաժեշտ հաստիքները, ապա յուրաքանչյուր արտադրական հաստիքի արտադրամասերը։ Հիմնական նշանակումը բացվում է մուտքից հետո։' },
    ru: { roles: 'Должности', workshopsFor: 'Цеха для должности:', noWorkshops: 'В этой компании пока нет цехов.', workshopHint: 'Отметьте цеха, доступные для этой должности.', productionHint: 'Для выбора цехов отметьте производственную должность: лазерная резка, гибка или порошковая покраска.', hint: 'Отметьте должности, затем цеха для каждой производственной должности. Основное назначение открывается после входа.' },
    en: { roles: 'Positions', workshopsFor: 'Workshops for:', noWorkshops: 'This company has no workshops yet.', workshopHint: 'Select the workshops available for this position.', productionHint: 'To select workshops, check a production position: laser cutting, bending or powder coating.', hint: 'Select positions, then workshops for each production position. The primary assignment opens after sign-in.' },
  }
  const language = String(locale || 'hy').split('-')[0]
  return { ...(copy[language] || copy.hy), ...(selection[language] || selection.hy) }
}

export function staffAccessCopy(locale) {
  const copy = {
    hy: { edit: 'Հաստիքներ և արտադրամասեր', save: 'Պահպանել', cancel: 'Չեղարկել', loading: 'Բեռնվում է…', failed: 'Չհաջողվեց բեռնել նշանակումները։', saveFailed: 'Չհաջողվեց պահպանել նշանակումները։', retry: 'Կրկին փորձել', protected: 'Այս հասանելիությունը կառավարում է գլխավոր ադմինը։', requests: 'Գրանցման հարցումներ', permissions: 'Աշխատակիցների իրավունքներ', companies: 'Ընկերություններ' },
    ru: { edit: 'Должности и цеха', save: 'Сохранить', cancel: 'Отмена', loading: 'Загрузка…', failed: 'Не удалось загрузить назначения.', saveFailed: 'Не удалось сохранить назначения.', retry: 'Повторить', protected: 'Этим доступом управляет главный администратор.', requests: 'Заявки на регистрацию', permissions: 'Права сотрудников', companies: 'Предприятия' },
    en: { edit: 'Positions and workshops', save: 'Save', cancel: 'Cancel', loading: 'Loading…', failed: 'Could not load assignments.', saveFailed: 'Could not save assignments.', retry: 'Retry', protected: 'This access is managed by the platform administrator.', requests: 'Registration requests', permissions: 'Employee permissions', companies: 'Companies' },
  }
  return copy[String(locale || 'hy').split('-')[0]] || copy.hy
}
