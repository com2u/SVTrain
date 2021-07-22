import { mapGetters } from 'vuex'
import api from '../utils/api'
import socket from '../utils/socket.js'

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
      logs: {
        training: {},
        test: {},
        validate: {},
        export_model: null,
        export_results: null,
        export_images: null,
      },
      running: null,
      workspace: null,
      checkInterval: 750,
      commands: [],
      twoLogLines: null,
      status: null,
    }
  },
  computed: {
    ...mapGetters(['currentWs']),
  },
  methods: {
    openLogsFor(command) {
      window.open(`/logs/${command}?sessionToken=${localStorage.getItem('sessionToken')}`)
    },
    async checkStatus() {
      this.running = await api.getRunningState()
    },
    async checkWorkspace() {
      this.workspace = await api.getWorkspace()
      console.log(`Workspace: ${this.workspace}`)
    },
    async runCommand(command) {
      this.isLoading[command] = true
      try {
        await api.runCommand(command)
        await this.checkStatus()
      } catch (e) {
        console.log(e)
      }
      this.isLoading[command] = false
    },
  },
  async created() {
    this.sessionUser = localStorage.getItem('sessionUser')
    await this.checkStatus()
    await this.checkWorkspace()
    this.logs = await api.getLastLogs()
    socket.subscibeForFolder('lock.txt', (data) => {
      if (data.event === 'unlink') {
        this.running = false
      }
      if (data.event === 'change') {
        this.running = data.content
      }
      this.isLoading.train = Boolean(this.running)
      this.isLoading.test = Boolean(this.running)
      this.isLoading.validate = Boolean(this.running)
    })
    socket.subscibeForFolder('workspace.bat', (data) => {
      if (data.event === 'unlink') this.workspace = false
      if (data.event === 'change') this.workspace = data.content
    })
    socket.subscribe('logfile', (obj) => {
      obj.forEach((o) => {
        if (o && this.logs[o.file]) {
          this.logs[o.file].lastLine = o.lastLine
        }
      })
    })
    socket.subscribe('exportFile', (data) => {
      Object.keys(data).forEach((key) => {
        this.logs[key] = data[key]
      })
    })
    socket.subscribe('lock.txt', (data) => {
      if (data.event === 'unlink') this.running = false
      if (data.event === 'change') this.running = data.content
    })
    socket.subscribe('workspace.bat', (data) => {
      if (data.event === 'unlink') this.workspace = false
      if (data.event === 'change') this.workspace = data.content
    })
    socket.subscribe('zipDone', (data) => {
      this.logs[data.field] = data.path
    })
  },
  async beforeDestroy() {
    socket.unsubscribeForFolder('lock.txt')
    socket.unsubscribeForFolder('workspace.bat')
  },
}
