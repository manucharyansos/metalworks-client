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
      if (process.client) {
        const hasCookie = document.cookie.includes('XSRF-TOKEN')
        if (!hasCookie) {
          commit('setUser', null)
          commit('setLoadedOnce', true)
          return null
        }
      }

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
      // await this.$axios.get('/sanctum/csrf-cookie')
      await this.$auth.loginWith('laravelSanctum', userData)
      // await this.dispatch('auth/fetchUser') // թարմացնենք user-ը
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
