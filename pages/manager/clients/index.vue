<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <ClientsToolbar :search.sync="searchQuery" @create="openCreate" />

    <ClientsTable
      :rows="filteredClients"
      :loading="loading"
      :submitting="submitting"
      @edit="openEdit"
      @delete="confirmDeleteClient"
    />

    <ClientFormModal
      :visible="isFormOpen"
      :client="selectedClient"
      :submitting="submitting"
      @close="closeForm"
      @submit="handleSubmit"
    />

    <ConfirmDelete
      :item="deleteTarget"
      :submitting="submitting"
      @close="deleteTarget = null"
      @confirm="doDelete"
    />
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
      this.selectedClient = null
      this.isFormOpen = true
    },
    openEdit(row) {
      this.selectedClient = row
      this.isFormOpen = true
    },
    closeForm() {
      this.isFormOpen = false
      this.selectedClient = null
    },
    confirmDeleteClient(row) {
      this.deleteTarget = row
    },
    async doDelete() {
      this.submitting = true
      try {
        await this.$axios.delete(`/api/clients/client/${this.deleteTarget.id}`)
        await this.loadClients()
      } catch (e) {
        console.error(e)
      } finally {
        this.submitting = false
        this.deleteTarget = null
      }
    },
    async handleSubmit(payload) {
      this.submitting = true
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
        console.error(e)
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>
