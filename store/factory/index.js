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
  async fetchFactoryFilePolicies({ commit }) {
    let factories
    try {
      const { data } = await this.$axios.get('/api/factory-file-policies')
      if (!Array.isArray(data?.data))
        throw new Error('Invalid factory upload policy response')
      factories = data.data
    } catch (error) {
      if (![404, 405].includes(error.response?.status)) throw error
      // Older deployed APIs expose the factory list but not this read endpoint.
      // Their upload endpoint still enforces the configured formats. Do not
      // substitute guessed defaults or treat auth/network errors as compatibility.
      const { data } = await this.$axios.get('/api/factories/factory')
      if (!Array.isArray(data)) throw new Error('Invalid factory list response')
      factories = data.map((factory) => {
        const hasConfigured = 'extensions' in factory || 'file_extensions' in factory
        const configured = factory.extensions ?? factory.file_extensions
        if (hasConfigured && !Array.isArray(configured))
          throw new Error('Invalid factory upload policy response')
        return {
          ...factory,
          extensions: hasConfigured ? configured : ['*'],
          serverValidatedFormats: !hasConfigured,
        }
      })
    }
    commit('SET_FACTORY', factories)
    return factories
  },

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

      const baseURL = String(this.$axios.defaults.baseURL || '').replace(
        /\/+$/,
        ''
      )
      let url = null

      if (file.id) {
        url = `${baseURL}/api/secure-files/pmp/${encodeURIComponent(
          file.id
        )}?download=1`
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

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data])
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
    if (!Array.isArray(factory)) {
      state.factory = factory
      return
    }

    state.factory = [...factory].sort((a, b) => {
      const aInfo = a?.value === 'INFO' ? 0 : 1
      const bInfo = b?.value === 'INFO' ? 0 : 1
      if (aInfo !== bInfo) return aInfo - bInfo
      return Number(a?.id || 0) - Number(b?.id || 0)
    })
  },
  SET_FACTORIES(state, orderByFactory) {
    state.orderByFactory = orderByFactory
  },
  SET_ORDER(state, finishedOrder) {
    state.finishedOrder = finishedOrder
  },
}
