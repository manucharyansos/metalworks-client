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
  SET_LASER_EXTENSIONS(state, extensions) {
    state.laserFileExtensions = extensions
  },
  ADD_LASER_EXTENSION(state, extension) {
    state.laserFileExtensions.push(extension)
  },
  UPDATE_LASER_EXTENSION(state, extension) {
    state.laserFileExtensions = extension
  },
  REMOVE_LASER_EXTENSION(state, id) {
    state.laserFileExtensions = state.laserFileExtensions.filter(
      (ext) => ext.id !== id
    )
  },
}
