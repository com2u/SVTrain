<template>
  <div class="container-fluid">
    <div class="title-container">
      <div></div>
      <div>
        <b-button variant="dark" @click="gotoWorkspace">Workspace List</b-button>
      </div>
    </div>
    <ul class="main-menu">
      <li>
        Running status:
        <template v-if="running !== null">
          {{ running ? `${running}%` : 'idle' }}
        </template>
        <template v-else>
          no info
        </template>
      </li>

      <li>
        Workspace:
        <template v-if="workspace !== null">
          {{ workspace }}
        </template>
        <template v-else>
          no info
        </template>
      </li>

      <li>
        <b-button
          variant="primary"
          v-on:click="$router.push('explorer')">
          <v-icon name="folder-open"/>
          Train data
        </b-button>
      </li>

      <li>
        <b-button
          variant="primary"
          v-bind:disabled="isLoading.statistic"
          v-on:click="calculateStatistic()">
          <v-icon name="calculator"/>
          Calculate statistic
        </b-button>
        <span v-if="isLoading.statistic">Calculating...</span>
      </li>

      <li v-for="command in commands" v-bind:key="command">
        <b-button
          style="float: left"
          v-bind:variant="command === 'stop' ? 'danger' : 'success'"
          v-bind:disabled="!!isLoading[command] || command === 'stop' && !running || command !== 'stop' && !!running"
          v-on:click="runCommand(command)">
          <v-icon v-bind:name="command === 'stop' ? 'stop' : 'play'"/>
          Run {{command}}.bat
        </b-button>
        <span v-if="isLoading[command]">Running...</span>
        <pre
          style="padding-left: 10px"
          v-if="logs[command] && logs[command].lastLine"
          class="log-line"
          @click="openLogsFor(command)"
          v-html="logs[command].lastLine"/>
        <div style="clear: both"/>
      </li>
    </ul>
    <hr>

  </div>
</template>

<script>
import api from '../utils/api'
import socket from '../utils/socket.js'

export default {
  data: () => ({
    isLoading: {
      statistic: false,
      train: false,
      test: false,
      validate: false,
      export: false,
      stop: false,
      ExportImages: false,
    },
    running: null,
    workspace: null,
    checkInterval: 750,
    logs: {},
    commands: [
      'train',
      'test',
      'validate',
      'export',
      'ExportImages',
      'stop',
    ],
    sessionUser: '',
  }),
  methods: {
    async checkStatus() {
      const runstatus = await api.getRunningState()
      this.running = runstatus
      console.log('Running status:', runstatus)
    },
    async checkWorkspace() {
      this.workspace = await api.getWorkspace()
      console.log(`Workspace: ${this.workspace}`)
    },
    async runCommand(command) {
      this.isLoading[command] = true
      try {
        await api.runCommand(command)
        await this.checkStatus()
      } catch (e) {
        console.log(e)
        console.error('An error occurred!')
      }
      this.isLoading[command] = false
      console.log(`Command ${command} executed`)
    },
    async calculateStatistic() {
      this.isLoading.statistic = true
      try {
        await api.calculateStatistic()
      } catch (e) {
        console.log(e)
        console.error('An error occurred!')
      }
      this.isLoading.statistic = false
      console.log('Calculate statistic process started')
    },
    openLogsFor(command) {
      window.open(`/logs/${command}`)
    },
    logout() {
      this.$router.push({ name: 'LoginPage' })
    },
    gotoWorkspace() {
      this.$router.push({ name: 'WorkSpacePage' })
    },
  },
  async created() {
    this.sessionUser = localStorage.getItem('sessionUser')
    this.checkStatus()
    this.checkWorkspace()
    this.logs = await api.getLastLogs()
    socket.subscibeForFolder('running.lock', (data) => {
      console.log('running.lock: ', data)
      if (data.event === 'unlink') this.running = false
      if (data.event === 'change') this.running = data.content
    })
    socket.subscibeForFolder('workspace.bat', (data) => {
      console.log('workspace.bat: ', data)
      if (data.event === 'unlink') this.workspace = false
      if (data.event === 'change') this.workspace = data.content
    })

    socket.subscribe('logfile', (obj) => {
      obj.forEach((o) => {
        this.logs[o.file].lastLine = o.lastLine
      })
    })
  },
  async beforeDestroy() {
    socket.unsubscribeForFolder('running.lock')
    socket.unsubscribeForFolder('workspace.bat')
  },
}
</script>

<style lang="scss" scoped>
  .main-menu {
    list-style: none;
    background: #fff;

    li {
      margin-top: 10px;
      margin-bottom: 10px;
    }

    .alert {
      cursor: pointer;
    }

    .log-line {
      cursor: pointer;
      text-decoration: underline;

      &:hover {
        text-decoration: none;
      }
    }
  }
</style>
