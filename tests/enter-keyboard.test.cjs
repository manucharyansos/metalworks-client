const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const combobox = import(moduleUrl(read('utils/combobox.js')))
const navigation = import(moduleUrl(read('utils/enter-navigation.js')))

// A minimal element tree: enough of the DOM for the Enter rules.
class Element {
  constructor(tag, attrs = {}, children = []) {
    this.tagName = tag.toUpperCase()
    this.attrs = { ...attrs }
    this.parentElement = null
    this.children = []
    this.disabled = 'disabled' in attrs
    this.readOnly = 'readonly' in attrs
    this.hidden = 'hidden' in attrs
    this.focused = false
    this.clicks = 0
    children.forEach((child) => {
      child.parentElement = this
      this.children.push(child)
    })
  }

  get type() {
    if (this.tagName === 'BUTTON') return this.attrs.type || 'submit'
    if (this.tagName === 'INPUT') return this.attrs.type || 'text'
    return undefined
  }

  get elements() {
    return this.querySelectorAll('input, select, textarea, button')
  }

  getAttribute(name) {
    return name in this.attrs ? String(this.attrs[name]) : null
  }

  matches(selector) {
    return selector.split(',').some((part) => {
      const [, tag, attr, value] = part.trim().match(/^([a-z]*)(?:\[([\w-]+)(?:="([^"]*)")?\])?$/i)
      if (tag && this.tagName !== tag.toUpperCase()) return false
      if (attr && !(attr in this.attrs)) return false
      if (attr && value !== undefined && String(this.attrs[attr]) !== value) return false
      return Boolean(tag || attr)
    })
  }

  closest(selector) {
    for (let node = this; node; node = node.parentElement) if (node.matches(selector)) return node
    return null
  }

  querySelectorAll(selector) {
    const found = []
    const walk = (node) => node.children.forEach((child) => {
      if (child.matches(selector)) found.push(child)
      walk(child)
    })
    walk(this)
    return found
  }

  getClientRects() {
    return this.hidden ? [] : [{}]
  }

  focus() { this.focused = true }
  click() { this.clicks++ }
  select() { this.selected = true }
}
const el = (tag, attrs, children) => new Element(tag, attrs, children)
const keydown = (target, extra = {}) => ({ key: 'Enter', target, preventDefault() { this.defaultPrevented = true }, ...extra })

test('codes typed without zeros are found and the arrows wrap around the list', async () => {
  const { padCode, codeMatcher, activeOptionIndex, stepOptionIndex } = await combobox
  assert.equal(padCode('8', 3), '008')
  assert.equal(padCode(' 8 ', 3), '008')
  assert.equal(padCode('008', 3), '008')
  assert.equal(padCode('12a', 3), '12a')
  assert.equal(padCode('', 3), '')
  const groups = [{ group: '018' }, { group: '008' }]
  const byCode = (typed) => codeMatcher(typed, (row) => row.group, 3)
  assert.equal(activeOptionIndex(groups, -1, byCode('8')), 1, 'the exact code wins over a partial match')
  assert.equal(activeOptionIndex(groups, 0, byCode('8')), 0, 'an option reached with the arrows wins')
  assert.equal(activeOptionIndex(groups, -1, byCode('')), -1, 'nothing typed, nothing chosen')
  assert.equal(activeOptionIndex(groups, -1, () => false, true), 0, 'fallback to the first option')
  assert.equal(activeOptionIndex([], 0, byCode('8'), true), -1)
  assert.equal(activeOptionIndex(groups, 5, byCode('8')), 1, 'a stale arrow position is ignored')
  assert.deepEqual([stepOptionIndex(-1, 3, 1), stepOptionIndex(-1, 3, -1), stepOptionIndex(2, 3, 1), stepOptionIndex(0, 3, -1)], [0, 2, 0, 2])
  assert.equal(stepOptionIndex(0, 0, 1), -1)
})

test('Enter moves to the next field and skips checkboxes, disabled and hidden fields', async () => {
  const { enterAction } = await navigation
  const code = el('input')
  const date = el('input', { type: 'datetime-local' })
  const notes = el('textarea')
  el('section', { 'data-enter-scope': '' }, [code, el('input', { type: 'checkbox' }), el('input', { disabled: '' }), el('input', { hidden: '' }), date, notes])
  assert.deepEqual(enterAction(code), { type: 'focus', element: date })
  assert.deepEqual(enterAction(date), { type: 'focus', element: notes })
  assert.equal(enterAction(notes), null, 'a text area keeps Enter for new lines')
})

test('forms with a submit button keep the browser Enter; fields outside forms and dialogs are left alone', async () => {
  const { enterAction } = await navigation
  const login = el('input', { type: 'email' })
  el('form', {}, [login, el('input', { type: 'password' }), el('button', {})])
  assert.equal(enterAction(login), null)
  const search = el('input', { type: 'search' })
  el('div', {}, [search, el('input')])
  assert.equal(enterAction(search), null)
})

test('the last field of a dialog presses its main button, never a disabled one', async () => {
  const { enterAction } = await navigation
  const name = el('input')
  const phone = el('input', { type: 'tel' })
  const save = el('button', { type: 'button', 'data-enter-submit': '' })
  el('div', { role: 'dialog' }, [name, phone, el('button', { type: 'button' }), save])
  assert.deepEqual(enterAction(name), { type: 'focus', element: phone })
  assert.deepEqual(enterAction(phone), { type: 'click', element: save })
  save.disabled = true
  assert.equal(enterAction(phone), null)
})

test('a form without a submit button inside a dialog uses the dialog footer button', async () => {
  const { enterAction } = await navigation
  const first = el('input')
  const last = el('input', { type: 'password' })
  const save = el('button', { type: 'button', 'data-enter-submit': '' })
  el('div', { role: 'dialog' }, [el('form', {}, [first, last]), el('footer', {}, [save])])
  assert.deepEqual(enterAction(first), { type: 'focus', element: last })
  assert.deepEqual(enterAction(last), { type: 'click', element: save })
})

test('fields with their own Enter, open lists and modified or handled keys are not touched', async () => {
  const { enterAction, handleEnterKey } = await navigation
  const own = el('input', { 'data-enter': 'off' })
  const list = el('input', { 'aria-expanded': 'true' })
  const first = el('input')
  const second = el('input')
  el('section', { 'data-enter-scope': '' }, [own, list, first, second])
  assert.equal(enterAction(own), null)
  assert.equal(enterAction(list), null)
  for (const extra of [{ shiftKey: true }, { ctrlKey: true }, { isComposing: true }, { defaultPrevented: true }, { key: 'Tab' }])
    assert.equal(handleEnterKey(keydown(first, extra)), null)
  assert.equal(second.focused, false)
  const event = keydown(first)
  assert.deepEqual(handleEnterKey(event), { type: 'focus', element: second })
  assert.equal(event.defaultPrevented, true)
  assert.equal(second.focused, true)
  assert.equal(second.selected, true)
})

test('the settings status lines exist in every language with their values', () => {
  const keys = {
    status_all_files: ['count'], status_selected_files: ['count'], status_route: ['mode', 'count'],
    status_confirmation_off: [], status_confirmation_photo: [], status_confirmation_text: [],
    status_confirmation_photo_text: [], status_confirmation_missing: [],
    status_workshops_default: [], status_workshops_custom: ['count'], status_operators: ['assigned', 'total'],
  }
  for (const locale of ['hy', 'ru', 'en']) {
    const messages = JSON.parse(read(`locales/${locale}.json`)).order_configuration
    for (const [key, values] of Object.entries(keys)) {
      assert.ok(messages[key]?.length > 3, `${locale}.${key}`)
      for (const value of values) assert.match(messages[key], new RegExp(`\\{${value}\\}`), `${locale}.${key} {${value}}`)
    }
  }
})
