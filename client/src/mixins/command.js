import { mapGetters } from 'vuex';
import api from '../utils/api';
import socket from '../utils/socket.js';

export default {
  data() {
    return {
      isLoading: {
        statistic: false,
        train: false,
        test: false,
        validate: false,
        export: false,
        stop: false,
        ExportImages: false,
      },
      logs: {},
      running: null,
      workspace: null,
      checkInterval: 750,
      commands: [],
    };
  },
  computed: {
    ...mapGetters(['currentWs']),
  },
  methods: {
    openLogsFor(command) {
      window.open(`/logs/${command}?sessionToken=${localStorage.getItem('sessionToken')}`);
    },

    async checkStatus() {
      const runstatus = await api.getRunningState();
      this.running = runstatus;
      console.log('Running status:', runstatus);
    },
    async checkWorkspace() {
      const workspace = await api.getWorkspace();
      this.workspace = workspace;
      console.log(`Workspace: ${this.workspace}`);
    },
    async runCommand(command) {
      this.isLoading[command] = true;
      try {
        await api.runCommand(command);
        await this.checkStatus();
      } catch (e) {
        console.log(e);
        console.error('An error occurred!');
      }
      this.isLoading[command] = false;
      console.log(`Command ${command} executed`);
    },
  },
  async created() {
    this.sessionUser = localStorage.getItem('sessionUser');
    this.checkStatus();
    this.checkWorkspace();
    this.logs = await api.getLastLogs();
    socket.subscibeForFolder('running.lock', (data) => {
      console.log('running.lock: ', data);
      if (data.event === 'unlink') this.running = false;
      if (data.event === 'change') this.running = data.content;
    });
    socket.subscibeForFolder('workspace.bat', (data) => {
      console.log('workspace.bat: ', data);
      if (data.event === 'unlink') this.workspace = false;
      if (data.event === 'change') this.workspace = data.content;
    });

    socket.subscribe('logfile', (obj) => {
      obj.forEach((o) => {
        this.logs[o.file].lastLine = o.lastLine;
      });
    });
  },
  async beforeDestroy() {
    socket.unsubscribeForFolder('running.lock');
    socket.unsubscribeForFolder('workspace.bat');
  },
};
