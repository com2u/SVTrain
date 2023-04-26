'use strict'

import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { Statistic } from '../../api/services/Statistic'
import { Watcher } from '../../api/services/Watcher'
import { ExplorerController } from '../../api/app/Controllers/Http/ExplorerController'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  private _registerStatistic() {
    this.app.container.singleton('Statistic', () => {
      return new Statistic()
    })
  }

  private _registerWatcher() {
    this.app.container.singleton('Watcher', () => {
      return new Watcher()
    })
  }

  private _registerExplorerController() {
    this.app.container.singleton('ExplorerController', () => {
      return new ExplorerController()
    })
  }

  public register() {
    this._registerStatistic()
    this._registerWatcher()
    this._registerExplorerController()
  }

  public async boot() {
    await this.app.container.use('ExplorerController').init()
    await this.app.container.use('Watcher').init()
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}

module.exports = AppProvider
