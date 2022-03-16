<template>
  <div>
    <div
      class="file-explorer-item"
      :style="imageStyles"
      :id="file.path"
      :class="{ cursor: file.cursor, selected: file.selected }"
    >
      <template v-if="file.deleted || file.changed">
        {{ file.deleted ? "File deleted" : "File changed" }}
      </template>
      <template v-else>
        <template v-if="file.type === 'file'">
          <template v-if="file.image">
            <div class="overflow-hidden">
              <img
                ref="img"
                :src="convertURIPath(file.serverPath)"
                class="file-explorer-preview unloaded"
                alt=""
                :class="imageFit === 'fit' ? 'image-fit' : 'image-fill'"
                crossorigin="anonymous"
                @load.once="applyImagesFilters"
                v-bind:style="{
                  width: size.width - 15 + 'px',
                  height: size.height - 15 + 'px',
                }"
              />
            </div>
          </template>
          <template v-else-if="file.name.toLowerCase() === 'tfsettings.json'">
            <v-icon :name="iconName || 'cogs'" class="text-primary" scale="2" />
          </template>
          <template v-else>
            <v-icon :name="iconName || 'file'" scale="2"></v-icon>
          </template>
        </template>
        <template v-else>
          <v-icon :name="iconName || 'folder'" scale="2"></v-icon>
        </template>
      </template>
    </div>
    <span
      v-if="showFileName"
      v-bind:class="{
        missmatched: !file.match && file.image,
        matched: file.match && file.image,
        other: !file.image,
      }"
      :style="{
        width: zoomAble ? `${size.width}px` : undefined,
      }"
      class="file-explorer-file-name"
    >
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
    ...mapGetters(['imageSpacing', 'imageFit', 'imageInvert', 'imageColorMap']),
    imageStyles() {
      return {
        width: `${this.size.width}px`,
        height: `${this.file.image ? this.size.height : this.size.width}px`,
        marginBottom: `${this.imageSpacing}px`,
        marginRight: `${this.imageSpacing}px`,
      }
    },
  },
  methods: {
    convertURIPath(p) {
      return `${p.replaceAll('#', '{hash_tag}')}?token=${localStorage.getItem(
        'sessionToken',
        null,
      )}`
    },
    applyImagesFilters() {
      const imgRef = this.$refs.img
      if (!imgRef.classList.contains('unloaded')) return
      if (this.imageInvert || this.imageColorMap) {
        if (!imgRef.complete || imgRef.naturalHeight === 0) return
        const filters = []
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = imgRef.width
        canvas.height = imgRef.height
        ctx.drawImage(imgRef, 0, 0, canvas.width, canvas.height)
        if (this.imageInvert) filters.push('invert')
        if (this.imageColorMap) filters.push('colormap')
        const sequencer = window.ImageSequencer()
        sequencer.loadImage(canvas.toDataURL('image/png'), function callback() {
          this.addSteps(filters)
          this.run((out) => {
            imgRef.src = out
            imgRef.classList.remove('unloaded')
          })
        })
      } else {
        this.$refs.img.classList.remove('unloaded')
      }
    },
  },
}
</script>

<style lang="scss">
.unloaded {
  visibility: hidden;
}
</style>
