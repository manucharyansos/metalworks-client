// The API sends deadlines and plans as Yerevan wall-clock text without a zone
// ("2026-11-05 18:00:00" or just "2026-11-05"). Browsers disagree on that text:
// Safari rejects the space form and every browser reads a bare date as UTC
// midnight (04:00 in Yerevan). These helpers read it as local time everywhere
// and format it without relying on the browser's Armenian locale data.
const WALL_TIME =
  /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?$/
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export function parseWallTime(value) {
  if (value instanceof Date) return value.getTime()
  if (value === null || value === undefined) return NaN
  const text = String(value).trim()
  if (!text) return NaN
  const match = text.match(WALL_TIME)
  if (!match) {
    // Zoned ISO values (created_at, notifications) keep their own offset.
    return Date.parse(text.replace(/(\.\d{3})\d+/, '$1'))
  }
  const [year, month, day, hour, minute, second] = match
    .slice(1)
    .map((part) => Number(part || 0))
  const date = new Date(year, month - 1, day, hour, minute, second)
  // Reject impossible dates such as 2026-02-31 instead of rolling them over.
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date.getTime()
    : NaN
}

export function isDateOnly(value) {
  return DATE_ONLY.test(String(value ?? '').trim())
}

const pad = (number) => String(number).padStart(2, '0')

export function formatWallDate(value, empty = '—') {
  const time = parseWallTime(value)
  if (!Number.isFinite(time)) return value ? String(value) : empty
  const date = new Date(time)
  return `${pad(date.getDate())}.${pad(
    date.getMonth() + 1
  )}.${date.getFullYear()}`
}

// A bare date has no time of day, so it is shown as a date only.
export function formatWallDateTime(value, empty = '—') {
  const time = parseWallTime(value)
  if (!Number.isFinite(time)) return value ? String(value) : empty
  const date = new Date(time)
  const day = `${pad(date.getDate())}.${pad(
    date.getMonth() + 1
  )}.${date.getFullYear()}`
  return isDateOnly(value)
    ? day
    : `${day}, ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Short Armenian names, as in CLDR, for browsers without Armenian locale data.
const HY_WEEKDAYS = ['Կիր', 'Երկ', 'Երք', 'Չրք', 'Հնգ', 'Ուր', 'Շբթ']
const HY_MONTHS = [
  'հնվ',
  'փտվ',
  'մրտ',
  'ապր',
  'մյս',
  'հնս',
  'հլս',
  'օգս',
  'սեպ',
  'հոկ',
  'նոյ',
  'դեկ',
]

// "Երկ, 2 նոյ" for a calendar day ("2026-11-02"); other languages use Intl.
export function calendarDayLabel(day, locale = 'hy') {
  const date = new Date(`${day}T12:00:00Z`)
  if (!DATE_ONLY.test(String(day)) || Number.isNaN(date.getTime()))
    return String(day ?? '')
  if (!locale || locale === 'hy')
    return `${HY_WEEKDAYS[date.getUTCDay()]}, ${date.getUTCDate()} ${
      HY_MONTHS[date.getUTCMonth()]
    }`
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date)
  } catch (_) {
    return String(day)
  }
}
