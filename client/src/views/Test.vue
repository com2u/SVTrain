<template>
  <div class="container-fluid">
    <div class="title-container">
      <div>
        <h4>SVTrain v1.2</h4>
      </div>
    </div>
    <div class="cmd-main-menu">
      <div>Workspace: <strong>{{ currentWs}}</strong></div>
      <div v-if="running !== null" v-html="running || 'idle'"></div>
      <b v-else>no info</b>
      <div v-for="command in commands" :key="command.value" class="cmd">
        <b-button
          class="svtrain-cmd-btn"
          :class="command.value === 'script_stop_test' ? 'btn-stop-command' : 'btn-command'"
          v-bind:disabled="!!isLoading[command.value] || command.value === 'script_stop_test' && !running || command.value !== 'script_stop_test' && !!running"
          v-on:click="runCommand(command.value, workspace)">
          <v-icon v-bind:name="command.value === 'script_stop_test' ? 'stop' : 'play'"/>
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
      <pre class="py-4" v-html="logs.test.lastLine"></pre>
    </div>
  </div>
</template>
<script>
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
      ],
    }
  },
}
</script>
