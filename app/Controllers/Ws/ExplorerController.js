'use strict'

const Watcher = use('Watcher')
const uuidv4 = require('uuid').v4

class ExplorerController {
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request
    this.id = uuidv4()

    this.socket.on('close', () => {
      Watcher.deleteSocket(this.id)
      console.log(`Socket ${this.id} disconnected`)
    })
    this.socket.on('error', () => {
      Watcher.deleteSocket(this.id)
    })

    console.log(`Socket ${this.id} connected`)
  }

  onSubscribeForFolder({ path }) {
    console.log(`Subscribe socket ${this.id} for folder ${path}`)
    Watcher.subscribeForFolder(path, this.id, this.socket)
  }
}

module.exports = ExplorerController
