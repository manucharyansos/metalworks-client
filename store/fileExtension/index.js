export const state = () => ({
  extensions: [],
})

export const mutations = {
  SET_EXTENSIONS(state, extensions) {
    state.extensions = extensions
  },
  ADD_EXTENSION(state, extension) {
    state.extensions.push(extension)
  },
}

export const actions = {
  async fetchFileExtensions({ commit }) {
    try {
      const response = await this.$axios.get('/file-extensions')
      commit('SET_EXTENSIONS', response.data)
    } catch (error) {
      console.error('Error fetching file extensions:', error)
    }
  },
  // eslint-disable-next-line camelcase
  async createFileExtension({ commit }, extension) {
    try {
      const response = await this.$axios.post(
        '/api/admin/file-extensions',
        extension
      )
      commit('ADD_EXTENSION', response.data.data)
      return response.data
    } catch (error) {
      console.error('Error creating file extension:', error)
      throw error
    }
  },
}
