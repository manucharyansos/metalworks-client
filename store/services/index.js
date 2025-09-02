export const state = () => ({
  items: [],
  pagination: null,
  loading: false,
  error: null,
})

export const getters = {
  getServices: (s) => s.items,
  getServicesPagination: (s) => s.pagination,
  isLoading: (s) => s.loading,
  error: (s) => s.error,
}

export const mutations = {
  SET_LOADING(s, v) {
    s.loading = v
  },
  SET_ERROR(s, e) {
    s.error = e
  },
  SET_SERVICES(s, items) {
    s.items = items || []
  },
  SET_PAGINATION(s, p) {
    s.pagination = p || null
  },
}

export const actions = {
  async fetchServices({ commit }, { perPage = 10, simple = true } = {}) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const params = simple ? { simple: true } : { per_page: perPage }
      const { data } = await this.$axios.get('/api/services', { params })
      if (!data.status)
        throw new Error(data.message || 'Failed to load services')
      commit('SET_SERVICES', data.data)
      commit('SET_PAGINATION', data.pagination || null)
    } catch (e) {
      commit('SET_ERROR', 'Չհաջողվեց բեռնել ծառայությունները')
      throw e
    } finally {
      commit('SET_LOADING', false)
    }
  },
}
