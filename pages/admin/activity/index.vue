<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <section class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">{{ t.title }}</h1>
            <InfoTooltip>{{ t.help }}</InfoTooltip>
          </div>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">{{ t.subtitle }}</p>
        </div>
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800" :disabled="loading" @click="loadActivity(1)">
          <svg class="h-4 w-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 6v5h-5M4 18v-5h5m10.5-2a8 8 0 00-13.8-3M4.5 14a8 8 0 0013.8 3" /></svg>
          {{ t.refresh }}
        </button>
      </section>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="metric-card"><p class="metric-label">{{ t.today }}</p><p class="metric-value">{{ summary.today || 0 }}</p><p class="metric-hint">{{ t.actions }}</p></div>
        <div class="metric-card"><p class="metric-label">{{ t.last7 }}</p><p class="metric-value">{{ summary.last_7_days || 0 }}</p><p class="metric-hint">{{ t.actions }}</p></div>
        <div class="metric-card"><p class="metric-label">{{ t.filesToday }}</p><p class="metric-value text-blue-600 dark:text-blue-300">{{ summary.files_today || 0 }}</p><p class="metric-hint">{{ t.fileChanges }}</p></div>
        <div class="metric-card"><p class="metric-label">{{ t.ordersToday }}</p><p class="metric-value text-emerald-600 dark:text-emerald-300">{{ summary.orders_today || 0 }}</p><p class="metric-hint">{{ t.orderChanges }}</p></div>
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div class="flex flex-wrap gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <button v-for="preset in presets" :key="preset.key" type="button" class="rounded-xl px-3 py-2 text-xs font-bold transition" :class="activePreset === preset.key ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'" @click="applyPreset(preset.key)">{{ preset.label }}</button>
        </div>

        <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div class="relative xl:col-span-2">
            <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0Z" /></svg>
            <input v-model.trim="query.search" class="control pr-10" :placeholder="t.searchPlaceholder" @keyup.enter="applyFilters" />
          </div>
          <select v-model="query.user_id" class="control">
            <option value="">{{ t.allEmployees }}</option>
            <option v-for="actor in filterOptions.actors" :key="actor.id" :value="String(actor.id)">{{ actor.display_name || actor.name }}{{ actor.role ? ` · ${roleLabel(actor.role)}` : '' }}</option>
          </select>
          <select v-model="query.role" class="control">
            <option value="">{{ t.allRoles }}</option>
            <option v-for="role in filterOptions.roles" :key="role.name" :value="role.name">{{ roleLabel(role) }}</option>
          </select>
          <select v-model="query.category" class="control">
            <option value="">{{ t.allCategories }}</option>
            <option v-for="category in filterOptions.categories" :key="category" :value="category">{{ categoryLabel(category) }}</option>
          </select>
          <select v-model="query.action" class="control">
            <option value="">{{ t.allActions }}</option>
            <option v-for="action in filterOptions.actions" :key="action" :value="action">{{ actionLabel(action) }}</option>
          </select>
          <label class="block"><span class="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{{ t.from }}</span><input v-model="query.date_from" type="date" class="control" @change="activePreset = 'custom'" /></label>
          <label class="block"><span class="mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{{ t.to }}</span><input v-model="query.date_to" type="date" class="control" @change="activePreset = 'custom'" /></label>
        </div>

        <div class="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" class="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" @click="resetFilters">{{ t.reset }}</button>
          <button type="button" class="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-950" @click="applyFilters">{{ t.apply }}</button>
        </div>
      </section>

      <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-300">{{ error }}</div>

      <div v-if="loading" class="flex min-h-[320px] items-center justify-center"><span class="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 dark:border-slate-700 dark:border-t-white"></span></div>

      <section v-else-if="groupedLogs.length" class="space-y-7">
        <div v-for="group in groupedLogs" :key="group.key" class="space-y-3">
          <div class="sticky top-16 z-10 flex items-center gap-3 bg-slate-50/95 py-2 backdrop-blur dark:bg-slate-950/95">
            <div class="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            <p class="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-black text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">{{ group.label }}</p>
            <div class="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
          </div>

          <article v-for="log in group.items" :key="log.id" class="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div class="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-start">
              <div class="flex shrink-0 items-center gap-3 lg:w-36">
                <div class="flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-black" :class="categoryTone(log.category)">{{ categoryShort(log.category) }}</div>
                <div><p class="font-mono text-sm font-black text-slate-900 dark:text-white">{{ formatTime(log.created_at) }}</p><p class="mt-0.5 text-[10px] font-bold text-slate-400">#{{ log.id }}</p></div>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-full px-2.5 py-1 text-[10px] font-black" :class="categoryTone(log.category)">{{ categoryLabel(log.category) }}</span>
                  <span class="text-xs font-black text-slate-950 dark:text-white">{{ actionLabel(log.action) }}</span>
                </div>

                <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span class="font-black text-slate-900 dark:text-white">{{ actorName(log) }}</span>
                  <span v-if="log.user?.role" class="text-slate-300 dark:text-slate-700">•</span>
                  <span v-if="log.user?.role" class="font-semibold text-slate-500 dark:text-slate-400">{{ roleLabel(log.user.role) }}</span>
                  <span v-if="log.user?.factory" class="text-slate-300 dark:text-slate-700">•</span>
                  <span v-if="log.user?.factory" class="text-slate-500 dark:text-slate-400">{{ log.user.factory.name }}</span>
                </div>

                <div v-if="log.subject_label || log.subject_id" class="mt-3 rounded-2xl bg-slate-50 px-3.5 py-3 dark:bg-slate-950/45">
                  <p class="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{{ subjectTypeLabel(log.subject_type) }}</p>
                  <p class="mt-1 break-words text-sm font-bold text-slate-700 dark:text-slate-200">{{ log.subject_label || `${t.item} #${log.subject_id}` }}</p>
                </div>

                <p v-if="log.description" class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{{ log.description }}</p>

                <button v-if="hasDetails(log)" type="button" class="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white" @click="toggleDetails(log.id)">
                  {{ expanded[log.id] ? t.hideDetails : t.showDetails }}
                  <span :class="expanded[log.id] ? 'rotate-180' : ''" class="transition">⌄</span>
                </button>

                <div v-if="expanded[log.id]" class="mt-3 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/35">
                  <div v-if="changeEntries(log).length" class="space-y-2">
                    <p class="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{{ t.changedFields }}</p>
                    <div v-for="entry in changeEntries(log)" :key="entry.field" class="grid gap-1 rounded-xl bg-white p-3 text-xs dark:bg-slate-900 sm:grid-cols-[150px_1fr]">
                      <span class="font-black text-slate-600 dark:text-slate-300">{{ fieldLabel(entry.field) }}</span>
                      <span v-if="entry.private" class="text-slate-400">{{ t.valueChanged }}</span>
                      <span v-else class="break-words text-slate-500 dark:text-slate-400"><strong class="font-semibold text-rose-500">{{ prettyValue(entry.from) }}</strong> → <strong class="font-semibold text-emerald-600 dark:text-emerald-300">{{ prettyValue(entry.to) }}</strong></span>
                    </div>
                  </div>

                  <div v-if="permissionList(log).length">
                    <p class="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{{ t.permissions }}</p>
                    <div class="flex flex-wrap gap-1.5"><span v-for="permission in permissionList(log)" :key="permission" class="rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">{{ permission }}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section v-else class="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl dark:bg-slate-800">⌁</div>
        <h2 class="mt-4 text-base font-black text-slate-800 dark:text-slate-100">{{ t.emptyTitle }}</h2>
        <p class="mt-1 text-sm text-slate-400">{{ t.emptyText }}</p>
      </section>

      <div v-if="pagination.last_page > 1" class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <p class="px-2 text-xs font-semibold text-slate-400">{{ pagination.from || 0 }}–{{ pagination.to || 0 }} / {{ pagination.total || 0 }}</p>
        <div class="flex items-center gap-2">
          <button type="button" class="page-btn" :disabled="pagination.current_page <= 1 || loading" @click="loadActivity(pagination.current_page - 1)">← {{ t.previous }}</button>
          <span class="px-2 text-xs font-black text-slate-600 dark:text-slate-300">{{ pagination.current_page }} / {{ pagination.last_page }}</span>
          <button type="button" class="page-btn" :disabled="pagination.current_page >= pagination.last_page || loading" @click="loadActivity(pagination.current_page + 1)">{{ t.next }} →</button>
        </div>
      </div>
    </div>
    <notifications />
  </main>
</template>

<script>
const COPY = {
  hy: { title:'Աշխատակիցների գործունեություն',help:'Տեսեք՝ ով, երբ և ինչ փոփոխություն է կատարել համակարգում՝ պատվերներ, ֆայլեր, նախագծեր, արտադրամասեր, աշխատակիցներ և թույլտվություններ։',subtitle:'Գործողությունները պահվում են ճշգրիտ ամսաթվով և ժամով։ Անձնական կամ գաղտնի արժեքները audit history-ում չեն պահպանվում։',refresh:'Թարմացնել',today:'Այսօր',last7:'Վերջին 7 օրը',filesToday:'Ֆայլերի գործողություններ այսօր',ordersToday:'Պատվերների գործողություններ այսօր',actions:'գործողություն',fileChanges:'ֆայլի փոփոխություն',orderChanges:'պատվեր / արտադրություն',searchPlaceholder:'Որոնել աշխատակցով, ֆայլով, պատվերով կամ գործողությամբ...',allEmployees:'Բոլոր աշխատակիցները',allRoles:'Բոլոր հաստիքները',allCategories:'Բոլոր բաժինները',allActions:'Բոլոր գործողությունները',from:'Սկսած',to:'Մինչև',reset:'Մաքրել',apply:'Կիրառել',presetToday:'Այսօր',preset7:'7 օր',preset30:'30 օր',allTime:'Ամբողջ ժամանակը',emptyTitle:'Գործողություններ չեն գտնվել',emptyText:'Փոխեք ֆիլտրերը կամ ընտրեք այլ ժամանակահատված։',showDetails:'Դիտել փոփոխությունները',hideDetails:'Փակել մանրամասները',changedFields:'Փոխված դաշտեր',valueChanged:'արժեքը փոխվել է',permissions:'Տրված թույլտվություններ',item:'Գրառում',previous:'Նախորդ',next:'Հաջորդ',unknownUser:'Համակարգ',loadError:'Չհաջողվեց բեռնել աշխատակիցների գործունեությունը' },
  ru: { title:'Активность сотрудников',help:'Смотрите кто, когда и что изменил в системе: заказы, файлы, проекты, производство, сотрудники и разрешения.',subtitle:'Действия сохраняются с точной датой и временем. Личные и секретные значения в журнале аудита не сохраняются.',refresh:'Обновить',today:'Сегодня',last7:'Последние 7 дней',filesToday:'Действия с файлами сегодня',ordersToday:'Действия с заказами сегодня',actions:'действий',fileChanges:'изменений файлов',orderChanges:'заказы / производство',searchPlaceholder:'Поиск по сотруднику, файлу, заказу или действию...',allEmployees:'Все сотрудники',allRoles:'Все должности',allCategories:'Все разделы',allActions:'Все действия',from:'С',to:'По',reset:'Сбросить',apply:'Применить',presetToday:'Сегодня',preset7:'7 дней',preset30:'30 дней',allTime:'Всё время',emptyTitle:'Действий не найдено',emptyText:'Измените фильтры или выберите другой период.',showDetails:'Показать изменения',hideDetails:'Скрыть детали',changedFields:'Изменённые поля',valueChanged:'значение изменено',permissions:'Разрешения',item:'Запись',previous:'Назад',next:'Далее',unknownUser:'Система',loadError:'Не удалось загрузить активность сотрудников' },
  en: { title:'Employee activity',help:'See who changed what and when across orders, files, projects, production, staff and permissions.',subtitle:'Actions are stored with exact date and time. Personal and secret values are not stored in audit history.',refresh:'Refresh',today:'Today',last7:'Last 7 days',filesToday:'File actions today',ordersToday:'Order actions today',actions:'actions',fileChanges:'file changes',orderChanges:'orders / production',searchPlaceholder:'Search employee, file, order or action...',allEmployees:'All employees',allRoles:'All positions',allCategories:'All sections',allActions:'All actions',from:'From',to:'To',reset:'Reset',apply:'Apply',presetToday:'Today',preset7:'7 days',preset30:'30 days',allTime:'All time',emptyTitle:'No activity found',emptyText:'Change the filters or choose another date range.',showDetails:'Show changes',hideDetails:'Hide details',changedFields:'Changed fields',valueChanged:'value changed',permissions:'Permissions',item:'Item',previous:'Previous',next:'Next',unknownUser:'System',loadError:'Could not load employee activity' },
}

const ACTIONS = {
  hy: { 'order.created':'Ստեղծեց պատվեր','order.updated':'Փոխեց պատվերը','order.deleted':'Ջնջեց պատվերը','file.uploaded':'Վերբեռնեց ֆայլ','file.updated':'Փոխեց ֆայլը','file.deleted':'Ջնջեց ֆայլը','project.created':'Ստեղծեց PMP նախագիծ','project.updated':'Փոխեց PMP նախագիծը','project.deleted':'Ջնջեց PMP նախագիծը','project.subgroup.created':'Ստեղծեց ենթախումբ','project.subgroup.updated':'Փոխեց ենթախումբը','project.subgroup.deleted':'Ջնջեց ենթախումբը','production.created':'Ավելացրեց արտադրամասային աշխատանք','production.updated':'Փոխեց արտադրամասային աշխատանքը','production.status_changed':'Փոխեց աշխատանքի կարգավիճակը','production.operator_changed':'Փոխեց աշխատանքի պատասխանատուին','worker.created':'Ստեղծեց աշխատակից','worker.updated':'Փոխեց աշխատակցի տվյալները','worker.deleted':'Ջնջեց աշխատակցին','user.created':'Ստեղծեց օգտատեր','user.updated':'Փոխեց օգտատիրոջ տվյալները','user.deleted':'Ջնջեց օգտատիրոջը','client.created':'Ստեղծեց հաճախորդ','client.updated':'Փոխեց հաճախորդին','client.deleted':'Ջնջեց հաճախորդին','material.created':'Ստեղծեց նյութ','material.updated':'Փոխեց նյութը','material.deleted':'Ջնջեց նյութը','access.permissions_updated':'Փոխեց աշխատակցի թույլտվությունները','role.created':'Ստեղծեց հաստիք','role.updated':'Փոխեց հաստիքը','role.deleted':'Ջնջեց հաստիքը','factory.created':'Ստեղծեց արտադրամաս','factory.updated':'Փոխեց արտադրամասը','factory.deleted':'Ջնջեց արտադրամասը','file_type.created':'Ավելացրեց ֆայլի տեսակ','file_type.updated':'Փոխեց ֆայլի տեսակը','file_type.deleted':'Ջնջեց ֆայլի տեսակը','factory_order.status_changed':'Փոխեց արտադրամասի կարգավիճակը' },
  ru: { 'order.created':'Создал заказ','order.updated':'Изменил заказ','order.deleted':'Удалил заказ','file.uploaded':'Загрузил файл','file.updated':'Изменил файл','file.deleted':'Удалил файл','project.created':'Создал PMP-проект','project.updated':'Изменил PMP-проект','project.deleted':'Удалил PMP-проект','project.subgroup.created':'Создал подгруппу','project.subgroup.updated':'Изменил подгруппу','project.subgroup.deleted':'Удалил подгруппу','production.created':'Добавил производственную работу','production.updated':'Изменил производственную работу','production.status_changed':'Изменил статус работы','production.operator_changed':'Изменил исполнителя','worker.created':'Создал сотрудника','worker.updated':'Изменил сотрудника','worker.deleted':'Удалил сотрудника','user.created':'Создал пользователя','user.updated':'Изменил пользователя','user.deleted':'Удалил пользователя','client.created':'Создал клиента','client.updated':'Изменил клиента','client.deleted':'Удалил клиента','material.created':'Создал материал','material.updated':'Изменил материал','material.deleted':'Удалил материал','access.permissions_updated':'Изменил разрешения сотрудника','role.created':'Создал должность','role.updated':'Изменил должность','role.deleted':'Удалил должность','factory.created':'Создал цех','factory.updated':'Изменил цех','factory.deleted':'Удалил цех','file_type.created':'Добавил тип файла','file_type.updated':'Изменил тип файла','file_type.deleted':'Удалил тип файла','factory_order.status_changed':'Изменил статус цеха' },
  en: { 'order.created':'Created order','order.updated':'Updated order','order.deleted':'Deleted order','file.uploaded':'Uploaded file','file.updated':'Updated file','file.deleted':'Deleted file','project.created':'Created PMP project','project.updated':'Updated PMP project','project.deleted':'Deleted PMP project','project.subgroup.created':'Created subgroup','project.subgroup.updated':'Updated subgroup','project.subgroup.deleted':'Deleted subgroup','production.created':'Added production work','production.updated':'Updated production work','production.status_changed':'Changed work status','production.operator_changed':'Changed assigned operator','worker.created':'Created employee','worker.updated':'Updated employee','worker.deleted':'Deleted employee','user.created':'Created user','user.updated':'Updated user','user.deleted':'Deleted user','client.created':'Created client','client.updated':'Updated client','client.deleted':'Deleted client','material.created':'Created material','material.updated':'Updated material','material.deleted':'Deleted material','access.permissions_updated':'Changed employee permissions','role.created':'Created position','role.updated':'Updated position','role.deleted':'Deleted position','factory.created':'Created workshop','factory.updated':'Updated workshop','factory.deleted':'Deleted workshop','file_type.created':'Added file type','file_type.updated':'Updated file type','file_type.deleted':'Deleted file type','factory_order.status_changed':'Changed workshop status' },
}

const CATEGORIES = {
  hy: { orders:'Պատվերներ',files:'Ֆայլեր',projects:'Նախագծեր',production:'Արտադրություն',staff:'Աշխատակիցներ',clients:'Հաճախորդներ',materials:'Նյութեր',settings:'Կարգավորումներ',access:'Թույլտվություններ' },
  ru: { orders:'Заказы',files:'Файлы',projects:'Проекты',production:'Производство',staff:'Сотрудники',clients:'Клиенты',materials:'Материалы',settings:'Настройки',access:'Разрешения' },
  en: { orders:'Orders',files:'Files',projects:'Projects',production:'Production',staff:'Staff',clients:'Clients',materials:'Materials',settings:'Settings',access:'Access' },
}

const SUBJECTS = {
  hy: { order:'Պատվեր',pmp_file:'Ֆայլ',pmp:'PMP նախագիծ',pmp_subgroup:'Ենթախումբ',factory_order:'Արտադրամասային աշխատանք',worker:'Աշխատակից',user:'Օգտատեր',client:'Հաճախորդ',material:'Նյութ',factory:'Արտադրամաս',factory_file_extension:'Ֆայլի տեսակ',role:'Հաստիք' },
  ru: { order:'Заказ',pmp_file:'Файл',pmp:'PMP-проект',pmp_subgroup:'Подгруппа',factory_order:'Производственная работа',worker:'Сотрудник',user:'Пользователь',client:'Клиент',material:'Материал',factory:'Цех',factory_file_extension:'Тип файла',role:'Должность' },
  en: { order:'Order',pmp_file:'File',pmp:'PMP project',pmp_subgroup:'Subgroup',factory_order:'Production work',worker:'Employee',user:'User',client:'Client',material:'Material',factory:'Workshop',factory_file_extension:'File type',role:'Position' },
}

export default {
  name: 'AdminActivityPage',
  layout: 'admin',
  middleware: ['role-guard'],
  meta: { role: 'admin' },
  data() {
    return {
      loading: false,
      error: '',
      logs: [],
      summary: {},
      filterOptions: { actors: [], roles: [], categories: [], actions: [] },
      pagination: { current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
      query: { search: '', user_id: '', role: '', category: '', action: '', date_from: '', date_to: '', per_page: 40 },
      activePreset: '7d',
      expanded: {},
    }
  },
  computed: {
    locale() { const code = String(this.$i18n?.locale || 'hy').toLowerCase().split('-')[0]; return ['hy','ru','en'].includes(code) ? code : 'hy' },
    t() { return COPY[this.locale] || COPY.hy },
    presets() { return [{key:'today',label:this.t.presetToday},{key:'7d',label:this.t.preset7},{key:'30d',label:this.t.preset30},{key:'all',label:this.t.allTime}] },
    groupedLogs() {
      const groups = []
      const map = new Map()
      for (const log of this.logs) {
        const date = this.parseDate(log.created_at)
        const key = date ? this.dateKey(date) : 'unknown'
        if (!map.has(key)) {
          const group = { key, label: date ? this.formatDay(date) : '—', items: [] }
          map.set(key, group)
          groups.push(group)
        }
        map.get(key).items.push(log)
      }
      return groups
    },
  },
  mounted() {
    this.setPresetDates('7d')
    this.loadActivity(1)
  },
  methods: {
    parseDate(value) { if (!value) return null; const d = new Date(value); return Number.isNaN(d.getTime()) ? null : d },
    dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}` },
    inputDate(date) { return this.dateKey(date) },
    formatDay(date) { const locales={hy:'hy-AM',ru:'ru-RU',en:'en-GB'}; return new Intl.DateTimeFormat(locales[this.locale],{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).format(date) },
    formatTime(value) { const date=this.parseDate(value); if(!date)return '—'; return new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(date) },
    setPresetDates(key) {
      const today = new Date(); const from = new Date(today)
      if (key === 'today') { this.query.date_from=this.inputDate(today); this.query.date_to=this.inputDate(today) }
      else if (key === '7d') { from.setDate(today.getDate()-6); this.query.date_from=this.inputDate(from); this.query.date_to=this.inputDate(today) }
      else if (key === '30d') { from.setDate(today.getDate()-29); this.query.date_from=this.inputDate(from); this.query.date_to=this.inputDate(today) }
      else { this.query.date_from=''; this.query.date_to='' }
    },
    applyPreset(key) { this.activePreset=key; this.setPresetDates(key); this.loadActivity(1) },
    applyFilters() { this.loadActivity(1) },
    resetFilters() { this.query={ search:'',user_id:'',role:'',category:'',action:'',date_from:'',date_to:'',per_page:40 }; this.activePreset='7d'; this.setPresetDates('7d'); this.loadActivity(1) },
    async loadActivity(page=1) {
      this.loading=true; this.error=''
      try {
        const params={ page, ...this.query }
        Object.keys(params).forEach((key)=>{ if(params[key]==='' || params[key]===null || params[key]===undefined) delete params[key] })
        const { data } = await this.$axios.get('/api/admin/activity',{params})
        this.logs=Array.isArray(data?.logs)?data.logs:[]
        this.summary=data?.summary||{}
        this.filterOptions={ actors:data?.filters?.actors||[],roles:data?.filters?.roles||[],categories:data?.filters?.categories||[],actions:data?.filters?.actions||[] }
        this.pagination={ current_page:1,last_page:1,total:0,from:0,to:0,...(data?.pagination||{}) }
        this.expanded={}
        if (page > 1 && process.client) window.scrollTo({top:0,behavior:'smooth'})
      } catch (error) {
        this.error=error?.response?.data?.message||this.t.loadError
        this.logs=[]
      } finally { this.loading=false }
    },
    actorName(log) { return log?.user?.display_name || log?.user?.name || this.t.unknownUser },
    roleLabel(role) { if(!role)return '—'; if(this.locale==='hy'&&role.value)return role.value; const map={admin:{hy:'Ադմինիստրատոր',ru:'Администратор',en:'Administrator'},manager:{hy:'Մենեջեր',ru:'Менеджер',en:'Manager'},engineer:{hy:'Ինժեներ',ru:'Инженер',en:'Engineer'},laser:{hy:'Լազեր',ru:'Лазер',en:'Laser'},bend:{hy:'Կռում',ru:'Гибка',en:'Bending'},powder_catting:{hy:'Փոշեներկում',ru:'Порошковая покраска',en:'Powder coating'},operator:{hy:'Օպերատոր',ru:'Оператор',en:'Operator'}}; return map[role.name]?.[this.locale]||role.value||role.name },
    categoryLabel(category) { return CATEGORIES[this.locale]?.[category] || category || '—' },
    actionLabel(action) { return ACTIONS[this.locale]?.[action] || String(action||'—').replace(/[._]/g,' ') },
    subjectTypeLabel(type) { return SUBJECTS[this.locale]?.[type] || this.t.item },
    categoryShort(category) { const map={orders:'OR',files:'FL',projects:'PMP',production:'PR',staff:'ST',clients:'CL',materials:'MT',settings:'SET',access:'AC'}; return map[category]||'•' },
    categoryTone(category) { const map={orders:'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300',files:'bg-blue-50 text-blue-700 dark:bg-blue-950/35 dark:text-blue-300',projects:'bg-violet-50 text-violet-700 dark:bg-violet-950/35 dark:text-violet-300',production:'bg-amber-50 text-amber-700 dark:bg-amber-950/35 dark:text-amber-300',staff:'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/35 dark:text-cyan-300',clients:'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/35 dark:text-indigo-300',materials:'bg-lime-50 text-lime-700 dark:bg-lime-950/35 dark:text-lime-300',settings:'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',access:'bg-rose-50 text-rose-700 dark:bg-rose-950/35 dark:text-rose-300'}; return map[category]||map.settings },
    toggleDetails(id) { this.$set(this.expanded,id,!this.expanded[id]) },
    hasDetails(log) { return Boolean(log?.description || this.changeEntries(log).length || this.permissionList(log).length) },
    changeEntries(log) { const changes=log?.meta?.changes; if(!changes||typeof changes!=='object')return []; return Object.entries(changes).map(([field,value])=>({field,private:Boolean(value?.changed),from:value?.from,to:value?.to})) },
    permissionList(log) { return Array.isArray(log?.meta?.permissions)?log.meta.permissions:[] },
    prettyValue(value) { if(value===null||value===undefined||value==='')return '—'; if(typeof value==='boolean')return value?'✓':'✕'; if(typeof value==='object'){try{return JSON.stringify(value)}catch(e){return String(value)}} return String(value) },
    fieldLabel(field) { const map={status:{hy:'Կարգավիճակ',ru:'Статус',en:'Status'},operator_id:{hy:'Պատասխանատու',ru:'Исполнитель',en:'Operator'},factory_id:{hy:'Արտադրամաս',ru:'Цех',en:'Workshop'},role_id:{hy:'Հաստիք',ru:'Должность',en:'Position'},name:{hy:'Անվանում',ru:'Название',en:'Name'},description:{hy:'Նկարագրություն',ru:'Описание',en:'Description'},finish_date:{hy:'Ժամկետ',ru:'Срок',en:'Deadline'},quantity:{hy:'Քանակ',ru:'Количество',en:'Quantity'},material_type:{hy:'Նյութի տեսակ',ru:'Тип материала',en:'Material type'},thickness:{hy:'Հաստություն',ru:'Толщина',en:'Thickness'},email:{hy:'Էլ. հասցե',ru:'Email',en:'Email'},phone:{hy:'Հեռախոս',ru:'Телефон',en:'Phone'},address:{hy:'Հասցե',ru:'Адрес',en:'Address'}}; return map[field]?.[this.locale]||field },
  },
}
</script>

<style scoped>
.metric-card { @apply rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900; }
.metric-label { @apply text-[10px] font-black uppercase tracking-[0.12em] text-slate-400; }
.metric-value { @apply mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white; }
.metric-hint { @apply mt-1 text-[10px] font-semibold text-slate-400; }
.control { @apply w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-800; }
.page-btn { @apply rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800; }
</style>
