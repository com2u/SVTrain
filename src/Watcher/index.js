const chokidar = require('chokidar')
const Env = use('Env')
const path = require('path')
const fs = require('fs')
const regexpForImages = (/\.(gif|jpg|jpeg|tiff|png|bmp)$/i)

module.exports = class Watcher {
  constructor() {

    this.folders = {}

  }

  subscribeForFolder(path, id, socket) {
    if ( !this.folders[path] ) this.folders[path] = {}
    this.folders[path][id] = socket
  }

  deleteSocket( id ) {
    const self = this
    Object.keys(self.folders).map( path => {
      if ( self.folders[path][id] ) {
        delete self.folders[path][id]
      }
    })
  }

  changedRunningLock (type, pathname) {
    const object = {}
    object.event = type === 'add' || type === 'change' ? 'change' : 'unlink'
    if (object.event === 'change') {
      object.content = fs.readFileSync(pathname).toString()
    }
    Object.keys(this.folders['running.lock']).map( socketid => {
      console.log(`${socketid} emit event running.lock with`, object)
      this.folders['running.lock'][socketid].emit(`folder_running.lock`, object)
    })
  }

  fireChange(type) {
    const self = this
    return pathname => {
      if (path.join(Env.get('COMMAND_FILES_PATH'), 'running.lock') === pathname) {
        return this.changedRunningLock(type, pathname)
      }
      console.log(`Event ${type} fired on file ${pathname}`)

      const file = path.parse(pathname)
      const dir = file.dir
      const filename = file.base
      const filetype = type === 'addDir' || type === 'unlinkDir' ? 'folder' : 'file'
      let eventType = null

      switch (type) {
        case 'add':
        case 'addDir':
        eventType = 'add'
        break

        case 'change':
        eventType = 'change'
        break

        case 'unlink':
        case 'unlinkDir':
        eventType = 'remove'
        break
      }

      if ( self.folders[dir] ) {
        Object.keys(self.folders[dir]).map( socketid => {
          self.folders[dir][socketid].emit(`folder_${dir}`, {
            path: pathname,
            name: filename,
            match: filename.indexOf(pathname.split(path.sep)[pathname.split(path.sep).length-1]) > -1,
            type: filetype,
            image: regexpForImages.test(filename),
            event: eventType
          })
        })
      }
    }
  }

  init() {
    this.watcher = chokidar.watch( 
      Env.get('ROOT_PATH'),
      {
        ignoreInitial: true,
        persistent: true
      }
    )

    this.watcher.on('add', this.fireChange('add'))
    this.watcher.on('change', this.fireChange('change'))
    this.watcher.on('unlink', this.fireChange('unlink'))
    this.watcher.on('addDir', this.fireChange('addDir'))
    this.watcher.on('unlinkDir', this.fireChange('unlinkDir'))
    this.watcher.on('ready', () => {
      console.log('Watcher is ready to send events')
    })
  }
}