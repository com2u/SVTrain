'use strict'
const Env = use('Env')
const Statistic = use('Statistic')
const path = require('path')
const recursive = require('../../../src/recursive')
const { promisify } = use('Helpers')
const fs = promisify( require('fs') )
const { execFile } = promisify(require('child_process'))
const regexpForImages = (/\.(gif|jpg|jpeg|tiff|png|bmp)$/i)

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
  commands: Env.get('COMMAND_FILES_PATH', path.join(Env.get('ROOT_PATH'), 'DeepLearning')),
  commandNames: ['train', 'validate', 'test', 'export', 'stop'],
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
          const flist = await fs.readdir(path.join(dir, anotherSubfolder))
          await Promise.all(
            flist.map(async fileFromSF => {
              const fileFromSF_lstat = await fs.lstat(path.join(dir, anotherSubfolder, fileFromSF))
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

    const files = await fs
    .readdir(dir)

    result.folders = []
    result.files = []
    result.path = dir

    for ( let i = 0; i < files.length; ++i ) {
      const f = files[i]
      const lstat = await fs
      .lstat( path.join( dir, f) )
      if (f)
      if ( lstat.isDirectory() ) {
        result.folders.push({
          path: path.join( dir, f ),
          name: f,
          type: FTYPES.folder,
          image: false,
          match: false
        })
      } else if ( lstat.isFile() ) {
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
      files.map( async f => await fs.unlink(f) )
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
        async f => await fs.rename( 
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

    const files = await fs
    .readdir(parentDirectory)

    for ( let i = 0; i < files.length; ++i ) {
      const f = files[i]
      const lstat = await fs
      .lstat( path.join( parentDirectory, f) )
      if ( lstat.isDirectory() ) {
        result.push({
          path: path.join( parentDirectory, f) ,
          name: f
        })
      }
    }    

    return result
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
    const missedFiles = []
    const dirsObject = {}
    const ignoreFunc = (_, lstat) => !lstat.isDirectory()
    const dirs = await recursive(CONST_PATHS.root, [ignoreFunc])
    dirs.unshift(CONST_PATHS.root)
    
    await Promise.all(
      dirs.map( async dir => {
        let dirname = path.basename(dir)
        let files = await fs.readdir(dir)
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
            const lstat = await fs.lstat(filepath)
            if ( lstat.isFile() && !CONST_PATHS.ignoreFiles.includes(f) ) {
              if ( f.toLowerCase().indexOf(dirname.toLowerCase()) > -1) {
                dirsObject[dir].matched++
              } else {
                dirsObject[dir].missmatched++
                missedFiles.push(filepath)
              }
            }
            if (lstat.isDirectory()) {
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
  }
}

module.exports = ExplorerController
