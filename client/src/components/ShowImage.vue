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
    <div v-else class="mb-4 inline-round-zoomer-base-container">
      <img v-auth-image="srcIMG" class="responsive-image" alt="">
    </div>
    <div>{{ file.path }}</div>
    <div>{{ file.name }}</div>
  </div>
</template>

<script>
import { getFileServerPath } from '@/utils'
import axios from 'axios'

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
      srcIMG: this.file.serverPath.replaceAll('#', '{hash_tag}'),
    }
  },
  methods: {
    convertURIPath(p) {
      return p.replaceAll('#', '{hash_tag}')
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
        this.srcIMG = this.file.serverPath.replaceAll('#', '{hash_tag}')
      } else {
        const path = this.file.relativePath.replaceAll('#', '{hash_tag}')
        const uri = `${getFileServerPath().replace('data', 'api')}visualizeHeatmap?image=${path}`
        this.srcIMG = await axios.get(uri).then(() => uri).catch(() => this.file.serverPath.replaceAll('#', '{hash_tag}'))
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
