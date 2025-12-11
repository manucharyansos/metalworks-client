export const state = () => ({
  items: [],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  },
  loading: false,
})

export const getters = {
  getMaterials: (s) => s.items,
  getPagination: (s) => s.pagination,
  isLoading: (s) => s.loading,
}

export const mutations = {
  SET_LOADING(state, v) {
    state.loading = !!v
  },
  SET_ITEMS(state, rows) {
    state.items = Array.isArray(rows) ? rows : []
  },
  SET_PAGINATION(state, p) {
    state.pagination = { ...state.pagination, ...(p || {}) }
  },
}

export const actions = {
  async fetchMaterials(
    { commit },
    { page = 1, perPage = 10, search = '', categoryId = null } = {}
  ) {
    commit('SET_LOADING', true)
    try {
      const { data } = await this.$axios.get('/api/materials', {
        params: {
          page,
          per_page: perPage,
          search: search || undefined,
          category_id: categoryId || undefined,
        },
      })
      commit('SET_ITEMS', data.data)
      commit('SET_PAGINATION', data.pagination)
      return true
    } catch (e) {
      console.error('fetchMaterials:', e)
      return false
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteMaterial(_, id) {
    await this.$axios.delete(`/api/materials/${id}`)
  },

  async fetchMaterialById(_, id) {
    const { data } = await this.$axios.get(`/api/materials/${id}`)
    return data.data || data
  },
}
