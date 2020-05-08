<template>
  <div class="app">
    <Header/>
    <div class="app-container">
      <router-view/>
      <notifications/>

      <b-modal
        v-model="statisticVisible"
        size="xl"
        cancel-title="Close"
      >
        <template v-slot:modal-title>Statistic</template>
        <statistic-popup ref="statistic"/>

      </b-modal>
    </div>
    <page-footer/>
  </div>
</template>

<script>
import Header from '../components/Header.vue';
import EventBus from '../utils/eventbus';
import PageFooter from '../components/PageFooter.vue';
import StatisticPopup from '../components/StatisticPopup.vue';

export default {
  name: 'LoggedInLayout',
  components: {
    Header,
    PageFooter,
    StatisticPopup,
  },
  data() {
    return {
      statisticVisible: false,
    };
  },
  created() {
  },
  mounted() {
    EventBus.$on('auth_api_error', this.handleApiError);
    EventBus.$on('notify-error', this.handleErrorMessage);
    EventBus.$on('login', this.handleLogin);
    EventBus.$on('show-statistic', this.showStatistic);
    EventBus.$on('statistic-folder-selected', this.selectFolder);
  },
  destroyed() {
    EventBus.$off('auth_api_error');
    EventBus.$off('notify-error');
    EventBus.$off('login');
    EventBus.$off('show-statistic');
    EventBus.$off('statistic-folder-selected');
  },
  methods: {
    showStatistic(dir) {
      this.statisticVisible = true;
      this.$nextTick(() => {
        if (this.$refs.statistic) {
          this.$refs.statistic.open(dir);
        }
      });
    },
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
    handleErrorMessage(message) {
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
    selectFolder(item) {
      this.statisticVisible = false;
      const gotoDir = item.folder;
      this.$router.push({ name: 'explorer', query: { dir: gotoDir } });
    },
  },
};
</script>
<style lang="scss">
  .app {
    background: #fff;

    .app-container {
      /*background: #fff;*/
      margin: 60px 60px;
      /*margin-bottom: 50px;*/
    }

    .title-container {
      display: flex;
      justify-content: space-between;
      padding-bottom: 20px;
    }

    .cmd-main-menu {
      .cmd {
        padding-top: 10px;
      }
    }
  }
</style>
