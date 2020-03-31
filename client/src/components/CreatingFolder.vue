<template>
  <b-modal
    :id="id"
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
        <b-form-input ref="folderName" v-on:keyup.enter="handleEnter" v-model="name" :state="isValid" trim/>
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import api from '../utils/api.js';

export default {
  name: 'CreatingFolder',
  props: {
    path: { required: true, default: () => '' },
    id: {
      type: String,
      default: 'creating-folder-modal',
    },
  },
  data() {
    return {
      name: null,
      modal: null,
    };
  },
  computed: {
    isValid() {
      return this.name === null ? this.name : !!this.name;
    },
  },
  methods: {
    async createFolder() {
      await api.createFolder(this.path, this.name);
      this.$emit('folder-created');
      this.name = null;
    },
    handleEnter() {
      this.createFolder()
        .then(() => {
          this.$emit('folder-created');
          this.$refs.modal.hide();
        });
    },
    handleHidden(evt) {
      this.$emit('hidden', evt);
    },
    handleShown(evt) {
      this.$refs.folderName.focus();
      this.$emit('shown', evt);
    },
  },
};
</script>
