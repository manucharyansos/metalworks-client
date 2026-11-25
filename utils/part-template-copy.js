// Texts of the template part builder (template names, dimensions, problems)
// and the helpers that turn a configured template into a request part: its
// file name and the note the engineer reads. Imports only part-templates, so
// tests load this file directly.
import { ANGLES, COUNTS } from '@/utils/part-templates'

const copy = {
  hy: {
    title: 'Դետալ ձևանմուշից',
    lead: 'Ընտրեք պատրաստի ձև և մուտքագրեք չափերը։ DXF գծագիրը կստեղծվի ավտոմատ, իսկ գինը կհաշվվի անմիջապես՝ ինչպես վերբեռնված գծագրի դեպքում։',
    search: 'Որոնել ձևանմուշ',
    nothing: 'Այդպիսի ձևանմուշ չգտնվեց։',
    back: 'Բոլոր ձևանմուշները',
    close: 'Փակել',
    dimensions: 'Չափեր',
    mm: 'մմ',
    quantity: 'Քանակ',
    preview: 'Նախադիտում',
    flat: 'Հարթ բացվածք',
    profile: 'Ծռված տեսք',
    bentNote: (t, angle) =>
      `Բացվածքը հաշվարկված է ${t} մմ հաստության և թևերի միջև ${angle}° անկյան համար։ Նյութ ընտրելիս ընտրեք նույն հաստությունը։ Ինժեները կստուգի բացվածքը արտադրությունից առաջ։`,
    metrics: {
      size: 'Չափսեր',
      cut: 'Կտրում',
      pierces: 'Ծակումներ',
      bends: 'Ծռումներ',
      area: 'Մակերես',
    },
    add: 'Ավելացնել հայտին',
    added: 'Դետալն ավելացվեց հայտին։ Ընտրեք նյութը՝ գինը տեսնելու համար։',
    noDrawing: 'Գծագիր չունե՞ք',
    noDrawingLead:
      'Ընտրեք պատրաստի ձևանմուշ և մուտքագրեք չափերը, կամ վերբեռնեք ձեռքով արված էսքիզի լուսանկարը՝ չափերով, և ինժեները կգծի այն։',
    open: 'Բոլոր ձևանմուշները',
    sketch: 'Վերբեռնել էսքիզ',
    count: (n) => `${n} ձևանմուշ`,
    note: (name, list) => `Ձևանմուշ «${name}»։ ${list}։`,
    sep: '՝ ',
    flatSize: 'Բացվածք',
    categories: {
      all: 'Բոլորը',
      plates: 'Թիթեղներ',
      flanges: 'Ֆլանցներ և տափօղակներ',
      brackets: 'Կրոնշտեյններ և շերտեր',
      bent: 'Ծռվող դետալներ',
      gears: 'Ատամնանիվներ',
      shapes: 'Ձևեր',
    },
    templates: {
      blank: ['Դատարկ թիթեղ', 'Սկսեք զրոյից՝ ընտրեք չափերը և ավելացրեք ուզոռ'],
      'rect-plate': [
        'Ուղղանկյուն թիթեղ',
        'Անկյուններում 4 անցք, ըստ ցանկության՝ կլորացված անկյուններ',
      ],
      'center-hole-plate': [
        'Կենտրոնական անցքով թիթեղ',
        'Մեծ անցք կենտրոնում և 4 անցք անկյուններում',
      ],
      'base-plate': ['Հենման թիթեղ', 'Խարսխային բոլտերի անցքեր կամ ակոսներ'],
      'perforated-plate': ['Ծակոտկեն թիթեղ', 'Անցքերի հավասարաչափ ցանց'],
      frame: ['Շրջանակ', 'Ուղղանկյուն բացվածքով թիթեղ'],
      'round-flange': ['Կլոր ֆլանց', 'Պտուտակների անցքեր շրջանագծով'],
      'square-flange': ['Քառակուսի ֆլանց', 'Կենտրոնական անցք և 4 պտուտակ'],
      washer: ['Տափօղակ', 'Ցանկացած չափի օղակ'],
      disc: ['Սկավառակ', 'Կլոր դետալ՝ ըստ ցանկության կենտրոնական անցքով'],
      link: ['Կապող շերտ', 'Կլոր ծայրեր, հավասար քայլով անցքեր'],
      strip: ['Անցքերով շերտ', 'Ուղիղ շերտ՝ հավասարաչափ անցքերով'],
      lug: ['Ականջիկ', 'Կլոր գագաթով թիթեղ՝ անցքով'],
      gusset: ['Կոշտության եռանկյուն', 'Կոսինկա՝ կտրված սուր անկյուններով'],
      'l-plate': ['L-աձև թիթեղ', 'Հարթ անկյունային դետալ'],
      'bent-l': ['Ծռված անկյունակ', 'L պրոֆիլ՝ մեկ ծռում 90°'],
      'bent-u': ['U-պրոֆիլ', 'Երկու ծռում 90°'],
      gear: ['Ատամնանիվ', 'Էվոլվենտային ատամներ, 20° անկյուն'],
      polygon: ['Կանոնավոր բազմանկյուն', 'Եռանկյունուց մինչև 16 կող'],
      ellipse: ['Էլիպս', 'Օվալ'],
      trapezoid: ['Սեղանաձև թիթեղ', 'Զուգահեռ վերին և ստորին հիմքեր'],
      star: ['Աստղ', '3-ից 24 ծայր'],
      arch: ['Կամար', 'Կիսաշրջան գագաթով ուղղանկյուն'],
    },
    params: {
      width: 'Լայնություն',
      height: 'Բարձրություն',
      radius: 'Անկյունների շառավիղ',
      holeD: 'Անցքի տրամագիծ',
      inset: 'Անցքի կենտրոնը եզրից',
      centerD: 'Կենտրոնական անցքի տրամագիծ',
      slot: 'Ակոսի երկարություն',
      pitch: 'Անցքերի քայլ',
      margin: 'Դաշտ եզրից',
      border: 'Շրջանակի լայնություն',
      outerD: 'Արտաքին տրամագիծ',
      innerD: 'Ներքին տրամագիծ',
      pcd: 'Պտուտակների շրջանագծի տրամագիծ',
      bolts: 'Պտուտակների քանակ',
      boltD: 'Պտուտակի անցքի տրամագիծ',
      size: 'Կողմի երկարություն',
      diameter: 'Տրամագիծ',
      length: 'Երկարություն',
      holes: 'Անցքերի քանակ',
      offset: 'Եզրային անցքը ծայրից',
      legA: 'Ա թև',
      legB: 'Բ թև',
      chamfer: 'Անկյունների կտրվածք',
      leg: 'Թևի լայնություն',
      thickness: 'Մետաղի հաստություն',
      angle: 'Անկյուն թևերի միջև',
      base: 'Հիմք (արտաքին)',
      side: 'Կողեր (արտաքին)',
      module: 'Մոդուլ',
      teeth: 'Ատամների քանակ',
      bore: 'Կենտրոնական անցք',
      sides: 'Կողմերի քանակ',
      points: 'Ծայրերի քանակ',
      top: 'Վերին հիմք',
      bottom: 'Ստորին հիմք',
    },
    overrides: {
      lug: { height: 'Բարձրությունը մինչև անցքի կենտրոն' },
      polygon: { size: 'Տրամագիծը գագաթներով' },
      link: { length: 'Ընդհանուր երկարություն' },
      gusset: {
        legA: 'Հորիզոնական էջ',
        legB: 'Ուղղահայաց էջ',
        inset: 'Անցքը անկյունից',
      },
      'bent-l': {
        legA: 'Ա թև (արտաքին)',
        legB: 'Բ թև (արտաքին)',
        width: 'Լայնություն (ծռման գծով)',
      },
      'bent-u': { width: 'Լայնություն (ծռման գծով)' },
      disc: { holeD: 'Կենտրոնական անցք' },
      arch: { height: 'Ընդհանուր բարձրություն' },
    },
    zeros: {
      radius: 'սուր անկյուններ',
      holeD: 'առանց անցքերի',
      centerD: 'առանց կենտրոնական անցքի',
      slot: 'կլոր անցքեր',
      chamfer: 'առանց կտրվածքի',
      bore: 'առանց անցքի',
      innerD: 'առանց անցքի',
      top: 'եռանկյունի',
    },
    problems: {
      range: (label, min, max) => `«${label}»՝ ${min}-ից ${max}։`,
      holesFit:
        'Անցքերը չեն տեղավորվում դետալի վրա։ Փոքրացրեք անցքերը կամ մեծացրեք դետալը։',
      holesEdge:
        'Անցքերը շատ մոտ են եզրին։ Մեծացրեք հեռավորությունը եզրից կամ փոքրացրեք անցքը։',
      centerFit: 'Կենտրոնական անցքը չի տեղավորվում։',
      slotLength: 'Ակոսը պետք է երկար լինի անցքի տրամագծից։',
      pitchSmall: 'Քայլը պետք է առնվազն 2 մմ-ով մեծ լինի անցքի տրամագծից։',
      tooManyHoles:
        'Չափազանց շատ անցքեր են (առավելագույնը 2500)։ Մեծացրեք քայլը։',
      borderFit: 'Շրջանակը չափազանց լայն է այս չափերի համար։',
      innerFit: 'Ներքին անցքը պետք է փոքր լինի արտաքին չափից։',
      boltsFit: 'Պտուտակների անցքերը չեն տեղավորվում ֆլանցի վրա։',
      boltsSpacing: 'Պտուտակների անցքերը միմյանց շատ մոտ են։',
      holesWidth: 'Անցքը չափազանց մեծ է դետալի լայնության համար։',
      lengthShort: 'Երկարությունը պետք է մեծ լինի լայնությունից։',
      holesSpacing:
        'Անցքերը միմյանց շատ մոտ են։ Պակասեցրեք քանակը կամ փոքրացրեք անցքը։',
      chamferFit: 'Կտրվածքը չափազանց մեծ է։',
      legFit: 'Թևի լայնությունը պետք է փոքր լինի դետալի չափերից։',
      bendShort: 'Թևը չափազանց կարճ է այս հաստությամբ ծռելու համար։',
      holesBend:
        'Անցքը շատ մոտ է ծռման գծին և կձևախախտվի։ Փոքրացրեք անցքը կամ երկարացրեք թևը։',
      boreFit: 'Կենտրոնական անցքը չափազանց մեծ է այս ատամնանիվի համար։',
      archHeight: 'Բարձրությունը պետք է մեծ լինի լայնության կեսից։',
      sheetSize: (length, width) =>
        `Դետալը չի տեղավորվում թիթեղի վրա (առավելագույնը ${length} × ${width} մմ)։`,
    },
  },
  ru: {
    title: 'Деталь по шаблону',
    lead: 'Выберите готовую форму и введите размеры. Чертёж DXF создастся автоматически, а цена посчитается сразу — как для загруженного чертежа.',
    search: 'Поиск шаблона',
    nothing: 'Такой шаблон не найден.',
    back: 'Все шаблоны',
    close: 'Закрыть',
    dimensions: 'Размеры',
    mm: 'мм',
    quantity: 'Количество',
    preview: 'Предпросмотр',
    flat: 'Развёртка',
    profile: 'Вид после гибки',
    bentNote: (t, angle) =>
      `Развёртка рассчитана на толщину ${t} мм и угол ${angle}° между полками. Выберите материал той же толщины. Инженер проверит развёртку перед производством.`,
    metrics: {
      size: 'Размеры',
      cut: 'Резка',
      pierces: 'Врезки',
      bends: 'Гибы',
      area: 'Площадь',
    },
    add: 'Добавить в заявку',
    added: 'Деталь добавлена в заявку. Выберите материал, чтобы увидеть цену.',
    noDrawing: 'Нет чертежа?',
    noDrawingLead:
      'Выберите готовый шаблон и введите размеры или загрузите фото эскиза от руки с размерами — инженер начертит его.',
    open: 'Все шаблоны',
    sketch: 'Загрузить эскиз',
    count: (n) => `Шаблонов: ${n}`,
    note: (name, list) => `Шаблон «${name}». ${list}.`,
    sep: ': ',
    flatSize: 'Развёртка',
    categories: {
      all: 'Все',
      plates: 'Пластины',
      flanges: 'Фланцы и шайбы',
      brackets: 'Кронштейны и полосы',
      bent: 'Гнутые детали',
      gears: 'Шестерни',
      shapes: 'Фигуры',
    },
    templates: {
      blank: ['Пустой лист', 'Начните с нуля: задайте размеры и добавьте узор'],
      'rect-plate': [
        'Прямоугольная пластина',
        '4 отверстия по углам, скругление углов по желанию',
      ],
      'center-hole-plate': [
        'Пластина с центральным отверстием',
        'Большое отверстие в центре и 4 по углам',
      ],
      'base-plate': ['Опорная плита', 'Отверстия или пазы под анкерные болты'],
      'perforated-plate': [
        'Перфорированный лист',
        'Равномерная сетка отверстий',
      ],
      frame: ['Рамка', 'Пластина с прямоугольным вырезом'],
      'round-flange': ['Круглый фланец', 'Отверстия под болты по окружности'],
      'square-flange': ['Квадратный фланец', 'Центральное отверстие и 4 болта'],
      washer: ['Шайба', 'Кольцо любого размера'],
      disc: ['Диск', 'Круглая деталь, по желанию с центральным отверстием'],
      link: ['Тяга', 'Скруглённые концы, отверстия с равным шагом'],
      strip: [
        'Полоса с отверстиями',
        'Прямая полоса с равномерными отверстиями',
      ],
      lug: ['Проушина', 'Пластина со скруглённым верхом и отверстием'],
      gusset: ['Косынка', 'Треугольник жёсткости со срезанными углами'],
      'l-plate': ['Г-образная пластина', 'Плоская угловая деталь'],
      'bent-l': ['Гнутый уголок', 'Г-профиль, один гиб 90°'],
      'bent-u': ['П-профиль', 'Два гиба 90°'],
      gear: ['Шестерня', 'Эвольвентные зубья, угол 20°'],
      polygon: ['Правильный многоугольник', 'От треугольника до 16 сторон'],
      ellipse: ['Эллипс', 'Овал'],
      trapezoid: ['Трапеция', 'Параллельные верхнее и нижнее основания'],
      star: ['Звезда', 'От 3 до 24 лучей'],
      arch: ['Арка', 'Прямоугольник с полукруглым верхом'],
    },
    params: {
      width: 'Ширина',
      height: 'Высота',
      radius: 'Радиус углов',
      holeD: 'Диаметр отверстий',
      inset: 'Центр отверстия от края',
      centerD: 'Диаметр центрального отверстия',
      slot: 'Длина паза',
      pitch: 'Шаг отверстий',
      margin: 'Поле от края',
      border: 'Ширина рамки',
      outerD: 'Наружный диаметр',
      innerD: 'Внутренний диаметр',
      pcd: 'Диаметр окружности болтов',
      bolts: 'Количество болтов',
      boltD: 'Диаметр отверстий под болты',
      size: 'Длина стороны',
      diameter: 'Диаметр',
      length: 'Длина',
      holes: 'Количество отверстий',
      offset: 'Крайнее отверстие от торца',
      legA: 'Полка A',
      legB: 'Полка B',
      chamfer: 'Срез углов',
      leg: 'Ширина полки',
      thickness: 'Толщина металла',
      angle: 'Угол между полками',
      base: 'Основание (снаружи)',
      side: 'Боковые полки (снаружи)',
      module: 'Модуль',
      teeth: 'Число зубьев',
      bore: 'Посадочное отверстие',
      sides: 'Число сторон',
      points: 'Число лучей',
      top: 'Верхнее основание',
      bottom: 'Нижнее основание',
    },
    overrides: {
      lug: { height: 'Высота до центра отверстия' },
      polygon: { size: 'Диаметр по вершинам' },
      link: { length: 'Общая длина' },
      gusset: {
        legA: 'Горизонтальный катет',
        legB: 'Вертикальный катет',
        inset: 'Отверстие от угла',
      },
      'bent-l': {
        legA: 'Полка A (снаружи)',
        legB: 'Полка B (снаружи)',
        width: 'Ширина (вдоль гиба)',
      },
      'bent-u': { width: 'Ширина (вдоль гиба)' },
      disc: { holeD: 'Центральное отверстие' },
      arch: { height: 'Общая высота' },
    },
    zeros: {
      radius: 'острые углы',
      holeD: 'без отверстий',
      centerD: 'без центрального отверстия',
      slot: 'круглые отверстия',
      chamfer: 'без среза',
      bore: 'без отверстия',
      innerD: 'без отверстия',
      top: 'треугольник',
    },
    problems: {
      range: (label, min, max) => `«${label}»: от ${min} до ${max}.`,
      holesFit:
        'Отверстия не помещаются на детали. Уменьшите отверстия или увеличьте деталь.',
      holesEdge:
        'Отверстия слишком близко к краю. Увеличьте отступ или уменьшите отверстие.',
      centerFit: 'Центральное отверстие не помещается.',
      slotLength: 'Паз должен быть длиннее диаметра отверстия.',
      pitchSmall: 'Шаг должен быть больше диаметра отверстия хотя бы на 2 мм.',
      tooManyHoles: 'Слишком много отверстий (максимум 2500). Увеличьте шаг.',
      borderFit: 'Рамка слишком широкая для этих размеров.',
      innerFit: 'Внутреннее отверстие должно быть меньше наружного размера.',
      boltsFit: 'Отверстия под болты не помещаются на фланце.',
      boltsSpacing: 'Отверстия под болты слишком близко друг к другу.',
      holesWidth: 'Отверстие слишком большое для ширины детали.',
      lengthShort: 'Длина должна быть больше ширины.',
      holesSpacing:
        'Отверстия слишком близко друг к другу. Уменьшите количество или диаметр.',
      chamferFit: 'Срез слишком большой.',
      legFit: 'Ширина полки должна быть меньше размеров детали.',
      bendShort: 'Полка слишком короткая для гибки при этой толщине.',
      holesBend:
        'Отверстие слишком близко к линии гиба и деформируется. Уменьшите отверстие или удлините полку.',
      boreFit: 'Посадочное отверстие слишком большое для этой шестерни.',
      archHeight: 'Высота должна быть больше половины ширины.',
      sheetSize: (length, width) =>
        `Деталь не помещается на лист (максимум ${length} × ${width} мм).`,
    },
  },
  en: {
    title: 'Part from a template',
    lead: 'Pick a ready-made shape and enter its dimensions. The DXF drawing is created for you and priced right away, just like an uploaded drawing.',
    search: 'Search templates',
    nothing: 'No template matches.',
    back: 'All templates',
    close: 'Close',
    dimensions: 'Dimensions',
    mm: 'mm',
    quantity: 'Quantity',
    preview: 'Preview',
    flat: 'Flat pattern',
    profile: 'Bent view',
    bentNote: (t, angle) =>
      `The flat pattern assumes ${t} mm thickness and ${angle}° between the flanges. Choose a material of the same thickness. An engineer checks the flat pattern before production.`,
    metrics: {
      size: 'Size',
      cut: 'Cut',
      pierces: 'Pierces',
      bends: 'Bends',
      area: 'Area',
    },
    add: 'Add to request',
    added:
      'The part was added to your request. Choose a material to see the price.',
    noDrawing: 'No drawing?',
    noDrawingLead:
      'Pick a ready-made template and enter the dimensions, or upload a photo of a hand sketch with dimensions and an engineer will draw it.',
    open: 'All templates',
    sketch: 'Upload a sketch',
    count: (n) => `${n} templates`,
    note: (name, list) => `Template "${name}". ${list}.`,
    sep: ': ',
    flatSize: 'Flat pattern',
    categories: {
      all: 'All',
      plates: 'Plates',
      flanges: 'Flanges & washers',
      brackets: 'Brackets & strips',
      bent: 'Bent parts',
      gears: 'Gears',
      shapes: 'Shapes',
    },
    templates: {
      blank: [
        'Blank sheet',
        'Start from scratch: set the size and add a pattern',
      ],
      'rect-plate': [
        'Rectangular plate',
        '4 corner holes, optional rounded corners',
      ],
      'center-hole-plate': [
        'Plate with centre hole',
        'A large centre hole and 4 corner holes',
      ],
      'base-plate': ['Base plate', 'Anchor bolt holes or slots'],
      'perforated-plate': ['Perforated plate', 'An even grid of holes'],
      frame: ['Frame', 'A plate with a rectangular cut-out'],
      'round-flange': ['Round flange', 'Bolt holes on a circle'],
      'square-flange': ['Square flange', 'Centre hole and 4 bolts'],
      washer: ['Washer', 'A ring of any size'],
      disc: ['Disc', 'A round part with an optional centre hole'],
      link: ['Link', 'Round ends, evenly spaced holes'],
      strip: ['Strip with holes', 'A straight strip with evenly spaced holes'],
      lug: ['Lug', 'A round-topped plate with a hole'],
      gusset: ['Gusset', 'A stiffening triangle with clipped corners'],
      'l-plate': ['L-shaped plate', 'A flat corner piece'],
      'bent-l': ['Bent angle', 'L profile, one 90° bend'],
      'bent-u': ['U-channel', 'Two 90° bends'],
      gear: ['Spur gear', 'Involute teeth, 20° pressure angle'],
      polygon: ['Regular polygon', 'From a triangle to 16 sides'],
      ellipse: ['Ellipse', 'Oval'],
      trapezoid: ['Trapezoid', 'Parallel top and bottom'],
      star: ['Star', '3 to 24 points'],
      arch: ['Arch', 'A rectangle with a half-round top'],
    },
    params: {
      width: 'Width',
      height: 'Height',
      radius: 'Corner radius',
      holeD: 'Hole diameter',
      inset: 'Hole centre from edge',
      centerD: 'Centre hole diameter',
      slot: 'Slot length',
      pitch: 'Hole pitch',
      margin: 'Edge margin',
      border: 'Border width',
      outerD: 'Outer diameter',
      innerD: 'Inner diameter',
      pcd: 'Bolt circle diameter',
      bolts: 'Number of bolts',
      boltD: 'Bolt hole diameter',
      size: 'Side length',
      diameter: 'Diameter',
      length: 'Length',
      holes: 'Number of holes',
      offset: 'End hole from the end',
      legA: 'Leg A',
      legB: 'Leg B',
      chamfer: 'Corner chamfer',
      leg: 'Leg width',
      thickness: 'Material thickness',
      angle: 'Angle between flanges',
      base: 'Base (outside)',
      side: 'Sides (outside)',
      module: 'Module',
      teeth: 'Number of teeth',
      bore: 'Bore',
      sides: 'Number of sides',
      points: 'Number of points',
      top: 'Top width',
      bottom: 'Bottom width',
    },
    overrides: {
      lug: { height: 'Height to hole centre' },
      polygon: { size: 'Across corners' },
      link: { length: 'Overall length' },
      gusset: {
        legA: 'Horizontal leg',
        legB: 'Vertical leg',
        inset: 'Hole from corner',
      },
      'bent-l': {
        legA: 'Flange A (outside)',
        legB: 'Flange B (outside)',
        width: 'Width (along the bend)',
      },
      'bent-u': { width: 'Width (along the bend)' },
      disc: { holeD: 'Centre hole' },
      arch: { height: 'Overall height' },
    },
    zeros: {
      radius: 'sharp corners',
      holeD: 'no holes',
      centerD: 'no centre hole',
      slot: 'round holes',
      chamfer: 'no chamfer',
      bore: 'no bore',
      innerD: 'no hole',
      top: 'triangle',
    },
    problems: {
      range: (label, min, max) => `${label}: from ${min} to ${max}.`,
      holesFit:
        "The holes don't fit on the part. Make them smaller or the part larger.",
      holesEdge:
        'The holes are too close to the edge. Move them in or make them smaller.',
      centerFit: "The centre hole doesn't fit.",
      slotLength: 'The slot must be longer than the hole diameter.',
      pitchSmall: 'The pitch must exceed the hole diameter by at least 2 mm.',
      tooManyHoles: 'Too many holes (2,500 at most). Increase the pitch.',
      borderFit: 'The border is too wide for these dimensions.',
      innerFit: 'The inner hole must be smaller than the outside.',
      boltsFit: "The bolt holes don't fit on the flange.",
      boltsSpacing: 'The bolt holes are too close together.',
      holesWidth: 'The hole is too large for the width of the part.',
      lengthShort: 'The length must be greater than the width.',
      holesSpacing:
        'The holes are too close together. Use fewer or smaller holes.',
      chamferFit: 'The chamfer is too large.',
      legFit: 'The leg must be narrower than the part.',
      bendShort: 'The flange is too short to bend at this thickness.',
      holesBend:
        'The hole is too close to the bend and would distort. Make it smaller or the flange longer.',
      boreFit: 'The bore is too large for this gear.',
      archHeight: 'The height must exceed half the width.',
      sheetSize: (length, width) =>
        `The part doesn't fit on a sheet (${length} × ${width} mm at most).`,
    },
  },
}

export function templateCopy(locale) {
  return copy[String(locale || 'hy').split('-')[0]] || copy.hy
}

// Millimetres with at most one decimal: 134.597 → "134.6", 200 → "200".
export function mm(value) {
  return String(Math.round(Number(value) * 10) / 10)
}

export function paramLabel(t, template, key) {
  return t.overrides[template.id]?.[key] || t.params[key] || key
}

export function problemText(t, template, issue) {
  if (!issue) return ''
  const text = t.problems[issue.key]
  if (issue.key === 'range')
    return text(paramLabel(t, template, issue.param), issue.min, issue.max)
  if (issue.key === 'sheetSize') return text(issue.length, issue.width)
  return text || ''
}

// What the engineer reads with the part: every dimension as the customer set it.
export function partNote(t, template, values, part) {
  const list = template.params.map(([key]) => {
    const value = Number(values[key])
    const label = paramLabel(t, template, key)
    if (!value && t.zeros[key]) return `${label}${t.sep}${t.zeros[key]}`
    return `${label}${t.sep}${
      COUNTS.includes(key)
        ? Math.round(value)
        : ANGLES.includes(key)
        ? `${Math.round(value)}°`
        : `${mm(value)} ${t.mm}`
    }`
  })
  if (part.flat)
    list.push(
      `${t.flatSize}${t.sep}${mm(part.width)} × ${mm(part.height)} ${t.mm}`
    )
  return t.note(t.templates[template.id][0], list.join(', '))
}

// "Rectangular plate 200x100.dxf": the size tells parts of one template apart.
export function partFileName(t, template, part) {
  const name = t.templates[template.id][0].replace(/[\\/:*?"<>|]+/g, ' ').trim()
  return `${name} ${mm(part.width)}x${mm(part.height)}.dxf`
}
