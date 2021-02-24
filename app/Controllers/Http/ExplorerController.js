'use strict';
const Env = use('Env');
const Statistic = use('Statistic');
const path = require('path');
const recursive = require('../../../src/recursive');
const {promisify} = require('util');
const fs = require('fs');
const execFile = promisify(require('child_process').execFile);
const regexpForImages = (/\.(gif|jpg|jpeg|tiff|png|bmp)$/i);
const readdir = promisify(fs.readdir);
const lstat = promisify(fs.lstat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const rename = promisify(fs.rename);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const readLastLines = require('read-last-lines');
const config = require('../../../config/ui');

const logger = require('../../../logger');
const pathSep = path.sep;

const defaultCfgPath = path.join(__dirname, '../../../default.cfg');
const highlightPrefix = '[HIGHLIGHT]';
const iconName = 'favicon.ico';
const {hasPermissionWorkspaces} = require('../../utils/index');


// if file is landing under root directory
// prevent access to that file
const accessToFile = (root, file) => {
  const relative = path.relative(root, file);
  return relative.split(path.sep)[0] !== '..';
};

const FTYPES = {
  folder: 'folder',
  file: 'file'
};

const CONST_PATHS = {
  root: Env.get('ROOT_PATH'),
  running: 'running.lock',
  workspace: 'workspace.bat',
  commands: Env.get('COMMAND_FILES_PATH', path.join(Env.get('ROOT_PATH'), 'DeepLearning')),
  commandNames: ['train', 'validate', 'test', 'export', 'stop', 'ExportImages'],
  ignoreFiles: ['.DS_Store']
};

/**
 * Build statistic table for subfolders from directory
 * @param {String} dir Path to directory where subfolders are placed
 * @param {Array<String>} subfolders Array of subfolders names
 * @returns {Object} Statistic table
 */
const buildSubfolderTable = async (dir, subfolders) => {
  if (subfolders.length === 0) return false;
  const table = {};
  // build a table for subfolders
  await Promise.all(
    subfolders.map(async subfolder => {
      table[subfolder] = {};
      await Promise.all(
        subfolders.map(async anotherSubfolder => {
          table[subfolder][anotherSubfolder] = {
            all: 0,
            exclude: 0
          };
          const flist = await readdir(path.join(dir, anotherSubfolder));
          await Promise.all(
            flist.map(async fileFromSF => {
              const fileFromSF_lstat = await lstat(path.join(dir, anotherSubfolder, fileFromSF));
              if (fileFromSF_lstat.isFile() && fileFromSF.toLowerCase().includes(subfolder.toLowerCase())) {
                table[subfolder][anotherSubfolder].all += 1;
                if (!fileFromSF.includes('!')) {
                  table[subfolder][anotherSubfolder].exclude += 1;
                }
              }
            })
          );
        })
      );
    })
  );
  return table;
};

const folderTravel = async (dir_str, flag, fileExtensions) => {
  const dir = path.join(dir_str)
  if (!accessToFile(CONST_PATHS.root, dir)) throw new Error('Access denied');
  let out = []
  const files = await readdir(dir);
  for (let i = 0; i < files.length; ++i) {
    const f = files[i];
    const fPath = path.join(dir, f);
    const flStat = await lstat(path.join(dir, f));
    if (f) {
      out.push({
        path: fPath,
        name: f,
        type: flStat.isDirectory() ? FTYPES.folder : flStat.isFile() && f !== iconName ? FTYPES.file : null,
        files: flStat.isDirectory() && flag ? await folderTravel(fPath, false, fileExtensions) : []
      })
    }
  }
  if (!flag && fileExtensions && fileExtensions.length) {
    out = out.filter(x => fileExtensions.includes(x.path.split('.').pop()) && x.type === FTYPES.file)
  }
  return out
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
  async all({request}) {
    const dir = path.join(request.get().dir || CONST_PATHS.root);
    if (!accessToFile(CONST_PATHS.root, dir)) throw new Error('Access denied');
    const result = {};
    const files = await readdir(dir);
    result.folders = [];
    result.files = [];
    result.path = dir;
    const permissions = request.currentUser
      && request.currentUser.permissions
      && request.currentUser.permissions.workspaces;
    for (let i = 0; i < files.length; ++i) {
      const f = files[i];
      const fPath = path.join(dir, f);
      const flstat = await lstat(path.join(dir, f));
      if (f)
        if (flstat.isDirectory()) {
          if ((CONST_PATHS.root === `${dir}`) &&
            !(hasPermissionWorkspaces(f, permissions) || request.currentUser.permissions.leaveWorkspace)
          ) continue;
          const folder = {
            path: fPath,
            name: f,
            type: FTYPES.folder,
            image: false,
            match: false
          };
          result.folders.push(folder);
        } else if (flstat.isFile() && f !== iconName) {
          result.files.push({
            path: fPath,
            relativePath: path.relative(CONST_PATHS.root, fPath),
            name: f,
            type: FTYPES.file,
            image: regexpForImages.test(f),
            match: f.toLowerCase().indexOf(dir.split(path.sep)[dir.split(path.sep).length - 1].toLowerCase()) > -1
          });
        } else {
          console.log(`File ${f} in the directory ${dir} nor file neither directory.`);
        }
    }
    return result;
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
  async parent({request}) {
    try {
      const dir = request.get().dir;
      if (!dir) throw new Error('Parameter "dir" is required');

      let parent = dir.split(path.sep);
      parent.splice(-1);
      parent = parent.join(path.sep);

      return {
        path: parent,
        name: path.basename(parent),
        type: 'folder',
        access: accessToFile(CONST_PATHS.root, parent)
      };
    } catch (e) {
      console.log(e);
    }
  }

  /*
    GET /getState

    Returns true when the file running.lock is exist
    and false when it is't exist
  */
  async state() {
    const dir = Env.get('COMMAND_FILES_PATH');
    const runningFile = path.join(dir, CONST_PATHS.running);
    try {
      return fs.existsSync(runningFile) ? fs.readFileSync(runningFile) : false;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  /*
    GET /getWorkspace

    Returns the content of file workspace.bat
  */
  async getWorkspace() {
    const dir = Env.get('COMMAND_FILES_PATH');
    const workspaceFile = path.join(dir, CONST_PATHS.workspace);
    try {
      return fs.existsSync(workspaceFile) ? fs.readFileSync(workspaceFile) : false;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getJsonConfig(path) {
    let cfg = {};
    try {
      if (fs.existsSync(path)) {
        const fileContent = fs.readFileSync(path, 'utf-8');
        cfg = JSON.parse(fileContent);
        if (cfg.hide === true) {
          cfg = {};
        }
      }
    } catch (e) {
      cfg = {};
    }
    return cfg;
  }

  async getSystemConfig() {
    const ws = await this.getWorkspace();
    const wsPath = ws.toString();
    const configPath = path.join(wsPath, '.cfg');
    const cfg = await this.getJsonConfig(configPath);
    return {...config, ...cfg, wsPath};
  }

  /*
  POST /setWorkspace

  Set the workspace
  */
  async setWorkspace({request}) {
    const {workspace} = request.post();
    const workspaceFile = path.join(Env.get('COMMAND_FILES_PATH'), CONST_PATHS.workspace);
    const newWorkspace = path.join(CONST_PATHS.root, workspace);
    await writeFile(workspaceFile, newWorkspace);
    return true;
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
  async delete({request}) {
    let {files} = request.post();
    let dir = '';
    if (files && files.length) {
      dir = files[0];
    }
    const currentCfg = await this.getParentFolderConfig(dir);
    const destination = currentCfg.deleteDefaultFolder || 'DeletedFiles';
    let workingRoot = CONST_PATHS.root
    if (currentCfg.parentFolderPath) {
      workingRoot = currentCfg.parentFolderPath
    }

    // Create delete directory if not exist
    const absDestination = path.isAbsolute(destination) ? destination : path.join(workingRoot, destination);
    if (!fs.existsSync(absDestination)) {
      fs.mkdirSync(absDestination);
    }

    const user = request.currentUser.username;
    const response = await this.moveFiles(files, absDestination, user, true);
    return response;
  }

  /*
    POST /moveFiles
    Except a JSON-object with two properties: "files" and "destination"
    Move files from array "files" to the derictory "destination"
    { files: [...], destination: "path/to/move" }

    return array of files with new path
  */
  async move({request}) {
    let {files, destination} = request.post();
    const user = request.currentUser.username;
    const response = await this.moveFiles(files, destination, user);
    return response;
  }

  async moveFiles(files, destination, user, isDelete = false) {
    const absDestination = path.isAbsolute(destination) ? destination : path.join(CONST_PATHS.root, destination);
    if (!accessToFile(CONST_PATHS.root, destination)) {
      throw new Error(`Access denied to the directory ${destination}`);
    }

    // skip files with no access
    files = files
      .filter(
        f => accessToFile(CONST_PATHS.root, f)
      );


    await Promise.all(
      files.map(
        async f => await rename(
          f,
          path.join(absDestination, path.basename(f))
        )
      )
    );
    if (isDelete) {
      for (const file of files) {
        logger.info(`User ${user} has deleted file: "${file}"`);
      }
    } else {
      for (const file of files) {
        logger.info(`User ${user} has move file "${file}" to "${path.join(absDestination, path.basename(file))}"`);
      }
    }

    return files.map(
      f => path.join(absDestination, path.basename(f))
    );
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
  async next({request}) {
    const {dir} = request.get();
    const result = [];

    if (!dir) throw new Error('The "path" parameter is needed');

    const parentDirectory = path.join(dir, '../');

    if (!accessToFile(CONST_PATHS.root, parentDirectory)) {
      console.log(`Access denied for read next directory for folder ${dir}`);
      return [];
      throw new Error(`Access denied for read directory ${parentDirectory}`);
    }

    const files = await readdir(parentDirectory);

    for (let i = 0; i < files.length; ++i) {
      const f = files[i];
      const fPath = path.join(parentDirectory, f);
      const flstat = await lstat(fPath);
      if (flstat.isDirectory()) {
        const folder = {
          path: fPath,
          name: f,
          icon: false,
        };
        const iconPath = path.join(fPath, iconName);
        if (fs.existsSync(iconPath)) {
          folder.icon = path.relative(CONST_PATHS.root, iconPath);
        }
        result.push(folder);
      }
    }

    return result;
  }

  /*
    POST /saveFile
    save file specified in "path" parameter with "data" content
  */
  async saveFile({request}) {
    const {path, data} = request.post();

    if (!path) throw new Error('The "path" parameter is needed');

    if (!accessToFile(CONST_PATHS.root, path)) {
      console.log(`Access denied for saving for file ${path}`);
      throw new Error(`Access denied for saving for file ${path}`);
    }

    return fs.writeFileSync(path, data);
  }

  isValidFile(filename) {
    const ext = path.extname(filename);
    return ['.jpg', '.png', '.gif', '.bmp', '.jpeg'].includes(ext);
  }

  async countSync(dir, name, unclassified = false) {
    const result = {
      subFolders: [],
      unclassified: 0,
      classified: 0,
      name: name,
      path: dir
    };

    // Read notes
    const notesPath = path.join(dir, 'notes.txt');
    if (fs.existsSync(notesPath) && fs.lstatSync(notesPath).isFile()) {
      try {
        let notes = fs.readFileSync(notesPath, 'utf-8');
        result.notes = notes;
        result.notesPath = notesPath;
      } catch (e) {
        console.log(`can not read ${notesPath}`);
      }
    }

    //Read Cfg
    const cfgPath = path.join(dir, '.cfg');
    if (fs.existsSync(cfgPath) && fs.lstatSync(cfgPath).isFile()) {
      try {
        let cfg = fs.readFileSync(cfgPath, 'utf-8');
        let config = JSON.parse(cfg);
        result.config = config;
        result.cfgPath = cfgPath;
      } catch (e) {
        console.log(e);
        console.log(`can not read ${cfgPath}`);
      }
    }

    const files = await readdir(dir);
    for (const file of files) {
      const flstat = await lstat(path.join(dir, file));
      if (flstat.isDirectory()) {
        const nextDir = path.join(dir, file);
        let subResult = {};
        if (file.toLowerCase() === 'unclassified' || unclassified) {
          subResult = await this.countSync(nextDir, file, true);
        } else {
          subResult = await this.countSync(nextDir, file, false);
        }
        result.classified += subResult.classified;
        result.unclassified += subResult.unclassified;
        result.subFolders.push(subResult);
      } else if (this.isValidFile(file)) {
        if (unclassified) {
          result.unclassified += 1;
        } else {
          result.classified += 1;
        }
      }
    }
    return result;
  }

  /*
    GET /getSubfolders
    returns an array with subfolders of a specific folder
  */
  async getSubfolders({request}) {
    let {folder} = request.get();
    if (folder === 'root') folder = CONST_PATHS.root;

    if (!folder) throw new Error('The "folder" parameter is needed');

    if (!accessToFile(CONST_PATHS.root, folder)) {
      console.log(`Access denied for gettings subfolders for folder ${folder}`);
      throw new Error(`Access denied for read directory ${folder}`);
    }

    // const files = await readdir(folder)
    //
    // for (let i = 0; i < files.length; ++i) {
    //   const f = files[i]
    //   const flstat = await lstat(path.join(folder, f))
    //   if (flstat.isDirectory()) {
    //     result.push(f)
    //   }
    // }

    return await this.countSync(folder, 'root');
  }

  /*
    GET /checkFolder
    returns a status of a specific folder: ok, not_found, access_denied
  */
  async checkFolder({request}) {
    const {folder} = request.get();
    if (!folder) throw new Error('The "folder" parameter is needed');
    if (!accessToFile(CONST_PATHS.root, folder)) {
      return 'access_denied';
    }
    const isExist = await exists(folder);
    if (!isExist) {
      return 'not_found';
    }
    return 'ok';
  }

  /*
    POST /createFolder
    creates a new directory with specified name in a specified folder
  */
  async createFolder({request}) {
    let {name, folder} = request.post();
    if (folder === 'root') {
      folder = CONST_PATHS.root;
    }
    if (!folder || !name) throw new Error('Parameters name and folder are needed');
    if (!accessToFile(CONST_PATHS.root, folder)) {
      throw new Error(`You haven\'t access to ${folder} directory`);
    }
    if (!fs.existsSync(folder)) {
      throw new Error(`The directory ${folder} doesn't exist`);
    }
    console.log(path.join(folder, name));
    const newFolderPath = path.join(folder, name);
    await mkdir(newFolderPath);
    fs.copyFileSync(defaultCfgPath, path.join(newFolderPath, '.cfg'));
    logger.info(`User ${request.currentUser.username} has created new folder "${path.join(folder, name)}"`);
    return true;
  }

  /*
    GET /runCommand/:name
    Execute command "name" in the folder with .bat files
    returns output logs
  */
  async command({request}) {
    const command = request.params.name;
    const commandsPath = CONST_PATHS.commands;

    if (!CONST_PATHS.commandNames.includes(command)) {
      console.log(`Unknow command ${command}`);
      throw new Error(`Unknow command ${command}`);
    }

    const commandFilePath = path.join(commandsPath, command + '.bat');
    if (!fs.existsSync(commandFilePath)) {
      console.log(`File ${commandFilePath} doesn't exist`);
      throw new Error(`File ${commandFilePath} doesn't exist`);
    }

    try {
      await execFile(commandFilePath);
    } catch (e) {
      console.log(`An error occurred when run command: ${command}`, e);
    }
    return true;
  }

  /*
    GET /getStatistic?dir=
    Returns statistic for given directory
  */
  async statistic({request}) {
    const {dir} = request.get();
    return Statistic.get(dir);
  }

  /*
    GET /calculateStatistic
    Run process for calculate statistic for each folder
  */
  async calculate(context) {
    try {
      console.log('Start calculating statistic');
      const missedFiles = [];
      const allFiles = [];
      const dirsObject = {};
      const ignoreFunc = (_, lstat) => !lstat.isDirectory();
      const dirs = await recursive(CONST_PATHS.root);
      // dirs.unshift(CONST_PATHS.root)

      await Promise.all(
        dirs.map(async dir => {
          let dirname = path.basename(dir);
          let files = await readdir(dir);
          const subfolders = [];
          dirsObject[dir] = {
            missed: 0,
            matched: 0,
            missmatched: 0,
            classified: 0,
            unclassified: 0
          };
          // count matches | missmatches
          await Promise.all(
            files.map(async f => {
              let filepath = path.join(dir, f);
              const isUnclassified = dir.toString().toLowerCase().includes('unclassified');
              const stats = await lstat(filepath);
              if (stats.isFile() && !CONST_PATHS.ignoreFiles.includes(f)) {
                if (f.toLowerCase().indexOf(dirname.toLowerCase()) > -1) {
                  dirsObject[dir].matched++;
                } else {
                  dirsObject[dir].missmatched++;
                  missedFiles.push(filepath);
                }
                if (regexpForImages.test(f)) {


                  allFiles.push({
                    filepath,
                    isUnclassified
                  });
                }
              }
              if (stats.isDirectory()) {
                subfolders.push(f);
              }
            }) // end of map function for all files
          ); // end of promise for all files

          try {
            dirsObject[dir].table = await buildSubfolderTable(dir, subfolders);
          } catch (e) {
            console.log(e);
          }
        }) // end map function for all dirs
      ); // end of promise for all dirs

      Object.keys(dirsObject).forEach(dir => {
        dirsObject[dir].missed = missedFiles.filter(
          f => path.basename(f).toLowerCase().indexOf(path.basename(dir).toLowerCase()) > -1
        ).length;

        for (let file of allFiles) {
          const dirLength = dir.length;
          if (file.filepath.startsWith(dir) && file.filepath.length > dirLength && file.filepath[dirLength] === pathSep) {
            if (file.isUnclassified) {
              dirsObject[dir].unclassified += 1;
            } else {
              dirsObject[dir].classified += 1;
            }
          }
        }

        Statistic.write(dir, dirsObject[dir]);
      });

      await Statistic.save();
      // await this.timeOutData(10000)
      console.log('Finish calculating statistic');
      return true;
    } catch (e) {
      console.log('Calculate error');
      console.log(e);
      throw e;
    }
  }

  timeOutData(s = 5000) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, s);
    });
  }

  async getLastLogs() {
    try {
      const logs = {
        train: {},
        test: {},
        validate: {},
        export: {},
        stop: {},
        ExportImages: {}
      };
      Object.keys(logs).forEach(f => {
        let filePath = path.join(Env.get('COMMAND_FILES_PATH'), `${f}.log`);
        logs[f].path = filePath;
        logs[f].lastLine = '';
      });

      await Promise.all(Object.keys(logs).map(async fileName => {
        let lastLine = '';
        try {
          lastLine = (await readLastLines.read(logs[fileName].path, 2));
        } catch (e) {
        }
        logs[fileName].lastLine = lastLine;
      }));

      return logs;
    } catch (e) {
      console.log(e);
    }
  }

  async logsFor({request, response}) {
    let file = request.params.file;
    const stream = fs.createReadStream(path.join(Env.get('COMMAND_FILES_PATH'), `${file}.log`));
    response.implicitEnd = false;
    response.response.setHeader('Content-type', 'text/plain; charset=utf-8');
    stream.pipe(response.response);
  }

  async getConfig({request, response}) {
    const currentCfg = await this.getSystemConfig();
    const user = request.currentUser;
    const resConfig = {...currentCfg, user, root: CONST_PATHS.root};
    response.json(resConfig);
  }

  async getExplorerConfig({request, response}) {
    let dir = request.get().dir;
    let notes = null
    if (fs.existsSync(`${dir}/notes.txt`) && fs.lstatSync(`${dir}/notes.txt`).isFile()) {
      try {
        notes = fs.readFileSync(`${dir}/notes.txt`, 'utf-8');
      } catch (e) {
        console.log('Notes not found');
      }
    }
    let noteData, isHighlight
    if (notes && notes.startsWith(highlightPrefix)) {
      noteData = notes.substring(highlightPrefix.length);
      isHighlight = true;
    } else {
      noteData = notes;
    }
    const resConfig = await this.getParentFolderConfig(dir, request.currentUser);
    response.json({
      ...resConfig,
      notes: noteData,
      highlight: isHighlight
    });
  }

  async getParentFolderConfig(dir, user = {}) {
    const selectedWorkSpaceConfig = await this.getSystemConfig();
    let parentConfig = {};
    const rootPath = CONST_PATHS.root;
    if (dir && dir.startsWith(rootPath)) {
      dir = dir.substring(rootPath.length + 1);
      const sepIndex = dir.indexOf(pathSep);
      if (sepIndex) {
        dir = dir.substring(0, sepIndex);
      }
      const parentFolderPath = path.join(rootPath, dir)
      const configPath = path.join(parentFolderPath, '.cfg');
      parentConfig = await this.getJsonConfig(configPath);
      parentConfig.parentFolderPath = parentFolderPath
    }
    return {...selectedWorkSpaceConfig, ...parentConfig, user, root: CONST_PATHS.root};
  }

  async doForwardOnly({request, response}) {
    let {selectedFiles, notSelectedFiles} = request.post();
    let dir = '';
    if (selectedFiles && selectedFiles.length) {
      dir = selectedFiles[0];
    } else if (notSelectedFiles && notSelectedFiles.length) {
      dir = notSelectedFiles[0];
    }
    const currentCfg = await this.getParentFolderConfig(dir);
    let workingRoot = currentCfg && currentCfg.wsPath ? currentCfg.wsPath : CONST_PATHS.root;
    if (currentCfg.parentFolderPath) {
      workingRoot = currentCfg.parentFolderPath
    }
    const selectedPath = currentCfg.selectedPath || 'Selected';
    const absSelectedPath = path.join(workingRoot, selectedPath);
    const notSelectedPath = currentCfg.notSelectedPath || 'NotSelected';
    const absNotSelectedPath = path.join(workingRoot, notSelectedPath);

    const user = request.currentUser.username;

    // Create delete directory if not exist
    if (!fs.existsSync(absSelectedPath)) {
      throw Error(`Folder ${absSelectedPath} does not exist, cannot move files`);
    }

    if (!fs.existsSync(absNotSelectedPath)) {
      throw Error(`Folder ${absNotSelectedPath} does not exist, cannot move files`);
    }

    const selected = await this.moveFiles(selectedFiles, absSelectedPath, user);
    const notSelected = await this.moveFiles(notSelectedFiles, absNotSelectedPath, user);
    response.json({
      selected,
      notSelected
    });
  }

  async saveNotes({request, response}) {
    const {path, highlight} = request.post();
    let {notes} = request.post();
    if (highlight) {
      notes = `${highlightPrefix}${notes}`;
    }
    fs.writeFileSync(path, notes, {encoding: 'utf8', flag: 'w'});
    return true;
  }

  async saveConfig({request, response}) {
    const {path, config} = request.post();
    const configStr = JSON.stringify(config);
    if (!configStr) return false;
    if (fs.existsSync(path)) {
      fs.writeFileSync(path, configStr, {encoding: 'utf8'});
      return true;
    }
    return false;
  }

  isDirectory = source => lstatSync(source).isDirectory();

  async getSubFolderByPath({request, response}) {
    let dir = request.get().dir || CONST_PATHS.root;

    let checkPermission = dir === CONST_PATHS.root;

    if (!fs.existsSync(dir)) {
      throw Error(`Folder ${dir} does not exist`);
    }
    if (!fs.lstatSync(dir).isDirectory()) {
      throw Error(`${dir} is not a folder`);
    }
    const files = fs.readdirSync(dir);
    const folders = [];
    const permissions = request.currentUser
      && request.currentUser.permissions
      && request.currentUser.permissions.workspaces;
    for (const name of files) {
      if (checkPermission) {
        if (!hasPermissionWorkspaces(name, permissions)) continue;
      }
      const subDir = path.join(dir, name);
      if (fs.lstatSync(subDir).isDirectory()) {
        const file = {
          // subFolders: [],
          name,
          path: subDir,
          hasSubFolders: this.hasSubFolders(subDir)
        };
        const statistic = Statistic.get(subDir);
        if (Number.isInteger(statistic.classified)) {
          file.classified = statistic.classified;
        }

        if (Number.isInteger(statistic.unclassified)) {
          file.unclassified = statistic.unclassified;
        }

        const notesPath = path.join(subDir, 'notes.txt');
        file.notes = '';
        file.notesPath = notesPath;
        file.highlight = false;
        if (fs.existsSync(notesPath) && fs.lstatSync(notesPath).isFile()) {
          try {
            let notes = fs.readFileSync(notesPath, 'utf-8');
            if (notes.startsWith(highlightPrefix)) {
              file.notes = notes.substring(highlightPrefix.length);
              file.highlight = true;
            } else {
              file.notes = notes;
            }
          } catch (e) {
            console.log(`can not read ${notesPath}`);
          }
        }

        //Read Cfg
        const cfgPath = path.join(subDir, '.cfg');
        if (fs.existsSync(cfgPath) && fs.lstatSync(cfgPath).isFile()) {
          try {
            let cfg = fs.readFileSync(cfgPath, 'utf-8');
            let config = JSON.parse(cfg);
            file.config = config;
            file.cfgPath = cfgPath;
          } catch (e) {
            console.log(`Can not read ${cfgPath}`);
          }
        }
        folders.push(file);
      }
    }
    return folders;
  }

  async listStatistic({request}) {
    const {dirs} = request.post();
    return Statistic.getList(dirs);
  }

  hasSubFolders(dir) {
    return fs
      .readdirSync(dir, {withFileTypes: true})
      .filter(file => file.isDirectory()).length > 0;
  }

  async confusionMatrix({request}) {
    const {left, right} = request.post();
    const cog = await this.getJsonConfig(path.join(right, '.cfg'));
    const compare_folders = (await folderTravel(left, true, cog['CMExtensions'])).filter(x => x.type === FTYPES.folder).sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    const active_folders = (await folderTravel(right, true, cog['CMExtensions'])).filter(x => x.type === FTYPES.folder)
    const compare_names = compare_folders.map(x => x.name);
    const active_names = active_folders.map(x => x.name);
    let new_active_folders = []
    for (let i = 0; i < compare_names.length; i++) {
      let test = active_names.indexOf(compare_names[i])
      if (test >= 0) {
        new_active_folders[i] = active_folders[test]
      } else {
        new_active_folders[i] = {
          name: compare_names[i],
          files: []
        }
      }
    }
    new_active_folders.push({
      name: "order",
      files: []
    })
    let others = active_folders.filter(x => !compare_names.includes(x.name))
    others.forEach(x => {
      let index = new_active_folders.length - 1;
      new_active_folders[index].files = new_active_folders[index].files.concat(x.files)
    })
    let matrix = [];
    for (let i = 0; i < compare_folders.length; i++) {
      matrix[i] = []
      for (let j = 0; j < new_active_folders.length; j++) {
        let count = 0
        const colFiles = compare_folders[i].files.map((x) => x.name)
        const rowFiles = new_active_folders[j].files.map((x) => x.name)
        colFiles.forEach((f1) => {
          if (rowFiles.includes(f1)) {
            count += 1
          }
        })
        matrix[i][j] = count
      }
    }
    return {
      matrix,
      compareNames: compare_names,
    }
  }
}

module.exports = ExplorerController;
