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
      const res = await this.$axios.get('/api/factories/getOrdersByFactories', {
        params: { factory_ids: factoryIds },
      })
      commit('SET_FACTORIES', res.data)
    } catch (err) {
      return false
    }
  },

  async doneFinishedOrder({ commit }, order) {
    console.log(order)
    await this.$axios.put(`api/factories/updateOrder/${order.id}`)
    // commit('SET_ORDER', res.data)
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
