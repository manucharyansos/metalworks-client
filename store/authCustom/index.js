export const state = () => ({
  resMessage: false,
  error: false,
  errorMessage: false,
  user: [],
})

export const getters = {
  getError(state) {
    return state.error
  },
  getErrorMessage(state) {
    return state.errorMessage
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
      commit('setErrorMessage', err.response.data.error)
      return false
    }
  },
  async registerUser({ commit }, userData) {
    try {
      const response = await this.$axios.post('/api/register', userData)
      if (response.status === 201 || response.status === 200) {
        return true // Let the component handle redirection
      }
      return false
    } catch (error) {
      // Store both error and message from the response
      commit('setError', error.response?.data?.error || 'Registration failed')
      commit(
        'setErrorMessage',
        error.response?.data?.message || 'An error occurred'
      )
      return false
    }
  },
}

export const mutations = {
  setError(state, error) {
    state.error = error // Set the general error
  },
  setErrorMessage(state, message) {
    state.errorMessage = message // Set the specific error message
  },
  setUser(state, user) {
    state.user = user
  },
}
