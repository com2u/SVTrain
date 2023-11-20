<template>
  <div>
    <SField v-for="(sch, i) in schema.options.schemas" :key="i" :schema="sch" :value="temp[sch.field]"
             @input="(value) => handleIP(value, sch)"/>
  </div>
</template>

<script>
export default {
  name: 'FieldJson',
  props: {
    schema: {},
    value: {
      default: () => ({}),
    },
  },
  data() {
    return {
      temp: this.value,
    }
  },
  methods: {
    handleIP(eventValue, sch) {
      this.$emit('jsonFieldVal', { [sch.field]: eventValue })
      this.temp[sch.field] = eventValue
    },
  },
  watch: {
    temp: {
      // eslint-disable-next-line no-unused-vars
      handler(after) {
        this.$emit('input', after)
      },
      deep: true,
    },
  },
}
</script>
