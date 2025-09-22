export const state = () => ({
  items: [],
  pagination: null,
  loading: false,
  error: null,

  lastLoadedLocale: null,
})

export const getters = {
  getServices: (s) => s.items,
  getServicesPagination: (s) => s.pagination,
  isLoading: (s) => s.loading,
  error: (s) => s.error,
}

export const mutations = {
  SET_LOADING(s, v) {
    s.loading = v
  },
  SET_ERROR(s, e) {
    s.error = e
  },
  SET_SERVICES(s, items) {
    s.items = Array.isArray(items) ? items : []
  },
  SET_PAGINATION(s, p) {
    s.pagination = p || null
  },
  SET_LAST_LOCALE(s, code) {
    s.lastLoadedLocale = code
  },
  UPSERT_SERVICE(s, item) {
    const i = s.items.findIndex((x) => x.id === item.id)
    if (i === -1) s.items.unshift(item)
    else s.items.splice(i, 1, item)
  },
  REMOVE_SERVICE(s, id) {
    s.items = s.items.filter((x) => x.id !== id)
  },
}

export const actions = {
  async fetchServices(
    { commit },
    { perPage = 10, simple = true, page = 1, search } = {}
  ) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const params = simple
        ? { simple: true, search: search || undefined } // ✅ Ավելացրու
        : { per_page: perPage, page, search: search || undefined }

      const { data } = await this.$axios.get('/api/services', { params })
      if (!data.status)
        throw new Error(data.message || 'Failed to load services')

      commit('SET_SERVICES', data.data)
      commit('SET_PAGINATION', data.pagination || null)
    } catch (e) {
      commit('SET_ERROR', 'Չհաջողվեց բեռնել ծառայությունները')
      throw e
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchServiceBySlug({ commit }, slug) {
    const { data } = await this.$axios.get(
      `/api/services/slug/${encodeURIComponent(slug)}`
    )
    if (!data?.status) throw new Error(data?.message || 'Service not found')
    return data.data
  },

  async createService({ commit }, form) {
    const { data } = await this.$axios.post('/api/services', form)
    if (!data?.status) throw new Error(data?.message || 'Create failed')
    commit('UPSERT_SERVICE', data.data)
    return data.data
  },

  async updateService({ commit }, { id, form }) {
    if (!(form instanceof FormData)) {
      const fd = new FormData()
      for (const [k, v] of Object.entries(form)) fd.append(k, v)
      form = fd
    }
    form.append('_method', 'PUT')
    const { data } = await this.$axios.post(`/api/services/${id}`, form)
    if (!data?.status) throw new Error(data?.message || 'Update failed')
    commit('UPSERT_SERVICE', data.data)
    return data.data
  },

  async deleteService({ commit }, id) {
    const { data } = await this.$axios.delete(`/api/services/${id}`)
    if (!data?.status) throw new Error(data?.message || 'Delete failed')
    commit('REMOVE_SERVICE', id)
    return true
  },
}
