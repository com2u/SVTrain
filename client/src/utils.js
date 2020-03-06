export const get = (obj, path, defaultValue) => {
  const travel = regexp =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
};


export const updateCounting = (folders, statistics) => {
  const res = folders.slice()
  res.forEach(f => {
    if (Object.keys(statistics).includes(f.path)) {
      f.classified = statistics[f.path].classified;
      f.unclassified = statistics[f.path].unclassified;
      if (f.subFolders && f.subFolders.length) {
        f.subFolders = updateCounting(f.subFolders, statistics)
      }
    }
  })
  return res
}
