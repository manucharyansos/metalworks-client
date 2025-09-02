<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl sm:text-2xl font-semibold">Ապրանքներ</h1>
      <button
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
        @click="openCreate"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14m-7-7h14"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        Նոր ապրանք
      </button>
    </div>

    <ProductTable
      :products="products"
      :pagination="pagination"
      :search-query.sync="searchQuery"
      @change-page="loadProducts"
      @edit="openEdit"
      @create="openCreate"
      @delete="askDelete"
    />

    <!-- Մոդալ -->
    <ProductFormModal
      :visible="isFormOpen"
      :product="selectedProduct"
      :submitting="submitting"
      @close="closeForm"
      @submit="handleSubmit"
    />

    <!-- Delete confirm -->
    <div
      v-if="confirmDelete"
      class="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4"
      @click.self="confirmDelete = null"
    >
      <div class="w-full max-w-md rounded-xl bg-white shadow-xl p-6">
        <h3 class="text-lg font-semibold mb-2">Ջնջե՞լ ապրանքը</h3>
        <p class="text-gray-600 mb-6">
          Դուք պատրաստվում եք ջնջել «{{ confirmDelete?.name }}» ապրանքը։
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
import ProductTable from '~/components/product/ProductTable.vue'
import ProductFormModal from '~/components/product/ProductFormModal.vue'

export default {
  components: { ProductTable, ProductFormModal },
  layout: 'ManagerLayout',
  middleware: ['manager', 'roleRedirect'],
  data() {
    return {
      products: [],
      pagination: null,
      loading: false,

      searchQuery: '',
      debouncedSearch: null,

      isFormOpen: false,
      selectedProduct: null,
      submitting: false,

      confirmDelete: null,
    }
  },
  watch: {
    searchQuery() {
      if (this.debouncedSearch) clearTimeout(this.debouncedSearch)
      this.debouncedSearch = setTimeout(() => this.loadProducts(1), 400)
    },
  },
  mounted() {
    this.loadProducts(1)
  },
  methods: {
    async loadProducts(page = 1) {
      this.loading = true
      try {
        const { data: res } = await this.$axios.get('/api/products', {
          params: { page, search: this.searchQuery || undefined },
        })
        if (res?.status !== true)
          throw new Error(res?.message || 'Server error')
        this.products = Array.isArray(res.data) ? res.data : []
        this.pagination = res.pagination || null
      } catch (e) {
        console.error('Failed to fetch products:', e)
      } finally {
        this.loading = false
      }
    },

    openCreate() {
      this.selectedProduct = null
      this.isFormOpen = true
    },
    openEdit(product) {
      this.selectedProduct = product
      this.isFormOpen = true
    },
    closeForm() {
      this.isFormOpen = false
      this.selectedProduct = null
    },

    async handleSubmit({ asFormData, isEdit, id }) {
      this.submitting = true
      try {
        if (isEdit) {
          if (!(asFormData instanceof FormData)) {
            const tmp = new FormData()
            Object.entries(asFormData || {}).forEach(([k, v]) =>
              tmp.append(k, v)
            )
            asFormData = tmp
          }
          asFormData.append('_method', 'PUT')

          const { data: res } = await this.$axios.post(
            `/api/products/${id}`,
            asFormData,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
            }
          )
          if (res?.status !== true)
            throw new Error(res?.message || 'Update failed')
        } else {
          const { data: res } = await this.$axios.post(
            '/api/products',
            asFormData,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
            }
          )
          if (res?.status !== true)
            throw new Error(res?.message || 'Create failed')
        }
        this.closeForm()
        await this.loadProducts(this.pagination?.current_page || 1)
      } catch (e) {
        alert(
          e.response?.data?.message || e.message || 'Սխալ՝ պահպանման ժամանակ'
        )
      } finally {
        this.submitting = false
      }
    },

    askDelete(product) {
      this.confirmDelete = product
    },
    async doDelete() {
      if (!this.confirmDelete?.id) return
      this.submitting = true
      try {
        const { data: res } = await this.$axios.delete(
          `/api/products/${this.confirmDelete.id}`
        )
        if (res?.status !== true)
          throw new Error(res?.message || 'Delete failed')
        this.confirmDelete = null
        await this.loadProducts(this.pagination?.current_page || 1)
      } catch (e) {
        alert(e.response?.data?.message || e.message || 'Սխալ՝ ջնջելու ժամանակ')
      } finally {
        this.submitting = false
      }
    },
  },
}
</script>
