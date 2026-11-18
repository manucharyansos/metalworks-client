// The colour (RAL) and primer request of a powder-coating job.
const copy = {
  hy: {
    colour: 'RAL գույն',
    placeholder: 'Օր․՝ RAL 9005',
    primer: 'Գրունտ՝ ներկելուց առաջ',
    save: 'Պահպանել գույնը',
    saved: 'Գույնը պահպանված է',
    failed: 'Չհաջողվեց պահպանել գույնը։',
    title: 'Ներկում',
    noPrimer: 'առանց գրունտի',
  },
  ru: {
    colour: 'Цвет RAL',
    placeholder: 'Напр.: RAL 9005',
    primer: 'Грунт перед покраской',
    save: 'Сохранить цвет',
    saved: 'Цвет сохранён',
    failed: 'Не удалось сохранить цвет.',
    title: 'Покраска',
    noPrimer: 'без грунта',
  },
  en: {
    colour: 'RAL colour',
    placeholder: 'e.g. RAL 9005',
    primer: 'Primer before painting',
    save: 'Save colour',
    saved: 'Colour saved',
    failed: 'Could not save the colour.',
    title: 'Painting',
    noPrimer: 'no primer',
  },
}

export function paintCopy(locale) {
  return copy[String(locale || 'hy').split('-')[0]] || copy.hy
}
