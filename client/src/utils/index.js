export const get = (obj, path, defaultValue) => {
  const travel = (regexp) => String.prototype.split
    .call(path, regexp)
    .filter(Boolean)
    .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj)
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/)
  return result === undefined || result === obj ? defaultValue : result
}


export const updateCounting = (folders, statistics) => {
  const res = folders.slice()
  res.forEach((file, i) => {
    if (Object.keys(statistics)
      .includes(file.path)) {
      res[i].classified = statistics[file.path].classified
      res[i].unclassified = statistics[file.path].unclassified
      if (file.subFolders && file.subFolders.length) {
        res[i].subFolders = updateCounting(file.subFolders, statistics)
      }
    }
  })
  return res
}

export const getToken = () => localStorage.getItem('sessionToken', null)

export const isProduction = () => (process.env.NODE_ENV || 'production') === 'production'

export const getFileServerPath = () => (isProduction() ? `https://images.${window.location.hostname}/` : `http://${window.location.hostname}:2929/`)
