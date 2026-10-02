// These are factory task statuses, not the parent order's statuses. In the
// existing API, `confirmed` means the operator has started the task.
export function normalizeFactoryOrderStatus(status) {
  if (
    status == null ||
    ['', 'null', 'pending', 'waiting'].includes(String(status).toLowerCase())
  )
    return null
  return String(status)
}

export function isFactoryOrderFinished(status) {
  return ['finished', 'ավարտել', 'ավարտված'].includes(
    String(status || '').toLowerCase()
  )
}

export function localFactoryDate(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`
}

export function localFactoryTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${localFactoryDate(date)} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}:${pad(date.getSeconds())}`
}
