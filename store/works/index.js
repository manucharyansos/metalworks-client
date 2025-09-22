export const namespaced = true

export const state = () => ({
  works: [],
  work: null,
  pagination: null,
  loading: false,
  error: null,
})

export const getters = {
  works: (s) =>
    (s.works || []).map((w) => {
      const cover =
        w.image_url ||
        (Array.isArray(w.images) && w.images.length ? w.images[0].url : null) ||
        '/placeholder.svg'
      return {
        id: w.id,
        title: w.title,
        slug: w.slug,
        description: w.description,
        image: cover,
        tags: w.tags || [],
        created_at: w.created_at,
        images: w.images,
      }
    }),
  work: (s) => s.work,
  pagination: (s) => s.pagination,
  loading: (s) => s.loading,
  error: (s) => s.error,
}

export const mutations = {
  SET_LOADING(state, v) {
    state.loading = v
  },
  SET_ERROR(state, err) {
    state.error = err
  },
  SET_ITEMS(state, works) {
    state.works = works || []
  },
  SET_ITEM(state, work) {
    state.work = work || null
  },
  SET_PAGINATION(state, p) {
    state.pagination = p || null
  },
}

function unwrapItems(resBody) {
  if (!resBody || typeof resBody !== 'object') return []
  if (Array.isArray(resBody.data)) return resBody.data
  if (resBody.data && Array.isArray(resBody.data.data)) return resBody.data.data
  return []
}
function unwrapPagination(resBody) {
  if (!resBody || typeof resBody !== 'object') return null
  return resBody.pagination || (resBody.data && resBody.data.pagination) || null
}

export const actions = {
  async fetchWorks({ commit }, params = {}) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    const { page = 1, perPage = 12, simple = false, search = '' } = params
    const query = { page, per_page: perPage, simple }
    if (search) query.search = search

    try {
      const { data: res } = await this.$axios.get('/api/works', {
        params: query,
      })
      const works = unwrapItems(res)
      const pagination = unwrapPagination(res)
      commit('SET_ITEMS', works)
      commit('SET_PAGINATION', pagination)
      return { data: res } // чтобы можно было цепочкой использовать
    } catch (e) {
      commit('SET_ERROR', 'Չհաջողվեց բեռնել աշխատանքները')
      commit('SET_ITEMS', [])
      commit('SET_PAGINATION', null)
      throw e
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchItem({ commit }, id) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const { data: res } = await this.$axios.get(`/api/works/${id}`)

      const data = res?.data || res
      commit('SET_ITEM', data)
      return { data: res }
    } catch (e) {
      commit('SET_ERROR', 'Չհաջողվեց բեռնել նախագիծը')
      commit('SET_ITEM', null)
      throw e
    } finally {
      commit('SET_LOADING', false)
    }
  },
}
