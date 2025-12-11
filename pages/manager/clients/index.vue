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
      <p
        class="flex items-center justify-center gap-2 text-lg text-red-600 font-medium py-4 bg-red-50 rounded-xl border border-red-200"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        Դուք չեք կարող դիտել ցանկը
      </p></template
    >

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
      const q = (this.searchQuery || '').toLowerCase()
      if (!q) return this.allClients
      return this.allClients.filter((c) => {
        return (
          (c.name || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q) ||
          (c.address || '').toLowerCase().includes(q)
        )
      })
    },
  },
  mounted() {
    this.loadClients()
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
      if (this.$can('clients.create')) {
        this.selectedClient = null
        this.formErrors = {}
        this.formGlobalError = ''
        this.modalKey = Date.now()
        this.isFormOpen = true
      }
    },
    openEdit(row) {
      if (this.$can('clients.view')) {
        this.selectedClient = row
        this.formErrors = {}
        this.formGlobalError = ''
        this.modalKey = Date.now()
        this.isFormOpen = true
      }
    },
    closeForm() {
      this.isFormOpen = false
      this.selectedClient = null
      this.formErrors = {}
      this.formGlobalError = ''
    },
    confirmDeleteClient(row) {
      if (this.$can('clients.delete')) {
        this.deleteTarget = row
      }
    },
    async doDelete() {
      if (this.$can('clients.delete')) {
        this.submitting = true
        try {
          await this.$axios.delete(
            `/api/clients/client/${this.deleteTarget.id}`
          )
          await this.loadClients()
        } catch (e) {
          this.$notify({ text: e, type: 'error' })
        } finally {
          this.submitting = false
          this.deleteTarget = null
        }
      }
    },
    async handleSubmit(payload) {
      if (this.$can('clients.create')) {
        this.submitting = true
        this.formErrors = {}
        this.formGlobalError = ''

        try {
          if (payload.isEdit) {
            await this.$axios.put(
              `/api/clients/client/${payload.id}`,
              payload.data
            )
          } else {
            await this.$axios.post('/api/clients/client', payload.data)
          }

          await this.loadClients()
          this.closeForm()
        } catch (e) {
          this.$notify({ text: e, type: 'error' })
          if (e.response && e.response.status === 422) {
            this.formErrors = e.response.data.errors || {}
            this.formGlobalError =
              e.response.data.message || 'Վավերացման սխալ է տեղի ունեցել'
          } else {
            this.formGlobalError =
              e.response?.data?.message ||
              'Սերվերում սխալ է տեղի ունեցել, փորձեք ավելի ուշ'
          }
        } finally {
          this.submitting = false
        }
      }
    },
  },
}
</script>
