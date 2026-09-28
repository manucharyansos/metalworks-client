<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div v-if="$can('orders.create')" class="mx-auto max-w-[1450px] space-y-6">
      <section class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex items-center gap-2">
          <div><button type="button" class="mb-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" @click="goBack">← {{ t.back }}</button><h1 class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">{{ t.title }}</h1></div>
          <InfoTooltip>{{ t.help }}</InfoTooltip>
        </div>
        <div class="flex items-center gap-2"><span class="step" :class="step === 1 ? 'step-active' : ''">1</span><span class="h-px w-8 bg-slate-200 dark:bg-slate-700"></span><span class="step" :class="step === 2 ? 'step-active' : ''">2</span></div>
      </section>

      <section v-if="step === 1" class="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div class="panel-card">
          <div class="panel-heading"><span class="panel-icon">01</span><div><h2 class="panel-title">{{ t.client }}</h2><p class="panel-note">{{ t.clientHint }}</p></div></div>
          <label class="field-label">{{ t.chooseClient }} *</label>
          <select v-model="selectedClientId" class="field"><option value="">{{ t.chooseClient }}</option><option v-for="client in clients" :key="client.id" :value="String(client.id)">{{ clientLabel(client) }}</option></select>
          <div v-if="selectedClient" class="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/40"><div class="flex items-center gap-3"><div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white dark:bg-white dark:text-slate-950">{{ initials(selectedClient.name) }}</div><div class="min-w-0"><p class="truncate text-sm font-black text-slate-900 dark:text-white">{{ clientLabel(selectedClient) }}</p><p class="mt-1 truncate text-xs text-slate-400">{{ selectedClient.company_name || t.individual }}</p></div></div><div class="mt-4 grid gap-2 text-xs text-slate-500 dark:text-slate-400"><p>{{ t.phone }}: <b class="text-slate-700 dark:text-slate-200">{{ selectedClient.phone || '—' }}</b></p><p>{{ t.email }}: <b class="text-slate-700 dark:text-slate-200">{{ selectedClient.user?.email || selectedClient.email || '—' }}</b></p><p>{{ t.address }}: <b class="text-slate-700 dark:text-slate-200">{{ selectedClient.address || '—' }}</b></p></div></div>
          <div v-else class="mt-4 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-slate-800">{{ t.clientEmpty }}</div>
        </div>

        <div class="panel-card">
          <div class="panel-heading"><span class="panel-icon">02</span><div><h2 class="panel-title">{{ t.orderDetails }}</h2><p class="panel-note">{{ t.orderHint }}</p></div></div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div><label class="field-label">{{ t.pmpGroup }} *</label><select v-model="selectedPmpId" class="field" @change="onGroupChange"><option value="">{{ t.chooseGroup }}</option><option v-for="pmp in groups" :key="pmp.id" :value="String(pmp.id)">{{ pmp.group }} · {{ pmp.group_name }}</option></select></div>
            <div><label class="field-label">{{ t.pmpSubgroup }} *</label><select v-model="selectedRemoteId" class="field" :disabled="!selectedPmp" @change="onRemoteChange"><option value="">{{ t.chooseSubgroup }}</option><option v-for="remote in remotes" :key="remote.id" :value="String(remote.id)">{{ remote.remote_number }} · {{ remote.remote_number_name }}</option></select></div>
            <div><label class="field-label">{{ t.finishDate }} *</label><input v-model="finishDate" type="datetime-local" class="field" /></div>
            <div><label class="field-label">{{ t.orderName }}</label><div class="field bg-slate-100 text-slate-500 dark:bg-slate-800">{{ generatedOrderName || '—' }}</div></div>
            <div class="sm:col-span-2"><label class="field-label">{{ t.description }} *</label><textarea v-model.trim="description" rows="5" class="field resize-none" :placeholder="t.descriptionPlaceholder"></textarea></div>
          </div>
          <div class="mt-6 flex justify-end"><button type="button" class="primary-button" @click="continueToFiles">{{ t.continue }} →</button></div>
        </div>
      </section>

      <template v-else>
        <section class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div class="panel-card">
            <div class="panel-heading"><span class="panel-icon">03</span><div><h2 class="panel-title">{{ t.filesAndWorkshops }}</h2><p class="panel-note">{{ t.filesHint }}</p></div></div>
            <div v-if="!factoryGroups.length" class="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400 dark:border-slate-800">{{ t.noFiles }}</div>
            <div v-else class="space-y-4">
              <section v-for="group in factoryGroups" :key="group.factory.id" class="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <div class="flex flex-col gap-3 bg-slate-50 p-4 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between"><div><h3 class="text-sm font-black text-slate-900 dark:text-white">{{ group.factory.name }}</h3><p class="mt-1 text-[10px] text-slate-400">{{ group.files.length }} {{ t.filesLower }}</p></div><div class="w-full sm:w-64"><label class="field-label">{{ t.operator }}</label><select v-model="factoryOperators[group.factory.id]" class="field py-2"><option :value="null">{{ t.noOperator }}</option><option v-for="operator in group.factory.operators || []" :key="operator.id" :value="operator.id">{{ operator.name }}</option></select></div></div>
                <div class="grid gap-2 p-3 md:grid-cols-2">
                  <label v-for="file in group.files" :key="file.id" class="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition" :class="isFileSelected(file.id) ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'">
                    <input type="checkbox" class="mt-1 h-4 w-4 rounded" :checked="isFileSelected(file.id)" @change="toggleFile(file)" />
                    <div class="min-w-0 flex-1"><p class="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{{ file.original_name }}</p><p class="mt-1 text-[10px] text-slate-400">{{ file.material_type || file.factory?.name || group.factory.name }}</p><div v-if="isFileSelected(file.id)" class="mt-2 flex items-center gap-2"><span class="text-[10px] text-slate-400">{{ t.quantity }}</span><input v-model.number="fileQuantities[file.id]" type="number" min="1" class="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900" @click.stop /></div></div>
                  </label>
                </div>
              </section>
            </div>
          </div>

          <aside class="panel-card h-fit xl:sticky xl:top-24">
            <h2 class="panel-title">{{ t.summary }}</h2>
            <div class="mt-4 space-y-3 text-xs"><div class="summary-row"><span>{{ t.client }}</span><b>{{ selectedClient ? clientLabel(selectedClient) : '—' }}</b></div><div class="summary-row"><span>{{ t.pmp }}</span><b>{{ generatedOrderName || '—' }}</b></div><div class="summary-row"><span>{{ t.selectedFiles }}</span><b>{{ selectedFiles.length }}</b></div><div class="summary-row"><span>{{ t.workshops }}</span><b>{{ selectedFactoryCount }}</b></div><div class="summary-row"><span>{{ t.finishDate }}</span><b>{{ finishDate ? formatDate(finishDate) : '—' }}</b></div></div>
            <div class="mt-6 grid gap-2"><button type="button" class="secondary-button" @click="step = 1">← {{ t.backToDetails }}</button><button type="button" class="primary-button" :disabled="saving" @click="saveOrder">{{ saving ? t.saving : t.saveOrder }}</button></div>
          </aside>
        </section>
      </template>

      <div v-if="saving" class="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/35 backdrop-blur-sm"><div class="rounded-2xl bg-white px-6 py-4 text-sm font-bold text-slate-700 shadow-2xl dark:bg-slate-900 dark:text-slate-200"><span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800 align-middle dark:border-slate-700 dark:border-t-white"></span>{{ t.saving }}</div></div>
      <notifications />
    </div>
    <PermissionDenied v-else />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import PermissionDenied from '@/components/modals/permission/PermissionDenied.vue'

const COPY = {
  hy: { back:'Իմ պատվերները',title:'Ստեղծել նոր պատվեր',help:'Ընտրեք հաճախորդը, PMP նախագիծը, ֆայլերը և անհրաժեշտության դեպքում արտադրամասի կատարողին։',client:'Հաճախորդ',clientHint:'Ընտրեք պատվերի հաճախորդին։',chooseClient:'Ընտրել հաճախորդ',individual:'Անհատ',phone:'Հեռախոս',email:'Էլ․ փոստ',address:'Հասցե',clientEmpty:'Ընտրեք հաճախորդ՝ տվյալները տեսնելու համար։',orderDetails:'Պատվերի տվյալներ',orderHint:'Ընտրեք PMP խումբը, ենթախումբը և վերջնաժամկետը։',pmpGroup:'PMP խումբ',chooseGroup:'Ընտրել խումբ',pmpSubgroup:'Ենթախումբ',chooseSubgroup:'Ընտրել ենթախումբ',finishDate:'Ավարտի ամսաթիվ',orderName:'Պատվերի անվանում',description:'Նկարագրություն',descriptionPlaceholder:'Նկարագրեք պատվերի պահանջները...',continue:'Շարունակել ֆայլերին',filesAndWorkshops:'Ֆայլեր և արտադրամասեր',filesHint:'Ընտրեք արտադրական ֆայլերը, քանակը և անհրաժեշտության դեպքում կատարողին։',noFiles:'Ընտրված PMP ենթախմբի համար ֆայլեր չեն գտնվել։',filesLower:'ֆայլ',operator:'Կատարող',noOperator:'Չնշել կատարող',quantity:'Քանակ',summary:'Ամփոփում',pmp:'PMP',selectedFiles:'Ընտրված ֆայլեր',workshops:'Արտադրամասեր',backToDetails:'Վերադառնալ տվյալներին',saveOrder:'Պահպանել պատվերը',saving:'Պահպանվում է...',required:'Լրացրեք բոլոր պարտադիր դաշտերը։',chooseFiles:'Ընտրեք առնվազն մեկ ֆայլ։',invalidQty:'Բոլոր ընտրված ֆայլերի քանակը պետք է լինի 1 կամ ավելի։',created:'Պատվերը հաջողությամբ ստեղծվեց։',createError:'Չհաջողվեց ստեղծել պատվերը',loadError:'Չհաջողվեց բեռնել ձևի տվյալները' },
  ru: { back:'Мои заказы',title:'Создать новый заказ',help:'Выберите клиента, проект PMP, файлы и при необходимости исполнителя цеха.',client:'Клиент',clientHint:'Выберите клиента заказа.',chooseClient:'Выбрать клиента',individual:'Частное лицо',phone:'Телефон',email:'Эл. почта',address:'Адрес',clientEmpty:'Выберите клиента, чтобы увидеть данные.',orderDetails:'Данные заказа',orderHint:'Выберите группу PMP, подгруппу и срок выполнения.',pmpGroup:'Группа PMP',chooseGroup:'Выбрать группу',pmpSubgroup:'Подгруппа',chooseSubgroup:'Выбрать подгруппу',finishDate:'Срок выполнения',orderName:'Название заказа',description:'Описание',descriptionPlaceholder:'Опишите требования к заказу...',continue:'Перейти к файлам',filesAndWorkshops:'Файлы и цеха',filesHint:'Выберите производственные файлы, количество и при необходимости исполнителя.',noFiles:'Для выбранной подгруппы PMP файлы не найдены.',filesLower:'файлов',operator:'Исполнитель',noOperator:'Не назначать',quantity:'Количество',summary:'Сводка',pmp:'PMP',selectedFiles:'Выбрано файлов',workshops:'Цеха',backToDetails:'Назад к данным',saveOrder:'Сохранить заказ',saving:'Сохранение...',required:'Заполните все обязательные поля.',chooseFiles:'Выберите хотя бы один файл.',invalidQty:'Количество каждого выбранного файла должно быть не меньше 1.',created:'Заказ успешно создан.',createError:'Не удалось создать заказ',loadError:'Не удалось загрузить данные формы' },
  en: { back:'My orders',title:'Create new order',help:'Choose the client, PMP project, files and workshop operator when needed.',client:'Client',clientHint:'Choose the client for this order.',chooseClient:'Choose client',individual:'Individual',phone:'Phone',email:'Email',address:'Address',clientEmpty:'Choose a client to view their details.',orderDetails:'Order details',orderHint:'Choose the PMP group, subgroup and completion deadline.',pmpGroup:'PMP group',chooseGroup:'Choose group',pmpSubgroup:'Subgroup',chooseSubgroup:'Choose subgroup',finishDate:'Completion deadline',orderName:'Order name',description:'Description',descriptionPlaceholder:'Describe the order requirements...',continue:'Continue to files',filesAndWorkshops:'Files and workshops',filesHint:'Choose production files, quantities and an operator when needed.',noFiles:'No files were found for the selected PMP subgroup.',filesLower:'files',operator:'Operator',noOperator:'Do not assign',quantity:'Quantity',summary:'Summary',pmp:'PMP',selectedFiles:'Selected files',workshops:'Workshops',backToDetails:'Back to details',saveOrder:'Save order',saving:'Saving...',required:'Fill in all required fields.',chooseFiles:'Choose at least one file.',invalidQty:'Every selected file must have a quantity of 1 or more.',created:'Order created successfully.',createError:'Could not create order',loadError:'Could not load form data' },
}

export default {
  name:'EngineerCreateOrder',components:{PermissionDenied},layout:'engineer',middleware:['role-guard'],meta:{role:'engineer'},
  data(){return{step:1,selectedClientId:'',selectedPmpId:'',selectedRemoteId:'',finishDate:'',description:'',selectedFiles:[],fileQuantities:{},factoryOperators:{},saving:false}},
  computed:{
    ...mapGetters('factory',['getFactory']),...mapGetters('clients',['allClients']),...mapGetters('pmp',['getPmpes','getPmp']),
    locale(){const code=String(this.$i18n?.locale||'hy').toLowerCase().split('-')[0];return['hy','ru','en'].includes(code)?code:'hy'},t(){return COPY[this.locale]||COPY.hy},
    clients(){return this.allClients||[]},groups(){return this.getPmpes?.pmp||[]},selectedClient(){return this.clients.find((c)=>String(c.id)===String(this.selectedClientId))||null},selectedPmp(){return this.groups.find((p)=>String(p.id)===String(this.selectedPmpId))||null},remotes(){return Array.isArray(this.selectedPmp?.remote_number)?this.selectedPmp.remote_number:[]},selectedRemote(){return this.remotes.find((r)=>String(r.id)===String(this.selectedRemoteId))||null},generatedOrderName(){return this.selectedPmp&&this.selectedRemote?`${this.selectedPmp.group}.${this.selectedRemote.remote_number}`:''},
    pmpFiles(){return Array.isArray(this.getPmp?.files)?this.getPmp.files:[]},
    factoryGroups(){const factories=Array.isArray(this.getFactory)?this.getFactory:[];return factories.map((factory)=>({factory:{...factory,operators:factory.operators||[]},files:this.pmpFiles.filter((f)=>Number(f.factory_id)===Number(factory.id))})).filter((g)=>g.files.length)},
    selectedFactoryCount(){return new Set(this.selectedFiles.map((id)=>this.pmpFiles.find((f)=>Number(f.id)===Number(id))?.factory_id).filter(Boolean)).size},
  },
  watch:{selectedPmpId(){this.selectedRemoteId='';this.selectedFiles=[];this.fileQuantities={};this.factoryOperators={}}},
  async mounted(){try{await Promise.all([this.fetchClients(),this.fetchFactory(),this.fetchPmps()])}catch(e){this.$notify?.({type:'error',text:this.t.loadError})}},
  methods:{
    ...mapActions('factory',['fetchFactory']),...mapActions('clients',['fetchClients']),...mapActions('engineer',['createNewOrder']),...mapActions('pmp',['fetchPmps','checkPmpByRemoteNumber']),
    clientLabel(client){return [client?.name,client?.last_name].filter(Boolean).join(' ')||client?.company_name||`#${client?.id}`},initials(name){return String(name||'?').split(/\s+/).slice(0,2).map((p)=>p.charAt(0).toUpperCase()).join('')},goBack(){this.$router.push(this.localePath('/engineer'))},onGroupChange(){this.selectedRemoteId=''},
    async onRemoteChange(){if(!this.selectedRemoteId)return;this.selectedFiles=[];this.fileQuantities={};this.factoryOperators={};await this.checkPmpByRemoteNumber(this.selectedRemoteId)},
    async continueToFiles(){if(!this.selectedClient||!this.selectedPmp||!this.selectedRemote||!this.finishDate||!this.description)return this.$notify?.({type:'warning',text:this.t.required});await this.onRemoteChange();this.step=2},
    isFileSelected(id){return this.selectedFiles.map(Number).includes(Number(id))},toggleFile(file){const id=Number(file.id);if(this.isFileSelected(id)){this.selectedFiles=this.selectedFiles.filter((x)=>Number(x)!==id);this.$delete(this.fileQuantities,id)}else{this.selectedFiles.push(id);this.$set(this.fileQuantities,id,Number(file.quantity)||1)}},
    async saveOrder(){if(!this.selectedClient||!this.selectedPmp||!this.selectedRemote||!this.finishDate||!this.description)return this.$notify?.({type:'warning',text:this.t.required});if(!this.selectedFiles.length)return this.$notify?.({type:'warning',text:this.t.chooseFiles});if(this.selectedFiles.some((id)=>!this.fileQuantities[id]||Number(this.fileQuantities[id])<1))return this.$notify?.({type:'warning',text:this.t.invalidQty});const operators=Object.entries(this.factoryOperators).filter(([,userId])=>!!userId).map(([factoryId,userId])=>({factory_id:Number(factoryId),user_id:userId}));const userId=this.selectedClient.user?.id||this.selectedClient.user_id||this.selectedClient.id;const payload={user_id:userId,creator_id:this.$auth.user.id,name:this.generatedOrderName,description:this.description,quantity:null,status:'pending',finish_date:this.finishDate,remote_number_id:Number(this.selectedRemoteId),pmp_id:Number(this.selectedPmp.id),link_existing_files:true,selected_files:this.selectedFiles.map((id)=>({id,quantity:Number(this.fileQuantities[id])})),factory_operators:operators};this.saving=true;try{await this.createNewOrder(payload);this.$notify?.({type:'success',text:this.t.created});this.$router.push(this.localePath('/engineer'))}catch(e){this.$notify?.({type:'error',text:e?.response?.data?.error||e?.response?.data?.message||this.t.createError})}finally{this.saving=false}},
    formatDate(value){try{return new Intl.DateTimeFormat(this.locale==='hy'?'hy-AM':this.locale==='ru'?'ru-RU':'en-US',{dateStyle:'short',timeStyle:'short'}).format(new Date(value))}catch(e){return value}},
  },
}
</script>

<style scoped>
.panel-card{@apply rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6}.panel-heading{@apply mb-5 flex items-center gap-3}.panel-icon{@apply flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-[10px] font-black text-white dark:bg-white dark:text-slate-950}.panel-title{@apply text-lg font-black text-slate-900 dark:text-white}.panel-note{@apply mt-1 text-xs leading-5 text-slate-400}.field-label{@apply mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-400}.field{@apply w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200}.primary-button{@apply rounded-xl bg-slate-950 px-5 py-3 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950}.secondary-button{@apply rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300}.step{@apply flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-400 dark:bg-slate-800}.step-active{@apply bg-slate-950 text-white dark:bg-white dark:text-slate-950}.summary-row{@apply flex items-start justify-between gap-4 border-b border-slate-100 pb-2 dark:border-slate-800}.summary-row span{@apply text-slate-400}.summary-row b{@apply max-w-[190px] text-right text-slate-700 dark:text-slate-200}
</style>
