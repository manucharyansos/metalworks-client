export const state = () => ({
  resMessage: null,
  error: null,
  errorMessage: null,
  user: null,
  loadedOnce: false,
})

export const getters = {
  getError: (s) => s.error,
  getErrorMessage: (s) => s.errorMessage,
  getUser: (s) => s.user,
  isAuthenticated: (s) => !!s.user,
  isLoadedOnce: (s) => s.loadedOnce,
}

export const actions = {
  async fetchUser({ commit }) {
    try {
      const res = await this.$axios.get('/api/user')
      commit('setUser', res.data)
      commit('setLoadedOnce', true)
      return res.data
    } catch (e) {
      const status = e?.response?.status
      if (status === 401) {
        commit('setUser', null)
        commit('setError', null)
        commit('setErrorMessage', null)
        commit('setLoadedOnce', true)
        return null
      }
      commit('setError', e?.response?.data || 'Request failed')
      commit('setLoadedOnce', true)
      return null
    }
  },

  async loginUser({ commit }, userData) {
    try {
      commit('setErrorMessage', null)
      await this.$auth.loginWith('laravelSanctum', userData)
      return true
    } catch (err) {
      commit('setErrorMessage', err?.response?.data?.error || 'Login failed')
      return false
    }
  },

  async registerUser({ commit }, userData) {
    try {
      await this.$axios.get('/sanctum/csrf-cookie')
      const response = await this.$axios.post('/api/register', userData)
      return response.status === 201 || response.status === 200
    } catch (error) {
      commit('setError', error?.response?.data?.error || 'Registration failed')
      commit(
        'setErrorMessage',
        error?.response?.data?.message || 'An error occurred'
      )
      return false
    }
  },

  async forgotPassword({ commit }, email) {
    try {
      commit('setErrorMessage', null)
      const response = await this.$axios.post('/api/forgot-password', { email })
      return response.data
    } catch (error) {
      commit(
        'setErrorMessage',
        error?.response?.data?.message || 'Չհաջողվեց ուղարկել հղումը։'
      )
      return null
    }
  },

  async resetPassword({ commit }, payload) {
    try {
      commit('setErrorMessage', null)
      const response = await this.$axios.post('/api/reset-password', payload)
      return response.data
    } catch (error) {
      const validationMessage = error?.response?.data?.errors?.password?.[0]
      commit(
        'setErrorMessage',
        validationMessage ||
          error?.response?.data?.message ||
          'Չհաջողվեց փոխել գաղտնաբառը։'
      )
      return null
    }
  },
}

export const mutations = {
  setError(state, error) {
    state.error = error || null
  },
  setErrorMessage(state, message) {
    state.errorMessage = message || null
  },
  setUser(state, user) {
    state.user = user || null
  },
  setLoadedOnce(state, v) {
    state.loadedOnce = !!v
  },
}
