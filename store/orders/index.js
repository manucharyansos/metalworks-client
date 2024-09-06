export const state = () => ({
  orders: [],
  order: [],
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
    const response = await this.$axios.get(`/api/admin/order/${id}`)
    commit('SET_ORDER', response.data)
    return true
  },
  async createOrder({ commit }, orderData) {
    const response = await this.$axios.post('/api/orders/order', orderData)
    commit('ADD_ORDER', response.data.order)
  },
}

export const getters = {
  orders: (state) => state.orders,
  order: (state) => state.order,
}
