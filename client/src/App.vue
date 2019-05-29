<script>
import socket from './socket'

export default {
  data: () => ({
    message: 'important message'
  }),
  async beforeCreate () {
    await socket.init()
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
