<script>
import socket from './utils/socket'

export default {
  data: () => ({
    message: 'important message',
  }),
  methods: {
    async initSocket() {
      const waitConnection = () => new Promise((resolve, reject) => {
        let time = 0
        const interval = setInterval(() => {
          if (socket.isConnected()) {
            clearInterval(interval)
            resolve(true)
          } else {
            time += 100
            if (time >= 10000) {
              clearInterval(interval)
              reject(Error('Timeout error with connecting to the server socker'))
            }
          }
        }, 100)
      })
      await socket.init()
      await waitConnection()
    },
  },
  async mounted() {
    if (this.$store.state.app.user.username) {
      await this.initSocket()
    }
    const ejectxInstanceNameRegex = /^(.*?)\.ejectx\.de/
    const match = window.location.hostname.match(ejectxInstanceNameRegex)
    if (match && match.length > 1) {
      const ejectxInstanceName = match[1]
      window.document.title = `${window.document.title}${ejectxInstanceName}`
    }
  },
  watch: {
    // eslint-disable-next-line func-names
    '$store.state.app.user': async function () {
      if (this.$store.state.app.user.username) {
        await this.initSocket()
      }
    },
  },
}
</script>

<template>
  <div class="maxheight" id="app-content" tabindex="-1">
    <router-view>
    </router-view>
  </div>
</template>

<style lang="scss">
  html, body, .maxheight {
    height: 100%;
    font-family: Arial ;
  }

  .unclickable {
    cursor: default;
  }
  .clickable {
    cursor: pointer !important;
  }
</style>
