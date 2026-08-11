<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1400px] space-y-6">
      <section class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">PMP workspace</p>
          <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Նախագծեր և ֆայլեր</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Ընտրեք կամ ստեղծեք PMP խումբ և ենթախումբ, ապա անցեք համապատասխան ֆայլերին։</p>
        </div>
        <div class="flex flex-wrap gap-2 text-[10px] font-bold">
          <span class="rounded-full px-3 py-1.5" :class="$can('pmp.create') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'">Ստեղծում՝ {{ $can('pmp.create') ? 'թույլատրված' : 'փակ' }}</span>
          <span class="rounded-full px-3 py-1.5" :class="$can('pmp_files.view') ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/35 dark:text-blue-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'">Ֆայլեր՝ {{ $can('pmp_files.view') ? 'թույլատրված' : 'փակ' }}</span>
        </div>
      </section>

      <section class="grid gap-5 xl:grid-cols-[1fr_1fr_0.72fr]">
        <div class="panel-card">
          <div class="panel-heading">
            <span class="step-badge">01</span>
            <div><p class="eyebrow">Group</p><h2 class="panel-title">Խումբ</h2></div>
          </div>

          <div class="space-y-4">
            <div class="relative">
              <label class="field-label">Ծածկագիր</label>
              <div class="relative">
                <input v-model.trim="pmpGroup" type="text" maxlength="3" class="control pr-10 font-mono" placeholder="000" autocomplete="off" @focus="openDropdown('groupCode')" @input="onGroupCodeInput" />
                <button type="button" class="picker-button" @click="toggleDropdown('groupCode')"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m19 9-7 7-7-7" /></svg></button>
              </div>
              <transition name="fade">
                <div v-if="isDD.groupCode && filteredGroupsByGroup.length" class="dropdown-card">
                  <button v-for="p in filteredGroupsByGroup" :key="p.id" type="button" class="dropdown-row" @click="applyGroup(p)"><span class="font-mono font-black text-slate-900 dark:text-white">{{ p.group }}</span><span class="min-w-0 flex-1 truncate text-right text-xs text-slate-500 dark:text-slate-400">{{ p.group_name }}</span></button>
                </div>
              </transition>
            </div>

            <div class="relative">
              <label class="field-label">Անվանում</label>
              <div class="relative">
                <input v-model.trim="pmpGroupName" type="text" class="control pr-10" placeholder="Մուտքագրեք անվանում" autocomplete="off" @focus="openDropdown('groupName')" @input="onGroupNameInput" />
                <button type="button" class="picker-button" @click="toggleDropdown('groupName')"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m19 9-7 7-7-7" /></svg></button>
              </div>
              <transition name="fade">
                <div v-if="isDD.groupName && filteredGroupsByName.length" class="dropdown-card">
                  <button v-for="p in filteredGroupsByName" :key="p.id" type="button" class="dropdown-row" @click="applyGroup(p)"><span class="min-w-0 flex-1 truncate text-left font-bold text-slate-700 dark:text-slate-200">{{ p.group_name }}</span><span class="font-mono text-xs text-slate-400">{{ p.group }}</span></button>
                </div>
              </transition>
            </div>

            <div class="rounded-2xl border p-3 text-xs" :class="isExistingGroup ? 'border-emerald-200 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400'">
              {{ isExistingGroup ? 'Խումբը գտնված է։ Կարող եք ընտրել կամ ստեղծել ենթախումբ։' : 'Մուտքագրեք առկա խումբ կամ ստեղծեք նորը։' }}
            </div>
          </div>
        </div>

        <div class="panel-card" :class="{ 'opacity-60': !isExistingGroup }">
          <div class="panel-heading">
            <span class="step-badge">02</span>
            <div><p class="eyebrow">Subgroup</p><h2 class="panel-title">Ենթախումբ</h2></div>
          </div>

          <div class="space-y-4" :class="{ 'pointer-events-none': !isExistingGroup }">
            <div class="relative">
              <label class="field-label">Համար</label>
              <div class="relative">
                <input v-model.trim="pmpRemoteNumber" type="text" maxlength="2" :disabled="!isExistingGroup" class="control pr-10 font-mono" placeholder="00" autocomplete="off" @focus="openDropdown('remoteCode')" @input="onRemoteCodeInput" />
                <button type="button" class="picker-button" :disabled="!isExistingGroup" @click="toggleDropdown('remoteCode')"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m19 9-7 7-7-7" /></svg></button>
              </div>
              <transition name="fade">
                <div v-if="isDD.remoteCode && filteredRemotesByNumber.length" class="dropdown-card">
                  <button v-for="r in filteredRemotesByNumber" :key="r.id" type="button" class="dropdown-row" @click="applyRemote(r)"><span class="font-mono font-black text-slate-900 dark:text-white">{{ r.remote_number }}</span><span class="min-w-0 flex-1 truncate text-right text-xs text-slate-500 dark:text-slate-400">{{ r.remote_number_name }}</span></button>
                </div>
              </transition>
            </div>

            <div class="relative">
              <label class="field-label">Նկարագրություն</label>
              <div class="relative">
                <input v-model.trim="pmpRemoteNumberName" type="text" :disabled="!isExistingGroup" class="control pr-10" placeholder="Մուտքագրեք նկարագրություն" autocomplete="off" @focus="openDropdown('remoteName')" @input="onRemoteNameInput" />
                <button type="button" class="picker-button" :disabled="!isExistingGroup" @click="toggleDropdown('remoteName')"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m19 9-7 7-7-7" /></svg></button>
              </div>
              <transition name="fade">
                <div v-if="isDD.remoteName && filteredRemotesByName.length" class="dropdown-card">
                  <button v-for="r in filteredRemotesByName" :key="r.id" type="button" class="dropdown-row" @click="applyRemote(r)"><span class="min-w-0 flex-1 truncate text-left font-bold text-slate-700 dark:text-slate-200">{{ r.remote_number_name }}</span><span class="font-mono text-xs text-slate-400">{{ r.remote_number }}</span></button>
                </div>
              </transition>
            </div>

            <div class="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">{{ remoteNumberId ? 'Ենթախումբը ընտրված է և պատրաստ է ֆայլերի դիտման համար։' : 'Ընտրեք առկա ենթախումբ կամ լրացրեք նորի տվյալները։' }}</div>
          </div>
        </div>

        <div class="panel-card flex flex-col">
          <div class="panel-heading"><span class="step-badge">03</span><div><p class="eyebrow">Actions</p><h2 class="panel-title">Գործողություններ</h2></div></div>
          <div class="flex flex-1 flex-col justify-center gap-3">
            <button v-if="showCreateGroup && $can('pmp.create')" type="button" class="action-button bg-emerald-600 text-white hover:bg-emerald-700" @click="addPmpGroup"><span class="action-icon">+</span><span><b>Ստեղծել խումբ</b><small>Պահպանել նոր PMP խումբ</small></span></button>
            <button v-if="showCreateRemote && $can('pmp.create')" type="button" class="action-button bg-blue-600 text-white hover:bg-blue-700" @click="addPmpGroupRemoteNumber"><span class="action-icon">+</span><span><b>Ստեղծել ենթախումբ</b><small>Ավելացնել ընտրված խմբին</small></span></button>
            <button v-if="showView && $can('pmp_files.view')" type="button" class="action-button bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" @click="viewFiles"><span class="action-icon">→</span><span><b>Դիտել ֆայլերը</b><small>Բացել ընտրված ենթախումբը</small></span></button>
            <div v-if="showView && !$can('pmp_files.view')" class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300">Ենթախումբը ընտրված է, բայց ֆայլեր դիտելու ֆունկցիան ձեզ տրված չէ։</div>
            <div v-if="!showCreateGroup && !showCreateRemote && !showView" class="rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800"><p class="text-sm font-bold text-slate-600 dark:text-slate-300">Ընտրեք տվյալները</p><p class="mt-1 text-xs leading-5 text-slate-400">Հասանելի գործողությունները կհայտնվեն այստեղ։</p></div>
          </div>
        </div>
      </section>
    </div>
    <notifications />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'EngineerProjects',
  layout: 'engineer',
  middleware: ['role-guard'],
  meta: { role: 'engineer' },
  data() {
    return {
      pmpGroup: '',
      pmpGroupName: '',
      pmpRemoteNumber: '',
      pmpRemoteNumberName: '',
      isDD: { groupCode: false, groupName: false, remoteCode: false, remoteName: false },
      pmpId: null,
      remoteNumberId: null,
      pmpRemoteNumbers: [],
    }
  },
  computed: {
    ...mapGetters('pmp', ['getPmpes']),
    filteredGroupsByGroup() {
      const q = (this.pmpGroup || '').toLowerCase()
      const list = this.getPmpes?.pmp || []
      if (!q) return list
      return list.filter((p) => String(p.group || '').toLowerCase().includes(q) || String(p.group_name || '').toLowerCase().includes(q))
    },
    filteredGroupsByName() {
      const q = (this.pmpGroupName || '').toLowerCase()
      const list = this.getPmpes?.pmp || []
      if (!q) return list
      return list.filter((p) => String(p.group_name || '').toLowerCase().includes(q) || String(p.group || '').toLowerCase().includes(q))
    },
    existingGroup() {
      const list = this.getPmpes?.pmp || []
      const code = this.pmpGroup ? this.pmpGroup.padStart(3, '0') : null
      const name = this.pmpGroupName || null
      return list.find((p) => (code && String(p.group) === code) || (name && String(p.group_name) === name)) || null
    },
    isExistingGroup() { return !!this.existingGroup },
    filteredRemotesByNumber() {
      const q = (this.pmpRemoteNumber || '').toLowerCase()
      const list = this.pmpRemoteNumbers || []
      if (!q) return list
      return list.filter((r) => String(r.remote_number || '').toLowerCase().includes(q) || String(r.remote_number_name || '').toLowerCase().includes(q))
    },
    filteredRemotesByName() {
      const q = (this.pmpRemoteNumberName || '').toLowerCase()
      const list = this.pmpRemoteNumbers || []
      if (!q) return list
      return list.filter((r) => String(r.remote_number_name || '').toLowerCase().includes(q) || String(r.remote_number || '').toLowerCase().includes(q))
    },
    showCreateGroup() { return !!this.pmpGroup && !!this.pmpGroupName && !this.isExistingGroup },
    showCreateRemote() {
      if (!this.isExistingGroup || !this.pmpRemoteNumber || !this.pmpRemoteNumberName) return false
      const num = this.pmpRemoteNumber.padStart(2, '0')
      return !(this.pmpRemoteNumbers || []).some((r) => String(r.remote_number) === String(num) || String(r.remote_number_name) === String(this.pmpRemoteNumberName))
    },
    showView() { return this.isExistingGroup && !!this.remoteNumberId },
  },
  watch: {
    pmpGroup() { this.onGroupFieldsChanged() },
    pmpGroupName() { this.onGroupFieldsChanged() },
    pmpRemoteNumber() { this.linkRemoteByInputs() },
    pmpRemoteNumberName() { this.linkRemoteByInputs() },
  },
  created() { this.fetchPmps() },
  methods: {
    ...mapActions('pmp', ['fetchPmps', 'createPmp', 'rememberNumberPmp']),
    toggleDropdown(which) { Object.keys(this.isDD).forEach((k) => (this.isDD[k] = k === which ? !this.isDD[k] : false)) },
    openDropdown(which) { Object.keys(this.isDD).forEach((k) => (this.isDD[k] = k === which)) },
    onGroupCodeInput() { this.isDD.groupCode = true },
    onGroupNameInput() { this.isDD.groupName = true },
    onRemoteCodeInput() { if (this.isExistingGroup) this.isDD.remoteCode = true },
    onRemoteNameInput() { if (this.isExistingGroup) this.isDD.remoteName = true },
    applyGroup(p) {
      this.pmpGroup = p.group
      this.pmpGroupName = p.group_name
      this.isDD.groupCode = false
      this.isDD.groupName = false
      this.onGroupFieldsChanged()
    },
    applyRemote(r) {
      this.pmpRemoteNumber = r.remote_number
      this.pmpRemoteNumberName = r.remote_number_name
      this.remoteNumberId = r.id
      this.isDD.remoteCode = false
      this.isDD.remoteName = false
    },
    onGroupFieldsChanged() {
      const g = this.existingGroup
      if (g) {
        this.pmpId = g.id
        this.pmpRemoteNumbers = Array.isArray(g.remote_number) ? g.remote_number : []
        this.linkRemoteByInputs()
      } else {
        this.pmpId = null
        this.pmpRemoteNumbers = []
        this.pmpRemoteNumber = ''
        this.pmpRemoteNumberName = ''
        this.remoteNumberId = null
      }
    },
    linkRemoteByInputs() {
      if (!this.isExistingGroup) { this.remoteNumberId = null; return }
      const list = this.pmpRemoteNumbers || []
      const num = this.pmpRemoteNumber ? this.pmpRemoteNumber.padStart(2, '0') : null
      const name = this.pmpRemoteNumberName || null
      const hit = list.find((r) => (num && String(r.remote_number) === String(num)) || (name && String(r.remote_number_name) === String(name)))
      if (hit) this.applyRemote(hit)
      else this.remoteNumberId = null
    },
    async addPmpGroup() {
      if (!this.pmpGroup || !this.pmpGroupName) { this.$notify({ type: 'error', text: 'Լրացրեք Խումբի երկու դաշտերն էլ' }); return }
      if ((this.pmpRemoteNumber && !this.pmpRemoteNumberName) || (!this.pmpRemoteNumber && this.pmpRemoteNumberName)) { this.$notify({ type: 'error', text: 'Ենթախմբի համարն ու նկարագրությունը լրացրեք միասին կամ թողեք դատարկ' }); return }
      const payload = { group: this.pmpGroup.padStart(3, '0'), group_name: this.pmpGroupName, admin_confirmation: true, remote_number: this.pmpRemoteNumber ? this.pmpRemoteNumber.padStart(2, '0') : null, remote_number_name: this.pmpRemoteNumberName || null }
      try {
        await this.createPmp(payload)
        this.$notify({ type: 'success', text: 'Խումբը ստեղծվեց' })
        this.resetAll()
        await this.fetchPmps()
      } catch (e) { this.$notify({ type: 'error', text: e?.response?.data?.message || 'Սխալ խումբ ստեղծելիս' }) }
    },
    async addPmpGroupRemoteNumber() {
      if (!this.isExistingGroup) { this.$notify({ type: 'error', text: 'Սկզբում ընտրեք խումբ' }); return }
      if (!this.pmpRemoteNumber || !this.pmpRemoteNumberName) { this.$notify({ type: 'error', text: 'Լրացրեք Ենթախմբի երկու դաշտերն էլ' }); return }
      const num = this.pmpRemoteNumber.padStart(2, '0')
      const dup = (this.pmpRemoteNumbers || []).some((r) => String(r.remote_number) === String(num) || String(r.remote_number_name) === String(this.pmpRemoteNumberName))
      if (dup) { this.$notify({ type: 'error', text: 'Այդ համարը կամ անվանումն արդեն կա այս խմբում' }); return }
      try {
        const res = await this.rememberNumberPmp({ id: this.existingGroup.id, group: this.pmpGroup.padStart(3, '0'), group_name: this.pmpGroupName, remote_number: num, remote_number_name: this.pmpRemoteNumberName })
        this.$notify({ type: 'success', text: 'Ենթախումբը ստեղծվեց' })
        await this.fetchPmps()
        const rid = res?.remote_number_id || this.findRemoteId(num, this.pmpRemoteNumberName)
        if (rid && this.$can('pmp_files.view')) this.$router.push({ path: '/engineer/files/view', query: { id: rid } })
        this.resetAll()
      } catch (e) { this.$notify({ type: 'error', text: e?.response?.data?.message || 'Սխալ ենթախումբ ստեղծելիս' }) }
    },
    viewFiles() {
      if (!this.$can('pmp_files.view')) { this.$notify({ type: 'warning', text: 'Ֆայլեր դիտելու ֆունկցիան ձեզ տրված չէ' }); return }
      if (!this.remoteNumberId) { this.$notify({ type: 'error', text: 'Ընտրեք ենթախումբ' }); return }
      this.$router.push({ path: '/engineer/files/view', query: { id: this.remoteNumberId } })
    },
    findRemoteId(num, name) {
      const g = this.getPmpes?.pmp?.find((p) => p.id === this.existingGroup?.id)
      const hit = g?.remote_number?.find((r) => String(r.remote_number) === String(num) && String(r.remote_number_name) === String(name))
      return hit?.id || null
    },
    resetAll() {
      this.pmpGroup = ''
      this.pmpGroupName = ''
      this.pmpRemoteNumber = ''
      this.pmpRemoteNumberName = ''
      this.pmpId = null
      this.remoteNumberId = null
      this.pmpRemoteNumbers = []
      Object.keys(this.isDD).forEach((k) => (this.isDD[k] = false))
    },
  },
}
</script>

<style scoped>
.panel-card { @apply rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6; }
.panel-heading { @apply mb-5 flex items-center gap-3; }
.step-badge { @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-[10px] font-black text-white dark:bg-white dark:text-slate-950; }
.eyebrow { @apply text-[9px] font-black uppercase tracking-[0.16em] text-slate-400; }
.panel-title { @apply mt-0.5 text-lg font-black text-slate-900 dark:text-white; }
.field-label { @apply mb-1.5 block text-[10px] font-black uppercase tracking-[0.1em] text-slate-400; }
.control { @apply w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-slate-600; }
.picker-button { @apply absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 transition hover:text-slate-700 disabled:opacity-40 dark:hover:text-slate-200; }
.dropdown-card { @apply absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900; }
.dropdown-row { @apply flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800; }
.action-button { @apply flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left shadow-sm transition; }
.action-button span:last-child { @apply flex min-w-0 flex-1 flex-col; }
.action-button b { @apply text-sm; }
.action-button small { @apply mt-0.5 text-[10px] opacity-70; }
.action-icon { @apply flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-base font-black; }
.fade-enter-active, .fade-leave-active { transition: all 0.18s ease; }
.fade-enter, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
