import part1 from '~/utils/ui-i18n-extended-data-1'
import part2 from '~/utils/ui-i18n-extended-data-2'
import part3 from '~/utils/ui-i18n-extended-data-3'
import part4 from '~/utils/ui-i18n-extended-data-4'
import part5 from '~/utils/ui-i18n-extended-data-5'

const entries = [...part1, ...part2, ...part3, ...part4, ...part5]
const LOCALE_INDEX = { hy: 0, ru: 1, en: 2 }
// Armenian letters only; Armenian punctuation (՝ ։) is handled separately.
const ARMENIAN_LETTER = /[Ա-Ֆա-և]/
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

// Armenian full stop, comma-colon and abbreviation dot become . : . outside Armenian.
function localizeMarks(text, locale) {
  if (locale === 'hy') return text
  return text.replace(/։/g, '.').replace(/՝/g, ':').replace(/․/g, '.')
}

function translatePunctuation(trimmed, locale) {
  const match = trimmed.match(/^(.*?)([:։․.!?…՝]+)$/)
  if (!match) return null
  const translated = exactTranslate(match[1].trim(), locale)
  if (!translated) return null
  return `${translated}${localizeMarks(match[2], locale)}`
}

function ruPlural(value, one, few, many) {
  const n = Math.abs(Number(value)) % 100
  const last = n % 10
  if (n > 10 && n < 20) return many
  if (last > 1 && last < 5) return few
  if (last === 1) return one
  return many
}

function enPlural(value, one, other) {
  return Number(value) === 1 ? one : other
}

function translateDynamic(trimmed, locale) {
  const idx = LOCALE_INDEX[locale]
  const pick = (hy, ru, en) => [hy, ru, en][idx]
  let match

  match = trimmed.match(/^(\d+)\s+ֆայլ$/)
  if (match) return pick(trimmed, `${match[1]} ${ruPlural(match[1], 'файл', 'файла', 'файлов')}`, `${match[1]} ${enPlural(match[1], 'file', 'files')}`)

  match = trimmed.match(/^(\d+)\s+քայլ այս ցանկում$/)
  if (match) return pick(trimmed, `${match[1]} ${ruPlural(match[1], 'этап', 'этапа', 'этапов')} в этом списке`, `${match[1]} ${enPlural(match[1], 'step', 'steps')} in this list`)

  match = trimmed.match(/^(\d+)\s+քայլ$/)
  if (match) return pick(trimmed, `${match[1]} ${ruPlural(match[1], 'этап', 'этапа', 'этапов')}`, `${match[1]} ${enPlural(match[1], 'step', 'steps')}`)

  match = trimmed.match(/^(\d+)\s+տարր$/)
  if (match) return pick(trimmed, `${match[1]} ${ruPlural(match[1], 'элемент', 'элемента', 'элементов')}`, `${match[1]} ${enPlural(match[1], 'item', 'items')}`)

  match = trimmed.match(/^(\d+)\s+ընտրված$/)
  if (match) return pick(trimmed, `выбрано: ${match[1]}`, `${match[1]} selected`)

  match = trimmed.match(/^(\d+)\s+արդյունք$/)
  if (match) return pick(trimmed, `${match[1]} ${ruPlural(match[1], 'результат', 'результата', 'результатов')}`, `${match[1]} ${enPlural(match[1], 'result', 'results')}`)

  match = trimmed.match(/^(\d+)\s+ակտիվ$/)
  if (match) return pick(trimmed, `активных: ${match[1]}`, `${match[1]} active`)

  match = trimmed.match(/^Առաջադրանք #(.+)$/)
  if (match) return pick(trimmed, `Задание #${match[1]}`, `Task #${match[1]}`)

  match = trimmed.match(/^Հաստատել \((.+)\)$/)
  if (match) return pick(trimmed, `Подтвердить (${match[1]})`, `Confirm (${match[1]})`)

  match = trimmed.match(/^Ցուցադրվում է (\d+) \/ (\d+) աշխատակից$/)
  if (match) return pick(trimmed, `Показано ${match[1]} из ${match[2]} ${ruPlural(match[2], 'сотрудника', 'сотрудников', 'сотрудников')}`, `Showing ${match[1]} of ${match[2]} ${enPlural(match[2], 'employee', 'employees')}`)

  match = trimmed.match(/^Էջ (\d+) \/ (\d+)$/)
  if (match) return pick(trimmed, `Стр. ${match[1]} из ${match[2]}`, `Page ${match[1]} of ${match[2]}`)

  match = trimmed.match(/^«(.+)» հաշիվը կհեռացվի։$/)
  if (match) return pick(trimmed, `Учётная запись «${match[1]}» будет удалена.`, `The “${match[1]}” account will be removed.`)

  match = trimmed.match(/^HTTP սխալ (.+)$/)
  if (match) return pick(trimmed, `Ошибка HTTP ${match[1]}`, `HTTP error ${match[1]}`)

  match = trimmed.match(/^Ձեր առաջադրանքը \(#(.+)\) հաջողությամբ տեղադրվել է[:։]$/)
  if (match) return pick(trimmed, `Ваше задание (#${match[1]}) успешно размещено.`, `Your task (#${match[1]}) was placed successfully.`)

  // Messages composed by the API (task history and validation details).
  if (idx === 0) return null
  const tr = (value) => translateTrimmed(String(value).trim(), locale)

  match = trimmed.match(/^Առաջադրանքը թարմացվել է \((.+)\)$/)
  if (match) return pick(trimmed, `Задание обновлено (${match[1]})`, `Task updated (${match[1]})`)

  match = trimmed.match(/^Ֆայլի տեսակը թույլատրված չէ։ Թույլատրելի են՝\s*(.*)$/)
  if (match) return pick(trimmed, `Тип файла не разрешён. Разрешены: ${match[1]}`, `This file type is not allowed. Allowed: ${match[1]}`)

  match = trimmed.match(/^Ինժեները վերադարձրել է աշխատանքը վերանայման՝\s*(.*)$/)
  if (match) return pick(trimmed, `Инженер вернул работу на доработку: ${match[1]}`, `The engineer returned the work for revision: ${match[1]}`)

  match = trimmed.match(/^Արտադրամաս «(.+?)»․ ավելացվել է (\d+) ֆայլով աշխատանք։$/)
  if (match) return pick(trimmed, `Цех «${tr(match[1])}»: добавлена работа (${match[2]} ${ruPlural(match[2], 'файл', 'файла', 'файлов')}).`, `Workshop “${tr(match[1])}”: added a job with ${match[2]} ${enPlural(match[2], 'file', 'files')}.`)

  match = trimmed.match(/^Արտադրամաս «(.+?)»․ կատարող «(.+?)» → «(.+?)»$/)
  if (match) return pick(trimmed, `Цех «${tr(match[1])}»: исполнитель «${tr(match[2])}» → «${tr(match[3])}»`, `Workshop “${tr(match[1])}”: operator “${tr(match[2])}” → “${tr(match[3])}”`)

  match = trimmed.match(/^Արտադրամաս «(.+?)»․ (.+?)՝ սպասում է ինժեների համաձայնությանը։$/)
  if (match) return pick(trimmed, `Цех «${tr(match[1])}»: ${tr(match[2])} — ожидает согласия инженера.`, `Workshop “${tr(match[1])}”: ${tr(match[2])} — waiting for the engineer’s consent.`)

  match = trimmed.match(/^Արտադրամաս «(.+?)»․ (.+?)՝ հարցումը հետ է վերցվել։$/)
  if (match) return pick(trimmed, `Цех «${tr(match[1])}»: ${tr(match[2])} — запрос отозван.`, `Workshop “${tr(match[1])}”: ${tr(match[2])} — request withdrawn.`)

  match = trimmed.match(/^Արտադրամաս «(.+?)»․ (.+?)՝ (ինժեները համաձայնել է|ինժեները մերժել է)։$/)
  if (match) return pick(trimmed, `Цех «${tr(match[1])}»: ${tr(match[2])} — ${tr(match[3])}.`, `Workshop “${tr(match[1])}”: ${tr(match[2])} — ${tr(match[3])}.`)

  match = trimmed.match(/^Արտադրամաս «(.+?)»․ (.+?) → (.+)$/)
  if (match) return pick(trimmed, `Цех «${tr(match[1])}»: ${tr(match[2])} → ${tr(match[3])}`, `Workshop “${tr(match[1])}”: ${tr(match[2])} → ${tr(match[3])}`)

  match = trimmed.match(/^Ֆայլ «(.+?)»․ գործող տարբերակը՝ (\d+)։$/)
  if (match) return pick(trimmed, `Файл «${match[1]}»: текущая версия — ${match[2]}.`, `File “${match[1]}”: current version is ${match[2]}.`)

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

  match = trimmed.match(/^(\d+)\s+(?:factory աշխատակից|արտադրամասի աշխատակից)$/)
  if (match) return pick(trimmed, `${match[1]} сотрудников цеха`, `${match[1]} workshop employees`)

  match = trimmed.match(/^(\d+)\s+աշխատակից$/)
  if (match) return pick(trimmed, `${match[1]} сотрудников`, `${match[1]} employees`)

  match = trimmed.match(/^(\d+)\s+ֆունկցիա հասանելի$/)
  if (match) return pick(trimmed, `${match[1]} функций доступно`, `${match[1]} functions available`)

  match = trimmed.match(/^Թարմացված՝\s*(.+)$/)
  if (match) return pick(trimmed, `Обновлено: ${match[1]}`, `Updated: ${match[1]}`)

  match = trimmed.match(/^Այսօր՝\s*(.+)$/)
  if (match) return pick(trimmed, `Сегодня: ${match[1]}`, `Today: ${match[1]}`)

  match = trimmed.match(/^(?:Admin|Ադմինի) սպասում՝\s*(.+)$/)
  if (match) return pick(trimmed, `Ожидает администратора: ${match[1]}`, `Admin pending: ${match[1]}`)

  match = trimmed.match(/^30 օրում ավարտված՝\s*(.+)$/)
  if (match) return pick(trimmed, `Завершено за 30 дней: ${match[1]}`, `Completed in 30 days: ${match[1]}`)

  match = trimmed.match(/^Կոդը ուղարկվել է՝\s*(.+)$/)
  if (match) return pick(trimmed, `Код отправлен на: ${match[1]}`, `Code sent to: ${match[1]}`)

  match = trimmed.match(/^(.+?) արտադրամասի \.([^\s]+) ֆայլի տեսակը ավելացվեց։$/)
  if (match) return pick(trimmed, `Тип файла .${match[2]} для цеха ${match[1]} добавлен.`, `File type .${match[2]} added for ${match[1]} workshop.`)

  match = trimmed.match(/^(.+?) արտադրամասի ֆայլի տեսակը թարմացվեց։$/)
  if (match) return pick(trimmed, `Тип файла цеха ${match[1]} обновлён.`, `${match[1]} workshop file type updated.`)

  match = trimmed.match(/^(.+?) արտադրամասի ֆայլի տեսակը հեռացվեց։$/)
  if (match) return pick(trimmed, `Тип файла цеха ${match[1]} удалён.`, `${match[1]} workshop file type removed.`)

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

// "· Էջ 2 / 5", "| Ցուցադրվում է՝" or a numbered stage such as "1. Կռում".
function translateLeadingSeparator(trimmed, locale) {
  const match = trimmed.match(/^([|·•]|\d{1,3}\.)\s+(\S[\s\S]*)$/)
  if (!match) return null
  const rest = translateTrimmed(match[2], locale)
  return rest === match[2] ? null : `${match[1]} ${rest}`
}

// Template text such as "Օպերատոր՝ {{ name }}" or "Քանակ: {{ qty }}" renders as
// one text node. Translate the known label and keep (or translate) the value.
function translateLabelValue(trimmed, locale) {
  const match = trimmed.match(/^([^՝:]{1,60}?)\s*([՝:])\s+(\S[\s\S]*)$/)
  if (!match) return null
  const labelSource = match[1].trim()
  const label =
    exactTranslate(labelSource, locale) ||
    (ARMENIAN_LETTER.test(labelSource) ? null : labelSource)
  if (!label) return null
  const valueSource = match[3].trim()
  const value = translateTrimmed(valueSource, locale)
  const separator = locale === 'hy' ? match[2] : ':'
  const result = `${label}${separator} ${value}`
  return result === trimmed ? null : result
}

// Known names quoted inside a message ("“Կռում” · …", "Цех «Կռում»").
function translateQuoted(trimmed, locale) {
  if (locale === 'hy') return null
  let changed = false
  const result = trimmed.replace(/([“«])([^“”«»]{1,80})([”»])/g, (whole, open, inner, close) => {
    if (!ARMENIAN_LETTER.test(inner)) return whole
    const translated = exactTranslate(inner.trim(), locale)
    if (!translated || translated === inner) return whole
    changed = true
    return `${open}${translated}${close}`
  })
  return changed ? result : null
}

// Already translated text that still carries Armenian punctuation, e.g. a
// localized label followed by "՝ {{ count }}" in the template.
function localizePunctuation(trimmed, locale) {
  if (locale === 'hy' || ARMENIAN_LETTER.test(trimmed) || !/[՝։]/.test(trimmed)) return null
  return trimmed.replace(/\s*՝\s*/g, ': ').replace(/։/g, '.').trim()
}

function translateTrimmed(trimmed, locale) {
  return (
    exactTranslate(trimmed, locale) ||
    translatePunctuation(trimmed, locale) ||
    translateDynamic(trimmed, locale) ||
    translateSegments(trimmed, locale) ||
    translateLeadingSeparator(trimmed, locale) ||
    translateLabelValue(trimmed, locale) ||
    translateQuoted(trimmed, locale) ||
    localizePunctuation(trimmed, locale) ||
    trimmed
  )
}

export function translateValue(source, locale = currentLocale) {
  if (typeof source !== 'string' || !source.trim()) return source
  // Template text often spans lines ("name ·\n  role"). Match it as the
  // browser shows it, on one line; untranslated text keeps its formatting.
  const collapsed = source.trim().replace(/\s+/g, ' ')
  const translated = translateTrimmed(collapsed, normalizeLocale(locale))
  return translated === collapsed ? source : preserveWhitespace(source, translated)
}

function shouldSkip(element) {
  if (!element || element.nodeType !== 1) return false
  if (element.closest('[translate="no"]')) return true
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
