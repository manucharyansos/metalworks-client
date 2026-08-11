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
      if (!file) throw new Error('File payload is missing')

      const baseURL = String(this.$axios.defaults.baseURL || '').replace(/\/+$/, '')
      let url = null

      if (file.id) {
        url = `${baseURL}/api/secure-files/pmp/${encodeURIComponent(file.id)}?download=1`
      } else if (file.path) {
        const normalizedPath = String(file.path)
          .replace(/\\/g, '/')
          .replace(/^\/+/, '')
        const encodedPath = normalizedPath
          .split('/')
          .map((segment) => encodeURIComponent(segment))
          .join('/')
        url = `${baseURL}/api/secure-files/path/${encodedPath}?download=1`
      }

      if (!url) throw new Error('File id/path is missing')

      const response = await this.$axios.get(url, {
        responseType: 'blob',
      })

      const blob = response.data instanceof Blob ? response.data : new Blob([response.data])
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.setAttribute('download', file.original_name || 'downloaded_file')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(objectUrl)
      return true
    } catch (error) {
      console.error('File download failed:', error)
      throw error
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
  SET_ORDER(state, finishedOrder) {
    state.finishedOrder = finishedOrder
  },
}
