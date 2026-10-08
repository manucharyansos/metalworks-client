export const namespaced = true
export const state = () => ({ company: null, companies: [], switching: false })
export const mutations = {
  bootstrap(state, user) {
    state.company = user?.company || null
    state.companies = Array.isArray(user?.companies) ? user.companies : []
  },
  switching(state, value) { state.switching = Boolean(value) },
  clear(state) { state.company = null; state.companies = []; state.switching = false },
}
