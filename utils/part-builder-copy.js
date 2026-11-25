// Texts of the builder's own steps around the templates: the material chosen
// first, patterns, powder coating and the views. No imports: tests load this
// file directly.

const copy = {
  hy: {
    steps: { material: 'Նյութ', shape: 'Ձև', details: 'Չափեր և հարդարում' },
    material: {
      title: 'Ընտրեք նյութը',
      lead: 'Սկսեք նյութից․ թիթեղի հաստությունից են կախված կռումը, ուզոռի ամենափոքր անցքն ու կամրջակները։',
      name: 'Նյութ',
      thickness: 'Հաստություն, մմ',
      other: 'Այլ նյութ',
      otherLead: 'Ցանկում չկա՞․ գրեք նյութը և հաստությունը։',
      placeholder: 'Օր.՝ Սև պողպատ St37',
      next: 'Շարունակել',
      change: 'Փոխել',
    },
    blank: 'Սկսել զրոյից',
    patterns: {
      title: 'Ուզոռ',
      lead: 'Ավելացրեք ուզոռ, քաշեք այն նախադիտման վրա՝ տեղաշարժելու համար, իսկ կլոր բռնակով պտտեք։',
      add: 'Ավելացնել ուզոռ',
      kinds: {
        circles: 'Շրջաններ',
        staggered: 'Շրջաններ շախմատաձև',
        hexagons: 'Վեցանկյուններ',
        squares: 'Քառակուսիներ',
        diamonds: 'Շեղանկյուններ',
        slots: 'Ակոսներ',
        triangles: 'Եռանկյուններ',
        crosses: 'Խաչեր',
        stars: 'Աստղեր',
      },
      kind: 'Տեսակ',
      area: 'Տարածք',
      rect: 'Ուղղանկյուն',
      circle: 'Շրջան',
      width: 'Լայնություն',
      height: 'Բարձրություն',
      diameter: 'Տրամագիծ',
      size: 'Անցքի չափ',
      gap: 'Կամրջակ',
      angle: 'Պտույտ',
      cx: 'Կենտրոն X',
      cy: 'Կենտրոն Y',
      center: 'Կենտրոնացնել',
      remove: 'Հեռացնել',
      count: (n) => `${n} անցք`,
      problems: {
        patternEmpty:
          'Ուզոռի ոչ մի անցք չի տեղավորվում։ Տեղաշարժեք կամ մեծացրեք տարածքը, կամ փոքրացրեք անցքը։',
        patternSmall: (min) =>
          `Ուզոռի անցքը պետք է լինի առնվազն ${min} մմ՝ ոչ փոքր, քան թիթեղի հաստությունը։`,
        patternBridge: (min) =>
          `Կամրջակը պետք է լինի առնվազն ${min} մմ, այլապես մետաղը կթուլանա կամ կայրվի։`,
      },
      note: (n, kind, d) =>
        `Ուզոռ ${n}՝ ${kind}, անցք ${d.size} մմ, կամրջակ ${d.gap} մմ, տարածք ${d.area} մմ, կենտրոն (${d.cx}; ${d.cy}) մմ, պտույտ ${d.angle}°, ${d.count} անցք։`,
    },
    paint: {
      title: 'Փոշեներկ',
      on: 'Ներկել փոշեներկով',
      color: 'Գույն (RAL)',
      custom: 'Այլ RAL կոդ',
      primer: 'Գրունտ ներկելուց առաջ',
      approx:
        'Էկրանին գույնը մոտավոր է․ իրական գույնը տեսնելու համար խնդրեք նմուշ։',
      unknown: 'Այս կոդի գույնը ցանկում չկա, բայց կներկենք նշված կոդով։',
    },
    bend: {
      title: 'Կռում',
      lead: 'Նշեք թևերի միջև անկյունը․ 90°-ը ուղիղ անկյունն է, 170°-ը՝ թեթև կռումը։',
    },
    view: {
      flat: 'Գծագիր',
      solid: '3D տեսք',
      hint: 'Պտտեք մկնիկով, մոտեցրեք անիվով։',
      unavailable: 'Ձեր դիտարկիչը չի կարող ցույց տալ 3D տեսքը։',
      tooMany: (n) => `3D տեսքը հասանելի է մինչև ${n} անցքով դետալների համար։`,
    },
  },
  ru: {
    steps: {
      material: 'Материал',
      shape: 'Форма',
      details: 'Размеры и отделка',
    },
    material: {
      title: 'Выберите материал',
      lead: 'Начните с материала: от толщины листа зависят гибка, самое маленькое отверстие узора и перемычки.',
      name: 'Материал',
      thickness: 'Толщина, мм',
      other: 'Другой материал',
      otherLead: 'Нет в списке? Укажите материал и толщину.',
      placeholder: 'Напр.: Сталь St37',
      next: 'Продолжить',
      change: 'Изменить',
    },
    blank: 'Начать с нуля',
    patterns: {
      title: 'Узор',
      lead: 'Добавьте узор, перетащите его на предпросмотре, чтобы сдвинуть, и поверните круглой ручкой.',
      add: 'Добавить узор',
      kinds: {
        circles: 'Круги',
        staggered: 'Круги в шахматном порядке',
        hexagons: 'Шестиугольники',
        squares: 'Квадраты',
        diamonds: 'Ромбы',
        slots: 'Пазы',
        triangles: 'Треугольники',
        crosses: 'Кресты',
        stars: 'Звёзды',
      },
      kind: 'Вид',
      area: 'Область',
      rect: 'Прямоугольник',
      circle: 'Круг',
      width: 'Ширина',
      height: 'Высота',
      diameter: 'Диаметр',
      size: 'Размер отверстия',
      gap: 'Перемычка',
      angle: 'Поворот',
      cx: 'Центр X',
      cy: 'Центр Y',
      center: 'По центру',
      remove: 'Удалить',
      count: (n) => `${n} отв.`,
      problems: {
        patternEmpty:
          'Ни одно отверстие узора не помещается. Сдвиньте или увеличьте область или уменьшите отверстие.',
        patternSmall: (min) =>
          `Отверстие узора должно быть не меньше ${min} мм — не меньше толщины листа.`,
        patternBridge: (min) =>
          `Перемычка должна быть не меньше ${min} мм, иначе металл ослабнет или прогорит.`,
      },
      note: (n, kind, d) =>
        `Узор ${n}: ${kind}, отверстие ${d.size} мм, перемычка ${d.gap} мм, область ${d.area} мм, центр (${d.cx}; ${d.cy}) мм, поворот ${d.angle}°, ${d.count} отв.`,
    },
    paint: {
      title: 'Порошковая покраска',
      on: 'Покрасить порошковой краской',
      color: 'Цвет (RAL)',
      custom: 'Другой код RAL',
      primer: 'Грунт перед покраской',
      approx:
        'Цвет на экране приблизительный: чтобы увидеть настоящий, попросите образец.',
      unknown: 'Этого цвета нет в списке, но покрасим по указанному коду.',
    },
    bend: {
      title: 'Гибка',
      lead: 'Укажите угол между полками: 90° — прямой угол, 170° — лёгкий изгиб.',
    },
    view: {
      flat: 'Чертёж',
      solid: '3D',
      hint: 'Вращайте мышью, приближайте колесом.',
      unavailable: 'Ваш браузер не может показать 3D.',
      tooMany: (n) =>
        `3D доступно для деталей не больше чем с ${n} отверстиями.`,
    },
  },
  en: {
    steps: { material: 'Material', shape: 'Shape', details: 'Size and finish' },
    material: {
      title: 'Choose the material',
      lead: "Start with the material: the sheet's thickness sets the bends, the smallest pattern hole and the bridges.",
      name: 'Material',
      thickness: 'Thickness, mm',
      other: 'Other material',
      otherLead: 'Not on the list? Enter the material and thickness.',
      placeholder: 'E.g. St37 steel',
      next: 'Continue',
      change: 'Change',
    },
    blank: 'Start from scratch',
    patterns: {
      title: 'Pattern',
      lead: 'Add a pattern, drag it on the preview to move it, and turn it with the round handle.',
      add: 'Add a pattern',
      kinds: {
        circles: 'Circles',
        staggered: 'Staggered circles',
        hexagons: 'Hexagons',
        squares: 'Squares',
        diamonds: 'Diamonds',
        slots: 'Slots',
        triangles: 'Triangles',
        crosses: 'Crosses',
        stars: 'Stars',
      },
      kind: 'Kind',
      area: 'Area',
      rect: 'Rectangle',
      circle: 'Circle',
      width: 'Width',
      height: 'Height',
      diameter: 'Diameter',
      size: 'Hole size',
      gap: 'Bridge',
      angle: 'Rotation',
      cx: 'Centre X',
      cy: 'Centre Y',
      center: 'Centre it',
      remove: 'Remove',
      count: (n) => `${n} holes`,
      problems: {
        patternEmpty:
          'No hole of the pattern fits. Move or enlarge the area, or make the holes smaller.',
        patternSmall: (min) =>
          `Pattern holes must be at least ${min} mm, no smaller than the sheet thickness.`,
        patternBridge: (min) =>
          `Bridges must be at least ${min} mm, or the metal weakens or burns through.`,
      },
      note: (n, kind, d) =>
        `Pattern ${n}: ${kind}, hole ${d.size} mm, bridge ${d.gap} mm, area ${d.area} mm, centre (${d.cx}; ${d.cy}) mm, rotation ${d.angle}°, ${d.count} holes.`,
    },
    paint: {
      title: 'Powder coating',
      on: 'Powder coat it',
      color: 'Colour (RAL)',
      custom: 'Other RAL code',
      primer: 'Primer before painting',
      approx:
        'Screen colours are approximate: ask for a sample to see the real one.',
      unknown:
        'This colour is not on the list, but we will paint the code given.',
    },
    bend: {
      title: 'Bending',
      lead: 'Set the angle between the flanges: 90° is a right angle, 170° a slight bend.',
    },
    view: {
      flat: 'Drawing',
      solid: '3D view',
      hint: 'Drag to turn it, scroll to zoom.',
      unavailable: 'Your browser cannot show the 3D view.',
      tooMany: (n) => `The 3D view is for parts with up to ${n} holes.`,
    },
  },
}

export function builderCopy(locale) {
  return copy[String(locale || 'hy').split('-')[0]] || copy.hy
}
