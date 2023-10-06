<template>
  <b-modal :id="id" title="Confirmation" @ok="confirm" @cancel="cancel">
    {{ confirmationText || 'Are you sure you?' }}
  </b-modal>
</template>

<script>
export default {
  name: 'ConfirmationModal',
  props: {
    id: {
      type: String,
      required: true,
    },
    confirmationText: {
      type: String,
      required: true,
    },
  },
  methods: {
    confirm() {
      this.$emit('confirmed', true)
      this.$bvModal.hide(this.id)
    },
    cancel() {
      this.$emit('confirmed', false)
      this.$bvModal.hide(this.id)
    },
  },
}
</script>
