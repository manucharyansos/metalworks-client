const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const { transformSync } = require('@babel/core')

const root = path.join(__dirname, '..')
const cache = new Map()
function load(file) {
  if (cache.has(file)) return cache.get(file)
  const source = fs.readFileSync(path.join(root, file), 'utf8')
  const code = transformSync(source, {
    configFile: false,
    babelrc: false,
    plugins: [require('@babel/plugin-transform-modules-commonjs')],
  }).code
  const module = { exports: {} }
  const dependency = (name) =>
    name.startsWith('~/') ? load(name.slice(2) + '.js') : require(name)
  new Function('require', 'module', 'exports', code)(dependency, module, module.exports)
  cache.set(file, module.exports)
  return module.exports
}

const { translateValue } = load('plugins/ui-i18n-extended.client.js')

test('Armenian text is never rewritten by the extended translator', () => {
  for (const text of [
    'Օպերատոր՝ Hamlet',
    'Ստեղծում՝ թույլատրված',
    '3 ֆայլ',
    '· Էջ 2 / 5',
    'Առաջադրանք #2026-10-0013',
    'Ընդհանուր՝',
    'Ձեր ստեղծած առաջադրանքները՝ ըստ աշխատանքի ընթացքի։',
    '  Կցված ֆայլեր  ',
  ]) {
    assert.equal(translateValue(text, 'hy'), text)
  }
})

test('labels followed by template values use the translated label and a Latin separator', () => {
  assert.equal(translateValue('Օպերատոր՝ Hamlet', 'en'), 'Operator: Hamlet')
  assert.equal(translateValue('Օպերատոր՝ Hamlet', 'ru'), 'Оператор: Hamlet')
  assert.equal(translateValue('Ստեղծում՝ թույլատրված', 'en'), 'Creation: allowed')
  assert.equal(translateValue('Քանակ: 12', 'ru'), 'Количество: 12')
  assert.equal(translateValue('Unassigned՝ 2', 'en'), 'Unassigned: 2')
  assert.equal(translateValue('Awaiting confirmation՝ 0', 'en'), 'Awaiting confirmation: 0')
  // Unknown Armenian labels and plain times stay intact.
  assert.equal(translateValue('Անհայտ պիտակ՝ 5', 'en'), 'Անհայտ պիտակ՝ 5')
  assert.equal(translateValue('11:40', 'en'), '11:40')
})

test('counted labels use plural forms', () => {
  assert.equal(translateValue('1 ֆայլ', 'en'), '1 file')
  assert.equal(translateValue('3 ֆայլ', 'en'), '3 files')
  assert.equal(translateValue('2 ֆայլ', 'ru'), '2 файла')
  assert.equal(translateValue('5 ֆայլ', 'ru'), '5 файлов')
  assert.equal(translateValue('21 ֆայլ', 'ru'), '21 файл')
  assert.equal(translateValue('12 քայլ', 'ru'), '12 этапов')
  assert.equal(translateValue('4 քայլ այս ցանկում', 'en'), '4 steps in this list')
  assert.equal(translateValue('6 տարր', 'ru'), '6 элементов')
  assert.equal(translateValue('1 տարր', 'en'), '1 item')
  assert.equal(translateValue('1 ընտրված', 'en'), '1 selected')
  assert.equal(translateValue('Ցուցադրվում է 3 / 21 աշխատակից', 'ru'), 'Показано 3 из 21 сотрудника')
  assert.equal(translateValue('Ցուցադրվում է 1 / 1 աշխատակից', 'en'), 'Showing 1 of 1 employee')
})

test('Armenian punctuation, leading separators and multi-line template text', () => {
  assert.equal(translateValue('Առաջադրանքը հասանելի չէ։', 'en'), 'The task is not available.')
  assert.equal(translateValue('Առաջադրանքը հասանելի չէ։', 'ru'), 'Задание недоступно.')
  assert.equal(translateValue('· Էջ 2 / 5', 'en'), '· Page 2 of 5')
  assert.equal(translateValue('1. Լազերային կտրում՝ լիստեր', 'ru'), '1. Лазерная резка: листы')
  assert.equal(translateValue('1. Լազերային կտրում՝ լիստեր', 'hy'), '1. Լազերային կտրում՝ լիստեր')
  assert.equal(translateValue('| Ցուցադրվում է՝', 'en'), '| Showing:')
  assert.equal(translateValue('Ընդհանուր՝', 'en'), 'Total:')
  const multiline =
    '\n        CSV արտահանումը ներառում է ամբողջ ֆիլտրված արդյունքը, ոչ միայն\n' +
    '        նախադիտման ընթացիկ էջը։ Հայերեն տեքստը Excel-ում ճիշտ բացվելու համար\n' +
    '        ֆայլը պահվում է UTF‑8 BOM ձևաչափով։\n      '
  assert.match(translateValue(multiline, 'en'), /^\n\s+The CSV export includes the entire filtered result/)
  assert.equal(translateValue(multiline, 'hy'), multiline)
  const workshopAndRole = '\n                Լազերային կտրում՝ լիստեր ·\n                Լազերաին կտրում\n              '
  assert.equal(translateValue(workshopAndRole, 'en').trim(), 'Laser cutting: sheets · Laser cutting')
  assert.equal(translateValue(workshopAndRole, 'hy'), workshopAndRole)
})

test('task terminology is consistent in Russian and English', () => {
  assert.equal(translateValue('Իմ առաջադրանքները', 'en'), 'My tasks')
  assert.equal(translateValue('Իմ առաջադրանքները', 'ru'), 'Мои задания')
  assert.equal(translateValue('Առաջադրանք #2026-10-0013', 'en'), 'Task #2026-10-0013')
  assert.equal(
    translateValue(
      'Մուտք գործեք ձեր աշխատանքային հաշիվ՝ առաջադրանքների, ֆայլերի և արտադրական գործընթացների հետ աշխատելու համար։',
      'en'
    ),
    'Sign in to your work account to manage tasks, files and production processes.'
  )
})

test('every dictionary row has three non-empty translations', () => {
  for (const part of [1, 2, 3, 4]) {
    for (const row of load(`utils/ui-i18n-extended-data-${part}.js`).default) {
      assert.equal(row.length, 3, JSON.stringify(row))
      assert.ok(
        row.every((value) => typeof value === 'string' && value.trim()),
        JSON.stringify(row)
      )
    }
  }
})

test('task history and validation messages written by the API are translated', () => {
  assert.equal(translateValue('Արտադրամաս «Կռում»․ ավելացվել է 1 ֆայլով աշխատանք։', 'ru'), 'Цех «Гибка»: добавлена работа (1 файл).')
  assert.equal(translateValue('Արտադրամաս «Կռում»․ ավելացվել է 3 ֆայլով աշխատանք։', 'en'), 'Workshop “Bending”: added a job with 3 files.')
  assert.equal(translateValue('Արտադրամաս «Կռում»․ կատարող «Չնշանակված» → «Hamlet»', 'en'), 'Workshop “Bending”: operator “Unassigned” → “Hamlet”')
  assert.equal(translateValue('Արտադրամաս «Կռում»․ ժամկետի փոփոխության հարցում՝ ինժեները համաձայնել է։', 'en'), 'Workshop “Bending”: deadline change request — the engineer agreed.')
  assert.equal(translateValue('Ինժեները վերադարձրել է աշխատանքը վերանայման՝ Փոխել անցքը', 'ru'), 'Инженер вернул работу на доработку: Փոխել անցքը')
  assert.equal(translateValue('Ֆայլի տեսակը թույլատրված չէ։ Թույլատրելի են՝ dxf, pdf', 'en'), 'This file type is not allowed. Allowed: dxf, pdf')
  assert.equal(translateValue('Հաստատման կոդը սխալ է։', 'ru'), 'Неверный код подтверждения.')
  assert.equal(
    translateValue('“Լազերային կտրում՝ լիստեր” · QA changed the status: In progress → Finished', 'en'),
    '“Laser cutting: sheets” · QA changed the status: In progress → Finished'
  )
  assert.equal(translateValue('Цех «Կռում» · маршрут изменён', 'ru'), 'Цех «Гибка» · маршрут изменён')
  assert.equal(translateValue('Արտադրամաս «Կռում»․ ավելացվել է 1 ֆայլով աշխատանք։', 'hy'), 'Արտադրամաս «Կռում»․ ավելացվել է 1 ֆայլով աշխատանք։')
})
