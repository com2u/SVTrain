<template>
  <div>
    <div
      class="file-explorer-item"
      :style="imageStyles"
      :id="file.path"
      :class="{ cursor: file.cursor, selected: file.selected }">
      <template v-if="file.deleted || file.changed">
        {{ file.deleted ? 'File deleted' : 'File changed' }}
      </template>
      <template v-else>
        <template v-if="file.type === 'file'">
          <template v-if="file.image">
            <div>
              <img
                v-bind:src="file.serverPath"
                class="file-explorer-preview"
                :class="imageFit === 'fit' ? 'image-fit' : 'image-fill'"
                v-bind:style="{width: size-15 + 'px', height: size-15 + 'px' }">
            </div>
          </template>
          <template v-else-if="file.name.toLowerCase() === 'tfsettings.json'">
            <v-icon name="cogs" class="text-primary" scale="2"/>
          </template>
          <template v-else>
            <v-icon name="file" scale=2></v-icon>
          </template>
        </template>
        <template v-else>
          <v-icon name="folder" scale=2></v-icon>
        </template>
      </template>
    </div>
    <span
      v-if="showFileName"
      v-bind:class="{
        missmatched: !file.match && file.image,
        matched: file.match && file.image,
        other: !file.image
      }"
      :style="{
        width: `${size}px`
      }"
      class="file-explorer-file-name">
      {{ file.name }}
    </span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    file: Object,
    size: [String, Number],
    showFileName: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapGetters(['imageSpacing', 'imageFit']),
    imageStyles() {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`,
        marginBottom: `${this.imageSpacing}px`,
        marginRight: `${this.imageSpacing}px`,
      }
    },
  },
}
</script>


<style lang="scss">
</style>
