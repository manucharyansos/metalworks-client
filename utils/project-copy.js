// Renaming and deleting a project subgroup from its files page.
function ruForm(count, one, few, many) {
  const tens = count % 100
  const units = count % 10
  if (units === 1 && tens !== 11) return one
  if (units >= 2 && units <= 4 && (tens < 12 || tens > 14)) return few
  return many
}

const copy = {
  hy: {
    rename: 'Վերանվանել',
    remove: 'Ջնջել ենթախումբը',
    renameTitle: 'Վերանվանել նախագիծը',
    groupName: 'Խմբի անվանում',
    subgroupName: 'Ենթախմբի նկարագրություն',
    codesKept: (group, subgroup) =>
      `${group} և ${subgroup} ծածկագրերը չեն փոխվում, ֆայլերն ու առաջադրանքները մնում են իրենց տեղում։`,
    groupShared: 'Խմբի անվանումը կփոխվի նաև նրա մյուս ենթախմբերում։',
    save: 'Պահպանել',
    saving: 'Պահպանվում է…',
    cancel: 'Չեղարկել',
    close: 'Փակել',
    saved: 'Անվանումները պահպանված են',
    saveFailed: 'Չհաջողվեց պահպանել անվանումները։',
    groupTaken: 'Այս անվանումով խումբ արդեն կա։',
    subgroupTaken: 'Այս խմբում նույն նկարագրությամբ ենթախումբ արդեն կա։',
    deleteTitle: 'Ջնջե՞լ ենթախումբը',
    checking: 'Ստուգվում է, թե ինչ կջնջվի…',
    files: (count) =>
      count
        ? `Կջնջվեն ենթախումբը և նրա ${count} ֆայլը։`
        : 'Կջնջվի ենթախումբը։ Այն ֆայլեր չունի։',
    group: (name) =>
      `Սա խմբի միակ ենթախումբն է, ուստի «${name}» խումբը նույնպես կջնջվի։`,
    final: 'Ջնջումը հետ շրջել հնարավոր չէ։',
    blocked: (count) =>
      `Ենթախումբը ջնջել հնարավոր չէ. այն օգտագործվում է ${count} առաջադրանքում, որոնց ֆայլերն ու պատմությունը պետք է պահպանվեն։`,
    blockedHint: 'Կարող եք վերանվանել այն կամ նախ ջնջել այդ առաջադրանքները։',
    more: (count) => `և ևս ${count}`,
    confirm: 'Այո, ջնջել',
    deleting: 'Ջնջվում է…',
    deleted: 'Ենթախումբը ջնջվեց',
    deletedGroup: 'Ենթախումբը և դատարկ մնացած խումբը ջնջվեցին',
    deleteFailed: 'Չհաջողվեց ջնջել ենթախումբը։',
    previewFailed: 'Չհաջողվեց ստուգել, թե ինչ կջնջվի։',
    retry: 'Կրկին փորձել',
  },
  ru: {
    rename: 'Переименовать',
    remove: 'Удалить подгруппу',
    renameTitle: 'Переименовать проект',
    groupName: 'Название группы',
    subgroupName: 'Описание подгруппы',
    codesKept: (group, subgroup) =>
      `Коды ${group} и ${subgroup} не меняются, файлы и задания остаются на месте.`,
    groupShared: 'Название группы изменится и в других её подгруппах.',
    save: 'Сохранить',
    saving: 'Сохранение…',
    cancel: 'Отмена',
    close: 'Закрыть',
    saved: 'Названия сохранены',
    saveFailed: 'Не удалось сохранить названия.',
    groupTaken: 'Группа с таким названием уже есть.',
    subgroupTaken: 'В этой группе уже есть подгруппа с таким описанием.',
    deleteTitle: 'Удалить подгруппу?',
    checking: 'Проверяем, что будет удалено…',
    files: (count) =>
      count
        ? `Будут удалены подгруппа и ${count} ${ruForm(
            count,
            'файл',
            'файла',
            'файлов'
          )} в ней.`
        : 'Будет удалена подгруппа. Файлов в ней нет.',
    group: (name) =>
      `Это единственная подгруппа группы, поэтому группа «${name}» тоже будет удалена.`,
    final: 'Удаление нельзя отменить.',
    blocked: (count) =>
      `Подгруппу нельзя удалить: она используется в ${count} ${ruForm(
        count,
        'задании',
        'заданиях',
        'заданиях'
      )}, их файлы и история должны сохраниться.`,
    blockedHint: 'Её можно переименовать или сначала удалить эти задания.',
    more: (count) => `и ещё ${count}`,
    confirm: 'Да, удалить',
    deleting: 'Удаление…',
    deleted: 'Подгруппа удалена',
    deletedGroup: 'Подгруппа и опустевшая группа удалены',
    deleteFailed: 'Не удалось удалить подгруппу.',
    previewFailed: 'Не удалось проверить, что будет удалено.',
    retry: 'Повторить',
  },
  en: {
    rename: 'Rename',
    remove: 'Delete subgroup',
    renameTitle: 'Rename the project',
    groupName: 'Group name',
    subgroupName: 'Subgroup description',
    codesKept: (group, subgroup) =>
      `Codes ${group} and ${subgroup} stay the same; files and tasks stay where they are.`,
    groupShared: 'The group name also changes in its other subgroups.',
    save: 'Save',
    saving: 'Saving…',
    cancel: 'Cancel',
    close: 'Close',
    saved: 'Names saved',
    saveFailed: 'Could not save the names.',
    groupTaken: 'A group with this name already exists.',
    subgroupTaken: 'This group already has a subgroup with this description.',
    deleteTitle: 'Delete the subgroup?',
    checking: 'Checking what will be deleted…',
    files: (count) =>
      count
        ? `The subgroup and its ${count} ${
            count === 1 ? 'file' : 'files'
          } will be deleted.`
        : 'The subgroup will be deleted. It has no files.',
    group: (name) =>
      `This is the group's only subgroup, so the group “${name}” will be deleted too.`,
    final: 'This cannot be undone.',
    blocked: (count) =>
      `The subgroup cannot be deleted: ${count} ${
        count === 1 ? 'task uses' : 'tasks use'
      } it, and their files and history must be kept.`,
    blockedHint: 'You can rename it, or delete those tasks first.',
    more: (count) => `and ${count} more`,
    confirm: 'Yes, delete',
    deleting: 'Deleting…',
    deleted: 'Subgroup deleted',
    deletedGroup: 'The subgroup and its now empty group were deleted',
    deleteFailed: 'Could not delete the subgroup.',
    previewFailed: 'Could not check what will be deleted.',
    retry: 'Try again',
  },
}

export function projectCopy(locale) {
  return copy[String(locale || 'hy').split('-')[0]] || copy.hy
}

// Three digits for a group, two for a subgroup, as the codes are shown elsewhere.
export function projectCode(value, size) {
  const code = String(value ?? '').trim()
  return /^\d+$/.test(code) ? code.padStart(size, '0') : code || '—'
}
