export const taskCopy = {
  hy: {
    required: 'Անհրաժեշտ է ինժեների հաստատումը',
    method: 'Հավաստման մեթոդ',
    methods: 'Հավաստման մեթոդներ',
    methodsHelp:
      'Երկու մեթոդ ընտրելիս օպերատորը պետք է ներկայացնի և՛ նկար, և՛ տեքստ։',
    choose: 'Ընտրեք մեթոդը',
    photo: 'Նկար',
    text: 'Տեքստ',
    photo_text: 'Նկար և տեքստ',
    optional: 'Ավարտվում է օպերատորի հաստատմամբ',
    requiredHelp: 'Օպերատորը կուղարկի հավաստումը, իսկ դուք կհաստատեք ավարտը։',
    references: 'Տեղեկատու ֆայլերի տեսանելիություն',
    referencesHelp:
      'Նշեք այն արտադրամասերը, որոնց պետք է հասանելի լինի յուրաքանչյուր INFO/PDF ֆայլը։ Չընտրված արտադրամասերը այն չեն տեսնի։',
    evidence: 'Կատարված աշխատանքի հավաստում',
    evidenceHelp: 'Հավաստումն ուղարկվելու է առաջադրանքը ստեղծող ինժեներին։',
    textPlaceholder: 'Նկարագրեք կատարված աշխատանքը',
    photoHelp: 'JPG, PNG կամ WEBP · մինչև 10 ՄԲ',
    waiting: 'Սպասում է ստեղծող ինժեների հաստատմանը',
    approved: 'Ինժեները հաստատել է ավարտը',
    confirm: 'Հաստատել ավարտը',
    confirming: 'Հաստատվում է…',
    confirmed: 'Ավարտը հաստատված է',
    notSubmitted: 'Օպերատորը դեռ չի ուղարկել հավաստումը',
    all: 'Իմ բոլոր առաջադրանքները',
    pending: 'Իմ հաստատմանը սպասող',
    completed: 'Ավարտված',
    inProgress: 'Կատարվում է',
    invalidMethod: 'Ընտրեք հավաստման մեթոդը',
  },
  ru: {
    required: 'Требуется подтверждение инженера',
    method: 'Способ подтверждения',
    methods: 'Способы подтверждения',
    methodsHelp:
      'Если выбраны оба способа, оператор должен отправить и фото, и текст.',
    choose: 'Выберите способ',
    photo: 'Фото',
    text: 'Текст',
    photo_text: 'Фото и текст',
    optional: 'Завершается оператором',
    requiredHelp:
      'Оператор отправит подтверждение выполненной работы, а вы подтвердите завершение.',
    references: 'Доступ к справочным файлам',
    referencesHelp:
      'Выберите цеха, которым доступен каждый файл INFO/PDF. Остальные цеха его не увидят.',
    evidence: 'Подтверждение выполненной работы',
    evidenceHelp:
      'Подтверждение будет отправлено инженеру, создавшему задание.',
    textPlaceholder: 'Опишите выполненную работу',
    photoHelp: 'JPG, PNG или WEBP · до 10 МБ',
    waiting: 'Ожидает подтверждения создавшего инженера',
    approved: 'Инженер подтвердил завершение',
    confirm: 'Подтвердить завершение',
    confirming: 'Подтверждение…',
    confirmed: 'Завершение подтверждено',
    notSubmitted: 'Оператор ещё не отправил подтверждение',
    all: 'Все мои задания',
    pending: 'Ожидают моего подтверждения',
    completed: 'Завершено',
    inProgress: 'В работе',
    invalidMethod: 'Выберите способ подтверждения',
  },
  en: {
    required: 'Engineer confirmation required',
    method: 'Evidence method',
    methods: 'Evidence methods',
    methodsHelp:
      'When both methods are selected, the operator must submit both a photo and text.',
    choose: 'Choose a method',
    photo: 'Photo',
    text: 'Text',
    photo_text: 'Photo and text',
    optional: 'Completed by the operator',
    requiredHelp: 'The operator submits evidence and you confirm completion.',
    references: 'Reference file access',
    referencesHelp:
      'Choose the workshops that can access each INFO/PDF file. Unselected workshops cannot see it.',
    evidence: 'Completion evidence',
    evidenceHelp:
      'Evidence will be sent to the engineer who created this task.',
    textPlaceholder: 'Describe the completed work',
    photoHelp: 'JPG, PNG or WEBP · up to 10 MB',
    waiting: 'Awaiting the creating engineer’s confirmation',
    approved: 'Engineer confirmed completion',
    confirm: 'Confirm completion',
    confirming: 'Confirming…',
    confirmed: 'Completion confirmed',
    notSubmitted: 'The operator has not submitted evidence yet',
    all: 'All my tasks',
    pending: 'Awaiting my confirmation',
    completed: 'Completed',
    inProgress: 'In progress',
    invalidMethod: 'Choose an evidence method',
  },
}

export function confirmationMethods(method) {
  if (method === 'photo_text') return ['photo', 'text']
  return ['photo', 'text'].includes(method) ? [method] : []
}

export function isReferenceFactory(factory) {
  return (
    Boolean(factory?.is_reference) ||
    ['INFO', 'PDF'].includes(String(factory?.value || '').toUpperCase())
  )
}

// JSON actions stay compatible. File evidence uses multipart POST, since PHP
// does not parse file uploads from a raw multipart PUT request.
export function taskActionBody(order) {
  if (!order.evidence_photo) return { method: 'put', body: order }
  const form = new FormData()
  form.append('factory_id', order.factory_id)
  Object.entries(order.factory_order || {}).forEach(([key, value]) => {
    if (value != null) form.append(`factory_order[${key}]`, value)
  })
  form.append('evidence_photo', order.evidence_photo)
  return { method: 'post', body: form }
}

export function isStepCompleted(step) {
  return (
    Boolean(step?.completed_at) ||
    (['finished', 'completed', 'done'].includes(step?.status) &&
      (!step.confirmation_required || Boolean(step.engineer_confirmation_at)))
  )
}
