<template>
  <b-row class="mb-2">
    <b-col cols="6" class="mr-auto">
      <div>{{schema.label}}</div>
      <small v-if="schema.options.help" class="form-text text-muted">{{schema.options.help}}</small>
    </b-col>
    <b-col cols="6">
      <!--        Text         -->
      <b-form-input
        v-if="[types.TEXT, types.NUMBER].includes(schema.type)"
        :type="schema.type" @input="handleInput"
        :value="temp" :placeholder="schema.options.placeholder"/>
      <!--        Json         -->
      <field-json v-else-if="schema.type === types.JSON" v-model="temp" :schema="schema"/>
      <!--        Select       -->
      <b-form-select expanded v-else-if="schema.type === types.SELECT" v-model="temp">
        <option
          v-for="option in schema.options.dataset"
          :value="option.value"
          :key="option.value">
          {{ option.label }}
        </option>
        <option :value="null">________</option>
      </b-form-select>
      <!--        Boolean      -->
      <b-form-checkbox v-else-if="schema.type === types.BOOLEAN" v-model="temp"/>
      <b-form-tags v-else-if="schema.type === types.T_ARRAY" v-model="temp" :placeholder="schema.options.placeholder"/>
      <b-row v-else-if="schema.type === types.SLIDER">
        <b-col sm="8"><b-form-input type="range" v-model="temp" min="0" max="200"/></b-col>
        <b-col><code>{{temp}}%</code></b-col>
      </b-row>
    </b-col>
  </b-row>
</template>

<script>
import * as types from './data_types'
import FieldJson from './Json'

export default {
  name: 'SField',
  components: {
    'field-json': FieldJson,
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
      if (this.schema.type === types.JSON) {
        temp = {}
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
      },
      deep: true,
    },
    value() {
      this.term = this.value
    },
  },
  methods: {
    handleInput(value) {
      if (this.schema.type === types.NUMBER) {
        // eslint-disable-next-line radix
        this.temp = Number.parseInt(value)
      } else {
        this.temp = value
      }
    },
  },
}
</script>
