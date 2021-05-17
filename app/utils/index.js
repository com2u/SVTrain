const fs = require('fs');
const { promisify } = require("util")
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const path = require('path');
const roles = require('../../roles.json')
const users = require('../../users.json')
const Env = use('Env');
const uuid4 = require('uuid4');

function getRoles() {
  return roles
}

function getUsers() {
  return users
}

function matchRuleShort(str, rule) {
  var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(str);
}

function hasPermissionWorkspaces(folderName, workspaceRules) {
  if (!workspaceRules) return false
  for (let ws of workspaceRules) {
    if (matchRuleShort(folderName, ws)) return true
  }
  return false
}

function removeExt(fileName) {
  return (fileName + '').replace(path.extname(fileName), '');
}

function getExt(fileName) {
  return path.extname(fileName + '').toLowerCase();
}

async function readDirRecursive(options) {
  if (typeof options === 'string') {
    options = {path: options};
  }
  if (!options.path) {
    throw new Error('Path option is required.');
  }
  options = Object.assign({}, {
    extensions: ['.jpg', '.png', '.jpeg', '.bmp'],
    excludes: ['.', '..']
  }, options);
  let results = [];
    for(const file of await readdir(options.path)) {
      const fullFilePath = path.join(options.path, file);
      if ((await stat(fullFilePath)).isDirectory()) {
        results = results.concat(await readDirRecursive(Object.assign({}, options, {path: fullFilePath})));
        return;
      }
      if ((!options.extensions.length || options.extensions.includes(path.extname(file))) && (!options.excludes.length || !options.excludes.includes(file))) {
        let relativePath = path.relative(Env.get('ROOT_PATH'), fullFilePath);
        let temp = path.dirname(relativePath).split(path.sep);
        let workspace = temp.shift();
        let defectClass = temp.pop();
        results.push({
          absolutePath: fullFilePath,
          relativePath: relativePath,
          workspace: workspace,
          defectClass: defectClass,
          batchName: temp.length ? temp : ["default"],
          fileName: removeExt(path.basename(fullFilePath)),
          nameGUID: `${removeExt(path.basename(fullFilePath))}_${uuid4().toUpperCase()}${getExt(fullFilePath)}`,
          ext: getExt(fullFilePath)
        });
      }
    }
  return results;
}


module.exports.getUsers = getUsers
module.exports.getRoles = getRoles
module.exports.matchRuleShort = matchRuleShort
module.exports.hasPermissionWorkspaces = hasPermissionWorkspaces
module.exports.readDirRecursive = readDirRecursive
