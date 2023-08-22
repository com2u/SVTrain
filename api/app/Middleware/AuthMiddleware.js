const axios = require('axios')
const { getRoles } = require('../utils')
const { path, find, compose, flip, curryN } = require('ramda')
const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')
const logger = require('../../services/logger')

const cache = {}
const KEYCLOAK_URI = process.env.KEYCLOAK_URI


const mapUserInfo = (session) => {
  const mapped_session = {}
  try {
    mapped_session.preferred_username = session.user.preferred_username
    mapped_session.roles = session.user.roles
  } catch (e) {
    console.log(e)
  }
  return mapped_session
}

const verifyHeaderAndReturnUserSessionIfAvailable = (header) => {
  let userSession = {}
  try {
    const decoded = Buffer.from(header, 'base64')
    userSession = mapUserInfo(JSON.parse(decoded.toString('ascii')))
  } catch (e) {
    logger.error(`Unable to verify request header with error: ${e}`)
  }
  return userSession
}

class AuthMiddleware {
  async handle({ request, response }, next, properties) {
    try {
      logger.info(`Request type is ${request.method()}`)
      logger.info(`Request url is ${request.url()}`)
      const user = verifyHeaderAndReturnUserSessionIfAvailable(request.header('x-usersession'))
      const validRoles = Object.keys(getRoles())
      const role = user['roles']?.length ? user['roles'].filter(r => validRoles.includes(r)).slice(-1)[0] : null
      if (role) {
        const permissions = getRoles()[role]
        if (properties.length) {
          for (const permission of properties) {
            response.unauthorized('PermissionDenied')
            return
          }
        }
        request.currentUser = {
          username: user['preferred_username'],
          role,
          permissions,
        }
        await next()
        return
      }
      logger.error(`Missing role for user: ${user.preferred_username}`)

    } catch (e) {
      logger.error(`Unable to handle request with error: ${e}`)
      response.status(500).send('Internal Server Error')
    }
    response.status(401).send('Session not authorized')
  }

  async wsHandle({ request, response }, next) {
    const user = verifyHeaderAndReturnUserSessionIfAvailable(request.header('x-usersession'))
    if (!user) {
      response.status(401).send('Session not authorized')
    }
  }
}

const makeUser = ({
  sub,
  email_verified,
  name,
  preferred_username,
  given_name,
  family_name,
  email,
  roles,
  exp,
}) => ({
  sub,
  email_verified,
  name,
  preferred_username,
  given_name,
  family_name,
  email,
  roles,
  exp,
})

const verify = curryN(2)(jwt.verify)

const isTheRightKid = (kid) => (publicKey) => publicKey.kid === kid

const findPublicKeyFromKid = (publicKey) => (kid) =>
  find(isTheRightKid(kid))(publicKey)

const getKid = path(['header', 'kid'])

const decode = compose(curryN(2), flip)(jwt.decode)

const getUserFromPublicKey = (token) => compose(makeUser, verify(token))

const getUserFromJWK = (token) => (jwk) =>
  compose(
    getUserFromPublicKey(token),
    jwkToPem,
    findPublicKeyFromKid(jwk),
    getKid,
    decode({ complete: true }),
  )(token)

const fetchPublicKeys = (useCache = true) => {
  const url = `${KEYCLOAK_URI}/certs`
  const key = 'publicKey'
  if (useCache) {
    return cache[key]
      ? Promise.resolve(cache[key])
      : axios
          .get(url)
          .then(path(['data', 'keys']))
          .then((publicKey) => {
            cache[key] = publicKey
            return publicKey
          })
  } else {
    return axios.get(url).then(path(['data', 'keys']))
  }
}

module.exports = AuthMiddleware
