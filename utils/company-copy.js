export const companyCopy = {
  hy: {
    select: 'Ընտրել կազմակերպությունը', companies: 'Կազմակերպություններ', switching: 'Փոխվում է կազմակերպությունը…',
    unsaved: 'Կան չպահպանված փոփոխություններ։ Փոխե՞լ կազմակերպությունը և փակել դրանք։', waiting: 'Սպասեք տվյալների պահպանման ավարտին։', failed: 'Չհաջողվեց փոխել կազմակերպությունը։',
    title: 'Կազմակերպություններ', description: 'Յուրաքանչյուր կազմակերպություն ունի իր առանձին արտադրամասերը, աշխատակիցները և առաջադրանքները։',
    add: 'Ավելացնել կազմակերպություն', edit: 'Խմբագրել', name: 'Անուն', slug: 'Կարճ անուն', logo: 'Լոգո', active: 'Ակտիվ', inactive: 'Փակված',
    save: 'Պահպանել', cancel: 'Չեղարկել', saving: 'Պահպանում…', newHint: 'Կստեղծվեն սկզբնական արտադրամասերը։ Աշխատակիցներին հասանելիությունը տրամադրեք առանձին։',
    logoHint: 'PNG, JPG կամ WebP, մինչև 2 ՄԲ։', error: 'Չհաջողվեց պահպանել։', empty: 'Կազմակերպություններ չկան։',
    access: 'Հասանելի կազմակերպություններ', accessHint: 'Նշեք այն կազմակերպությունները, որոնք աշխատակիցը կարող է ընտրել։ Հաստիքն ու արտադրամասը նշանակվում են յուրաքանչյուր կազմակերպության համար առանձին։',
    current: 'Ընտրված կազմակերպություն', accountExists: 'Արդեն ունի հաշիվ այս հարթակում', accountHint: 'Օգտագործեք նույն էլ․ փոստը։ Նրա գործող գաղտնաբառը չի փոխվի։', shared: 'Ընդհանուր հաշվի տվյալները փոխում է աշխատակիցը կամ գլխավոր ադմինը։',
    staff: 'Աշխատակիցներ', admin: 'Ադմին', noAccess: 'Ձեզ դեռ կազմակերպության հասանելիություն չի տրամադրվել։ Դիմեք ադմինին։',
  },
  ru: {
    select: 'Выбрать предприятие', companies: 'Предприятия', switching: 'Открываем предприятие…',
    unsaved: 'Есть несохранённые изменения. Переключить предприятие и закрыть их?', waiting: 'Дождитесь завершения сохранения.', failed: 'Не удалось переключить предприятие.',
    title: 'Предприятия', description: 'У каждого предприятия свои цеха, сотрудники и задания.',
    add: 'Добавить предприятие', edit: 'Редактировать', name: 'Название', slug: 'Короткое имя', logo: 'Логотип', active: 'Активно', inactive: 'Закрыто',
    save: 'Сохранить', cancel: 'Отмена', saving: 'Сохранение…', newHint: 'Создадим начальные цеха. Доступ сотрудникам назначается отдельно.',
    logoHint: 'PNG, JPG или WebP, до 2 МБ.', error: 'Не удалось сохранить.', empty: 'Предприятий пока нет.',
    access: 'Доступные предприятия', accessHint: 'Отметьте предприятия, которые сотрудник сможет выбирать. Должность и цех назначаются отдельно для каждого предприятия.',
    current: 'Выбранное предприятие', accountExists: 'Уже есть аккаунт на этой платформе', accountHint: 'Укажите ту же почту. Действующий пароль останется прежним.', shared: 'Общие данные аккаунта меняет сотрудник или главный администратор.',
    staff: 'Сотрудники', admin: 'Администратор', noAccess: 'Вам ещё не назначили доступ к предприятию. Обратитесь к администратору.',
  },
  en: {
    select: 'Select company', companies: 'Companies', switching: 'Opening company…',
    unsaved: 'You have unsaved changes. Switch company and close them?', waiting: 'Wait for saving to finish.', failed: 'Could not switch company.',
    title: 'Companies', description: 'Each company has its own workshops, employees and tasks.',
    add: 'Add company', edit: 'Edit', name: 'Name', slug: 'Short name', logo: 'Logo', active: 'Active', inactive: 'Closed',
    save: 'Save', cancel: 'Cancel', saving: 'Saving…', newHint: 'Initial workshops will be created. Assign employee access separately.',
    logoHint: 'PNG, JPG or WebP, up to 2 MB.', error: 'Could not save.', empty: 'No companies yet.',
    access: 'Available companies', accessHint: 'Check the companies this employee can select. Assign a position and workshop separately in each company.',
    current: 'Selected company', accountExists: 'Already has an account on this platform', accountHint: 'Use the same email. Their existing password will stay unchanged.', shared: 'Shared account details are changed by the employee or platform administrator.',
    staff: 'Employees', admin: 'Administrator', noAccess: 'You have not been assigned to a company yet. Contact an administrator.',
  },
}

export function workspaceCopy(locale) { return companyCopy[String(locale || 'hy').split('-')[0]] || companyCopy.hy }
