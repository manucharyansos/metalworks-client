// Keyboard choice in the search-and-pick fields (project group, subgroup):
// the arrows move through the list, Enter takes the highlighted option.

// "8" -> "008": codes are often typed without their leading zeros.
export function padCode(value, size = 0) {
  const text = String(value ?? '').trim()
  return size && /^\d+$/.test(text) && text.length < size
    ? text.padStart(size, '0')
    : text
}

// True for the option whose code is what was typed, with or without zeros.
export function codeMatcher(typed, code, size = 0) {
  const text = String(typed ?? '')
    .trim()
    .toLowerCase()
  if (!text) return () => false
  const padded = padCode(text, size).toLowerCase()
  return (option) => {
    const value = String(code(option) ?? '')
      .trim()
      .toLowerCase()
    return value === text || value === padded
  }
}

// The option Enter takes: the one reached with the arrows, otherwise the one
// that matches what was typed, otherwise (with `fallback`) the first one.
export function activeOptionIndex(options, moved, isMatch, fallback = false) {
  const list = Array.isArray(options) ? options : []
  if (!list.length) return -1
  if (Number.isInteger(moved) && moved >= 0 && moved < list.length) return moved
  const match = list.findIndex((option) => isMatch(option))
  if (match >= 0) return match
  return fallback ? 0 : -1
}

// The arrows wrap around; the first press starts at the top or the bottom.
export function stepOptionIndex(current, length, step) {
  if (!length) return -1
  if (!Number.isInteger(current) || current < 0 || current >= length)
    return step > 0 ? 0 : length - 1
  return (current + step + length) % length
}

// Moves keyboard focus to a field once Vue has enabled it.
export function focusFieldById(vm, id) {
  vm.$nextTick(() => {
    if (typeof document === 'undefined') return
    const field = document.getElementById(id)
    if (!field || field.disabled) return
    field.focus()
    try {
      if (typeof field.select === 'function' && field.type !== 'date')
        field.select()
    } catch (_) {}
  })
}

// Keeps the highlighted option visible in a scrolling list.
export function revealOption(vm, id) {
  vm.$nextTick(() => {
    if (typeof document === 'undefined') return
    document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' })
  })
}
