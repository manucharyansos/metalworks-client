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
      const res = await this.$axios.get('/me', {
        headers: {
          Accept: 'application/json',
        },
      })
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
        await this.$router.push('/login')
        return true
      }

      return false
    } catch (error) {
      commit('setErrorMessageErrors', error.response?.data?.error || 'Error')
      commit(
        'setErrorMessageMessages',
        error.response?.data?.message || 'Error occurred'
      )
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
