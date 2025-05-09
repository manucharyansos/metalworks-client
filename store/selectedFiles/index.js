export default {
  namespaced: true,
  state() {
    return {
      files: [],
      ids: []
    }
  },
  getters: {
    getFiles(state) {
      return state.files
    },
    getIdis(state) {
      return state.ids
    }
  },
  mutations: {
    SET_FILES(state, files) {
      state.files = files
    },
    SET_IDS(state, ids) {
      state.ids = ids
    },
  },
  actions: {
    
  }
}
