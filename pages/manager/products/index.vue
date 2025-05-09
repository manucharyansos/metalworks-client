<template>
  <div>
    <ProductTable
      :products="getProducts"
      :pagination="getProductPagination"
      :search-query="searchQuery"
      @update:searchQuery="updateSearchQuery"
      @change-page="handlePageChange"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ProductTable from '~/components/product/PtoductTable.vue'

export default {
  components: {
    ProductTable,
  },
  layout: 'ManagerLayout',
  middleware: ['manager', 'roleRedirect'],
  data() {
    return {
      searchQuery: '',
    }
  },
  computed: {
    ...mapGetters('products', ['getProducts', 'getProductPagination']),
  },
  mounted() {
    this.fetchProducts({ page: 1 })
  },
  methods: {
    ...mapActions('products', ['fetchProducts']),
    updateSearchQuery(newQuery) {
      this.searchQuery = newQuery
    },
    handlePageChange(page) {
      if (page > 0 && page <= this.getProductPagination.last_page) {
        this.fetchProducts({ page })
      }
    },
  },
}
</script>
