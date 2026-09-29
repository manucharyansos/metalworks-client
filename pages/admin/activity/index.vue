<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <section class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">{{ t.title }}</h1>
          <InfoTooltip>{{ t.help }}</InfoTooltip>
        </div>
        <button type="button" class="btn-secondary" :disabled="loading" @click="loadActivity(1)">
          <span :class="{ 'animate-spin': loading }">↻</span> {{ t.refresh }}
        </button>
      </section>

      <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="metric-card"><p class="metric-label">{{ t.today }}</p><p class="metric-value">{{ summary.today || 0 }}</p><p class="metric-hint">{{ t.actions }}</p></div>
        <div class="metric-card"><p class="metric-label">{{ t.last7 }}</p><p class="metric-value">{{ summary.last_7_days || 0 }}</p><p class="metric-hint">{{ t.actions }}</p></div>
        <div class="metric-card"><p class="metric-label">{{ t.filesToday }}</p><p class="metric-value">{{ summary.files_today || 0 }}</p><p class="metric-hint">{{ t.fileChanges }}</p></div>
        <div class="metric-card"><p class="metric-label">{{ t.ordersToday }}</p><p class="metric-value">{{ summary.orders_today || 0 }}</p><p class="metric-hint">{{ t.orderChanges }}</p></div>
      </section>

      <section class="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div class="flex flex-wrap gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <button v-for="preset in presets" :key="preset.key" type="button" class="rounded-xl px-3 py-2 text-xs font-bold transition" :class="activePreset === preset.key ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'" @click="applyPreset(preset.key)">{{ preset.label }}</button>
        </div>

        <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div class="relative xl:col-span-2">
            <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0Z" /></svg>
            <input v-model.trim="query.search" class="control pr-10" :placeholder="t.searchPlaceholder" @keyup.enter="applyFilters" />
          </div>
          <select v-model="query.user_id" class="control"><option value="">{{ t.allEmployees }}</option><option v-for="actor in filterOptions.actors" :key="actor.id" :value="String(actor.id)">{{ actor.display_name || actor.name }}</option></select>
          <select v-model="query.role" class="control"><option value="">{{ t.allRoles }}</option><option v-for="role in filterOptions.roles" :key="role.name" :value="role.name">{{ roleLabel(role) }}</option></select>
          <select v-model="query.category" class="control"><option value="">{{ t.allCategories }}</option><option v-for="category in filterOptions.categories" :key="category" :value="category">{{ categoryLabel(category) }}</option></select>
          <select v-model="query.action" class="control"><option value="">{{ t.allActions }}</option><option v-for="action in filterOptions.actions" :key="action" :value="action">{{ actionLabel(action) }}</option></select>
          <label><span class="field-label">{{ t.from }}</span><input v-model="query.date_from" type="date" class="control" @change="activePreset = 'custom'" /></label>
          <label><span class="field-label">{{ t.to }}</span><input v-model="query.date_to" type="date" class="control" @change="activePreset = 'custom'" /></label>
        </div>
        <div class="mt-4 flex justify-end gap-2"><button type="button" class="btn-secondary" @click="resetFilters">{{ t.reset }}</button><button type="button" class="btn-primary" @click="applyFilters">{{ t.apply }}</button></div>
      </section>

      <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-300">{{ error }}</div>
      <div v-if="loading" class="flex min-h-[320px] items-center justify-center"><span class="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800 dark:border-slate-700 dark:border-t-white"></span></div>

      <section v-else-if="groupedLogs.length" class="space-y-7">
        <div v-for="group in groupedLogs" :key="group.key" class="space-y-3">
          <div class="sticky top-16 z-10 flex items-center gap-3 bg-slate-50/95 py-2 backdrop-blur dark:bg-slate-950/95"><div class="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div><p class="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-black text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">{{ group.label }}</p><div class="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div></div>

          <article v-for="log in group.items" :key="log.id" class="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div class="flex flex-col gap-4 lg:flex-row">
              <div class="shrink-0 lg:w-28"><p class="font-mono text-sm font-black text-slate-900 dark:text-white">{{ formatTime(log.created_at) }}</p><p class="mt-1 text-[10px] font-bold text-slate-400">#{{ log.id }}</p></div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2"><span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ categoryLabel(log.category) }}</span><span class="text-xs font-black text-slate-950 dark:text-white">{{ actionLabel(log.action) }}</span></div>
                <div class="mt-2 flex flex-wrap items-center gap-2 text-sm"><span class="font-black text-slate-900 dark:text-white">{{ actorName(log) }}</span><span v-if="log.user?.role" class="text-slate-300">•</span><span v-if="log.user?.role" class="font-semibold text-slate-500 dark:text-slate-400">{{ roleLabel(log.user.role) }}</span><span v-if="log.user?.factory" class="text-slate-300">•</span><span v-if="log.user?.factory" class="text-slate-500 dark:text-slate-400">{{ log.user.factory.name }}</span></div>
                <div v-if="log.subject_label || log.subject_id" class="mt-3 rounded-2xl bg-slate-50 px-3.5 py-3 dark:bg-slate-950/45"><p class="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{{ subjectTypeLabel(log.subject_type) }}</p><p class="mt-1 break-words text-sm font-bold text-slate-700 dark:text-slate-200">{{ log.subject_label || `${t.item} #${log.subject_id}` }}</p></div>
                <button v-if="hasDetails(log)" type="button" class="mt-3 text-xs font-black text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white" @click="toggleDetails(log.id)">{{ expanded[log.id] ? t.hideDetails : t.showDetails }}</button>
                <div v-if="expanded[log.id]" class="mt-3 space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/35">
                  <div v-for="entry in changeEntries(log)" :key="entry.field" class="grid gap-1 rounded-xl bg-white p-3 text-xs dark:bg-slate-900 sm:grid-cols-[160px_1fr]"><span class="font-black text-slate-600 dark:text-slate-300">{{ fieldLabel(entry.field) }}</span><span v-if="entry.private" class="text-slate-400">{{ t.valueChanged }}</span><span v-else class="break-words text-slate-500 dark:text-slate-400">{{ prettyValue(entry.from) }} → {{ prettyValue(entry.to) }}</span></div>
                  <div v-if="permissionList(log).length" class="flex flex-wrap gap-1.5"><span v-for="permission in permissionList(log)" :key="permission" class="rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-300">{{ permission }}</span></div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section v-else class="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900"><h2 class="text-base font-black text-slate-800 dark:text-slate-100">{{ t.emptyTitle }}</h2><p class="mt-1 text-sm text-slate-400">{{ t.emptyText }}</p></section>

      <div v-if="pagination.last_page > 1" class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"><p class="text-xs font-semibold text-slate-400">{{ pagination.from || 0 }}–{{ pagination.to || 0 }} / {{ pagination.total || 0 }}</p><div class="flex items-center gap-2"><button class="page-btn" :disabled="pagination.current_page <= 1" @click="loadActivity(pagination.current_page - 1)">← {{ t.previous }}</button><span class="text-xs font-black">{{ pagination.current_page }} / {{ pagination.last_page }}</span><button class="page-btn" :disabled="pagination.current_page >= pagination.last_page" @click="loadActivity(pagination.current_page + 1)">{{ t.next }} →</button></div></div>
    </div>
    <notifications />
  </main>
</template>

<script>
const COPY = {
  hy: { title:'Աշխատակիցների գործունեություն',help:'Տեսեք՝ ով, երբ և ինչ է ստեղծել, փոխել կամ ջնջել համակարգում։',refresh:'Թարմացնել',today:'Այսօր',last7:'Վերջին 7 օրը',filesToday:'Ֆայլեր այսօր',ordersToday:'Պատվերներ այսօր',actions:'գործողություն',fileChanges:'ֆայլային գործողություն',orderChanges:'պատվեր/արտադրություն',searchPlaceholder:'Որոնել աշխատակցով, պատվերով կամ ֆայլով...',allEmployees:'Բոլոր աշխատակիցները',allRoles:'Բոլոր հաստիքները',allCategories:'Բոլոր բաժինները',allActions:'Բոլոր գործողությունները',from:'Սկսած',to:'Մինչև',reset:'Մաքրել',apply:'Կիրառել',presetToday:'Այսօր',preset7:'7 օր',preset30:'30 օր',allTime:'Ամբողջ ժամանակը',emptyTitle:'Գործողություններ չեն գտնվել',emptyText:'Փոխեք ֆիլտրերը կամ ժամանակահատվածը։',showDetails:'Տեսնել փոփոխությունները',hideDetails:'Փակել մանրամասները',valueChanged:'Արժեքը փոխվել է',previous:'Նախորդ',next:'Հաջորդ',item:'Տվյալ' },
  ru: { title:'Активность сотрудников',help:'Смотрите, кто, когда и что создал, изменил или удалил в системе.',refresh:'Обновить',today:'Сегодня',last7:'Последние 7 дней',filesToday:'Файлы сегодня',ordersToday:'Заказы сегодня',actions:'действий',fileChanges:'операций с файлами',orderChanges:'заказы/производство',searchPlaceholder:'Поиск по сотруднику, заказу или файлу...',allEmployees:'Все сотрудники',allRoles:'Все должности',allCategories:'Все разделы',allActions:'Все действия',from:'С',to:'По',reset:'Сбросить',apply:'Применить',presetToday:'Сегодня',preset7:'7 дней',preset30:'30 дней',allTime:'Всё время',emptyTitle:'Действия не найдены',emptyText:'Измените фильтры или период.',showDetails:'Показать изменения',hideDetails:'Скрыть детали',valueChanged:'Значение изменено',previous:'Назад',next:'Далее',item:'Объект' },
  en: { title:'Employee activity',help:'See who created, changed or deleted what in the system and when.',refresh:'Refresh',today:'Today',last7:'Last 7 days',filesToday:'Files today',ordersToday:'Orders today',actions:'actions',fileChanges:'file actions',orderChanges:'orders/production',searchPlaceholder:'Search employee, order or file...',allEmployees:'All employees',allRoles:'All positions',allCategories:'All sections',allActions:'All actions',from:'From',to:'To',reset:'Reset',apply:'Apply',presetToday:'Today',preset7:'7 days',preset30:'30 days',allTime:'All time',emptyTitle:'No activity found',emptyText:'Change the filters or date range.',showDetails:'Show changes',hideDetails:'Hide details',valueChanged:'Value changed',previous:'Previous',next:'Next',item:'Item' },
}

const ROLE_LABELS = {
  hy:{admin:'Ադմինիստրատոր',manager:'Մենեջեր',engineer:'Ինժեներ',laser:'Լազերային կտրում',bend:'Կռում',powder_catting:'Փոշեներկում',operator:'Օպերատոր'},
  ru:{admin:'Администратор',manager:'Менеджер',engineer:'Инженер',laser:'Лазерная резка',bend:'Гибка',powder_catting:'Порошковая покраска',operator:'Оператор'},
  en:{admin:'Administrator',manager:'Manager',engineer:'Engineer',laser:'Laser cutting',bend:'Bending',powder_catting:'Powder coating',operator:'Operator'},
}

const CATEGORY_LABELS = {
  hy:{orders:'Պատվերներ',files:'Ֆայլեր',pmp:'PMP',production:'Արտադրություն',staff:'Աշխատակիցներ',clients:'Հաճախորդներ',materials:'Նյութեր',settings:'Կարգավորումներ',permissions:'Թույլտվություններ'},
  ru:{orders:'Заказы',files:'Файлы',pmp:'PMP',production:'Производство',staff:'Сотрудники',clients:'Клиенты',materials:'Материалы',settings:'Настройки',permissions:'Разрешения'},
  en:{orders:'Orders',files:'Files',pmp:'PMP',production:'Production',staff:'Employees',clients:'Clients',materials:'Materials',settings:'Settings',permissions:'Permissions'},
}

const ACTION_LABELS = {
  hy:{created:'Ստեղծեց',updated:'Փոխեց',deleted:'Ջնջեց','file.uploaded':'Ավելացրեց ֆայլ','file.deleted':'Ջնջեց ֆայլ','permissions.updated':'Փոխեց թույլտվությունները'},
  ru:{created:'Создал',updated:'Изменил',deleted:'Удалил','file.uploaded':'Добавил файл','file.deleted':'Удалил файл','permissions.updated':'Изменил разрешения'},
  en:{created:'Created',updated:'Updated',deleted:'Deleted','file.uploaded':'Uploaded file','file.deleted':'Deleted file','permissions.updated':'Changed permissions'},
}

export default {
  name:'AdminActivityPage',layout:'admin',middleware:['role-guard'],meta:{role:'admin'},
  data(){return{loading:false,error:'',logs:[],summary:{},filterOptions:{actors:[],roles:[],categories:[],actions:[]},pagination:{current_page:1,last_page:1,total:0,from:0,to:0},query:{search:'',user_id:'',role:'',category:'',action:'',date_from:'',date_to:''},activePreset:'7',expanded:{}}},
  computed:{
    locale(){const code=String(this.$i18n?.locale||'hy').toLowerCase().split('-')[0];return['hy','ru','en'].includes(code)?code:'hy'},t(){return COPY[this.locale]||COPY.hy},
    presets(){return[{key:'today',label:this.t.presetToday},{key:'7',label:this.t.preset7},{key:'30',label:this.t.preset30},{key:'all',label:this.t.allTime}]},
    groupedLogs(){const groups=new Map();this.logs.forEach((log)=>{const d=new Date(log.created_at);const key=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;if(!groups.has(key))groups.set(key,{key,label:new Intl.DateTimeFormat(this.locale,{year:'numeric',month:'long',day:'numeric'}).format(d),items:[]});groups.get(key).items.push(log)});return Array.from(groups.values())},
  },
  created(){this.applyPreset('7')},
  methods:{
    localDate(offset=0){const d=new Date();d.setDate(d.getDate()+offset);const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return`${y}-${m}-${day}`},
    applyPreset(key){this.activePreset=key;this.query.date_to=key==='all'?'':this.localDate(0);this.query.date_from=key==='today'?this.localDate(0):key==='7'?this.localDate(-6):key==='30'?this.localDate(-29):'';this.loadActivity(1)},
    applyFilters(){this.loadActivity(1)},resetFilters(){this.query={search:'',user_id:'',role:'',category:'',action:'',date_from:'',date_to:''};this.applyPreset('7')},
    async loadActivity(page=1){this.loading=true;this.error='';try{const params={page,per_page:40};Object.entries(this.query).forEach(([k,v])=>{if(v)params[k]=v});const data=await this.$axios.$get('/api/admin/activity',{params});this.logs=Array.isArray(data.logs)?data.logs:[];this.summary=data.summary||{};this.filterOptions=data.filters||{actors:[],roles:[],categories:[],actions:[]};this.pagination=data.pagination||this.pagination}catch(e){this.error=e?.response?.data?.message||e?.message||'Error'}finally{this.loading=false}},
    formatTime(value){return new Intl.DateTimeFormat(this.locale,{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(value))},
    actorName(log){return log.user?.display_name||log.user?.name||'—'},roleLabel(role){const name=role?.name||role||'';return ROLE_LABELS[this.locale]?.[name]||role?.value||name||'—'},categoryLabel(key){return CATEGORY_LABELS[this.locale]?.[key]||key||'—'},actionLabel(key){const simple=String(key||'').split('.').pop();return ACTION_LABELS[this.locale]?.[key]||ACTION_LABELS[this.locale]?.[simple]||key||'—'},subjectTypeLabel(type){const map={order:{hy:'Պատվեր',ru:'Заказ',en:'Order'},pmp_file:{hy:'Ֆայլ',ru:'Файл',en:'File'},pmp:{hy:'PMP',ru:'PMP',en:'PMP'},worker:{hy:'Աշխատակից',ru:'Сотрудник',en:'Employee'},factory_order:{hy:'Արտադրական աշխատանք',ru:'Производственная работа',en:'Production work'}};return map[type]?.[this.locale]||type||this.t.item},
    hasDetails(log){return this.changeEntries(log).length>0||this.permissionList(log).length>0},toggleDetails(id){this.$set(this.expanded,id,!this.expanded[id])},
    changeEntries(log){const changes=log?.meta?.changes||{};return Object.keys(changes).map((field)=>({field,from:changes[field]?.from,to:changes[field]?.to,private:Boolean(changes[field]?.private)}))},permissionList(log){return log?.meta?.permissions||log?.meta?.permission_slugs||[]},
    fieldLabel(field){return String(field||'').replace(/_/g,' ')},prettyValue(value){if(value===null||value===undefined||value==='')return'—';if(typeof value==='object')return JSON.stringify(value);return String(value)},
  },
}
</script>

<style scoped>
.control{@apply w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200}.field-label{@apply mb-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400}.metric-card{@apply rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900}.metric-label{@apply text-[10px] font-black uppercase tracking-[0.12em] text-slate-400}.metric-value{@apply mt-2 text-2xl font-black text-slate-950 dark:text-white}.metric-hint{@apply mt-1 text-xs text-slate-400}.btn-primary{@apply rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-slate-950}.btn-secondary{@apply rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300}.page-btn{@apply rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300}
</style>
