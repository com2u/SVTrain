<template>
  <div class="custom-aug-input">
    <b-row>
      <b-col cols="5" class=""> Add augmentation </b-col>
      <b-col cols="5" class="p-0">
        <select style="width: 100%; height:100%;" v-model="selectedAugmentation">
          <option
            v-for="possibleAugmentation in possibleAugmentations"
            :value="possibleAugmentation.name"
            v-bind:key="possibleAugmentation.name"
          >
            {{ possibleAugmentation.name }}
          </option>
        </select>
      </b-col>
      <b-col cols="1" class="ml-1">
        <button class="btn btn-sm btn-primary" @click="addAugmentation">
          Add
        </button>
      </b-col>
    </b-row>
    <div
      v-for="(augmentation, index) in temp"
      class="mb-2 aug-block"
      v-bind:key="augmentation.name"
    >
      <b-row>
        <b-col cols="5" class="">
          <small class="index">{{index}}</small><b>{{ augmentation[0] }}</b>
        </b-col>
        <b-col cols="6" class="ml-auto">
          <button
            class="btn mr-1 btn-sm btn-warning"
            @click="moveAugmentation(index, index - 1)"
          >
            up
          </button>
          <button
            class="btn btn-sm btn-warning"
            @click="moveAugmentation(index, index + 1)"
          >
            down
          </button>
          <button
            class="btn ml-1 btn-sm btn-danger"
            @click="removeAugmentation(index)"
          >
            Remove
          </button>
        </b-col>
        <b-col cols="12" class="mt-2">
          <template
            v-for="schema in possibleAugmentations.find(
              (a) => a.name === augmentation[0],
            ).params"
          >
            <s-field
              :key="`${schema.field}-${augmentation[0]}-${index}`"
              :schema="schema"
              :value="augmentation[1][schema.field]"
              @input="augmentation[1][schema.field] = $event"
            />
          </template>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import * as types from './data_types'
// import SField from './Index'

export default {
  name: 'AugmentationsInput',
  components: {
    // 's-field': SField,
  },
  props: {
    augmentations: {
      default: () => ([]),
    },
  },
  data() {
    return {
      temp: this.augmentations || [],
      selectedAugmentation: null,
      possibleAugmentations: [
        {
          name: 'random_flip_left_right',
          params: [
            {
              label: 'seed',
              field: 'seed',
              type: types.NUMBER,
              default: 1,
              options: {},
            },
          ],
        },
        {
          name: 'random_flip_up_down',
          params: [
            {
              label: 'seed',
              field: 'seed',
              type: types.NUMBER,
              default: 1,
              options: {},
            },
          ],
        },
        {
          name: 'random_brightness',
          params: [
            {
              label: 'max_delta',
              field: 'max_delta',
              type: types.NUMBER,
              default: 1,
              required: true,
              options: {
                min: 0,
              },
            },
            {
              label: 'seed',
              field: 'seed',
              type: types.NUMBER,
              default: 1,
              options: {},
            },
          ],
        },
        {
          name: 'noise',
          params: [
            {
              label: 'std',
              field: 'std',
              type: types.NUMBER,
              default: 1,
              required: true,
              options: {
                min: 0,
              },
            },
            {
              label: 'seed',
              field: 'seed',
              type: types.NUMBER,
              default: 1,
              options: {},
            },
          ],
        },
        {
          name: 'random_crop_and_resize',
          params: [
            {
              label: 'relative_crop_size_min',
              field: 'relative_crop_size_min',
              type: types.J_ARRAY,
              default: 0.1,
              required: true,
              options: {
                schemas: [
                  {
                    label: 'x',
                    field: 0,
                    type: types.NUMBER,
                    default: 0,
                    options: {
                      placeholder: '0',
                    },
                  },
                  {
                    label: 'y',
                    field: 1,
                    type: types.NUMBER,
                    default: 0,
                    options: {
                      placeholder: '0',
                    },
                  },
                  {
                    label: 'depth',
                    field: 2,
                    type: types.NUMBER,
                    default: 1,
                    options: {
                      placeholder: '1',
                    },
                  },
                ],
              },
            },
            {
              label: 'relative_crop_size_max',
              field: 'relative_crop_size_max',
              type: types.J_ARRAY,
              default: 0.1,
              required: true,
              options: {
                schemas: [
                  {
                    label: 'x',
                    field: 0,
                    type: types.NUMBER,
                    default: 0,
                    options: {
                      placeholder: '0',
                    },
                  },
                  {
                    label: 'y',
                    field: 1,
                    type: types.NUMBER,
                    default: 0,
                    options: {
                      placeholder: '0',
                    },
                  },
                  {
                    label: 'depth',
                    field: 2,
                    type: types.NUMBER,
                    default: 1,
                    options: {
                      placeholder: '1',
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    }
  },
  methods: {
    addAugmentation() {
      const selectedAugmentation = this.possibleAugmentations.find(
        (augmentation) => augmentation.name === this.selectedAugmentation,
      )
      if (!selectedAugmentation) return
      const aug = [selectedAugmentation.name, {}]
      aug[1] = {}
      selectedAugmentation.params.forEach((param) => {
        // if (!param.required) return
        aug[1][param.field] = param.default
      })
      this.temp.push(aug)
    },
    removeAugmentation(index) {
      this.temp.splice(index, 1)
    },
    moveAugmentation(from, to) {
      if (from < 0 || from >= this.temp.length) return
      if (to < 0 || to >= this.temp.length) return
      const temp = this.temp[from]
      this.temp.splice(from, 1)
      this.temp.splice(to, 0, temp)
    },
  },
  watch: {
    temp: {
      // eslint-disable-next-line no-unused-vars
      handler(after, before) {
        this.$emit('input', after)
      },
      deep: true,
    },
  },
}
</script>

<style>
.custom-aug-input {
    margin: 1rem 0 2rem;
    padding-bottom: 1rem;
    border-bottom: 3px solid gray;
}
.aug-block {
  padding: 0.5rem;
  border: 1px solid gray;
  margin: 0.5rem 0.5rem 0 0.8rem;
  border-radius: 0.8rem;
  position: relative;
}
.index {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: -0.8rem;
    font-size: 1.2rem;
    color: grey;
}
</style>
