export const state = () => ({
  visitors: [],
})

export const getters = {
  getVisitors(state) {
    return state.visitors
  },
}

export const actions = {
  async fetchVisitors({ commit }) {
    try {
      const response = await this.$axios.get('api/visitors')
      commit('setVisitors', response.data.visitors)

      return true
    } catch (err) {
      return false
    }
  },
}

export const mutations = {
  setVisitors(state, visitors) {
    state.visitors = visitors
  },
}
