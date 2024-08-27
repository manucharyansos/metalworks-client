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
      await this.$axios.post('api/role', data)
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
