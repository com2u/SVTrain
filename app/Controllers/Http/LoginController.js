const fs = require('fs')
const path = require('path')
const usersFilePath = path.join(__dirname, '../../../users.json')
const sessionsFilePath = path.join(__dirname, '../../../sessions.json')
const bcrypt = require('bcrypt')
const uuid4 = require('uuid4')
const logger = require('../../../logger');

const { promisify } = require("util")
const exists = promisify(fs.exists)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

class LoginController {
  async login ({ request, response }) {
    const { login, password } = request.post()
    if (!await exists(usersFilePath)) {
      response.unauthorized('Invalid password or login')
      return
    }
    const users = JSON.parse(await readFile(usersFilePath))

    if (!users[login]) {
      response.unauthorized('Invalid password or login')
      return
    }
    const match = await bcrypt.compare(password, users[login].passwordHash);
    if (!match) {
      response.unauthorized('Invalid password or login')
      return
    }
    logger.info(`User ${login} has logon`);
    return { login, sessionToken: await newSession(login) }
  }

  async logout({request, response}) {
    const sessionToken = request.header('Authorization') || request.get().sessionToken
    const f = await readFile(sessionsFilePath);
    let sessions = JSON.parse(f.toString());
    if (sessionToken && sessions && sessions[sessionToken]) {
      delete sessions[sessionToken]
      await writeFile(sessionsFilePath, JSON.stringify(sessions, null, 4))
    }
    return true
  }
}

async function newSession (login) {
  let uuid = uuid4()
  let sessions = {}
  if (await exists(sessionsFilePath)) {
    sessions = JSON.parse(await readFile(sessionsFilePath))
    // delete expired sessions
    Object.keys(sessions).forEach(suid => {
      if (typeof sessions[suid].expiredTime !== 'number') {
        delete sessions[suid]
        return
      }
      if (Date.now() > sessions[suid].expiredTime) {
        delete sessions[suid]
        return
      }
    })
  }
  let expiredTime = Date.now() + 24 * 60 * 60 * 1000
  sessions[uuid] = {
    login,
    expiredTime
  }
  await writeFile(sessionsFilePath, JSON.stringify(sessions, null, 4))
  return uuid
}

module.exports = LoginController
