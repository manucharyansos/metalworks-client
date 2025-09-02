export const namespaced = true

export const state = () => ({
  items: [],
  item: null, // было {}, удобнее null для «нет данных»
  pagination: null,
  loading: false,
  error: null,
})

export const getters = {
  items: (s) =>
    (s.items || []).map((w) => {
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
      }
    }),
  item: (s) => s.item, // <-- корректный геттер для одного проекта
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
  SET_ITEMS(state, items) {
    state.items = items || []
  },
  SET_ITEM(state, item) {
    state.item = item || null
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
      const items = unwrapItems(res)
      const pagination = unwrapPagination(res)
      commit('SET_ITEMS', items)
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

  // Загрузить один проект по id
  async fetchItem({ commit }, id) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      // ВАРИАНТ 1 (REST): /api/works/:id
      const { data: res } = await this.$axios.get(`/api/works/${id}`)

      // ВАРИАНТ 2 (если у тебя show через query): раскомментируй это, а строку выше закомментируй
      // const { data: res } = await this.$axios.get('/api/works/show', { params: { id } })

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
