<template>
  <div>
    <h1>WorkSpace List</h1>
    <div>
      <div v-if="loading" class="spinner-container">
        <b-spinner label="Loading..."></b-spinner>
      </div>
      <workspace-folder v-for="folder in folders" :info="folder" :key="folder.path"/>
    </div>

    <b-modal
      v-model="notesVisible"
      ok-title="Save"
      cancel-title="Back"
      @ok="saveNotes"
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

    </b-modal>

    <b-modal
      v-model="cfgVisible"
      ok-title="Save"
      cancel-title="Back"
      @ok="saveConfig"
    >
      <template v-slot:modal-title>Config folder {{ $store.state.notes.folder.name }}</template>

      <div>
        <v-jsoneditor v-model="jsonConfig" :plus="false" height="400px"/>
      </div>

    </b-modal>


  </div>
</template>
<script>
  import api from '../api'
  import WorkspaceFolder from "../components/WorkspaceFolder.vue";

  export default {
    name: 'WorkSpace',
    components: {WorkspaceFolder},
    data() {
      return {
        folders: [],
        loading: false
      }
    },
    computed: {
      notesVisible :{
        get: function () {
          return this.$store.state.notes.visible
        },
        set: function (visible) {
          this.$store.dispatch('notes/setVisible', visible)
        }
      },
      cfgVisible :{
        get: function () {
          return this.$store.state.wsconfig.visible
        },
        set: function (visible) {
          this.$store.dispatch('wsconfig/setVisible', visible)
        }
      },
      notesContent: {
        get() {
          return this.$store.state.notes.folder.notes
        },
        set(val) {
          this.$store.dispatch('notes/setContent', val)
        }
      },
      jsonConfig: {
        get() {
          return this.$store.state.wsconfig.folder.config
        },
        set(val) {
          this.$store.dispatch('wsconfig/setConfig', val)
        }
      },

    },
    methods: {
      async loadFolders() {
        this.loading = true
        const response = await api.getSubfolders('root')
        this.folders = response.subFolders
        this.loading = false
      },
      saveNotes() {
        this.$store.dispatch('notes/save')
        .then(() => {
          this.loadFolders()
        })
      },
      saveConfig() {
        this.$store.dispatch('wsconfig/save')
          .then(() => {
            this.loadFolders()
          })
      }
    },
    mounted() {
      this.loadFolders()
    }
  }
</script>
<style lang="scss">
  $height: 60px;
  .spinner-container {
    text-align: center;
  }

  .ws-container {
    .folder-label {
      height: $height;
      margin-bottom: 10px;
      background: #fff;
      display: flex;
      justify-content: space-between;
      padding: 0 10px;
      -webkit-box-shadow: 0px 1px 10px -7px #222222;
      -moz-box-shadow: 0px 1px 10px -7px #222222;
      box-shadow: 0px 1px 10px -7px #222222;

      border-radius: 2px;

      .name {
        height: $height;
        line-height: $height;
        font-weight: bold;
      }

      .options {
        display: flex;
        height: $height;
        line-height: $height;
        .option-icon {
          cursor: pointer;
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
        }
      }
    }
  }
</style>
