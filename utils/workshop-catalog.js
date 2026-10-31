import { isReferenceFactory } from '@/utils/task-workflow'

export const catalogCopy = {
  hy: {
    workshops: 'Արտադրամասեր',
    categories: 'Ֆայլերի բաժիններ',
    name: 'Անվանում',
    add: 'Ավելացնել',
    save: 'Պահպանել',
    cancel: 'Չեղարկել',
    edit: 'Խմբագրել',
    delete: 'Ջնջել',
    deleted: 'Բաժինը ջնջված է',
    archive: 'Արխիվացնել',
    restore: 'Վերականգնել',
    archived: 'Արխիվացված',
    active: 'Գործող',
    loading: 'Բեռնվում է…',
    retry: 'Կրկին փորձել',
    open: 'Բացել առաջադրանքները',
    workshopHelp:
      'Ընտրված ընկերության իրական արտադրամասերը։ Հաստիքներն ու ֆայլերի բաժինները կառավարվում են առանձին։',
    categoryHelp:
      'Ֆայլի բաժինն ու ձևաչափը չեն սահմանափակում դրա օգտագործումը։ Նույն ֆայլը կարող եք կցել մի քանի արտադրամասի։',
    empty: 'Ցանկը դատարկ է։',
    reference: 'Տեղեկատու ֆայլեր',
    defaultWorkshop: 'Լռելյայն արտադրամաս',
    none: 'Ընտրել առաջադրանքի ժամանակ',
    extensions: 'Թույլատրելի ձևաչափեր՝ ստորակետերով',
    extensionHelp:
      'Օրինակ՝ pdf, dxf, jpg։ *՝ բոլոր անվտանգ ձևաչափերը։ Դատարկ ցանկը փակում է նոր վերբեռնումները։',
    saved: 'Պահպանված է',
    failed: 'Չհաջողվեց բեռնել տվյալները։',
    routing: 'Ֆայլերի արտադրամասերը',
    routingHelp:
      'Նշեք՝ որ արտադրամասում պետք է օգտագործվի յուրաքանչյուր աշխատանքային ֆայլը։ Նույն ֆայլը կարելի է կցել մի քանի արտադրամասի։',
    noRouting: 'Ընտրեք առնվազն մեկ աշխատանքային ֆայլի արտադրամասը։',
    unassignedFile: 'Արտադրամասին կցված չէ',
    sections: 'Ընտրեք ֆայլերի բաժինը',
    archivedHelp:
      'Այս բաժինը արխիվացված է։ Առկա ֆայլերը հասանելի են դիտման համար։',
    functions:
      'Ֆունկցիաներ',
    functionsHelp:
      'Լրացուցիչ աշխատանքներ (փորագրում, մաքրում, պարուրակ…)։ Ինժեները դրանք նշում է ֆայլ ավելացնելիս, օպերատորը տեսնում է առաջադրանքում։',
    functionPlaceholder:
      'Օր․՝ Փորագրում',
    noFunctions:
      'Ֆունկցիաներ դեռ չկան։',
    functionArchivedHint:
      'Արխիվացված ֆունկցիան նոր ֆայլերի համար չի առաջարկվում։',
  },
  ru: {
    workshops: 'Цеха',
    categories: 'Разделы файлов',
    name: 'Название',
    add: 'Добавить',
    save: 'Сохранить',
    cancel: 'Отмена',
    edit: 'Изменить',
    delete: 'Удалить',
    deleted: 'Раздел удалён',
    archive: 'Архивировать',
    restore: 'Восстановить',
    archived: 'В архиве',
    active: 'Активный',
    loading: 'Загрузка…',
    retry: 'Повторить',
    open: 'Открыть задания',
    workshopHelp:
      'Реальные цеха выбранной компании. Должности и разделы файлов управляются отдельно.',
    categoryHelp:
      'Раздел и формат файла не ограничивают его использование. Один файл можно назначить нескольким цехам.',
    empty: 'Список пуст.',
    reference: 'Справочные файлы',
    defaultWorkshop: 'Цех по умолчанию',
    none: 'Выбрать при создании задания',
    extensions: 'Допустимые форматы через запятую',
    extensionHelp:
      'Например: pdf, dxf, jpg. * — все безопасные форматы. Пустой список запрещает новые загрузки.',
    saved: 'Сохранено',
    failed: 'Не удалось загрузить данные.',
    routing: 'Цеха для файлов',
    routingHelp:
      'Отметьте цеха, в которых нужен каждый рабочий файл. Один файл можно назначить нескольким цехам.',
    noRouting: 'Выберите цех хотя бы для одного рабочего файла.',
    unassignedFile: 'Не назначен цеху',
    sections: 'Выберите раздел файлов',
    archivedHelp: 'Раздел в архиве. Существующие файлы доступны для просмотра.',
    functions:
      'Функции',
    functionsHelp:
      'Дополнительные работы (гравировка, зачистка, резьба…). Инженер отмечает их при добавлении файла, оператор видит их в задании.',
    functionPlaceholder:
      'Напр.: гравировка',
    noFunctions:
      'Функций пока нет.',
    functionArchivedHint:
      'Архивная функция не предлагается для новых файлов.',
  },
  en: {
    workshops: 'Workshops',
    categories: 'File sections',
    name: 'Name',
    add: 'Add',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    deleted: 'Section deleted',
    archive: 'Archive',
    restore: 'Restore',
    archived: 'Archived',
    active: 'Active',
    loading: 'Loading…',
    retry: 'Retry',
    open: 'Open tasks',
    workshopHelp:
      'Real workshops in the selected company. Positions and file sections are managed separately.',
    categoryHelp:
      'A file’s section and format do not restrict its use. The same file can be assigned to several workshops.',
    empty: 'The list is empty.',
    reference: 'Reference files',
    defaultWorkshop: 'Default workshop',
    none: 'Choose when creating a task',
    extensions: 'Allowed formats, comma-separated',
    extensionHelp:
      'For example: pdf, dxf, jpg. * allows all safe formats. An empty list prevents new uploads.',
    saved: 'Saved',
    failed: 'Could not load the data.',
    routing: 'Workshops for files',
    routingHelp:
      'Select which workshops need each working file. The same file can be assigned to several workshops.',
    noRouting: 'Choose a workshop for at least one working file.',
    unassignedFile: 'Not assigned to a workshop',
    sections: 'Choose a file section',
    archivedHelp:
      'This section is archived. Existing files remain available to view.',
    functions:
      'Functions',
    functionsHelp:
      'Extra work (engraving, deburring, threading…). Engineers tick it when adding a file; operators see it in the task.',
    functionPlaceholder:
      'e.g. Engraving',
    noFunctions:
      'No functions yet.',
    functionArchivedHint:
      'Archived functions are not offered for new files.',
  },
}
export function catalogText(locale) {
  return catalogCopy[String(locale || 'hy').split('-')[0]] || catalogCopy.hy
}
export function isProductionWorkshop(factory) {
  return (
    factory &&
    factory.is_workshop !== false &&
    !isReferenceFactory(factory) &&
    !['SW', 'INFO', 'PDF'].includes(
      String(factory.value || '')
        .trim()
        .toUpperCase()
    )
  )
}
export function isWorkshop(factory) {
  return isProductionWorkshop(factory) && factory.is_active !== false
}
export function isReferenceFile(file, factories = []) {
  if (typeof file?.is_reference_file === 'boolean')
    return file.is_reference_file
  if (file?.category) return Boolean(file.category.is_reference)
  return isReferenceFactory(
    factories.find((factory) => String(factory.id) === String(file?.factory_id))
  )
}
export function fileDestinations(file, factories, overrides = {}) {
  const chosen = Object.prototype.hasOwnProperty.call(overrides, file.id)
    ? overrides[file.id]
    : Array.isArray(file.routing_factory_ids)
    ? file.routing_factory_ids
    : [
        file.routing_factory_id === undefined
          ? file.factory_id
          : file.routing_factory_id,
      ]
  return [...new Set((chosen || []).map(Number))].filter((id) =>
    factories.some(
      (factory) => Number(factory.id) === id && isWorkshop(factory)
    )
  )
}
export function fileRoutingPayload(files, factories, overrides = {}) {
  return files
    .filter((file) => !isReferenceFile(file, factories))
    .map((file) => ({
      file_id: Number(file.id),
      factory_ids: fileDestinations(file, factories, overrides),
    }))
}
export function categorySections(categories) {
  return (categories || []).map((category) => ({
    ...category,
    id: category.legacy_factory_id,
    file_category_id: category.id,
    value: category.code,
  }))
}

export function needsIndividualFileAttributes(name) {
  return /\.(dxf|ic)$/i.test(String(name || ''))
}

export function productionWorkshopOptions(factories = []) {
  const operations = {
    'laser-sheets': 'cutting',
    'laser-tubes': 'cutting',
    laser: 'cutting',
    bend: 'bending',
    welding: 'welding',
    rolling: 'rolling',
    powder: 'powder',
  }
  const rank = (factory) =>
    ['cutting', 'bending', 'welding', 'rolling', 'powder', 'other'].indexOf(
      operations[workshopKind(factory)] || 'other'
    )
  return (Array.isArray(factories) ? factories : [])
    .filter(isWorkshop)
    .map((factory) => ({
      ...factory,
      operation: operations[workshopKind(factory)] || 'other',
    }))
    .sort((a, b) => rank(a) - rank(b) || Number(a.id) - Number(b.id))
}

// Stable production identities are independent of file categories (DXF/IGS).
export function workshopKind(factory) {
  if (!isProductionWorkshop(factory)) return null
  const value = String(factory.value || '')
    .trim()
    .toUpperCase()
  const byCode = {
    DXF: 'laser-sheets',
    IQS: 'laser-tubes',
    DLD: 'bend',
    BEND: 'bend',
    WELD: 'welding',
    WELDING: 'welding',
    ROLL: 'rolling',
    ROLLING: 'rolling',
    POWDER: 'powder',
    POWDER_CATTING: 'powder',
    PAINT: 'powder',
    LASER_SHEETS: 'laser-sheets',
    LASER_TUBES: 'laser-tubes',
  }
  if (byCode[value]) return byCode[value]
  const name = String(factory.name || '').toLowerCase()
  if (/laser|լազեր|лазер|cutting/.test(name)) {
    if (/tube|pipe|խողովակ|труб/.test(name)) return 'laser-tubes'
    if (/sheet|լիստ|թիթեղ|лист/.test(name)) return 'laser-sheets'
    return 'laser'
  }
  if (/bend|ճկ|կռ|гиб/.test(name)) return 'bend'
  if (/weld|զոդ|свар/.test(name)) return 'welding'
  if (/roll|վալց|вальц/.test(name)) return 'rolling'
  if (/powder|փոշե|порош/.test(name)) return 'powder'
  return value === 'LASER' ? 'laser' : null
}

export function workshopPage(factory, scope = 'manager') {
  const detected = workshopKind(factory)
  const kind = scope === 'admin' && detected === 'laser' ? null : detected
  const prefix = scope === 'factory' ? '/factory' : `/${scope}/factories`
  return {
    path: `${prefix}/${kind || 'workspace'}`,
    ...(scope === 'factory'
      ? {}
      : { query: { factory_id: String(factory.id) } }),
  }
}

export const workshopPageKinds = [
  'laser-sheets',
  'laser-tubes',
  'bend',
  'welding',
  'rolling',
  'powder',
]
