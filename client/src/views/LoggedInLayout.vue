<template>
  <div class="app">
    <Header/>
    <div class="app-container">
      <router-view/>
      <notifications/>
    </div>
    <page-footer/>
  </div>
</template>

<script>
import api from '../utils/api';
import Header from '../components/Header.vue';
import EventBus from '../utils/eventbus';
import PageFooter from '../components/PageFooter.vue';

export default {
  name: 'LoggedInLayout',
  components: { Header, PageFooter },
  created() {
    const sessionToken = localStorage.getItem('sessionToken', null);
    if (!sessionToken) {
      this.$router.push({ name: 'LoginPage' });
    } else {
      api.setSessionToken(sessionToken);
      api.getConfig()
        .then((data) => {
          console.log('Config: ', data);
          this.$store.dispatch('app/setConfig', data);
          this.$store.dispatch('app/setUser', data.user);
        });
    }
  },
  mounted() {
    EventBus.$on('auth_api_error', this.handleApiError);
    EventBus.$on('login', this.handleLogin);
  },
  destroyed() {
    EventBus.$off('auth_api_error');
    EventBus.$off('login');
  },
  methods: {
    handleApiError(err) {
      let message = 'Error';
      if (err && err.response && err.response.data && err.response.data.error) {
        message = err.response.data.error.message;
      } else if (err) {
        message = err.toString();
      }
      this.$notify({
        type: 'error',
        text: message,
      });
    },
    handleLogin() {
      this.$notify({
        type: 'error',
        text: 'You need to login first',
      });
      this.$router.push({ name: 'LoginPage' });
    },
  },
};
</script>
<style lang="scss">
.app {
  background: #fff;

  .app-container {
    /*background: #fff;*/
    margin: 50px 60px;
    /*margin-bottom: 50px;*/
  }
  .title-container {
    display: flex;
    justify-content: space-between;
    padding-bottom: 20px;
  }
}
</style>
