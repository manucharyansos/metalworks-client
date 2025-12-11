export const state = () => ({
  items: [],
  meta: null,
  search: '',
  isLoading: false,
})

export const getters = {
  permissions: (state) => state.items,
  permissionsMeta: (state) => state.meta,
  permissionsSearch: (state) => state.search,
  permissionsIsLoading: (state) => state.isLoading,
}

export const mutations = {
  SET_PERMISSIONS(state, permissions) {
    state.items = permissions
  },
  SET_META(state, meta) {
    state.meta = meta
  },
  SET_SEARCH(state, search) {
    state.search = search
  },
  SET_LOADING(state, value) {
    state.isLoading = value
  },
}

export const actions = {
  async fetchPermissions({ commit, state }, { page = 1, search = null } = {}) {
    commit('SET_LOADING', true)

    try {
      const effectiveSearch = search !== null ? search : state.search

      commit('SET_SEARCH', effectiveSearch)

      const res = await this.$axios.$get('/api/permissions', {
        params: {
          page,
          search: effectiveSearch,
        },
      })

      commit('SET_PERMISSIONS', res.data || [])
      commit('SET_META', {
        current_page: res.current_page,
        last_page: res.last_page,
        from: res.from,
        to: res.to,
        total: res.total,
      })

      return res
    } finally {
      commit('SET_LOADING', false)
    }
  },

  setSearch({ commit }, search) {
    commit('SET_SEARCH', search)
  },

  async createPermission({ dispatch }, payload) {
    await this.$axios.$post('/api/permissions', {
      name: payload.name,
      slug: payload.slug,
      group: payload.group || null,
    })
  },

  async updatePermission({ dispatch }, payload) {
    await this.$axios.$put(`/api/permissions/${payload.id}`, {
      name: payload.name,
      slug: payload.slug,
      group: payload.group || null,
    })
  },

  async deletePermission({ dispatch }, id) {
    await this.$axios.$delete(`/api/permissions/${id}`)
  },
}
