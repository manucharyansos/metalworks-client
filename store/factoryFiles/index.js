// store/modules/engineer.js
export const state = () => ({
  factoryFiles: [],
})

export const getters = {
  getFactoryFiles: (state) => state.factoryFiles,
}

export const actions = {
  async createFactoryFiles({ commit }, formData) {
    try {
      const response = await this.$axios.post(
        '/api/factories/engineer',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      commit('ADD_FACTORY_FILES', response.data)
    } catch (error) {
      console.error(error)
    }
  },
  async createOrder({ commit }, formData) {
    try {
      const response = await this.$axios.post(
        '/api/engineers/storeWithFiles',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      commit('ADD_FACTORY_FILES', response.data)
    } catch (error) {
      console.error(error)
    }
  },
  async getFactoryFiles(factoryId, orderId) {
    try {
      const response = await this.$axios.get(
        `/api/factories/${factoryId}/orders/${orderId}/files`
      )
      this.files = response.data.files
    } catch (error) {
      console.error(error)
    }
  },
}

export const mutations = {
  ADD_FACTORY_FILES(state, data) {
    state.factoryFiles.push(data)
  },
}
