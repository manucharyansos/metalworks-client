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
  errorMessage: null,
})

export const mutations = {
  SET_ORDERS(state, orders) {
    state.orders = Array.isArray(orders) ? orders : []
  },
  SET_ORDER(state, order) {
    state.order = order
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...(pagination || {}) }
  },
  ADD_ORDER(state, order) {
    state.orders.push(order)
  },
  ERROR(state, error) {
    state.errorMessage = error
  },
}

export const actions = {
  async fetchOrders({ commit }, { page = 1, perPage = 10 } = {}) {
    try {
      const response = await this.$axios.get('/api/orders/order', {
        params: { page, per_page: perPage },
      })
      const orders = Array.isArray(response.data?.orders)
        ? response.data.orders
        : Array.isArray(response.data?.data)
        ? response.data.data
        : []
      commit('SET_ORDERS', orders)
      commit(
        'SET_PAGINATION',
        response.data?.pagination || {
          current_page: 1,
          total: orders.length,
          per_page: orders.length || perPage,
          last_page: 1,
          from: orders.length ? 1 : 0,
          to: orders.length,
        }
      )
      return true
    } catch (err) {
      commit('ERROR', err.response?.data || 'Failed to fetch orders')
      return false
    }
  },
  async fetchOrder({ commit }, id) {
    try {
      const response = await this.$axios.get(`/api/orders/order/${id}`)
      commit('SET_ORDER', response.data)
      return true
    } catch (err) {
      commit('ERROR', err.response?.data || 'Failed to fetch order')
      return false
    }
  },
  async createOrder({ commit }, orderData) {
    try {
      const response = await this.$axios.post('/api/orders/order', orderData)
      const order = response.data?.order || response.data
      commit('ADD_ORDER', order)
      return order
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Չհաջողվեց ստեղծել պատվերը'
      commit('ERROR', errorMessage)
      throw new Error(errorMessage)
    }
  },
  async updateOrder({ commit }, { id, payload }) {
    try {
      const response = await this.$axios.put(`/api/orders/order/${id}`, payload)
      const order = response.data?.order || response.data
      commit('SET_ORDER', order)
      return response.data
    } catch (error) {
      commit('ERROR', error.response?.data || 'Failed to update order')
      throw error
    }
  },
  async orderDelete({ commit }, orderId) {
    try {
      await this.$axios.delete(`/api/orders/order/${orderId}`)
      return true
    } catch (err) {
      commit('ERROR', err.response?.data || 'Failed to delete order')
      return false
    }
  },
}

export const getters = {
  orders: (state) => state.orders,
  order: (state) => state.order,
  getPagination: (state) => state.pagination,
  errorMessage: (state) => state.errorMessage,
}
