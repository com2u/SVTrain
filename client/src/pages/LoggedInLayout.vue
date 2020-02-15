<template>
  <div class="app">
    <Header/>
    <div class="app-container">
      <router-view/>
    </div>
  </div>
</template>

<script>
  import api from '../api'
  import Header from "../components/Header.vue"

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
            this.$store.dispatch('app/setConfig', data)
            this.$store.dispatch('app/setUser', data.user)
          })

      }
    }
  }
</script>
<style lang="scss" scoped>
.app {
  background: #fafafa;

  .app-container {
    /*background: #fff;*/
    margin: 50px 60px;
  }
}
</style>
