<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div v-if="$can('clients.view')" class="mx-auto max-w-[1500px] space-y-6">
      <ClientsToolbar :search.sync="searchQuery" @create="openCreate" />
      <ClientsTable :rows="filteredClients" :loading="loading" :submitting="submitting" @edit="openEdit" @delete="confirmDeleteClient" />
    </div>

    <div v-else class="mx-auto max-w-3xl">
      <div class="rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/35 dark:text-blue-300">+</div>
        <h1 class="mt-4 text-xl font-black text-slate-950 dark:text-white">Նոր հաճախորդ</h1>
        <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Ձեզ տրված է հաճախորդ ստեղծելու ֆունկցիան, բայց հաճախորդների ամբողջ ցուցակը դիտելու իրավունքը տրված չէ։</p>
        <button v-if="$can('clients.create') && !isFormOpen" type="button" class="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white dark:bg-white dark:text-slate-950" @click="openCreate">Բացել ստեղծման ձևը</button>
      </div>
    </div>

    <ClientFormModal
      v-if="$canAny(['clients.create', 'clients.update'])"
      :key="modalKey"
      :visible="isFormOpen"
      :client="selectedClient"
      :submitting="submitting"
      :errors="formErrors"
      :global-error="formGlobalError"
      @close="closeForm"
      @submit="handleSubmit"
    />

    <ConfirmDelete v-if="$can('clients.delete')" :item="deleteTarget" :submitting="submitting" @close="deleteTarget = null" @confirm="doDelete" />
    <notifications />
  </main>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ClientsToolbar from '~/components/clients/ClientsToolbar.vue'
import ClientsTable from '~/components/clients/ClientsTable.vue'
import ClientFormModal from '~/components/clients/ClientFormModal.vue'
import ConfirmDelete from '~/components/clients/ConfirmDelete.vue'

export default {
  components: { ClientsToolbar, ClientsTable, ClientFormModal, ConfirmDelete },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
  data() {
    return {
      loading: false,
      submitting: false,
      isFormOpen: false,
      selectedClient: null,
      deleteTarget: null,
      searchQuery: '',
      formErrors: {},
      formGlobalError: '',
      modalKey: 0,
    }
  },
  computed: {
    ...mapGetters('clients', ['allClients']),
    clients() { return Array.isArray(this.allClients) ? this.allClients : [] },
    filteredClients() {
      const q = (this.searchQuery || '').toLowerCase().trim()
      if (!q) return this.clients
      return this.clients.filter((c) => [c.name, c.phone, c.address, c.user?.email].some((value) => String(value || '').toLowerCase().includes(q)))
    },
  },
  async mounted() {
    if (this.$can('clients.view')) await this.loadClients()
    await this.openFromQuery()
  },
  watch: {
    '$route.query.create'() { this.openFromQuery() },
    '$route.query.edit'() { this.openFromQuery() },
  },
  methods: {
    ...mapActions('clients', ['fetchClients']),
    async loadClients() {
      if (!this.$can('clients.view')) return
      this.loading = true
      try {
        await this.fetchClients()
      } catch (e) {
        this.$notify?.({ type: 'error', text: e.response?.data?.message || 'Չհաջողվեց բեռնել հաճախորդներին' })
      } finally { this.loading = false }
    },
    async openFromQuery() {
      if (this.$route.query.create === '1' && this.$can('clients.create')) {
        this.openCreate()
        return
      }
      const editId = Number(this.$route.query.edit)
      if (editId && this.$can('clients.update') && this.$can('clients.view')) {
        const client = this.clients.find((item) => Number(item.id) === editId || Number(item.user_id) === editId || Number(item.user?.id) === editId)
        if (client) this.openEdit(client)
      }
    },
    openCreate() {
      if (!this.$can('clients.create')) return
      this.selectedClient = null
      this.formErrors = {}
      this.formGlobalError = ''
      this.modalKey = Date.now()
      this.isFormOpen = true
    },
    openEdit(row) {
      if (!this.$can('clients.update')) return
      this.selectedClient = row
      this.formErrors = {}
      this.formGlobalError = ''
      this.modalKey = Date.now()
      this.isFormOpen = true
    },
    closeForm() {
      this.isFormOpen = false
      this.selectedClient = null
      this.formErrors = {}
      this.formGlobalError = ''
      if (this.$route.query.create || this.$route.query.edit) {
        if (this.$can('clients.view')) this.$router.replace({ path: this.$route.path, query: {} }).catch(() => {})
        else this.$router.replace(this.localePath('/profile')).catch(() => {})
      }
    },
    confirmDeleteClient(row) { if (this.$can('clients.delete')) this.deleteTarget = row },
    async doDelete() {
      if (!this.$can('clients.delete') || !this.deleteTarget) return
      this.submitting = true
      try {
        await this.$axios.delete(`/api/clients/client/${this.deleteTarget.user_id || this.deleteTarget.user?.id}`)
        if (this.$can('clients.view')) await this.loadClients()
        this.$notify?.({ type: 'success', text: 'Հաճախորդը ջնջվեց' })
      } catch (e) {
        this.$notify?.({ text: e.response?.data?.message || 'Չհաջողվեց ջնջել հաճախորդին', type: 'error' })
      } finally {
        this.submitting = false
        this.deleteTarget = null
      }
    },
    async handleSubmit(payload) {
      const allowed = payload.isEdit ? this.$can('clients.update') : this.$can('clients.create')
      if (!allowed) return
      this.submitting = true
      this.formErrors = {}
      this.formGlobalError = ''
      try {
        if (payload.isEdit) await this.$axios.put(`/api/clients/client/${payload.id}`, payload.data)
        else await this.$axios.post('/api/clients/client', payload.data)
        if (this.$can('clients.view')) await this.loadClients()
        this.$notify?.({ type: 'success', text: payload.isEdit ? 'Հաճախորդը թարմացվեց' : 'Հաճախորդը ստեղծվեց' })
        this.closeForm()
      } catch (e) {
        if (e.response?.status === 422) {
          this.formErrors = e.response.data.errors || {}
          this.formGlobalError = e.response.data.message || 'Վավերացման սխալ է տեղի ունեցել'
        } else {
          this.formGlobalError = e.response?.data?.message || 'Սերվերում սխալ է տեղի ունեցել, փորձեք ավելի ուշ'
        }
      } finally { this.submitting = false }
    },
  },
}
</script>
