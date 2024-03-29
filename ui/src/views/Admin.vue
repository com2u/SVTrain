<template>
  <div class="mt-4">
    <b-row class="mb-2">
      <b-col cols="12" lg="2">
        <div class="title-container" data-e2e-testid="admin-panel">
          <div>
            <h4>Admin Panel</h4>
          </div>
        </div>
        <div class="cmd-main-menu">
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
            <b-button class="svtrain-cmd-btn" @click="flag = 'admin_log'" data-e2e-testid="show-admin-log">
              <span class="ml-2">Show Admin Logs</span>
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
          <div class="cmd">
            <b-button :disabled="isRevertImageNameDisabled"
              class="svtrain-cmd-btn d-flex align-items-center justify-content-between" @click="showConfirmationModal">
              <span class="ml-2">Revert image names</span>
              <div v-b-tooltip.hover @click.stop=""
                title="Clicking this button will permanently remove class and probability information from all images in the active workspace.">
                <b-icon icon="info-circle" v-b-tooltip.hover></b-icon>
              </div>
            </b-button>
          </div>
          <div class="cmd">
            <b-button class="svtrain-cmd-btn d-flex align-items-center justify-content-between" @click="reloadPage">
              <span class="ml-2">Reload Configuration</span>
            </b-button>
          </div>
        </div>
      </b-col>
      <b-col cols="12" lg="10" class="has-board pl-lg-5">
        <div class="logs-slider-label" v-if="true">Logs Font Size</div>
        <div class="logs-font-size-slider col-5" v-if="true">
          <s-field
                :schema="this.schema"
                @input="handleInput"
              />
        </div>
        <b-tabs v-show="flag === 'log' || flag === 'admin_log'">
          <b-tab :title="flag === 'admin_log' ?'Admin Logs': 'Audit Trail'" active>
            <div v-show="flag === 'admin_log'" :style="`font-size:${this.logsFontSize}pt`" class="logs">
              {{ adminLogs }}
            </div>
            <div v-show="flag === 'log'"  :style="`font-size:${this.logsFontSize}pt`" class="logs" data-e2e-testid="main-content">
            {{ dataTXT }}
          </div>
          </b-tab>
        </b-tabs>
        <div v-show="flag && flag.includes('template_')" class="main-content">
          <div class="mb-4" id="wsjsoneditor" style="height: 650px;" />
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
              <td>{{ item.ws }}</td>
              <td>{{ (item.sz / 1024).toFixed(3) }} kb</td>
              <td>{{ new Date(Number.parseInt(item.created)).toLocaleString() }}</td>
              <td><b-button @click="restoreBU(item)">Restore</b-button></td>
            </tr>
          </tbody>
        </table>
      </b-col>
    </b-row>
    <div>
      <confirmation-modal :id="'confirmation-modal'" @confirmed="handleRenameConfirmation" :confirmationText="confirmationText">
        <div>Workspace: <span class="workspace">{{ this.currentWS }}</span></div>
        <br>
      </confirmation-modal>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import { getAPIRoot } from '@/utils'
import JSONEditor from 'jsoneditor'
import { debounce } from 'lodash'
import api from '../utils/api'
import ConfirmationModal from '../components/ConfirmationModal.vue'
// eslint-disable-next-line no-unused-vars
import SField from '../components/field/Index.vue'
import * as types from '../components/field/data_types'

export default {
  name: 'Admin',
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
      flag: null,
      dataTXT: null,
      backups: [],
      editor: null,
      confirmationText: 'Are you sure about removing class and probability information from all image names and renaming them?',
      isRevertImageNameDisabled: false,
      workspacePath: null,
      currentWS: null,
      logsFontSize: 10,
      adminLogs: null,
    }
  },
  components: {
    ConfirmationModal,
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
    handleInput: debounce(function handleInputFunction(eventValue) {
      this.logsFontSize = eventValue
    }, 300),
    async fetch() {
      await api.getLogFor('admin').then((res) => {
        this.adminLogs = res
      })
    },
    openLink() {
      this.showLog = false
      window.open(this.KCManagementUri)
    },
    reloadPage() {
      window.location.reload()
    },
    handleRenameConfirmation(isConfirmed) {
      if (isConfirmed) {
        const res = api.runCommand('run_remove_class_and_probability')
        if (res === true) {
          this.checkFolderExist()
        }
      }
    },
    showConfirmationModal() {
      this.$bvModal.show('confirmation-modal') // Show the confirmation modal
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
    async checkFolderExist() {
      this.workspacePath = await api.getWorkspace()
      const workspacePathArray = this.workspacePath.split('/')
      this.currentWS = workspacePathArray[workspacePathArray.length - 1]
      api.checkFileExists('images', this.workspacePath, '', 'revertImageName').then((response) => {
        this.isRevertImageNameDisabled = !response.fileExist
      })
    },
  },
  mounted() {
    const container = document.getElementById('wsjsoneditor')
    const options = {
      mode: 'code',
    }
    this.checkFolderExist()
    this.editor = new JSONEditor(container, options)
    this.fetch(true)
    this.interval = setInterval(this.fetch, 2000)
    this.flag = 'admin_log'
  },
  beforeDestroy() {
    clearInterval(this.interval)
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
  width: 240px;
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
  font-size: 14px;
}
.workspace{
 font-weight: 700;
}
</style>
