<script>
import socket from './socket'

export default {
  data: () => ({
    message: 'important message'
  }),
  async beforeCreate () {
    const waitConnection = () => new Promise(resolve => {
      let time = 0
      const interval = setInterval(() => {
        if (socket.isConnected()) {
          clearInterval(interval)
          resolve(true)
        } else {
          time += 100
          if (time >= 10000) {
            clearInterval(interval)
            reject('Timeout error with connecting to the server socker')
          }
        }
      }, 100)
    })
    socket.init()
    await waitConnection()
  }
}
</script>


<template>
  <div class="maxheight">
    <router-view>
    </router-view>
  </div>
</template>

<style lang="scss">
html, body, .maxheight {
  height: 100%;
}
</style>
