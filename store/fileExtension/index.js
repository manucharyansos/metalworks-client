export const state = () => ({
  fileExtensions: [],
})

export const getters = {
  getExtensions: (state) => state.fileExtensions,
}

export const actions = {
  async fetchFileExtensions({ commit }) {
    try {
      const response = await this.$axios.get('/api/admin/file-extensions')
      commit('SET_FILE_EXTENSIONS', response.data)
    } catch (error) {
      console.error('Error fetching file extensions:', error)
    }
  },

  async createFileExtension({ commit }, extension) {
    try {
      const response = await this.$axios.post(
        '/api/admin/file-extensions',
        extension
      )
      commit('ADD_FILE_EXTENSION', response.data.data)
      return response.data
    } catch (error) {
      console.error('Error creating  file extension:', error)
      throw error
    }
  },

  async updateFileExtension({ commit }, { id, extension }) {
    try {
      const response = await this.$axios.put(
        `/api/admin/file-extensions/${id}`,
        { extension }
      )
      if (response.status === 200) {
        commit('UPDATE_FILE_EXTENSION', response.data.data)
        return true
      }
    } catch (error) {
      console.error('Error updating extension:', error)
      return false
    }
  },

  async deleteFileExtension({ commit }, id) {
    try {
      await this.$axios.delete(`/api/admin/file-extensions/${id}`)
      commit('REMOVE_FILE_EXTENSION', id)
    } catch (error) {
      console.error('Error deleting file extension:', error)
    }
  },
}

export const mutations = {
  SET_FILE_EXTENSIONS(state, extensions) {
    state.fileExtensions = extensions
  },
  ADD_FILE_EXTENSION(state, extension) {
    state.fileExtensions.push(extension)
  },
  UPDATE_FILE_EXTENSION(state, extension) {
    state.fileExtensions = extension
  },
  REMOVE_FILE_EXTENSION(state, id) {
    state.fileExtensions = state.fileExtensions.filter((ext) => ext.id !== id)
  },
}
