<template>
  <div class="app">
    <Header class="page-header"/>
    <div class="app-container" :class="showHeader ? 'show-header' : ''">
      <router-view class="wrapper"/>
      <notifications/>
      <b-modal
        v-model="statisticVisible"
        size="xl"
        cancel-title="Close"
        footer-class="statistic-footer"
      >
        <template v-slot:modal-title>Statistic</template>
        <statistic-popup ref="statistic"/>

      </b-modal>
    </div>
    <page-footer/>
  </div>
</template>

<script>
import {
  mapGetters,
} from 'vuex'
import Header from '../components/Header.vue'
import EventBus from '../utils/eventbus'
import PageFooter from '../components/PageFooter.vue'
import StatisticPopup from '../components/StatisticPopup.vue'

const ERROR_DISPLAY_DURATION = 10000

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
    }
  },
  computed: {
    ...mapGetters(['showHeader']),
  },
  mounted() {
    EventBus.$on('auth_api_error', this.handleApiError)
    EventBus.$on('notify-error', this.handleErrorMessage)
    EventBus.$on('login', this.handleLogin)
    EventBus.$on('show-statistic', this.showStatistic)
    EventBus.$on('statistic-folder-selected', this.selectFolder)
  },
  destroyed() {
    EventBus.$off('auth_api_error')
    EventBus.$off('notify-error')
    EventBus.$off('login')
    EventBus.$off('show-statistic')
    EventBus.$off('statistic-folder-selected')
  },
  methods: {
    showStatistic(dir) {
      this.statisticVisible = true
      this.$nextTick(() => {
        if (this.$refs.statistic) {
          this.$refs.statistic.open(dir)
        }
      })
    },
    handleApiError(err) {
      let message = 'Error'
      if (err && err.response && err.response.data && err.response.data.error) {
        message = err.response.data.error.message
      } else if (err) {
        message = err.toString()
      }
      this.$notify({
        type: 'error',
        text: message,
        duration: ERROR_DISPLAY_DURATION,
      })
    },
    handleErrorMessage(message) {
      this.$notify({
        type: 'error',
        text: message,
        duration: ERROR_DISPLAY_DURATION,
      })
    },

    handleLogin() {
      this.$notify({
        type: 'error',
        text: 'You need to login first',
        duration: ERROR_DISPLAY_DURATION,
      })
      this.$router.push({
        name: 'LoginPage',
      })
    },
    selectFolder(item) {
      this.statisticVisible = false
      const gotoDir = item.folder
      this.$router.push({
        name: 'explorer',
        query: {
          dir: gotoDir,
        },
      })
    },
  },
}
</script>
<style lang="scss">
.app {
  background: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;

  .app-container {
    flex: 1;
    /*background: #fff;*/
    margin: 0 60px;
    /*margin-bottom: 50px;*/
    position: relative;

    .wrapper {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: -.5rem;
      overflow: auto;
      padding-right: .5rem;
    }

    &.show-header {
    }
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

    .btn-stop-command {
      background: #D9D4CF !important;
      border: 1px solid #D9D4CF !important;
      color: #000 !important;
    }

    .btn-command {
      background: #0060FF !important;
      border: 1px solid #0060FF !important;
      color: #fff;
    }

    .svtrain-cmd-btn {
      width: 200px;
      text-align: left;
    }
  }

}

.statistic-footer {
  .btn-secondary {
    color: #000;
    background: #D9D4CF;
    border: 1px solid #D9D4CF;

    &:hover, &:focus, &:active {
      background: #D9D4CF !important;
      color: #000 !important;
    }
  }
}
</style>
