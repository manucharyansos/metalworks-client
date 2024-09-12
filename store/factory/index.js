export const state = () => ({
  factory: null,
})

export const getters = {
  getFactory(state) {
    return state.factory
  },
}

export const actions = {
  async fetchFactory({ commit }, data) {
    try {
      const res = await this.$axios.get('/api/factory', data)
      commit('SET_FACTORY', res.data)
      return true
    } catch (err) {
      return false
    }
  },
}

export const mutations = {
  SET_FACTORY(state, factory) {
    state.factory = factory
  },
}
