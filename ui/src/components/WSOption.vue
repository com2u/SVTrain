<template>
  <div>
    <template v-for="category in Object.keys(schemas)">
      <section
        :key="category"
        :class="{ expanded: expandedCategory === category }"
        :data-e2e-testid="`${category.trim()}`"
      >
        <h5
          @click="
            expandedCategory = expandedCategory === category ? null : category
          "
        >
          <v-icon
            :name="`arrow-${expandedCategory === category ? 'down' : 'up'}`"
          />{{ category }}
        </h5>
        <div>
          <s-field
            v-for="schema in schemas[category]"
            :key="schema.field"
            :schema="schema"
            :value="data[schema.field]"
            @input="data[schema.field] = $event"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import * as types from './field/data_types'
import SField from './field/Index.vue'

export default {
  name: 'WSOption',
  components: {
    's-field': SField,
  },
  props: {
    value: {
      default: () => ({}),
      type: Object,
    },
  },
  data() {
    return {
      expandedCategory: null,
      schemas: {
        Image: [
          {
            label: 'Images per page',
            field: 'filePerPage',
            type: types.NUMBER,
            options: {
              help: 'Set to "-1" to show all images on one page',
            },
          },
          {
            label: 'Size',
            field: 'defaultPictureSize',
            type: types.JSON,
            options: {
              schemas: [
                {
                  label: 'Width',
                  field: 'width',
                  type: types.NUMBER,
                  options: {},
                },
                {
                  label: 'Height',
                  field: 'height',
                  type: types.NUMBER,
                  options: {},
                },
              ],
              help: 'Set a default for the picture size in pixels',
            },
          },
          {
            label: 'Contrast',
            field: 'imgContrast',
            type: types.SLIDER,
            options: {
              max: 200,
              min: 0,
            },
          },
          {
            label: 'Brightness',
            field: 'imgBrightness',
            type: types.SLIDER,
            options: {
              max: 200,
              min: 0,
            },
          },
          {
            label: 'Zoom',
            field: 'defaultZoom',
            type: types.SLIDER,
            options: {
              max: 100,
              min: 0,
            },
          },
          {
            label: 'View',
            field: 'imageFit',
            type: types.SELECT,
            options: {
              dataset: [
                { label: 'Image Focus', value: 'fill' },
                { label: 'Full Image', value: 'fit' },
              ],
              help: 'Center on the center square of the image',
            },
          },
          {
            label: 'Invert',
            field: 'imageInvert',
            type: types.BOOLEAN,
            options: {
              help: 'This switch will invert the displayed image colors',
            },
          },
          {
            label: 'Color Map',
            field: 'imageColorMap',
            type: types.BOOLEAN,
            options: {
              help: 'Dark areas become blue and light areas become red',
            },
          },
          {
            label: 'Spacing distance',
            field: 'imageSpacing',
            type: types.NUMBER,
            options: {
              help: 'Enter a number to define the distance between the images',
            },
          },
          {
            label: 'Image viewer',
            field: 'imageViewer',
            type: types.BOOLEAN,
            options: {
              help: 'Set true as value if you want to display an additional button that allows you to view selected images in a special viewer',
            },
          },
        ],
        Labeling: [
          {
            label: 'Confirm method',
            field: 'forwardOnly',
            type: types.BOOLEAN,
            options: {
              help: 'Use the Confirm method to automatically move the selected images to one folder and the not selected images to another folder',
              onChange(enabled) {
                const forwardLocation = document.getElementById('forwardLocation')
                const defectMethod = document.getElementById('defectMethod')
                if (enabled) {
                  forwardLocation.value = 'right'
                  defectMethod.checked = false
                  forwardLocation.dispatchEvent(new Event('change'))
                  defectMethod.dispatchEvent(new Event('change'))
                } else {
                  forwardLocation.value = 'top'
                  defectMethod.checked = true
                  forwardLocation.dispatchEvent(new Event('change'))
                  defectMethod.dispatchEvent(new Event('change'))
                }
              },
            },
          },
          {
            label: 'Confirmed path',
            field: 'selectedPath',
            type: types.TEXT,
            options: {
              help: 'All selected images will be moved into the folder',
            },
          },
          {
            label: 'Not selected path',
            field: 'notSelectedPath',
            type: types.TEXT,
            options: {
              help: 'All images which have not been selected will be moved into the folder',
            },
          },
          {
            label: 'Unclassified path',
            field: 'unclassifiedPath',
            type: types.TEXT,
            options: {
              help: 'Folder name where the labeling starts. Reference for progress bar calculation',
              default: 'Unclassified',
            },
          },
          {
            label: 'Confirm Button',
            field: 'forwardLocation',
            type: types.SELECT,
            options: {
              dataset: [
                { label: 'Right', value: 'right' },
                { label: 'Top', value: 'top' },
              ],
              help: 'Set the position of the Confirm Button',
            },
          },
          {
            label: 'Button font size',
            field: 'buttonFontSize',
            type: types.TEXT,
            options: {
              help: 'Set a value for the font size applied to the button.',
            },
          },
          {
            label: 'Title font size',
            field: 'titleFontSize',
            type: types.TEXT,
            options: {
              help: 'Set a value for the font size applied to the title.',
            },
          },
          {
            label: 'Show file name',
            field: 'showFileName',
            type: types.BOOLEAN,
            options: {},
          },
          {
            label: 'Right menu',
            field: 'rightMenu',
            type: types.JSON,
            options: {
              schemas: [
                {
                  label: 'Width',
                  field: 'width',
                  type: types.NUMBER,
                  options: {
                    placeholder: '0',
                  },
                },
                {
                  label: 'Margin left',
                  field: 'marginLeft',
                  type: types.NUMBER,
                  options: {
                    placeholder: '10',
                  },
                },
                {
                  label: 'Font size',
                  field: 'fontSize',
                  type: types.TEXT,
                  options: {
                    placeholder: '1rem',
                  },
                },
              ],
              help: 'Right menu appearance',
            },
          },
          {
            label: 'Select Defect Method',
            field: 'defectMethod',
            type: types.BOOLEAN,
            options: {
              help: 'With this option a label for all existing defect classes can be given. This option may also be combined with the "Confirm" method.',
            },
          },
          {
            label: 'New folder',
            field: 'newFolder',
            type: types.BOOLEAN,
            options: {
              help: 'Allows to create new folders in a Workspace for labeling',
            },
          },
          {
            label: 'Use shortcuts',
            field: 'useShortcuts',
            type: types.BOOLEAN,
            options: {},
          },
          {
            label: 'Show navigation icon',
            field: 'showNavigationIcon',
            type: types.BOOLEAN,
            options: {},
          },
          {
            label: 'Image Data',
            field: 'addImageData',
            type: types.BOOLEAN,
            options: {
              help: 'Activates a UI to add data to the images',
            },
          },
        ],
        Workspace: [
          {
            label: 'Is hide',
            field: 'hide',
            type: types.BOOLEAN,
            options: {},
          },
          {
            label: 'New workspace',
            field: 'newWorkspace',
            type: types.BOOLEAN,
            options: {
              help: 'Set true as value if you want to display a button that allows to create a new work space',
            },
          },
          {
            label: 'Workspace font size',
            field: 'workspaceFontSize',
            type: types.TEXT,
            options: {
              help: 'Set a value for the font size applied to the name of the work space in the work spaces overview',
            },
          },
          {
            label: 'Sub folder font size',
            field: 'subFolderFontSize',
            type: types.TEXT,
            options: {
              help: 'Set a value for the font size applied to the name of the subfolders in the work spaces overview',
            },
          },
          {
            label: 'Request before delete',
            field: 'requestBeforeDelete',
            type: types.BOOLEAN,
            options: {},
          },
          {
            label: 'Delete default folder',
            field: 'deleteDefaultFolder',
            type: types.TEXT,
            options: {
              help: 'Images will not be deleted but moved to the specified folder',
            },
          },
          {
            label: 'Backup path',
            field: 'backupPath',
            type: types.TEXT,
            options: {
              help: 'Path to define the backup location',
            },
          },
          {
            label: 'Import files',
            field: 'importFiles',
            type: types.BOOLEAN,
            options: {
              help: 'Will allow to upload images from the local computer via EjectX Web Frontend',
            },
          },
          {
            label: 'Max file size',
            field: 'maxFileSize',
            type: types.NUMBER,
            options: {
              help: 'Set the maximum file size in MB which can be uploaded via EjectX',
            },
          },
          {
            label: 'Extensions to compare',
            field: 'CMExtensions',
            type: types.T_ARRAY,
            options: {
              help: 'File extensions to compare on the confusion matrix',
              placeholder: 'Add',
            },
          },
          {
            label: 'Show progress on sub folder',
            field: 'showSubFolderProgress',
            type: types.BOOLEAN,
            options: {},
          },
          {
            label: 'Allow filter files',
            field: 'filterFiles',
            type: types.BOOLEAN,
            options: {},
          },
          {
            label: 'Allow sort files',
            field: 'sortFiles',
            type: types.BOOLEAN,
            options: {},
          },
          {
            label: 'Old Filename Ignore',
            field: 'oldFilenameIgnore',
            type: types.BOOLEAN,
            options: {
              help: 'This flag will ignore text before three underscore characters in the filename',
            },
          },
        ],
      },
      data: {
        ...cloneDeep(this.value),
        defaultPictureSize: typeof this.value.defaultPictureSize === 'number' ? {
          width: this.value.defaultPictureSize,
          height: this.value.defaultPictureSize,
        } : this.value.defaultPictureSize,
      },
    }
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
