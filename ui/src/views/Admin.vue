<template>
  <div class="mt-4">
    <b-row>
      <b-col>
        <div class="title-container" data-e2e-testid="admin-panel">
          <div>
            <h4>Admin Panel</h4>
          </div>
        </div>
        <div class="cmd-main-menu">
          <div>Workspace: <strong>{{ currentWs}}</strong></div>
          <div class="cmd">
            <b-button @click="openLink" class="svtrain-cmd-btn">
              <span class="ml-2">User management</span>
            </b-button>
          </div>
          <div class="cmd">
            <b-button class="svtrain-cmd-btn" @click="flag = 'template_cfg'">
              <span class="ml-2">Update config template</span>
            </b-button>
          </div>
          <div class="cmd">
            <b-button class="svtrain-cmd-btn" @click="flag = 'template_aic'">
              <span class="ml-2">Update TFSetting template</span>
            </b-button>
          </div>
          <div class="cmd">
            <b-button class="svtrain-cmd-btn" @click="flag = 'log'" data-e2e-testid="show-audit-trail">
              <span class="ml-2">Show Audit Trail</span>
            </b-button>
          </div>
          <div class="cmd" @click="downloadLog()" data-e2e-testid="download-audit-trail">
            <b-button class="svtrain-cmd-btn">
              <span class="ml-2">Download Audit Trail</span>
            </b-button>
          </div>
          <div class="cmd">
            <b-button class="svtrain-cmd-btn" @click="flag = 'backup'">
              <span class="ml-2">Backups</span>
            </b-button>
          </div>
          <div class="cmd">
            <b-button class="svtrain-cmd-btn" @click="flag = 'Remove_lock_file'">
              <span class="ml-2">Remove Lock File</span>
            </b-button>
          </div>
        </div>
      </b-col>
      <b-col cols="10" class="has-board">
        <pre class="main-content" data-e2e-testid="main-content" v-show="flag === 'log'" v-html="dataTXT"></pre>
        <div v-show="flag && flag.includes('template_')" class="main-content">
          <div class="mb-4" id="wsjsoneditor" style="height: 650px;"/>
          <b-button variant="primary" @click="saveFile">Save</b-button>
        </div>
        <table v-if="flag === 'backup'" class="table">
          <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Workspace</th>
            <th scope="col">Size</th>
            <th scope="col">Created</th>
            <th scope="col">Action</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in backups" :key="item.sz">
            <th scope="row">1</th>
            <td>{{item.ws}}</td>
            <td>{{ (item.sz / 1024).toFixed(3) }} kb</td>
            <td>{{new Date(Number.parseInt(item.created)).toLocaleString()}}</td>
            <td><b-button @click="restoreBU(item)">Restore</b-button></td>
          </tr>
          </tbody>
        </table>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import { getAPIRoot } from '@/utils'
import JSONEditor from 'jsoneditor'
import api from '../utils/api'

export default {
  name: 'Admin',
  data() {
    return {
      flag: null,
      dataTXT: null,
      backups: [],
      editor: null,
    }
  },
  computed: {
    ...mapGetters([
      'currentWs',
      'KCManagementUri',
    ]),
  },
  watch: {
    flag() {
      this.loadData()
    },
  },
  methods: {
    openLink() {
      this.showLog = false
      window.open(this.KCManagementUri)
    },
    async downloadLog() {
      await axios({
        url: `${getAPIRoot()}/system-log?download=true`,
        method: 'GET',
        responseType: 'blob',
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'SVTrain.txt')
        document.body.appendChild(link)
        link.click()
      })
    },
    async loadData() {
      this.dataTXT = null
      this.backups = []
      if (this.flag === 'log') {
        this.dataTXT = await axios.get(`${getAPIRoot()}/system-log`).then((res) => res.data)
      } else if (this.flag === 'backup') {
        this.backups = await axios.get(`${getAPIRoot()}/backup-list`).then((res) => res.data)
      } else if (this.flag === 'template_cfg') {
        this.dataTXT = await axios.get(`${getAPIRoot()}/sample-config?type=cfg`).then((res) => res.data)
      } else if (this.flag === 'template_aic') {
        this.dataTXT = await axios.get(`${getAPIRoot()}/sample-config?type=aic`).then((res) => res.data)
      } else if (this.flag === 'Remove_lock_file') {
        const res = await api.runCommand('script_remove_lock_file')
        if (res === true) {
          this.$notify({
            type: 'success',
            title: 'Success',
            text: 'Action triggered successfully',
          })
        }
      }
      if (this.flag && this.flag.includes('template')) {
        this.editor.set(null)
        this.editor.set(this.dataTXT)
      }
    },
    async saveFile() {
      const data = this.editor.get()
      await axios.post(`${getAPIRoot()}/sample-config?type=${this.flag.replace('template_', '')}`, data)
    },
    async restoreBU(item) {
      await axios.post(`${getAPIRoot()}/restore-backup`, item).then(() => {
        this.$notify({
          type: 'success',
          text: 'Your backup was restored',
          duration: 10000,
        })
      })
    },
  },
  mounted() {
    const container = document.getElementById('wsjsoneditor')
    const options = {
      mode: 'code',
    }
    this.editor = new JSONEditor(container, options)
  },
}
</script>

<style lang="scss">
.has-board {
  .main-content,
  .tab-content {
    height: calc(100vh - 200px);
    border-width: 1px;
    border-style: solid;
    border-color: #dee2e6;
    padding: 16px;
    overflow: auto;

    .tab-pane,
    iframe {
      width: 100%;
      height: 100%;
    }
  }
  .tab-content {
    border-color: transparent #dee2e6 #dee2e6;
  }
}

.app .cmd-main-menu .svtrain-cmd-btn {
  width: 250px;
}
</style>
