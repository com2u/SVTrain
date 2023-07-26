<template>
  <div class="">
    <b-row>
      <b-col>
        <div class="title-container">
          <div>
            <h4>SVTrain</h4>
          </div>
        </div>
        <div class="cmd-main-menu">
          <div>Workspace: <strong>{{ currentWs }}</strong></div>
          <div v-if="running !== null" v-html="running || 'idle'"></div>
          <b v-else>no info</b>
          <b-button v-if="editConfigAI" class="mt-2" @click="showModal()">
            <v-icon name="cogs" />
            <span class="ml-2">Settings</span>
          </b-button>
          <template v-for="command in commands">
            <div v-if="aiOptions[command.value]" :key="command.value" class="cmd">
              <b-button class="svtrain-cmd-btn"
                :class="command.value === 'script_stop_training' ? 'btn-stop-command' : 'btn-command'"
                v-bind:disabled="!!isLoading[command.value] || command.value === 'script_stop_training' && !running || command.value !== 'script_stop_training' && !!running"
                v-on:click="runCommand(command.value, workspace)">
                <v-icon v-if="!command.icon" v-bind:name="command.value === 'script_stop_training' ? 'stop' : 'play'" />
                <svg-icon v-else :icon-class="command.icon"></svg-icon>
                <span class="ml-2">{{ command.label }}</span>
              </b-button>
              <span v-if="isLoading[command.value]">Running...</span>
              <pre style="padding-left: 10px" v-if="logs[command.value] && logs[command.value].lastLine" class="log-line"
                @click="openLogsFor(command.value)" v-html="logs[command.value].lastLine" />
              <div style="clear: both" />
            </div>
          </template>
          <div v-for="directExport in directExports" :key="directExport.value">
            <div class="cmd">
              <b-button class="svtrain-cmd-btn"
                :class="!doesFolderExist[directExport.value] ? 'btn-stop-command' : 'btn-command'"
                v-bind:disabled="!doesFolderExist[directExport.value] || (directExport.value === 'export_image' && isdisabled)"
                v-on:click="runExport(directExport)">
                <v-icon v-if="!directExport.icon" />
                <svg-icon v-else :icon-class="directExport.icon"></svg-icon>
                <span class="ml-2">{{ directExport.label }}</span>
                <b-spinner v-if="(directExport.value === 'export_image' && isdisabled)" small class="ml-1"
                  label="Spinning"></b-spinner>
              </b-button>
            </div>
          </div>
          <pre v-if="false" class="py-4" v-html="logs.training.lastLine"></pre>
        </div>
        <t-f-option ref="modal" :ws="workspace" />
      </b-col>
      <b-col cols="9" class="has-board">
        <b-tabs>
          <b-tab title="Logs" active>
            <pre v-html="trainLog" class="logs"></pre>
          </b-tab>
          <b-tab v-if="tensorBoard" title="tensorBoard">
            <iframe :src="tensorBoard"></iframe>
          </b-tab>
        </b-tabs>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import axios from 'axios'
import { getFileServerPath } from '@/utils'
import TFOption from '@/components/TFOption'
import { mapGetters } from 'vuex'
import command from '../mixins/command'
import api from '../utils/api'

export default {
  name: 'Train',
  components: { TFOption },
  mixins: [command],
  data() {
    return {
      commands: [
        {
          value: 'script_split_data',
          label: 'Run split data',
          icon: 'split',
        },
        {
          value: 'script_training',
          label: 'Run train',
        },
        {
          value: 'script_stop_training',
          label: 'Stop running train',
        },
        {
          value: 'script_training2',
          label: 'Cleanup',
        },
      ],
      directExports: [
        {
          value: 'export_image',
          name: 'images',
          label: 'Download images',
          icon: 'ExportImage',
          path: '',
        },
      ],
      doesFolderExist: { export_image: false },
      trainLog: null,
      tensorBoard: null,
      interval: null,
      isdisabled: false,
    }
  },
  computed: {
    ...mapGetters([
      'editConfigAI',
    ]),
  },
  methods: {
    async fetch(flag) {
      await api.getLogFor('training').then((res) => {
        this.trainLog = res
      })
      if (this.workspace && flag) {
        const ws = this.workspace.split('/').pop()
        await axios.get(`${getFileServerPath()}${ws}/TFSettings.json`).then(({ data }) => {
          if (data) {
            this.tensorBoard = data.LiveViewURL
          }
        })
      }
    },
    async runExport(directExport) {
      if (directExport.value === 'export_image' && this.isdisabled === false) {
        this.isdisabled = true
      }
      await axios
        .get(`${getFileServerPath()}${this.workspace}${directExport.path}`, { responseType: 'blob', params: { is_export_stream: true, export_value: directExport.value } })
        .then((response) => {
          const blob = new Blob([response.data], { type: 'application/zip' })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = `${directExport.name}.zip`
          link.click()
          URL.revokeObjectURL(link.href)
        }).catch((error) => {
          console.error(error)
        })
      if (directExport.value === 'export_image' && this.isdisabled === true) {
        this.isdisabled = false
      }
    },
    showModal() {
      this.$refs.modal.$refs.modal.show()
    },
    async checkFolderExist() {
      const workspace = await api.getWorkspace()
      const exportImage = await api.checkFolder(`${workspace}`)
      this.doesFolderExist.export_image = exportImage === 'ok'
    },
  },
  watch: {
    workspace() {
      this.fetch(true)
    },
  },
  mounted() {
    api.refreshToken()
    this.fetch(true)
    this.interval = setInterval(this.fetch, 2000)
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
  display: flex;
  flex-direction: column-reverse;
}
</style>
