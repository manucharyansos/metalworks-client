export const state = () => ({
  categories: [],
})

export const getters = {
  allCategories: (s) => s.categories,
}

export const mutations = {
  SET_CATEGORIES(state, list) {
    state.categories = Array.isArray(list) ? list : []
  },
}

export const actions = {
  async fetchCategories({ commit }) {
    const { data } = await this.$axios.get('/api/material-categories')
    commit('SET_CATEGORIES', Array.isArray(data) ? data : data.data || [])
  },
}
