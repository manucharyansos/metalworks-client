export const state = () => ({
  orders: [],
  order: null,
  pagination: {
    current_page: 1,
    total: 0,
    per_page: 10,
    last_page: 1,
    from: 0,
    to: 0,
  },
  laserFiles: [],
  bendFiles: [],
})

export const getters = {
  getOrders(state) {
    return state.orders
  },
  getOrder(state) {
    return state.order
  },
  getPagination(state) {
    return state.pagination
  },
}

export const actions = {
  async fetchOrders({ commit }, { page = 1, perPage = 10 } = {}) {
    try {
      const response = await this.$axios.get('api/engineers/engineer', {
        params: { page, per_page: perPage },
      })
      commit('SET_ORDERS', response.data.orders)
      commit('SET_PAGINATION', response.data.pagination)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  },
  async createNewOrder({ commit }, order) {
    try {
      const response = await this.$axios.post('/api/engineers/engineer', order)
      commit('ADD_ORDER', response.data.order)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  },
}

export const mutations = {
  SET_ORDERS(state, orders) {
    state.orders = orders
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = pagination
  },
  ADD_ORDER(state, order) {
    state.orders.unshift(order)
    state.pagination.total += 1
    state.pagination.to += 1
  },
  SET_ORDER(state, order) {
    state.order = order
  },
}
