export const get = (obj, path, defaultValue) => {
  const travel = (regexp) => String.prototype.split
    .call(path, regexp)
    .filter(Boolean)
    .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj)
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/)
  return result === undefined || result === obj ? defaultValue : result
}

export const isProduction = () => (process.env.NODE_ENV || 'production') === 'production'

const productionUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`
const developmentUrl = 'http://localhost:3333'

const allowedFileExtensions = ['.bmp', '.png', '.tiff', '.jpg']
export const isFileExtensionAllowed = (extension) => {
  allowedFileExtensions.includes(`.${extension}`)
}

export const getAPIRoot = () => (`${isProduction() ? productionUrl : developmentUrl}/api`)

export const getFileServerPath = () => (isProduction() ? `${productionUrl}/data/` : `${developmentUrl}/api/data/`)

export function getSocketProtocol() {
  return window.location.hostname === 'localhost' ? 'ws://' : 'wss://'
}

export function getSocketUrl() {
  const url = `//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/api`
  return getSocketProtocol() + url
}
