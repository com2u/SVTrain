const fs = require('fs')
const path = require('path')
const usersFilePath = path.join(__dirname, '../../../users.json')
const sessionsFilePath = path.join(__dirname, '../../../sessions.json')
const passwordHash = require('password-hash')
const uuid4 = require('uuid4')

class LoginController {
  async login ({ request, response }) {
    const { login, password } = request.post()
    if (!fs.existsSync(usersFilePath)) {
      response.unauthorized('Invalid password or login')
      return
    }
    const users = JSON.parse(fs.readFileSync(usersFilePath))

    if (!users[login]) {
      response.unauthorized('Invalid password or login')
      return
    }

    if (!passwordHash.verify(password, users[login].passwordHash)) {
      response.unauthorized('Invalid password or login')
      return
    }

    return { login, sessionToken: newSession(login) }
  }
}

function newSession (login) {
  let uuid = uuid4()
  let sessions = {}
  if (fs.existsSync(sessionsFilePath)) {
    sessions = JSON.parse(fs.readFileSync(sessionsFilePath))
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
  fs.writeFileSync(sessionsFilePath, JSON.stringify(sessions, null, 4))
  return uuid
}

module.exports = LoginController
