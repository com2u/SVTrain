<template>
  <router-view />
</template>

<script>
import api from '../api'

export default {
  name: 'LoggedInLayout',
  created () {
    let sessionToken = localStorage.getItem('sessionToken', null)
    if (!sessionToken) {
      this.$router.push({ name: 'LoginPage' })
    } else {
      api.setSessionToken(sessionToken)
    }
  }
}
</script>