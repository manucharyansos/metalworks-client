export const state = () => ({
  message: [],
})

export const mutations = {
  SET_MESSAGE(state, message) {
    state.message = message
  },
}

export const actions = {
  async addMessage({ commit }, message) {
    const res = await this.$axios.$post('/api/contact', message)
    commit('SET_MESSAGE', res)
  },
}

export const getters = {
  getMessage(state) {
    return state.message
  },
}
