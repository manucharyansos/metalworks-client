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
    await this.$axios.$post('/api/contacts', message)
    // commit('SET_MESSAGE', res)
  },
  async fetchMessages({ commit }) {
    const res = await this.$axios.$get('/api/contacts')
    commit('SET_MESSAGE', res)
  },
}

export const getters = {
  getMessage(state) {
    return state.message
  },
}
