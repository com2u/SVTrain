const { promisify } = use("Helpers");
const fs = require("fs");
const path = require("path");
const { promisify: promisifyUtil } = require("util");
const exists = promisifyUtil(fs.exists);
const readFile = promisifyUtil(fs.readFile);
const writeFile = promisifyUtil(fs.writeFile);
const Env = use("Env");

const ROOT_PATH = Env.get("ROOT_PATH");
module.exports = class Statistic {
  constructor() {
    this.filename = ".statistics";
  }

  async get(_path) {
    try {
      return (await exists(
        path.isAbsolute(_path)
          ? path.join(_path, this.filename)
          : path.join(ROOT_PATH, _path, this.filename)
      ))
        ? JSON.parse(
            await readFile(
              path.isAbsolute(_path)
                ? path.join(_path, this.filename)
                : path.join(ROOT_PATH, _path, this.filename)
            )
          )
        : { calculated: false };
    } catch {
      return { calculated: false };
    }
  }

  async getList(dirs) {
    const res = {};
    for (const dir of dirs) {
      res[dir] = (await exists(path.join(ROOT_PATH, dir, this.filename)))
        ? JSON.parse(await readFile(path.join(ROOT_PATH, dir, this.filename)))
        : { calculated: false };
    }
    return res;
  }
};
