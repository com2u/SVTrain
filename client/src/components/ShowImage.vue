<template>
  <div class="image-viewing" ref="image_viewing" @keyup="onKeyUp">
    <b-container fluid>
      <b-row class="my-1">
        <b-col sm="12">
          <b-form-input v-if="defaultZoomApplied" type="range" v-model="zoom" />
          <b-form-input
            v-else
            type="range"
            disabled="true"
            :value="defaultZoom"
          />
        </b-col>
      </b-row>
    </b-container>
    Magnifier: X{{ options.zoomFactor }} | Zoom: {{ zoom || defaultZoom }}%
    <div class="mb-4 inline-round-zoomer-base-container" ref="imgPreview">
      <vue-photo-zoom-pro
        :high-url="imgDataUrl"
        :loaded="imgDataUrl !== ''"
        ref="zoomer"
        :scale="options.zoomFactor"
        :selector="options.zoomFactor > 1"
        style="width: 100%"
        :width="300"
        :height="180"
        disable-reactive
      >
        <img
          ref="img"
          v-auth-image="srcIMG"
          @load="applyImagesFilters"
          class="responsive-image unloaded"
          style="height: auto"
        />
      </vue-photo-zoom-pro>
      <div class="file-details">
        <div>
          <div><b>Path:</b> {{ file.path }}</div>
          <div><b>FileName:</b> {{ file.name }}</div>
        </div>
        <div class="download">
          <a :download="file.name" target="_blank" v-bind:href="imgDataUrl">
            <b-button variant="primary">Download</b-button>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getFileServerPath } from '@/utils'
import axios from 'axios'
import { mapGetters } from 'vuex'
import VuePhotoZoomPro from 'vue-photo-zoom-pro'
import { debounce } from 'lodash'
import api from '../utils/api'
import store from '../store'
import 'vue-photo-zoom-pro/dist/style/vue-photo-zoom-pro.css'

export default {
  name: 'ShowImage',
  components: {
    VuePhotoZoomPro,
  },
  props: {
    file: { type: Object, required: true },
    showMode: { type: String, default: 'Original' },
  },
  data() {
    return {
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
      srcIMG: this.file.serverPath,
      imgDataUrl: '',
      zoom: null,
      defaultZoomApplied: false,
    }
  },
  methods: {
    convertURIPath(p) {
      return `${p}?token=${localStorage.getItem('sessionToken', null)}`
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
    applyImagesFilters() {
      const setZoom = () => {
        this.zoom = this.defaultZoom
        this.defaultZoomApplied = true
      }
      const setDataUrl = (dataUrl) => {
        this.imgDataUrl = dataUrl
      }
      const imgRef = this.$refs.img
      if (!imgRef || !imgRef.classList.contains('unloaded')) return
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
            setDataUrl(out)
            imgRef.classList.remove('unloaded')
            imgRef.classList.remove('changed')
            setZoom()
          })
        })
      } else {
        this.$refs.img.classList.remove('unloaded')
        this.$refs.img.classList.remove('changed')
        setZoom()
      }
    },
  },
  computed: {
    ...mapGetters(['imageInvert', 'imageColorMap', 'defaultZoom', 'currentWs']),
  },
  mounted() {
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
    zoom() {
      this.$refs.image_viewing.style.setProperty('--img--zoom', `${this.zoom}%`)
      store.dispatch('app/setDefaultZoom', this.zoom)
    },
    defaultZoom: debounce(function () { // eslint-disable-line
      api.setDefaultZoomLevel(this.currentWs, this.zoom)
    }, 500),
    file() {
      this.zoomKey += 1
    },
    async showMode() {
      if (!this.showMode || this.showMode === 'Original') {
        if (!this.$refs.img.classList.contains('changed')) return
        this.$refs.img.classList.add('unloaded')
        this.srcIMG = encodeURI(this.file.serverPath)
        this.imgDataUrl = ''
      } else {
        this.$refs.img.classList.add('changed')
        const path = encodeURIComponent(this.file.relativePath)
        const uri = `${getFileServerPath().replace(
          'data',
          'api',
        )}visualizeHeatmap?mode=${encodeURIComponent(
          this.showMode,
        )}&image=${path}&sessionToken=${localStorage.getItem(
          'sessionToken',
          null,
        )}`
        this.srcIMG = await axios
          .get(uri)
          .then(() => uri)
          .catch(() => encodeURIComponent(this.file.serverPath))
        this.imgDataUrl = this.srcIMG
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.image-viewing {
  text-align: center;
  margin: 0 3rem;
  image {
    object-fit: cover;
  }
}
.unloaded {
  visibility: hidden;
}
.file-details {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  div {
    &.download {
      position: absolute;
      right: 10rem;
    }
  }
}
</style>
