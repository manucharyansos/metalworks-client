export const state = () => ({
  roles: null,
})

export const mutations = {
  SET_ROLES(state, roles) {
    state.roles = roles
  },
}

export const actions = {
  async fetchRoles({ commit }) {
    try {
      const response = await this.$axios.get('/api/roles')
      commit('SET_ROLES', response.data)
      return true
    } catch (err) {
      return false
    }
  },
}

export const getters = {
  roles: (state) => state.roles,
}
