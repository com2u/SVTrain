<template>
  <div>
    <div class="title-container">
      <div>
        <h1>Work Spaces</h1>
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
        @select-workspace="setWorkspace(folder)"
      />
      <div
        class="new-ws"
        v-if="systemConfig.newWorkspace"
        v-b-modal.create-ws-folder>
        <b-icon icon="plus-circle"></b-icon>
        New Workspace
      </div>
    </div>

    <b-modal
      v-model="notesVisible"
      ok-title="Save"
      cancel-title="Back"
    >
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
        <b-button @click="notesVisible=false">Cancel</b-button>
        <b-button
          v-if="canEditNote"
          variant="primary"
          @click="saveNotes" >
          Save
        </b-button>
      </template>

    </b-modal>

    <b-modal
      v-model="cfgVisible"
      ok-title="Save"
      cancel-title="Back"
      @shown="onModalShow"
    >
      <template v-slot:modal-title>Config folder {{ $store.state.notes.folder.name }}</template>

      <div>
        <div id="wsjsoneditor"/>
      </div>
      <template v-slot:modal-footer>
        <b-button @click="cfgVisible=false">Cancel</b-button>
        <b-button
          v-if="canEditConfig"
          variant="primary"
          @click="saveConfig" >
          Save
        </b-button>
      </template>

    </b-modal>

    <b-modal
      v-model="statisticVisible"
      size="xl"
      cancel-title="Close"
    >
      <template v-slot:modal-title>Statistic</template>
      <statistic-popup ref="statistic"/>
      <div>

      </div>

    </b-modal>

    <creating-folder
      @folder-created="onFolderCreated"
      path="root"
      id="create-ws-folder"
    />

  </div>
</template>
<script>
import JSONEditor from 'jsoneditor';
import _set from 'lodash.set';
import { mapGetters } from 'vuex';
import api from '../utils/api';
import WorkspaceFolder from '../components/WorkspaceFolder.vue';
import CreatingFolder from '../components/CreatingFolder.vue';
import StatisticPopup from '../components/StatisticPopup.vue';
import EventBus from '../utils/eventbus';
import { updateCounting } from '../utils';

export default {
  name: 'WorkSpace',
  components: {
    WorkspaceFolder,
    CreatingFolder,
    StatisticPopup,
  },
  data() {
    return {
      folders: [],
      loading: false,
      editor: null,
      statisticVisible: false,
      populatedFolders: [],
    };
  },
  computed: {
    notesVisible: {
      get() {
        return this.$store.state.notes.visible;
      },
      set(visible) {
        this.$store.dispatch('notes/setVisible', visible);
      },
    },
    cfgVisible: {
      get() {
        return this.$store.state.wsconfig.visible;
      },
      set(visible) {
        this.$store.dispatch('wsconfig/setVisible', visible);
      },
    },
    notesContent: {
      get() {
        return this.$store.state.notes.folder.notes;
      },
      set(val) {
        this.$store.dispatch('notes/setContent', val);
      },
    },
    systemConfig() {
      return this.$store.state.app.config;
    },
    ...mapGetters([
      'canEditNote',
      'canEditConfig',
    ]),
  },
  methods: {
    // async loadFolders() {
    //   this.loading = true;
    //   await api.getSubfolders('root');
    //   this.loading = false;
    // },
    async loadFoldersByPath(dir = null) {
      this.loading = true;
      const response = await api.getFoldersByPath(dir);
      response.forEach((f) => {
        this.populatedFolders.push(f.path);
      });
      this.folders = response;
      this.loading = false;
    },
    saveNotes() {
      this.$store.dispatch('notes/save')
        .then(() => {
          this.loadFoldersByPath();
        });
    },
    saveConfig() {
      let config;
      if (this.editor) {
        config = this.editor.get();
      }
      this.$store.dispatch('wsconfig/save', config)
        .then(() => {
          this.loadFoldersByPath();
        });
    },
    onModalShow() {
      const container = document.getElementById('wsjsoneditor');
      const options = {
        mode: 'code',
      };
      const editor = new JSONEditor(container, options);
      this.editor = editor;
      editor.set(this.$store.state.wsconfig.folder.config);
    },
    async setWorkspace(folder) {
      await api.setWorkspace(folder.name);
      api.getConfig()
        .then((data) => {
          this.$store.dispatch('app/setConfig', data);
        });
      this.$router.push({
        name: 'explorer',
        query: { dir: folder.path },
      });
    },
    onFolderCreated() {
      this.loadFoldersByPath();
    },
    toAiPage() {
      this.$router.push({ name: 'main' });
    },
    async loadSubfolder(item) {
      const subFolders = await api.getFoldersByPath(item.info.path);
      subFolders.forEach((f) => {
        this.populatedFolders.push(f.path);
      });
      const subFoldersPath = `${item.keyPath}.subFolders`;
      const updatedFolders = _set(this.folders, subFoldersPath, subFolders);
      this.folders = JSON.parse(JSON.stringify(updatedFolders));
    },
    showStatistic(dir) {
      this.statisticVisible = true;
      this.$nextTick(() => {
        if (this.$refs.statistic) {
          this.$refs.statistic.open(dir);
        }
      });
    },
  },
  mounted() {
    // this.loadFolders()
    this.loadFoldersByPath();
    this.$store.dispatch('app/calculateStatistic')
      .then(async () => {
        const updatedStatistic = await api.listStatistics(this.populatedFolders);
        const folders = updateCounting(this.folders, updatedStatistic);
        this.folders = folders;
      });
    EventBus.$on('load-sub-folders', this.loadSubfolder);
    EventBus.$on('show-statistic', this.showStatistic);
  },
  destroyed() {
    EventBus.$off('load-sub-folders');
    EventBus.$off('show-statistic');
  },
};
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
      background: #f3f3f3;
      display: flex;
      justify-content: space-between;
      padding: 0 10px;
      -webkit-box-shadow: 0px 1px 10px -7px #222222;
      -moz-box-shadow: 0px 1px 10px -7px #222222;
      box-shadow: 0px 1px 10px -7px #222222;
      border-radius: 2px;

      &.selected {
        background: #39d1ff;
        border: thin solid #39d1ff;
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

        .option-progress {
          display: flex;

          .file-nums {
            padding-right: 10px;
          }
        }

        .clickable-icon {
          cursor: pointer;
        }

        .gray-icon {
          cursor: default;
          color: #d4d4d4;
        }

        .ws-progress {
          width: 150px;
          margin-right: 30px;
          margin-top: 23px;
          margin-left: 5px;
        }

        .icon-wrapper {
          width: 15px;
          display: inline-block;
          margin-left: 10px;

          &.expand-icon {
            font-size: 10px;
            svg {
              width: 10px !important;
              font-size: 10px !important;
            }
          }
        }
      }
    }
  }
  .new-ws {
    width: 100%;
    border: 1px solid #f3f3f3;
    color: #333;
    background: #fafafa;
    border-radius: 2px;
    cursor: pointer;
    height: 50px;
    line-height: 50px;
    padding-left: 10px;
    -webkit-box-shadow: 0px 1px 10px -7px #222222;
    -moz-box-shadow: 0px 1px 10px -7px #222222;
    box-shadow: 0px 1px 10px -7px #222222;
    margin-top: 20px;
    font-weight: 600;
  }
</style>
