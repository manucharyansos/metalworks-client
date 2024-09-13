export const state = () => ({
  factory: null,
  orderByFactory: null,
})

export const getters = {
  getFactory(state) {
    return state.factory
  },
  getOrderByFactories(state) {
    return state.orderByFactory
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
      // const query = factoryIds.join(',')
      const res = await this.$axios.get('/api/factories/getOrdersByFactories', {
        params: { factory_ids: factoryIds },
      })

      commit('SET_FACTORIES', res.data)
    } catch (err) {
      console.error(err)
      return false
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
}
