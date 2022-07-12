import { isProduction } from '@/utils/index'
import 'babel-polyfill'
import Ws from '@adonisjs/websocket-client'

export default {
  async init() {
    return new Promise((resolve, reject) => {
      this.ws = Ws(isProduction() ? '' : 'ws://127.0.0.1:3333', { query: { sessionToken: localStorage.getItem('sessionToken') } })
      this.ws.connect()
      this.ws.on('open', () => {
        console.log('Connect opened')
        this.explorer = this.ws.subscribe('explorer')
        this.listeners = {}
        this.explorer.on('ready', () => {
          console.log('Connected to channel explorer')
          resolve()
        })
        this.explorer.on('error', (error) => {
          console.log('error on explorer: ', error)
          reject()
        })
      })
      this.ws.on('close', () => {
        console.log('Connect close')
      })
      this.ws.on('error', (error) => {
        console.log('ws error: ', error)
        reject(error)
      })
    })
  },

  subscibeForFolder(path, callback) {
    if (this.explorer) {
      this.explorer.emit('subscribeForFolder', { path })
      this.explorer.on(`folder_${path}`, callback)
    }
    if (this.listeners) {
      this.listeners[path] = callback
    }
  },

  subscribe(channel, callback) {
    if (this.explorer) {
      this.explorer.on(channel, callback)
    }
    if (this.listeners) {
      this.listeners[channel] = callback
    }
  },

  unsubscribe(channel, callback) {
    if (this.explorer) {
      this.explorer.off(channel, callback)
    }
    if (this.listeners) {
      delete this.listeners[channel]
    }
  },

  unsubscribeForFolder(path) {
    if (this.listeners[path]) {
      try {
        this.explorer.off(`folder_${path}`, this.listeners[path])
      } catch (e) {
        console.log('error on adonis ws client: ', e)
      }
      if (this.listeners) {
        delete this.listeners[path]
      }
    }
  },

  isConnected() {
    return this.isConnected
  },
}
