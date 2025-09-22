<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl sm:text-2xl font-semibold">Ծառայություններ</h1>
    </div>

    <ServiceTable
      :services="services"
      :pagination="pagination"
      :search-query.sync="searchQuery"
      @change-page="loadServices"
      @edit="onEdit"
      @delete="askDelete"
      @create="openCreate"
    />

    <!-- form modal -->
    <ServiceFormModal
      :visible="showModal"
      :service="editingService"
      :submitting="submitting"
      @close="closeModal"
      @submit="onSubmit"
    />

    <!-- delete confirm -->
    <div
      v-if="confirmDelete"
      class="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4"
      @click.self="confirmDelete = null"
    >
      <div
        class="w-full max-w-md rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh] pb-[env(safe-area-inset-bottom)]"
      >
        <div class="px-6 pt-6">
          <h3 class="text-lg font-semibold mb-2">Ջնջե՞լ ծառայությունը</h3>
        </div>

        <!-- scrollable body -->
        <div class="px-6 pb-4 overflow-y-auto">
          <p class="text-gray-600">
            Դուք պատրաստվում եք ջնջել «{{ confirmDelete?.title }}»
            ծառայությունը։ Գործողությունը անշրջելի է։
          </p>
        </div>

        <!-- sticky footer -->
        <div
          class="px-6 py-4 border-t mt-auto bg-white sticky bottom-0 pb-[env(safe-area-inset-bottom)]"
        >
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 rounded-lg border"
              @click="confirmDelete = null"
            >
              Չեղարկել
            </button>
            <button
              class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              :disabled="submitting"
              @click="doDelete"
            >
              {{ submitting ? 'Կատարվում է…' : 'Ջնջել' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ServiceTable from '~/components/service/ServiceTable.vue'
import ServiceFormModal from '~/components/service/ServiceFormModal.vue'

export default {
  components: { ServiceTable, ServiceFormModal },
  layout: 'ManagerLayout',
  middleware: ['manager', 'roleRedirect'],
  data() {
    return {
      services: [],
      pagination: null,
      searchQuery: '',
      debouncedSearch: null,

      showModal: false,
      editingService: null,
      submitting: false,

      confirmDelete: null,
    }
  },
  watch: {
    searchQuery() {
      if (this.debouncedSearch) clearTimeout(this.debouncedSearch)
      this.debouncedSearch = setTimeout(() => this.loadServices(1), 400)
    },
  },
  mounted() {
    this.loadServices(1)
  },
  methods: {
    async loadServices(page = 1) {
      try {
        const { data: res } = await this.$axios.get('/api/services', {
          params: {
            page,
            // server-side եթե չունես search param, պահի՛ր, չի խանգարում
            search: this.searchQuery || undefined,
            simple: false,
          },
        })
        if (res?.status !== true)
          throw new Error(res?.message || 'Server error')
        this.services = Array.isArray(res.data) ? res.data : []
        this.pagination = res.pagination || null
      } catch (e) {
        console.error('Failed to fetch services:', e)
        alert('Չհաջողվեց բեռնել ծառայությունները')
      }
    },

    openCreate() {
      this.editingService = null
      this.showModal = true
    },
    async onEdit(service) {
      try {
        const { data: res } = await this.$axios.get(
          `/api/services/${service.id}`,
          {
            params: { full: 1 },
          }
        )
        if (res?.status !== true) throw new Error(res?.message || 'Not found')
        this.editingService = res.data // => ունի translations
        this.showModal = true
      } catch (e) {
        console.error(e)
        alert('Չհաջողվեց բեռնել ծառայությունը')
      }
    },
    closeModal() {
      this.showModal = false
      this.editingService = null
    },

    async onSubmit({ asFormData, isEdit, id }) {
      this.submitting = true
      try {
        if (isEdit) {
          asFormData.append('_method', 'PUT')
          const { data: res } = await this.$axios.post(
            `/api/services/${id}`,
            asFormData
          )
          if (res?.status !== true)
            throw new Error(res?.message || 'Update failed')
        } else {
          const { data: res } = await this.$axios.post(
            '/api/services',
            asFormData
          )
          if (res?.status !== true)
            throw new Error(res?.message || 'Create failed')
        }
        this.closeModal()
        await this.loadServices(this.pagination?.current_page || 1)
      } catch (e) {
        console.error('Submit service error:', e)
        alert(
          e.response?.data?.message || e.message || 'Սխալ՝ պահպանման ժամանակ'
        )
      } finally {
        this.submitting = false
      }
    },

    askDelete(service) {
      this.confirmDelete = service
    },
    async doDelete() {
      if (!this.confirmDelete?.id) return
      this.submitting = true
      try {
        const { data: res } = await this.$axios.delete(
          `/api/services/${this.confirmDelete.id}`
        )
        if (res?.status !== true)
          throw new Error(res?.message || 'Delete failed')
        this.confirmDelete = null
        await this.loadServices(this.pagination?.current_page || 1)
      } catch (e) {
        console.error('Delete error:', e)
        alert(e.response?.data?.message || e.message || 'Սխալ՝ ջնջելու ժամանակ')
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>
