'use strict'

/*
|--------------------------------------------------------------------------
| Http server
|--------------------------------------------------------------------------
|
| This file bootstrap Adonisjs to start the HTTP server. You are free to
| customize the process of booting the http server.
|
| """ Loading ace commands """
|     At times you may want to load ace commands when starting the HTTP server.
|     Same can be done by chaining `loadCommands()` method after
|
| """ Preloading files """
|     Also you can preload files by calling `preLoad('path/to/file')` method.
|     Make sure to pass relative path from the project root.
*/

const { Ignitor } = require('@adonisjs/ignitor')
const http = require('http')
const fs = require('fs')

new Ignitor(require('@adonisjs/fold'))
  .appRoot(__dirname)
  .wsServer()
  .fireHttpServer(handler => {
    const rootPath = process.env.ROOT_PATH
    if (!fs.existsSync(rootPath)) {
      console.log(`ROOT_PATH folder ${rootPath} does not exist`)
    }

    //const httpsServer = https.createServer(options, handler)
    const httpServer = http.createServer(handler)
    return httpServer
  })
  .catch(console.error)
