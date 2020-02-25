<template>
  <div class="app">
    <Header/>
    <div class="app-container">
      <router-view/>
      <notifications/>
    </div>
  </div>
</template>

<script>
  import api from '../api'
  import Header from "../components/Header.vue"
  import EventBus from "../eventbus";

  export default {
    name: 'LoggedInLayout',
    components: {Header},
    created() {
      let sessionToken = localStorage.getItem('sessionToken', null)
      if (!sessionToken) {
        this.$router.push({name: 'LoginPage'})
      } else {
        api.setSessionToken(sessionToken)
        api.getConfig()
          .then(data => {
            console.log('Config: ', data)
            this.$store.dispatch('app/setConfig', data)
            this.$store.dispatch('app/setUser', data.user)
          })

      }
    },
    mounted() {
      EventBus.$on('auth_api_error', this.handleApiError)
    },
    destroyed() {
      EventBus.$off('auth_api_error')
    },
    methods: {
      handleApiError(err) {
        console.log('handleApiError', err)
        let message = 'Error'
        if (err && err.response && err.response.data && err.response.data.error) {
          message = err.response.data.error.message
        } else if (err) {
          message = err.toString()
        }
        this.$notify({
          type: 'error',
          text: message
        });
      }
    }
  }
</script>
<style lang="scss">
.app {
  background: #fafafa;

  .app-container {
    /*background: #fff;*/
    margin: 50px 60px;
  }
  .title-container {
    display: flex;
    justify-content: space-between;
    padding-bottom: 20px;
  }
}
</style>
