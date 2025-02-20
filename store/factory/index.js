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
      const res = await this.$axios.get(`/api/factories/factory/${factoryIds}`)
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
  async adminConfirmFactoryStatus({ commit }, confirmData) {
    try {
      await this.$axios.put(
        `api/factories/confirmOrderStatus/${confirmData.id}`,
        { factory_id: confirmData.factory_id }
      )
      return true
    } catch (err) {
      console.error(err.response ? err.response.data : err)
      return false
    }
  },

  async downloadUploadedFile({ commit }, file) {
    try {
      const response = await this.$axios.get(
        `api/factories/download/${file.path}`,
        {
          responseType: 'blob',
        }
      )

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.original_name || 'downloaded_file.dxf')
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      file.status = 'downloaded'
    } catch (error) {
      console.error('File download failed:', error)
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
