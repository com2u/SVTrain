const roles = require('../../roles.json')
const users = require('../../users.json')

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

module.exports.getUsers = getUsers
module.exports.getRoles = getRoles
module.exports.matchRuleShort = matchRuleShort
module.exports.hasPermissionWorkspaces = hasPermissionWorkspaces

