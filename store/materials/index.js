export const state = () => ({
  materials: [],
  pagination: null,
})

export const getters = {
  getMaterials(state) {
    return state.materials
  },
  getPagination(state) {
    return state.pagination
  },
}

export const actions = {
  async fetchMaterials({ commit }, { page = 1, perPage = 10 } = {}) {
    try {
      const response = await this.$axios.get('api/materials', {
        params: { page, per_page: perPage }
      });
      commit('setMaterials', response.data.data); // Commit only the paginated data
      commit('setPagination', response.data); // Optionally commit pagination metadata
      return true;
    } catch (err) {
      console.error('Error fetching materials:', err);
      return false;
    }
  },

  async createMaterials({ commit }, data) {
    const response = await this.$axios.post('/api/materials', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (response) {
      this.$router.push('/manager')
    }
  },
}

export const mutations = {
  setMaterials(state, materials) {
    state.materials = materials
  },
  setPagination(state, pagination) {
    state.pagination = pagination;
  },
}
