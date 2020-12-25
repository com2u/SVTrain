<template>
  <div>
    <div class="title-container">
      <div>
        <h1 :style="{ fontSize: workspaceFontSize }">Work Spaces</h1>
      </div>
    </div>
    <div>
      <div v-if="loading" class="spinner-container">
        <b-spinner label="Loading..."></b-spinner>
      </div>
      <workspace-folder
        v-for="(folder, index) in folders"
        :info="folder"
        :key-path="`[${index}]`"
        :key="folder.path"
        :show-sub-folder-progress="folder.config && folder.config.showSubFolderProgress"
        @select-workspace="setWorkspace(folder)"
      />
      <div
        class="new-ws"
        v-if="systemConfig.newWorkspace && newWorkspace"
        @click="createNewFolder"
      >
        <b-icon icon="plus-circle"></b-icon>
        New Workspace
      </div>
    </div>
    <b-modal v-model="notesVisible" ok-title="Save" cancel-title="Back">
      <template v-slot:modal-title>Notes for {{ $store.state.notes.folder.name }}</template>
      <div>
        <b-form-textarea
          id="textarea"
          v-model="notesContent"
          rows="3"
          max-rows="6"
        ></b-form-textarea>
      </div>
      <template v-slot:modal-footer>
        <div class="note-footer">
          <div>
            <b-form-checkbox v-model="notesHighlight" :disabled="!canEditNote">
              Highlight Note
            </b-form-checkbox>
          </div>
          <div>
            <b-button @click="notesVisible=false" class="btn-cancel">Cancel</b-button>
            <b-button
              v-if="canEditNote"
              variant="primary"
              @click="saveNotes">
              Save
            </b-button>
          </div>
        </div>

      </template>
    </b-modal>
    <b-modal v-model="cfgVisible" ok-title="Save" cancel-title="Back" @shown="onModalShow">
      <template v-slot:modal-title>Config folder {{ $store.state.notes.folder.name }}</template>
      <div v-if="editConfigUI">
        <w-s-option ref="ws-option" :value="$store.state.wsconfig.folder.config"></w-s-option>
      </div>
      <div v-else>
        <div id="wsjsoneditor"/>
      </div>
      <template v-slot:modal-footer>
        <b-button @click="cfgVisible=false">Cancel</b-button>
        <b-button
          v-if="canEditConfig"
          variant="primary"
          @click="saveConfig">
          Save
        </b-button>
      </template>
    </b-modal>
    <creating-folder
      @folder-created="onFolderCreated"
      path="root"
      id="create-ws-folder"
    />
  </div>
</template>
<script>
import JSONEditor from 'jsoneditor'
import _set from 'lodash.set'
import { mapGetters } from 'vuex'
import WSOption from '@/components/WSOption'
import api from '../utils/api'
import WorkspaceFolder from '../components/WorkspaceFolder.vue'
import CreatingFolder from '../components/CreatingFolder.vue'
import EventBus from '../utils/eventbus'
import { updateCounting } from '../utils'

export default {
  name: 'WorkSpace',
  components: {
    WSOption,
    WorkspaceFolder,
    CreatingFolder,
  },
  data() {
    return {
      folders: [],
      loading: false,
      editor: null,
      populatedFolders: [],
    }
  },
  computed: {
    notesVisible: {
      get() {
        return this.$store.state.notes.visible
      },
      set(visible) {
        this.$store.dispatch('notes/setVisible', visible)
      },
    },
    cfgVisible: {
      get() {
        return this.$store.state.wsconfig.visible
      },
      set(visible) {
        this.$store.dispatch('wsconfig/setVisible', visible)
      },
    },
    notesContent: {
      get() {
        return this.$store.state.notes.folder.notes
      },
      set(val) {
        this.$store.dispatch('notes/setContent', val)
      },
    },
    notesHighlight: {
      get() {
        return this.$store.state.notes.folder.highlight
      },
      set(val) {
        this.$store.dispatch('notes/setHighlight', val)
      },
    },
    systemConfig() {
      return this.$store.state.app.config
    },
    ...mapGetters([
      'canEditNote',
      'canEditConfig',
      'newWorkspace',
      'workspaceFontSize',
      'editConfigUI',
    ]),
  },
  methods: {
    // async loadFolders() {
    //   this.loading = true;
    //   await api.getSubfolders('root');
    //   this.loading = false;
    // },
    async loadFoldersByPath(dir = null) {
      this.loading = true
      const response = await api.getFoldersByPath(dir)
      response.forEach((f) => {
        this.populatedFolders.push(f.path)
      })
      this.folders = response
      this.loading = false
    },
    saveNotes() {
      this.$store.dispatch('notes/save')
        .then(() => {
          this.loadFoldersByPath()
        })
    },
    saveConfig() {
      let config
      if (this.editor && !this.editConfigUI) {
        config = this.editor.get()
      } else {
        config = this.$refs['ws-option'].data
      }
      this.$store.dispatch('wsconfig/save', config)
        .then(() => {
          const index = this.folders.map((x) => x.path).indexOf(this.$store.state.wsconfig.folder.path)
          this.$set(this.folders[index], 'config', config)
        })
    },
    onModalShow() {
      if (!this.editConfigUI) {
        const container = document.getElementById('wsjsoneditor')
        const options = {
          mode: 'code',
        }
        const editor = new JSONEditor(container, options)
        this.editor = editor
        editor.set(this.$store.state.wsconfig.folder.config)
      }
    },
    async setWorkspace(folder) {
      await api.setWorkspace(folder.name)
      api.getConfig()
        .then((data) => {
          this.$store.dispatch('app/setConfig', data)
        })
      this.$router.push({
        name: 'explorer',
        query: { dir: folder.path },
      })
    },
    onFolderCreated() {
      this.loadFoldersByPath()
    },
    toAiPage() {
      this.$router.push({ name: 'main' })
    },
    async loadSubfolder(item) {
      const subFolders = await api.getFoldersByPath(item.info.path)
      subFolders.forEach((f) => {
        this.populatedFolders.push(f.path)
      })
      const subFoldersPath = `${item.keyPath}.subFolders`
      const updatedFolders = _set(this.folders, subFoldersPath, subFolders)
      this.folders = JSON.parse(JSON.stringify(updatedFolders))
      this.$nextTick(() => {
        if (item.done) {
          item.done()
        }
      })
    },
    createNewFolder() {
      EventBus.$emit('create-new-folder', 'root')
    },
  },
  mounted() {
    // this.loadFolders()
    this.loadFoldersByPath()
    this.$store.dispatch('app/calculateStatistic')
      .then(async () => {
        const updatedStatistic = await api.listStatistics(this.populatedFolders)
        const folders = updateCounting(this.folders, updatedStatistic)
        this.folders = folders
      })
    EventBus.$on('load-sub-folders', this.loadSubfolder)
  },
  destroyed() {
    EventBus.$off('load-sub-folders')
  },
}
</script>
<style lang="scss">
  $height: 60px;

  .action-bar {
    button {
      margin-left: 10px;
    }
  }

  .ai-btn-content {
    padding: 0 20px;
  }

  #wsjsoneditor {
    width: 100%;
    height: 400px;

    .jsoneditor-menu {
      background: #6c757d;
    }

    .jsoneditor {
      border: thin solid #6c7d7d;
    }
  }

  .spinner-container {
    text-align: center;
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

      .name {
        height: $height;
        line-height: $height;
        font-weight: bold;
        padding-left: 10px;
        cursor: pointer;

        &.root-item {
          cursor: pointer;
        }
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
            color: #BFB8AF;
            min-width: 45px;
            text-align: right;
          }
        }

        .clickable-icon {
          cursor: pointer;
        }

        .highlight {
          color: blue;
        }

        .gray-icon {
          cursor: default;
          color: #999;
        }

        .ws-progress {
          width: 150px;
          margin-right: 10px;
          margin-top: 22px;
          margin-left: 5px;

          .black-bar {
            background: #000;
          }

          &.progress {
            background: #d9d4cf;
          }
        }

        .icon-wrapper {
          width: 15px;
          display: inline-block;
          margin-right: 20px;

          .svg-icon {
            font-size: 25px;
            margin-bottom: -5px;
            padding-right: 2px;
          }

          &.expand-icon {
            font-size: 10px;

            svg {
              width: 10px !important;
              font-size: 10px !important;
            }
          }
        }
      }

      &.selected {
        background: #0060FF;
        border: thin solid #39d1ff;

        .clickable-icon, .name, .option-progress-text {
          color: #fff !important;
        }
      }
    }
  }

  .new-ws {
    /*width: 100%;*/
    border: 1px solid #f3f3f3;
    background: #fafafa;
    cursor: pointer;
    height: 50px;
    line-height: 50px;
    padding-left: 10px;
    margin-top: 10px;
    font-weight: 600;
    color: #808080;
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .note-footer {
    display: flex;
    justify-content: space-between;
    width: 100%;

    button {
      margin-left: 10px;
    }
  }

  .btn-cancel {
    background: #D9D4CF;
    border: 1px solid #D9D4CF;
    color: #000;

    &:hover {
      background: #D9D4CF;
      border: 1px solid #D9D4CF;
      color: #000;
    }
  }
</style>
