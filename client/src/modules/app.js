import api from "../api";

export default {
  namespaced: true,
  state: {
    config: {},
    showHeader: true,
    user: {},
    showNotes: false,
    notesContent: ''
  },
  mutations: {
    SET_CONFIG: (state, config) => {
      state.config = config
    },
    SET_SHOW_HEADER: (stage, show) => {
      stage.showHeader = show
    },
    SET_USER: (stage, user) => {
      stage.user = user
    },
    SET_SHOW_NOTES: (stage, show) => {
      stage.showNotes = show
    },
    SET_NOTES_CONTENT: (stage, content) => {
      stage.notesContent = content
    }

  },
  actions: {
    setConfig: ({commit}, config) => {
      commit('SET_CONFIG', config)
    },
    toggleHeader: ({commit, state}) => {
      console.log('state', state)
      commit('SET_SHOW_HEADER', !state.showHeader)
    },
    setUser: ({commit}, user) => {
      commit('SET_USER', user)
    },

    logout() {
      localStorage.removeItem('sessionToken')
      api.setSessionToken('')
    }
  },
  getters: {
    showHeader: state => state.showHeader,
    user: state => state.user
  }
}
