const ENTRIES = [
  ['Կառավարում', 'Управление', 'Management'],
  ['Արագ գործողություններ', 'Быстрые действия', 'Quick actions'],
  ['Դուրս գալ', 'Выйти', 'Log out'],
  ['Ելք', 'Выйти', 'Log out'],
  ['Օպերացիոն կառավարում', 'Операционное управление', 'Operations management'],
  ['Պատվերներ, արտադրամասեր և ծանրաբեռնվածություն', 'Заказы, цеха и загрузка', 'Orders, factories and workload'],
  ['Օպերացիոն վահանակ', 'Операционная панель', 'Operations dashboard'],
  ['Հաշվետվություններ', 'Отчёты', 'Reports'],
  ['Աշխատանքների բաշխում', 'Распределение работ', 'Work allocation'],
  ['Աշխատակիցներ', 'Сотрудники', 'Employees'],
  ['Աշխատակից', 'Сотрудник', 'Employee'],
  ['Ֆայլերի տեսակներ', 'Типы файлов', 'File types'],
  ['Պատվերներ', 'Заказы', 'Orders'],
  ['Պատվեր', 'Заказ', 'Order'],
  ['Հաճախորդներ', 'Клиенты', 'Clients'],
  ['Հաճախորդ', 'Клиент', 'Client'],
  ['Օգտատերեր և մուտքեր', 'Пользователи и доступ', 'Users and access'],
  ['Օգտատերեր', 'Пользователи', 'Users'],
  ['Օգտատեր', 'Пользователь', 'User'],
  ['Նյութեր', 'Материалы', 'Materials'],
  ['Նյութ', 'Материал', 'Material'],
  ['Անձնական էջ', 'Профиль', 'Profile'],
  ['Կարգավորումներ', 'Настройки', 'Settings'],
  ['Նոր հաճախորդ', 'Новый клиент', 'New client'],
  ['Նոր աշխատակից', 'Новый сотрудник', 'New employee'],
  ['Նոր նյութ', 'Новый материал', 'New material'],
  ['Լիարժեք հասանելիություն', 'Полный доступ', 'Full access'],
  ['Կառավարման տարածք', 'Рабочая область управления', 'Management workspace'],
  ['Աշխատանքային բաժիններ', 'Рабочие разделы', 'Work sections'],
  ['Ֆայլեր և PMP', 'Файлы и PMP', 'Files and PMP'],
  ['Ստեղծել պատվեր', 'Создать заказ', 'Create order'],
  ['Աշխատանքային տարածք', 'Рабочая область', 'Workspace'],
  ['Արտադրամաս', 'Цех', 'Factory'],
  ['Արտադրամասեր', 'Цеха', 'Factories'],
  ['Անհատական ֆունկցիաներով վերահսկվող աշխատանքային տարածք', 'Рабочая область с индивидуально настроенными правами', 'Workspace controlled by individual permissions'],
  ['Աշխատանք', 'Работа', 'Work'],
  ['Պատվերներ և ընթացք', 'Заказы и ход работ', 'Orders and progress'],
  ['Ֆայլեր', 'Файлы', 'Files'],
  ['Թարմացում', 'Обновление', 'Update'],
  ['Թարմացնել', 'Обновить', 'Refresh'],
  ['Թույլատրված', 'Разрешено', 'Allowed'],
  ['Փակ', 'Закрыто', 'Blocked'],
  ['Անվտանգ մուտք', 'Безопасный вход', 'Secure sign in'],
  ['Բարի վերադարձ', 'С возвращением', 'Welcome back'],
  ['Մուտք գործեք ձեր աշխատանքային հաշիվ՝ պատվերների, ֆայլերի և արտադրական գործընթացների հետ աշխատելու համար։', 'Войдите в рабочую учётную запись, чтобы работать с заказами, файлами и производственными процессами.', 'Sign in to your work account to manage orders, files and production processes.'],
  ['Էլ․ փոստ', 'Эл. почта', 'Email'],
  ['Էլ․ փոստի հասցե', 'Адрес эл. почты', 'Email address'],
  ['Գաղտնաբառ', 'Пароль', 'Password'],
  ['Գաղտնաբառի կրկնություն', 'Подтверждение пароля', 'Confirm password'],
  ['Խնդրում ենք մուտքագրեք էլ․ փոստի հասցեն։', 'Введите адрес электронной почты.', 'Enter your email address.'],
  ['Խնդրում ենք մուտքագրեք գաղտնաբառը։', 'Введите пароль.', 'Enter your password.'],
  ['Հիշել ինձ', 'Запомнить меня', 'Remember me'],
  ['Մոռացե՞լ եք գաղտնաբառը', 'Забыли пароль?', 'Forgot your password?'],
  ['Բեռնվում է...', 'Загрузка...', 'Loading...'],
  ['Բեռնվում է…', 'Загрузка…', 'Loading…'],
  ['Մուտք գործել', 'Войти', 'Sign in'],
  ['Դեռ գրանցված չե՞ք։', 'Ещё не зарегистрированы?', 'Not registered yet?'],
  ['Գրանցվել', 'Зарегистрироваться', 'Register'],
  ['Միասնական աշխատանքային հարթակ ամբողջ արտադրական ընթացքի համար', 'Единая рабочая платформа для всего производственного процесса', 'One workspace for the entire production process'],
  ['Պատվերներ, ինժեներական ֆայլեր, արտադրամասեր, աշխատակիցներ և վերահսկողություն՝ մեկ համակարգում։', 'Заказы, инженерные файлы, цеха, сотрудники и контроль — в одной системе.', 'Orders, engineering files, factories, employees and control in one system.'],
  ['Էլ․ հասցեն պարտադիր է։', 'Электронная почта обязательна.', 'Email is required.'],
  ['Գաղտնաբառը պետք է լինի առնվազն 6 նիշ։', 'Пароль должен содержать не менее 6 символов.', 'Password must be at least 6 characters.'],
  ['Գաղտնաբառը պետք է լինի առնվազն 8 նիշ։', 'Пароль должен содержать не менее 8 символов.', 'Password must be at least 8 characters.'],
  ['Մուտք գործելու ժամանակ սխալ է տեղի ունեցել։ Խնդրում ենք կրկին փորձել։', 'При входе произошла ошибка. Попробуйте ещё раз.', 'An error occurred while signing in. Please try again.'],
  ['Անուն', 'Имя', 'Name'],
  ['Ազգանուն', 'Фамилия', 'Last name'],
  ['Հայրանուն', 'Отчество', 'Patronymic'],
  ['Հեռախոս', 'Телефон', 'Phone'],
  ['Երկրորդ հեռախոս', 'Второй телефон', 'Second phone'],
  ['Հասցե', 'Адрес', 'Address'],
  ['Դեր', 'Роль', 'Role'],
  ['Կարգավիճակ', 'Статус', 'Status'],
  ['Գործողություններ', 'Действия', 'Actions'],
  ['Խմբագրել', 'Редактировать', 'Edit'],
  ['Ջնջել', 'Удалить', 'Delete'],
  ['Փակել', 'Закрыть', 'Close'],
  ['Չեղարկել', 'Отмена', 'Cancel'],
  ['Հաստատել', 'Подтвердить', 'Confirm'],
  ['Պահպանել', 'Сохранить', 'Save'],
  ['Պահպանել փոփոխությունները', 'Сохранить изменения', 'Save changes'],
  ['Պահպանվում է...', 'Сохранение...', 'Saving...'],
  ['Պահպանում…', 'Сохранение…', 'Saving…'],
  ['Պահվում է…', 'Сохранение…', 'Saving…'],
  ['Ստեղծել', 'Создать', 'Create'],
  ['Ավելացնել', 'Добавить', 'Add'],
  ['Թարմացվեց', 'Обновлено', 'Updated'],
  ['Ստեղծվեց', 'Создано', 'Created'],
  ['Ընտրել...', 'Выбрать...', 'Select...'],
  ['Ընտրել…', 'Выбрать…', 'Select…'],
  ['Ընտրել դեր', 'Выберите роль', 'Select role'],
  ['Ընտրել արտադրամաս', 'Выберите цех', 'Select factory'],
  ['Ընտրեք թույլատրելի դեր', 'Выберите доступную роль', 'Select an allowed role'],
  ['Ընտրեք արտադրամաս', 'Выберите цех', 'Select a factory'],
  ['Անունը պարտադիր է', 'Имя обязательно', 'Name is required'],
  ['Հեռախոսը պարտադիր է', 'Телефон обязателен', 'Phone is required'],
  ['Էլ․ փոստը պարտադիր է', 'Электронная почта обязательна', 'Email is required'],
  ['Գաղտնաբառը պարտադիր է', 'Пароль обязателен', 'Password is required'],
  ['Գաղտնաբառը պետք է լինի առնվազն 8 նիշ', 'Пароль должен содержать не менее 8 символов', 'Password must be at least 8 characters'],
  ['Գաղտնաբառերը չեն համընկնում', 'Пароли не совпадают', 'Passwords do not match'],
  ['Առնվազն 8 նիշ', 'Не менее 8 символов', 'At least 8 characters'],
  ['Ֆիզիկական անձ', 'Физическое лицо', 'Individual'],
  ['Իրավաբանական անձ', 'Юридическое лицо', 'Legal entity'],
  ['Ֆիզ․ անձ', 'Физ. лицо', 'Individual'],
  ['Իրավ.', 'Юр.', 'Legal'],
  ['Ֆիզ.', 'Физ.', 'Individual'],
  ['Անուն / Առաջնային անվանում', 'Имя / основное наименование', 'Name / primary name'],
  ['Իրավաբանական անձի տվյալներ', 'Данные юридического лица', 'Legal entity details'],
  ['Ընկերության անվանումը', 'Название компании', 'Company name'],
  ['ՀՎՀՀ (ԱՎՃ)', 'ИНН', 'Tax ID'],
  ['Հաշվապահի անունը', 'Имя бухгалтера', 'Accountant name'],
  ['Մուտքի տվյալներ', 'Данные для входа', 'Login details'],
  ['Ընտրեք հաճախորդի տեսակը', 'Выберите тип клиента', 'Select client type'],
  ['Ընկերության անվանումը պարտադիր է', 'Название компании обязательно', 'Company name is required'],
  ['ՀՎՀՀ-ն պարտադիր է', 'ИНН обязателен', 'Tax ID is required'],
  ['Հաշվապահի անունը պարտադիր է', 'Имя бухгалтера обязательно', 'Accountant name is required'],
  ['Խմբագրել հաճախորդին', 'Редактировать клиента', 'Edit client'],
  ['Հաճախորդ չի գտնվել', 'Клиент не найден', 'No client found'],
  ['Փոխեք որոնումը կամ ստեղծեք նոր հաճախորդ։', 'Измените поиск или создайте нового клиента.', 'Change the search or create a new client.'],
  ['Որոնեք, դիտեք և կառավարեք հաճախորդների տվյալները։', 'Ищите, просматривайте и управляйте данными клиентов.', 'Search, view and manage client data.'],
  ['Որոնել հաճախորդ...', 'Поиск клиента...', 'Search client...'],
  ['Email նշված չէ', 'Email не указан', 'Email not provided'],
  ['Հեռախոս նշված չէ', 'Телефон не указан', 'Phone not provided'],
  ['Հասցե նշված չէ', 'Адрес не указан', 'Address not provided'],
  ['Հաճախորդը ջնջվեց', 'Клиент удалён', 'Client deleted'],
  ['Չհաջողվեց ջնջել հաճախորդին', 'Не удалось удалить клиента', 'Could not delete client'],
  ['Հաճախորդը թարմացվեց', 'Клиент обновлён', 'Client updated'],
  ['Հաճախորդը ստեղծվեց', 'Клиент создан', 'Client created'],
  ['Չհաջողվեց բեռնել հաճախորդներին', 'Не удалось загрузить клиентов', 'Could not load clients'],
  ['Վավերացման սխալ է տեղի ունեցել', 'Произошла ошибка проверки данных', 'A validation error occurred'],
  ['Սերվերում սխալ է տեղի ունեցել, փորձեք ավելի ուշ', 'На сервере произошла ошибка, попробуйте позже', 'A server error occurred, try again later'],
  ['Ձեզ տրված է հաճախորդ ստեղծելու ֆունկցիան, բայց հաճախորդների ամբողջ ցուցակը դիտելու իրավունքը տրված չէ։', 'У вас есть право создавать клиентов, но нет права просматривать полный список клиентов.', 'You can create clients, but you do not have permission to view the full client list.'],
  ['Բացել ստեղծման ձևը', 'Открыть форму создания', 'Open creation form'],
  ['Խմբագրել աշխատակցին', 'Редактировать сотрудника', 'Edit employee'],
  ['Ստեղծել նոր աշխատակից', 'Создать нового сотрудника', 'Create new employee'],
  ['Նկարագրություն', 'Описание', 'Description'],
  ['Լայնություն', 'Ширина', 'Width'],
  ['Երկարություն', 'Длина', 'Length'],
  ['Բարձրություն', 'Высота', 'Height'],
  ['Հաստություն', 'Толщина', 'Thickness'],
  ['Լայն', 'Ширина', 'Width'],
  ['Երկար', 'Длина', 'Length'],
  ['Բարձր', 'Высота', 'Height'],
  ['Հաստ', 'Толщина', 'Thickness'],
  ['Կատեգորիա', 'Категория', 'Category'],
  ['Նոր կատեգորիա', 'Новая категория', 'New category'],
  ['Կատեգորիա դեռ չկա', 'Категорий пока нет', 'No categories yet'],
  ['Production բազան դեռ նյութի կատեգորիա չունի։ Սեղմեք «Նոր կատեգորիա» և ստեղծեք առաջին խումբն ու կատեգորիան։', 'В production-базе пока нет категорий материалов. Нажмите «Новая категория» и создайте первую группу и категорию.', 'The production database has no material categories yet. Click “New category” and create the first group and category.'],
  ['Նկար (ըստ ցանկության)', 'Изображение (необязательно)', 'Image (optional)'],
  ['Փոփոխել նյութը', 'Редактировать материал', 'Edit material'],
  ['Նյութի խումբ և կատեգորիա', 'Группа и категория материала', 'Material group and category'],
  ['Եթե խումբ չկա՝ նախ ստեղծեք խումբ, հետո դրա ներսում կատեգորիա։', 'Если группы нет, сначала создайте группу, затем категорию внутри неё.', 'If there is no group, create a group first, then a category inside it.'],
  ['Նոր խմբի անուն', 'Название новой группы', 'New group name'],
  ['Խումբ', 'Группа', 'Group'],
  ['Խումբ դեռ չկա', 'Групп пока нет', 'No groups yet'],
  ['Ընտրել խումբ…', 'Выберите группу…', 'Select group…'],
  ['Նոր կատեգորիայի անուն', 'Название новой категории', 'New category name'],
  ['Ստեղծել կատեգորիա', 'Создать категорию', 'Create category'],
  ['Օր. Մետաղներ', 'Напр. Металлы', 'E.g. Metals'],
  ['Օր. Չժանգոտվող պողպատ', 'Напр. Нержавеющая сталь', 'E.g. Stainless steel'],
  ['Նյութի խումբը ստեղծվեց', 'Группа материалов создана', 'Material group created'],
  ['Նյութի կատեգորիան ստեղծվեց', 'Категория материала создана', 'Material category created'],
  ['Չհաջողվեց բեռնել նյութերի խմբերը։', 'Не удалось загрузить группы материалов.', 'Could not load material groups.'],
  ['Չհաջողվեց ստեղծել նյութի խումբը։', 'Не удалось создать группу материалов.', 'Could not create material group.'],
  ['Չհաջողվեց ստեղծել նյութի կատեգորիան։', 'Не удалось создать категорию материала.', 'Could not create material category.'],
  ['Նյութ չի գտնվել', 'Материал не найден', 'No material found'],
  ['Փոխեք որոնումը կամ ավելացրեք նոր նյութ։', 'Измените поиск или добавьте новый материал.', 'Change the search or add a new material.'],
  ['Նյութերի ցանկ, չափեր և կատեգորիաներ։', 'Список материалов, размеры и категории.', 'Material list, dimensions and categories.'],
  ['Բոլոր կատեգորիաները', 'Все категории', 'All categories'],
  ['Բոլորը', 'Все', 'All'],
  ['Որոնել նյութ...', 'Поиск материала...', 'Search material...'],
  ['Նյութի խումբ', 'Группа материала', 'Material group'],
  ['Նյութի կատեգորիա', 'Категория материала', 'Material category'],
  ['Գաղտնաբառի փոփոխություն', 'Смена пароля', 'Change password'],
  ['Ընթացիկ պատվերներ', 'Текущие заказы', 'Current orders'],
  ['Պատվերների պատմություն', 'История заказов', 'Order history'],
  ['Ընթացիկ աշխատանքներ', 'Текущие работы', 'Current work'],
  ['Կատարված աշխատանքներ', 'Выполненные работы', 'Completed work'],
  ['Տվյալներ դեռ չկան', 'Данных пока нет', 'No data yet'],
  ['Գործողություն', 'Действие', 'Action'],
  ['Ֆայլ', 'Файл', 'File'],
  ['Ընտրել բոլորը', 'Выбрать все', 'Select all'],
  ['Չեղարկել բոլորը', 'Снять выбор со всех', 'Clear all'],
  ['Ներբեռնել', 'Скачать', 'Download'],
  ['Դիտել', 'Просмотреть', 'View'],
  ['Վերադառնալ', 'Назад', 'Back'],
  ['Հաջորդ', 'Далее', 'Next'],
  ['Նախորդ', 'Назад', 'Previous'],
  ['Որոնել…', 'Поиск…', 'Search…'],
  ['Որոնել', 'Поиск', 'Search'],
  ['Այսօր', 'Сегодня', 'Today'],
  ['Վաղը', 'Завтра', 'Tomorrow'],
  ['Ժամկետ', 'Срок', 'Deadline'],
  ['Սկիզբ', 'Начало', 'Start'],
  ['Ավարտ', 'Завершение', 'Finish'],
  ['Ավարտված', 'Завершено', 'Completed'],
  ['Հաստատված', 'Подтверждено', 'Confirmed'],
  ['Չհաստատված', 'Не подтверждено', 'Unverified'],
  ['Սպասում է', 'Ожидает', 'Pending'],
  ['Ընթացքում', 'В процессе', 'In progress'],
  ['Չեղարկված', 'Отменено', 'Cancelled'],
  ['Կրիտիկական', 'Критично', 'Critical'],
  ['Ուշադրություն', 'Требует внимания', 'Attention'],
  ['Նորմալ', 'Норма', 'Healthy'],
  ['Դատարկ', 'Нет загрузки', 'Idle'],
  ['Ակտիվ', 'Активные', 'Active'],
  ['Ուշացած', 'Просроченные', 'Overdue'],
  ['Չնշանակված', 'Не назначено', 'Unassigned'],
  ['Բոլոր վիճակները', 'Все состояния', 'All states'],
  ['Կառավարման վահանակ', 'Панель управления', 'Management dashboard'],
  ['Արտադրամասերի վիճակ, աշխատակիցների ծանրաբեռնվածություն, ուշացումներ և պատվերների ամբողջական վերահսկում մեկ էջում։', 'Состояние цехов, загрузка сотрудников, просрочки и полный контроль заказов на одной странице.', 'Factory health, employee workload, delays and complete order control on one page.'],
  ['Ուշադրություն պահանջող պատվերներ', 'Заказы, требующие внимания', 'Orders requiring attention'],
  ['Ուշացած, չնշանակված կամ admin հաստատման սպասող աշխատանքներ', 'Просроченные, неназначенные или ожидающие подтверждения администратора работы', 'Overdue, unassigned or admin-confirmation-pending work'],
  ['Ցույց տալ ուշացածները ֆիլտրում', 'Показать просроченные в фильтре', 'Show overdue in filter'],
  ['Առանց անվանման', 'Без названия', 'Untitled'],
  ['չնշանակված', 'не назначено', 'unassigned'],
  ['Արտադրամասերի վիճակ', 'Состояние цехов', 'Factory health'],
  ['Ակտիվ, ուշացած, չնշանակված և հաստատման սպասող աշխատանքներ', 'Активные, просроченные, неназначенные и ожидающие подтверждения работы', 'Active, overdue, unassigned and confirmation-pending work'],
  ['Այս ֆիլտրով արտադրամաս չկա։', 'По этому фильтру цехов нет.', 'No factories match this filter.'],
  ['Աշխատակիցների ծանրաբեռնվածություն', 'Загрузка сотрудников', 'Employee workload'],
  ['Ցուցիչը հիմնված է ակտիվ և ուշացած պատվերների իրական քանակի վրա', 'Показатель основан на фактическом количестве активных и просроченных заказов', 'The indicator is based on the actual number of active and overdue orders'],
  ['Որոնել աշխատակցին', 'Поиск сотрудника', 'Search employee'],
  ['Բոլոր factory-ները', 'Все цеха', 'All factories'],
  ['Պատվերների կառավարում', 'Управление заказами', 'Order management'],
  ['Աշխատանքային պատկերը՝ միայն ձեզ տրված ֆունկցիաների սահմաններում։', 'Рабочая информация отображается только в рамках доступных вам функций.', 'The workspace shows only the functions available to you.'],
  ['Ընթացիկ', 'Текущие', 'Current'],
  ['Վերջին պատվերները', 'Последние заказы', 'Recent orders'],
  ['Համար, անուն, prefix...', 'Номер, название, префикс...', 'Number, name, prefix...'],
  ['Պատվեր չի գտնվել', 'Заказ не найден', 'No order found'],
  ['Փոխեք որոնումը կամ սպասեք նոր պատվերի։', 'Измените поиск или дождитесь нового заказа.', 'Change the search or wait for a new order.'],
  ['Անվանում', 'Название', 'Name'],
  ['Պատվերի համար', 'Номер заказа', 'Order number'],
  ['Կարգավիճակներ', 'Статусы', 'Statuses'],
  ['Թույլտվություններ', 'Права доступа', 'Permissions'],
  ['Թույլտվություն', 'Право доступа', 'Permission'],
  ['Փոփոխությունները պահպանվել են։', 'Изменения сохранены.', 'Changes saved.'],
  ['Չհաջողվեց պահպանել փոփոխությունները։', 'Не удалось сохранить изменения.', 'Could not save changes.'],
  ['Չհաջողվեց պահպանել թույլտվությունները', 'Не удалось сохранить права доступа', 'Could not save permissions'],
  ['Հաստատե՞լ ջնջումը', 'Подтвердить удаление?', 'Confirm deletion?'],
  ['Այո, ջնջել', 'Да, удалить', 'Yes, delete'],
  ['Ոչ, չեղարկել', 'Нет, отменить', 'No, cancel'],
  ['Մուտքը արգելված է', 'Доступ запрещён', 'Access denied'],
  ['Դուք չունեք այս բաժինը դիտելու թույլտվություն։', 'У вас нет разрешения на просмотр этого раздела.', 'You do not have permission to view this section.'],
]

const LOCALE_INDEX = { hy: 0, ru: 1, en: 2 }
const sourceIndex = new Map()

for (const entry of ENTRIES) {
  entry.forEach((value, index) => {
    if (typeof value === 'string' && value.trim()) sourceIndex.set(value.trim(), { entry, index })
  })
}

const textState = new WeakMap()
const attributeState = new WeakMap()
let currentLocale = 'hy'

function normalizeLocale(locale) {
  const value = String(locale || 'hy').toLowerCase().split('-')[0]
  return Object.prototype.hasOwnProperty.call(LOCALE_INDEX, value) ? value : 'hy'
}

function preserveWhitespace(source, translated) {
  const leading = source.match(/^\s*/)?.[0] || ''
  const trailing = source.match(/\s*$/)?.[0] || ''
  return `${leading}${translated}${trailing}`
}

function translateDynamic(trimmed, locale) {
  const index = LOCALE_INDEX[locale]
  let match = trimmed.match(/^(\d+)\s+ֆունկցիա հասանելի$/)
  if (match) return index === 1 ? `${match[1]} функций доступно` : index === 2 ? `${match[1]} functions available` : trimmed

  match = trimmed.match(/^(\d+)\s+աշխատակից$/)
  if (match) return index === 1 ? `${match[1]} сотрудников` : index === 2 ? `${match[1]} employees` : trimmed

  match = trimmed.match(/^Թարմացված՝\s*(.+)$/)
  if (match) return index === 1 ? `Обновлено: ${match[1]}` : index === 2 ? `Updated: ${match[1]}` : trimmed

  match = trimmed.match(/^Այսօր՝\s*(.+)$/)
  if (match) return index === 1 ? `Сегодня: ${match[1]}` : index === 2 ? `Today: ${match[1]}` : trimmed

  match = trimmed.match(/^Admin սպասում՝\s*(.+)$/)
  if (match) return index === 1 ? `Ожидает admin: ${match[1]}` : index === 2 ? `Admin pending: ${match[1]}` : trimmed

  match = trimmed.match(/^30 օրում ավարտված՝\s*(.+)$/)
  if (match) return index === 1 ? `Завершено за 30 дней: ${match[1]}` : index === 2 ? `Completed in 30 days: ${match[1]}` : trimmed

  match = trimmed.match(/^Կոդը ուղարկվել է՝\s*(.+)$/)
  if (match) return index === 1 ? `Код отправлен на: ${match[1]}` : index === 2 ? `Code sent to: ${match[1]}` : trimmed

  const prefixes = [
    ['Լայն՝', 'Ширина:', 'Width:'],
    ['Երկար՝', 'Длина:', 'Length:'],
    ['Բարձր՝', 'Высота:', 'Height:'],
    ['Հաստ՝', 'Толщина:', 'Thickness:'],
    ['Prefix՝', 'Префикс:', 'Prefix:'],
  ]
  for (const item of prefixes) {
    if (trimmed === item[0]) return item[index]
  }

  return null
}

function translateValue(source, locale = currentLocale) {
  if (typeof source !== 'string' || !source.trim()) return source
  const normalizedLocale = normalizeLocale(locale)
  const trimmed = source.trim()
  const exact = sourceIndex.get(trimmed)
  if (exact) return preserveWhitespace(source, exact.entry[LOCALE_INDEX[normalizedLocale]])
  const dynamic = translateDynamic(trimmed, normalizedLocale)
  return dynamic == null ? source : preserveWhitespace(source, dynamic)
}

function shouldSkip(element) {
  if (!element || element.nodeType !== 1) return false
  return ['SCRIPT', 'STYLE', 'CODE', 'PRE', 'NOSCRIPT'].includes(element.tagName)
}

function translateTextNode(node) {
  if (!node || node.nodeType !== 3 || shouldSkip(node.parentElement)) return
  const value = node.nodeValue || ''
  let state = textState.get(node)
  if (!state) {
    state = { source: value, rendered: value }
    textState.set(node, state)
  } else if (value !== state.rendered) {
    state.source = value
  }
  const next = translateValue(state.source, currentLocale)
  state.rendered = next
  if (value !== next) node.nodeValue = next
}

const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt']

function translateAttributes(element) {
  if (!element || element.nodeType !== 1 || shouldSkip(element)) return
  let states = attributeState.get(element)
  if (!states) {
    states = {}
    attributeState.set(element, states)
  }
  for (const name of TRANSLATABLE_ATTRIBUTES) {
    if (!element.hasAttribute(name)) continue
    const value = element.getAttribute(name) || ''
    const state = states[name] || { source: value, rendered: value }
    if (value !== state.rendered) state.source = value
    const next = translateValue(state.source, currentLocale)
    state.rendered = next
    states[name] = state
    if (value !== next) element.setAttribute(name, next)
  }
  if (element.tagName === 'INPUT' && ['button', 'submit', 'reset'].includes(String(element.type || '').toLowerCase())) {
    const value = element.value || ''
    const state = states.value || { source: value, rendered: value }
    if (value !== state.rendered) state.source = value
    const next = translateValue(state.source, currentLocale)
    state.rendered = next
    states.value = state
    if (value !== next) element.value = next
  }
}

function translateTree(root) {
  if (!root) return
  if (root.nodeType === 3) {
    translateTextNode(root)
    return
  }
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return
  if (root.nodeType === 1) translateAttributes(root)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  let node = walker.currentNode
  while (node) {
    if (node.nodeType === 3) translateTextNode(node)
    else if (node.nodeType === 1) translateAttributes(node)
    node = walker.nextNode()
  }
}

export default ({ app }, inject) => {
  if (!process.client) return

  const refresh = () => {
    currentLocale = normalizeLocale(app.i18n?.locale)
    if (document.body) translateTree(document.body)
    if (document.documentElement) document.documentElement.lang = app.i18n?.locales?.find?.((item) => item.code === currentLocale)?.iso || currentLocale
  }

  inject('uiTranslate', (value) => translateValue(value, normalizeLocale(app.i18n?.locale)))
  inject('uiLocale', () => normalizeLocale(app.i18n?.locale))

  const nativeAlert = window.alert?.bind(window)
  const nativeConfirm = window.confirm?.bind(window)
  if (nativeAlert) window.alert = (message) => nativeAlert(translateValue(String(message ?? ''), normalizeLocale(app.i18n?.locale)))
  if (nativeConfirm) window.confirm = (message) => nativeConfirm(translateValue(String(message ?? ''), normalizeLocale(app.i18n?.locale)))

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') translateTextNode(mutation.target)
      else if (mutation.type === 'attributes') translateAttributes(mutation.target)
      else for (const node of mutation.addedNodes) translateTree(node)
    }
  })

  const start = () => {
    refresh()
    if (document.body) {
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [...TRANSLATABLE_ATTRIBUTES, 'value'],
      })
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
  else start()

  app.router?.afterEach?.(() => {
    window.requestAnimationFrame(refresh)
  })

  if (app.i18n?.vm?.$watch) {
    app.i18n.vm.$watch('locale', () => window.requestAnimationFrame(refresh))
  }
}
