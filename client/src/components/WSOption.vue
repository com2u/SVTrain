<template>
  <div>
    <s-field v-for="schema in schemas" :key="schema.field"
             :schema="schema" :value="data[schema.field]"
             @input="data[schema.field] = $event"/>
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
      schemas: [
        {
          label: 'Is hide',
          field: 'hide',
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
          label: 'File per page',
          field: 'filePerPage',
          type: types.NUMBER,
          options: {
            help: 'Set a number of images that you want to see in one screen.',
          },
        },
        {
          label: 'Show file name',
          field: 'showFileName',
          type: types.BOOLEAN,
          options: {
            help: 'Set the value to true if you want to display the file name below the image.',
          },
        },
        {
          label: 'Use shortcuts',
          field: 'useShortcuts',
          type: types.BOOLEAN,
          options: {},
        },
        {
          label: 'Request before delete',
          field: 'requestBeforeDelete',
          type: types.BOOLEAN,
          options: {},
        },
        {
          label: 'Default picture size',
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
            help: 'Set a default for the picture size in pixels. Pictures are shown in square format.',
          },
        },
        {
          label: 'Delete default folder',
          field: 'deleteDefaultFolder',
          type: types.TEXT,
          options: {
            help: 'This is the path for the folder where deleted images are put.',
          },
        },
        {
          label: 'Selected path',
          field: 'selectedPath',
          type: types.TEXT,
          options: {
            help: 'This is the path for the folder where images are put after you selected and confirmed them to have a defect.',
          },
        },
        {
          label: 'Not selected path',
          field: 'notSelectedPath',
          type: types.TEXT,
          options: {
            help: 'This is the path for the folder where images without defects are put after you selected and confirmed the images with defects.',
          },
        },
        {
          label: 'Forward only',
          field: 'forwardOnly',
          type: types.BOOLEAN,
          options: {
            help: 'Set true as value if you want to use the "Confirm" method. Set false if you want to use the "Select" method.',
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
          label: 'Forward location',
          field: 'forwardLocation',
          type: types.SELECT,
          options: {
            dataset: [
              { label: 'Right', value: 'right' },
              { label: 'Top', value: 'top' },
            ],
            help: 'Set a value for the location of the forward button. You can set right or top.',
          },
        },
        {
          label: 'Move menu',
          field: 'moveMenu',
          type: types.BOOLEAN,
          options: {
            help: 'Set true as value if you want to display a menu on the right that allows you to select defect classes.',
          },
        },
        {
          label: 'New folder',
          field: 'newFolder',
          type: types.BOOLEAN,
          options: {
            help: 'Set this parameter to true if you want to display a button that allows to create a new folder within a work space.',
          },
        },
        {
          label: 'New workspace',
          field: 'newWorkspace',
          type: types.BOOLEAN,
          options: {
            help: 'Set true as value if you want to display a button that allows to create a new work space.',
          },
        },
        {
          label: 'Image spacing',
          field: 'imageSpacing',
          type: types.NUMBER,
          options: {
            help: 'Enter a number to define the distance between the images.',
          },
        },
        {
          label: 'Workspace font size',
          field: 'workspaceFontSize',
          type: types.TEXT,
          options: {
            help: 'Set a value for the font size applied to the name of the work space in the work spaces overview.',
          },
        },
        {
          label: 'Sub folder font size',
          field: 'subFolderFontSize',
          type: types.TEXT,
          options: {
            help: 'Set a value for the font size applied to the name of the subfolders in the work spaces overview.',
          },
        },
        {
          label: 'Show navigation icon',
          field: 'showNavigationIcon',
          type: types.BOOLEAN,
          options: {},
        },
        {
          label: 'Image fit',
          field: 'imageFit',
          type: types.SELECT,
          options: {
            dataset: [
              { label: 'Fill', value: 'fill' },
              { label: 'Fit', value: 'fit' },
            ],
          },
        },
        {
          label: 'Image viewer',
          field: 'imageViewer',
          type: types.BOOLEAN,
          options: {
            help: 'Set true as value if you want to display an additional button that allows you to view selected images in a special viewer.',
          },
        },
        {
          label: 'Extensions to compare',
          field: 'CMExtensions',
          type: types.T_ARRAY,
          options: {
            help: 'File extensions to compare on confusion matrix.',
            placeholder: 'Add some',
          },
        },
        {
          label: 'Show progress on sub folder',
          field: 'showSubFolderProgress',
          type: types.BOOLEAN,
          options: {},
        },
        {
          label: 'Allow edit explorer notes',
          field: 'editExplorerNotes',
          type: types.BOOLEAN,
          options: {},
        },
        {
          label: 'Image contrast',
          field: 'imgContrast',
          type: types.SLIDER,
          options: {
            max: 200,
            min: 100,
          },
        },
        {
          label: 'Image brightness',
          field: 'imgBrightness',
          type: types.SLIDER,
          options: {
            max: 200,
            min: 100,
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
      ],
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

</style>
