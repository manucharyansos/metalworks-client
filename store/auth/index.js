export const state = () => ({
  token: null,
  user: null,
});

export const mutations = {
  SET_TOKEN(state, token) {
    state.token = token;
  },
  SET_USER(state, user) {
    state.user = user;
  },
};

export const actions = {
  async login({ commit }, credentials) {
    try {
      const { data } = await this.$axios.post('/login', credentials);
      commit('SET_TOKEN', data.token);
      this.$axios.setToken(data.token, 'Bearer');
      await this.fetchUser();
    } catch (error) {
      console.error('Login error:', error);
    }
  },

  async registerUser({ commit }, credentials) {
    try {
      const { data } = await this.$axios.post('/register', credentials);
      commit('SET_TOKEN', data.token);
      this.$axios.setToken(data.token, 'Bearer');
      await this.fetchUser();
    } catch (error) {
      console.error('Register error:', error);
    }
  },

  async logout({ commit }) {
    try {
      await this.$axios.post('/logout');
      commit('SET_TOKEN', null);
      commit('SET_USER', null);
      this.$axios.setToken(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  async fetchUser({ commit }) {
    try {
      const { data } = await this.$axios.get('/user');
      commit('SET_USER', data);
    } catch (error) {
      console.error('Fetch user error:', error);
    }
  },
};
