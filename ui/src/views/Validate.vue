<template>
  <div class="container-fluid">
    <b-row>
      <b-col>
        <div class="title-container">
          <div>
            <h4>SVTrain</h4>
          </div>
        </div>
        <div class="cmd-main-menu">
          <div>
            Workspace: <strong>{{ currentWs }}</strong>
          </div>
          <div v-if="running !== null" v-html="running || 'idle'"></div>
          <b v-else>no info</b>
          <template v-for="command in commands">
            <div v-if="aiOptions[command.value]" :key="command.value" class="cmd">
              <b-button class="svtrain-cmd-btn" :class="command.value === 'script_stop_validate'
                ? 'btn-stop-command'
                : 'btn-command'
                " v-bind:disabled="!!isLoading[command.value] ||
    (command.value === 'script_stop_validate' && !running) ||
    (command.value !== 'script_stop_validate' && !!running) ||
    (command.isNew)
    " v-on:click="runCommand(command.value, workspace)">
                <v-icon v-if="!command.icon" v-bind:name="command.value === 'script_stop_validate' ? 'stop' : 'play'
                  " />
                <svg-icon v-else :icon-class="command.icon"></svg-icon>
                <span class="ml-2">{{ command.label }}</span>
              </b-button>
              <b-button v-if="command.btn && ![null, undefined].includes(logs[command.btn])
                " variant="light" class="ml-2" @click="downloadExport(command.btn)">
                <span v-if="typeof logs[command.btn] === 'string'">Download</span>
                <span class="ml-2" v-else>Zipping</span>
              </b-button>
              <span class="ml-2" v-if="isLoading[command.value]">Running...</span>
              <pre style="padding-left: 10px" v-if="logs[command.value] && logs[command.value].lastLine" class="log-line"
                @click="openLogsFor(command.value)" v-html="logs[command.value].lastLine" />
              <div style="clear: both" />
            </div>
          </template>
          <div v-for="directExport in directExports" :key="directExport.mode">
            <div class="cmd">
              <b-button class="svtrain-cmd-btn"
                :class="!doesFolderExist[directExport.mode].fileExist ? 'btn-stop-command' : 'btn-command'"
                v-bind:disabled="!doesFolderExist[directExport.mode].fileExist || (directExport.mode === 'images' && isdisabled)"
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
        <div class="logs-slider-label" v-if="true">Logs Font Size</div>
        <div class="logs-font-size-slider col-5" v-if="true">
          <s-field
                :schema="this.schema"
                @input="handleInput"
              />
        </div>
        <b-tabs>
          <b-tab title="Logs" active>
            <div class="logs" :style="`font-size:${this.logsFontSize}pt`">{{ validateLog }}</div>
          </b-tab>
          <b-tab title="Last Report" @click="handleLastReportClick">
            <iframe :src="lastReportURL"></iframe>
          </b-tab>
        </b-tabs>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import axios from 'axios'
import { isProduction, getFileServerPath } from '@/utils'
import { debounce } from 'lodash'
import command from '../mixins/command'
import api from '../utils/api'
import * as types from '../components/field/data_types'
// eslint-disable-next-line no-unused-vars
import SField from '../components/field/Index.vue'

export default {
  name: 'Validate',
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
          value: 'script_validate',
          label: 'Run validate batch',
        },
        {
          value: 'script_stop_validate',
          label: 'Stop running validate',
        },
        {
          value: 'script_report',
          label: 'Report',
          icon: 'report',
        },
        {
          value: 'script_validate2',
          label: 'Backup',
          icon: 'save',
        },
      ],
      directExports: [
        {
          mode: 'model',
          label: 'Download model',
          name: 'final',
          icon: 'export',
          path: '/model/final',
        },
        {
          mode: 'result',
          label: 'Download results',
          name: 'results',
          icon: 'export',
          path: '/model/',
        },
        {
          mode: 'images',
          name: 'images',
          label: 'Download images',
          icon: 'ExportImage',
          path: '/validate',
        },
      ],
      validateLog: null,
      interval: null,
      lastReportURL: null,
      doesFolderExist: { model: { fileExist: false }, result: { fileExist: false }, images: { fileExist: false } },
      isdisabled: false,
      workspace: '',
      logsFontSize: 10,
    }
  },
  methods: {
    handleLastReportClick() {
      this.fetch()
    },
    handleInput: debounce(function handleInputFunction(eventValue) {
      this.logsFontSize = eventValue
    }, 300),
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
      this.doesFolderExist.model = await api.checkFileExists('model', this.workspace, '/model/final')
      this.doesFolderExist.result = await api.checkFileExists('result', this.workspace, '/model')
      this.doesFolderExist.images = await api.checkFileExists('images', this.workspace, '/validate')
    },
    downloadExport(field) {
      if (this.logs[field] === 1) return
      const url = `${isProduction() ? '' : 'http://127.0.0.1:3333'}/data/${this.logs[field]
      }?is_export=true&field=${field}`
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `${field}${field === 'export_images' ? '.zip' : ''}`,
      )
      document.body.appendChild(link)
      link.click()
    },
    async fetch() {
      const ws = this.currentWs.split('/').pop()
      axios
        .get(`${getFileServerPath()}${ws}/model/AI-Report.pdf`, { responseType: 'blob' })
        .then(({ data }) => {
          if (data) {
            this.lastReportURL = URL.createObjectURL(data)
          }
        })
    },
    async getLog() {
      await api.getLogFor('validate').then((res) => {
        this.validateLog = res
      })
    },
  },
  mounted() {
    this.fetch()
    this.getLog()
    this.interval = setInterval(this.getLog, 2000)
    this.checkFolderExist()
  },
  beforeDestroy() {
    clearInterval(this.interval)
  },
}
</script>
<style lang="scss">
.has-board {
  .tab-content {
    height: calc(100vh - 200px);
    border-width: 1px;
    border-style: solid;
    border-color: transparent #dee2e6 #dee2e6;
    padding: 16px;
    overflow: auto;

    .tab-pane,
    iframe {
      width: 100%;
      height: 100%;
    }
  }
}

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
}
</style>
