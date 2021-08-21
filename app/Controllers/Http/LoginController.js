const fs = require('fs')
const path = require('path')
const usersFilePath = path.join(__dirname, '../../../users.json')
const sessionsFilePath = path.join(__dirname, '../../../sessions.json')
const bcrypt = require('bcrypt')
const uuid4 = require('uuid4')
const logger = require('../../../logger')
const axios = require("axios")
const {promisify} = require("util")
const exists = promisify(fs.exists)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const KEYCLOAK_URI = process.env.KEYCLOAK_URI
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET

class LoginController {
  async login({request, response}) {
    const {login, password} = request.post()
    const params = new URLSearchParams()
    params.append('client_id', KEYCLOAK_CLIENT_ID)
    params.append('grant_type', 'password')
    params.append('client_secret', KEYCLOAK_CLIENT_SECRET)
    params.append('scope', 'openid')
    params.append('username', login)
    params.append('password', password)
    let data = await axios.post(
      `${KEYCLOAK_URI}/token`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    ).then(res => res.data).catch(e => {
      console.log(e.message);
      return null
    })
    if (data) {
      logger.info(`User ${login} has logon`);
      return {login, sessionToken: data.access_token}
    } else {
      response.unauthorized('Invalid password or login')
    }
  }

  async logout({request, response}) {
    const sessionToken = request.header('Authorization') || request.get().sessionToken
    const params = new URLSearchParams()
    params.append('client_id', KEYCLOAK_CLIENT_ID)
    params.append('client_secret', KEYCLOAK_CLIENT_ID)
    await axios.post(
      `${KEYCLOAK_URI}/logout`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${sessionToken}`
        }
      }
    ).then(res => res.data).catch( e => {
      console.log(e.message);
    })
  }
}

async function newSession(login) {
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
