// The RAL Classic colours most often asked for in powder coating, with a screen
// approximation of each (a real sample always differs a little) and its name.
// No imports: tests load this file directly.

export const RAL_COLORS = [
  ['9005', '#0E0E10', 'Սև', 'Чёрный янтарь', 'Jet black'],
  ['9011', '#27292B', 'Գրաֆիտե սև', 'Графитовый чёрный', 'Graphite black'],
  ['7016', '#383E42', 'Անտրացիտ', 'Антрацитово-серый', 'Anthracite grey'],
  ['7024', '#45494E', 'Գրաֆիտ', 'Графитовый серый', 'Graphite grey'],
  ['7012', '#575D5E', 'Բազալտ', 'Базальтово-серый', 'Basalt grey'],
  ['7001', '#8A9597', 'Արծաթամոխրագույն', 'Серебристо-серый', 'Silver grey'],
  ['7040', '#9AA0A7', 'Պատուհանի մոխրագույն', 'Серый окно', 'Window grey'],
  ['7035', '#CBD0CC', 'Բաց մոխրագույն', 'Светло-серый', 'Light grey'],
  ['9006', '#A1A1A0', 'Սպիտակ ալյումին', 'Бело-алюминиевый', 'White aluminium'],
  [
    '9007',
    '#878581',
    'Մոխրագույն ալյումին',
    'Серый алюминий',
    'Grey aluminium',
  ],
  ['9016', '#F1F0EA', 'Սպիտակ', 'Транспортный белый', 'Traffic white'],
  ['9010', '#F1ECE1', 'Մաքուր սպիտակ', 'Чистый белый', 'Pure white'],
  [
    '9003',
    '#ECECE7',
    'Ազդանշանային սպիտակ',
    'Сигнальный белый',
    'Signal white',
  ],
  ['9001', '#E9E0D2', 'Կրեմագույն', 'Кремовый', 'Cream'],
  ['1015', '#E6D2B5', 'Բաց փղոսկր', 'Светлая слоновая кость', 'Light ivory'],
  ['1013', '#E3D9C6', 'Մարգարտյա սպիտակ', 'Жемчужно-белый', 'Oyster white'],
  ['1018', '#FACA30', 'Ցինկի դեղին', 'Цинково-жёлтый', 'Zinc yellow'],
  ['1023', '#F7B500', 'Դեղին', 'Транспортный жёлтый', 'Traffic yellow'],
  ['1021', '#F6B600', 'Ռապսի դեղին', 'Рапсово-жёлтый', 'Colza yellow'],
  ['2004', '#E25303', 'Նարնջագույն', 'Чистый оранжевый', 'Pure orange'],
  ['3000', '#AB2524', 'Կրակե կարմիր', 'Огненно-красный', 'Flame red'],
  ['3020', '#C1121C', 'Կարմիր', 'Транспортный красный', 'Traffic red'],
  ['3003', '#8D1D2C', 'Սուտակե կարմիր', 'Рубиново-красный', 'Ruby red'],
  ['3005', '#5E2028', 'Գինեգույն', 'Винно-красный', 'Wine red'],
  [
    '5002',
    '#00387B',
    'Ուլտրամարին',
    'Ультрамариново-синий',
    'Ultramarine blue',
  ],
  [
    '5005',
    '#005387',
    'Ազդանշանային կապույտ',
    'Сигнальный синий',
    'Signal blue',
  ],
  ['5010', '#004F7C', 'Մուգ կապույտ', 'Горечавково-синий', 'Gentian blue'],
  ['5017', '#005B8C', 'Կապույտ', 'Транспортный синий', 'Traffic blue'],
  ['5015', '#007CB0', 'Երկնագույն', 'Небесно-синий', 'Sky blue'],
  ['5012', '#0089B6', 'Բաց կապույտ', 'Голубой', 'Light blue'],
  ['6005', '#0F4336', 'Մամռի կանաչ', 'Зелёный мох', 'Moss green'],
  ['6009', '#27352A', 'Եղևնու կանաչ', 'Пихтовый зелёный', 'Fir green'],
  ['6029', '#006F3D', 'Անանուխի կանաչ', 'Мятно-зелёный', 'Mint green'],
  ['6018', '#48A43F', 'Դեղնականաչ', 'Жёлто-зелёный', 'Yellow green'],
  [
    '8017',
    '#44322D',
    'Շոկոլադագույն',
    'Шоколадно-коричневый',
    'Chocolate brown',
  ],
  ['8011', '#5A3826', 'Ընկուզագույն', 'Орехово-коричневый', 'Nut brown'],
].map(([code, hex, hy, ru, en]) => ({ code, hex, names: { hy, ru, en } }))

// "9005", "ral9005" and "RAL 9005" all name RAL 9005.
export function ralCode(value) {
  const match = String(value || '').match(/(\d{4})/)
  return match ? match[1] : ''
}

export function ralColor(value) {
  const code = ralCode(value)
  return RAL_COLORS.find((color) => color.code === code) || null
}

export function ralName(color, locale) {
  if (!color) return ''
  const lang = String(locale || 'hy').split('-')[0]
  return color.names[lang] || color.names.hy
}

// Dark paint needs light lines on top of it, and the other way round.
export function isDark(hex) {
  const value = parseInt(String(hex || '').replace('#', ''), 16)
  if (Number.isNaN(value)) return false
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b < 128
}
