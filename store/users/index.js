export const state = () => ({
  users: [],
})

export const getters = {
  getUsers(state) {
    return state.users
  },
  getWorkers(state) {
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
  async fetchWorkers({ commit }) {
    try {
      const user = await this.$axios.get('api/workers')
      commit('setUsers', user.data)
      return true
    } catch (err) {
      return false
    }
  },
  async createUser({ commit }, data) {
    try {
      await this.$axios.post('api/clients/client', data)
      await this.$router.push('/manager/users')
      return true
    } catch (err) {
      return false
    }
  },
  async createWorkers({ commit }, data) {
    try {
      await this.$axios.post('api/workers', data)
      await this.$router.push('/manager/workers')
      return true
    } catch (err) {
      return false
    }
  },
  async updateUser({ commit }, { id, data }) {
    try {
      const response = await this.$axios.put(`api/clients/client/${id}`, data)
      await this.$router.push('/manager/users')
      return response.data
    } catch (err) {
      console.error('Error updating user:', err)
      throw err
    }
  },
  async updateWorker({ commit }, { id, data }) {
    try {
      const response = await this.$axios.put(`api/workers/${id}`, data)
      await this.$router.push('/manager/workers')
      return response.data
    } catch (err) {
      console.error('Error updating user:', err)
      throw err
    }
  },
}

export const mutations = {
  setUsers(state, users) {
    state.users = users
  },
}
