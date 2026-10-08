export const state = () => ({
  resMessage: null,
  error: null,
  errorMessage: null,
  user: null,
  loadedOnce: false,
  registrationErrors: {},
})

export const getters = {
  getError: (s) => s.error,
  getErrorMessage: (s) => s.errorMessage,
  getUser: (s) => s.user,
  isAuthenticated: (s) => !!s.user,
  isLoadedOnce: (s) => s.loadedOnce,
  getRegistrationErrors: (s) => s.registrationErrors,
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
      try {
        await this.$auth.loginWith('runtimeSanctum', userData)
      } catch (error) {
        if (error?.response?.status !== 419) throw error

        // CookieScheme refreshes Sanctum's CSRF cookie before each login.
        // A stale session after logout may require one fresh handshake.
        await this.$auth.loginWith('runtimeSanctum', userData)
      }
      return true
    } catch (err) {
      commit(
        'setErrorMessage',
        err?.response?.data?.error || err?.response?.data?.message || 'Login failed'
      )
      return false
    }
  },

  async registerUser({ commit }, userData) {
    commit('setError', null)
    commit('setErrorMessage', null)
    commit('setRegistrationErrors', {})
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          await this.$axios.get('/sanctum/csrf-cookie', { timeout: 15000 })
          const response = await this.$axios.post('/api/register', userData, { timeout: 15000 })
          return response.status === 202 && response.data?.status === 'pending' ? response.data : false
        } catch (error) {
          if (attempt === 0 && error?.response?.status === 419) continue
          throw error
        }
      }
    } catch (error) {
      commit('setRegistrationErrors', error?.response?.data?.errors || {})
      commit('setErrorMessage', error?.response?.data?.message || 'Registration failed')
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
  setRegistrationErrors(state, errors) {
    state.registrationErrors = errors || {}
  },
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
