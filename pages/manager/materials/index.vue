<template>
  <div class="p-6">
    <MaterialsToolbar
      :categories="allCategories"
      :selected-category="selectedCategory"
      :search.sync="search"
      @pick-category="pickCategory"
      @create="openCreate"
    />

    <div class="mt-5">
      <MaterialsTable
        :items="materials"
        @remove="confirmDelete"
        @edit="openEdit"
      />
    </div>

    <div class="flex items-center justify-between mt-4">
      <div class="text-sm opacity-70">
        Ընդամենը՝ {{ pagination.total }} | Էջ {{ pagination.current_page }} /
        {{ pagination.last_page }}
      </div>
      <div class="flex gap-2">
        <button
          class="px-3 py-1 rounded border"
          :disabled="pagination.current_page <= 1 || loading"
          @click="goPage(pagination.current_page - 1)"
        >
          Նախորդ
        </button>
        <button
          class="px-3 py-1 rounded border"
          :disabled="pagination.current_page >= pagination.last_page || loading"
          @click="goPage(pagination.current_page + 1)"
        >
          Հաջորդ
        </button>
      </div>
    </div>

    <!-- Confirm delete -->
    <div
      v-if="pendingDelete"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        class="absolute inset-0 bg-black/40"
        @click="pendingDelete = null"
      ></div>
      <div
        class="relative bg-white dark:bg-gray-900 rounded-xl p-5 shadow-xl w-[95%] max-w-md"
      >
        <h3 class="text-lg font-semibold mb-2">Ջնջե՞լ նյութը</h3>
        <p class="text-sm opacity-80 mb-5">
          {{ pendingDelete?.description || '—' }}
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
            @click="pendingDelete = null"
          >
            Չեղարկել
          </button>
          <button
            class="px-4 py-2 rounded bg-red-600 text-white"
            :disabled="loading"
            @click="doDelete"
          >
            Ջնջել
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit modal -->
    <MaterialFormModal
      :visible="isFormOpen"
      :item="editingItem"
      :categories="allCategories"
      :submitting="submitting"
      @close="closeForm"
      @submit="handleSubmit"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import MaterialsToolbar from '~/components/materials/MaterialsToolbar.vue'
import MaterialsTable from '~/components/materials/MaterialsTable.vue'
import MaterialFormModal from '~/components/materials/MaterialFormModal.vue'

export default {
  components: { MaterialsToolbar, MaterialsTable, MaterialFormModal },
  layout: 'manager',
  middleware: ['role-guard'],
  meta: { role: 'manager' },
  data: () => ({
    search: '',
    selectedCategory: null,
    isFormOpen: false,
    editingItem: null,
    submitting: false,
    pendingDelete: null, // <-- ԱՅՍ էր բացակայում
  }),
  computed: {
    ...mapGetters('materials', ['getMaterials', 'getPagination', 'isLoading']),
    ...mapGetters('categories', ['allCategories']),
    materials() {
      return this.getMaterials
    },
    pagination() {
      return this.getPagination
    },
    loading() {
      return this.isLoading
    },
  },
  watch: {
    search() {
      this.load(1)
    },
  },
  async mounted() {
    await this.fetchCategories()
    this.load()
  },
  methods: {
    ...mapActions('materials', ['fetchMaterials', 'deleteMaterial']), // <-- deleteMaterial mapActions-ում
    ...mapActions('categories', ['fetchCategories']),

    async load(page = 1) {
      await this.fetchMaterials({
        page,
        perPage: this.pagination.per_page || 10,
        search: this.search,
        categoryId: this.selectedCategory?.id || null,
      })
    },
    goPage(p) {
      if (p < 1 || p > this.pagination.last_page) return
      this.load(p)
    },
    pickCategory(c) {
      this.selectedCategory = c
      this.load(1)
    },
    openCreate() {
      this.editingItem = null
      this.isFormOpen = true
    },
    openEdit(row) {
      this.editingItem = row
      this.isFormOpen = true
    },
    closeForm() {
      this.isFormOpen = false
      this.editingItem = null
    },
    confirmDelete(row) {
      this.pendingDelete = row
    },

    async handleSubmit(payload) {
      this.submitting = true
      try {
        const fd = new FormData()
        Object.entries(payload.data).forEach(
          ([k, v]) => v != null && fd.append(k, v)
        )
        if (payload.isEdit) {
          fd.append('_method', 'PUT')
          await this.$axios.post(`/api/materials/${payload.id}`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        } else {
          await this.$axios.post('/api/materials', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        }
        this.$notify?.({
          type: 'success',
          text: payload.isEdit ? 'Թարմացվեց' : 'Ստեղծվեց',
        })
        await this.load(this.pagination.current_page || 1)
        this.closeForm()
      } catch (e) {
        console.error(e)
        this.$notify?.({ type: 'error', text: 'Չհաջողվեց պահել' })
      } finally {
        this.submitting = false
      }
    },

    async doDelete() {
      try {
        await this.deleteMaterial(this.pendingDelete.id)
        const backOne =
          this.materials.length <= 1 && this.pagination.current_page > 1
            ? this.pagination.current_page - 1
            : this.pagination.current_page
        this.pendingDelete = null
        await this.load(backOne)
        this.$notify?.({ type: 'success', text: 'Ջնջվեց' })
      } catch (e) {
        console.error(e)
        this.$notify?.({ type: 'error', text: 'Չհաջողվեց ջնջել' })
      }
    },
  },
}
</script>
