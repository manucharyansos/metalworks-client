// What a task is called in lists: the project and item names that its code
// (990.01) stands for, with the code itself shown next to the task number.
// Kept free of imports so tests can load it directly.

export function taskTitle(order) {
  const item = order?.remote_number
  const names = [item?.pmp?.group_name, item?.remote_number_name]
    .map((name) => String(name || '').trim())
    .filter(Boolean)
  return [...new Set(names)].join(' · ') || order?.name || '—'
}

// Once a name takes its place, the code is shown next to the number.
export function taskCode(order) {
  return order?.name && taskTitle(order) !== order.name ? order.name : ''
}

export function taskNumber(order) {
  return `#${order?.order_number?.number || order?.id || '—'}`
}

// "#2026-10-0001 · 990.01": the number with the code when a name replaced it.
export function taskReference(order) {
  const code = taskCode(order)
  return code ? `${taskNumber(order)} · ${code}` : taskNumber(order)
}
