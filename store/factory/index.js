export const state = () => ({
  factory: null,
  orderByFactory: null,
  finishedOrder: null,
})

export const getters = {
  getFactory(state) {
    return state.factory
  },
  getOrderByFactories(state) {
    return state.orderByFactory
  },
  getFinishedOrder(state) {
    return state.finishedOrder
  },
}

export const actions = {
  async fetchFactory({ commit }, data) {
    try {
      const res = await this.$axios.get('/api/factories/factory', data)
      commit('SET_FACTORY', res.data)
      return true
    } catch (err) {
      return false
    }
  },
  async fetchOrdersByFactory({ commit }, factoryIds) {
    try {
      const res = await this.$axios.get('/api/factories/getOrdersByFactories', {
        params: { factory_ids: factoryIds },
      })
      commit('SET_FACTORIES', res.data)
    } catch (err) {
      return false
    }
  },

  async doneFinishedOrder({ commit }, order) {
    try {
      const res = await this.$axios.put(
        `api/factories/updateOrder/${order.id}`,
        order
      )
      commit('SET_ORDER', res.data)
      return true
    } catch (err) {
      console.log(err)
      return false
    }
  },
  async downloadUploadedFile({ commit }, filePath) {
    try {
      // if (typeof filePath !== 'string') {
      //   throw new TypeError('Invalid filePath. Expected a string.')
      // }

      const encodedPath = encodeURIComponent(filePath)

      const response = await this.$axios.get(`/api/download/${encodedPath}`, {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filePath.split('/').pop())
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error during file download:', error.message)
    }
  },
}

export const mutations = {
  SET_FACTORY(state, factory) {
    state.factory = factory
  },
  SET_FACTORIES(state, orderByFactory) {
    state.orderByFactory = orderByFactory
  },
  SET_ORDER(state, order) {
    state.finishedOrder = order
  },
}
