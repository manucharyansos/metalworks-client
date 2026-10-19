const COPY = {
  hy: {
    remaining: 'Մնացել է՝',
    overdue: 'Ժամկետն անցել է՝',
    completed: 'Ավարտված է',
    rejected: 'Մերժված է',
    none: 'Ժամկետ նշված չէ',
    day: 'օր',
    hour: 'ժ',
    soon: '1 ժամից քիչ',
  },
  ru: {
    remaining: 'Осталось:',
    overdue: 'Просрочено на:',
    completed: 'Завершено',
    rejected: 'Отклонено',
    none: 'Срок не указан',
    day: 'д',
    hour: 'ч',
    soon: 'меньше часа',
  },
  en: {
    remaining: 'Remaining:',
    overdue: 'Overdue by:',
    completed: 'Completed',
    rejected: 'Rejected',
    none: 'No deadline',
    day: 'd',
    hour: 'h',
    soon: 'less than an hour',
  },
}
export function taskDeadline(
  value,
  { completed = false, rejected = false, locale = 'hy', now = Date.now() } = {}
) {
  const copy = COPY[locale] || COPY.hy
  if (rejected) return { label: copy.rejected, tone: 'neutral' }
  if (completed) return { label: copy.completed, tone: 'green' }
  const end = value ? new Date(value).getTime() : NaN
  if (!Number.isFinite(end)) return { label: copy.none, tone: 'neutral' }
  const difference = end - now
  const hours = Math.floor(Math.abs(difference) / 3600000)
  const days = Math.floor(hours / 24)
  const parts = [
    days ? `${days} ${copy.day}` : '',
    hours % 24 ? `${hours % 24} ${copy.hour}` : '',
  ].filter(Boolean)
  return {
    label: `${difference < 0 ? copy.overdue : copy.remaining} ${
      parts.join(' ') || copy.soon
    }`,
    tone: difference < 0 ? 'red' : difference < 86400000 ? 'amber' : 'neutral',
  }
}
