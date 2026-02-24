export const state = () => ({
  laserFileExtensions: [],
})

export const getters = {
  getLaserExtensions: (state) => state.laserFileExtensions,
}

export const actions = {
  async fetchLaserFileExtensions({ commit }) {
    try {
      const response = await this.$axios.get('/api/admin/laser-file-extension')
      commit('SET_LASER_EXTENSIONS', response.data)
    } catch (error) {
      console.error('Error fetching laser file extensions:', error)
    }
  },

  async createLaserFileExtension({ commit }, extension) {
    try {
      const response = await this.$axios.post(
        '/api/admin/laser-file-extension',
        extension
      )
      commit('ADD_LASER_EXTENSION', response.data.data)
      return response.data
    } catch (error) {
      console.error('Error creating laser file extension:', error)
      throw error
    }
  },

  async updateLaserFileExtension({ commit }, { id, extension }) {
    try {
      const response = await this.$axios.put(
        `/api/admin/laser-file-extension/${id}`,
        { extension }
      )
      if (response.status === 200) {
        commit('UPDATE_LASER_EXTENSION', response.data.data)
        return true
      }
    } catch (error) {
      console.error('Error updating laser extension:', error)
      return false
    }
  },

  async deleteLaserFileExtension({ commit }, id) {
    try {
      await this.$axios.delete(`/api/admin/laser-file-extension/${id}`)
      commit('REMOVE_LASER_EXTENSION', id)
    } catch (error) {
      console.error('Error deleting laser file extension:', error)
    }
  },
}

export const mutations = {
  SET_LASER_EXTENSIONS(state, list) {
    state.laserFileExtensions = Array.isArray(list) ? list : []
  },

  ADD_LASER_EXTENSION(state, item) {
    state.laserFileExtensions.push(item)
  },

  UPDATE_LASER_EXTENSION(state, item) {
    const idx = state.laserFileExtensions.findIndex((x) => x.id === item.id)
    if (idx !== -1) state.laserFileExtensions.splice(idx, 1, item)
  },

  REMOVE_LASER_EXTENSION(state, id) {
    state.laserFileExtensions = state.laserFileExtensions.filter(
      (x) => x.id !== id
    )
  },
}
