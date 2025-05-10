<template>
  <ProductTable
    :products="products"
    :pagination="pagination"
    :search-query.sync="searchQuery"
    @change-page="fetchProducts"
  />
</template>

<script>
import ProductTable from '~/components/product/PtoductTable.vue'

export default {
  components: { ProductTable },
  layout: 'ManagerLayout',
  middleware: ['manager', 'roleRedirect'],
  data() {
    return {
      products: [],
      pagination: null,
      searchQuery: ''
    }
  },
  watch: {
    searchQuery(newQuery) {
      this.fetchProducts(1) // Refetch on search change
    }
  },
  mounted() {
    this.fetchProducts(1)
  },
  methods: {
    async fetchProducts(page) {
      try {
        const response = await this.$axios.get('/api/products', {
          params: { page, search: this.searchQuery }
        })
        this.products = response.data.data
        this.pagination = response.data.pagination
      } catch (error) {
        console.error('Failed to fetch products:', error)
      }
    }
  }
}
</script>
