<script>
import socket from './utils/socket';

export default {
  data: () => ({
    message: 'important message',
  }),
  async beforeCreate() {
    const waitConnection = () => new Promise((resolve, reject) => {
      let time = 0;
      const interval = setInterval(() => {
        if (socket.isConnected()) {
          clearInterval(interval);
          resolve(true);
        } else {
          time += 100;
          if (time >= 10000) {
            clearInterval(interval);
            reject(Error('Timeout error with connecting to the server socker'));
          }
        }
      }, 100);
    });
    socket.init();
    await waitConnection();
  },
};
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

  .unclickable {
    cursor: default;
  }
  .clickable {
    cursor: pointer !important;
  }
</style>
