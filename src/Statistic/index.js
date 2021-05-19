const {promisify} = use('Helpers')
const fs = require('fs')
const path = require('path')
const { promisify : promisifyUtil } = require("util")
const exists = promisifyUtil(fs.exists)
const readFile = promisifyUtil(fs.readFile)
const writeFile = promisifyUtil(fs.writeFile)

module.exports = class Statistic {
  constructor() {
    this._path = path.join(__dirname, '../../', 'statistic.data')
    this._data = {}
  }

  async init() {
    if (!exists(this._path)) {
      console.log(this._path)
      console.log('Statistic file doesn\'t exist')
      return
    }

    let data = await readFile(this._path, 'utf8')
    try {
      data = JSON.parse(data)
    } catch (e) {
      console.log('Error occured when parse statistic data')
      console.log(e)
      return
    }

    this._data = data
  }

  get(path) {
    return this._data[path]
      ? this._data[path]
      : {
        calculated: false
      }
  }

  getList(dirs) {
    const res = {}
    for (const dir of dirs) {
      if (this._data[dir]) {
        res[dir] = this._data[dir]
      }
    }
    return res
  }

  async save() {
    const data = JSON.stringify(this._data, null, 2)
    return await writeFile(this._path, data, 'utf8')
  }

  write(path, {missed, matched, missmatched, table, unclassified, classified}) {
    this._data[path] = {
      calculated: true,
      missed,
      matched,
      missmatched,
      table,
      classified,
      unclassified
    }
  }
}
