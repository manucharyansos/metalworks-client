const copy = {
  hy: {
    title: 'Օգտատիրոջ ընկերությունները', button: 'Ընկերություններ', intro: 'Նշեք հասանելի ընկերությունները և յուրաքանչյուրի համար ընտրեք հաստիքը։',
    rights: 'Ցուցադրվում են այն ընկերությունները, որտեղ դուք կարող եք կառավարել հասանելիությունը։',
    current: 'Ընտրված ընկերություն․ խմբագրեք աշխատակցի կամ հաճախորդի ձևից։', protected: 'Այս հասանելիությունը կառավարում է գլխավոր ադմինը։',
    loading: 'Բեռնվում է…', failed: 'Չհաջողվեց բեռնել հասանելիությունները։', saveFailed: 'Չհաջողվեց պահպանել հասանելիությունները։', retry: 'Կրկին փորձել',
    save: 'Պահպանել', cancel: 'Չեղարկել', saving: 'Պահպանվում է…', role: 'Հաստիք', workshop: 'Արտադրամաս', chooseRole: 'Ընտրեք հաստիքը', chooseWorkshop: 'Ընտրեք արտադրամասը',
    roles: { authenticatedUser: 'Հաճախորդ', admin: 'Ադմինիստրատոր', manager: 'Մենեջեր', engineer: 'Ինժիներ', laser: 'Լազերային կտրում', bend: 'Կռում', powder_catting: 'Փոշեներկում' },
  },
  ru: {
    title: 'Предприятия пользователя', button: 'Предприятия', intro: 'Отметьте доступные предприятия и выберите должность в каждом.',
    rights: 'Показаны предприятия, в которых вы можете управлять доступом.',
    current: 'Выбранное предприятие: редактируйте через форму сотрудника или клиента.', protected: 'Этим доступом управляет главный администратор.',
    loading: 'Загрузка…', failed: 'Не удалось загрузить доступы.', saveFailed: 'Не удалось сохранить доступы.', retry: 'Повторить',
    save: 'Сохранить', cancel: 'Отмена', saving: 'Сохранение…', role: 'Должность', workshop: 'Цех', chooseRole: 'Выберите должность', chooseWorkshop: 'Выберите цех',
    roles: { authenticatedUser: 'Клиент', admin: 'Администратор', manager: 'Менеджер', engineer: 'Инженер', laser: 'Лазерная резка', bend: 'Гибка', powder_catting: 'Порошковая покраска' },
  },
  en: {
    title: 'User’s companies', button: 'Companies', intro: 'Select available companies and assign a role in each.',
    rights: 'Only companies where you can manage access are shown.',
    current: 'Selected company: edit through the employee or client form.', protected: 'This access is managed by the platform administrator.',
    loading: 'Loading…', failed: 'Could not load company access.', saveFailed: 'Could not save company access.', retry: 'Retry',
    save: 'Save', cancel: 'Cancel', saving: 'Saving…', role: 'Position', workshop: 'Workshop', chooseRole: 'Select a position', chooseWorkshop: 'Select a workshop',
    roles: { authenticatedUser: 'Client', admin: 'Administrator', manager: 'Manager', engineer: 'Engineer', laser: 'Laser cutting', bend: 'Bending', powder_catting: 'Powder coating' },
  },
}

export function membershipCopy(locale) { return copy[String(locale || 'hy').split('-')[0]] || copy.hy }

export function changedCompanyAccess(rows, originals) {
  return rows.filter(row => {
    const before = originals.find(item => String(item.company_id) === String(row.company_id))
    return !before || Boolean(before.enabled) !== Boolean(row.enabled) || (Number(before.role_id) || 0) !== (Number(row.role_id) || 0) || (Number(before.factory_id) || 0) !== (Number(row.factory_id) || 0)
  }).map(row => ({ company_id: Number(row.company_id), enabled: Boolean(row.enabled), role_id: Number(row.role_id) || null, factory_id: Number(row.factory_id) || null }))
}
