const chokidar = require('chokidar')
const Env = use('Env')
const path = require('path')
const fs = require('fs')
const { promisify } = require("util")
const exists = promisify(fs.exists)
const readFile = promisify(fs.readFile)

const regexpForImages = (/\.(gif|jpg|jpeg|tiff|png|bmp)$/i)
const readLastLines = require('read-last-lines')

async function getLogNames(path) {
  let data = {
    "training": Env.get('PATH_LOG_TRAINING'),
    "test": Env.get('PATH_LOG_TEST'),
    "validate": Env.get('PATH_LOG_VALIDATE'),
    "export_model": Env.get('OUT_FILE_EXPORT_MODEL'),
    "export_results": Env.get('OUT_FILE_EXPORT_RESULTS'),
    "export_images": Env.get('OUT_FOLDER_EXPORT_IMAGES'),
    "ViewLogLines": 2
  };
  try {
    if (await exists(`${path}/TFSettings.json`)) {
      const fileContent = await readFile(`${path}/TFSettings.json`, 'utf-8');
      const jData = JSON.parse(fileContent);
      data["training"] = jData["path_log_training"] || Env.get('PATH_LOG_TRAINING')
      data["test"] = jData["path_log_test"] || Env.get('PATH_LOG_TEST')
      data["validate"] = jData["path_log_validate"] || Env.get('PATH_LOG_VALIDATE')
      data["export_model"] = jData["path_field_export_model"] || Env.get('OUT_FILE_EXPORT_MODEL')
      data["export_results"] = jData["path_field_export_results"] || Env.get('OUT_FILE_EXPORT_RESULTS')
      data["export_images"] = [null, undefined].includes(jData["path_field_export_images"]) ? Env.get('OUT_FOLDER_EXPORT_IMAGES') : jData["path_field_export_images"]
      data["ViewLogLines"] = jData["ViewLogLines"] || 2
    }
  } catch (e) {
    console.log(e);
  }
  return data;
}

module.exports = class Watcher {
  constructor() {
    this.folders = {}
  }

  subscribeForFolder(path, id, socket) {
    // delete from previous pathes
    Object.keys(this.folders).map( path => {
      if ( this.folders[path][id] && Date.now() - this.folders[path][id].subscribedTime > 1000 ) {
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

  getSocket(id) {
    for (let i = 0; i < Object.keys(this.folders).length; i++) {
      if ( this.folders[Object.keys(this.folders)[i]][id] ) {
        return this.folders[Object.keys(this.folders)[i]][id]
      }
    }
    return null
  }

  async changedRunningLock (type, pathname) {
    const object = {}
    object.event = type === 'add' || type === 'change' ? 'change' : 'unlink'
    if (object.event === 'change') {
      object.content = (await readFile(pathname)).toString()
    }
    if (!this.folders['lock.txt']) return
    Object.keys(this.folders['lock.txt']).map( socketid => {
      this.folders['lock.txt'][socketid].emit(`lock.txt`, object)
    })
  }

  async changedWorkspace (type, pathname) {
    const object = {}
    object.event = type === 'add' || type === 'change' ? 'change' : 'unlink'
    if (object.event === 'change') {
      object.content = (await readFile(pathname)).toString()
    }
    if (!this.folders['workspace.bat']) return
    Object.keys(this.folders['workspace.bat']).map( socketid => {
      this.folders['workspace.bat'][socketid].emit(`workspace.bat`, object)
    })
  }

  async changeBatFileLog(type, pathname) {
    let object = {
      lastLine: '',
      pathname
    }
    if (!this.folders['lock.txt']) return
    if (type !== 'change' && type !== 'add') return;
    object.lastLine = await readLastLines.read(pathname, 2)
    Object.keys(this.folders['lock.txt']).map( socketid => {
      this.folders['lock.txt'][socketid].emit(`logfile`, object)
    })
  }

  fireChange(type) {
    const self = this
    return pathname => {
      if (path.normalize(path.join(Env.get('COMMAND_FILES_PATH'), 'lock.txt')) === path.normalize(pathname)) {
        return this.changedRunningLock(type, pathname)
      }
      if (path.normalize(path.join(Env.get('COMMAND_FILES_PATH'), 'workspace.bat')) === path.normalize(pathname)) {
        return this.changedWorkspace(type, pathname)
      }

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

  async init() {
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

    let logNames = {}
    setInterval(async () => {
      const wsPath = path.join(Env.get('COMMAND_FILES_PATH'), 'workspace.bat')
      const currentWS = await exists(wsPath) ? (await readFile(wsPath)).toString() : null
      if (currentWS) {
        logNames = await getLogNames(currentWS)
      }
      if (!this.folders['lock.txt']) return
      let lastLines = await Promise.all(['training', 'test', 'validate'].map(async name => {
        let line = null
        try {
          line = await readLastLines.read(path.join(Env.get('COMMAND_FILES_PATH'), logNames[name]), logNames['ViewLogLines'])
        } catch(e) {
          return null
        }
        return {
          file: name,
          lastLine: line
        }
      }))
      let exports = {
        export_model: null,
        export_results: null,
        export_images: null
      }
      for (const fileName of Object.keys(exports)) {
        if (fileName === 'export_images') {
          if (await exists(path.join(currentWS, logNames[fileName]))) {
            exports[fileName] = logNames[fileName]
          } else {
            exports[fileName] = null
          }
        }
        else {
          if (await exists(path.join(Env.get('COMMAND_FILES_PATH'), logNames[fileName]))) {
            exports[fileName] = logNames[fileName]
          } else {
            exports[fileName] = null
          }
        }
      }

      Object.keys(this.folders['lock.txt']).map( socketid => {
        this.folders['lock.txt'][socketid].emit(`logfile`, lastLines)
      })
      Object.keys(this.folders['lock.txt']).map( socketid => {
        this.folders['lock.txt'][socketid].emit(`exportFile`, exports)
      })
    }, 1000)
  }
}
