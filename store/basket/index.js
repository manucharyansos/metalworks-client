export const state = () => ({
  basket: {
    id: null,
    items: [],
    loading: false,
    error: null
  }
})

export const getters = {
  basketItems: (state) => state.basket.items,
  basketTotal: (state) => {
    return state.basket.items.reduce((total, item) => {
      return total + (parseFloat(item.price) * parseInt(item.quantity))
    }, 0).toFixed(2)
  },
  basketItemCount: (state) => state.basket.items.length,
  isLoading: (state) => state.basket.loading,
  error: (state) => state.basket.error
}

export const mutations = {
  SET_BASKET(state, basket) {
    state.basket = {
      ...state.basket,
      id: basket.id,
      items: basket.items || []
    }
  },
  SET_LOADING(state, loading) {
    state.basket.loading = loading
  },
  SET_ERROR(state, error) {
    state.basket.error = error
  },
  CLEAR_BASKET(state) {
    state.basket = {
      id: null,
      items: [],
      loading: false,
      error: null
    }
  }
}

export const actions = {
  async fetchBasket({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const response = await this.$axios.get('/api/baskets/current')
      commit('SET_BASKET', {
        id: response.data.id,
        items: response.data.items
      })
    } catch (error) {
      commit('SET_ERROR', 'Failed to load basket')
      console.error('Basket load error:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async addToBasket({ commit, dispatch }, product) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const response = await this.$axios.post('/api/baskets', {
        product_id: product.id,
        quantity: 1
      })
      commit('SET_BASKET', response.data)
      await dispatch('fetchBasket') // Ensure fresh data
    } catch (error) {
      commit('SET_ERROR', 'Failed to add item')
      console.error('Add to basket error:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateItem({ commit }, { itemId, quantity, action = 'set' }) {
    if (quantity < 1) return

    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const response = await this.$axios.put(`/api/baskets/items/${itemId}`, {
        quantity,
        action
      })
      commit('SET_BASKET', response.data)
    } catch (error) {
      commit('SET_ERROR', 'Failed to update item')
      console.error('Update item error:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async removeItem({ commit }, itemId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const response = await this.$axios.delete(`/api/baskets/items/${itemId}`)
      commit('SET_BASKET', response.data)
    } catch (error) {
      commit('SET_ERROR', 'Failed to remove item')
      console.error('Remove item error:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async clearBasket({ commit, state }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      await this.$axios.delete(`/api/baskets/${state.basket.id}`)
      commit('CLEAR_BASKET')
    } catch (error) {
      commit('SET_ERROR', 'Failed to clear basket')
      console.error('Clear basket error:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}
