module.exports = {
  rightMenu: {
    width: 250,
    margin: 5,
    fontSize: "1rem"
  },
  filePerPage: 15,
  showFileName: false,
  importFiles: false,
  maxFileSize: 10,
  useShortcuts: true,
  requestBeforeDelete: true,
  defaultPictureSize: 200,
  deleteDefaultFolder: 'Deleted_files',
  selectedPath: 'Selected_new',
  notSelectedPath: 'Not_Selected',
  forwardOnly: false,
  buttonFontSize: '1rem',
  titleFontSize: '1rem',
  defaultEpoch: 1,
  defaultLearningRate: 1,

  // top or right
  forwardLocaltion: 'right',
  moveMenu: true,
  newFolder: true,
  newWorkspace: true,

  imageSpacing: 10,

  workspaceFontSize: '25px',
  subFolderFontSize: '16px',

  showNavigationIcon: false,
  changePWDUri: process.env.KEYCLOAK_URI_ACCOUNT,
  KCManagementUri: process.env.KEYCLOAK_URI_MANAGEMENT
}
