'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

class AppProvider extends ServiceProvider {

  _registerStatistic() {
    this.app.singleton('Statistic', () => {
      const Statistic = require('../services/Statistic/')
      return new Statistic()
    })
  }

  _registerWatcher() {
    this.app.singleton('Watcher', () => {
      const Statistic = require('../services/Watcher/')
      return new Statistic()
    })
  }

  _registerExplorerController() {
    this.app.singleton('ExplorerController', () => {
      const ExplorerController = require('../app/Controllers/Http/ExplorerController')
      return new ExplorerController()
    })
  }

  register () {
    this._registerStatistic()
    this._registerWatcher()
    this._registerExplorerController()
  }

  async boot () {
    await use('ExplorerController').init()
    await use('Watcher').init()
  }
}

module.exports = AppProvider
