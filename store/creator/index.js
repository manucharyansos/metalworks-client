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
