// Texts of the workshop task boards (laser and the other production boards).
export const factoryBoardCopy = {
  hy: {
    title: 'Արտադրական առաջադրանքներ',
    all: 'Բոլորը',
    status: 'Կարգավիճակ',
    search: 'Որոնել համարով, անունով կամ կոդով',
    clear: 'Մաքրել ֆիլտրերը',
    empty: 'Առաջադրանքներ դեռ չկան։',
    emptyHelp:
      'Նոր աշխատանքները կհայտնվեն այստեղ, երբ ինժեները դրանք ուղարկի ձեր արտադրամաս։',
    noResults: 'Ընտրված ֆիլտրերով առաջադրանք չկա։',
    loading: 'Առաջադրանքները բեռնվում են…',
    loadFailed: 'Չհաջողվեց բեռնել առաջադրանքները։',
    retry: 'Կրկին փորձել',
    dropHere: 'Քաշեք առաջադրանքն այստեղ',
    close: 'Փակել',
  },
  ru: {
    title: 'Производственные задания',
    all: 'Все',
    status: 'Статус',
    search: 'Поиск по номеру, названию или коду',
    clear: 'Сбросить фильтры',
    empty: 'Заданий пока нет.',
    emptyHelp:
      'Новые работы появятся здесь, когда инженер отправит их в ваш цех.',
    noResults: 'Нет заданий по выбранным фильтрам.',
    loading: 'Загрузка заданий…',
    loadFailed: 'Не удалось загрузить задания.',
    retry: 'Повторить',
    dropHere: 'Перетащите задание сюда',
    close: 'Закрыть',
  },
  en: {
    title: 'Production tasks',
    all: 'All',
    status: 'Status',
    search: 'Search by number, name or code',
    clear: 'Clear filters',
    empty: 'No tasks yet.',
    emptyHelp:
      'New work appears here once an engineer sends it to your workshop.',
    noResults: 'No tasks match the selected filters.',
    loading: 'Loading tasks…',
    loadFailed: 'Could not load tasks.',
    retry: 'Try again',
    dropHere: 'Drag a task here',
    close: 'Close',
  },
}

// Board columns use the same colours as the engineer task list.
const COLUMN_TONES = {
  no_status: 'created',
  accepted: 'accepted',
  confirmed: 'in_progress',
  canceled: 'rejected',
}

export function columnTone(column) {
  return COLUMN_TONES[column?.id] || 'created'
}

// Short column titles ("Created", not "Created tasks"); other statuses keep
// the label the API gave them.
export function columnLabel(column, board) {
  const key = {
    no_status: 'shortCreated',
    accepted: 'shortAccepted',
    confirmed: 'in_progress',
    canceled: 'shortRejected',
  }[column?.id]
  return (key && board?.[key]) || column?.label || ''
}
