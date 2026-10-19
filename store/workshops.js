export const state = () => ({ items: [], loaded: false, requestVersion: 0 })
export const mutations = {
  SET_ITEMS(state, rows) {
    state.items = rows || []
    state.loaded = true
  },
  START(state) {
    state.requestVersion++
  },
}
export const actions = {
  async load({ state, rootState, commit }) {
    commit('START')
    const version = state.requestVersion;
      const company = rootState.workspace?.company?.id
    const { data } = await this.$axios.get('/api/workshops')
    if (
      version === state.requestVersion &&
      company === rootState.workspace?.company?.id
    )
      commit('SET_ITEMS', data.workshops)
  },
}
