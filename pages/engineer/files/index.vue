<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1400px] space-y-6">
      <section class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex items-center gap-2"><h1 class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">{{ t.title }}</h1><InfoTooltip>{{ t.help }}</InfoTooltip></div>
        <div class="flex flex-wrap gap-2 text-[10px] font-bold">
          <span class="rounded-full px-3 py-1.5" :class="$can('pmp.create') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'">{{ t.create }}՝ {{ $can('pmp.create') ? t.allowed : t.blocked }}</span>
          <span class="rounded-full px-3 py-1.5" :class="$can('pmp_files.view') ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/35 dark:text-blue-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'">{{ t.files }}՝ {{ $can('pmp_files.view') ? t.allowed : t.blocked }}</span>
        </div>
      </section>

      <section class="grid gap-5 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_0.8fr]">
        <div class="panel-card">
          <div class="panel-heading"><span class="step-badge">01</span><div><h2 class="panel-title">{{ t.groups }}</h2><p class="panel-note">{{ t.groupsHint }}</p></div></div>
          <div class="space-y-3">
            <div class="relative"><svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0Z" /></svg><input v-model="groupSearch" class="control pr-10" :placeholder="t.searchGroup" /></div>
            <div class="max-h-[360px] space-y-2 overflow-y-auto pr-1">
              <button v-for="group in filteredGroups" :key="group.id" type="button" class="w-full rounded-2xl border p-4 text-left transition" :class="Number(selectedGroupId) === Number(group.id) ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800'" @click="selectGroup(group)">
                <div class="flex items-center justify-between gap-3"><span class="font-mono text-sm font-black">{{ group.group }}</span><span class="text-[10px] opacity-60">{{ (group.remote_number || []).length }} {{ t.subgroupsShort }}</span></div><p class="mt-1 truncate text-xs opacity-75">{{ group.group_name }}</p>
              </button>
              <div v-if="!filteredGroups.length" class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">{{ t.noGroups }}</div>
            </div>
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-heading"><span class="step-badge">02</span><div><h2 class="panel-title">{{ t.subgroups }}</h2><p class="panel-note">{{ selectedGroup ? `${selectedGroup.group} · ${selectedGroup.group_name}` : t.chooseGroupFirst }}</p></div></div>
          <div v-if="selectedGroup" class="space-y-2">
            <button v-for="remote in selectedRemotes" :key="remote.id" type="button" class="w-full rounded-2xl border p-4 text-left transition" :class="Number(selectedRemoteId) === Number(remote.id) ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/25' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'" @click="selectedRemoteId = remote.id">
              <div class="flex items-center justify-between gap-3"><span class="font-mono text-sm font-black text-slate-900 dark:text-white">{{ remote.remote_number }}</span><span v-if="Number(selectedRemoteId) === Number(remote.id)" class="text-xs font-black text-blue-600">✓</span></div><p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ remote.remote_number_name }}</p>
            </button>
            <div v-if="!selectedRemotes.length" class="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">{{ t.noSubgroups }}</div>
          </div>
          <div v-else class="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400 dark:border-slate-800">{{ t.chooseGroupFirst }}</div>
        </div>

        <div class="panel-card flex flex-col">
          <div class="panel-heading"><span class="step-badge">03</span><div><h2 class="panel-title">{{ t.actions }}</h2><p class="panel-note">{{ t.actionsHint }}</p></div></div>
          <div class="flex flex-1 flex-col gap-3">
            <button v-if="selectedRemoteId && $can('pmp_files.view')" type="button" class="action-primary" @click="viewFiles">{{ t.openFiles }} →</button>
            <div v-else-if="selectedRemoteId" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300">{{ t.filesDenied }}</div>

            <div v-if="$can('pmp.create')" class="mt-2 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div><p class="section-title">{{ t.newGroup }}</p><div class="mt-2 grid grid-cols-[110px_1fr] gap-2"><input v-model.trim="newGroupCode" maxlength="3" class="control font-mono" placeholder="000" /><input v-model.trim="newGroupName" class="control" :placeholder="t.groupName" /></div><button class="mt-2 action-secondary" @click="createGroup">+ {{ t.createGroup }}</button></div>
              <div><p class="section-title">{{ t.newSubgroup }}</p><div class="mt-2 grid grid-cols-[110px_1fr] gap-2"><input v-model.trim="newRemoteNumber" maxlength="2" class="control font-mono" placeholder="00" :disabled="!selectedGroup" /><input v-model.trim="newRemoteName" class="control" :placeholder="t.description" :disabled="!selectedGroup" /></div><button class="mt-2 action-secondary" :disabled="!selectedGroup" @click="createRemote">+ {{ t.createSubgroup }}</button></div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <notifications />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

const COPY = {
  hy: { title:'Նախագծեր և ֆայլեր',help:'Ընտրեք PMP խումբ և ենթախումբ, ապա բացեք համապատասխան արտադրական ֆայլերը։',create:'Ստեղծում',files:'Ֆայլեր',allowed:'թույլատրված',blocked:'փակ',groups:'PMP խմբեր',groupsHint:'Ընտրեք առկա խումբ կամ ստեղծեք նորը։',searchGroup:'Որոնել խմբով կամ անվանումով...',subgroups:'Ենթախմբեր',chooseGroupFirst:'Սկզբում ընտրեք PMP խումբ։',subgroupsShort:'ենթախումբ',noGroups:'Խմբեր չեն գտնվել',noSubgroups:'Այս խմբում ենթախումբ դեռ չկա',actions:'Գործողություններ',actionsHint:'Բացեք ֆայլերը կամ ավելացրեք նոր կառուցվածք։',openFiles:'Դիտել ֆայլերը',filesDenied:'Ֆայլեր դիտելու թույլտվություն տրված չէ։',newGroup:'Նոր խումբ',groupName:'Խմբի անվանում',createGroup:'Ստեղծել խումբ',newSubgroup:'Նոր ենթախումբ',description:'Նկարագրություն',createSubgroup:'Ստեղծել ենթախումբ',selectSubgroup:'Ընտրեք ենթախումբ',fillGroup:'Լրացրեք խմբի կոդն ու անվանումը',fillRemote:'Լրացրեք ենթախմբի համարն ու նկարագրությունը',groupCreated:'Խումբը ստեղծվեց',remoteCreated:'Ենթախումբը ստեղծվեց',createError:'Չհաջողվեց ստեղծել',loadError:'Չհաջողվեց բեռնել PMP տվյալները' },
  ru: { title:'Проекты и файлы',help:'Выберите группу и подгруппу PMP, затем откройте соответствующие производственные файлы.',create:'Создание',files:'Файлы',allowed:'разрешено',blocked:'закрыто',groups:'Группы PMP',groupsHint:'Выберите существующую группу или создайте новую.',searchGroup:'Поиск по коду или названию...',subgroups:'Подгруппы',chooseGroupFirst:'Сначала выберите группу PMP.',subgroupsShort:'подгр.',noGroups:'Группы не найдены',noSubgroups:'В этой группе пока нет подгрупп',actions:'Действия',actionsHint:'Откройте файлы или добавьте новую структуру.',openFiles:'Открыть файлы',filesDenied:'Нет разрешения на просмотр файлов.',newGroup:'Новая группа',groupName:'Название группы',createGroup:'Создать группу',newSubgroup:'Новая подгруппа',description:'Описание',createSubgroup:'Создать подгруппу',selectSubgroup:'Выберите подгруппу',fillGroup:'Заполните код и название группы',fillRemote:'Заполните номер и описание подгруппы',groupCreated:'Группа создана',remoteCreated:'Подгруппа создана',createError:'Не удалось создать',loadError:'Не удалось загрузить данные PMP' },
  en: { title:'Projects and files',help:'Choose a PMP group and subgroup, then open the related production files.',create:'Create',files:'Files',allowed:'allowed',blocked:'blocked',groups:'PMP groups',groupsHint:'Choose an existing group or create a new one.',searchGroup:'Search by code or name...',subgroups:'Subgroups',chooseGroupFirst:'Choose a PMP group first.',subgroupsShort:'subgroups',noGroups:'No groups found',noSubgroups:'This group has no subgroups yet',actions:'Actions',actionsHint:'Open files or add a new structure.',openFiles:'Open files',filesDenied:'File viewing permission is not granted.',newGroup:'New group',groupName:'Group name',createGroup:'Create group',newSubgroup:'New subgroup',description:'Description',createSubgroup:'Create subgroup',selectSubgroup:'Choose a subgroup',fillGroup:'Enter the group code and name',fillRemote:'Enter the subgroup number and description',groupCreated:'Group created',remoteCreated:'Subgroup created',createError:'Could not create',loadError:'Could not load PMP data' },
}

export default {
  name:'EngineerProjects',layout:'engineer',middleware:['role-guard'],meta:{role:'engineer'},
  data(){return{groupSearch:'',selectedGroupId:null,selectedRemoteId:null,newGroupCode:'',newGroupName:'',newRemoteNumber:'',newRemoteName:''}},
  computed:{
    ...mapGetters('pmp',['getPmpes']),
    locale(){const code=String(this.$i18n?.locale||'hy').toLowerCase().split('-')[0];return['hy','ru','en'].includes(code)?code:'hy'},t(){return COPY[this.locale]||COPY.hy},
    groups(){return this.getPmpes?.pmp||[]},
    filteredGroups(){const q=this.groupSearch.trim().toLowerCase();if(!q)return this.groups;return this.groups.filter((g)=>[g.group,g.group_name].some((v)=>String(v||'').toLowerCase().includes(q)))},
    selectedGroup(){return this.groups.find((g)=>Number(g.id)===Number(this.selectedGroupId))||null},
    selectedRemotes(){return Array.isArray(this.selectedGroup?.remote_number)?this.selectedGroup.remote_number:[]},
  },
  created(){this.reload()},
  methods:{
    ...mapActions('pmp',['fetchPmps','createPmp','rememberNumberPmp']),
    async reload(){try{await this.fetchPmps()}catch(e){this.$notify?.({type:'error',text:this.t.loadError})}},
    selectGroup(group){this.selectedGroupId=group.id;this.selectedRemoteId=null},
    async createGroup(){if(!this.newGroupCode||!this.newGroupName)return this.$notify?.({type:'warning',text:this.t.fillGroup});try{await this.createPmp({group:this.newGroupCode.padStart(3,'0'),group_name:this.newGroupName,admin_confirmation:true,remote_number:null,remote_number_name:null});this.$notify?.({type:'success',text:this.t.groupCreated});this.newGroupCode='';this.newGroupName='';await this.reload()}catch(e){this.$notify?.({type:'error',text:e?.response?.data?.message||this.t.createError})}},
    async createRemote(){if(!this.selectedGroup||!this.newRemoteNumber||!this.newRemoteName)return this.$notify?.({type:'warning',text:this.t.fillRemote});try{await this.rememberNumberPmp({id:this.selectedGroup.id,group:this.selectedGroup.group,group_name:this.selectedGroup.group_name,remote_number:this.newRemoteNumber.padStart(2,'0'),remote_number_name:this.newRemoteName});this.$notify?.({type:'success',text:this.t.remoteCreated});this.newRemoteNumber='';this.newRemoteName='';await this.reload()}catch(e){this.$notify?.({type:'error',text:e?.response?.data?.message||this.t.createError})}},
    viewFiles(){if(!this.selectedRemoteId)return this.$notify?.({type:'warning',text:this.t.selectSubgroup});this.$router.push({path:this.localePath('/engineer/files/view'),query:{id:this.selectedRemoteId}})},
  },
}
</script>

<style scoped>
.panel-card{@apply rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6}.panel-heading{@apply mb-5 flex items-center gap-3}.step-badge{@apply flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-[10px] font-black text-white dark:bg-white dark:text-slate-950}.panel-title{@apply text-lg font-black text-slate-900 dark:text-white}.panel-note{@apply mt-1 text-xs leading-5 text-slate-400}.control{@apply w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200}.action-primary{@apply w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950}.action-secondary{@apply w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200}.section-title{@apply text-xs font-black text-slate-700 dark:text-slate-200}
</style>
