<template>
  <div class="container-fluid">
    <div class="title-container">
      <div>
        <h4>SVTrain v0.10</h4>
      </div>
    </div>
    <div class="cmd-main-menu">
      <div>Workspace: <strong>{{ currentWs}}</strong></div>
      <div v-if="running !== null" v-html="running || 'idle'"></div>
      <b v-else>no info</b>
      <div v-for="command in commands" :key="command.value" class="cmd">
        <b-button
          class="svtrain-cmd-btn"
          :class="command.value === 'stop' ? 'btn-stop-command' : 'btn-command'"
          v-bind:disabled="!!isLoading[command.value] || command.value === 'stop' && !running || command.value !== 'stop' && !!running"
          v-on:click="runCommand(command.value, workspace)">
          <v-icon v-bind:name="command.value === 'stop' ? 'stop' : 'play'"/>
          <span class="ml-2">{{command.label}}</span>
        </b-button>
        <b-button v-if="command.btn && logs[command.btn]" variant="light" class="ml-2" @click="downloadExport(command.btn)">
          <span v-if="typeof logs[command.btn] === 'string'">Download</span>
          <span v-else>Zipping</span>
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
      <pre class="py-4" v-html="logs.validate.lastLine"></pre>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import { isProduction } from '@/utils'
import command from '../mixins/command'

export default {
  name: 'Validate',
  mixins: [command],
  data() {
    return {
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
          value: 'script_export_model',
          label: 'Run export model',
          btn: 'export_model',
        },
        {
          value: 'script_export_result',
          label: 'Run export results',
          btn: 'export_results',
        },
        {
          value: 'script_export_image',
          label: 'Run export images',
          btn: 'export_images',
        },
        {
          value: 'script_report',
          label: 'Report',
        },
      ],
    }
  },
  methods: {
    async downloadExport(field) {
      if (this.logs[field] === 1) return
      const { data, status } = await axios.get(`${isProduction() ? '' : 'http://127.0.0.1:3333'}/data/${this.logs[field]}`, {
        responseType: 'blob',
        params: {
          sessionToken: localStorage.getItem('sessionToken'),
          is_export: true,
          field,
        },
      })
      if (status === 200) {
        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${field}${field === 'export_images' ? '.zip' : ''}`)
        document.body.appendChild(link)
        link.click()
      } else if (status === 205) {
        this.logs[field] = 1
      }
    },
  },
}
</script>
