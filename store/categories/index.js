export const state = () => ({
  materialTypes: [],
  materialCategories: [],
})

export const mutations = {
  SET_MATERIALS_TYPES(state, material) {
    state.materialTypes = material
  },
  SET_MATERIALS_CATEGORIES(state, materialCategories) {
    state.materialCategories = materialCategories
  },
}

export const actions = {
  async fetchMaterialTypes({ commit }) {
    const response = await this.$axios.$get('/api/categories/materialType', {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    commit('SET_MATERIALS_TYPES', response)
  },
  async fetchMaterialCategories({ commit }) {
    const response = await this.$axios.$get(
      '/api/categories/materialCategories',
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    commit('SET_MATERIALS_CATEGORIES', response)
  },
  createMaterialsType({ commit }, material) {
    try {
      const res = this.$axios.$post('/api/categories/materialType', material)
      if (res.status === 200) {
        return true
      }
    } catch (error) {
      return false
    }
  },
  createMaterialsCategories({ commit }, material) {
    try {
      const response = this.$axios.$post(
        '/api/categories/materialCategories',
        material
      )
      if (response.status === 200) {
        return true
      }
    } catch (error) {
      return false
    }
  },
}

export const getters = {
  allMaterialTypes(state) {
    return state.materialTypes
  },
  allMaterialCategories(state) {
    return state.materialCategories
  },
}
