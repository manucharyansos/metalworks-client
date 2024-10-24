export const state = () => ({
  users: [],
})

export const getters = {
  getUsers(state) {
    return state.users
  },
}

export const actions = {
  async fetchUsers({ commit }) {
    try {
      const user = await this.$axios.get('api/users')
      commit('setUsers', user.data)
      return true
    } catch (err) {
      return false
    }
  },
}

export const mutations = {
  setUsers(state, users) {
    state.users = users
  },
}
