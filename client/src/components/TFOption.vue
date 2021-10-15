<template>
  <b-modal v-on:shown="onOpen" size="md" ref="modal" title="AI Settings">
    <template v-if="!canEditConfigAIUI">
      <div id="wsjsoneditor" style="height: 400px;"/>
    </template>
    <template v-else>
      <template v-for="schema in schemas">
        <s-field
          v-if="canEditConfigFullAIUI || limitAIUI.includes(schema.field)"
          :key="`${schema.field}-${fetchCount}`"
          :schema="schema" :value="data[schema.field]"
          @input="data[schema.field] = $event"/>
      </template>
    </template>
    <template v-slot:modal-footer>
      <b-button variant="primary" @click="saveFile">Save</b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters } from 'vuex'
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
      limitAIUI: [
        'max_train_steps',
        'classes',
        'batch_size',
        'input_width',
        'input_height',
        'input_depth',
        'ViewLogLines',
        'heatmap_types',
      ],
      schemas: [
        {
          label: 'Max Train Steps',
          field: 'max_train_steps',
          type: types.NUMBER,
          options: {},
        },
        {
          label: 'Training Classes',
          field: 'classes',
          type: types.T_ARRAY,
          options: {},
        },
        {
          label: 'Model directory',
          field: 'model_dir',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Batch Size',
          field: 'batch_size',
          type: types.NUMBER,
          options: {},
        },
        {
          label: 'Input width',
          field: 'input_width',
          type: types.NUMBER,
          options: {},
        },
        {
          label: 'Input height',
          field: 'input_height',
          type: types.NUMBER,
          options: {},
        },
        {
          label: 'Input depth',
          field: 'input_depth',
          type: types.NUMBER,
          options: {},
        },
        {
          label: 'Heatmap types',
          field: 'heatmap_types',
          type: types.SELECT,
          options: {
            dataset: [
              {
                value: 'overlay',
                label: 'Overlay',
              },
            ],
          },
        },
        {
          label: 'Augmentation noise std',
          field: 'augmentation_noise_std',
          type: types.NUMBER,
          options: {},
        },
        {
          label: 'Augmentation brightness delta',
          field: 'augmentation_brightness_delta',
          type: types.NUMBER,
          options: {},
        },
        {
          label: 'Learning rate',
          field: 'learning_rate',
          type: types.NUMBER,
          options: {},
        },
        {
          label: 'Enable linear stretch images',
          field: 'enable_linear_stretch_images',
          type: types.BOOLEAN,
          options: {},
        },
        {
          label: 'Enable augmentation noise',
          field: 'enable_augmentation_noise',
          type: types.BOOLEAN,
          options: {},
        },
        {
          label: 'Enable augmentation mirror',
          field: 'enable_augmentation_mirror',
          type: types.BOOLEAN,
          options: {},
        },
        {
          label: 'Enable augmentation brightness',
          field: 'enable_augmentation_brightness',
          type: types.BOOLEAN,
          options: {},
        },
        {
          label: 'Rename',
          field: 'rename',
          type: types.BOOLEAN,
          options: {},
        },
        {
          label: 'Network architecture',
          field: 'network_architecture',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Good class',
          field: 'good_class',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Log every n steps',
          field: 'log_every_n_steps',
          type: types.NUMBER,
          options: {},
        },
        {
          label: 'Workspace path',
          field: 'workspace',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Train script name',
          field: 'script_training',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Test script name',
          field: 'script_test',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Validate script name',
          field: 'script_validate',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Cleanup',
          field: 'script_training2',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Prepare Data',
          field: 'script_test2',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Backup',
          field: 'script_validate2',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Stop train script name',
          field: 'script_stop_train',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Stop test script name',
          field: 'script_stop_test',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Stop validate script name',
          field: 'script_stop_validate',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Export model script name',
          field: 'script_export_model',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Export result script name',
          field: 'script_export_result',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Export images script name',
          field: 'script_export_image',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Create report script name',
          field: 'script_report',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'split data script name',
          field: 'script_split_data',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Heatmap generation script',
          field: 'script_visualize_heatmap',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Path to log training file',
          field: 'path_log_training',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Path to log test file',
          field: 'path_log_test',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Path to log validate file',
          field: 'path_log_validate',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Path to exported model file',
          field: 'path_field_export_model',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Path to exported results file',
          field: 'path_field_export_results',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Path to exported images folder',
          field: 'path_field_export_images',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Path to train folder',
          field: 'path_train',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Path to test folder',
          field: 'path_test',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'Path to validate folder',
          field: 'path_validate',
          type: types.TEXT,
          options: {},
        },
        {
          label: 'The numbers of lines to be displayed',
          field: 'ViewLogLines',
          type: types.NUMBER,
          options: {},
        },
        {
          label: 'Default epoch',
          field: 'defaultEpoch',
          type: types.NUMBER,
          options: {},
        },
        {
          label: 'Default learning rate',
          field: 'defaultLearningRate',
          type: types.NUMBER,
          options: {},
        },
        {
          label: 'Tenser Board Url',
          field: 'LiveViewURL',
          type: types.TEXT,
          options: {},
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
        enable_augmentation_brightness: false,
        rename: false,
        network_architecture: '',
        good_class: '',
        log_every_n_steps: 0,
        workspace: '',
        script_training: null,
        script_test: null,
        script_validate: null,
        script_training2: null,
        script_test2: null,
        script_validate2: null,
        script_stop_training: null,
        script_stop_test: null,
        script_stop_validation: null,
        script_export_model: null,
        script_export_result: null,
        script_export_image: null,
        script_report: null,
        script_split_data: null,
        script_visualize_heatmap: null,
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
        LiveViewURL: null,
      },
      fetchCount: 1,
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
      if (!this.canEditConfigAIUI) {
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
      if (!this.canEditConfigAIUI && this.editor) {
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
  computed: {
    ...mapGetters([
      'canEditConfigAIUI',
      'canEditConfigFullAIUI',
    ]),
  },
}
</script>

<style scoped>

</style>
