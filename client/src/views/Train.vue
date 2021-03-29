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
          <v-icon v-bind:name="command.value === 'script_stop_training' ? 'stop' : 'play'"/>
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
  </div>
</template>
<script>
import TFOption from '@/components/TFOption'
import { mapGetters } from 'vuex'
import command from '../mixins/command'

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
    }
  },
  computed: {
    ...mapGetters([
      'editConfigAI',
    ]),
  },
  methods: {
    showModal() {
      this.$refs.modal.$refs.modal.show()
    },
  },
}
</script>
