const STAGES = ['created', 'accepted', 'in_progress', 'completed']
const scopeKey = (root) =>
  `${root?.auth?.user?.id || ''}:${root?.workspace?.company?.id || ''}`
const canLoadBoard = root => Boolean(root?.workspace?.company?.id && !root?.workspace?.switching && (['admin', 'manager'].includes(root?.auth?.user?.role?.name) || root?.auth?.user?.permissions?.includes('orders.view')))
const emptyColumns = () =>
  Object.fromEntries(
    STAGES.map((stage) => [
      stage,
      {
        orders: [],
        pagination: { current_page: 1, total: 0, per_page: 4, last_page: 1 },
        loading: false,
        loaded: false,
        error: null,
        requestVersion: 0,
      },
    ])
  )

export const state = () => ({
  orders: [],
  order: null,
  pagination: {
    current_page: 1,
    total: 0,
    per_page: 4,
    last_page: 1,
    from: 0,
    to: 0,
    next_page_url: null,
    prev_page_url: null,
  },
  filters: {
    search: '',
    confirmation: '',
    stage: '',
  },
  stageCounts: { created: 0, accepted: 0, in_progress: 0, completed: 0 },
  requestVersion: 0,
  boardVersion: 0,
  boardScope: '',
  boardPerPage: 4,
  boardColumns: emptyColumns(),
  loading: false,
  error: null,
  laserFiles: [],
  bendFiles: [],
})

export const getters = {
  getBoardColumns: (s, _getters, root) =>
    s.boardScope === scopeKey(root) ? s.boardColumns : emptyColumns(),
  getBoardPerPage: (s) => s.boardPerPage,
  getOrders: (s) => s.orders,
  getOrder: (s) => s.order,
  getPagination: (s) => s.pagination,
  getFilters: (s) => s.filters,
  getStageCounts: (s) => s.stageCounts,
  isLoading: (s) => s.loading,
  getError: (s) => s.error,
}

export const mutations = {
  START_BOARD(state, { scope, reset }) {
    state.boardVersion++
    if (reset || state.boardScope !== scope) state.boardColumns = emptyColumns()
    state.boardScope = scope
  },
  SET_BOARD_PER_PAGE(state, value) {
    state.boardPerPage = Math.max(1, Math.min(100, Number(value) || 4))
  },
  START_COLUMN(state, stage) {
    const column = state.boardColumns[stage]
    column.requestVersion++
    column.loading = true
    column.error = null
  },
  SET_COLUMN(state, { stage, data, error }) {
    const column = state.boardColumns[stage]
    if (data) {
      column.orders = data.orders || []
      column.pagination = data.pagination
      column.loaded = true
    }
    column.error = error || null
    column.loading = false
  },
  INVALIDATE_BOARD(state) {
    state.boardVersion++
    for (const column of Object.values(state.boardColumns))
      column.loading = false
  },
  START_REQUEST(state) {
    state.requestVersion++
  },
  SET_STAGE(state, value) {
    state.filters.stage = value || ''
  },
  SET_STAGE_COUNTS(state, value) {
    state.stageCounts = {
      created: 0,
      accepted: 0,
      in_progress: 0,
      completed: 0,
      ...(value || {}),
    }
  },
  SET_LOADING(state, v) {
    state.loading = !!v
  },
  SET_ERROR(state, msg) {
    state.error = msg || null
  },

  SET_ORDERS(state, orders) {
    state.orders = orders || []
  },
  SET_PAGINATION(state, p) {
    state.pagination = { ...state.pagination, ...(p || {}) }
  },
  SET_ORDER(state, order) {
    state.order = order || null
  },

  SET_CONFIRMATION(state, value) {
    state.filters.confirmation = value || ''
  },
  SET_SEARCH(state, q) {
    state.filters.search = q || ''
  },
  SET_PER_PAGE(state, n) {
    const per = Number(n) || 10
    state.pagination.per_page = per
  },

  ADD_ORDER(state, order) {
    state.orders.unshift(order)
    state.pagination.total += 1
    state.pagination.to += 1
  },
}

export const actions = {
  async fetchBoard(
    { commit, dispatch, rootState },
    { search, confirmation, perPage, reset = false } = {}
  ) {
    if (!canLoadBoard(rootState)) return false
    if (search !== undefined) commit('SET_SEARCH', search)
    if (confirmation !== undefined) commit('SET_CONFIRMATION', confirmation)
    if (perPage !== undefined) commit('SET_BOARD_PER_PAGE', perPage)
    commit('START_BOARD', { scope: scopeKey(rootState), reset })
    const results = await Promise.all(
      STAGES.map((stage) => dispatch('fetchBoardColumn', { stage }))
    )
    return results.every(Boolean)
  },
  async fetchBoardColumn({ commit, state, rootState }, { stage, page } = {}) {
    if (!canLoadBoard(rootState) || !STAGES.includes(stage)) return false
    const scope = scopeKey(rootState)
    if (state.boardScope !== scope) return false
    const boardVersion = state.boardVersion
    commit('START_COLUMN', stage)
    const column = state.boardColumns[stage]
    const requestVersion = column.requestVersion
    const current = () =>
      state.boardVersion === boardVersion &&
      column.requestVersion === requestVersion &&
      state.boardScope === scope &&
      scopeKey(rootState) === scope
    const params = {
      stage,
      page: Math.max(1, Number(page) || column.pagination.current_page || 1),
      per_page: state.boardPerPage,
    }
    if (state.filters.search) params.search = state.filters.search
    if (state.filters.confirmation)
      params.confirmation = state.filters.confirmation
    try {
      let { data } = await this.$axios.get('/api/engineers/engineer', {
        params,
      })
      if (!current()) return false
      if (params.page > data.pagination.last_page) {
        params.page = data.pagination.last_page
        const response = await this.$axios.get('/api/engineers/engineer', {
          params,
        })
        data = response.data
        if (!current()) return false
      }
      commit('SET_COLUMN', { stage, data })
      return true
    } catch (_) {
      if (current()) commit('SET_COLUMN', { stage, error: 'loadFailed' })
      return false
    }
  },
  async fetchOrders(
    { commit, state, rootState },
    { page, perPage, search, confirmation, stage } = {}
  ) {
    if (confirmation !== undefined) commit('SET_CONFIRMATION', confirmation)
    if (stage !== undefined) commit('SET_STAGE', stage)
    commit('START_REQUEST')
    const version = state.requestVersion
    const companyId = rootState?.workspace?.company?.id
    const current = () =>
      version === state.requestVersion &&
      companyId === rootState?.workspace?.company?.id
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const params = {
        page: page || state.pagination.current_page || 1,
        per_page: perPage || state.pagination.per_page || 10,
      }
      const q = typeof search === 'string' ? search : state.filters.search
      if (q) params.search = q
      if (state.filters.confirmation)
        params.confirmation = state.filters.confirmation
      if (state.filters.stage) params.stage = state.filters.stage

      const { data } = await this.$axios.get('/api/engineers/engineer', {
        params,
      })
      if (!current()) return false
      commit('SET_ORDERS', data.orders)
      commit('SET_PAGINATION', data.pagination)
      commit('SET_STAGE_COUNTS', data.stage_counts)
      return true
    } catch (e) {
      if (current()) commit('SET_ERROR', 'Չհաջողվեց բեռնել առաջադրանքները')
      return false
    } finally {
      if (current()) commit('SET_LOADING', false)
    }
  },

  setSearch({ commit, dispatch }, q) {
    commit('SET_SEARCH', q)
    return dispatch('fetchOrders', { page: 1 })
  },

  setPerPage({ commit, dispatch }, n) {
    commit('SET_PER_PAGE', n)
    return dispatch('fetchOrders', { page: 1 })
  },

  goPage({ dispatch, state }, p) {
    const page = Math.max(1, Math.min(p, state.pagination.last_page || 1))
    return dispatch('fetchOrders', { page })
  },

  async createNewOrder({ commit }, payload) {
    const { data } = await this.$axios.post('/api/engineers/engineer', payload)
    commit('ADD_ORDER', data.order)
    return true
  },
}
