export const state = () => ({
  orders: [],
  order: null,
  pagination: {
    current_page: 1,
    total: 0,
    per_page: 4,
    last_page: 1,
    from: 0,
    to: 0,
    next_page_url: null,
    prev_page_url: null,
  },
  filters: {
    search: '',
  },
  loading: false,
  error: null,
  laserFiles: [],
  bendFiles: [],
})

export const getters = {
  getOrders: (s) => s.orders,
  getOrder: (s) => s.order,
  getPagination: (s) => s.pagination,
  getFilters: (s) => s.filters,
  isLoading: (s) => s.loading,
  getError: (s) => s.error,
}

export const mutations = {
  SET_LOADING(state, v) {
    state.loading = !!v
  },
  SET_ERROR(state, msg) {
    state.error = msg || null
  },

  SET_ORDERS(state, orders) {
    state.orders = orders || []
  },
  SET_PAGINATION(state, p) {
    state.pagination = { ...state.pagination, ...(p || {}) }
  },
  SET_ORDER(state, order) {
    state.order = order || null
  },

  SET_SEARCH(state, q) {
    state.filters.search = q || ''
  },
  SET_PER_PAGE(state, n) {
    const per = Number(n) || 10
    state.pagination.per_page = per
  },

  ADD_ORDER(state, order) {
    state.orders.unshift(order)
    state.pagination.total += 1
    state.pagination.to += 1
  },
}

export const actions = {
  async fetchOrders({ commit, state }, { page, perPage, search } = {}) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const params = {
        page: page || state.pagination.current_page || 1,
        per_page: perPage || state.pagination.per_page || 10,
      }
      const q = typeof search === 'string' ? search : state.filters.search
      if (q) params.search = q

      const { data } = await this.$axios.get('/api/engineers/engineer', {
        params,
      })
      commit('SET_ORDERS', data.orders)
      commit('SET_PAGINATION', data.pagination)
      return true
    } catch (e) {
      console.error(e)
      commit('SET_ERROR', 'Չհաջողվեց բեռնել պատվերները')
      return false
    } finally {
      commit('SET_LOADING', false)
    }
  },

  setSearch({ commit, dispatch }, q) {
    commit('SET_SEARCH', q)
    return dispatch('fetchOrders', { page: 1 })
  },

  setPerPage({ commit, dispatch }, n) {
    commit('SET_PER_PAGE', n)
    return dispatch('fetchOrders', { page: 1 })
  },

  goPage({ dispatch, state }, p) {
    const page = Math.max(1, Math.min(p, state.pagination.last_page || 1))
    return dispatch('fetchOrders', { page })
  },

  async createNewOrder({ commit }, payload) {
    try {
      const { data } = await this.$axios.post(
        '/api/engineers/engineer',
        payload
      )
      commit('ADD_ORDER', data.order)
      return true
    } catch (e) {
      throw e
    }
  },
}
