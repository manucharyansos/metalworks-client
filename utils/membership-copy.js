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

export function membershipCopy(locale) {
  const selection = {
    hy: { intro: 'Նշեք աշխատակցի հասանելի ընկերությունները, հաստիքներն ու արտադրամասերը։', clientIntro: 'Նշեք այն ընկերությունները, որոնց հասանելիությունը ցանկանում եք տրամադրել հաճախորդին։', current: 'Ընթացիկ ընկերություն', chooseCompanies: 'Ընտրեք ընկերությունները', protectedEmployee: 'Այս ընկերության հասանելիությունը կառավարվում է առանձին։', notManaged: 'Կառավարման հասանելիությունը տրված չէ', managementHint: 'Մյուս ընկերությունները կառավարելու համար գլխավոր ադմինը պետք է ձեր հաշվի «Ընկերություններ» բաժնում նշի այդ ընկերությունները և ընտրի «Մենեջեր» հաստիքը։ Դրանից հետո հասանելի կլինեն այդ ընկերությունների հաճախորդները և աշխատակիցների ու հաճախորդների բոլոր հայտերը։' },
    ru: { intro: 'Отметьте доступные сотруднику компании, должности и цеха.', clientIntro: 'Отметьте компании, к которым клиент должен получить доступ.', current: 'Текущая компания', chooseCompanies: 'Выберите компании', protectedEmployee: 'Доступ к этой компании управляется отдельно.', notManaged: 'Управление не назначено', managementHint: 'Чтобы управлять другими компаниями, главный админ должен отметить их в разделе «Предприятия» вашего аккаунта и выбрать должность «Менеджер». После этого будут доступны их клиенты и все заявки клиентов и сотрудников.' },
    en: { intro: 'Select the employee’s companies, positions and workshops.', clientIntro: 'Select the companies the client should have access to.', current: 'Current company', chooseCompanies: 'Select companies', protectedEmployee: 'Access to this company is managed separately.', notManaged: 'Management access not assigned', managementHint: 'To manage other companies, the platform admin must select them under your account’s Companies and assign the Manager position. Their clients and all client and employee requests will then be available.' },
  }
  const language = String(locale || 'hy').split('-')[0]
  return { ...(copy[language] || copy.hy), ...(selection[language] || selection.hy) }
}

export function changedCompanyAccess(rows, originals) {
  const assignments = row => (row.assignments || [{ role_id: row.role_id, factory_id: row.factory_id }]).map(item => ({ role_id: Number(item.role_id) || null, factory_id: Number(item.factory_id) || null }))
  return rows.filter(row => {
    const before = originals.find(item => String(item.company_id) === String(row.company_id))
    return !before || Boolean(before.enabled) !== Boolean(row.enabled) || (Number(before.role_id) || 0) !== (Number(row.role_id) || 0) || (Number(before.factory_id) || 0) !== (Number(row.factory_id) || 0) || JSON.stringify(assignments(before)) !== JSON.stringify(assignments(row))
  }).map(row => ({ company_id: Number(row.company_id), enabled: Boolean(row.enabled), role_id: Number(row.role_id) || null, factory_id: Number(row.factory_id) || null, ...(row.assignments ? { assignments: assignments(row) } : {}) }))
}
