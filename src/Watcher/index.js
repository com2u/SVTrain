const chokidar = require('chokidar')
const Env = use('Env')
const path = require('path')
const fs = require('fs')
const regexpForImages = (/\.(gif|jpg|jpeg|tiff|png|bmp)$/i)
const readLastLines = require('read-last-lines')

module.exports = class Watcher {
  constructor() {

    this.folders = {}

  }

  subscribeForFolder(path, id, socket) {
    // delete from previous pathes
    Object.keys(this.folders).map( path => {
      if ( this.folders[path][id] && Date.now() - this.folders[path][id].subscribedTime > 1000 ) {
        // console.log(`socket ${id} deleted from ${path}`)
        delete this.folders[path][id]
      }
    })

    // subscribe for current
    if ( !this.folders[path] ) this.folders[path] = {}
    socket.subscribedTime = Date.now()
    this.folders[path][id] = socket
  }

  deleteSocket( id ) {
    Object.keys(this.folders).map( path => {
      if ( this.folders[path][id] ) {
        // console.log(`socket ${id} deleted from ${path}`)
        delete this.folders[path][id]
      }
    })
  }

  changedRunningLock (type, pathname) {
    const object = {}
    object.event = type === 'add' || type === 'change' ? 'change' : 'unlink'
    if (object.event === 'change') {
      object.content = fs.readFileSync(pathname).toString()
    }
    if (!this.folders['running.lock']) return
    Object.keys(this.folders['running.lock']).map( socketid => {
      console.log(`${socketid} emit event running.lock with`, object)
      this.folders['running.lock'][socketid].emit(`folder_running.lock`, object)
    })
  }
  changedWorkspace (type, pathname) {
    const object = {}
    object.event = type === 'add' || type === 'change' ? 'change' : 'unlink'
    if (object.event === 'change') {
      object.content = fs.readFileSync(pathname).toString()
    }
    if (!this.folders['workspace.bat']) return
    Object.keys(this.folders['workspace.bat']).map( socketid => {
      console.log(`${socketid} emit event workspace.bat with`, object)
      this.folders['workspace.bat'][socketid].emit(`folder_workspace.bat`, object)
    })
  }
  
  async changeBatFileLog(type, pathname) {
    let object = {
      lastLine: '',
      pathname
    }
    if (!this.folders['running.lock']) return
    if (type !== 'change' && type !== 'add') return;
    object.lastLine = await readLastLines.read(pathname, 1)
    Object.keys(this.folders['running.lock']).map( socketid => {
      this.folders['running.lock'][socketid].emit(`logfile`, object)
    })
  }

  fireChange(type) {
    const self = this
    return pathname => {
      if (path.normalize(path.join(Env.get('COMMAND_FILES_PATH'), 'running.lock')) === path.normalize(pathname)) {
        return this.changedRunningLock(type, pathname)
      }
      if (path.normalize(path.join(Env.get('COMMAND_FILES_PATH'), 'workspace.bat')) === path.normalize(pathname)) {
        return this.changedWorkspace(type, pathname)
      }
      const batFiles = ['train', 'test', 'validate', 'export', 'ExportImages', 'stop']
      const normalizeBatFiles = batFiles.map(f => path.normalize(path.join(Env.get('COMMAND_FILES_PATH'), `${f}.log`)))
      if (normalizeBatFiles.includes(path.normalize(pathname))) {
        return this.changeBatFileLog(type, pathname)
      }
      console.log(`Event ${type} fired on file ${pathname}`)

      const file = path.parse(pathname)
      let dir = file.dir
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

      let dir2 = ''
      if (!/\/$/.test(dir)) dir2 = `${dir}/`
      if (/\/#/.test(dir)) dir2 = dir.slice(0, dir.length - 2)
      const folders = self.folders[dir] || self.folders[dir2]
      if (!self.folders[dir]) dir = dir2
      if ( folders ) {
        Object.keys(folders).map( socketid => {
          folders[socketid].emit(`folder_${dir}`, {
            path: pathname,
            name: filename,
            match: filename.indexOf(pathname.split(path.sep)[pathname.split(path.sep).length-1]) > -1,
            relativePath: path.relative(Env.get('ROOT_PATH'), pathname),
            type: filetype,
            image: regexpForImages.test(filename),
            event: eventType
          })
        })
      }
    }
  }

  init() {
    const isChildOf = (child, parent) => {
      if (child === parent) return false
      const parentTokens = parent.split(path.sep).filter(i => i.length)
      return parentTokens.every((t, i) => child.split(path.sep)[i] === t)
    }
    this.watcher = chokidar.watch( 
      Env.get('COMMAND_FILES_PATH'),
      {
        ignoreInitial: true,
        persistent: true
      }
    )
    if (!isChildOf(Env.get('COMMAND_FILES_PATH'), Env.get('ROOT_PATH'))) {
      console.log('Add command files for watching')
      this.watcher.add(Env.get('COMMAND_FILES_PATH'))
    }

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