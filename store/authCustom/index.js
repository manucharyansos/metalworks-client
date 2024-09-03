export const state = () => ({
  resMessage: false,
  error: false,
  errorMessage: false,
  user: [],
})

export const getters = {
  getErrorMessages(state) {
    return state.errorMessage
  },
  getErrors(state) {
    return state.error
  },
  getUser(state) {
    return state.user
  },
}

export const actions = {
  async fetchUser({ commit }) {
    try {
      const res = await this.$axios.get('/api/user')
      commit('setUser', res.data)
    } catch (error) {
      commit('setError', error.response.data)
    }
  },
  async loginUser({ commit }, userData) {
    try {
      await this.$auth.loginWith('laravelSanctum', userData)
      return true
    } catch (err) {
      commit('setErrorMessage', err.response.data.message)
      return false
    }
  },

  async registerUser({ commit }, userData) {
    try {
      await this.$axios.post('/api/register', userData)
      await this.router.push('/login')
      return true
    } catch (res) {
      commit('setErrorMessageErrors', res.response.data.error)
      commit('setErrorMessageMessages', res.response.data.message)
      return false
    }
  },
}

export const mutations = {
  setErrorMessageErrors(state, error) {
    state.error = error
  },
  setErrorMessage(state, messages) {
    state.errorMessage = messages
  },
  setUser(state, user) {
    state.user = user
  },
}
