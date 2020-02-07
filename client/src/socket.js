import Ws from '@adonisjs/websocket-client'

export default {
  init: async function () {
    return new Promise((resolve, reject) => {
      this.ws = Ws(null, { query: { sessionToken: localStorage.getItem('sessionToken') }})
      this.ws.connect()
      this.ws.on('open', () => {
        console.log('Connect open')
        this.explorer = this.ws.subscribe('explorer')
        this.listeners = {}
        this.explorer.on('ready', () => {
          console.log(`Connected to channel explorer`)
          resolve()
        })
        this.explorer.on('error', error => {
          console.log('error on explorer: ', error)
          reject()
        })
      })
      this.ws.on('close', () => {
        console.log('Connect close')
      })
      this.ws.on('error', error => {
        console.log('ws error: ', error)
        reject(error)
      })

    })
  },

  subscibeForFolder: function (path, callback) {
    console.log(`Subcribe for folder ${path}`)
    if (this.explorer) {
      this.explorer.emit('subscribeForFolder', { path })
      this.explorer.on(`folder_${path}`, callback)
    }
    if (this.listeners) {
      this.listeners[path] = callback
    }
  },

  subscribe (channel, callback) {
    this.explorer.on(channel, callback)
    this.listeners[channel] = callback
  },
  unsubscribe (channel, callback) {
    this.explorer.off(channel, callback)
    delete this.listeners[channel]
  },

  unsubscribeForFolder: function (path) {
    console.log(`Unsibscribe for folder ${path}`)
    try { this.explorer.off(`folder_${path}`, this.listeners[path]) }
    catch(e) { console.log('error on adonis ws client: ', e)}
    if (this.listeners) {
      delete this.listeners[path]
    }
  },

  isConnected: function () {
    return this.isConnected
  }
}
