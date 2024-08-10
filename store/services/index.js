export const state = () => ({
  services: []
})

export const getters = {
  getServices(state) {
    return state.services
  },
}

export const actions = {
  async fetchServices({ commit }, page ){
    try {
      const { data } = await this.$axios.get('http://127.0.0.1:8000/api/services')
      commit('setServices', data.category.data);
      return true
    }catch (err){
      // commit('setErrorMessages', err.response.data)
      return false
    }
  },
}

export const mutations = {
  setServices(state, services){
    state.services = services
  },
}
