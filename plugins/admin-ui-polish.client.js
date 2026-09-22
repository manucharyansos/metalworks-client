export default ({ app }) => {
  if (!process.client) return

  const removableLabels = new Set([
    'Operations overview',
    'Операционный обзор',
    'Գործառնությունների ակնարկ',
    'Report builder',
    'Конструктор отчётов',
    'Հաշվետվությունների կառուցում',
    'Team capacity',
    'Ресурс команды',
    'Թիմի ծանրաբեռնվածություն',
    'Assignment queue',
    'Очередь назначений',
    'Նշանակումների հերթ',
    'Access & people',
    'ACCESS & PEOPLE',
    'Доступ и сотрудники',
    'Հասանելիություն և աշխատակիցներ',
    'Access control',
    'ACCESS CONTROL',
    'Контроль доступа',
    'Հասանելիության կառավարում',
    'Անհատական',
    'Индивидуально',
    'Individual',

    // Decorative eyebrow labels used across the workspace.
    'Operations',
    'Операции',
    'Գործառնություններ',
    'Team',
    'Команда',
    'Թիմ',
    'Customers',
    'Клиенты',
    'Հաճախորդներ',
    'Materials',
    'Материалы',
    'Նյութեր',
    'Production queue',
    'Производственная очередь',
    'Արտադրական հերթ',
    'Workload balancing',
    'Балансировка нагрузки',
    'Ծանրաբեռնվածության բաշխում',
    'File policy',
    'Политика файлов',
    'Ֆայլերի քաղաքականություն',
    'Reports & export',
    'Отчёты и экспорт',
    'Հաշվետվություններ և արտահանում',
    'Catalog setup',
    'Настройка каталога',
    'Կատալոգի կարգավորում',
    'Manager workspace',
    'Рабочая среда менеджера',
    'Մենեջերի աշխատանքային միջավայր',
    'Engineer workspace',
    'Рабочая среда инженера',
    'Ինժեների աշխատանքային միջավայր',
    'Operations workspace',
    'Рабочая среда операций',
    'Գործառնությունների աշխատանքային միջավայր',
    'Internal system',
    'Внутренняя система',
    'Ներքին համակարգ',
    'Create account',
    'Создать аккаунт',
    'Հաշիվ ստեղծել',
    'Account recovery',
    'Восстановление аккаунта',
    'Հաշվի վերականգնում',
    'Security',
    'Безопасность',
    'Անվտանգություն',
  ])

  const routeIsWorkspace = () => {
    const path = String(
      app?.router?.currentRoute?.path || window.location.pathname || ''
    )

    return /(^|\/)(admin|manager|engineer|factory|profile)(\/|$)/.test(path)
  }

  const locale = () =>
    String(app?.i18n?.locale || 'hy').toLowerCase().split('-')[0]

  const translations = {
    hy: {
      allRoles: 'Բոլոր հաստիքները',
      role: 'Հաստիք',
      rolePlural: 'Հաստիքներ',
      manage: 'Խմբագրել',
      manageFunctions: 'Խմբագրել ֆունկցիաները',
      factoryFormats: 'Նախագծերի թղթապանակ',
      fileTypes: 'Նախագծերի թղթապանակ',
      allowed: 'Թույլատրված',
      helpLabel: 'Տեղեկություն',
      employeeHelp:
        'Admin և Manager հաստիքները ունեն լիարժեք հասանելիություն։ Մնացած աշխատակիցների ֆունկցիաների հասանելիությունը տրվում է առանձին։ Հաճախորդները այստեղ չեն ցուցադրվում։',
      noPhone: 'Հեռախոս նշված չէ',
      positionPermissions: 'Հաստիքի թույլտվությունները այստեղ չեն օգտագործվում։',
      positionsView: 'Հաստիքների դիտում',
      changeSearch: 'Փոխեք որոնումը կամ հաստիքի ֆիլտրը։',
    },
    ru: {
      allRoles: 'Все должности',
      role: 'Должность',
      rolePlural: 'Должности',
      manage: 'Редактировать',
      manageFunctions: 'Редактировать функции',
      factoryFormats: 'Папка проектов',
      fileTypes: 'Папка проектов',
      allowed: 'Разрешено',
      helpLabel: 'Информация',
      employeeHelp:
        'Должности Admin и Manager имеют полный доступ. Для остальных сотрудников доступ к функциям назначается отдельно. Клиенты здесь не отображаются.',
      noPhone: 'Телефон не указан',
      positionPermissions: 'Разрешения должности здесь не используются.',
      positionsView: 'Просмотр должностей',
      changeSearch: 'Измените поиск или фильтр по должности.',
    },
    en: {
      allRoles: 'All positions',
      role: 'Position',
      rolePlural: 'Positions',
      manage: 'Edit',
      manageFunctions: 'Edit functions',
      factoryFormats: 'Project folders',
      fileTypes: 'Project folders',
      allowed: 'Allowed',
      helpLabel: 'Information',
      employeeHelp:
        'Admin and Manager positions have full access. Access to functions is assigned individually for all other employees. Clients are not shown here.',
      noPhone: 'Phone not provided',
      positionPermissions: 'Position permissions are not used here.',
      positionsView: 'View positions',
      changeSearch: 'Change the search or position filter.',
    },
  }

  const copy = () => translations[locale()] || translations.hy
  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim()

  const hideKnownLabels = (root) => {
    root.querySelectorAll('p, span').forEach((node) => {
      const text = normalize(node.textContent)
      if (removableLabels.has(text)) node.style.display = 'none'

      // Decorative eyebrow only; the real title remains visible.
      if (
        node.tagName === 'P' &&
        [
          'Factory formats',
          'Форматы цехов',
          'Արտադրամասերի format-ներ',
        ].includes(text)
      ) {
        node.style.display = 'none'
      }
    })

    root.querySelectorAll('.metric-card').forEach((card) => {
      const label = normalize(card.querySelector('.metric-label')?.textContent)
      if (
        ['Factory format-ներ', 'Factory formats', 'Форматы цехов'].includes(
          label
        )
      ) {
        card.remove()
      }
    })
  }

  const replaceWorkspaceCopy = (root) => {
    if (!routeIsWorkspace()) return
    const t = copy()

    root
      .querySelectorAll('option, th, button, p, span, h1, h2, h3, a, div')
      .forEach((node) => {
        if (node.children.length) return
        const text = normalize(node.textContent)
        let next = null

        if (
          [
            'Բոլոր role-երը',
            'Բոլոր դերերը',
            'Բոլոր հաստիքները',
            'Դասակարգել ըստ հաստիքի',
            'Все роли',
            'Все должности',
            'Сортировать по должности',
            'All roles',
            'All positions',
            'Sort by position',
          ].includes(text)
        ) {
          next = t.allRoles
        } else if (
          ['Role', 'Դեր', 'Հաստիք', 'Роль', 'Должность', 'Position'].includes(
            text
          )
        ) {
          next = t.role
        } else if (
          [
            'Role-եր',
            'Հաստիքներ',
            'Роли',
            'Должности',
            'Roles',
            'Positions',
          ].includes(text)
        ) {
          next = t.rolePlural
        } else if (
          [
            'Կառավարել',
            'Խմբագրել',
            'Управлять',
            'Редактировать',
            'Manage',
            'Edit',
          ].includes(text)
        ) {
          next = t.manage
        } else if (
          [
            'Կառավարել ֆունկցիաները',
            'Խմբագրել ֆունկցիաները',
            'Управлять функциями',
            'Редактировать функции',
            'Manage functions',
            'Edit functions',
          ].includes(text)
        ) {
          next = t.manageFunctions
        } else if (
          [
            'Արտադրամասերի format-ներ',
            'Նախագծերի թղթապանակ',
            'Форматы цехов',
            'Папка проектов',
            'Factory formats',
            'Project folders',
          ].includes(text) &&
          node.tagName !== 'P'
        ) {
          next = t.factoryFormats
        } else if (
          ['Ֆայլերի տեսակներ', 'Типы файлов', 'File types'].includes(text)
        ) {
          next = t.fileTypes
        } else if (
          [
            'Տրված է',
            'Թույլատրված',
            'Выдано',
            'Разрешено',
            'Granted',
            'Allowed',
          ].includes(text)
        ) {
          next = t.allowed
        } else if (
          [
            translations.hy.employeeHelp,
            translations.ru.employeeHelp,
            translations.en.employeeHelp,
          ].includes(text)
        ) {
          next = t.employeeHelp
        } else if (
          [
            translations.hy.noPhone,
            translations.ru.noPhone,
            translations.en.noPhone,
          ].includes(text)
        ) {
          next = t.noPhone
        } else if (
          [
            translations.hy.positionPermissions,
            translations.ru.positionPermissions,
            translations.en.positionPermissions,
          ].includes(text)
        ) {
          next = t.positionPermissions
        } else if (
          [
            translations.hy.positionsView,
            translations.ru.positionsView,
            translations.en.positionsView,
          ].includes(text)
        ) {
          next = t.positionsView
        } else if (
          [
            translations.hy.changeSearch,
            translations.ru.changeSearch,
            translations.en.changeSearch,
          ].includes(text)
        ) {
          next = t.changeSearch
        }

        if (next && text !== next) node.textContent = next
      })
  }

  const isSearchInput = (input) => {
    if (!(input instanceof HTMLInputElement)) return false
    const placeholder = normalize(input.placeholder).toLowerCase()
    return (
      input.type === 'search' ||
      placeholder.includes('որոն') ||
      placeholder.includes('փնտր') ||
      placeholder.includes('поиск') ||
      placeholder.includes('найти') ||
      placeholder.includes('search')
    )
  }

  const searchIconData =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='m20 20-3.6-3.6'/%3E%3C/svg%3E\")"

  const moveSearchIconsRight = (root) => {
    root.querySelectorAll('input').forEach((input) => {
      if (!isSearchInput(input)) return

      input.dataset.searchIconRight = 'true'
      input.classList.remove('pl-9', 'pl-10', 'pl-11', 'pl-12')
      input.style.paddingLeft = '0.75rem'
      input.style.paddingRight = '2.75rem'
      input.style.backgroundImage = searchIconData
      input.style.backgroundRepeat = 'no-repeat'
      input.style.backgroundPosition = 'right 0.8rem center'
      input.style.backgroundSize = '1rem 1rem'

      const parent = input.parentElement
      if (!parent) return

      parent.querySelectorAll(':scope > svg').forEach((svg) => {
        const cls = svg.getAttribute('class') || ''
        if (cls.includes('absolute')) svg.style.display = 'none'
      })
    })
  }

  const makeDescriptionsHoverable = (root) => {
    if (!routeIsWorkspace()) return
    const t = copy()
    const sections = root.querySelectorAll('main section, main header')

    sections.forEach((section) => {
      if (section.dataset.hoverHelpProcessed === 'true') return
      const heading = section.querySelector(':scope h1, :scope h2')
      if (!heading) return

      const paragraphs = Array.from(
        section.querySelectorAll(':scope > div > p, :scope > p')
      ).filter((p) => {
        if (p.closest('[data-workspace-hover-help]')) return false

        const text = normalize(p.textContent)
        if (!text || removableLabels.has(text)) return false

        // Keep short status/count text visible; only explanatory copy moves
        // into the information tooltip.
        return text.length >= 45
      })

      const paragraph = paragraphs[0]
      if (!paragraph) return

      section.dataset.hoverHelpProcessed = 'true'
      const originalText = normalize(paragraph.textContent)
      paragraph.style.display = 'none'

      const wrapper = document.createElement('span')
      wrapper.setAttribute('data-workspace-hover-help', '')
      wrapper.style.position = 'relative'
      wrapper.style.display = 'inline-flex'
      wrapper.style.marginLeft = '8px'
      wrapper.style.verticalAlign = 'middle'

      const button = document.createElement('button')
      button.type = 'button'
      button.setAttribute('aria-label', t.helpLabel)
      button.style.cssText = [
        'width:28px',
        'height:28px',
        'border-radius:9999px',
        'border:1px solid rgba(148,163,184,.35)',
        'background:rgba(248,250,252,.9)',
        'color:#64748b',
        'font:700 12px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        'display:inline-flex',
        'align-items:center',
        'justify-content:center',
        'cursor:help',
      ].join(';')
      button.textContent = 'i'

      const tooltip = document.createElement('span')
      tooltip.setAttribute('role', 'tooltip')
      tooltip.textContent = originalText
      tooltip.style.cssText = [
        'position:absolute',
        'left:0',
        'top:36px',
        'z-index:120',
        'width:min(440px,82vw)',
        'padding:12px 14px',
        'border-radius:14px',
        'background:#0f172a',
        'color:white',
        'font:500 12px/1.55 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
        'box-shadow:0 16px 40px rgba(15,23,42,.22)',
        'opacity:0',
        'pointer-events:none',
        'transform:translateY(-4px)',
        'transition:opacity .15s ease,transform .15s ease',
      ].join(';')

      const show = () => {
        tooltip.style.opacity = '1'
        tooltip.style.transform = 'translateY(0)'
      }
      const hide = () => {
        tooltip.style.opacity = '0'
        tooltip.style.transform = 'translateY(-4px)'
      }

      button.addEventListener('mouseenter', show)
      button.addEventListener('mouseleave', hide)
      button.addEventListener('focus', show)
      button.addEventListener('blur', hide)

      wrapper.appendChild(button)
      wrapper.appendChild(tooltip)
      heading.insertAdjacentElement('afterend', wrapper)
    })
  }

  const polish = () => {
    const root = document.body
    if (!root) return

    hideKnownLabels(root)
    replaceWorkspaceCopy(root)
    moveSearchIconsRight(root)
    makeDescriptionsHoverable(root)
  }

  let timer = null
  const schedule = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(polish, 80)
  }

  const start = () => {
    polish()
    window.setTimeout(polish, 350)
    window.setTimeout(polish, 900)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    start()
  }

  app.router?.afterEach?.(() => {
    schedule()
    window.setTimeout(polish, 350)
  })
}
