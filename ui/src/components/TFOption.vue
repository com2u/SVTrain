<template>
  <b-modal v-on:shown="onOpen" size="xl" ref="modal" title="AI Settings">
    <template v-if="!canEditConfigAIUI">
      <div id="wsjsoneditor" style="height: 400px" />
    </template>
    <template v-else>
      <template v-for="category in Object.keys(schemas)">
        <section
          :key="category"
          v-if="canEditConfigFullAIUI || limitAIUI.includes(category)"
          :class="{ expanded: expandedCategory === category }"
        >
          <h5
            @click="
              expandedCategory = expandedCategory === category ? null : category
            "
          >
            <v-icon
              :name="`arrow-${expandedCategory === category ? 'down' : 'up'}`"
            />
            {{ category }}
          </h5>
          <div>
            <template v-for="schema in schemas[category]">
              <s-field
                :key="`${schema.field}-${fetchCount}`"
                :schema="schema"
                :value="data[schema.field]"
                @input="data[schema.field] = $event"
              />
            </template>
          </div>
        </section>
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
      limitAIUI: ['AI Training'],
      expandedCategory: null,
      schemas: {
        Splitting: [
          {
            label: 'Split Strategy',
            field: 'group_by_strategy',
            type: types.SELECT,
            options: {
              dataset: [
                {
                  value: 'RandomSplitDataset',
                  label: 'RandomSplitDataset',
                },
              ],
            },
          },
          {
            label: 'seed',
            field: 'seed',
            type: types.NUMBER,
            default: null,
            options: {
              min: 0,
              max: 10000000000,
              placeholder: '',
            },
          },
          {
            label: 'Split Stages',
            field: 'split_stages',
            type: types.JSON,
            options: {
              schemas: [
                {
                  label: 'Train',
                  field: 'train',
                  type: types.NUMBER,
                  options: {
                    min: 0,
                    max: 1,
                    placeholder: '0.0',
                  },
                },
                {
                  label: 'Test',
                  field: 'test',
                  type: types.NUMBER,
                  options: {
                    min: 0,
                    max: 1,
                    placeholder: '0.0',
                  },
                },
                {
                  label: 'Validation',
                  field: 'val',
                  type: types.NUMBER,
                  options: {
                    min: 0,
                    max: 1,
                    placeholder: '0.0',
                  },
                },
              ],
            },
          },
        ],
        'AI Training': [
          {
            label: 'Max Train Steps',
            field: 'epochs',
            type: types.NUMBER,
            options: {
              help: 'How many training iterations will be calculated (epocs)',
            },
          },
          {
            label: 'Image size',
            field: 'image_shape',
            type: types.J_ARRAY,
            options: {
              hasAuto: true,
              schemas: [
                {
                  label: 'width',
                  field: '0',
                  type: types.NUMBER,
                  default: 0,
                  options: {
                    placeholder: '0',
                  },
                },
                {
                  label: 'height',
                  field: '1',
                  type: types.NUMBER,
                  default: 0,
                  options: {
                    placeholder: '0',
                  },
                },
                {
                  label: 'depth',
                  field: '2',
                  type: types.NUMBER,
                  default: 0,
                  options: {
                    placeholder: '0',
                  },
                },
              ],
              help: 'The Image Size and color depth. "Auto" as default',
            },
          },
          {
            label: 'Resize',
            field: 'resize',
            type: types.JSON,
            options: {
              hasAuto: false,
              schemas: [
                {
                  label: 'Size',
                  field: 'size',
                  type: types.J_ARRAY,
                  options: {
                    hasAuto: true,
                    schemas: [
                      {
                        label: 'width',
                        field: '0',
                        type: types.NUMBER,
                        default: 0,
                        options: {
                          placeholder: '0',
                        },
                      },
                      {
                        label: 'height',
                        field: '1',
                        type: types.NUMBER,
                        default: 0,
                        options: {
                          placeholder: '0',
                        },
                      },
                    ],
                  },
                },
              ],
              help: 'Specified Resolution for training and model',
            },
          },
          {
            label: 'Training Classes',
            field: 'classes',
            type: types.T_ARRAY,
            options: {
              hasAuto: true,
              placeholder: 'Add',
              help: 'The names for the defect classes',
            },
          },
          {
            label: 'Begin new model',
            field: 'overwrite_model',
            type: types.BOOLEAN,
            options: {
              help: 'Overwite an existing model',
            },
          },
          {
            label: 'Rename images',
            field: 'rename_after_test',
            type: types.BOOLEAN,
            options: {
              help: 'Add defect class to the image file names',
            },
          },
          {
            label: 'GPU',
            field: 'GPU',
            type: types.BOOLEAN,
            options: {
              help: 'Use GPU for training',
            },
          },
          {
            label: 'Optimizer',
            field: 'optimizer',
            type: types.SELECT,
            options: {
              dataset: [
                {
                  value: 'Adam',
                  label: 'Adam',
                },
                {
                  value: 'RMSprop',
                  label: 'RMSprop',
                },
                {
                  value: 'SGD',
                  label: 'SGD',
                },
              ],
            },
          },
          {
            label: 'Epsilon',
            field: 'epsilon',
            type: types.NUMBER,
            options: {
              help: 'Is used only by some specific optimizers',
            },
          },
          {
            label: 'Learning rate',
            field: 'learning_rate',
            type: types.NUMBER,
            options: {
              help: 'Hyperparameter to control how much to change the model in response to the estimated error',
            },
          },
          {
            label: 'Batch Size',
            field: 'batch_size',
            type: types.NUMBER,
            options: {
              info: 'Amount of images in one training batch',
            },
          },
          {
            label: 'Shuffle buffer',
            field: 'shuffle_buffer',
            type: types.NUMBER,
            options: {
              help: 'Number of images used to randomly choose batch images',
            },
          },
          {
            label: 'Save best only',
            field: 'save_best_only',
            type: types.BOOLEAN,
            options: {
              help: 'Save the model only when it was improved',
            },
          },
          {
            label: 'Validation frequency',
            field: 'validation_freq',
            type: types.NUMBER,
            options: {
              info: 'frequency in epochs of validation e.g. if set to 1 the model will be evaluated after each epoch',
            },
          },
          {
            label: 'Metrics',
            field: 'metrics',
            type: types.T_ARRAY,
            options: {
              help: 'Metrics to be evaluated and tracked in tensorboard',
              placeholder: 'Add',
            },
          },
          {
            label: 'Monitor',
            field: 'monitor',
            type: types.SELECT,
            options: {
              dataset: [
                {
                  value: 'val_categorical_accuracy',
                  label: 'val_categorical_accuracy',
                },
              ],
              help: 'Which metric to monitor to save best checkpoint',
            },
          },
          {
            label: 'Monitor mode ',
            field: 'monitor_mode',
            type: types.SELECT,
            options: {
              dataset: [
                {
                  value: 'min',
                  label: 'min',
                },
                {
                  value: 'max',
                  label: 'max',
                },
              ],
              help: '"max" / "min" defines what "best" is, e.g. for accuracy it should be "max", for loss function it should be "min"',
            },
          },
        ],
        'AI Model': [
          {
            label: 'Network architecture',
            field: 'network_architecture',
            type: types.SELECT,
            options: {
              dataset: [
                { value: 'VGG16', label: 'VGG16' },
                { value: 'InceptionV3', label: 'InceptionV3' },
                { value: 'MobileNetV2', label: 'MobileNetV2' },
                { value: 'EfficientNetB0', label: 'EfficientNetB0' },
                { value: 'EfficientNetB1', label: 'EfficientNetB1' },
                { value: 'EfficientNetB2', label: 'EfficientNetB2' },
                { value: 'EfficientNetB3', label: 'EfficientNetB3' },
                { value: 'EfficientNetB4', label: 'EfficientNetB4' },
                { value: 'EfficientNetB5', label: 'EfficientNetB5' },
                { value: 'EfficientNetB6', label: 'EfficientNetB6' },
                { value: 'EfficientNetB7', label: 'EfficientNetB7' },
                { value: 'net_CPCP', label: 'net_CPCP' },
                { value: 'net_CPCPCP', label: 'net_CPCPCP' },
                { value: 'net_CPCPCPCP', label: 'net_CPCPCPCP' },
                { value: 'net_CCPCCP', label: 'net_CCPCCP' },
                { value: 'net_CCPCCPCCP', label: 'net_CCPCCPCCP' },
                { value: 'net_CCPCCPCCPCCP', label: 'net_CCPCCPCCPCCP' },
                { value: 'anomaly_CPCPCP', label: 'anomaly_CPCPCP' },
                { value: 'anomaly_CPCPCPCP', label: 'anomaly_CPCPCPCP' },
                { value: 'anomaly_CPCPCPCPCP', label: 'anomaly_CPCPCPCPCP' },
                { value: 'anomaly_CPCPCP128', label: 'anomaly_CPCPCP128' },
                { value: 'anomaly_CPCPCPCP128', label: 'anomaly_CPCPCPCP128' },
                { value: 'anomaly_CPCPCPCPCP128', label: 'anomaly_CPCPCPCPCP128' },
              ],
              help: "is the network architecture e.g. 'net_CPCPCP' or 'InceptionV3'",
            },
          },
          {
            label: 'Activation function',
            field: 'activation_function',
            type: types.TEXT,
            options: {
              help: "used by custom models like net_CPCP... The fastest to train are typically 'relu' and 'leaky_relu'",
            },
          },
          {
            label: 'Dropout rate',
            field: 'dropout_rate',
            type: types.NUMBER,
            options: {
              help: 'Defines the dropout layers of the model',
            },
          },
          {
            label: 'Kernel initializer',
            field: 'kernel_initializer',
            type: types.J_ARRAY,
            options: {
              schemas: [
                {
                  label: 'value',
                  field: '0',
                  type: types.SELECT,
                  default: null,
                  options: {
                    dataset: [
                      {
                        value: 'glorot_normal',
                        label: 'glorot_normal',
                      },
                    ],
                  },
                },
                {
                  label: '',
                  field: 1,
                  type: types.JSON,
                  default: null,
                  options: {},
                },
              ],
            },
          },
          {
            label: 'Bias initializer',
            field: 'bias_initializer',
            type: types.J_ARRAY,
            options: {
              schemas: [
                {
                  label: 'value',
                  field: '0',
                  type: types.SELECT,
                  default: null,
                  options: {
                    dataset: [
                      {
                        value: 'glorot_normal',
                        label: 'glorot_normal',
                      },
                    ],
                  },
                },
                {
                  label: '',
                  field: 1,
                  type: types.JSON,
                  default: null,
                  options: {},
                },
              ],
            },
          },
          {
            label: 'Kernel regularizer',
            field: 'kernel_regularizer',
            type: types.J_ARRAY,
            options: {
              schemas: [
                {
                  label: 'value',
                  field: '0',
                  type: types.TEXT,
                  default: null,
                  options: {},
                },
                {
                  label: '',
                  field: '1',
                  type: types.JSON,
                  default: null,
                  options: {},
                },
              ],
            },
          },
          {
            label: 'Bias regularizer',
            field: 'bias_regularizer',
            type: types.J_ARRAY,
            options: {
              schemas: [
                {
                  label: 'value',
                  field: '0',
                  type: types.TEXT,
                  default: null,
                  options: {},
                },
                {
                  label: '',
                  field: '1',
                  type: types.JSON,
                  default: null,
                  options: {},
                },
              ],
            },
          },
          {
            label: 'Activity regularizer',
            field: 'activity_regularizer',
            type: types.J_ARRAY,
            options: {
              schemas: [
                {
                  label: 'value',
                  field: '0',
                  type: types.TEXT,
                  default: null,
                  options: {},
                },
                {
                  label: '',
                  field: '1',
                  type: types.JSON,
                  default: null,
                  options: {},
                },
              ],
            },
          },
          {
            label: 'Input correction',
            field: 'input_correction',
            type: types.SELECT,
            options: {
              dataset: [
                {
                  value: 'none',
                  label: 'none',
                },
                {
                  value: '-1 to 1',
                  label: '-1 to 1',
                },
                {
                  value: 'min_max',
                  label: 'min_max',
                },
                {
                  value: 'mean',
                  label: 'mean',
                },
              ],
            },
          },
        ],
        'Data processing': [
          {
            label: 'Batch normalization',
            field: 'batch_normalization',
            type: types.BOOLEAN,
            options: {},
          },
          {
            label: 'Balance dataset',
            field: 'balance_dataset_to_max',
            type: types.BOOLEAN,
            options: {
              help: 'Balance dataset to max',
            },
          },
          {
            label: 'Heatmap Types',
            field: 'heatmap_types',
            type: types.SELECT,
            options: {
              multiple: true,
              dataset: [
                {
                  value: 'overlay',
                  label: 'overlay',
                },
                {
                  value: 'cam',
                  label: 'cam',
                },
              ],
              help: '(hold CTRL to select multiple options)',
            },
          },
        ],
        Augmentations: [
          {
            label: 'Augmentation count',
            field: 'augmentation_samples_number',
            type: types.NUMBER,
            options: {},
          },
          {
            label: 'Augmentations',
            field: 'augmentations',
            type: types.AUGMENTATIONS,
            options: {},
          },
        ],
        'Scripts & Folders': [
          {
            label: 'The numbers of lines to be displayed',
            field: 'ViewLogLines',
            type: types.NUMBER,
            options: {},
          },
          {
            label: 'Tensor Board Url',
            field: 'LiveViewURL',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Training path',
            field: 'path_to_dataset_training',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Validation path',
            field: 'path_to_dataset_validation',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Testset path',
            field: 'path_to_dataset_test',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Model path',
            field: 'model_dir',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Heatmap path',
            field: 'heatmap_dir',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Stop file',
            field: 'stop_file',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Classes to model',
            field: 'pack_classes_to_model',
            type: types.BOOLEAN,
            options: {
              help: 'Pack classes to model',
            },
          },
          {
            label: 'Test output path',
            field: 'test_output_dir',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Augmentation path',
            field: 'augmented_dir',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Training script ',
            field: 'script_training',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Test script',
            field: 'script_test',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Validate script',
            field: 'script_validate',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Training2 script',
            field: 'script_training2',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Test2 script',
            field: 'script_test2',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Validate2 script ',
            field: 'script_validate2',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Stop train script',
            field: 'script_stop_training',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Stop test script',
            field: 'script_stop_test',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Stop validate script',
            field: 'script_stop_validation',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Report script',
            field: 'script_report',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'split data script',
            field: 'script_split_data',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Visualize heatmap script',
            field: 'script_visualize_heatmap',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Log training path',
            field: 'path_log_training',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Log test path',
            field: 'path_log_test',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Log validate path',
            field: 'path_log_validate',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Field export model path',
            field: 'path_field_export_model',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Field export result path',
            field: 'path_field_export_results',
            type: types.TEXT,
            options: {},
          },
          {
            label: 'Field export images path',
            field: 'path_field_export_images',
            type: types.TEXT,
            options: {},
          },
        ],
      },
      data: {},
      fields: {
        epochs: 0,
        image_shape: [0, 0, 0],
        classes: [],
        overwrite_model: false,
        rename_after_test: false,
        GPU: false,
        optimizer: null,
        learning_rate: 0.0,
        batch_size: 0,
        shuffle_buffer: 100,
        save_best_only: false,
        validation_freq: 1,
        metrics: [],
        monitor: '',
        monitor_mode: '',
        // next
        model_dir: '',
        network_architecture: '',
        good_class: '',
        log_every_n_steps: 0,
        script_training: null,
        script_test: null,
        script_validate: null,
        script_training2: null,
        script_test2: null,
        script_validate2: null,
        script_stop_training: null,
        script_stop_test: null,
        script_stop_validation: null,
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
        LiveViewURL: null,
        heatmap_types: [],
        group_by_strategy: null,
        seed: null,
        split_stages: {},
        resize: {
          size: 'auto',
        },
      },
      fetchCount: 1,
      editor: null,
    }
  },
  methods: {
    async loadFile() {
      const ws = this.ws.split('/').pop()
      let { data } = await axios.get(
        `${getFileServerPath()}${ws}/TFSettings.json`,
      )
      data = {
        ...data,
        group_by_strategy: data.splits_params.group_by_strategy,
        seed: data.splits_params.seed,
        split_stages: data.splits_params.split_stages,
      }

      delete data.splits_params

      Object.keys(this.fields).forEach((field) => {
        if (field === 'resize') {
          if (data[field] === 'auto' || (Array.isArray(data[field]) && !data[field].length)) {
            data[field] = {
              size: data[field],
            }
          }
        }
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

      let data = {
        ...this.fields,
        ...this.data,
      }

      // convert to json
      data.splits_params = {
        group_by_strategy: data.group_by_strategy,
        seed: data.seed,
        split_stages: data.split_stages,
      }
      delete data.group_by_strategy
      delete data.seed
      delete data.split_stages

      data = this.transformEachChild(data, (child) => {
        if (!Number.isNaN(Number(child)) && typeof child === 'string') {
          return Number(child)
        }
        return child
      })
      const filePath = `${this.ws}/TFSettings.json`
      console.log(JSON.stringify(data, null, 2))
      await api.saveFile(filePath, JSON.stringify(data, null, 2))
      // this.$refs.modal.hide()
    },
    onOpen() {
      this.loadFile()
    },
    transformEachChild(obj, callback) {
      // eslint-disable-next-line no-restricted-syntax
      for (const k in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(k) && obj[k] && typeof obj[k] === 'object') {
          this.transformEachChild(obj[k], callback)
        } else {
          obj[k] = callback(obj[k]) // eslint-disable-line no-param-reassign
        }
      }
      return obj
    },
  },
  computed: {
    ...mapGetters(['canEditConfigAIUI', 'canEditConfigFullAIUI']),
  },
}
</script>

<style scoped>
section {
  border: 3px solid darkslategrey;
  border-radius: 1rem;
  margin: 1rem 0 1.5rem;
  padding: 1rem;
  position: relative;
}
section div {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s ease-out;
}
section.expanded div {
  max-height: fit-content;
  overflow: visible;
}
section h5 {
  position: absolute;
  top: 0;
  padding: 0 1rem 0 0.5rem;
  transform: translateY(-50%);
  background: #fff;
  cursor: pointer;
}
h5 svg {
  margin-right: 0.5rem;
}
</style>
