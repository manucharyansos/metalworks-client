export default {
  namespaced: true,
  state() {
    return {
      products: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        next_page_url: null,
        prev_page_url: null
      }
    }
  },
  getters: {
    getProducts(state) {
      return state.products
    },
    getProductPagination(state) {
      return state.pagination
    }
  },
  mutations: {
    SET_PRODUCTS(state, products) {
      state.products = products
    },
    SET_PAGINATION(state, pagination) {
      state.pagination = pagination
    },
    ADD_PRODUCT(state, product) {
      state.products.push(product)
    }
  },
  actions: {
    async fetchProducts({ commit }, { page = 1, perPage = 10 } = {}) {
      try {
        const response = await this.$axios.$get(`/api/products?page=${page}&per_page=${perPage}`)
        commit('SET_PRODUCTS', response.data)
        commit('SET_PAGINATION', response.pagination)
      } catch (error) {
        console.error('Error fetching products:', error)
        throw error
      }
    },
    async createProduct({ commit }, formData) {
      try {
        const response = await this.$axios.$post('/api/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        commit('ADD_PRODUCT', response.data)
      } catch (error) {
        console.error('Error creating product:', error)
        throw error
      }
    }
  }
}