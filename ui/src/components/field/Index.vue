<template>
  <!--    Augmentations    -->
  <augmentations-input v-if="schema.type === types.AUGMENTATIONS" :augmentations="temp" @input="handleInput" />
  <b-row v-else class="mb-2">
    <b-col cols="6" class="mr-auto">
      <div>{{schema.label}}</div>
      <small v-if="schema.options.help" class="form-text text-muted">{{schema.options.help}}</small>
      <small  v-if="schema.options.hasAuto === true">
        Auto:
        <b-form-checkbox class="ml-2" style="display:inline;" :checked="temp === 'auto'" @change="toggleAuto" :id="schema.field + 'auto'"/>
      </small>
    </b-col>
    <b-col cols="6">
      <code v-if="temp === 'auto'">AUTO</code>
      <!--        Text         -->
      <b-form-input
        v-else-if="[types.TEXT, types.NUMBER].includes(schema.type)"
        :type="schema.type" @input="handleInput"
        :min="schema.options.min" :max="schema.options.max"
        :value="temp" :placeholder="schema.options.placeholder"/>
      <!--        Json         -->
      <field-json v-else-if="schema.type === types.JSON || schema.type === types.J_ARRAY" v-model="temp" :schema="schema"/>
      <!--        Select       -->
      <b-form-select expanded :multiple="schema.options.multiple" :id="schema.field" v-else-if="schema.type === types.SELECT" v-model="temp" @change="handleInput">
        <option
          v-for="option in schema.options.dataset"
          :value="option.value"
          :key="option.value">
          {{ option.label }}
        </option>
        <option :value="null">________</option>
      </b-form-select>
      <!--        Boolean      -->
      <b-form-checkbox v-else-if="schema.type === types.BOOLEAN" @change="handleInput" v-model="temp" :id="schema.field"/>
      <b-form-tags v-else-if="schema.type === types.T_ARRAY" v-model="temp" :placeholder="schema.options.placeholder"/>
      <b-row v-else-if="schema.type === types.SLIDER">
        <b-col sm="8"><b-form-input type="range" v-model="temp" :min="schema.options.min || 0" :max="schema.options.max || 200"/></b-col>
        <b-col><code>{{temp}}%</code></b-col>
      </b-row>
    </b-col>
  </b-row>
</template>

<script>
import * as types from './data_types'
import FieldJson from './Json'
import AugmentationsInput from './Augmentations'

export default {
  name: 'SField',
  components: {
    'field-json': FieldJson,
    'augmentations-input': AugmentationsInput,
  },
  props: {
    schema: {
      default: () => ({
        label: null, // Required
        field: 'field', // Required
        type: types.TEXT, // Required
        options: {
          /*
            * dataset: Array
            * default: Any
            * schemas: Array - use for JSOM & JSON ARRAY
            * field_value: String - use for data selector
            * field_showing: String - use for data selector
            * module: String - use for data selector
            * help: String
            * multiple: Boolean
            * type: String - use for TextField
            * hasAuto: Boolean - use for data selector
            * */
        },
      }),
    },
    value: {
      default: null,
    },
    showLabel: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    let temp = this.value
    if (temp === null) {
      if (this.schema.options.default !== undefined) {
        temp = this.schema.options.default
        this.$emit('input', temp)
      }
      if (this.schema.type === types.JSON) {
        temp = {}
        this.$emit('input', temp)
      }
      if (this.schema.type === types.J_ARRAY) {
        temp = []
        this.$emit('input', temp)
      }
    }
    return {
      types,
      temp,
    }
  },
  watch: {
    temp: {
      // eslint-disable-next-line no-unused-vars
      handler(after, before) {
        this.$emit('input', after)
        if (this.schema.options.onChange) {
          this.schema.options.onChange(after)
        }
      },
      deep: true,
    },
    value: {
      handler() {
        this.term = this.value
      },
      deep: true,
    },
  },
  methods: {
    handleInput(value) {
      this.temp = value
    },
    toggleAuto() {
      // const fallbackJson = this.schema.type === types.J_ARRAY ? new Array(this.schema.options?.schema?.length || 0).fill(0) : {}
      const fallbackString = this.value === 'auto' ? this.value.replace('auto', '') : this.value
      // const fallback = this.value === null && (this.schema.type === types.JSON || this.schema.type === types.J_ARRAY) ? fallbackJson : fallbackString
      this.temp = this.temp !== 'auto' ? 'auto' : fallbackString
      if (this.schema.type === types.T_ARRAY && this.temp !== 'auto') this.temp = []
      if (this.schema.type === types.JSON && this.temp !== 'auto') this.temp = {}
      if (this.schema.type === types.J_ARRAY && this.temp !== 'auto') this.temp = new Array(this.schema.options?.schema?.length || 0).fill(0)
      this.$emit('input', this.temp)
    },
  },
}
</script>

<style>
code {
  color: blue;
}
.b-form-tag {
  margin: 0.1rem 0.3rem!important;
}
</style>
