<template>
  <div>
    <b-form v-on:submit.prevent>
      <b-form-textarea rows="10" v-on:state="isValidJSON" ref="textarea" v-model="content">
      </b-form-textarea>
      <br/>
      <b-form-invalid-feedback :state="isValidJSON">
        There are should be a valid JSON string in the input.
      </b-form-invalid-feedback>
      <br />
      <b-button variant="success" v-on:click="submit" v-bind:disabled="!isValidJSON">Save</b-button>
    </b-form>
  </div>
</template>

<script>
import axios from 'axios'
import api from '../api.js'

export default {
  name: 'ShowJSON',
  props: {
    file: { type: Object, required: true }
  },
  data () {
    return {
      content: '',
      textareaElement: null
    }
  },
  methods: {
    async loadFile () {
      const response = await axios.get(this.file.serverPath)
      this.content = JSON.stringify(response.data, null, 2)
    },
    async submit () {
      if (!this.isValidJSON) alert('There are should be a valid JSON string in the input!')
      await api.saveFile(this.file.path, this.content)
    }
  },
  computed: {
    isValidJSON () {
      try { JSON.parse(this.content) }
      catch (e) { return false }
      return true
    }
  },
  async mounted () {
    await this.loadFile()
    console.log(this.$refs.textarea.$el)
    this.$refs.textarea.$el.focus()
  }
}
</script>
