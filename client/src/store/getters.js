const getPermissions = (state) => state.app.user && state.app.user.permissions

const getters = {
  canEditNote: (state) => getPermissions(state) && state.app.user.permissions.editNote,
  canEditConfig: (state) => getPermissions(state) && state.app.user.permissions.editConfig,
  showExplorerNotes: (state) => getPermissions(state) && state.app.user.permissions.showExplorerNotes,
  canViewStatistics: (state) => getPermissions(state) && state.app.user.permissions.viewStatistics,
  newWorkspace: (state) => getPermissions(state) && state.app.user.permissions.newWorkspace,
  newFolder: (state) => getPermissions(state) && state.app.user.permissions.newFolder,
  canClassify: (state) => getPermissions(state) && state.app.user.permissions.classify,
  canTrain: (state) => getPermissions(state) && state.app.user.permissions.train,
  canTest: (state) => getPermissions(state) && state.app.user.permissions.test,
  canValidate: (state) => getPermissions(state) && state.app.user.permissions.validate,
  canSeeMoveMenu: (state) => getPermissions(state) && state.app.user.permissions.moveMenu,
  canSeeConfusionMatrix: (state) => getPermissions(state) && state.app.user.permissions.showConfusionMatrix,
  canSyncDB: (state) => getPermissions(state) && state.app.user.permissions.ConvertToDatabase,
  canBackup: (state) => getPermissions(state) && state.app.user.permissions.canBackup,
  editConfigUI: (state) => getPermissions(state) && state.app.user.permissions.editConfigUI,
  editConfigAI: (state) => getPermissions(state) && state.app.user.permissions.editConfigAI,
  currentWs: (state) => {
    const { wsPath, root } = state.app.config
    return wsPath ? wsPath.substring(root.length) : 'Root'
  },
  imageSpacing: (state) => state.app.explorerConfig.imageSpacing || 10,
  workspaceFontSize: (state) => state.app.config.workspaceFontSize,
  subFolderFontSize: (state) => state.app.config.subFolderFontSize,
  showNavigationIcon: (state) => state.app.explorerConfig.showNavigationIcon,
  imageFit: (state) => (state.app.explorerConfig.imageFit || 'fill').toLowerCase(),
  imageViewer: (state) => state.app.explorerConfig.imageViewer,
  showHeader: (state) => state.app.showHeader,
}
export default getters
