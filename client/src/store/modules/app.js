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
    expanded: [],
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
    SET_EXPANDED: (state, val) => {
      state.expanded = val
    },
    SET_DEFAULT_ZOOM: (state, zoom) => {
      console.log(state, zoom)
      state.config.defaultZoom = zoom
    },
    ADD_EXPANDED: (state, { flag, path }) => {
      const filtered = state.expanded.filter((x) => (flag ? x === path : x.includes(path)))
      if (flag) {
        if (filtered.length === 0) {
          state.expanded.push(path)
        }
      } else {
        filtered.forEach((x) => {
          state.expanded.splice(state.expanded.indexOf(x), 1)
        })
      }
      localStorage.setItem('ws_expanded', state.expanded)
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
      commit('SET_SHOW_HEADER', !state.showHeader)
    },
    setUser: ({ commit }, user) => {
      commit('SET_USER', user)
    },
    setDefaultZoom: ({ commit }, zoom) => {
      commit('SET_DEFAULT_ZOOM', zoom)
    },
    logout({ commit }) {
      commit('SET_CONFIG', {})
      localStorage.removeItem('sessionToken')
      localStorage.removeItem('refreshToken')
      api.setSessionToken('')
    },
  },
  getters: {
    showHeader: (state) => state.showHeader,
    user: (state) => state.user,
  },
}
