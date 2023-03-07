export const get = (obj, path, defaultValue) => {
  const travel = (regexp) => String.prototype.split
    .call(path, regexp)
    .filter(Boolean)
    .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj)
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/)
  return result === undefined || result === obj ? defaultValue : result
}

export const getToken = () => localStorage.getItem('sessionToken', null)

export const isProduction = () => (process.env.NODE_ENV || 'production') === 'production'

export const getFileServerPath = () => `${window.location.protocol}//${window.location.hostname}${
  window.location.port
    ? `:${(process.env.NODE_ENV || 'production') === 'production' ? window.location.port : 3333}`
    : ''
}/data/`

const productionUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/api`
const developmentUrl = 'http://localhost:3333/api'

export const getAPIRoot = () => (isProduction() ? productionUrl : developmentUrl)

export function getSocketProtocol() {
  return window.location.hostname === 'localhost' ? 'ws://' : 'wss://'
}

export function getSocketUrl() {
  const url = `//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/api`
  return getSocketProtocol() + url
}
