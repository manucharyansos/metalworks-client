export const state = () => ({
  materialGroups: [],
  materialCategories: [],
  materialCategory: [],
})

export const mutations = {
  SET_MATERIALS_GROUPS(state, material) {
    state.materialGroups = material
  },
  SET_MATERIALS_CATEGORIES(state, materialCategories) {
    state.materialCategories = materialCategories
  },
  SET_MATERIALS_CATEGORY(state, materialCategories) {
    state.materialCategories = materialCategories
  },
}

export const actions = {
  async fetchMaterialGroups({ commit }) {
    const response = await this.$axios.$get('/api/categories/materialGroup', {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    commit('SET_MATERIALS_GROUPS', response)
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
  async fetchMaterialCategory({ commit }, id) {
    const response = await this.$axios.$get(
      `/api/categories/materialCategories/${id}`,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    commit('SET_MATERIALS_CATEGORY', response)
  },
  createMaterialsGroup({ commit }, material) {
    try {
      this.$axios.$post('/api/categories/materialGroup', material)
      return true
    } catch (error) {
      return false
    }
  },
  createMaterialsCategories({ commit }, material) {
    try {
      this.$axios.$post('/api/categories/materialCategories', material)
      return true
    } catch (error) {
      return false
    }
  },
  findMaterialFromCategory({ commit }) {},
}

export const getters = {
  allMaterialGroups(state) {
    return state.materialGroups
  },
  allMaterialCategories(state) {
    return state.materialCategories
  },
  getCategoryById(state) {
    return state.materialCategory
  },
}
