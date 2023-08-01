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
          <div>Workspace: <strong>{{ currentWs }}</strong></div>
          <div v-if="running !== null" v-html="running || 'idle'"></div>
          <b v-else>no info</b>
          <template v-for="command in commands">
            <div v-if="aiOptions[command.value]" :key="command.value" class="cmd">
              <b-button class="svtrain-cmd-btn"
                :class="command.value === 'script_stop_test' ? 'btn-stop-command' : 'btn-command'"
                v-bind:disabled="!!isLoading[command.value] || command.value === 'script_stop_test' && !running || command.value !== 'script_stop_test' && !!running"
                v-on:click="runCommand(command.value, workspace)">
                <v-icon v-bind:name="command.value === 'script_stop_test' ? 'stop' : 'play'" />
                <span class="ml-2">{{ command.label }}</span>
              </b-button>
              <span v-if="isLoading[command.value]">Running...</span>
              <pre style="padding-left: 10px; margin-top: 10px" v-if="logs[command.value] && logs[command.value].lastLine"
                class="log-line" @click="openLogsFor(command.value)" v-html="logs[command.value].lastLine" />
              <div style="clear: both" />
            </div>
          </template>
          <div v-for="directExport in directExports" :key="directExport.mode">
            <div class="cmd">
              <b-button class="svtrain-cmd-btn"
                :class="!doesFolderExist[directExport.mode] ? 'btn-stop-command' : 'btn-command'"
                v-bind:disabled="!doesFolderExist[directExport.mode] || (directExport.mode === 'images' && isdisabled)"
                v-on:click="runExport(directExport)">
                <v-icon v-if="!directExport.icon" />
                <svg-icon v-else :icon-class="directExport.icon"></svg-icon>
                <span class="ml-2">{{ directExport.label }}</span>
                <b-spinner v-if="(directExport.mode === 'images' && isdisabled)" small class="ml-1"
                  label="Spinning"></b-spinner>
              </b-button>
            </div>
          </div>
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
import api from '../utils/api'
import command from '../mixins/command'

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
      directExports: [
        {
          mode: 'images',
          name: 'images',
          label: 'Download images',
          icon: 'ExportImage',
          path: '/test',
        },
      ],
      doesFolderExist: { images: false },
      testLog: null,
      interval: null,
      isdisabled: false,
    }
  },
  methods: {
    async getLog() {
      await api.getLogFor('test').then((res) => {
        this.testLog = res
      })
    },
    async runExport(directExport) {
      if (directExport.mode === 'images' && this.isdisabled === false) {
        this.isdisabled = true
      }
      try {
        const response = await api.exportFiles({ responseType: 'blob', params: { mode: directExport.mode, workspace: this.workspace + directExport.path } })
        const blob = new Blob([response], { type: 'application/zip' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${directExport.name}.zip`
        link.click()
        URL.revokeObjectURL(link.href)
      } catch (error) {
        console.log(error.message)
      }
      if (directExport.mode === 'images' && this.isdisabled === true) {
        this.isdisabled = false
      }
    },
    async checkFolderExist() {
      this.workspace = await api.getWorkspace()
      this.doesFolderExist.images = await api.checkFileExists('images', `${this.workspace}/test`)
    },
  },
  mounted() {
    api.refreshToken()
    this.getLog()
    this.interval = setInterval(this.getLog, 2000)
    this.checkFolderExist()
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
