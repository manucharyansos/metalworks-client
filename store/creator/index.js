export const state = () => ({
  creator: [],
  orders: [],
})

export const getters = {
  getMaterials(state) {
    return state.creator
  },
}

export const actions = {
  async fetchOrders({ commit }) {
    try {
      const res = await this.$axios.get('api/orders/order')
      commit('setOrders', res.data.orders)
      return true
    } catch (err) {
      return false
    }
  },

  async createTask({ commit }, data) {
    try {
      await this.$axios.post('/api/creator/tasks', data)
      return true
    } catch (err) {
      return false
    }
  },
}

export const mutations = {
  setMaterials(state, materials) {
    state.materials = materials
  },
  setOrders(state, orders) {
    state.orders = orders
  },
}
