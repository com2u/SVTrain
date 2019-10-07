<template>
  <div class="container-fluid">
    <h2>SVTrain V0.4</h2>
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
        Set the workspace:
        <b-button v-for="folder in subfolders" v-bind:key="folder" variant="link" v-on:click="setWorkspace(folder)">
          {{ folder }}
        </b-button>
      </li>

      <li>
        <b-button
          variant="primary"
          v-on:click="$router.push('explorer')">
          <v-icon name="folder-open"/> Train data
        </b-button>
      </li>

      <li>
        <b-button
          variant="primary"
          v-bind:disabled="isLoading.statistic"
          v-on:click="calculateStatistic()">
          <v-icon name="calculator"/> Calculate statistic
        </b-button>
        <span v-if="isLoading.statistic">Calculating...</span>
      </li>

      <li v-for="command in commands" v-bind:key="command">
        <b-button
          v-bind:variant="command === 'stop' ? 'danger' : 'success'"
          v-bind:disabled="!!isLoading[command] || command === 'stop' && !running || command !== 'stop' && !!running"
          v-on:click="runCommand(command)">
          <v-icon v-bind:name="command === 'stop' ? 'stop' : 'play'"/> Run {{command}}.bat
        </b-button>
        <span v-if="isLoading[command]">Running...</span>
        <span
          v-if="logs[command] && logs[command].lastLine"
          class="log-line"
          @click="openLogsFor(command)">
            {{ logs[command].lastLine }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
import api from '../api'
import socket from './../socket.js'

export default {
  data: () => ({
    isLoading: {
      statistic: false,
      train: false,
      test: false,
      validate: false,
      export: false,
      stop: false,
      ExportImages: false
    },
    subfolders: [],
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
      'stop'
    ]
  }),
  methods: {
    checkStatus: async function () {
      const runstatus = await api.getRunningState()
      this.running = runstatus
      console.log(`Running status:`, runstatus)
    },
    async checkWorkspace () {
      const workspace = await api.getWorkspace()
      this.workspace = workspace
      console.log(`Workspace: ${this.workspace}`)
    },
    runCommand: async function (command) {
      this.isLoading[command] = true
      try {
        await api.runCommand(command)
        await this.checkStatus()
      } catch(e) {
        alert('An error occurred!')
      }
      this.isLoading[command] = false
      console.log(`Command ${command} executed`)
    },
    calculateStatistic: async function () {
      this.isLoading.statistic = true
      try { await api.calculateStatistic() }
      catch (e) { alert('An error occurred!') }
      this.isLoading.statistic = false
      console.log(`Calculate statistic process started`)
    },
    async setWorkspace (folder) {
      await api.setWorkspace(folder)
      
    },
    openLogsFor(command) {
      window.open(`/logs/${command}`)
    }
  },
  created: async function () {
    this.checkStatus()
    this.checkWorkspace()
    this.logs = await api.getLastLogs()
    this.subfolders = await api.getSubfolders('root')
    socket.subscibeForFolder('running.lock', data => {
      console.log('running.lock: ', data)
      if (data.event === 'unlink') this.running = false
      if (data.event === 'change') this.running = data.content
    })
    socket.subscibeForFolder('workspace.bat', data => {
      console.log('workspace.bat: ', data)
      if (data.event === 'unlink') this.workspace = false
      if (data.event === 'change') this.workspace = data.content
    })

    socket.subscribe('logfile', (obj) => {
      Object.keys(this.logs).forEach(fileName => {
        if (this.logs[fileName].path === obj.pathname) {
          this.logs[fileName].lastLine = obj.lastLine
        }
      })
    })
  },
  beforeDestroy: async function () {
    socket.unsubscribeForFolder('running.lock')
    socket.unsubscribeForFolder('workspace.bat')
  }
}
</script>

<style lang="scss" scoped>
.main-menu {
  list-style: none;
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


