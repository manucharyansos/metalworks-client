export const state = () => ({
  pmps: {},
  pmp: {},
  error: null,
})

export const mutations = {
  SET_PMPS(state, pmps) {
    state.pmps = pmps || {}
  },
  SET_PMP(state, pmp) {
    state.pmp = (pmp && pmp.pmp) || pmp || {}
  },
  SET_ERROR(state, error) {
    state.error = error || null
  },
}

export const actions = {
  async createPmp({ commit }, pmp) {
    try {
      const { data } = await this.$axios.post('/api/engineers/pmps', pmp)
      commit('SET_PMP', data)
      return true
    } catch (error) {
      commit('SET_ERROR', error.response?.data || error.message)
      return false
    }
  },

  async rememberNumberPmp({ commit }, pmp) {
    try {
      const { data } = await this.$axios.post(
        `/api/engineers/pmps/${pmp.id}/remote-number`,
        pmp
      )
      commit('SET_PMP', data)
      return true
    } catch (error) {
      commit('SET_ERROR', error.response?.data || error.message)
      return false
    }
  },

  async fetchPmps({ commit }) {
    try {
      const { data } = await this.$axios.get('/api/engineers/pmps')
      commit('SET_PMPS', data)
      return true
    } catch (err) {
      commit('SET_ERROR', err.response?.data || 'Failed to fetch pmps')
      return false
    }
  },

  async fetchPmp({ commit }, id) {
    try {
      const { data } = await this.$axios.get(
        `/api/engineers/pmps/remote-number/${id}`
      )
      commit('SET_PMP', data.pmp ?? data)
      return true
    } catch (err) {
      commit('SET_ERROR', err.response?.data || 'Failed to fetch pmp')
      return false
    }
  },

  async checkIfGroupExists({ commit }, group) {
    try {
      const { data } = await this.$axios.post(
        '/api/engineers/pmps/check-group',
        { group }
      )
      if (data?.exists) commit('SET_PMP', data)
      return !!data?.exists
    } catch (error) {
      commit('SET_ERROR', error.response?.data || error.message)
      return false
    }
  },

  async checkPmpByRemoteNumber({ commit }, id) {
    try {
      const { data } = await this.$axios.post(
        `/api/engineers/pmps/check-pmp-by-remote-number/${id}`
      )
      if (data?.exists) commit('SET_PMP', data)
      return !!data?.exists
    } catch (error) {
      commit('SET_ERROR', error.response?.data || error.message)
      return false
    }
  },

  async checkIfGroupNameExists({ commit }, groupName) {
    try {
      const { data } = await this.$axios.post(
        '/api/engineers/pmps/check-group-name',
        { group_name: groupName }
      )
      if (typeof data?.exists !== 'undefined') commit('SET_PMP', data)
      return !!data?.exists
    } catch (error) {
      commit('SET_ERROR', error.response?.data || error.message)
      return false
    }
  },

  async createPmpFilesByFactory({ commit }, formData) {
    try {
      const { data } = await this.$axios.post(
        '/api/engineers/uploadPmpFile',
        formData
      )
      return data || true
    } catch (error) {
      commit('SET_ERROR', error.response?.data || error.message)
      return false
    }
  },

  async deleteFile({ commit }, fileId) {
    try {
      const resp = await this.$axios.delete(`/api/engineers/pmpFiles/${fileId}`)
      return resp.status === 200
    } catch (e) {
      commit('SET_ERROR', e.response?.data || e.message)
      return false
    }
  },
}

export const getters = {
  getPmpes: (state) => state.pmps,
  getPmp: (state) => state.pmp,
  errorMessage: (state) => state.error,
}
