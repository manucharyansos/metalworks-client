// Enter in a single-line field of a form or dialog moves on to the next field;
// in the last field it presses the button marked data-enter-submit. Forms
// that have a submit button keep the browser's own Enter, fields outside forms
// and dialogs (toolbar searches) are left alone, and data-enter="off" opts a
// field or an area out (fields that handle Enter themselves).

export const ENTER_SCOPE = 'form, [data-enter-scope], [role="dialog"]'
const TYPING = new Set([
  'text',
  'search',
  'email',
  'tel',
  'url',
  'number',
  'password',
  'date',
  'time',
  'datetime-local',
  'month',
  'week',
])
const NOT_A_TARGET = new Set([
  'hidden',
  'checkbox',
  'radio',
  'file',
  'button',
  'submit',
  'reset',
  'image',
  'range',
  'color',
])

export function isTypingField(element) {
  return (
    element?.tagName === 'INPUT' &&
    TYPING.has(String(element.type || 'text').toLowerCase())
  )
}

function visible(element) {
  return element.getClientRects().length > 0
}

function canTakeFocus(element) {
  if (element.disabled || element.readOnly) return false
  if (element.tagName === 'INPUT' && NOT_A_TARGET.has(element.type)) return false
  return visible(element)
}

function hasSubmitButton(form) {
  return [...(form.elements || [])].some(
    (element) =>
      (element.tagName === 'BUTTON' && element.type === 'submit') ||
      (element.tagName === 'INPUT' && ['submit', 'image'].includes(element.type))
  )
}

// The marked main button of the scope, or of the dialog around it.
function submitButton(scope) {
  for (let node = scope; node; ) {
    const button = [...node.querySelectorAll('[data-enter-submit]')].find(
      (element) => !element.disabled && visible(element)
    )
    if (button) return button
    if (node.matches('[role="dialog"], [data-enter-scope]')) return null
    node = node.parentElement?.closest(ENTER_SCOPE) || null
  }
  return null
}

// What Enter does in `field`: { type: 'focus' | 'click', element } or null.
export function enterAction(field) {
  if (!isTypingField(field) || field.disabled || field.readOnly) return null
  if (field.closest('[data-enter="off"]')) return null
  if (field.getAttribute('aria-expanded') === 'true') return null
  const scope = field.closest(ENTER_SCOPE)
  if (!scope) return null
  if (scope.tagName === 'FORM' && hasSubmitButton(scope)) return null
  const fields = [...scope.querySelectorAll('input, select, textarea')].filter(
    (element) =>
      element === field ||
      (element.closest(ENTER_SCOPE) === scope && canTakeFocus(element))
  )
  const next = fields[fields.indexOf(field) + 1]
  if (next) return { type: 'focus', element: next }
  const button = submitButton(scope)
  return button ? { type: 'click', element: button } : null
}

export function handleEnterKey(event) {
  if (
    event.key !== 'Enter' ||
    event.defaultPrevented ||
    event.isComposing ||
    event.repeat ||
    event.shiftKey ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey
  )
    return null
  const action = enterAction(event.target)
  if (!action) return null
  event.preventDefault()
  if (action.type === 'click') {
    action.element.click()
    return action
  }
  action.element.focus()
  try {
    if (isTypingField(action.element) && action.element.type !== 'date')
      action.element.select()
  } catch (_) {}
  return action
}
