const fs = require('fs')
const { promisify } = require("util")
const axios = require("axios")
const readFile = promisify(fs.readFile)
const exists = promisify(fs.exists)
const path = require('path')
const sessionsFilePath = path.join(__dirname, '../../sessions.json')
const {getRoles} = require('../utils')

const KEYCLOAK_URI = process.env.KEYCLOAK_URI

class AuthMiddleware {
  async handle({request, response}, next, properties) {
    let sessionToken = request.header('Authorization') || request.get().sessionToken;
    if (!sessionToken) {
      let {token} = request.get()
      sessionToken = token;
    }
    if (sessionToken) {
      let user = await axios.get(
        `${KEYCLOAK_URI}/userinfo`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${sessionToken}`
          }
        }
      ).then(res => res.data).catch(() => {
        return null
      })
      if (user) {
        const role = user["roles"].length ? user["roles"][0] : null
        if (role) {
          const permissions = getRoles()[role]
          if (properties.length) {
            for (const permission of properties) {
              response.unauthorized('PermissionDenied')
              return
            }
          }
          request.currentUser = {
            username: user["preferred_username"],
            role,
            permissions
          }
          await next()
          return
        }
      }
    }
    response.unauthorized('LoginFirst')
  }

  async wsHandle({request, response}, next) {
    let {sessionToken} = request.get()
    if (!sessionToken) {
      throw new Error('LoginFirst')
    } else {
      let user = await axios.get(
        `${KEYCLOAK_URI}/userinfo`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${sessionToken}`
          }
        }
      ).then(res => res.data).catch(() => {
        return null
      })
      if (!user) {
        throw new Error('LoginFirst')
      }
    }
  }
}

module.exports = AuthMiddleware
