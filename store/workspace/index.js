export const namespaced = true
export const state = () => ({ company: null, companies: [], assignments: [], assignmentId: null, switching: false })
export const mutations = {
  bootstrap(state, user) {
    state.company = user?.company || null
    state.companies = Array.isArray(user?.companies) ? user.companies : []
    state.assignments = Array.isArray(user?.assignments) ? user.assignments : []
    state.assignmentId = user?.assignment_id || null
  },
  switching(state, value) { state.switching = Boolean(value) },
  clear(state) { state.company = null; state.companies = []; state.assignments = []; state.assignmentId = null; state.switching = false },
}
