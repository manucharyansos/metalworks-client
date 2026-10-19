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
  },
  ru: {
    workshops: 'Цеха',
    categories: 'Разделы файлов',
    name: 'Название',
    add: 'Добавить',
    save: 'Сохранить',
    cancel: 'Отмена',
    edit: 'Изменить',
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
  },
  en: {
    workshops: 'Workshops',
    categories: 'File sections',
    name: 'Name',
    add: 'Add',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
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
  },
}
export function catalogText(locale) {
  return catalogCopy[String(locale || 'hy').split('-')[0]] || catalogCopy.hy
}
export function isWorkshop(factory) {
  return (
    factory &&
    factory.is_workshop !== false &&
    factory.is_active !== false &&
    !isReferenceFactory(factory) &&
    String(factory.value || '').toUpperCase() !== 'SW'
  )
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
