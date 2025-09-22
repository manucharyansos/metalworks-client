<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl sm:text-2xl font-semibold">Աշխատանքներ</h1>
    </div>

    <WorkTable
      :works="works"
      :pagination="pagination"
      :search-query.sync="searchQuery"
      @change-page="loadWorks"
      @edit="onEdit"
      @delete="askDelete"
      @create="openCreate"
    />

    <!-- form modal -->
    <WorkFormModal
      :visible="showModal"
      :work="editingWork"
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
      <div class="w-full max-w-md rounded-xl bg-white shadow-xl p-6">
        <h3 class="text-lg font-semibold mb-2">Ջնջե՞լ աշխատանքը</h3>
        <p class="text-gray-600 mb-6">
          Դուք պատրաստվում եք ջնջել «{{ confirmDelete?.title }}» աշխատանքը։
          Գործողությունը անշրջելի է։
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 rounded-lg border"
            @click="confirmDelete = null"
          >
            Չեղարկել
          </button>
          <button
            class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            :disabled="submitting"
            @click="doDelete"
          >
            {{ submitting ? 'Կատարվում է…' : 'Ջնջել' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WorkTable from '~/components/work/WorkTable.vue'
import WorkFormModal from '~/components/work/WorkFormModal.vue'

export default {
  components: { WorkTable, WorkFormModal },
  layout: 'ManagerLayout',
  middleware: ['manager', 'roleRedirect'],
  data() {
    return {
      works: [],
      pagination: null,
      searchQuery: '',
      debouncedSearch: null,

      showModal: false,
      editingWork: null,
      submitting: false,

      confirmDelete: null,
    }
  },
  watch: {
    searchQuery() {
      if (this.debouncedSearch) clearTimeout(this.debouncedSearch)
      this.debouncedSearch = setTimeout(() => this.loadWorks(1), 400)
    },
  },
  mounted() {
    this.loadWorks(1)
  },
  methods: {
    async loadWorks(page = 1) {
      try {
        const { data: res } = await this.$axios.get('/api/works', {
          params: { page, search: this.searchQuery || undefined },
        })
        if (res?.status !== true)
          throw new Error(res?.message || 'Server error')
        this.works = Array.isArray(res.data) ? res.data : []
        this.pagination = res.pagination || null
      } catch (e) {
        console.error('Failed to fetch works:', e)
      }
    },
    openCreate() {
      this.editingWork = null
      this.showModal = true
    },
    onEdit(work) {
      this.editingWork = work
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.editingWork = null
    },
    async onSubmit({ asFormData, isEdit, id }) {
      this.submitting = true
      try {
        if (isEdit) {
          // ✅ method override, որպեսզի ֆայլերը հասնեն Laravel-ին
          asFormData.append('_method', 'PUT')
          const { data: res } = await this.$axios.post(
            `/api/works/${id}`,
            asFormData
          )
          if (res?.status !== true)
            throw new Error(res?.message || 'Update failed')
        } else {
          const { data: res } = await this.$axios.post('/api/works', asFormData)
          if (res?.status !== true)
            throw new Error(res?.message || 'Create failed')
        }
        this.closeModal()
        await this.loadWorks(this.pagination?.current_page || 1)
      } catch (e) {
        console.error('Submit work error:', e)
        alert(
          e.response?.data?.message || e.message || 'Սխալ՝ պահպանման ժամանակ'
        )
      } finally {
        this.submitting = false
      }
    },
    askDelete(work) {
      this.confirmDelete = work
    },
    async doDelete() {
      if (!this.confirmDelete?.id) return
      this.submitting = true
      try {
        const { data: res } = await this.$axios.delete(
          `/api/works/${this.confirmDelete.id}`
        )
        if (res?.status !== true)
          throw new Error(res?.message || 'Delete failed')
        this.confirmDelete = null
        await this.loadWorks(this.pagination?.current_page || 1)
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
