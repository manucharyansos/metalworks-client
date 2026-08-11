<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <ClientsToolbar :search.sync="searchQuery" @create="openCreate" />
      <ClientsTable :rows="filteredClients" :loading="loading" :submitting="submitting" @edit="openEdit" @delete="confirmDeleteClient" />
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
    clients() {
      return Array.isArray(this.allClients) ? this.allClients : []
    },
    filteredClients() {
      const q = (this.searchQuery || '').toLowerCase().trim()
      if (!q) return this.clients
      return this.clients.filter((c) => [c.name, c.phone, c.address, c.user?.email].some((value) => String(value || '').toLowerCase().includes(q)))
    },
  },
  async mounted() {
    await this.loadClients()
    this.openFromQuery()
  },
  watch: {
    '$route.query.create'() {
      this.openFromQuery()
    },
    '$route.query.edit'() {
      this.openFromQuery()
    },
  },
  methods: {
    ...mapActions('clients', ['fetchClients']),
    async loadClients() {
      this.loading = true
      try {
        await this.fetchClients()
      } catch (e) {
        this.$notify?.({ type: 'error', text: e.response?.data?.message || 'Չհաջողվեց բեռնել հաճախորդներին' })
      } finally {
        this.loading = false
      }
    },
    openFromQuery() {
      if (this.$route.query.create === '1' && this.$can('clients.create')) {
        this.openCreate()
        return
      }
      const editId = Number(this.$route.query.edit)
      if (editId && this.$can('clients.update')) {
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
        this.$router.replace({ path: this.$route.path, query: {} }).catch(() => {})
      }
    },
    confirmDeleteClient(row) {
      if (this.$can('clients.delete')) this.deleteTarget = row
    },
    async doDelete() {
      if (!this.$can('clients.delete') || !this.deleteTarget) return
      this.submitting = true
      try {
        await this.$axios.delete(`/api/clients/client/${this.deleteTarget.user_id || this.deleteTarget.user?.id}`)
        await this.loadClients()
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
        await this.loadClients()
        this.closeForm()
        this.$notify?.({ type: 'success', text: payload.isEdit ? 'Հաճախորդը թարմացվեց' : 'Հաճախորդը ստեղծվեց' })
      } catch (e) {
        if (e.response?.status === 422) {
          this.formErrors = e.response.data.errors || {}
          this.formGlobalError = e.response.data.message || 'Վավերացման սխալ է տեղի ունեցել'
        } else {
          this.formGlobalError = e.response?.data?.message || 'Սերվերում սխալ է տեղի ունեցել, փորձեք ավելի ուշ'
        }
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>
