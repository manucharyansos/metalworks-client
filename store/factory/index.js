export const state = () => ({
  tasks: [],
})

export const getters = {
  getTasks(state) {
    return state.tasks
  },
}

export const actions = {
  async fetchTasks({ commit }, data) {
    try {
      const res = await this.$axios.get('/api/creator/tasks', data)
      commit('setTasks', res.data)
      return true
    } catch (err) {
      return false
    }
  },
}

export const mutations = {
  setTasks(state, tasks) {
    state.tasks = tasks
  },
}
