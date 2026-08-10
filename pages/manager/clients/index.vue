<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <ClientsToolbar :search.sync="searchQuery" @create="openCreate" />

    <ClientsTable
      v-if="$can('clients.view')"
      :rows="filteredClients"
      :loading="loading"
      :submitting="submitting"
      @edit="openEdit"
      @delete="confirmDeleteClient"
    />
    <template v-else>
      <p class="flex items-center justify-center gap-2 text-lg text-red-600 font-medium py-4 bg-red-50 rounded-xl border border-red-200">
        Դուք չեք կարող դիտել ցանկը
      </p>
    </template>

    <ClientFormModal
      :key="modalKey"
      :visible="isFormOpen"
      :client="selectedClient"
      :submitting="submitting"
      :errors="formErrors"
      :global-error="formGlobalError"
      @close="closeForm"
      @submit="handleSubmit"
    />

    <ConfirmDelete
      :item="deleteTarget"
      :submitting="submitting"
      @close="deleteTarget = null"
      @confirm="doDelete"
    />
    <notifications />
  </div>
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
    filteredClients() {
      const q = (this.searchQuery || '').toLowerCase().trim()
      if (!q) return this.allClients
      return this.allClients.filter((c) => {
        return (
          (c.name || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q) ||
          (c.address || '').toLowerCase().includes(q) ||
          (c.user?.email || '').toLowerCase().includes(q)
        )
      })
    },
  },
  mounted() {
    if (this.$can('clients.view')) this.loadClients()
  },
  methods: {
    ...mapActions('clients', ['fetchClients']),
    async loadClients() {
      this.loading = true
      try {
        await this.fetchClients()
      } finally {
        this.loading = false
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
        this.$notify({ type: 'success', text: 'Հաճախորդը ջնջվեց' })
      } catch (e) {
        this.$notify({
          text: e.response?.data?.message || 'Չհաջողվեց ջնջել հաճախորդին',
          type: 'error',
        })
      } finally {
        this.submitting = false
        this.deleteTarget = null
      }
    },
    async handleSubmit(payload) {
      const allowed = payload.isEdit
        ? this.$can('clients.update')
        : this.$can('clients.create')
      if (!allowed) return

      this.submitting = true
      this.formErrors = {}
      this.formGlobalError = ''

      try {
        if (payload.isEdit) {
          await this.$axios.put(`/api/clients/client/${payload.id}`, payload.data)
        } else {
          await this.$axios.post('/api/clients/client', payload.data)
        }

        await this.loadClients()
        this.closeForm()
        this.$notify({
          type: 'success',
          text: payload.isEdit ? 'Հաճախորդը թարմացվեց' : 'Հաճախորդը ստեղծվեց',
        })
      } catch (e) {
        if (e.response && e.response.status === 422) {
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
