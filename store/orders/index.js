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
      return false
    }
  },
  async fetchOrder({ commit }, id) {
    try {
      const response = await this.$axios.get(`/api/admin/order/${id}`)
      commit('SET_ORDER', response.data)
      return true
    } catch (err) {
      return false
    }
  },
  async createOrder({ commit }, orderData) {
    const response = await this.$axios.post('/api/orders/order', orderData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    commit('ADD_ORDER', response.data.order)
    if (response.status === 201) {
      setTimeout(() => {
        this.$router.push('/creator')
      }, 2000)

      return true
    }
    return true
  },

  async updateOrder({ commit }, orderData) {
    try {
      const response = await this.$axios.$put(
        `/api/admin/order/${orderData.id}`,
        orderData
      )
      commit('SET_ORDER', response.data)
      if (response) {
        await this.$router.push('/admin')
      }
      return true
    } catch (err) {
      commit('ERROR', err.response.data)
      return false
    }
  },
  orderDelete({ commit }, orderId) {
    try {
      const res = this.$axios.delete(`api/admin/order/${orderId} `)
      if (res) {
        this.$router.push('/admin')
        return true
      }
    } catch (err) {
      commit('ERROR', err.response.data)
      return false
    }
  },
}

export const getters = {
  orders: (state) => state.orders,
  order: (state) => state.order,
  errorMessage: (state) => state.errorMessage,
}
