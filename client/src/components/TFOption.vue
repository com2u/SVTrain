<template>
  <b-modal v-on:shown="onOpen" size="md" ref="modal" title="AI Settings">
    <template v-if="editorText">
      <div id="wsjsoneditor" style="height: 400px;"/>
    </template>
    <template v-else>
      <s-field v-for="schema in schemas" :key="`${schema.field}-${fetchCount}`"
               :schema="schema" :value="data[schema.field]"
               @input="data[schema.field] = $event"/>
    </template>
    <template v-slot:modal-footer>
      <b-button variant="primary" @click="saveFile">Save</b-button>
    </template>
  </b-modal>
</template>

<script>
import axios from 'axios'
import api from '@/utils/api'
import { getFileServerPath } from '@/utils'
import JSONEditor from 'jsoneditor'
import * as types from './field/data_types'
import SField from './field/Index.vue'

export default {
  name: 'TFOption',
  components: {
    's-field': SField,
  },
  props: {
    ws: {
      default: null,
      type: String,
    },
  },
  data() {
    return {
      schemas: [
        {
          label: 'Default epoch',
          field: 'defaultEpoch',
          type: types.NUMBER,
          options: {
            help: 'A default setting for the training mechanism.',
          },
        },
        {
          label: 'Default learning rate',
          field: 'defaultLearningRate',
          type: types.NUMBER,
          options: {
            help: 'A default setting for the training mechanism.',
          },
        },
        {
          label: 'Train script name',
          field: 'script_training',
          type: types.TEXT,
          options: { help: 'script_training' },
        },
        {
          label: 'Test script name',
          field: 'script_test',
          type: types.TEXT,
          options: { help: 'script_test' },
        },
        {
          label: 'Validate script name',
          field: 'script_validate',
          type: types.TEXT,
          options: { help: 'script_validate' },
        },
        {
          label: 'Stop train script name',
          field: 'script_stop_train',
          type: types.TEXT,
          options: { help: 'script_stop_train' },
        },
        {
          label: 'Stop test script name',
          field: 'script_stop_test',
          type: types.TEXT,
          options: { help: 'script_stop_test' },
        },
        {
          label: 'Stop validate script name',
          field: 'script_stop_validate',
          type: types.TEXT,
          options: { help: 'script_stop_validate' },
        },
        {
          label: 'Export model script name',
          field: 'script_export_model',
          type: types.TEXT,
          options: { help: 'script_export_model' },
        },
        {
          label: 'Export result script name',
          field: 'script_export_result',
          type: types.TEXT,
          options: { help: 'script_export_result' },
        },
        {
          label: 'Export images script name',
          field: 'script_export_image',
          type: types.TEXT,
          options: { help: 'script_export_image' },
        },
        {
          label: 'Create report script name',
          field: 'script_report',
          type: types.TEXT,
          options: { help: 'script_report' },
        },
        {
          label: 'split data script name',
          field: 'script_split_data',
          type: types.TEXT,
          options: { help: 'script_split_data' },
        },
        {
          label: 'Path to log training file',
          field: 'path_log_training',
          type: types.TEXT,
          options: { help: 'path_log_training' },
        },
        {
          label: 'Path to log test file',
          field: 'path_log_test',
          type: types.TEXT,
          options: { help: 'path_log_test' },
        },
        {
          label: 'Path to log validate file',
          field: 'path_log_validate',
          type: types.TEXT,
          options: { help: 'path_log_validate' },
        },
        {
          label: 'Path to exported model file',
          field: 'path_field_export_model',
          type: types.TEXT,
          options: { help: 'path_file_export_model' },
        },
        {
          label: 'Path to exported results file',
          field: 'path_field_export_results',
          type: types.TEXT,
          options: { help: 'path_file_export_results' },
        },
        {
          label: 'Path to exported images folder',
          field: 'path_field_export_images',
          type: types.TEXT,
          options: { help: 'path_file_export_images' },
        },
        {
          label: 'Path to train folder',
          field: 'path_train',
          type: types.TEXT,
          options: { help: 'path_train' },
        },
        {
          label: 'Path to test folder',
          field: 'path_test',
          type: types.TEXT,
          options: { help: 'path_test' },
        },
        {
          label: 'Path to validate folder',
          field: 'path_validate',
          type: types.TEXT,
          options: { help: 'path_validate' },
        },
      ],
      data: {},
      fields: {
        max_train_steps: 0,
        classes: [],
        model_dir: '',
        batch_size: 0,
        input_width: 0,
        input_height: 0,
        input_depth: 0,
        augmentation_noise_std: 0.0,
        augmentation_brightness_delta: 0.0,
        learning_rate: 0.0,
        enable_linear_stretch_images: false,
        enable_augmentation_noise: false,
        enable_augmentation_mirror: false,
        enable_augmentation_brigthness: false,
        rename: false,
        network_architecture: '',
        good_class: '',
        log_every_n_steps: 0,
        workspace: '',
        script_training: null,
        script_test: null,
        script_validate: null,
        script_stop_training: null,
        script_stop_test: null,
        script_stop_validation: null,
        script_export_model: null,
        script_export_result: null,
        script_export_image: null,
        script_report: null,
        script_split_data: null,
        path_log_training: null,
        path_log_test: null,
        path_log_validate: null,
        path_field_export_model: null,
        path_field_export_results: null,
        path_field_export_images: null,
        path_train: null,
        path_test: null,
        path_validate: null,
        defaultEpoch: null,
        defaultLearningRate: null,
      },
      fetchCount: 1,
      editorText: true,
      editor: null,
    }
  },
  methods: {
    async loadFile() {
      const ws = this.ws.split('/').pop()
      const { data } = await axios.get(`${getFileServerPath()}${ws}/TFSettings.json`)
      Object.keys(this.fields).forEach((field) => {
        this.fields[field] = data[field] || this.fields[field]
      })
      this.fetchCount += 1
      this.data = typeof data === 'object' ? data : {}
      if (this.editorText) {
        const container = document.getElementById('wsjsoneditor')
        const options = {
          mode: 'code',
        }
        const editor = new JSONEditor(container, options)
        this.editor = editor
        editor.set(this.data)
      }
    },
    async saveFile() {
      if (this.editorText && this.editor) {
        this.data = this.editor.get()
      }
      const data = {
        ...this.fields,
        ...this.data,
      }
      const filePath = `${this.ws}/TFSettings.json`
      await api.saveFile(filePath, JSON.stringify(data, null, 2))
      this.$refs.modal.hide()
    },
    onOpen() {
      this.loadFile()
    },
  },
}
</script>

<style scoped>

</style>
