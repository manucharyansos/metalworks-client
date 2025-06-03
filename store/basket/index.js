export const state = () => ({
  basket: [],
  basketId: null, 
})

export const getters = {
  getBasket(state) {
    return state.basket
  },
  getBasketId(state) {
    return state.basketId
  },
}

export const actions = {
  async fetchBasket({ commit }) {
    try {
      const response = await this.$axios.get('/api/baskets')
      commit('setBasket', response.data.items || [])
      commit('setBasketId', response.data.id) 
    } catch (error) {
      console.error('Error fetching basket:', error)
    }
  },

  async addToBasket({ commit }, product) {
    try {
      const response = await this.$axios.post('/api/baskets', { product })
      commit('setBasket', response.data.basket.items || [])
      commit('setBasketId', response.data.basket.id)
    } catch (error) {
      console.error('Error adding to basket:', error)
    }
  },

  async updateBasketItem({ commit, state }, { product, action }) {
    try {
      const response = await this.$axios.put(`/api/baskets/${state.basketId}`, { product, action })
      commit('setBasket', response.data.basket.items || [])
    } catch (error) {
      console.error('Error updating basket:', error)
    }
  },

  async deleteBasket({ commit, state }) {
    try {
      await this.$axios.delete(`/api/baskets/${state.basketId}`)
      commit('setBasket', [])
      commit('setBasketId', null)
    } catch (error) {
      console.error('Error deleting basket:', error)
    }
  },

  // Նոր action՝ ապրանքը ջնջելու համար
  async removeItem({ commit, state }, productId) {
    try {
      const response = await this.$axios.delete(`/api/baskets/${state.basketId}/items`, { data: { product_id: productId } })
      commit('setBasket', response.data.basket.items || [])
    } catch (error) {
      console.error('Error removing item from basket:', error)
    }
  },
}

export const mutations = {
  setBasket(state, basket) {
    state.basket = basket
  },
  setBasketId(state, basketId) {
    state.basketId = basketId
  },
}