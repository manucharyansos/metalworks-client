export const state = () => ({
  orders: [],
})

export const mutations = {
  SET_ORDERS(state, orders) {
    state.orders = orders
  },
  ADD_ORDER(state, order) {
    state.orders.push(order)
  },
}

export const actions = {
  async fetchOrders({ commit }) {
    const response = await this.$axios.get('/api/orders/order')
    commit('SET_ORDERS', response.data)
  },
  async createOrder({ commit }, orderData) {
    const response = await this.$axios.post('/api/orders/order', orderData)
    commit('ADD_ORDER', response.data.order)
  },
}

export const getters = {
  orders: (state) => state.orders,
}
