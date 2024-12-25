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
}

export const mutations = {
  SET_BEND_EXTENSIONS(state, bendFileExtensions) {
    state.bendFileExtensions = bendFileExtensions
  },
  ADD_BEND_EXTENSION(state, bendFileExtensions) {
    state.bendFileExtensions.push(bendFileExtensions)
  },
}
