<template>
  <main class="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="mx-auto max-w-[1500px] space-y-6">
      <MaterialsToolbar
        :categories="allCategories"
        :selected-category="selectedCategory"
        :search.sync="search"
        @pick-category="pickCategory"
        @create="openCreate"
      />

      <MaterialsTable :items="materials" @remove="confirmDelete" @edit="openEdit" />

      <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>Ընդամենը՝ <b class="text-slate-800 dark:text-slate-200">{{ pagination.total }}</b> · Էջ {{ pagination.current_page }} / {{ pagination.last_page }}</span>
        <div class="flex gap-2">
          <button class="rounded-xl border border-slate-200 px-3 py-2 font-bold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800" :disabled="pagination.current_page <= 1 || loading" @click="goPage(pagination.current_page - 1)">Նախորդ</button>
          <button class="rounded-xl border border-slate-200 px-3 py-2 font-bold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800" :disabled="pagination.current_page >= pagination.last_page || loading" @click="goPage(pagination.current_page + 1)">Հաջորդ</button>
        </div>
      </div>
    </div>

    <div v-if="pendingDelete && $can('materials.delete')" class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" @click.self="pendingDelete = null">
      <div class="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 7h12m-10 0 1 13h6l1-13M9 7V4h6v3" /></svg>
        </div>
        <h3 class="mt-4 text-lg font-black text-slate-950 dark:text-white">Ջնջե՞լ նյութը</h3>
        <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ pendingDelete?.description || '—' }}</p>
        <div class="mt-6 flex justify-end gap-2">
          <button class="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300" @click="pendingDelete = null">Չեղարկել</button>
          <button class="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50" :disabled="loading" @click="doDelete">Ջնջել</button>
        </div>
      </div>
    </div>

    <MaterialFormModal v-if="$canAny(['materials.create', 'materials.update'])" :visible="isFormOpen" :item="editingItem" :categories="allCategories" :submitting="submitting" @close="closeForm" @submit="handleSubmit" />
  </main>
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
    pendingDelete: null,
  }),
  computed: {
    ...mapGetters('materials', ['getMaterials', 'getPagination', 'isLoading']),
    ...mapGetters('categories', ['allCategories']),
    materials() {
      return this.getMaterials || []
    },
    pagination() {
      return this.getPagination || { current_page: 1, total: 0, last_page: 1, per_page: 10 }
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
    await this.load()
  },
  methods: {
    ...mapActions('materials', ['fetchMaterials', 'deleteMaterial']),
    ...mapActions('categories', ['fetchCategories']),
    async load(page = 1) {
      await this.fetchMaterials({ page, perPage: this.pagination.per_page || 10, search: this.search, categoryId: this.selectedCategory?.id || null })
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
      if (!this.$can('materials.create')) return
      this.editingItem = null
      this.isFormOpen = true
    },
    openEdit(row) {
      if (!this.$can('materials.update')) return
      this.editingItem = row
      this.isFormOpen = true
    },
    closeForm() {
      this.isFormOpen = false
      this.editingItem = null
    },
    confirmDelete(row) {
      if (this.$can('materials.delete')) this.pendingDelete = row
    },
    async handleSubmit(payload) {
      const allowed = payload.isEdit ? this.$can('materials.update') : this.$can('materials.create')
      if (!allowed) return
      this.submitting = true
      try {
        const fd = new FormData()
        Object.entries(payload.data).forEach(([k, v]) => v != null && fd.append(k, v))
        if (payload.isEdit) {
          fd.append('_method', 'PUT')
          await this.$axios.post(`/api/materials/${payload.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        } else {
          await this.$axios.post('/api/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        }
        this.$notify?.({ type: 'success', text: payload.isEdit ? 'Թարմացվեց' : 'Ստեղծվեց' })
        await this.load(this.pagination.current_page || 1)
        this.closeForm()
      } catch (e) {
        this.$notify?.({ type: 'error', text: e.response?.data?.message || 'Չհաջողվեց պահպանել նյութը' })
      } finally {
        this.submitting = false
      }
    },
    async doDelete() {
      if (!this.$can('materials.delete') || !this.pendingDelete) return
      try {
        await this.deleteMaterial(this.pendingDelete.id)
        const backOne = this.materials.length <= 1 && this.pagination.current_page > 1 ? this.pagination.current_page - 1 : this.pagination.current_page
        this.pendingDelete = null
        await this.load(backOne)
        this.$notify?.({ type: 'success', text: 'Ջնջվեց' })
      } catch (e) {
        this.$notify?.({ type: 'error', text: e.response?.data?.message || 'Չհաջողվեց ջնջել նյութը' })
      }
    },
  },
}
</script>
