export const state = () => ({
  basket: {
    id: null,
    items: [],
    loading: false,
    error: null,
  },
  isOpen: false, // ✅ UI state moved here
})

export const getters = {
  basketItems: (state) => state.basket.items || [],
  basketTotal: (state) => {
    const total = (state.basket.items || []).reduce((sum, item) => {
      const price = parseFloat(item.price) || 0
      const qty = parseInt(item.quantity) || 0
      return sum + price * qty
    }, 0)
    return total.toFixed(2)
  },
  // ✅ count ըստ quantities, ոչ թե items.length
  basketItemCount: (state) =>
    (state.basket.items || []).reduce(
      (sum, i) => sum + (parseInt(i.quantity) || 0),
      0
    ),
  isLoading: (state) => state.basket.loading,
  error: (state) => state.basket.error,
  isBasketOpen: (state) => state.isOpen,
  basketId: (state) => state.basket.id,
}

export const mutations = {
  SET_BASKET(state, basket) {
    state.basket = {
      ...state.basket,
      id: basket?.id ?? state.basket.id,
      items: Array.isArray(basket?.items) ? basket.items : [],
    }
  },
  SET_LOADING(state, loading) {
    state.basket.loading = !!loading
  },
  SET_ERROR(state, error) {
    state.basket.error = error
  },
  CLEAR_BASKET(state) {
    state.basket = { id: null, items: [], loading: false, error: null }
  },
  // ✅ UI
  SET_OPEN(state, val) {
    state.isOpen = !!val
  },
  TOGGLE_OPEN(state) {
    state.isOpen = !state.isOpen
  },
}

export const actions = {
  // ---------- UI ----------
  openBasket({ commit }) {
    commit('SET_OPEN', true)
  },
  closeBasket({ commit }) {
    commit('SET_OPEN', false)
  },
  toggleBasket({ commit }) {
    commit('TOGGLE_OPEN')
  },

  // ---------- API ----------
  async fetchBasket({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const { data } = await this.$axios.get('/api/baskets/current')
      commit('SET_BASKET', { id: data.id, items: data.items })
    } catch (error) {
      commit('SET_ERROR', 'Failed to load basket')
      // console.error('Basket load error:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async addToBasket({ commit, dispatch }, product) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      await this.$axios.post('/api/baskets', {
        product_id: product.id,
        quantity: 1,
      })
      // ✅ ուղղակի թարմացնենք զամբյուղը մեկ fetch-ով
      await dispatch('fetchBasket')
      commit('SET_OPEN', true) // UX՝ բացել զամբյուղը
    } catch (error) {
      commit('SET_ERROR', 'Failed to add item')
      // console.error('Add to basket error:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateItem({ commit, dispatch }, { itemId, quantity, action = 'set' }) {
    if (quantity < 1) return
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      await this.$axios.put(`/api/baskets/items/${itemId}`, {
        quantity,
        action,
      })
      await dispatch('fetchBasket') // պահում ենք ճշգրիտ server state
    } catch (error) {
      commit('SET_ERROR', 'Failed to update item')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async removeItem({ commit, dispatch }, itemId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      await this.$axios.delete(`/api/baskets/items/${itemId}`)
      await dispatch('fetchBasket')
    } catch (error) {
      commit('SET_ERROR', 'Failed to remove item')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async clearBasket({ commit, state }) {
    if (!state.basket.id) {
      commit('CLEAR_BASKET')
      return
    }
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      await this.$axios.delete(`/api/baskets/${state.basket.id}`)
      commit('CLEAR_BASKET')
    } catch (error) {
      commit('SET_ERROR', 'Failed to clear basket')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
}
