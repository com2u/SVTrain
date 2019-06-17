import Ws from '@adonisjs/websocket-client'

export default {
  init: async function () {
    return new Promise((resolve, reject) => {
      this.ws = Ws('ws://127.0.0.1:3333')
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
    this.explorer.emit('subscribeForFolder', { path })
    this.explorer.on(`folder_${path}`, callback)
    this.listeners[path] = callback
  },

  unsubscribeForFolder: function (path) {
    console.log(`Unsibscribe for folder ${path}`)
    try { this.explorer.off(`folder_${path}`, this.listeners[path]) }
    catch(e) { console.log('error on adonis ws client: ', e)}
    delete this.listeners[path]
  },

  isConnected: function () {
    return this.isConnected
  }
} 