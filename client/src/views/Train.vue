<template>
  <div class="">
    <b-row>
      <b-col>
        <div class="title-container">
          <div>
            <h4>SVTrain v1.2</h4>
          </div>
        </div>
        <div class="cmd-main-menu">
          <div>Workspace: <strong>{{ currentWs}}</strong></div>
          <div v-if="running !== null" v-html="running || 'idle'"></div>
          <b v-else>no info</b>
          <b-button v-if="editConfigAI" class="mt-2" @click="showModal()">
            <v-icon name="cogs"/>
            <span class="ml-2">Settings</span>
          </b-button>
          <div v-for="command in commands" :key="command.value" class="cmd">
            <b-button
              class="svtrain-cmd-btn"
              :class="command.value === 'script_stop_training' ? 'btn-stop-command' : 'btn-command'"
              v-bind:disabled="!!isLoading[command.value] || command.value === 'script_stop_training' && !running || command.value !== 'script_stop_training' && !!running"
              v-on:click="runCommand(command.value, workspace)">
              <v-icon v-if="!command.icon" v-bind:name="command.value === 'script_stop_training' ? 'stop' : 'play'"/>
              <svg-icon v-else :icon-class="command.icon"></svg-icon>
              <span class="ml-2">{{command.label}}</span>
            </b-button>
            <span v-if="isLoading[command.value]">Running...</span>
            <pre
              style="padding-left: 10px"
              v-if="logs[command.value] && logs[command.value].lastLine"
              class="log-line"
              @click="openLogsFor(command.value)"
              v-html="logs[command.value].lastLine"/>
            <div style="clear: both"/>
          </div>
          <pre class="py-4" v-html="logs.training.lastLine"></pre>
        </div>
        <t-f-option ref="modal" :ws="workspace"/>
      </b-col>
      <b-col cols="9" class="has-board">
        <b-tabs>
          <b-tab title="Logfiles" active>
            <pre v-html="trainLog"></pre>
          </b-tab>
          <b-tab v-if="tenserBoard" title="TensorBoard">
            <iframe :src="tenserBoard"></iframe>
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
      ],
      trainLog: null,
      tenserBoard: null,
    }
  },
  computed: {
    ...mapGetters([
      'editConfigAI',
    ]),
  },
  methods: {
    fetch() {
      api.getLogFor('training').then((res) => {
        this.trainLog = res
      })
      if (this.workspace) {
        const ws = this.workspace.split('/').pop()
        axios.get(`${getFileServerPath()}${ws}/TFSettings.json`).then(({ data }) => {
          if (data) {
            this.tenserBoard = data.LiveViewURL
          }
        })
      }
    },
    showModal() {
      this.$refs.modal.$refs.modal.show()
    },
  },
  watch: {
    workspace() {
      this.fetch()
    },
  },
  mounted() {
    this.fetch()
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
</style>
