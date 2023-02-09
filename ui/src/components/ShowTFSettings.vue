<template>
  <b-form v-on:submit.prevent>
    <!-- Max train steps -->
    <b-form-group
      v-bind:state="errors.max_train_steps === null ? null : false"
      v-bind:invalid-feedback="errors.max_train_steps"
      v-bind:label="titles.max_train_steps"
      label-cols-sm="4"
      label-cols-lg="3"
      label-for="max_train_steps"
    >
      <b-form-input
        id="max_train_steps"
        v-bind:state="errors.max_train_steps === null ? null : false"
        type="number"
        v-model="fields.max_train_steps"
        name="max_train_steps"
        v-on:input="validateMaxTrainSteps"
      />
    </b-form-group>

    <!-- Classes -->
    <b-form-group
      v-bind:state="errors.classes === null ? null : false"
      v-bind:invalid-feedback="errors.classes"
      v-bind:label="titles.classes"
      label-cols-sm="4"
      label-cols-lg="3"
      label-for="classes"
    >
        <tags-input
          element-id="classes"
          v-bind:only-existing-tags="true"
          v-bind:typeahead="true"
          v-bind:existing-tags="existing_classes"
          v-model="fields.classes"/>
        <b-button variant="link" v-on:click="loadSubfoldersForClasses">Load subfolders</b-button>
    </b-form-group>

    <!-- Model dir -->
    <b-form-group
      v-bind:state="errors.model_dir === null ? null : false"
      v-bind:invalid-feedback="errors.model_dir"
      v-bind:label="titles.model_dir"
      label-cols-sm="4"
      label-cols-lg="3"
      label-for="model_dir"
    >
      <b-form-input
        id="model_dir"
        type="text"
        v-bind:state="errors.model_dir === null ? null : false"
        v-on:change="validateModelDir"
        v-model="fields.model_dir"
        name="model_dir"
      />
      <b-button variant="link" v-on:click="setCurrentFolderFor('model_dir')">Set current folder</b-button>
    </b-form-group>

    <!-- Path to dataset training -->
    <b-form-group
      v-bind:state="errors.path_to_dataset_training === null ? null : false"
      v-bind:invalid-feedback="errors.path_to_dataset_training"
      v-bind:label="titles.path_to_dataset_training"
      label-cols-sm="4"
      label-cols-lg="3"
      label-for="path_to_dataset_training"
    >
      <b-form-input
        id="path_to_dataset_training"
        type="text"
        v-bind:state="errors.model_dir === null ? null : false"
        v-on:change="validatePathToDatasetTraining"
        v-model="fields.path_to_dataset_training"
        name="path_to_dataset_training"
      />
      <b-button variant="link" v-on:click="setCurrentFolderFor('path_to_dataset_training')">Set current folder</b-button>
    </b-form-group>

    <!-- Path to dataset validation -->
    <b-form-group
      v-bind:label="titles.path_to_dataset_validation"
      v-bind:state="errors.path_to_dataset_validation === null ? null : false"
      v-bind:invalid-feedback="errors.path_to_dataset_validation"
      label-cols-sm="4"
      label-cols-lg="3"
      label-for="path_to_dataset_validation"
    >
      <b-form-input
        id="path_to_dataset_validation"
        type="text"
        v-bind:state="errors.path_to_dataset_training === null ? null : false"
        v-on:change="validatePathToDatasetValidation"
        v-model="fields.path_to_dataset_validation"
        name="path_to_dataset_validation"
      />
      <b-button variant="link" v-on:click="setCurrentFolderFor('path_to_dataset_validation')">Set current folder</b-button>
    </b-form-group>

    <!-- Batch size -->
    <b-form-group
      v-bind:label="titles.batch_size"
      label-cols-sm="4"
      v-bind:state="errors.batch_size === null ? null : false"
      v-bind:invalid-feedback="errors.batch_size"
      label-cols-lg="3"
      label-for="batch_size"
    >
      <b-form-input
        id="batch_size"
        type="number"
        v-on:input="errors.batch_size = validateInteger(fields.batch_size)"
        v-bind:state="errors.batch_size === null ? null : false"
        v-model="fields.batch_size"
        name="batch_size"
      />
    </b-form-group>

    <!-- Input width -->
    <b-form-group
      v-bind:state="errors.input_width === null ? null : false"
      v-bind:invalid-feedback="errors.input_width"
      v-bind:label="titles.input_width"
      label-cols-sm="4"
      label-cols-lg="3"
      label-for="input_width"
    >
      <b-form-input
        id="input_width"
        type="number"
        v-on:input="errors.input_width = validateInteger(fields.input_width)"
        v-bind:state="errors.input_width === null ? null : false"
        v-model="fields.input_width"
        name="input_width"
      />
    </b-form-group>

    <!-- Input height -->
    <b-form-group
      v-bind:state="errors.input_height === null ? null : false"
      v-bind:invalid-feedback="errors.input_height"
      v-bind:label="titles.input_height"
      label-cols-sm="4"
      label-cols-lg="3"
      label-for="input_height"
    >
      <b-form-input
        v-on:input="errors.input_height = validateInteger(fields.input_height)"
        v-bind:state="errors.input_height === null ? null : false"
        id="input_height"
        type="number"
        v-model="fields.input_height"
        name="input_height"
      />
    </b-form-group>

    <!-- Input depth -->
    <b-form-group
      v-bind:state="errors.input_depth === null ? null : false"
      v-bind:invalid-feedback="errors.input_depth"
      v-bind:label="titles.input_depth"
      label-cols-sm="4"
      label-cols-lg="3"
      label-for="input_depth"
    >
      <b-form-input
        v-on:input="errors.input_depth = validateInteger(fields.input_depth)"
        v-bind:state="errors.input_depth === null ? null : false"
        id="input_depth"
        type="number"
        v-model="fields.input_depth"
        name="input_depth"
      />
    </b-form-group>

    <!-- Learning rate -->
    <b-form-group
      v-bind:state="errors.learning_rate === null ? null : false"
      v-bind:invalid-feedback="errors.learning_rate"
      v-bind:label="titles.learning_rate"
      label-cols-sm="4"
      label-cols-lg="3"
      label-for="learning_rate"
    >
      <b-form-input
        id="learning_rate"
        type="number"
        step="0.01"
        v-on:input="errors.learning_rate = validateFloat(fields.learning_rate)"
        v-bind:state="errors.learning_rate === null ? null : false"
        v-model="fields.learning_rate"
        name="learning_rate"
      />
    </b-form-group>

    <!-- Rename -->
    <b-form-group
      v-bind:label="titles.rename"
      label-cols-sm="4"
      label-cols-lg="3"
      label-for="rename"
    >
      <b-form-checkbox
        id="rename"
        v-model="fields.rename"
        name="rename"
      />
    </b-form-group>

    <!-- Network architecture -->
    <b-form-group
      v-bind:label="titles.network_architecture"
      label-cols-sm="4"
      label-cols-lg="3"
      label-for="network_architecture"
    >
      <b-form-input
        id="network_architecture"
        type="text"
        v-model="fields.network_architecture"
        name="network_architecture"
      />
    </b-form-group>

    <!-- Good class -->
    <b-form-group
      v-bind:label="titles.good_class"
      label-cols-sm="4"
      label-cols-lg="3"
      label-for="good_class"
    >
      <b-form-input
        id="good_class"
        type="text"
        v-model="fields.good_class"
        name="good_class"
      />
    </b-form-group>

    <!-- Log every n steps -->
    <b-form-group
      v-bind:state="errors.log_every_n_steps === null ? null : false"
      v-bind:invalid-feedback="errors.log_every_n_steps"
      v-bind:label="titles.log_every_n_steps"
      label-cols-sm="4"
      label-cols-lg="3"
      label-for="log_every_n_steps"
    >
      <b-form-input
        v-on:input="errors.log_every_n_steps = validateInteger(fields.log_every_n_steps)"
        v-bind:state="errors.log_every_n_steps === null ? null : false"
        id="log_every_n_steps"
        type="number"
        v-model="fields.log_every_n_steps"
        name="log_every_n_steps"
      />
    </b-form-group>

    <!-- Workspace -->
    <b-form-group
      v-bind:label="titles.workspace"
      label-cols-sm="4"
      label-cols-lg="3"
      label-for="workspace"
    >
      <b-form-input
        id="workspace"
        type="text"
        readonly
        v-model="fields.workspace"
        name="workspace"
      />
    </b-form-group>
    <b-button variant="success" v-on:click="saveFile" v-bind:disabled="hasErrors">Save</b-button>
  </b-form>
</template>

<script>
import '@voerro/vue-tagsinput/dist/style.css'
import axios from 'axios'
import api from '../utils/api.js'

function isInteger(value) {
  if (typeof value === 'number') return value % 1 === 0
  if (typeof value === 'string') return /^\d+$/.test(value)
  return false
}
function isFloat(value) {
  if (typeof value === 'string') return /^[\d.]+$/.test(value)
  return false
}
function isLinuxPath(path) {
  return !path.includes('\\')
}
function getFolder(path) {
  if (isLinuxPath(path)) {
    const tmp = path.split('/')
    tmp.splice(tmp.length - 1, 1)
    return tmp.join('/')
  }
  const tmp = path.split('\\')
  tmp.splice(tmp.length - 1, 1)
  return tmp.join('\\')
}
function getLastDirectory(path) {
  if (isLinuxPath(path)) {
    const tmp = path.split('/')
    return tmp[tmp.length - 1]
  }
  return path.match(/[^\\/:*?"<>|\r\n]+$/)[0]
}
function isTrainDirectory(value) {
  return getLastDirectory(value) === 'train'
}
function isValidateDirectory(value) {
  return getLastDirectory(value) === 'validate'
}

export default {
  name: 'ShowTFSettings',
  props: { file: { type: Object, required: true } },
  data() {
    return {
      originalJSON: '',
      parseInt: ['max_train_steps', 'batch_size', 'input_width', 'input_height', 'input_depth', 'log_every_n_steps'],
      parseFloat: ['learning_rate'],
      existing_classes: {
        Boden: 'Boden',
        Bubble: 'Bubble',
        Bubble2: 'Bubble2',
        Flocke: 'Flocke',
        Line: 'Line',
        Particle1: 'Particle1',
        Particle2: 'Particle2',
        Raute: 'Raute',
        Triangle: 'Triangle',
        Vertex: 'Vertex',
      },
      fields: {
        max_train_steps: 0,
        classes: [],
        model_dir: '',
        path_to_dataset_training: '',
        path_to_dataset_validation: '',
        batch_size: 0,
        input_width: 0,
        input_height: 0,
        input_depth: 0,
        learning_rate: 0.0,
        rename: false,
        network_architecture: '',
        good_class: '',
        log_every_n_steps: 0,
      },
      errors: {
        max_train_steps: null,
        classes: null,
        model_dir: null,
        path_to_dataset_training: null,
        path_to_dataset_validation: null,
        batch_size: null,
        input_width: null,
        input_height: null,
        input_depth: null,
        learning_rate: null,
        rename: null,
        network_architecture: null,
        good_class: null,
        log_every_n_steps: null,
      },
      titles: {
        max_train_steps: 'Max train steps',
        classes: 'Classes',
        model_dir: 'Model directory',
        path_to_dataset_training: 'Path to dataset training',
        path_to_dataset_validation: 'Path to dataset validation',
        batch_size: 'Batch size',
        input_width: 'Input width',
        input_height: 'Input height',
        input_depth: 'Input depth',
        learning_rate: 'Learning rate',
        rename: 'Rename',
        network_architecture: 'Network architecture',
        good_class: 'Good class',
        log_every_n_steps: 'Log every N steps',
      },
    }
  },
  computed: {
    hasErrors() {
      return Object.keys(this.errors).some((field) => this.errors[field])
    },
  },
  methods: {
    validateInteger(value) {
      return !isInteger(value) ? 'The value must be an integer' : null
    },
    validateFloat(value) {
      return !isFloat(value) ? 'The value must be a float number' : null
    },
    validateMaxTrainSteps() {
      this.errors.max_train_steps = this.validateInteger(this.fields.max_train_steps)
    },
    async validateClasses() {
      const supportedClasses = await api.getSubfolders(getFolder(this.file.path))
      const bad = this.fields.classes.find((el) => !supportedClasses.includes(el))
      this.errors.classes = bad ? `Unsupported element ${bad}` : null
    },
    async validateModelDir() {
      const result = await api.checkFolder(this.fields.model_dir)
      if (result === 'ok') this.errors.model_dir = null
      if (result === 'not_found') this.errors.model_dir = 'That directory isn\'t found'
      if (result === 'access_denied') this.errors.model_dir = 'The folder is out of the root directory'
    },
    async validatePathToDatasetTraining() {
      if (!isTrainDirectory(this.fields.path_to_dataset_training)) {
        this.errors.path_to_dataset_training = 'The directory must be a train directory'
        return
      }
      const result = await api.checkFolder(this.fields.path_to_dataset_training)
      if (result === 'ok') this.errors.path_to_dataset_training = null
      if (result === 'not_found') this.errors.path_to_dataset_training = 'That directory isn\'t found'
      if (result === 'access_denied') this.errors.path_to_dataset_training = 'The folder is out of the root directory'
    },
    async validatePathToDatasetValidation() {
      if (!isValidateDirectory(this.fields.path_to_dataset_validation)) {
        this.errors.path_to_dataset_validation = 'The directory must be a validate directory'
        return
      }
      const result = await api.checkFolder(this.fields.path_to_dataset_validation)
      if (result === 'ok') this.errors.path_to_dataset_validation = null
      if (result === 'not_found') this.errors.path_to_dataset_validation = 'That directory isn\'t found'
      if (result === 'access_denied') this.errors.path_to_dataset_validation = 'The folder is out of the root directory'
    },
    async loadSubfoldersForClasses() {
      const subfolders = await api.getSubfolders(getFolder(this.file.path))
      this.fields.classes = subfolders
    },
    setCurrentFolderFor(fieldname) {
      this.fields[fieldname] = getFolder(this.file.path)
    },
    async loadFile() {
      const { data } = await axios.get(this.file.serverPath)
      this.originalJSON = data
      Object.keys(this.fields).forEach((field) => {
        this.fields[field] = data[field] || this.fields[field]
      })
    },
    async saveFile() {
      const data = {
        ...this.originalJSON,
        ...this.fields,
      }
      this.parseInt.forEach((fieldname) => {
        // eslint-disable-next-line radix
        data[fieldname] = data[fieldname] ? parseInt(data[fieldname]) : data[fieldname]
      })
      this.parseFloat.forEach((fieldname) => {
        data[fieldname] = data[fieldname] ? parseFloat(data[fieldname]) : data[fieldname]
      })
      await api.saveFile(this.file.path, JSON.stringify(data, null, 2))
      this.$emit('saved')
    },
  },
  created() {
    this.loadFile()
    this.fields.workspace = getFolder(this.file.path)
  },
}
</script>
