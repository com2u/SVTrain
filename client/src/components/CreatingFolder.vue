<template>
  <b-modal 
    id="creating-folder-modal"
    title="Create a folder"
    ok-title="Create"
    ref="modal"
    v-on:ok="createFolder"
    v-on:hidden="handleHidden"
    v-on:shown="handleShown"
    v-bind:ok-disabled="!isValid"
  >
    <b-form v-on:submit.prevent>
      <b-form-group
        label="Name"
        label-for="folder-name"
        :invalid-feedback="'Name is required'"
        :state="isValid"
      >
        <b-form-input id="folder-name" v-on:keyup.enter="handleEnter" v-model="name" :state="isValid" trim/>
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import api from '../api.js'

export default {
  name: "CreatingFolder",
  props: {
    path: { required: true, default: () => '' }
  },
  data () {
    return {
      name: null,
      modal: null
    }
  },
  computed: {
    isValid () {
      return this.name === null ? this.name : !!this.name
    }
  },
  methods: {
    async createFolder () {
      await api.createFolder(this.path, this.name)
      this.name = null
    },
    async handleEnter () {
      this.createFolder()
      this.$refs.modal.hide()
      console.log(this.$refs.modal)
    },
    handleHidden (evt) {
      this.$emit('hidden', evt)
    },
    handleShown (evt) {
      this.$el.querySelector('#folder-name').focus()
      this.$emit('shown', evt)
    }
  }
}
</script>

