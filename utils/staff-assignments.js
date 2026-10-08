export const OPERATOR_ROLES = ['laser', 'bend', 'powder_catting']

export function assignmentRows(assignments, roleId, factoryId) {
  const rows = assignments?.length ? assignments : [{ role_id: roleId || '', factory_id: factoryId || null }]
  return rows.map(row => ({ role_id: Number(row.role_id) || '', factory_id: Number(row.factory_id) || null }))
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
  return copy[String(locale || 'hy').split('-')[0]] || copy.hy
}

export function staffAccessCopy(locale) {
  const copy = {
    hy: { edit: 'Հաստիքներ և արտադրամասեր', save: 'Պահպանել', cancel: 'Չեղարկել', loading: 'Բեռնվում է…', failed: 'Չհաջողվեց բեռնել նշանակումները։', saveFailed: 'Չհաջողվեց պահպանել նշանակումները։', retry: 'Կրկին փորձել', protected: 'Այս հասանելիությունը կառավարում է գլխավոր ադմինը։', requests: 'Գրանցման հարցումներ', permissions: 'Աշխատակիցների իրավունքներ', companies: 'Ընկերություններ' },
    ru: { edit: 'Должности и цеха', save: 'Сохранить', cancel: 'Отмена', loading: 'Загрузка…', failed: 'Не удалось загрузить назначения.', saveFailed: 'Не удалось сохранить назначения.', retry: 'Повторить', protected: 'Этим доступом управляет главный администратор.', requests: 'Заявки на регистрацию', permissions: 'Права сотрудников', companies: 'Предприятия' },
    en: { edit: 'Positions and workshops', save: 'Save', cancel: 'Cancel', loading: 'Loading…', failed: 'Could not load assignments.', saveFailed: 'Could not save assignments.', retry: 'Retry', protected: 'This access is managed by the platform administrator.', requests: 'Registration requests', permissions: 'Employee permissions', companies: 'Companies' },
  }
  return copy[String(locale || 'hy').split('-')[0]] || copy.hy
}
