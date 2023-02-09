const axios = require('axios')
const { getRoles } = require('../utils')
const { path, find, compose, flip, curryN } = require('ramda')
const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')
const logger = require('../../logger')

const cache = {}
const KEYCLOAK_URI = process.env.KEYCLOAK_URI

class AuthMiddleware {
  async handle({ request, response }, next, properties) {
    let sessionToken =
      request.header('Authorization') || request.get().sessionToken
    if (!sessionToken) {
      let { token } = request.get()
      sessionToken = token
    }
    if (sessionToken) {
      let user

      try {
        user = await verifyOffline(sessionToken)
      } catch (e) {}
      if (!user) {
        user = await axios
          .get(`${KEYCLOAK_URI}/userinfo`, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Bearer ${sessionToken}`,
            },
          })
          .then((res) => res.data)
          .catch(() => {
            return null
          })
      }
      if (user) {
        const { exp } = user
        if (exp * 1000 < new Date().getTime()) {
          response.status(401).send('Session expired')
          return
        }
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
      }
    }
    response.unauthorized('LoginFirst')
  }

  async wsHandle({ request, response }, next) {
    let { sessionToken } = request.get()
    if (!sessionToken) {
      throw new Error('LoginFirst')
    } else {
      let user = await axios
        .get(`${KEYCLOAK_URI}/userinfo`, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${sessionToken}`,
          },
        })
        .then((res) => res.data)
        .catch(() => {
          return null
        })
      if (!user) {
        throw new Error('LoginFirst')
      }
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

const verifyOffline = async (accessToken, ...options) => {
  return fetchPublicKeys(...options).then(getUserFromJWK(accessToken))
}

module.exports = AuthMiddleware
