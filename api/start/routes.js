'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

const logger = use('Logger')

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
const Helpers = use('Helpers')

Route.group(() => {
  Route.get('/getFiles', 'ExplorerController.all').middleware('auth')
  Route.get('/getParent', 'ExplorerController.parent').middleware('auth')
  Route.get('/getState', 'ExplorerController.state').middleware('auth')
  Route.get('/nextDirectories', 'ExplorerController.next').middleware('auth')
  Route.get('/runCommand/:name', 'ExplorerController.command').middleware('auth')
  Route.get('/getStatistic', 'ExplorerController.statistic').middleware('auth')
  Route.get('/calculateStatistic', 'ExplorerController.calculate').middleware('auth')
  Route.post('/deleteFiles', 'ExplorerController.delete').middleware('auth')
  Route.post('/moveFiles', 'ExplorerController.move').middleware('auth')
  Route.post('uploadFiles', 'ExplorerController.uploadFiles').middleware('auth')
  Route.post('/saveFile', 'ExplorerController.saveFile').middleware('auth')
  Route.post('/setImageData', 'ExplorerController.setImageData').middleware('auth')
  Route.post('/getImageData', 'ExplorerController.getImageData').middleware('auth')
  Route.get('/getImageTags', 'ExplorerController.getImageTags').middleware('auth')
  Route.get('/getSubfolders', 'ExplorerController.getSubfolders').middleware('auth')
  Route.get('/checkFolder', 'ExplorerController.checkFolder').middleware('auth')
  Route.post('/createFolder', 'ExplorerController.createFolder').middleware('auth')
  Route.post('/createWorkspace', 'ExplorerController.createWorkspace').middleware('auth')
  Route.get('/getWorkspace', 'ExplorerController.getWorkspace').middleware('auth')
  Route.post('/setWorkspace', 'ExplorerController.setWorkspace').middleware('auth')
  Route.get('/getLastLogs', 'ExplorerController.getLastLogs').middleware('auth')
  Route.get('/logs/:file', 'ExplorerController.logsFor').middleware('auth')
  Route.get('/config', 'ExplorerController.getConfig').middleware('auth')
  Route.get('/explorerConfig', 'ExplorerController.getExplorerConfig').middleware('auth')
  Route.post('/forwardOnly', 'ExplorerController.doForwardOnly').middleware('auth')
  Route.post('/notes', 'ExplorerController.saveNotes').middleware('auth')
  Route.post('/saveConfig', 'ExplorerController.saveConfig').middleware('auth')
  Route.get('/getFolders', 'ExplorerController.getSubFolderByPath').middleware('auth')
  Route.get('/getRootFolderContent', 'ExplorerController.getRootFolderContent').middleware('auth')
  Route.post('/renameWorkspace', 'ExplorerController.renameWorkspace').middleware('auth')
  Route.post('/duplicateWorkspace', 'ExplorerController.duplicateWorkspace').middleware('auth')
  Route.post('/deletePath', 'ExplorerController.deletePath').middleware('auth')
  Route.post('/deleteWorkspaceImages', 'ExplorerController.deleteWorkspaceImages').middleware('auth')
  Route.post('/backupWorkspace', 'ExplorerController.backupWorkspace').middleware('auth')
  Route.get('/downloadBackup', 'ExplorerController.downloadBackup').middleware('auth')
  Route.post('/listStatistics', 'ExplorerController.listStatistic').middleware('auth')
  Route.post('/fetchConfusionMatrix', 'ExplorerController.confusionMatrix').middleware('auth')
  Route.post('/convertToDatabase', 'ExplorerController.convert2DB').middleware('auth')
  Route.post('/backup', 'ExplorerController.backup').middleware('auth')
  Route.get('/visualizeHeatmap', 'ExplorerController.visualizeHeatmap').middleware('auth')
  Route.post('/setDefaultZoomLevel', 'ExplorerController.setDefaultZoomLevel').middleware('auth')
  // NEW
  Route.get('/sample-config', 'ExplorerController.sampleConfig').middleware('auth')
  Route.post('/sample-config', 'ExplorerController.sampleConfig').middleware('auth')
  Route.get('/system-log', 'ExplorerController.systemLog').middleware('auth')
  Route.get('/backup-list', 'ExplorerController.backupList').middleware('auth')
  Route.post('/restore-backup', 'ExplorerController.restoreBackup').middleware('auth')
}).prefix('api')
Route.group(() => {
  Route.get('/checkFileExists', 'FileController.checkFileExists').middleware('auth')
  Route.get('/export', 'FileController.export').middleware('auth')
  Route.get('/:filePath*', 'FileController.download').middleware('auth')
}).prefix('data');
Route.any('*', ({response}) => response.download(Helpers._appRoot + '/public/index.html'))
