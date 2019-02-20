'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class AppProvider extends ServiceProvider {

  _registerStatistic() {
    this.app.singleton('Statistic', () => {
      const Statistic = require('../src/Statistic/')
      return new Statistic()
    })
  }

  _registerWatcher() {
    this.app.singleton('Watcher', () => {
      const Statistic = require('../src/Watcher/')
      return new Statistic()
    })
  }
  _registerStaticServer() {
    this.app.singleton('StaticServer', () => {
      const StaticServer = require('../src/StaticServer/')
      return new StaticServer()
    })
  }

  register () {
    this._registerStatistic()
    this._registerWatcher()
    this._registerStaticServer()
  }

  async boot () {
    await use('Statistic').init()
    use('Watcher').init()
    use('StaticServer').init()
  }
}

module.exports = AppProvider
