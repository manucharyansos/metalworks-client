// store/users.js
export const state = () => ({
  users: [],
})

export const getters = {
  getUsers: (s) => s.users,
  getWorkers: (s) => s.users,
}

export const mutations = {
  setUsers(state, users) {
    state.users = users || []
  },
}

export const actions = {
  async fetchWorkers({ commit }) {
    try {
      const { data } = await this.$axios.get('/api/workers')
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : []
      commit('setUsers', list)
      return true
    } catch (e) {
      return false
    }
  },

  async createWorkers(_, payload) {
    await this.$axios.post('/api/workers', payload)
    return true
  },

  async updateWorker(_, { id, payload }) {
    await this.$axios.put(`/api/workers/${id}`, payload)
    return true
  },

  async deleteWorker(_, id) {
    await this.$axios.delete(`/api/workers/${id}`)
    return true
  },
}
