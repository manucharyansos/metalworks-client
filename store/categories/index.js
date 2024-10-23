export const state = () => ({
  categories: [],
})

export const mutations = {
  SET_CATEGORIES(state, clients) {
    state.categories = clients
  },
}

export const actions = {
  async fetchCategories({ commit }) {
    const categories = await this.$axios.$get('/api/categories/category', {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    commit('SET_CATEGORIES', categories)
  },
}

export const getters = {
  allCategories(state) {
    return state.categories
  },
}
