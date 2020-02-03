'use strict'
const Env = use('Env')
const Statistic = use('Statistic')
const path = require('path')
const recursive = require('../../../src/recursive')
const { promisify } = require('util')
const fs = require('fs')
const execFile = promisify(require('child_process').execFile)
const regexpForImages = (/\.(gif|jpg|jpeg|tiff|png|bmp)$/i)
const readdir = promisify(fs.readdir)
const lstat = promisify(fs.lstat)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const unlink = promisify(fs.unlink)
const rename = promisify(fs.rename)
const exists = promisify(fs.exists)
const mkdir = promisify(fs.mkdir)
const readLastLines = require('read-last-lines')
const config = require('../../../config/index')

// if file is landing under root directory
// prevent access to that file
const accessToFile = (root, file) => {
  const relative = path.relative(root, file)
  return relative.split( path.sep )[0] !== '..'
}

const FTYPES = {
  folder: 'folder',
  file: 'file'
}

const CONST_PATHS = {
  root: Env.get('ROOT_PATH'),
  running: 'running.lock',
  workspace: 'workspace.bat',
  commands: Env.get('COMMAND_FILES_PATH', path.join(Env.get('ROOT_PATH'), 'DeepLearning')),
  commandNames: ['train', 'validate', 'test', 'export', 'stop', 'ExportImages'],
  ignoreFiles: ['.DS_Store']
}

/**
 * Build statistic table for subfolders from directory
 * @param {String} dir Path to directory where subfolders are placed
 * @param {Array<String>} subfolders Array of subfolders names
 * @returns {Object} Statistic table
 */
const buildSubfolderTable = async (dir, subfolders) => {
  if (subfolders.length === 0) return false
  const table = {}
  // build a table for subfolders
  await Promise.all(
    subfolders.map(async subfolder => {
      table[subfolder] = {}
      await Promise.all(
        subfolders.map(async anotherSubfolder => {
          table[subfolder][anotherSubfolder] = {
            all: 0,
            exclude: 0
          }
          const flist = await readdir(path.join(dir, anotherSubfolder))
          await Promise.all(
            flist.map(async fileFromSF => {
              const fileFromSF_lstat = await lstat(path.join(dir, anotherSubfolder, fileFromSF))
              if (fileFromSF_lstat.isFile() && fileFromSF.toLowerCase().includes(subfolder.toLowerCase())) {
                table[subfolder][anotherSubfolder].all += 1
                if (!fileFromSF.includes('!')) {
                  table[subfolder][anotherSubfolder].exclude += 1
                }
              }
            })
          )
        })
      )
    })
  )
  return table
}

class ExplorerController {

  /*
    GET /getFiles?path=path/to/folder

    Returns all files in the defined folder
    {
      path: "path/to/folder",
      folders: [{
        path: "path/to/that/folder",
        name: "folderName",
        type: "folder"
      }],
      files: [{
        path: "path/to/that/file",
        relativePath: "path relate with ROOT_PATH",
        name: "fileName with ext",
        type: "file"
      }]
    }
  */
  async all ({ request }) {
    const dir = path.join( request.get().dir || CONST_PATHS.root )
    console.log(`Send files for directory ${dir}, request get params:`, request.get())
    if ( !accessToFile(CONST_PATHS.root, dir) ) throw new Error('Access denied')
    const result = {}

    const files = await readdir(dir)

    result.folders = []
    result.files = []
    result.path = dir

    for ( let i = 0; i < files.length; ++i ) {
      const f = files[i]
      const flstat = await lstat( path.join( dir, f) )
      if (f)
        if ( flstat.isDirectory() ) {
          result.folders.push({
            path: path.join( dir, f ),
            name: f,
            type: FTYPES.folder,
            image: false,
            match: false
          })
        } else if ( flstat.isFile() ) {
          result.files.push({
            path: path.join( dir, f),
            relativePath: path.relative(CONST_PATHS.root, path.join(dir,f)),
            name: f,
            type: FTYPES.file,
            image: regexpForImages.test(f),
            match: f.toLowerCase().indexOf(dir.split(path.sep)[dir.split(path.sep).length-1].toLowerCase()) > -1
          })
        } else {
          console.log(`File ${f} in the directory ${dir} nor file neither directory.`)
        }
    }
    return result
  }

  /*
    GET /getParent?dir=
    Returns parent folder for that folder

    {
      path: '/path/to/parent',
      name: 'name of parent folder',
      type: 'folder',
      access: true/false
    }
  */
  async parent({ request }) {
    try{
      const dir = request.get().dir
      if ( !dir ) throw new Error('Parameter "dir" is required')

      let parent = dir.split(path.sep)
      parent.splice(-1)
      parent = parent.join(path.sep)

      return {
        path: parent,
        name: path.basename(parent),
        type: 'folder',
        access: accessToFile(CONST_PATHS.root ,parent)
      }
    } catch(e) {
      console.log(e)
    }
  }

  /*
    GET /getState

    Returns true when the file running.lock is exist
    and false when it is't exist
  */
  async state() {
    const dir = Env.get('COMMAND_FILES_PATH')
    const runningFile = path.join( dir, CONST_PATHS.running )
    try {
      return fs.existsSync(runningFile) ? fs.readFileSync(runningFile) : false
    } catch (e) {
      console.log(e)
      return null
    }
  }

  /*
    GET /getWorkspace

    Returns the content of file workspace.bat
  */
  async getWorkspace() {
    const dir = Env.get('COMMAND_FILES_PATH')
    const workspaceFile = path.join( dir, CONST_PATHS.workspace )
    try {
      return fs.existsSync(workspaceFile) ? fs.readFileSync(workspaceFile) : false
    } catch (e) {
      console.log(e)
      return null
    }
  }

  /*
  POST /setWorkspace

  Set the workspace
  */
  async setWorkspace({ request }) {
    const { workspace } = request.post()
    const workspaceFile = path.join( Env.get('COMMAND_FILES_PATH'), CONST_PATHS.workspace )
    const newWorkspace = path.join(CONST_PATHS.root, workspace )
    await writeFile(workspaceFile, newWorkspace)
    return true
  }

  /*
    POST /deleteFiles

    Except the JSON-object with property "files" with format:
    {
      file: ["/path/to/file1", "path/to/file2"]
    }

    Return array of files which has deleted
    [ "/path/to/file1", "path/to/file2" ]
  */
  async delete({ request }) {
    let { files } = request.post()

    // skip files with no access
    files = files
    .filter( f => accessToFile(CONST_PATHS.root, f) )

    await Promise.all(
      files.map( async f => await unlink(f) )
    )
    return files
  }

  /*
    POST /moveFiles
    Except a JSON-object with two properties: "files" and "destination"
    Move files from array "files" to the derictory "destination"
    { files: [...], destination: "path/to/move" }

    return array of files with new path
  */
  async move({ request }) {
    let { files, destination } = request.post()

    if ( !accessToFile(CONST_PATHS.root, destination) ) {
      throw new Error(`Access denied to the directory ${destination}`)
    }

    // skip files with no access
    files = files
    .filter(
      f => accessToFile(CONST_PATHS.root, f)
    )

    await Promise.all(
      files.map(
        async f => await rename(
          f,
          path.join( destination, path.basename(f) )
        )
      )
    )

    return files.map(
      f => path.join(destination, path.basename(f))
    )
  }

  /*
    GET /nextDirectories?dir=
    Returns closer to given dir folders

    [
      {
        path: '/path/to/folder',
        name: foldername
      }
    ]
  */
  async next({ request }) {
    const { dir } = request.get()
    const result = []

    if ( !dir ) throw new Error('The "path" parameter is needed')

    const parentDirectory = path.join( dir, '../' )

    if ( !accessToFile(CONST_PATHS.root, parentDirectory) ) {
      console.log(`Access denied for read next directory for folder ${dir}`)
      return []
      throw new Error(`Access denied for read directory ${parentDirectory}`)
    }

    const files = await readdir(parentDirectory)

    for ( let i = 0; i < files.length; ++i ) {
      const f = files[i]
      const flstat = await lstat( path.join( parentDirectory, f) )
      if ( flstat.isDirectory() ) {
        result.push({
          path: path.join( parentDirectory, f) ,
          name: f
        })
      }
    }

    return result
  }

  /*
    POST /saveFile
    save file specified in "path" parameter with "data" content
  */
  async saveFile({ request }) {
    const { path, data } = request.post()

    if ( !path ) throw new Error('The "path" parameter is needed')

    if ( !accessToFile(CONST_PATHS.root, path) ) {
      console.log(`Access denied for saving for file ${path}`)
      throw new Error(`Access denied for saving for file ${path}`)
    }

    return fs.writeFileSync(path, data)
  }

  /*
    GET /getSubfolders
    returns an array with subfolders of a specific folder
  */
  async getSubfolders({ request }) {
    let { folder } = request.get()
    if (folder === 'root') folder = CONST_PATHS.root
    const result = []

    if ( !folder ) throw new Error('The "folder" parameter is needed')

    if ( !accessToFile(CONST_PATHS.root, folder) ) {
      console.log(`Access denied for gettings subfolders for folder ${folder}`)
      throw new Error(`Access denied for read directory ${folder}`)
    }

    const files = await readdir(folder)

    for ( let i = 0; i < files.length; ++i ) {
      const f = files[i]
      const flstat = await lstat( path.join( folder, f) )
      if ( flstat.isDirectory() ) {
        result.push(f)
      }
    }

    return result
  }

  /*
    GET /checkFolder
    returns a status of a specific folder: ok, not_found, access_denied
  */
  async checkFolder({ request }) {
    const { folder } = request.get()
    if ( !folder ) throw new Error('The "folder" parameter is needed')
    if ( !accessToFile(CONST_PATHS.root, folder)) {
      return 'access_denied'
    }
    const isExist = await exists(folder)
    if (!isExist) {
      return 'not_found'
    }
    return 'ok'
  }

  /*
    POST /createFolder
    creates a new directory with specified name in a specified folder
  */
  async createFolder({ request }) {
    const { name, folder } = request.post()
    if (!folder || !name) throw new Error('Parameters name and folder are needed')
    if (!accessToFile(CONST_PATHS.root, folder)) {
      throw new Error(`You haven\'t access to ${folder} directory`)
    }
    if (!fs.existsSync(folder)) {
      throw new Error(`The directory ${folder} doesn't exist`)
    }
    console.log(path.join(folder, name))
    await mkdir(path.join(folder, name))
    return true
  }

  /*
    GET /runCommand/:name
    Execute command "name" in the folder with .bat files
    returns output logs
  */
  async command({ request }) {
    const command = request.params.name
    const commandsPath = CONST_PATHS.commands

    if ( !CONST_PATHS.commandNames.includes(command) ) {
      console.log(`Unknow command ${command}`)
      throw new Error(`Unknow command ${command}`)
    }

    const commandFilePath = path.join( commandsPath, command+'.bat' )
    if ( !fs.existsSync(commandFilePath) ) {
      console.log(`File ${commandFilePath} doesn't exist`)
      throw new Error(`File ${commandFilePath} doesn't exist`)
    }

    try { await execFile(commandFilePath) }
    catch(e) {
      console.log(`An error occurred when run command: ${command}`, e)
    }
    return true
  }

  /*
    GET /getStatistic?dir=
    Returns statistic for given directory
  */
  async statistic({ request }) {
    const { dir } = request.get()
    return Statistic.get(dir)
  }

  /*
    GET /calculateStatistic
    Run process for calculate statistic for each folder
  */
  async calculate() {
    try {
    const missedFiles = []
    const dirsObject = {}
    const ignoreFunc = (_, lstat) => !lstat.isDirectory()
    const dirs = await recursive(CONST_PATHS.root, [ignoreFunc])
    dirs.unshift(CONST_PATHS.root)

    await Promise.all(
      dirs.map( async dir => {
        let dirname = path.basename(dir)
        let files = await readdir(dir)
        const subfolders = []
        dirsObject[dir] = {
          missed: 0,
          matched: 0,
          missmatched: 0
        }
        // count matches | missmatches
        await Promise.all(
          files.map( async f => {
            let filepath = path.join( dir, f )
            const stats = await lstat(filepath)
            if ( stats.isFile() && !CONST_PATHS.ignoreFiles.includes(f) ) {
              if ( f.toLowerCase().indexOf(dirname.toLowerCase()) > -1) {
                dirsObject[dir].matched++
              } else {
                dirsObject[dir].missmatched++
                missedFiles.push(filepath)
              }
            }
            if (stats.isDirectory()) {
              subfolders.push(f)
            }
          }) // end of map function for all files
        ) // end of promise for all files

        try {
          dirsObject[dir].table = await buildSubfolderTable(dir, subfolders)
        } catch (e) {
          console.log(e)
        }
      }) // end map function for all dirs
    ) // end of promise for all dirs

    Object.keys(dirsObject).forEach( dir => {
      dirsObject[dir].missed = missedFiles.filter(
        f => path.basename(f).toLowerCase().indexOf(path.basename(dir).toLowerCase()) > -1
      ).length

      Statistic.write(dir, dirsObject[dir])
    })

    await Statistic.save()
    } catch(e) {
      console.log(e)
      throw e
    }
  }

  async getLastLogs () {
    try {
    const logs = {
      train: {},
      test: {},
      validate: {},
      export: {},
      stop: {},
      ExportImages: {}
    }
    Object.keys(logs).forEach(f => {
      let filePath = path.join(Env.get('COMMAND_FILES_PATH'), `${f}.log`)
      logs[f].path = filePath
      logs[f].lastLine = ''
    })

    await Promise.all(Object.keys(logs).map(async fileName => {
      let lastLine = ''
      try {
        lastLine = (await readLastLines.read(logs[fileName].path, 2))
      } catch(e) {console.log(e)}
      logs[fileName].lastLine = lastLine
    }))

    return logs
    } catch(e) {
      console.log(e)
    }
  }

  async logsFor ({request, response}) {
    let file = request.params.file
    const stream = fs.createReadStream(path.join(Env.get('COMMAND_FILES_PATH'), `${file}.log`))
    response.implicitEnd = false
    response.response.setHeader('Content-type', 'text/plain; charset=utf-8')
    stream.pipe(response.response)
  }

  async getConfig ({request, response}) {
    response.json(config)
  }
}

module.exports = ExplorerController
