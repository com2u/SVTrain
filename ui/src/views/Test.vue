<template>
  <div class="container-fluid">
    <b-row>
      <b-col cols="3">
      <div class="title-container">
        <div>
          <h4>SVTrain</h4>
        </div>
      </div>
      <div class="cmd-main-menu">
        <div>Workspace: <strong>{{ currentWs}}</strong></div>
        <div v-if="running !== null" v-html="running || 'idle'"></div>
        <b v-else>no info</b>
        <template v-for="command in commands">
          <div v-if="aiOptions[command.value]" :key="command.value" class="cmd">
            <b-button
              class="svtrain-cmd-btn"
              :class="command.value === 'script_stop_test' ? 'btn-stop-command' : 'btn-command'"
              v-bind:disabled="!!isLoading[command.value] || command.value === 'script_stop_test' && !running || command.value !== 'script_stop_test' && !!running"
              v-on:click="runCommand(command.value, workspace)">
              <v-icon v-bind:name="command.value === 'script_stop_test' ? 'stop' : 'play'"/>
              <span class="ml-2">{{command.label}}</span>
            </b-button>
            <span v-if="isLoading[command.value]">Running...</span>
            <pre
              style="padding-left: 10px; margin-top: 10px"
              v-if="logs[command.value] && logs[command.value].lastLine"
              class="log-line"
              @click="openLogsFor(command.value)"
              v-html="logs[command.value].lastLine"/>
            <div style="clear: both"/>
          </div>
        </template>
      </div>
    </b-col>
    <b-col cols="9" class="has-board">
        <b-tabs>
          <b-tab title="Logs" active>
            <pre v-html="testLog" class="logs"></pre>
          </b-tab>
        </b-tabs>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import command from '../mixins/command'
import api from '../utils/api'

export default {
  name: 'Test',
  mixins: [command],
  data() {
    return {
      commands: [
        {
          value: 'script_test',
          label: 'Run test batch',
        },
        {
          value: 'script_stop_test',
          label: 'Stop running test',
        },
        {
          value: 'script_test2',
          label: 'Prepare Data',
        },
      ],
      testLog: null,
      interval: null,
    }
  },
  methods: {
    async getLog() {
      await api.getLogFor('test').then((res) => {
        this.testLog = res
      })
    },
  },
  mounted() {
    api.refreshToken()
    this.getLog()
    this.interval = setInterval(this.getLog, 2000)
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
}
</script>

<style scoped>
.logs {
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
}
</style>
