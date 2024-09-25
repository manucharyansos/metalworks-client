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
      const res = await this.$axios.get('/api/factories/getOrdersByFactories', {
        params: { factory_ids: factoryIds },
      })
      commit('SET_FACTORIES', res.data)
    } catch (err) {
      return false
    }
  },

  async doneFinishedOrder({ commit }, order) {
    const res = await this.$axios.put(`api/factories/updateOrder/${order.id}`, {
      factory_order_statuses: order.factory_order_statuses,
      factory_id: order.factory_id,
      details: order.details,
    })
    commit('SET_ORDER', res.data)
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
