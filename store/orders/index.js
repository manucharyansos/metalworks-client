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
})

export const mutations = {
  SET_ORDERS(state, orders) {
    state.orders = orders
  },
  SET_ORDER(state, order) {
    state.order = order
  },
    SET_PAGINATION(state, pagination) {
    state.pagination = pagination
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
      const response = await this.$axios.get('/api/admin/order', {
        params: { page, per_page: perPage },
      })
      commit('SET_ORDERS', response.data.orders)
      commit('SET_PAGINATION', response.data.pagination)
      return true
    } catch (err) {
      commit('ERROR', err.response?.data || 'Failed to fetch orders')
      return false
    }
  },
  async fetchOrder({ commit }, id) {
    try {
      const response = await this.$axios.get(`/api/admin/order/${id}`)
      commit('SET_ORDER', response.data)
      return true
    } catch (err) {
      commit('ERROR', err.response?.data || 'Failed to fetch order')
      return false
    }
  },
  async createOrder({ commit }, orderData) {
  try {
    const response = await this.$axios.post('/api/orders/order', orderData);
    commit('ADD_ORDER', response.data.order);
    return response.data.order;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Չհաջողվեց ստեղծել պատվերը';
    commit('ERROR', errorMessage);
    throw new Error(errorMessage);
  }
},
  async updateOrder({ commit }, { id, payload }) {
    try {
      const response = await this.$axios.post(
        `/api/admin/orders/update/${id}`,
        payload
      )
      commit('SET_ORDER', response.data.order)
      await this.$router.push('/admin')
      return response.data
    } catch (error) {
      commit('ERROR', error.response?.data || 'Failed to update order')
      throw error
    }
  },
  async orderDelete({ commit }, orderId) {
    try {
      await this.$axios.delete(`/api/admin/order/${orderId}`)
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
    getPagination(state) {
    return state.pagination
  },
}
