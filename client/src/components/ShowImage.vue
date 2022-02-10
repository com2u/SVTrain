<template>
  <div class="image-viewing" ref="image_viewing" @keyup="onKeyUp">
    <b-container fluid>
      <b-row class="my-1">
        <b-col sm="12"><b-form-input type="range" v-model="imageWidth"/></b-col>
      </b-row>
    </b-container>
    <ProductZoomer
      v-if="options.zoomFactor > 1"
      :key="zoomKey"
      class="mb-4"
      ref="product_zoomer"
      :base-images="images"
      :base-zoomer-options="options"
    />
    <div v-else class="mb-4 inline-round-zoomer-base-container" ref="imgPreview">
      <img ref="img" v-auth-image="srcIMG" class="responsive-image" alt="">
    </div>
    <div>{{ file.path }}</div>
    <div>{{ file.name }}</div>
  </div>
</template>

<script>
import { getFileServerPath } from '@/utils'
import axios from 'axios'
import { mapGetters } from 'vuex'

const colormap = require('colormap')

export default {
  name: 'ShowImage',
  props: {
    file: { type: Object, required: true },
    showMode: { type: String, default: 'Original' },
  },
  data() {
    return {
      imageWidth: 70,
      contrast: 100,
      brightness: 100,
      options: {
        zoomFactor: 1,
        pane: 'container-round',
        hoverDelay: 300,
        namespace: 'inline-round-zoomer',
        move_by_click: true,
        scroll_items: 5,
        choosed_thumb_border_color: '#bbdefb',
        scroller_position: 'bottom',
      },
      zoomKey: 1,
      srcIMG: encodeURI(this.file.serverPath),
    }
  },
  methods: {
    convertURIPath(p) {
      return encodeURI(p)
    },
    onKeyUp(key) {
      let flag = false
      if (key.keyCode === 187 && this.options.zoomFactor < 8) {
        // eslint-disable-next-line operator-assignment
        this.options.zoomFactor = this.options.zoomFactor * 2
        flag = true
      } else if (key.keyCode === 189 && this.options.zoomFactor > 1) {
        // eslint-disable-next-line operator-assignment
        this.options.zoomFactor = this.options.zoomFactor / 2
        flag = true
      }
      if (flag) {
        const paras = document.getElementsByClassName('drift-zoom-pane')
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < paras.length; i++) {
          paras[i].parentNode.removeChild(paras[i])
        }
        this.zoomKey += 1
        this.$emit('zoom-change', this.options.zoomFactor)
      }
    },
    invertIMG() {
      if (!this.imageInvert) return
      const canvas = this.$refs.img.parentElement.appendChild(document.createElement('canvas'))
      const c = canvas.getContext('2d')
      const height = this.$refs.img.clientHeight
      const width = this.$refs.img.clientWidth
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
  computed: {
    images() {
      return {
        thumbs: [
          {
            id: 1,
            url: this.convertURIPath(this.file.serverPath),
          },
        ],
        normal_size: [
          {
            id: 1,
            url: this.convertURIPath(this.file.serverPath),
          },
        ],
        large_size: [
          {
            id: 1,
            url: this.convertURIPath(this.file.serverPath),
          },
        ],
      }
    },
    ...mapGetters([
      'imageInvert',
    ]),
  },
  mounted() {
    this.$refs.image_viewing.style.setProperty('--img--zoom', `${this.imageWidth}%`)
    document.addEventListener('keyup', this.onKeyUp)
  },
  beforeDestroy() {
    document.removeEventListener('keyup', this.onKeyUp)
  },
  watch: {
    // eslint-disable-next-line func-names
    'options.zoomFactor': function () {
      this.zoomKey += 1
    },
    imageWidth() {
      this.$refs.image_viewing.style.setProperty('--img--zoom', `${this.imageWidth}%`)
    },
    file() {
      this.zoomKey += 1
    },
    async showMode() {
      if (this.showMode === 'Original') {
        this.srcIMG = encodeURIComponent(this.file.serverPath)
      } else {
        const path = encodeURIComponent(this.file.relativePath)
        const uri = `${getFileServerPath().replace('data', 'api')}visualizeHeatmap?mode=${encodeURIComponent(this.showMode)}&image=${path}`
        this.srcIMG = await axios.get(uri).then(() => uri).catch(() => encodeURIComponent(this.file.serverPath))
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.image-viewing {
  text-align: center;
  image {
    object-fit: cover;
  }
}
</style>
