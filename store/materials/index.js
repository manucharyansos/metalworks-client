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
      const response = await this.$axios.get('api/materials')
      commit('setMaterials', response.data)
      return true
    } catch (err) {
      return false
    }
  },
  async createMaterials({ commit }, data) {
    const response = await this.$axios.post('/api/materials', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (response) {
      this.$router.push('/manager')
    }
  },
}

export const mutations = {
  setMaterials(state, materials) {
    state.materials = materials
  },
}
