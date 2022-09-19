const fs = require('fs')
const path = require('path')
const { promisify: promisifyUtil } = require('util')
const exists = promisifyUtil(fs.exists)
const readFile = promisifyUtil(fs.readFile)
const deleteFile = promisifyUtil(fs.unlink)
const Env = use('Env')

const ROOT_PATH = Env.get('ROOT_PATH')
module.exports = class Statistic {
  constructor() {
    this.filename = '.statistics'
  }

  async get(_path) {
    const folderPath = path.isAbsolute(_path)
      ? _path
      : path.join(ROOT_PATH, _path)
    try {
      return (await exists(path.join(folderPath, this.filename)))
        ? JSON.parse(await readFile(path.join(folderPath, this.filename)))
        : { calculated: false }
    } catch {
      deleteFile(path.join(folderPath, this.filename))
      // delete workspace cache
      const wsPath = folderPath.replace(ROOT_PATH, '').split('/')[1]
      deleteFile(path.join(ROOT_PATH, wsPath, '/.cache'))
      return { calculated: false }
    }
  }

  async getList(dirs) {
    const res = {}
    for (const dir of dirs) {
      res[dir] = (await exists(path.join(ROOT_PATH, dir, this.filename)))
        ? JSON.parse(await readFile(path.join(ROOT_PATH, dir, this.filename)))
        : { calculated: false }
    }
    return res
  }
}
