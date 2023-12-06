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
                <b-icon :icon="command.value === 'script_stop_test' ? 'stop-circle-fill' : 'file-earmark-play-fill'" />
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
                :class="!doesFolderExist[directExport.mode].fileExist ? 'btn-stop-command' : 'btn-command'"
                v-bind:disabled="!doesFolderExist[directExport.mode].fileExist || (directExport.mode === 'images' && isdisabled)"
                v-on:click="runExport(directExport)">
                <b-icon v-if="!directExport.icon" />
                <b-icon v-else :icon="directExport.icon"></b-icon>
                <span class="ml-2">{{ directExport.label }}</span>
                <b-spinner v-if="(directExport.mode === 'images' && isdisabled)" small class="ml-1"
                  label="Spinning"></b-spinner>
              </b-button>
            </div>
          </div>
        </div>
      </b-col>
      <b-col cols="9" class="has-board">
        <div class="logs-slider-label" v-if="true">Logs Font Size</div>
        <div class="logs-font-size-slider col-5" v-if="true">
          <s-field
                :schema="this.schema"
                @input="handleInput"
              />
        </div>
        <b-tabs>
          <b-tab title="Logs" active>
            <div class="logs" :style="`font-size:${this.logsFontSize}pt`">{{ testLog }}</div>
          </b-tab>
        </b-tabs>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import { debounce } from 'lodash'
import api from '../utils/api'
import command from '../mixins/command'
// eslint-disable-next-line no-unused-vars
import SField from '../components/field/Index.vue'
import * as types from '../components/field/data_types'

export default {
  name: 'Test',
  mixins: [command],
  data() {
    return {
      schema: {
        type: types.SLIDER,
        sliderSign: 'pt',
        options: {
          max: 30,
          min: 8,
          default: 10,
        },
      },
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
          icon: 'cloud-arrow-down-fill',
          path: '/test',
        },
      ],
      doesFolderExist: { images: { fileExist: false } },
      testLog: null,
      interval: null,
      isdisabled: false,
      logsFontSize: 10,
    }
  },
  methods: {
    handleInput: debounce(function handleInputFunction(eventValue) {
      this.logsFontSize = eventValue
    }, 300),
    async getLog() {
      await api.getLogFor('test').then((res) => {
        this.testLog = res
      })
    },
    async runExport(directExport) {
      const { mode, path, name } = directExport
      if (mode === 'images' && this.isdisabled === false) {
        this.isdisabled = true
      }
      try {
        const response = await api.exportFiles({ responseType: 'blob', params: { mode, workspace: this.workspace, path } })
        const blob = new Blob([response], { type: 'application/zip' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${name}.zip`
        link.click()
        URL.revokeObjectURL(link.href)
      } catch (error) {
        console.log(error.message)
      }
      if (mode === 'images' && this.isdisabled === true) {
        this.isdisabled = false
      }
    },
    async checkFolderExist() {
      this.workspace = await api.getWorkspace()
      this.doesFolderExist.images = await api.checkFileExists('images', this.workspace, '/test')
    },
  },
  mounted() {
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
  padding: .5rem;
  white-space: pre-wrap;
  font-family: 'Courier New', Courier, monospace;
}
.logs-font-size-slider{
    position: absolute;
    top: 15px;
    right: 0px;
}
.logs-slider-label{
  position: absolute;
  right: 21%;
  top: 15px;
  font-size: 14px;
}
</style>
