export const namespaced = true

export const state = () => ({
  users: [],
  user: null,
})

export const getters = {
  allUsers: (s) => s.users,
  singleUser: (s) => s.user,
}

export const mutations = {
  SET_USERS(state, users) {
    state.users = users || []
  },
  SET_USER(state, user) {
    state.user = user || null
  },
}

export const actions = {
  async fetchUsers({ commit }) {
    try {
      const { data } = await this.$axios.get('/api/users')
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : []
      commit('SET_USERS', list)
      return true
    } catch (e) {
      console.error('fetchUsers error:', e)
      return false
    }
  },

  async fetchUser({ commit }, id) {
    try {
      const { data } = await this.$axios.get(`/api/users/${id}`)
      commit('SET_USER', data)
      return true
    } catch (e) {
      console.error('fetchUser error:', e)
      return false
    }
  },

  async updateUser(_, { id, payload }) {
    await this.$axios.put(`/api/users/${id}`, payload)
    return true
  },

  async deleteUser(_, id) {
    await this.$axios.delete(`/api/users/${id}`)
    return true
  },
}
