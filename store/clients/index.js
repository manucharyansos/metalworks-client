// store/clients.js
export const namespaced = true

export const state = () => ({
  clients: [],
  client: null,
})

export const mutations = {
  SET_CLIENTS(state, clients) {
    state.clients = clients || []
  },
  SET_CLIENT(state, client) {
    state.client = client || null
  },
  ADD_CLIENT(state, client) {
    if (!client) return
    state.clients.push(client)
  },
}

export const actions = {
  async fetchClients({ commit }) {
    const res = await this.$axios.$get('/api/clients/client')
    // ClientController@index վերադարձնում ա Resource collection => { data: [...] }
    const list = Array.isArray(res?.data) ? res.data : res
    commit('SET_CLIENTS', list)
  },

  async fetchClient({ commit }, clientId) {
    const res = await this.$axios.$get(`/api/clients/client/${clientId}`)
    commit('SET_CLIENT', res.data || res)
  },

  async addClient({ commit }, clientData) {
    const res = await this.$axios.$post('/api/clients/client', clientData)
    commit('ADD_CLIENT', res.data || res)
    return res
  },
}

export const getters = {
  allClients(state) {
    return state.clients
  },
  singleClient(state) {
    return state.client
  },
}
