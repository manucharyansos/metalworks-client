export const state = () => ({
  creator: [],
})

export const getters = {
  getMaterials(state) {
    return state.creator
  },
}

export const actions = {
  async createRole({ commit }, data) {
    try {
      await this.$axios.post('api/creator/role', data)
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
}
