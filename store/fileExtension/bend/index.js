export const state = () => ({
  bendFileExtensions: [],
})

export const getters = {
  getBendExtensions: (state) => {
    return state.bendFileExtensions
  },
}

export const actions = {
  async fetchBendFileExtensions({ commit }) {
    try {
      const response = await this.$axios.get('api/admin/bend-file-extension')
      commit('SET_BEND_EXTENSIONS', response.data)
    } catch (error) {
      console.error('Error fetching file extensions:', error)
    }
  },
  // eslint-disable-next-line camelcase
  async createBendFileExtension({ commit }, bendFileExtensions) {
    try {
      const response = await this.$axios.post(
        '/api/admin/bend-file-extension',
        bendFileExtensions
      )
      commit('ADD_BEND_EXTENSION', response.data.data)
      return response.data
    } catch (error) {
      console.error('Error creating file extension:', error)
      throw error
    }
  },
  async updateBendFileExtension({ commit }, { id, extension }) {
    try {
      const response = await this.$axios.put(
        `/api/admin/bend-file-extension/${id}`,
        { extension }
      )
      if (response.status === 200) {
        commit('UPDATE_BEND_EXTENSION', response.data.data)
        return true
      }
    } catch (error) {
      console.error('Error updating bend extension:', error)
      return false
    }
  },
  async deleteBendFileExtension({ commit }, id) {
    try {
      await this.$axios.delete(`/api/admin/bend-file-extension/${id}`)
      commit('REMOVE_BEND_EXTENSION', id)
    } catch (error) {
      console.error('Error deleting bend file extension:', error)
    }
  },
}

export const mutations = {
  SET_BEND_EXTENSIONS(state, list) {
    state.bendFileExtensions = Array.isArray(list) ? list : []
  },

  ADD_BEND_EXTENSION(state, item) {
    state.bendFileExtensions.push(item)
  },

  UPDATE_BEND_EXTENSION(state, item) {
    const idx = state.bendFileExtensions.findIndex((x) => x.id === item.id)
    if (idx !== -1) state.bendFileExtensions.splice(idx, 1, item)
  },

  REMOVE_BEND_EXTENSION(state, id) {
    state.bendFileExtensions = state.bendFileExtensions.filter(
      (x) => x.id !== id
    )
  },
}
