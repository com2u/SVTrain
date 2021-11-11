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
            <div class="overflow-hidden">
              <img ref="img" :src="convertURIPath(file.serverPath)" class="file-explorer-preview" alt=""
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


const colormap = require('colormap')

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
    ...mapGetters(['imageSpacing', 'imageFit', 'imageInvert']),
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
      return `${p.replaceAll('#', '{hash_tag}')}?token=${localStorage.getItem('sessionToken', null)}`
    },
    invertIMG() {
      if (!this.imageInvert) return
      const canvas = this.$refs.img.parentElement.appendChild(document.createElement('canvas'))
      const c = canvas.getContext('2d')
      const height = this.$refs.img.clientHeight
      const width = this.$refs.img.parentElement.clientWidth
      c.canvas.height = height
      c.canvas.width = width
      const shades = (width / 10)
      const COLORS = colormap({
        colormap: 'jet',
        nshades: shades,
        format: 'rgbaString',
        alpha: [0, 0.5],
      })
      // eslint-disable-next-line no-plusplus
      c.drawImage(this.$refs.img, 0, 0, this.$refs.img.clientWidth, this.$refs.img.clientHeight)
      // eslint-disable-next-line no-plusplus
      for (let j = 0; j < (width / 10); j++) {
        c.fillStyle = COLORS[j]
        c.fillRect(j * 10, 0, 10, height)
      }
      this.$refs.img.classList.add('hidden')
    },
  },
  mounted() {
    this.invertIMG()
  },
}
</script>


<style lang="scss">
</style>
