export const state = () => ({
  materials: [],
})

export const getters = {
  getMaterials(state) {
    return state.materials
  },
}

export const actions = {
  async fetchMaterials({ commit }) {
    try {
      const { data } = await this.$axios.get('api/materials')
      console.log(data.materials)
      commit('setMaterials', data.materials)
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
