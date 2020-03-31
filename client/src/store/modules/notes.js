import api from '../../utils/api';

export default {
  namespaced: true,
  state: {
    visible: false,
    folder: {},
  },
  mutations: {
    SET_VISIBLE: (state, visible) => {
      state.visible = visible;
    },
    SET_FOLDER: (state, folder) => {
      state.folder = folder;
    },
  },
  actions: {
    setVisible: ({ commit }, visible) => {
      commit('SET_VISIBLE', visible);
    },
    setFolder: ({ commit }, folder) => {
      commit('SET_FOLDER', folder);
    },
    showFolder: ({ commit }, folder) => {
      if (folder.notes) {
        commit('SET_FOLDER', folder);
        commit('SET_VISIBLE', true);
      }
    },
    setContent: ({ commit, state }, val) => {
      const folder = { ...state.folder };
      folder.notes = val;
      commit('SET_FOLDER', folder);
    },
    save: ({ commit, state }) => new Promise((resolve, reject) => {
      api.saveNotes(state.folder.notesPath, state.folder.notes)
        .then(() => {
          commit('SET_VISIBLE', false);
          resolve();
        })
        .catch(reject);
    }),
  },
};
