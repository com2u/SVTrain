<template>
  <div>
    <SField v-for="(sch, i) in schema.options.schemas" :key="i" :schema="sch" :value="temp[sch.field]"
             @input="temp[sch.field] = $event"/>
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
