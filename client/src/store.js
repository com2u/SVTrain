import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)


export default new Vuex.Store({
  state: {
    config: {}
  },
  mutations: {
    SET_CONFIG: (state, config) => {
      state.config = config
    }
  },
  actions: {
    setConfig: ({commit}, config) => {
      commit('SET_CONFIG', config)
    }
  }
})

