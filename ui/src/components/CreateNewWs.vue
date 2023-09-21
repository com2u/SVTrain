<template>
  <b-modal :id="id" title="Create a workspace and select template" ok-title="Create" ref="modal" @ok="createWorkspace"
    @hidden="handleHidden" @shown="handleShown" :ok-disabled="!isValid">
    <b-form @submit.prevent>
      <b-form-group label="Name" label-for="workspace-name" :invalid-feedback="'Name is required'" :state="isValid">
        <b-form-input ref="workspaceName" @keyup.enter="handleEnter" v-model="name" :state="isValid" trim />
      </b-form-group>

      <b-form-group label="Choose Workspace by selecting appropriate template">
        <b-form-radio-group v-model="selectedWorkspace">
          <b-form-radio value="Training">Training</b-form-radio>
          <b-form-radio value="Labeling">Labeling</b-form-radio>
        </b-form-radio-group>
      </b-form-group>

      <b-form-group label="Add Folder Names">
        <div class="folder-name" v-for="(folder, index) in folders" :key="index">
          <b-form-input class="folder-name-input" v-model="folders[index]" placeholder="Folder Name" />
          <b-icon class="folder-name-delete" @click="removeFolder(index)" icon="trash" aria-hidden="true"></b-icon>
        </div>
        <button class="folder-name-add" @click="addFolder">Add Folder <b-icon icon="plus-circle"
            aria-hidden="true"></b-icon></button>
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import api from '../utils/api.js'
import EventBus from '../utils/eventbus'

export default {
  name: 'CreatingFolder',
  props: {
    path: { required: true, default: () => '' },
    id: {
      type: String,
      default: 'creating-folder-modal',
    },
  },
  data() {
    return {
      name: null,
      createPath: this.path,
      selectedWorkspace: 'Training',
      folders: [],
    }
  },
  computed: {
    isValid() {
      return this.name === null ? this.name : !!this.name
    },
  },
  methods: {
    async createWorkspace() {
      await api.createWorkspace(this.createPath, this.name, this.folders)
      this.$emit('folder-created')
      this.name = null
      this.folders = []
    },
    handleEnter() {
      if (!this.name) return
      this.createWorkspace().then(() => {
        this.$refs.modal.hide()
      })
    },
    handleHidden(evt) {
      this.$emit('hidden', evt)
    },
    handleShown(evt) {
      this.$refs.workspaceName.focus()
      this.$emit('shown', evt)
      if (this.selectedWorkspace === 'Training') {
        this.folders = ['model', 'test', 'train', 'validate']
      }
    },
    onCreateNewFolder(path) {
      this.createPath = path
      if (this.$refs.modal) {
        this.$refs.modal.show()
      }
    },
    addFolder() {
      this.folders.push('')
    },
    removeFolder(index) {
      this.folders.splice(index, 1)
    },
  },
  watch: {
    selectedWorkspace(newValue, oldValue) {
      if (newValue === 'Labeling') {
        this.folders = []
      } else if (newValue === 'Training' && oldValue !== 'Training') {
        this.folders = ['model', 'test', 'train', 'validate']
      }
    },
  },
  mounted() {
    EventBus.$on('create-new-ws', this.onCreateNewFolder)
    if (this.selectedWorkspace === 'Training') {
      this.folders = ['model', 'test', 'train', 'validate']
    }
  },
  beforeDestroy() {
    EventBus.$off('create-new-ws', this.onCreateNewFolder)
  },
}
</script>
<style lang="scss" scoped>
.folder-name {
  display: flex;
  gap: 1rem;
  margin: 1rem 1rem 0 0;

  .folder-name-input {
    width: 80%;
    border: none;
    background-color: #f1f1ff;
    outline: none;
    color: #333;

    :focus {
      outline: 0px;
    }
  }

  .folder-name-delete {
    font-size: 1.4rem;
    cursor: pointer;
    margin-top: 5px;
  }
}

.folder-name-add {
  border: none;
  outline: none;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  padding: 5px 10px;
  margin-top: 1rem;
}
</style>
