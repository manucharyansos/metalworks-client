export const state = () => ({
  services: [],
})

export const getters = {
  getServices(state) {
    return state.services
  },
}

export const actions = {
  // async fetchServices({ commit }) {
  //   try {
  //     const data = await this.$axios.get('api/nav/services')
  //     commit('setServices', data)
  //     return true
  //   } catch (err) {
  //     return false
  //   }
  // },
}

export const mutations = {
  setServices(state, services) {
    state.services = services
  },
}
