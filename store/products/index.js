export const state = () => ({
  products: [],
  product: {},
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    next_page_url: null,
    prev_page_url: null,
  },
})

export const getters = {
  getProducts: (s) => s.products,
  getProduct: (s) => s.product,
  getProductPagination: (s) => s.pagination,
}

export const mutations = {
  SET_PRODUCTS(state, products) {
    state.products = products
  },
  SET_PRODUCT(state, product) {
    state.product = product
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = pagination
  },

  ADD_PRODUCT(state, product) {
    state.products.push(product)
  },

  REPLACE_PRODUCT(state, product) {
    const i = state.products.findIndex((p) => p.id === product.id)
    if (i !== -1) state.products.splice(i, 1, product)
    if (state.product && state.product.id === product.id)
      state.product = product
  },
}

export const actions = {
  async fetchProducts(
    { commit },
    { page = 1, perPage = 10, search = '' } = {}
  ) {
    const { data } = await this.$axios.get('/api/products', {
      params: { page, per_page: perPage, search },
    })
    commit('SET_PRODUCTS', data.data || [])
    commit('SET_PAGINATION', data.pagination || null)
  },

  async fetchProduct({ commit }, id) {
    const { data } = await this.$axios.get(`/api/products/${id}`)
    if (data?.status) commit('SET_PRODUCT', data.data) // API-ի կառուցվածքից ելնելով
  },

  async createProduct({ commit }, formData) {
    const res = await this.$axios.post('/api/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const created = res.data?.data || res.data
    if (created) commit('ADD_PRODUCT', created)
    return created
  },

  async updateProduct({ commit }, { id, formData }) {
    if (!(formData instanceof FormData)) {
      const fd = new FormData()
      for (const [k, v] of Object.entries(formData || {})) fd.append(k, v)
      formData = fd
    }
    formData.append('_method', 'PUT') // method spoofing՝ multipart-ի հետ միշտ աշխատում է Laravel-ում

    const res = await this.$axios.post(`/api/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const updated = res.data?.data || res.data
    if (updated) commit('REPLACE_PRODUCT', updated)
    return updated
  },

  async deleteProduct({ commit, state }, id) {
    await this.$axios.delete(`/api/products/${id}`)
    const i = state.products.findIndex((p) => p.id === id)
    if (i !== -1) state.products.splice(i, 1)
  },
}
