export const state = () => ({
  pmps: {},
  pmp: {},
})

export const mutations = {
  SET_PMPS(state, pmps) {
    state.pmps = pmps || {}
  },
  SET_PMP(state, pmp) {
    state.pmp = pmp || {}
  },
}

export const actions = {
  async createPmp({ commit }, pmp) {
    try {
      const response = await this.$axios.post('/api/engineers/pmps', pmp)
      commit('SET_PMP', response.data)
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  },
  async rememberNumberPmp({ commit }, pmp) {
    try {
      const response = await this.$axios.post(
        `/api/engineers/pmps/remoteNumber/${pmp.id}`,
        pmp
      )
      commit('SET_PMP', response.data)
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  },

  async fetchPmps({ commit }) {
    try {
      const response = await this.$axios.get('/api/engineers/pmps')
      commit('SET_PMPS', response.data)
      return true
    } catch (err) {
      commit('ERROR', err.response?.data || 'Failed to fetch orders')
      return false
    }
  },
  async checkIfGroupExists({ commit }, data) {
    try {
      const response = await this.$axios.post(
        '/api/engineers/pmps/check-group',
        {
          group: data,
        }
      )
      if (response.data.exists) {
        commit('SET_PMP', response.data)
        return response.data.exists
      }
    } catch (error) {
      console.error('Սխալ տվյալների ստուգման ընթացքում', error)
    }
  },
  async checkIfGroupNameExists({ commit }, data) {
    try {
      const response = await this.$axios.post(
        '/api/engineers/pmps/check-group-name',
        {
          group_name: data,
        }
      )
      commit('SET_PMP', response.data)
      return response.data.exists
    } catch (error) {
      console.error('Սխալ տվյալների ստուգման ընթացքում', error)
    }
  },
  async createPmpFilesByFactory({ commit }, order) {
    try {
      await this.$axios.post('/api/engineers/uploadPmpFile', order, {
        headers: { 'Content-Type': 'application/json' },
      })
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  },
}

export const getters = {
  getPmpes: (state) => state.pmps,
  getPmp: (state) => state.pmp,
  // errorMessage: (state) => state.errorMessage,
}
