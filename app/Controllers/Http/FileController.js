'use strict';
const path = require('path');
const Env = use('Env');
const Drive = use('Drive');
const fs = require('fs');
const { promisify } = require("util")
const exists = promisify(fs.exists)
const readFile = promisify(fs.readFile)
const lstat = promisify(fs.lstat)
const archiver = require('archiver');
const Watcher = use('Watcher')
const rootPath = Env.get('ROOT_PATH');
const scriptPath = Env.get('COMMAND_FILES_PATH');
const storagePath = Env.get('STORAGE_PATH');
const child_process = require("child_process");

String.prototype.replaceAll = function (str1, str2, ignore) {
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
}

class FileController {
  async download({request, params, response}) {
    params.filePath = params.filePath ? params.filePath.filter(x => Boolean(x)).map(x => {
      return x.replaceAll("%7Bhash_tag%7D", "#").replaceAll("{hash_tag}", "#")
    }) : []
    const {is_export, sessionToken, field} = request.get()
    if (is_export) {
      if (field === 'export_images') {
        let ws
        const dir = Env.get('COMMAND_FILES_PATH');
        const workspaceFile = path.join(dir, 'workspace.bat');
        try {
          ws = await exists(workspaceFile) ? await readFile(workspaceFile) : false;
        } catch (e) {
          ws = null
        }
        if (!ws) {
          return response.status(404)
        }
        let fullPath = `${ws.toString()}/${params.filePath.join('/')}`
        if ((await lstat(fullPath)).isDirectory()) {
          const last = fullPath.substr(fullPath.length - 1)
          if (last === '/') {
            fullPath = fullPath.slice(0, -1)
          }
          const zipFilePath = `${fullPath}.zip`
          if (await exists(zipFilePath)) {
            return response.status(200).attachment(zipFilePath);
          } else {
            await child_process.execSync(`zip -r ${zipFilePath} *`, {
              cwd: fullPath
            });
            return response.status(200).attachment(zipFilePath);
          }
        }
      } else {
        const fullPath = `${scriptPath}/${params.filePath.join('/')}`
        if (await exists(fullPath)) {
          return response.attachment(fullPath);
        }
      }
    } else {
      const filePath = decodeURI(params.filePath.join('/'));
      const isExist = await Drive.exists(filePath);
      const storageImagePath = path.join(storagePath, filePath)
      if (isExist) {
        return response.download(`${rootPath}/${filePath}`);
      } else if (await exists(storageImagePath)) {
        return response.download(storageImagePath);
      } else if (new RegExp("TFSettings.json" + "$").test(filePath)) {
        return response.json({
          "script_training": Env.get("SCRIPT_TRAINING"),
          "script_test": Env.get('SCRIPT_TEST'),
          "script_validate": Env.get('SCRIPT_VALIDATE'),
          "script_stop_training": Env.get('SCRIPT_STOP_TRAINING'),
          "script_stop_test": Env.get('SCRIPT_STOP_TEST'),
          "script_stop_validation": Env.get('SCRIPT_STOP_VALIDATE'),
          "script_export_model": Env.get('SCRIPT_EXPORT_MODEL'),
          "script_export_result": Env.get('SCRIPT_EXPORT_RESULT'),
          "script_export_image": Env.get('SCRIPT_EXPORT_IMAGE'),
          "script_report": Env.get('SCRIPT_REPORT'),
          "script_split_data": Env.get('SCRIPT_SPLIT_DATA'),
          "path_log_training": Env.get('PATH_LOG_TRAINING'),
          "path_log_test": Env.get('PATH_LOG_TEST'),
          "path_log_validate": Env.get('PATH_LOG_VALIDATE'),
          "path_file_export_model": Env.get('OUT_FILE_EXPORT_MODEL'),
          "path_file_export_results": Env.get('OUT_FILE_EXPORT_RESULTS'),
          "path_file_export_images": Env.get('OUT_FOLDER_EXPORT_IMAGES'),
          "path_train": Env.get('FOLDER_TRAIN'),
          "path_test": Env.get('FOLDER_TEST'),
          "path_validate": Env.get('FOLDER_VALIDATE'),
          "defaultEpoch": null,
          "defaultLearningRate": null
        })
      }
    }
    return 'File does not exist';
  }
}

module.exports = FileController;
