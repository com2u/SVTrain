import api from '../api'

export default {
  namespaced: true,
  state: {
    visible: false,
    folder: {}
  },
  mutations: {
    SET_VISIBLE: (state, visible) => {
      state.visible = visible
    },
    SET_FOLDER: (state, folder) => {
      state.folder = folder
    },
  },
  actions: {
    setVisible: ({commit}, visible) => {
      commit('SET_VISIBLE', visible)
    },
    setFolder: ({commit}, folder) => {
      commit('SET_FOLDER', folder)
    },
    showFolder: ({commit}, folder) => {
      commit('SET_FOLDER', folder)
      commit('SET_VISIBLE', true)
    },
    setConfig: ({commit, state}, val) => {
      const folder = {...state.folder}
      folder.config = val
      commit('SET_FOLDER', folder)
    },
    save: ({commit, state}, config) => {
      return new Promise((resolve, reject) => {
        api.saveConfig(state.folder.cfgPath, config)
          .then(() => {
            commit('SET_VISIBLE', false)
            resolve()
          })
          .catch(reject)
      })
    }
  }
}
