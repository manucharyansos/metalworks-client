export const state = () => ({
  orders: [],
  order: [],
  laserFiles: [],
  bendFiles: [],
})

export const getters = {
  getOrderS(state) {
    return state.orders
  },
  getOrder(state) {
    return state.order
  },
}

export const actions = {
  async createNewOrder({ commit }, order) {
    try {
      const response = await this.$axios.post(
        '/api/engineers/engineer',
        order,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      commit('ADD_ORDERS', response.data)
      await this.$router.push('/engineer')
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  },
  async saveOrderFilesByFactory({ commit }, order) {
    try {
      await this.$axios.post('/api/engineers/upload', order, {
        headers: { 'Content-Type': 'application/json' },
      })
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  },
  async fetchOrderDataById({ commit }, id) {
    try {
      const response = await this.$axios.get(`/api/admin/order/${id}`)
      commit('SET_ORDER', response.data)
    } catch (e) {
      console.error(e)
    }
  },
}

export const mutations = {
  ADD_ORDERS(state, order) {
    state.orders = order
  },
  SET_ORDER(state, order) {
    state.order = order
  },
}
