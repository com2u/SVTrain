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

  register () {
    this._registerStatistic()
    this._registerWatcher()
  }

  async boot () {
    await use('Statistic').init()
    await use('Watcher').init()
  }
}

module.exports = AppProvider
