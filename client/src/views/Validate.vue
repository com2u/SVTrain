<template>
  <div class="container-fluid">
    <div class="title-container">
      <div>
        <h2>SVTrain v0.10</h2>
      </div>
    </div>
    <div class="cmd-main-menu">
      <div>
        Running status:
        <template v-if="running !== null">
          {{ running ? `${running}%` : 'idle' }}
        </template>
        <template v-else>
          no info
        </template>
      </div>
      <div v-for="command in commands" :key="command" class="cmd">
        <b-button
          v-bind:variant="command === 'stop' ? 'danger' : 'success'"
          v-bind:disabled="!!isLoading[command] || command === 'stop' && !running || command !== 'stop' && !!running"
          v-on:click="runCommand(command)">
          <v-icon v-bind:name="command === 'stop' ? 'stop' : 'play'"/>
          Run {{command}}.bat
        </b-button>
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
        'validate',
        'export',
        'ExportImages',
        'stop',
      ],
    };
  },
};
</script>
