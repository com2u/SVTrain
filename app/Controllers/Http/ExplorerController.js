'use strict';
const Env = use('Env');
const child_process = require("child_process");
const Statistic = use('Statistic');
const path = require('path');
const recursive = require('../../../src/recursive');
const {promisify} = require('util');
const fs = require('fs');
const execFile = promisify(require('child_process').execFile);
const regexpForImages = (/\.(gif|jpg|jpeg|tiff|png|bmp)$/i);
const readdir = promisify(fs.readdir);
const lstat = promisify(fs.lstat);
const writeFile = promisify(fs.writeFile);
const rename = promisify(fs.rename);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile)
const copyFile = promisify(fs.copyFile)
const readLastLines = require('read-last-lines');
const config = require('../../../config/ui');
const logger = require('../../../logger');
const pathSep = path.sep;
const Database = use('Database')
const defaultCfgPath = path.join(__dirname, '../../../default.cfg');
const highlightPrefix = '[HIGHLIGHT]';
const iconName = 'favicon.ico';
const {hasPermissionWorkspaces} = require('../../utils/index');
const {readDirRecursive} = require("../../utils")

const Workspace = use('App/Models/Workspace');
const DefectClass = use('App/Models/DefectClass');
const ImageDefectClass = use('App/Models/ImageDefectClass');
const Batch = use('App/Models/Batch');

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
  running: 'lock.txt',
  workspace: 'workspace.bat',
  commands: Env.get('COMMAND_FILES_PATH', path.join(Env.get('ROOT_PATH'), 'DeepLearning')),
  // commandNames: ['train', 'validate', 'test', 'export', 'stop', 'ExportImages'],
  commandNames: {
    script_training: "SCRIPT_TRAINING",
    script_test: "SCRIPT_TEST",
    script_validate: "SCRIPT_VALIDATE",
    script_stop_training: "SCRIPT_STOP_TEST",
    script_stop_test: "SCRIPT_STOP_TRAINING",
    script_stop_validate: "SCRIPT_STOP_VALIDATE",
    script_export_model: "SCRIPT_EXPORT_MODEL",
    script_export_result: "SCRIPT_EXPORT_RESULT",
    script_export_image: "SCRIPT_EXPORT_IMAGE",
    script_report: "SCRIPT_REPORT",
    script_split_data: "SCRIPT_SPLIT_DATA"
  },
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
      const temp = flStat.isDirectory() && flag ? await folderTravel(fPath, false, fileExtensions) : []
      out.push({
        path: fPath,
        name: f,
        type: flStat.isDirectory() ? FTYPES.folder : flStat.isFile() && f !== iconName ? FTYPES.file : null,
        files: temp.filter(x => x.type !== 'folder').map(x => x.name)
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
    let {dir, type, batch, to, isStatistic} = request.get();
    if (!dir) dir = CONST_PATHS.root
    const result = {
      folders: [],
      files: [],
      path: dir
    }
    if (type === 'ws') {
      const wsDB = await Workspace.findBy("name", dir)
      const ws = wsDB.toJSON()
      if (!ws.settings) ws.settings = {};
      const cfg = JSON.parse(ws.settings)
      const pis = path.join(Env.get("STORAGE_PATH"), cfg['imageStorage'] ? cfg['imageStorage'] : ws.name);
      const batches = (await wsDB.batches().fetch()).toJSON()
      for (let batch of batches) {
        result.folders.push({
          path: batch.name,
          name: batch.name,
          type: 'batch',
          image: false,
          match: false
        })
      }
      const images = await Database.table('image_defect_classes')
        .innerJoin('batches', 'image_defect_classes.batch_no', 'batches.no')
        .where("batches.work_space_no", wsDB.toJSON().no).groupBy("image_defect_classes.file_name")
      for (let file of images) {
        result.files.push({
          path: path.join(pis, file.file_name),
          relativePath: path.join(cfg['imageStorage'] ? cfg['imageStorage'] : ws.name, file.file_name),
          name: file.file_name,
          type: FTYPES.file,
          image: true,
          match: false
        });
      }
    } else if (type === 'batch') {
      const batch = await Batch.findBy("name", dir)
      const batch_child = (await Batch.query().where("parent", batch.toJSON().no).fetch()).toJSON()
      let defect_classes = (await batch.defect_classes().fetch()).toJSON()
      defect_classes = await Database
        .table('defect_classes')
        .innerJoin('image_defect_classes', 'defect_classes.no', 'image_defect_classes.defect_classes_no')
        .where("image_defect_classes.batch_no", batch.toJSON().no).groupBy("defect_classes.no")
      for (let df of defect_classes) {
        result.folders.push({
          path: df.name,
          name: df.name,
          type: 'defectclass',
          image: false,
          match: false,
          batch: dir
        })
      }
      for (let df of batch_child) {
        result.folders.push({
          path: df.name,
          name: df.name,
          type: 'batch',
          image: false,
          match: false,
        })
      }
    } else if (type === 'defectclass') {
      const bt = await Batch.findBy("name", batch)
      const df = await DefectClass.findBy("name", dir)
      if (df && batch) {
        const ws = (await Workspace.findBy('no', bt.work_space_no)).toJSON()
        if (!ws.settings) ws.settings = {};
        const cfg = JSON.parse(ws.settings)
        const pis = path.join(Env.get("STORAGE_PATH"), cfg['imageStorage'] ? cfg['imageStorage'] : ws.name);
        const qs = await ImageDefectClass.query()
          .where('batch_no', bt.toJSON().no)
          .where('defect_classes_no', df.toJSON().no)
          .fetch()
        for (let file of qs.toJSON()) {
          result.files.push({
            path: path.join(pis, file.file_name),
            relativePath: path.join(cfg['imageStorage'] ? cfg['imageStorage'] : ws.name, file.file_name),
            name: file.file_name,
            type: FTYPES.file,
            image: true,
            match: false
          });
        }
      }
    } else {
      if (!accessToFile(CONST_PATHS.root, dir)) {
        logger.error(`User ${request.currentUser.username} can't access to: "${dir}"`);
        throw new Error('Access denied')
      }
      const files = await readdir(dir);
      let compareFiles = []
      if (to && !isStatistic && fs.existsSync(path.join(CONST_PATHS.root, to))) {
        compareFiles = await readdir(path.join(CONST_PATHS.root, to));
      }
      result.folders = [];
      result.files = [];
      result.path = dir;
      const permissions = request.currentUser
        && request.currentUser.permissions
        && request.currentUser.permissions.workspaces;
      for (let i = 0; i < files.length; ++i) {
        if (to && !isStatistic && !compareFiles.includes(files[i])) {
          continue
        }
        if (to && isStatistic && !files[i].includes(to)) {
          continue
        }
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
    let {dir, type, batch} = request.get();
    if (!type) type = "folder";
    let parent = null
    let name = null
    let access = null
    if (type === 'ws') {
      access = false
    } else if (type === 'batch') {
      let batch = await Batch.findBy('name', dir)
      if (batch) {
        let test
        batch = batch.toJSON()
        if (batch.parent) {
          test = (await Batch.findBy('no', batch.parent)).toJSON()
          type = "batch"
        } else {
          type = "ws"
          test = (await Workspace.findBy('no', batch.work_space_no)).toJSON()
        }
        name = test.name
        parent = test.name
        access = true
      }
    } else if (type === 'defectclass') {
      parent = batch
      name = batch
      type = "batch"
      access = true
    } else {
      try {
        if (dir) {
          parent = dir.split(path.sep);
          parent.splice(-1);
          parent = parent.join(path.sep);
          name = path.basename(parent);
          access = accessToFile(CONST_PATHS.root, parent);
        }
      } catch (e) {
        logger.error(e.message);
        console.log(e);
      }
    }
    return {
      path: parent,
      name: name,
      type: type,
      access: access
    };
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
      return (await exists(runningFile)) ? await readFile(runningFile) : false;
    } catch (e) {
      logger.error(e.message);
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
      return (await exists(workspaceFile)) ? await readFile(workspaceFile) : false;
    } catch (e) {
      logger.error(e.message);
      return null;
    }
  }

  async getJsonConfig(path) {
    let cfg = {};
    try {
      if (await exists(path)) {
        const fileContent = await readFile(path, 'utf-8');
        cfg = JSON.parse(fileContent);
        if (cfg.hide === true) {
          cfg = {};
        }
      }
    } catch (e) {
      logger.error(e.message);
      cfg = {};
    }
    return cfg;
  }

  async getSystemConfig() {
    const ws = await this.getWorkspace();
    let wsPath = ws.toString();
    let configPath, cfg = config, isDB;
    if (wsPath.startsWith("db:")) {
      wsPath = wsPath.replace("db:", "")
      let wsInstance = await Workspace.findBy("name", wsPath)
      if (wsInstance) {
        isDB = true
        let cfgStr = wsInstance.toJSON().settings
        if (cfgStr && Object.keys(JSON.parse(cfgStr)).length) cfg = JSON.parse(cfgStr)
      }
    } else {
      configPath = path.join(wsPath, '.cfg');
      cfg = await this.getJsonConfig(configPath);
    }
    return {...config, ...cfg, wsPath, isDB};
  }

  /*
  POST /setWorkspace

  Set the workspace
  */
  async setWorkspace({request}) {
    const {workspace, isDB} = request.post();
    let workspaceFile = path.join(Env.get('COMMAND_FILES_PATH'), CONST_PATHS.workspace);
    let newWorkspace;
    if (isDB) {
      newWorkspace = `db:${workspace}`
    } else {
      newWorkspace = path.join(CONST_PATHS.root, workspace);
    }
    await writeFile(workspaceFile, newWorkspace);
    logger.info(`User ${request.currentUser.username} has changed the workspace to ${newWorkspace}`);
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
    let {type} = request.get();
    let {files} = request.post();
    if (type === 'defectclass') {
      const currentCfg = await this.getSystemConfig();
      const dfName = currentCfg.deleteDefaultFolder || 'DeletedFiles';
      const df = await DefectClass.findOrCreate({name: dfName})
      for (let file of files) {
        const file_name = file.split(path.sep)[file.split(path.sep).length - 1]
        await ImageDefectClass.query().where('file_name', file_name).update({defect_classes_no: df.toJSON().no})
      }
    } else {
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
      if (!await exists(absDestination)) {
        await mkdir(absDestination);
      }
      const user = request.currentUser.username;
      return await this.moveFiles(files, absDestination, user, true);
    }
  }

  /*
    POST /moveFiles
    Except a JSON-object with two properties: "files" and "destination"
    Move files from array "files" to the derictory "destination"
    { files: [...], destination: "path/to/move" }

    return array of files with new path
  */
  async move({request}) {
    let {type} = request.get();
    let {files, destination} = request.post();
    const user = request.currentUser.username;
    if (type === 'defectclass') {
      const defectClass = (await DefectClass.findBy('name', destination)).toJSON()
      for (let file of files) {
        const name = file.split(path.sep)[file.split(path.sep).length - 1]
        await ImageDefectClass
          .query()
          .where('file_name', name)
          .update({defect_classes_no: defectClass.no})
      }
      return true
    } else {
      return await this.moveFiles(files, destination, user);
    }
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
    let {dir, type, ws} = request.get();
    if (!dir) dir = CONST_PATHS.root
    let result = [];
    if (type === 'ws' || type === 'defectclass') {
      let wsDB = null
      if (type === 'ws') {
        wsDB = await Workspace.findBy("name", dir)
      } else {
        wsDB = await Workspace.findBy("no", ws)
      }
      const currentCfg = await this.getSystemConfig();
      const dfDeleted = currentCfg.selectedPath || 'DeletedFiles';
      const dfSelected = currentCfg.selectedPath || 'Selected';
      const dfNotSelected = currentCfg.notSelectedPath || 'NotSelected';
      const wsInstance = wsDB.toJSON()
      const defect_classes = await Database
        .table('defect_classes')
        .innerJoin('image_defect_classes', 'defect_classes.no', 'image_defect_classes.defect_classes_no')
        .innerJoin('batches', 'image_defect_classes.batch_no', 'batches.no')
        .where("batches.work_space_no", wsInstance.no).groupBy("defect_classes.name")
        .distinct(["defect_classes.name", "defect_classes.icon"])
      defect_classes.forEach(x => {
        if (![dfDeleted, dfSelected, dfNotSelected].includes(x.name)) {
          result.push({
            name: x.name,
            path: x.name,
            icon: x.icon,
          })
        }
      })
    } else {
      if (!dir) throw new Error('The "path" parameter is needed');
      const parentDirectory = path.join(dir, '../');
      if (!accessToFile(CONST_PATHS.root, parentDirectory)) {
        logger.error(`Access denied for read next directory for folder ${dir}`);
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
          if (await exists(iconPath)) {
            folder.icon = path.relative(CONST_PATHS.root, iconPath);
          }
          result.push(folder);
        }
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
    if (!path) {
      logger.error('The "path" parameter is needed');
      throw new Error('The "path" parameter is needed');
    }
    if (!accessToFile(CONST_PATHS.root, path)) {
      logger.error(`Access denied for saving for file ${path}`);
      throw new Error(`Access denied for saving for file ${path}`);
    }
    if (path.includes("TFSettings.json")) {
      logger.info(`User ${request.currentUser.username} has changed the TFSettings file "${path}"`);
    }
    await writeFile(path, data);
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
    if (await exists(notesPath) && (await lstat(notesPath)).isFile()) {
      try {
        let notes = await readFile(notesPath, 'utf-8');
        result.notes = notes;
        result.notesPath = notesPath;
      } catch (e) {
        console.log(`can not read ${notesPath}`);
      }
    }

    //Read Cfg
    const cfgPath = path.join(dir, '.cfg');
    if (await exists(cfgPath) && (await lstat(cfgPath)).isFile()) {
      try {
        let cfg = await readFile(cfgPath, 'utf-8');
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
      logger.error(`Access denied for gettings subfolders for folder ${folder}`);
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

    return this.countSync(folder, 'root');
  }

  /*
    GET /checkFolder
    returns a status of a specific folder: ok, not_found, access_denied
  */
  async checkFolder({request}) {
    const {folder} = request.get();
    if (!folder) {
      logger.error('The "folder" parameter is needed');
      throw new Error('The "folder" parameter is needed')
    }
    if (!accessToFile(CONST_PATHS.root, folder)) {
      logger.error(`Access denied to ${folder}`);
      return 'access_denied';
    }
    const isExist = await exists(folder);
    if (!isExist) {
      logger.error(`${folder} was not found`);
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
      logger.error(`${request.currentUser.username} had\'t access to ${folder} directory`);
      throw new Error(`You haven\'t access to ${folder} directory`);
    }
    if (!await exists(folder)) {
      logger.error(`The directory ${folder} doesn't exist`);
      throw new Error(`The directory ${folder} doesn't exist`);
    }
    const newFolderPath = path.join(folder, name);
    await mkdir(newFolderPath);
    await copyFile(defaultCfgPath, path.join(newFolderPath, '.cfg'));
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
    logger.info(`User ${request.currentUser.username} has started script: "${command}"`);
    if (!CONST_PATHS.commandNames[command]) {
      console.log(`Unknow command ${command}`);
      throw new Error(`Unknow command ${command}`);
    }
    const {ws} = request.get();
    const configPath = path.join(ws, '/TFSettings.json');
    const cfg = await this.getJsonConfig(configPath);
    const cmdName = cfg[command] || Env.get(CONST_PATHS.commandNames[command])
    const commandFilePath = path.join(Env.get('COMMAND_FILES_PATH'), cmdName);
    if (!await exists(commandFilePath)) {
      logger.error(`File ${commandFilePath} doesn't exist`);
      throw new Error(`File ${commandFilePath} doesn't exist`);
    }

    try {
      await execFile(commandFilePath);
    } catch (e) {
      logger.error(`An error occurred when run command: ${command}`, e);
    }
    return true;
  }

  /*
    GET /getStatistic?dir=
    Returns statistic for given directory
  */
  async statistic({request}) {
    const {dir} = request.get();
    logger.info(`User ${request.currentUser.username} has shown statistic of "${dir}"`);
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
      logger.error(e.message);
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
    const logs = {
      training: {},
      test: {},
      validate: {},
      export_model: null,
      export_results: null,
      export_images: null
    };
    try {
      const ws = await this.getWorkspace();
      const wsPath = ws.toString();
      const configPath = path.join(wsPath, 'TFSettings.json');
      const cfg = await this.getJsonConfig(configPath);
      let logNames = {
        "training": cfg["path_log_test"] || Env.get('PATH_LOG_TEST'),
        "test": cfg["path_log_training"] || Env.get('PATH_LOG_TRAINING'),
        "validate": cfg["path_log_validate"] || Env.get('PATH_LOG_VALIDATE'),
      };
      let exportNames = {
        export_model: cfg["path_field_export_model"] || Env.get('OUT_FILE_EXPORT_MODEL'),
        export_results: cfg["path_field_export_results"] || Env.get('OUT_FILE_EXPORT_RESULTS'),
        export_images: [null, undefined].includes(cfg["path_field_export_images"]) ? Env.get('OUT_FOLDER_EXPORT_IMAGES') : cfg["path_field_export_images"]
      }
      await Promise.all(['training', 'test', 'validate'].map(async fileName => {
        let lastLine = '';
        try {
          lastLine = (await readLastLines.read(path.join(Env.get('COMMAND_FILES_PATH'), logNames[fileName]), cfg["ViewLogLines"] || 2));
        } catch (e) {
        }
        logs[fileName] = {
          path: path.join(Env.get('COMMAND_FILES_PATH'), logNames[fileName]),
          lastLine
        }
      }));
      await Promise.all(['export_model', 'export_results', 'export_images'].map(async fileName => {
        if (fileName === 'export_images') {
          const ws = await this.getWorkspace();
          let wsPath = ws.toString();
          if (await exists(path.join(wsPath, exportNames[fileName]))) {
            logs[fileName] = exportNames[fileName]
          } else {
            logs[fileName] = null
          }
        } else {
          if (await exists(path.join(Env.get('COMMAND_FILES_PATH'), exportNames[fileName]))) {
            logs[fileName] = exportNames[fileName]
          } else {
            logs[fileName] = null
          }
        }
      }));
      return logs;
    } catch (e) {
      logger.error(e.message);
      return logs;
    }
  }

  async getTrainLogs() {
    let logs = null
    try {
      const ws = await this.getWorkspace();
      const wsPath = ws.toString();
      const configPath = path.join(wsPath, 'TFSettings.json');
      const cfg = await this.getJsonConfig(configPath);
      try {
        const p = path.join(Env.get('COMMAND_FILES_PATH'), cfg["path_log_training"] || Env.get('PATH_LOG_TRAINING'))
        logs = await readLastLines.read(p);
      } catch (e) {
      }
    } catch (e) {
    }
    return logs;
  }

  async logsFor({request, response}) {
    let file = request.params.file;
    if (file === 'training.log') {
      const ws = await this.getWorkspace();
      const wsPath = ws.toString();
      const configPath = path.join(wsPath, 'TFSettings.json');
      const cfg = await this.getJsonConfig(configPath);
      file = cfg["path_log_training"] || Env.get('PATH_LOG_TRAINING')
    } else {
      file = `${file}.log`
    }
    const logPath = path.join(Env.get('COMMAND_FILES_PATH'), file);
    if (!await exists(logPath)) {
      return ""
    }
    const stream = fs.createReadStream(logPath);
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
    let {dir, type} = request.get();
    let noteData, isHighlight, resConfig = config, isDB
    if (['ws', 'batch', 'defectclass'].includes(type)) {
      const ws = await this.getWorkspace();
      let wsPath = ws.toString();
      wsPath = wsPath.replace("db:", "")
      let wsInstance = await Workspace.findBy("name", wsPath)
      if (wsInstance) {
        const wsiJson = wsInstance.toJSON()
        let cfgStr = wsiJson.settings
        if (cfgStr && Object.keys(JSON.parse(cfgStr)).length) resConfig = JSON.parse(cfgStr)
        noteData = wsiJson.notes
        isHighlight = wsiJson.highlight
        isDB = true
      }
    } else {
      let notes = null
      if (await exists(`${dir}/notes.txt`) && (await lstat(`${dir}/notes.txt`)).isFile()) {
        try {
          notes = await readFile(`${dir}/notes.txt`, 'utf-8');
        } catch (e) {
          console.log('Notes not found');
        }
      }
      if (notes && notes.startsWith(highlightPrefix)) {
        noteData = notes.substring(highlightPrefix.length);
        isHighlight = true;
      } else {
        noteData = notes;
      }
      resConfig = await this.getParentFolderConfig(dir, request.currentUser);
    }
    response.json({
      ...resConfig,
      notes: noteData,
      highlight: isHighlight,
      isDB
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
    let {type} = request.get();
    let {selectedFiles, notSelectedFiles} = request.post();
    if (type === 'defectclass') {
      const currentCfg = await this.getSystemConfig();
      const dfSelected = currentCfg.selectedPath || 'Selected';
      const dfNotSelected = currentCfg.notSelectedPath || 'NotSelected';
      let df = await DefectClass.findOrCreate({name: dfSelected})
      for (let file of selectedFiles) {
        const file_name = file.split(path.sep)[file.split(path.sep).length - 1]
        await ImageDefectClass.query().where('file_name', file_name).update({defect_classes_no: df.toJSON().no})
      }
      df = await DefectClass.findOrCreate({name: dfNotSelected})
      for (let file of notSelectedFiles) {
        const file_name = file.split(path.sep)[file.split(path.sep).length - 1]
        await ImageDefectClass.query().where('file_name', file_name).update({defect_classes_no: df.toJSON().no})
      }
      return response.json({
        selected: selectedFiles,
        notSelected: notSelectedFiles
      });
    } else {
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
      if (!await exists(absSelectedPath)) {
        logger.error(`Folder ${absSelectedPath} does not exist, cannot move files`);
        throw Error(`Folder ${absSelectedPath} does not exist, cannot move files`);
      }
      if (!await exists(absNotSelectedPath)) {
        logger.error(`Folder ${absSelectedPath} does not exist, cannot move files`);
        throw Error(`Folder ${absNotSelectedPath} does not exist, cannot move files`);
      }
      const selected = await this.moveFiles(selectedFiles, absSelectedPath, user);
      const notSelected = await this.moveFiles(notSelectedFiles, absNotSelectedPath, user);
      response.json({
        selected,
        notSelected
      });
    }
  }

  async saveNotes({request, response}) {
    const {path, highlight} = request.post();
    let {notes} = request.post();
    if (path.startsWith("DB:")) {
      const wsPath = path.replace("DB:", "")
      await Workspace.query()
        .where('name', wsPath)
        .update({notes: notes, highlight: Boolean(highlight)})
    } else {
      if (highlight) {
        notes = `${highlightPrefix}${notes}`;
      }
      await writeFile(path, notes, {encoding: 'utf8', flag: 'w'});
    }
    return true;
  }

  async saveConfig({request, response}) {
    const {path, config} = request.post();
    const configStr = JSON.stringify(config);
    if (!configStr) return false;
    if (path.startsWith("DB:")) {
      const wsPath = path.replace("DB:", "")
      await Workspace.query()
        .where('name', wsPath)
        .update({settings: configStr})
    } else {
      if (await exists(path)) {
        logger.info(`User ${request.currentUser.username} has changed the .cfg file "${path}"`);
        await writeFile(path, configStr, {encoding: 'utf8'});
        return true;
      }
    }
    return false;
  }

  isDirectory = async (source) => lstat(source).then(stat => stat.isDirectory());

  async getSubFolderByPath({request, response}) {
    let {dir, type, ws} = request.get()
    if (!dir) {
      dir = CONST_PATHS.root
    }
    let wsDB
    if (type === 'ws') {
      wsDB = await Workspace.findBy("name", dir)
    } else if (['batch', 'defectclass'].includes(type)) {
      wsDB = await Workspace.findBy("no", ws)
    }
    const folders = [];

    if (type === 'ws') {
      const batches = (await wsDB.batches().withCount('image_defect_classes').fetch()).toJSON()
      for (let batch of batches) {
        folders.push({
          ws: wsDB.toJSON().no,
          type: 'batch',
          name: batch.name,
          path: batch.name,
          hasSubFolders: true,
          notes: '',
          notesPath: null,
          highlight: false,
          classified: batch.__meta__.image_defect_classes_count,
          unclassified: 0
        })
      }
    } else if (type === 'batch') {
      // const currentCfg = await this.getSystemConfig();
      // const dfDeleted = currentCfg.selectedPath || 'DeletedFiles';
      // const dfSelected = currentCfg.selectedPath || 'Selected';
      // const dfNotSelected = currentCfg.notSelectedPath || 'NotSelected';
      const batch = await wsDB.batches().where("name", dir).first()
      const batch_child = (await Batch.query().where("parent", batch.toJSON().no).fetch()).toJSON()
      let defect_classes = (await batch.defect_classes().withCount('image_defect_classes', (builder) => {
        builder.where('batch_no', batch.toJSON().no)
      }).fetch()).toJSON()
      for (let df of defect_classes) {
        folders.push({
          ws: ws,
          type: 'defectclass',
          name: df.name,
          path: df.name,
          hasSubFolders: false,
          notes: '',
          notesPath: null,
          highlight: false,
          classified: df.__meta__.image_defect_classes_count,
          unclassified: 0,
          batch: batch.toJSON().name
        })
      }
      for (let df of batch_child) {
        folders.push({
          ws: ws,
          type: 'batch',
          name: df.name,
          path: df.name,
          hasSubFolders: true,
          notes: '',
          notesPath: null,
          highlight: false,
          classified: 0,
          unclassified: 0
        })
      }
    } else {
      let checkPermission = dir === CONST_PATHS.root;
      if (!await exists(dir)) {
        logger.error(`Folder ${dir} does not exist`)
        throw Error(`Folder ${dir} does not exist`);
      }
      if (!(await lstat(dir)).isDirectory()) {
        logger.error(`${dir} is not a folder`)
        throw Error(`${dir} is not a folder`);
      }
      const files = await readdir(dir);
      const permissions = request.currentUser
        && request.currentUser.permissions
        && request.currentUser.permissions.workspaces;
      for (const name of files) {
        if (dir === CONST_PATHS.root) {
          if (await exists(path.join(dir, name, '.legacy'))) {
            continue
          }
        }
        if (checkPermission) {
          if (!hasPermissionWorkspaces(name, permissions)) continue;
        }
        const subDir = path.join(dir, name);
        if ((await lstat(subDir)).isDirectory()) {
          const file = {
            name,
            path: subDir,
            hasSubFolders: await this.hasSubFolders(subDir),
            notes: '',
            notesPath: null,
            highlight: false,
            classified: 0,
            unclassified: 0
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
          if (await exists(notesPath) && (await lstat(notesPath)).isFile()) {
            try {
              let notes = await readFile(notesPath, 'utf-8');
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
          if (await exists(cfgPath) && (await lstat(cfgPath)).isFile()) {
            try {
              let cfg = await readFile(cfgPath, 'utf-8');
              file.config = JSON.parse(cfg);
              file.cfgPath = cfgPath;
            } catch (e) {
              console.log(`Can not read ${cfgPath}`);
            }
          }
          folders.push(file);
        }
      }
    }
    return folders;
  }

  async listStatistic({request}) {
    const {dirs} = request.post();
    return Statistic.getList(dirs);
  }

  async hasSubFolders(dir) {
    const files = await readdir(dir, {withFileTypes: true})
    return files.filter(file => file.isDirectory()).length > 0;
  }

  async confusionMatrix({request}) {
    const {left, right} = request.post();
    logger.info(`User ${request.currentUser.username} has compared workspace between ${left} and ${right}`);
    const cog = await this.getJsonConfig(path.join(right, '.cfg'));
    const compare_folders = (await folderTravel(left, true, cog['CMExtensions'])).filter(x => x.type === FTYPES.folder).sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
    const active_folders = (await folderTravel(right, true, cog['CMExtensions'])).filter(x => x.type === FTYPES.folder)
    console.log(compare_folders);
    console.log(active_folders);
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
        const colFiles = compare_folders[i].files
        const rowFiles = new_active_folders[j].files
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

  async convert2DB({request}) {
    const {wsName} = request.post();
    const ws = path.join(Env.get("ROOT_PATH"), wsName)
    const pathConfig = path.join(ws, '.cfg');
    const pathNotes = path.join(ws, 'notes.txt');
    const config = await this.getJsonConfig(pathConfig)
    const pathImageStorage = path.join(Env.get("STORAGE_PATH"), config['imageStorage'] ? config['imageStorage'] : wsName);
    let notes = {
      content: null,
      highlight: false
    }
    if (await exists(pathNotes) && (await lstat(pathNotes).isFile())) {
      try {
        const fileContent = await readFile(pathNotes, 'utf-8');
        notes = {
          content: fileContent,
          highlight: fileContent.startsWith(highlightPrefix)
        }
      } catch (e) {
        console.log('ERROR WHEN READ NOTES');
      }
    }
    if (!await exists(pathImageStorage)) {
      await mkdir(pathImageStorage);
    }
    const files = await readDirRecursive(ws)
    let wsInstance = await Workspace.findBy('name', wsName)
    if (!wsInstance) {
      await Workspace.create({
        name: wsName,
        notes: notes.highlight ? notes.content.replace(highlightPrefix, "") : notes.content,
        highlight: notes.highlight,
        settings: JSON.stringify(config)
      })
      wsInstance = await Workspace.findBy('name', wsName)
      for (let file of files) {
        // COPY FILE
        const newDestination = path.join(pathImageStorage, file.nameGUID);
        await copyFile(file.absolutePath, newDestination);
        // SYNC DATABASE
        /* CREATE BATCH */
        let batchInstance = null;
        for (let batch of file.batchName) {
          batchInstance = (await Batch.findOrCreate({
            parent: batchInstance ? batchInstance.no || batchInstance.id : null,
            work_space_no: wsInstance.no || wsInstance.id,
            name: batch,
            user: request.currentUser ? request.currentUser.username : 'defaultUser'
          }, {
            parent: batchInstance ? batchInstance.no || batchInstance.id : null,
            work_space_no: wsInstance.no || wsInstance.id,
            name: batch,
            user: request.currentUser ? request.currentUser.username : 'defaultUser',
            date: new Date(),
          })).toJSON()
        }
        /* CREATE DEFECT CLASS */
        let defectClassInstance = (await DefectClass.findOrCreate(
          {name: file.defectClass},
          {name: file.defectClass}
        )).toJSON();
        /* CREATE IMAGE DEFECT CLASS */
        await ImageDefectClass.findOrCreate({
          batch_no: batchInstance.no || batchInstance.id,
          defect_classes_no: defectClassInstance.no || defectClassInstance.id,
          file_name: file.nameGUID
        })
      }
      await writeFile(path.join(ws, '.legacy'), '', {encoding: 'utf8', flag: 'w'});
    }
    return {
      status: "DONE"
    }
  }

  async backup({request}) {
    const {wsName} = request.post();
    const ws = path.join(Env.get("ROOT_PATH"), wsName)
    const pathConfig = path.join(ws, '.cfg');
    const config = await this.getJsonConfig(pathConfig)
    const backupPath = path.join(Env.get("STORAGE_PATH"), config['backupPath'] ? config['backupPath'] : wsName);
    if (!fs.existsSync(backupPath)) {
      await fs.mkdirSync(backupPath);
    }
    logger.info(`User ${request.currentUser.username} has backup workspace: "${wsName}"`);
    child_process.execSync(`zip -r ${backupPath}/${(new Date()).getTime()}.zip *`, {
      cwd: ws
    });
    return {
      status: "DONE"
    }
  }

  async visualizeHeatmap({request, response}) {
    const ws = await this.getWorkspace();
    const PATH_CONFIG = path.join(ws.toString(), '/TFSettings.json');
    const cfg = await this.getJsonConfig(PATH_CONFIG);
    const COMMAND_FILES_PATH = Env.get('COMMAND_FILES_PATH', path.join(Env.get('ROOT_PATH'), 'DeepLearning'))
    const SCRIPT_VISUALIZE_HEATMAP = cfg['script_visualize_heatmap'] || Env.get("SCRIPT_VISUALIZE_HEATMAP", "script-visualize-heatmap.sh")
    const PATH_MODEL = path.join(COMMAND_FILES_PATH, cfg['path_field_export_model'] || Env.get("OUT_FILE_EXPORT_MODEL", "export_model.pb"))
    const HEATMAP_FOLDER_PATH = path.join(COMMAND_FILES_PATH, "heatmaps")
    const commandFilePath = path.join(COMMAND_FILES_PATH, SCRIPT_VISUALIZE_HEATMAP)
    const {image} = request.get();
    const imageHeatMapPath = path.join(HEATMAP_FOLDER_PATH, image)
    if (await exists(imageHeatMapPath)) {
      return response.attachment(imageHeatMapPath);
    } else {
      if (!await exists(commandFilePath)) {
        logger.error(`File ${commandFilePath} doesn't exist`);
        throw new Error(`File ${commandFilePath} doesn't exist`);
      }
      try {
        await execFile(commandFilePath, [PATH_MODEL, image, PATH_CONFIG]);
        return response.status(200)
      } catch (e) {
        logger.error(`File ${commandFilePath} doesn't exist`);
      }
    }
    return response.status(400)
  }
}

module.exports = ExplorerController;
