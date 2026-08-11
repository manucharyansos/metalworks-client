<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <section class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Team</p>
          <h1 class="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Աշխատակիցներ</h1>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Աշխատակիցների տվյալներ, role և արտադրամասի կապ։</p>
        </div>
        <div class="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <div class="relative w-full sm:w-80">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0Z" /></svg>
            <input v-model="searchQuery" type="text" placeholder="Անուն, email, հեռախոս..." class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" />
          </div>
          <button v-if="canManageWorkerForm && $can('workers.create')" type="button" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" @click="openCreate"><span class="text-lg leading-none">+</span> Նոր աշխատակից</button>
        </div>
      </section>

      <section class="grid gap-3 sm:grid-cols-3">
        <div class="metric"><p class="metric-label">Ընդամենը</p><p class="metric-value">{{ workers.length }}</p></div>
        <div class="metric"><p class="metric-label">Արտադրամասով</p><p class="metric-value">{{ factoryAssignedCount }}</p></div>
        <div class="metric"><p class="metric-label">Role-եր</p><p class="metric-value">{{ rolesInUse }}</p></div>
      </section>

      <section class="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div v-if="loading" class="flex min-h-[280px] items-center justify-center text-sm font-semibold text-slate-400"><span class="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700 dark:border-slate-700 dark:border-t-white"></span>Բեռնվում է...</div>
        <div v-else-if="!filtered.length" class="flex min-h-[260px] flex-col items-center justify-center px-6 text-center"><div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">0</div><p class="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Աշխատակից չի գտնվել</p></div>

        <template v-else>
          <div class="hidden overflow-x-auto md:block">
            <table class="w-full min-w-[1000px] text-left">
              <thead class="bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-950/40">
                <tr><th class="px-6 py-3.5">Աշխատակից</th><th class="px-4 py-3.5">Role</th><th class="px-4 py-3.5">Արտադրամաս</th><th class="px-4 py-3.5">Հեռախոս</th><th class="px-4 py-3.5">Հասցե</th><th v-if="$canAny(['workers.update','workers.delete'])" class="px-6 py-3.5 text-right">Գործողություններ</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="u in filtered" :key="u.id" class="transition hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
                  <td class="px-6 py-4"><div class="flex items-center gap-3"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ initials(u.display_name || u.name) }}</div><div class="min-w-0"><p class="truncate text-sm font-bold text-slate-900 dark:text-white">{{ u.display_name || u.name }}</p><p class="mt-0.5 truncate text-[10px] text-slate-400">{{ u.email || '—' }}</p></div></div></td>
                  <td class="px-4 py-4"><span class="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ roleLabel(u.role) }}</span></td>
                  <td class="px-4 py-4"><span v-if="u.factory" class="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950/35 dark:text-blue-300">{{ u.factory }}</span><span v-else class="text-xs text-slate-400">—</span></td>
                  <td class="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{{ u?.worker?.phone || '—' }}</td>
                  <td class="max-w-xs px-4 py-4 text-xs text-slate-500 dark:text-slate-400"><span class="block truncate">{{ u?.worker?.address || '—' }}</span></td>
                  <td v-if="$canAny(['workers.update','workers.delete'])" class="px-6 py-4 text-right whitespace-nowrap">
                    <button v-if="canManageWorkerForm && $can('workers.update')" class="mr-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" @click="openEdit(u)">Խմբագրել</button>
                    <button v-if="$can('workers.delete')" class="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/20" @click="askDelete(u)">Ջնջել</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="space-y-3 p-4 md:hidden">
            <article v-for="u in filtered" :key="u.id" class="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div class="flex items-start gap-3"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ initials(u.display_name || u.name) }}</div><div class="min-w-0 flex-1"><p class="truncate text-sm font-bold text-slate-900 dark:text-white">{{ u.display_name || u.name }}</p><p class="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{{ u.email || '—' }}</p></div><span class="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ roleLabel(u.role) }}</span></div>
              <div class="mt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-400"><span>{{ u.factory || 'Առանց արտադրամասի' }}</span><span class="text-right">{{ u?.worker?.phone || '—' }}</span></div>
              <div v-if="$canAny(['workers.update','workers.delete'])" class="mt-4 flex justify-end gap-2"><button v-if="canManageWorkerForm && $can('workers.update')" class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300" @click="openEdit(u)">Խմբագրել</button><button v-if="$can('workers.delete')" class="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 dark:border-rose-900/60 dark:text-rose-300" @click="askDelete(u)">Ջնջել</button></div>
            </article>
          </div>
        </template>
      </section>
    </div>

    <WorkerFormModal v-if="canManageWorkerForm && $canAny(['workers.create','workers.update'])" :visible="isFormOpen" :worker="selectedWorker" :roles="roles" :factories="factories" :submitting="submitting" @close="closeForm" @submit="handleSubmit" />

    <div v-if="confirmDelete && $can('workers.delete')" class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" @click.self="confirmDelete = null">
      <div class="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"><h3 class="text-lg font-black text-slate-950 dark:text-white">Ջնջե՞լ աշխատակցին</h3><p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">«{{ confirmDelete?.display_name || confirmDelete?.name }}» հաշիվը կհեռացվի։</p><div class="mt-6 flex justify-end gap-2"><button class="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300" @click="confirmDelete = null">Չեղարկել</button><button class="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50" :disabled="submitting" @click="doDelete">{{ submitting ? 'Կատարվում է…' : 'Ջնջել' }}</button></div></div>
    </div>
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import WorkerFormModal from '~/components/users/WorkerFormModal.vue'

const ROLE_LABELS = { manager: 'Մենեջեր', bend: 'Կռում', laser: 'Լազերային կտրում', powder_catting: 'Փոշեներկում', engineer: 'Ինժիներ', admin: 'Admin' }

export default {
  components: { WorkerFormModal },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
  data() {
    return { loading: false, workers: [], searchQuery: '', isFormOpen: false, selectedWorker: null, submitting: false, confirmDelete: null }
  },
  computed: {
    ...mapGetters('roles', ['roles']),
    ...mapGetters('factory', ['getFactory']),
    factories() { return Array.isArray(this.getFactory) ? this.getFactory : [] },
    canManageWorkerForm() { return this.$can('roles.view') && this.$can('factory.view') },
    filtered() {
      const q = (this.searchQuery || '').toLowerCase().trim()
      if (!q) return this.workers
      return this.workers.filter((u) => [u.name, u.email, u?.worker?.phone, u.factory].some((value) => String(value || '').toLowerCase().includes(q)))
    },
    factoryAssignedCount() { return this.workers.filter((u) => Boolean(u.factory)).length },
    rolesInUse() { return new Set(this.workers.map((u) => u.role).filter(Boolean)).size },
  },
  async mounted() {
    if (this.canManageWorkerForm) await Promise.all([this.fetchRoles(), this.fetchFactory()])
    await this.loadWorkers()
  },
  methods: {
    ...mapActions('roles', ['fetchRoles']),
    ...mapActions('factory', ['fetchFactory']),
    initials(name) { return String(name || '?').split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') },
    roleLabel(role) { return ROLE_LABELS[role] || role || '—' },
    async loadWorkers() {
      this.loading = true
      try {
        const { data } = await this.$axios.get('/api/workers')
        this.workers = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
      } catch (e) {
        this.workers = []
        this.$notify?.({ type: 'error', text: e.response?.data?.message || 'Չհաջողվեց բեռնել աշխատակիցներին' })
      } finally { this.loading = false }
    },
    openCreate() { if (!this.$can('workers.create') || !this.canManageWorkerForm) return; this.selectedWorker = null; this.isFormOpen = true; document.documentElement.classList.add('overflow-hidden') },
    openEdit(u) { if (!this.$can('workers.update') || !this.canManageWorkerForm) return; this.selectedWorker = u; this.isFormOpen = true; document.documentElement.classList.add('overflow-hidden') },
    closeForm() { this.isFormOpen = false; this.selectedWorker = null; document.documentElement.classList.remove('overflow-hidden') },
    async handleSubmit({ payload, isEdit, id }) {
      const allowed = isEdit ? this.$can('workers.update') : this.$can('workers.create')
      if (!allowed || !this.canManageWorkerForm) return
      this.submitting = true
      try {
        if (isEdit) await this.$axios.put(`/api/workers/${id}`, payload)
        else await this.$axios.post('/api/workers', payload)
        this.closeForm(); await this.loadWorkers(); this.$notify?.({ type: 'success', text: isEdit ? 'Աշխատակիցը թարմացվեց' : 'Աշխատակիցը ստեղծվեց' })
      } catch (e) { this.$notify?.({ type: 'error', text: e.response?.data?.message || 'Սխալ՝ պահպանման ժամանակ' }) } finally { this.submitting = false }
    },
    askDelete(u) { if (this.$can('workers.delete')) this.confirmDelete = u },
    async doDelete() {
      if (!this.$can('workers.delete') || !this.confirmDelete) return
      this.submitting = true
      try { await this.$axios.delete(`/api/workers/${this.confirmDelete.id}`); this.confirmDelete = null; await this.loadWorkers(); this.$notify?.({ type: 'success', text: 'Աշխատակիցը ջնջվեց' }) }
      catch (e) { this.$notify?.({ type: 'error', text: e.response?.data?.message || 'Չհաջողվեց ջնջել աշխատակցին' }) }
      finally { this.submitting = false }
    },
  },
}
</script>

<style scoped>
.metric { @apply rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900; }
.metric-label { @apply text-[10px] font-black uppercase tracking-[0.12em] text-slate-400; }
.metric-value { @apply mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white; }
</style>
