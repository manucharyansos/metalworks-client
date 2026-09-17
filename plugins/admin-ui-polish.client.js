export default ({ app }) => {
  if (!process.client) return

  const removableLabels = new Set([
    'Operations overview',
    'Report builder',
    'Team capacity',
    'Assignment queue',
    'Access & people',
    'Access control',
    'Անհատական',
  ])

  const routeIsAdmin = () => {
    const path = String(app?.router?.currentRoute?.path || window.location.pathname || '')
    return /(^|\/)admin(\/|$)/.test(path)
  }

  const locale = () => String(app?.i18n?.locale || 'hy').toLowerCase().split('-')[0]

  const translations = {
    hy: {
      allRoles: 'Դասակարգել ըստ հաստիքի',
      role: 'Հաստիք',
      rolePlural: 'Հաստիքներ',
      manage: 'Խմբագրել',
      manageFunctions: 'Խմբագրել ֆունկցիաները',
      factoryFormats: 'Նախագծերի թղթապանակ',
      fileTypes: 'Նախագծերի թղթապանակ',
      helpLabel: 'Տեղեկություն',
    },
    ru: {
      allRoles: 'Сортировать по должности',
      role: 'Должность',
      rolePlural: 'Должности',
      manage: 'Редактировать',
      manageFunctions: 'Редактировать функции',
      factoryFormats: 'Папка проектов',
      fileTypes: 'Папка проектов',
      helpLabel: 'Информация',
    },
    en: {
      allRoles: 'Sort by position',
      role: 'Position',
      rolePlural: 'Positions',
      manage: 'Edit',
      manageFunctions: 'Edit functions',
      factoryFormats: 'Project folders',
      fileTypes: 'Project folders',
      helpLabel: 'Information',
    },
  }

  const copy = () => translations[locale()] || translations.hy

  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim()

  const hideKnownLabels = (root) => {
    root.querySelectorAll('p, span').forEach((node) => {
      const text = normalize(node.textContent)
      if (removableLabels.has(text)) node.style.display = 'none'
    })

    root.querySelectorAll('.metric-card').forEach((card) => {
      const label = card.querySelector('.metric-label')
      if (normalize(label?.textContent) === 'Factory format-ներ') card.remove()
    })
  }

  const replaceAdminCopy = (root) => {
    if (!routeIsAdmin()) return
    const t = copy()

    root.querySelectorAll('option, th, button, p, span, h1, h2, h3, a').forEach((node) => {
      if (node.children.length) return
      const text = normalize(node.textContent)
      let next = null

      if (['Բոլոր role-երը', 'Все роли', 'All roles'].includes(text)) next = t.allRoles
      else if (['Role', 'Դեր', 'Роль'].includes(text)) next = t.role
      else if (['Role-եր', 'Роли', 'Roles'].includes(text)) next = t.rolePlural
      else if (['Կառավարել', 'Управлять', 'Manage'].includes(text)) next = t.manage
      else if (['Կառավարել ֆունկցիաները', 'Управлять функциями', 'Manage functions'].includes(text)) next = t.manageFunctions
      else if (['Արտադրամասերի format-ներ', 'Форматы цехов', 'Factory formats'].includes(text)) next = t.factoryFormats
      else if (['Ֆայլերի տեսակներ', 'Типы файлов', 'File types'].includes(text)) next = t.fileTypes

      if (next && text !== next) node.textContent = next
    })
  }

  const isSearchInput = (input) => {
    if (!(input instanceof HTMLInputElement)) return false
    const placeholder = normalize(input.placeholder).toLowerCase()
    return (
      input.type === 'search' ||
      placeholder.includes('որոն') ||
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
    if (!routeIsAdmin()) return
    const t = copy()
    const headers = root.querySelectorAll('main section, main header')

    headers.forEach((section) => {
      if (section.dataset.hoverHelpProcessed === 'true') return
      const heading = section.querySelector(':scope h1, :scope h2')
      if (!heading) return

      const paragraphs = Array.from(section.querySelectorAll(':scope > div > p, :scope > p')).filter((p) => {
        if (p.closest('[data-admin-hover-help]')) return false
        const text = normalize(p.textContent)
        if (!text || removableLabels.has(text)) return false
        if (text.length < 55) return false
        return true
      })

      const paragraph = paragraphs[0]
      if (!paragraph) return

      section.dataset.hoverHelpProcessed = 'true'
      const originalText = normalize(paragraph.textContent)
      paragraph.style.display = 'none'

      const wrapper = document.createElement('span')
      wrapper.setAttribute('data-admin-hover-help', '')
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
        'width:min(420px,80vw)',
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
    replaceAdminCopy(root)
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
  else start()

  app.router?.afterEach?.(() => {
    schedule()
    window.setTimeout(polish, 350)
  })
}
