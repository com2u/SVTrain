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
            <b-icon icon='gear-wide-connected'></b-icon>
            <span class="ml-2">Settings</span>
          </b-button>
          <template v-for="command in commands">
            <div v-if="aiOptions[command.value]" :key="command.value" class="cmd">
              <b-button class="svtrain-train-cmd-btn"
                :class="command.value === 'script_stop_training' ? 'btn-stop-command' : 'btn-command'"
                v-bind:disabled="!!isLoading[command.value] || command.value === 'script_stop_training' && !running || command.value !== 'script_stop_training' && !!running"
                v-on:click="runCommand(command.value, workspace)">
                <b-icon v-if="!command.icon" :icon="command.value === 'script_stop_training' ? 'stop-circle-fill' : 'file-earmark-play-fill'"></b-icon>
                <b-icon v-else :icon="command.icon"></b-icon>
                <span class="ml-2">{{ command.label }}</span>
                <div v-if="command.value === 'script_run_test_on_train'" class="info-circle" v-b-tooltip.hover
                  @click.stop=""
                  title="Clicking this button will add the highest pseudo probability and its corresponding defect class to the beginning of the file name. It is required to display the confusion matrix correctly. This function is required for training runs that were done outside of the Eject-X platform.">
                  <b-icon icon="info-circle" v-b-tooltip.hover></b-icon>
                </div>
              </b-button>
              <span v-if="isLoading[command.value]">Running...</span>
              <pre style="padding-left: 10px" v-if="logs[command.value] && logs[command.value].lastLine" class="log-line"
                @click="openLogsFor(command.value)" v-html="logs[command.value].lastLine" />
              <div style="clear: both" />
            </div>
          </template>
          <div v-for="directExport in directExports" :key="directExport.mode">
            <div class="cmd">
              <b-button class="svtrain-train-cmd-btn"
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
          <pre v-if="false" class="py-4" v-html="logs.training.lastLine"></pre>
        </div>
        <t-f-option ref="modal" :ws="workspace" :cws="currentWs"/>
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
            <div class="logs" :style="`font-size:${this.logsFontSize}pt`">{{ trainLog }}</div>
          </b-tab>
        </b-tabs>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import TFOption from '@/components/TFOption'
import { mapGetters } from 'vuex'
import { debounce } from 'lodash'
import command from '../mixins/command'
import api from '../utils/api'
// eslint-disable-next-line no-unused-vars
import SField from '../components/field/Index.vue'
import * as types from '../components/field/data_types'

export default {
  name: 'Train',
  components: { TFOption },
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
          value: 'script_split_data',
          label: 'Run split data',
          icon: 'diagram-3-fill',
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
        {
          value: 'script_run_test_on_train',
          label: 'Run test on folder train',
        },
      ],
      directExports: [
        {
          mode: 'images',
          name: 'images',
          label: 'Download images',
          icon: 'cloud-arrow-down-fill',
          path: '/train',
        },
      ],
      doesFolderExist: { images: { fileExist: false } },
      trainLog: null,
      interval: null,
      isdisabled: false,
      logsFontSize: 10,
    }
  },
  computed: {
    ...mapGetters([
      'editConfigAI',
    ]),
  },
  methods: {
    handleInput: debounce(function handleInputFunction(eventValue) {
      this.logsFontSize = eventValue
    }, 300),
    async fetch() {
      await api.getLogFor('training').then((res) => {
        this.trainLog = res
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
    showModal() {
      this.$refs.modal.$refs.modal.show()
    },
    async checkFolderExist() {
      this.workspace = await api.getWorkspace()
      this.doesFolderExist.images = await api.checkFileExists('images', this.workspace, '/train')
    },
  },
  watch: {
    workspace() {
      this.fetch()
    },
  },
  mounted() {
    this.fetch()
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
  position: relative;
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

.svtrain-train-cmd-btn {
  width: 230px;
  text-align: left;
  position: relative;
  .info-circle {
    margin-left: 5px;
    position: absolute;
    top: 7px;
    right: 6px;
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
