const roles = require('../../roles.json')
const users = require('../../users.json')

function getRoles() {
  return roles
}

function getUsers() {
  return users
}

module.exports.getUsers = getUsers
module.exports.getRoles = getRoles

