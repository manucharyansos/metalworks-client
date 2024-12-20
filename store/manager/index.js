export const state = () => ({
  manager: [],
  orders: [],
})

export const getters = {
  getMaterials(state) {
    return state.manager
  },
}

export const actions = {
  async createTask({ commit }, data) {
    try {
      await this.$axios.post('/api/manager/tasks', data)
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
