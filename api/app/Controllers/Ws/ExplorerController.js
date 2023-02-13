'use strict'

const Watcher = use('Watcher')
const uuidv4 = require('uuid').v4

class ExplorerController {
  constructor ({ socket, request }) {
    const {sessionToken} = request.get()
    this.socket = socket
    this.request = request
    this.id = sessionToken || uuidv4()

    this.socket.on('close', () => {
      Watcher.deleteSocket(this.id)
    })
    this.socket.on('error', () => {
      Watcher.deleteSocket(this.id)
    })
  }

  onSubscribeForFolder({ path }) {
    Watcher.subscribeForFolder(path, this.id, this.socket)
  }
}

module.exports = ExplorerController
