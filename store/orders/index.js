export const state = () => ({
  orders: [],
  order: null,
  errorMessage: null,
})

export const mutations = {
  SET_ORDERS(state, orders) {
    state.orders = orders
  },
  SET_ORDER(state, order) {
    state.order = order
  },
  ADD_ORDER(state, order) {
    state.orders.push(order)
  },
  ERROR(state, error) {
    state.errorMessage = error
  },
}

export const actions = {
  async fetchOrders({ commit }) {
    try {
      const response = await this.$axios.get('/api/admin/order')
      commit('SET_ORDERS', response.data)
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
      const response = await this.$axios.post('/api/orders/order', orderData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      commit('ADD_ORDER', response.data.order)
      if (response.status === 201) {
        return response.data.order
      }
    } catch (error) {
      commit('ERROR', error.response?.data || 'Failed to create order')
      return false
    }
  },
  async updateOrder({ commit }, { id, payload }) {
    try {
      const response = await this.$axios.post(
        `/api/admin/update/${id}`,
        payload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      commit('SET_ORDER', response.data)
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
  errorMessage: (state) => state.errorMessage,
}
