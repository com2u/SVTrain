const Env = use('Env')
const staticServer = require('static-server')

module.exports = class Watcher {
  constructor() {
    this.server = new staticServer({
      rootPath: Env.get('ROOT_PATH'),
      port: Env.get('STATIC_SERVER_PORT', 2929),
      host: Env.get('STATIC_SERVER_HOST', 'localhost'),
      cors: '*'
    })
  }

  init() {
    this.server.start(() => {
      console.log(`Static server started`)
    })
  }
}