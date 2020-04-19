<template>
  <div class="container-fluid">
    <div class="title-container">
      <div>
        <h4>SVTrain v0.10</h4>
      </div>
    </div>
    <div class="cmd-main-menu">
      <div>Workspace: <strong>{{ currentWs}}</strong></div>
      <div>
        Running status:
        <strong>
          <template v-if="running !== null">
          {{ running ? `${running}%` : 'idle' }}
        </template>
        <template v-else>
          no info
        </template>
        </strong>
      </div>
      <div v-for="command in commands" :key="command.value" class="cmd">
        <b-button
          v-bind:variant="command.value === 'stop' ? 'danger' : 'success'"
          v-bind:disabled="!!isLoading[command.value] || command.value === 'stop' && !running || command.value !== 'stop' && !!running"
          v-on:click="runCommand(command.value)">
          <v-icon v-bind:name="command.value === 'stop' ? 'stop' : 'play'"/>
          {{command.label}}
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
    </div>
  </div>
</template>
<script>
import command from '../mixins/command';

export default {
  name: 'Validate',
  mixins: [command],
  data() {
    return {
      commands: [
        {
          value: 'validate',
          label: 'Run validate batch',
        },
        {
          value: 'export',
          label: 'Run export',
        },
        {
          value: 'ExportImages',
          label: 'Export images',
        },
        {
          value: 'stop',
          label: 'Stop running validate',
        },
      ],
    };
  },
};
</script>
