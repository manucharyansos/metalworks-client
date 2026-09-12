import part1 from '~/utils/ui-i18n-extended-data-1'
import part2 from '~/utils/ui-i18n-extended-data-2'
import part3 from '~/utils/ui-i18n-extended-data-3'

const entries = [...part1, ...part2, ...part3]
const LOCALE_INDEX = { hy: 0, ru: 1, en: 2 }
const sourceIndex = new Map()

for (const entry of entries) {
  entry.forEach((value) => {
    if (typeof value === 'string' && value.trim()) sourceIndex.set(value.trim(), entry)
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

function exactTranslate(trimmed, locale) {
  const entry = sourceIndex.get(trimmed)
  return entry ? entry[LOCALE_INDEX[locale]] : null
}

function translatePunctuation(trimmed, locale) {
  const match = trimmed.match(/^(.*?)([:։․.!?…]+)$/)
  if (!match) return null
  const translated = exactTranslate(match[1].trim(), locale)
  if (!translated) return null
  const punctuation = locale === 'en' && match[2] === '։' ? '.' : match[2]
  return `${translated}${punctuation}`
}

function translateDynamic(trimmed, locale) {
  const idx = LOCALE_INDEX[locale]
  const pick = (hy, ru, en) => [hy, ru, en][idx]
  let match

  match = trimmed.match(/^(\d+)\s+ակտիվ ֆիլտր(?:եր)?$/)
  if (match) return pick(trimmed, `${match[1]} активных фильтров`, `${match[1]} active filters`)

  match = trimmed.match(/^(\d+)\s+օր հետո$/)
  if (match) return pick(trimmed, `через ${match[1]} дн.`, `in ${match[1]} days`)

  match = trimmed.match(/^(\d+)\s+օր\s+(\d+)\s+ժամ$/)
  if (match) return pick(trimmed, `${match[1]} дн. ${match[2]} ч.`, `${match[1]}d ${match[2]}h`)

  match = trimmed.match(/^(\d+)\s+օր մնաց$/)
  if (match) return pick(trimmed, `осталось ${match[1]} дн.`, `${match[1]} days left`)

  match = trimmed.match(/^(\d+)\s+օր ուշացած$/)
  if (match) return pick(trimmed, `просрочено на ${match[1]} дн.`, `${match[1]} days overdue`)

  match = trimmed.match(/^(\d+)\s+ֆայլով$/)
  if (match) return pick(trimmed, `с ${match[1]} файлами`, `with ${match[1]} files`)

  match = trimmed.match(/^(\d+)\s+factory աշխատակից$/)
  if (match) return pick(trimmed, `${match[1]} сотрудников цеха`, `${match[1]} factory employees`)

  match = trimmed.match(/^(\d+)\s+աշխատակից$/)
  if (match) return pick(trimmed, `${match[1]} сотрудников`, `${match[1]} employees`)

  match = trimmed.match(/^(\d+)\s+ֆունկցիա հասանելի$/)
  if (match) return pick(trimmed, `${match[1]} функций доступно`, `${match[1]} functions available`)

  match = trimmed.match(/^Թարմացված՝\s*(.+)$/)
  if (match) return pick(trimmed, `Обновлено: ${match[1]}`, `Updated: ${match[1]}`)

  match = trimmed.match(/^Այսօր՝\s*(.+)$/)
  if (match) return pick(trimmed, `Сегодня: ${match[1]}`, `Today: ${match[1]}`)

  match = trimmed.match(/^Admin սպասում՝\s*(.+)$/)
  if (match) return pick(trimmed, `Ожидает admin: ${match[1]}`, `Admin pending: ${match[1]}`)

  match = trimmed.match(/^30 օրում ավարտված՝\s*(.+)$/)
  if (match) return pick(trimmed, `Завершено за 30 дней: ${match[1]}`, `Completed in 30 days: ${match[1]}`)

  match = trimmed.match(/^Կոդը ուղարկվել է՝\s*(.+)$/)
  if (match) return pick(trimmed, `Код отправлен на: ${match[1]}`, `Code sent to: ${match[1]}`)

  match = trimmed.match(/^(.+?) արտադրամասի \.([^\s]+) format-ը ավելացվեց։$/)
  if (match) return pick(trimmed, `Формат .${match[2]} для цеха ${match[1]} добавлен.`, `Format .${match[2]} added for ${match[1]} factory.`)

  match = trimmed.match(/^(.+?) արտադրամասի format-ը թարմացվեց։$/)
  if (match) return pick(trimmed, `Формат цеха ${match[1]} обновлён.`, `${match[1]} factory format updated.`)

  match = trimmed.match(/^(.+?) արտադրամասի format-ը հեռացվեց։$/)
  if (match) return pick(trimmed, `Формат цеха ${match[1]} удалён.`, `${match[1]} factory format removed.`)

  return null
}

function translateSegments(trimmed, locale) {
  for (const separator of [' · ', ' | ']) {
    if (!trimmed.includes(separator)) continue
    const parts = trimmed.split(separator)
    let changed = false
    const translated = parts.map((part) => {
      const next = translateTrimmed(part, locale)
      if (next !== part) changed = true
      return next
    })
    if (changed) return translated.join(separator)
  }
  return null
}

function translateTrimmed(trimmed, locale) {
  return (
    exactTranslate(trimmed, locale) ||
    translatePunctuation(trimmed, locale) ||
    translateDynamic(trimmed, locale) ||
    translateSegments(trimmed, locale) ||
    trimmed
  )
}

function translateValue(source, locale = currentLocale) {
  if (typeof source !== 'string' || !source.trim()) return source
  return preserveWhitespace(source, translateTrimmed(source.trim(), normalizeLocale(locale)))
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

const ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt']

function translateAttributes(element) {
  if (!element || element.nodeType !== 1 || shouldSkip(element)) return
  let states = attributeState.get(element)
  if (!states) {
    states = {}
    attributeState.set(element, states)
  }

  for (const name of ATTRIBUTES) {
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
  if (root.nodeType === 3) return translateTextNode(root)
  if (![1, 9, 11].includes(root.nodeType)) return
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
  }

  inject('uiTranslateExtended', (value) => translateValue(value, normalizeLocale(app.i18n?.locale)))

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
        attributeFilter: [...ATTRIBUTES, 'value'],
      })
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
  else start()

  app.router?.afterEach?.(() => window.requestAnimationFrame(refresh))
  if (app.i18n?.vm?.$watch) app.i18n.vm.$watch('locale', () => window.requestAnimationFrame(refresh))
}
