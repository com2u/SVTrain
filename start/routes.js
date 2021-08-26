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
  Route.post('/saveFile', 'ExplorerController.saveFile').middleware('auth')
  Route.get('/getSubfolders', 'ExplorerController.getSubfolders').middleware('auth')
  Route.get('/checkFolder', 'ExplorerController.checkFolder').middleware('auth')
  Route.post('/createFolder', 'ExplorerController.createFolder').middleware('auth')
  Route.get('/getWorkspace', 'ExplorerController.getWorkspace').middleware('auth')
  Route.post('/setWorkspace', 'ExplorerController.setWorkspace').middleware('auth')
  Route.get('/getLastLogs', 'ExplorerController.getLastLogs').middleware('auth')
  Route.get('/logs/:file', 'ExplorerController.logsFor').middleware('auth')
  Route.post('/login', 'LoginController.login')
  Route.post('/logout', 'LoginController.logout')
  Route.get('/config', 'ExplorerController.getConfig').middleware('auth')
  Route.get('/explorerConfig', 'ExplorerController.getExplorerConfig').middleware('auth')
  Route.post('/forwardOnly', 'ExplorerController.doForwardOnly').middleware('auth')
  Route.post('/notes', 'ExplorerController.saveNotes').middleware('auth')
  Route.post('/saveConfig', 'ExplorerController.saveConfig').middleware('auth')
  Route.get('/getFolders', 'ExplorerController.getSubFolderByPath').middleware('auth')
  Route.post('/listStatistics', 'ExplorerController.listStatistic').middleware('auth')
  Route.post('/fetchConfusionMatrix', 'ExplorerController.confusionMatrix').middleware('auth')
  Route.post('/convertToDatabase', 'ExplorerController.convert2DB').middleware('auth')
  Route.post('/backup', 'ExplorerController.backup').middleware('auth')
  Route.get('/visualizeHeatmap', 'ExplorerController.visualizeHeatmap').middleware('auth')
}).prefix('api')
Route.group(() => {
  Route.get('/:filePath*', 'FileController.download').middleware('auth')
}).prefix('data');
Route.any('*', ({response}) => response.download(Helpers._appRoot + '/public/index.html'))

