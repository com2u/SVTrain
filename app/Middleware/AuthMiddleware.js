const fs = require('fs')
const path = require('path')
const sessionsFilePath = path.join(__dirname, '../../sessions.json')
const {getUsers, getRoles} = require('../utils')

class AuthMiddleware {
  async handle({request, response}, next, properties) {
    let sessionToken = request.header('Authorization') || request.get().sessionToken
    if (!sessionToken) {
      console.log("where is sessionToken")
      response.unauthorized('LoginFirst')
      return
    }
    if (!fs.existsSync(sessionsFilePath)) {
      console.log('sessions file is empty')
      response.unauthorized('InvalidToken')
      return
    }
    let sessions = JSON.parse(fs.readFileSync(sessionsFilePath))
    if (!sessions[sessionToken]) {
      console.log('token doesn exist')
      response.unauthorized('InvalidToken')
      return
    }
    if (Date.now() > sessions[sessionToken].expiredTime) {
      console.log('expired')
      response.unauthorized('InvalidToken')
      return
    }
    const username = sessions[sessionToken].login
    let user = getUsers()
    if (!user[username]) {
      response.unauthorized('UserNotExist')
      return
    }
    const role = user[username].role
    const permissions = getRoles()[role]
    if (properties.length) {
      for (const permission of properties) {
        response.unauthorized('PermissionDenied')
        return
      }
    }
    request.currentUser = {
      username,
      role,
      permissions
    }
    await next()
  }

  async wsHandle({request, response}, next) {
    let {sessionToken} = request.get()
    if (!sessionToken) {
      console.log("ws where is sessionToken")
      throw new Error('LoginFirst')
      next(new Error('LoginFirst'))
      return
    }
    if (!fs.existsSync(sessionsFilePath)) {
      console.log('ws sessions file is empty')
      throw new Error('LoginFirst')
      next(new Error('InvalidToken'))
      return
    }
    let sessions = JSON.parse(fs.readFileSync(sessionsFilePath))
    if (!sessions[sessionToken]) {
      console.log('ws token doesn exist')
      throw new Error('LoginFirst')
      next(new Error('InvalidToken'))
      return
    }
    if (Date.now() > sessions[sessionToken].expiredTime) {
      console.log('ws expired')
      throw new Error('LoginFirst')
      next(new Error('InvalidToken'))
      return
    }
    await next()
  }
}

module.exports = AuthMiddleware
