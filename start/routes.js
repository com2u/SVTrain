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

Route.get('/getFiles', 'ExplorerController.all')
Route.get('/getParent', 'ExplorerController.parent')
Route.get('/getState', 'ExplorerController.state')
Route.get('/nextDirectories', 'ExplorerController.next')
Route.get('/runCommand/:name', 'ExplorerController.command')
Route.get('/getStatistic', 'ExplorerController.statistic')
Route.get('/calculateStatistic', 'ExplorerController.calculate')
Route.post('/deleteFiles', 'ExplorerController.delete')
Route.post('/moveFiles', 'ExplorerController.move')
Route.post('/saveFile', 'ExplorerController.saveFile')
Route.get('/getSubfolders', 'ExplorerController.getSubfolders')
Route.get('/checkFolder', 'ExplorerController.checkFolder')
Route.post('/createFolder', 'ExplorerController.createFolder')
Route.get('/getWorkspace', 'ExplorerController.getWorkspace')
Route.post('/setWorkspace', 'ExplorerController.setWorkspace')
Route.get('/getLastLogs', 'ExplorerController.getLastLogs')
Route.get('/logs/:file', 'ExplorerController.logsFor')
