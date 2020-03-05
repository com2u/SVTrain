import api from "../api";

export default {
  namespaced: true,
  state: {
    config: {},
    showHeader: true,
    user: {},
    showNotes: false,
    notesContent: '',
    calculating: false
  },
  mutations: {
    SET_CONFIG: (state, config) => {
      state.config = config
    },
    SET_SHOW_HEADER: (state, show) => {
      state.showHeader = show
    },
    SET_USER: (state, user) => {
      state.user = user
    },
    SET_SHOW_NOTES: (state, show) => {
      state.showNotes = show
    },
    SET_NOTES_CONTENT: (state, content) => {
      state.notesContent = content
    },
    SET_CALCULATING:(state, calculating) => {
      state.calculating = calculating
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
    },

    calculateStatistic({commit}) {
      commit('SET_CALCULATING', true)
      return new Promise((resolve, reject) => {
        api.calculateStatistic()
          .then(res => {
            commit('SET_CALCULATING', false)
            resolve(true)
          })
          .catch((err) => {
            commit('SET_CALCULATING', false)
            reject(err)
          })
      })
    }

  },
  getters: {
    showHeader: state => state.showHeader,
    user: state => state.user
  }
}
