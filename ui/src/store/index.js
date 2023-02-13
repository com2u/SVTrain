import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import notes from './modules/notes'
import wsconfig from './modules/wsconfig'
import getters from './getters.js'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: { app, notes, wsconfig },
  getters,
})
