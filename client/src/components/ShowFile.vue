<template>
  <div>
    <ShowImage v-if="fileType===types.image" v-bind:file="file"/>
    <ShowJSON v-if="fileType===types.json" v-bind:file="file"/>
    <ShowTFSettings v-if="fileType===types.tfsettings" v-bind:file="file"/>
    <div v-if="fileType===types.unsupported">
      Files with that type aren't supported
    </div>
  </div>
</template>

<script>
import ShowImage from './ShowImage.vue'
import ShowJSON from './ShowJSON.vue'
import ShowTFSettings from './ShowTFSettings.vue'

export default {
  name: 'ShowFile',
  props: {
    file: { type: Object, required: true }
  },
  components: { ShowImage, ShowJSON, ShowTFSettings },
  data () {
    return {
      types: {
        image: 'image',
        json: 'json',
        tfsettings: 'tfsettings',
        unsupported: 'unsupported'
      }
    }
  },
  computed: {
    fileType () {
      if (typeof this.file.path !== 'string') return 'unsupported'
      const p = this.file.path.toLowerCase()
      const jsonRegexp = /\.json$/
      const tfsettingRegexp = /tfsettings\.json$/
      const imageRegexp = /\.(jpeg|jpg|gif|bmp|png)$/
      if (imageRegexp.test(p)) {
        return this.types.image
      } else if (tfsettingRegexp.test(p)) {
        return this.types.tfsettings
      } else if (jsonRegexp.test(p)) {
        return this.types.json
      }
      return this.types.unsupported
    }
  }
}
</script>

<style lang="scss" scoped>

</style>

