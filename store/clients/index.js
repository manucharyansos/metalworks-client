export const state = () => ({
  clients: [],
  client: null,
})

export const mutations = {
  SET_CLIENTS(state, clients) {
    state.clients = clients
  },
  SET_CLIENT(state, client) {
    state.client = client
  },
  ADD_CLIENT(state, client) {
    state.clients.push(client)
  },
}

export const actions = {
  async fetchClients({ commit }) {
    const clients = await this.$axios.$get('/api/clients/client')
    commit('SET_CLIENTS', clients)
  },
  async fetchClient({ commit }, clientId) {
    const client = await this.$axios.$get(`/api/clients/client/${clientId}`)
    commit('SET_CLIENT', client)
  },
  async addClient({ commit }, clientData) {
    const client = await this.$axios.$post('/api/clients/client', clientData)
    commit('ADD_CLIENT', client)
    if (client) {
      setTimeout(() => {
        this.$router.push('/manager')
      }, 2000)
    }
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
