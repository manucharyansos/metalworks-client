import { apiErrorMessage, taskActionBody } from '@/utils/task-workflow'
export const state = () => ({
  factory: null,
  orderByFactory: null,
  finishedOrder: null,
  actionError: '',
  actionConflictOrder: null,
})

export const getters = {
  getFactory(state) {
    return state.factory
  },
  getOrderByFactories(state) {
    return state.orderByFactory
  },
  getActionError(state) {
    return state.actionError
  },
  getActionConflictOrder: (state) => state.actionConflictOrder,
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
        const hasConfigured =
          'extensions' in factory || 'file_extensions' in factory
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

  // Resolves to true, false, or { changeRequest } when a rejection or a new
  // deadline was sent to the engineer as a request instead of being applied.
  async doneFinishedOrder({ commit }, order) {
    commit('SET_ACTION_ERROR', '')
    commit('SET_ACTION_CONFLICT_ORDER', null)
    try {
      const { method, body } = taskActionBody(order)
      const res = await this.$axios[method](
        `api/factories/updateOrder/${order.id}`,
        body
      )
      commit('SET_ORDER', res.data)
      return res.data?.change_request
        ? { changeRequest: res.data.change_request }
        : true
    } catch (err) {
      console.log(err)
      if (err.response?.status === 409 && err.response.data?.order)
        commit('SET_ACTION_CONFLICT_ORDER', err.response.data.order)
      commit('SET_ACTION_ERROR', apiErrorMessage(err))
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

      const revision =
        file.task_file_revision_id || file.pivot?.task_file_revision_id
      if (revision) {
        url = `${baseURL}/api/secure-files/task-revisions/${encodeURIComponent(
          revision
        )}?download=1`
      } else if (file.id) {
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
  SET_ACTION_CONFLICT_ORDER(state, order) {
    state.actionConflictOrder = order
  },
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
  SET_ACTION_ERROR(state, message) {
    state.actionError = message || ''
  },
}
