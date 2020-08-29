import api from '../../utils/api'

export default {
  namespaced: true,
  state: {
    config: {},
    showHeader: true,
    user: {},
    showNotes: false,
    notesContent: '',
    calculating: false,
    statisticVisible: false,
    explorerConfig: {},
  },
  mutations: {
    SET_CONFIG: (state, config) => {
      state.config = config
    },
    SET_EXPLORER_CONFIG: (state, explorerConfig) => {
      state.explorerConfig = explorerConfig
    },
    SET_STATISTIC_VISIBLE: (state, visible) => {
      state.statisticVisible = visible
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
    SET_CALCULATING: (state, calculating) => {
      state.calculating = calculating
    },

  },
  actions: {
    setConfig: ({ commit }, config) => {
      commit('SET_CONFIG', config)
    },
    setExplorerConfig: ({ commit }, explorerConfig) => {
      commit('SET_EXPLORER_CONFIG', explorerConfig)
    },
    setStatisticVisible: ({ commit }, visible) => {
      commit('SET_STATISTIC_VISIBLE', visible)
    },
    toggleHeader: ({ commit, state }) => {
      console.log('state', state)
      commit('SET_SHOW_HEADER', !state.showHeader)
    },
    setUser: ({ commit }, user) => {
      commit('SET_USER', user)
    },

    logout({ commit }) {
      commit('SET_CONFIG', {})
      localStorage.removeItem('sessionToken')
      api.setSessionToken('')
    },

    calculateStatistic({ commit }) {
      commit('SET_CALCULATING', true)
      return new Promise((resolve, reject) => {
        api.calculateStatistic()
          .then(() => {
            commit('SET_CALCULATING', false)
            resolve(true)
          })
          .catch((err) => {
            commit('SET_CALCULATING', false)
            reject(err)
          })
      })
    },

  },
  getters: {
    showHeader: (state) => state.showHeader,
    user: (state) => state.user,
  },
}
