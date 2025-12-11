export const namespaced = true

export const state = () => ({
  workers: [],
})

export const getters = {
  getWorkers: (s) => s.workers,
}

export const mutations = {
  setWorkers(state, workers) {
    state.workers = workers || []
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
      commit('setWorkers', list)
      return true
    } catch (e) {
      console.error('fetchWorkers error:', e)
      return false
    }
  },

  async createWorker(_, payload) {
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
