export const state = () => ({
  resMessage: false,
  user: []
})

export const getters = {
  getErrorMessage(state){
    return state.resMessage
  },
  getUser(state){
    return state.user
  }
}

export const mutations = {
  setErrorMessage(state, err){
    state.resMessage = err
  },
  setUser(state, user){
    state.user = user
  }
}

export const actions = {
  async fetchUser({commit}){
    try {
      const res = await this.$axios.get('/api/user')
      commit('setUser', res.data)
    } catch (error) {
      commit('setError', error.response.data)
    }
  },
  async loginUser({commit}, userData){
    try {
      await this.$auth.loginWith('laravelSanctum', userData)
      return true
    }
    catch (err){
      commit('setErrorMessage', err.response.data)
      return false
    }
  },
  async registerUser({commit}, userData){
    try {
      await this.$axios.post('/api/register', userData)
    }
    catch (err){
      commit('setErrorMessage', err.response.data.errors)
    }
  }
}
