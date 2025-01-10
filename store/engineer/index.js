// store/modules/engineer.js
export const state = () => ({
  laserFiles: [],
  bendFiles: [],
})

export const getters = {
  getLaserFiles: (state) => state.laserFiles,
  getBendFiles: (state) => state.bendFiles,
}

export const actions = {
  async createLaserFile({ commit }, formData) {
    try {
      const response = await this.$axios.post('/api/laser-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      commit('ADD_LASER_FILE', response.data)
    } catch (error) {
      console.error(error)
    }
  },
  async createBendFile({ commit }, formData) {
    try {
      const response = await this.$axios.post('/api/bend-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      commit('ADD_BEND_FILE', response.data)
    } catch (error) {
      console.error(error)
    }
  },
  async submitOrder({ commit }) {
    try {
      await this.$axios.post('/api/orders', {
        laserFiles: state.laserFiles,
        bendFiles: state.bendFiles,
      })
      commit('CLEAR_FILES')
      this.$notify({
        text: 'Պատվերը հաջողությամբ ուղարկվեց:',
        type: 'success',
        duration: 3000,
      })
    } catch (error) {
      console.error(error)
    }
  },
}

export const mutations = {
  ADD_LASER_FILE(state, file) {
    state.laserFiles.push(file)
  },
  ADD_BEND_FILE(state, file) {
    state.bendFiles.push(file)
  },
  CLEAR_FILES(state) {
    state.laserFiles = []
    state.bendFiles = []
  },
}
