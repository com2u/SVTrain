const getPermissions = (state) => state.app.user && state.app.user.permissions;

const getters = {
  canEditNote: (state) => getPermissions(state) && state.app.user.permissions.editNote,
  canEditConfig: (state) => getPermissions(state) && state.app.user.permissions.editConfig,
  canViewStatistics: (state) => getPermissions(state) && state.app.user.permissions.viewStatistics,
  newWorkspace: (state) => getPermissions(state) && state.app.user.permissions.newWorkspace,
  newFolder: (state) => getPermissions(state) && state.app.user.permissions.newFolder,
  canClassify: (state) => getPermissions(state) && state.app.user.permissions.classify,
  canTrain: (state) => getPermissions(state) && state.app.user.permissions.train,
  canTest: (state) => getPermissions(state) && state.app.user.permissions.test,
  canValidate: (state) => getPermissions(state) && state.app.user.permissions.validate,
  canSeeMoveMenu: (state) => getPermissions(state) && state.app.user.permissions.moveMenu,
  currentWs: (state) => {
    const { wsPath, root } = state.app.config;
    return wsPath ? wsPath.substring(root.length) : 'Root';
  },

  imageSpacing: (state) => state.app.config.imageSpacing || 10,
  workspaceFontSize: (state) => state.app.config.workspaceFontSize,
  subFolderFontSize: (state) => state.app.config.subFolderFontSize,
  showNavigationIcon: (state) => state.app.config.showNavigationIcon,
};
export default getters;
