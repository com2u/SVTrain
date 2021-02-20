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
                :src="file.serverPath"
                class="file-explorer-preview"
                alt=""
                :class="imageFit === 'fit' ? 'image-fit' : 'image-fill'"
                v-bind:style="{width: size.width - 15 + 'px', height: size.height - 15 + 'px' }">
            </div>
          </template>
          <template v-else-if="file.name.toLowerCase() === 'tfsettings.json'">
            <v-icon :name="iconName || 'cogs'" class="text-primary" scale="2"/>
          </template>
          <template v-else>
            <v-icon :name="iconName || 'file'" scale=2></v-icon>
          </template>
        </template>
        <template v-else>
          <v-icon :name="iconName || 'folder'" scale=2></v-icon>
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
        width: zoomAble ? `${size.width}px` : undefined
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
    size: {
      type: Object,
      default: () => ({
        width: 100,
        height: 100,
      }),
    },
    showFileName: {
      type: Boolean,
      default: true,
    },
    zoomAble: {
      type: Boolean,
      default: false,
    },
    iconName: {
      type: String,
      default: null,
    },
  },
  computed: {
    ...mapGetters(['imageSpacing', 'imageFit']),
    imageStyles() {
      return {
        width: `${this.size.width}px`,
        height: `${this.file.image ? this.size.height : this.size.width}px`,
        marginBottom: `${this.imageSpacing}px`,
        marginRight: `${this.imageSpacing}px`,
      }
    },
  },
}
</script>


<style lang="scss">
</style>
