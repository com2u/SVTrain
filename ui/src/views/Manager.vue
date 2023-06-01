<template>
  <div>
    <v-dialog />
    <notifications group="pending-action" position="top center" />
    <div class="title-container">
      <div>
        <h1 :style="{ fontSize: workspaceFontSize }">Workspaces Manager</h1>
      </div>
    </div>
    <div>
      <div v-if="loading" class="spinner-container">
        <b-spinner label="Loading..."></b-spinner>
      </div>
      <div
        class="ws-container"
        v-for="folder in folders"
        v-bind:key="folder.path"
      >
        <div class="folder-label">
          <div class="folder-label-name root-item">
            <div class="rename-input" v-if="renamingWs === folder.path">
              <input
                v-model="newWsName"
                ref="renameInput"
                @keyup.enter="renameWs(folder.path)"
              />
              <b-button
                variant="primary"
                @click="renameWs(folder.path)"
                :disabled="!newWsName"
                style="margin-left: 0.5rem"
              >
                <b-icon icon="save" />
                <span> Save</span>
              </b-button>
              <b-button
                variant="secondary"
                @click="cancelRename()"
                style="margin-left: 0.5rem"
              >
                <b-icon icon="x-lg" />
                <span> Cancel</span>
              </b-button>
            </div>
            <span
              v-else
              class="name"
              :style="{
                fontSize: subFolderFontSize,
              }"
              >{{ folder.name }}</span
            >
          </div>
          <div class="options">
            <div class="option-progress" v-b-tooltip.hover title="Folder Size">
              <span class="file-nums option-progress-text">{{
                humanFileSize(folder.size)
              }}</span>
            </div>
            <div>
              <div
                class="icon-wrapper"
                v-b-tooltip.hover
                title="Rename Workspace"
              >
                <v-icon
                  class="clickable-icon"
                  name="i-cursor"
                  scale="1.5"
                  @click="startRename(folder.path, folder.name)"
                />
              </div>
              <div
                class="icon-wrapper"
                v-b-tooltip.hover
                title="Duplicate Workspace"
              >
                <v-icon
                  class="clickable-icon"
                  name="regular/clone"
                  scale="1.5"
                  @click="duplicateWs(folder.path, folder.name)"
                />
              </div>
              <div
                class="icon-wrapper"
                v-b-tooltip.hover
                title="Backup Workspace"
              >
              <b-icon
                  class="clickable-icon"
                  icon="server"
                  font-scale="1.5"
                  @click="backupWs(folder.path)"
                />
              </div>
              <div
                class="icon-wrapper"
                v-b-tooltip.hover
                title="Delete all workspace images"
              >
                <v-icon
                  label="Delete Images"
                  class="clickable-icon"
                  @click="deleteWsImages(folder.path)"
                >
                  <v-icon name="regular/image" scale="1.5"></v-icon>
                  <v-icon name="ban" scale="1.5" class="alert"></v-icon>
                </v-icon>
              </div>
              <div
                class="icon-wrapper"
                v-b-tooltip.hover
                title="Delete Workspace"
              >
                <b-icon
                  class="clickable-icon"
                  icon="trash"
                  font-scale="1.5"
                  @click="deletePath(folder.path)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="title-container">
      <div>
        <h1 :style="{ fontSize: workspaceFontSize }">Backups Manager</h1>
      </div>
    </div>
    <div>
      <div v-if="loading" class="spinner-container">
        <b-spinner label="Loading..."></b-spinner>
      </div>
      <div
        class="ws-container"
        v-for="backup in backups"
        v-bind:key="backup.path"
      >
        <div class="folder-label">
          <div class="folder-label-name root-item">
            <v-icon name="archive"></v-icon>
            <span
              class="name"
              :style="{
                fontSize: subFolderFontSize,
              }"
              >{{ backup.name }}</span
            >
          </div>
          <div class="options">
            <div class="option-progress" v-b-tooltip.hover title="Backup Date">
              <span class="option-progress-text">{{
                new Date(parseInt(backup.date_created)).toLocaleString()
              }}</span>
            </div>
            <div class="option-progress" v-b-tooltip.hover title="Backup Size">
              <span class="file-nums option-progress-text">{{
                humanFileSize(backup.size)
              }}</span>
            </div>
            <div>
              <div
                class="icon-wrapper"
                v-b-tooltip.hover
                title="Restore Backup"
              >
                <v-icon
                  class="clickable-icon"
                  name="upload"
                  scale="1.5"
                  @click="restoreBackup(backup.path)"
                />
              </div>
              <div
                class="icon-wrapper"
                v-b-tooltip.hover
                title="Download Backup"
              >
                <v-icon
                  class="clickable-icon"
                  name="download"
                  scale="1.5"
                  @click="downloadBackup(backup.path, humanFileSize(backup.size))"
                />
              </div>
              <div class="icon-wrapper" v-b-tooltip.hover title="Delete Backup">
                <b-icon
                  class="clickable-icon"
                  icon="trash"
                  font-scale="1.5"
                  @click="deletePath(backup.path, true)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { isProduction } from '@/utils/index'
import api from '../utils/api'
import EventBus from '../utils/eventbus'

export default {
  components: {},
  data() {
    return {
      loading: false,
      loadingBackups: false,
      folders: [],
      backups: [],
      renamingWs: null,
      newWsName: null,
    }
  },
  computed: {
    ...mapGetters(['workspaceFontSize', 'subFolderFontSize']),
  },
  methods: {
    checkPermission() {},
    startRename(wsPath, oldWsName) {
      this.renamingWs = wsPath
      this.newWsName = oldWsName
      this.$nextTick(() => {
        this.$refs.renameInput[0].focus()
      })
    },
    cancelRename() {
      this.renamingWs = null
      this.newWsName = null
    },
    async renameWs(wsPath) {
      if (!this.newWsName) {
        this.$notify({
          type: 'error',
          text: 'Please enter a new workspace name',
        })
        return
      }
      await api.renameWorkspace(wsPath, this.newWsName.replace(/[\\/:*?"#<.>|]/g, ''))
      this.renamingWs = null
      this.newWsName = null
      this.loadWorkspacesAndBackups()
    },
    async duplicateWs(wsPath, oldWsName) {
      const newName = prompt('Enter new workspace name', oldWsName) // eslint-disable-line no-alert
      if (newName && newName === oldWsName) {
        await alert('Workspace name cannot be the same as the old one') // eslint-disable-line no-alert
        this.duplicateWs(wsPath, oldWsName)
      }
      if (newName && newName !== oldWsName) {
        this.$notify({
          group: 'pending-action',
          type: 'info',
          duration: -1,
          text: 'Duplicating workspace...',
        })
        try {
          await api.duplicateWorkspace(wsPath, newName)
        } finally {
          this.$notify({
            group: 'pending-action',
            clean: true,
          })
        }
        this.$notify({
          group: 'pending-action',
          type: 'success',
          duration: 2000,
          text: `Workspace ${oldWsName} duplicated as ${newName}`,
        })
        this.loadWorkspacesAndBackups()
      }
    },
    async backupWs(wsPath) {
      this.$notify({
        group: 'pending-action',
        type: 'info',
        duration: -1,
        text: `Creating backup of ${wsPath}...`,
      })
      try {
        await api.backup(wsPath)
      } finally {
        this.$notify({
          group: 'pending-action',
          clean: true,
        })
      }
      this.$notify({
        group: 'pending-action',
        type: 'success',
        duration: 2000,
        text: `Backup of ${wsPath} created successfully!`,
      })
      this.loadWorkspacesAndBackups()
    },
    deleteWsImages(wsPath) {
      this.$modal.show('dialog', {
        title: 'This cannot be undone',
        text: 'Are you sure you want to delete all images in this workspace (including all sub-folders)?',
        buttons: [
          {
            title: 'Cancel',
            handler: () => {
              this.$modal.hide('dialog')
            },
          },
          {
            title: 'Delete',
            class: 'danger',
            handler: async () => {
              this.$notify({
                group: 'pending-action',
                type: 'info',
                duration: -1,
                text: `Deleting images in ${wsPath.split('/').pop()}...`,
              })
              await api.deleteWorkspaceImages(wsPath)
              this.$notify({
                group: 'pending-action',
                clean: true,
              })
              this.$modal.hide('dialog')
              this.loadWorkspacesAndBackups()
            },
          },
        ],
      })
    },
    deletePath(wsPath, isBackup) {
      this.$modal.show('dialog', {
        title: 'This cannot be undone',
        text: `Are you sure you want to permanently delete this ${
          isBackup
            ? 'backup'
            : 'workspace (including all sub-folders and files)'
        }?`,
        buttons: [
          {
            title: 'Cancel',
            handler: () => {
              this.$modal.hide('dialog')
            },
          },
          {
            title: 'Delete',
            class: 'danger',
            handler: async () => {
              this.$notify({
                group: 'pending-action',
                type: 'info',
                duration: -1,
                text: `Deleting ${isBackup ? 'backup' : 'workspace'}...`,
              })
              await api.deletePath(wsPath, isBackup)
              this.$notify({
                group: 'pending-action',
                clean: true,
              })
              this.$modal.hide('dialog')
              this.loadWorkspacesAndBackups()
            },
          },
        ],
      })
    },
    downloadBackup(backupPath, backupSize) {
      this.$modal.show('dialog', {
        title: 'Download Backup',
        text: `Are you sure you want to download this backup, with a size of ${backupSize}?`,
        buttons: [
          {
            title: 'Cancel',
            handler: () => {
              this.$modal.hide('dialog')
            },
          },
          {
            title: 'Download',
            class: 'danger',
            handler: async () => {
              const productionUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}/api/`
              const developmentUrl = 'http://localhost:3333/api/'
              const baseurl = isProduction() ? productionUrl : developmentUrl
              const url = `${baseurl}downloadBackup?backupPath=${backupPath}&sessionToken=${localStorage.getItem(
                'sessionToken',
                null,
              )}`
              const link = document.createElement('a')
              link.href = url
              link.download = backupPath.split('/').pop()
              link.click()
              this.$modal.hide('dialog')
            },
          },
        ],
      })
    },
    restoreBackup(backupPath) {
      this.$modal.show('dialog', {
        title: 'Restore Backup',
        text: 'Are you sure you want to restore this backup? if a workspace with the same name already exists, it will be overwritten.',
        buttons: [
          {
            title: 'Cancel',
            handler: () => {
              this.$modal.hide('dialog')
            },
          },
          {
            title: 'Restore',
            class: 'danger',
            handler: async () => {
              this.$notify({
                group: 'pending-action',
                type: 'info',
                duration: -1,
                text: 'Restoring backup...',
              })
              const fileName = backupPath.split('/').pop()
              await api.restoreBackup({
                ws: fileName.split('__')[0],
                created: fileName.split('__')[1].replace('.zip', ''),
              })
              this.$notify({
                group: 'pending-action',
                clean: true,
              })
              this.$modal.hide('dialog')
              this.loadWorkspacesAndBackups()
            },
          },
        ],
      })
    },
    async loadWorkspacesAndBackups() {
      this.loading = true
      const response = await api.getRootFolderContent()
      this.folders = response.folders
      this.backups = response.backupZips
      this.loading = false
    },
    humanFileSize(bytes, si = false, dp = 1) {
      const thresh = si ? 1000 : 1024

      if (Math.abs(bytes) < thresh) {
        return `${bytes} B`
      }

      const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
      let u = -1
      const r = 10 ** dp

      do {
        bytes /= thresh // eslint-disable-line no-param-reassign
        u += 1
      } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh
        && u < units.length - 1
      )

      return `${bytes.toFixed(dp)} ${units[u]}`
    },
  },
  async mounted() {
    EventBus.$on('loaded-config', this.checkPermission)
    this.loadWorkspacesAndBackups()
  },
  destroyed() {
    EventBus.$off('loaded-config')
  },
}
</script>
<style lang="scss">
$height: 60px;

.spinner-container {
  text-align: center;
}
.alert {
  fill: red;
}
.vue-dialog-buttons {
  button {
    font-weight: bold;
    font-size: 1rem !important;
    &.danger {
      background: red;
      color: white;
      border: none;
    }
  }
}
.ws-container {
  .folder-label {
    height: $height;
    margin-bottom: 10px;
    background: #f2f1ef;
    display: flex;
    justify-content: space-between;
    padding-left: 10px;
    border-radius: 8px;

    .margin-keeper {
      margin-left: 18px;
    }
    .rename-input {
      height: 60px;
      margin: 0;
      input {
        height: 40px;
        margin: 10px 0;

        line-height: $height;
        font-weight: bold;
        padding-left: 10px;
        border-radius: 0.25rem;
        background: transparent;
        outline-color: #bfb8af;
      }
    }
    .name {
      height: $height;
      line-height: $height;
      font-weight: bold;
      padding-left: 10px;
    }

    .options {
      display: flex;
      height: $height;
      line-height: $height;
      min-width: 430px;
      justify-content: flex-end;

      .option-progress {
        display: flex;

        .file-nums {
          padding-right: 10px;
          width: 95px;
        }

        .option-progress-text {
          color: #bfb8af;
          min-width: 45px;
          text-align: right;
        }
      }

      .clickable-icon {
        cursor: pointer;
      }

      .gray-icon {
        cursor: default;
        color: #ddd;
      }
      .icon-wrapper {
        display: inline-block;
        margin-right: 0.5rem;

        .svg-icon {
          font-size: 25px;
          margin-bottom: -5px;
          padding-right: 2px;
        }
      }
    }
  }
}
</style>
