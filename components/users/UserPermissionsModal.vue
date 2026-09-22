<template>
  <transition name="permission-fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
      @click.self="$emit('close')"
    >
      <div class="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <header class="border-b border-slate-100 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-900 sm:px-7">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                {{ ui.access }}
              </p>
              <h2 class="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                {{ ui.title }}
              </h2>
            </div>

            <button
              type="button"
              class="rounded-xl p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
              :aria-label="ui.close"
              @click="$emit('close')"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            v-if="user"
            class="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40 lg:grid-cols-[auto_minmax(0,1fr)_auto]"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-sm dark:bg-white dark:text-slate-950">
              {{ userInitials }}
            </div>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="truncate text-sm font-black text-slate-950 dark:text-white">
                  {{ user.name }}
                </p>
                <span class="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                  {{ roleLabel }}
                </span>
              </div>

              <div class="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span class="inline-flex min-w-0 items-center gap-1.5">
                  <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 6.5 12 13l9-6.5M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
                  </svg>
                  <span class="truncate">{{ user.email || '—' }}</span>
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6.6 3.5h2.1l1.2 4-1.7 1.4a14.5 14.5 0 0 0 6.9 6.9l1.4-1.7 4 1.2v2.1a2.1 2.1 0 0 1-2.3 2.1C10.5 18.7 5.3 13.5 4.5 5.8A2.1 2.1 0 0 1 6.6 3.5Z" />
                  </svg>
                  <span>{{ user.phone || ui.noPhone }}</span>
                </span>
              </div>
            </div>

            <div class="flex items-center lg:justify-end">
              <div class="rounded-2xl border border-blue-100 bg-blue-50 px-3.5 py-2.5 text-left dark:border-blue-950/60 dark:bg-blue-950/25 lg:max-w-xs">
                <p class="text-[10px] font-black uppercase tracking-[0.12em] text-blue-700 dark:text-blue-300">
                  {{ ui.roleScope }}
                </p>
                <p class="mt-1 text-[11px] leading-5 text-blue-800/80 dark:text-blue-200/80">
                  {{ scopeDescription }}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto bg-slate-50/60 p-4 dark:bg-slate-950/20 sm:p-6">
          <div v-if="loading" class="flex min-h-[360px] items-center justify-center">
            <div class="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
              <span class="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-white"></span>
              {{ ui.loading }}
            </div>
          </div>

          <div v-else class="space-y-5">
            <section class="grid gap-3 sm:grid-cols-3">
              <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{{ ui.available }}</p>
                <p class="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{{ totalPermissions }}</p>
                <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{{ ui.availableHint }}</p>
              </div>

              <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/25">
                <p class="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">{{ ui.granted }}</p>
                <p class="mt-2 text-2xl font-black tracking-tight text-emerald-700 dark:text-emerald-300">{{ selectedCount }}</p>
                <p class="mt-1 text-[11px] text-emerald-700/75 dark:text-emerald-300/75">{{ ui.grantedHint }}</p>
              </div>

              <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{{ ui.logic }}</p>
                <p class="mt-2 text-xs font-black leading-5 text-slate-800 dark:text-slate-100">{{ ui.logicTitle }}</p>
                <p class="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{{ ui.logicHint }}</p>
              </div>
            </section>

            <div
              v-if="!permissionGroupsKeys.length"
              class="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900/60 dark:bg-amber-950/20"
            >
              <p class="text-sm font-black text-amber-800 dark:text-amber-200">{{ ui.emptyTitle }}</p>
              <p class="mx-auto mt-2 max-w-xl text-xs leading-5 text-amber-700/80 dark:text-amber-300/80">{{ ui.emptyText }}</p>
            </div>

            <section
              v-for="groupKey in permissionGroupsKeys"
              :key="groupKey"
              class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <button
                type="button"
                class="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-950/40 sm:px-5"
                @click="$emit('toggle-group', groupKey)"
              >
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-sm font-black text-slate-900 dark:text-white">{{ groupMeta(groupKey).title }}</p>
                    <span
                      v-if="openGroups.includes(groupKey)"
                      class="rounded-full bg-slate-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-white dark:bg-white dark:text-slate-950"
                    >
                      {{ ui.open }}
                    </span>
                  </div>
                  <p class="mt-1 max-w-3xl text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                    {{ groupMeta(groupKey).description }}
                  </p>
                </div>

                <div class="flex shrink-0 items-center gap-3">
                  <span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {{ selectedInGroup(groupKey) }}/{{ (permissionGroups[groupKey] || []).length }}
                  </span>
                  <svg
                    class="h-4 w-4 text-slate-400 transition-transform"
                    :class="{ 'rotate-180': openGroups.includes(groupKey) }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m19 9-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <transition name="permission-expand">
                <div
                  v-if="openGroups.includes(groupKey)"
                  class="grid gap-2 border-t border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/20 sm:grid-cols-2 sm:p-4"
                >
                  <label
                    v-for="perm in permissionGroups[groupKey]"
                    :key="perm.id"
                    class="group flex items-start gap-3 rounded-2xl border p-4 transition"
                    :class="permissionCardClass(perm)"
                  >
                    <span class="pt-0.5">
                      <input
                        type="checkbox"
                        class="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                        :checked="isSelected(perm.id)"
                        :disabled="isRequired(perm.id)"
                        @change="$emit('toggle-permission', perm.id)"
                      />
                    </span>

                    <span class="min-w-0 flex-1">
                      <span class="flex flex-wrap items-center gap-2">
                        <span class="text-sm font-black text-slate-900 dark:text-white">
                          {{ permissionMeta(perm).title }}
                        </span>
                        <span
                          v-if="isRequired(perm.id)"
                          class="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        >
                          {{ ui.required }}
                        </span>
                      </span>
                      <span class="mt-1 block text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                        {{ permissionMeta(perm).description }}
                      </span>
                    </span>

                    <span
                      class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black"
                      :class="isSelected(perm.id)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800'"
                    >
                      {{ isSelected(perm.id) ? '✓' : '–' }}
                    </span>
                  </label>
                </div>
              </transition>
            </section>
          </div>
        </div>

        <footer class="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p class="max-w-2xl text-[10px] leading-4 text-slate-400">
            {{ ui.footer }}
          </p>
          <div class="flex items-center justify-end gap-2">
            <button
              type="button"
              class="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              @click="$emit('close')"
            >
              {{ ui.close }}
            </button>
            <button
              type="button"
              class="inline-flex items-center rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              :disabled="saving || !permissionGroupsKeys.length"
              @click="$emit('save')"
            >
              <span v-if="saving" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              {{ saving ? ui.saving : ui.save }}
            </button>
          </div>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
const UI = {
  hy: {
    access: 'Հասանելիության կառավարում',
    title: 'Աշխատակցի թույլտվություններ',
    close: 'Փակել',
    noPhone: 'Հեռախոս նշված չէ',
    roleScope: 'Հաստիքին համապատասխան',
    loading: 'Բեռնվում է...',
    available: 'Հասանելի',
    availableHint: 'այս հաստիքի համար',
    granted: 'Թույլատրված',
    grantedHint: 'այս աշխատակցին',
    logic: 'Աշխատանքի սկզբունք',
    logicTitle: 'Ցուցադրվում են միայն կիրառելի ֆունկցիաները',
    logicHint: 'Կապակցված պարտադիր թույլտվությունները միանում են ավտոմատ։',
    emptyTitle: 'Այս հաստիքի համար կառավարվող թույլտվություն չկա։',
    emptyText: 'Ստուգեք աշխատակցի հաստիքը կամ server-ի permission scope-ը։',
    open: 'Բաց',
    required: 'Պարտադիր',
    footer: 'Չնշված ֆունկցիաները փակ են։ Եթե որևէ ֆունկցիա պահանջում է լրացուցիչ հասանելիություն, համակարգը այն միացնում է ավտոմատ, որպեսզի էջը և API endpoint-ները աշխատեն ամբողջությամբ։',
    save: 'Պահպանել',
    saving: 'Պահպանվում է…',
  },
  ru: {
    access: 'Управление доступом',
    title: 'Разрешения сотрудника',
    close: 'Закрыть',
    noPhone: 'Телефон не указан',
    roleScope: 'По должности',
    loading: 'Загрузка...',
    available: 'Доступно',
    availableHint: 'для этой должности',
    granted: 'Разрешено',
    grantedHint: 'этому сотруднику',
    logic: 'Принцип работы',
    logicTitle: 'Показаны только применимые функции',
    logicHint: 'Обязательные связанные разрешения включаются автоматически.',
    emptyTitle: 'Для этой должности нет управляемых разрешений.',
    emptyText: 'Проверьте должность сотрудника или permission scope на сервере.',
    open: 'Открыто',
    required: 'Обязательно',
    footer: 'Неотмеченные функции закрыты. Если функции нужен дополнительный доступ, система включает его автоматически, чтобы интерфейс и API работали полностью.',
    save: 'Сохранить',
    saving: 'Сохранение…',
  },
  en: {
    access: 'Access management',
    title: 'Employee permissions',
    close: 'Close',
    noPhone: 'Phone not provided',
    roleScope: 'Role scope',
    loading: 'Loading...',
    available: 'Available',
    availableHint: 'for this position',
    granted: 'Allowed',
    grantedHint: 'for this employee',
    logic: 'Access logic',
    logicTitle: 'Only relevant functions are shown',
    logicHint: 'Required dependent permissions are enabled automatically.',
    emptyTitle: 'There are no configurable permissions for this position.',
    emptyText: 'Check the employee position or the server permission scope.',
    open: 'Open',
    required: 'Required',
    footer: 'Unchecked functions are blocked. When a function depends on additional access, the system enables it automatically so the UI and API endpoints keep working.',
    save: 'Save',
    saving: 'Saving…',
  },
}

const ROLE_COPY = {
  hy: {
    engineer: 'Ինժեներ',
    laser: 'Լազերային կտրում',
    bend: 'Կռում',
    powder_catting: 'Փոշեներկում',
    manager: 'Մենեջեր',
    admin: 'Ադմինիստրատոր',
  },
  ru: {
    engineer: 'Инженер',
    laser: 'Лазерная резка',
    bend: 'Гибка',
    powder_catting: 'Порошковая покраска',
    manager: 'Менеджер',
    admin: 'Администратор',
  },
  en: {
    engineer: 'Engineer',
    laser: 'Laser cutting',
    bend: 'Bending',
    powder_catting: 'Powder coating',
    manager: 'Manager',
    admin: 'Administrator',
  },
}

const GROUP_COPY = {
  hy: {
    orders: ['Պատվերներ', 'Պատվերների դիտում, ստեղծում, խմբագրում և ջնջում։'],
    pmp: ['PMP', 'PMP խմբերի և ենթախմբերի հիմնական կառավարում։'],
    pmp_files: ['PMP ֆայլեր', 'PMP-ին կցված ֆայլերի դիտում, վերբեռնում և ջնջում։'],
    pmp_group: ['PMP ստուգումներ', 'Ծածկագրերի, անունների և ենթահամարների ստուգումներ՝ կրկնություններից խուսափելու համար։'],
    clients: ['Հաճախորդներ', 'Հաճախորդների տեղեկությունները դիտելու հասանելիություն՝ պատվեր ստեղծելիս։'],
    workers: ['Աշխատակիցներ', 'Աշխատակիցների ցանկի և տվյալների կառավարում։'],
    materials: ['Նյութեր', 'Նյութերի ցանկի և տվյալների կառավարում։'],
    material_categories: ['Նյութերի կատեգորիաներ', 'Նյութերի կատեգորիաների դիտում։'],
    factory: ['Արտադրամաս', 'Արտադրամասի պատվերներ, աշխատանքի կարգավիճակ և ֆայլեր։'],
    general: ['Այլ', 'Լրացուցիչ հասանելիություններ։'],
  },
  ru: {
    orders: ['Заказы', 'Просмотр, создание, редактирование и удаление заказов.'],
    pmp: ['PMP', 'Основное управление группами и подгруппами PMP.'],
    pmp_files: ['Файлы PMP', 'Просмотр, загрузка и удаление файлов PMP.'],
    pmp_group: ['Проверки PMP', 'Проверка кодов, названий и подномеров для предотвращения дубликатов.'],
    clients: ['Клиенты', 'Просмотр данных клиентов, необходимых при создании заказа.'],
    workers: ['Сотрудники', 'Просмотр и управление сотрудниками.'],
    materials: ['Материалы', 'Просмотр и управление материалами.'],
    material_categories: ['Категории материалов', 'Просмотр категорий материалов.'],
    factory: ['Цех', 'Заказы цеха, статус работы и файлы.'],
    general: ['Другое', 'Дополнительные разрешения.'],
  },
  en: {
    orders: ['Orders', 'View, create, edit and delete orders.'],
    pmp: ['PMP', 'Core PMP group and subgroup management.'],
    pmp_files: ['PMP files', 'View, upload and delete files attached to PMP.'],
    pmp_group: ['PMP checks', 'Validate codes, names and sub-numbers to prevent duplicates.'],
    clients: ['Clients', 'View client data required while creating an order.'],
    workers: ['Employees', 'View and manage employee records.'],
    materials: ['Materials', 'View and manage materials.'],
    material_categories: ['Material categories', 'View material categories.'],
    factory: ['Workshop', 'Workshop orders, work status and files.'],
    general: ['Other', 'Additional permissions.'],
  },
}

const PERMISSION_COPY = {
  hy: {
    'orders.view': ['Դիտել պատվերները', 'Բացել ինժեների պատվերների ցանկը և պատվերի մանրամասները։'],
    'orders.create': ['Ստեղծել պատվեր', 'Ստեղծել նոր պատվեր՝ հաճախորդ, PMP, ֆայլեր և արտադրամաս ընտրելով։'],
    'orders.update': ['Խմբագրել պատվեր', 'Փոփոխել արդեն ստեղծված պատվերի տվյալները։'],
    'orders.delete': ['Ջնջել պատվեր', 'Հեռացնել պատվերը համակարգից։'],
    'pmp.view': ['Դիտել PMP բաժինը', 'Բացել PMP խմբերը, ենթախմբերը և դրանց տվյալները։'],
    'pmp.create': ['Ստեղծել PMP', 'Ավելացնել նոր PMP խումբ կամ ենթախումբ։'],
    'pmp.update': ['Խմբագրել PMP', 'Փոփոխել գոյություն ունեցող PMP-ի տվյալները։'],
    'pmp_files.view': ['Դիտել PMP ֆայլերը', 'Բացել PMP-ին կցված ֆայլերի ցանկը և նախադիտումը։'],
    'pmp_files.upload': ['Վերբեռնել PMP ֆայլ', 'PMP-ին ավելացնել նոր արտադրական ֆայլ։'],
    'pmp_files.delete': ['Ջնջել PMP ֆայլ', 'Հեռացնել PMP-ին կցված ֆայլը։'],
    'pmp_group.check_group': ['Ստուգել PMP ծածկագիրը', 'Ստուգել՝ նույն PMP ծածկագիրն արդեն գոյություն ունի՞։'],
    'pmp_group.check_group_name': ['Ստուգել PMP անունը', 'Ստուգել՝ նույն PMP անվանումն արդեն օգտագործվա՞ծ է։'],
    'pmp_group.check_remote_number': ['Ստուգել PMP ենթահամարը', 'Ստուգել ընտրված ենթահամարը և ստանալ դրա տվյալները։'],
    'clients.view': ['Դիտել հաճախորդների ցանկը', 'Անհրաժեշտ է պատվեր ստեղծելիս հաճախորդ ընտրելու համար։'],
    'clients.create': ['Ստեղծել հաճախորդ', 'Ավելացնել նոր հաճախորդ։'],
    'clients.update': ['Խմբագրել հաճախորդ', 'Փոփոխել հաճախորդի տվյալները։'],
    'clients.delete': ['Ջնջել հաճախորդ', 'Հեռացնել հաճախորդին համակարգից։'],
    'workers.view': ['Դիտել աշխատակիցների ցանկը', 'Բացել աշխատակիցների տվյալները։'],
    'workers.create': ['Ստեղծել աշխատակից', 'Ավելացնել նոր աշխատակից։'],
    'workers.update': ['Խմբագրել աշխատակից', 'Փոփոխել աշխատակցի տվյալները։'],
    'workers.delete': ['Ջնջել աշխատակից', 'Հեռացնել աշխատակցի հաշիվը։'],
    'materials.view': ['Դիտել նյութերի ցանկը', 'Բացել նյութերը և դրանց տվյալները։'],
    'materials.create': ['Ավելացնել նյութ', 'Ստեղծել նոր նյութ։'],
    'materials.update': ['Խմբագրել նյութ', 'Փոփոխել նյութի տվյալները։'],
    'materials.delete': ['Ջնջել նյութ', 'Հեռացնել նյութը համակարգից։'],
    'material_categories.view': ['Դիտել նյութերի կատեգորիաները', 'Բացել նյութերի կատեգորիաների ցանկը։'],
    'factory.view': ['Դիտել արտադրամասերի տվյալները', 'Բացել արտադրամասերի ցանկը կամ աշխատակցի արտադրամասի պատվերները։'],
    'factory.order_update': ['Փոխել աշխատանքի կարգավիճակը', 'Արտադրամասում ընդունել աշխատանքը և փոխել դրա ընթացքի կարգավիճակը։'],
    'factory.download': ['Դիտել և ներբեռնել ֆայլերը', 'Բացել կամ ներբեռնել արտադրամասին հասանելի արտադրական ֆայլերը։'],
  },
  ru: {
    'orders.view': ['Просматривать заказы', 'Открывать список заказов инженера и детали заказа.'],
    'orders.create': ['Создавать заказ', 'Создавать заказ с выбором клиента, PMP, файлов и цеха.'],
    'orders.update': ['Редактировать заказ', 'Изменять данные уже созданного заказа.'],
    'orders.delete': ['Удалять заказ', 'Удалять заказ из системы.'],
    'pmp.view': ['Просматривать PMP', 'Открывать группы, подгруппы и данные PMP.'],
    'pmp.create': ['Создавать PMP', 'Добавлять новую группу или подгруппу PMP.'],
    'pmp.update': ['Редактировать PMP', 'Изменять данные существующего PMP.'],
    'pmp_files.view': ['Просматривать файлы PMP', 'Открывать список и просмотр файлов PMP.'],
    'pmp_files.upload': ['Загружать файл PMP', 'Добавлять новый производственный файл к PMP.'],
    'pmp_files.delete': ['Удалять файл PMP', 'Удалять прикреплённый к PMP файл.'],
    'pmp_group.check_group': ['Проверять код PMP', 'Проверять, существует ли такой код PMP.'],
    'pmp_group.check_group_name': ['Проверять название PMP', 'Проверять, используется ли такое название PMP.'],
    'pmp_group.check_remote_number': ['Проверять подномер PMP', 'Проверять выбранный подномер и получать его данные.'],
    'clients.view': ['Просматривать клиентов', 'Нужно для выбора клиента при создании заказа.'],
    'clients.create': ['Создавать клиента', 'Добавлять нового клиента.'],
    'clients.update': ['Редактировать клиента', 'Изменять данные клиента.'],
    'clients.delete': ['Удалять клиента', 'Удалять клиента из системы.'],
    'workers.view': ['Просматривать сотрудников', 'Открывать список и данные сотрудников.'],
    'workers.create': ['Создавать сотрудника', 'Добавлять нового сотрудника.'],
    'workers.update': ['Редактировать сотрудника', 'Изменять данные сотрудника.'],
    'workers.delete': ['Удалять сотрудника', 'Удалять учётную запись сотрудника.'],
    'materials.view': ['Просматривать материалы', 'Открывать список и данные материалов.'],
    'materials.create': ['Добавлять материал', 'Создавать новый материал.'],
    'materials.update': ['Редактировать материал', 'Изменять данные материала.'],
    'materials.delete': ['Удалять материал', 'Удалять материал из системы.'],
    'material_categories.view': ['Просматривать категории материалов', 'Открывать список категорий материалов.'],
    'factory.view': ['Просматривать данные цеха', 'Открывать список цехов или заказы назначенного цеха.'],
    'factory.order_update': ['Менять статус работы', 'Принимать работу в цехе и изменять статус её выполнения.'],
    'factory.download': ['Просматривать и скачивать файлы', 'Открывать или скачивать производственные файлы, доступные цеху.'],
  },
  en: {
    'orders.view': ['View orders', 'Open the engineer order list and order details.'],
    'orders.create': ['Create orders', 'Create an order by selecting a client, PMP, files and workshop.'],
    'orders.update': ['Edit orders', 'Change data of an existing order.'],
    'orders.delete': ['Delete orders', 'Remove an order from the system.'],
    'pmp.view': ['View PMP', 'Open PMP groups, subgroups and their data.'],
    'pmp.create': ['Create PMP', 'Add a new PMP group or subgroup.'],
    'pmp.update': ['Edit PMP', 'Change data of an existing PMP.'],
    'pmp_files.view': ['View PMP files', 'Open the list and preview of files attached to PMP.'],
    'pmp_files.upload': ['Upload PMP files', 'Attach a new production file to PMP.'],
    'pmp_files.delete': ['Delete PMP files', 'Remove a file attached to PMP.'],
    'pmp_group.check_group': ['Validate PMP code', 'Check whether the same PMP code already exists.'],
    'pmp_group.check_group_name': ['Validate PMP name', 'Check whether the same PMP name is already in use.'],
    'pmp_group.check_remote_number': ['Validate PMP sub-number', 'Validate the selected sub-number and load its data.'],
    'clients.view': ['View clients', 'Required to select a client while creating an order.'],
    'clients.create': ['Create clients', 'Add a new client.'],
    'clients.update': ['Edit clients', 'Change client data.'],
    'clients.delete': ['Delete clients', 'Remove a client from the system.'],
    'workers.view': ['View employees', 'Open the employee list and employee data.'],
    'workers.create': ['Create employees', 'Add a new employee.'],
    'workers.update': ['Edit employees', 'Change employee data.'],
    'workers.delete': ['Delete employees', 'Remove an employee account.'],
    'materials.view': ['View materials', 'Open the material list and material data.'],
    'materials.create': ['Add materials', 'Create a new material.'],
    'materials.update': ['Edit materials', 'Change material data.'],
    'materials.delete': ['Delete materials', 'Remove a material from the system.'],
    'material_categories.view': ['View material categories', 'Open the material category list.'],
    'factory.view': ['View workshop data', 'Open the workshop list or orders for the assigned workshop.'],
    'factory.order_update': ['Change work status', 'Accept workshop work and change its progress status.'],
    'factory.download': ['View and download files', 'Open or download production files available to the workshop.'],
  },
}

export default {
  name: 'UserPermissionsModal',
  props: {
    show: { type: Boolean, default: false },
    user: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    saving: { type: Boolean, default: false },
    permissionGroups: { type: Object, default: () => ({}) },
    permissionGroupsKeys: { type: Array, default: () => [] },
    permissionScope: { type: Object, default: null },
    userPermissionIds: { type: Array, default: () => [] },
    requiredPermissionIds: { type: Array, default: () => [] },
    openGroups: { type: Array, default: () => [] },
  },
  computed: {
    locale() {
      const code = String(this.$i18n?.locale || 'hy').toLowerCase().split('-')[0]
      return ['hy', 'ru', 'en'].includes(code) ? code : 'hy'
    },
    ui() {
      return UI[this.locale] || UI.hy
    },
    totalPermissions() {
      return this.permissionGroupsKeys.reduce(
        (total, key) => total + (this.permissionGroups[key] || []).length,
        0
      )
    },
    selectedCount() {
      return this.userPermissionIds.length
    },
    userInitials() {
      return String(this.user?.name || '?')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
    },
    roleName() {
      return this.permissionScope?.role || this.user?.roleName || ''
    },
    roleLabel() {
      return (
        ROLE_COPY[this.locale]?.[this.roleName] ||
        this.user?.roleLabel ||
        this.roleName ||
        '—'
      )
    },
    scopeDescription() {
      const factoryRoles = ['laser', 'bend', 'powder_catting']
      if (this.roleName === 'engineer') {
        return {
          hy: 'Միայն ինժեների աշխատանքին վերաբերող պատվերների, PMP-ի և անհրաժեշտ տեղեկատու տվյալների հասանելիություններ։',
          ru: 'Только доступы, связанные с работой инженера: заказы, PMP и необходимые справочные данные.',
          en: 'Only access used by the engineer workspace: orders, PMP and required reference data.',
        }[this.locale]
      }
      if (factoryRoles.includes(this.roleName)) {
        return {
          hy: 'Միայն տվյալ արտադրամասի աշխատանքի, կարգավիճակի և ֆայլերի հասանելիություններ։',
          ru: 'Только доступы к работе цеха, статусам и производственным файлам.',
          en: 'Only workshop work, status and production-file access.',
        }[this.locale]
      }
      return {
        hy: 'Ցուցադրվում են միայն այս հաստիքի իրական աշխատանքում կիրառվող ֆունկցիաները։',
        ru: 'Показаны только функции, реально используемые этой должностью.',
        en: 'Only functions actually used by this position are shown.',
      }[this.locale]
    },
  },
  methods: {
    isSelected(permissionId) {
      return this.userPermissionIds.map(Number).includes(Number(permissionId))
    },
    isRequired(permissionId) {
      return this.requiredPermissionIds.map(Number).includes(Number(permissionId))
    },
    selectedInGroup(groupKey) {
      return (this.permissionGroups[groupKey] || []).filter((permission) =>
        this.isSelected(permission.id)
      ).length
    },
    groupMeta(groupKey) {
      const value = GROUP_COPY[this.locale]?.[groupKey] ||
        GROUP_COPY.hy[groupKey] ||
        [groupKey, '']
      return { title: value[0], description: value[1] }
    },
    permissionMeta(permission) {
      const value =
        PERMISSION_COPY[this.locale]?.[permission.slug] ||
        PERMISSION_COPY.hy[permission.slug] ||
        [permission.name || permission.slug, '']
      return { title: value[0], description: value[1] }
    },
    permissionCardClass(permission) {
      if (this.isSelected(permission.id)) {
        return this.isRequired(permission.id)
          ? 'cursor-not-allowed border-blue-200 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-950/20'
          : 'cursor-pointer border-emerald-200 bg-emerald-50/70 shadow-sm hover:border-emerald-300 dark:border-emerald-900/70 dark:bg-emerald-950/20'
      }
      return 'cursor-pointer border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-950/40'
    },
  },
}
</script>

<style scoped>
.permission-fade-enter-active,
.permission-fade-leave-active {
  transition: opacity 0.18s ease;
}
.permission-fade-enter,
.permission-fade-leave-to {
  opacity: 0;
}

.permission-expand-enter-active,
.permission-expand-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}
.permission-expand-enter,
.permission-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
