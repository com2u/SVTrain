<template>
  <div>
    <h2>SVTrain V0.1</h2>
    <ul>
      <li>
        Running status:
        <template v-if="typeof running === 'boolean'">
          {{ running ? 'running' : 'idle' }}
        </template>
        <template v-else>
          no info
        </template>
      </li>

      <li>
        <button
          v-on:click="$router.push('explorer')">
          Train data
        </button>
      </li>

      <li>
        <button
          v-bind:disabled="isLoading.statistic"
          v-on:click="calculateStatistic()">
          Calculate statistic
        </button>
        <span v-if="isLoading.statistic">Calculating...</span>
      </li>

      <li v-for="command in commands" v-bind:key="command">
        <button
          v-on:click="runCommand(command)">
          Run {{command}}.bat
        </button>
        <span v-if="isLoading[command]">Running...</span>
      </li>
    </ul>
  </div>
</template>

<script>
import api from '../api'

export default {
  data: () => ({
    isLoading: {
      statistic: false,
      train: false,
      test: false,
      validate: false,
      export: false
    },
    running: null,
    checkRunningInterval: null,
    checkInterval: 750,
    commands: [
      'train',
      'test',
      'validate',
      'export'
    ]
  }),
  methods: {
    startChecking: function () {
      const self = this
      this.checkRunningInterval = setInterval(
        async () => { await self.checkStatus() },
        self.checkInterval
      )
    },
    stopChecking: function () {
      if ( ! this.checkRunningInterval ) return 
      clearInterval( this.checkRunningInterval )
      this.checkRunningInterval = null
    },
    checkStatus: async function () {
      const runstatus = await api.getRunningState()
      this.running = runstatus
      console.log(`Running status:`, runstatus)
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
    }
  },
  created: async function () {
    this.startChecking()
  },
  beforeDestroy: async function () {
    this.stopChecking()
  }
}
</script>

