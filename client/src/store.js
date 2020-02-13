import Vue from 'vue'
import Vuex from 'vuex'
import api from "./api";

Vue.use(Vuex)


export default new Vuex.Store({
  state: {
    config: {},
    showHeader: true,
    user: {}
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
})

